import assert from "node:assert/strict";
import {
  buildEvaluationCaseEvidenceRecord,
  buildEvaluationCaseSnapshot,
  evaluationImageEvidenceId,
  validateManualScores,
  type EvaluationCaseSnapshotInput,
  type EvaluationPostprocessedEvidence,
  type EvaluationProviderOriginalEvidence,
} from "../server/lib/evaluationEvidence";
import { promptEvaluationUnitKey } from "../src/lib/promptEvaluation";
import { imageModelContractHash } from "../src/types/imageModels";
import {
  PROVIDER_PROMPT_RENDERER_HASH,
  PROVIDER_PROMPT_RENDERER_VERSION,
} from "../src/lib/providerPromptRenderer";
import type {
  PromptEvaluationScores,
  PromptEvaluationUnit,
  PromptEvaluationVersionVector,
} from "../src/types/promptEvaluation";

const CASE_ID = "eval-case-001";
const CAPTURED_AT = "2026-09-02T01:00:00.000Z";
const RECORDED_AT = "2026-09-02T01:00:03.000Z";

const unit: PromptEvaluationUnit = {
  taskFamilyId: "fashion-lookbook",
  promptVariantId: "fashion-lookbook.gemini-3.1-flash-image.ai-modify.edit.v1",
  presetId: "fashion-lookbook-gemini",
  presetVersion: "1.0.0",
  nodeKind: "ai-modify",
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
  inputNormalizationVersion: "reference-order-input-v1",
  postprocessingVersion: "fit-contain-dominant-webp-v1",
  goldenSetVersion: "garment-gold-v1",
  scoringRubricVersion: "garment-rubric-v1",
};

function snapshotInput(
  overrides: Partial<EvaluationCaseSnapshotInput> = {},
): EvaluationCaseSnapshotInput {
  return {
    caseId: CASE_ID,
    authorizationId: "evaluation-authorization-001",
    codeSha: "1".repeat(40),
    nodeId: "node-ai-modify-001",
    capturedAt: CAPTURED_AT,
    unit,
    contractHash: imageModelContractHash(unit.modelId),
    promptVersion: unit.presetVersion,
    evaluationVersion: "evaluation-protocol-v1",
    postprocessVersion: versions.postprocessingVersion,
    versions,
    resolvedPrompt: "Use image 1 for identity, image 2 for pose, and image 3 for the complete garment.",
    nativeParameters: {
      imageSize: "2K",
      aspectRatio: "3:4",
      nested: { preserveNonTarget: true, outputCount: 1 },
    },
    references: [
      {
        order: 0,
        assetSha256: "a".repeat(64),
        sourceNodeId: "identity-node",
      },
      {
        order: 1,
        assetSha256: "b".repeat(64),
        sourceNodeId: "pose-node",
      },
      {
        order: 2,
        assetSha256: "c".repeat(64),
        sourceNodeId: "garment-node",
      },
    ],
    requestedImageCount: 1,
    ...overrides,
  };
}

function providerOriginal(): EvaluationProviderOriginalEvidence {
  return {
    evidenceId: evaluationImageEvidenceId(CASE_ID, "provider-original", 0),
    imageIndex: 0,
    layer: "provider-original",
    artifactSha256: "d".repeat(64),
    mimeType: "image/png",
    width: 2048,
    height: 2048,
    bytes: 8_192,
    storageRef: "/api/files/eval-case-001-provider-0.png",
    capturedAt: "2026-09-02T01:00:01.000Z",
  };
}

function postprocessed(
  provider = providerOriginal(),
): EvaluationPostprocessedEvidence {
  return {
    evidenceId: evaluationImageEvidenceId(CASE_ID, "postprocessed", 0),
    imageIndex: 0,
    layer: "postprocessed",
    sourceEvidenceId: provider.evidenceId,
    pipelineVersion: versions.postprocessingVersion,
    artifactSha256: "e".repeat(64),
    mimeType: "image/webp",
    width: 1536,
    height: 2048,
    bytes: 4_096,
    storageRef: "/api/files/eval-case-001-postprocessed-0.webp",
    capturedAt: "2026-09-02T01:00:02.000Z",
  };
}

