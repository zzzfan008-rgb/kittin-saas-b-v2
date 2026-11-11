import { fetch as undiciFetch, FormData as UndiciFormData } from "undici";
import sharp from "sharp";
import {
  type AIProvider,
  type ImageGenRequest,
  type ImageGenResult,
  type ImageOperationMode,
} from "../../src/types/workflow";
import {
  MASK_REDRAW_MODEL_ID,
  RESOLUTION_TIERS,
  defaultImageModelOptions,
  getImageModelContract,
  modelMaxReferenceImages,
  modelSupportsQuality,
  resolutionDimensions,
  type ImageModelId,
  type ImageModelOptions,
  type ResolutionTier,
} from "../../src/types/imageModels";
import { config } from "../config";
import {
  isProviderCallAllowed,
  recordProviderFailure,
  recordProviderReachable,
  recordProviderSuccess,
} from "./circuitBreaker";
import { validateMaskForSource } from "../lib/maskProcessing";
import { detectImageMime, MAX_IMAGE_BYTES, validateImageDataUrl } from "../lib/imageValidation";
import { withImageProcessingSlot } from "../lib/imageProcessingLimit";
import {
  orderedReferenceInputs,
  referenceDataUrls,
  referenceInputsError,
} from "../../src/lib/referenceInputs";
import {
  fetchWithRetry,
  inspectProviderTransportFailure,
  parseDataUrl,
  ProviderError,
  providerErrorFromMessage,
  providerRequestIdFromResponse,
  toDataUrl,
} from "./base";
import { getApiyiDispatcher, readApiyiJsonResponse } from "./gatewayTransport";
import {
  AsyncImageSubmitError,
  runAsyncImageTask,
  type AsyncImageSubmitBody,
} from "./asyncImageTask";

const PROVIDER_RESPONSE_PIXEL_LIMIT = 40_000_000;
const REFERENCE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"]);
const PROVIDER_JSON_OVERHEAD_BYTES = 1024 * 1024;

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function requestOptions(modelId: ImageModelId, req: ImageGenRequest): ImageModelOptions {
  // v7（R5）：参数取值硬校验删除，降级为 warning（不阻断）；Provider 侧
  // 不再因 modelOptions 拒绝请求。警告接线（响应 meta 透出）归 P2-b。
  // 契约默认（如 GPT Image 2.5 的 quality=high）必须在显式只传部分参数时也生效：
  // 用户显式值覆盖契约默认，而不是「显式传了对象就丢掉所有默认」。
  const merged = {
    ...defaultImageModelOptions(modelId, req.aspectRatio),
    ...(req.modelOptions ?? {}),
  } as ImageModelOptions;
  // 官方没有 quality 参数的模型（gemini / flux / seedream / qwen）不得携带该字段：
  // 旧草稿里的 quality 会在请求体里出现，被上游当成不支持的参数。
  if (!modelSupportsQuality(modelId)) delete merged.quality;
  return merged;
}

function referenceData(req: ImageGenRequest, modelId: ImageModelId): string[] {
  const structuredError = referenceInputsError(req);
  if (structuredError) {
    throw new ProviderError(`参考图契约无效：${structuredError}`, 400, modelId, "invalid_request");
  }
  const refs = referenceDataUrls(req);
  const max = modelMaxReferenceImages(modelId);
  if (refs.length > max) {
    throw new ProviderError(`${modelId} 最多支持 ${max} 张参考图`, 400, modelId, "invalid_request");
  }
  return refs;
}

function parsedReference(dataUrl: string, modelId: ImageModelId): ReturnType<typeof parseDataUrl> {
  try {
    const validated = validateImageDataUrl(dataUrl);
    if (!REFERENCE_MIMES.has(validated.mime)) {
      throw new ProviderError(`${modelId} 仅支持 PNG、JPEG 或 WebP 参考图`, 400, modelId, "invalid_request");
    }
    return {
      mime: validated.mime,
      base64: validated.buffer.toString("base64"),
      buffer: validated.buffer,
    };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(
      `${modelId} 参考图数据无效`,
      400,
      modelId,
      "invalid_request",
      error instanceof Error ? error.message : String(error),
    );
  }
}

