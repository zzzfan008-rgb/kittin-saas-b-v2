/**
 * 提示词改写层 · 文本通道薄客户端（OpenAI 兼容 chat-completions，纯传输，不含改写业务）。
 *
 * 契约：docs/design/2026-10-12-prompt-rewrite/plan.md §2.1 / §4 / §7-1。
 * - 端点 POST {base}/v1/chat/completions，复用 config.apiyiApiKey()（无需新密钥）。
 * - 模型默认 config.apiyiTextModelId()（"gemini-3.8-flash"）；思考控制固定 reasoning_effort
 *   （有效值 low/medium/high，用户拍板默认 "medium"）。**禁止 "minimal"**（OpenAI 兼容端不报错、
 *   200，但参数被静默忽略、思考照常发生并计入输出计费）；**禁止 thinkingBudget**（那是 Gemini
 *   原生端关闭思考的机制，且用户语义是 medium 档而非完全关闭）。两者均不出现在请求体。
 * - 重试语义与出图 fetchWithRetry **相反**（§4）：文本改写便宜且幂等（同输入近似同输出），
 *   断连不产生「已生成的高价值产物」，故 transport/429/5xx 允许重试 1 次（上限，绝不无限重试）。
 */
import { config } from "../config";
import { getApiyiDispatcher } from "../providers/apiyiTransport";

export type TextChatRole = "system" | "user";
export interface TextChatMessage {
  role: TextChatRole;
  content: string;
}

/** OpenAI 兼容端 reasoning_effort 有效值；契约固定默认 "medium"，"minimal" 被禁（见头注）。 */
export type TextReasoningEffort = "low" | "medium" | "high";

export interface TextChatCompletionArgs {
  model: string;
  messages: TextChatMessage[];
  reasoningEffort?: TextReasoningEffort;
  /** 默认 0.4（改写要确定性，低于 chat 默认 1）。 */
  temperature?: number;
  /**
   * 默认 2048。注意这是 output 总预算，gemini-3.8-flash 默认开深度思考且思考
   * token 计入 output（API易快照 overview 原文「思考 tokens 計入輸出計費」）：
   * medium 档在长协议改写下思考可烧 ~480 token，512 会让正文只剩零头且
   * finish_reason 仍报 "stop"（P1 实测半句话事故）。2048 = 思考余量 + 正文上限。
   */
  maxTokens?: number;
  /** 默认 config.aiTextTimeoutMs()。 */
  timeoutMs?: number;
}

export interface TextChatUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface TextChatCompletionResult {
  /** choices[0].message.content（trim 后）。 */
  content: string;
  finishReason: string;
  usage: TextChatUsage;
}

export type TextChatErrorCode =
  | "text_transport_error"
  | "text_rate_limited"
  | "text_request_rejected"
  | "text_upstream_error"
  | "text_bad_response";

/**
 * 文本改写层错误。`retryable=true` 的码允许在通道内重试 1 次（§2.1/§4）：
 * transport / rate_limited(429) / upstream(5xx) 可重试；request_rejected(400/401/403) 与
 * bad_response 不重试（配置/密钥问题或响应形态错误，重试无意义）。
 */
export class TextRewriteError extends Error {
  readonly code: TextChatErrorCode;
  readonly retryable: boolean;
  /** 429 时解析自 Retry-After 头（秒或 HTTP-date），供重试退避；无头由调用方回退 1s。 */
  readonly retryAfterMs?: number;
  constructor(
    code: TextChatErrorCode,
    message: string,
    options?: { retryable?: boolean; retryAfterMs?: number; cause?: unknown },
  ) {
    super(message);
    this.name = "TextRewriteError";
    this.code = code;
    this.retryable = options?.retryable ?? false;
    if (options?.retryAfterMs !== undefined) this.retryAfterMs = options.retryAfterMs;
    if (options?.cause !== undefined) (this as { cause?: unknown }).cause = options.cause;
  }
}

