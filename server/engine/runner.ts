/**
 * 执行步骤执行器：把单个 NodeExecution 逐步执行并调用 Provider。
 * 运行队列与事件持久化已迁移到 runQueue/（PostgreSQL 持久队列）；本文件只保留
 * executeStep 及其纯执行辅助函数（参考图解析、Provider 请求、后处理）。
 */
import { createHash } from "node:crypto";
import {
  NODE_SPECS,
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
  normalizeExactAspectRatio,
  normalizeUpscaleSize,
} from "../lib/imagePostProcessing";
import { getGarmentPromptVariantById } from "../../src/lib/garmentPromptPresets";
import {
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
  type ImageModelOptions,
} from "../../src/types/imageModels";
import { compositeMaskedEdit, prepareMaskForGeneration, resolveMaskFeatherRadius } from "../lib/maskProcessing";
import { renderProviderPrompt, type ProviderPromptReference } from "../../src/lib/providerPromptRenderer";
import { postProcessGeneratedOutputImages } from "./runnerOutputProcessing";

export { postProcessGeneratedOutputImages } from "./runnerOutputProcessing";

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
  providerOutputSizes?: Array<string | null>;
  failures?: RunFailure[];
  providerRequests: number;
}

export type ProviderResolver = (id: string) => AIProvider;

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
  // v7：imageUrl / fabricImageUrl 特化参数随旧 kind 退役；蒙版引用仍需防线。
  assertNoRemoteWorkerReferenceValues([
    ...inputImages,
    step.params.mask,
  ]);
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
    case "text": {
      // v7（Q1=B）text 运行路径：同步 chat completions 归 P2-b Provider 接线；
      // 此处先落输入组装与写回语义的执行位（上游串联 + 自身正文）。
      const input = typeof step.params.text === "string" ? step.params.text : "";
      if (!input.trim()) throw new Error(`Node ${step.nodeId} has no text input to run`);
      // P2-b：调用文本 Provider 并把结果写 outputText（text 字段永不覆盖）。
      throw new Error("text 节点运行链路在 P2-b 落地（contracts/runtime.md §1b）");
    }
    case "video": {
      // v7（Q2=A）video 路径：异步任务 + 轮询 + MP4 落地归 P2-e；
      // 此处先立执行位与首帧解析，防止误走 image 通道。
      throw new Error("video 节点运行链路在 P2-e 落地（contracts/runtime.md §2）");
    }
    case "image": {
      if (!isImageModelId(step.params.modelId)) {
        throw new Error(`Node ${step.nodeId} must select an explicit supported image model`);
      }
      const modelId = step.params.modelId;
      if (!isModelAllowedForNode(modelId, step.kind)) {
        throw new Error(`Model ${modelId} is not allowed for node ${step.nodeId}`);
      }
      const provider = resolveProvider(modelId);
      const modelOptions = step.params.modelOptions as ImageModelOptions | undefined;
      // v7（mode 归属反转）：operationMode 由所选变体携带；未选变体在准入层已拒绝。
      const variant = typeof step.params.promptVariantId === "string"
        ? getGarmentPromptVariantById(step.params.promptVariantId)
        : undefined;
      if (!variant) {
        throw new Error(`Node ${step.nodeId} has no bound prompt variant; free prompts cannot start a paid run`);
      }
      const operationMode = variant.mode as ImageOperationMode;
      const inputReferenceSources = options.referenceSources !== undefined
        ? options.referenceSources.map((reference) => ({ ...reference }))
        : fallbackReferenceSources(step, inputImages);
      assertReferenceSourcesMatchImages(inputReferenceSources, inputImages, step.nodeId);
      const references = await resolveReferenceInputs(inputReferenceSources);
      const promptReferences: ProviderPromptReference[] = references.map(() => ({}));
      const referenceImages = references.map((reference) => reference.dataUrl);
      const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(modelId));
      if (referenceImages.length > maxReferences) {
        throw new Error(`Node ${step.nodeId} accepts at most ${maxReferences} reference images for ${modelId}`);
      }

      // v7（R2/R3，contracts/runtime.md §1 第 1–3 步）：
      // taskPrompt = variant.fullPrompt + "\n\n" + userPrompt（userPrompt 来自上游 text 边，
      // 由 runQueue 在 params.text 注入；无上游正文时准入层已拒绝）。runner 内零功能文案。
      const userPrompt = typeof step.params.text === "string" ? step.params.text.trim() : "";
      const taskPrompt = variant.fullPrompt + (userPrompt ? `\n\n${userPrompt}` : "");
      const prompt = renderProviderPrompt({
        nodeKind: step.kind,
        modelId,
        operationMode,
        taskPrompt,
        references: promptReferences,
      });

      // 蒙版分支（Q4=A：由变体声明驱动；mode === "mask-edit" 时启用）。
      const needsMask = variant.mode === "mask-edit";
      const maskReference = needsMask ? step.params.mask : undefined;
      if (needsMask && (typeof maskReference !== "string" || !maskReference)) {
        throw new Error("局部修改必须先保存 PNG 蒙版");
      }
      const mask = typeof maskReference === "string" ? await normalizeImageRef(maskReference) : undefined;
      const maskFeatherRadius = needsMask ? resolveMaskFeatherRadius(step.params.featherRadius) : undefined;
      const preparedMask = needsMask && mask
        ? await prepareMaskForGeneration(referenceImages[0], mask, { featherRadius: maskFeatherRadius })
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
      const request = {
        prompt,
        operationMode,
        references: providerReferences.length ? providerReferences : undefined,
        referenceImages: providerReferenceImages.length ? providerReferenceImages : undefined,
        aspectRatio: normalizeExactAspectRatio(step.params.aspectRatio),
        batchSize: step.params.batchSize as number | undefined,
        modelOptions: preparedMask ? { ...modelOptions, size: preparedMask.size } : modelOptions,
        mask: providerMask,
      };
      const requestedCount = Math.max(1, Math.min(8, Number(step.params.batchSize) || 1));
      const result = await generateExactImages(
        provider,
        request,
        requestedCount,
        { ...options, nodeId: step.nodeId },
      );
      const providerImages = needsMask && mask
        ? await Promise.all(result.images.map((image) => (
            compositeMaskedEdit(referenceImages[0], mask, image, { featherRadius: maskFeatherRadius })
          )))
        : result.images;
      const images = await postProcessGeneratedOutputImages(step.kind, step.params, providerImages);
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
