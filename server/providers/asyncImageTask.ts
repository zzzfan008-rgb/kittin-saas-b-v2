/**
 * 异步图片任务通道（兔子API《异步图片生成》，文档更新 2026-11-02）。
 *
 * 协议：POST /v1/videos（JSON 图片参数）→ 返回 task_id → GET /v1/videos/{task_id}
 * 轮询 → completed 时结果在 video_url / url / image_url。虽然路径是 /v1/videos，
 * 任务产出的是图片（响应 metadata.usage.output_image_count=1，实测已确认）。
 *
 * 适用范围（实测 2026-11-10，真实付费调用）：
 * - gemini-3.1-flash-image、gemini-nano-banana-2.1：✅ 约 20–30s 完成，支持 1–4 张参考图、
 *   size=WxH 生效、response_format=url 返回图片直链。
 * - gpt-image-2.6-flare / sunburst：❌ 503 no channel，仍走同步端点。
 * - 文档明确「路由存在不代表模型支持」，禁止把视频字段（seconds/duration）或
 *   aspect_ratio 传进来（实测 aspect_ratio → 400 unsupported_async_image_field）。
 *
 * 可靠性口径（兔子《异步媒体任务》《生产可靠性》）：
 * - 提交成功即视为可能已计费；此后任何失败都不得自动重提交。
 * - 查询是幂等 GET，网络抖动可在本地继续查，但连续失败/超预算一律标记
 *   outcome_unknown 并携带 task_id，交给「尝试找回图片」按任务 ID 取回结果。
 * - 结果链接有时效，URL 由 worker 在下载之前存证（provider_image_urls_json）。
 */
import { config } from "../config";
import {
  fetchWithRetry,
  ProviderError,
  providerRequestIdFromResponse,
} from "./base";
import { getApiyiDispatcher, readApiyiJsonResponse } from "./gatewayTransport";
import {
  isProviderCallAllowed,
  recordProviderFailure,
  recordProviderReachable,
  recordProviderSuccess,
} from "./circuitBreaker";
import { notifyAsyncImageTaskSubmitted } from "./asyncTaskContext";

/**
 * 2026-11-11：45s → 90s。换装类请求最多 3 张参考图，异步通道按原图 base64 内联
 * （实测一次 5.6MB 原图 → 约 7.5MB 请求体），45s 窗口在链路上游稍慢时必然触发
 * 「响应头未到即中断」，连 task_id 都拿不到，只能标 outcome_unknown 且无法找回。
 * 拉长只增加拿到 task_id 的机会，不改变「超时绝不自动重发」的计费保护。
 */
const SUBMIT_TIMEOUT_MS = 90_000;
const POLL_TIMEOUT_MS = 20_000;
const TASK_JSON_MAX_BYTES = 1024 * 1024;
/** 查询连续失败达到该次数就停止轮询，保留 task_id 标 outcome_unknown。 */
const MAX_CONSECUTIVE_POLL_ERRORS = 3;

const PENDING_STATUSES = new Set(["queued", "pending", "starting"]);
const RUNNING_STATUSES = new Set(["in_progress", "running", "processing", "generating"]);
const SUCCESS_STATUSES = new Set(["completed", "succeeded"]);
const FAILED_STATUSES = new Set(["failed", "expired", "cancelled", "canceled"]);

export const ASYNC_IMAGE_SUBMIT_PATH = "/v1/videos";

export function asyncImagePollPath(taskId: string): string {
  return `/v1/videos/${encodeURIComponent(taskId)}`;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

/** 请求体 UTF-8 字节数；只在提交失败时算，避免每次成功提交都为 7MB 的 body 白序列化一遍。 */
function jsonByteLength(body: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(body), "utf8");
  } catch {
    return 0;
  }
}