function appendImages(form: FormData | import("undici").FormData, refs: string[], modelId: ImageModelId): void {
  const editContract = getImageModelContract(modelId).edit;
  const field = refs.length === 1
    ? editContract.singleImageField
    : editContract.multipleImageField;
  if (!field) {
    throw new ProviderError(`${modelId} 缺少 multipart 图片字段契约`, 500, modelId, "invalid_request");
  }
  refs.forEach((ref, index) => {
    const parsed = parsedReference(ref, modelId);
    const extension = parsed.mime === "image/jpeg" ? "jpg" : parsed.mime.split("/")[1];
    form.append(
      field,
      new Blob([new Uint8Array(parsed.buffer)], { type: parsed.mime }),
      `image-${index + 1}.${extension}`,
    );
  });
}

function upstreamModelId(modelId: ImageModelId): string {
  return getImageModelContract(modelId).upstreamModelId;
}

function resolveContractPath(path: string, modelId: ImageModelId): string {
  return path.replace("{model}", encodeURIComponent(upstreamModelId(modelId)));
}

async function fetchApiyi(
  modelId: ImageModelId,
  path: string,
  initFactory: () => RequestInit,
): Promise<Response> {
  // 熔断：该模型连续瞬时失败时快速失败 30 秒，避免重试风暴（指南「熔断、隔离与降级」）。
  if (!isProviderCallAllowed(modelId)) {
    throw new ProviderError(
      "该模型连续失败，已暂停 30 秒，请稍后再试或切换模型",
      503,
      modelId,
      "gateway_unavailable",
      `circuit_open: ${modelId} temporarily suspended`,
    );
  }
  const timeout = getImageModelContract(modelId).timeoutMs;
  try {
    const response = await fetchWithRetry(
      `${config.gatewayBaseUrl()}${resolveContractPath(path, modelId)}`,
      initFactory,
      {
        providerId: modelId,
        timeoutMs: config.aiTimeoutMs(timeout),
        maxRetries: 0,
        dispatcherFactory: getApiyiDispatcher,
      },
    );
    recordProviderSuccess(modelId);
    return response;
  } catch (error) {
    if (error instanceof ProviderError) {
      // 鉴权/余额/参数/内容等错误说明通道可达，重置连续失败计数。
      if (error.category === "gateway_unavailable" || error.category === "network_error") {
        recordProviderFailure(modelId);
      } else {
        recordProviderReachable(modelId);
      }
    }
    throw error;
  }
}

function providerJsonLimit(expectedImages: number): number {
  const base64BytesPerImage = 4 * Math.ceil(MAX_IMAGE_BYTES / 3);
  return PROVIDER_JSON_OVERHEAD_BYTES + Math.max(1, expectedImages) * base64BytesPerImage;
}

async function readJson(
  response: Response,
  modelId: ImageModelId,
  expectedImages = 1,
): Promise<unknown> {
  try {
    return await readApiyiJsonResponse(response, modelId, {
      maxBytes: providerJsonLimit(expectedImages),
    });
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    const failure = inspectProviderTransportFailure(error);
    throw new ProviderError(
      failure.timedOut
        ? "AI 响应体读取超时，结果可能已经生成；系统不会自动重试"
        : "AI 响应中断或不完整，结果可能已经生成；系统不会自动重试",
      failure.timedOut ? 504 : 502,
      modelId,
      "outcome_unknown",
      failure.diagnostic,
    );
  }
}

async function parseApiyiImageResult(
  response: Response,
  parse: () => Promise<ImageGenResult>,
): Promise<ImageGenResult> {
  const requestId = providerRequestIdFromResponse(response);
  try {
    const result = await parse();
    return requestId ? { ...result, providerRequestId: requestId } : result;
  } catch (error) {
    if (!(error instanceof ProviderError)) throw error;
    const resolvedRequestId = requestId ?? error.requestId;
    if (resolvedRequestId === error.requestId) throw error;
    throw new ProviderError(
      error.message,
      error.status,
      error.providerId,
      error.category,
      error.diagnostic,
      resolvedRequestId,
    );
  }
}

function imageUrl(value: unknown, modelId: ImageModelId, index: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ProviderError("AI 服务返回了无效图片地址", 502, modelId, "invalid_response", `data[${index}].url invalid`);
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("protocol");
  } catch {
    throw new ProviderError("AI 服务返回了无效图片地址", 502, modelId, "invalid_response", `data[${index}].url invalid`);
  }
  return value;
}

