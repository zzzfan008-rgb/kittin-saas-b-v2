import {
  getGarmentPromptVariant,
  type PromptSupportStatus,
  type PromptVariant,
  type PromptVariantAvailability,
  type PromptVariantQuery,
} from "./garmentPromptPresets";
import {
  PROMPT_EVALUATION_RELEASES,
  PROMPT_EVALUATION_RELEASE_REGISTRY_ERRORS,
  type PromptEvaluationRelease,
  type ReleasedPromptSupportStatus,
} from "./promptEvaluationReleaseRegistry";
import {
  PROVIDER_PROMPT_RENDERER_CONTRACT,
  PROVIDER_PROMPT_RENDERER_HASH,
  PROVIDER_PROMPT_RENDERER_VERSION,
} from "./providerPromptRenderer";
import { getModelParameterProfile } from "../types/modelParameterProfiles";

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`).join(",")}}`;
}

/** Exact material covered by one promotion decision. */
export function promptEvaluationReleaseVector(
  variant: PromptVariant,
  codeSha?: string,
): string {
  return canonicalJson({
    variantId: variant.variantId,
    familyId: variant.familyId,
    modelId: variant.modelId,
    nodeKind: variant.nodeKind,
    mode: variant.mode,
    promptLocale: variant.promptLocale,
    fullPrompt: variant.fullPrompt,
    parameterProfile: getModelParameterProfile(variant.parameterProfileId) ?? null,
    contractHash: variant.contractHash,
    evaluationVersion: variant.evaluationVersion,
    providerPromptRenderer: {
      version: PROVIDER_PROMPT_RENDERER_VERSION,
      hash: PROVIDER_PROMPT_RENDERER_HASH,
      semanticContract: PROVIDER_PROMPT_RENDERER_CONTRACT,
    },
    ...(codeSha === undefined ? {} : { codeSha }),
  });
}

export interface PromptEvaluationReleaseMetadata {
  evaluationStage: "internal-experiment" | "formal-validation" | "recommendation";
  evidenceArtifactSha256: string;
  gateReceiptSha256: string;
  evaluationUnitKey: `sha256:${string}`;
  codeSha: string;
}

export function createPromptEvaluationReleaseSnapshot(
  variant: PromptVariant,
  supportStatus: ReleasedPromptSupportStatus,
  evidenceArtifactId: string,
  metadata: PromptEvaluationReleaseMetadata,
): PromptEvaluationRelease {
  const profile = getModelParameterProfile(variant.parameterProfileId);
  if (!profile) throw new Error(`unknown parameter profile ${variant.parameterProfileId}`);
  return {
    schemaVersion: 1,
    variantId: variant.variantId,
    supportStatus,
    evaluationStage: metadata.evaluationStage,
    evaluationVersion: variant.evaluationVersion,
    releaseVector: promptEvaluationReleaseVector(variant, metadata.codeSha),
    evidenceArtifactId,
    evidenceArtifactSha256: metadata.evidenceArtifactSha256,
    gateReceiptSha256: metadata.gateReceiptSha256,
    evaluationUnitKey: metadata.evaluationUnitKey,
    codeSha: metadata.codeSha,
    contractHash: variant.contractHash,
    parameterProfileVersion: profile.version,
    postprocessVersion: profile.postprocess.version,
  };
}

export interface EffectivePromptSupport {
  status: PromptSupportStatus;
  reason: string;
  release?: PromptEvaluationRelease;
}

function runtimeReleaseCodeSha(): string | undefined {
  const meta = import.meta as ImportMeta & {
    env?: { VITE_GARMENT_CANVAS_CODE_SHA?: string };
  };
  const browserCodeSha = meta.env?.VITE_GARMENT_CANVAS_CODE_SHA?.trim();
  if (browserCodeSha) return browserCodeSha;
  const processLike = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process;
  return processLike?.env?.GARMENT_CANVAS_CODE_SHA?.trim() || undefined;
}

/**
 * Catalog status alone never promotes a variant. A matching reviewed release
 * snapshot is mandatory; any covered content drift fails closed.
 */
export function effectivePromptSupport(
  variant: PromptVariant,
  releases: readonly PromptEvaluationRelease[] = PROMPT_EVALUATION_RELEASES,
  currentCodeSha: string | undefined = runtimeReleaseCodeSha(),
): EffectivePromptSupport {
  if (variant.supportStatus === "unsupported") {
    return { status: "unsupported", reason: variant.statusReason };
  }
  const release = releases.find((candidate) => candidate.variantId === variant.variantId);
  if (!release) {
    return {
      status: "unverified",
      reason: variant.supportStatus === "unverified"
        ? variant.statusReason
        : "该变体没有当前版本的受审评估发布快照，已自动降回 unverified。",
    };
  }
  if (PROMPT_EVALUATION_RELEASE_REGISTRY_ERRORS.length > 0 && releases === PROMPT_EVALUATION_RELEASES) {
    return {
      status: "unverified",
      reason: "评估发布清单校验失败，已安全降回 unverified。",
      release,
    };
  }
  if (!currentCodeSha || currentCodeSha !== release.codeSha) {
    return {
      status: "unverified",
      reason: "当前构建代码 SHA 与受审评估发布不一致，已自动降回 unverified。",
      release,
    };
  }
  const profile = getModelParameterProfile(variant.parameterProfileId);
  const matches = (
    release.evaluationVersion === variant.evaluationVersion
    && release.contractHash === variant.contractHash
    && release.parameterProfileVersion === profile?.version
    && release.postprocessVersion === profile?.postprocess.version
    && release.releaseVector === promptEvaluationReleaseVector(variant, release.codeSha)
  );
  if (!matches) {
    return {
      status: "unverified",
      reason: "提示词、模型契约、参数档案或后处理已偏离受审评估快照，已自动降回 unverified。",
      release,
    };
  }
  return { status: release.supportStatus, reason: variant.statusReason, release };
}

function unsupportedReason(query: PromptVariantQuery): string {
  // v7：nodeKind 收敛三值后，mask-redraw 旧 kind 分支改为 mask-edit 模式语义。
  if (query.modelId === "gpt-image-2.5-sunburst") {
    return "GPT Image 2.5 Sunburst 首版产品策略仅允许蒙版局部修改（mask-local-edit × image × mask-edit）。";
  }
  if (query.mode === "mask-edit") {
    return "局部蒙版专轨当前只支持 GPT Image 2.5 Sunburst。";
  }
  return "该任务族×模型×节点×操作模式没有独立变体；系统不会回退到通用模板。";
}

export function getRuntimePromptVariantAvailability(
  query: PromptVariantQuery,
  options: {
    allowExperimental?: boolean;
    /** Explicit injection is used by isolated tests; production omits it and uses the build identity. */
    currentCodeSha?: string;
  } = {},
): PromptVariantAvailability {
  const variant = getGarmentPromptVariant(query);
  if (!variant) return { enabled: false, reason: unsupportedReason(query) };
  const support = effectivePromptSupport(
    variant,
    PROMPT_EVALUATION_RELEASES,
    options.currentCodeSha ?? runtimeReleaseCodeSha(),
  );
  if (support.status === "verified" || support.status === "recommended") {
    return { enabled: true, reason: support.reason, variant };
  }
  if (support.status === "experimental" && options.allowExperimental) {
    return { enabled: true, reason: support.reason, variant };
  }
  return { enabled: false, reason: support.reason, variant };
}
