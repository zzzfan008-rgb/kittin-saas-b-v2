import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  EVALUATION_CONTRACT_CHECK_COMMANDS,
  RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS,
  createEvaluationGateReceipt,
  createEvaluationPromotionArtifact,
  currentEvaluationPromotionTarget,
  evaluateEvidenceBundlesForStage,
  evaluationArtifactSha256,
  validateEvaluationContractCheckArtifact,
  validateEvaluationGateReceipt,
  validateEvaluationPromotionArtifact,
  verifyEvaluationBundleImageArtifacts,
} from "../server/lib/evaluationPromotion";
import type { EvaluationCampaignClosure } from "../server/lib/evaluationCampaign";
import type {
  EvaluationBillingReviewEvent,
  EvaluationCaseEvidenceBundle,
  EvaluationManualAssessmentReviewEvent,
} from "../server/lib/evaluationReviewLedger";
import { GOLDEN_GARMENT_SAMPLE_IDS } from "../src/lib/promptEvaluation";
import { requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import type { PromptEvaluationScores, PromptEvaluationStage } from "../src/types/promptEvaluation";

const CODE_SHA = "0123456789abcdef0123456789abcdef01234567";
const SHA = "a".repeat(64);
const CONTRACT_CHECK_SHA = "c".repeat(64);
const LOCAL_ARTIFACT_SET_SHA = "d".repeat(64);
const AUTHORIZATION_UNIT_KEY = `sha256:${"b".repeat(64)}` as const;
const CREATED_AT = "2026-09-03T00:00:00.000Z";
const variant = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "generate",
});
const target = currentEvaluationPromotionTarget(variant.variantId, []);

function scores(value: number): PromptEvaluationScores {
  return {
    garmentMaterialFidelity: value,
    instructionFollowing: value,
    artifactControl: value,
    commercialUsability: value,
  };
}

function bundle(
  sampleId: string,
  options: {
    score?: number;
    baseline?: number;
    requestOutcome?: "succeeded" | "failed" | "outcome_unknown";
    billing?: "confirmed-billed" | "confirmed-not-billed" | "pending";
    includeAssessment?: boolean;
  } = {},
): EvaluationCaseEvidenceBundle {
  const safe = sampleId.replace(/[^A-Za-z0-9_.:-]/g, "-");
  const caseEvidenceId = `evidence-${safe}`;
  const requestId = `request-${safe}`;
  const billing = options.billing ?? "confirmed-billed";
  const requestOutcome = options.requestOutcome ?? "succeeded";
  const billingEvent: EvaluationBillingReviewEvent = {
    id: `billing-${safe}`,
    caseEvidenceId,
    providerRequestEvidenceId: requestId,
    status: billing === "pending" ? "confirmed-billed" : billing,
    actualCostMinor: 1,
    currency: "CNY",
    billingReference: `apiyi-log-${safe}`,
    reconciledBy: "admin-test",
    previousEventSha256: null,
    eventSha256: SHA,
    createdAt: CREATED_AT,
  };
  const manualEvent: EvaluationManualAssessmentReviewEvent = {
    id: `manual-${safe}`,
    caseEvidenceId,
    outputIndex: 0,
    scores: scores(options.score ?? 95),
    ...(options.baseline === undefined ? {} : { baselineScores: scores(options.baseline) }),
    taskPassed: true,
    validForScoring: true,
    hardBlockers: [],
    reviewerId: "admin-test",
    previousEventSha256: null,
    eventSha256: SHA,
    createdAt: CREATED_AT,
  };
  return {
    schemaVersion: 1,
    run: { id: `run-${safe}` },
    authorization: { authorization_id: `authorization-${safe}` },
    caseEvidence: {
      id: caseEvidenceId,
      run_id: `run-${safe}`,
      case_id: `case-${safe}`,
      sample_id: sampleId,
      evaluation_unit_key: AUTHORIZATION_UNIT_KEY,
      code_dirty: false,
      code_sha: CODE_SHA,
      finalized_at: Date.parse(CREATED_AT),
      evidence_record_sha256: SHA,
      request_snapshot_sha256: SHA,
      billing_reconciliation_status: billing,
      outcome: "succeeded",
      hard_blockers: [],
      snapshot: {
        codeIdentity: { codeSha: CODE_SHA },
        snapshot: { unit: target.unit, versions: target.versions },
      },
    },
    providerRequests: [{
      id: requestId,
      outcome: requestOutcome,
      billing_reconciliation_status: billing,
      actual_cost_minor: 1,
      budget_currency: "CNY",
      billing_reference: `apiyi-log-${safe}`,
    }],
    images: [{
      id: `provider-${safe}`,
      layer: "provider-original",
      output_index: 0,
      artifact_sha256: SHA,
      mime_type: "image/png",
      width: 1024,
      height: 1024,
      storage_ref: `evidence/provider-${safe}.png`,
      captured_at: Date.parse(CREATED_AT),
    }, {
      id: `processed-${safe}`,
      layer: "postprocessed",
      output_index: 0,
      source_evidence_id: `provider-${safe}`,
      artifact_sha256: SHA,
      mime_type: "image/webp",
      width: 1024,
      height: 1024,
      storage_ref: `evidence/processed-${safe}.webp`,
      captured_at: Date.parse(CREATED_AT),
      pipeline_version: target.versions.postprocessingVersion,
    }],
    billingEvents: billing === "pending" ? [] : [billingEvent],
    manualAssessmentEvents: options.includeAssessment === false ? [] : [manualEvent],
    exportedAt: CREATED_AT,
  };
}