async function base64Image(
  value: unknown,
  modelId: ImageModelId,
  mimeHint?: string,
): Promise<string> {
  if (typeof value !== "string" || !value) {
    throw new ProviderError("AI 服务返回了无效图片数据", 502, modelId, "invalid_response");
  }
  try {
    let buffer: Buffer;
    let mime: string;
    if (value.startsWith("data:")) {
      const validated = validateImageDataUrl(value);
      buffer = validated.buffer;
      mime = validated.mime;
    } else {
      buffer = Buffer.from(value, "base64");
      if (!buffer.length || buffer.toString("base64") !== value) {
        throw new ProviderError("AI 服务返回了损坏的图片数据", 502, modelId, "invalid_response");
      }
      if (buffer.byteLength > MAX_IMAGE_BYTES) {
        throw new ProviderError("AI 服务返回图片超过 20MB 上限", 502, modelId, "invalid_response");
      }
      const detected = detectImageMime(buffer);
      if (!detected) {
        throw new ProviderError("AI 服务返回了未知图片格式", 502, modelId, "invalid_response");
      }
      mime = detected;
    }
    if (!REFERENCE_MIMES.has(mime)) {
      throw new ProviderError("AI 服务返回了不支持的图片格式", 502, modelId, "invalid_response");
    }
    if (mimeHint && mime !== mimeHint) {
      throw new ProviderError("AI 服务返回图片的 MIME 与实际格式不一致", 502, modelId, "invalid_response");
    }
    await withImageProcessingSlot(async () => {
      await sharp(buffer, {
        animated: false, failOn: "warning", limitInputPixels: PROVIDER_RESPONSE_PIXEL_LIMIT,
      }).raw().toBuffer();
    });
    return toDataUrl(buffer.toString("base64"), mime);
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(
      "AI 服务返回了损坏的图片数据",
      502,
      modelId,
      "invalid_response",
      `image payload validation failed: ${error instanceof Error ? error.message : String(error)}`.slice(0, 500),
    );
  }
}

function throwEmbeddedError(payload: Record<string, unknown>, modelId: ImageModelId): void {
  if (payload.error === undefined || payload.error === null) return;
  const detail = record(payload.error);
  const message = typeof detail?.message === "string" ? detail.message : "网关图片接口返回错误";
  const rawCode = detail?.code;
  const status = typeof rawCode === "number" ? rawCode : undefined;
  const classifierMessage = typeof rawCode === "string" ? `${rawCode}: ${message}` : message;
  throw providerErrorFromMessage(classifierMessage, modelId, status);
}

interface ParsedOpenAiImages {
  images: string[];
  providerOutputSizes?: Array<string | null>;
}

async function parseOpenAiImageResponse(
  payload: unknown,
  modelId: ImageModelId,
  opts?: { urlOnly?: boolean; maxImages?: number; requireOutputSize?: boolean },
): Promise<ParsedOpenAiImages> {
  const body = record(payload);
  if (!body) throw new ProviderError("AI 服务返回格式无效", 502, modelId, "invalid_response");
  throwEmbeddedError(body, modelId);
  if (!Array.isArray(body.data) || body.data.length === 0) {
    throw new ProviderError("AI 服务未返回图片", 502, modelId, "empty_response");
  }
  if (opts?.maxImages && body.data.length > opts.maxImages) {
    throw new ProviderError("AI 服务返回图片数量超出契约", 502, modelId, "invalid_response");
  }
  const images: string[] = [];
  const providerOutputSizes: Array<string | null> = [];
  for (let index = 0; index < body.data.length; index += 1) {
    const item = record(body.data[index]);
    if (!item) throw new ProviderError("AI 服务返回图片条目无效", 502, modelId, "invalid_response");
    // 兔子API 实测（2026-10-28）：gpt-image-2.6-flare 会同时返回
    // `b64_json: ""`（空串）与真实 `url`。判空必须用「非空字符串」，
    // 否则会拿空串去解码 base64 直接抛错。
    const hasB64 = typeof item.b64_json === "string" && item.b64_json.length > 0;
    const hasUrl = typeof item.url === "string" && item.url.trim().length > 0;
    if (!opts?.urlOnly && hasB64) images.push(await base64Image(item.b64_json, modelId));
    else if (hasUrl) images.push(imageUrl(item.url, modelId, index));
    else throw new ProviderError("AI 服务返回图片字段无效", 502, modelId, "invalid_response");
    if (opts?.requireOutputSize) {
      if (typeof item.size !== "string" || !/^[1-9]\d{1,4}x[1-9]\d{1,4}$/.test(item.size)) {
        throw new ProviderError(
          "AI 服务未返回可记录的实际图片尺寸",
          502, modelId, "invalid_response", `data[${index}].size invalid`,
        );
      }
      providerOutputSizes.push(item.size);
    }
  }
  return { images, providerOutputSizes: opts?.requireOutputSize ? providerOutputSizes : undefined };
}

