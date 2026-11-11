/**
 * Provider 层共用辅助：错误类型、超时重试 fetch、dataURL 工具。
 * 类型契约从 src/types/workflow.ts 导入，不在此处重复定义。
 */
import { config } from "../config";
import { fetch as undiciFetch } from "undici";

const nativeFetch = globalThis.fetch;
const PROVIDER_REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/;

// ---------- 错误归一化层：中文文案常量表 ----------

/**
 * 每个错误码对应一条中文用户提示。
 * 兜底：生成失败请稍后重试（错误码 xxxx）
 * 不透传英文，不泄露上游实现细节。
 */
/**
 * 归一化错误码（classifyProviderMessage 返回的类别）对应的中文用户提示。
 * 兜底格式：生成失败请稍后重试（错误码 xxxx）
 * 不透传英文，不泄露上游实现细节。
 */
export const ERROR_MESSAGES = /** @satisfies Record<ProviderErrorCategory, string> */ ({
  // ---------- 归一化类别（classifyProviderMessage 产出）----------
  /** 限流：当前生成人数较多，请稍后再试。 */
  rate_limited:           "当前生成人数较多，请稍后再试",
  /** 网络/响应超时 */
  timeout:                "AI 服务响应超时，请稍后重试",
  /** 内容审核拒绝：提示词或参考图违规 */
  content_refused:        "本次请求未通过 AI 安全审核，请调整提示词或参考图片后重试",
  /** 参数非法：resolution/aspect ratio/image count 等 */
  invalid_request:         "AI 服务暂不支持当前参数或参考图组合，请调整后重试",
  /** 参考图问题：尺寸/格式/大小/数量不合规 */
  reference_image_error:   "参考图无法被处理，请检查图片格式、尺寸或数量后重试",
  /** 模型不可用：not found/unsupported/not available */
  model_unavailable:      "当前 AI 模型不可用，请联系管理员检查模型配置",
  /** 鉴权欠费：401 / 403 */
  gateway_authentication:  "AI 网关鉴权失败，请联系管理员检查密钥或账号权限",
  /** 余额不足 */
  account_credit:          "AI 账号余额不足，请联系管理员充值后重试",
  /** 5xx 服务端错误 */
  gateway_unavailable:     "AI 服务暂时不可用，请稍后重试",
  /** 网络中断 */
  network_error:           "AI 服务连接中断，请稍后重试",
  /** 未知兜底 */
  unknown:                 "生成失败，请稍后重试（错误码 0000）",
  // ---------- 响应解析层专用类别 ----------
  /** 2xx 响应体中预期字段为空 */
  empty_response:          "AI 服务未返回有效结果，请稍后重试",
  /** 上游返回了不可解析或不合预期的响应体结构 */
  invalid_response:         "AI 服务返回格式异常，请稍后重试",
  /** 网络/解析故障导致结果状态不可知（不得自动重试） */
  outcome_unknown:          "生成状态未知，结果可能已经生成；系统不会自动重试",
}) as const;

export type ProviderErrorCategory =
  | keyof typeof ERROR_MESSAGES;

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly providerId?: string,
    public readonly category: ProviderErrorCategory = "unknown",
    /** 仅供服务端日志诊断，绝不返回浏览器或写入用户运行记录。 */
    public readonly diagnostic?: string,
    /** 上游网关的关联标识；仅保留在服务端日志和评估证据中。 */
    public readonly requestId?: string,
    /** 上游要求的重试等待（Retry-After / retry-after-ms），已换算为毫秒并设上限。 */
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

// ---------- 错误归一化层：模式匹配规则表 ----------

/** 优先按 HTTP 状态码归类 */
const STATUS_PRIORITY: Array<{ status: number; category: ProviderErrorCategory }> = [
  { status: 401, category: "gateway_authentication" },
  { status: 403, category: "gateway_authentication" },
  { status: 429, category: "rate_limited" },
];

/** 兜底：4xx 归 invalid_request，5xx 归 gateway_unavailable */
const STATUS_RANGE_FALLBACK: Array<{ min: number; max: number; category: ProviderErrorCategory }> = [
  { min: 400, max: 499, category: "invalid_request" },
  { min: 500, max: 599, category: "gateway_unavailable" },
];

/** 兜底未知时的格式模板（状态码嵌入） */
const UNKNOWN_TEMPLATE = "生成失败，请稍后重试（错误码 {code}）";

