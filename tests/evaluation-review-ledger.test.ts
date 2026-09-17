import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AuthUser } from "../server/lib/auth";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-evaluation-review-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "evaluation-review-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const database = await import("../server/lib/database");
const reviewLedger = await import("../server/lib/evaluationReviewLedger");
const campaignLedger = await import("../server/lib/evaluationCampaign");
await database.initializeDatabase();

const adminRow = await database.queryOne<{
  id: string;
  account_id: string;
  display_name: string;
  must_change_password: number;
}>("SELECT id, account_id, display_name, must_change_password FROM users WHERE account_id = $1", [
  "evaluation-review-admin",
]);
assert.ok(adminRow);
const admin: AuthUser = {
  id: adminRow.id,
  accountId: adminRow.account_id,
  displayName: adminRow.display_name,
  role: "admin",
  mustChangePassword: adminRow.must_change_password === 1,
};
const nonAdmin: AuthUser = {
  id: "evaluation-review-user",
  accountId: "evaluation-review-user",
  displayName: "普通用户",
  role: "user",
  mustChangePassword: false,
};
const runId = "evaluation-review-run";
const caseId = "evaluation-review-case";
const sampleId = "sample-review-001";
const caseEvidenceId = "evaluation-case:evaluation-review-run";
const authorizationId = "evaluation-review-authorization";
const campaignId = "evaluation-review-campaign";
const slotId = "evaluation-review-slot";
const requestEvidenceId = `${caseEvidenceId}:request:1`;
const startedAt = Date.now() - 10_000;
const finishedAt = startedAt + 5_000;
const createdAt = new Date(startedAt).toISOString();
const finishedAtIso = new Date(finishedAt).toISOString();
const hash = (character: string) => character.repeat(64);

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

function eventSha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

await database.transaction((client) => campaignLedger.createSealedEvaluationCampaign(client, admin, {
  campaignId,
  ownerId: admin.id,
  stage: "internal-experiment",
  modelId: "gpt-image-2-vip",
  authorizationUnitKey: `sha256:${hash("a")}`,
  codeSha: "b".repeat(40),
  maxProviderRequests: 1,
  budgetLimitMinor: 50,
  budgetCurrency: "CNY",
  slots: [{
    slotId,
    caseId,
    sampleId,
    resolvedPromptSha256: hash("c"),
    nativeParametersSha256: eventSha256({}),
    referenceInputsSha256: eventSha256([]),
    requestedImageCount: 2,
    maxProviderRequests: 1,
    priceMinorPerProviderRequest: 50,
    budgetLimitMinor: 50,
  }],
}, startedAt));

