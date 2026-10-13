import contracts from "../../docs/ai/apiyi/model-contracts.json";

export const IMAGE_MODEL_IDS = [
  "gpt-image-2.5-sunburst",
  "gpt-image-2.5-all",
  "gpt-image-2.5-sunburst-vip",
  "gpt-image-2.5-flare-vip",
  "gemini-3-pro-image-preview",
  "gemini-3.1-flash-lite-image",
  "gemini-3.1-flash-image",
  "flux-2-pro",
  "seedream-5-0-260128",
] as const;

export type ImageModelId = (typeof IMAGE_MODEL_IDS)[number];
export type GenerationImageModelId = Exclude<ImageModelId, "gpt-image-2.5-sunburst">;

/**
 * R5（schema v7）：模型参数放开为自由 key-value。契约仅提供推荐值元数据
 * （model-contracts.json 每模型的 recommendedOptions 块），校验从硬失败降级为
 * warning 语义（见 imageModelOptionsWarnings）。字段级契约：
 * docs/design/2026-09-18-three-node-model/contracts/data-model.md §4
 */
export interface ImageModelOptions {
  [key: string]: string | number | boolean | undefined;
}

/** recommendedOptions 条目结构（契约 data-model.md §4）。 */
export interface RecommendedOptionSpec {
  default?: string | number | boolean;
  examples?: Array<string | number | boolean>;
}

export interface ReviewedModelCatalogBaseline {
  reviewedExportHashScope: "sha256-canonical-model-id-set-v1";
  reviewedExportSha256: string | null;
  reviewedRawExportSha256: string | null;
  expectedGatewayModelIds: readonly ImageModelId[];
}

export interface ImageModelContract {
  id: ImageModelId;
  contractHashScope: "sha256-canonical-semantic-envelope-v1";
  contractHash: `sha256:${string}`;
  reviewedModelCatalogBaseline: ReviewedModelCatalogBaseline;
  upstreamModelId: string;
  label: string;
  channel: string;
  timeoutMs: number;
  generation: { path: string; contentType: string } | null;
  edit: {
    path: string;
    contentType: string;
    minReferences: number;
    maxReferences: number;
    maxUserReferences?: number;
    singleImageField?: string;
    multipleImageField?: string;
    firstReferenceControlsDimensions?: boolean;
    mask?: {
      required: boolean;
      mimeTypes: string[];
      maxBytes: number;
      requiresAlpha: boolean;
      mustMatchFirstImageDimensions: boolean;
      editableAlpha: number;
      preservedAlpha: number;
    };
  };
  sizes?: string[];
  aspectRatios?: string[];
  imageSizes?: string[];
  qualityValues?: string[];
  outputFormats?: string[];
  resolutions?: string[];
  recommendedOptions?: Record<string, RecommendedOptionSpec>;
  outputCounts?: { min: number; max: number };
  dimensions?: {
    multipleOf: number;
    minSide: number;
    maxSide?: number;
    minPixels?: number;
    maxPixels: number;
    maxAspectRatio?: number;
  };
  output: { maxImages?: number };
}

const rawModels = contracts.models as unknown as ImageModelContract[];
const contractMap = new Map(rawModels.map((model) => [model.id, model]));

function hasExactImageModelIds(ids: readonly ImageModelId[]): boolean {
  return ids.length === IMAGE_MODEL_IDS.length
    && ids.every((id, index) => id === IMAGE_MODEL_IDS[index]);
}

for (const id of IMAGE_MODEL_IDS) {
  if (!contractMap.has(id)) throw new Error(`API易模型知识库缺少契约: ${id}`);
}
if (contractMap.size !== IMAGE_MODEL_IDS.length) {
  throw new Error("API易模型知识库与应用模型清单不一致");
}

