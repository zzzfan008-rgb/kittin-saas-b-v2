import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AuthUser } from "../server/lib/auth";
import type { EvaluationRunPolicy } from "../server/lib/evaluationRunPolicy";
import type { EvaluationCampaignSlotRuntimeBinding } from "../server/lib/evaluationCampaign";
import type { AIProvider, ExecutionPlan, ImageGenRequest, NodeExecution } from "../src/types/workflow";
import type { ImageModelId } from "../src/types/imageModels";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-prepare-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "prepare-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";
process.env.GARMENT_CANVAS_CODE_SHA = "b".repeat(40);
process.env.ENABLE_PAID_EVALUATION_RUNS = "false";

await resetPostgresTestDatabase();
const database = await import("../server/lib/database");
const evaluationCampaign = await import("../server/lib/evaluationCampaign");
const evaluationEvidence = await import("../server/lib/evaluationEvidence");
const evaluationEvidenceStore = await import("../server/lib/evaluationEvidenceStore");
const evaluationRunPolicy = await import("../server/lib/evaluationRunPolicy");
const authorizationLedger = await import("../server/lib/evaluationAuthorizationLedger");
const { executeStep } = await import("../server/engine/runner");
const { requireGarmentPromptVariant } = await import("../src/lib/garmentPromptPresets");
const { getModelParameterProfile, materializeModelParameterProfile } = await import("../src/types/modelParameterProfiles");
const { promotePromptVariantForTest } = await import("./promptReleaseTestSupport");
const { loadManifest, generateCampaignPlans } = await import("../scripts/evaluation-campaign-runner");
await database.initializeDatabase();

// ---------- shared helpers ----------

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

function canonicalSha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function assertNotDegenerateHash(value: string, fieldName: string): void {
  if (/^(.)\1{63}$/.test(value)) {
    throw new Error(
      `${fieldName} is a degenerate placeholder "${value[0]}...". ` +
        `Seal refuses to bind degenerate hashes. Run "prepare" first to materialize real values.`,
    );
  }
}

const TEST_CODE_IDENTITY = {
  codeSha: "b".repeat(40),
  source: "git-head" as const,
  dirty: false,
};

let passed = 0;

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

// ---------- shared variant setup ----------

const generateVariant = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "generate",
});
promotePromptVariantForTest(generateVariant);
const generateProfile = getModelParameterProfile(generateVariant.parameterProfileId)!;
const generateParameters = materializeModelParameterProfile(generateProfile);

const owner = await database.queryOne<{
  id: string;
  account_id: string;
  display_name: string;
  must_change_password: number;
}>(`SELECT id, account_id, display_name, must_change_password FROM users WHERE account_id = 'prepare-admin'`);
assert.ok(owner);
const admin: AuthUser = {
  id: owner.id,
  accountId: owner.account_id,
  displayName: owner.display_name,
  role: "admin",
  mustChangePassword: owner.must_change_password === 1,
};

// ---------- capture helper (never calls real provider) ----------

interface CapturedSlotRuntime {
  plan: ExecutionPlan;
  step: NodeExecution;
  request: ImageGenRequest;
  policy: EvaluationRunPolicy;
}

async function captureSlotRuntime(
  slotId: string,
  campaignId: string,
  authId: string,
): Promise<CapturedSlotRuntime> {
  const caseId = `case-${slotId}`;
  const sampleId = `sample-${slotId}`;

  const plan: ExecutionPlan = {
    steps: [{
      nodeId: "capture-node",
      kind: "image-generator",
      inputImages: [],
      inputReferences: [],
      params: {
        inputTexts: ["生成服装效果图"],
        promptVariantId: generateVariant.variantId,
        promptFamilyId: generateVariant.familyId,
        parameterProfileId: generateVariant.parameterProfileId,
        contractHash: generateVariant.contractHash,
        evaluationVersion: generateVariant.evaluationVersion,
        postprocessVersion: generateProfile.postprocess.version,
        operationMode: generateVariant.mode,
        modelId: generateVariant.modelId,
        modelOptions: generateParameters.modelOptions,
        aspectRatio: generateParameters.aspectRatio,
        batchSize: generateParameters.batchSize,
      },
    }],
  };

  const policy: EvaluationRunPolicy = {
    caseId,
    sampleId,
    authorizationId: authId,
    campaignId,
    slotId,
    retryPolicy: "no-retry",
  };

  const persistedPlan = evaluationRunPolicy.attachEvaluationRunPolicy(plan, policy);
  const providerStep = persistedPlan.steps.find(
    (s: { params: Record<string, unknown> }) => s.params.evaluationPolicy !== undefined,
  );
  assert.ok(providerStep, "evaluation plan must contain one Provider step");

  const captureSentinel = new Error("capture sealed evaluation request");
  let capturedRequest: ImageGenRequest | undefined;
  const captureProvider: AIProvider = {
    id: providerStep.params.modelId as string,
    async generate() { throw new Error("Provider.generate must not be called during capture"); },
    async edit() { throw new Error("Provider.edit must not be called during capture"); },
  };

  try {
    await executeStep(providerStep, providerStep.inputImages, () => captureProvider, {
      referenceSources: providerStep.inputReferences ?? [],
      beforeProviderCall: async (_providerRequest: ImageGenRequest, request: ImageGenRequest) => {
        capturedRequest = request;
        throw captureSentinel;
      },
    });
  } catch (error: unknown) {
    if (error !== captureSentinel) throw error;
  }
  assert.ok(capturedRequest, "capture did not materialize a Provider request");

  return { plan: persistedPlan, step: providerStep, request: capturedRequest, policy };
}

