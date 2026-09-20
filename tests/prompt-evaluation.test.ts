import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  GOLDEN_GARMENT_SAMPLE_IDS,
  GOLDEN_GARMENT_SET_VERSION,
  PROMPT_SCORE_WEIGHTS,
  PROMPT_SCORING_RUBRIC_VERSION,
  automaticRetryDecision,
  bootstrapQualityGainLowerBound,
  evaluatePromptEvaluationGate,
  promptEvaluationUnitKey,
  resolveEvaluationShutdown,
  scorePromptEvaluation,
  versionDowngradeDecision,
} from "../src/lib/promptEvaluation";
import type {
  EvaluationShutdownRule,
  PromptEvaluationAttempt,
  PromptEvaluationScores,
  PromptEvaluationUnit,
  PromptEvaluationVersionVector,
} from "../src/types/promptEvaluation";
import { imageModelContractHash } from "../src/types/imageModels";
import {
  PROVIDER_PROMPT_RENDERER_HASH,
  PROVIDER_PROMPT_RENDERER_VERSION,
} from "../src/lib/providerPromptRenderer";

const unit: PromptEvaluationUnit = {
  taskFamilyId: "fashion-lookbook",
  promptVariantId: "fashion-lookbook.gemini-3.1-flash-image.edit.v1",
  presetId: "fashion-lookbook-gemini",
  presetVersion: "1.0.0",
  nodeKind: "image",
  modelId: "gemini-3.1-flash-image",
  operationMode: "edit",
  parameterProfileId: "gemini-3.1-flash-image:fashion-lookbook:edit:v1",
  parameterProfileVersion: "1.0.0",
};

const versions: PromptEvaluationVersionVector = {
  presetVersion: unit.presetVersion,
  parameterProfileVersion: unit.parameterProfileVersion,
  providerContractVersion: imageModelContractHash(unit.modelId),
  resolvedModelVersion: "gemini-3.1-flash-image-observed-v1",
  providerPromptRendererVersion: PROVIDER_PROMPT_RENDERER_VERSION,
  providerPromptRendererHash: PROVIDER_PROMPT_RENDERER_HASH,
  inputNormalizationVersion: "input-v1",
  postprocessingVersion: "fit-contain-dominant-webp-v1",
  goldenSetVersion: GOLDEN_GARMENT_SET_VERSION,
  scoringRubricVersion: PROMPT_SCORING_RUBRIC_VERSION,
};

const passingScores: PromptEvaluationScores = {
  garmentMaterialFidelity: 90,
  instructionFollowing: 90,
  artifactControl: 90,
  commercialUsability: 90,
};
const baselineScores: PromptEvaluationScores = {
  garmentMaterialFidelity: 78,
  instructionFollowing: 78,
  artifactControl: 78,
  commercialUsability: 78,
};
const unitKey = promptEvaluationUnitKey(unit);

function makeAttempt(
  sampleId: string,
  overrides: Partial<PromptEvaluationAttempt> = {},
): PromptEvaluationAttempt {
  const providerEvidenceId = `provider-${sampleId}`;
  return {
    attemptId: `attempt-${sampleId}`,
    unitKey,
    sampleId,
    requestSnapshotSha256: "a".repeat(64),
    outcome: "succeeded",
    versions,
    recentRequest: true,
    validForScoring: true,
    taskPassed: true,
    providerOriginal: {
      evidenceId: providerEvidenceId,
      layer: "provider-original",
      artifactSha256: "b".repeat(64),
      mimeType: "image/png",
      width: 2048,
      height: 2048,
      storageRef: `evidence/${sampleId}/provider.png`,
      capturedAt: "2026-09-02T00:00:00.000Z",
    },
    postprocessed: {
      evidenceId: `post-${sampleId}`,
      layer: "postprocessed",
      sourceEvidenceId: providerEvidenceId,
      pipelineVersion: versions.postprocessingVersion,
      artifactSha256: "c".repeat(64),
      mimeType: "image/webp",
      width: 1536,
      height: 2048,
      storageRef: `evidence/${sampleId}/business.webp`,
      capturedAt: "2026-09-02T00:00:01.000Z",
    },
    scores: passingScores,
    baselineScores,
    ...overrides,
  };
}