const reviewedModelCatalogBaseline = rawModels[0]?.reviewedModelCatalogBaseline;
if (
  !reviewedModelCatalogBaseline
  || reviewedModelCatalogBaseline.reviewedExportHashScope !== "sha256-canonical-model-id-set-v1"
  || !hasExactImageModelIds(reviewedModelCatalogBaseline.expectedGatewayModelIds)
  || (
    reviewedModelCatalogBaseline.reviewedExportSha256 !== null
    && !/^[a-f0-9]{64}$/.test(reviewedModelCatalogBaseline.reviewedExportSha256)
  )
  || (
    reviewedModelCatalogBaseline.reviewedRawExportSha256 !== null
    && !/^[a-f0-9]{64}$/.test(reviewedModelCatalogBaseline.reviewedRawExportSha256)
  )
  || (
    (reviewedModelCatalogBaseline.reviewedExportSha256 === null)
    !== (reviewedModelCatalogBaseline.reviewedRawExportSha256 === null)
  )
) {
  throw new Error("API易模型契约缺少有效的 reviewed model catalog baseline");
}
for (const model of rawModels) {
  const baseline = model.reviewedModelCatalogBaseline;
  if (
    !baseline
    || baseline.reviewedExportHashScope !== reviewedModelCatalogBaseline.reviewedExportHashScope
    || baseline.reviewedExportSha256 !== reviewedModelCatalogBaseline.reviewedExportSha256
    || baseline.reviewedRawExportSha256 !== reviewedModelCatalogBaseline.reviewedRawExportSha256
    || !hasExactImageModelIds(baseline.expectedGatewayModelIds)
  ) {
    throw new Error(`API易模型契约的 reviewed model catalog baseline 不一致: ${model.id}`);
  }
}

export const REVIEWED_MODEL_CATALOG_BASELINE: Readonly<ReviewedModelCatalogBaseline> =
  reviewedModelCatalogBaseline;

export function hasReviewedModelCatalogBaseline(): boolean {
  return REVIEWED_MODEL_CATALOG_BASELINE.reviewedExportSha256 !== null
    && REVIEWED_MODEL_CATALOG_BASELINE.reviewedRawExportSha256 !== null;
}

export const DEFAULT_GENERATION_MODEL_ID: GenerationImageModelId = "gpt-image-2.5-flare-vip";
export const MASK_REDRAW_MODEL_ID = "gpt-image-2.5-sunburst" as const;

export const GENERATION_IMAGE_MODEL_IDS = IMAGE_MODEL_IDS.filter(
  (id): id is GenerationImageModelId => id !== MASK_REDRAW_MODEL_ID,
);

export function isImageModelId(value: unknown): value is ImageModelId {
  return typeof value === "string" && (IMAGE_MODEL_IDS as readonly string[]).includes(value);
}

export function getImageModelContract(id: ImageModelId): ImageModelContract {
  return contractMap.get(id)!;
}

export function imageModelContractHash(id: ImageModelId): `sha256:${string}` {
  return getImageModelContract(id).contractHash;
}

export function imageModelLabel(id: ImageModelId): string {
  return getImageModelContract(id).label;
}

const VIP_SIZE_BY_RATIO: Record<string, string> = {
  "1:1": "2048x2048",
  "2:3": "1360x2048",
  "3:2": "2048x1360",
  "3:4": "1536x2048",
  "4:3": "2048x1536",
  "4:5": "1632x2048",
  "5:4": "2048x1632",
  "9:16": "1152x2048",
  "16:9": "2048x1152",
  "21:9": "2048x864",
};

/**
 * VIP 系模型按画幅的三档像素尺寸（快速 / 标准 / 高清）。
 *
 * 取值来源：docs/ai/apiyi/model-contracts.json 各 VIP 模型的 `sizes` 清单（见
 * docs/ai/apiyi/consultations/vip-size-tiers.json 的咨询凭证）；标准档与
 * VIP_SIZE_BY_RATIO 的既有默认一致（如 3:4 = 1536x2048）。
 * 仅 gpt-image-2.5-flare-vip / gpt-image-2.5-sunburst-vip 提供该三档选择
 * （见 imageSizeTierOptions），其他模型的档位走各自契约 recommendedOptions。
 */