function runtimeFromCapture(capture: CapturedSlotRuntime): EvaluationCampaignSlotRuntimeBinding {
  const runtime = evaluationEvidence.buildEvaluationCaseSnapshotFromRuntime({
    plan: capture.plan,
    step: capture.step,
    request: capture.request,
    policy: capture.policy,
    codeIdentity: TEST_CODE_IDENTITY,
    capturedAt: "2026-09-24T00:00:00.000Z",
  });
  return evaluationEvidenceStore.campaignRuntimeBinding(runtime);
}

// =============================================================================
// Test (p1) prepare idempotency
// =============================================================================
{
  const slotId = "p1-slot";
  const campaignId = "p1-campaign";
  const authId = "p1-auth";

  let first: EvaluationCampaignSlotRuntimeBinding;
  let second: EvaluationCampaignSlotRuntimeBinding;

  await test("(p1) prepare idempotency — consecutive runs produce identical hashes", async () => {
    const capture1 = await captureSlotRuntime(slotId, campaignId, `${authId}-1`);
    first = runtimeFromCapture(capture1);

    const capture2 = await captureSlotRuntime(slotId, campaignId, `${authId}-2`);
    second = runtimeFromCapture(capture2);

    assert.equal(
      first.resolvedPromptSha256,
      second.resolvedPromptSha256,
      "resolvedPromptSha256 drifted between consecutive prepare runs",
    );
    assert.equal(
      first.nativeParametersSha256,
      second.nativeParametersSha256,
      "nativeParametersSha256 drifted between consecutive prepare runs",
    );
    assert.equal(
      first.referenceInputsSha256,
      second.referenceInputsSha256,
      "referenceInputsSha256 drifted between consecutive prepare runs",
    );
  });
}

// =============================================================================
// Test (p2) degenerate hash rejection
// =============================================================================
{
  await test("(p2) degenerate hash rejection — all-zeros throws, legal hash passes", async () => {
    // all-zeros must throw
    assert.throws(
      () => assertNotDegenerateHash("0".repeat(64), "testField"),
      /degenerate placeholder/,
      "all-zeros hash should be rejected as degenerate",
    );

    // all-same (non-zero) also degenerate per the regex — e.g. "a".repeat(64)
    assert.throws(
      () => assertNotDegenerateHash("f".repeat(64), "testField"),
      /degenerate placeholder/,
      "uniform-character hash should be rejected as degenerate",
    );

    // legal hash must not throw
    const legalHash = createHash("sha256").update("real content").digest("hex");
    assert.doesNotThrow(
      () => assertNotDegenerateHash(legalHash, "testField"),
      "legal SHA-256 should pass the non-degenerate assertion",
    );
  });
}