const snapshot = buildEvaluationCaseSnapshot(snapshotInput());
assert.equal(snapshot.schemaVersion, 1);
assert.equal(snapshot.unitKey, promptEvaluationUnitKey(unit));
assert.equal(snapshot.contractHash, versions.providerContractVersion);
assert.equal(snapshot.promptVersion, versions.presetVersion);
assert.equal(snapshot.postprocessVersion, versions.postprocessingVersion);
assert.equal(snapshot.references.length, 3);
assert.deepEqual(snapshot.references.map(({ order, assetSha256 }) => ({ order, assetSha256 })), [
  { order: 0, assetSha256: "a".repeat(64) },
  { order: 1, assetSha256: "b".repeat(64) },
  { order: 2, assetSha256: "c".repeat(64) },
]);
assert.equal(snapshot.resolvedPromptSha256.length, 64);
assert.equal(snapshot.requestSnapshotSha256.length, 64);
assert.equal(Object.isFrozen(snapshot), true);
assert.equal(Object.isFrozen(snapshot.references), true);
assert.equal(Object.isFrozen(snapshot.nativeParameters), true);

for (const invalidLength of [41, 63]) {
  assert.throws(
    () => buildEvaluationCaseSnapshot(snapshotInput({ codeSha: "a".repeat(invalidLength) })),
    /codeSha has an invalid format/,
    `${invalidLength} 位 SHA 不得进入评估证据`,
  );
}
assert.equal(
  buildEvaluationCaseSnapshot(snapshotInput({ codeSha: "b".repeat(64) })).codeSha,
  "b".repeat(64),
);

assert.throws(
  () => buildEvaluationCaseSnapshot(snapshotInput({
    references: snapshotInput().references.map((reference, index) => (
      index === 1 ? { ...reference, order: 2 } : reference
    )),
  })),
  /reference order must be contiguous/,
);
assert.throws(
  () => buildEvaluationCaseSnapshot(snapshotInput({
    references: snapshotInput().references.map((reference, index) => (
      index === 2 ? { ...reference, assetSha256: "not-a-sha" } : reference
    )),
  })),
  /assetSha256 has an invalid format/,
);
assert.throws(
  () => buildEvaluationCaseSnapshot(snapshotInput({
    contractHash: `sha256:${"f".repeat(64)}`,
  })),
  /contractHash does not match/,
);
assert.throws(
  () => buildEvaluationCaseSnapshot(snapshotInput({ promptVersion: "1.0.1" })),
  /promptVersion must match/,
);
assert.throws(
  () => buildEvaluationCaseSnapshot(snapshotInput({ postprocessVersion: "postprocess-v2" })),
  /version fields do not match/,
);

const scores: PromptEvaluationScores = {
  garmentMaterialFidelity: 90,
  instructionFollowing: 80,
  artifactControl: 60,
  commercialUsability: 50,
};
assert.deepEqual(validateManualScores(scores), scores);
assert.throws(
  () => validateManualScores({ ...scores, extraCriterion: 100 }),
  /exactly the five rubric criteria/,
);
assert.throws(
  () => validateManualScores({ ...scores, commercialUsability: 101 }),
  /0 to 100/,
);

