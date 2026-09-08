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
import { canonicalReferenceRoleProfile } from "./promptEvaluation";
import { getModelParameterProfile } from "../types/modelParameterProfiles";
import type { EvaluationReferenceRoleProfileEntry } from "../types/promptEvaluation";

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
  referenceRoleProfile: readonly EvaluationReferenceRoleProfileEntry[],
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
    requiredRoles: [...variant.requiredRoles],
    referenceRoleProfile: canonicalReferenceRoleProfile(referenceRoleProfile),
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
  referenceRoleProfile: readonly EvaluationReferenceRoleProfileEntry[],
  supportStatus: ReleasedPromptSupportStatus,
  evidenceArtifactId: string,
  metadata: PromptEvaluationReleaseMetadata,
): PromptEvaluationRelease {
  const profile = getModelParameterProfile(variant.parameterProfileId);
  if (!profile) throw new Error(`unknown parameter profile ${variant.parameterProfileId}`);
  return {
    schemaVersion: 1,
    variantId: variant.variantId,
    referenceRoleProfile: canonicalReferenceRoleProfile(referenceRoleProfile),
    supportStatus,
    evaluationStage: metadata.evaluationStage,
    evaluationVersion: variant.evaluationVersion,
    releaseVector: promptEvaluationReleaseVector(variant, referenceRoleProfile, metadata.codeSha),
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
  referenceRoleProfile: readonly EvaluationReferenceRoleProfileEntry[],
  releases: readonly PromptEvaluationRelease[] = PROMPT_EVALUATION_RELEASES,
  currentCodeSha: string | undefined = runtimeReleaseCodeSha(),
): EffectivePromptSupport {
  if (variant.supportStatus === "unsupported") {
    return { status: "unsupported", reason: variant.statusReason };
  }
  const canonicalProfile = canonicalReferenceRoleProfile(referenceRoleProfile);
  const release = releases.find((candidate) => (
    candidate.variantId === variant.variantId
    && canonicalJson(canonicalReferenceRoleProfile(candidate.referenceRoleProfile)) === canonicalJson(canonicalProfile)
  ));
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
    && release.releaseVector === promptEvaluationReleaseVector(variant, canonicalProfile, release.codeSha)
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
  if (query.modelId === "gpt-image-2") {
    return "GPT Image 2 首版产品策略仅允许蒙版局部修改（mask-local-edit × mask-redraw × mask-edit）。";
  }
  if (query.mode === "mask-edit" || query.nodeKind === "mask-redraw") {
    return "局部蒙版专轨当前只支持 GPT Image 2。";
  }
  return "该任务族×模型×节点×操作模式没有独立变体；系统不会回退到通用模板。";
}

export function getRuntimePromptVariantAvailability(
  query: PromptVariantQuery,
  options: {
    allowExperimental?: boolean;
    referenceRoleProfile?: readonly EvaluationReferenceRoleProfileEntry[];
    /** Explicit injection is used by isolated tests; production omits it and uses the build identity. */
    currentCodeSha?: string;
  } = {},
): PromptVariantAvailability {
  const variant = getGarmentPromptVariant(query);
  if (!variant) return { enabled: false, reason: unsupportedReason(query) };
  const referenceRoleProfile = query.mode === "generate"
    ? []
    : options.referenceRoleProfile;
  if (!referenceRoleProfile) {
    return {
      enabled: false,
      reason: "该编辑变体必须匹配一个已评估的有序参考角色配置，不能按变体整体泛化发布。",
      variant,
    };
  }
  const support = effectivePromptSupport(
    variant,
    referenceRoleProfile,
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