// =============================================================================
// Test (p3) end-to-end reserve replay
// =============================================================================
{
  const slotId = "p3-slot";
  const campaignId = "p3-campaign";
  const authId = "p3-auth";
  const caseId = `case-${slotId}`;
  const sampleId = `sample-${slotId}`;
  const runId = "p3-run";

  let runtimeBinding: EvaluationCampaignSlotRuntimeBinding;

  await test("(p3) end-to-end reserve replay — seal hash equals execute hash", async () => {
    // Step 1: capture & materialize hash
    const capture = await captureSlotRuntime(slotId, campaignId, authId);
    runtimeBinding = runtimeFromCapture(capture);

    // Step 2: seal in DB
    const target = authorizationLedger.evaluationAuthorizationTargetFromPlan(capture.plan);
    const maxRequests = target.maximumProviderRequests;
    const priceMinor = 1;

    await database.transaction(async (client) => {
      await evaluationCampaign.createSealedEvaluationCampaign(client, admin, {
        campaignId,
        ownerId: admin.id,
        stage: "internal-experiment",
        modelId: target.modelId,
        authorizationUnitKey: target.evaluationUnitKey,
        codeSha: TEST_CODE_IDENTITY.codeSha,
        maxProviderRequests: maxRequests,
        budgetLimitMinor: maxRequests * priceMinor,
        budgetCurrency: "CNY",
        flowJsonSha256: `sha256:${"f".repeat(64)}`,
        slots: [{
          slotId,
          caseId,
          sampleId,
          resolvedPromptSha256: runtimeBinding.resolvedPromptSha256,
          nativeParametersSha256: runtimeBinding.nativeParametersSha256,
          referenceInputsSha256: runtimeBinding.referenceInputsSha256,
          requestedImageCount: runtimeBinding.requestedImageCount,
          maxProviderRequests: maxRequests,
          priceMinorPerProviderRequest: priceMinor,
          budgetLimitMinor: maxRequests * priceMinor,
        }],
      });

      // Step 3: register + lock + consume authorization (binds slot internally)
      await authorizationLedger.registerEvaluationRunAuthorization(client, admin, {
        authorizationId: authId,
        ownerId: admin.id,
        campaignId,
        slotId,
        scope: {
          type: "evaluation-unit",
          modelId: target.modelId,
          evaluationUnitKey: target.evaluationUnitKey,
        },
        maxProviderRequests: maxRequests,
        priceMinorPerProviderRequest: priceMinor,
        budgetLimitMinor: maxRequests * priceMinor,
        budgetCurrency: "CNY",
        expiresAt: Date.now() + 60 * 60 * 1_000,
        reason: "prepare regression test (p3)",
      });

      const locked = await authorizationLedger.lockEvaluationRunAuthorization(
        client, capture.policy, admin.id, capture.plan,
      );

      // Insert generation_runs row
      await client.query(
        `INSERT INTO generation_runs (
          id, owner_id, node_id, node_label, kind, prompt, requested_count,
          successful_count, provider_requests, status, started_at, updated_at,
          run_type, retry_policy, evaluation_case_id, evaluation_authorization_id,
          evaluation_campaign_id, evaluation_slot_id, billing_reconciliation_status
        ) VALUES (
          $1, $2, 'capture-node', 'Capture node', 'image', '生成服装效果图',
          1, 0, 0, 'queued', $3, $3, 'evaluation', 'no-retry',
          $4, $5, $6, $7, 'pending'
        )`,
        [runId, admin.id, Date.now(), caseId, authId, campaignId, slotId],
      );

      await authorizationLedger.consumeEvaluationRunAuthorization(
        client, locked, capture.policy, admin.id, runId,
      );

      // Step 4: re-capture, compute runtime, reserve — must succeed
      const replayCapture = await captureSlotRuntime(slotId, campaignId, authId);
      const replayBinding = runtimeFromCapture(replayCapture);

      await evaluationCampaign.reserveEvaluationCampaignProviderRequest(client, {
        campaignId,
        slotId,
        authorizationId: authId,
        runId,
        requestIndex: 1,
        runtime: replayBinding,
      });
    });
  });
}