await database.query(`
  INSERT INTO users (
    id, account_id, display_name, role, password_hash, must_change_password,
    active, created_at, updated_at
  ) VALUES ($1, $1, '普通用户', 'user', 'test-only', 0, 1, $2, $2)
`, [nonAdmin.id, createdAt]);
await database.query(`
  INSERT INTO generation_runs (
    id, owner_id, node_id, node_label, kind, prompt, requested_count,
    successful_count, provider_requests, status, started_at, updated_at,
    run_type, retry_policy, evaluation_case_id, evaluation_authorization_id,
    evaluation_campaign_id, evaluation_slot_id, billing_reconciliation_status
  ) VALUES (
    $1, $2, 'review-node', '复核节点', 'sketch-to-render', '评估复核', 2,
    2, 1, 'succeeded', $3, $4, 'evaluation', 'no-retry', $5, $6, $7, $8, 'pending'
  )
`, [runId, admin.id, startedAt, finishedAt, caseId, authorizationId, campaignId, slotId]);
await database.query(`
  INSERT INTO evaluation_run_authorizations (
    authorization_id, owner_id, created_by_admin_id, campaign_id, slot_id, scope_type, model_id,
    prompt_variant_id, evaluation_unit_key, max_provider_requests,
    price_minor_per_provider_request, budget_limit_minor, budget_currency,
    reason, expires_at, status, bound_case_id, bound_run_id,
    reserved_provider_requests, used_provider_requests, reserved_budget_minor,
    used_budget_minor, created_at, consumed_at
  ) VALUES (
    $1, $2, $2, $3, $4, 'evaluation-unit', 'gpt-image-2-vip', NULL, $5, 1,
    50, 50, 'CNY', '复核测试授权', $6, 'consumed', $7, $8,
    1, 1, 50, 50, $9, $10
  )
`, [
  authorizationId,
  admin.id,
  campaignId,
  slotId,
  `sha256:${hash("a")}`,
  finishedAt + 60_000,
  caseId,
  runId,
  startedAt - 1_000,
  startedAt - 500,
]);
await database.query(`
  UPDATE evaluation_campaign_slots
  SET authorization_id = $1, run_id = $2
  WHERE campaign_id = $3 AND slot_id = $4
`, [authorizationId, runId, campaignId, slotId]);
await database.query(`
  INSERT INTO evaluation_case_evidence (
    id, run_id, owner_id, case_id, sample_id, authorization_id, campaign_id, slot_id,
    code_sha, code_sha_source, code_dirty, model_id, resolved_model_id,
    node_kind, operation_mode, task_family_id, preset_id, prompt_variant_id,
    prompt_version, prompt_sha256, evaluation_version, contract_hash,
    evaluation_unit_key, parameter_profile_id, parameter_profile_version,
    postprocess_version, input_normalization_version, golden_set_version,
    scoring_rubric_version, resolved_prompt, native_parameters_json,
    reference_inputs_json, requested_image_count, request_snapshot_sha256,
    snapshot_json, outcome, provider_request_count, latency_ms,
    billing_reconciliation_status, error_events_json, hard_blockers_json,
    evidence_record_sha256, started_at, finished_at, finalized_at,
    created_at, updated_at
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    $9, 'build-identity', FALSE, 'gpt-image-2-vip', 'gpt-image-2-vip',
    'sketch-to-render', 'generate', 'fashion-lookbook', 'fashion-lookbook',
    'fashion-lookbook-gpt-image-2-vip-generate-v1', 'prompt-v1', $10,
    'evaluation-v1', $11, $12, 'profile-v1', '1.0.0', 'fit-pad-v1',
    'reference-input-sha256-v1', 'garment-gold-v1', 'garment-rubric-v1',
    '完整提示词', '{}', '[]', 2, $13, '{}', 'succeeded', 1, $14,
    'pending', '[]', '[]', $15, $16, $17, $17, $18, $19
  )
`, [
  caseEvidenceId,
  runId,
  admin.id,
  caseId,
  sampleId,
  authorizationId,
  campaignId,
  slotId,
  "b".repeat(40),
  hash("c"),
  `sha256:${hash("d")}`,
  `sha256:${hash("a")}`,
  hash("e"),
  finishedAt - startedAt,
  hash("f"),
  startedAt,
  finishedAt,
  createdAt,
  finishedAtIso,
]);
await database.query(`
  INSERT INTO evaluation_provider_request_evidence (
    id, case_evidence_id, run_id, request_index, request_snapshot_sha256,
    prompt_sha256, native_parameters_json, business_parameters_json,
    reference_inputs_json, outcome, provider_model, provider_output_sizes_json,
    output_count, started_at, finished_at, latency_ms, reserved_cost_minor,
    budget_currency, billing_reconciliation_status
  ) VALUES (
    $1, $2, $3, 1, $4, $5, '{}', '{}', '[]', 'succeeded',
    'gpt-image-2-vip', '["2048x2048","2048x2048"]', 2,
    $6, $7, $8, 50, 'CNY', 'pending'
  )
`, [requestEvidenceId, caseEvidenceId, runId, hash("e"), hash("c"), startedAt, finishedAt, finishedAt - startedAt]);

for (const outputIndex of [0, 1]) {
  const providerId = `${caseEvidenceId}:provider:${outputIndex}`;
  await database.query(`
    INSERT INTO evaluation_image_evidence (
      id, case_evidence_id, run_id, output_index, layer,
      provider_request_evidence_id, source_evidence_id, storage_ref,
      artifact_sha256, mime_type, width, height, byte_length,
      pipeline_version, captured_at
    ) VALUES ($1, $2, $3, $4, 'provider-original', $5, NULL, $6,
      $7, 'image/png', 100, 100, 1000, NULL, $8)
  `, [
    providerId, caseEvidenceId, runId, outputIndex, requestEvidenceId,
    `/api/files/provider-${outputIndex}.png`, outputIndex === 0 ? hash("1") : hash("2"), finishedAt,
  ]);
  await database.query(`
    INSERT INTO evaluation_image_evidence (
      id, case_evidence_id, run_id, output_index, layer,
      provider_request_evidence_id, source_evidence_id, storage_ref,
      artifact_sha256, mime_type, width, height, byte_length,
      pipeline_version, captured_at
    ) VALUES ($1, $2, $3, $4, 'postprocessed', NULL, $5, $6,
      $7, 'image/webp', 100, 100, 900, 'fit-pad-v1', $8)
  `, [
    `${caseEvidenceId}:postprocessed:${outputIndex}`, caseEvidenceId, runId, outputIndex,
    providerId, `/api/files/postprocessed-${outputIndex}.webp`,
    outputIndex === 0 ? hash("3") : hash("4"), finishedAt + 1,
  ]);
}

