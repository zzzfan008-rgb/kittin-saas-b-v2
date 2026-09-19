import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AuthUser } from "../server/lib/auth";
import type { EvaluationRunPolicy } from "../server/lib/evaluationRunPolicy";
import type { ExecutionPlan } from "../src/types/workflow";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-evaluation-authorization-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "evaluation-ledger-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const database = await import("../server/lib/database");
const ledger = await import("../server/lib/evaluationAuthorizationLedger");
const campaign = await import("../server/lib/evaluationCampaign");
await database.initializeDatabase();

const owner = await database.queryOne<{
  id: string;
  account_id: string;
  display_name: string;
  must_change_password: number;
}>(`
  SELECT id, account_id, display_name, must_change_password
  FROM users WHERE account_id = 'evaluation-ledger-admin'
`);
assert.ok(owner);
const admin: AuthUser = {
  id: owner.id,
  accountId: owner.account_id,
  displayName: owner.display_name,
  role: "admin",
  mustChangePassword: owner.must_change_password === 1,
};
const startedAt = Date.now();
let sequence = 0;

function plan(overrides: Record<string, unknown> = {}): ExecutionPlan {
  return {
    steps: [{
      nodeId: `evaluation-node-${++sequence}`,
      kind: "image",
      inputImages: [],
      inputReferences: [],
      params: {
        modelId: "gpt-image-2.5-flare-vip",
        operationMode: "generate",
        prompt: "零费用授权账本测试",
        promptVariantId: "fashion-lookbook-gpt-image-2.5-flare-vip-generate-v1",
        promptFamilyId: "fashion-lookbook",
        parameterProfileId: "gpt-image-2.5-flare-vip-lookbook-v1",
        contractHash: `sha256:${"1".repeat(64)}`,
        evaluationVersion: "1.0.0",
        postprocessVersion: "fit-pad-v1",
        aspectRatio: "1:1",
        batchSize: 1,
        modelOptions: { size: "2048x2048" },
        ...overrides,
      },
    }],
  };
}

function policy(caseId: string, authorizationId: string): EvaluationRunPolicy {
  return {
    caseId,
    sampleId: `${caseId}.sample-001`,
    authorizationId,
    campaignId: `campaign-${authorizationId}`,
    slotId: `slot-${authorizationId}`,
    retryPolicy: "no-retry",
  };
}

async function register(
  runPolicy: EvaluationRunPolicy,
  evaluationPlan: ExecutionPlan,
  options: {
    maxProviderRequests?: number;
    priceMinorPerProviderRequest?: number;
    budgetLimitMinor?: number;
    expiresAt?: number;
  } = {},
): Promise<ReturnType<typeof ledger.evaluationAuthorizationTargetFromPlan>> {
  const target = ledger.evaluationAuthorizationTargetFromPlan(evaluationPlan);
  const maxProviderRequests = options.maxProviderRequests ?? target.maximumProviderRequests;
  const priceMinorPerProviderRequest = options.priceMinorPerProviderRequest ?? 7;
  const budgetLimitMinor = options.budgetLimitMinor
    ?? maxProviderRequests * priceMinorPerProviderRequest;
  await database.transaction(async (client) => {
    await campaign.createSealedEvaluationCampaign(client, admin, {
      campaignId: runPolicy.campaignId,
      ownerId: owner.id,
      stage: "internal-experiment",
      modelId: target.modelId,
      authorizationUnitKey: target.evaluationUnitKey,
      codeSha: "e".repeat(40),
      maxProviderRequests,
      budgetLimitMinor,
      budgetCurrency: "CNY",
      slots: [{
        slotId: runPolicy.slotId,
        caseId: runPolicy.caseId,
        sampleId: runPolicy.sampleId,
        resolvedPromptSha256: "a".repeat(64),
        nativeParametersSha256: "b".repeat(64),
        referenceInputsSha256: "c".repeat(64),
        requestedImageCount: target.maximumProviderRequests,
        maxProviderRequests,
        priceMinorPerProviderRequest,
        budgetLimitMinor,
      }],
    }, startedAt);
    await ledger.registerEvaluationRunAuthorization(client, admin, {
      authorizationId: runPolicy.authorizationId,
      ownerId: owner.id,
      campaignId: runPolicy.campaignId,
      slotId: runPolicy.slotId,
      scope: {
        type: "evaluation-unit",
        modelId: target.modelId,
        evaluationUnitKey: target.evaluationUnitKey,
      },
      maxProviderRequests,
      priceMinorPerProviderRequest,
      budgetLimitMinor,
      budgetCurrency: "CNY",
      expiresAt: options.expiresAt ?? startedAt + 60_000,
      reason: "验证 exact evaluation-unit、一次性消费与费用硬上限",
    }, startedAt);
  });
  return target;
}