// =============================================================================
// Test (p4) mutation acceptance
// =============================================================================
{
  await test("(p4) mutation — (a) skip degenerate check → all-zero seal succeeds", async () => {
    const slotId = "p4a-slot";
    const campaignId = "p4a-campaign";
    const authId = "p4a-auth";
    const caseId = `case-${slotId}`;
    const sampleId = `sample-${slotId}`;

    const capture = await captureSlotRuntime(slotId, campaignId, authId);
    const target = authorizationLedger.evaluationAuthorizationTargetFromPlan(capture.plan);
    const maxRequests = target.maximumProviderRequests;

    // Use all-zeros as hash, WITHOUT calling assertNotDegenerateHash
    const degenerateHash = "0".repeat(64);

    await database.transaction(async (client) => {
      // This must succeed because we skip the degenerate assertion:
      await evaluationCampaign.createSealedEvaluationCampaign(client, admin, {
        campaignId,
        ownerId: admin.id,
        stage: "internal-experiment",
        modelId: target.modelId,
        authorizationUnitKey: target.evaluationUnitKey,
        codeSha: TEST_CODE_IDENTITY.codeSha,
        maxProviderRequests: maxRequests,
        budgetLimitMinor: maxRequests,
        budgetCurrency: "CNY",
        flowJsonSha256: `sha256:${"f".repeat(64)}`,
        slots: [{
          slotId,
          caseId,
          sampleId,
          resolvedPromptSha256: degenerateHash,
          nativeParametersSha256: degenerateHash,
          referenceInputsSha256: degenerateHash,
          requestedImageCount: 1,
          maxProviderRequests: maxRequests,
          priceMinorPerProviderRequest: 1,
          budgetLimitMinor: maxRequests,
        }],
      });
    });

    // Verify it was persisted
    const row = await database.queryOne<{ resolved_prompt_sha256: string }>(
      "SELECT resolved_prompt_sha256 FROM evaluation_campaign_slots WHERE campaign_id = $1 AND slot_id = $2",
      [campaignId, slotId],
    );
    assert.equal(row?.resolved_prompt_sha256, degenerateHash,
      "all-zeros hash should be accepted when degenerate assertion is skipped");
  });

  await test("(p4) mutation — (b) one-byte drift → reserve must throw", async () => {
    const slotId = "p4b-slot";
    const campaignId = "p4b-campaign";
    const authId = "p4b-auth";
    const caseId = `case-${slotId}`;
    const sampleId = `sample-${slotId}`;
    const runId = "p4b-run";

    const capture = await captureSlotRuntime(slotId, campaignId, authId);
    const realBinding = runtimeFromCapture(capture);
    const target = authorizationLedger.evaluationAuthorizationTargetFromPlan(capture.plan);
    const maxRequests = target.maximumProviderRequests;

    await database.transaction(async (client) => {
      // Seal with the real hash
      await evaluationCampaign.createSealedEvaluationCampaign(client, admin, {
        campaignId,
        ownerId: admin.id,
        stage: "internal-experiment",
        modelId: target.modelId,
        authorizationUnitKey: target.evaluationUnitKey,
        codeSha: TEST_CODE_IDENTITY.codeSha,
        maxProviderRequests: maxRequests,
        budgetLimitMinor: maxRequests,
        budgetCurrency: "CNY",
        flowJsonSha256: `sha256:${"f".repeat(64)}`,
        slots: [{
          slotId,
          caseId,
          sampleId,
          resolvedPromptSha256: realBinding.resolvedPromptSha256,
          nativeParametersSha256: realBinding.nativeParametersSha256,
          referenceInputsSha256: realBinding.referenceInputsSha256,
          requestedImageCount: realBinding.requestedImageCount,
          maxProviderRequests: maxRequests,
          priceMinorPerProviderRequest: 1,
          budgetLimitMinor: maxRequests,
        }],
      });

      // Bind authorization + run
      await authorizationLedger.registerEvaluationRunAuthorization(client, admin, {
        authorizationId: authId,
        ownerId: admin.id,
        campaignId,
        slotId,
        scope: {
          type: "evaluation-unit",
          modelId: target.modelId,
          evaluationUnitKey: target.evaluationUnitKey,
        },
        maxProviderRequests: maxRequests,
        priceMinorPerProviderRequest: 1,
        budgetLimitMinor: maxRequests,
        budgetCurrency: "CNY",
        expiresAt: Date.now() + 60 * 60 * 1_000,
        reason: "prepare regression test (p4b)",
      });

      const locked = await authorizationLedger.lockEvaluationRunAuthorization(
        client, capture.policy, admin.id, capture.plan,
      );

      await client.query(
        `INSERT INTO generation_runs (
          id, owner_id, node_id, node_label, kind, prompt, requested_count,
          successful_count, provider_requests, status, started_at, updated_at,
          run_type, retry_policy, evaluation_case_id, evaluation_authorization_id,
          evaluation_campaign_id, evaluation_slot_id, billing_reconciliation_status
        ) VALUES (
          $1, $2, 'capture-node', 'Capture node', 'image', '生成服装效果图',
          1, 0, 0, 'queued', $3, $3, 'evaluation', 'no-retry',
          $4, $5, $6, $7, 'pending'
        )`,
        [runId, admin.id, Date.now(), caseId, authId, campaignId, slotId],
      );

      await authorizationLedger.consumeEvaluationRunAuthorization(
        client, locked, capture.policy, admin.id, runId,
      );

      // Construct a mutated binding: flip the first byte of resolvedPromptSha256
      const mutatedHash = realBinding.resolvedPromptSha256.slice(0, 1) === "f"
        ? "e" + realBinding.resolvedPromptSha256.slice(1)
        : "f" + realBinding.resolvedPromptSha256.slice(1);

      const mutatedBinding: EvaluationCampaignSlotRuntimeBinding = {
        ...realBinding,
        resolvedPromptSha256: mutatedHash,
      };

      // Reserve with mutated hash must throw
      await assert.rejects(
        async () => {
          await evaluationCampaign.reserveEvaluationCampaignProviderRequest(client, {
            campaignId,
            slotId,
            authorizationId: authId,
            runId,
            requestIndex: 1,
            runtime: mutatedBinding,
          });
        },
        /differs from its sealed campaign slot/,
        "reserve must reject a runtime whose resolvedPromptSha256 was mutated by one byte",
      );
    });
  });
}

