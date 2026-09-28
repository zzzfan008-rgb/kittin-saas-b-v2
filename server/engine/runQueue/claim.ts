import { ClaimedJob, DurableRunRow, JobLockRow, parseJson, DEFAULT_LEASE_MS, DEFAULT_HEARTBEAT_MS, DEFAULT_RETRY_DELAYS_MS, lockRun } from "./types";
import { appendRunEvent } from "./events";
import { terminateRun } from "./lifecycle";
import type { PoolClient } from "pg";
import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../../src/types/workflow";
import { db, query, queryOne, transaction } from "../../lib/database";
import {
  ActiveRunLimitError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
  isTerminalRunStatus,
  type DurableRunStatus,
} from "../runQueueContracts";
export const CLAIM_NEXT_JOB_SQL = `
  SELECT j.id, j.run_id, j.step_id, j.status, j.retry_count, j.attempt_started_at, j.worker_id,
    s.node_id, s.step_index, s.step_json, s.started_at AS step_started_at,
    r.target_step_id, r.run_type
  FROM generation_jobs j
  JOIN generation_run_steps s ON s.id = j.step_id
  JOIN generation_runs r ON r.id = j.run_id
  WHERE j.status IN ('queued','retry_wait')
    AND j.available_at <= $1
    AND r.deleted_at IS NULL
    AND r.status IN ('queued','running','retry_wait')
    AND NOT EXISTS (
      SELECT 1 FROM generation_jobs previous
      WHERE previous.run_id = j.run_id
        AND previous.step_index < j.step_index
        AND previous.status <> 'succeeded'
    )
  ORDER BY j.available_at, j.run_started_at, j.step_index, j.id
  FOR UPDATE OF j SKIP LOCKED
  LIMIT 1
`;


export async function claimNextJob(
  workerId: string,
  now: number,
  leaseMs: number,
): Promise<ClaimedJob | undefined> {
  return transaction(async (client) => {
    const row = (await client.query<JobLockRow>(CLAIM_NEXT_JOB_SQL, [now])).rows[0];
    if (!row) return undefined;
    const run = await lockRun(client, row.run_id);
    if (!run || isTerminalRunStatus(run.status)) return undefined;
    await client.query(`
      UPDATE generation_jobs SET status = 'running', worker_id = $1, lease_expires_at = $2,
        attempt_started_at = NULL, updated_at = $3 WHERE id = $4
    `, [workerId, now + leaseMs, now, row.id]);
    await client.query(`
      UPDATE generation_run_steps SET status = 'running', started_at = COALESCE(started_at, $1), error = NULL
      WHERE id = $2
    `, [now, row.step_id]);
    await client.query(
      "UPDATE generation_runs SET status = 'running', updated_at = $1 WHERE id = $2",
      [now, row.run_id],
    );
    await appendRunEvent(client, row.run_id, {
      type: "node-status", nodeId: row.node_id, status: "running", startedAt: now,
    }, now);
    const step = parseJson<NodeExecution | undefined>(row.step_json, undefined);
    if (!step) throw new Error("generation step payload is invalid");
    return {
      id: row.id,
      runId: row.run_id,
      stepId: row.step_id,
      nodeId: row.node_id,
      stepIndex: row.step_index,
      step,
      retryCount: row.retry_count,
      startedAt: now,
      runType: row.run_type,
    };
  });
}