console.log("评估复核事件账本测试");
const immutableBefore = {
  request: await database.queryOne<{
    request_snapshot_sha256: string;
    prompt_sha256: string;
    native_parameters_json: string;
  }>(`
    SELECT request_snapshot_sha256, prompt_sha256, native_parameters_json
    FROM evaluation_provider_request_evidence WHERE id = $1
  `, [requestEvidenceId]),
  images: await database.query<{ id: string; artifact_sha256: string; storage_ref: string }>(`
    SELECT id, artifact_sha256, storage_ref FROM evaluation_image_evidence
    WHERE case_evidence_id = $1 ORDER BY id
  `, [caseEvidenceId]),
};

const billingInput = {
  caseEvidenceId,
  runId,
  providerRequestEvidenceId: requestEvidenceId,
  status: "confirmed-billed" as const,
  actualCostMinor: 25,
  currency: "CNY",
  billingReference: "apiyi-log-001",
};
await assert.rejects(
  database.transaction((client) => reviewLedger.appendEvaluationBillingReconciliation(
    client, nonAdmin, billingInput,
  )),
  /administrator/,
);
await assert.rejects(
  database.transaction((client) => reviewLedger.appendEvaluationBillingReconciliation(
    client, admin, { ...billingInput, providerRequestEvidenceId: "another-request" },
  )),
  /does not belong/,
);
await assert.rejects(
  database.transaction((client) => reviewLedger.appendEvaluationBillingReconciliation(
    client,
    admin,
    { ...billingInput, status: "confirmed-not-billed", actualCostMinor: 1 },
  )),
  /requires actualCostMinor to equal zero/,
);
console.log("  ✓ 只有管理员可复核，且 request 归属与账单金额语义会先校验");

const firstBilling = await database.transaction((client) => reviewLedger.appendEvaluationBillingReconciliation(
  client, admin, { ...billingInput, note: "账单页确认已计费" }, finishedAt + 100,
));
const secondBilling = await database.transaction((client) => reviewLedger.appendEvaluationBillingReconciliation(
  client,
  admin,
  {
    ...billingInput,
    status: "confirmed-not-billed",
    actualCostMinor: 0,
    billingReference: "apiyi-log-correction-002",
    note: "财务复核更正：未计费",
  },
  finishedAt + 100,
));
assert.equal(firstBilling.previousEventSha256, null);
assert.equal(secondBilling.previousEventSha256, firstBilling.eventSha256);
assert.match(secondBilling.eventSha256, /^[a-f0-9]{64}$/);
assert.deepEqual(await database.queryOne<{
  actual_cost_minor: number;
  billing_reconciliation_status: string;
  billing_reference: string;
}>(`
  SELECT actual_cost_minor::int, billing_reconciliation_status, billing_reference
  FROM evaluation_provider_request_evidence WHERE id = $1
`, [requestEvidenceId]), {
  actual_cost_minor: 0,
  billing_reconciliation_status: "confirmed-not-billed",
  billing_reference: "apiyi-log-correction-002",
});
assert.equal((await database.queryOne<{ billing_reconciliation_status: string }>(`
  SELECT billing_reconciliation_status FROM generation_runs WHERE id = $1
`, [runId]))?.billing_reconciliation_status, "confirmed-not-billed");
console.log("  ✓ 账单更正追加 previous hash 链并只刷新摘要字段");

