/**
 * Pre-flight integration test: POST /api/run-plan for all 66 v8rel6 slots against a
 * real Express server backed by the test database. This verifies every 400/403/409
 * gate that the mocked execute tests never covered (clientRequestId pattern/length,
 * project lifecycle, auth middleware, request body parsing, runQueue admission).
 *
 * Design:
 *  - Test DB only (*_test suffix; resetPostgresTestDatabase enforces local-only).
 *  - Server subprocess inherits DATABASE_URL → test DB, zero collision risk with
 *    the development garment_canvas database.
 *  - Admin session created via the production createSession(), not a custom bypass.
 *  - Each POST body mirrors the real runner's submitEvaluationRun payload.
 *
 * SERIAL_TEST_FILES: must be registered in scripts/test-suite-parallel.mjs.
 */

import assert from "node:assert/strict";
import { spawn, execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { randomUUID } from "node:crypto";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";
import { createSession } from "../server/lib/auth";
import {
  createSealedEvaluationCampaign,
  computeFlowJsonSha256,
} from "../server/lib/evaluationCampaign";
import {
  registerEvaluationRunAuthorization,
  type EvaluationAuthorizationRegistration,
} from "../server/lib/evaluationAuthorizationLedger";
import { loadManifest, generateCampaignPlans, evaluationUnitKeyFromFlow } from "../scripts/evaluation-campaign-runner";
import { CLIENT_REQUEST_ID_PATTERN } from "../server/engine/runQueue/types";

const database = await import("../server/lib/database");

// ---------- constants ----------

let ADMIN_ID = "WjJgiF7JZsKb"; // overwritten after DB lookup
const ADMIN_ACCOUNT_ID = "admin";
const TEST_ADMIN_PASSWORD_HASH =
  "$2b$10$testaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; // bcrypt placeholder
const SERVER_PORT = 30999; // dedicated test port, never conflicts with 3001 dev or 5173 vite
const BASE_URL = `http://127.0.0.1:${SERVER_PORT}`;
const PREFIX = "preflight";

// Minimal project flows — each has exactly 1 image-generator node with 1 upstream text node.
// The text→image-generator edge uses targetHandle="prompt" as required by INV-1.
const GENERATE_FLOW = {
  schemaVersion: 8,
  nodes: [
    {
      id: `gen-node-${randomUUID().slice(0, 8)}`,
      type: "image-generator",
      position: { x: 100, y: 100 },
      data: {
        kind: "image-generator",
        label: "generate",
        modelId: "gpt-image-2.5-flare-vip",
        promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
        postprocessVersion: "fit-contain-dominant-webp-v1",
        aspectRatio: "3:4",
        batchSize: 1,
        modelOptions: { size: "1536x2048" },
      },
      width: 200,
      height: 100,
    },
    {
      id: `gen-text-${randomUUID().slice(0, 8)}`,
      type: "text",
      position: { x: 100, y: 0 },
      data: { kind: "text", label: "prompt", text: "preflight test prompt" },
      width: 200,
      height: 80,
    },
  ],
  edges: [
    {
      id: `gen-edge-${randomUUID().slice(0, 8)}`,
      source: "", // filled after nodes are created
      target: "", // filled after nodes are created
      sourceHandle: "text",
      targetHandle: "prompt",
    },
  ],
};
// Fill edge source/target with the actual node IDs
GENERATE_FLOW.edges[0].source = GENERATE_FLOW.nodes[1].id;
GENERATE_FLOW.edges[0].target = GENERATE_FLOW.nodes[0].id;

const EDIT_FLOW = {
  schemaVersion: 8,
  nodes: [
    {
      id: `edit-node-${randomUUID().slice(0, 8)}`,
      type: "image-generator",
      position: { x: 100, y: 100 },
      data: {
        kind: "image-generator",
        label: "edit",
        modelId: "gpt-image-2.5-flare-vip",
        promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
        aspectRatio: "3:4",
        batchSize: 1,
      },
      width: 200,
      height: 100,
    },
    {
      id: `edit-text-${randomUUID().slice(0, 8)}`,
      type: "text",
      position: { x: 100, y: 0 },
      data: { kind: "text", label: "prompt", text: "preflight test prompt (edit)" },
      width: 200,
      height: 80,
    },
  ],
  edges: [
    {
      id: `edit-edge-${randomUUID().slice(0, 8)}`,
      source: "",
      target: "",
      sourceHandle: "text",
      targetHandle: "prompt",
    },
  ],
};
EDIT_FLOW.edges[0].source = EDIT_FLOW.nodes[1].id;
EDIT_FLOW.edges[0].target = EDIT_FLOW.nodes[0].id;

// ---------- helpers ----------

async function waitForServer(url: string, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return;
    } catch {
      // server not ready yet
    }
    await sleep(500);
  }
  // Dump server stderr for debugging
  if (serverStderr) console.error(`\nServer stderr:\n${serverStderr.slice(-2000)}`);
  throw new Error(`Server did not become healthy within ${timeoutMs}ms at ${url}`);
}

