import sharp from "sharp";
import {
  GOLDEN_GARMENT_SET_VERSION,
  PROMPT_SCORING_RUBRIC_VERSION,
  promptEvaluationUnitKey,
  scorePromptEvaluation,
} from "../../src/lib/promptEvaluation";
import {
  PROVIDER_PROMPT_RENDERER_HASH,
  PROVIDER_PROMPT_RENDERER_VERSION,
  renderProviderPrompt,
  type ProviderPromptReference,
} from "../../src/lib/providerPromptRenderer";
import { getGarmentPromptVariantById } from "../../src/lib/garmentPromptPresets";
import type {
  EvaluationHardBlocker,
  PostprocessedEvidence,
  PromptEvaluationScores,
  PromptEvaluationUnit,
  PromptEvaluationVersionVector,
  ProviderCallOutcome,
  ProviderOriginalEvidence,
} from "../../src/types/promptEvaluation";
import {
  getImageModelContract,
  isImageModelId,
  imageModelContractHash,
  isModelAllowedForNode,
} from "../../src/types/imageModels";
import {
  NODE_SPECS,
  generationKindOf,
  type ExecutionPlan,
  type ImageGenRequest,
  type NodeExecution,
} from "../../src/types/workflow";
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "../../src/types/modelParameterProfiles";
import { resolveToDataUrl } from "./fileStore";
import {
  isLocalImageReference,
  validateImageDataUrl,
} from "./imageValidation";
import { evaluationAuthorizationTargetFromPlan } from "./evaluationAuthorizationLedger";
import type { EvaluationRunPolicy } from "./evaluationRunPolicy";
import { ROOT_DIR } from "../config";
import {
  resolveEvaluationCodeIdentity,
  type EvaluationCodeIdentity,
} from "./evaluationCodeIdentity";
import {
  assertIsoTimestamp,
  assertString,
  canonicalJsonValue,
  cloneCanonical,
  deepFreeze,
  sameStrings,
  sha256,
  stableJson,
  type EvaluationJsonValue,
} from "./evaluationEvidenceCanonical";

export { resolveEvaluationCodeIdentity } from "./evaluationCodeIdentity";
export type { EvaluationCodeIdentity } from "./evaluationCodeIdentity";
export type { EvaluationJsonValue } from "./evaluationEvidenceCanonical";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CONTRACT_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,256}$/;
const MAX_PROMPT_LENGTH = 50_000;
const MAX_NATIVE_PARAMETERS_BYTES = 64 * 1024;
const MAX_EVALUATION_REFERENCES = 9;
const MAX_EVIDENCE_IMAGES = 32;
const MAX_EVIDENCE_PIXELS = 100_000_000;
const MAX_PROVIDER_REQUESTS_PER_CASE = 8;

export const EVALUATION_INPUT_NORMALIZATION_VERSION = "reference-input-sha256-v1";

export type EvaluationBillingStatus =
  | "not-required"
  | "pending"
  | "confirmed-not-billed"
  | "confirmed-billed";

export type EvaluationImageLayer = "provider-original" | "postprocessed";

export interface EvaluationReferenceEvidenceInput {
  order: number;
  assetSha256: string;
  sourceNodeId?: string;
}

export interface EvaluationReferenceEvidence {
  readonly order: number;
  readonly assetSha256: string;
  readonly sourceNodeId?: string;
}

export interface EvaluationCaseSnapshotInput {
  caseId: string;
  authorizationId: string;
  codeSha: string;
  nodeId: string;
  capturedAt: string;
  unit: PromptEvaluationUnit;
  /** Hash of the reviewed gateway contract used for this exact call. */
  contractHash: string;
  /** Version of the complete per-model prompt variant, not a shared fallback. */
  promptVersion: string;
  evaluationVersion: string;
  postprocessVersion: string;
  versions: PromptEvaluationVersionVector;
  resolvedPrompt: string;
  nativeParameters: Readonly<Record<string, unknown>>;
  references: readonly EvaluationReferenceEvidenceInput[];
  requestedImageCount: number;
}

export interface EvaluationCaseSnapshot {
  readonly schemaVersion: 1;
  readonly caseId: string;
  readonly authorizationId: string;
  readonly codeSha: string;
  readonly nodeId: string;
  readonly capturedAt: string;
  readonly unitKey: string;
  readonly unit: Readonly<PromptEvaluationUnit>;
  readonly contractHash: string;
  readonly promptVersion: string;
  readonly evaluationVersion: string;
  readonly postprocessVersion: string;
  readonly versions: Readonly<PromptEvaluationVersionVector>;
  readonly resolvedPrompt: string;
  readonly resolvedPromptSha256: string;
  readonly nativeParameters: Readonly<Record<string, EvaluationJsonValue>>;
  readonly references: readonly EvaluationReferenceEvidence[];
  readonly requestedImageCount: number;
  readonly requestSnapshotSha256: string;
}

/**
 * The runtime envelope preserves facts that belong to the paid case, but are
 * deliberately not part of the narrower PromptEvaluationUnit aggregation key.
 */
export interface EvaluationRuntimeCaseSnapshot {
  readonly schemaVersion: 1;
  readonly sampleId: string;
  readonly codeIdentity: Readonly<EvaluationCodeIdentity>;
  readonly authorizationUnitKey: `sha256:${string}`;
  readonly snapshot: EvaluationCaseSnapshot;
  readonly businessParameters: Readonly<Record<string, EvaluationJsonValue>>;
}

