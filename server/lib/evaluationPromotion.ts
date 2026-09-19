import { createHash } from "node:crypto";
import {
  GOLDEN_GARMENT_SET_VERSION,
  PROMPT_EVALUATION_STAGE_ORDER,
  PROMPT_EVALUATION_THRESHOLDS,
  PROMPT_SCORING_RUBRIC_VERSION,
  evaluatePromptEvaluationGate,
  promptEvaluationUnitKey,
  scorePromptEvaluation,
} from "../../src/lib/promptEvaluation";
import {
  createPromptEvaluationReleaseSnapshot,
  promptEvaluationReleaseVector,
} from "../../src/lib/promptEvaluationRelease";
import {
  RECOMMENDATION_BASELINE_BLOCKER_DETAIL,
  type PromptEvaluationRelease,
  type ReleasedPromptSupportStatus,
} from "../../src/lib/promptEvaluationReleaseRegistry";
export {
  RECOMMENDATION_BASELINE_BLOCKER_DETAIL,
  RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS,
} from "../../src/lib/promptEvaluationReleaseRegistry";
import { getGarmentPromptVariantById } from "../../src/lib/garmentPromptPresets";
import {
  PROVIDER_PROMPT_RENDERER_HASH,
  PROVIDER_PROMPT_RENDERER_VERSION,
} from "../../src/lib/providerPromptRenderer";
import { getImageModelContract, IMAGE_MODEL_IDS } from "../../src/types/imageModels";
import { getModelParameterProfile } from "../../src/types/modelParameterProfiles";
import type {
  EvaluationHardBlocker,
  PromptEvaluationAttempt,
  PromptEvaluationGateResult,
  PromptEvaluationScores,
  PromptEvaluationStage,
  PromptEvaluationUnit,
  PromptEvaluationVersionVector,
  ProviderOriginalEvidence,
  PostprocessedEvidence,
} from "../../src/types/promptEvaluation";
import {
  EVALUATION_INPUT_NORMALIZATION_VERSION,
  inspectEvaluationImageEvidence,
} from "./evaluationEvidence";
import { assertEvaluationCampaignReady } from "./evaluationCampaign";
import type { EvaluationCaseEvidenceBundle } from "./evaluationReviewLedger";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const CONTRACT_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const CAMPAIGN_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

/**
 * A contract receipt is only meaningful when every zero-paid, local check in
 * this exact set completed. Keeping the set in the validator prevents a
 * re-hashed artifact from silently dropping the knowledge-base or admission
 * coverage checks.
 */
export const EVALUATION_CONTRACT_CHECK_COMMANDS = Object.freeze([
  "scripts/apiyi-kb.mjs check",
  "scripts/apiyi-docs.mjs check --offline",
  "tests/provider-contract.test.ts",
  "tests/model-parameter-profiles.test.ts",
  "tests/prompt-presets.test.ts",
  "tests/evaluation-plan.test.ts",
  "scripts/evaluation-manifest.ts",
  "tests/prompt-run-admission.test.ts",
] as const);

export interface EvaluationCaseLocator {
  caseEvidenceId: string;
  runId: string;
}

export interface EvaluationGateReceipt {
  schemaVersion: 1;
  artifactType: "prompt-evaluation-stage-gate";
  stage: PromptEvaluationStage;
  variantId: string;
  unit: PromptEvaluationUnit;
  unitKey: string;
  authorizationUnitKey: `sha256:${string}` | null;
  /** Both fields are null only for the zero-paid contract stage. */
  campaignId: string | null;
  campaignClosureSha256: string | null;
  currentVersions: PromptEvaluationVersionVector;
  codeSha: string;
  contractVerified: true;
  /** Present only on the contract-stage receipt and bound to its reviewed checks. */
  contractCheckSha256: string | null;
  passedStages: readonly PromptEvaluationStage[];
  previousReceiptSha256s: readonly string[];
  cases: readonly EvaluationCaseAuditRef[];
  gateResult: PromptEvaluationGateResult;
  approvedBy: string;
  auditReason: string;
  createdAt: string;
  artifactSha256: string;
}

export interface EvaluationContractCheckArtifact {
  schemaVersion: 1;
  artifactType: "prompt-evaluation-contract-check";
  variantId: string;
  codeSha: string;
  commands: readonly { file: string; stdoutSha256: string }[];
  knowledgeBase: {
    snapshotId: string;
    snapshotSha256: string;
    pageCount: number;
    pointerFileSha256: string;
  };
  gatewayModelCatalog: {
    modelListFileSha256: string;
    canonicalModelIdSetSha256: string;
    reviewedBaselineSha256: string;
    reviewedRawExportSha256: string;
    expectedGatewayModelIds: readonly string[];
  };
  approvedBy: string;
  auditReason: string;
  createdAt: string;
  artifactSha256: string;
}

export interface EvaluationCaseAuditRef extends EvaluationCaseLocator {
  caseId: string;
  sampleId: string;
  evidenceRecordSha256: string;
  billingTailSha256: string | null;
  manualAssessmentTailSha256: string | null;
}

export interface EvaluationPromotionArtifact {
  schemaVersion: 1;
  artifactType: "prompt-evaluation-promotion";
  variantId: string;
  supportStatus: ReleasedPromptSupportStatus;
  evaluationStage: "internal-experiment" | "formal-validation" | "recommendation";
  unit: PromptEvaluationUnit;
  unitKey: string;
  authorizationUnitKey: `sha256:${string}`;
  campaignId: string;
  campaignClosureSha256: string;
  currentVersions: PromptEvaluationVersionVector;
  codeSha: string;
  releaseVector: string;
  gateReceiptSha256: string;
  previousReceiptSha256s: readonly string[];
  cases: readonly EvaluationCaseAuditRef[];
  /** Digest of image bytes, dimensions and MIME re-read from local storage at promotion time. */
  localArtifactSetSha256: string;
  gateResult: PromptEvaluationGateResult;
  approvedBy: string;
  approvalReason: string;
  approvedAt: string;
  artifactSha256: string;
}

export interface EvaluatedEvidenceGate {
  unit: PromptEvaluationUnit;
  unitKey: string;
  authorizationUnitKey: `sha256:${string}` | null;
  currentVersions: PromptEvaluationVersionVector;
  attempts: readonly PromptEvaluationAttempt[];
  caseAuditRefs: readonly EvaluationCaseAuditRef[];
  gateResult: PromptEvaluationGateResult;
}

function canonicalJson(value: unknown): string {
  if (value === undefined || value === null || typeof value !== "object") {
    return JSON.stringify(value ?? null);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, nested]) => nested !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`).join(",")}}`;
}