async function parseOpenAiImages(
  payload: unknown,
  modelId: ImageModelId,
  opts?: { urlOnly?: boolean; maxImages?: number },
): Promise<string[]> {
  return (await parseOpenAiImageResponse(payload, modelId, opts)).images;
}

async function parseGeminiImages(payload: unknown, modelId: ImageModelId): Promise<string[]> {
  const body = record(payload);
  if (!body) throw new ProviderError("Gemini 响应格式无效", 502, modelId, "invalid_response");
  throwEmbeddedError(body, modelId);
  const candidates = Array.isArray(body.candidates) ? body.candidates : [];
  const images: string[] = [];
  const finishReasons: string[] = [];
  for (const candidateValue of candidates) {
    const candidate = record(candidateValue);
    if (!candidate) continue;
    if (typeof candidate.finishReason === "string") finishReasons.push(candidate.finishReason);
    const content = record(candidate.content);
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    for (const partValue of parts) {
      const part = record(partValue);
      // 兔子API 返回 snake_case（inline_data / mime_type）；兼容 网关 的 camelCase。
      const inline = record(part?.inline_data ?? part?.inlineData);
      if (inline && inline.data !== undefined) {
        const rawMime = inline.mime_type ?? inline.mimeType;
        const mime = rawMime === "image/jpeg" ? "image/jpeg" : rawMime === "image/png" ? "image/png" : undefined;
        if (!mime) throw new ProviderError("Gemini 返回了不支持的图片格式", 502, modelId, "invalid_response");
        images.push(await base64Image(inline.data, modelId, mime));
        continue;
      }
      // gemini-nano-banana-2.1 等模型走「文件引用」形态：返回 fileData.fileUri（临时 URL），
      // 不是内联 base64。实测（2026-10-28）该模型固定走这条路径，必须支持。
      const fileData = record(part?.file_data ?? part?.fileData);
      const fileUri = fileData?.file_uri ?? fileData?.fileUri;
      if (typeof fileUri === "string" && fileUri.trim()) {
        images.push(imageUrl(fileUri, modelId, images.length));
      }
    }
  }
  if (!images.length) {
    const refused = finishReasons.some((reason) => /safety|block|prohibited/i.test(reason));
    throw new ProviderError(
      refused ? "本次请求未通过 AI 安全审核，请调整提示词或参考图片后重试" : "AI 服务未返回图片",
      502, modelId, refused ? "content_refused" : "empty_response",
      `finishReasons=${finishReasons.join(",")}`,
    );
  }
  return images;
}

/**
 * 兔子API 的 Gemini 端点用 snake_case（`inline_data` / `mime_type`），
 * 与 网关 的 `inlineData` / `mimeType` 不同（兔子文档 360926406e0 明示）。
 * 响应侧兼容两种写法以容忍网关差异。
 */
/**
 * 组装 Gemini 原生请求的 parts。
 *
 * 用户 2026-10-28 反馈：谷歌两个模型把参考图顺序搞反。根因是原实现把提示词放在最前、
 * 图片统一跟在后面，Gemini 无法把「参考图1/参考图2」的文字编号和后续图片一一绑定。
 * 现按谷歌官方图文编辑的形态改：**图片在前、提示词在后**，且每张图前插一条
 * 「参考图N：」文字，把编号和图片就地绑死；提示词里的图号与它一一对应。
 */
/** 与 referenceDataUrls 同序的角色列表（旧数组通道没有角色 → 全 undefined）。 */
function referenceRoles(req: ImageGenRequest): Array<string | undefined> {
  const structured = orderedReferenceInputs(req);
  return structured.length > 0 ? structured.map((reference) => reference.role) : [];
}

function geminiParts(
  prompt: string,
  images: ReadonlyArray<{ inline_data: { mime_type: string; data: string } }>,
  roles: ReadonlyArray<string | undefined> = [],
): Array<Record<string, unknown>> {
  const parts: Array<Record<string, unknown>> = [];
  images.forEach((image, index) => {
    // 角色（服装/模特…）与编号贴在同一处：模型不必只靠数组顺序推算"哪张是什么"。
    const role = roles[index];
    parts.push({ text: role ? `参考图${index + 1}（${role}）：` : `参考图${index + 1}：` });
    parts.push(image);
  });
  parts.push({ text: prompt });
  return parts;
}

async function geminiInlineData(dataUrl: string, modelId: ImageModelId): Promise<{ inline_data: { mime_type: string; data: string } }> {
  const parsed = parsedReference(dataUrl, modelId);
  if (parsed.mime === "image/png" || parsed.mime === "image/jpeg") {
    return { inline_data: { mime_type: parsed.mime, data: parsed.base64 } };
  }
  const converted = await withImageProcessingSlot(() => sharp(parsed.buffer).png().toBuffer());
  return { inline_data: { mime_type: "image/png", data: converted.toString("base64") } };
}