/**
 * 提交「确定未受理」的专用类型：让上层区分「任务一定没创建」与「状态不可知」。
 * 只有这类错误（明确的 4xx / 熔断器快速失败）才允许回退同步端点或自动重试。
 * 5xx、响应截断、200 却缺 task_id 一律不在此列——它们必须标 outcome_unknown，
 * 否则 worker 的通用重试规则会重发 POST /v1/videos，造成重复建单与双份计费。
 */
export class AsyncImageSubmitError extends ProviderError {}

const ASYNC_SUBMIT_UNKNOWN_MESSAGE =
  "异步图片任务可能已提交，暂时无法确定结果；请勿重复生成，稍后可点「尝试找回图片」";

/** 请求「一定没被上游受理」：可以安全回退同步或按 Retry-After 重试。 */
function isDefiniteSubmitRejection(error: ProviderError): boolean {
  // 熔断器在请求发出之前就快速失败，保留「暂停 30 秒」语义，不要伪装成结果未知。
  if (/circuit[_-]?open/i.test(error.diagnostic ?? "")) return true;
  // 明确的 4xx 拒绝：参数错误/鉴权/余额/内容安全由 gateway 判为同步回退候选，
  // 429 限流由 worker 按 Retry-After 有界重试，两者都不会建立任务。
  return typeof error.status === "number" && error.status >= 400 && error.status < 500;
}

/** 提交阶段结果未知：worker 见到 outcome_unknown 会直接终止运行，绝不重排队。 */
function asyncSubmitOutcomeUnknown(
  modelId: string,
  status: number | undefined,
  diagnostic: string,
  requestId?: string,
): ProviderError {
  return new ProviderError(
    ASYNC_SUBMIT_UNKNOWN_MESSAGE,
    status ?? 502,
    modelId,
    "outcome_unknown",
    `async-submit-unknown: ${diagnostic.slice(0, 300)}`,
    requestId,
  );
}

export type AsyncTaskState =
  | { status: "pending" | "running" }
  | { status: "completed"; urls: string[] }
  | { status: "failed"; error: string };

/** 从任务响应里挑出所有可用图片直链（兔子不同渠道用不同字段名）。 */
export function extractAsyncImageUrls(payload: unknown): string[] {
  const body = record(payload);
  if (!body) return [];
  const urls: string[] = [];
  const push = (value: unknown) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed) && !urls.includes(trimmed)) urls.push(trimmed);
  };
  push(body.video_url);
  push(body.url);
  push(body.image_url);
  push(body.output_url);
  if (Array.isArray(body.urls)) for (const value of body.urls) push(value);
  const data = Array.isArray(body.data) ? body.data : [];
  for (const row of data) {
    const item = record(row);
    if (!item) continue;
    push(item.url);
    push(item.image_url);
  }
  return urls;
}

/**
 * 状态机纯函数；未知状态返回 undefined，由轮询循环当作「继续等」而不是立刻判失败
 * （网关版本间状态词会漂移，视频链路曾因此把成功任务误判失败）。
 */
