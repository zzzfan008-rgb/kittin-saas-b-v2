import { ClaimedJob, DurableRunRow, JobLockRow, parseJson, CANCELLED_AFTER_START_WARNING, lockRun } from "./types";
import { appendRunEvent } from "./events";
import { persistedEvaluationPolicy, persistedEvaluationPolicyFromRow } from "./evaluation";
import type { PoolClient } from "pg";
import { nanoid } from "nanoid";
import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../../src/types/workflow";
import { NODE_SPECS } from "../../../src/types/workflow";
import { transaction } from "../../lib/database";
import {
  deleteStoredImage,
  normalizeImageRef,
  persistImageRefWithReceipt,
  type PersistedImageReceipt,
} from "../../lib/fileStore";
import type { EvaluationRunPolicy } from "../../lib/evaluationRunPolicy";
import { finalizeEvaluationCampaignSlot } from "../../lib/evaluationCampaign";
import type { EvaluationCodeIdentity, EvaluationErrorPhase } from "../../lib/evaluationEvidence";
import {
  completeEvaluationCaseEvidence,
  failEvaluationCaseEvidence,
  recordEvaluationProviderRequestFailure,
  recordEvaluationProviderRequestSuccess,
  startEvaluationProviderRequestEvidence,
} from "../../lib/evaluationEvidenceStore";
import type { RunEvent, StepResult } from "../runner";
import {
  ActiveRunLimitError,
  CancelledBeforeProviderCall,
  EvaluationCaseConflictError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
  isRetryableProviderError,
  isTerminalRunStatus,
  outcomeUnknownMessage,
  type DurableRunStatus,
} from "../runQueueContracts";
export async function finalizeSuccessfulRun(
  client: PoolClient,
  run: DurableRunRow,
  finishedAt: number,
  cancellationWarning?: string,
): Promise<void> {
  const target = run.target_step_id
      ? (await client.query<{
        output_images_json: string; output_videos_json: string; prompts_json: string; provider_output_sizes_json: string;
        provider_images_json: string; reference_inputs_json: string;
        failures_json: string; model: string | null;
      }>(`
        SELECT output_images_json, output_videos_json, prompts_json, provider_output_sizes_json,
          provider_images_json, reference_inputs_json, failures_json, model
        FROM generation_run_steps WHERE id = $1
      `, [run.target_step_id])).rows[0]
    : undefined;
  const images = parseJson<string[]>(target?.output_images_json ?? "[]", []);
  const videos = parseJson<string[]>(target?.output_videos_json ?? "[]", []);
  const prompts = parseJson<string[]>(target?.prompts_json ?? "[]", []);
  const providerOutputSizes = parseJson<Array<string | null>>(target?.provider_output_sizes_json ?? "[]", []);
  const providerImages = parseJson<string[]>(target?.provider_images_json ?? "[]", []);
  const failures = parseJson<Array<{ prompt?: string; error: string }>>(target?.failures_json ?? "[]", []);
  const aggregate = (await client.query<{ provider_requests: number; model: string | null }>(`
    SELECT COALESCE(SUM(provider_requests), 0)::int AS provider_requests,
      (ARRAY_AGG(model ORDER BY step_index DESC) FILTER (WHERE model IS NOT NULL))[1] AS model
    FROM generation_run_steps WHERE run_id = $1
  `, [run.id])).rows[0];
  await client.query("DELETE FROM generation_outputs WHERE run_id = $1", [run.id]);
  for (const [index, image] of images.entries()) {
    await client.query(`
      INSERT INTO generation_outputs (
        id, run_id, image, provider_image, prompt, provider_output_size, status, error, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'success', NULL, $7)
    `, [
      nanoid(12), run.id, image, providerImages[index] ?? null, prompts[index] ?? null,
      providerOutputSizes[index] ?? null, finishedAt + index,
    ]);
  }
  for (const [index, video] of videos.entries()) {
    await client.query(`
      INSERT INTO generation_outputs (id, run_id, image, prompt, status, error, created_at)
      VALUES ($1, $2, $3, NULL, 'success', NULL, $4)
    `, [nanoid(12), run.id, video, finishedAt + images.length + index]);
  }
  for (const [index, failure] of failures.entries()) {
    await client.query(`
      INSERT INTO generation_outputs (id, run_id, image, prompt, status, error, created_at)
      VALUES ($1, $2, '', $3, 'error', $4, $5)
    `, [nanoid(12), run.id, failure.prompt ?? null, failure.error, finishedAt + images.length + index]);
  }
  const warning = cancellationWarning ?? (failures.length ? `${failures.length} 个生成任务失败` : null);
  const model = target?.model ?? aggregate?.model ?? null;
  const providerRequests = aggregate?.provider_requests ?? 0;
  const outputCount = images.length + videos.length;
  if (providerImages.length > 0 && providerImages.length !== images.length) {
    throw new Error("Target Provider evidence cardinality does not match business outputs");
  }
  if (providerRequests > 0 && images.length > 0 && providerImages.length !== images.length) {
    throw new Error("A paid successful run cannot finalize without per-output Provider evidence");
  }
  await client.query(`
    UPDATE generation_runs SET status = 'succeeded', successful_count = $1, provider_requests = $2,
      model = $3, error = $4, finished_at = $5, updated_at = $5,
      billing_reconciliation_status = CASE
        WHEN run_type = 'evaluation' AND $2 > 0 THEN 'pending'
        ELSE billing_reconciliation_status
      END
    WHERE id = $6
  `, [outputCount, providerRequests, model, warning, finishedAt, run.id]);
  if (outputCount > 0) {
    await client.query(`
      INSERT INTO usage_events (
        id, owner_id, run_id, project_id, node_id, model, successful_count,
        provider_requests, duration_ms, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (run_id) DO UPDATE SET
        model = excluded.model, successful_count = excluded.successful_count,
        provider_requests = excluded.provider_requests, duration_ms = excluded.duration_ms,
        created_at = excluded.created_at
    `, [
      nanoid(12), run.owner_id, run.id, run.project_id, run.node_id, model, outputCount,
      providerRequests, Math.max(0, finishedAt - run.started_at), new Date(finishedAt).toISOString(),
    ]);
  }
  await appendRunEvent(client, run.id, { type: "done" }, finishedAt);
}


