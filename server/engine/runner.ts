/**
 * 执行步骤执行器：把单个 NodeExecution 逐步执行并调用 Provider。
 * 运行队列与事件持久化已迁移到 runQueue/（PostgreSQL 持久队列）；本文件只保留
 * executeStep 及其纯执行辅助函数（参考图解析、Provider 请求、后处理）。
 *
 * v9 五节点模型：只有生成节点可运行（runtime.md §1；64 Phase 1 参数自治）。
 * - image-generator：统一生成路径，operationMode 由节点 data 携带（step.params，缺省 generate，
 *   裁决 A）；系统文本按 modeSystemText 冻结映射拼装（裁决 E）；蒙版由 mask-edit 驱动。
 * - video-generator：异步任务路径（submit + poll），Provider 实现归 videoProvider。
 * - text / image / video / result-image / result-video：不可执行，executeStep 直接 throw。
 */
import { createHash } from "node:crypto";
import {
  generationKindOf,
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
  RUN_PROGRESS_PHASES,
  type AIProvider,
  type ImageGenRequest,
  type ImageOperationMode,
  type NodeExecution,
  type NodeRunStatus,
  type ReferenceImageInput,
  type ReferenceImageSource,
  type RunEvent,
  type RunEventMeta,
  type RunFailure,
  type RunProgress,
} from "../../src/types/workflow";
import { getProvider } from "../providers";
import { ProviderError, publicProviderErrorMessage, toDataUrl } from "../providers/base";
import { generateExactImages } from "../providers/exact";
import { getVideoProvider, type VideoGenRequest, type VideoProvider } from "../providers/videoProvider";
import { normalizeImageRef } from "../lib/fileStore";
import { isRewriteEnabledFamily, rewriteUserPrompt } from "../lib/textRewriter";
import {
  isLocalImageReference,
  isRemoteImageReference,
  validateImageDataUrl,
} from "../lib/imageValidation";
import { REMOTE_IMAGE_REFERENCE_MESSAGE } from "../lib/imageReferenceAccess";
import { normalizeUploadImageDataUrl } from "../lib/uploadImageNormalization";
import { flattenReferenceAlpha } from "../lib/referenceFlatten";
import { query } from "../lib/database";
import {
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
  type ImageModelOptions,
} from "../../src/types/imageModels";
import { DEFAULT_VIDEO_MODEL_ID, isVideoModelId, type VideoModelOptions } from "../../src/types/videoModels";
import { IMAGE_OPERATION_MODE_VALUES } from "../../src/types/imageOperations";
import { modeSystemText } from "../lib/promptPresetsFrozen";
import { compositeMaskedEdit, prepareMaskForGeneration, resolveMaskFeatherRadius } from "../lib/maskProcessing";
import { renderProviderPrompt, type ProviderPromptReference } from "../../src/lib/providerPromptRenderer";
import { postProcessGeneratedOutputImages } from "./runnerOutputProcessing";

export { postProcessGeneratedOutputImages } from "./runnerOutputProcessing";

/** text 节点正文与 outputText 的长度上限（runtime.md §1b / data-model.md §3）。 */
export const MAX_TEXT_LENGTH = 20_000;

/** 视频异步轮询节奏（runtime.md §2；seedance2/overview.md 建议 10–20s 一次、预算 15 分钟）。 */
export const VIDEO_POLL_INITIAL_DELAY_MS = 20_000;
export const VIDEO_POLL_INTERVAL_MS = 20_000;
export const VIDEO_POLL_TIMEOUT_MS = 15 * 60_000;

export type { RunEvent, RunFailure, RunEventMeta } from "../../src/types/workflow";

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
  /** video 节点产出的 MP4 引用（/api/files/xxx，已服务端落地）。 */
  videos?: string[];
  /** video 实际产出时长（秒，来自 Provider 查询响应）。 */
  videoDurationSec?: number;
}

export type ProviderResolver = (id: string) => AIProvider;
export type VideoProviderResolver = (id: string) => VideoProvider;

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
  /** video 节点 Provider 解析器（测试注入用）；缺省走 getVideoProvider。 */
  resolveVideoProvider?: VideoProviderResolver;
  /** video 异步任务提交成功后的回调（持久化 taskId 并标记 attempt_started，幂等护栏）。 */
  onVideoTaskSubmitted?: (taskId: string) => void | Promise<void>;
  /**
   * RUN-02（契约 §5）：子单元进度回调。Worker 侧落 node-status(running) 事件；
   * 图片路径给真实 done/total，视频路径给 phase 心跳（无 done/total）。
   */
  onProgress?: (progress: RunProgress) => void | Promise<void>;
  /** 测试注入：轮询节奏覆盖（生产走 VIDEO_POLL_* 常量）。 */
  videoPollInitialDelayMs?: number;
  videoPollIntervalMs?: number;
  videoPollTimeoutMs?: number;
  /** 测试注入：rewriteUserPrompt 依赖项（可注入 mock chatCompletion，绕 undici dispatcher）。 */
  rewriteDeps?: {
    chatCompletion?: (args: {
      model: string; messages: Array<{ role: "system" | "user"; content: string }>;
    }) => Promise<{ content: string; finishReason: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }>;
  };
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
    step.kind === "image-generator" && typeof step.params.mask === "string" ? step.params.mask : undefined,
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
      ...(source.role ? { role: source.role } : {}),
    };
  });
}