export const VIP_SIZE_TIERS_BY_RATIO: Readonly<Record<string, readonly { tier: string; size: string }[]>> = {
  "1:1": [{ tier: "快速", size: "1280x1280" }, { tier: "标准", size: "2048x2048" }, { tier: "高清", size: "2880x2880" }],
  "2:3": [{ tier: "快速", size: "848x1280" }, { tier: "标准", size: "1360x2048" }, { tier: "高清", size: "2336x3520" }],
  "3:2": [{ tier: "快速", size: "1280x848" }, { tier: "标准", size: "2048x1360" }, { tier: "高清", size: "3520x2336" }],
  "3:4": [{ tier: "快速", size: "960x1280" }, { tier: "标准", size: "1536x2048" }, { tier: "高清", size: "2480x3312" }],
  "4:3": [{ tier: "快速", size: "1280x960" }, { tier: "标准", size: "2048x1536" }, { tier: "高清", size: "3312x2480" }],
  "4:5": [{ tier: "快速", size: "1024x1280" }, { tier: "标准", size: "1632x2048" }, { tier: "高清", size: "2560x3216" }],
  "5:4": [{ tier: "快速", size: "1280x1024" }, { tier: "标准", size: "2048x1632" }, { tier: "高清", size: "3216x2560" }],
  "9:16": [{ tier: "快速", size: "720x1280" }, { tier: "标准", size: "1152x2048" }, { tier: "高清", size: "2160x3840" }],
  "16:9": [{ tier: "快速", size: "1280x720" }, { tier: "标准", size: "2048x1152" }, { tier: "高清", size: "3840x2160" }],
  "21:9": [{ tier: "快速", size: "1280x544" }, { tier: "标准", size: "2048x864" }, { tier: "高清", size: "3840x1632" }],
};

/**
 * VIP 系（sunburst-vip / flare-vip）的尺寸档表；非 VIP 模型或未知画幅返回 undefined。
 * 「尺寸」控件与画幅联动填充共用同一查表口，避免两处各写一份档位判断。
 */
export function vipSizeTiersForRatio(
  modelId: ImageModelId,
  aspectRatio: string,
): readonly { tier: string; size: string }[] | undefined {
  if (modelId !== "gpt-image-2.5-flare-vip" && modelId !== "gpt-image-2.5-sunburst-vip") return undefined;
  return VIP_SIZE_TIERS_BY_RATIO[aspectRatio];
}

/** VIP 尺寸默认档（标准档）在档表中的下标——面板删除「自动」项后未设置/非法 size 的落点。 */
export const VIP_SIZE_DEFAULT_TIER_INDEX = 1;

/** VIP 尺寸默认档位像素值；非 VIP 模型或未知画幅返回 undefined。 */
export function vipDefaultSize(modelId: ImageModelId, aspectRatio: string): string | undefined {
  return vipSizeTiersForRatio(modelId, aspectRatio)?.[VIP_SIZE_DEFAULT_TIER_INDEX]?.size;
}

/**
 * 「尺寸」参数选项：仅 VIP 系（sunburst-vip / flare-vip，画幅↔像素尺寸映射族）提供，
 * 其他模型（gemini 的 imageSize 等由契约 recommendedOptions 自带档位）返回 undefined。
 * 不再提供「自动（默认）」项：VIP 的 auto 与不传 size 等价，而删除该项后统一显式选档
 * （未设置时由 vipDefaultSize 落到标准档），从源头避免 multipart 端把 String(undefined)
 * 写成字面量 "undefined" 触发上游 4xx。
 */
export function imageSizeTierOptions(
  modelId: ImageModelId,
  aspectRatio: string,
): { value: string; label: string }[] | undefined {
  const tiers = vipSizeTiersForRatio(modelId, aspectRatio);
  if (!tiers) return undefined;
  return tiers.map((t) => ({ value: t.size, label: `${t.tier} · ${t.size.replace("x", "×")}` }));
}

/**
 * `gpt-image-2.5-all` 不接受 size，唯一可控尺寸的手段是把前缀写在 prompt 最前。
 * 值域取契约 recommendedOptions.promptSizePrefix.examples；标签附实测分辨率，来源为
 * 经审查的官方文档快照
 * docs/ai/apiyi/site/snapshots/2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd/sources/llms-full.txt:4619-4628
 * （「经过验证的『提示词 → 实际分辨率』对照表」）。首项空值 = 不拼前缀，模型自适应
 * （同快照 :8647 记录 1:1 ≈ 1254×1254，快照 :4674 警示自适应允许少量像素偏差）。
 */
const PROMPT_SIZE_PREFIX_RESOLUTION: Readonly<Record<string, string>> = {
  "横版 16:9": "1672×941",
  "竖屏 9:16": "941×1672",
  "4:3": "1448×1086",
  "3:4": "1086×1448",
  "3:2 尺寸": "1536×1024",
  "2:3 尺寸": "1024×1536",
  "2:5 竖屏": "793×1983",
  "5:2 横屏": "1983×793",
};