interface MatchRule {
  pattern: RegExp;
  category: ProviderErrorCategory;
  /** 比 status-priority 低的优先级（数字越大越靠后） */
  priority?: number;
}

const MESSAGE_RULES: MatchRule[] = [
  // content_refused — 最高优先级（比参数错误更具体）
  { priority: 10, pattern: /content\s*(policy|filter)|content management policy|responsible\s*ai\s*policy\s*violation|responsibleaipolicyviolation/i, category: "content_refused" },
  { priority: 10, pattern: /(safety system|moderation).{0,50}(block|filter|reject|refus)/i, category: "content_refused" },
  { priority: 10, pattern: /(block|filter|reject|refus).{0,50}(safety system|moderation|content management policy)/i, category: "content_refused" },
  { priority: 10, pattern: /内容.{0,12}(安全|审核|政策|过滤).{0,12}(拦截|过滤|拒绝|违规)|内容.{0,10}(拒绝|违规)/i, category: "content_refused" },
  { priority: 10, pattern: /(safety|blocked|filtered|refused).{0,30}image|prompt.{0,30}(safety|blocked|filtered)/i, category: "content_refused" },

  // model_unavailable
  { priority: 20, pattern: /model.{0,40}(not found|does not exist|unsupported|not available|invalid)|unknown model|模型.{0,10}(不存在|不可用|不支持)/i, category: "model_unavailable" },

  // reference_image_error — 优先于 generic 参数错误
  { priority: 15, pattern: /reference.?image.{0,60}(invalid|unsupported|too large|not found|invalid format|size limit|dimension|must be)/i, category: "reference_image_error" },
  { priority: 15, pattern: /(image|reference).{0,30}(must be|must not exceed|exceeds|exceed).{0,60}(size|width|height|pixel|dimension)/i, category: "reference_image_error" },
  { priority: 15, pattern: /reference image count.{0,40}(exceed|limit|maximum|too many)/i, category: "reference_image_error" },
  { priority: 15, pattern: /reference image.{0,40}(format|unsupported mime|file type|only supports)/i, category: "reference_image_error" },
  { priority: 15, pattern: /FLUX 参考图|flux reference image|adapt.*reference.*fail/i, category: "reference_image_error" },
  { priority: 15, pattern: /蒙版.{0,20}(尺寸|大小|格式|像素|alpha)/i, category: "reference_image_error" },

  // invalid_request — 确定性参数错误（放在 reference_image_error 之后）
  { priority: 30, pattern: /(invalid|unknown|unsupported|not supported|out of range).{0,60}(parameter|argument|field|resolution|aspect ratio|size|width|height|format|image count)/i, category: "invalid_request" },
  { priority: 30, pattern: /(parameter|argument|field|resolution|aspect ratio|size|width|height|format|image count).{0,60}(invalid|unknown|unsupported|not supported|out of range|must be|only supports?)/i, category: "invalid_request" },
  // 同时覆盖 "count/size/number exceeds/over/out of" 等倒序形式
  { priority: 30, pattern: /(image count|size|width|height|resolution|pixels?).{0,40}(exceeds|over|out of|more than|greater than)/i, category: "invalid_request" },
  { priority: 30, pattern: /(exceeds|over|out of|more than|greater than).{0,40}(image count|size|width|height|resolution|maximum)/i, category: "invalid_request" },
  { priority: 30, pattern: /invalid request|bad request|malformed request/i, category: "invalid_request" },
  // too many requests → 限流（无需状态码）
  { priority: 5, pattern: /too many (requests?|attempts?)/i, category: "rate_limited" },
  { priority: 25, pattern: /invalid token|expired token|missing token|unauthorized request/i, category: "gateway_authentication" },

  // account_credit
  // 覆盖三类上游措辞：
  // 1) 英文通用：insufficient credit / credit limit / quota exceeded
  // 2) 本网关（兔子 API）实测：`预扣费额度失败, 用户剩余额度: $x, 需要预扣费额度: $y`、
  //    错误码 `insufficient_user_quota`（归一化后下划线变空格）——原文既不含
  //    "insufficient credit" 也不含 "quota exceeded"，旧正则完全匹配不到
  // 3) 中文余额/欠费表述
  { priority: 25, pattern: /insufficient credit|credit limit|quota exceeded|insufficient[_\s-]*(user[_\s-]*)?quota|insufficient[_\s-]*(balance|funds)|余额不足|账户.{0,10}(欠费|不足|超限)|预扣费额度|剩余额度|额度(不足|用尽|超限|已满)/i, category: "account_credit" },
  // 2026-11-10 按兔子《AI API 通用错误码与排障指南》补：429 不只表示"请求太快"，
  // 余额/套餐/日配额/免费额度耗尽也会用 429，必须按业务码区分，不能盲目退避重试。
  { priority: 24, pattern: /daily[\s_-]*(limit|quota)|free[\s_-]*(tier|quota|allowance)|billing[\s_-]*(hard[\s_-]*)?limit|payment required|套餐.{0,10}(到期|超限|用尽|不足)|日配额|每日限额|免费额度|账户余额|欠费/i, category: "account_credit" },

  // network_error — 优先于 unknown
  { priority: 40, pattern: /connection.{0,30}(reset|refused|timeout)|network.{0,30}(error|fail|unreachable)|econnreset|econnrefused|etimedout/i, category: "network_error" },
];

