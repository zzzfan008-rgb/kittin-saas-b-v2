import type { GenerationImageModelId, ImageModelId, ImageModelOptions } from "./imageModels";
import type { ImageOperationMode } from "./imageOperations";

export type GarmentTaskFamilyId =
  | "fashion-lookbook"
  | "commerce-hero"
  | "design-sheet"
  | "upscale"
  | "print-extract"
  | "print-mutate"
  | "fabric-recolor";

interface ParameterProfileBase {
  profileId: string;
  /** Semantic version of the complete discriminated parameter profile. */
  version: "1.0.0";
  familyId: GarmentTaskFamilyId | "mask-local-edit";
  modelId: ImageModelId;
  mode: ImageOperationMode;
  businessFrame: {
    aspectRatio: "1:1" | "3:4" | "4:3" | "source";
    requestedOutputs: 1;
  };
  postprocess: {
    version: "fit-contain-dominant-webp-v1" | "mask-composite-png-v3";
    strategy: "contain-with-dominant-padding" | "exact-outside-mask-protection";
    finalAspectRatio: "1:1" | "3:4" | "4:3" | "source";
  };
}

export type ModelParameterProfile =
  | (ParameterProfileBase & {
      modelId: "gpt-image-2.5-sunburst";
      mode: "mask-edit";
      native: {
        kind: "gpt-image-2-mask";
        size: "source-pixel-dimensions";
        mask: "alpha-png";
        userReferenceLimit: 7;
        systemGuideImages: 1;
      };
    })
  | (ParameterProfileBase & {
      modelId: "gpt-image-2.5-flare-vip";
      native: {
        kind: "gpt-image-2-vip";
        size: string;
        referenceLimit: 8;
        omittedFields: readonly ["quality", "n", "aspect_ratio"];
        /**
         * `source` 画幅时尺寸不能回退到默认比例；必须从参考图推导。
         * 标记 true 以 fail-closed 方式保留此约束，等待后端运行时解析首图尺寸后填充。
         */
        derivedFromFirstReference?: true;
      };
    })
  | (ParameterProfileBase & {
      modelId: "gemini-3.1-flash-image";
      native: {
        kind: "gemini-image";
        aspectRatio: "1:1" | "3:4" | "4:3";
        imageSize: "2K";
        referenceLimit: 8;
        emptyImageOnHttp200IsError: true;
      };
    })
  | (ParameterProfileBase & {
      modelId: "flux-2-pro";
      native: {
        kind: "flux-image";
        width: number;
        height: number;
        multipleOf: 16;
        maxPixels: 4_194_304;
        outputFormat: "png";
        referenceLimit: 8;
        /**
         * `source` 画幅时尺寸不能回退到默认比例；必须从参考图推导。
         * 标记 true 以 fail-closed 方式保留此约束，等待后端运行时解析首图尺寸后填充。
         */
        derivedFromFirstReference?: true;
      };
    })
  | (ParameterProfileBase & {
      modelId: "seedream-5-0-260128";
      native: {
        kind: "seedream-image";
        size: "2K";
        responseFormat: "b64_json";
        watermark: false;
        sequentialImageGeneration: "disabled";
        referenceLimit: 8;
        aspectRatioField: "unsupported";
        forbiddenFields: readonly ["n", "aspect_ratio"];
        recordActualOutputSize: true;
      };
    });

type FamilyFrame = "1:1" | "3:4" | "4:3" | "source";

const FAMILY_FRAMES: Record<GarmentTaskFamilyId, FamilyFrame> = {
  "fashion-lookbook": "3:4",
  "commerce-hero": "1:1",
  "design-sheet": "4:3",
  "upscale": "source",
  "print-extract": "1:1",
  "print-mutate": "1:1",
  "fabric-recolor": "source",
};

const VIP_SIZE: Record<"1:1" | "3:4" | "4:3", string> = {
  "1:1": "2048x2048",
  "3:4": "1536x2048",
  "4:3": "2048x1536",
};