export interface EvaluationRuntimeCaseSnapshotInput {
  plan: ExecutionPlan;
  step: NodeExecution;
  request: ImageGenRequest;
  policy: EvaluationRunPolicy;
  codeIdentity?: EvaluationCodeIdentity;
  capturedAt?: string;
}

export type EvaluationProviderOriginalEvidence = ProviderOriginalEvidence & {
  readonly imageIndex: number;
  readonly bytes: number;
};

export type EvaluationPostprocessedEvidence = PostprocessedEvidence & {
  readonly imageIndex: number;
  readonly bytes: number;
};

export type EvaluationImageEvidence =
  | EvaluationProviderOriginalEvidence
  | EvaluationPostprocessedEvidence;

export type EvaluationErrorPhase =
  | "admission"
  | "provider"
  | "provider-persist"
  | "postprocess"
  | "completion-persist"
  | "billing-reconciliation"
  | "manual-review";

export interface EvaluationRequestError {
  phase: EvaluationErrorPhase;
  code: string;
  message: string;
  occurredAt: string;
  providerRequestIndex?: number;
}

export interface EvaluationRequestObservationInput {
  /** Exact-image fulfilment may require several paid calls; these are not retries. */
  requestCount: number;
  /** Optional explicit 1-based indexes; when omitted the canonical 1..N sequence is used. */
  requestIndexes?: readonly number[];
  latencyMs: readonly number[];
  outcome: ProviderCallOutcome;
  errors?: readonly EvaluationRequestError[];
}

export interface EvaluationRequestObservation {
  readonly requestCount: number;
  readonly requestIndexes: readonly number[];
  readonly latencyMs: readonly number[];
  readonly totalLatencyMs: number;
  readonly outcome: ProviderCallOutcome;
  readonly errors: readonly EvaluationRequestError[];
}

export interface EvaluationBillingEvidenceInput {
  status: EvaluationBillingStatus;
  checkedAt?: string;
  billingReference?: string;
  note?: string;
}

export interface EvaluationManualAssessmentInput {
  assessorId: string;
  assessedAt: string;
  scores: unknown;
  /** Legacy-shaped input retained for explicit rejection; detached baselines are invalid. */
  baselineScores?: unknown;
  taskPassed: boolean;
  validForScoring: boolean;
  notes?: string;
  hardBlockers?: readonly EvaluationHardBlocker[];
}

export interface EvaluationManualAssessment {
  readonly assessorId: string;
  readonly assessedAt: string;
  readonly scores: PromptEvaluationScores;
  readonly weightedScore: number;
  /** Historical-only fields; new evidence records never populate detached baselines. */
  readonly baselineScores?: PromptEvaluationScores;
  readonly baselineWeightedScore?: number;
  readonly taskPassed: boolean;
  readonly validForScoring: boolean;
  readonly notes?: string;
  readonly hardBlockers: readonly EvaluationHardBlocker[];
}

export interface EvaluationCaseEvidenceInput {
  snapshot: EvaluationCaseSnapshot;
  providerOriginals: readonly EvaluationProviderOriginalEvidence[];
  postprocessed: readonly EvaluationPostprocessedEvidence[];
  request: EvaluationRequestObservationInput;
  billing: EvaluationBillingEvidenceInput;
  manualAssessment?: EvaluationManualAssessmentInput;
  recordedAt: string;
}

export interface EvaluationCaseEvidenceRecord {
  readonly schemaVersion: 1;
  readonly snapshot: EvaluationCaseSnapshot;
  readonly providerOriginals: readonly EvaluationProviderOriginalEvidence[];
  readonly postprocessed: readonly EvaluationPostprocessedEvidence[];
  readonly request: EvaluationRequestObservation;
  readonly billing: Readonly<EvaluationBillingEvidenceInput>;
  readonly manualAssessment?: EvaluationManualAssessment;
  readonly recordedAt: string;
  readonly evidenceRecordSha256: string;
}

function requireExactProviderStep(plan: ExecutionPlan, step: NodeExecution): NodeExecution {
  // v8：Provider-backed 判定按生成语义 kind（image-generator → image），v7 的 image 别名继续放行
  //（评估快照的图片评估只认 image step；text/video 评估链归后续阶段）。
  const providerSteps = plan.steps.filter((candidate) => generationKindOf(candidate.kind) === "image");
  if (providerSteps.length !== 1) {
    throw new Error("an evaluation runtime snapshot requires exactly one Provider-backed step");
  }
  const selected = providerSteps[0];
  if (selected.nodeId !== step.nodeId || selected.kind !== step.kind) {
    throw new Error("runtime evaluation step is not the exact Provider step from the authorised plan");
  }
  return selected;
}

function assertOptionalRequestBinding(
  actual: unknown,
  expected: string,
  field: string,
): void {
  if (actual !== undefined && actual !== expected) {
    throw new Error(`actual ImageGenRequest ${field} drifted from the authorised plan`);
  }
}