function evaluate(
  stage: PromptEvaluationStage,
  bundles: readonly EvaluationCaseEvidenceBundle[],
  previousReceipts: readonly ReturnType<typeof createEvaluationGateReceipt>[],
) {
  return evaluateEvidenceBundlesForStage({
    variantId: variant.variantId,
    stage,
    bundles,
    previousReceipts,
    codeSha: CODE_SHA,
    contractVerified: true,
  });
}

function campaignClosureFor(
  stage: Exclude<PromptEvaluationStage, "contract" | "recommendation">,
  evaluated: ReturnType<typeof evaluate>,
): EvaluationCampaignClosure {
  const authorizationUnitKey = evaluated.authorizationUnitKey;
  assert.ok(authorizationUnitKey, "paid campaign closure needs an exact authorization unit");
  const slots = evaluated.caseAuditRefs.map((caseRef, index) => {
    const manualAssessmentTailSha256 = caseRef.manualAssessmentTailSha256;
    assert.ok(manualAssessmentTailSha256, "sealed closure needs a manual assessment tail");
    return {
      slotId: `slot-${stage}-${index + 1}`,
      caseId: caseRef.caseId,
      sampleId: caseRef.sampleId,
      authorizationId: `authorization-${stage}-${index + 1}`,
      runId: caseRef.runId,
      caseEvidenceId: caseRef.caseEvidenceId,
      evidenceRecordSha256: caseRef.evidenceRecordSha256,
      billingReconciliationStatus: "confirmed-billed" as const,
      billingTailSha256: caseRef.billingTailSha256,
      manualAssessmentTailSha256,
      imageArtifactSetSha256: SHA,
    };
  });
  const base: Omit<EvaluationCampaignClosure, "artifactSha256"> = {
    schemaVersion: 1,
    artifactType: "evaluation-campaign-closure",
    campaignId: `campaign-${stage}`,
    ownerId: "admin-test",
    stage,
    modelId: evaluated.unit.modelId,
    authorizationUnitKey,
    codeSha: CODE_SHA,
    manifestSha256: SHA,
    campaignRequestCap: slots.length,
    campaignBudgetLimitMinor: slots.length,
    budgetCurrency: "CNY",
    campaignReservedProviderRequests: slots.length,
    campaignReservedBudgetMinor: slots.length,
    slots,
    imageArtifactSetSha256: SHA,
    closedBy: "admin-test",
    closedAt: CREATED_AT,
  };
  return { ...base, artifactSha256: evaluationArtifactSha256(base) };
}

function receipt(
  stage: PromptEvaluationStage,
  evaluated: ReturnType<typeof evaluate>,
  previousReceipts: readonly ReturnType<typeof createEvaluationGateReceipt>[],
) {
  const campaignClosure = stage === "contract" || stage === "recommendation"
    ? null
    : campaignClosureFor(stage, evaluated);
  return createEvaluationGateReceipt({
    evaluated,
    stage,
    previousReceipts,
    codeSha: CODE_SHA,
    approvedBy: "admin-test",
    auditReason: `offline ${stage} gate test`,
    createdAt: CREATED_AT,
    ...(stage === "contract" ? { contractCheckSha256: CONTRACT_CHECK_SHA } : {}),
    ...(campaignClosure ? {
      campaignId: campaignClosure.campaignId,
      campaignClosureSha256: campaignClosure.artifactSha256,
    } : {}),
  });
}