// ---------- main ----------

console.log("\n--- campaign-runner-preflight: starting ---\n");

await resetPostgresTestDatabase();
await database.initializeDatabase();

// 1. Get or create admin user (initializeDatabase may already seed one)
  const existingAdmin = await database.queryOne<{ id: string }>(
    `SELECT id FROM users WHERE account_id = $1`,
    [ADMIN_ACCOUNT_ID],
  );
  let adminId = existingAdmin?.id;
  if (!adminId) {
    await database.transaction(async (client) => {
      await client.query(
        `INSERT INTO users (id, account_id, password_hash, display_name, role, must_change_password, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'admin', 0, NOW(), NOW())`,
        [ADMIN_ID, ADMIN_ACCOUNT_ID, TEST_ADMIN_PASSWORD_HASH, "Test Admin"],
      );
    });
    adminId = ADMIN_ID;
  }
  ADMIN_ID = adminId;
  // Ensure must_change_password = 0 (initializeDatabase seeds with must_change_password = 1)
  await database.transaction(async (client) => {
    await client.query(`UPDATE users SET must_change_password = 0 WHERE id = $1`, [adminId]);
  });
  console.log(`  admin user: ${adminId}`);

// 2. Create admin session
const session = await createSession(adminId, { markExistingAsReplaced: false });
console.log(`  admin session created, token length=${session.token.length}`);

// 3. Seed 2 saved projects (generate + edit)
const GEN_PROJECT_ID = "PTESTGEN01";
const EDIT_PROJECT_ID = "PTESTEDIT1";

await database.transaction(async (client) => {
  await client.query(
    `INSERT INTO projects (id, owner_id, name, flow_json, lifecycle, created_at, updated_at)
     VALUES ($1, $2, 'preflight-generate', $3, 'saved', NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET flow_json = $3, lifecycle = 'saved'`,
    [GEN_PROJECT_ID, ADMIN_ID, JSON.stringify(GENERATE_FLOW)],
  );
  await client.query(
    `INSERT INTO projects (id, owner_id, name, flow_json, lifecycle, created_at, updated_at)
     VALUES ($1, $2, 'preflight-edit', $3, 'saved', NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET flow_json = $3, lifecycle = 'saved'`,
    [EDIT_PROJECT_ID, ADMIN_ID, JSON.stringify(EDIT_FLOW)],
  );
});
console.log(`  projects seeded: ${GEN_PROJECT_ID} (generate), ${EDIT_PROJECT_ID} (edit)`);

// 4. Build 66 slot plans (generate + edit, the two active evaluation variants)
const manifest = loadManifest("docs/ai/evaluation/evaluation-manifest-v1.json");
const TARGET_VARIANTS = new Set([
  "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
  "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
]);
const filtered = manifest.baseUnits.filter(
  (u) => TARGET_VARIANTS.has(u.promptVariantId),
);
// Architect mandated assertion: the filtered set must exactly cover the authorized
// variant collection. A partial or missing set is a silent coverage gap.
const coveredVariants = new Set(filtered.map((u) => u.promptVariantId));
assert.deepStrictEqual(
  coveredVariants,
  TARGET_VARIANTS,
  `preflight variant coverage must exactly match the authorized set. Covered: ${[...coveredVariants].join(", ")}. Expected: ${[...TARGET_VARIANTS].join(", ")}.`,
);
const caps = manifest.stageRequestCaps as Array<{
  stageId: string;
  incrementalSamples: number;
  maxProviderRequestsPerSample: number;
}>;
const plans = generateCampaignPlans(filtered, caps, PREFIX, "gpt-image-2.5-flare-vip");