export function parseAsyncTaskState(payload: unknown): AsyncTaskState | undefined {
  const body = record(payload);
  if (!body) return undefined;
  const status = typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
  if (PENDING_STATUSES.has(status)) return { status: "pending" };
  if (RUNNING_STATUSES.has(status)) return { status: "running" };
  if (SUCCESS_STATUSES.has(status)) return { status: "completed", urls: extractAsyncImageUrls(body) };
  if (FAILED_STATUSES.has(status)) {
    const detail = record(body.error);
    const message = typeof detail?.message === "string" && detail.message.trim()
      ? detail.message.trim()
      : typeof body.error === "string" && body.error.trim()
        ? body.error.trim()
        : status === "expired" ? "异步图片任务已过期" : "异步图片任务失败";
    return { status: "failed", error: message };
  }
  return undefined;
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.gatewayApiKey()}`,
  };
}

async function callTaskApi(
  modelId: string,
  path: string,
  initFactory: () => RequestInit,
  timeoutMs: number,
): Promise<{ payload: unknown; requestId?: string }> {
  // 与其它图片通道共用同一把模型级熔断器，避免异步链路绕过隔离。
  if (!isProviderCallAllowed(modelId)) {
    throw new ProviderError(
      "该模型连续失败，已暂停 30 秒，请稍后再试或切换模型",
      503,
      modelId,
      "gateway_unavailable",
      `circuit_open: ${modelId} temporarily suspended`,
    );
  }
  let response: Response;
  try {
    response = await fetchWithRetry(
      `${config.gatewayBaseUrl()}${path}`,
      initFactory,
      {
        providerId: modelId,
        timeoutMs,
        maxRetries: 0,
        dispatcherFactory: getApiyiDispatcher,
      },
    );
    recordProviderSuccess(modelId);
  } catch (error) {
    if (error instanceof ProviderError) {
      if (error.category === "gateway_unavailable" || error.category === "network_error") {
        recordProviderFailure(modelId);
      } else {
        recordProviderReachable(modelId);
      }
    }
    throw error;
  }
  const payload = await readApiyiJsonResponse(response, modelId, { maxBytes: TASK_JSON_MAX_BYTES });
  return { payload, requestId: providerRequestIdFromResponse(response) };
}

export interface AsyncImageSubmitBody {
  model: string;
  prompt: string;
  response_format: "url";
  size?: string;
  images?: string[];
}

/**
 * 提交任务。只有「确定未受理」才抛 AsyncImageSubmitError；其余一律 outcome_unknown。
 *
 * 为什么必须这样分流：worker 的 isRetryableProviderError 会把 503/529/早期 504/
 * connection_error 判为可重试并重跑整个 executeStep。对同步出图这是安全的，
 * 但对 POST /v1/videos 意味着再建一个任务——若第一次其实已被受理，就是双份计费，
 * 且第一个 task_id 永远拿不到。兔子《生产可靠性》要求结果未知绝不自动重放。
 */
export async function submitAsyncImageTask(
  modelId: string,
  body: AsyncImageSubmitBody,
): Promise<{ taskId: string; requestId?: string }> {
  let payload: unknown;
  let requestId: string | undefined;
  const startedAt = Date.now();
  try {
    const result = await callTaskApi(
      modelId,
      ASYNC_IMAGE_SUBMIT_PATH,
      () => ({ method: "POST", headers: authHeaders(), body: JSON.stringify(body) }),
      SUBMIT_TIMEOUT_MS,
    );
    payload = result.payload;
    requestId = result.requestId;
  } catch (error) {
    if (!(error instanceof ProviderError)) throw error;
    // 失败必须留下「请求体字节数 + 实际耗时」：没有这两个数就分不清是上传慢、
    // 上游卡住不回，还是参数被拒，上一次 45s 超时只能靠事后猜。
    console.warn("[gemini-async-submit-failure]", JSON.stringify({
      providerId: modelId,
      status: error.status ?? null,
      category: error.category,
      elapsedMs: Date.now() - startedAt,
      requestBytes: jsonByteLength(body),
      imageCount: body.images?.length ?? 0,
      diagnostic: (error.diagnostic ?? error.message).slice(0, 200),
    }));
    if (!isDefiniteSubmitRejection(error)) {
      throw asyncSubmitOutcomeUnknown(
        modelId,
        error.status,
        `async-submit: ${error.diagnostic ?? error.message}`,
        error.requestId,
      );
    }
    throw new AsyncImageSubmitError(
      error.message,
      error.status,
      error.providerId,
      error.category,
      `async-submit: ${error.diagnostic ?? ""}`,
      error.requestId,
      error.retryAfterMs,
    );
  }
  const envelope = record(payload);
  const taskId = envelope?.id ?? envelope?.task_id;
  if (typeof taskId !== "string" || !taskId.trim()) {
    // 200 却缺 task_id 同样是状态不可知，绝不能当参数错误去回退同步或重试。
    throw asyncSubmitOutcomeUnknown(
      modelId,
      502,
      "async-submit: 2xx 响应缺少 task id，任务状态不可知",
      requestId,
    );
  }
  const resolvedTaskId = taskId.trim();
  // 任务一建立就留下可人工核对的凭据：即便进程在轮询期间被杀，
  // 也能据此到 GET /v1/videos/{task_id} 确认是否已出图，不必盲目重生成。
  console.log("[gemini-async-submitted]", JSON.stringify({
    providerId: modelId,
    taskId: resolvedTaskId,
    requestId: requestId ?? null,
  }));
  // 提交成功即落库：轮询期间进程崩溃也留得下凭据（best-effort，见 asyncTaskContext）。
  await notifyAsyncImageTaskSubmitted(resolvedTaskId);
  return { taskId: resolvedTaskId, requestId };
}

export async function pollAsyncImageTask(modelId: string, taskId: string): Promise<AsyncTaskState | undefined> {
  const { payload } = await callTaskApi(
    modelId,
    asyncImagePollPath(taskId),
    () => ({ method: "GET", headers: authHeaders() }),
    POLL_TIMEOUT_MS,
  );
  return parseAsyncTaskState(payload);
}

function outcomeUnknown(modelId: string, taskId: string, diagnostic: string): ProviderError {
  return new ProviderError(
    "异步图片任务已提交，暂时取不到结果；请勿重复生成，稍后点「尝试找回图片」即可取回",
    504,
    modelId,
    "outcome_unknown",
    diagnostic,
    taskId,
  );
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface AsyncImageTaskResult {
  taskId: string;
  urls: string[];
  requestId?: string;
}

/**
 * 提交 + 有界轮询。返回时任务一定 completed 且拿到图片直链；
 * 其余所有出口都带 task_id，交给找回链路，绝不重提交。
 */
export async function runAsyncImageTask(
  modelId: string,
  body: AsyncImageSubmitBody,
): Promise<AsyncImageTaskResult> {
  const { taskId, requestId } = await submitAsyncImageTask(modelId, body);
  const initialDelayMs = config.geminiAsyncPollInitialDelayMs();
  const intervalMs = config.geminiAsyncPollIntervalMs();
  const deadline = Date.now() + config.geminiAsyncPollTimeoutMs();
  let consecutiveErrors = 0;

  if (initialDelayMs > 0) await sleep(initialDelayMs);
  while (Date.now() < deadline) {
    let state: AsyncTaskState | undefined;
    try {
      state = await pollAsyncImageTask(modelId, taskId);
      consecutiveErrors = 0;
    } catch (error) {
      // GET 幂等且不计费：网络抖动继续查；连续失败则不冒险无限等。
      consecutiveErrors += 1;
      const diagnostic = error instanceof ProviderError
        ? (error.diagnostic ?? error.message)
        : String(error);
      if (consecutiveErrors >= MAX_CONSECUTIVE_POLL_ERRORS) {
        throw outcomeUnknown(modelId, taskId, `async-poll consecutive failures: ${diagnostic.slice(0, 300)}`);
      }
      await sleep(Math.min(intervalMs * consecutiveErrors, 8_000));
      continue;
    }
    if (state?.status === "completed") {
      if (state.urls.length === 0) {
        throw outcomeUnknown(modelId, taskId, "async-task completed without image url");
      }
      return { taskId, urls: state.urls, requestId };
    }
    if (state?.status === "failed") {
      // 任务已明确失败：不会产生图片，标为不可重试，避免自动重新计费。
      throw new ProviderError(
        `异步图片任务失败：${state.error}`,
        502,
        modelId,
        "invalid_request",
        `async-task-failed: ${state.error.slice(0, 300)}`,
        taskId,
      );
    }
    await sleep(Math.min(intervalMs, Math.max(0, deadline - Date.now())));
  }
  throw outcomeUnknown(modelId, taskId, "async-poll deadline exceeded");
}