export interface TextChatClientDeps {
  /** 测试注入 mock fetch；缺省全局 fetch。 */
  fetchImpl?: typeof fetch;
  /** 测试注入退避等待（避免真实 sleep）；缺省真实 setTimeout。 */
  sleep?: (ms: number) => Promise<void>;
  /** 缺省 config.apiyiBaseUrl()。 */
  baseUrl?: string;
  /** 缺省 config.apiyiApiKey()。 */
  apiKey?: string;
  /** 重试预算外的总尝试上限（含首发）；默认 2 = 首发 + 1 次重试。 */
  maxAttempts?: number;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** 解析 Retry-After 头（秒数或 HTTP-date）→ 毫秒；无法解析返回 undefined。 */
function parseRetryAfterMs(header: string | null, nowMs: number): number | undefined {
  if (header === null) return undefined;
  const trimmed = header.trim();
  if (/^\d+$/.test(trimmed)) return Math.max(0, Number(trimmed) * 1000);
  const dateMs = Date.parse(trimmed);
  if (Number.isFinite(dateMs)) return Math.max(0, dateMs - nowMs);
  return undefined;
}

function extractContent(payload: unknown): { content: string; finishReason: string; usage: TextChatUsage } {
  const root = (typeof payload === "object" && payload !== null ? payload : {}) as Record<string, unknown>;
  const choices = Array.isArray(root.choices) ? root.choices : [];
  const first = (choices[0] ?? {}) as Record<string, unknown>;
  const message = (typeof first.message === "object" && first.message !== null ? first.message : {}) as Record<string, unknown>;
  const rawContent = message.content;
  if (typeof rawContent !== "string" || rawContent.trim() === "") {
    throw new TextRewriteError(
      "text_bad_response",
      "文本通道响应缺少 choices[0].message.content 或内容为空",
      { retryable: false },
    );
  }
  const usageRoot = (typeof root.usage === "object" && root.usage !== null ? root.usage : {}) as Record<string, unknown>;
  return {
    content: rawContent.trim(),
    finishReason: typeof first.finish_reason === "string" ? first.finish_reason : "",
    usage: {
      promptTokens: Number(usageRoot.prompt_tokens) || 0,
      completionTokens: Number(usageRoot.completion_tokens) || 0,
      totalTokens: Number(usageRoot.total_tokens) || 0,
    },
  };
}

async function attemptOnce(args: TextChatCompletionArgs, deps: Required<Pick<TextChatClientDeps, "fetchImpl" | "baseUrl" | "apiKey">>): Promise<TextChatCompletionResult> {
  const url = `${deps.baseUrl}/v1/chat/completions`;
  const body = {
    model: args.model,
    messages: args.messages,
    // 契约固定：reasoning_effort 有效值 low/medium/high，默认 medium；绝不写 minimal / thinkingBudget。
    reasoning_effort: args.reasoningEffort ?? "medium",
    temperature: args.temperature ?? 0.4,
    // max_tokens 是 output 总预算（含思考 token），默认 2048，见 TextChatCompletionArgs.maxTokens 注释。
    max_tokens: args.maxTokens ?? 2048,
    stream: false,
  };
  const timeoutMs = args.timeoutMs ?? config.aiTextTimeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new TextRewriteError("text_transport_error", `文本通道请求超时（${timeoutMs}ms）`, { retryable: true })), timeoutMs);

  let response: Response;
  try {
    response = await deps.fetchImpl(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${deps.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      // API易专属连接池（undici Agent），与出图通道一致。
      ...( { dispatcher: getApiyiDispatcher() } as Record<string, unknown>),
    } as Parameters<typeof fetch>[1]);
  } catch (error) {
    if (error instanceof TextRewriteError) throw error; // 超时 abort 抛出的已定码错误
    throw new TextRewriteError(
      "text_transport_error",
      `文本通道网络错误/断连：${error instanceof Error ? error.message : String(error)}`,
      { retryable: true, cause: error },
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 429) {
    throw new TextRewriteError("text_rate_limited", "文本通道被限流（HTTP 429）", {
      retryable: true,
      retryAfterMs: parseRetryAfterMs(response.headers.get("retry-after"), Date.now()),
    });
  }
  if (response.status === 400 || response.status === 401 || response.status === 403) {
    throw new TextRewriteError("text_request_rejected", `文本通道请求被拒（HTTP ${response.status}，配置/密钥问题，重试无意义）`, { retryable: false });
  }
  if (response.status === 500 || response.status === 502 || response.status === 503) {
    throw new TextRewriteError("text_upstream_error", `文本通道上游错误（HTTP ${response.status}）`, { retryable: true });
  }
  if (!response.ok) {
    // 未列名的非 2xx：保守视为上游异常但**不重试**（未知语义不盲目重发）。
    throw new TextRewriteError("text_upstream_error", `文本通道未处理状态（HTTP ${response.status}）`, { retryable: false });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new TextRewriteError("text_bad_response", "文本通道响应非 JSON", { retryable: false, cause: error });
  }
  return extractContent(payload);
}

/**
 * 发起一次文本改写补全（内部对 transport/429/5xx 重试至多 1 次）。
 * 429 退避尊重 Retry-After（无头回退 1s）；其余可重试错误固定短退避。
 */
export async function createTextChatCompletion(
  args: TextChatCompletionArgs,
  deps: TextChatClientDeps = {},
): Promise<TextChatCompletionResult> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const sleep = deps.sleep ?? defaultSleep;
  const baseUrl = (deps.baseUrl ?? config.apiyiBaseUrl()).replace(/\/+$/, "");
  const apiKey = deps.apiKey ?? config.apiyiApiKey();
  const maxAttempts = deps.maxAttempts ?? 2; // 首发 + 1 次重试（§4 上限）

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await attemptOnce(args, { fetchImpl, baseUrl, apiKey });
    } catch (error) {
      lastError = error;
      const retryable = error instanceof TextRewriteError && error.retryable;
      if (!retryable || attempt >= maxAttempts) throw error;
      const backoffMs = error instanceof TextRewriteError && error.code === "text_rate_limited"
        ? (error.retryAfterMs ?? 1_000)
        : 200;
      await sleep(backoffMs);
    }
  }
  throw lastError;
}