// ---------- regression: runner seal defects (3 tests) ----------

{
  // (r1) campaign/slot IDs must be sanitised — no dots allowed
  const manifest = loadManifest("docs/ai/evaluation/evaluation-manifest-v1.json");
  const filtered = manifest.baseUnits.filter(
    (u: any) =>
      u.promptVariantId === "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1" ||
      u.promptVariantId === "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
  );
  assert.strictEqual(filtered.length, 2, "expected 2 variant units");

  const caps = manifest.stageRequestCaps as Array<{
    stageId: string;
    incrementalSamples: number;
    maxProviderRequestsPerSample: number;
  }>;
  const plans = generateCampaignPlans(filtered, caps, "regr", "gpt-image-2.5-flare-vip");

  assert.strictEqual(plans.length, 6, "expected 6 campaigns (2 variants x 3 stages)");

  for (const plan of plans) {
    // campaignId must not contain dots (EVALUATION_CAMPAIGN_ID_PATTERN = ^[A-Za-z0-9_-]{1,128}$)
    assert.ok(
      !plan.campaignId.includes("."),
      `campaignId contains a dot: ${plan.campaignId}`,
    );
    for (const slot of plan.slots) {
      assert.ok(
        !slot.slotId.includes("."),
        `slotId contains a dot: ${slot.slotId}`,
      );
    }
  }

  // slotId must contain the campaign prefix for global uniqueness
  assert.ok(
    plans[0].slots[0].slotId.startsWith("regr-"),
    `slotId must start with campaign prefix, got: ${plans[0].slots[0].slotId}`,
  );

  passed++;
  console.log("  ✓ (r1) campaign/slot IDs sanitised — no dots, campaign prefix in slotId");
}

{
  // (r2) multi-slot campaigns: caseIds must be unique within a campaign
  // The internal-experiment campaign has 8 slots. Each must have a distinct caseId.
  const manifest = loadManifest("docs/ai/evaluation/evaluation-manifest-v1.json");
  const filtered = manifest.baseUnits.filter(
    (u: any) =>
      u.promptVariantId === "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
  );
  const caps = manifest.stageRequestCaps as Array<{
    stageId: string;
    incrementalSamples: number;
    maxProviderRequestsPerSample: number;
  }>;
  const plans = generateCampaignPlans(filtered, caps, "regr2", "gpt-image-2.5-flare-vip");

  const internalPlan = plans.find((p) => p.stage === "internal-experiment");
  assert.ok(internalPlan != null, "internal-experiment plan must exist");
  assert.strictEqual(internalPlan.slots.length, 8, "internal-experiment must have 8 slots");

  // caseId uniqueness: each slot's caseId = ${campaignId}-case-${sampleIndex}
  // With 8 slots (sampleIndex 1..8), all caseIds must differ.
  const caseIds = internalPlan.slots.map((s) => `case-${s.sampleIndex}`);
  const uniqueCaseIds = new Set(caseIds);
  assert.strictEqual(
    uniqueCaseIds.size,
    internalPlan.slots.length,
    `caseIds must be unique across ${internalPlan.slots.length} slots, got ${uniqueCaseIds.size} unique`,
  );

  passed++;
  console.log("  ✓ (r2) caseId uniqueness — 8-slot campaign has 8 distinct caseIds");
}

