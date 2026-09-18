import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import contracts from "../docs/ai/apiyi/model-contracts.json";
import {
  GARMENT_PROMPT_PRESETS,
  GARMENT_PROMPT_VARIANTS,
  type PromptVariant,
} from "../src/lib/garmentPromptPresets";
import {
  IMAGE_MODEL_IDS,
  type ImageModelId,
  getImageModelContract,
} from "../src/types/imageModels";
import {
  NODE_SPECS,
  allowedOperationModesForNode,
  type ImageOperationMode,
  type NodeKind,
} from "../src/types/workflow";
import {
  getModelParameterProfile,
  type ModelParameterProfile,
} from "../src/types/modelParameterProfiles";

const OUTPUT_PATH = fileURLToPath(new URL("../docs/ai/evaluation/node-prompt-parameter-matrix-v1.json", import.meta.url));

const MATRIX_NODE_KINDS = [
  "sketch-to-render",
  "ai-modify",
  "mask-redraw",
  "fabric-recolor",
  "upscale",
  "print-extract",
  "print-mutate",
] as const satisfies readonly NodeKind[];

type MatrixNodeKind = (typeof MATRIX_NODE_KINDS)[number];
type MatrixSupportStatus = "unverified" | "unsupported";
type WireFormat = "application/json" | "multipart/form-data";

interface PromptReviewEntry {
  promptVariantId: string;
  familyId: PromptVariant["familyId"];
  mode: PromptVariant["mode"];
  nodeKind: NodeKind;
  locale: PromptVariant["promptLocale"];
  promptSha256: `sha256:${string}`;
  templateName: string;
  checklist: readonly [
    "subject-task",
    "composition",
    "style-material",
    "text-label",
    "aspect-output",
    "negative-constraints",
  ];
}

interface ParameterProfileEntry {
  parameterProfileId: string;
  familyId: string;
  mode: ImageOperationMode;
  version: string;
  businessFrame: ModelParameterProfile["businessFrame"];
  native: ModelParameterProfile["native"];
  postprocess: ModelParameterProfile["postprocess"];
}

interface ProviderRequestEntry {
  mode: ImageOperationMode;
  endpoint: { method: "POST"; path: string; contentType: WireFormat };
  timeoutMs: number;
  requiredFields: readonly string[];
  omittedFields: readonly string[];
  forbiddenFields: readonly string[];
  referenceInputs: {
    userMax: number;
    totalMax: number;
    encoding: string;
    orderSemantics: string;
  };
  output: {
    fields: readonly string[];
    maxImages: number;
    handling: string;
    urlTtlSeconds?: number;
    recordsActualProviderSize?: boolean;
  };
}

export interface NodePromptParameterMatrixEntry {
  nodeKind: MatrixNodeKind;
  nodeTitle: string;
  modelId: ImageModelId;
  operationModes: readonly ImageOperationMode[];
  supportStatus: MatrixSupportStatus;
  productPolicy: {
    status: "supported" | "unsupported";
    reason?: string;
  };
  promptVariantId: string | null;
  promptVariantIds: readonly string[];
  promptReview: readonly PromptReviewEntry[];
  parameterProfileId: string | null;
  parameterProfileIds: readonly string[];
  parameterProfiles: readonly ParameterProfileEntry[];
  providerRequests: readonly ProviderRequestEntry[];
  failClosedReason: string | null;
}

export interface NodePromptParameterMatrix {
  schemaVersion: 1;
  version: "node-prompt-parameter-matrix-v1";
  generatedAt: string;
  evidenceStatus: "offline-contract-review-only";
  sourceSkills: readonly ["awesome-gpt-image-2", "apiyi"];
  sourceContracts: {
    modelCatalogReviewedExportSha256: string | null;
    modelCatalogReviewedRawExportSha256: string | null;
    modelContractIds: readonly ImageModelId[];
  };
  scope: {
    nodeKinds: readonly MatrixNodeKind[];
    modelIds: readonly ImageModelId[];
    entryCount: number;
    supportedEntryCount: number;
    unsupportedEntryCount: number;
    unsupportedNodesRemainFailClosed: true;
    noProviderCallsPerformed: true;
    imageGenerationOrEditCalls: 0;
  };
  entries: readonly NodePromptParameterMatrixEntry[];
}

function sha256(value: string): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function contractOutput(modelId: ImageModelId): Record<string, unknown> {
  const model = (contracts.models as Array<Record<string, unknown>>).find((candidate) => candidate.id === modelId);
  if (!model || typeof model.output !== "object" || model.output === null) {
    throw new Error(`missing output contract for ${modelId}`);
  }
  return model.output as Record<string, unknown>;
}