function evaluationReferenceInputs(request: ImageGenRequest, step: NodeExecution): EvaluationReferenceEvidenceInput[] {
  const references = request.references ?? [];
  if (request.referenceImages !== undefined && request.referenceImages.length !== references.length) {
    throw new Error("actual ImageGenRequest legacy references do not align with structured references");
  }
  const evidence = references.map((reference, index): EvaluationReferenceEvidenceInput => {
    if (reference.order !== index) {
      throw new Error("actual ImageGenRequest reference order must be contiguous and zero-based");
    }
    const actualSha256 = sha256(validateImageDataUrl(reference.dataUrl).buffer);
    if (reference.assetSha256 !== actualSha256) {
      throw new Error(`actual ImageGenRequest reference ${index} digest does not match its bytes`);
    }
    if (request.referenceImages) {
      const legacySha256 = sha256(validateImageDataUrl(request.referenceImages[index]).buffer);
      if (legacySha256 !== actualSha256) {
        throw new Error(`actual ImageGenRequest legacy reference ${index} drifted from the structured input`);
      }
    }
    return {
      order: reference.order,
      assetSha256: actualSha256,
      ...(reference.sourceNodeId === undefined ? {} : { sourceNodeId: reference.sourceNodeId }),
    };
  });
  if (request.operationMode === "mask-edit") {
    if (typeof request.mask !== "string" || request.mask.length === 0) {
      throw new Error("mask-edit evaluation request must carry the exact Provider mask bytes");
    }
    evidence.push({
      order: evidence.length,
      assetSha256: sha256(validateImageDataUrl(request.mask).buffer),
      sourceNodeId: `${step.nodeId}:provider-mask`,
    });
  } else if (request.mask !== undefined) {
    throw new Error("non-mask evaluation request may not carry a mask");
  }
  return evidence;
}

/**
 * Bind a case snapshot to the exact request about to cross the Provider
 * boundary. This validates catalog, profile, contract, role bytes, plan and
 * one-time authorisation scope without inventing a cross-model fallback.
 */
