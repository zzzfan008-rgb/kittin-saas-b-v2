import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AuthUser } from "../server/lib/auth";
import type { EvaluationCampaignSlotRuntimeBinding } from "../server/lib/evaluationCampaign";
import type { EvaluationRunPolicy } from "../server/lib/evaluationRunPolicy";
import type { ExecutionPlan } from "../src/types/workflow";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-evaluation-campaign-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "evaluation-campaign-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const database = await import("../server/lib/database");
const authorization = await import("../server/lib/evaluationAuthorizationLedger");
const campaign = await import("../server/lib/evaluationCampaign");
const review = await import("../server/lib/evaluationReviewLedger");
await database.initializeDatabase();

const owner = await database.queryOne<{
  id: string;
  account_id: string;
  display_name: string;
  must_change_password: number;
}>(`
  SELECT id, account_id, display_name, must_change_password
  FROM users WHERE account_id = 'evaluation-campaign-admin'
`);
assert.ok(owner);
const admin: AuthUser = {
  id: owner.id,
  accountId: owner.account_id,
  displayName: owner.display_name,
  role: "admin",
  mustChangePassword: owner.must_change_password === 1,
};

const STARTED_AT = Date.now();
const CODE_SHA = "c".repeat(40);
const RESOLVED_PROMPT_SHA256 = "a".repeat(64);
const NATIVE_PARAMETERS_SHA256 = "b".repeat(64);
const REFERENCE_INPUTS_SHA256 = "d".repeat(64);
const REQUEST_SNAPSHOT_SHA256 = "e".repeat(64);
const EVIDENCE_RECORD_SHA256 = "f".repeat(64);
const PRICE_MINOR = 17;

const evaluationPlan: ExecutionPlan = {
  steps: [{
    nodeId: "evaluation-campaign-node",
    kind: "sketch-to-render",
    inputImages: [],
    inputReferences: [],
    params: {
      modelId: "gpt-image-2.5-flare-vip",
      operationMode: "generate",
      prompt: "sealed campaign regression",
      promptVariantId: "fashion-lookbook-gpt-image-2.5-flare-vip-generate-v1",
      promptFamilyId: "fashion-lookbook",
      parameterProfileId: "gpt-image-2.5-flare-vip-lookbook-v1",
      contractHash: `sha256:${"1".repeat(64)}`,
      evaluationVersion: "1.0.0",
      postprocessVersion: "fit-pad-v1",
      aspectRatio: "1:1",
      batchSize: 1,
      modelOptions: { size: "2048x2048" },
    },
  }],
};
const target = authorization.evaluationAuthorizationTargetFromPlan(evaluationPlan);

interface CampaignSetup {
  campaignId: string;
  slotId: string;
  caseId: string;
  sampleId: string;
  authorizationId: string;
  maxProviderRequests: number;
  priceMinorPerProviderRequest: number;
  budgetLimitMinor: number;
}

interface BoundCampaign extends CampaignSetup {
  policy: EvaluationRunPolicy;
  runId: string;
}

function setup(prefix: string): CampaignSetup {
  const maxProviderRequests = target.maximumProviderRequests;
  return {
    campaignId: `campaign-${prefix}`,
    slotId: `slot-${prefix}`,
    caseId: `case-${prefix}`,
    sampleId: `sample-${prefix}`,
    authorizationId: `authorization-${prefix}`,
    maxProviderRequests,
    priceMinorPerProviderRequest: PRICE_MINOR,
    budgetLimitMinor: maxProviderRequests * PRICE_MINOR,
  };
}

function authorizationPolicy(input: CampaignSetup): EvaluationRunPolicy {
  return {
    caseId: input.caseId,
    sampleId: input.sampleId,
    authorizationId: input.authorizationId,
    campaignId: input.campaignId,
    slotId: input.slotId,
    retryPolicy: "no-retry",
  };
}