export function evaluationArtifactSha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${field} is not a persisted object`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  return value;
}

function requiredSha256(value: unknown, field: string): string {
  const digest = requiredString(value, field);
  if (!SHA256_PATTERN.test(digest)) throw new Error(`${field} must be a SHA-256 digest`);
  return digest;
}

function requiredContractHash(value: unknown, field: string): `sha256:${string}` {
  const digest = requiredString(value, field);
  if (!CONTRACT_HASH_PATTERN.test(digest)) throw new Error(`${field} must be a sha256: digest`);
  return digest as `sha256:${string}`;
}

function assertExactFields(
  value: Record<string, unknown>,
  allowed: readonly string[],
  field: string,
): void {
  const allowedSet = new Set(allowed);
  const unknown = Object.keys(value).filter((key) => !allowedSet.has(key));
  if (unknown.length > 0) throw new Error(`${field} contains unknown field(s): ${unknown.join(", ")}`);
}

function assertIsoTimestamp(value: unknown, field: string): string {
  const timestamp = requiredString(value, field);
  if (!Number.isFinite(Date.parse(timestamp))) throw new Error(`${field} is not an ISO timestamp`);
  return timestamp;
}

function assertCodeSha(value: unknown, field: string): string {
  const codeSha = requiredString(value, field);
  if (!CODE_SHA_PATTERN.test(codeSha)) {
    throw new Error(`${field} must be exactly 40 or 64 lowercase hexadecimal characters`);
  }
  return codeSha;
}

function assertStringArray(value: unknown, field: string, sha256 = false): readonly string[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value.map((item, index) => {
    const text = requiredString(item, `${field}[${index}]`);
    if (sha256 && !SHA256_PATTERN.test(text)) throw new Error(`${field}[${index}] must be a SHA-256 digest`);
    return text;
  });
}

const UNIT_FIELDS = [
  "taskFamilyId", "promptVariantId", "presetId", "presetVersion", "nodeKind",
  "modelId", "operationMode", "parameterProfileId",
  "parameterProfileVersion",
] as const;
const VERSION_FIELDS = [
  "presetVersion", "parameterProfileVersion", "providerContractVersion",
  "resolvedModelVersion", "providerPromptRendererVersion", "providerPromptRendererHash",
  "inputNormalizationVersion", "postprocessingVersion", "goldenSetVersion",
  "scoringRubricVersion",
] as const;
const SCORE_FIELDS = [
  "garmentMaterialFidelity", "instructionFollowing",
  "artifactControl", "commercialUsability",
] as const;

function validatePersistedUnit(value: unknown, field: string): PromptEvaluationUnit {
  const unit = record(value, field);
  assertExactFields(unit, UNIT_FIELDS, field);
  const variantId = requiredString(unit.promptVariantId, `${field}.promptVariantId`);
  const current = currentEvaluationPromotionTarget(variantId).unit;
  if (!exactJson(unit, current)) throw new Error(`${field} differs from the current exact evaluation unit`);
  return unit as unknown as PromptEvaluationUnit;
}

function validatePersistedVersions(
  value: unknown,
  unit: PromptEvaluationUnit,
  field: string,
): PromptEvaluationVersionVector {
  const versions = record(value, field);
  assertExactFields(versions, VERSION_FIELDS, field);
  for (const name of VERSION_FIELDS) requiredString(versions[name], `${field}.${name}`);
  const expected = currentEvaluationPromotionTarget(unit.promptVariantId).versions;
  if (!exactJson(versions, expected)) throw new Error(`${field} differs from the current exact version vector`);
  return versions as unknown as PromptEvaluationVersionVector;
}

function validateCaseAuditRefs(value: unknown, field: string): readonly EvaluationCaseAuditRef[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  const uniqueByIdentity = Object.fromEntries(
    ["caseEvidenceId", "runId", "caseId"].map((name) => [name, new Set<string>()]),
  ) as Record<"caseEvidenceId" | "runId" | "caseId", Set<string>>;
  return value.map((entry, index) => {
    const item = record(entry, `${field}[${index}]`);
    assertExactFields(item, [
      "caseEvidenceId", "runId", "caseId", "sampleId", "evidenceRecordSha256",
      "billingTailSha256", "manualAssessmentTailSha256",
    ], `${field}[${index}]`);
    for (const name of ["caseEvidenceId", "runId", "caseId", "sampleId"] as const) {
      requiredString(item[name], `${field}[${index}].${name}`);
    }
    requiredSha256(item.evidenceRecordSha256, `${field}[${index}].evidenceRecordSha256`);
    for (const name of ["billingTailSha256", "manualAssessmentTailSha256"] as const) {
      if (item[name] !== null) requiredSha256(item[name], `${field}[${index}].${name}`);
    }
    for (const name of ["caseEvidenceId", "runId", "caseId"] as const) {
      const identity = item[name] as string;
      if (uniqueByIdentity[name].has(identity)) {
        throw new Error(`${field} contains a duplicate ${name}`);
      }
      uniqueByIdentity[name].add(identity);
    }
    return item as unknown as EvaluationCaseAuditRef;
  });
}

const CASE_IDENTITY_FIELDS = ["caseEvidenceId", "runId", "caseId"] as const;

export function assertStageCaseIdentityDisjoint(
  stage: PromptEvaluationStage,
  currentCasesValue: unknown,
  previousReceipts: readonly EvaluationGateReceipt[],
  field: string,
): readonly EvaluationCaseAuditRef[] {
  const currentCases = validateCaseAuditRefs(currentCasesValue, field);
  const previousCases = previousReceipts.flatMap((receipt, receiptIndex) => (
    validateCaseAuditRefs(receipt.cases, `previousReceipts[${receiptIndex}].cases`)
      .map((caseRef) => ({ caseRef, stage: receipt.stage }))
  ));
  for (const [index, current] of currentCases.entries()) {
    for (const { caseRef: previous, stage: previousStage } of previousCases) {
      for (const identityField of CASE_IDENTITY_FIELDS) {
        if (current[identityField] === previous[identityField]) {
          throw new Error(
            `${field}[${index}].${identityField} reuses previous-stage ${identityField} from ${previousStage} while evaluating ${stage}`,
          );
        }
      }
    }
  }
  return currentCases;
}

export function assertStageAuthorizationUnitKeyConsistent(
  stage: PromptEvaluationStage,
  currentAuthorizationUnitKey: `sha256:${string}` | null,
  previousReceipts: readonly EvaluationGateReceipt[],
  field: string,
): void {
  if (stage === "contract") {
    if (currentAuthorizationUnitKey !== null) {
      throw new Error(`${field} contract stage must not bind a paid authorization unit`);
    }
    return;
  }
  const current = requiredContractHash(currentAuthorizationUnitKey, `${field}.authorizationUnitKey`);
  const previousPaidKeys = previousReceipts
    .filter((receipt) => receipt.stage !== "contract")
    .map((receipt, index) => requiredContractHash(
      receipt.authorizationUnitKey,
      `${field}.previousReceipts[${index}].authorizationUnitKey`,
    ));
  if (previousPaidKeys.some((key) => key !== current)) {
    throw new Error(`${field}.authorizationUnitKey differs from the previous paid stage`);
  }
}

/** A paid gate is only portable when it names the immutable Campaign closure it consumed. */
export function assertStageCampaignClosureBinding(
  stage: PromptEvaluationStage,
  campaignId: string | null,
  campaignClosureSha256: string | null,
  field: string,
): void {
  if (stage === "contract") {
    if (campaignId !== null || campaignClosureSha256 !== null) {
      throw new Error(`${field} contract stage must not bind a paid campaign closure`);
    }
    return;
  }
  if (typeof campaignId !== "string" || !CAMPAIGN_ID_PATTERN.test(campaignId)) {
    throw new Error(`${field}.campaignId is invalid`);
  }
  requiredSha256(campaignClosureSha256, `${field}.campaignClosureSha256`);
}

function validateScoresObject(value: unknown, field: string): void {
  const scores = record(value, field);
  assertExactFields(scores, SCORE_FIELDS, field);
  for (const name of SCORE_FIELDS) {
    const score = scores[name];
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error(`${field}.${name} is not a score from 0 to 100`);
    }
  }
}

function validateGateResult(value: unknown, stage: PromptEvaluationStage, field: string): PromptEvaluationGateResult {
  const result = record(value, field);
  assertExactFields(result, ["passed", "stage", "supportLevel", "failures", "hardBlockers", "metrics"], field);
  if (result.passed !== true || result.stage !== stage) throw new Error(`${field} is not a passing ${stage} result`);
  const failures = assertStringArray(result.failures, `${field}.failures`);
  if (!Array.isArray(result.hardBlockers)) throw new Error(`${field}.hardBlockers must be an array`);
  for (const [index, blockerValue] of result.hardBlockers.entries()) {
    const blocker = record(blockerValue, `${field}.hardBlockers[${index}]`);
    assertExactFields(blocker, ["code", "detail", "attemptId", "evidenceIds"], `${field}.hardBlockers[${index}]`);
    requiredString(blocker.code, `${field}.hardBlockers[${index}].code`);
    requiredString(blocker.detail, `${field}.hardBlockers[${index}].detail`);
    if (blocker.attemptId !== undefined) requiredString(blocker.attemptId, `${field}.hardBlockers[${index}].attemptId`);
    if (blocker.evidenceIds !== undefined) assertStringArray(blocker.evidenceIds, `${field}.hardBlockers[${index}].evidenceIds`);
  }
  if (failures.length > 0 || result.hardBlockers.length > 0) {
    throw new Error(`${field} claims to pass while retaining failures or hard blockers`);
  }
  const metrics = record(result.metrics, `${field}.metrics`);
  assertExactFields(metrics, [
    "distinctSamples", "succeededSamples", "validResults", "requestCompletionRate",
    "taskPassRate", "averageWeightedScore", "p10WeightedScore",
    "bootstrapQualityGainLowerBound", "criterionAverages",
  ], `${field}.metrics`);
  for (const name of ["distinctSamples", "succeededSamples", "validResults"] as const) {
    if (typeof metrics[name] !== "number" || !Number.isFinite(metrics[name] as number)) {
      throw new Error(`${field}.metrics.${name} must be finite`);
    }
    if (!Number.isSafeInteger(metrics[name]) || (metrics[name] as number) < 0) {
      throw new Error(`${field}.metrics.${name} must be a non-negative safe integer`);
    }
  }
  for (const name of ["requestCompletionRate", "taskPassRate"] as const) {
    if (typeof metrics[name] !== "number" || !Number.isFinite(metrics[name] as number)
      || (metrics[name] as number) < 0 || (metrics[name] as number) > 1) {
      throw new Error(`${field}.metrics.${name} must be a rate from 0 to 1`);
    }
  }
  for (const name of ["averageWeightedScore", "p10WeightedScore"] as const) {
    if (typeof metrics[name] !== "number" || !Number.isFinite(metrics[name] as number)
      || (metrics[name] as number) < 0 || (metrics[name] as number) > 100) {
      throw new Error(`${field}.metrics.${name} must be a score from 0 to 100`);
    }
  }
  if (metrics.bootstrapQualityGainLowerBound !== undefined
    && (typeof metrics.bootstrapQualityGainLowerBound !== "number"
      || !Number.isFinite(metrics.bootstrapQualityGainLowerBound))) {
    throw new Error(`${field}.metrics.bootstrapQualityGainLowerBound must be finite when present`);
  }
  validateScoresObject(metrics.criterionAverages, `${field}.metrics.criterionAverages`);
  return result as unknown as PromptEvaluationGateResult;
}

const PASSED_SUPPORT_BY_STAGE: Readonly<Record<PromptEvaluationStage, PromptEvaluationGateResult["supportLevel"]>> = {
  contract: "unverified",
  "provider-probe": "unverified",
  "internal-experiment": "experimental",
  "formal-validation": "verified",
  recommendation: "recommended",
};

function roundedRatio(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100) / 100;
}

function isRoundedRatio(value: number, denominator: number): boolean {
  return Array.from({ length: denominator + 1 }, (_unused, numerator) => (
    roundedRatio(numerator, denominator)
  )).includes(value);
}

/**
 * Receipts intentionally retain only immutable audit references rather than
 * full scorecards. This validator therefore cannot recreate every percentile,
 * but it can and must reject impossible or below-threshold snapshots before a
 * self-hashed external artifact reaches build/runtime verification.
 */
export function assertEvaluationGateSnapshot(
  stage: PromptEvaluationStage,
  casesValue: unknown,
  gateResultValue: unknown,
  field: string,
): readonly EvaluationCaseAuditRef[] {
  const cases = validateCaseAuditRefs(casesValue, `${field}.cases`);
  const gateResult = validateGateResult(gateResultValue, stage, `${field}.gateResult`);
  if (gateResult.supportLevel !== PASSED_SUPPORT_BY_STAGE[stage]) {
    throw new Error(`${field}.gateResult support level does not match ${stage}`);
  }
  const sampleIds = cases.map((entry) => entry.sampleId);
  const uniqueSamples = new Set(sampleIds);
  if (uniqueSamples.size !== sampleIds.length) {
    throw new Error(`${field}.cases contains a duplicate sampleId`);
  }
  const threshold = PROMPT_EVALUATION_THRESHOLDS[stage];
  if (threshold.exactDistinctSamples !== undefined
    && (cases.length !== threshold.exactDistinctSamples
      || uniqueSamples.size !== threshold.exactDistinctSamples)) {
    throw new Error(`${field} must contain exactly ${threshold.exactDistinctSamples} case/sample reference(s)`);
  }
  if (threshold.requiredSampleIds) {
    const expected = [...threshold.requiredSampleIds].sort();
    const actual = [...uniqueSamples].sort();
    if (actual.length !== expected.length || actual.some((sampleId, index) => sampleId !== expected[index])) {
      throw new Error(`${field}.cases must contain the exact ${expected.length}-sample golden set`);
    }
  }
  const metrics = gateResult.metrics;
  if (metrics.distinctSamples !== uniqueSamples.size) {
    throw new Error(`${field}.gateResult distinctSamples differs from its retained cases`);
  }
  if (metrics.succeededSamples > cases.length || metrics.validResults > metrics.succeededSamples) {
    throw new Error(`${field}.gateResult contains impossible success/result counts`);
  }
  if (metrics.requestCompletionRate !== roundedRatio(metrics.succeededSamples, cases.length)) {
    throw new Error(`${field}.gateResult completion rate differs from its retained cases`);
  }
  if (!isRoundedRatio(metrics.taskPassRate, cases.length)) {
    throw new Error(`${field}.gateResult task pass rate cannot be produced by its retained cases`);
  }
  if (metrics.validResults < threshold.minimumValidResults
    || metrics.averageWeightedScore < threshold.minimumWeightedScore
    || (threshold.minimumP10Score !== undefined && metrics.p10WeightedScore < threshold.minimumP10Score)
    || (threshold.minimumTaskPassRate !== undefined && metrics.taskPassRate < threshold.minimumTaskPassRate)
    || (threshold.minimumRecentRequestCompletionRate !== undefined
      && metrics.requestCompletionRate < threshold.minimumRecentRequestCompletionRate)) {
    throw new Error(`${field}.gateResult does not meet the ${stage} thresholds`);
  }
  if (metrics.bootstrapQualityGainLowerBound !== undefined) {
    throw new Error(`${field}.gateResult contains an unsupported detached bootstrap result`);
  }
  if (stage === "contract") {
    if (
      metrics.succeededSamples !== 0
      || metrics.validResults !== 0
      || metrics.taskPassRate !== 0
      || metrics.averageWeightedScore !== 0
      || metrics.p10WeightedScore !== 0
      || Object.values(metrics.criterionAverages).some((score) => score !== 0)
    ) {
      throw new Error(`${field}.gateResult contract metrics must be empty`);
    }
    return cases;
  }
  if (cases.some((entry) => entry.billingTailSha256 === null)) {
    throw new Error(`${field}.cases must bind a billing reconciliation tail`);
  }
  if ((stage === "internal-experiment" || stage === "formal-validation")
    && cases.some((entry) => entry.manualAssessmentTailSha256 === null)) {
    throw new Error(`${field}.cases must bind a manual assessment tail`);
  }
  if (metrics.validResults === 0) {
    if (
      metrics.averageWeightedScore !== 0
      || metrics.p10WeightedScore !== 0
      || Object.values(metrics.criterionAverages).some((score) => score !== 0)
    ) {
      throw new Error(`${field}.gateResult has scores without valid results`);
    }
  } else {
    const weightedCriterionAverage = scorePromptEvaluation(metrics.criterionAverages).weightedScore;
    if (Math.abs(weightedCriterionAverage - metrics.averageWeightedScore) > 0.02) {
      throw new Error(`${field}.gateResult weighted score differs from its criterion averages`);
    }
    if (metrics.p10WeightedScore > metrics.averageWeightedScore) {
      throw new Error(`${field}.gateResult P10 score exceeds its average score`);
    }
  }
  return cases;
}

export function currentEvaluationPromotionTarget(
  variantId: string,
): { unit: PromptEvaluationUnit; versions: PromptEvaluationVersionVector } {
  const variant = getGarmentPromptVariantById(variantId);
  if (!variant) throw new Error(`prompt variant ${variantId} is not in the reviewed catalog`);
  // v7：旧 image-input/result kind 已不存在；图片晋升只认 image/video 之外的 image。
  if (variant.nodeKind !== "image") {
    throw new Error("image evaluation promotion requires an image-kind prompt variant");
  }
  const profile = getModelParameterProfile(variant.parameterProfileId);
  if (!profile) throw new Error(`parameter profile ${variant.parameterProfileId} is missing`);
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
  const contract = getImageModelContract(variant.modelId);
  return {
    unit,
    versions: {
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
    },
  };
}

export function validateEvaluationContractCheckArtifact(
  value: unknown,
): EvaluationContractCheckArtifact {
  const artifact = record(value, "contract check artifact");
  assertExactFields(artifact, [
    "schemaVersion", "artifactType", "variantId", "codeSha",
    "commands", "knowledgeBase", "gatewayModelCatalog", "approvedBy", "auditReason",
    "createdAt", "artifactSha256",
  ], "contract check artifact");
  if (artifact.schemaVersion !== 1 || artifact.artifactType !== "prompt-evaluation-contract-check") {
    throw new Error("contract check artifact schema is invalid");
  }
  const variantId = requiredString(artifact.variantId, "contract check artifact.variantId");
  currentEvaluationPromotionTarget(variantId);
  assertCodeSha(artifact.codeSha, "contract check artifact.codeSha");
  if (!Array.isArray(artifact.commands)
    || artifact.commands.length !== EVALUATION_CONTRACT_CHECK_COMMANDS.length) {
    throw new Error("contract check artifact.commands must contain the exact required checks");
  }
  const commandNames = new Set<string>();
  for (const [index, commandValue] of artifact.commands.entries()) {
    const command = record(commandValue, `contract check artifact.commands[${index}]`);
    assertExactFields(command, ["file", "stdoutSha256"], `contract check artifact.commands[${index}]`);
    const file = requiredString(command.file, `contract check artifact.commands[${index}].file`);
    requiredSha256(command.stdoutSha256, `contract check artifact.commands[${index}].stdoutSha256`);
    if (commandNames.has(file)) throw new Error("contract check artifact.commands contains a duplicate check");
    commandNames.add(file);
  }
  if (EVALUATION_CONTRACT_CHECK_COMMANDS.some((command) => !commandNames.has(command))) {
    throw new Error("contract check artifact.commands is missing a required local check");
  }
  const knowledgeBase = record(artifact.knowledgeBase, "contract check artifact.knowledgeBase");
  assertExactFields(knowledgeBase, [
    "snapshotId", "snapshotSha256", "pageCount", "pointerFileSha256",
  ], "contract check artifact.knowledgeBase");
  requiredString(knowledgeBase.snapshotId, "contract check artifact.knowledgeBase.snapshotId");
  requiredSha256(knowledgeBase.snapshotSha256, "contract check artifact.knowledgeBase.snapshotSha256");
  requiredSha256(knowledgeBase.pointerFileSha256, "contract check artifact.knowledgeBase.pointerFileSha256");
  if (!Number.isSafeInteger(knowledgeBase.pageCount) || (knowledgeBase.pageCount as number) < 1) {
    throw new Error("contract check artifact.knowledgeBase.pageCount is invalid");
  }
  const modelCatalog = record(artifact.gatewayModelCatalog, "contract check artifact.gatewayModelCatalog");
  assertExactFields(modelCatalog, [
    "modelListFileSha256", "canonicalModelIdSetSha256", "reviewedBaselineSha256",
    "reviewedRawExportSha256", "expectedGatewayModelIds",
  ], "contract check artifact.gatewayModelCatalog");
  requiredSha256(modelCatalog.modelListFileSha256, "contract check artifact.gatewayModelCatalog.modelListFileSha256");
  requiredSha256(modelCatalog.canonicalModelIdSetSha256, "contract check artifact.gatewayModelCatalog.canonicalModelIdSetSha256");
  requiredSha256(modelCatalog.reviewedBaselineSha256, "contract check artifact.gatewayModelCatalog.reviewedBaselineSha256");
  requiredSha256(modelCatalog.reviewedRawExportSha256, "contract check artifact.gatewayModelCatalog.reviewedRawExportSha256");
  const expectedIds = assertStringArray(
    modelCatalog.expectedGatewayModelIds,
    "contract check artifact.gatewayModelCatalog.expectedGatewayModelIds",
  );
  if (!exactJson(expectedIds, IMAGE_MODEL_IDS)) {
    throw new Error("contract check artifact must bind the exact current reviewed gateway model IDs");
  }
  if (modelCatalog.canonicalModelIdSetSha256 !== modelCatalog.reviewedBaselineSha256) {
    throw new Error("contract check artifact gateway model list differs from its reviewed baseline");
  }
  if (modelCatalog.modelListFileSha256 !== modelCatalog.reviewedRawExportSha256) {
    throw new Error("contract check artifact raw model list differs from its reviewed raw export SHA-256");
  }
  requiredString(artifact.approvedBy, "contract check artifact.approvedBy");
  requiredString(artifact.auditReason, "contract check artifact.auditReason");
  assertIsoTimestamp(artifact.createdAt, "contract check artifact.createdAt");
  requiredSha256(artifact.artifactSha256, "contract check artifact.artifactSha256");
  const { artifactSha256, ...base } = artifact;
  if (evaluationArtifactSha256(base) !== artifactSha256) {
    throw new Error("contract check artifact hash is invalid");
  }
  return artifact as unknown as EvaluationContractCheckArtifact;
}

function exactJson(left: unknown, right: unknown): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

function hardBlocker(detail: string, attemptId?: string): EvaluationHardBlocker {
  return {
    code: "evidence-integrity-failure",
    detail,
    ...(attemptId ? { attemptId } : {}),
  };
}

function latestManualAssessments(bundle: EvaluationCaseEvidenceBundle) {
  const byOutput = new Map<number, (typeof bundle.manualAssessmentEvents)[number]>();
  for (const event of bundle.manualAssessmentEvents) byOutput.set(event.outputIndex, event);
  return [...byOutput.values()].sort((left, right) => left.outputIndex - right.outputIndex);
}

function averageScores(
  assessments: readonly { scores: PromptEvaluationScores }[],
): PromptEvaluationScores | undefined {
  if (assessments.length === 0) return undefined;
  const keys = [
    "garmentMaterialFidelity",
    "instructionFollowing",
    "artifactControl",
    "commercialUsability",
  ] as const;
  return Object.fromEntries(keys.map((key) => [
    key,
    Math.round((assessments.reduce((sum, event) => sum + event.scores[key], 0) / assessments.length) * 100) / 100,
  ])) as unknown as PromptEvaluationScores;
}

function billingIntegrityBlockers(
  bundle: EvaluationCaseEvidenceBundle,
  attemptId: string,
): EvaluationHardBlocker[] {
  const blockers: EvaluationHardBlocker[] = [];
  const requests = bundle.providerRequests.map((value, index) => record(value, `providerRequests[${index}]`));
  const latestEventByRequest = new Map<string, (typeof bundle.billingEvents)[number]>();
  for (const event of bundle.billingEvents) latestEventByRequest.set(event.providerRequestEvidenceId, event);
  if (requests.length === 0) {
    blockers.push(hardBlocker("Evaluation stage evidence has no Provider request to reconcile.", attemptId));
    return blockers;
  }
  for (const request of requests) {
    const requestId = requiredString(request.id, "provider request id");
    const status = request.billing_reconciliation_status;
    if (status !== "confirmed-not-billed" && status !== "confirmed-billed") {
      blockers.push(hardBlocker(`Provider request ${requestId} has no completed billing reconciliation.`, attemptId));
      continue;
    }
    const event = latestEventByRequest.get(requestId);
    if (!event) {
      blockers.push(hardBlocker(`Provider request ${requestId} has no append-only billing event.`, attemptId));
      continue;
    }
    if (
      event.status !== status
      || event.actualCostMinor !== Number(request.actual_cost_minor)
      || event.billingReference !== request.billing_reference
      || event.currency !== request.budget_currency
    ) {
      blockers.push(hardBlocker(`Provider request ${requestId} billing summary differs from its latest review event.`, attemptId));
    }
  }
  const caseEvidence = record(bundle.caseEvidence, "caseEvidence");
  if (caseEvidence.billing_reconciliation_status === "pending") {
    blockers.push(hardBlocker("Evaluation case billing reconciliation is still pending.", attemptId));
  }
  return blockers;
}

function evidenceLayers(
  bundle: EvaluationCaseEvidenceBundle,
  attemptId: string,
): {
  providerOriginal?: ProviderOriginalEvidence;
  postprocessed?: PostprocessedEvidence;
  blockers: EvaluationHardBlocker[];
} {
  const blockers: EvaluationHardBlocker[] = [];
  const images = bundle.images.map((value, index) => record(value, `images[${index}]`));
  const providers = images.filter((image) => image.layer === "provider-original")
    .sort((left, right) => Number(left.output_index) - Number(right.output_index));
  const processed = images.filter((image) => image.layer === "postprocessed")
    .sort((left, right) => Number(left.output_index) - Number(right.output_index));
  if (providers.length !== processed.length || providers.length < 1) {
    blockers.push(hardBlocker("Successful case must contain the same non-zero number of Provider originals and postprocessed outputs.", attemptId));
  }
  for (const [index, provider] of providers.entries()) {
    const result = processed[index];
    if (
      Number(provider.output_index) !== index
      || Number(result?.output_index) !== index
      || result?.source_evidence_id !== provider.id
    ) {
      blockers.push(hardBlocker(`Output ${index} does not form a Provider-original/postprocessed evidence pair.`, attemptId));
    }
  }
  const provider = providers[0];
  const result = processed[0];
  return {
    ...(provider ? {
      providerOriginal: {
        evidenceId: requiredString(provider.id, "provider evidence id"),
        layer: "provider-original",
        artifactSha256: requiredSha256(provider.artifact_sha256, "provider artifact SHA-256"),
        mimeType: requiredString(provider.mime_type, "provider MIME") as ProviderOriginalEvidence["mimeType"],
        width: Number(provider.width),
        height: Number(provider.height),
        storageRef: requiredString(provider.storage_ref, "provider storage ref"),
        capturedAt: new Date(Number(provider.captured_at)).toISOString(),
      },
    } : {}),
    ...(result ? {
      postprocessed: {
        evidenceId: requiredString(result.id, "postprocessed evidence id"),
        layer: "postprocessed",
        sourceEvidenceId: requiredString(result.source_evidence_id, "postprocessed source id"),
        artifactSha256: requiredSha256(result.artifact_sha256, "postprocessed artifact SHA-256"),
        mimeType: requiredString(result.mime_type, "postprocessed MIME") as PostprocessedEvidence["mimeType"],
        width: Number(result.width),
        height: Number(result.height),
        storageRef: requiredString(result.storage_ref, "postprocessed storage ref"),
        capturedAt: new Date(Number(result.captured_at)).toISOString(),
        pipelineVersion: requiredString(result.pipeline_version, "postprocessed pipeline version"),
      },
    } : {}),
    blockers,
  };
}

export interface VerifiedEvaluationImageArtifact {
  caseEvidenceId: string;
  evidenceId: string;
  layer: "provider-original" | "postprocessed";
  outputIndex: number;
  artifactSha256: string;
  mimeType: string;
  width: number;
  height: number;
  storageRef: string;
}

/**
 * Promotion must not trust database image metadata alone. Re-open every local
 * artifact through the same MIME/decoder boundary used at capture time and
 * compare bytes, dimensions, layer linkage and pipeline version exactly.
 */
export async function verifyEvaluationBundleImageArtifacts(
  bundles: readonly EvaluationCaseEvidenceBundle[],
): Promise<{ images: readonly VerifiedEvaluationImageArtifact[]; artifactSetSha256: string }> {
  const verified: VerifiedEvaluationImageArtifact[] = [];
  for (const bundle of bundles) {
    const caseEvidence = record(bundle.caseEvidence, "caseEvidence");
    const caseEvidenceId = requiredString(caseEvidence.id, "caseEvidence.id");
    const rows = bundle.images
      .map((value, index) => record(value, `images[${index}]`))
      .sort((left, right) => (
        Number(left.output_index) - Number(right.output_index)
        || String(left.layer).localeCompare(String(right.layer))
      ));
    for (const [index, row] of rows.entries()) {
      const layer = row.layer;
      if (layer !== "provider-original" && layer !== "postprocessed") {
        throw new Error(`images[${index}].layer is invalid`);
      }
      const evidenceId = requiredString(row.id, `images[${index}].id`);
      const storageRef = requiredString(row.storage_ref, `images[${index}].storage_ref`);
      const capturedAt = new Date(Number(row.captured_at)).toISOString();
      const inspected = layer === "provider-original"
        ? await inspectEvaluationImageEvidence(
          storageRef,
          "provider-original",
          evidenceId,
          undefined,
          undefined,
          capturedAt,
        )
        : await inspectEvaluationImageEvidence(
          storageRef,
          "postprocessed",
          evidenceId,
          requiredString(row.source_evidence_id, `images[${index}].source_evidence_id`),
          requiredString(row.pipeline_version, `images[${index}].pipeline_version`),
          capturedAt,
        );
      if (
        inspected.artifactSha256 !== row.artifact_sha256
        || inspected.mimeType !== row.mime_type
        || inspected.width !== Number(row.width)
        || inspected.height !== Number(row.height)
        || inspected.imageIndex !== Number(row.output_index)
        || (row.byte_length !== undefined && row.byte_length !== null
          && inspected.bytes !== Number(row.byte_length))
      ) {
        throw new Error(`local evaluation image ${evidenceId} differs from its persisted hash, MIME or dimensions`);
      }
      verified.push({
        caseEvidenceId,
        evidenceId,
        layer,
        outputIndex: inspected.imageIndex,
        artifactSha256: inspected.artifactSha256,
        mimeType: inspected.mimeType,
        width: inspected.width,
        height: inspected.height,
        storageRef,
      });
    }
  }
  verified.sort((left, right) => (
    left.caseEvidenceId.localeCompare(right.caseEvidenceId)
    || left.outputIndex - right.outputIndex
    || left.layer.localeCompare(right.layer)
    || left.evidenceId.localeCompare(right.evidenceId)
  ));
  return { images: verified, artifactSetSha256: evaluationArtifactSha256(verified) };
}

function attemptFromBundle(
  bundle: EvaluationCaseEvidenceBundle,
  expectedUnit: PromptEvaluationUnit,
  currentVersions: PromptEvaluationVersionVector,
  codeSha: string,
  stage: PromptEvaluationStage,
): { attempt: PromptEvaluationAttempt; auditRef: EvaluationCaseAuditRef; authorizationUnitKey: `sha256:${string}` } {
  const caseEvidence = record(bundle.caseEvidence, "caseEvidence");
  const runtime = record(caseEvidence.snapshot, "caseEvidence.snapshot");
  const snapshot = record(runtime.snapshot, "caseEvidence.snapshot.snapshot");
  const persistedUnit = record(snapshot.unit, "caseEvidence.snapshot.snapshot.unit");
  const persistedVersions = record(snapshot.versions, "caseEvidence.snapshot.snapshot.versions");
  const attemptId = requiredString(caseEvidence.id, "caseEvidence.id");
  const blockers: EvaluationHardBlocker[] = [];
  if (!exactJson(persistedUnit, expectedUnit)) blockers.push(hardBlocker("Persisted evaluation unit differs from the current exact unit.", attemptId));
  if (!exactJson(persistedVersions, currentVersions)) blockers.push({
    code: "version-drift",
    detail: "Persisted evaluation version vector differs from the current vector.",
    attemptId,
  });
  if (caseEvidence.code_dirty !== false || caseEvidence.code_sha !== codeSha) blockers.push({
    code: "version-drift",
    detail: "Evaluation case was not captured from the approved clean code SHA.",
    attemptId,
  });
  if (runtime.codeIdentity && record(runtime.codeIdentity, "runtime.codeIdentity").codeSha !== codeSha) {
    blockers.push({ code: "version-drift", detail: "Runtime code identity differs from the promotion code SHA.", attemptId });
  }
  if (caseEvidence.finalized_at === null || caseEvidence.evidence_record_sha256 === null) {
    blockers.push(hardBlocker("Evaluation case is not finalized with an evidence-record digest.", attemptId));
  }
  const authorizationUnitKey = requiredContractHash(caseEvidence.evaluation_unit_key, "evaluation_unit_key");
  blockers.push(...billingIntegrityBlockers(bundle, attemptId));
  const rawOutcome = requiredString(caseEvidence.outcome, "caseEvidence.outcome");
  const requestRows = bundle.providerRequests.map((value, index) => record(value, `providerRequests[${index}]`));
  const requestOutcomes = requestRows.map((request, index) => {
    const outcome = requiredString(request.outcome, `providerRequests[${index}].outcome`);
    if (outcome !== "succeeded" && outcome !== "failed" && outcome !== "outcome_unknown") {
      throw new Error(`providerRequests[${index}].outcome is invalid`);
    }
    return outcome;
  });
  let outcome: PromptEvaluationAttempt["outcome"];
  if (rawOutcome === "outcome_unknown" || requestOutcomes.includes("outcome_unknown")) {
    outcome = "outcome_unknown";
  } else if (rawOutcome === "succeeded" && requestOutcomes.every((requestOutcome) => requestOutcome === "succeeded")) {
    outcome = "succeeded";
  } else if (rawOutcome === "succeeded") {
    blockers.push(hardBlocker(
      "Evaluation case is marked succeeded while at least one Provider request is not succeeded.",
      attemptId,
    ));
    outcome = "deterministic-failure";
  }
  else if (requestRows.some((request) => request.billing_reconciliation_status === "confirmed-billed")) {
    outcome = "billed-failure";
  } else {
    outcome = "deterministic-failure";
  }

  const assessments = latestManualAssessments(bundle);
  const postprocessedCount = bundle.images.filter((image) => record(image, "image").layer === "postprocessed").length;
  const requiresScores = stage === "internal-experiment" || stage === "formal-validation" || stage === "recommendation";
  if (outcome === "succeeded" && requiresScores && assessments.length !== postprocessedCount) {
    blockers.push(hardBlocker("Every postprocessed output must have one current manual assessment.", attemptId));
  }
  const scores = assessments.length === postprocessedCount ? averageScores(assessments) : undefined;
  blockers.push(...assessments.flatMap((assessment) => [...assessment.hardBlockers]));
  const caseBlockers = Array.isArray(caseEvidence.hard_blockers)
    ? caseEvidence.hard_blockers as EvaluationHardBlocker[]
    : [];
  blockers.push(...caseBlockers);
  const layers = outcome === "succeeded"
    ? evidenceLayers(bundle, attemptId)
    : { blockers: [] as EvaluationHardBlocker[] };
  blockers.push(...layers.blockers);
  const requestSnapshotSha256 = requiredSha256(caseEvidence.request_snapshot_sha256, "request_snapshot_sha256");
  const attempt: PromptEvaluationAttempt = {
    attemptId,
    unitKey: promptEvaluationUnitKey(expectedUnit),
    sampleId: requiredString(caseEvidence.sample_id, "sample_id"),
    requestSnapshotSha256,
    outcome,
    versions: currentVersions,
    ...(layers.providerOriginal ? { providerOriginal: layers.providerOriginal } : {}),
    ...(layers.postprocessed ? { postprocessed: layers.postprocessed } : {}),
    ...(scores ? { scores } : {}),
    taskPassed: outcome === "succeeded"
      && assessments.length > 0
      && assessments.every((assessment) => assessment.taskPassed)
      && blockers.length === 0,
    validForScoring: true,
    recentRequest: true,
    hardBlockers: blockers,
  };
  const auditRef: EvaluationCaseAuditRef = {
    caseEvidenceId: attemptId,
    runId: requiredString(caseEvidence.run_id, "run_id"),
    caseId: requiredString(caseEvidence.case_id, "case_id"),
    sampleId: attempt.sampleId,
    evidenceRecordSha256: requiredSha256(caseEvidence.evidence_record_sha256, "evidence_record_sha256"),
    billingTailSha256: bundle.billingEvents.at(-1)?.eventSha256 ?? null,
    manualAssessmentTailSha256: bundle.manualAssessmentEvents.at(-1)?.eventSha256 ?? null,
  };
  return { attempt, auditRef, authorizationUnitKey };
}

function assertPreviousReceipts(
  stage: PromptEvaluationStage,
  receipts: readonly EvaluationGateReceipt[],
  expectedUnit: PromptEvaluationUnit,
  versions: PromptEvaluationVersionVector,
  codeSha: string,
): PromptEvaluationStage[] {
  const required = PROMPT_EVALUATION_STAGE_ORDER.slice(0, PROMPT_EVALUATION_STAGE_ORDER.indexOf(stage));
  if (receipts.length !== required.length) {
    throw new Error(`stage ${stage} requires exactly ${required.length} previous receipt(s)`);
  }
  const validatedReceipts: EvaluationGateReceipt[] = [];
  for (const [index, receiptValue] of receipts.entries()) {
    const receipt = parseEvaluationGateReceiptStructure(receiptValue);
    const expectedStage = required[index];
    if (receipt.stage !== expectedStage) {
      throw new Error(`previous receipt ${index} must be ${expectedStage}`);
    }
    if (!receipt.gateResult.passed) throw new Error(`previous ${receipt.stage} receipt did not pass`);
    if (receipt.codeSha !== codeSha) throw new Error(`previous ${receipt.stage} receipt code SHA drifted`);
    if (!exactJson(receipt.unit, expectedUnit) || !exactJson(receipt.currentVersions, versions)) {
      throw new Error(`previous ${receipt.stage} receipt belongs to another unit or version vector`);
    }
    const expectedPrefix = required.slice(0, index);
    if (!exactJson(receipt.passedStages, expectedPrefix)) {
      throw new Error(`previous ${receipt.stage} receipt passed-stage prefix is invalid`);
    }
    const expectedPreviousHashes = receipts.slice(0, index).map((previous) => previous.artifactSha256);
    if (!exactJson(receipt.previousReceiptSha256s, expectedPreviousHashes)) {
      throw new Error(`previous ${receipt.stage} receipt hash chain is invalid`);
    }
    assertStageCaseIdentityDisjoint(
      receipt.stage,
      receipt.cases,
      validatedReceipts,
      `previous ${receipt.stage} receipt.cases`,
    );
    assertStageAuthorizationUnitKeyConsistent(
      receipt.stage,
      receipt.authorizationUnitKey,
      validatedReceipts,
      `previous ${receipt.stage} receipt`,
    );
    validatedReceipts.push(receipt);
  }
  return required;
}

export function evaluateEvidenceBundlesForStage(input: {
  variantId: string;
  stage: PromptEvaluationStage;
  bundles: readonly EvaluationCaseEvidenceBundle[];
  previousReceipts?: readonly EvaluationGateReceipt[];
  codeSha: string;
  contractVerified: boolean;
}): EvaluatedEvidenceGate {
  if (!CODE_SHA_PATTERN.test(input.codeSha)) {
    throw new Error("promotion codeSha must be exactly 40 or 64 lowercase hexadecimal characters");
  }
  const { unit, versions } = currentEvaluationPromotionTarget(input.variantId);
  const passedStages = assertPreviousReceipts(
    input.stage,
    input.previousReceipts ?? [],
    unit,
    versions,
    input.codeSha,
  );
  const converted = input.bundles.map((bundle) => attemptFromBundle(
    bundle,
    unit,
    versions,
    input.codeSha,
    input.stage,
  ));
  const caseAuditRefs = assertStageCaseIdentityDisjoint(
    input.stage,
    converted.map((entry) => entry.auditRef),
    input.previousReceipts ?? [],
    "current stage caseAuditRefs",
  );
  const authorizationKeys = [...new Set(converted.map((entry) => entry.authorizationUnitKey))];
  const authorizationUnitKey = authorizationKeys.length === 0
    ? null
    : authorizationKeys.length === 1 ? authorizationKeys[0] : null;
  const crossCaseBlockers: EvaluationHardBlocker[] = [];
  if (authorizationKeys.length > 1) {
    crossCaseBlockers.push(hardBlocker("Stage evidence spans more than one exact authorization evaluation-unit key."));
  }
  if (authorizationUnitKey !== null) {
    try {
      assertStageAuthorizationUnitKeyConsistent(
        input.stage,
        authorizationUnitKey,
        input.previousReceipts ?? [],
        "current stage",
      );
    } catch (error) {
      crossCaseBlockers.push(hardBlocker(error instanceof Error ? error.message : String(error)));
    }
  }
  if (input.stage === "recommendation") {
    crossCaseBlockers.push(hardBlocker(RECOMMENDATION_BASELINE_BLOCKER_DETAIL));
  }
  const gateResult = evaluatePromptEvaluationGate({
    unit,
    stage: input.stage,
    contractVerified: input.contractVerified,
    passedStages,
    attempts: converted.map((entry) => entry.attempt),
    currentVersions: versions,
    hardBlockers: crossCaseBlockers,
  });
  return {
    unit,
    unitKey: promptEvaluationUnitKey(unit),
    authorizationUnitKey,
    currentVersions: versions,
    attempts: converted.map((entry) => entry.attempt),
    caseAuditRefs,
    gateResult,
  };
}

function receiptPayload(receipt: Omit<EvaluationGateReceipt, "artifactSha256">) {
  return receipt;
}

function assertEvaluatedGateMatchesAttempts(
  evaluated: EvaluatedEvidenceGate,
  stage: PromptEvaluationStage,
  passedStages: readonly PromptEvaluationStage[],
): readonly EvaluationCaseAuditRef[] {
  if (evaluated.unitKey !== promptEvaluationUnitKey(evaluated.unit)) {
    throw new Error("evaluated gate unit key is invalid");
  }
  if (stage === "contract") {
    if (evaluated.authorizationUnitKey !== null) {
      throw new Error("contract-stage evaluated gate must not bind a paid authorization unit");
    }
  } else {
    requiredContractHash(evaluated.authorizationUnitKey, "evaluated gate.authorizationUnitKey");
  }
  const cases = assertEvaluationGateSnapshot(
    stage,
    evaluated.caseAuditRefs,
    evaluated.gateResult,
    "evaluated gate",
  );
  if (evaluated.attempts.length !== cases.length) {
    throw new Error("evaluated gate attempts differ from its retained case references");
  }
  for (const [index, attempt] of evaluated.attempts.entries()) {
    const caseRef = cases[index];
    if (attempt.attemptId !== caseRef.caseEvidenceId || attempt.sampleId !== caseRef.sampleId) {
      throw new Error(`evaluated gate attempt ${index} differs from its retained case reference`);
    }
  }
  const recomputed = evaluatePromptEvaluationGate({
    unit: evaluated.unit,
    stage,
    contractVerified: true,
    passedStages,
    attempts: evaluated.attempts,
    currentVersions: evaluated.currentVersions,
  });
  if (!exactJson(recomputed, evaluated.gateResult)) {
    throw new Error("evaluated gate result differs from its immutable attempts");
  }
  return cases;
}

export function createEvaluationGateReceipt(input: {
  evaluated: EvaluatedEvidenceGate;
  stage: PromptEvaluationStage;
  previousReceipts: readonly EvaluationGateReceipt[];
  codeSha: string;
  approvedBy: string;
  auditReason: string;
  createdAt: string;
  contractCheckSha256?: string | null;
  campaignId?: string | null;
  campaignClosureSha256?: string | null;
}): EvaluationGateReceipt {
  if (input.stage === "recommendation") {
    throw new Error(RECOMMENDATION_BASELINE_BLOCKER_DETAIL);
  }
  if (!input.evaluated.gateResult.passed) throw new Error("a failed evaluation gate cannot produce a passed-stage receipt");
  if (!input.approvedBy.trim() || !input.auditReason.trim()) throw new Error("gate receipt requires administrator and audit reason");
  if (!Number.isFinite(Date.parse(input.createdAt))) throw new Error("gate receipt createdAt is invalid");
  if (input.evaluated.gateResult.stage !== input.stage) throw new Error("evaluated gate stage differs from receipt stage");
  const contractCheckSha256 = input.contractCheckSha256 ?? null;
  const campaignId = input.campaignId ?? null;
  const campaignClosureSha256 = input.campaignClosureSha256 ?? null;
  if (input.stage === "contract") {
    if (!contractCheckSha256 || !SHA256_PATTERN.test(contractCheckSha256)) {
      throw new Error("contract-stage receipt requires the exact contract-check artifact SHA-256");
    }
  } else if (contractCheckSha256 !== null) {
    throw new Error("only the contract-stage receipt may reference a contract-check artifact");
  }
  assertStageCampaignClosureBinding(
    input.stage,
    campaignId,
    campaignClosureSha256,
    "gate receipt",
  );
  const expectedPassedStages = assertPreviousReceipts(
    input.stage,
    input.previousReceipts,
    input.evaluated.unit,
    input.evaluated.currentVersions,
    input.codeSha,
  );
  const cases = assertStageCaseIdentityDisjoint(
    input.stage,
    input.evaluated.caseAuditRefs,
    input.previousReceipts,
    "evaluated gate.caseAuditRefs",
  );
  assertStageAuthorizationUnitKeyConsistent(
    input.stage,
    input.evaluated.authorizationUnitKey,
    input.previousReceipts,
    "evaluated gate",
  );
  assertEvaluatedGateMatchesAttempts(input.evaluated, input.stage, expectedPassedStages);
  const base: Omit<EvaluationGateReceipt, "artifactSha256"> = {
    schemaVersion: 1,
    artifactType: "prompt-evaluation-stage-gate",
    stage: input.stage,
    variantId: input.evaluated.unit.promptVariantId,
    unit: input.evaluated.unit,
    unitKey: input.evaluated.unitKey,
    authorizationUnitKey: input.evaluated.authorizationUnitKey,
    campaignId,
    campaignClosureSha256,
    currentVersions: input.evaluated.currentVersions,
    codeSha: input.codeSha,
    contractVerified: true,
    contractCheckSha256,
    passedStages: expectedPassedStages,
    previousReceiptSha256s: input.previousReceipts.map((receipt) => receipt.artifactSha256),
    cases,
    gateResult: input.evaluated.gateResult,
    approvedBy: input.approvedBy.trim(),
    auditReason: input.auditReason.trim(),
    createdAt: input.createdAt,
  };
  const receipt = { ...base, artifactSha256: evaluationArtifactSha256(receiptPayload(base)) };
  return parseEvaluationGateReceiptStructure(receipt);
}

/**
 * Parse and fully validate the self-contained receipt shape and aggregate
 * arithmetic. This is not evidence authentication: callers that accept an
 * external artifact must use validateEvaluationGateReceipt, which remains
 * fail-closed until the immutable campaign/evidence ledger is implemented.
 */
export function parseEvaluationGateReceiptStructure(value: unknown): EvaluationGateReceipt {
  const receiptRecord = record(value, "gate receipt");
  assertExactFields(receiptRecord, [
    "schemaVersion", "artifactType", "stage", "variantId", "unit", "unitKey",
    "authorizationUnitKey", "campaignId", "campaignClosureSha256", "currentVersions", "codeSha", "contractVerified",
    "contractCheckSha256", "passedStages", "previousReceiptSha256s", "cases",
    "gateResult", "approvedBy", "auditReason", "createdAt", "artifactSha256",
  ], "gate receipt");
  const receipt = receiptRecord as unknown as EvaluationGateReceipt;
  if (receipt.schemaVersion !== 1 || receipt.artifactType !== "prompt-evaluation-stage-gate") {
    throw new Error("gate receipt schema is invalid");
  }
  if (!PROMPT_EVALUATION_STAGE_ORDER.includes(receipt.stage)) throw new Error("gate receipt stage is invalid");
  if (receipt.stage === "recommendation") throw new Error(RECOMMENDATION_BASELINE_BLOCKER_DETAIL);
  assertCodeSha(receipt.codeSha, "gate receipt.codeSha");
  if (!SHA256_PATTERN.test(receipt.artifactSha256)) throw new Error("gate receipt artifact SHA-256 is invalid");
  const { artifactSha256, ...base } = receipt;
  if (evaluationArtifactSha256(receiptPayload(base)) !== artifactSha256) throw new Error("gate receipt artifact SHA-256 does not match its content");
  const unit = validatePersistedUnit(receipt.unit, "gate receipt.unit");
  validatePersistedVersions(receipt.currentVersions, unit, "gate receipt.currentVersions");
  if (receipt.unitKey !== promptEvaluationUnitKey(unit)) throw new Error("gate receipt unit key is invalid");
  if (receipt.variantId !== receipt.unit.promptVariantId) throw new Error("gate receipt variant differs from its unit");
  if (receipt.stage === "contract") {
    if (receipt.authorizationUnitKey !== null) {
      throw new Error("contract-stage gate receipt must not bind a paid authorization unit");
    }
  } else {
    requiredContractHash(receipt.authorizationUnitKey, "gate receipt.authorizationUnitKey");
  }
  assertStageCampaignClosureBinding(
    receipt.stage,
    receipt.campaignId,
    receipt.campaignClosureSha256,
    "gate receipt",
  );
  if (receipt.contractVerified !== true) throw new Error("gate receipt contractVerified must be true");
  if (receipt.stage === "contract") {
    requiredSha256(receipt.contractCheckSha256, "gate receipt.contractCheckSha256");
  } else if (receipt.contractCheckSha256 !== null) {
    throw new Error("non-contract gate receipt must not reference a contract check");
  }
  const expectedPassedStages = PROMPT_EVALUATION_STAGE_ORDER.slice(
    0,
    PROMPT_EVALUATION_STAGE_ORDER.indexOf(receipt.stage),
  );
  if (!exactJson(receipt.passedStages, expectedPassedStages)) throw new Error("gate receipt passed-stage prefix is invalid");
  if (assertStringArray(receipt.previousReceiptSha256s, "gate receipt.previousReceiptSha256s", true).length
    !== expectedPassedStages.length) {
    throw new Error("gate receipt previous-receipt hash chain is invalid");
  }
  assertEvaluationGateSnapshot(receipt.stage, receipt.cases, receipt.gateResult, "gate receipt");
  requiredString(receipt.approvedBy, "gate receipt.approvedBy");
  requiredString(receipt.auditReason, "gate receipt.auditReason");
  assertIsoTimestamp(receipt.createdAt, "gate receipt.createdAt");
  return receipt;
}

export function validateEvaluationGateReceipt(value: unknown): EvaluationGateReceipt {
  const receipt = parseEvaluationGateReceiptStructure(value);
  if (receipt.stage !== "contract") assertEvaluationCampaignReady();
  return receipt;
}

function supportForStage(
  stage: PromptEvaluationStage,
): ReleasedPromptSupportStatus {
  if (stage === "internal-experiment") return "experimental";
  if (stage === "formal-validation") return "verified";
  if (stage === "recommendation") throw new Error(RECOMMENDATION_BASELINE_BLOCKER_DETAIL);
  throw new Error(`${stage} cannot be registered as a runtime release`);
}

export function createEvaluationPromotionArtifact(input: {
  gateReceipt: EvaluationGateReceipt;
  reEvaluated: EvaluatedEvidenceGate;
  previousReceipts: readonly EvaluationGateReceipt[];
  approvedBy: string;
  approvalReason: string;
  approvedAt: string;
  localArtifactSetSha256: string;
}): { artifact: EvaluationPromotionArtifact; release: PromptEvaluationRelease } {
  const gateReceipt = parseEvaluationGateReceiptStructure(input.gateReceipt);
  if (!input.reEvaluated.gateResult.passed) throw new Error("promotion requires a currently passing DB-backed gate");
  if (gateReceipt.stage !== input.reEvaluated.gateResult.stage) throw new Error("gate receipt stage differs from re-evaluation");
  if (!exactJson(gateReceipt.unit, input.reEvaluated.unit)) throw new Error("gate receipt unit differs from current DB evidence");
  if (!exactJson(gateReceipt.gateResult, input.reEvaluated.gateResult)) throw new Error("gate receipt result differs from current DB evidence");
  if (!exactJson(gateReceipt.cases, input.reEvaluated.caseAuditRefs)) throw new Error("gate receipt evidence set differs from current DB evidence");
  if (!input.reEvaluated.authorizationUnitKey) throw new Error("promotion evidence has no single exact authorization unit key");
  if (gateReceipt.authorizationUnitKey !== input.reEvaluated.authorizationUnitKey) {
    throw new Error("gate receipt authorization unit differs from current DB evidence");
  }
  assertStageCampaignClosureBinding(
    gateReceipt.stage,
    gateReceipt.campaignId,
    gateReceipt.campaignClosureSha256,
    "gate receipt",
  );
  if (!input.approvedBy.trim() || !input.approvalReason.trim()) throw new Error("promotion requires administrator and approval reason");
  if (!Number.isFinite(Date.parse(input.approvedAt))) throw new Error("promotion approvedAt is invalid");
  if (!SHA256_PATTERN.test(input.localArtifactSetSha256)) {
    throw new Error("promotion requires a verified local artifact-set SHA-256");
  }
  assertPreviousReceipts(
    gateReceipt.stage,
    input.previousReceipts,
    input.reEvaluated.unit,
    input.reEvaluated.currentVersions,
    gateReceipt.codeSha,
  );
  assertStageCaseIdentityDisjoint(
    gateReceipt.stage,
    input.reEvaluated.caseAuditRefs,
    input.previousReceipts,
    "promotion re-evaluation.caseAuditRefs",
  );
  assertStageAuthorizationUnitKeyConsistent(
    gateReceipt.stage,
    input.reEvaluated.authorizationUnitKey,
    input.previousReceipts,
    "promotion re-evaluation",
  );
  const suppliedPreviousHashes = input.previousReceipts.map((receipt) => receipt.artifactSha256);
  if (!exactJson(gateReceipt.previousReceiptSha256s, suppliedPreviousHashes)) {
    throw new Error("gate receipt previous-receipt chain differs from supplied artifacts");
  }
  const variant = getGarmentPromptVariantById(input.reEvaluated.unit.promptVariantId);
  if (!variant) throw new Error("promotion variant is no longer in the reviewed catalog");
  const supportStatus = supportForStage(gateReceipt.stage);
  const releaseVector = promptEvaluationReleaseVector(
    variant,
    gateReceipt.codeSha,
  );
  const base: Omit<EvaluationPromotionArtifact, "artifactSha256"> = {
    schemaVersion: 1,
    artifactType: "prompt-evaluation-promotion",
    variantId: variant.variantId,
    supportStatus,
    evaluationStage: gateReceipt.stage as EvaluationPromotionArtifact["evaluationStage"],
    unit: input.reEvaluated.unit,
    unitKey: input.reEvaluated.unitKey,
    authorizationUnitKey: input.reEvaluated.authorizationUnitKey,
    campaignId: gateReceipt.campaignId!,
    campaignClosureSha256: gateReceipt.campaignClosureSha256!,
    currentVersions: input.reEvaluated.currentVersions,
    codeSha: gateReceipt.codeSha,
    releaseVector,
    gateReceiptSha256: gateReceipt.artifactSha256,
    previousReceiptSha256s: input.previousReceipts.map((receipt) => receipt.artifactSha256),
    cases: input.reEvaluated.caseAuditRefs,
    localArtifactSetSha256: input.localArtifactSetSha256,
    gateResult: input.reEvaluated.gateResult,
    approvedBy: input.approvedBy.trim(),
    approvalReason: input.approvalReason.trim(),
    approvedAt: input.approvedAt,
  };
  const artifact: EvaluationPromotionArtifact = {
    ...base,
    artifactSha256: evaluationArtifactSha256(base),
  };
  const profile = getModelParameterProfile(variant.parameterProfileId);
  if (!profile) throw new Error("promotion parameter profile is no longer available");
  const release = createPromptEvaluationReleaseSnapshot(
    variant,
    supportStatus,
    `promotions/${artifact.artifactSha256}.json`,
    {
      evaluationStage: artifact.evaluationStage,
      evidenceArtifactSha256: artifact.artifactSha256,
      gateReceiptSha256: artifact.gateReceiptSha256,
      evaluationUnitKey: artifact.authorizationUnitKey,
      codeSha: artifact.codeSha,
    },
  );
  if (
    release.releaseVector !== artifact.releaseVector
    || release.contractHash !== requiredContractHash(artifact.currentVersions.providerContractVersion, "providerContractVersion")
    || release.parameterProfileVersion !== profile.version
    || release.postprocessVersion !== profile.postprocess.version
  ) {
    throw new Error("generated release snapshot differs from the promotion artifact");
  }
  return { artifact, release };
}

/** Structural parser only; it does not authenticate the referenced evidence. */
export function parseEvaluationPromotionArtifactStructure(value: unknown): EvaluationPromotionArtifact {
  const artifactRecord = record(value, "promotion artifact");
  assertExactFields(artifactRecord, [
    "schemaVersion", "artifactType", "variantId", "supportStatus", "evaluationStage",
    "unit", "unitKey", "authorizationUnitKey", "campaignId", "campaignClosureSha256", "currentVersions", "codeSha",
    "releaseVector", "gateReceiptSha256", "previousReceiptSha256s", "cases",
    "localArtifactSetSha256", "gateResult", "approvedBy", "approvalReason",
    "approvedAt", "artifactSha256",
  ], "promotion artifact");
  const artifact = artifactRecord as unknown as EvaluationPromotionArtifact;
  if (artifact.schemaVersion !== 1 || artifact.artifactType !== "prompt-evaluation-promotion") {
    throw new Error("promotion artifact schema is invalid");
  }
  if (artifact.evaluationStage === "recommendation" || artifact.supportStatus === "recommended") {
    throw new Error(RECOMMENDATION_BASELINE_BLOCKER_DETAIL);
  }
  if (!SHA256_PATTERN.test(artifact.artifactSha256)) throw new Error("promotion artifact SHA-256 is invalid");
  const { artifactSha256, ...base } = artifact;
  if (evaluationArtifactSha256(base) !== artifactSha256) throw new Error("promotion artifact SHA-256 does not match its content");
  const unit = validatePersistedUnit(artifact.unit, "promotion artifact.unit");
  validatePersistedVersions(artifact.currentVersions, unit, "promotion artifact.currentVersions");
  if (artifact.variantId !== unit.promptVariantId) throw new Error("promotion artifact variant differs from its unit");
  if (artifact.unitKey !== promptEvaluationUnitKey(unit)) throw new Error("promotion artifact unit key is invalid");
  requiredContractHash(artifact.authorizationUnitKey, "promotion artifact.authorizationUnitKey");
  assertStageCampaignClosureBinding(
    artifact.evaluationStage,
    artifact.campaignId,
    artifact.campaignClosureSha256,
    "promotion artifact",
  );
  assertCodeSha(artifact.codeSha, "promotion artifact.codeSha");
  const expectedStatus = supportForStage(artifact.evaluationStage);
  if (artifact.supportStatus !== expectedStatus) throw new Error("promotion artifact stage/status pairing is invalid");
  requiredString(artifact.releaseVector, "promotion artifact.releaseVector");
  requiredSha256(artifact.gateReceiptSha256, "promotion artifact.gateReceiptSha256");
  const requiredPrevious = PROMPT_EVALUATION_STAGE_ORDER.indexOf(artifact.evaluationStage);
  if (assertStringArray(
    artifact.previousReceiptSha256s,
    "promotion artifact.previousReceiptSha256s",
    true,
  ).length !== requiredPrevious) {
    throw new Error("promotion artifact previous-receipt chain length is invalid");
  }
  assertEvaluationGateSnapshot(
    artifact.evaluationStage,
    artifact.cases,
    artifact.gateResult,
    "promotion artifact",
  );
  requiredSha256(artifact.localArtifactSetSha256, "promotion artifact.localArtifactSetSha256");
  requiredString(artifact.approvedBy, "promotion artifact.approvedBy");
  requiredString(artifact.approvalReason, "promotion artifact.approvalReason");
  assertIsoTimestamp(artifact.approvedAt, "promotion artifact.approvedAt");
  const variant = getGarmentPromptVariantById(artifact.variantId);
  if (!variant) throw new Error("promotion artifact variant is not in the current catalog");
  if (artifact.releaseVector !== promptEvaluationReleaseVector(
    variant,
    artifact.codeSha,
  )) {
    throw new Error("promotion artifact release vector differs from the current reviewed content");
  }
  return artifact;
}

export function validateEvaluationPromotionArtifact(value: unknown): EvaluationPromotionArtifact {
  const artifact = parseEvaluationPromotionArtifactStructure(value);
  assertEvaluationCampaignReady();
  return artifact;
}