function promptReview(variant: PromptVariant): PromptReviewEntry {
  const preset = GARMENT_PROMPT_PRESETS.find((candidate) => candidate.id === variant.familyId);
  if (!preset) {
    return {
      promptVariantId: variant.variantId,
      familyId: variant.familyId,
      mode: variant.mode,
      nodeKind: variant.nodeKind,
      locale: variant.promptLocale,
      promptSha256: sha256(variant.fullPrompt),
      templateName: "GPT Image 2 mask-local-edit contract",
      checklist: ["subject-task", "composition", "style-material", "text-label", "aspect-output", "negative-constraints"],
    };
  }
  return {
    promptVariantId: variant.variantId,
    familyId: variant.familyId,
    mode: variant.mode,
    nodeKind: variant.nodeKind,
    locale: variant.promptLocale,
    promptSha256: sha256(variant.fullPrompt),
    templateName: preset.templateName,
    checklist: ["subject-task", "composition", "style-material", "text-label", "aspect-output", "negative-constraints"],
  };
}

function parameterProfileEntry(profileId: string): ParameterProfileEntry {
  const profile = getModelParameterProfile(profileId);
  if (!profile) throw new Error(`missing parameter profile ${profileId}`);
  return {
    parameterProfileId: profile.profileId,
    familyId: profile.familyId,
    mode: profile.mode,
    version: profile.version,
    businessFrame: profile.businessFrame,
    native: profile.native,
    postprocess: profile.postprocess,
  };
}

function standardProviderRequests(modelId: Exclude<ImageModelId, "gpt-image-2.5-sunburst">, modes: readonly ImageOperationMode[]): ProviderRequestEntry[] {
  const contract = getImageModelContract(modelId);
  const output = contractOutput(modelId);
  const outputFields = Array.isArray(output.fields) ? output.fields.filter((field): field is string => typeof field === "string") : [];
  const maxImages = typeof output.maxImages === "number" ? output.maxImages : 1;
  const referenceLimit = Math.min(8, contract.edit.maxReferences);
  const requests: ProviderRequestEntry[] = [];
  for (const mode of modes) {
    if (mode === "mask-edit") continue;
    if (modelId === "gpt-image-2.5-flare-vip") {
      requests.push({
        mode,
        endpoint: {
          method: "POST",
          path: mode === "generate" ? contract.generation!.path : contract.edit.path,
          contentType: mode === "generate" ? "application/json" : "multipart/form-data",
        },
        timeoutMs: contract.timeoutMs,
        requiredFields: mode === "generate"
          ? ["model", "prompt", "size"]
          : ["model", "prompt", "size", "image (repeated)"],
        omittedFields: ["response_format"],
        forbiddenFields: ["quality", "n", "aspect_ratio"],
        referenceInputs: {
          userMax: mode === "generate" ? 0 : referenceLimit,
          totalMax: mode === "generate" ? 0 : referenceLimit,
          encoding: mode === "generate" ? "none" : "multipart image field repeated as image",
          orderSemantics: mode === "generate" ? "no reference images" : "image occurrence order equals prompt 图号",
        },
        output: {
          fields: outputFields,
          maxImages,
          handling: "persist provider original; b64_json becomes project data URL and url is downloaded immediately",
        },
      });
      continue;
    }
    if (modelId === "gemini-3.1-flash-image") {
      requests.push({
        mode,
        endpoint: { method: "POST", path: contract.generation!.path, contentType: "application/json" },
        timeoutMs: contract.timeoutMs,
        requiredFields: mode === "generate"
          ? [
            "contents[0].parts[0].text",
            "generationConfig.responseModalities=[IMAGE]",
            "generationConfig.imageConfig.aspectRatio",
            "generationConfig.imageConfig.imageSize",
          ]
          : [
            "contents[0].parts[0].text",
            "contents[0].parts[].inlineData.mimeType",
            "contents[0].parts[].inlineData.data",
            "generationConfig.responseModalities=[IMAGE]",
            "generationConfig.imageConfig.aspectRatio",
            "generationConfig.imageConfig.imageSize",
          ],
        omittedFields: [],
        forbiddenFields: [],
        referenceInputs: {
          userMax: mode === "generate" ? 0 : referenceLimit,
          totalMax: mode === "generate" ? 0 : referenceLimit,
          encoding: mode === "generate" ? "none" : "ordered inlineData parts after the text part; WebP converted to PNG",
          orderSemantics: mode === "generate" ? "no reference images" : "parts order equals prompt 图号",
        },
        output: {
          fields: outputFields,
          maxImages,
          handling: "scan every candidates[].content.parts[].inlineData and persist validated provider originals",
        },
      });
      continue;
    }
    if (modelId === "flux-2-pro") {
      requests.push({
        mode,
        endpoint: {
          method: "POST",
          path: mode === "generate" ? contract.generation!.path : contract.edit.path,
          contentType: "application/json",
        },
        timeoutMs: contract.timeoutMs,
        requiredFields: mode === "generate"
          ? ["model", "prompt", "width", "height", "output_format"]
          : ["model", "prompt", "width", "height", "output_format", "input_image", "input_image_2..input_image_8 (ordered, as present)"],
        omittedFields: ["size", "aspect_ratio"],
        forbiddenFields: ["n"],
        referenceInputs: {
          userMax: mode === "generate" ? 0 : referenceLimit,
          totalMax: mode === "generate" ? 0 : referenceLimit,
          encoding: mode === "generate" ? "none" : "input_image, input_image_2 ... input_image_8 JSON fields",
          orderSemantics: mode === "generate" ? "no reference images" : "field suffix order equals prompt 图号",
        },
        output: {
          fields: outputFields,
          maxImages,
          handling: "download temporary URL immediately and persist provider original",
          urlTtlSeconds: typeof output.urlTtlSeconds === "number" ? output.urlTtlSeconds : 600,
        },
      });
      continue;
    }
    requests.push({
      mode,
      endpoint: {
        method: "POST",
        path: mode === "generate" ? contract.generation!.path : contract.edit.path,
        contentType: "application/json",
      },
      timeoutMs: contract.timeoutMs,
      requiredFields: mode === "generate"
        ? ["model", "prompt", "size", "response_format=b64_json", "watermark=false", "sequential_image_generation=disabled"]
        : ["model", "prompt", "image (ordered array)", "size", "response_format=b64_json", "watermark=false", "sequential_image_generation=disabled"],
      omittedFields: ["aspect_ratio"],
      forbiddenFields: ["n"],
      referenceInputs: {
        userMax: mode === "generate" ? 0 : referenceLimit,
        totalMax: mode === "generate" ? 0 : referenceLimit,
        encoding: mode === "generate" ? "none" : "image JSON array of URL/data URI values",
        orderSemantics: mode === "generate" ? "no reference images" : "array order equals prompt 图号",
      },
      output: {
        fields: outputFields,
        maxImages,
        handling: "accept b64_json or url, persist provider original, and record data[].size as actual provider size",
        recordsActualProviderSize: true,
      },
    });
  }
  return requests;
}