const FLUX_DIMENSIONS: Record<"1:1" | "3:4" | "4:3", { width: number; height: number }> = {
  "1:1": { width: 2048, height: 2048 },
  "3:4": { width: 1536, height: 2048 },
  "4:3": { width: 2048, height: 1536 },
};

/**
 * `source` 画幅对 vip / flux 两模型的 native 尺寸无法从固定比例表查得。
 * 按契约要求，这两模型必须显式给定输出尺寸；运行时 edit 路径必有参考图，
 * 因此 native 尺寸声明为「从参考图推导」。具体尺寸换算由后端运行时解析首图
 * 元数据后填入 Provider 请求（backend 职责，见 prompt-variant-schema.md
 * R-59 裁定记录「约束 1」与本卡边界）。
 */
const SOURCE_DERIVED_SIZE_MARKER = "source-derived" as const;
const SOURCE_DERIVED_DIMENSIONS_MARKER = {
  width: 0,
  height: 0,
  derivedFromFirstReference: true,
} as const;

const GENERAL_MODELS = [
  "gpt-image-2.5-flare-vip",
  "gemini-3.1-flash-image",
  "flux-2-pro",
  "seedream-5-0-260128",
] as const satisfies readonly GenerationImageModelId[];
const GENERAL_MODES: readonly Exclude<ImageOperationMode, "mask-edit">[] = ["generate", "edit"];
const FAMILIES = Object.keys(FAMILY_FRAMES) as GarmentTaskFamilyId[];
const EDIT_ONLY_FAMILIES: readonly GarmentTaskFamilyId[] = ["upscale", "print-extract", "print-mutate", "fabric-recolor"];

function generalProfile(
  modelId: (typeof GENERAL_MODELS)[number],
  familyId: GarmentTaskFamilyId,
  mode: "generate" | "edit",
): ModelParameterProfile {
  const aspectRatio = FAMILY_FRAMES[familyId];
  const base = {
    profileId: `${modelId}:${familyId}:${mode}:v1`,
    version: "1.0.0" as const,
    familyId,
    modelId,
    mode,
    businessFrame: { aspectRatio, requestedOutputs: 1 as const },
    postprocess: {
      version: "fit-contain-dominant-webp-v1" as const,
      strategy: "contain-with-dominant-padding" as const,
      finalAspectRatio: aspectRatio,
    },
  };
  switch (modelId) {
    case "gpt-image-2.5-flare-vip": {
      const derivedFromFirstReference = aspectRatio === "source" ? true as const : undefined;
      const size = aspectRatio === "source" ? SOURCE_DERIVED_SIZE_MARKER : VIP_SIZE[aspectRatio];
      return { ...base, modelId, native: {
        kind: "gpt-image-2-vip", size, referenceLimit: 8,
        omittedFields: ["quality", "n", "aspect_ratio"],
        ...(derivedFromFirstReference ? { derivedFromFirstReference } : {}),
      } };
    }
    case "gemini-3.1-flash-image":
      // Gemini aspectRatio 不接受 "source"·运行时 edit 有参考图，通过 imageModelOptionsForAspectRatio
      // 从首图实际比例转换为契约支持的固定比例后填充（不在档案本体约束）。
      return { ...base, modelId, native: {
        kind: "gemini-image", aspectRatio: aspectRatio === "source" ? "1:1" : aspectRatio,
        imageSize: "2K", referenceLimit: 8, emptyImageOnHttp200IsError: true,
      } };
    case "flux-2-pro": {
      const derivedFromFirstReference = aspectRatio === "source" ? true as const : undefined;
      const dimensions = aspectRatio === "source"
        ? SOURCE_DERIVED_DIMENSIONS_MARKER
        : FLUX_DIMENSIONS[aspectRatio];
      return { ...base, modelId, native: {
        kind: "flux-image", ...dimensions, multipleOf: 16,
        maxPixels: 4_194_304, outputFormat: "png", referenceLimit: 8,
        ...(derivedFromFirstReference ? { derivedFromFirstReference } : {}),
      } };
    }
    case "seedream-5-0-260128":
      return { ...base, modelId, native: {
        kind: "seedream-image", size: "2K", referenceLimit: 8,
        responseFormat: "b64_json", watermark: false,
        sequentialImageGeneration: "disabled", aspectRatioField: "unsupported",
        forbiddenFields: ["n", "aspect_ratio"], recordActualOutputSize: true,
      } };
  }
}

