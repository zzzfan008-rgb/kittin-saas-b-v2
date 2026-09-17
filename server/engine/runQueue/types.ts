import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../../src/types/workflow";
import type { EvaluationCodeIdentity, EvaluationErrorPhase } from "../../lib/evaluationEvidence";
import { executeStep, type ProviderResolver, type RunEvent, type StepResult } from "../runner";
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
export const DEFAULT_LEASE_MS = 45_000;

export const DEFAULT_HEARTBEAT_MS = 10_000;

export const DEFAULT_RETRY_DELAYS_MS = [5_000, 30_000, 120_000] as const;

export const CANCELLED_AFTER_START_WARNING = "取消请求未能中止已经开始的上游调用，结果已按实际返回保存";

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
