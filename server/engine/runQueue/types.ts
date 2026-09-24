import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../../src/types/workflow";
import type { PoolClient } from "pg";
import type { EvaluationCodeIdentity, EvaluationErrorPhase } from "../../lib/evaluationEvidence";
import type { ProviderResolver, VideoProviderResolver } from "../runner";
import {
  ActiveRunLimitError,
  EvaluationCaseConflictError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
  isRetryableProviderError,
  isTerminalRunStatus,
  outcomeUnknownMessage,
  type DurableRunStatus,
} from "../runQueueContracts";
export const DEFAULT_LEASE_MS = 45_000;

export const DEFAULT_HEARTBEAT_MS = 10_000;

export const DEFAULT_RETRY_DELAYS_MS = [5_000, 30_000, 120_000] as const;

export const DURABLE_RUN_EVENT_BATCH_SIZE = 500;

export const CLIENT_REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export interface DurableRunRow {
  id: string;
  owner_id: string;
  project_id: string | null;
  node_id: string;
  status: DurableRunStatus | "success" | "error";
  target_step_id: string | null;
  run_type: "workflow" | "direct" | "evaluation";
  started_at: number;
  finished_at: number | null;
}


export interface ClaimedJob {
  id: string;
  runId: string;
  stepId: string;
  nodeId: string;
  stepIndex: number;
  step: NodeExecution;
  retryCount: number;
  startedAt: number;
  runType: "workflow" | "direct" | "evaluation";
  retryPolicy: "standard" | "no-retry";
  evaluationCaseId: string | null;
  evaluationAuthorizationId: string | null;
  evaluationCampaignId: string | null;
  evaluationSlotId: string | null;
}


export interface JobLockRow {
  id: string;
  run_id: string;
  step_id: string;
  status: DurableRunStatus;
  retry_count: number;
  attempt_started_at: number | null;
  worker_id: string | null;
  node_id: string;
  step_index: number;
  step_json: string;
  step_started_at: number | null;
  target_step_id: string | null;
  run_type: "workflow" | "direct" | "evaluation";
  retry_policy: "standard" | "no-retry";
  evaluation_case_id: string | null;
  evaluation_authorization_id: string | null;
  evaluation_campaign_id: string | null;
  evaluation_slot_id: string | null;
}


export interface EvaluationRecoveryEvidenceSummary {
  request_count: number;
  ambiguous_request_count: number;
  succeeded_request_count: number;
  succeeded_output_count: number;
  provider_original_count: number;
}


export interface ProcessGenerationJobOptions {
  resolveProvider?: ProviderResolver;
  /** video 节点 Provider 解析器（测试注入用）；缺省走 getVideoProvider。 */
  resolveVideoProvider?: VideoProviderResolver;
  /** Test-only injection; production workers always resolve the fail-closed runtime identity. */
  evaluationCodeIdentity?: EvaluationCodeIdentity;
  now?: () => number;
  retryDelaysMs?: readonly number[];
  random?: () => number;
  leaseMs?: number;
  heartbeatMs?: number;
}


export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** 通用提示词准入失败（Provider 调用前阻断）。 */
export class PromptAdmissionBlockedBeforeProviderCall extends Error {
  constructor(reason: string) {
    super(`执行前提示词准入阻断：${reason}`);
    this.name = "PromptAdmissionBlockedBeforeProviderCall";
  }
}

/** 通用 run 行级锁；所有生命周期/恢复路径共用。 */
export async function lockRun(client: PoolClient, runId: string): Promise<DurableRunRow | undefined> {
  return (await client.query<DurableRunRow>(
    `SELECT id, owner_id, project_id, node_id, status, target_step_id, run_type, started_at, finished_at
     FROM generation_runs WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
    [runId],
  )).rows[0];
}