function slotRuntime(
  overrides: Partial<EvaluationCampaignSlotRuntimeBinding> = {},
): EvaluationCampaignSlotRuntimeBinding {
  return {
    codeSha: CODE_SHA,
    modelId: target.modelId,
    authorizationUnitKey: target.evaluationUnitKey,
    resolvedPromptSha256: RESOLVED_PROMPT_SHA256,
    nativeParametersSha256: NATIVE_PARAMETERS_SHA256,
    referenceInputsSha256: REFERENCE_INPUTS_SHA256,
    requestedImageCount: target.maximumProviderRequests,
    ...overrides,
  };
}

function authorizationBinding(input: CampaignSetup) {
  return {
    campaignId: input.campaignId,
    slotId: input.slotId,
    ownerId: admin.id,
    modelId: target.modelId,
    evaluationUnitKey: target.evaluationUnitKey,
    maxProviderRequests: input.maxProviderRequests,
    priceMinorPerProviderRequest: input.priceMinorPerProviderRequest,
    budgetLimitMinor: input.budgetLimitMinor,
    budgetCurrency: "CNY",
  };
}

async function sealCampaign(input: CampaignSetup): Promise<void> {
  await database.transaction((client) => campaign.createSealedEvaluationCampaign(client, admin, {
    campaignId: input.campaignId,
    ownerId: admin.id,
    stage: "internal-experiment",
    modelId: target.modelId,
    authorizationUnitKey: target.evaluationUnitKey,
    codeSha: CODE_SHA,
    maxProviderRequests: input.maxProviderRequests,
    budgetLimitMinor: input.budgetLimitMinor,
    budgetCurrency: "CNY",
    slots: [{
      slotId: input.slotId,
      caseId: input.caseId,
      sampleId: input.sampleId,
      resolvedPromptSha256: RESOLVED_PROMPT_SHA256,
      nativeParametersSha256: NATIVE_PARAMETERS_SHA256,
      referenceInputsSha256: REFERENCE_INPUTS_SHA256,
      requestedImageCount: target.maximumProviderRequests,
      maxProviderRequests: input.maxProviderRequests,
      priceMinorPerProviderRequest: input.priceMinorPerProviderRequest,
      budgetLimitMinor: input.budgetLimitMinor,
    }],
  }, STARTED_AT));
}

async function bindCampaignRun(prefix: string): Promise<BoundCampaign> {
  const input = setup(prefix);
  const policy = authorizationPolicy(input);
  const runId = `run-${prefix}`;
  await sealCampaign(input);
  await database.transaction((client) => authorization.registerEvaluationRunAuthorization(client, admin, {
    authorizationId: input.authorizationId,
    ownerId: admin.id,
    campaignId: input.campaignId,
    slotId: input.slotId,
    scope: {
      type: "evaluation-unit",
      modelId: target.modelId,
      evaluationUnitKey: target.evaluationUnitKey,
    },
    maxProviderRequests: input.maxProviderRequests,
    priceMinorPerProviderRequest: input.priceMinorPerProviderRequest,
    budgetLimitMinor: input.budgetLimitMinor,
    budgetCurrency: "CNY",
    expiresAt: STARTED_AT + 600_000,
    reason: "evaluation campaign P0 regression",
  }, STARTED_AT));
  await database.transaction(async (client) => {
    const locked = await authorization.lockEvaluationRunAuthorization(
      client,
      policy,
      admin.id,
      evaluationPlan,
      STARTED_AT,
    );
    await client.query(`
      INSERT INTO generation_runs (
        id, owner_id, node_id, node_label, kind, prompt, requested_count,
        successful_count, provider_requests, status, started_at, updated_at,
        run_type, retry_policy, evaluation_case_id, evaluation_authorization_id,
        evaluation_campaign_id, evaluation_slot_id, billing_reconciliation_status
      ) VALUES (
        $1, $2, 'evaluation-campaign-node', 'Evaluation campaign node',
        'sketch-to-render', 'sealed campaign regression', 1, 0, 0,
        'queued', $3, $3, 'evaluation', 'no-retry', $4, $5, $6, $7, 'pending'
      )
    `, [
      runId,
      admin.id,
      STARTED_AT,
      policy.caseId,
      policy.authorizationId,
      policy.campaignId,
      policy.slotId,
    ]);
    await authorization.consumeEvaluationRunAuthorization(
      client,
      locked,
      policy,
      admin.id,
      runId,
      STARTED_AT,
    );
  });
  return { ...input, policy, runId };
}