async function executeImageGeneratorStep(
  step: NodeExecution,
  inputImages: string[],
  resolveProvider: ProviderResolver,
  options: ExecuteStepOptions,
): Promise<StepResult> {
  const modelId = step.params.modelId;
  if (!isImageModelId(modelId)) {
    throw new Error(`Node ${step.nodeId} must select an explicit supported image model`);
  }
  if (!isModelAllowedForNode(modelId, generationKindOf(step.kind))) {
    throw new Error(`Model ${modelId} is not allowed for node ${step.nodeId}`);
  }
  // v9（64 Phase 1 C3）：variant 查询与 taskPrompt variant 分支删除。
  // operationMode 显式取节点参数（缺省 generate，裁决 A）；非法值防御性回退 generate。
  const operationMode: ImageOperationMode =
    typeof step.params.operationMode === "string"
    && (IMAGE_OPERATION_MODE_VALUES as readonly string[]).includes(step.params.operationMode)
      ? step.params.operationMode as ImageOperationMode
      : "generate";
  const needsMask = operationMode === "mask-edit";
  const inputTexts = inputTextsOf(step);
  const userPrompt = inputTexts.length > 0
    ? inputTexts.join("\n\n")
    : (typeof step.params.prompt === "string" ? step.params.prompt : "");
  // 裁决 E：taskPrompt = 冻结系统文本 + 用户正文（generate 系统文本为空串 = 裸 API 行为零回归）。
  // §1.4 + §7-3：仅 image-generator、familyId 在白名单内时，在 taskPrompt 快照前改写用户正文。
  // fail-closed 由 rewriteUserPrompt 内部保证：非白名单/空输入/通道抛错均返回原文（outcome.text === userPrompt）。
  // 每 run 最多 1 次：image-generator 单步天然一次；不写节点 data，仅进本次 taskPrompt。
  let effectiveUserPrompt: string = userPrompt;
  if (
    step.kind === "image-generator"
    && isRewriteEnabledFamily(step.params.familyId as string | undefined)
    && userPrompt.trim().length > 0
  ) {
    const outcome = await rewriteUserPrompt(
      userPrompt,
      { kind: step.kind, mode: operationMode, familyId: step.params.familyId as string | undefined },
      options.rewriteDeps,
    );
    if (outcome.rewritten) {
      effectiveUserPrompt = outcome.text;
    }
  }
  const taskPrompt = `${modeSystemText(step.kind, operationMode)}\n\n${effectiveUserPrompt}`.trim();

  const inputReferenceSources = options.referenceSources !== undefined
    ? options.referenceSources.map((reference) => ({ ...reference }))
    : fallbackReferenceSources(step, inputImages);
  assertReferenceSourcesMatchImages(inputReferenceSources, inputImages, step.nodeId);
  const references = await resolveReferenceInputs(inputReferenceSources);
  // 角色随参考图一起进渲染：gemini 走逐图标签内联，其余模型由渲染层生成映射行。
  const promptReferences: ProviderPromptReference[] = references.map((reference) => (
    reference.role ? { role: reference.role } : {}
  ));
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
    // v9（64 Phase 1 C6）：variant 绑定六字段不再组装（ImageGenRequest 类型已删）。
    references: providerReferences.length ? providerReferences : undefined,
    referenceImages: providerReferenceImages.length ? providerReferenceImages : undefined,
    aspectRatio: typeof step.params.aspectRatio === "string" ? step.params.aspectRatio : undefined,
    batchSize: typeof step.params.batchSize === "number" ? step.params.batchSize : undefined,
    // mask-edit 的源像素尺寸是运行时才能确定的动态参数（mask profile 的
    // materialize 固定返回 modelOptions:{}），必须在边界处注入，否则 Provider
    // 收不到 size、评估证据侧也会判定 native 参数漂移。
    modelOptions: preparedMask
      ? { ...(step.params.modelOptions ?? {}), size: preparedMask.size }
      : step.params.modelOptions as ImageModelOptions | undefined,
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
    // 2026-10-28 修复：provider 返回的可能不是 dataURL 而是直链（gpt-image/sunburst 走
    // sydney-ai CDN、qwen 走阿里 OSS）。compositeMaskedEdit 只接受严格 dataURL，
    // 直接传 URL 会抛 "invalid image dataURL (strict base64 required)" —— 蒙版重绘/多轮修改
    // 因此全部失败。这里先归一化（URL → 下载 → dataURL），再进合成。
    ? await Promise.all(result.images.map(async (image) => (
        compositeMaskedEdit(referenceImages[0], mask!, await normalizeImageRef(image), {
          featherRadius: maskFeatherRadius,
        })
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

async function executeVideoGeneratorStep(
  step: NodeExecution,
  inputImages: string[],
  resolveVideoProvider: VideoProviderResolver,
  options: ExecuteStepOptions,
): Promise<StepResult> {
  const modelId = isVideoModelId(step.params.modelId) ? step.params.modelId : DEFAULT_VIDEO_MODEL_ID;
  // v9（64 Phase 1 C3）：variant 查询删除；operationMode 取节点参数（缺省 generate）。
  const videoOperationMode: ImageOperationMode =
    typeof step.params.operationMode === "string"
    && (IMAGE_OPERATION_MODE_VALUES as readonly string[]).includes(step.params.operationMode)
      ? step.params.operationMode as ImageOperationMode
      : "generate";
  const inputTexts = inputTextsOf(step);
  const userPrompt = inputTexts.length > 0
    ? inputTexts.join("\n\n")
    : (typeof step.params.prompt === "string" ? step.params.prompt : "");
  // 裁决 E：video 系统文本同样走冻结映射（video.edit = 动效任务文本；generate = 空串）。
  const taskPrompt = `${modeSystemText(step.kind, videoOperationMode)}\n\n${userPrompt}`.trim();
  if (!taskPrompt) {
    throw new Error("视频节点没有可发送的提示词");
  }

  // 首帧 = 唯一 image 边（0..1）。
  let firstFrame: ReferenceImageInput | undefined;
  if (inputImages.length > 0) {
    const source: ReferenceImageSource = step.inputReferences?.[0] ?? { imageRef: inputImages[0], order: 0 };
    if (source.imageRef !== inputImages[0]) {
      throw new Error(`Node ${step.nodeId} 首帧引用快照与 inputImages 不一致`);
    }
    firstFrame = (await resolveReferenceInputs([{ ...source, order: 0 }]))[0];
  }

  const provider = resolveVideoProvider(modelId);
  // v9（64 Phase 1 C6）：promptVariantId/contractHash 不再组装（variant 概念删除）。
  const request: VideoGenRequest = {
    prompt: taskPrompt,
    ...(firstFrame ? { firstFrame } : {}),
    modelOptions: step.params.modelOptions as VideoModelOptions | undefined,
  };

  const { taskId } = await provider.submit(request);
  await options.onVideoTaskSubmitted?.(taskId);
  // RUN-02（契约 §5）：T1 核实 Seedance 不返回百分比，视频只发 phase 心跳，
  // 绝不编造 done/total。
  await options.onProgress?.({ phase: RUN_PROGRESS_PHASES.videoSubmitted });

  const initialDelayMs = options.videoPollInitialDelayMs ?? VIDEO_POLL_INITIAL_DELAY_MS;
  const intervalMs = options.videoPollIntervalMs ?? VIDEO_POLL_INTERVAL_MS;
  const timeoutMs = options.videoPollTimeoutMs ?? VIDEO_POLL_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;
  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  if (initialDelayMs > 0) await sleep(initialDelayMs);
  for (;;) {
    if (Date.now() >= deadline) {
      throw new Error("视频生成超时，请稍后重试");
    }
    const result = await provider.poll(taskId);
    if (result.status === "completed") {
      return {
        images: [],
        videos: [result.videoFileRef],
        ...(result.durationSec !== undefined ? { videoDurationSec: result.durationSec } : {}),
        model: modelId,
        providerRequests: 1,
      };
    }
    if (result.status === "failed") {
      throw new Error(result.error);
    }
    // 每个 poll tick 一条 phase 心跳（pending/running）；无百分比不假报 done/total。
    await options.onProgress?.({ phase: RUN_PROGRESS_PHASES.videoPolling });
    await sleep(intervalMs);
  }
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
    case "image-generator":
      return executeImageGeneratorStep(step, inputImages, resolveProvider, options);
    case "video-generator":
      return executeVideoGeneratorStep(step, inputImages, options.resolveVideoProvider ?? getVideoProvider, options);
    case "text":
    case "image":
    case "video":
    case "result-image":
    case "result-video":
      throw new Error(`Node ${step.nodeId} 不是可执行节点类型`);
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
    if (!isLocalImageReference(ref)) return await flattenReferenceAlpha(resolved);

    const id = ref.slice("/api/files/".length);
    const metadata = metadataById.get(id);
    // 2026-10-28：生成结果不再豁免——4.5MB 的原生 PNG 直接当参考图会撑大请求体，
    // 上游偶发 400「参考图无法解码」。统一走标准化（体积/格式收敛）。
    if (!metadata?.normalized) {
      const normalized = await normalizeUploadImageDataUrl(resolved);
      return await flattenReferenceAlpha(toDataUrl(normalized.buffer.toString("base64"), normalized.mimeType));
    }
    // 已标准化的上传仍可能带透明通道（抠图素材），参考图副本要压平。
    return await flattenReferenceAlpha(resolved);
  }));
}