export async function validateApiyiRequest(
  modelId: ImageModelId,
  req: ImageGenRequest,
  mode: ImageOperationMode,
): Promise<void> {
  if (!req.prompt.trim()) throw new ProviderError("提示词不能为空", 400, modelId, "invalid_request");
  if (mode !== req.operationMode) {
    throw new ProviderError("显式 operationMode 与 Provider 调用方法不一致", 400, modelId, "invalid_request");
  }
  if (req.operationMode === "mask-edit" && modelId !== MASK_REDRAW_MODEL_ID) {
    throw new ProviderError(`${modelId} 不支持 mask-edit 模式`, 400, modelId, "invalid_request");
  }
  // 2026-10-28 实测：gpt-image-2.6-sunburst 同样支持 generate / edit，
  // 不再强制只能走 mask-edit（旧约束来自 网关 时代，已失效）。
  requestOptions(modelId, req);
  const refs = referenceData(req, modelId);
  if (mode !== "generate" && refs.length === 0) {
    throw new ProviderError("编辑模式至少需要一张参考图", 400, modelId, "invalid_request");
  }
  if (mode === "generate" && refs.length > 0) {
    throw new ProviderError("文生图请求不能包含参考图", 400, modelId, "invalid_request");
  }
  refs.forEach((ref) => parsedReference(ref, modelId));
  if (modelId === MASK_REDRAW_MODEL_ID) {
    // mask-edit 必须带蒙版；generate / edit 允许不带蒙版。
    if (mode === "mask-edit") {
      if (!req.mask) {
        throw new ProviderError("局部修改必须提供 PNG 蒙版", 400, modelId, "invalid_request");
      }
      await validateMaskForSource(refs[0], req.mask, modelId);
    } else if (req.mask) {
      await validateMaskForSource(refs[0], req.mask, modelId);
    }
  } else if (req.mask) {
    throw new ProviderError(`${modelId} 不支持蒙版参数`, 400, modelId, "invalid_request");
  }
}

/**
 * 兔子API 请求体构造：按模型族分流。
 * 依据 28 份 OpenAPI 规范页（2026-10-27），事实口径见
 * /tmp/provider_probe/docs 与协议盘点文档。
 * - Gemini 系：原生端点 + contents[].parts[]（inline_data snake_case）
 * - flux-3-image：aspect_ratio（不是 size / width / height）
 * - GPT Image 2.5 / Seedream / Qwen：OpenAI images 标准字段
 */
function isGeminiFamily(modelId: ImageModelId): boolean {
  return modelId === "gemini-nano-banana-2.1" || modelId === "gemini-3.1-flash-image";
}

// ---------- Gemini 异步图片任务（POST /v1/videos + GET /v1/videos/{task_id}）----------

/**
 * 异步端点不认 aspect_ratio（实测 400 unsupported_async_image_field），只认 size=WxH。
 * 这里复用与 VIP 模型同一套「档位 × 画幅 → 像素」换算，保证面板上的画幅/分辨率
 * 在切异步后仍然生效；上游会把请求尺寸等比放大（如 1536x2048 → 1792x2400），
 * 但比例保持，不影响构图。
 */
function asyncImageSize(options: ImageModelOptions): string {
  const ratio = typeof options.aspectRatio === "string"
    && /^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(options.aspectRatio)
    ? options.aspectRatio
    : "1:1";
  const requested = String(options.imageSize ?? "2K");
  const tier: ResolutionTier = (RESOLUTION_TIERS as readonly string[]).includes(requested)
    ? requested as ResolutionTier
    : "2K";
  const { width, height } = resolutionDimensions(tier, ratio);
  return `${width}x${height}`;
}

/**
 * 原生 generateContent 通道用 parts 把「参考图N（角色）」文字贴在每张图前；
 * 异步端点只接受 images 数组 + 单个 prompt，无法交错。冻结协议里大量使用
 * 「参考图1=服装 / 参考图2=模特」这类编号，因此必须在提示词开头把编号顺序
 * 与角色显式写清，否则换装会把服装和模特搞反。
 */
