import type { GenerationImageModelId, ImageModelId, ImageModelOptions } from "./imageModels";
import type { ImageOperationMode } from "./imageOperations";

export type GarmentTaskFamilyId = "fashion-lookbook" | "commerce-hero" | "design-sheet";

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
      modelId: "gpt-image-2";
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
      modelId: "gpt-image-2-vip";
      native: {
        kind: "gpt-image-2-vip";
        size: string;
        referenceLimit: 8;
        omittedFields: readonly ["quality", "n", "aspect_ratio"];
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

const FAMILY_FRAMES: Record<GarmentTaskFamilyId, "1:1" | "3:4" | "4:3"> = {
  "fashion-lookbook": "3:4",
  "commerce-hero": "1:1",
  "design-sheet": "4:3",
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

const GENERAL_MODELS: readonly GenerationImageModelId[] = [
  "gpt-image-2-vip",
  "gemini-3.1-flash-image",
  "flux-2-pro",
  "seedream-5-0-260128",
];
const GENERAL_MODES: readonly Exclude<ImageOperationMode, "mask-edit">[] = ["generate", "edit"];
const FAMILIES = Object.keys(FAMILY_FRAMES) as GarmentTaskFamilyId[];

function generalProfile(
  modelId: GenerationImageModelId,
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
    case "gpt-image-2-vip":
      return { ...base, modelId, native: {
        kind: "gpt-image-2-vip", size: VIP_SIZE[aspectRatio], referenceLimit: 8,
        omittedFields: ["quality", "n", "aspect_ratio"],
      } };
    case "gemini-3.1-flash-image":
      return { ...base, modelId, native: {
        kind: "gemini-image", aspectRatio, imageSize: "2K", referenceLimit: 8,
        emptyImageOnHttp200IsError: true,
      } };
    case "flux-2-pro":
      return { ...base, modelId, native: {
        kind: "flux-image", ...FLUX_DIMENSIONS[aspectRatio], multipleOf: 16,
        maxPixels: 4_194_304, outputFormat: "png", referenceLimit: 8,
      } };
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
  profileId: "gpt-image-2:mask-local-edit:mask-edit:v1",
  version: "1.0.0",
  familyId: "mask-local-edit",
  modelId: "gpt-image-2",
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
  ...GENERAL_MODELS.flatMap((modelId) => FAMILIES.flatMap((familyId) => (
    GENERAL_MODES.map((mode) => generalProfile(modelId, familyId, mode))
  ))),
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
        modelOptions: {
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