export function buildEvaluationCaseSnapshotFromRuntime(
  input: EvaluationRuntimeCaseSnapshotInput,
): EvaluationRuntimeCaseSnapshot {
  const step = requireExactProviderStep(input.plan, input.step);
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  assertIsoTimestamp(capturedAt, "capturedAt");
  assertString(input.policy.sampleId, "sampleId", { max: 128, pattern: SAFE_ID_PATTERN });
  const embeddedPolicy = step.params.evaluationPolicy;
  if (
    !embeddedPolicy
    || typeof embeddedPolicy !== "object"
    || Array.isArray(embeddedPolicy)
    || (embeddedPolicy as Record<string, unknown>).caseId !== input.policy.caseId
    || (embeddedPolicy as Record<string, unknown>).sampleId !== input.policy.sampleId
    || (embeddedPolicy as Record<string, unknown>).authorizationId !== input.policy.authorizationId
    || (embeddedPolicy as Record<string, unknown>).campaignId !== input.policy.campaignId
    || (embeddedPolicy as Record<string, unknown>).slotId !== input.policy.slotId
    || (embeddedPolicy as Record<string, unknown>).retryPolicy !== "no-retry"
  ) {
    throw new Error("runtime evaluation policy drifted from the Provider step snapshot");
  }

  const modelId = step.params.modelId;
  const promptVariantId = step.params.promptVariantId;
  const promptFamilyId = step.params.promptFamilyId;
  const parameterProfileId = step.params.parameterProfileId;
  const contractHash = step.params.contractHash;
  const evaluationVersion = step.params.evaluationVersion;
  const postprocessVersion = step.params.postprocessVersion;
  const operationMode = step.params.operationMode;
  if (!isImageModelId(modelId) || typeof promptVariantId !== "string") {
    throw new Error("evaluation Provider step has no exact model/prompt binding");
  }
  const variant = getGarmentPromptVariantById(promptVariantId);
  if (!variant) throw new Error(`unknown evaluated prompt variant: ${promptVariantId}`);
  if (
    variant.modelId !== modelId
    || generationKindOf(step.kind) !== variant.nodeKind
    || variant.mode !== operationMode
    || variant.familyId !== promptFamilyId
    || variant.parameterProfileId !== parameterProfileId
    || variant.contractHash !== contractHash
    || variant.evaluationVersion !== evaluationVersion
  ) {
    throw new Error("evaluation Provider step drifted from its independent prompt variant");
  }
  const profile = typeof parameterProfileId === "string"
    ? getModelParameterProfile(parameterProfileId)
    : undefined;
  if (
    !profile
    || profile.modelId !== modelId
    || profile.familyId !== variant.familyId
    || profile.mode !== variant.mode
    || profile.postprocess.version !== postprocessVersion
  ) {
    throw new Error("evaluation Provider step drifted from its discriminated parameter profile");
  }
  if (input.request.operationMode !== variant.mode) {
    throw new Error("actual ImageGenRequest operationMode drifted from the evaluated variant");
  }
  assertOptionalRequestBinding(input.request.promptVariantId, variant.variantId, "promptVariantId");
  assertOptionalRequestBinding(input.request.promptFamilyId, variant.familyId, "promptFamilyId");
  assertOptionalRequestBinding(input.request.parameterProfileId, profile.profileId, "parameterProfileId");
  assertOptionalRequestBinding(input.request.contractHash, variant.contractHash, "contractHash");
  assertOptionalRequestBinding(input.request.evaluationVersion, variant.evaluationVersion, "evaluationVersion");
  assertOptionalRequestBinding(input.request.postprocessVersion, profile.postprocess.version, "postprocessVersion");
  const promptReferences = (input.request.references ?? []).filter((reference) => (
    reference.sourceNodeId !== `${step.nodeId}:mask-guide`
  ));
  const providerPromptReferences: ProviderPromptReference[] = promptReferences.map(() => ({}));
  // runtime.md §1 第 1–3 步：userPrompt 取上游 text 正文（params.inputTexts），直接生成
  // 路径回退 params.prompt；taskPrompt = variant.fullPrompt + "\n\n" + userPrompt。
  // 必须与 runner.ts executeImageStep 保持逐字一致，否则评估证据侧会与渲染器输出漂移。
  const inputTexts = Array.isArray(step.params.inputTexts)
    ? step.params.inputTexts.filter((value): value is string => typeof value === "string")
    : [];
  const userPrompt = inputTexts.length > 0
    ? inputTexts.join("\n\n")
    : (typeof step.params.prompt === "string" ? step.params.prompt : "");
  const taskPrompt = `${variant.fullPrompt}\n\n${userPrompt}`.trim();
  // needsMask 由 mask-edit 模式驱动，与 runner.ts executeImageStep 逐字对齐；
  // 否则评估证据侧的渲染器输出会与 Provider 实际收到的蒙版包装提示词漂移。
  const needsMask = operationMode === "mask-edit";
  const expectedResolvedPrompt = renderProviderPrompt({
    nodeKind: step.kind,
    modelId,
    operationMode: variant.mode,
    taskPrompt,
    references: providerPromptReferences,
    needsMask,
  });
  if (input.request.prompt !== expectedResolvedPrompt) {
    throw new Error("actual ImageGenRequest prompt differs from the shared reviewed Provider renderer output");
  }
  // v7：buildGarmentPrompt 的「提示词变体：…」包装已按 runtime.md §1 第 3 步移除，
  // 变体绑定由 taskPrompt 前置 fullPrompt 表达，故只校验 fullPrompt 完整内联。
  if (!expectedResolvedPrompt.includes(variant.fullPrompt)) {
    throw new Error("actual ImageGenRequest prompt is not bound to the complete reviewed prompt variant");
  }

  const materialized = materializeModelParameterProfile(profile);
  // v7：一色一图 / count 分批机制删除（Q4=A）；张数一律由 batchSize 表达。
  const requestedImageCount = Number(step.params.batchSize ?? 1);
  if (
    !Number.isSafeInteger(requestedImageCount)
    || requestedImageCount !== materialized.batchSize
  ) {
    throw new Error("authorised plan output count drifted from the evaluated parameter profile");
  }
  const providerRequestBatchSize = input.request.batchSize;
  if (
    !Number.isSafeInteger(providerRequestBatchSize)
    || (providerRequestBatchSize as number) < 1
    || (providerRequestBatchSize as number) > Math.min(4, requestedImageCount)
  ) {
    throw new Error("actual ImageGenRequest batch size is outside the authorised output count");
  }
  const actualAspectRatio = input.request.aspectRatio ?? (materialized.aspectRatio === "source" ? "source" : undefined);
  if (actualAspectRatio !== materialized.aspectRatio) {
    throw new Error("actual ImageGenRequest aspect ratio drifted from the evaluated parameter profile");
  }
  // v7：ImageGenRequest.imageSize 字段已删除（upscale 档位语义随旧 kind 退役），
  // 对应检查移除；native 参数仍按 profile 比对。
  const actualModelOptions = input.request.modelOptions ?? {};
  if (profile.native.kind === "gpt-image-2-mask") {
    const keys = Object.keys(actualModelOptions);
    if (keys.length !== 1 || keys[0] !== "size" || !/^\d+x\d+$/.test(String(actualModelOptions.size))) {
      throw new Error("mask evaluation must use only the runtime source-pixel size parameter");
    }
  } else if (stableJson(actualModelOptions) !== stableJson(materialized.modelOptions)) {
    throw new Error("actual ImageGenRequest native parameters drifted from the evaluated profile");
  }

  const references = evaluationReferenceInputs(input.request, step);
  // v7：旧 image-input/result kind 已不存在，Provider 目标检查简化为 text 排除。
  if (variant.nodeKind === "text") {
    throw new Error("image evaluation prompt variants must target an image node kind");
  }
  const unit: PromptEvaluationUnit = {
    taskFamilyId: variant.familyId,
    promptVariantId: variant.variantId,
    presetId: variant.familyId,
    presetVersion: variant.variantId,
    nodeKind: variant.nodeKind,
    modelId: variant.modelId,
    operationMode: variant.mode,
    parameterProfileId: profile.profileId,
    parameterProfileVersion: profile.version,
  };
  const contract = getImageModelContract(modelId);
  const versions: PromptEvaluationVersionVector = {
    presetVersion: unit.presetVersion,
    parameterProfileVersion: profile.version,
    providerContractVersion: variant.contractHash,
    resolvedModelVersion: contract.upstreamModelId,
    providerPromptRendererVersion: PROVIDER_PROMPT_RENDERER_VERSION,
    providerPromptRendererHash: PROVIDER_PROMPT_RENDERER_HASH,
    inputNormalizationVersion: EVALUATION_INPUT_NORMALIZATION_VERSION,
    postprocessingVersion: profile.postprocess.version,
    goldenSetVersion: GOLDEN_GARMENT_SET_VERSION,
    scoringRubricVersion: PROMPT_SCORING_RUBRIC_VERSION,
  };
  const codeIdentity = input.codeIdentity ?? resolveEvaluationCodeIdentity(ROOT_DIR);
  if (codeIdentity.dirty) {
    throw new Error("paid evaluation evidence may not be created from a dirty worktree");
  }
  const authorizationTarget = evaluationAuthorizationTargetFromPlan(input.plan);
  const nativeParameters = cloneCanonical({
    modelOptions: actualModelOptions,
    providerRequestBatchSize,
  });
  const businessParameters = canonicalJsonValue({
    operationMode: input.request.operationMode,
    aspectRatio: actualAspectRatio,
    requestedImageCount,
    providerRequestBatchSize,
    referenceCount: input.request.references?.length ?? 0,
    hasMask: input.request.mask !== undefined,
  }, "businessParameters") as Record<string, EvaluationJsonValue>;
  const snapshot = buildEvaluationCaseSnapshot({
    caseId: input.policy.caseId,
    authorizationId: input.policy.authorizationId,
    codeSha: codeIdentity.codeSha,
    nodeId: step.nodeId,
    capturedAt,
    unit,
    contractHash: variant.contractHash,
    promptVersion: unit.presetVersion,
    evaluationVersion: variant.evaluationVersion,
    postprocessVersion: profile.postprocess.version,
    versions,
    resolvedPrompt: input.request.prompt,
    nativeParameters,
    references,
    requestedImageCount: requestedImageCount as number,
  });
  return deepFreeze(cloneCanonical({
    schemaVersion: 1 as const,
    sampleId: input.policy.sampleId,
    codeIdentity,
    authorizationUnitKey: authorizationTarget.evaluationUnitKey,
    snapshot,
    businessParameters,
  }));
}