const maskProfile: ModelParameterProfile = {
  profileId: "gpt-image-2.5-sunburst:mask-local-edit:mask-edit:v1",
  version: "1.0.0",
  familyId: "mask-local-edit",
  modelId: "gpt-image-2.5-sunburst",
  mode: "mask-edit",
  businessFrame: { aspectRatio: "source", requestedOutputs: 1 },
  native: {
    kind: "gpt-image-2-mask",
    size: "source-pixel-dimensions",
    mask: "alpha-png",
    userReferenceLimit: 7,
    systemGuideImages: 1,
  },
  postprocess: {
    version: "mask-composite-png-v3",
    strategy: "exact-outside-mask-protection",
    finalAspectRatio: "source",
  },
};

export const MODEL_PARAMETER_PROFILES: readonly ModelParameterProfile[] = [
  ...GENERAL_MODELS.flatMap((modelId) => FAMILIES.flatMap((familyId) => {
    const modes = EDIT_ONLY_FAMILIES.includes(familyId) ? ["edit"] as const : GENERAL_MODES;
    return modes.map((mode) => generalProfile(modelId, familyId, mode));
  })),
  maskProfile,
];

const PROFILE_BY_ID = new Map(MODEL_PARAMETER_PROFILES.map((profile) => [profile.profileId, profile]));

/** 精确查询，不存在跨模型或跨模式回退。 */
export function getModelParameterProfile(profileId: string): ModelParameterProfile | undefined {
  return PROFILE_BY_ID.get(profileId);
}

export interface MaterializedModelParameterProfile {
  aspectRatio: "1:1" | "3:4" | "4:3" | "source";
  batchSize: 1;
  modelOptions: ImageModelOptions;
  ignoredNativeFields: readonly string[];
}

/**
 * Convert a reviewed discriminated profile into an explicit node patch preview.
 * Callers must show this result and obtain confirmation before applying it.
 */
export function materializeModelParameterProfile(
  profile: ModelParameterProfile,
): MaterializedModelParameterProfile {
  const aspectRatio = profile.businessFrame.aspectRatio;
  switch (profile.native.kind) {
    case "gpt-image-2-mask":
      return { aspectRatio, batchSize: 1, modelOptions: {}, ignoredNativeFields: [] };
    case "gpt-image-2-vip":
      return {
        aspectRatio,
        batchSize: 1,
        modelOptions: { size: profile.native.size },
        ignoredNativeFields: profile.native.omittedFields,
      };
    case "gemini-image":
      return {
        aspectRatio,
        batchSize: 1,
        modelOptions: {
          aspectRatio: profile.native.aspectRatio,
          imageSize: profile.native.imageSize,
        },
        ignoredNativeFields: [],
      };
    case "flux-image":
      return {
        aspectRatio,
        batchSize: 1,
        modelOptions: profile.native.derivedFromFirstReference
          ? { outputFormat: profile.native.outputFormat }
          : {
              width: profile.native.width,
              height: profile.native.height,
              outputFormat: profile.native.outputFormat,
            },
        ignoredNativeFields: [],
      };
    case "seedream-image":
      return {
        aspectRatio,
        batchSize: 1,
        modelOptions: { size: profile.native.size },
        ignoredNativeFields: profile.native.forbiddenFields,
      };
  }
}