export async function markAttemptStarted(
  job: ClaimedJob,
  workerId: string,
  now: number,
  leaseMs: number,
  providerRequest: number,
  request: ImageGenRequest,
): Promise<void> {
  await transaction(async (client) => {
    const row = (await client.query<{
      status: DurableRunStatus;
      worker_id: string | null;
      owner_id: string;
      run_type: "workflow" | "direct";
    }>(`
      SELECT j.status, j.worker_id, r.owner_id, r.run_type
      FROM generation_jobs j
      JOIN generation_runs r ON r.id = j.run_id
      WHERE j.id = $1 AND r.deleted_at IS NULL
      FOR UPDATE OF j
    `,
      [job.id],
    )).rows[0];
    if (!row || row.worker_id !== workerId) throw new Error("generation job lease was lost");
    if (row.status !== "running") throw new Error(`generation job is ${row.status}`);
    await client.query(`
      UPDATE generation_jobs SET attempt_started_at = COALESCE(attempt_started_at, $1),
        lease_expires_at = $2, updated_at = $1 WHERE id = $3
    `, [now, now + leaseMs, job.id]);
    await client.query(`
      UPDATE generation_run_steps SET provider_requests = provider_requests + 1 WHERE id = $1
    `, [job.stepId]);
  });
}





/**
 * 视频异步任务提交成功后的幂等护栏：持久化 Seedance taskId 为审计证据，并标记
 * attempt_started，使 worker 崩溃后租约过期时按 outcome_unknown 关闭（绝不静默重提交重计费）。
 */
export async function markVideoTaskSubmitted(
  job: ClaimedJob,
  workerId: string,
  taskId: string,
  now: number,
  leaseMs: number,
): Promise<void> {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(taskId)) {
    throw new Error("video provider task id is invalid");
  }
  await transaction(async (client) => {
    const row = (await client.query<{ status: DurableRunStatus; worker_id: string | null }>(`
      SELECT status, worker_id FROM generation_jobs WHERE id = $1 FOR UPDATE
    `, [job.id])).rows[0];
    if (!row || row.worker_id !== workerId) throw new Error("generation job lease was lost");
    if (row.status !== "running") throw new Error(`generation job is ${row.status}`);
    await client.query(`
      UPDATE generation_jobs SET attempt_started_at = COALESCE(attempt_started_at, $1),
        lease_expires_at = $2, updated_at = $1 WHERE id = $3
    `, [now, now + leaseMs, job.id]);
    await client.query(`
      UPDATE generation_run_steps SET provider_requests = provider_requests + 1,
        provider_task_id = $1 WHERE id = $2
    `, [taskId, job.stepId]);
  });
}


export async function recoverExpiredGenerationJobs(now = Date.now()): Promise<number> {
  return transaction(async (client) => {
    const rows = (await client.query<JobLockRow>(`
      SELECT j.id, j.run_id, j.step_id, j.status, j.retry_count, j.attempt_started_at, j.worker_id,
        s.node_id, s.step_index, s.step_json, s.started_at AS step_started_at,
        r.target_step_id, r.run_type, r.retry_policy
      FROM generation_jobs j JOIN generation_run_steps s ON s.id = j.step_id
      JOIN generation_runs r ON r.id = j.run_id
      WHERE j.status = 'running'
        AND j.lease_expires_at < $1
        AND r.deleted_at IS NULL
      ORDER BY j.lease_expires_at ASC FOR UPDATE OF j SKIP LOCKED LIMIT 50
    `, [now])).rows;
    for (const row of rows) {
      if (row.attempt_started_at !== null) {
        await terminateRun(
          client, row, "outcome_unknown",
          "Worker 在上游调用开始后中断，结果可能已经生成；系统不会自动重试", now,
        );
        continue;
      }
      await lockRun(client, row.run_id);
      await client.query(`
        UPDATE generation_jobs SET status = 'queued', worker_id = NULL, lease_expires_at = NULL,
          available_at = $1, updated_at = $1 WHERE id = $2
      `, [now, row.id]);
      await client.query("UPDATE generation_run_steps SET status = 'queued', error = NULL WHERE id = $1", [row.step_id]);
      await client.query("UPDATE generation_runs SET status = 'queued', error = NULL, updated_at = $1 WHERE id = $2", [now, row.run_id]);
      await appendRunEvent(client, row.run_id, {
        type: "node-status", nodeId: row.node_id, status: "queued",
        error: "Worker 租约过期，任务已安全重新排队",
      }, now);
    }
    return rows.length;
  });
}