function validateReferences(
  references: readonly EvaluationReferenceEvidenceInput[],
): readonly EvaluationReferenceEvidence[] {
  if (!Array.isArray(references) || references.length > MAX_EVALUATION_REFERENCES) {
    throw new RangeError(`references must contain at most ${MAX_EVALUATION_REFERENCES} items`);
  }
  const result = references.map((reference, index): EvaluationReferenceEvidence => {
    if (!reference || typeof reference !== "object") throw new TypeError(`references[${index}] is invalid`);
    if (!Number.isSafeInteger(reference.order) || reference.order !== index) {
      throw new Error("reference order must be contiguous, zero-based, and match array order");
    }
    assertString(reference.assetSha256, `references[${index}].assetSha256`, {
      max: 64,
      pattern: SHA256_PATTERN,
    });
    if (reference.sourceNodeId !== undefined) {
      assertString(reference.sourceNodeId, `references[${index}].sourceNodeId`, { max: 256 });
    }
    return {
      order: reference.order,
      assetSha256: reference.assetSha256,
      ...(reference.sourceNodeId === undefined ? {} : { sourceNodeId: reference.sourceNodeId }),
    };
  });
  return result;
}

/**
 * Build the immutable, canonical request snapshot used as the root of a case.
 * The caller persists this inside the same transaction that creates an
 * evaluation run. This function is intentionally never called by ordinary runs.
 */
export function buildEvaluationCaseSnapshot(
  input: EvaluationCaseSnapshotInput,
): EvaluationCaseSnapshot {
  assertString(input.caseId, "caseId", { max: 128, pattern: SAFE_ID_PATTERN });
  assertString(input.authorizationId, "authorizationId", { max: 128, pattern: SAFE_ID_PATTERN });
  assertString(input.codeSha, "codeSha", { max: 64, pattern: CODE_SHA_PATTERN });
  assertString(input.nodeId, "nodeId", { max: 256 });
  assertIsoTimestamp(input.capturedAt, "capturedAt");
  if (!input.unit || typeof input.unit !== "object") throw new TypeError("unit is required");
  if (!isImageModelId(input.unit.modelId)) throw new TypeError("unit.modelId is invalid");
  if (!Object.prototype.hasOwnProperty.call(NODE_SPECS, input.unit.nodeKind)) {
    throw new TypeError("unit.nodeKind is invalid");
  }
  if (!NODE_SPECS[input.unit.nodeKind]) {
    throw new Error("evaluation case must target a known node kind");
  }
  if (input.unit.nodeKind !== "image") {
    throw new Error("image evaluation cases must target the image node kind");
  }
  if (!isModelAllowedForNode(input.unit.modelId, input.unit.nodeKind)) {
    throw new Error("unit model is not allowed for its node kind");
  }
  // v7：mode×kind 硬闸删除（mode 由变体携带）；评估单元的 mode 合法性
  // 由其绑定的变体验证（binding 校验在 promptRunAdmission 层）。
  assertString(input.contractHash, "contractHash", { max: 71, pattern: CONTRACT_HASH_PATTERN });
  if (input.contractHash !== imageModelContractHash(input.unit.modelId)) {
    throw new Error("contractHash does not match the current reviewed model contract");
  }
  assertString(input.promptVersion, "promptVersion", { max: 128 });
  assertString(input.evaluationVersion, "evaluationVersion", { max: 128 });
  assertString(input.postprocessVersion, "postprocessVersion", { max: 128 });
  for (const [field, value] of Object.entries(input.versions)) {
    assertString(value, `versions.${field}`, { max: 128 });
  }
  if (input.promptVersion !== input.unit.presetVersion || input.promptVersion !== input.versions.presetVersion) {
    throw new Error("promptVersion must match unit and version-vector presetVersion");
  }
  if (
    input.unit.parameterProfileVersion !== input.versions.parameterProfileVersion
    || input.contractHash !== input.versions.providerContractVersion
    || input.postprocessVersion !== input.versions.postprocessingVersion
  ) {
    throw new Error("snapshot version fields do not match the evaluation unit/version vector");
  }
  assertString(input.resolvedPrompt, "resolvedPrompt", { max: MAX_PROMPT_LENGTH });
  if (!Number.isSafeInteger(input.requestedImageCount) || input.requestedImageCount < 1 || input.requestedImageCount > 8) {
    throw new RangeError("requestedImageCount must be an integer from 1 to 8");
  }
  const canonicalNative = canonicalJsonValue(input.nativeParameters, "nativeParameters");
  if (!canonicalNative || Array.isArray(canonicalNative) || typeof canonicalNative !== "object") {
    throw new TypeError("nativeParameters must be a plain JSON object");
  }
  if (Buffer.byteLength(JSON.stringify(canonicalNative), "utf8") > MAX_NATIVE_PARAMETERS_BYTES) {
    throw new RangeError(`nativeParameters exceeds ${MAX_NATIVE_PARAMETERS_BYTES} bytes`);
  }
  const references = validateReferences(input.references);
  const unit = cloneCanonical(input.unit);
  const versions = cloneCanonical(input.versions);
  const hashPayload = {
    schemaVersion: 1 as const,
    caseId: input.caseId,
    authorizationId: input.authorizationId,
    codeSha: input.codeSha,
    nodeId: input.nodeId,
    unitKey: promptEvaluationUnitKey(unit),
    unit,
    contractHash: input.contractHash,
    promptVersion: input.promptVersion,
    evaluationVersion: input.evaluationVersion,
    postprocessVersion: input.postprocessVersion,
    versions,
    resolvedPrompt: input.resolvedPrompt,
    resolvedPromptSha256: sha256(input.resolvedPrompt),
    nativeParameters: canonicalNative as Record<string, EvaluationJsonValue>,
    references,
    requestedImageCount: input.requestedImageCount,
  };
  const snapshot: EvaluationCaseSnapshot = {
    ...hashPayload,
    capturedAt: input.capturedAt,
    requestSnapshotSha256: sha256(stableJson(hashPayload)),
  };
  return deepFreeze(cloneCanonical(snapshot));
}