const CODE_SHA = execSync("git rev-parse HEAD", { encoding: "utf8", cwd: process.cwd() }).trim();
if (!/^[0-9a-f]{40}$/.test(CODE_SHA)) {
  throw new Error(`invalid git SHA: ${CODE_SHA}`);
}
const PRICE_MINOR = 3;

// 5. Seed campaigns + slots + authorizations
interface SlotItem {
  slotId: string;
  campaignId: string;
  caseId: string;
  sampleId: string;
  unitKey: string;
  projectId: string;
  modelId: string;
}

const allSlots: SlotItem[] = [];
const adminUser = { id: ADMIN_ID, accountId: ADMIN_ACCOUNT_ID, displayName: "Test Admin", role: "admin" as const, mustChangePassword: false };

for (const plan of plans) {
  const isGenerate = plan.campaignId.includes("generate-v1");
  const projectId = isGenerate ? GEN_PROJECT_ID : EDIT_PROJECT_ID;
  const flow = isGenerate ? GENERATE_FLOW : EDIT_FLOW;
  const unit = filtered.find((u) => plan.campaignId.includes(u.unitId.replace(/\./g, "-")));
  if (!unit) throw new Error(`unit not found for campaign ${plan.campaignId}`);

  // Seed the ledger with the SAME key the route will compute at execute time.
  // The route reads projects.flow_json → buildExecutionPlan →
  // evaluationAuthorizationTargetFromPlan (12-field canonicalJson envelope).
  // The static manifest key (unit.evaluationUnitKey, 9-field JSON.stringify) can
  // never equal it — that was the unitKey defect. Deriving the key here from the
  // exact flow seeded into the project makes seal-key == route-key by construction.
  const envelopeKey = evaluationUnitKeyFromFlow(flow);

  // ——— DUMMY_HASH IS A PAID-CALL PREVENTION MECHANISM ———
  // All 33 hashes below are "a" × 64. Reserve path compares slot.resolved_prompt_sha256
  // against runtime hash → mismatch → throw → provider.generate/edit is NEVER called.
  // If you replace DUMMY_HASH with a real hash of the unit's nativeParameters, the
  // reserve check will match and the will call the real   provider → real charge.
  // Do NOT replace DUMMY_HASH in this test. The p3 end-to-end replay test already
  // covers the reserve path with real hashes."
  const DUMMY_HASH = "a".repeat(64);

  const slotPlans = plan.slots.map((s, i) => ({
    slotId: s.slotId,
    caseId: `${plan.campaignId}-case-${i + 1}`,
    sampleId: `${plan.campaignId}-case-${i + 1}-sample-1`,
    resolvedPromptSha256: DUMMY_HASH,
    nativeParametersSha256: DUMMY_HASH,
    referenceInputsSha256: DUMMY_HASH,
    requestedImageCount: 1,
    maxProviderRequests: 1,
    priceMinorPerProviderRequest: PRICE_MINOR,
    budgetLimitMinor: PRICE_MINOR,
  }));

  await database.transaction(async (client) => {
    await createSealedEvaluationCampaign(client, adminUser, {
      campaignId: plan.campaignId,
      ownerId: ADMIN_ID,
      stage: plan.stage,
      modelId: "gpt-image-2.5-flare-vip",
      authorizationUnitKey: envelopeKey,
      codeSha: CODE_SHA,
      maxProviderRequests: plan.slots.length,
      budgetLimitMinor: plan.slots.length * PRICE_MINOR,
      budgetCurrency: "USD",
      // 裁决 C 守卫按 projects.flow_json 实算比对——必须填 seed 进库的同一字节的真实 hash
      // （JSON.stringify(flow) 与 L188-198 的 seed 完全一致）。假 hash 会让守卫 409，
      // 三态断言（33 PASS）全灭。付费防护在 reserve 路径的 DUMMY_HASH 失配，与此独立。
      flowJsonSha256: computeFlowJsonSha256(JSON.stringify(flow)),
      slots: slotPlans,
    });
  });

  for (const slotPlan of slotPlans) {
    const authInput: EvaluationAuthorizationRegistration = {
      authorizationId: `batch-62-${slotPlan.slotId}`,
      ownerId: ADMIN_ID,
      campaignId: plan.campaignId,
      slotId: slotPlan.slotId,
      scope: {
        type: "evaluation-unit",
        modelId: "gpt-image-2.5-flare-vip",
        evaluationUnitKey: envelopeKey,
      },
      maxProviderRequests: 1,
      priceMinorPerProviderRequest: PRICE_MINOR,
      budgetLimitMinor: PRICE_MINOR,
      budgetCurrency: "USD",
      expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
      reason: "preflight test",
    };

    await database.transaction(async (client) => {
      await registerEvaluationRunAuthorization(client, adminUser, authInput);
    });

    allSlots.push({
      slotId: slotPlan.slotId,
      campaignId: plan.campaignId,
      caseId: slotPlan.caseId,
      sampleId: slotPlan.sampleId,
      unitKey: envelopeKey,
      projectId,
      modelId: "gpt-image-2.5-flare-vip",
    });
  }
}