function maskProviderRequest(): ProviderRequestEntry {
  const contract = getImageModelContract("gpt-image-2.5-sunburst");
  const output = contractOutput("gpt-image-2.5-sunburst");
  return {
    mode: "mask-edit",
    endpoint: { method: "POST", path: contract.edit.path, contentType: "multipart/form-data" },
    timeoutMs: contract.timeoutMs,
    requiredFields: ["model", "prompt", "size (runtime-derived)", "image[] (ordered)", "mask", "background=opaque", "output_format=png"],
    omittedFields: [],
    forbiddenFields: ["input_fidelity", "response_format", "n"],
    referenceInputs: {
      userMax: contract.edit.maxUserReferences ?? 7,
      totalMax: contract.edit.maxReferences,
      encoding: "ordered multipart image[] plus one internal system guide image",
      orderSemantics: "user image order equals prompt 图号; mask guide is appended internally and is not a user role",
    },
    output: {
      fields: Array.isArray(output.fields) ? output.fields.filter((field): field is string => typeof field === "string") : [],
      maxImages: typeof output.maxImages === "number" ? output.maxImages : 1,
      handling: "persist full-canvas provider original, then locally composite exact outside-mask protection",
    },
  };
}

function unsupportedReason(nodeKind: MatrixNodeKind, modelId: ImageModelId): string {
  if (nodeKind === "mask-redraw" && modelId !== "gpt-image-2.5-sunburst") {
    return "局部蒙版专轨当前只支持 GPT Image 2.5 Sunburst；该模型不得接收 mask-edit 请求。";
  }
  if (nodeKind !== "mask-redraw" && modelId === "gpt-image-2.5-sunburst") {
    return "GPT Image 2.5 Sunburst 首版产品策略仅允许 mask-redraw × mask-edit，不得用于普通生成或普通编辑节点。";
  }
  if (["fabric-recolor", "upscale", "print-extract", "print-mutate"].includes(nodeKind)) {
    return `首版产品政策暂不支持「${NODE_SPECS[nodeKind].title}」节点：该节点尚无逐模型独立提示词、参数档案和真实评估证据。`;
  }
  return "该节点×模型组合没有独立提示词和参数档案，系统不会静默回退到其他模型、节点或模式。";
}