const score80 = {
  garmentMaterialFidelity: 80,
  instructionFollowing: 80,
  artifactControl: 80,
  commercialUsability: 80,
};
const score100 = {
  garmentMaterialFidelity: 100,
  instructionFollowing: 100,
  artifactControl: 100,
  commercialUsability: 100,
};
await assert.rejects(
  database.transaction((client) => reviewLedger.appendEvaluationManualAssessment(
    client,
    nonAdmin,
    {
      caseEvidenceId, runId, outputIndex: 0, scores: score80,
      taskPassed: true, validForScoring: true,
    },
  )),
  /administrator/,
);
await assert.rejects(
  database.transaction((client) => reviewLedger.appendEvaluationManualAssessment(
    client,
    admin,
    {
      caseEvidenceId, runId, outputIndex: 99, scores: score80,
      taskPassed: true, validForScoring: true,
    },
  )),
  /does not belong/,
);
await assert.rejects(
  database.transaction((client) => reviewLedger.appendEvaluationManualAssessment(
    client,
    admin,
    {
      caseEvidenceId, runId, outputIndex: 0, scores: { ...score80, extra: 1 },
      taskPassed: true, validForScoring: true,
    },
  )),
  /exactly the four rubric criteria/,
);
await assert.rejects(
  database.transaction((client) => reviewLedger.appendEvaluationManualAssessment(
    client,
    admin,
    {
      caseEvidenceId, runId, outputIndex: 0, scores: score80, baselineScores: score80,
      taskPassed: true, validForScoring: true,
    },
  )),
  /detached baselineScores are legacy-only/,
  "不得把无独立 case 证据的手填基线分数写成 recommendation 证据",
);
const firstManual = await database.transaction((client) => reviewLedger.appendEvaluationManualAssessment(
  client,
  admin,
  {
    caseEvidenceId, runId, outputIndex: 0, scores: score80,
    taskPassed: true, validForScoring: true, reviewNote: "输出 0 通过",
  },
  finishedAt + 200,
));
assert.equal((await database.queryOne<{ manual_scores_json: string | null }>(
  "SELECT manual_scores_json FROM evaluation_case_evidence WHERE id = $1",
  [caseEvidenceId],
))?.manual_scores_json, null, "多输出 case 未评完时不得冒充完整评分");
const secondManual = await database.transaction((client) => reviewLedger.appendEvaluationManualAssessment(
  client,
  admin,
  {
    caseEvidenceId, runId, outputIndex: 1, scores: score100,
    taskPassed: true, validForScoring: true, reviewNote: "输出 1 通过",
  },
  finishedAt + 200,
));
assert.equal(firstManual.previousEventSha256, null);
assert.equal(secondManual.previousEventSha256, firstManual.eventSha256);
const completed = await database.queryOne<{
  manual_scores_json: string;
  baseline_scores_json: string | null;
  task_passed: boolean;
}>(`
  SELECT manual_scores_json, baseline_scores_json, task_passed
  FROM evaluation_case_evidence WHERE id = $1
`, [caseEvidenceId]);
assert.deepEqual(JSON.parse(completed!.manual_scores_json), {
  garmentMaterialFidelity: 90,
  instructionFollowing: 90,
  artifactControl: 90,
  commercialUsability: 90,
});
assert.equal(completed!.baseline_scores_json, null);
assert.equal(completed?.task_passed, true);
console.log("  ✓ 人工分数复用四维校验且评完所有输出后才生成 case 摘要；detached 基线写入被拒绝");

await assert.rejects(
  database.transaction((client) => reviewLedger.appendEvaluationManualAssessment(
    client,
    admin,
    {
      caseEvidenceId, runId, outputIndex: 0, scores: score80,
      taskPassed: false, validForScoring: true,
      hardBlockers: [{
        code: "evidence-integrity-failure",
        detail: "不属于本 case 的证据",
        evidenceIds: ["another-case:provider:0"],
      }],
    },
  )),
  /must belong to the reviewed case/,
);
const blockingManual = await database.transaction((client) => reviewLedger.appendEvaluationManualAssessment(
  client,
  admin,
  {
    caseEvidenceId,
    runId,
    outputIndex: 0,
    scores: {
      garmentMaterialFidelity: 0,
      instructionFollowing: 0,
      artifactControl: 0,
      commercialUsability: 0,
    },
    taskPassed: false,
    validForScoring: true,
    hardBlockers: [{
      code: "garment-identity-corruption",
      detail: "服装身份严重错位",
      evidenceIds: [`${caseEvidenceId}:postprocessed:0`],
    }],
    reviewNote: "更正评分并保留严重失败",
  },
  finishedAt + 300,
));
assert.equal(blockingManual.previousEventSha256, secondManual.eventSha256);
const blocked = await database.queryOne<{
  task_passed: boolean;
  valid_for_scoring: boolean;
  hard_blockers_json: string;
}>(`
  SELECT task_passed, valid_for_scoring, hard_blockers_json
  FROM evaluation_case_evidence WHERE id = $1
`, [caseEvidenceId]);
assert.equal(blocked?.task_passed, false);
assert.equal(blocked?.valid_for_scoring, true, "严重失败不得通过排除美化均分");
assert.equal(JSON.parse(blocked!.hard_blockers_json)[0].code, "garment-identity-corruption");
console.log("  ✓ 硬阻断证据验证归属，严重失败仍进入评分分母");