async function insertEvaluationRun(
  runId: string,
  runPolicy: EvaluationRunPolicy,
  requestedCount = 1,
): Promise<void> {
  await database.query(`
    INSERT INTO generation_runs (
      id, owner_id, node_id, node_label, kind, prompt, requested_count,
      status, started_at, updated_at, run_type, retry_policy,
      evaluation_case_id, evaluation_authorization_id, evaluation_campaign_id,
      evaluation_slot_id, billing_reconciliation_status
    ) VALUES (
      $1, $2, $3, $3, 'image', '评估测试', $4,
      'queued', $5, $5, 'evaluation', 'no-retry', $6, $7, $8, $9, 'not-required'
    )
  `, [
    runId,
    owner.id,
    `${runId}-node`,
    requestedCount,
    startedAt,
    runPolicy.caseId,
    runPolicy.authorizationId,
    runPolicy.campaignId,
    runPolicy.slotId,
  ]);
}

console.log("真实评估持久化授权账本测试");

{
  const evaluationPlan = plan();
  const target = ledger.evaluationAuthorizationTargetFromPlan(evaluationPlan);
  assert.equal(target.maximumProviderRequests, 1);
  assert.match(target.evaluationUnitKey, /^sha256:[a-f0-9]{64}$/);
  const reordered = {
    steps: [{
      ...evaluationPlan.steps[0],
      params: {
        ...evaluationPlan.steps[0].params,
        modelOptions: { size: "2048x2048" },
      },
    }],
  };
  assert.equal(
    ledger.evaluationAuthorizationTargetFromPlan(reordered).evaluationUnitKey,
    target.evaluationUnitKey,
    "等价 JSON 序列化不得改变授权单元",
  );
  console.log("  ✓ 评估单元由已准入计划稳定派生");
}

assert.throws(
  () => ledger.validateEvaluationAuthorizationRegistration(admin, {
    authorizationId: "budget-too-small",
    ownerId: owner.id,
    campaignId: "campaign-budget-too-small",
    slotId: "slot-budget-too-small",
    scope: {
      type: "evaluation-unit",
      modelId: "gpt-image-2.5-flare-vip",
      evaluationUnitKey: `sha256:${"2".repeat(64)}`,
    },
    maxProviderRequests: 2,
    priceMinorPerProviderRequest: 9,
    budgetLimitMinor: 17,
    budgetCurrency: "CNY",
    expiresAt: startedAt + 60_000,
    reason: "预算应当被拒绝",
  }, startedAt),
  /\u8d85过授权预算上限/,
);
console.log("  ✓ 最坏请求数与单价必须落在币种预算内");

{
  const nonAdminOwnerId = "evaluation-ledger-user";
  const createdAt = new Date(startedAt).toISOString();
  await database.query(`
    INSERT INTO users (
      id, account_id, display_name, role, password_hash, must_change_password,
      active, created_at, updated_at
    ) VALUES ($1, $1, '普通用户', 'user', 'test-only', 0, 1, $2, $2)
  `, [nonAdminOwnerId, createdAt]);
  const nonAdminPlan = plan();
  const target = ledger.evaluationAuthorizationTargetFromPlan(nonAdminPlan);
  await assert.rejects(
    database.transaction((client) => ledger.registerEvaluationRunAuthorization(
      client,
      admin,
      {
        authorizationId: "non-admin-owner-authorization",
        ownerId: nonAdminOwnerId,
        campaignId: "campaign-non-admin-owner",
        slotId: "slot-non-admin-owner",
        scope: {
          type: "evaluation-unit",
          modelId: target.modelId,
          evaluationUnitKey: target.evaluationUnitKey,
        },
        maxProviderRequests: 1,
        priceMinorPerProviderRequest: 1,
        budgetLimitMinor: 1,
        budgetCurrency: "CNY",
        expiresAt: startedAt + 60_000,
        reason: "普通用户不得成为付费评估授权所有者",
      },
      startedAt,
    )),
    /授权目标.*管理员/,
  );
  console.log("  ✓ 持久化普通用户不能成为付费评估授权所有者");
}

{
  const exactPlan = plan();
  const authorizationId = "scope-drift-authorization";
  const runPolicy = policy("scope-drift-case", authorizationId);
  await register(runPolicy, exactPlan);
  const driftedPlan: ExecutionPlan = {
    steps: [{
      ...exactPlan.steps[0],
      params: { ...exactPlan.steps[0].params, aspectRatio: "4:5" },
    }],
  };
  await assert.rejects(
    database.transaction((client) => ledger.lockEvaluationRunAuthorization(
      client,
      runPolicy,
      owner.id,
      driftedPlan,
      startedAt + 1,
    )),
    /evaluation-unit|\u6388权单位/,
  );
  console.log("  ✓ 模型参数漂移会改变 exact evaluation-unit 并阻断入队");
}