function asyncReferencePrefix(req: ImageGenRequest, refs: readonly string[]): string {
  if (refs.length === 0) return "";
  const roles = orderedReferenceInputs(req).map((reference) => reference.role);
  const numbered = refs.map((_ref, index) => `参考图${index + 1}`).join("、");
  const lines = [`参考图按上传顺序依次编号：${numbered}（图片顺序与编号一一对应）。`];
  const mapping = refs
    .map((_ref, index) => (roles[index] ? `参考图${index + 1}=${roles[index]}` : null))
    .filter((entry): entry is string => entry !== null);
  if (mapping.length > 0) lines.push(`参考图对应：${mapping.join("，")}。`);
  return `${lines.join("\n")}\n\n`;
}

/** 异步端点的 images 收 data URL；WebP 需先转 PNG（与原生通道一致）。 */
async function asyncReferenceDataUrl(dataUrl: string, modelId: ImageModelId): Promise<string> {
  const parsed = parsedReference(dataUrl, modelId);
  if (parsed.mime === "image/png" || parsed.mime === "image/jpeg") {
    return `data:${parsed.mime};base64,${parsed.base64}`;
  }
  const converted = await withImageProcessingSlot(() => sharp(parsed.buffer).png().toBuffer());
  return toDataUrl(converted.toString("base64"), "image/png");
}

/**
 * 只允许「提交阶段明确的参数类 4xx」回退同步端点：这类请求没有建立任务、不会计费。
 * 5xx / 网络中断 / 已拿到 task_id 之后的任何错误一律不回退（可能已出图，重发会重复扣费）。
 */
function isAsyncSubmitRejection(error: unknown): error is AsyncImageSubmitError {
  return error instanceof AsyncImageSubmitError
    && typeof error.status === "number"
    && error.status >= 400 && error.status < 500
    && error.status !== 429
    && error.category !== "gateway_authentication"
    && error.category !== "account_credit";
}

async function geminiAsyncResult(
  modelId: ImageModelId,
  req: ImageGenRequest,
  refs: string[],
  options: ImageModelOptions,
): Promise<ImageGenResult> {
  const body: AsyncImageSubmitBody = {
    model: upstreamModelId(modelId),
    prompt: `${asyncReferencePrefix(req, refs)}${req.prompt}`,
    response_format: "url",
    size: asyncImageSize(options),
  };
  if (refs.length > 0) {
    body.images = await Promise.all(refs.map((ref) => asyncReferenceDataUrl(ref, modelId)));
  }
  const result = await runAsyncImageTask(modelId, body);
  return {
    images: result.urls.map((url, index) => imageUrl(url, modelId, index)),
    model: modelId,
    // task_id 是异步任务的唯一凭据；失败时由 worker 存进 provider_request_id 供找回。
    providerRequestId: result.taskId,
  };
}

/** 统一的 Gemini 分流：默认异步，提交被明确拒绝或开关关闭时走原生同步端点。 */
async function geminiResult(
  modelId: ImageModelId,
  req: ImageGenRequest,
  refs: string[],
  options: ImageModelOptions,
  sync: () => Promise<ImageGenResult>,
): Promise<ImageGenResult> {
  if (!config.geminiAsyncEnabled()) return sync();
  try {
    return await geminiAsyncResult(modelId, req, refs, options);
  } catch (error) {
    if (!isAsyncSubmitRejection(error)) throw error;
    console.warn("[gemini-async-fallback]", JSON.stringify({
      providerId: modelId,
      status: error.status,
      category: error.category,
      diagnostic: (error.diagnostic ?? "").slice(0, 200),
    }));
    return sync();
  }
}

function isSeedreamFamily(modelId: ImageModelId): boolean {
  return modelId === "doubao-seedream-5-0-pro-260628" || modelId === "doubao-seedream-5-0-lite-260128";
}

/**
 * Seedream / Qwen 的「图生图编辑」在兔子 API 上不是 multipart /v1/images/edits，
 * 而是向 /v1/images/generations 发 JSON、把参考图放进 image 数组（文档 349741169 / 498659603）。
 */
function isJsonImageEditFamily(modelId: ImageModelId): boolean {
  return isSeedreamFamily(modelId)
    || modelId === "qwen-image-3.0-pro"
    || modelId === "qwen-image-3.0";
}

/**
 * flux-3-image 的参考图请求体（2026-10-28 实测确定）。
 *
 * 兔子原生通道 /flux/v1/flux-3-image 对 aspect_ratio / images / input_image / image
 * 等字段一律 400（不是 supported by this FLUX endpoint），只能纯文生图；
 * multipart /v1/images/edits 塞同名 image 多张时参考图被整体丢弃（成片等于没参考）。
 * 唯一可用形态：POST /v1/images/generations（JSON），参考图按
 * input_image、input_image_2 … input_image_N 逐字段命名。
 */