const provider = providerOriginal();
const business = postprocessed(provider);
const successRecord = buildEvaluationCaseEvidenceRecord({
  snapshot,
  providerOriginals: [provider],
  postprocessed: [business],
  request: {
    requestCount: 1,
    latencyMs: [1_250],
    outcome: "succeeded",
  },
  billing: {
    status: "confirmed-billed",
    checkedAt: RECORDED_AT,
    billingReference: "apiyi-bill-row-001",
  },
  manualAssessment: {
    assessorId: "reviewer-001",
    assessedAt: RECORDED_AT,
    scores,
    taskPassed: false,
    validForScoring: true,
    notes: "The reference images were traceable, but identity changed.",
    hardBlockers: [{
      code: "garment-identity-corruption",
      detail: "The model changed the evaluated identity reference.",
      attemptId: CASE_ID,
      evidenceIds: [provider.evidenceId, business.evidenceId],
    }],
  },
  recordedAt: RECORDED_AT,
});
assert.equal(successRecord.providerOriginals[0].layer, "provider-original");
assert.equal(successRecord.postprocessed[0].layer, "postprocessed");
assert.equal(successRecord.postprocessed[0].sourceEvidenceId, provider.evidenceId);
assert.equal(successRecord.postprocessed[0].pipelineVersion, snapshot.postprocessVersion);
assert.equal(successRecord.request.totalLatencyMs, 1_250);
assert.deepEqual(successRecord.request.requestIndexes, [1]);
assert.equal(successRecord.manualAssessment?.taskPassed, false);
assert.equal(successRecord.manualAssessment?.validForScoring, true);
assert.deepEqual(successRecord.manualAssessment?.hardBlockers, [{
  code: "garment-identity-corruption",
  detail: "The model changed the evaluated identity reference.",
  attemptId: CASE_ID,
  evidenceIds: [provider.evidenceId, business.evidenceId],
}]);
assert.equal(successRecord.evidenceRecordSha256.length, 64);
assert.equal(Object.isFrozen(successRecord), true);
assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [provider],
    postprocessed: [business],
    request: { requestCount: 1, latencyMs: [1_250], outcome: "succeeded" },
    billing: {
      status: "confirmed-billed",
      checkedAt: RECORDED_AT,
      billingReference: "apiyi-bill-row-detached-baseline",
    },
    manualAssessment: {
      assessorId: "reviewer-001",
      assessedAt: RECORDED_AT,
      scores,
      baselineScores: scores,
      taskPassed: true,
      validForScoring: true,
    },
    recordedAt: RECORDED_AT,
  }),
  /detached baselineScores are legacy-only/,
  "新证据记录不得接受没有独立 case 的手填基线评分",
);

const unknownRecord = buildEvaluationCaseEvidenceRecord({
  snapshot,
  providerOriginals: [],
  postprocessed: [],
  request: {
    requestCount: 1,
    latencyMs: [30_000],
    outcome: "outcome_unknown",
    errors: [{
      phase: "provider",
      code: "PROVIDER_TIMEOUT",
      message: "The Provider outcome could not be determined.",
      occurredAt: RECORDED_AT,
      providerRequestIndex: 1,
    }],
  },
  billing: { status: "pending", note: "Reconcile the API易 log before any new case." },
  recordedAt: RECORDED_AT,
});
assert.equal(unknownRecord.request.outcome, "outcome_unknown");
assert.equal(unknownRecord.billing.status, "pending");
assert.equal(unknownRecord.providerOriginals.length, 0);

const multiRequestRecord = buildEvaluationCaseEvidenceRecord({
  snapshot,
  providerOriginals: [provider],
  postprocessed: [business],
  request: {
    requestCount: 2,
    requestIndexes: [1, 2],
    latencyMs: [800, 900],
    outcome: "succeeded",
  },
  billing: { status: "pending" },
  recordedAt: RECORDED_AT,
});
assert.deepEqual(multiRequestRecord.request.requestIndexes, [1, 2]);
assert.equal(multiRequestRecord.request.totalLatencyMs, 1_700);

const zeroRequestFailure = buildEvaluationCaseEvidenceRecord({
  snapshot,
  providerOriginals: [],
  postprocessed: [],
  request: { requestCount: 0, requestIndexes: [], latencyMs: [], outcome: "deterministic-failure" },
  billing: { status: "not-required" },
  recordedAt: RECORDED_AT,
});
assert.deepEqual(zeroRequestFailure.request.requestIndexes, []);