function parseImageIndex(evidenceId: string, layer: EvaluationImageLayer): number {
  assertString(evidenceId, "evidenceId", { max: 256, pattern: SAFE_ID_PATTERN });
  const marker = layer === "provider-original" ? ":provider:" : ":postprocessed:";
  const indexText = evidenceId.slice(evidenceId.lastIndexOf(marker) + marker.length);
  if (!evidenceId.includes(marker) || !/^\d+$/.test(indexText)) {
    throw new Error(`evidenceId must end with ${marker}<zero-based-index>`);
  }
  const index = Number(indexText);
  if (!Number.isSafeInteger(index) || index < 0) throw new Error("evidence image index is invalid");
  return index;
}

export function evaluationImageEvidenceId(
  caseId: string,
  layer: EvaluationImageLayer,
  imageIndex: number,
): string {
  assertString(caseId, "caseId", { max: 128, pattern: SAFE_ID_PATTERN });
  if (!Number.isSafeInteger(imageIndex) || imageIndex < 0) throw new RangeError("imageIndex is invalid");
  return `${caseId}:${layer === "provider-original" ? "provider" : "postprocessed"}:${imageIndex}`;
}

export function inspectEvaluationImageEvidence(
  storageRef: string,
  layer: "provider-original",
  evidenceId: string,
  sourceEvidenceId?: undefined,
  pipelineVersion?: undefined,
  capturedAt?: string,
): Promise<EvaluationProviderOriginalEvidence>;
export function inspectEvaluationImageEvidence(
  storageRef: string,
  layer: "postprocessed",
  evidenceId: string,
  sourceEvidenceId: string,
  pipelineVersion: string,
  capturedAt?: string,
): Promise<EvaluationPostprocessedEvidence>;
export async function inspectEvaluationImageEvidence(
  storageRef: string,
  layer: EvaluationImageLayer,
  evidenceId: string,
  sourceEvidenceId?: string,
  pipelineVersion?: string,
  capturedAt = new Date().toISOString(),
): Promise<EvaluationImageEvidence> {
  if (!isLocalImageReference(storageRef)) {
    throw new Error("evaluation evidence must use an immutable local /api/files reference");
  }
  assertIsoTimestamp(capturedAt, "capturedAt");
  const imageIndex = parseImageIndex(evidenceId, layer);
  if (layer === "postprocessed") {
    assertString(sourceEvidenceId, "sourceEvidenceId", { max: 256, pattern: SAFE_ID_PATTERN });
    assertString(pipelineVersion, "pipelineVersion", { max: 128 });
  } else if (sourceEvidenceId !== undefined || pipelineVersion !== undefined) {
    throw new Error("provider-original evidence may not declare a source or pipeline version");
  }
  const dataUrl = resolveToDataUrl(storageRef);
  const validated = validateImageDataUrl(dataUrl);
  if (validated.mime === "image/gif") {
    throw new Error("GIF is not a supported immutable evaluation evidence format");
  }
  const metadata = await sharp(validated.buffer, {
    animated: false,
    failOn: "error",
    limitInputPixels: MAX_EVIDENCE_PIXELS,
  }).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("evaluation image dimensions could not be determined");
  }
  const base = {
    evidenceId,
    imageIndex,
    artifactSha256: sha256(validated.buffer),
    mimeType: validated.mime,
    width: metadata.width,
    height: metadata.height,
    bytes: validated.buffer.byteLength,
    storageRef,
    capturedAt,
  } as const;
  return layer === "provider-original"
    ? deepFreeze({ ...base, layer })
    : deepFreeze({
      ...base,
      layer,
      sourceEvidenceId: sourceEvidenceId!,
      pipelineVersion: pipelineVersion!,
    });
}

