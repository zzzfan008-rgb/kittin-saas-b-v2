/**
 * 文本 Provider 抽象（Q1=B：text 节点同步 chat completions，schema v7）。
 * 契约唯一来源：docs/design/2026-09-18-three-node-model/contracts/runtime.md §1b。
 * 文本运行是同步链路（HTTP 请求内完成），不进 runQueue 异步骨架。
 */
import {
  TEXT_MODEL_IDS,
  getTextModelContract,
  isTextModelId,
  type TextModelId,
  type TextModelOptions,
} from "../../src/types/textModels";
import { getGarmentPromptVariantById } from "../../src/lib/garmentPromptPresets";
import { config } from "../config";
import {
  fetchWithRetry,
  inspectProviderTransportFailure,
  ProviderError,
  providerErrorFromMessage,
  providerRequestIdFromResponse,
} from "./base";
import { getApiyiDispatcher, readApiyiJsonResponse } from "./apiyiTransport";

/** 文本同步链路请求级超时（runtime.md §1b）。 */
export const TEXT_RUN_TIMEOUT_MS = 60_000;
const TEXT_RESPONSE_MAX_BYTES = 4 * 1024 * 1024;

export interface TextGenRequest {
  input: string;
  promptVariantId: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  modelId: TextModelId;
  modelOptions?: TextModelOptions;
}

export type TextProviderResult =
  | { status: "completed"; text: string; usage: { promptTokens: number; completionTokens: number } }
  | { status: "failed"; error: string; billed: boolean };

export interface TextProvider {
  readonly id: TextModelId;
  /** 同步调用；失败返回 error 与 billed 证据（runtime.md §1b）。 */
  complete(req: TextGenRequest): Promise<TextProviderResult>;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function parseUsage(payload: Record<string, unknown>): { promptTokens: number; completionTokens: number } {
  const usage = record(payload.usage);
  const promptTokens = typeof usage?.prompt_tokens === "number" ? usage.prompt_tokens : 0;
  const completionTokens = typeof usage?.completion_tokens === "number" ? usage.completion_tokens : 0;
  return { promptTokens, completionTokens };
}

function parseCompletionText(payload: Record<string, unknown>, modelId: TextModelId): string {
  const choices = Array.isArray(payload.choices) ? payload.choices : [];
  const first = record(choices[0]);
  const message = record(first?.message);
  const content = message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new ProviderError("AI 服务未返回文本内容", 502, modelId, "empty_response");
  }
  return content;
}

function throwEmbeddedTextError(payload: Record<string, unknown>, modelId: TextModelId): void {
  if (payload.error === undefined || payload.error === null) return;
  const detail = record(payload.error);
  const message = typeof detail?.message === "string" ? detail.message : "API易文本接口返回错误";
  const rawCode = detail?.code;
  const status = typeof rawCode === "number" ? rawCode : undefined;
  const classifierMessage = typeof rawCode === "string" ? `${rawCode}: ${message}` : message;
  throw providerErrorFromMessage(classifierMessage, modelId, status);
}

async function completeWithApiyi(modelId: TextModelId, req: TextGenRequest): Promise<TextProviderResult> {
  const contract = getTextModelContract(modelId);
  const variant = getGarmentPromptVariantById(req.promptVariantId);
  if (!variant) {
    return { status: "failed", error: `提示词变体 ${req.promptVariantId} 不在当前受审目录中`, billed: false };
  }
  // runtime.md §1b 第 3 步：messages = [{system: fullPrompt}, {user: input}]。
  const messages = [
    { role: "system", content: variant.fullPrompt },
    { role: "user", content: req.input },
  ];
  const options = req.modelOptions ?? {};
  try {
    const response = await fetchWithRetry(
      `${config.apiyiBaseUrl()}${contract.endpoint.path}`,
      () => ({
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiyiApiKey()}` },
        body: JSON.stringify({ model: modelId, messages, ...options }),
      }),
      {
        providerId: modelId,
        timeoutMs: config.aiTimeoutMs(TEXT_RUN_TIMEOUT_MS),
        maxRetries: 0,
        dispatcherFactory: getApiyiDispatcher,
      },
    );
    const requestId = providerRequestIdFromResponse(response);
    const payload = record(await readApiyiJsonResponse(response, modelId, {
      maxBytes: TEXT_RESPONSE_MAX_BYTES,
    }));
    if (!payload) throw new ProviderError("AI 服务返回格式无效", 502, modelId, "invalid_response");
    throwEmbeddedTextError(payload, modelId);
    const text = parseCompletionText(payload, modelId);
    const usage = parseUsage(payload);
    return { status: "completed", text, usage };
  } catch (error) {
    if (error instanceof ProviderError) {
      // billed 证据：Provider 已计费但返回失败（如内容审核拦截）记为 billed=true；
      // 网络中断/超时（outcome_unknown）按 billed=false 处理（runtime.md §1b 失败计费语义）。
      const billed = error.category === "content_refused" || error.category === "invalid_request";
      return { status: "failed", error: error.message, billed };
    }
    const failure = inspectProviderTransportFailure(error);
    return {
      status: "failed",
      error: failure.timedOut ? "文本模型响应超时" : "AI 服务暂时不可用，请稍后重试",
      billed: false,
    };
  }
}

export function createApiyiTextProvider(modelId: TextModelId): TextProvider {
  return {
    id: modelId,
    complete: (req) => completeWithApiyi(modelId, req),
  };
}

/**
 * 文本 Provider 注册表：从 TEXT_MODEL_IDS（权威清单，src/types/textModels.ts）逐项构建，
 * 不再在 Provider 层硬编码模型 ID 列表，注册表与契约类型永不失联（R-55 集成修复）。
 * 完备性守卫：每个 TextModelId 都必须在注册表中有 Provider；缺一即加载抛错，杜绝再犯。
 */
const textProviderRegistry = new Map<TextModelId, TextProvider>();
for (const modelId of TEXT_MODEL_IDS) {
  textProviderRegistry.set(modelId, createApiyiTextProvider(modelId));
}
for (const modelId of TEXT_MODEL_IDS) {
  if (!textProviderRegistry.has(modelId)) {
    throw new Error(`文本 Provider 注册表缺少模型: ${modelId}`);
  }
}

export const apiyiTextProviders: ReadonlyMap<TextModelId, TextProvider> = textProviderRegistry;

export function getTextProvider(modelId: string): TextProvider {
  if (!isTextModelId(modelId)) {
    throw new ProviderError(`Unknown text provider id: ${modelId}`, 400);
  }
  const provider = apiyiTextProviders.get(modelId);
  if (!provider) {
    // isTextModelId 已收窄 + 注册表完备性守卫，此处理论上不可达；保留防御，杜绝再犯。
    throw new ProviderError(`Text provider not registered: ${modelId}`, 500);
  }
  return provider;
}
