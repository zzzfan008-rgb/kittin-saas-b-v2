/**
 * 执行计划运行器：逐步执行 ExecutionPlan，通过事件总线推送每步状态（SSE 用）。
 * 运行记录保存在内存（P0 单进程足够）。
 */
import { EventEmitter } from "node:events";
import { nanoid } from "nanoid";
import {
  NODE_SPECS,
  MAX_MASK_USER_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGES,
  type ExecutionPlan,
  type AIProvider,
  type NodeExecution,
  type NodeRunStatus,
} from "../../src/types/workflow";
import { getProvider } from "../providers";
import { ProviderError, publicProviderErrorMessage, toDataUrl } from "../providers/base";
import { generateExactImages } from "../providers/exact";
import { normalizeImageRef, persistImageRef } from "../lib/fileStore";
import { isLocalImageReference } from "../lib/imageValidation";
import { normalizeUploadImageDataUrl } from "../lib/uploadImageNormalization";
import { query } from "../lib/database";
import {
  fitGeneratedImageToAspect,
  normalizeExactAspectRatio,
  normalizeUpscaleSize,
  upscaleImageToLongEdge,
} from "../lib/imagePostProcessing";
import { buildRecolorPrompt } from "../../src/lib/colors";
import {
  DEFAULT_GENERATION_MODEL_ID,
  MASK_REDRAW_MODEL_ID,
  isImageModelId,
  isModelAllowedForNode,
  modelMaxReferenceImages,
  type ImageModelOptions,
} from "../../src/types/imageModels";
import { compositeMaskedEdit, prepareMaskForGeneration } from "../lib/maskProcessing";
import {
  completeGenerationRecord,
  createGenerationRecord,
  failGenerationRecord,
  markGenerationRunning,
  registerGeneratedFiles,
  type GenerationRecordContext,
} from "../lib/generationRecords";

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
  model?: string;
  prompts?: string[];
  providerOutputSizes?: Array<string | null>;
  failures?: RunFailure[];
  providerRequests: number;
}

const DEFAULT_PROMPTS: Partial<Record<NodeExecution["kind"], string>> = {
  "sketch-to-render": "将线稿渲染为写实服装效果图，保持结构与轮廓，高端时装摄影质感",
  "ai-modify": "在保持整体版型不变的前提下，优化服装细节设计",
  "fabric-recolor": "保持服装款式、细节、光影与背景不变，仅替换面料质感",
};

function maskReferenceRolePrompt(userReferenceCount: number): string {
  const guideIndex = userReferenceCount + 1;
  if (userReferenceCount <= 1) {
    return "参考图1是完整原图；最后一张参考图（参考图2）是区域引导图";
  }
  const userReferences = userReferenceCount === 2
    ? "参考图2是用户提供的目标内容参考图"
    : `参考图2至参考图${userReferenceCount}是用户提供的目标内容参考图`;
  return `参考图1是完整原图；${userReferences}，用户提示词中的图号始终对应这些用户参考图；最后一张参考图（参考图${guideIndex}）才是区域引导图`;
}

interface Run {
  id: string;
  /** 实时运行数据始终绑定发起用户；不从可选的记录上下文间接推断。 */
  ownerId: string;
  plan: ExecutionPlan;
  emitter: EventEmitter;
  events: RunEvent[]; // 已完成事件（供 SSE 重放）
  finished: boolean;
  createdAt: number;
  recordContext?: GenerationRecordContext;
}

const runs = new Map<string, Run>();

/** 已完成 Run 的保留上限（超出后清理最老的无订阅 Run，防内存无限增长） */
const MAX_FINISHED_RUNS = 50;
/** 已完成 Run 的最大存活时间（30 分钟） */
const FINISHED_RUN_TTL_MS = 30 * 60 * 1000;

/** 清理终态 Run：不影响正在运行或仍有活跃 SSE 订阅的 Run */
function pruneRuns(): void {
  const now = Date.now();
  const finished: Run[] = [];
  for (const run of runs.values()) {
    if (!run.finished) continue;
    if (run.emitter.listenerCount("event") > 0) continue; // 有活跃订阅，不动
    if (now - run.createdAt > FINISHED_RUN_TTL_MS) {
      runs.delete(run.id);
    } else {
      finished.push(run);
    }
  }
  // 超上限：从最老的开始删
  if (finished.length > MAX_FINISHED_RUNS) {
    finished.sort((a, b) => a.createdAt - b.createdAt);
    for (const run of finished.slice(0, finished.length - MAX_FINISHED_RUNS)) {
      runs.delete(run.id);
    }
  }
}