export function validateManualScores(value: unknown): PromptEvaluationScores {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("manual scores must be an object");
  }
  const expected = [
    "garmentMaterialFidelity",
    "instructionFollowing",
    "artifactControl",
    "commercialUsability",
  ] as const;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  if (!sameStrings(keys, [...expected].sort())) {
    throw new TypeError("manual scores must contain exactly the four rubric criteria");
  }
  const scores = Object.fromEntries(expected.map((criterion) => [
    criterion,
    (value as Record<string, unknown>)[criterion],
  ])) as unknown as PromptEvaluationScores;
  scorePromptEvaluation(scores);
  return deepFreeze({ ...scores });
}

function validateEvidenceBase(evidence: EvaluationImageEvidence, expectedLayer: EvaluationImageLayer): void {
  if (evidence.layer !== expectedLayer) throw new Error(`evidence ${evidence.evidenceId} has the wrong layer`);
  parseImageIndex(evidence.evidenceId, expectedLayer);
  if (!SHA256_PATTERN.test(evidence.artifactSha256)) throw new Error("evidence artifact SHA-256 is invalid");
  if (!["image/png", "image/jpeg", "image/webp"].includes(evidence.mimeType)) {
    throw new Error("evidence MIME is invalid");
  }
  if (!Number.isSafeInteger(evidence.imageIndex) || evidence.imageIndex < 0) throw new Error("evidence imageIndex is invalid");
  if (!Number.isSafeInteger(evidence.width) || evidence.width < 1) throw new Error("evidence width is invalid");
  if (!Number.isSafeInteger(evidence.height) || evidence.height < 1) throw new Error("evidence height is invalid");
  if (!Number.isSafeInteger(evidence.bytes) || evidence.bytes < 1) throw new Error("evidence bytes is invalid");
  if (!isLocalImageReference(evidence.storageRef)) throw new Error("evidence storageRef is not immutable local storage");
  assertIsoTimestamp(evidence.capturedAt, "evidence.capturedAt");
}

function validateErrors(
  errors: readonly EvaluationRequestError[],
  requestCount: number,
): readonly EvaluationRequestError[] {
  if (!Array.isArray(errors) || errors.length > 32) throw new RangeError("request errors must contain at most 32 items");
  const phases: readonly EvaluationErrorPhase[] = [
    "admission", "provider", "provider-persist", "postprocess", "completion-persist",
    "billing-reconciliation", "manual-review",
  ];
  return errors.map((error, index) => {
    if (!error || typeof error !== "object" || !phases.includes(error.phase)) {
      throw new TypeError(`errors[${index}] has an invalid phase`);
    }
    assertString(error.code, `errors[${index}].code`, { max: 128 });
    assertString(error.message, `errors[${index}].message`, { max: 2_000 });
    assertIsoTimestamp(error.occurredAt, `errors[${index}].occurredAt`);
    if (
      error.providerRequestIndex !== undefined
      && (
        !Number.isSafeInteger(error.providerRequestIndex)
        || error.providerRequestIndex < 1
        || error.providerRequestIndex > requestCount
      )
    ) {
      throw new RangeError(`errors[${index}].providerRequestIndex must identify a recorded 1-based request`);
    }
    return { ...error };
  });
}

function buildManualAssessment(input: EvaluationManualAssessmentInput): EvaluationManualAssessment {
  assertString(input.assessorId, "manualAssessment.assessorId", { max: 256 });
  assertIsoTimestamp(input.assessedAt, "manualAssessment.assessedAt");
  if (typeof input.taskPassed !== "boolean" || typeof input.validForScoring !== "boolean") {
    throw new TypeError("manual assessment decisions must be boolean");
  }
  if (input.notes !== undefined) assertString(input.notes, "manualAssessment.notes", { max: 4_000 });
  if (input.baselineScores !== undefined) {
    throw new Error(
      "detached baselineScores are legacy-only and cannot be recorded until traceable candidate/baseline case pairs are implemented",
    );
  }
  const scores = validateManualScores(input.scores);
  const hardBlockers = cloneCanonical(input.hardBlockers ?? []);
  return deepFreeze({
    assessorId: input.assessorId,
    assessedAt: input.assessedAt,
    scores,
    weightedScore: scorePromptEvaluation(scores).weightedScore,
    taskPassed: input.taskPassed,
    validForScoring: input.validForScoring,
    ...(input.notes === undefined ? {} : { notes: input.notes }),
    hardBlockers,
  });
}