function buildFluxReferenceBody(
  modelId: ImageModelId,
  prompt: string,
  options: ImageModelOptions,
  refs: string[] = [],
): Record<string, unknown> {
  const body: Record<string, unknown> = { model: upstreamModelId(modelId), prompt };
  if (options.aspect_ratio !== undefined) body.aspect_ratio = String(options.aspect_ratio);
  if (options.resolution !== undefined) body.resolution = String(options.resolution);
  if (options.output_format !== undefined) body.output_format = String(options.output_format);
  if (options.safety_tolerance !== undefined) body.safety_tolerance = options.safety_tolerance;
  if (options.prompt_upsampling !== undefined) body.prompt_upsampling = options.prompt_upsampling;
  refs.forEach((ref, index) => {
    body[index === 0 ? "input_image" : `input_image_${index + 1}`] = ref;
  });
  return body;
}

function isFluxFamily(modelId: ImageModelId): boolean {
  return modelId === "flux-3-image";
}

function buildOpenAiImageBody(
  modelId: ImageModelId,
  prompt: string,
  options: ImageModelOptions,
  refs: string[] = [],
): Record<string, unknown> {
  const base: Record<string, unknown> = { model: upstreamModelId(modelId), prompt };
  if (modelId === "flux-3-image") {
    // flux-3-image：aspect_ratio / resolution，参考图用 input_image*（不再是 multipart）。
    return buildFluxReferenceBody(modelId, prompt, options, refs);
  }
  if (options.size !== undefined) base.size = String(options.size);
  if (options.quality !== undefined) base.quality = String(options.quality);
  if (options.response_format !== undefined) base.response_format = String(options.response_format);
  if (options.seed !== undefined) base.seed = options.seed;
  if (options.guidance_scale !== undefined) base.guidance_scale = options.guidance_scale;
  if (isSeedreamFamily(modelId)) {
    // 即梦产品策略：固定不带水印（文档 349741169）。
    // 2026-10-28 实测更正：seedream 5.0 pro/lite 已不支持 sequential_image_generation，
    // 带上它会直接 400（"not supported by the current model"）→ 生图 0 秒失败。
    // 该字段只在 seedream 4.x 需要，5.0 必须省略。
    base.watermark = false;
  }
  // 兔子 /v1/images/generations 亦接受 image[]（url 或 base64）——文生图带图时直接传。
  if (refs.length > 0) base.image = refs;
  return base;
}