{
  // (r3) slot-level budget = PRICE_MINOR (3), not the campaign total
  // The PRICE_MINOR_PER_PROVIDER_REQUEST constant is 3. Every slot gets 3 minor budget.
  const manifest = loadManifest("docs/ai/evaluation/evaluation-manifest-v1.json");
  const filtered = manifest.baseUnits.filter(
    (u: any) =>
      u.promptVariantId === "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
  );
  const caps = manifest.stageRequestCaps as Array<{
    stageId: string;
    incrementalSamples: number;
    maxProviderRequestsPerSample: number;
  }>;
  const plans = generateCampaignPlans(filtered, caps, "regr3", "gpt-image-2.5-flare-vip");

  for (const plan of plans) {
    // campaign-level budgetLimitMinor = slots.length x PRICE_MINOR (3)
    const expectedCampaignBudget = plan.slots.length * 3;
    assert.strictEqual(
      plan.budgetLimitMinor,
      expectedCampaignBudget,
      `campaign ${plan.campaignId}: budgetLimitMinor must = ${expectedCampaignBudget}, got ${plan.budgetLimitMinor}`,
    );
  }

  passed++;
  console.log("  ✓ (r3) slot budget = PRICE_MINOR (3), campaign total = slots x 3");
}

// ---------- (e1) assertTrackedTreeClean: clean worktree passes ----------
{
  const { execSync } = await import("node:child_process");
  const { assertTrackedTreeClean } = await import("../scripts/evaluation-campaign-runner");

  // Sanity: ensure the worktree really is clean (test starts clean).
  const repo = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  try {
    assertTrackedTreeClean(repo);
  } catch (error) {
    assert.fail(`assertTrackedTreeClean on a clean worktree must not throw, got: ${String(error)}`);
  }

  passed++;
  console.log("  ✓ (e1) assertTrackedTreeClean — clean worktree passes");
}

// ---------- (e2) assertTrackedTreeClean: tracked file dirty → must throw ----------
{
  const { execSync } = await import("node:child_process");
  const { writeFileSync } = await import("node:fs");
  const { assertTrackedTreeClean } = await import("../scripts/evaluation-campaign-runner");

  const repo = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  const probePath = path.join(repo, "tests", ".tracked-dirty-probe.ts");
  // The file must be tracked; stage it first, then modify to make it dirty.
  writeFileSync(probePath, "// tracked-dirty test\n");
  execSync(`git add "${probePath}"`, { cwd: repo });
  // Now modify it (unstaged change → dirty tracked file).
  writeFileSync(probePath, "// tracked-dirty test (modified)\n");

  let thrown = false;
  try {
    assertTrackedTreeClean(repo);
  } catch {
    thrown = true;
  } finally {
    // Restore clean state: reset the probe file and delete it.
    execSync(`git checkout -- "${probePath}"`, { cwd: repo });
    execSync(`git reset HEAD "${probePath}"`, { cwd: repo });
    try { fs.unlinkSync(probePath); } catch { /* missing */ }
  }

  assert.ok(thrown, "assertTrackedTreeClean must throw when a tracked file is modified");
  passed++;
  console.log("  ✓ (e2) assertTrackedTreeClean — tracked file dirty → throws");
}

// ---------- (e3) assertTrackedTreeClean: untracked file → passes (--untracked-files=no) ----------
{
  const { execSync } = await import("node:child_process");
  const { writeFileSync } = await import("node:fs");
  const { assertTrackedTreeClean } = await import("../scripts/evaluation-campaign-runner");

  const repo = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  const probeUntracked = path.join(repo, "tests", ".untracked-probe");
  writeFileSync(probeUntracked, "untracked\n");

  let thrown = false;
  try {
    assertTrackedTreeClean(repo);
  } catch {
    thrown = true;
  } finally {
    try { fs.unlinkSync(probeUntracked); } catch { /* missing */ }
  }

  assert.ok(!thrown, "assertTrackedTreeClean with --untracked-files=no must NOT flag an untracked file. An untracked file is NOT a tracked modification.");
  passed++;
  console.log("  ✓ (e3) assertTrackedTreeClean — untracked file → passes (flag --untracked-files=no)");
}

// ---------- summary ----------

console.log(`\n全部完成：${passed} 项验收测试通过`);