/**
 * 执行步骤执行器：把单个 NodeExecution 逐步执行并调用 Provider。
 * 运行队列与事件持久化已迁移到 runQueue/（PostgreSQL 持久队列）；本文件只保留
 * executeStep 及其纯执行辅助函数（参考图解析、Provider 请求、后处理）。
 *
 * v7 三基础节点模型（R-53）：executeStep 收敛为 text / image / video 三分支。
 * - text：同步 chat completions（Q1=B），结果写 outputText（runtime.md §1b）。
 * - image：统一生成路径，operationMode 由提示词变体携带，蒙版由 needsMask 驱动。
 * - video：异步任务路径（submit + poll），Provider 实现归 P2-e。
 */
import { createHash } from "node:crypto";
import {
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
  type AIProvider,
  type ImageGenRequest,
  type ImageOperationMode,
  type NodeExecution,
  type NodeRunStatus,
  type ReferenceImageInput,
  type ReferenceImageSource,
} from "../../src/types/workflow";
import { getProvider } from "../providers";
import { ProviderError, publicProviderErrorMessage, toDataUrl } from "../providers/base";
import { generateExactImages } from "../providers/exact";
import { getTextProvider, type TextProvider } from "../providers/textProvider";
import { normalizeImageRef } from "../lib/fileStore";
import {
  isLocalImageReference,
  isRemoteImageReference,
  validateImageDataUrl,
} from "../lib/imageValidation";
import { REMOTE_IMAGE_REFERENCE_MESSAGE } from "../lib/imageReferenceAccess";
import { normalizeUploadImageDataUrl } from "../lib/uploadImageNormalization";
import { query } from "../lib/database";
import {
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
  type ImageModelOptions,
} from "../../src/types/imageModels";
import { DEFAULT_TEXT_MODEL_ID, isTextModelId, type TextModelOptions } from "../../src/types/textModels";
import { getGarmentPromptVariantById } from "../../src/lib/garmentPromptPresets";
import { compositeMaskedEdit, prepareMaskForGeneration, resolveMaskFeatherRadius } from "../lib/maskProcessing";
import { renderProviderPrompt, type ProviderPromptReference } from "../../src/lib/providerPromptRenderer";
import { postProcessGeneratedOutputImages } from "./runnerOutputProcessing";

export { postProcessGeneratedOutputImages } from "./runnerOutputProcessing";

/** text 节点正文与 outputText 的长度上限（runtime.md §1b / data-model.md §3）。 */
export const MAX_TEXT_LENGTH = 20_000;

export interface RunFailure {
  prompt?: string;
  error: string;
}

interface RunEventMeta {
  /** Run 内单调递增事件序号，供 SSE 重连去重。 */
  seq?: number;
  error?: string;
  model?: string;
  /** 每张成功图片对应的实际提示词；顺序与 images 一致。 */
  prompts?: string[];
  /** 上游声明的逐图实际输出尺寸；顺序与 images 一致。 */
  providerOutputSizes?: Array<string | null>;
  failures?: RunFailure[];
  startedAt?: number;
  finishedAt?: number;
  /** R5 参数 warning（不阻断，前端展示）。 */
  parameterWarnings?: string[];
}

export type RunEvent =
  | (RunEventMeta & {
      type: "node-status";
      nodeId: string;
      status: Exclude<NodeRunStatus, "success" | "error" | "idle">;
      images?: never;
    })
  | (RunEventMeta & {
      type: "node-status";
      nodeId: string;
      status: "success";
      images: string[];
    })
  | (Omit<RunEventMeta, "error"> & {
      type: "node-status";
      nodeId: string;
      status: "error";
      error: string;
      images?: never;
    })
  | { seq?: number; type: "done" }
  | { seq?: number; type: "run-error"; nodeId?: string; error: string; finishedAt?: number };

export interface StepResult {
  images: string[];
  /** 业务补边/缩放/WebP 转换前的 Provider 原图。 */
  providerImages?: string[];
  /** 实际发给 Provider 的参考图证据。 */
  references?: ReferenceImageInput[];
  model?: string;
  prompts?: string[];
  providerOutputSizes?: Array<string | null> | undefined;
  failures?: RunFailure[];
  providerRequests: number;
  /** text 节点的运行结果（展示态，不覆盖 data.text；runtime.md §1b）。 */
  outputText?: string;
  /** text 节点的输入快照（可追溯）。 */
  lastRunInput?: string;
  /** outputText 是否因超长被截断。 */
  truncated?: boolean;
}

export type ProviderResolver = (id: string) => AIProvider;
export type TextProviderResolver = (id: string) => TextProvider;