export async function finalizeCancelledTargetRun(
  client: PoolClient,
  run: DurableRunRow,
  targetNodeId: string,
  message: string,
  finishedAt: number,
): Promise<void> {
  const aggregate = (await client.query<{ provider_requests: number; model: string | null }>(`
    SELECT COALESCE(SUM(provider_requests), 0)::int AS provider_requests,
      (ARRAY_AGG(model ORDER BY step_index DESC) FILTER (WHERE model IS NOT NULL))[1] AS model
    FROM generation_run_steps WHERE run_id = $1
  `, [run.id])).rows[0];
  await client.query("DELETE FROM generation_outputs WHERE run_id = $1", [run.id]);
  await client.query(`
    UPDATE generation_runs SET status = 'cancelled', successful_count = 0, provider_requests = $1,
      model = $2, error = $3, finished_at = $4, updated_at = $4 WHERE id = $5
  `, [aggregate?.provider_requests ?? 0, aggregate?.model ?? null, message, finishedAt, run.id]);
  await appendRunEvent(client, run.id, {
    type: "node-status", nodeId: targetNodeId, status: "cancelled", error: message, finishedAt,
  }, finishedAt);
  await appendRunEvent(client, run.id, { type: "done" }, finishedAt);
}


export async function completeJobSuccess(
  job: ClaimedJob,
  workerId: string,
  result: StepResult,
  persistedImages: PersistedImageReceipt[],
  providerImageUrls: string[],
  persistedProviderImages: PersistedImageReceipt[],
  runtimeReferenceImages: string[],
  videos: string[],
  finishedAt: number,
): Promise<void> {
  const imageUrls = persistedImages.map((image) => image.url);
  // v8：付费图片节点判定改为 kind === "image-generator"。video-generator 无 image 证据链。
  const isProviderStep = job.step.kind === "image-generator";
  const videoUrls = videos.filter((video) => video.startsWith("/api/files/"));
  if (videoUrls.length !== videos.length) {
    throw new Error("video outputs must be local /api/files references");
  }
  if (providerImageUrls.length > 0 && providerImageUrls.length !== imageUrls.length) {
    throw new Error("Provider originals and business outputs must have identical cardinality");
  }
  if (isProviderStep && persistedProviderImages.length !== imageUrls.length) {
    throw new Error("Provider step completion requires one captured original per business output");
  }
  const referenceEvidence = (result.references ?? []).map((reference: ReferenceImageInput) => ({
    order: reference.order,
    assetSha256: reference.assetSha256,
    ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
  }));
  const evaluationPolicy = persistedEvaluationPolicy(job);
  await transaction(async (client) => {
    const locked = (await client.query<{ status: DurableRunStatus; worker_id: string | null }>(
      "SELECT status, worker_id FROM generation_jobs WHERE id = $1 FOR UPDATE",
      [job.id],
    )).rows[0];
    if (
      !locked ||
      locked.worker_id !== workerId ||
      (locked.status !== "running" && locked.status !== "cancel_requested")
    ) {
      throw new Error("generation job lease was lost before completion");
    }
    const run = await lockRun(client, job.runId);
    if (!run) throw new Error("generation run disappeared");
    const cancellationWarning = locked.status === "cancel_requested" ? CANCELLED_AFTER_START_WARNING : undefined;
    await client.query(`
      UPDATE generation_jobs SET status = 'succeeded', worker_id = NULL, lease_expires_at = NULL,
        updated_at = $1, last_error = NULL WHERE id = $2
    `, [finishedAt, job.id]);
    await client.query(`
      UPDATE generation_run_steps SET status = 'succeeded', model = $1, output_images_json = $2,
        output_videos_json = $3,
        provider_images_json = $4, reference_inputs_json = $5,
        prompts_json = $6, provider_output_sizes_json = $7, failures_json = $8,
        error = $9, finished_at = $10
      WHERE id = $11
    `, [
      result.model ?? null, JSON.stringify(imageUrls), JSON.stringify(videoUrls),
      JSON.stringify(providerImageUrls),
      JSON.stringify(referenceEvidence), JSON.stringify(result.prompts ?? []),
      JSON.stringify(result.providerOutputSizes ?? []), JSON.stringify(result.failures ?? []),
      cancellationWarning ?? null, finishedAt, job.stepId,
    ]);
    if (run.target_step_id === job.stepId) {
      await client.query(
        "UPDATE generation_runs SET reference_inputs_json = $1, reference_images_json = $2 WHERE id = $3",
        [JSON.stringify(referenceEvidence), JSON.stringify(runtimeReferenceImages), run.id],
      );
    }
    for (const image of persistedImages) {
      if (!image.url.startsWith("/api/files/")) continue;
      await client.query(`
        INSERT INTO files (id, owner_id, source_type, project_id, node_id, run_id, created_at)
        VALUES ($1, $2, 'generated', $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING
      `, [image.id, run.owner_id, run.project_id, job.nodeId, run.id, new Date(finishedAt).toISOString()]);
    }
    for (const image of persistedProviderImages) {
      if (!image.url.startsWith("/api/files/")) continue;
      await client.query(`
        INSERT INTO files (id, owner_id, source_type, project_id, node_id, run_id, created_at)
        VALUES ($1, $2, 'provider-original', $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING
      `, [image.id, run.owner_id, run.project_id, job.nodeId, run.id, new Date(finishedAt).toISOString()]);
    }
    for (const video of videoUrls) {
      const videoId = video.slice("/api/files/".length);
      await client.query(`
        INSERT INTO files (id, owner_id, source_type, project_id, node_id, run_id, mime_type, created_at)
        VALUES ($1, $2, 'generation', $3, $4, $5, 'video/mp4', $6) ON CONFLICT (id) DO NOTHING
      `, [videoId, run.owner_id, run.project_id, job.nodeId, run.id, new Date(finishedAt).toISOString()]);
    }
    await completeEvaluationCaseEvidence(client, {
      runId: job.runId,
      policy: evaluationPolicy,
      postprocessedStorageRefs: imageUrls,
      finishedAt,
    });
    const partialWarning = result.failures?.length ? `${result.failures.length} 个生成任务失败` : undefined;
    // result-node-created：一轮 run 发一次，携带该 run 的全部产物（runtime.md §3.2）。
    // 产物落结果节点，不覆写生成节点自身。resultNodeId 与 runId 一一对应，恢复补发幂等。
    const mediaKind: "image" | "video" = job.step.kind === "video-generator" ? "video" : "image";
    const resultUrls = mediaKind === "video" ? videoUrls : imageUrls;
    if (resultUrls.length > 0) {
      await appendRunEvent(client, run.id, {
        type: "result-node-created",
        resultNodeId: `result-${run.id}`,
        sourceGeneratorId: job.nodeId,
        runId: run.id,
        mediaKind,
        urls: resultUrls,
        ...(result.providerOutputSizes ? { outputSizes: result.providerOutputSizes } : {}),
      }, finishedAt);
    }
    await appendRunEvent(client, run.id, {
      type: "node-status",
      nodeId: job.nodeId,
      status: "success",
      images: imageUrls,
      ...(videoUrls.length > 0 ? { videos: videoUrls } : {}),
      model: result.model,
      prompts: result.prompts,
      providerOutputSizes: result.providerOutputSizes,
      failures: result.failures,
      error: cancellationWarning ?? partialWarning,
      startedAt: job.startedAt,
      finishedAt,
    }, finishedAt);

    if (cancellationWarning) {
      await client.query(`
        UPDATE generation_jobs SET status = 'cancelled', worker_id = NULL, lease_expires_at = NULL, updated_at = $1
        WHERE run_id = $2 AND status IN ('queued','retry_wait','cancel_requested')
      `, [finishedAt, run.id]);
      await client.query(`
        UPDATE generation_run_steps SET status = 'cancelled', finished_at = $1, error = '用户取消了后续步骤'
        WHERE run_id = $2 AND status IN ('queued','retry_wait','cancel_requested')
      `, [finishedAt, run.id]);
    }

    const active = (await client.query<{ count: number }>(`
      SELECT COUNT(*)::int AS count FROM generation_jobs
      WHERE run_id = $1 AND status IN ('queued','running','retry_wait','cancel_requested')
    `, [run.id])).rows[0]?.count ?? 0;
    if (active === 0) {
      const target = run.target_step_id
        ? (await client.query<{ status: DurableRunStatus; node_id: string; error: string | null }>(`
            SELECT status, node_id, error FROM generation_run_steps WHERE id = $1
          `, [run.target_step_id])).rows[0]
        : undefined;
      if (target?.status === "cancelled") {
        await finalizeCancelledTargetRun(
          client,
          run,
          target.node_id,
          target.error ?? "用户取消了目标步骤",
          finishedAt,
        );
      } else if (target?.status === "succeeded" || !target) {
        await finalizeSuccessfulRun(client, run, finishedAt, cancellationWarning);
      } else {
        throw new Error(`generation target step ended as ${target.status}`);
      }
    } else {
      await client.query("UPDATE generation_runs SET status = 'running', updated_at = $1 WHERE id = $2", [finishedAt, run.id]);
    }
  });
}