const legacyCreatedAt = new Date(finishedAt + 400).toISOString();
const legacyManualBase = {
  schemaVersion: 1,
  eventType: "manual-assessment",
  id: "manual-review:legacy-detached-baseline",
  caseEvidenceId,
  outputIndex: 1,
  scores: score100,
  baselineScores: score80,
  taskPassed: true,
  validForScoring: true,
  hardBlockers: [],
  reviewNote: "legacy detached baseline compatibility fixture",
  reviewerId: admin.id,
  previousEventSha256: blockingManual.eventSha256,
  createdAt: legacyCreatedAt,
};
const legacyEventSha256 = eventSha256(legacyManualBase);
await database.query(`
  INSERT INTO evaluation_manual_assessment_events (
    id, case_evidence_id, output_index, scores_json, baseline_scores_json,
    task_passed, valid_for_scoring, hard_blockers_json, review_note,
    reviewer_id, previous_event_sha256, event_sha256, created_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
`, [
  legacyManualBase.id,
  legacyManualBase.caseEvidenceId,
  legacyManualBase.outputIndex,
  JSON.stringify(legacyManualBase.scores),
  JSON.stringify(legacyManualBase.baselineScores),
  legacyManualBase.taskPassed,
  legacyManualBase.validForScoring,
  JSON.stringify(legacyManualBase.hardBlockers),
  legacyManualBase.reviewNote,
  legacyManualBase.reviewerId,
  legacyManualBase.previousEventSha256,
  legacyEventSha256,
  legacyManualBase.createdAt,
]);

await assert.rejects(
  database.query("UPDATE evaluation_billing_reconciliation_events SET note = 'tampered' WHERE id = $1", [firstBilling.id]),
  /append-only/,
);
await assert.rejects(
  database.query("DELETE FROM evaluation_manual_assessment_events WHERE id = $1", [firstManual.id]),
  /append-only/,
);
console.log("  ✓ 数据库触发器拒绝修改或删除原始复核事件");

const bundle = await database.transaction((client) => reviewLedger.loadEvaluationCaseEvidenceBundle(
  client, admin, { caseEvidenceId, runId }, finishedAt + 400,
));
assert.equal(bundle.providerRequests.length, 1);
assert.equal(bundle.images.length, 4);
assert.equal(bundle.billingEvents.length, 2);
assert.equal(bundle.manualAssessmentEvents.length, 4);
assert.deepEqual(bundle.caseEvidence.snapshot, {});
assert.equal(bundle.caseEvidence.model_id, "gpt-image-2-vip");
assert.equal(bundle.providerRequests[0]?.provider_model, "gpt-image-2-vip");
assert.equal(bundle.billingEvents[1].previousEventSha256, bundle.billingEvents[0].eventSha256);
assert.equal(bundle.manualAssessmentEvents[2].previousEventSha256, bundle.manualAssessmentEvents[1].eventSha256);
assert.equal(bundle.manualAssessmentEvents[3].previousEventSha256, bundle.manualAssessmentEvents[2].eventSha256);
assert.deepEqual(bundle.manualAssessmentEvents[3].baselineScores, score80);
assert.equal(bundle.manualAssessmentEvents[3].eventSha256, legacyEventSha256);
assert.equal(Object.isFrozen(bundle), true);
assert.deepEqual({
  request: await database.queryOne<{
    request_snapshot_sha256: string;
    prompt_sha256: string;
    native_parameters_json: string;
  }>(`
    SELECT request_snapshot_sha256, prompt_sha256, native_parameters_json
    FROM evaluation_provider_request_evidence WHERE id = $1
  `, [requestEvidenceId]),
  images: await database.query<{ id: string; artifact_sha256: string; storage_ref: string }>(`
    SELECT id, artifact_sha256, storage_ref FROM evaluation_image_evidence
    WHERE case_evidence_id = $1 ORDER BY id
  `, [caseEvidenceId]),
}, immutableBefore, "复核只能更新摘要，不得改写请求快照或图像证据");
await assert.rejects(
  database.transaction((client) => reviewLedger.loadEvaluationCaseEvidenceBundle(
    client, nonAdmin, { caseEvidenceId, runId },
  )),
  /administrator/,
);
console.log("  ✓ 管理员仍可只读导出历史关联证据并在返回前重新验链");

await database.closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
console.log("评估复核事件账本测试通过");