export function getRunForUser(id: string, ownerId: string): Run | undefined {
  const run = runs.get(id);
  return run?.ownerId === ownerId ? run : undefined;
}

export async function createRun(
  plan: ExecutionPlan,
  ownerId: string,
  recordContext?: GenerationRecordContext,
): Promise<Run> {
  if (!ownerId.trim()) throw new Error("run ownerId is required");
  if (recordContext && recordContext.userId !== ownerId) {
    throw new Error("run ownerId must match recordContext.userId");
  }
  pruneRuns();
  const run: Run = {
    id: nanoid(10),
    ownerId,
    plan,
    emitter: new EventEmitter(),
    events: [],
    finished: false,
    createdAt: Date.now(),
    recordContext,
  };
  run.emitter.setMaxListeners(50);
  runs.set(run.id, run);
  if (recordContext) await createGenerationRecord(run.id, recordContext, run.createdAt);
  // 异步启动，调用方先拿到 runId 再订阅事件
  setImmediate(() => {
    executeRun(run).catch(async (err) => {
      const message = err instanceof ProviderError ? publicProviderErrorMessage(err) : err instanceof Error ? err.message : String(err);
      if (run.recordContext) await failGenerationRecord(run.id, message, Date.now());
      emit(run, { type: "run-error", error: message });
    });
  });
  return run;
}

function emit(run: Run, event: RunEvent): void {
  const sequenced = { ...event, seq: run.events.length + 1 };
  run.events.push(sequenced);
  run.emitter.emit("event", sequenced);
  if (sequenced.type === "done" || sequenced.type === "run-error") {
    run.finished = true;
    run.emitter.emit("finish");
  }
}

async function executeRun(run: Run): Promise<void> {
  /** 每个节点的产出图片（统一为 /api/files/:id 引用），供下游节点使用 */
  const outputs = new Map<string, string[]>();
  let providerRequests = 0;
  let model: string | undefined;
  let recordResult: Pick<StepResult, "images" | "prompts" | "providerOutputSizes" | "failures"> | undefined;

  if (run.recordContext) await markGenerationRunning(run.id, Date.now());

  const failRun = async (message: string, nodeId?: string, startedAt?: number): Promise<void> => {
    const finishedAt = Date.now();
    if (run.recordContext) await failGenerationRecord(run.id, message, finishedAt);
    if (nodeId) {
      emit(run, {
        type: "node-status",
        nodeId,
        status: "error",
        error: message,
        ...(startedAt !== undefined ? { startedAt } : {}),
        finishedAt,
      });
    }
    emit(run, { type: "run-error", ...(nodeId ? { nodeId } : {}), error: message, finishedAt });
  };

  for (const step of run.plan.steps) {
    // 运行时解析真实输入：优先本次 Run 上游产出，范围外上游回退到计划期快照
    const inputImages = (step.upstream ?? []).flatMap(
      (u) => outputs.get(u.nodeId) ?? u.images,
    );

    const runtimeInputLimit = step.kind === "mask-redraw"
      ? MAX_MASK_USER_REFERENCE_IMAGES
      : MAX_REFERENCE_IMAGES;
    if (NODE_SPECS[step.kind].providerId && inputImages.length > runtimeInputLimit) {
      const message = `Node ${step.nodeId} accepts at most ${runtimeInputLimit}${step.kind === "mask-redraw" ? " user" : ""} reference images`;
      await failRun(message, step.nodeId);
      return;
    }

    // 运行时最终门禁：即使静态计划中的上游节点实际未产图，也绝不退化成无参考图付费生成。
    if (NODE_SPECS[step.kind].providerId && step.kind !== "sketch-to-render" && inputImages.length === 0) {
      const message = `Node ${step.nodeId} requires an upstream image`;
      await failRun(message, step.nodeId);
      return;
    }

    const startedAt = Date.now();
    emit(run, { type: "node-status", nodeId: step.nodeId, status: "running", startedAt });
    try {
      const result = await executeStep(step, inputImages, getProvider, run.id);
      // 产出统一落盘为 /api/files/:id，避免 base64 大图驻留事件与内存
      const persisted = await persistOutputImages(result.images);
      if (run.recordContext) {
        await registerGeneratedFiles(run.recordContext, run.id, step.nodeId, persisted, Date.now());
      }
      outputs.set(step.nodeId, persisted);
      const finishedAt = Date.now();
      providerRequests += result.providerRequests;
      if (result.model) model = result.model;
      if (run.recordContext?.nodeId === step.nodeId) {
        recordResult = {
          images: persisted,
          prompts: result.prompts,
          providerOutputSizes: result.providerOutputSizes,
          failures: result.failures,
        };
      }
      const partialWarning = result.failures?.length
        ? `${result.failures.length} 个生成任务失败`
        : undefined;
      emit(run, {
        type: "node-status",
        nodeId: step.nodeId,
        status: "success",
        images: persisted,
        error: partialWarning,
        model: result.model,
        prompts: result.prompts,
        providerOutputSizes: result.providerOutputSizes,
        failures: result.failures,
        startedAt,
        finishedAt,
      });
    } catch (err) {
      const message = err instanceof ProviderError
        ? publicProviderErrorMessage(err)
        : err instanceof Error ? err.message : String(err);
      await failRun(message, step.nodeId, startedAt);
      return; // P0：单步失败即终止整个 run
    }
  }
  if (run.recordContext) {
    const finishedAt = Date.now();
    await completeGenerationRecord({
      runId: run.id,
      images: recordResult?.images ?? [],
      prompts: recordResult?.prompts,
      providerOutputSizes: recordResult?.providerOutputSizes,
      failures: recordResult?.failures,
      model,
      providerRequests,
      startedAt: run.createdAt,
      finishedAt,
    });
  }
  emit(run, { type: "done" });
}

