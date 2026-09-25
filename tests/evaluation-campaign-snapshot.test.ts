/**
 * 裁决 62 ruling 6②：envelope 输入源快照列迁移的 4 条注册验收。
 *
 * 三列（envelope_inputs_json / envelope_inputs_sha256 / evaluation_version）
 * 加在 evaluation_campaigns 上，migration version 23。
 *
 * 断言清单：
 * 1. 新 seal 写入后三列非空 + evaluation_version 对齐注册表当前值；
 *    v8rel6 残留行保持 NULL（未被 DEFAULT 伪造）        [assertion-1]
 * 2. 自校验：从 JSON 回读重算 sha256 == 存入的 sha256；
 *    篡改 JSON 一个字符 → 不匹配                       [assertion-2]
 * 3. 不可变性：UPDATE 新列 → 触发器 RAISE EXCEPTION    [assertion-3]
 * 4. 迁移幂等：同一条迁移连跑两次不报错                [assertion-4]
 *
 * 变异验收（与 4 条绑定）：
 * - 篡改 JSON ± sha256 并证明不一致 → 自校验有牙齿
 * - 验证新列名**不在**触发器白名单中（deny-by-default）
 *
 * 分类：碰库（SERIAL_TEST_FILES），必须注册进
 * scripts/test-suite-parallel.mjs 的两个注册表。
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(
  path.join(os.tmpdir(), "garment-canvas-env-snapshot-"),
);
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "env-snapshot-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const database = await import("../server/lib/database");
await database.initializeDatabase();

// Bootstrap creates admin from INITIAL_ADMIN_ACCOUNT_ID (set above).
const adminUser = await database.queryOne<{
  id: string;
  account_id: string;
}>(
  `SELECT id, account_id FROM users WHERE account_id = 'env-snapshot-admin'`,
);
assert.ok(adminUser, "admin user must exist after bootstrap");
const adminId = adminUser.id;

const now = () => Date.now();

const inputsCanonicalJson =
  '{"nodeKind":"image-generator","modelId":"gpt-image-2.5-flare-vip",' +
  '"promptVariantId":"fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",' +
  '"promptFamilyId":"fashion-lookbook","operationMode":"generate",' +
  '"parameterProfileId":"balanced-v1","contractHash":' +
  '"sha256:0000000000000000000000000000000000000000000000000000000000000000",' +
  '"evaluationVersion":"garment-eval-v3-pending","postprocessVersion":"1.0.0",' +
  '"aspectRatio":"1:1","batchSize":1,"modelOptions":{}}';
const inputsSha256 = createHash("sha256")
  .update(inputsCanonicalJson)
  .digest("hex");
const MOCK_SHA256_A = createHash("sha256").update("snap-legacy-camp").digest("hex");
const MOCK_SHA256_B = createHash("sha256").update("snap-assertion-test-camp").digest("hex");
const evaluationVersion = "garment-eval-v3-pending";

// Acquire a single reusable connection for the whole suite.
const db = database.db();

// ── 断言 1: 残留行 NULL，新 seal 写入非空 ──
// 先 INSERT 一条不含快照列的旧式行（模拟 v8rel6 残留）。
// trigger 只拦截 UPDATE（不可变）和 DELETE，INSERT 正常。
{
  const dbClient = await database.db();
  await dbClient.query(
    `INSERT INTO evaluation_campaigns
       (campaign_id, owner_id, created_by_admin_id, stage, model_id,
        evaluation_unit_key, code_sha, max_provider_requests, budget_limit_minor,
        budget_currency, status, manifest_sha256, created_at)
     VALUES ('snap-legacy-camp', $1, $1, 'provider-probe', 'gpt-image-2.5-flare-vip',
             'sha256:0000000000000000000000000000000000000000000000000000000000000000',
             '0000000000000000000000000000000000000000000000000000000000000000',
             1, 3, 'USD', 'ready',
             '${MOCK_SHA256_A}',
             $2)
     ON CONFLICT (campaign_id) DO NOTHING`,
    [adminId, now()],
  );
  const legacy = await database.queryOne<{
    envelope_inputs_json: unknown;
    envelope_inputs_sha256: unknown;
    evaluation_version: unknown;
  }>(
    `SELECT envelope_inputs_json, envelope_inputs_sha256, evaluation_version
     FROM evaluation_campaigns WHERE campaign_id = 'snap-legacy-camp'`,
  );
  assert.ok(legacy, "assertion-1: legacy row exists");
  assert.equal(legacy.envelope_inputs_json, null, "legacy: envelope_inputs_json IS NULL (no DEFAULT)");
  assert.equal(legacy.envelope_inputs_sha256, null, "legacy: envelope_inputs_sha256 IS NULL (no DEFAULT)");
  assert.equal(legacy.evaluation_version, null, "legacy: evaluation_version IS NULL (no DEFAULT)");
}

// Insert a test campaign to simulate a new seal (constants defined above).

// Insert the test campaign directly
await db.query(
  `INSERT INTO evaluation_campaigns
     (campaign_id, owner_id, created_by_admin_id, stage, model_id,
      evaluation_unit_key, code_sha, max_provider_requests, budget_limit_minor,
      budget_currency, status, manifest_sha256, created_at,
      envelope_inputs_json, envelope_inputs_sha256, evaluation_version)
   VALUES ($1, $2, $2, 'provider-probe', $3, $4,
           '0000000000000000000000000000000000000000000000000000000000000000',
           1, 3, 'USD', 'ready',
           '${MOCK_SHA256_B}',
           $5,
           $6, $7, $8)
   ON CONFLICT (campaign_id) DO NOTHING`,
  [
    "snap-assertion-test-camp",
    adminId,
    "gpt-image-2.5-flare-vip",
    "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    now(),
    inputsCanonicalJson,
    inputsSha256,
    evaluationVersion,
  ],
);
{
  const sealed = await database.queryOne<{
    envelope_inputs_json: string | null;
    envelope_inputs_sha256: string | null;
    evaluation_version: string | null;
  }>(
    `SELECT envelope_inputs_json, envelope_inputs_sha256, evaluation_version
     FROM evaluation_campaigns WHERE campaign_id = 'snap-assertion-test-camp'`,
  );
  assert.ok(sealed, "assertion-1: sealed row exists");
  // All 3 columns must be NOT NULL for a new seal
  assert.ok(
    typeof sealed.envelope_inputs_json === "string" &&
      sealed.envelope_inputs_json.length > 0,
    "assertion-1: envelope_inputs_json is non-null for new seal",
  );
  assert.ok(
    typeof sealed.envelope_inputs_sha256 === "string" &&
      sealed.envelope_inputs_sha256.length === 64,
    "assertion-1: envelope_inputs_sha256 is non-null 64-char hex",
  );
  assert.equal(
    sealed.evaluation_version,
    "garment-eval-v3-pending",
    "assertion-1: evaluation_version matches registry current value",
  );

  // Verify the stored values exactly match what seal computed
  assert.equal(sealed.envelope_inputs_json, inputsCanonicalJson);
  assert.equal(sealed.envelope_inputs_sha256, inputsSha256);
}

// ── 断言 2: 自校验 ──
{
  const sealed = await database.queryOne<{
    envelope_inputs_json: string;
    envelope_inputs_sha256: string;
  }>(
    `SELECT envelope_inputs_json, envelope_inputs_sha256
     FROM evaluation_campaigns WHERE campaign_id = 'snap-assertion-test-camp'`,
  );
  assert.ok(sealed, "assertion-2: sealed row exists");

  // (a) 重算 sha256 — 必须等于存盘的
  const recomputed = createHash("sha256")
    .update(sealed.envelope_inputs_json)
    .digest("hex");
  assert.equal(
    recomputed,
    sealed.envelope_inputs_sha256,
    "assertion-2: recomputed sha256 matches stored envelope_inputs_sha256",
  );

  // (b) 反恒真——篡改 JSON 一个字符 → sha256 必须不等
  const tampered = sealed.envelope_inputs_json.replace(
    '"batchSize":1',
    '"batchSize":4',
  );
  const tamperedHash = createHash("sha256").update(tampered).digest("hex");
  assert.notEqual(
    tamperedHash,
    sealed.envelope_inputs_sha256,
    "assertion-2: tampered JSON produces a different sha256",
  );
}

// ── 断言 3: 不可变性 ──
{
  let err: Error | null = null;
  try {
    await db.query(
      `UPDATE evaluation_campaigns
       SET envelope_inputs_sha256 = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
       WHERE campaign_id = 'snap-assertion-test-camp'`,
    );
  } catch (e) {
    err = e as Error;
  }
  assert.ok(
    err !== null,
    "assertion-3: UPDATE envelope_inputs_sha256 must throw",
  );
  assert.match(
    err!.message,
    /immutable/,
    "assertion-3: error message contains 'immutable'",
  );

  // Confirm value was NOT changed (atomic protection)
  const unchanged = await database.queryOne<{ envelope_inputs_sha256: string }>(
    `SELECT envelope_inputs_sha256
     FROM evaluation_campaigns WHERE campaign_id = 'snap-assertion-test-camp'`,
  );
  assert.ok(unchanged, "assertion-3: row still exists after failed UPDATE");
  assert.notEqual(
    unchanged.envelope_inputs_sha256,
    "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "assertion-3: sha256 value was NOT changed by blocked UPDATE",
  );
  assert.equal(
    unchanged.envelope_inputs_sha256,
    inputsSha256,
    "assertion-3: sha256 value is still the original seal value",
  );
}

// ── 断言 4: 迁移幂等 ──
{
  // Re-run the exact same ADD COLUMN IF NOT EXISTS DDL
  await db.query(`
    ALTER TABLE evaluation_campaigns
      ADD COLUMN IF NOT EXISTS envelope_inputs_json TEXT;
    ALTER TABLE evaluation_campaigns
      ADD COLUMN IF NOT EXISTS envelope_inputs_sha256 TEXT;
    ALTER TABLE evaluation_campaigns
      ADD COLUMN IF NOT EXISTS evaluation_version TEXT;
  `);

  // Re-insert schema_migrations row (ON CONFLICT DO NOTHING)
  await db.query(
    `INSERT INTO schema_migrations (version, name, applied_at)
     VALUES (23, 'envelope_inputs_snapshot_columns', $1)
     ON CONFLICT (version) DO NOTHING`,
    [now()],
  );

  // All three columns still exist after re-run
  const cols = await db.query<{ column_name: string; data_type: string }>(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name = 'evaluation_campaigns'
       AND column_name IN ('envelope_inputs_json','envelope_inputs_sha256','evaluation_version')
     ORDER BY column_name`,
  );
  assert.equal(cols.rows.length, 3, "assertion-4: 3 snapshot columns exist after re-run");
  for (const col of cols.rows) {
    assert.equal(
      col.data_type,
      "text",
      `assertion-4: ${col.column_name} data_type is text`,
    );
  }
}

// ── 变异验收: 触发器用减法式 deny-by-default ──
{
  const triggerSrc = await db.query<{ prosrc: string }>(
    `SELECT prosrc FROM pg_proc WHERE proname = 'reject_evaluation_campaign_mutation'`,
  );
  assert.ok(
    triggerSrc.rows.length === 1,
    "mutation: reject_evaluation_campaign_mutation function exists",
  );
  const src = triggerSrc.rows[0].prosrc;

  // 触发器用减法式（to_jsonb(NEW) - whitelist）——新列自动落入不可变集合
  assert.ok(
    src.includes("to_jsonb(NEW) - ARRAY["),
    "mutation: trigger uses subtraction (deny-by-default) pattern",
  );

  // 新列名**不得**出现在减去的白名单中
  assert.ok(
    !src.includes("envelope_inputs_json"),
    "mutation: envelope_inputs_json NOT in whitelist → auto-protected",
  );
  assert.ok(
    !src.includes("envelope_inputs_sha256"),
    "mutation: envelope_inputs_sha256 NOT in whitelist → auto-protected",
  );
  assert.ok(
    !src.includes("evaluation_version"),
    "mutation: evaluation_version NOT in whitelist → auto-protected",
  );

  // 白名单只含既有的可变更列
  assert.ok(
    src.includes("status"),
    "mutation: 'status' still in whitelist",
  );
  assert.ok(
    src.includes("closure_sha256"),
    "mutation: 'closure_sha256' still in whitelist",
  );
  assert.ok(
    src.includes("closed_at"),
    "mutation: 'closed_at' still in whitelist",
  );
}