assert.notEqual(promptEvaluationUnitKey({ ...unit, parameterProfileVersion: "1.0.1" }), unitKey);

assert.equal(scorePromptEvaluation({
  garmentMaterialFidelity: 90,
  instructionFollowing: 80,
  artifactControl: 60,
  commercialUsability: 50,
}).weightedScore, 75);
assert.throws(() => scorePromptEvaluation({ ...passingScores, artifactControl: 101 }), /0 to 100/);

assert.deepEqual(PROMPT_SCORE_WEIGHTS, {
  garmentMaterialFidelity: 0.35,
  instructionFollowing: 0.30,
  artifactControl: 0.20,
  commercialUsability: 0.15,
});

assert.deepEqual(automaticRetryDecision("outcome_unknown"), {
  allowed: false,
  reason: "outcome-unknown-no-retry",
});
assert.equal(automaticRetryDecision("billed-failure").allowed, false);
assert.equal(automaticRetryDecision("transient-not-billed").allowed, true);

assert.deepEqual(versionDowngradeDecision(versions, versions, "recommended"), {
  changedFields: [],
  requiresFullReevaluation: false,
  resultingSupportLevel: "recommended",
});
const changedVersions = { ...versions, providerContractVersion: `sha256:${"f".repeat(64)}` };
assert.equal(versionDowngradeDecision(versions, changedVersions, "recommended").resultingSupportLevel, "unverified");
assert.equal(versions.providerContractVersion, imageModelContractHash(unit.modelId));

const shutdownRules: EvaluationShutdownRule[] = [
  { id: "global", active: true, scope: { level: "global" }, reason: "incident" },
  { id: "family", active: true, scope: { level: "task-family", taskFamilyId: unit.taskFamilyId }, reason: "drift" },
  { id: "variant", active: true, scope: { level: "model-variant", promptVariantId: unit.promptVariantId }, reason: "provider" },
  { id: "combination", active: true, scope: {
    level: "task-family-model-node",
    taskFamilyId: unit.taskFamilyId,
    modelId: unit.modelId,
    nodeKind: unit.nodeKind,
  }, reason: "regression" },
];
assert.equal(resolveEvaluationShutdown(unit, shutdownRules).effectiveRule?.id, "combination");

const contract = evaluatePromptEvaluationGate({
  unit, stage: "contract", contractVerified: true, passedStages: [], attempts: [], currentVersions: versions,
});
assert.equal(contract.passed, true);
assert.equal(contract.supportLevel, "unverified");
const contractWithProviderAttempt = evaluatePromptEvaluationGate({
  unit,
  stage: "contract",
  contractVerified: true,
  passedStages: [],
  attempts: [makeAttempt("contract-must-stay-zero")],
  currentVersions: versions,
});
assert.equal(contractWithProviderAttempt.passed, false);
assert.ok(contractWithProviderAttempt.hardBlockers.some((blocker) => (
  blocker.code === "evidence-integrity-failure"
  && blocker.detail.includes("must not contain Provider attempts")
)));

const probe = evaluatePromptEvaluationGate({
  unit,
  stage: "provider-probe",
  contractVerified: true,
  passedStages: ["contract"],
  attempts: [makeAttempt("probe-001", { scores: undefined, postprocessed: undefined, taskPassed: undefined })],
  currentVersions: versions,
});
assert.equal(probe.passed, true, "单次探针只证明连通性，不冒充质量验证");
assert.equal(probe.supportLevel, "unverified");

const internalAttempts = Array.from({ length: 8 }, (_, index) => makeAttempt(`internal-${index + 1}`));
const internal = evaluatePromptEvaluationGate({
  unit,
  stage: "internal-experiment",
  contractVerified: true,
  passedStages: ["contract", "provider-probe"],
  attempts: internalAttempts,
  currentVersions: versions,
});
assert.equal(internal.passed, true);
assert.equal(internal.metrics.validResults, 8);
assert.equal(internal.supportLevel, "experimental");