/** 提示词尺寸前缀下拉选项；契约未声明 promptSizePrefix 的模型返回 undefined。 */
export function imagePromptSizePrefixOptions(
  modelId: ImageModelId,
): { value: string; label: string }[] | undefined {
  const examples = getImageModelContract(modelId).recommendedOptions?.promptSizePrefix?.examples ?? [];
  const prefixes = examples.map(String);
  if (prefixes.length === 0) return undefined;
  return [
    { value: "", label: "不指定（模型自适应）" },
    ...prefixes.map((prefix) => {
      const resolution = PROMPT_SIZE_PREFIX_RESOLUTION[prefix];
      return { value: prefix, label: resolution ? `${prefix} (${resolution})` : prefix };
    }),
  ];
}

const FLUX_DIMENSIONS_BY_RATIO: Record<string, { width: number; height: number }> = {
  "1:1": { width: 2048, height: 2048 },
  "2:3": { width: 1360, height: 2040 },
  "3:2": { width: 2040, height: 1360 },
  "3:4": { width: 1536, height: 2048 },
  "4:3": { width: 2048, height: 1536 },
  "4:5": { width: 1632, height: 2040 },
  "5:4": { width: 2040, height: 1632 },
  "9:16": { width: 1152, height: 2048 },
  "16:9": { width: 2048, height: 1152 },
  "21:9": { width: 2016, height: 864 },
};

/**
 * 默认参数（R5）：数据源从硬编码 switch 改为读 model-contracts.json 每模型的
 * `recommendedOptions` 块；缺省返回 {}（契约 data-model.md §4）。
 * 画幅联动（原 VIP_SIZE_BY_RATIO / FLUX_DIMENSIONS_BY_RATIO 等 size↔ratio 推导）
 * 由 imageModelOptionsForAspectRatio 继续承载（联动填充职责保留）。
 */
export function defaultImageModelOptions(
  modelId: ImageModelId,
  _preferredAspectRatio = "1:1",
): ImageModelOptions {
  const recommended = getImageModelContract(modelId).recommendedOptions ?? {};
  const defaults: ImageModelOptions = {};
  for (const [key, spec] of Object.entries(recommended)) {
    if (spec.default !== undefined) defaults[key] = spec.default;
  }
  return defaults;
}

function objectValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

/**
 * R5（schema v7）：normalize 系列的「丢弃非法值」语义删除，改为「保留用户值」。
 * 运行侧的 warning 接线归 P2-b/P2-c；此处仅保留容忍读取（非法输入退化为空对象），
 * 供既有联动填充函数（imageModelOptionsForAspectRatio）过渡期继续编译。
 */
export function normalizeImageModelOptions(
  _modelId: ImageModelId,
  value: unknown,
): ImageModelOptions {
  const raw = objectValue(value);
  const result: ImageModelOptions = {};
  for (const [key, entry] of Object.entries(raw)) {
    if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      result[key] = entry;
    }
  }
  return result;
}

/**
 * 画幅联动填充（R5：职责保留）。用户已有值优先，缺省项按画幅推导补齐。
 */
export function imageModelOptionsForAspectRatio(
  modelId: ImageModelId,
  current: ImageModelOptions | undefined,
  aspectRatio: string,
): ImageModelOptions {
  const normalized = { ...normalizeImageModelOptions(modelId, current) };
  switch (modelId) {
    case "gpt-image-2.5-sunburst":
    case "gpt-image-2.5-all":
    case "seedream-5-0-260128":
      return normalized;
    case "gpt-image-2.5-sunburst-vip":
    case "gpt-image-2.5-flare-vip":
      return { ...normalized, size: VIP_SIZE_BY_RATIO[aspectRatio] ?? normalized.size };
    case "gemini-3-pro-image-preview":
    case "gemini-3.1-flash-lite-image":
    case "gemini-3.1-flash-image": {
      const allowed = getImageModelContract(modelId).aspectRatios ?? [];
      return allowed.includes(aspectRatio) ? { ...normalized, aspectRatio } : normalized;
    }
    case "flux-2-pro": {
      const dimensions = FLUX_DIMENSIONS_BY_RATIO[aspectRatio];
      return dimensions ? { ...normalized, ...dimensions } : normalized;
    }
  }
}