/**
 * 表驱动错误归一化：将 HTTP 状态码 + 上游原始消息映射为统一 category + 中文提示。
 * 所有匹配规则均为中文用户提示；英文原始消息仅用于模式匹配，不透传给前端。
 */
function classifyProviderMessage(
  status: number | undefined,
  rawMessage: string,
): { category: ProviderErrorCategory; publicMessage: string } {
  const normalized = rawMessage
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  // 1. HTTP 状态码优先匹配。
  //    例外：兔子 API 用 403 同时表示「额度不足」（insufficient_user_quota），
  //    若一律归为鉴权失败，会把「该充值」误报成「该查密钥/权限」，把排查引向错误方向。
  //    因此 401/403 先看余额类证据，命中则以 account_credit 为准。
  const statusMatch = STATUS_PRIORITY.find((s) => s.status === status);
  if (statusMatch) {
    // 401/403 与 429 都可能其实是余额/配额问题（指南：429 必须按业务码再分类）。
    if (statusMatch.category === "gateway_authentication" || statusMatch.category === "rate_limited") {
      const creditRule = MESSAGE_RULES.find(
        (rule) => rule.category === "account_credit" && rule.pattern.test(normalized),
      );
      if (creditRule) {
        return { category: "account_credit", publicMessage: ERROR_MESSAGES.account_credit };
      }
    }
    return { category: statusMatch.category, publicMessage: ERROR_MESSAGES[statusMatch.category] };
  }

  // 2. 消息文本模式匹配（按 priority 升序，即 priority 越小越先）
  const sortedRules = [...MESSAGE_RULES].sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));
  for (const rule of sortedRules) {
    if (rule.pattern.test(normalized)) {
      return { category: rule.category, publicMessage: ERROR_MESSAGES[rule.category] };
    }
  }

  // 3. HTTP 状态码范围兜底
  if (status !== undefined) {
    const rangeMatch = STATUS_RANGE_FALLBACK.find(
      (r) => status >= r.min && status <= r.max,
    );
    if (rangeMatch) {
      return { category: rangeMatch.category, publicMessage: ERROR_MESSAGES[rangeMatch.category] };
    }
  }

  // 4. 兜底未知
  const code = status !== undefined ? String(status).padStart(4, "0") : "0000";
  return {
    category: "unknown",
    publicMessage: UNKNOWN_TEMPLATE.replace("{code}", code),
  };
}

const REQUEST_ID_HEADERS = [
  "x-oneapi-request-id",
  "x-request-id",
  "request-id",
  "apim-request-id",
  "x-amzn-requestid",
] as const;

export function providerRequestIdFromResponse(response: Pick<Response, "headers">): string | undefined {
  for (const header of REQUEST_ID_HEADERS) {
    const requestId = response.headers.get(header)?.trim();
    if (requestId && PROVIDER_REQUEST_ID_PATTERN.test(requestId)) return requestId;
  }
  return undefined;
}

/**
 * 上游重试等待（指南：优先遵守有效的 Retry-After）。
 * 同时兼容秒数与 HTTP 日期，以及 Azure 的毫秒级 retry-after-ms；上限 120 秒，
 * 避免上游给出异常大值把任务挂死。
 */