assert.strictEqual(allSlots.length, 66, "expected 66 slots (33 generate + 33 edit)");
console.log(`  seeded: ${plans.length} campaigns, ${allSlots.length} slots with active authorizations`);

// Verify authorizations exist in DB
const authCount = await database.queryOne<{ c: string }>(
  `SELECT COUNT(*) as c FROM evaluation_run_authorizations WHERE authorization_id LIKE 'batch-62-%'`,
);
assert.strictEqual(Number(authCount?.c ?? 0), 66);

// 6. Start server subprocess on test DB
const serverProc = spawn(
  "node",
  ["--import", "tsx", "server/index.ts"],
  {
    env: {
      ...process.env,
      NODE_ENV: "test",
      API_ONLY: "1",
      PORT: String(SERVER_PORT),
      ENABLE_PAID_EVALUATION_RUNS: "true",
      GARMENT_CANVAS_CODE_SHA: CODE_SHA,
      APIYI_API_KEY: "***",   // dummy — prevent provider from charging even if reserve match
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let serverStdout = "";
let serverStderr = "";
serverProc.stdout.on("data", (d) => { serverStdout += d.toString(); });
serverProc.stderr.on("data", (d) => { serverStderr += d.toString(); });

try {
  await waitForServer(BASE_URL);
  console.log("  server healthy");

  // 7. Pre-flight: POST /api/run-plan for all 33 slots
  let successCount = 0;
  let blockedCount = 0;
  const blockedErrors: string[] = [];
  const failures: string[] = [];

  for (const slot of allSlots) {
    const payload = {
      nodes: (slot.projectId === GEN_PROJECT_ID ? GENERATE_FLOW : EDIT_FLOW).nodes,
      edges: (slot.projectId === GEN_PROJECT_ID ? GENERATE_FLOW : EDIT_FLOW).edges,
      onlyNodeId: (slot.projectId === GEN_PROJECT_ID ? GENERATE_FLOW : EDIT_FLOW).nodes[0].id,
      includeDownstream: false,
      projectId: slot.projectId,
      clientRequestId: slot.slotId,
      evaluation: {
        caseId: slot.caseId,
        sampleId: slot.sampleId,
        authorizationId: `batch-62-${slot.slotId}`,
        campaignId: slot.campaignId,
        slotId: slot.slotId,
      },
    };

    const res = await fetch(`${BASE_URL}/api/run-plan`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `gc_session=${session.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 202) {
      successCount += 1;
    } else if (res.status === 400) {
      const body = await res.text().catch(() => "");
      blockedCount += 1;
      blockedErrors.push(`slot ${slot.slotId}: HTTP 400 — ${body.slice(0, 200)}`);
    } else {
      const body = await res.text().catch(() => "");
      failures.push(`slot ${slot.slotId}: HTTP ${res.status} — ${body.slice(0, 200)}`);
    }
  }

  console.log(`  results: ${successCount}/66 PASS, ${blockedCount}/66 BLOCKED`);

  // Three-state assertion (architect ruling 4, 62-edit-admission-ruling.md):
  // 33 generate slots → PASS (after Track A unitKey fix)
  // 33 edit slots    → BLOCKED with edit-reference-missing (Track B pending)
  // Total must be 66 — shrinking the filter is forbidden (it hides P0)
  assert.strictEqual(
    successCount,
    33,
    `expected 33 PASS (generate slots), got ${successCount}. Failures:\n${failures.join("\n")}`,
  );
  assert.strictEqual(
    blockedCount,
    33,
    `expected 33 BLOCKED (edit slots), got ${blockedCount}. Blocked:\n${blockedErrors.join("\n")}`,
  );
  assert.strictEqual(failures.length, 0, `unexpected non-400/202 responses:\n${failures.join("\n")}`);

  // BLOCKED must all be edit-reference-missing (not some other gate)
  const allEditReferenceMissing = blockedErrors.every((e) => e.includes("edit-reference-missing"));
  assert.ok(
    allEditReferenceMissing,
    `all 33 BLOCKED must have error code edit-reference-missing. Actual:\n${blockedErrors.join("\n")}`,
  );

  // 8. Assert generation_runs: exactly 33 rows (only PASS slots enqueue; BLOCKED never reach enqueue)
  const runCount = await database.queryOne<{ c: string }>(
    `SELECT COUNT(*) as c FROM generation_runs WHERE client_request_id LIKE '${PREFIX}%'`,
  );
  assert.strictEqual(Number(runCount?.c ?? 0), 33, "generation_runs should have exactly 33 rows (generate PASS only)");

  const distinctCount = await database.queryOne<{ c: string }>(
    `SELECT COUNT(DISTINCT client_request_id) as c FROM generation_runs WHERE client_request_id LIKE '${PREFIX}%'`,
  );
  assert.strictEqual(Number(distinctCount?.c ?? 0), 33, "all 33 client_request_ids must be distinct");

  console.log("  ✓ generation_runs: 33 rows, 33 distinct client_request_ids");

  // 9. EXPLICIT provider-not-called assertion (defense-in-depth)
  //    DUMMY_HASH = "a"×64 ensures reserve throws before provider is called,
  //    but this assertion makes the protection explicit — if it fails, the
  //    test has accidentally called the real provider.
  const providerReceipts = await database.queryOne<{ c: string }>(
    `SELECT COUNT(*) as c FROM evaluation_provider_request_evidence
     WHERE run_id IN (
       SELECT id FROM generation_runs WHERE client_request_id LIKE $1 || '%'
     )`,
    [PREFIX],
  );
  assert.strictEqual(
    Number(providerReceipts?.c ?? 0),
    0,
    "PROVIDER WAS CALLED — evaluation_provider_request_evidence should be 0 rows, DUMMY_HASH may have been replaced with real hash",
  );

  // Defense-in-depth: SUM(actual_cost_minor) must be 0
  const totalCost = await database.queryOne<{ s: string }>(
    `SELECT COALESCE(SUM(actual_cost_minor), 0) as s FROM evaluation_provider_request_evidence
     WHERE run_id IN (
       SELECT id FROM generation_runs WHERE client_request_id LIKE $1 || '%'
     )`,
    [PREFIX],
  );
  assert.strictEqual(
    Number(totalCost?.s ?? 0),
    0,
    "NON-ZERO COST — actual_cost_minor should be 0, provider may have been billed",
  );
  console.log("  ✓ provider not called: 0 generation_run_provider_requests");

  // 9. Negative verification: each clientRequestId passes CLIENT_REQUEST_ID_PATTERN
  //    (constructive proof: slotId = clientRequestId, both patterns are identical,
  //     and slotId was validated at seal time)
  for (const slot of allSlots) {
    assert.ok(
      CLIENT_REQUEST_ID_PATTERN.test(slot.slotId),
      `slotId "${slot.slotId}" must pass CLIENT_REQUEST_ID_PATTERN`,
    );
    assert.ok(slot.slotId.length <= 128, `slotId length ${slot.slotId.length} > 128`);
  }
  console.log("  ✓ all 66 clientRequestIds pass CLIENT_REQUEST_ID_PATTERN");

  // 10. Mutation variant 1: clientRequestId with campaignId + runSequence must be rejected
  //     (length > 128 for real slot IDs)
  {
    const oldCid = `eval-${allSlots[0].campaignId}-${allSlots[0].slotId}-1`;
    assert.ok(
      oldCid.length > 128 || !CLIENT_REQUEST_ID_PATTERN.test(oldCid),
      `old format clientRequestId should fail: ${oldCid} (len=${oldCid.length})`,
    );

    const res = await fetch(`${BASE_URL}/api/run-plan`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `gc_session=${session.token}`,
      },
      body: JSON.stringify({
        nodes: GENERATE_FLOW.nodes,
        edges: GENERATE_FLOW.edges,
        onlyNodeId: GENERATE_FLOW.nodes[0].id,
        includeDownstream: false,
        projectId: GEN_PROJECT_ID,
        clientRequestId: oldCid,
        evaluation: {
          caseId: allSlots[0].caseId,
          sampleId: allSlots[0].sampleId,
          authorizationId: `batch-62-${allSlots[0].slotId}`,
          campaignId: allSlots[0].campaignId,
          slotId: allSlots[0].slotId,
        },
      }),
    });
    assert.notStrictEqual(res.status, 202, `old clientRequestId format should be rejected, got ${res.status}`);
    console.log(`  ✓ mutation: old clientRequestId format rejected (HTTP ${res.status})`);
  }

  // 11. Mutation variant 2: clientRequestId with dots must be rejected
  {
    const dotCid = `${PREFIX}-slot-dotted.id.here-provider-probe-1`; // has dots
    const res = await fetch(`${BASE_URL}/api/run-plan`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `gc_session=${session.token}`,
      },
      body: JSON.stringify({
        nodes: GENERATE_FLOW.nodes,
        edges: GENERATE_FLOW.edges,
        onlyNodeId: GENERATE_FLOW.nodes[0].id,
        includeDownstream: false,
        projectId: GEN_PROJECT_ID,
        clientRequestId: dotCid,
        evaluation: {
          caseId: allSlots[0].caseId,
          sampleId: allSlots[0].sampleId,
          authorizationId: `batch-62-${allSlots[0].slotId}`,
          campaignId: allSlots[0].campaignId,
          slotId: allSlots[0].slotId,
        },
      }),
    });
    assert.notStrictEqual(res.status, 202, `dotted clientRequestId should be rejected, got ${res.status}`);
    console.log(`  ✓ mutation: dotted clientRequestId rejected (HTTP ${res.status})`);
  }

  // 12. Mutation variant 3: a paid case may not be replayed under a new request id.
  //     Route gate order (server/engine/runQueue/persist.ts):
  //       :130 clientRequestId idempotency  →  :142 evaluation_case_id conflict (409)
  //       →  :149 active-run cap  →  :160 lockEvaluationRunAuthorization
  //     So re-POSTing an already-enqueued caseId with a DIFFERENT clientRequestId must
  //     hit EvaluationCaseConflictError → 409 before any authorization is consulted.
  //     NOTE: a previous version of this block seeded ONE campaign with two slots sharing
  //     a caseId. That state is unreachable in production — createSealedEvaluationCampaign
  //     rejects duplicate caseIds at seal time (evaluationCampaign.ts:256-258) — so the
  //     block could only ever throw at seal instead of proving the route gate.
  {
    const replayCampaignId = `${PREFIX}-replay-campaign`;
    const replaySlotId = `${replayCampaignId}-slot-1`;
    const replayCaseId = `${replayCampaignId}-case-1`;
    const replayAuthId = `batch-62-replay`;
    const secondRequestId = `${replayCampaignId}-slot-2`; // fresh clientRequestId, same case
    const DUMMY_HASH = "a".repeat(64);

    await database.transaction(async (client) => {
      await createSealedEvaluationCampaign(client, adminUser, {
        campaignId: replayCampaignId,
        ownerId: ADMIN_ID,
        stage: "provider-probe",
        modelId: "gpt-image-2.5-flare-vip",
        authorizationUnitKey: evaluationUnitKeyFromFlow(GENERATE_FLOW),
        codeSha: CODE_SHA,
        maxProviderRequests: 1,
        budgetLimitMinor: PRICE_MINOR,
        budgetCurrency: "USD",
        // 裁决 C 守卫：真实 hash（GEN_PROJECT_ID seed 的是 JSON.stringify(GENERATE_FLOW)）
        flowJsonSha256: computeFlowJsonSha256(JSON.stringify(GENERATE_FLOW)),
        slots: [
          {
            slotId: replaySlotId,
            caseId: replayCaseId,
            sampleId: `${replayCaseId}-sample-1`,
            resolvedPromptSha256: DUMMY_HASH,
            nativeParametersSha256: DUMMY_HASH,
            referenceInputsSha256: DUMMY_HASH,
            requestedImageCount: 1,
            maxProviderRequests: 1,
            priceMinorPerProviderRequest: PRICE_MINOR,
            budgetLimitMinor: PRICE_MINOR,
          },
        ],
      });
    });

    await database.transaction(async (client) => {
      await registerEvaluationRunAuthorization(client, adminUser, {
        authorizationId: replayAuthId,
        ownerId: ADMIN_ID,
        campaignId: replayCampaignId,
        slotId: replaySlotId,
        scope: {
          type: "evaluation-unit",
          modelId: "gpt-image-2.5-flare-vip",
          evaluationUnitKey: evaluationUnitKeyFromFlow(GENERATE_FLOW),
        },
        maxProviderRequests: 1,
        priceMinorPerProviderRequest: PRICE_MINOR,
        budgetLimitMinor: PRICE_MINOR,
        budgetCurrency: "USD",
        expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
        reason: "preflight replay test",
      });
    });

    const replayBody = (clientRequestId: string) => JSON.stringify({
      nodes: GENERATE_FLOW.nodes,
      edges: GENERATE_FLOW.edges,
      onlyNodeId: GENERATE_FLOW.nodes[0].id,
      includeDownstream: false,
      projectId: GEN_PROJECT_ID,
      clientRequestId,
      evaluation: {
        caseId: replayCaseId,
        sampleId: `${replayCaseId}-sample-1`,
        authorizationId: replayAuthId,
        campaignId: replayCampaignId,
        slotId: replaySlotId,
      },
    });

    // First submission enqueues the paid case.
    const firstRes = await fetch(`${BASE_URL}/api/run-plan`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: `gc_session=${session.token}` },
      body: replayBody(replaySlotId),
    });
    assert.strictEqual(
      firstRes.status,
      202,
      `first submission of the replay case should enqueue, got ${firstRes.status}`,
    );

    // Same caseId, NEW clientRequestId → must be rejected as a case replay (409).
    const replayRes = await fetch(`${BASE_URL}/api/run-plan`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: `gc_session=${session.token}` },
      body: replayBody(secondRequestId),
    });
    assert.strictEqual(
      replayRes.status,
      409,
      `replaying an already-enqueued evaluation caseId under a new clientRequestId ` +
        `must be rejected with 409, got ${replayRes.status}`,
    );
    console.log(`  ✓ mutation: evaluation case replay under new clientRequestId rejected (HTTP ${replayRes.status})`);
  }

  // 13. Mutation variant 4: slot budget=72 is accepted at route layer (no budget gate there)
  {
    const bigBudgetCampaignId = `${PREFIX}-bigbudget-campaign`;
    const bigBudgetSlotId = `${bigBudgetCampaignId}-slot-1`;
    const bigBudgetCaseId = `${bigBudgetCampaignId}-case-1`;
    const bigBudgetAuthId = `batch-62-bigbudget`;
    const BIG_BUDGET = 72;
    const DUMMY_HASH = "a".repeat(64);

    await database.transaction(async (client) => {
      await createSealedEvaluationCampaign(client, adminUser, {
        campaignId: bigBudgetCampaignId,
        ownerId: ADMIN_ID,
        stage: "provider-probe",
        modelId: "gpt-image-2.5-flare-vip",
        authorizationUnitKey: evaluationUnitKeyFromFlow(GENERATE_FLOW),
        codeSha: CODE_SHA,
        maxProviderRequests: 1,
        budgetLimitMinor: BIG_BUDGET,
        budgetCurrency: "USD",
        // 裁决 C 守卫：真实 hash（GEN_PROJECT_ID seed 的是 JSON.stringify(GENERATE_FLOW)）
        flowJsonSha256: computeFlowJsonSha256(JSON.stringify(GENERATE_FLOW)),
        slots: [
          {
            slotId: bigBudgetSlotId,
            caseId: bigBudgetCaseId,
            sampleId: `${bigBudgetCaseId}-sample-1`,
            resolvedPromptSha256: DUMMY_HASH,
            nativeParametersSha256: DUMMY_HASH,
            referenceInputsSha256: DUMMY_HASH,
            requestedImageCount: 1,
            maxProviderRequests: 1,
            priceMinorPerProviderRequest: BIG_BUDGET,
            budgetLimitMinor: BIG_BUDGET,
          },
        ],
      });
    });

    await database.transaction(async (client) => {
      await registerEvaluationRunAuthorization(client, adminUser, {
        authorizationId: bigBudgetAuthId,
        ownerId: ADMIN_ID,
        campaignId: bigBudgetCampaignId,
        slotId: bigBudgetSlotId,
        scope: {
          type: "evaluation-unit",
          modelId: "gpt-image-2.5-flare-vip",
          evaluationUnitKey: evaluationUnitKeyFromFlow(GENERATE_FLOW),
        },
        maxProviderRequests: 1,
        priceMinorPerProviderRequest: BIG_BUDGET,
        budgetLimitMinor: BIG_BUDGET,
        budgetCurrency: "USD",
        expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
        reason: "preflight bigbudget test",
      });
    });

    // POST with budget=72 → route-layer should accept (202), the route doesn't check budget
    const bigRes = await fetch(`${BASE_URL}/api/run-plan`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `gc_session=${session.token}`,
      },
      body: JSON.stringify({
        nodes: GENERATE_FLOW.nodes,
        edges: GENERATE_FLOW.edges,
        onlyNodeId: GENERATE_FLOW.nodes[0].id,
        includeDownstream: false,
        projectId: GEN_PROJECT_ID,
        clientRequestId: bigBudgetSlotId,
        evaluation: {
          caseId: bigBudgetCaseId,
          sampleId: `${bigBudgetCaseId}-sample-1`,
          authorizationId: bigBudgetAuthId,
          campaignId: bigBudgetCampaignId,
          slotId: bigBudgetSlotId,
        },
      }),
    });
    assert.strictEqual(
      bigRes.status,
      202,
      `budget=72 slot should be accepted at route layer, got ${bigRes.status}`,
    );

    // DB query: verify budget was actually set to 72
    const slotBudgetRow = await database.queryOne<{ budget_limit_minor: number }>(
      `SELECT budget_limit_minor FROM evaluation_run_authorizations WHERE authorization_id = $1`,
      [bigBudgetAuthId],
    );
    assert.strictEqual(
      slotBudgetRow?.budget_limit_minor,
      BIG_BUDGET,
      `authorization budget_limit_minor should be ${BIG_BUDGET}, got ${slotBudgetRow?.budget_limit_minor}`,
    );
    console.log(`  ✓ mutation: budget=72 accepted at route layer, confirmed in DB`);
  }

  // 15. plan-equality gate: modified text must be rejected (dag.ts:229→247→runPlan.ts:232)
  {
    const genSlot = allSlots.find((s) => s.projectId === GEN_PROJECT_ID);
    assert.ok(genSlot, "at least one generate slot must exist");
    const modifiedNodes = JSON.parse(JSON.stringify(GENERATE_FLOW.nodes));
    const textNode = modifiedNodes.find((n: any) => n.data?.kind === "text");
    assert.ok(textNode, "text node must exist in GENERATE_FLOW");
    textNode.data.text = "MODIFIED TEXT — MUST DIFFER FROM STORED FLOW";
    const res = await fetch(BASE_URL + "/api/run-plan", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: "gc_session=" + session.token },
      body: JSON.stringify({
        nodes: modifiedNodes,
        edges: GENERATE_FLOW.edges,
        onlyNodeId: GENERATE_FLOW.nodes[0].id,
        includeDownstream: false,
        projectId: genSlot.projectId,
        clientRequestId: PREFIX + "-mutation-text-" + randomUUID().slice(0, 8),
        evaluation: {
          caseId: genSlot.caseId,
          sampleId: genSlot.sampleId,
          authorizationId: "batch-62-" + genSlot.slotId,
          campaignId: genSlot.campaignId,
          slotId: genSlot.slotId,
        },
      }),
    });
    assert.strictEqual(
      res.status,
      409,
      "plan-equality gate must reject modified text (expected 409, got " + res.status + ")",
    );
    console.log("  OK mutation: plan-equality gate rejects modified text (HTTP " + res.status + ")");
  }

  console.log(`\n✓ campaign-runner-preflight: three-state verified — 33 PASS (generate, unitKey chain fixed) + 33 BLOCKED (edit-reference-missing, Track B) + 5 mutation gates\n`);
} finally {
  serverProc.kill("SIGTERM");
  // give the subprocess a moment to exit, don't fail if it's already gone
  await sleep(500);
  try { serverProc.kill("SIGKILL"); } catch { /* already dead */ }
}

await database.closeDatabaseForTests();
console.log("campaign-runner-preflight tests passed");