const contract = evaluate("contract", [], []);
assert.equal(contract.gateResult.passed, true);
const contractReceipt = receipt("contract", contract, []);
assert.equal(contractReceipt.contractCheckSha256, CONTRACT_CHECK_SHA);
assert.throws(
  () => createEvaluationGateReceipt({
    evaluated: contract,
    stage: "contract",
    previousReceipts: [],
    codeSha: CODE_SHA,
    approvedBy: "admin-test",
    auditReason: "missing contract artifact binding",
    createdAt: CREATED_AT,
  }),
  /requires the exact contract-check artifact SHA-256/,
);

const providerProbe = evaluate("provider-probe", [bundle("probe-01")], [contractReceipt]);
assert.equal(providerProbe.gateResult.passed, true);
const providerReceipt = receipt("provider-probe", providerProbe, [contractReceipt]);
assert.equal(providerReceipt.contractCheckSha256, null);

for (const identityField of ["caseEvidenceId", "runId", "caseId"] as const) {
  const collision = bundle(`internal-${identityField}-collision`);
  const previousCase = providerReceipt.cases[0]!;
  const persistedField = identityField === "caseEvidenceId"
    ? "id"
    : identityField === "runId" ? "run_id" : "case_id";
  const collisionBundles = [
    { ...collision, caseEvidence: { ...collision.caseEvidence, [persistedField]: previousCase[identityField] } },
    ...Array.from({ length: 7 }, (_value, index) => bundle(`${identityField}-fresh-${index + 1}`)),
  ];
  assert.throws(
    () => evaluate("internal-experiment", collisionBundles, [contractReceipt, providerReceipt]),
    new RegExp(`reuses previous-stage ${identityField}`),
    `${identityField} 不得跨阶段复用`,
  );
}

const internalBundles = Array.from({ length: 8 }, (_value, index) => bundle(`internal-${index + 1}`));
const internal = evaluate("internal-experiment", internalBundles, [contractReceipt, providerReceipt]);
assert.equal(internal.gateResult.passed, true);
const internalReceipt = receipt("internal-experiment", internal, [contractReceipt, providerReceipt]);
assert.equal(
  validateEvaluationGateReceipt(internalReceipt).campaignClosureSha256,
  internalReceipt.campaignClosureSha256,
  "paid receipts retain their sealed campaign closure binding",
);

assert.throws(
  () => receipt("internal-experiment", {
    ...internal,
    authorizationUnitKey: `sha256:${"9".repeat(64)}`,
  }, [contractReceipt, providerReceipt]),
  /authorizationUnitKey differs from the previous paid stage/,
  "all paid stages in one chain must use the same exact authorization unit",
);

const { artifactSha256: _zeroEvidenceReceiptSha, ...zeroEvidenceReceiptBase } = internalReceipt;
const forgedZeroEvidenceReceiptBase = {
  ...zeroEvidenceReceiptBase,
  cases: [],
  gateResult: {
    ...zeroEvidenceReceiptBase.gateResult,
    metrics: {
      distinctSamples: 0,
      succeededSamples: 0,
      validResults: 0,
      requestCompletionRate: 0,
      taskPassRate: 0,
      averageWeightedScore: 0,
      p10WeightedScore: 0,
      criterionAverages: scores(0),
    },
  },
};
const forgedZeroEvidenceReceipt = {
  ...forgedZeroEvidenceReceiptBase,
  artifactSha256: evaluationArtifactSha256(forgedZeroEvidenceReceiptBase),
};
assert.throws(
  () => validateEvaluationGateReceipt(forgedZeroEvidenceReceipt),
  /must contain exactly 8 case\/sample reference/,
  "重算自哈希也不能把零证据 internal receipt 伪装成通过",
);

