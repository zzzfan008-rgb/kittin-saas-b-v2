import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import contracts from "../docs/ai/apiyi/model-contracts.json";
import {
  GARMENT_PROMPT_PRESETS,
  GARMENT_PROMPT_VARIANTS,
  type PromptFamilyId,
  type PromptVariant,
} from "../src/lib/garmentPromptPresets";
import {
  IMAGE_MODEL_IDS,
  type ImageModelId,
  getImageModelContract,
} from "../src/types/imageModels";
import {
  TEXT_MODEL_IDS,
  type TextModelId,
  getTextModelContract,
} from "../src/types/textModels";
import {
  VIDEO_MODEL_IDS,
  type VideoModelId,
  getVideoModelContract,
} from "../src/types/videoModels";
import {
  NODE_SPECS,
  type NodeKind,
} from "../src/types/workflow";
import type { ImageOperationMode } from "../src/types/imageOperations";
import {
  getModelParameterProfile,
  type ModelParameterProfile,
} from "../src/types/modelParameterProfiles";

const OUTPUT_PATH = fileURLToPath(new URL("../docs/ai/evaluation/node-prompt-parameter-matrix-v1.json", import.meta.url));

/**
 * R-68 裁定（2026-09-20）：三节点重构后矩阵主轴为 familyId × modelId（域内模型全集），
 * mode 由变体携带；nodeKind 降为派生属性（族 → nodeKind 唯一映射）。
 * 契约锚点：docs/design/2026-09-18-three-node-model/contracts/test-sync-inventory.md §1.A
 * 「矩阵按 (变体 × 模型) 重生成」。
 */
const MATRIX_IMAGE_FAMILIES = [
  "fashion-lookbook",
  "commerce-hero",
  "design-sheet",
  "upscale",
  "print-extract",
  "print-mutate",
  "fabric-recolor",
  "mask-local-edit",
] as const satisfies readonly PromptFamilyId[];
const MATRIX_TEXT_FAMILIES = ["prompt-polish", "prompt-generate"] as const satisfies readonly PromptFamilyId[];
const MATRIX_VIDEO_FAMILIES = ["video-animate"] as const satisfies readonly PromptFamilyId[];

type MatrixFamilyId = (typeof MATRIX_IMAGE_FAMILIES)[number] | (typeof MATRIX_TEXT_FAMILIES)[number] | (typeof MATRIX_VIDEO_FAMILIES)[number];
type MatrixModelId = ImageModelId | TextModelId | VideoModelId;
type MatrixSupportStatus = "unverified" | "unsupported";
type WireFormat = "application/json" | "multipart/form-data";

const FAMILY_NODE_KIND: Record<MatrixFamilyId, NodeKind> = {
  "fashion-lookbook": "image",
  "commerce-hero": "image",
  "design-sheet": "image",
  upscale: "image",
  "print-extract": "image",
  "print-mutate": "image",
  "fabric-recolor": "image",
  "mask-local-edit": "image",
  "prompt-polish": "text",
  "prompt-generate": "text",
  "video-animate": "video",
};

type PromptReviewChecklistItem =
  | "subject-task"
  | "composition"
  | "style-material"
  | "text-label"
  | "aspect-output"
  | "negative-constraints"
  | "preservation"
  | "output-contract";

interface PromptReviewEntry {
  promptVariantId: string;
  familyId: PromptVariant["familyId"];
  mode: PromptVariant["mode"];
  nodeKind: NodeKind;
  locale: PromptVariant["promptLocale"];
  promptSha256: `sha256:${string}`;
  templateName: string;
  /**
   * 实际执行过内容断言的审查维度（R-68：逐字迁移的四功能族与 text/video 域提示词
   * 不是六维图像提示词，checklist 只登记测试真实断言过的维度，不得虚报）。
   */
  checklist: readonly PromptReviewChecklistItem[];
}

const FULL_IMAGE_CHECKLIST = [
  "subject-task",
  "composition",
  "style-material",
  "text-label",
  "aspect-output",
  "negative-constraints",
] as const satisfies readonly PromptReviewChecklistItem[];
const FUNCTION_FAMILY_CHECKLIST = ["subject-task", "preservation"] as const satisfies readonly PromptReviewChecklistItem[];
const TEXT_CHECKLIST = ["subject-task", "output-contract", "negative-constraints"] as const satisfies readonly PromptReviewChecklistItem[];
const VIDEO_CHECKLIST = ["subject-task", "preservation", "negative-constraints"] as const satisfies readonly PromptReviewChecklistItem[];

function checklistFor(variant: PromptVariant): readonly PromptReviewChecklistItem[] {
  if (variant.nodeKind === "text") return TEXT_CHECKLIST;
  if (variant.nodeKind === "video") return VIDEO_CHECKLIST;
  if (variant.familyId === "upscale" || variant.familyId === "print-extract"
    || variant.familyId === "print-mutate" || variant.familyId === "fabric-recolor") {
    return FUNCTION_FAMILY_CHECKLIST;
  }
  return FULL_IMAGE_CHECKLIST;
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
  mode: PromptVariant["mode"];
  endpoint: { method: "POST"; path: string; contentType: WireFormat | string };
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
    asyncTask?: { pollPathTemplate: string };
  };
}