export function providerRetryAfterMs(response: Pick<Response, "headers">): number | undefined {
  const cap = 120_000;
  const azureRaw = response.headers.get("retry-after-ms");
  if (azureRaw !== null && azureRaw.trim() !== "") {
    const azureMs = Number(azureRaw);
    if (Number.isFinite(azureMs) && azureMs >= 0) return Math.min(cap, azureMs);
  }
  const raw = response.headers.get("retry-after")?.trim();
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return Math.min(cap, Number(raw) * 1_000);
  const at = Date.parse(raw);
  if (!Number.isFinite(at)) return undefined;
  return Math.max(0, Math.min(cap, at - Date.now()));
}

export function providerErrorFromResponse(
  status: number,
  responseBody: string,
  providerId?: string,
  requestId?: string,
  retryAfterMs?: number,
): ProviderError {
  const classified = classifyProviderMessage(status, responseBody);
  return new ProviderError(
    classified.publicMessage,
    status,
    providerId,
    classified.category,
    `HTTP ${status}: ${responseBody.slice(0, 2_000)}`,
    requestId,
    retryAfterMs,
  );
}

export function providerErrorFromMessage(message: string, providerId?: string, status?: number): ProviderError {
  const classified = classifyProviderMessage(status, message);
  return new ProviderError(classified.publicMessage, status, providerId, classified.category, message.slice(0, 2_000));
}

export function dispatchFetch(
  url: string,
  init: RequestInit & { dispatcher?: unknown },
): Promise<Response> {
  // Node's native fetch does not reliably apply a request-level Undici
  // dispatcher on the supported runtime. Keep replaced fetch implementations
  // injectable for tests and embedders, while real requests use Undici.
  if (init.dispatcher !== undefined && globalThis.fetch === nativeFetch) {
    // The provider boundary accepts the platform RequestInit type, while
    // Undici exposes a narrower Node-specific body type. Runtime fields are
    // compatible here; keep the conversion local to this adapter.
    return undiciFetch(
      url,
      init as unknown as Parameters<typeof undiciFetch>[1],
    ) as unknown as Promise<Response>;
  }
  return globalThis.fetch(url, init);
}

export function publicProviderErrorMessage(error: unknown): string {
  if (error instanceof ProviderError) {
    return ERROR_MESSAGES[error.category] ?? ERROR_MESSAGES.unknown;
  }
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return ERROR_MESSAGES.timeout;
  }
  return ERROR_MESSAGES.unknown;
}

