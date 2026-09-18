import contracts from "../../docs/ai/apiyi/model-contracts.json";
import type { ImageOperationMode } from "./imageOperations";

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

export interface ImageModelOptions {
  size?: string;
  aspectRatio?: string;
  imageSize?: string;
  width?: number;
  height?: number;
  outputFormat?: "jpeg" | "png" | "webp";
  quality?: string;
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

export function isModelAllowedForNode(modelId: ImageModelId, nodeKind: string): boolean {
  return nodeKind === "mask-redraw"
    ? modelId === MASK_REDRAW_MODEL_ID
    : modelId !== MASK_REDRAW_MODEL_ID;
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

export function defaultImageModelOptions(
  modelId: ImageModelId,
  preferredAspectRatio = "1:1",
): ImageModelOptions {
  switch (modelId) {
    case "gpt-image-2.5-sunburst":
    case "gpt-image-2.5-all":
      return {};
    case "gpt-image-2.5-sunburst-vip":
    case "gpt-image-2.5-flare-vip":
      return { size: VIP_SIZE_BY_RATIO[preferredAspectRatio] ?? VIP_SIZE_BY_RATIO["1:1"] };
    case "gemini-3-pro-image-preview": {
      const allowed = getImageModelContract(modelId).aspectRatios ?? [];
      return {
        aspectRatio: allowed.includes(preferredAspectRatio) ? preferredAspectRatio : "1:1",
        imageSize: "2K",
      };
    }
    case "gemini-3.1-flash-lite-image": {
      const allowed = getImageModelContract(modelId).aspectRatios ?? [];
      return {
        aspectRatio: allowed.includes(preferredAspectRatio) ? preferredAspectRatio : "1:1",
        imageSize: "1K",
      };
    }
    case "gemini-3.1-flash-image": {
      const allowed = getImageModelContract(modelId).aspectRatios ?? [];
      return {
        aspectRatio: allowed.includes(preferredAspectRatio) ? preferredAspectRatio : "1:1",
        imageSize: "2K",
      };
    }
    case "flux-2-pro": {
      const dimensions = FLUX_DIMENSIONS_BY_RATIO[preferredAspectRatio] ?? FLUX_DIMENSIONS_BY_RATIO["1:1"];
      return { ...dimensions, outputFormat: "png" };
    }
    case "seedream-5-0-260128":
      return { size: "2K" };
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeImageModelOptions(
  modelId: ImageModelId,
  value: unknown,
  preferredAspectRatio = "1:1",
): ImageModelOptions {
  const raw = objectValue(value);
  const defaults = defaultImageModelOptions(modelId, preferredAspectRatio);
  switch (modelId) {
    case "gpt-image-2.5-sunburst": {
      const dimensions = getImageModelContract(modelId).dimensions!;
      const match = typeof raw.size === "string" ? /^(\d+)x(\d+)$/.exec(raw.size) : null;
      const width = Number(match?.[1]);
      const height = Number(match?.[2]);
      const aspectRatio = Math.max(width / height, height / width);
      const valid = Number.isInteger(width) && Number.isInteger(height)
        && width > 0 && height > 0
        && width % dimensions.multipleOf === 0 && height % dimensions.multipleOf === 0
        && width <= (dimensions.maxSide ?? Number.POSITIVE_INFINITY)
        && height <= (dimensions.maxSide ?? Number.POSITIVE_INFINITY)
        && width * height >= (dimensions.minPixels ?? 0)
        && width * height <= dimensions.maxPixels
        && aspectRatio <= (dimensions.maxAspectRatio ?? Number.POSITIVE_INFINITY);
      const result: ImageModelOptions = {};
      if (valid) result.size = raw.size as string;
      const qualityValues = getImageModelContract(modelId).qualityValues ?? [];
      if (typeof raw.quality === "string" && qualityValues.includes(raw.quality)) result.quality = raw.quality;
      return result;
    }
    case "gpt-image-2.5-all":
      return {};
    case "gpt-image-2.5-sunburst-vip":
    case "gpt-image-2.5-flare-vip": {
      const sizes = getImageModelContract(modelId).sizes ?? [];
      const result: ImageModelOptions = {
        size: typeof raw.size === "string" && sizes.includes(raw.size) ? raw.size : defaults.size,
      };
      const qualityValues = getImageModelContract(modelId).qualityValues ?? [];
      if (typeof raw.quality === "string" && qualityValues.includes(raw.quality)) result.quality = raw.quality;
      return result;
    }
    case "gemini-3-pro-image-preview":
    case "gemini-3.1-flash-lite-image": {
      const contract = getImageModelContract(modelId);
      return {
        aspectRatio: typeof raw.aspectRatio === "string" && contract.aspectRatios?.includes(raw.aspectRatio)
          ? raw.aspectRatio
          : defaults.aspectRatio,
        imageSize: typeof raw.imageSize === "string" && contract.imageSizes?.includes(raw.imageSize)
          ? raw.imageSize
          : defaults.imageSize,
      };
    }
    case "gemini-3.1-flash-image": {
      const contract = getImageModelContract(modelId);
      return {
        aspectRatio: typeof raw.aspectRatio === "string" && contract.aspectRatios?.includes(raw.aspectRatio)
          ? raw.aspectRatio
          : defaults.aspectRatio,
        imageSize: typeof raw.imageSize === "string" && contract.imageSizes?.includes(raw.imageSize)
          ? raw.imageSize
          : defaults.imageSize,
      };
    }
    case "flux-2-pro": {
      const dimensions = getImageModelContract(modelId).dimensions!;
      const width = Number(raw.width);
      const height = Number(raw.height);
      const validDimensions = Number.isInteger(width) && Number.isInteger(height)
        && width >= dimensions.minSide && height >= dimensions.minSide
        && width % dimensions.multipleOf === 0 && height % dimensions.multipleOf === 0
        && width * height <= dimensions.maxPixels;
      const outputFormat = raw.outputFormat === "jpeg" || raw.outputFormat === "png"
        ? raw.outputFormat
        : defaults.outputFormat;
      return validDimensions ? { width, height, outputFormat } : defaults;
    }
    case "seedream-5-0-260128": {
      const sizes = getImageModelContract(modelId).sizes ?? [];
      return { size: typeof raw.size === "string" && sizes.includes(raw.size) ? raw.size : defaults.size };
    }
  }
}

export function imageModelOptionsForAspectRatio(
  modelId: ImageModelId,
  current: ImageModelOptions | undefined,
  aspectRatio: string,
): ImageModelOptions {
  const normalized = normalizeImageModelOptions(modelId, current, aspectRatio);
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
  const raw = value as Record<string, unknown>;
  const normalized = normalizeImageModelOptions(modelId, raw);
  const allowedKeys: Record<ImageModelId, readonly string[]> = {
    "gpt-image-2.5-sunburst": ["size", "quality"],
    "gpt-image-2.5-all": [],
    "gpt-image-2.5-sunburst-vip": ["size", "quality"],
    "gpt-image-2.5-flare-vip": ["size", "quality"],
    "gemini-3-pro-image-preview": ["aspectRatio", "imageSize"],
    "gemini-3.1-flash-lite-image": ["aspectRatio", "imageSize"],
    "gemini-3.1-flash-image": ["aspectRatio", "imageSize"],
    "flux-2-pro": ["width", "height", "outputFormat"],
    "seedream-5-0-260128": ["size"],
  };
  const unknown = Object.keys(raw).find((key) => !allowedKeys[modelId].includes(key));
  if (unknown) return `contains unsupported parameter ${unknown}`;
  const normalizedEntries = Object.entries(normalized);
  if (Object.keys(raw).length !== normalizedEntries.length) {
    return "contains an unsupported or incomplete model option";
  }
  if (normalizedEntries.some(([key, expected]) => raw[key] !== expected)) {
    return "contains an unsupported or incomplete model option";
  }
  return undefined;
}

/** Mode-aware validation for parameters whose gateway meaning changes between generate and edit. */
export function imageModelOptionsErrorForOperation(
  modelId: ImageModelId,
  value: unknown,
  _operationMode: ImageOperationMode,
): string | undefined {
  return imageModelOptionsError(modelId, value);
}

export function normalizeImageModelOptionsForOperation(
  modelId: ImageModelId,
  value: unknown,
  preferredAspectRatio: string,
  _operationMode: ImageOperationMode,
): ImageModelOptions {
  return normalizeImageModelOptions(modelId, value, preferredAspectRatio);
}

export function modelMaxReferenceImages(modelId: ImageModelId): number {
  return Math.min(8, getImageModelContract(modelId).edit.maxReferences);
}

export function modelMaximumImagesPerRequest(modelId: ImageModelId): number {
  return getImageModelContract(modelId).output.maxImages ?? 1;
}