export interface ExecuteStepOptions {
  runId?: string;
  beforeProviderCall?: (
    providerRequest: number,
    request: ImageGenRequest,
  ) => void | Promise<void>;
  onProviderCallError?: (artifact: {
    providerRequest: number;
    request: ImageGenRequest;
    error: unknown;
  }) => void | Promise<void>;
  /** 运行时与 inputImages 对齐的角色快照。 */
  referenceSources?: ReferenceImageSource[];
  /** 与 inputImages 同序的上游 Provider 原图；非 Provider 输入可为空。 */
  inputProviderImages?: Array<string | undefined>;
  /** Provider 返回后、任何合成或业务后处理前立即保存原始产物。 */
  captureProviderImages?: (artifact: {
    providerRequest: number;
    request: ImageGenRequest;
    images: string[];
    model: string;
    prompt: string;
    providerOutputSizes?: Array<string | null>;
    providerRequestId?: string;
  }) => Promise<string[]>;
  /** text 节点 Provider 解析器（测试注入用）；缺省走 getTextProvider。 */
  resolveTextProvider?: TextProviderResolver;
}

function fallbackReferenceSources(step: NodeExecution, inputImages: string[]): ReferenceImageSource[] {
  if (step.inputReferences !== undefined) {
    if (step.inputReferences.length !== inputImages.length) {
      throw new Error(`Node ${step.nodeId} reference snapshot length does not match inputImages`);
    }
    step.inputReferences.forEach((reference, index) => {
      if (reference.imageRef !== inputImages[index]) {
        throw new Error(`Node ${step.nodeId} reference snapshot imageRef does not match inputImages[${index}]`);
      }
    });
    return step.inputReferences.map((reference) => ({ ...reference }));
  }
  return inputImages.map((imageRef, order) => ({
    imageRef,
    order,
  }));
}

function assetSha256(dataUrl: string): string {
  const image = validateImageDataUrl(dataUrl);
  return createHash("sha256").update(image.buffer).digest("hex");
}

function assertContiguousReferenceSourceOrder(sources: readonly ReferenceImageSource[]): void {
  sources.forEach((source, index) => {
    if (!Number.isSafeInteger(source?.order) || source.order !== index) {
      throw new Error(`referenceSources[${index}].order must be a safe integer equal to ${index}`);
    }
  });
}

function assertReferenceSourcesMatchImages(
  sources: readonly ReferenceImageSource[],
  inputImages: readonly string[],
  nodeId: string,
): void {
  if (sources.length !== inputImages.length) {
    throw new Error(`Node ${nodeId} runtime reference source length does not match inputImages`);
  }
  assertContiguousReferenceSourceOrder(sources);
  sources.forEach((source, index) => {
    if (source.imageRef !== inputImages[index]) {
      throw new Error(`Node ${nodeId} runtime reference imageRef does not match inputImages[${index}]`);
    }
  });
}

function assertNoRemoteWorkerReferenceValues(values: readonly unknown[]): void {
  if (values.some(isRemoteImageReference)) {
    throw new Error(REMOTE_IMAGE_REFERENCE_MESSAGE);
  }
}

function assertNoRemoteWorkerReferences(step: NodeExecution, inputImages: readonly string[]): void {
  assertNoRemoteWorkerReferenceValues([
    ...inputImages,
    step.kind === "image" && typeof step.params.mask === "string" ? step.params.mask : undefined,
  ]);
}

function inputTextsOf(step: NodeExecution): string[] {
  return Array.isArray(step.params.inputTexts)
    ? step.params.inputTexts.filter((value): value is string => typeof value === "string")
    : [];
}

export async function resolveReferenceInputs(
  sources: ReferenceImageSource[],
): Promise<ReferenceImageInput[]> {
  // Validate the durable ordering before resolving a local reference or
  // decoding image bytes. Never repair a damaged snapshot by array position.
  assertContiguousReferenceSourceOrder(sources);
  assertNoRemoteWorkerReferenceValues(sources.map((source) => source.imageRef));
  const dataUrls = await resolveImageRefs(sources.map((source) => source.imageRef));
  return sources.map((source) => {
    const dataUrl = dataUrls[source.order];
    if (!dataUrl) throw new Error(`referenceSources[${source.order}] did not resolve to an image`);
    return {
      dataUrl,
      order: source.order,
      assetSha256: assetSha256(dataUrl),
      ...(source.sourceNodeId ? { sourceNodeId: source.sourceNodeId } : {}),
    };
  });
}