export function imageModelAspectRatioPatch(
  modelId: ImageModelId | undefined,
  current: ImageModelOptions | undefined,
  aspectRatio: string,
): { aspectRatio: string; modelOptions: ImageModelOptions } {
  const resolvedModelId = modelId ?? DEFAULT_GENERATION_MODEL_ID;
  return {
    aspectRatio,
    modelOptions: imageModelOptionsForAspectRatio(resolvedModelId, current, aspectRatio),
  };
}

export function imageModelOptionsError(modelId: ImageModelId, value: unknown): string | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return "must be an object";
  return undefined;
}

/**
 * R5（schema v7）：模型参数校验从硬失败降级为 warning。永不返回错误；
 * 调用方不得据此拒绝保存/运行（契约 data-model.md §4）。
 * - 未知 key → warning「参数 {key} 不在模型 {id} 的已知参数中」
 * - 值不在契约推荐集合 → warning「{key}={v} 不在推荐取值 {examples} 中」
 */
export function imageModelOptionsWarnings(modelId: ImageModelId, value: unknown): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
  const recommended = getImageModelContract(modelId).recommendedOptions ?? {};
  const known = new Set(Object.keys(recommended));
  // 既有清单字段（sizes/aspectRatios/imageSizes/qualityValues/outputFormats/dimensions）
  // 降级为“已知取值参考”，同样视为已知参数。
  const contract = getImageModelContract(modelId);
  if (contract.sizes) for (const key of ["size"]) known.add(key);
  if (contract.aspectRatios) for (const key of ["aspectRatio"]) known.add(key);
  if (contract.imageSizes) for (const key of ["imageSize"]) known.add(key);
  if (contract.qualityValues) for (const key of ["quality"]) known.add(key);
  if (contract.outputFormats) for (const key of ["outputFormat"]) known.add(key);
  if (contract.dimensions) for (const key of ["width", "height"]) known.add(key);
  const warnings: string[] = [];
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (raw === undefined) continue;
    if (typeof raw !== "string" && typeof raw !== "number" && typeof raw !== "boolean") continue;
    if (!known.has(key)) {
      warnings.push(`参数 ${key} 不在模型 ${modelId} 的已知参数中`);
      continue;
    }
    const spec = recommended[key];
    if (spec?.examples && spec.examples.length > 0 && !spec.examples.includes(raw)) {
      warnings.push(`${key}=${String(raw)} 不在推荐取值 ${spec.examples.map((item) => String(item)).join("、")} 中`);
    }
  }
  return warnings;
}

/**
 * R5 / mode 归属反转（schema v7）：操作模式由提示词变体携带（variant.mode），
 * 节点不再自描述 operationMode，mode 感知包装层随之删除。
 * 运行侧的参数 warning 接线（原 4 处调用点）归 P2-b/P2-c。
 */

/**
 * 模型×节点类型闸（契约 data-model.md §3 保留检查第 1 条的前半）：
 * 图片模型只允许用于 image 节点。`gpt-image-2.5-sunburst` 仅蒙版变体可用的
 * 限制改由变体声明（needsMask）驱动，在运行准入层执行（P2-b，见 runtime.md）。
 */
export function isModelAllowedForNode(modelId: ImageModelId, nodeKind: string): boolean {
  return nodeKind === "image";
}

/**
 * v8 生成节点「画幅」取值域（单一事实源）：契约声明 `aspectRatios` 时以契约为准；
 * 契约未声明时回落到 v7 归一化同源的业务画幅清单。节点组件不得自行硬编码画幅枚举。
 */
export const IMAGE_ASPECT_RATIO_OPTIONS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;

export function imageAspectRatioOptions(modelId: ImageModelId): readonly string[] {
  const declared = getImageModelContract(modelId).aspectRatios;
  return declared && declared.length > 0 ? declared : IMAGE_ASPECT_RATIO_OPTIONS;
}

export function modelMaxReferenceImages(modelId: ImageModelId): number {
  return Math.min(8, getImageModelContract(modelId).edit.maxReferences);
}

export function modelMaximumImagesPerRequest(modelId: ImageModelId): number {
  return getImageModelContract(modelId).output.maxImages ?? 1;
}