const formalAttempts = GOLDEN_GARMENT_SAMPLE_IDS.map((sampleId) => makeAttempt(sampleId));
const formal = evaluatePromptEvaluationGate({
  unit,
  stage: "formal-validation",
  contractVerified: true,
  passedStages: ["contract", "provider-probe", "internal-experiment"],
  attempts: formalAttempts,
  currentVersions: versions,
});
assert.equal(formal.passed, true);
assert.equal(formal.metrics.distinctSamples, 24);
assert.equal(formal.metrics.p10WeightedScore, 90);
assert.equal(formal.supportLevel, "verified");

const lowScores: PromptEvaluationScores = {
  garmentMaterialFidelity: 40,
  instructionFollowing: 40,
  artifactControl: 40,
  commercialUsability: 40,
};
const lowP10Result = evaluatePromptEvaluationGate({
  unit,
  stage: "formal-validation",
  contractVerified: true,
  passedStages: ["contract", "provider-probe", "internal-experiment"],
  attempts: formalAttempts.map((attempt, index) => index < 3 ? { ...attempt, scores: lowScores } : attempt),
  currentVersions: versions,
});
assert.equal(lowP10Result.passed, false);
assert.ok(lowP10Result.failures.some((failure) => failure.includes("P10")));

const unknownResult = evaluatePromptEvaluationGate({
  unit,
  stage: "internal-experiment",
  contractVerified: true,
  passedStages: ["contract", "provider-probe"],
  attempts: internalAttempts.map((attempt, index) => index === 0
    ? { ...attempt, outcome: "outcome_unknown" as const }
    : attempt),
  currentVersions: versions,
});
assert.equal(unknownResult.passed, false);
assert.ok(unknownResult.hardBlockers.some((blocker) => blocker.code === "outcome-unknown"));

const recommendationAttempts = Array.from({ length: 50 }, (_, index) => makeAttempt(`recommend-${index + 1}`));
assert.ok((bootstrapQualityGainLowerBound(recommendationAttempts) ?? 0) > 0);
const recommendation = evaluatePromptEvaluationGate({
  unit,
  stage: "recommendation",
  contractVerified: true,
  passedStages: ["contract", "provider-probe", "internal-experiment", "formal-validation"],
  attempts: recommendationAttempts,
  currentVersions: versions,
  baselineVersions: versions,
});
assert.equal(recommendation.passed, true);
assert.equal(recommendation.metrics.validResults, 50);
assert.equal(recommendation.supportLevel, "recommended");

const noGainRecommendation = evaluatePromptEvaluationGate({
  unit,
  stage: "recommendation",
  contractVerified: true,
  passedStages: ["contract", "provider-probe", "internal-experiment", "formal-validation"],
  attempts: recommendationAttempts.map((attempt) => ({ ...attempt, baselineScores: passingScores })),
  currentVersions: versions,
  baselineVersions: versions,
});
assert.equal(noGainRecommendation.passed, false);
assert.ok(noGainRecommendation.failures.some((failure) => failure.includes("bootstrap")));

const versionDrift = evaluatePromptEvaluationGate({
  unit,
  stage: "formal-validation",
  contractVerified: true,
  passedStages: ["contract", "provider-probe", "internal-experiment"],
  attempts: formalAttempts,
  currentVersions: changedVersions,
  baselineVersions: versions,
});
assert.equal(versionDrift.passed, false);
assert.equal(versionDrift.supportLevel, "unverified");

const manifest = JSON.parse(readFileSync(
  new URL("../docs/ai/evaluation/golden-set-v1.json", import.meta.url), "utf8",
)) as { version: string; samples: Array<{ id: string }> };
assert.equal(manifest.version, GOLDEN_GARMENT_SET_VERSION);
assert.deepEqual(manifest.samples.map((sample) => sample.id), [...GOLDEN_GARMENT_SAMPLE_IDS]);

console.log("提示词与模型五阶段离线评估框架测试通过");
