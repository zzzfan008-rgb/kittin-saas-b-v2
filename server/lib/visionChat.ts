/**
 * 多模态（图片 → 文本）通道。
 *
 * 与 `textChat.ts` 的关键差异（也是不能直接复用它的原因）：
 * 1. `content` 允许数组（`text` + `image_url`），textChat 把 content 硬性定义为 string；
 * 2. `reasoning_effort` 默认不发送——OpenAI/Claude 系不认该字段会直接 400，只有白名单模型才带；
 * 3. 响应 content 可能是字符串或 `[{type:"text"}]` 数组，两种都要能解析。
 *
 * 传输层必须走 `dispatchFetch`：Node 原生 fetch 不接受 npm undici 的 Agent，
 * 直接传 dispatcher 会在 3ms 内抛 UND_ERR_INVALID_ARG（2026-11-09 文本通道事故）。
 */
import { config } from "../config";
import { dispatchFetch } from "../providers/base";
import { getApiyiDispatcher } from "../providers/gatewayTransport";

export type VisionContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface VisionMessage {
  role: "system" | "user";
  content: string | VisionContentPart[];
}

export interface VisionChatResult {
  content: string;
  finishReason: string;
  modelId: string;
  usageTokens?: number;
}

export type VisionChatErrorCode =
  | "vision_transport_error"
  | "vision_request_rejected"
  | "vision_rate_limited"
  | "vision_upstream_error"
  | "vision_bad_response";

export class VisionChatError extends Error {
  readonly code: VisionChatErrorCode;
  readonly retryable: boolean;
  readonly status?: number;

  constructor(code: VisionChatErrorCode, message: string, options?: { retryable?: boolean; status?: number }) {
    super(message);
    this.name = "VisionChatError";
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.status = options?.status;
  }
}

/** 只对这些模型发送 reasoning_effort；其它模型不认该字段会 400。 */
const REASONING_EFFORT_MODELS = /^gemini-/i;

function extractText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .filter((part): part is { type: string; text: string } =>
        Boolean(part) && typeof part === "object" && (part as { type?: unknown }).type === "text"
        && typeof (part as { text?: unknown }).text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();
  }
  return "";
}

export interface VisionChatArgs {
  modelId: string;
  messages: VisionMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

/**
 * 单次视觉对话调用。失败抛 VisionChatError（由调用方决定是否降级下一个模型）。
 */
export async function createVisionChatCompletion(args: VisionChatArgs): Promise<VisionChatResult> {
  const baseUrl = config.gatewayBaseUrl();
  const apiKey = config.gatewayApiKey();
  const timeoutMs = args.timeoutMs ?? config.promptAnalysisTimeoutMs();
  const body: Record<string, unknown> = {
    model: args.modelId,
    messages: args.messages,
    temperature: args.temperature ?? 0.3,
    max_tokens: args.maxTokens ?? 900,
    stream: false,
  };
  if (REASONING_EFFORT_MODELS.test(args.modelId)) {
    body.reasoning_effort = "low";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await dispatchFetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      dispatcher: getApiyiDispatcher(),
    } as RequestInit & { dispatcher?: unknown });
  } catch (error) {
    const aborted = controller.signal.aborted;
    throw new VisionChatError(
      "vision_transport_error",
      aborted
        ? `视觉通道超时（${timeoutMs}ms）`
        : `视觉通道网络错误：${error instanceof Error ? error.message : String(error)}`,
      { retryable: true },
    );
  } finally {
    clearTimeout(timer);
  }

  const raw = await response.text();
  if (response.status === 429) {
    throw new VisionChatError("vision_rate_limited", "视觉通道被限流（HTTP 429）", { retryable: true, status: 429 });
  }
  if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) {
    throw new VisionChatError(
      "vision_request_rejected",
      `视觉通道请求被拒（HTTP ${response.status}）：${raw.slice(0, 200)}`,
      { status: response.status },
    );
  }
  if (!response.ok) {
    throw new VisionChatError(
      "vision_upstream_error",
      `视觉通道上游错误（HTTP ${response.status}）：${raw.slice(0, 200)}`,
      { retryable: response.status >= 500, status: response.status },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new VisionChatError("vision_bad_response", `视觉通道响应非 JSON：${raw.slice(0, 160)}`);
  }

  const root = (payload ?? {}) as Record<string, unknown>;
  if (root.error) {
    throw new VisionChatError(
      "vision_upstream_error",
      `视觉通道返回错误：${JSON.stringify(root.error).slice(0, 200)}`,
      { retryable: false },
    );
  }
  const choice = (Array.isArray(root.choices) ? root.choices[0] : undefined) as Record<string, unknown> | undefined;
  const message = (choice?.message ?? {}) as Record<string, unknown>;
  if (typeof message.refusal === "string" && message.refusal.trim()) {
    throw new VisionChatError("vision_bad_response", `模型拒绝解析：${message.refusal.slice(0, 120)}`);
  }
  const content = extractText(message.content);
  if (!content) {
    throw new VisionChatError("vision_bad_response", "视觉通道响应缺少可用文本");
  }
  const usage = (root.usage ?? {}) as Record<string, unknown>;
  const usageTokens = Number(usage.total_tokens);
  return {
    content,
    finishReason: typeof choice?.finish_reason === "string" ? choice.finish_reason : "",
    modelId: typeof root.model === "string" ? root.model : args.modelId,
    ...(Number.isFinite(usageTokens) ? { usageTokens } : {}),
  };
}