for (const identityField of ["caseEvidenceId", "runId", "caseId"] as const) {
  const duplicateIdentityCases = internalReceipt.cases.map((caseRef, index) => (
    index === 1 ? { ...caseRef, [identityField]: internalReceipt.cases[0]![identityField] } : caseRef
  ));
  const { artifactSha256: _duplicateIdentitySha, ...duplicateIdentityBase } = internalReceipt;
  const forgedDuplicateIdentityBase = { ...duplicateIdentityBase, cases: duplicateIdentityCases };
  assert.throws(
    () => validateEvaluationGateReceipt({
      ...forgedDuplicateIdentityBase,
      artifactSha256: evaluationArtifactSha256(forgedDuplicateIdentityBase),
    }),
    new RegExp(`duplicate ${identityField}`),
    `单份收据内的 ${identityField} 必须独立唯一`,
  );
}

const internalOverCap = evaluate(
  "internal-experiment",
  [...internalBundles, bundle("internal-9")],
  [contractReceipt, providerReceipt],
);
assert.equal(internalOverCap.gateResult.passed, false);
assert.match(internalOverCap.gateResult.failures.join("\n"), /exactly 8 distinct sample/);

const forgedInternalCases = [
  { ...internal.caseAuditRefs[0]!, runId: providerReceipt.cases[0]!.runId },
  ...internal.caseAuditRefs.slice(1),
];
const forgedInternal = { ...internal, caseAuditRefs: forgedInternalCases };
assert.throws(
  () => receipt("internal-experiment", forgedInternal, [contractReceipt, providerReceipt]),
  /evaluated gate\.caseAuditRefs\[0\]\.runId reuses previous-stage runId/,
  "收据创建必须重新检查跨阶段证据复用，不能信任调用方传入的 passing gate",
);

const { artifactSha256: _internalReceiptSha256, ...internalReceiptBase } = internalReceipt;
const forgedInternalReceiptBase = { ...internalReceiptBase, cases: forgedInternalCases };
const forgedInternalReceipt = {
  ...forgedInternalReceiptBase,
  artifactSha256: evaluationArtifactSha256(forgedInternalReceiptBase),
};
assert.throws(
  () => createEvaluationPromotionArtifact({
    gateReceipt: forgedInternalReceipt,
    reEvaluated: forgedInternal,
    previousReceipts: [contractReceipt, providerReceipt],
    approvedBy: "admin-test",
    approvalReason: "forged cross-stage evidence must not promote",
    approvedAt: CREATED_AT,
    localArtifactSetSha256: LOCAL_ARTIFACT_SET_SHA,
  }),
  /promotion re-evaluation\.caseAuditRefs\[0\]\.runId reuses previous-stage runId/,
  "发布时必须重新检查跨阶段证据复用，不能只比较重算结果与收据",
);

const formalBundles = GOLDEN_GARMENT_SAMPLE_IDS.map((sampleId) => bundle(sampleId));
const formalReceipts = [contractReceipt, providerReceipt, internalReceipt] as const;
const formal = evaluate("formal-validation", formalBundles, formalReceipts);
assert.equal(formal.gateResult.passed, true);
const formalReceipt = receipt("formal-validation", formal, formalReceipts);

const recommendationBundles = Array.from({ length: 50 }, (_value, index) => bundle(
  `recommend-${String(index + 1).padStart(2, "0")}`,
  { score: 95, baseline: 70 },
));
const recommendationReceipts = [contractReceipt, providerReceipt, internalReceipt, formalReceipt] as const;
const recommendation = evaluate("recommendation", recommendationBundles, recommendationReceipts);
assert.equal(RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS, "blocked-pending-reviewed-definition");
assert.equal(recommendation.gateResult.passed, false);
assert.ok(recommendation.gateResult.hardBlockers.some(({ code, detail }) => (
  code === "evidence-integrity-failure"
  && /traceable candidate\/baseline case pairs/.test(detail)
)));
assert.throws(
  () => receipt("recommendation", recommendation, recommendationReceipts),
  /blocked until a reviewed same-model baseline definition/,
  "手填 baselineScores 即使分数达标也不得生成 recommendation receipt",
);

const recommendationOverCap = evaluate(
  "recommendation",
  [...recommendationBundles, bundle("recommend-51", { score: 95, baseline: 70 })],
  recommendationReceipts,
);
assert.equal(recommendationOverCap.gateResult.passed, false);
assert.match(recommendationOverCap.gateResult.failures.join("\n"), /exactly 50 distinct sample/);