const completionPersistFailure = buildEvaluationCaseEvidenceRecord({
  snapshot,
  providerOriginals: [provider],
  postprocessed: [],
  request: {
    requestCount: 1,
    requestIndexes: [1],
    latencyMs: [250],
    outcome: "deterministic-failure",
    errors: [{
      phase: "completion-persist",
      code: "COMPLETION_ROLLBACK",
      message: "Provider evidence exists but business completion rolled back.",
      occurredAt: RECORDED_AT,
      providerRequestIndex: 1,
    }],
  },
  billing: { status: "pending" },
  recordedAt: RECORDED_AT,
});
assert.equal(completionPersistFailure.request.errors[0]?.phase, "completion-persist");

const eightRequestFailure = buildEvaluationCaseEvidenceRecord({
  snapshot,
  providerOriginals: [],
  postprocessed: [],
  request: {
    requestCount: 8,
    requestIndexes: [1, 2, 3, 4, 5, 6, 7, 8],
    latencyMs: [1, 2, 3, 4, 5, 6, 7, 8],
    outcome: "deterministic-failure",
  },
  billing: { status: "confirmed-not-billed", checkedAt: RECORDED_AT },
  recordedAt: RECORDED_AT,
});
assert.equal(eightRequestFailure.request.requestCount, 8);

assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [],
    postprocessed: [],
    request: {
      requestCount: 9,
      requestIndexes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      latencyMs: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      outcome: "deterministic-failure",
    },
    billing: { status: "not-required" },
    recordedAt: RECORDED_AT,
  }),
  /zero to 8 Provider requests/,
);
assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [],
    postprocessed: [],
    request: {
      requestCount: 2,
      requestIndexes: [1, 3],
      latencyMs: [1, 1],
      outcome: "deterministic-failure",
    },
    billing: { status: "not-required" },
    recordedAt: RECORDED_AT,
  }),
  /unique, contiguous and 1-based/,
);
assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [],
    postprocessed: [],
    request: {
      requestCount: 1,
      requestIndexes: [1],
      latencyMs: [1],
      outcome: "deterministic-failure",
      errors: [{
        phase: "provider",
        code: "INVALID_INDEX",
        message: "Index zero is not a recorded Provider request.",
        occurredAt: RECORDED_AT,
        providerRequestIndex: 0,
      }],
    },
    billing: { status: "pending" },
    recordedAt: RECORDED_AT,
  }),
  /must identify a recorded 1-based request/,
);

assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [],
    postprocessed: [],
    request: { requestCount: 1, latencyMs: [1], outcome: "outcome_unknown" },
    billing: { status: "confirmed-not-billed", checkedAt: RECORDED_AT },
    recordedAt: RECORDED_AT,
  }),
  /outcome_unknown must remain pending/,
);
assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [],
    postprocessed: [],
    request: { requestCount: 1, latencyMs: [1], outcome: "succeeded" },
    billing: { status: "confirmed-billed", checkedAt: RECORDED_AT },
    recordedAt: RECORDED_AT,
  }),
  /succeeded case must have at least one request and provider-original evidence/,
);
assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [provider],
    postprocessed: [business],
    request: { requestCount: 0, requestIndexes: [], latencyMs: [], outcome: "succeeded" },
    billing: { status: "not-required" },
    recordedAt: RECORDED_AT,
  }),
  /succeeded case must have at least one request/,
);
assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [provider],
    postprocessed: [],
    request: { requestCount: 1, latencyMs: [1], outcome: "succeeded" },
    billing: { status: "confirmed-billed", checkedAt: RECORDED_AT },
    recordedAt: RECORDED_AT,
  }),
  /must preserve both evidence layers/,
);
assert.throws(
  () => buildEvaluationCaseEvidenceRecord({
    snapshot,
    providerOriginals: [provider],
    postprocessed: [{ ...business, sourceEvidenceId: "another-case:provider:0" }],
    request: { requestCount: 1, latencyMs: [1], outcome: "succeeded" },
    billing: { status: "confirmed-billed", checkedAt: RECORDED_AT },
    recordedAt: RECORDED_AT,
  }),
  /source does not belong to this case/,
);

console.log("评估快照、双层图像证据、账单与人工评分测试通过");