export async function terminateRun(
  client: PoolClient,
  row: JobLockRow,
  status: "failed" | "outcome_unknown" | "cancelled",
  message: string,
  finishedAt: number,
  phase: EvaluationErrorPhase = "provider",
): Promise<void> {
  const run = await lockRun(client, row.run_id);
  if (!run || isTerminalRunStatus(run.status)) return;
  let evaluationPolicy: EvaluationRunPolicy | undefined;
  let terminalMessage = message;
  let policyIntegrityFailure: string | undefined;
  try {
    evaluationPolicy = persistedEvaluationPolicyFromRow(row);
  } catch (error) {
    policyIntegrityFailure = error instanceof Error ? error.message : String(error);
    terminalMessage = `${message}；评估证据策略快照损坏：${policyIntegrityFailure}`;
  }
  await client.query(`
    UPDATE generation_jobs SET status = $1, worker_id = NULL, lease_expires_at = NULL,
      last_error = $2, updated_at = $3 WHERE id = $4
  `, [status, terminalMessage, finishedAt, row.id]);
  await client.query(`
    UPDATE generation_run_steps SET status = $1, error = $2, finished_at = $3 WHERE id = $4
  `, [status, terminalMessage, finishedAt, row.step_id]);
  await client.query(`
    UPDATE generation_jobs SET status = 'cancelled', worker_id = NULL, lease_expires_at = NULL,
      last_error = $1, updated_at = $2
    WHERE run_id = $3 AND id <> $4 AND status IN ('queued','retry_wait','cancel_requested')
  `, ["上游步骤未完成，后续任务已停止", finishedAt, row.run_id, row.id]);
  await client.query(`
    UPDATE generation_run_steps SET status = 'cancelled', error = $1, finished_at = $2
    WHERE run_id = $3 AND id <> $4 AND status IN ('queued','retry_wait','cancel_requested')
  `, ["上游步骤未完成，后续任务已停止", finishedAt, row.run_id, row.step_id]);
  const aggregate = (await client.query<{ provider_requests: number; model: string | null }>(`
    SELECT COALESCE(SUM(provider_requests), 0)::int AS provider_requests,
      (ARRAY_AGG(model ORDER BY step_index DESC) FILTER (WHERE model IS NOT NULL))[1] AS model
    FROM generation_run_steps WHERE run_id = $1
  `, [row.run_id])).rows[0];
  await failEvaluationCaseEvidence(client, {
    runId: row.run_id,
    policy: evaluationPolicy,
    outcome: status,
    phase,
    code: status === "outcome_unknown" ? "provider-outcome-unknown" : `evaluation-${status}`,
    message: terminalMessage,
    finishedAt,
    hardBlockers: policyIntegrityFailure ? [{
      code: "evidence-integrity-failure",
      detail: policyIntegrityFailure,
    }] : undefined,
  });
  if (!evaluationPolicy && row.run_type === "evaluation") {
    if (!row.evaluation_campaign_id || !row.evaluation_slot_id || !row.evaluation_authorization_id) {
      throw new Error("evaluation run lost its campaign/slot binding before terminal closure");
    }
    await finalizeEvaluationCampaignSlot(client, {
      campaignId: row.evaluation_campaign_id,
      slotId: row.evaluation_slot_id,
      authorizationId: row.evaluation_authorization_id,
      runId: row.run_id,
      outcome: status,
    });
  }
  await client.query(`
    UPDATE generation_runs SET status = $1, error = $2, provider_requests = $3,
      model = COALESCE($4, model), finished_at = $5, updated_at = $5,
      billing_reconciliation_status = CASE
        WHEN run_type = 'evaluation' AND $3 > 0 THEN 'pending'
        ELSE billing_reconciliation_status
      END
    WHERE id = $6
  `, [status, terminalMessage, aggregate?.provider_requests ?? 0, aggregate?.model ?? null, finishedAt, row.run_id]);
  await client.query("DELETE FROM generation_outputs WHERE run_id = $1", [row.run_id]);
  if (status === "failed") {
    await client.query(`
      INSERT INTO generation_outputs (id, run_id, image, status, error, created_at)
      VALUES ($1, $2, '', 'error', $3, $4)
    `, [nanoid(12), row.run_id, terminalMessage, finishedAt]);
  }
  const clientStatus = status === "failed" ? "error" : status;
  await appendRunEvent(client, row.run_id, {
    type: "node-status", nodeId: row.node_id, status: clientStatus, error: terminalMessage,
    startedAt: row.step_started_at ?? undefined, finishedAt,
  } as RunEvent, finishedAt);
  if (status === "failed") {
    await appendRunEvent(client, row.run_id, {
      type: "run-error", nodeId: row.node_id, error: terminalMessage, finishedAt,
    }, finishedAt);
  } else {
    await appendRunEvent(client, row.run_id, { type: "done" }, finishedAt);
  }
}
