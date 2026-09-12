import { ACTIVE_RUN_LIMIT } from "../lib/generationLimits";
import { ProviderError } from "../providers/base";

export type DurableRunStatus =
  | "queued"
  | "running"
  | "retry_wait"
  | "cancel_requested"
  | "cancelled"
  | "succeeded"
  | "failed"
  | "outcome_unknown";

const TERMINAL_RUN_STATUSES = new Set<DurableRunStatus>([
  "cancelled",
  "succeeded",
  "failed",
  "outcome_unknown",
]);

const OUTCOME_UNKNOWN_GUIDANCE = "请先核对 API易消耗记录；确认未扣费后，再手动重新提交任务";

export class GenerationRequestConflictError extends Error {
  constructor() {
    super("clientRequestId 已用于另一份生成请求，请重新提交");
    this.name = "GenerationRequestConflictError";
  }
}

export class ActiveRunLimitError extends Error {
  constructor() {
    super(`活动任务已达到 ${ACTIVE_RUN_LIMIT} 条上限，请等待现有任务结束后再试`);
    this.name = "ActiveRunLimitError";
  }
}

export class GenerationOwnerUnavailableError extends Error {
  constructor() {
    super("账号已停用或删除，不能创建新的生成任务");
    this.name = "GenerationOwnerUnavailableError";
  }
}

export class EvaluationCaseConflictError extends Error {
  constructor() {
    super("evaluation.caseId 已存在；真实评估禁止重放，请在账单核对和重新授权后使用关联的新 caseId");
    this.name = "EvaluationCaseConflictError";
  }
}

export class CancelledBeforeProviderCall extends Error {
  constructor() {
    super("任务已在上游调用开始前取消");
    this.name = "CancelledBeforeProviderCall";
  }
}

export function isTerminalRunStatus(status: string): boolean {
  return TERMINAL_RUN_STATUSES.has(status as DurableRunStatus) || status === "success" || status === "error";
}

export function isRetryableProviderError(error: unknown): error is ProviderError {
  return error instanceof ProviderError && (
    error.status === 429 ||
    (error.status === 503 && error.category === "gateway_unavailable")
  );
}

export function outcomeUnknownMessage(message: string): string {
  return message.includes("API易消耗记录") ? message : `${message}；${OUTCOME_UNKNOWN_GUIDANCE}`;
}