/** 产出图片归一化：dataURL / 远程 URL → 落盘为 /api/files/:id；已是本地引用的原样保留 */
async function persistOutputImages(images: string[]): Promise<string[]> {
  return Promise.all(images.map((img) => persistImageRef(img)));
}

/** Apply business-side output guarantees only to nodes that expose size controls to users. */
export async function postProcessGeneratedOutputImages(
  kind: NodeExecution["kind"],
  params: Record<string, unknown>,
  images: string[],
): Promise<string[]> {
  if (kind !== "sketch-to-render" && kind !== "ai-modify" && kind !== "upscale") return images;
  const aspectRatio = normalizeExactAspectRatio(params.aspectRatio);
  const imageSize = normalizeUpscaleSize(params.imageSize);
  const processed: string[] = [];
  for (const image of images) {
    processed.push(
      kind === "upscale"
        ? await upscaleImageToLongEdge(image, imageSize)
        : await fitGeneratedImageToAspect(image, aspectRatio),
    );
  }
  return processed;
}

export type ProviderResolver = (id: string) => AIProvider;

export interface ExecuteStepOptions {
  runId?: string;
  beforeProviderCall?: (providerRequest: number) => void | Promise<void>;
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
  switch (step.kind) {
    case "image-input": {
      const imageUrl = step.params.imageUrl as string | undefined;
      return { images: imageUrl ? [imageUrl] : [], providerRequests: 0 };
    }
    case "result": {
      // 结果节点：汇总上游本次运行的真实产出
      return { images: inputImages, providerRequests: 0 };
    }
    case "sketch-to-render":
    case "ai-modify":
    case "fabric-recolor":
    case "upscale":
    case "print-extract":
    case "print-mutate":
    case "mask-redraw": {
      const modelId = isImageModelId(step.params.modelId)
        ? step.params.modelId
        : step.kind === "mask-redraw" ? MASK_REDRAW_MODEL_ID : DEFAULT_GENERATION_MODEL_ID;
      if (!isModelAllowedForNode(modelId, step.kind)) {
        throw new Error(`Model ${modelId} is not allowed for node ${step.nodeId}`);
      }
      const provider = resolveProvider(modelId);
      const modelOptions = step.params.modelOptions as ImageModelOptions | undefined;
      if (
        step.kind === "mask-redraw" &&
        (typeof step.params.maskSourceRef !== "string" || step.params.maskSourceRef !== inputImages[0])
      ) {
        throw new Error("蒙版对应的原图已变化，请重新绘制蒙版");
      }
      const referenceImages = await resolveImageRefs(inputImages);

      // fabric-recolor 的面料参考图（可能不是边连入，而是节点参数）
      const fabricImageUrl = step.params.fabricImageUrl as string | undefined;
      if (step.kind === "fabric-recolor" && fabricImageUrl) {
        referenceImages.push(...(await resolveImageRefs([fabricImageUrl])));
      }
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
          const prompts: string[] = [];
          const providerOutputSizes: Array<string | null> = [];
          const failures: RunFailure[] = [];
          let model: string | undefined;
          let providerRequests = 0;
          let firstError: unknown;
          for (const color of colors) {
            const prompt = buildRecolorPrompt([color]);
            try {
              const result = await generateExactImages(
                provider,
                { prompt, referenceImages, modelOptions },
                1,
                { ...options, nodeId: step.nodeId },
              );
              providerRequests += result.providerRequests;
              model = result.model;
              for (const [index, image] of result.images.entries()) {
                images.push(image);
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
        const prompt =
          "基于这张印花图案生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图与组合方式，纯白背景，适合作为印花素材复用" +
          (extra ? `。补充要求：${extra}` : "");
        const result = await generateExactImages(
          provider,
          { prompt, referenceImages, modelOptions },
          count,
          { ...options, nodeId: step.nodeId },
        );
        const failures = result.failures.map((error) => ({ prompt, error }));
        return {
          images: result.images,
          prompts: result.images.map(() => prompt),
          model: result.model,
          providerRequests: result.providerRequests,
          providerOutputSizes: result.providerOutputSizes,
          failures: failures.length ? failures : undefined,
        };
      }

      const maskReferenceRoles = step.kind === "mask-redraw"
        ? maskReferenceRolePrompt(referenceImages.length)
        : undefined;
      const prompt =
        step.kind === "upscale"
          ? "将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变"
          : step.kind === "print-extract"
            ? "提取这件衣服上的印花图案：将印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影和穿着效果，印花的比例、细节和色彩与原图保持一致，适合作为印花素材复用" +
              (extra ? `。补充要求：${extra}` : "")
            : step.kind === "mask-redraw"
              ? `目标修改：${extra}。${maskReferenceRoles}，其中红色表示用户涂抹的修改核心，红色已完全遮住旧内容，只用于表达位置；金色表示仅供完整轮廓延展和边缘融合的缓冲区；两者都是修改范围，不是裁切框。请根据用户说明在红色核心内添加、替换、删除或调整内容。凡用户要求替换、删除或改变既有对象时，必须先彻底清除与目标冲突的旧对象、旧包带、旧颜色、旧阴影、旧反光、旧纹理和残留边线，再依据周围连续的面料纹理、颜色、褶皱、缝线和光照完整重建被遮挡的底层服装或背景，然后放入新内容；禁止用模糊、暗斑、色块、漂浮投影或半透明残影遮盖清理区域。只有与新内容真实接触并符合整幅画面光源方向的阴影才可保留。不需要修改的服装结构、面料纹理和光影必须保持。结合整幅画面的构图、服装比例和视觉重量，新内容默认继承目标区域的中心位置与近似占位，除非用户明确要求，不得明显放大、缩小或偏移。只有完整轮廓、褶皱、缝线、阴影、反光和自然遮挡所必需的部分可以进入金色缓冲区，不得沿红色边缘截断，也不得覆盖缓冲区内的文字、独立图案、配饰或其他服装结构。交接处必须匹配原图的面料材质、纹理方向、褶皱、光影、透视、遮挡和清晰度，不得出现重影、透色、硬边或颜色污染。返回与整幅画面同尺寸、同坐标的 PNG 完整最终图片；修改范围以外的画面保持原状。`
              : extra || DEFAULT_PROMPTS[step.kind] || NODE_SPECS[step.kind].description;
      if (step.kind === "mask-redraw" && !extra) {
        throw new Error("局部修改必须填写修改说明");
      }
      const maskReference = step.kind === "mask-redraw" ? step.params.mask : undefined;
      if (step.kind === "mask-redraw" && (typeof maskReference !== "string" || !maskReference)) {
        throw new Error("局部修改必须先保存 PNG 蒙版");
      }
      const mask = typeof maskReference === "string" ? await normalizeImageRef(maskReference) : undefined;
      const preparedMask = step.kind === "mask-redraw"
        ? await prepareMaskForGeneration(referenceImages[0], mask!)
        : undefined;
      const providerMask = preparedMask?.mask ?? mask;
      const providerReferenceImages = preparedMask
        ? [referenceImages[0], ...referenceImages.slice(1), preparedMask.guide]
        : referenceImages;
      const request = {
        prompt,
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