async function executeTextStep(
  step: NodeExecution,
  resolveTextProvider: TextProviderResolver,
): Promise<StepResult> {
  const promptVariantId = typeof step.params.promptVariantId === "string" ? step.params.promptVariantId : undefined;
  if (!promptVariantId) {
    throw new Error("先在悬浮窗口选择功能");
  }
  const modelId = isTextModelId(step.params.modelId) ? step.params.modelId : DEFAULT_TEXT_MODEL_ID;
  // runtime.md §1b 第 1 步：上游 text 正文（按边顺序，一律取已采纳 data.text）+ 自身正文。
  const ownText = typeof step.params.text === "string" ? step.params.text : "";
  const input = [...inputTextsOf(step), ownText].filter((text) => text.trim() !== "").join("\n\n");
  if (!input.trim()) {
    throw new Error("文本节点没有可发送的提示词");
  }
  const provider = resolveTextProvider(modelId);
  const result = await provider.complete({
    input,
    promptVariantId,
    modelId,
    modelOptions: step.params.modelOptions as TextModelOptions | undefined,
    ...(typeof step.params.contractHash === "string"
      ? { contractHash: step.params.contractHash as `sha256:${string}` }
      : {}),
    ...(typeof step.params.evaluationVersion === "string"
      ? { evaluationVersion: step.params.evaluationVersion }
      : {}),
  });
  if (result.status === "failed") {
    throw new Error(result.error);
  }
  const truncated = result.text.length > MAX_TEXT_LENGTH;
  const outputText = truncated ? result.text.slice(0, MAX_TEXT_LENGTH) : result.text;
  return {
    images: [],
    outputText,
    lastRunInput: input,
    truncated,
    model: modelId,
    providerRequests: 1,
  };
}

async function executeImageStep(
  step: NodeExecution,
  inputImages: string[],
  resolveProvider: ProviderResolver,
  options: ExecuteStepOptions,
): Promise<StepResult> {
  const modelId = step.params.modelId;
  if (!isImageModelId(modelId)) {
    throw new Error(`Node ${step.nodeId} must select an explicit supported image model`);
  }
  if (!isModelAllowedForNode(modelId, step.kind)) {
    throw new Error(`Model ${modelId} is not allowed for node ${step.nodeId}`);
  }
  const promptVariantId = typeof step.params.promptVariantId === "string" ? step.params.promptVariantId : undefined;
  const variant = promptVariantId ? getGarmentPromptVariantById(promptVariantId) : undefined;
  if (!variant) {
    throw new Error(`Node ${step.nodeId} 没有绑定当前版本的提示词变体`);
  }
  // operationMode 由提示词变体携带（runtime.md §1）；needsMask 由 mask-edit 模式驱动（P2-d 显式化 needsMask 字段）。
  const operationMode: ImageOperationMode = variant.mode;
  const needsMask = operationMode === "mask-edit";
  // runtime.md §1 第 3 步：taskPrompt = variant.fullPrompt + "\n\n" + userPrompt（不再走 buildGarmentPrompt 包装）。
  // userPrompt：DAG 路径取上游 text 正文；直接生成路径（无 text 上游）回退到 params.prompt。
  const inputTexts = inputTextsOf(step);
  const userPrompt = inputTexts.length > 0
    ? inputTexts.join("\n\n")
    : (typeof step.params.prompt === "string" ? step.params.prompt : "");
  const taskPrompt = `${variant.fullPrompt}\n\n${userPrompt}`.trim();

  const inputReferenceSources = options.referenceSources !== undefined
    ? options.referenceSources.map((reference) => ({ ...reference }))
    : fallbackReferenceSources(step, inputImages);
  assertReferenceSourcesMatchImages(inputReferenceSources, inputImages, step.nodeId);
  const references = await resolveReferenceInputs(inputReferenceSources);
  const promptReferences: ProviderPromptReference[] = references.map(() => ({}));
  const referenceImages = references.map((reference) => reference.dataUrl);
  const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(modelId));
  const maxUserReferences = needsMask
    ? Math.min(MAX_MASK_USER_REFERENCE_IMAGES, Math.max(0, maxReferences - 1))
    : maxReferences;
  if (referenceImages.length > maxUserReferences) {
    throw new Error(`Node ${step.nodeId} accepts at most ${maxUserReferences} user reference images for ${modelId}`);
  }

  // 蒙版（needsMask 变体；maskSourceRef 必须等于第一条图片入边当前引用）。
  const maskReference = needsMask ? step.params.mask : undefined;
  if (needsMask && (typeof maskReference !== "string" || !maskReference)) {
    throw new Error("局部修改必须先保存 PNG 蒙版");
  }
  if (needsMask && (typeof step.params.maskSourceRef !== "string" || step.params.maskSourceRef !== inputImages[0])) {
    throw new Error("蒙版对应的原图已变化，请重新绘制蒙版");
  }
  const mask = typeof maskReference === "string" ? await normalizeImageRef(maskReference) : undefined;
  const maskFeatherRadius = needsMask ? resolveMaskFeatherRadius(step.params.featherRadius) : undefined;
  const preparedMask = needsMask
    ? await prepareMaskForGeneration(referenceImages[0], mask!, { featherRadius: maskFeatherRadius })
    : undefined;
  const providerMask = preparedMask?.mask ?? mask;
  const providerReferences = preparedMask
    ? [
        references[0],
        ...references.slice(1),
        {
          dataUrl: preparedMask.guide,
          order: references.length,
          assetSha256: assetSha256(preparedMask.guide),
          sourceNodeId: `${step.nodeId}:mask-guide`,
        },
      ]
    : references;
  const providerReferenceImages = providerReferences.map((reference) => reference.dataUrl);

  const prompt = renderProviderPrompt({
    nodeKind: "image",
    modelId,
    operationMode,
    taskPrompt,
    references: promptReferences,
    needsMask,
  });

  const request: ImageGenRequest = {
    prompt,
    operationMode,
    promptVariantId,
    ...(typeof step.params.promptFamilyId === "string" ? { promptFamilyId: step.params.promptFamilyId } : {}),
    ...(typeof step.params.parameterProfileId === "string" ? { parameterProfileId: step.params.parameterProfileId } : {}),
    ...(typeof step.params.contractHash === "string"
      ? { contractHash: step.params.contractHash as `sha256:${string}` }
      : {}),
    ...(typeof step.params.evaluationVersion === "string" ? { evaluationVersion: step.params.evaluationVersion } : {}),
    ...(typeof step.params.postprocessVersion === "string" ? { postprocessVersion: step.params.postprocessVersion } : {}),
    references: providerReferences.length ? providerReferences : undefined,
    referenceImages: providerReferenceImages.length ? providerReferenceImages : undefined,
    aspectRatio: typeof step.params.aspectRatio === "string" ? step.params.aspectRatio : undefined,
    batchSize: typeof step.params.batchSize === "number" ? step.params.batchSize : undefined,
    modelOptions: step.params.modelOptions as ImageModelOptions | undefined,
    ...(providerMask ? { mask: providerMask } : {}),
  };

  const requestedCount = Math.max(1, Math.min(8, Number(step.params.batchSize) || 1));
  const provider = resolveProvider(modelId);
  const result = await generateExactImages(
    provider,
    request,
    requestedCount,
    { ...options, nodeId: step.nodeId },
  );
  const businessImages = needsMask
    ? await Promise.all(result.images.map((image) => (
        compositeMaskedEdit(referenceImages[0], mask!, image, { featherRadius: maskFeatherRadius })
      )))
    : result.images;
  const images = await postProcessGeneratedOutputImages("image", step.params, businessImages);
  return {
    images,
    providerImages: result.providerImages,
    references: providerReferences,
    model: result.model,
    prompts: images.map(() => prompt),
    providerRequests: result.providerRequests,
    providerOutputSizes: result.providerOutputSizes,
    failures: result.failures.length ? result.failures.map((error) => ({ prompt, error })) : undefined,
  };
}