async function generate(modelId: ImageModelId, req: ImageGenRequest): Promise<ImageGenResult> {
  if (req.operationMode !== "generate") {
    throw new ProviderError("Provider generate 只接受 generate 模式", 400, modelId, "invalid_request");
  }
  await validateApiyiRequest(modelId, req, req.operationMode);
  const contract = getImageModelContract(modelId);
  if (!contract.generation) throw new ProviderError(`${modelId} 不支持文生图`, 400, modelId, "invalid_request");
  // 捕获到局部常量：回退分支是闭包，TS 不会把可空属性收窄带进闭包。
  const generationPath = contract.generation.path;
  const options = requestOptions(modelId, req);

  if (isGeminiFamily(modelId)) {
    // 2026-11-10：两个 Gemini 图片模型改走异步任务（约 20–30s），原生长连接保留为回退。
    return geminiResult(modelId, req, [], options, async () => {
      const response = await fetchApiyi(modelId, generationPath, () => ({
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.gatewayApiKey()}` },
        body: JSON.stringify({
          contents: [{ parts: geminiParts(req.prompt, []) }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio: options.aspectRatio, imageSize: options.imageSize },
          },
        }),
      }));
      return parseApiyiImageResult(response, async () => ({
        images: await parseGeminiImages(await readJson(response, modelId), modelId),
        model: modelId,
      }));
    });
  }

  const response = await fetchApiyi(modelId, contract.generation.path, () => ({
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.gatewayApiKey()}` },
    body: JSON.stringify(buildOpenAiImageBody(modelId, req.prompt, options)),
  }));
  return parseApiyiImageResult(response, async () => {
    // Seedream 响应带实际输出尺寸（data[].size），产品记录用于画幅审计。
    const parsed = await parseOpenAiImageResponse(
      await readJson(response, modelId),
      modelId,
      isSeedreamFamily(modelId) ? { maxImages: 1, requireOutputSize: true } : { maxImages: 1 },
    );
    return { ...parsed, model: modelId };
  });
}

async function edit(modelId: ImageModelId, req: ImageGenRequest): Promise<ImageGenResult> {
  if (req.operationMode === "generate") {
    throw new ProviderError("Provider edit 只接受 edit 或 mask-edit 模式", 400, modelId, "invalid_request");
  }
  await validateApiyiRequest(modelId, req, req.operationMode);
  const contract = getImageModelContract(modelId);
  const options = requestOptions(modelId, req);
  const refs = referenceData(req, modelId);

  if (isGeminiFamily(modelId)) {
    return geminiResult(modelId, req, refs, options, async () => {
      const imageParts = await Promise.all(refs.map((ref) => geminiInlineData(ref, modelId)));
      const parts = geminiParts(req.prompt, imageParts, referenceRoles(req));
      const response = await fetchApiyi(modelId, contract.edit.path, () => ({
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.gatewayApiKey()}` },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio: options.aspectRatio, imageSize: options.imageSize },
          },
        }),
      }));
      return parseApiyiImageResult(response, async () => ({
        images: await parseGeminiImages(await readJson(response, modelId), modelId),
        model: modelId,
      }));
    });
  }

  if (isFluxFamily(modelId)) {
    // 参考图走 input_image / input_image_2 …（见 buildFluxReferenceBody 注释）。
    const fluxResponse = await fetchApiyi(modelId, contract.edit.path, () => ({
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.gatewayApiKey()}` },
      body: JSON.stringify(buildFluxReferenceBody(modelId, req.prompt, options, refs)),
    }));
    return parseApiyiImageResult(fluxResponse, async () => {
      const parsed = await parseOpenAiImageResponse(await readJson(fluxResponse, modelId), modelId, { maxImages: 1 });
      return { ...parsed, model: modelId };
    });
  }

  if (isJsonImageEditFamily(modelId)) {
    // Seedream / Qwen：参考图编辑 = JSON generations + image 数组（不是 multipart edits）。
    const jsonResponse = await fetchApiyi(modelId, contract.edit.path, () => ({
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.gatewayApiKey()}` },
      body: JSON.stringify(buildOpenAiImageBody(modelId, req.prompt, options, refs)),
    }));
    return parseApiyiImageResult(jsonResponse, async () => {
      const parsed = await parseOpenAiImageResponse(
        await readJson(jsonResponse, modelId),
        modelId,
        isSeedreamFamily(modelId) ? { maxImages: 1, requireOutputSize: true } : { maxImages: 1 },
      );
      return { ...parsed, model: modelId };
    });
  }

  const response = await fetchApiyi(modelId, contract.edit.path, () => {
    const form = new UndiciFormData();
    form.append("model", upstreamModelId(modelId));
    form.append("prompt", req.prompt);
    // 兔子API：仅在有值时上报，String(undefined) 会写出字面量 "undefined" 触发上游 4xx。
    if (options.size !== undefined) form.append("size", String(options.size));
    if (options.quality !== undefined) form.append("quality", String(options.quality));
    if (options.response_format !== undefined) form.append("response_format", String(options.response_format));
    if (options.aspect_ratio !== undefined) form.append("aspect_ratio", String(options.aspect_ratio));
    appendImages(form, refs, modelId);
    if (req.mask) {
      const mask = parseDataUrl(req.mask);
      form.append("mask", new Blob([new Uint8Array(mask.buffer)], { type: "image/png" }), "mask.png");
    }
    return { method: "POST", headers: { Authorization: `Bearer ${config.gatewayApiKey()}` }, body: form } as unknown as RequestInit;
  });
  return parseApiyiImageResult(response, async () => {
    const parsed = await parseOpenAiImageResponse(await readJson(response, modelId), modelId, { maxImages: 1 });
    return { ...parsed, model: modelId };
  });
}

export function createGatewayProvider(modelId: ImageModelId): AIProvider {
  return {
    id: modelId,
    validate: (req, mode) => validateApiyiRequest(modelId, req, mode),
    generate: (req) => generate(modelId, req),
    edit: (req) => edit(modelId, req),
  };
}

export const gatewayProviders = Object.fromEntries(
  ([
    "gemini-nano-banana-2.1", "gemini-3.1-flash-image",
    "gpt-image-2.6-sunburst", "gpt-image-2.6-flare",
    "flux-3-image",
    "doubao-seedream-5-0-pro-260628", "doubao-seedream-5-0-lite-260128",
    "qwen-image-3.0-pro", "qwen-image-3.0",
  ] as const).map((modelId) => [modelId, createGatewayProvider(modelId)]),
) as Record<ImageModelId, AIProvider>;