async function reserveExactly(input: BoundCampaign): Promise<void> {
  await database.transaction(async (client) => {
    await authorization.recordAuthorizedEvaluationProviderRequest(client, {
      authorizationId: input.policy.authorizationId,
      ownerId: admin.id,
      caseId: input.policy.caseId,
      runId: input.runId,
    }, STARTED_AT + 1);
    await campaign.reserveEvaluationCampaignProviderRequest(client, {
      campaignId: input.policy.campaignId,
      slotId: input.policy.slotId,
      authorizationId: input.policy.authorizationId,
      runId: input.runId,
      requestIndex: 1,
      runtime: slotRuntime(),
    });
  });
}

async function persistSucceededEvidence(input: BoundCampaign): Promise<{
  caseEvidenceId: string;
  providerRequestEvidenceId: string;
}> {
  const caseEvidenceId = `evaluation-case:${input.runId}`;
  const providerRequestEvidenceId = `${caseEvidenceId}:request:1`;
  const finishedAt = STARTED_AT + 100;
  const finishedAtIso = new Date(finishedAt).toISOString();
  await database.transaction(async (client) => {
    await client.query(`
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
        $9, 'build-identity', FALSE, 'gpt-image-2.5-flare-vip', 'gpt-image-2.5-flare-vip',
        'sketch-to-render', 'generate', 'fashion-lookbook', 'fashion-lookbook',
        'fashion-lookbook-gpt-image-2.5-flare-vip-generate-v1', 'prompt-v1', $10,
        'evaluation-v1', $11, $12, 'profile-v1', '1.0.0', 'fit-pad-v1',
        'reference-input-sha256-v1', 'garment-gold-v1', 'garment-rubric-v1',
        'sealed campaign regression', '{}', '[]', 1, $13, '{}',
        'succeeded', 1, 100, 'pending', '[]', '[]', $14, $15, $16, $16, $17, $17
      )
    `, [
      caseEvidenceId,
      input.runId,
      admin.id,
      input.policy.caseId,
      input.policy.sampleId,
      input.policy.authorizationId,
      input.policy.campaignId,
      input.policy.slotId,
      CODE_SHA,
      RESOLVED_PROMPT_SHA256,
      target.evaluationUnitKey,
      target.evaluationUnitKey,
      REQUEST_SNAPSHOT_SHA256,
      EVIDENCE_RECORD_SHA256,
      STARTED_AT,
      finishedAt,
      finishedAtIso,
    ]);
    await client.query(`
      INSERT INTO evaluation_provider_request_evidence (
        id, case_evidence_id, run_id, request_index, request_snapshot_sha256,
        prompt_sha256, native_parameters_json, business_parameters_json,
        reference_inputs_json, outcome, provider_model, provider_output_sizes_json,
        output_count, started_at, finished_at, latency_ms, reserved_cost_minor,
        budget_currency, billing_reconciliation_status
      ) VALUES (
        $1, $2, $3, 1, $4, $5, '{}', '{}', '[]', 'succeeded',
        'gpt-image-2.5-flare-vip', '["2048x2048"]', 1, $6, $7, $8, $9, 'CNY', 'pending'
      )
    `, [
      providerRequestEvidenceId,
      caseEvidenceId,
      input.runId,
      REQUEST_SNAPSHOT_SHA256,
      RESOLVED_PROMPT_SHA256,
      STARTED_AT,
      finishedAt,
      finishedAt - STARTED_AT,
      input.priceMinorPerProviderRequest,
    ]);
    const providerOriginalId = `${caseEvidenceId}:provider:0`;
    await client.query(`
      INSERT INTO evaluation_image_evidence (
        id, case_evidence_id, run_id, output_index, layer,
        provider_request_evidence_id, source_evidence_id, storage_ref,
        artifact_sha256, mime_type, width, height, byte_length,
        pipeline_version, captured_at
      ) VALUES ($1, $2, $3, 0, 'provider-original', $4, NULL, $5,
        $6, 'image/png', 100, 100, 1_000, NULL, $7)
    `, [
      providerOriginalId,
      caseEvidenceId,
      input.runId,
      providerRequestEvidenceId,
      "/api/files/campaign-provider.png",
      "2".repeat(64),
      finishedAt,
    ]);
    await client.query(`
      INSERT INTO evaluation_image_evidence (
        id, case_evidence_id, run_id, output_index, layer,
        provider_request_evidence_id, source_evidence_id, storage_ref,
        artifact_sha256, mime_type, width, height, byte_length,
        pipeline_version, captured_at
      ) VALUES ($1, $2, $3, 0, 'postprocessed', NULL, $4, $5,
        $6, 'image/webp', 100, 100, 900, 'fit-pad-v1', $7)
    `, [
      `${caseEvidenceId}:postprocessed:0`,
      caseEvidenceId,
      input.runId,
      providerOriginalId,
      "/api/files/campaign-postprocessed.webp",
      "3".repeat(64),
      finishedAt + 1,
    ]);
    await campaign.finalizeEvaluationCampaignSlot(client, {
      campaignId: input.policy.campaignId,
      slotId: input.policy.slotId,
      authorizationId: input.policy.authorizationId,
      runId: input.runId,
      outcome: "succeeded",
    });
  });
  return { caseEvidenceId, providerRequestEvidenceId };
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

function closureDigest(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

console.log("immutable paid evaluation campaign ledger P0 tests");

{
  const immutable = setup("immutable");
  await sealCampaign(immutable);
  await assert.rejects(
    database.query(
      "UPDATE evaluation_campaigns SET budget_currency = 'USD' WHERE campaign_id = $1",
      [immutable.campaignId],
    ),
    /campaign manifest is immutable/,
  );
  await assert.rejects(
    database.query(
      "UPDATE evaluation_campaign_slots SET sample_id = 'rewritten' WHERE slot_id = $1",
      [immutable.slotId],
    ),
    /slot manifest is immutable/,
  );
  await assert.rejects(
    database.query("DELETE FROM evaluation_campaign_slots WHERE slot_id = $1", [immutable.slotId]),
    /campaigns and slots are append-only/,
  );
  await assert.rejects(
    database.query("DELETE FROM evaluation_campaigns WHERE campaign_id = $1", [immutable.campaignId]),
    /campaigns and slots are append-only/,
  );
  await assert.rejects(
    sealCampaign(immutable),
    /campaignId already exists; a sealed campaign cannot be replaced/,
  );
  console.log("  ✓ campaign and slot manifests cannot be rewritten or deleted");
}

{
  const mismatch = setup("case-sample-mismatch");
  await sealCampaign(mismatch);
  await assert.rejects(
    database.transaction((client) => campaign.lockEvaluationCampaignSlotForRunAuthorization(client, {
      ...authorizationBinding(mismatch),
      caseId: "case-other",
      sampleId: mismatch.sampleId,
    })),
    /caseId or sampleId differs from the sealed campaign slot/,
  );
  await assert.rejects(
    database.transaction((client) => campaign.lockEvaluationCampaignSlotForRunAuthorization(client, {
      ...authorizationBinding(mismatch),
      caseId: mismatch.caseId,
      sampleId: "sample-other",
    })),
    /caseId or sampleId differs from the sealed campaign slot/,
  );
  console.log("  ✓ authorizations must bind the exact sealed case and sample");
}

{
  const capped = setup("caps-and-currency");
  await sealCampaign(capped);
  await assert.rejects(
    database.transaction((client) => campaign.assertEvaluationCampaignSlotAllowsAuthorization(client, {
      ...authorizationBinding(capped),
      budgetCurrency: "USD",
    })),
    /authorization caps or currency differ from sealed campaign slot/,
  );
  await assert.rejects(
    database.transaction((client) => campaign.assertEvaluationCampaignSlotAllowsAuthorization(client, {
      ...authorizationBinding(capped),
      priceMinorPerProviderRequest: capped.priceMinorPerProviderRequest + 1,
      budgetLimitMinor: capped.budgetLimitMinor + 1,
    })),
    /authorization caps or currency differ from sealed campaign slot/,
  );
  console.log("  ✓ authorization price, request cap, budget, and currency are sealed together");
}

{
  const runtime = await bindCampaignRun("runtime-drift");
  await assert.rejects(
    database.transaction(async (client) => {
      await authorization.recordAuthorizedEvaluationProviderRequest(client, {
        authorizationId: runtime.policy.authorizationId,
        ownerId: admin.id,
        caseId: runtime.policy.caseId,
        runId: runtime.runId,
      }, STARTED_AT + 1);
      await campaign.reserveEvaluationCampaignProviderRequest(client, {
        campaignId: runtime.policy.campaignId,
        slotId: runtime.policy.slotId,
        authorizationId: runtime.policy.authorizationId,
        runId: runtime.runId,
        requestIndex: 1,
        runtime: slotRuntime({ resolvedPromptSha256: "9".repeat(64) }),
      });
    }),
    /actual Provider request differs from its sealed campaign slot/,
  );
  assert.deepEqual(await database.queryOne<{
    used_provider_requests: number;
    reserved_provider_requests: number;
  }>(`
    SELECT grant_row.used_provider_requests, slot.reserved_provider_requests
    FROM evaluation_run_authorizations grant_row
    JOIN evaluation_campaign_slots slot
      ON slot.campaign_id = grant_row.campaign_id AND slot.slot_id = grant_row.slot_id
    WHERE grant_row.authorization_id = $1
  `, [runtime.policy.authorizationId]), {
    used_provider_requests: 0,
    reserved_provider_requests: 0,
  });
  await reserveExactly(runtime);
  await assert.rejects(
    database.transaction((client) => campaign.reserveEvaluationCampaignProviderRequest(client, {
      campaignId: runtime.policy.campaignId,
      slotId: runtime.policy.slotId,
      authorizationId: runtime.policy.authorizationId,
      runId: runtime.runId,
      requestIndex: 2,
      runtime: slotRuntime(),
    })),
    /sealed campaign request or budget cap would be exceeded/,
  );
  assert.deepEqual(await database.queryOne<{
    status: string;
    reserved_provider_requests: number;
    reserved_budget_minor: number;
  }>(`
    SELECT status, reserved_provider_requests, reserved_budget_minor
    FROM evaluation_campaign_slots WHERE slot_id = $1
  `, [runtime.policy.slotId]), {
    status: "running",
    reserved_provider_requests: 1,
    reserved_budget_minor: PRICE_MINOR,
  });
  console.log("  ✓ runtime hash drift and a second Provider reservation leave sealed caps intact");
}

for (const outcome of ["failed", "outcome_unknown"] as const) {
  const stopped = await bindCampaignRun(`stops-${outcome}`);
  await database.transaction((client) => campaign.finalizeEvaluationCampaignSlot(client, {
    campaignId: stopped.policy.campaignId,
    slotId: stopped.policy.slotId,
    authorizationId: stopped.policy.authorizationId,
    runId: stopped.runId,
    outcome,
  }));
  await database.transaction((client) => campaign.finalizeEvaluationCampaignSlot(client, {
    campaignId: stopped.policy.campaignId,
    slotId: stopped.policy.slotId,
    authorizationId: stopped.policy.authorizationId,
    runId: stopped.runId,
    outcome,
  }));
  assert.deepEqual(await database.queryOne<{ campaign_status: string; slot_status: string }>(`
    SELECT campaign.status AS campaign_status, slot.status AS slot_status
    FROM evaluation_campaigns campaign
    JOIN evaluation_campaign_slots slot ON slot.campaign_id = campaign.campaign_id
    WHERE campaign.campaign_id = $1 AND slot.slot_id = $2
  `, [stopped.policy.campaignId, stopped.policy.slotId]), {
    campaign_status: "stopped",
    slot_status: outcome,
  });
}
console.log("  ✓ failed and outcome-unknown slots stop campaigns, with idempotent terminal handling");

{
  const successful = await bindCampaignRun("closure");
  await reserveExactly(successful);
  const evidence = await persistSucceededEvidence(successful);
  await database.transaction((client) => review.appendEvaluationBillingReconciliation(client, admin, {
    caseEvidenceId: evidence.caseEvidenceId,
    runId: successful.runId,
    providerRequestEvidenceId: evidence.providerRequestEvidenceId,
    status: "confirmed-billed",
    actualCostMinor: successful.priceMinorPerProviderRequest,
    currency: "CNY",
    billingReference: "campaign-closure-billing",
  }, STARTED_AT + 200));
  await database.transaction((client) => review.appendEvaluationManualAssessment(client, admin, {
    caseEvidenceId: evidence.caseEvidenceId,
    runId: successful.runId,
    outputIndex: 0,
    scores: {
      garmentMaterialFidelity: 95,
      instructionFollowing: 95,
      artifactControl: 95,
      commercialUsability: 95,
    },
    taskPassed: true,
    validForScoring: true,
  }, STARTED_AT + 300));
  const closure = await database.transaction((client) => campaign.buildEvaluationCampaignClosure(client, {
    campaignId: successful.policy.campaignId,
    ownerId: admin.id,
    stage: "internal-experiment",
    codeSha: CODE_SHA,
    closedBy: admin.id,
    closedAt: "2026-09-08T00:00:00.000Z",
  }));
  assert.equal(closure.slots.length, 1);
  assert.deepEqual(closure.slots[0] && {
    slotId: closure.slots[0].slotId,
    caseId: closure.slots[0].caseId,
    sampleId: closure.slots[0].sampleId,
    authorizationId: closure.slots[0].authorizationId,
    runId: closure.slots[0].runId,
    caseEvidenceId: closure.slots[0].caseEvidenceId,
    evidenceRecordSha256: closure.slots[0].evidenceRecordSha256,
  }, {
    slotId: successful.policy.slotId,
    caseId: successful.policy.caseId,
    sampleId: successful.policy.sampleId,
    authorizationId: successful.policy.authorizationId,
    runId: successful.runId,
    caseEvidenceId: evidence.caseEvidenceId,
    evidenceRecordSha256: EVIDENCE_RECORD_SHA256,
  });
  assert.equal(campaign.validateEvaluationCampaignClosure(closure).artifactSha256, closure.artifactSha256);
  await database.transaction((client) => campaign.sealEvaluationCampaignClosure(client, closure));
  await database.transaction((client) => campaign.sealEvaluationCampaignClosure(client, closure));
  const { artifactSha256: _ignoredDigest, ...competingBase } = closure;
  const competingClosure = {
    ...competingBase,
    closedAt: "2026-09-08T00:00:01.000Z",
  };
  await assert.rejects(
    database.transaction((client) => campaign.sealEvaluationCampaignClosure(client, {
      ...competingClosure,
      artifactSha256: closureDigest(competingClosure),
    })),
    /sealed campaign already references a different closure artifact/,
  );
  assert.deepEqual(await database.queryOne<{ status: string; closure_sha256: string }>(`
    SELECT status, closure_sha256 FROM evaluation_campaigns WHERE campaign_id = $1
  `, [successful.policy.campaignId]), {
    status: "closed",
    closure_sha256: closure.artifactSha256,
  });
  assert.equal(
    (await database.transaction((client) => campaign.loadEvaluationCampaignForGate(client, {
      campaignId: successful.policy.campaignId,
      ownerId: admin.id,
      stage: "internal-experiment",
      codeSha: CODE_SHA,
    }))).closureSha256,
    closure.artifactSha256,
  );
  console.log("  ✓ closure binds exact evidence, persists one receipt digest, and is idempotent");
}

await database.closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
console.log("immutable paid evaluation campaign ledger P0 tests passed");