export async function executeStep(
  step: NodeExecution,
  inputImages: string[],
  resolveProvider: ProviderResolver = getProvider,
  runIdOrOptions?: string | ExecuteStepOptions,
): Promise<StepResult> {
  const options: ExecuteStepOptions = typeof runIdOrOptions === "string"
    ? { runId: runIdOrOptions }
    : runIdOrOptions ?? {};
  // Defense in depth for legacy or manually queued plans. Provider result URLs
  // are persisted before becoming downstream inputs, so this gate is scoped to
  // unresolved user input references and never changes output URL handling.
  assertNoRemoteWorkerReferences(step, inputImages);
  switch (step.kind) {
    case "text":
      return executeTextStep(step, options.resolveTextProvider ?? getTextProvider);
    case "image":
      return executeImageStep(step, inputImages, resolveProvider, options);
    case "video":
      throw new Error("视频节点执行链路尚未实现（P2-e）");
  }
}

/**
 * 将节点图片引用统一解析为 Provider 输入 dataURL。
 * 已标准化上传与生成结果直接复用；旧素材或缺少元数据的本地文件只标准化请求副本。
 */
export async function resolveImageRefs(refs: string[]): Promise<string[]> {
  const localIds = Array.from(new Set(
    refs.filter(isLocalImageReference).map((ref) => ref.slice("/api/files/".length)),
  ));
  const storedInputs = localIds.length === 0
    ? []
    : await query<{ id: string; source_type: string; normalized: boolean }>(`
        SELECT id, source_type, normalized FROM files WHERE id = ANY($1::text[])
      `, [localIds]);
  const metadataById = new Map(storedInputs.map((row) => [row.id, row]));

  return Promise.all(refs.map(async (ref) => {
    const resolved = await normalizeImageRef(ref);
    if (!isLocalImageReference(ref)) return resolved;

    const id = ref.slice("/api/files/".length);
    const metadata = metadataById.get(id);
    if (metadata?.normalized || metadata?.source_type === "generation") return resolved;

    const normalized = await normalizeUploadImageDataUrl(resolved);
    return toDataUrl(normalized.buffer.toString("base64"), normalized.mimeType);
  }));
}
