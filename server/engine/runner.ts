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
  allowedOperationModesForNode,
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
import { buildRecolorPrompt } from "../../src/lib/colors";
import {
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
  type ImageModelOptions,
} from "../../src/types/imageModels";
import { compositeMaskedEdit, prepareMaskForGeneration } from "../lib/maskProcessing";
import { renderProviderPrompt } from "../../src/lib/providerPromptRenderer";
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
  /** 实际发给 Provider 的角色化参考图证据。 */
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
    role: "generic",
    order,
    roleNeedsConfirmation: true,
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
    step.kind === "image-input" ? step.params.imageUrl : undefined,
    step.kind === "fabric-recolor" ? step.params.fabricImageUrl : undefined,
    step.kind === "mask-redraw" ? step.params.mask : undefined,
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
      role: source.role,
      order: source.order,
      assetSha256: assetSha256(dataUrl),
      ...(source.sourceNodeId ? { sourceNodeId: source.sourceNodeId } : {}),
      roleNeedsConfirmation: source.roleNeedsConfirmation !== false,
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
    case "image-input": {
      const imageUrl = step.params.imageUrl as string | undefined;
      return { images: imageUrl ? [imageUrl] : [], providerRequests: 0 };
    }
    case "result": {
      // 结果节点：汇总上游本次运行的真实产出
      const providerImages = options.inputProviderImages?.length === inputImages.length
        && options.inputProviderImages.every((image): image is string => typeof image === "string" && image.length > 0)
        ? options.inputProviderImages
        : undefined;
      return { images: inputImages, providerImages, providerRequests: 0 };
    }
    case "sketch-to-render":
    case "ai-modify":
    case "fabric-recolor":
    case "upscale":
    case "print-extract":
    case "print-mutate":
    case "mask-redraw": {
      if (
        step.params.modelSelectionNeedsConfirmation === true
        || (typeof step.params.retiredModelId === "string" && step.params.retiredModelId.trim())
      ) {
        throw new Error(`Node ${step.nodeId} uses a retired model and must be manually reconfigured before running`);
      }
      if (!isImageModelId(step.params.modelId)) {
        throw new Error(`Node ${step.nodeId} must select an explicit supported image model`);
      }
      const modelId = step.params.modelId;
      if (!isModelAllowedForNode(modelId, step.kind)) {
        throw new Error(`Model ${modelId} is not allowed for node ${step.nodeId}`);
      }
      const provider = resolveProvider(modelId);
      const modelOptions = step.params.modelOptions as ImageModelOptions | undefined;
      const allowedModes = allowedOperationModesForNode(step.kind);
      const operationMode = step.params.operationMode as ImageOperationMode;
      if (!allowedModes.includes(operationMode as never)) {
        throw new Error(`Node ${step.nodeId} has an invalid fixed operationMode`);
      }
      if (step.params.operationModeNeedsConfirmation === true) {
        throw new Error(`Node ${step.nodeId} operationMode must be confirmed before running`);
      }
      if (
        step.kind === "mask-redraw" &&
        (typeof step.params.maskSourceRef !== "string" || step.params.maskSourceRef !== inputImages[0])
      ) {
        throw new Error("蒙版对应的原图已变化，请重新绘制蒙版");
      }
      const inputReferenceSources = options.referenceSources !== undefined
        ? options.referenceSources.map((reference) => ({ ...reference }))
        : fallbackReferenceSources(step, inputImages);
      assertReferenceSourcesMatchImages(inputReferenceSources, inputImages, step.nodeId);

      // fabric-recolor 的面料参考图（可能不是边连入，而是节点参数）先并入
      // canonical sources，再只从最终 references 派生兼容图片数组。
      const fabricImageUrl = step.params.fabricImageUrl as string | undefined;
      const referenceSources = step.kind === "fabric-recolor" && fabricImageUrl
        ? [...inputReferenceSources, {
          imageRef: fabricImageUrl,
          role: "fabric" as const,
          order: inputReferenceSources.length,
          sourceNodeId: step.nodeId,
          roleNeedsConfirmation: false,
        }]
        : inputReferenceSources;
      const references = await resolveReferenceInputs(referenceSources);
      const referenceImages = references.map((reference) => reference.dataUrl);
      const maxReferences = Math.min(MAX_REFERENCE_IMAGES, modelMaxReferenceImages(modelId));
      const maxUserReferences = step.kind === "mask-redraw"
        ? Math.min(MAX_MASK_USER_REFERENCE_IMAGES, Math.max(0, maxReferences - 1))
        : maxReferences;
      if (referenceImages.length > maxUserReferences) {
        throw new Error(`Node ${step.nodeId} accepts at most ${maxUserReferences} user reference images for ${modelId}`);
      }

      const extra = ((step.params.prompt as string) ?? "").trim();

      // 配色替换：每个颜色独立调用，保证一色一图；部分失败也保留成功结果。
      if (step.kind === "fabric-recolor") {
        const colors = Array.isArray(step.params.colors)
          ? step.params.colors.filter((value): value is string => typeof value === "string")
          : [];
        if (colors.length > 0) {
          const images: string[] = [];
          const providerImages: string[] = [];
          const prompts: string[] = [];
          const providerOutputSizes: Array<string | null> = [];
          const failures: RunFailure[] = [];
          let model: string | undefined;
          let providerRequests = 0;
          let firstError: unknown;
          for (const color of colors) {
            const prompt = renderProviderPrompt({
              nodeKind: step.kind,
              modelId,
              operationMode,
              taskPrompt: buildRecolorPrompt([color]),
              references,
            });
            try {
              const result = await generateExactImages(
                provider,
                { prompt, operationMode: "edit", references, referenceImages, modelOptions },
                1,
                { ...options, nodeId: step.nodeId },
              );
              providerRequests += result.providerRequests;
              model = result.model;
              for (const [index, image] of result.images.entries()) {
                images.push(image);
                providerImages.push(result.providerImages[index]!);
                prompts.push(prompt);
                providerOutputSizes.push(result.providerOutputSizes?.[index] ?? null);
              }
            } catch (err) {
              firstError ??= err;
              if (err instanceof ProviderError && err.category === "outcome_unknown") throw err;
              failures.push({
                prompt,
                error: err instanceof ProviderError
                  ? publicProviderErrorMessage(err)
                  : err instanceof Error ? err.message : String(err),
              });
              if (images.length > 0) break;
              if (err instanceof ProviderError && (
                err.status === 429 || err.status === 503 ||
                ["gateway_authentication", "invalid_request", "model_unavailable"].includes(err.category)
              )) throw err;
            }
          }
          if (images.length === 0) {
            throw firstError instanceof Error ? firstError : new Error(failures[0]?.error ?? "全部配色生成失败");
          }
          return {
            images,
            providerImages,
            references,
            prompts,
            model,
            providerRequests,
            providerOutputSizes: providerOutputSizes.some((size) => size !== null)
              ? providerOutputSizes
              : undefined,
            failures: failures.length ? failures : undefined,
          };
        }
      }

      // 印花裂变：分批出图（单次最多 4 张）
      if (step.kind === "print-mutate") {
        const count = Math.max(1, Math.min(8, Number(step.params.count) || 4));
        const taskPrompt =
          "基于这张印花图案生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图与组合方式，纯白背景，适合作为印花素材复用" +
          (extra ? `。补充要求：${extra}` : "");
        const prompt = renderProviderPrompt({
          nodeKind: step.kind,
          modelId,
          operationMode,
          taskPrompt,
          references,
        });
        const result = await generateExactImages(
          provider,
          { prompt, operationMode: "edit", references, referenceImages, modelOptions },
          count,
          { ...options, nodeId: step.nodeId },
        );
        const failures = result.failures.map((error) => ({ prompt, error }));
        return {
          images: result.images,
          providerImages: result.providerImages,
          references,
          prompts: result.images.map(() => prompt),
          model: result.model,
          providerRequests: result.providerRequests,
          providerOutputSizes: result.providerOutputSizes,
          failures: failures.length ? failures : undefined,
        };
      }

      const taskPrompt =
        step.kind === "upscale"
          ? "将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变"
          : step.kind === "print-extract"
            ? "提取这件衣服上的印花图案：将印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影和穿着效果，印花的比例、细节和色彩与原图保持一致，适合作为印花素材复用" +
              (extra ? `。补充要求：${extra}` : "")
            : extra;
      const prompt = renderProviderPrompt({
        nodeKind: step.kind,
        modelId,
        operationMode,
        taskPrompt,
        references,
      });
      const maskReference = step.kind === "mask-redraw" ? step.params.mask : undefined;
      if (step.kind === "mask-redraw" && (typeof maskReference !== "string" || !maskReference)) {
        throw new Error("局部修改必须先保存 PNG 蒙版");
      }
      const mask = typeof maskReference === "string" ? await normalizeImageRef(maskReference) : undefined;
      const preparedMask = step.kind === "mask-redraw"
        ? await prepareMaskForGeneration(referenceImages[0], mask!)
        : undefined;
      const providerMask = preparedMask?.mask ?? mask;
      const providerReferences = preparedMask
        ? [
            references[0],
            ...references.slice(1),
            {
              dataUrl: preparedMask.guide,
              role: "generic" as const,
              order: references.length,
              assetSha256: assetSha256(preparedMask.guide),
              sourceNodeId: `${step.nodeId}:mask-guide`,
              roleNeedsConfirmation: false,
            },
          ]
        : references;
      const providerReferenceImages = providerReferences.map((reference) => reference.dataUrl);
      const request = {
        prompt,
        operationMode: operationMode as "generate" | "edit" | "mask-edit",
        references: providerReferences.length ? providerReferences : undefined,
        referenceImages: providerReferenceImages.length ? providerReferenceImages : undefined,
        aspectRatio: step.kind === "sketch-to-render" || step.kind === "ai-modify"
          ? normalizeExactAspectRatio(step.params.aspectRatio)
          : step.params.aspectRatio as string | undefined,
        batchSize: step.params.batchSize as number | undefined,
        imageSize: step.kind === "upscale" ? normalizeUpscaleSize(step.params.imageSize) : undefined,
        modelOptions: preparedMask ? { ...modelOptions, size: preparedMask.size } : modelOptions,
        mask: providerMask,
      };
      const requestedCount = step.kind === "sketch-to-render" || step.kind === "ai-modify"
        ? Math.max(1, Math.min(8, Number(step.params.batchSize) || 1))
        : 1;
      const result = await generateExactImages(
        provider,
        request,
        requestedCount,
        { ...options, nodeId: step.nodeId },
      );
      const providerImages = step.kind === "mask-redraw"
        ? await Promise.all(result.images.map((image) => (
            compositeMaskedEdit(referenceImages[0], mask!, image)
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