function variantsFor(nodeKind: MatrixNodeKind, modelId: ImageModelId): PromptVariant[] {
  return GARMENT_PROMPT_VARIANTS.filter((variant) => variant.nodeKind === nodeKind && variant.modelId === modelId);
}

function profilesFor(nodeKind: MatrixNodeKind, modelId: ImageModelId): ParameterProfileEntry[] {
  return variantsFor(nodeKind, modelId).map((variant) => parameterProfileEntry(variant.parameterProfileId));
}

function entry(nodeKind: MatrixNodeKind, modelId: ImageModelId): NodePromptParameterMatrixEntry {
  const operationModes = allowedOperationModesForNode(nodeKind);
  const variants = variantsFor(nodeKind, modelId);
  const profiles = profilesFor(nodeKind, modelId);
  const supported = variants.length > 0;
  const providerRequests = nodeKind === "mask-redraw" && modelId === "gpt-image-2.5-sunburst"
    ? [maskProviderRequest()]
    : supported ? standardProviderRequests(modelId as Exclude<ImageModelId, "gpt-image-2.5-sunburst">, operationModes) : [];
  return {
    nodeKind,
    nodeTitle: NODE_SPECS[nodeKind].title,
    modelId,
    operationModes,
    supportStatus: supported ? "unverified" : "unsupported",
    productPolicy: supported
      ? { status: "supported" }
      : { status: "unsupported", reason: unsupportedReason(nodeKind, modelId) },
    promptVariantId: variants.length === 1 ? variants[0]!.variantId : null,
    promptVariantIds: variants.map((variant) => variant.variantId),
    promptReview: variants.map(promptReview),
    parameterProfileId: profiles.length === 1 ? profiles[0]!.parameterProfileId : null,
    parameterProfileIds: profiles.map((profile) => profile.parameterProfileId),
    parameterProfiles: profiles,
    providerRequests,
    failClosedReason: supported
      ? "该组合有完整离线契约，但当前提示词与模型证据状态仍为 unverified；未有受审真实评估发布快照时不得运行。"
      : unsupportedReason(nodeKind, modelId),
  };
}

export function createExpectedNodePromptParameterMatrix(): NodePromptParameterMatrix {
  const entries = MATRIX_NODE_KINDS.flatMap((nodeKind) => IMAGE_MODEL_IDS.map((modelId) => entry(nodeKind, modelId)));
  const baseline = getImageModelContract(IMAGE_MODEL_IDS[0]).reviewedModelCatalogBaseline;
  return {
    schemaVersion: 1,
    version: "node-prompt-parameter-matrix-v1",
    generatedAt: "2026-09-04",
    evidenceStatus: "offline-contract-review-only",
    sourceSkills: ["awesome-gpt-image-2", "apiyi"],
    sourceContracts: {
      modelCatalogReviewedExportSha256: baseline.reviewedExportSha256,
      modelCatalogReviewedRawExportSha256: baseline.reviewedRawExportSha256,
      modelContractIds: IMAGE_MODEL_IDS,
    },
    scope: {
      nodeKinds: MATRIX_NODE_KINDS,
      modelIds: IMAGE_MODEL_IDS,
      entryCount: entries.length,
      supportedEntryCount: entries.filter((candidate) => candidate.supportStatus === "unverified").length,
      unsupportedEntryCount: entries.filter((candidate) => candidate.supportStatus === "unsupported").length,
      unsupportedNodesRemainFailClosed: true,
      noProviderCallsPerformed: true,
      imageGenerationOrEditCalls: 0,
    },
    entries,
  };
}

function readMaterializedMatrix(): NodePromptParameterMatrix {
  return JSON.parse(readFileSync(OUTPUT_PATH, "utf8")) as NodePromptParameterMatrix;
}

export function checkMaterializedNodePromptParameterMatrix(): void {
  const expected = createExpectedNodePromptParameterMatrix();
  const actual = readMaterializedMatrix();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error("node-prompt-parameter-matrix-v1.json does not match the current prompt, parameter, provider, or product-policy contracts");
  }
}

if (process.argv.includes("--write")) {
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(createExpectedNodePromptParameterMatrix(), null, 2)}\n`, "utf8");
  console.log(`wrote ${OUTPUT_PATH}`);
} else {
  checkMaterializedNodePromptParameterMatrix();
  console.log("节点×模型提示词与参数矩阵校验通过");
}