const promotion = createEvaluationPromotionArtifact({
  gateReceipt: formalReceipt,
  reEvaluated: formal,
  previousReceipts: formalReceipts,
  approvedBy: "admin-test",
  approvalReason: "all DB-backed formal-validation thresholds passed",
  approvedAt: CREATED_AT,
  localArtifactSetSha256: LOCAL_ARTIFACT_SET_SHA,
});
assert.equal(
  validateEvaluationPromotionArtifact(promotion.artifact).artifactSha256,
  promotion.artifact.artifactSha256,
  "promotion preserves the paid receipt's Campaign/Closure binding",
);
assert.equal(promotion.artifact.localArtifactSetSha256, LOCAL_ARTIFACT_SET_SHA);
assert.equal(promotion.artifact.approvedBy, "admin-test");
assert.equal(promotion.artifact.approvalReason, "all DB-backed formal-validation thresholds passed");
assert.equal(promotion.artifact.approvedAt, CREATED_AT);
assert.equal(promotion.release.gateReceiptSha256, formalReceipt.artifactSha256);
assert.equal(promotion.release.evidenceArtifactSha256, promotion.artifact.artifactSha256);
assert.equal(promotion.release.codeSha, CODE_SHA);
assert.equal("approvedBy" in promotion.release, false, "runtime registry must not expose the approver");
assert.equal("approvalReason" in promotion.release, false, "runtime registry must not expose the approval reason");
assert.equal("approvedAt" in promotion.release, false, "runtime registry must not expose the approval timestamp");

const unknown = evaluate(
  "provider-probe",
  [bundle("probe-unknown", { requestOutcome: "outcome_unknown", includeAssessment: false })],
  [contractReceipt],
);
assert.equal(unknown.attempts[0].outcome, "outcome_unknown", "request-level unknown must override case-level succeeded");
assert.equal(unknown.gateResult.passed, false);
assert.ok(unknown.gateResult.hardBlockers.some((blocker) => blocker.code === "outcome-unknown"));

const pendingBilling = evaluate(
  "provider-probe",
  [bundle("probe-pending", { billing: "pending", includeAssessment: false })],
  [contractReceipt],
);
assert.equal(pendingBilling.gateResult.passed, false);
assert.ok(pendingBilling.gateResult.hardBlockers.some((blocker) => /billing/i.test(blocker.detail)));

assert.throws(
  () => evaluate("formal-validation", formalBundles, [contractReceipt, providerReceipt]),
  /requires exactly 3 previous receipt/,
);
assert.throws(
  () => evaluate("formal-validation", formalBundles, [providerReceipt, contractReceipt, internalReceipt]),
  /must be contract/,
);
const tampered = { ...formalReceipt, previousReceiptSha256s: [] };
assert.throws(() => validateEvaluationGateReceipt(tampered), /SHA-256 does not match|hash chain/);
assert.throws(
  () => validateEvaluationGateReceipt({ ...formalReceipt, stage: "recommendation" }),
  /blocked until a reviewed same-model baseline definition/,
  "重算或伪造的 recommendation receipt 也必须被验证器拒绝",
);
assert.throws(
  () => validateEvaluationPromotionArtifact({
    ...promotion.artifact,
    evaluationStage: "recommendation",
    supportStatus: "recommended",
  }),
  /blocked until a reviewed same-model baseline definition/,
  "重算或伪造的 recommended promotion 也必须被验证器拒绝",
);

