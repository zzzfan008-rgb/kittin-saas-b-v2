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

const OUTCOME_UNKNOWN_GUIDANCE = "请先核对兔子 API（Tu-zi）消耗记录；确认未扣费后，再手动重新提交任务";

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

export function isTerminalRunStatus(status: string): boolean {
  return TERMINAL_RUN_STATUSES.has(status as DurableRunStatus) || status === "success" || status === "error";
}

/**
 * 网关连不上上游渠道时的 5xx（`connection_error` / “服务连接失败”）。
 *
 * 这类失败发生在网关转发之前：上游没有开始生成、不会计费，也不会产生半张图，
 * 因此重试是安全且必要的——否则一次几秒的网络抖动就要用户整单重来。
 * 超时、响应截断等 5xx 仍然不重试（可能已经出图并计费）。
 */
function isUpstreamConnectionFailure(error: ProviderError): boolean {
  if (error.category !== "gateway_unavailable") return false;
  if (error.status !== 500 && error.status !== 502 && error.status !== 504) return false;
  return /connection_error|服务连接失败|connect failed|ECONNREFUSED/i.test(error.diagnostic ?? "");
}

/**
 * 网关 nginx 的裸 5xx（典型如 `504 Gateway Time-out` 的 HTML 页面，无 JSON 体）。
 *
 * 与 connection_error 不同，这里发生在"请求已转发、但网关等不到上游响应"。
 * 判定是否安全重试的唯一依据是**耗时**：真实出图最快也要十几秒到两分钟，
 * 若失败发生在 60 秒内，说明上游几乎不可能已经产出并计费，重试不会重复扣钱；
 * 超过 60 秒的 5xx 仍按"可能已出图"处理，绝不重试（宁可失败也不重复计费）。
 *
 * 2026-11-10 实测案例：flare 双图 2K 编辑在第 16 秒收到 nginx 504，
 * 用户只看到「AI 服务暂时不可用」且没有任何重试。
 */
/**
 * 明确不该重试的类别（兔子《AI API 通用错误码与排障指南》生产重试规则）：
 * 参数/鉴权/余额/配额/内容安全/模型不存在/参考图错误都必须先修根因，
 * 原样重试既无效也可能放大费用。outcome_unknown 更是绝对不能重放。
 */
const NON_RETRYABLE_CATEGORIES = new Set([
  "account_credit",
  "gateway_authentication",
  "invalid_request",
  "content_refused",
  "model_unavailable",
  "reference_image_error",
  "outcome_unknown",
]);

/**
 * 确认属于瞬时故障的 5xx / 529（指南：只有这类才适合有界退避）。
 * 500 也可能是确定性输入问题，所以必须靠错误体里的过载/不可用措辞确认。
 */
function isTransientGatewayOverload(error: ProviderError): boolean {
  if (error.category !== "gateway_unavailable") return false;
  if (error.status === 529) return true;
  if (error.status !== 500 && error.status !== 502 && error.status !== 503 && error.status !== 504) {
    return false;
  }
  return /overloaded|overloaded_error|temporarily unavailable|service unavailable|no available channel|upstream (unavailable|timed out)/i
    .test(error.diagnostic ?? "");
}

function isEarlyGatewayTimeout(error: ProviderError, elapsedMs?: number): boolean {
  if (error.category !== "gateway_unavailable") return false;
  if (error.status !== 500 && error.status !== 502 && error.status !== 504) return false;
  if (elapsedMs === undefined || elapsedMs >= 60_000) return false;
  return /gateway time-?out|upstream (timed out|timeout)|<html[\s>]/i.test(error.diagnostic ?? "");
}

export function isRetryableProviderError(error: unknown, elapsedMs?: number): error is ProviderError {
  if (!(error instanceof ProviderError)) return false;
  // 熔断器主动快速失败：重试只会在同一模型上继续撞墙，直接让用户看到"稍后再试"。
  if (/circuit[_-]?open/i.test(error.diagnostic ?? "")) return false;
  if (NON_RETRYABLE_CATEGORIES.has(error.category)) return false;
  return (
    (error.status === 429 && error.category === "rate_limited") ||
    (error.status === 503 && error.category === "gateway_unavailable") ||
    isUpstreamConnectionFailure(error) ||
    isEarlyGatewayTimeout(error, elapsedMs) ||
    isTransientGatewayOverload(error)
  );
}

export function outcomeUnknownMessage(message: string): string {
  return message.includes("消耗记录") ? message : `${message}；${OUTCOME_UNKNOWN_GUIDANCE}`;
}