{
  const expiringPlan = plan();
  const authorizationId = "expired-authorization";
  const runPolicy = policy("expired-case", authorizationId);
  await register(runPolicy, expiringPlan, { expiresAt: startedAt + 10 });
  await assert.rejects(
    database.transaction((client) => ledger.lockEvaluationRunAuthorization(
      client,
      runPolicy,
      owner.id,
      expiringPlan,
      startedAt + 11,
    )),
    /\u5df2过期/,
  );
  console.log("  ✓ 入队锁定时重新校验授权有效期");
}

{
  const singlePlan = plan();
  const authorizationId = "single-consume-authorization";
  const runPolicy = policy("single-consume-case", authorizationId);
  await register(runPolicy, singlePlan, { priceMinorPerProviderRequest: 11 });
  await insertEvaluationRun("single-consume-run", runPolicy);
  const locked = await database.transaction((client) => ledger.lockEvaluationRunAuthorization(
    client,
    runPolicy,
    owner.id,
    singlePlan,
    startedAt + 1,
  ));
  const attempts = await Promise.allSettled([
    database.transaction((client) => ledger.consumeEvaluationRunAuthorization(
      client, locked, runPolicy, owner.id, "single-consume-run", startedAt + 2,
    )),
    database.transaction((client) => ledger.consumeEvaluationRunAuthorization(
      client, locked, runPolicy, owner.id, "single-consume-run", startedAt + 2,
    )),
  ]);
  assert.equal(attempts.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(attempts.filter((result) => result.status === "rejected").length, 1);
  const consumed = await database.queryOne<{
    status: string;
    bound_case_id: string;
    bound_run_id: string;
    reserved_provider_requests: number;
    reserved_budget_minor: number;
  }>(`
    SELECT status, bound_case_id, bound_run_id,
      reserved_provider_requests, reserved_budget_minor::int AS reserved_budget_minor
    FROM evaluation_run_authorizations WHERE authorization_id = $1
  `, [authorizationId]);
  assert.deepEqual(consumed, {
    status: "consumed",
    bound_case_id: runPolicy.caseId,
    bound_run_id: "single-consume-run",
    reserved_provider_requests: 1,
    reserved_budget_minor: 11,
  });
  console.log("  ✓ 并发入队只有一个 run 能消费一次性授权");
}

{
  const budgetPlan = plan({ batchSize: 2 });
  const authorizationId = "provider-budget-authorization";
  const runPolicy = policy("provider-budget-case", authorizationId);
  await register(runPolicy, budgetPlan, {
    maxProviderRequests: 2,
    priceMinorPerProviderRequest: 13,
    budgetLimitMinor: 26,
  });
  await insertEvaluationRun("provider-budget-run", runPolicy, 2);
  const locked = await database.transaction((client) => ledger.lockEvaluationRunAuthorization(
    client,
    runPolicy,
    owner.id,
    budgetPlan,
    startedAt + 1,
  ));
  await database.transaction((client) => ledger.consumeEvaluationRunAuthorization(
    client, locked, runPolicy, owner.id, "provider-budget-run", startedAt + 2,
  ));
  const providerBinding = {
    authorizationId,
    ownerId: owner.id,
    caseId: runPolicy.caseId,
    runId: "provider-budget-run",
  };
  await database.transaction((client) => ledger.recordAuthorizedEvaluationProviderRequest(
    client, providerBinding, startedAt + 3,
  ));
  await database.transaction((client) => ledger.recordAuthorizedEvaluationProviderRequest(
    client, providerBinding, startedAt + 4,
  ));
  await assert.rejects(
    database.transaction((client) => ledger.recordAuthorizedEvaluationProviderRequest(
      client, providerBinding, startedAt + 5,
    )),
    /\u989d度已耗尽|\u9884算已耗尽/,
  );
  assert.deepEqual(await database.queryOne<{
    used_provider_requests: number;
    used_budget_minor: number;
  }>(`
    SELECT used_provider_requests, used_budget_minor::int AS used_budget_minor
    FROM evaluation_run_authorizations WHERE authorization_id = $1
  `, [authorizationId]), {
    used_provider_requests: 2,
    used_budget_minor: 26,
  });
  console.log("  ✓ Worker 逐请求原子消费请求额度与最小货币单位预算");
}

await database.closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
console.log("真实评估持久化授权账本测试通过");