const contractArtifactBase = {
  schemaVersion: 1 as const,
  artifactType: "prompt-evaluation-contract-check" as const,
  variantId: variant.variantId,
  codeSha: CODE_SHA,
  commands: EVALUATION_CONTRACT_CHECK_COMMANDS.map((file) => ({ file, stdoutSha256: SHA })),
  knowledgeBase: {
    snapshotId: "offline-test-snapshot",
    snapshotSha256: SHA,
    pageCount: 1,
    pointerFileSha256: SHA,
  },
  gatewayModelCatalog: {
    modelListFileSha256: SHA,
    canonicalModelIdSetSha256: SHA,
    reviewedBaselineSha256: SHA,
    reviewedRawExportSha256: SHA,
    expectedGatewayModelIds: [
      "gpt-image-2.5-sunburst",
      "gpt-image-2.5-all",
      "gpt-image-2.5-sunburst-vip",
      "gpt-image-2.5-flare-vip",
      "gemini-3-pro-image-preview",
      "gemini-3.1-flash-lite-image",
      "gemini-3.1-flash-image",
      "flux-2-pro",
      "seedream-5-0-260128",
    ],
  },
  approvedBy: "admin-test",
  auditReason: "all required local contract checks passed",
  createdAt: CREATED_AT,
};
const contractArtifact = {
  ...contractArtifactBase,
  artifactSha256: evaluationArtifactSha256(contractArtifactBase),
};
assert.equal(
  validateEvaluationContractCheckArtifact(contractArtifact).artifactSha256,
  contractArtifact.artifactSha256,
);
const incompleteContractBase = {
  ...contractArtifactBase,
  commands: contractArtifactBase.commands.slice(1),
};
assert.throws(
  () => validateEvaluationContractCheckArtifact({
    ...incompleteContractBase,
    artifactSha256: evaluationArtifactSha256(incompleteContractBase),
  }),
  /exact required checks|missing a required local check/,
);
const rawCatalogMismatchBase = {
  ...contractArtifactBase,
  gatewayModelCatalog: {
    ...contractArtifactBase.gatewayModelCatalog,
    reviewedRawExportSha256: "b".repeat(64),
  },
};
assert.throws(
  () => validateEvaluationContractCheckArtifact({
    ...rawCatalogMismatchBase,
    artifactSha256: evaluationArtifactSha256(rawCatalogMismatchBase),
  }),
  /raw model list differs from its reviewed raw export SHA-256/,
);
const missingRawCatalogShaBase = {
  ...contractArtifactBase,
  gatewayModelCatalog: Object.fromEntries(
    Object.entries(contractArtifactBase.gatewayModelCatalog)
      .filter(([key]) => key !== "reviewedRawExportSha256"),
  ),
};
assert.throws(
  () => validateEvaluationContractCheckArtifact({
    ...missingRawCatalogShaBase,
    artifactSha256: evaluationArtifactSha256(missingRawCatalogShaBase),
  }),
  /gatewayModelCatalog\.reviewedRawExportSha256 is required/,
);

const artifactDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "garment-promotion-images-"));
const previousDataDir = process.env.DATA_DIR;
try {
  process.env.DATA_DIR = artifactDataDir;
  const uploadsDir = path.join(artifactDataDir, "uploads");
  fs.mkdirSync(uploadsDir);
  const imageBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  const imageName = "promotion-proof.png";
  fs.writeFileSync(path.join(uploadsDir, imageName), imageBytes);
  const imageSha256 = createHash("sha256").update(imageBytes).digest("hex");
  const imageBundle = {
    ...bundle("local-artifact-proof"),
    caseEvidence: {
      ...bundle("local-artifact-proof").caseEvidence,
      id: "local-artifact-case",
    },
    images: [{
      id: "local-artifact-case:provider:0",
      layer: "provider-original",
      output_index: 0,
      artifact_sha256: imageSha256,
      mime_type: "image/png",
      width: 1,
      height: 1,
      byte_length: imageBytes.byteLength,
      storage_ref: `/api/files/${imageName}`,
      captured_at: Date.parse(CREATED_AT),
    }],
  } as unknown as EvaluationCaseEvidenceBundle;
  const verified = await verifyEvaluationBundleImageArtifacts([imageBundle]);
  assert.equal(verified.images[0].artifactSha256, imageSha256);
  assert.equal(verified.images[0].mimeType, "image/png");
  assert.equal(verified.images[0].width, 1);
  assert.equal(verified.images[0].height, 1);
  assert.equal(verified.artifactSetSha256, evaluationArtifactSha256(verified.images));
  const mismatchedBundle = {
    ...imageBundle,
    images: [{ ...imageBundle.images[0], artifact_sha256: SHA }],
  } as unknown as EvaluationCaseEvidenceBundle;
  await assert.rejects(
    verifyEvaluationBundleImageArtifacts([mismatchedBundle]),
    /differs from its persisted hash, MIME or dimensions/,
  );
} finally {
  if (previousDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = previousDataDir;
  fs.rmSync(artifactDataDir, { recursive: true, force: true });
}

console.log("评估证据、阶段收据、门槛与发布注册链测试通过");