export interface NodePromptParameterMatrixEntry {
  familyId: MatrixFamilyId;
  nodeKind: NodeKind;
  nodeTitle: string;
  modelId: MatrixModelId;
  operationModes: readonly PromptVariant["mode"][];
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
  schemaVersion: 2;
  version: "node-prompt-parameter-matrix-v1";
  generatedAt: string;
  evidenceStatus: "offline-contract-review-only";
  sourceSkills: readonly ["awesome-gpt-image-2", "apiyi"];
  sourceContracts: {
    modelCatalogReviewedExportSha256: string | null;
    modelCatalogReviewedRawExportSha256: string | null;
    modelContractIds: {
      image: readonly ImageModelId[];
      text: readonly TextModelId[];
      video: readonly VideoModelId[];
    };
  };
  scope: {
    familyIds: readonly MatrixFamilyId[];
    nodeKinds: readonly NodeKind[];
    modelIds: {
      image: readonly ImageModelId[];
      text: readonly TextModelId[];
      video: readonly VideoModelId[];
    };
    entryCount: number;
    supportedEntryCount: number;
    unsupportedEntryCount: number;
    variantCount: number;
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
      templateName: variant.familyId === "mask-local-edit" ? "GPT Image 2 mask-local-edit contract" : `${variant.familyId} contract`,
      checklist: checklistFor(variant),
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
    checklist: checklistFor(variant),
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

/** text 域请求形状：runtime.md §1b 同步 chat completions，messages = system(variant.fullPrompt) + user(input)。 */
function textProviderRequest(modelId: TextModelId, mode: PromptVariant["mode"]): ProviderRequestEntry {
  const contract = getTextModelContract(modelId);
  return {
    mode,
    endpoint: { method: "POST", path: contract.endpoint.path, contentType: contract.endpoint.contentType },
    timeoutMs: contract.timeoutMs,
    requiredFields: [
      "model",
      "messages[0].role=system",
      "messages[0].content=variant.fullPrompt",
      "messages[1].role=user",
      "messages[1].content=上游 text 正文",
    ],
    omittedFields: [],
    forbiddenFields: [],
    referenceInputs: {
      userMax: 0,
      totalMax: 0,
      encoding: "none",
      orderSemantics: "text 节点无图片参考输入（inputs.image=0）",
    },
    output: {
      fields: ["choices[0].message.content"],
      maxImages: 0,
      handling: "同步 chat completions；产出写回节点 outputText，不覆盖 text",
    },
  };
}

/** video 域请求形状：runtime.md §2 异步任务 submit + 轮询；首帧 = 唯一 image 入边。 */
function videoProviderRequest(modelId: VideoModelId, mode: PromptVariant["mode"]): ProviderRequestEntry {
  const contract = getVideoModelContract(modelId);
  return {
    mode,
    endpoint: { method: "POST", path: contract.endpoint.submitPath, contentType: contract.endpoint.contentType },
    timeoutMs: contract.timeoutMs,
    requiredFields: ["model", "prompt", "image (首帧)"],
    omittedFields: [],
    forbiddenFields: [],
    referenceInputs: {
      userMax: 1,
      totalMax: 1,
      encoding: "首帧图片（唯一 image 入边）",
      orderSemantics: "首帧 = 唯一 image 入边；text 上游承载正文",
    },
    output: {
      fields: ["taskId", "videoUrl"],
      maxImages: 0,
      handling: "异步任务 submit + 轮询；一次任务产出一个 MP4，服务端落地",
      asyncTask: { pollPathTemplate: contract.endpoint.pollPathTemplate },
    },
  };
}

function unsupportedReason(familyId: MatrixFamilyId, modelId: MatrixModelId): string {
  if (familyId === "mask-local-edit" && modelId !== "gpt-image-2.5-sunburst") {
    return "局部蒙版专轨当前只支持 GPT Image 2.5 Sunburst；该模型不得接收 mask-edit 请求。";
  }
  if (familyId !== "mask-local-edit" && modelId === "gpt-image-2.5-sunburst") {
    return "GPT Image 2.5 Sunburst 首版产品策略仅允许 mask-local-edit × mask-edit，不得用于普通生成或普通编辑节点。";
  }
  return "该功能族×模型组合没有独立提示词和参数档案，系统不会静默回退到其他模型、功能族或模式。";
}

function variantsFor(familyId: MatrixFamilyId, modelId: MatrixModelId): PromptVariant[] {
  return GARMENT_PROMPT_VARIANTS.filter((variant) => variant.familyId === familyId && variant.modelId === modelId);
}

function profilesFor(nodeKind: NodeKind, variants: readonly PromptVariant[]): ParameterProfileEntry[] {
  // R-68 裁定：参数档案物化 store（MODEL_PARAMETER_PROFILES）仅覆盖 image 域；
  // text / video 变体声明的 parameterProfileId 保留在 parameterProfileIds，物化档案为空数组。
  if (nodeKind !== "image") return [];
  return variants.map((variant) => parameterProfileEntry(variant.parameterProfileId));
}

function providerRequestsFor(entry: { familyId: MatrixFamilyId; nodeKind: NodeKind; modelId: MatrixModelId; variants: readonly PromptVariant[] }): ProviderRequestEntry[] {
  const { familyId, nodeKind, modelId, variants } = entry;
  if (variants.length === 0) return [];
  const modes = [...new Set(variants.map((variant) => variant.mode))];
  if (nodeKind === "text") return modes.map((mode) => textProviderRequest(modelId as TextModelId, mode));
  if (nodeKind === "video") return modes.map((mode) => videoProviderRequest(modelId as VideoModelId, mode));
  if (familyId === "mask-local-edit" && modelId === "gpt-image-2.5-sunburst") return [maskProviderRequest()];
  return standardProviderRequests(modelId as Exclude<ImageModelId, "gpt-image-2.5-sunburst">, modes as readonly ImageOperationMode[]);
}

function matrixEntry(familyId: MatrixFamilyId, modelId: MatrixModelId): NodePromptParameterMatrixEntry {
  const nodeKind = FAMILY_NODE_KIND[familyId];
  const variants = variantsFor(familyId, modelId);
  const profiles = profilesFor(nodeKind, variants);
  const supported = variants.length > 0;
  const providerRequests = providerRequestsFor({ familyId, nodeKind, modelId, variants });
  return {
    familyId,
    nodeKind,
    nodeTitle: NODE_SPECS[nodeKind].title,
    modelId,
    operationModes: [...new Set(variants.map((variant) => variant.mode))],
    supportStatus: supported ? "unverified" : "unsupported",
    productPolicy: supported
      ? { status: "supported" }
      : { status: "unsupported", reason: unsupportedReason(familyId, modelId) },
    promptVariantId: variants.length === 1 ? variants[0]!.variantId : null,
    promptVariantIds: variants.map((variant) => variant.variantId),
    promptReview: variants.map(promptReview),
    parameterProfileId: variants.length === 1 ? variants[0]!.parameterProfileId : null,
    parameterProfileIds: variants.map((variant) => variant.parameterProfileId),
    parameterProfiles: profiles,
    providerRequests,
    failClosedReason: supported
      ? "该组合有完整离线契约，但当前提示词与模型证据状态仍为 unverified；未有受审真实评估发布快照时不得运行。"
      : unsupportedReason(familyId, modelId),
  };
}

export function createExpectedNodePromptParameterMatrix(): NodePromptParameterMatrix {
  const imageEntries = MATRIX_IMAGE_FAMILIES.flatMap((familyId) => IMAGE_MODEL_IDS.map((modelId) => matrixEntry(familyId, modelId)));
  const textEntries = MATRIX_TEXT_FAMILIES.flatMap((familyId) => TEXT_MODEL_IDS.map((modelId) => matrixEntry(familyId, modelId)));
  const videoEntries = MATRIX_VIDEO_FAMILIES.flatMap((familyId) => VIDEO_MODEL_IDS.map((modelId) => matrixEntry(familyId, modelId)));
  const entries = [...imageEntries, ...textEntries, ...videoEntries];
  const baseline = getImageModelContract(IMAGE_MODEL_IDS[0]).reviewedModelCatalogBaseline;
  const nodeKinds = [...new Set(entries.map((entry) => entry.nodeKind))];
  return {
    schemaVersion: 2,
    version: "node-prompt-parameter-matrix-v1",
    generatedAt: "2026-09-20",
    evidenceStatus: "offline-contract-review-only",
    sourceSkills: ["awesome-gpt-image-2", "apiyi"],
    sourceContracts: {
      modelCatalogReviewedExportSha256: baseline.reviewedExportSha256,
      modelCatalogReviewedRawExportSha256: baseline.reviewedRawExportSha256,
      modelContractIds: { image: IMAGE_MODEL_IDS, text: TEXT_MODEL_IDS, video: VIDEO_MODEL_IDS },
    },
    scope: {
      familyIds: [...MATRIX_IMAGE_FAMILIES, ...MATRIX_TEXT_FAMILIES, ...MATRIX_VIDEO_FAMILIES],
      nodeKinds,
      modelIds: { image: IMAGE_MODEL_IDS, text: TEXT_MODEL_IDS, video: VIDEO_MODEL_IDS },
      entryCount: entries.length,
      supportedEntryCount: entries.filter((candidate) => candidate.supportStatus === "unverified").length,
      unsupportedEntryCount: entries.filter((candidate) => candidate.supportStatus === "unsupported").length,
      variantCount: entries.reduce((total, candidate) => total + candidate.promptVariantIds.length, 0),
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