/** 将仅供服务端使用的网关诊断压缩并脱敏，避免日志泄露 Key、URL 或图片数据。 */
export function sanitizedProviderDiagnostic(error: ProviderError): string | undefined {
  if (!error.diagnostic) return undefined;
  const redact = (value: string) => value
    .replace(/(?:bearer\s+)?sk-[a-z0-9_-]+/gi, "[redacted-key]")
    .replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/gi, "[redacted-image]")
    .replace(/https?:\/\/[^\s\"']+/gi, "[redacted-url]")
    .slice(0, 800);
  const match = /^HTTP\s+(\d+):\s*([\s\S]*)$/i.exec(error.diagnostic);
  if (!match) return redact(error.diagnostic);
  try {
    const parsed = JSON.parse(match[2]) as { error?: unknown };
    const source = typeof parsed.error === "object" && parsed.error !== null
      ? parsed.error as Record<string, unknown>
      : parsed as Record<string, unknown>;
    const safe = Object.fromEntries(
      ["message", "type", "code", "param", "status"]
        .filter((key) => typeof source[key] === "string" || typeof source[key] === "number")
        .map((key) => [key, redact(String(source[key]))]),
    );
    return `HTTP ${match[1]}: ${JSON.stringify(safe)}`;
  } catch {
    return `HTTP ${match[1]}: ${redact(match[2])}`;
  }
}

export class NotImplementedError extends ProviderError {
  constructor(feature: string) {
    super(`Not implemented: ${feature}`);
    this.name = "NotImplementedError";
  }
}

export interface ProviderTransportFailure {
  code?: string;
  timedOut: boolean;
  message: string;
  diagnostic: string;
}

/**
 * Node fetch/Undici 常把真实阶段码放在 cause 链中。这个提取器同时用于
 * 响应头之前的 fetch 错误和响应头之后的 body 读取错误，避免阶段诊断丢失。
 */
export function inspectProviderTransportFailure(error: unknown): ProviderTransportFailure {
  const errorChain: unknown[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current && typeof current === "object"; depth += 1) {
    errorChain.push(current);
    current = "cause" in current ? (current as { cause?: unknown }).cause : undefined;
  }
  const code = errorChain
    .map((item) => "code" in (item as object) ? (item as { code?: unknown }).code : undefined)
    .find((value): value is string => typeof value === "string");
  const timedOut = errorChain.some((item) => item instanceof Error &&
    (item.name === "TimeoutError" || item.name === "AbortError")) ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "UND_ERR_BODY_TIMEOUT";
  const message = error instanceof Error ? error.message : String(error);
  return {
    code,
    timedOut,
    message,
    diagnostic: code ? `${code}: ${message}` : message,
  };
}

/**
 * 单次 Provider 请求出口。重试必须由 PostgreSQL Worker 在拿到明确 429/503 后调度；
 * 网络错误、超时或连接中断可能已经产生计费，因此一律标记为 outcome_unknown。
 */
export async function fetchWithRetry(
  url: string,
  initFactory: () => RequestInit,
  opts?: {
    timeoutMs?: number;
    maxRetries?: number;
    providerId?: string;
    dispatcherFactory?: () => unknown;
  },
): Promise<Response> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new ProviderError("AI 网关地址无效，请联系管理员检查配置", 400, opts?.providerId, "invalid_request");
  }
  if (parsedUrl.protocol !== "https:") {
    throw new ProviderError(
      "AI 网关必须使用 HTTPS，请联系管理员检查配置",
      400,
      opts?.providerId,
      "invalid_request",
      `Blocked non-HTTPS provider URL with protocol ${parsedUrl.protocol}`,
    );
  }
  const timeoutMs = opts?.timeoutMs ?? config.aiTimeoutMs();
  void opts?.maxRetries;
  try {
    const requestInit: RequestInit & { dispatcher?: unknown } = {
      ...initFactory(),
      signal: AbortSignal.timeout(timeoutMs),
    };
    const dispatcher = opts?.dispatcherFactory?.();
    if (dispatcher !== undefined) requestInit.dispatcher = dispatcher;
    const res = await dispatchFetch(url, requestInit);
    const requestId = providerRequestIdFromResponse(res);
    if (!res.ok) {
      // 非 2xx body 若本身超时/中断，结果和计费状态同样不可知；不得吞掉后误判为可重试 503。
      try {
        const body = await res.text();
        throw providerErrorFromResponse(
          res.status, body, opts?.providerId, requestId, providerRetryAfterMs(res),
        );
      } catch (error) {
        if (error instanceof ProviderError) throw error;
        const failure = inspectProviderTransportFailure(error);
        throw new ProviderError(
          failure.timedOut
            ? "AI 响应体读取超时，结果可能已经生成；系统不会自动重试"
            : "AI 响应中断或不完整，结果可能已经生成；系统不会自动重试",
          failure.timedOut ? 504 : 502,
          opts?.providerId,
          "outcome_unknown",
          failure.diagnostic,
          requestId,
        );
      }
    }
    return res;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    const failure = inspectProviderTransportFailure(error);
    throw new ProviderError(
      failure.timedOut
        ? "AI 请求已超时，结果可能已经生成；为避免重复计费，系统不会自动重试"
        : "AI 连接中断，结果可能已经生成；为避免重复计费，系统不会自动重试",
      failure.timedOut ? 504 : 502,
      opts?.providerId,
      "outcome_unknown",
      failure.diagnostic,
    );
  }
}

// ---------- dataURL 工具 ----------

export interface ParsedDataUrl {
  mime: string;
  base64: string;
  buffer: Buffer;
}

/** 解析 "data:image/png;base64,xxxx" */
export function parseDataUrl(dataUrl: string): ParsedDataUrl {
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl);
  if (!m || !m[2]) {
    throw new ProviderError("Invalid dataURL (expected base64)");
  }
  const mime = m[1] || "image/png";
  const base64 = m[3];
  return { mime, base64, buffer: Buffer.from(base64, "base64") };
}

export function toDataUrl(base64: string, mime = "image/png"): string {
  return `data:${mime};base64,${base64}`;
}

/** aspectRatio → gpt-image size 映射 */
export function aspectRatioToSize(aspectRatio?: string): string {
  switch (aspectRatio) {
    case "3:4":
    case "9:16":
      return "1024x1536";
    case "4:3":
    case "16:9":
      return "1536x1024";
    default:
      return "1024x1024";
  }
}