/** Build a JSON-persistable evidence record after the no-retry case settles. */
export function buildEvaluationCaseEvidenceRecord(
  input: EvaluationCaseEvidenceInput,
): EvaluationCaseEvidenceRecord {
  assertIsoTimestamp(input.recordedAt, "recordedAt");
  if (!Object.isFrozen(input.snapshot) || !SHA256_PATTERN.test(input.snapshot.requestSnapshotSha256)) {
    throw new Error("snapshot must be produced by buildEvaluationCaseSnapshot");
  }
  const providerOriginals = [...input.providerOriginals];
  const postprocessed = [...input.postprocessed];
  if (providerOriginals.length > MAX_EVIDENCE_IMAGES || postprocessed.length > MAX_EVIDENCE_IMAGES) {
    throw new RangeError(`each evidence layer must contain at most ${MAX_EVIDENCE_IMAGES} images`);
  }
  const providerIds = new Set<string>();
  providerOriginals.forEach((evidence, index) => {
    validateEvidenceBase(evidence, "provider-original");
    if (evidence.imageIndex !== index) throw new Error("provider evidence indexes must be contiguous and ordered");
    const expectedId = evaluationImageEvidenceId(input.snapshot.caseId, "provider-original", index);
    if (evidence.evidenceId !== expectedId) throw new Error("provider evidenceId is not bound to this case/index");
    if (providerIds.has(evidence.evidenceId)) throw new Error("duplicate provider evidenceId");
    providerIds.add(evidence.evidenceId);
  });
  const postSourceIds = new Set<string>();
  postprocessed.forEach((evidence, index) => {
    validateEvidenceBase(evidence, "postprocessed");
    if (evidence.imageIndex !== index) throw new Error("postprocessed evidence indexes must be contiguous and ordered");
    const expectedId = evaluationImageEvidenceId(input.snapshot.caseId, "postprocessed", index);
    if (evidence.evidenceId !== expectedId) throw new Error("postprocessed evidenceId is not bound to this case/index");
    if (!providerIds.has(evidence.sourceEvidenceId)) {
      throw new Error("postprocessed evidence source does not belong to this case");
    }
    if (postSourceIds.has(evidence.sourceEvidenceId)) {
      throw new Error("each provider original may have at most one postprocessed derivative");
    }
    if (evidence.pipelineVersion !== input.snapshot.postprocessVersion) {
      throw new Error("postprocessed pipeline version does not match the snapshot");
    }
    postSourceIds.add(evidence.sourceEvidenceId);
  });

  if (
    !Number.isSafeInteger(input.request.requestCount)
    || input.request.requestCount < 0
    || input.request.requestCount > MAX_PROVIDER_REQUESTS_PER_CASE
  ) {
    throw new RangeError(`an evaluation case may contain zero to ${MAX_PROVIDER_REQUESTS_PER_CASE} Provider requests`);
  }
  const requestIndexes = input.request.requestIndexes === undefined
    ? Array.from({ length: input.request.requestCount }, (_, index) => index + 1)
    : [...input.request.requestIndexes];
  if (
    requestIndexes.length !== input.request.requestCount
    || requestIndexes.some((requestIndex, index) => requestIndex !== index + 1)
  ) {
    throw new Error("Provider request indexes must be unique, contiguous and 1-based");
  }
  if (!Array.isArray(input.request.latencyMs) || input.request.latencyMs.length !== input.request.requestCount) {
    throw new Error("latencyMs must contain exactly one entry per Provider request");
  }
  const latencyMs = input.request.latencyMs.map((latency, index) => {
    if (!Number.isFinite(latency) || latency < 0) throw new RangeError(`latencyMs[${index}] is invalid`);
    return latency;
  });
  const outcomes: readonly ProviderCallOutcome[] = [
    "succeeded", "transient-not-billed", "deterministic-failure", "billed-failure", "outcome_unknown",
  ];
  if (!outcomes.includes(input.request.outcome)) throw new TypeError("request outcome is invalid");
  const errors = validateErrors(input.request.errors ?? [], input.request.requestCount);
  if (input.request.outcome === "succeeded") {
    if (input.request.requestCount < 1 || providerOriginals.length === 0) {
      throw new Error("a succeeded case must have at least one request and provider-original evidence");
    }
    if (postprocessed.length !== providerOriginals.length) {
      throw new Error("a succeeded case must preserve both evidence layers for every output");
    }
  }
  if (input.request.outcome === "outcome_unknown" && input.billing.status !== "pending") {
    throw new Error("outcome_unknown must remain pending billing reconciliation");
  }
  if (input.billing.status === "pending" && input.billing.checkedAt !== undefined) {
    throw new Error("pending billing evidence may not claim a completed check");
  }
  if (input.billing.status.startsWith("confirmed-") && input.billing.checkedAt === undefined) {
    throw new Error("confirmed billing status requires checkedAt");
  }
  if (input.billing.checkedAt !== undefined) assertIsoTimestamp(input.billing.checkedAt, "billing.checkedAt");
  if (input.billing.billingReference !== undefined) {
    assertString(input.billing.billingReference, "billing.billingReference", { max: 512 });
  }
  if (input.billing.note !== undefined) assertString(input.billing.note, "billing.note", { max: 2_000 });

  const request: EvaluationRequestObservation = {
    requestCount: input.request.requestCount,
    requestIndexes,
    latencyMs,
    totalLatencyMs: latencyMs.reduce((total, latency) => total + latency, 0),
    outcome: input.request.outcome,
    errors,
  };
  const billing = cloneCanonical(input.billing);
  const manualAssessment = input.manualAssessment
    ? buildManualAssessment(input.manualAssessment)
    : undefined;
  const recordPayload = {
    schemaVersion: 1 as const,
    snapshot: input.snapshot,
    providerOriginals,
    postprocessed,
    request,
    billing,
    ...(manualAssessment ? { manualAssessment } : {}),
    recordedAt: input.recordedAt,
  };
  const record: EvaluationCaseEvidenceRecord = {
    ...recordPayload,
    evidenceRecordSha256: sha256(stableJson(recordPayload)),
  };
  return deepFreeze(cloneCanonical(record));
}
