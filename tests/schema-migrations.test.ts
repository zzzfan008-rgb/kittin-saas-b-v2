import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-schema-migrations-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "migration-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const { closeDatabaseForTests, initializeDatabase, query, queryOne } = await import("../server/lib/database");
const { migrateLegacyData } = await import("../server/lib/legacyMigration");

console.log("PostgreSQL 22 编号迁移回归测试");
await initializeDatabase();

const versions = await query<{ version: number; name: string }>(
  "SELECT version, name FROM schema_migrations ORDER BY version",
);
assert.deepEqual(versions, [
  { version: 1, name: "initial_schema" },
  { version: 2, name: "project_asset_refs_project_foreign_key" },
  { version: 3, name: "revoked_session_reasons" },
  { version: 4, name: "active_account_id_unique" },
  { version: 5, name: "account_data_retention_tombstones" },
  { version: 6, name: "durable_generation_queue" },
  { version: 7, name: "provider_output_size_metadata" },
  { version: 8, name: "normalized_upload_metadata" },
  { version: 9, name: "generation_queue_concurrency_hardening" },
  { version: 10, name: "generation_run_request_idempotency" },
  { version: 11, name: "versioned_tutorial_receipts" },
  { version: 12, name: "initial_draft_project_lifecycle" },
  { version: 13, name: "reference_role_and_provider_original_evidence" },
  { version: 14, name: "evaluation_run_no_retry_policy" },
  { version: 15, name: "evaluation_run_authorization_ledger" },
  { version: 16, name: "evaluation_case_evidence_ledger" },
  { version: 17, name: "evaluation_budget_and_evidence_integrity" },
  { version: 18, name: "evaluation_code_identity_binding" },
  { version: 19, name: "immutable_evaluation_campaign_ledger" },
  { version: 20, name: "provider_request_id_evidence" },
  { version: 21, name: "video_step_output_metadata" },
  { version: 22, name: "asset_model_category" },
]);
console.log("  ✓ 新数据库记录全部编号迁移");

const assetCategoryConstraint = await queryOne<{ definition: string }>(`
  SELECT pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conname = 'assets_category_check'
`);
assert.match(assetCategoryConstraint?.definition ?? "", /'print'/);
assert.match(assetCategoryConstraint?.definition ?? "", /'fabric'/);
assert.match(assetCategoryConstraint?.definition ?? "", /'reference'/);
assert.match(assetCategoryConstraint?.definition ?? "", /'model'/);
console.log("  ✓ 素材 category 枚举已扩容为 print/fabric/reference/model");

const tutorialReceiptColumns = await query<{ column_name: string }>(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'user_tutorial_receipts'
  ORDER BY ordinal_position
`);
assert.deepEqual(tutorialReceiptColumns, [
  { column_name: "user_id" },
  { column_name: "tutorial_key" },
  { column_name: "tutorial_version" },
  { column_name: "outcome" },
  { column_name: "acknowledged_at" },
]);
const tutorialReceiptPrimaryKey = await queryOne<{ definition: string }>(`
  SELECT pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conrelid = 'user_tutorial_receipts'::regclass AND contype = 'p'
`);
assert.match(tutorialReceiptPrimaryKey?.definition ?? "", /user_id, tutorial_key, tutorial_version/);
const tutorialOutcomeConstraint = await queryOne<{ definition: string }>(`
  SELECT pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conrelid = 'user_tutorial_receipts'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%outcome%'
`);
assert.match(tutorialOutcomeConstraint?.definition ?? "", /dismissed/);
assert.match(tutorialOutcomeConstraint?.definition ?? "", /completed/);
const tutorialUserForeignKey = await queryOne<{ delete_action: string }>(`
  SELECT confdeltype AS delete_action
  FROM pg_constraint
  WHERE conrelid = 'user_tutorial_receipts'::regclass AND contype = 'f'
`);
assert.equal(tutorialUserForeignKey?.delete_action, "c");
console.log("  ✓ 教程回执按用户、教程标识和版本唯一存储且随用户级联删除");

const projectLifecycleColumns = await query<{
  column_name: string;
  column_default: string | null;
  is_nullable: string;
}>(`
  SELECT column_name, column_default, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'projects'
    AND column_name IN ('lifecycle','draft_revision')
  ORDER BY column_name
`);
assert.deepEqual(projectLifecycleColumns.map((row) => ({
  column_name: row.column_name,
  is_nullable: row.is_nullable,
})), [
  { column_name: "draft_revision", is_nullable: "NO" },
  { column_name: "lifecycle", is_nullable: "NO" },
]);
assert.match(
  projectLifecycleColumns.find((row) => row.column_name === "draft_revision")?.column_default ?? "",
  /0/,
);
assert.match(
  projectLifecycleColumns.find((row) => row.column_name === "lifecycle")?.column_default ?? "",
  /saved/,
);
const projectLifecycleConstraints = await query<{ conname: string; definition: string }>(`
  SELECT conname, pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conrelid = 'projects'::regclass
    AND conname IN ('projects_lifecycle_check','projects_draft_revision_check')
  ORDER BY conname
`);
assert.deepEqual(projectLifecycleConstraints.map((row) => row.conname), [
  "projects_draft_revision_check",
  "projects_lifecycle_check",
]);
assert.match(projectLifecycleConstraints[0]?.definition ?? "", />= 0/);
assert.match(projectLifecycleConstraints[1]?.definition ?? "", /initial_draft/);
assert.match(projectLifecycleConstraints[1]?.definition ?? "", /saved/);
const initialDraftUniqueIndex = await queryOne<{ indexdef: string }>(`
  SELECT indexdef FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname = 'projects_active_initial_draft_owner_unique'
`);
assert.match(initialDraftUniqueIndex?.indexdef ?? "", /UNIQUE INDEX/);
assert.match(initialDraftUniqueIndex?.indexdef ?? "", /owner_id/);
assert.match(initialDraftUniqueIndex?.indexdef ?? "", /lifecycle = 'initial_draft'/);
assert.match(initialDraftUniqueIndex?.indexdef ?? "", /deleted_at IS NULL/);
console.log("  ✓ 项目生命周期、草稿 revision 与单用户唯一有效草稿约束已建立");

const queueTables = await query<{ table_name: string }>(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('generation_run_steps','generation_jobs','generation_run_events')
  ORDER BY table_name
`);
assert.deepEqual(queueTables, [
  { table_name: "generation_jobs" },
  { table_name: "generation_run_events" },
  { table_name: "generation_run_steps" },
]);
const runStatusConstraint = await queryOne<{ definition: string }>(`
  SELECT pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conname = 'generation_runs_status_check'
`);
assert.match(runStatusConstraint?.definition ?? "", /retry_wait/);
assert.match(runStatusConstraint?.definition ?? "", /outcome_unknown/);
const retryConstraint = await queryOne<{ definition: string }>(`
  SELECT pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conrelid = 'generation_jobs'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%retry_count%'
`);
assert.match(retryConstraint?.definition ?? "", /retry_count.*(?:0|3)/);
assert.match(retryConstraint?.definition ?? "", />= 0/);
assert.match(retryConstraint?.definition ?? "", /<= 3/);
console.log("  ✓ 持久队列表、状态约束与最多三次重试约束已建立");
const evaluationRunColumns = await query<{ column_name: string }>(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'generation_runs'
    AND column_name IN (
      'retry_policy','evaluation_case_id','evaluation_authorization_id',
      'evaluation_campaign_id','evaluation_slot_id','billing_reconciliation_status'
    )
  ORDER BY column_name
`);
assert.deepEqual(evaluationRunColumns, [
  { column_name: "billing_reconciliation_status" },
  { column_name: "evaluation_authorization_id" },
  { column_name: "evaluation_campaign_id" },
  { column_name: "evaluation_case_id" },
  { column_name: "evaluation_slot_id" },
  { column_name: "retry_policy" },
]);
const evaluationRunTypeConstraint = await queryOne<{ definition: string }>(`
  SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint
  WHERE conname = 'generation_runs_run_type_check'
`);
assert.match(evaluationRunTypeConstraint?.definition ?? "", /evaluation/);
const evaluationCaseIndex = await queryOne<{ indexdef: string }>(`
  SELECT indexdef FROM pg_indexes
  WHERE schemaname = 'public' AND indexname = 'generation_runs_owner_evaluation_case_unique'
`);
assert.match(evaluationCaseIndex?.indexdef ?? "", /UNIQUE INDEX/);
assert.match(evaluationCaseIndex?.indexdef ?? "", /owner_id, evaluation_case_id/);
console.log("  ✓ 真实评估 run_type、no-retry、case 去重与账单核对字段已建立");
const queueHardeningColumns = await query<{ table_name: string; column_name: string }>(`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND (
    (table_name = 'generation_runs' AND column_name = 'next_event_seq') OR
    (table_name = 'generation_jobs' AND column_name IN ('run_started_at','step_index'))
  )
  ORDER BY table_name, column_name
`);
assert.deepEqual(queueHardeningColumns, [
  { table_name: "generation_jobs", column_name: "run_started_at" },
  { table_name: "generation_jobs", column_name: "step_index" },
  { table_name: "generation_runs", column_name: "next_event_seq" },
]);
const queueIndexes = await query<{ indexname: string; indexdef: string }>(`
  SELECT indexname, indexdef FROM pg_indexes
  WHERE schemaname = 'public' AND indexname IN (
    'generation_jobs_status_available_idx',
    'generation_jobs_ready_order_idx',
    'generation_jobs_prerequisite_idx'
  )
  ORDER BY indexname
`);
assert.deepEqual(queueIndexes.map((row) => row.indexname), [
  "generation_jobs_prerequisite_idx",
  "generation_jobs_ready_order_idx",
  "generation_jobs_status_available_idx",
]);
assert.match(queueIndexes.find((row) => row.indexname === "generation_jobs_ready_order_idx")?.indexdef ?? "", /available_at, run_started_at, step_index, id/);
console.log("  ✓ 队列排序列、可用时间索引与原子事件序号列已建立");
const requestIdColumns = await query<{ column_name: string }>(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'generation_runs'
    AND column_name IN ('client_request_id','request_fingerprint')
  ORDER BY column_name
`);
assert.deepEqual(requestIdColumns, [
  { column_name: "client_request_id" },
  { column_name: "request_fingerprint" },
]);
const requestIdIndex = await queryOne<{ indexdef: string }>(`
  SELECT indexdef FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname = 'generation_runs_owner_client_request_unique'
`);
assert.match(requestIdIndex?.indexdef ?? "", /UNIQUE INDEX/);
assert.match(requestIdIndex?.indexdef ?? "", /owner_id, client_request_id/);
assert.match(requestIdIndex?.indexdef ?? "", /client_request_id IS NOT NULL/);
const requestIdPairConstraint = await queryOne<{ definition: string }>(`
  SELECT pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conname = 'generation_runs_client_request_pair_check'
`);
assert.match(requestIdPairConstraint?.definition ?? "", /client_request_id IS NULL/);
assert.match(requestIdPairConstraint?.definition ?? "", /request_fingerprint IS NOT NULL/);
console.log("  ✓ 付费生成请求号与用户级唯一索引已建立");
const sizeColumns = await query<{ table_name: string; column_name: string }>(`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND (
    (table_name = 'generation_run_steps' AND column_name = 'provider_output_sizes_json') OR
    (table_name = 'generation_outputs' AND column_name = 'provider_output_size')
  )
  ORDER BY table_name, column_name
`);
assert.deepEqual(sizeColumns, [
  { table_name: "generation_outputs", column_name: "provider_output_size" },
  { table_name: "generation_run_steps", column_name: "provider_output_sizes_json" },
]);
console.log("  ✓ 上游实际输出尺寸元数据列已建立");
const evidenceColumns = await query<{ table_name: string; column_name: string }>(`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND (
    (table_name = 'generation_runs' AND column_name = 'reference_inputs_json') OR
    (table_name = 'generation_run_steps' AND column_name IN ('reference_inputs_json','provider_images_json')) OR
    (table_name = 'generation_outputs' AND column_name = 'provider_image')
  )
  ORDER BY table_name, column_name
`);
assert.deepEqual(evidenceColumns, [
  { table_name: "generation_outputs", column_name: "provider_image" },
  { table_name: "generation_run_steps", column_name: "provider_images_json" },
  { table_name: "generation_run_steps", column_name: "reference_inputs_json" },
  { table_name: "generation_runs", column_name: "reference_inputs_json" },
]);
console.log("  ✓ 参考角色与 Provider 原图证据列已建立");
const evaluationAuthorizationColumns = await query<{ column_name: string }>(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'evaluation_run_authorizations'
    AND column_name IN (
      'budget_limit_minor','campaign_id','price_minor_per_provider_request',
      'reserved_budget_minor','slot_id','used_budget_minor'
    )
  ORDER BY column_name
`);
assert.deepEqual(evaluationAuthorizationColumns, [
  { column_name: "budget_limit_minor" },
  { column_name: "campaign_id" },
  { column_name: "price_minor_per_provider_request" },
  { column_name: "reserved_budget_minor" },
  { column_name: "slot_id" },
  { column_name: "used_budget_minor" },
]);
const evaluationCaseIntegrityColumns = await query<{ column_name: string }>(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'evaluation_case_evidence'
    AND column_name IN (
      'campaign_id','slot_id','preset_id','evaluation_unit_key','resolved_prompt','snapshot_json',
      'error_events_json','billing_reference','hard_blockers_json',
      'evidence_record_sha256','finalized_at'
    )
  ORDER BY column_name
`);
assert.deepEqual(evaluationCaseIntegrityColumns, [
  { column_name: "billing_reference" },
  { column_name: "campaign_id" },
  { column_name: "error_events_json" },
  { column_name: "evaluation_unit_key" },
  { column_name: "evidence_record_sha256" },
  { column_name: "finalized_at" },
  { column_name: "hard_blockers_json" },
  { column_name: "preset_id" },
  { column_name: "resolved_prompt" },
  { column_name: "slot_id" },
  { column_name: "snapshot_json" },
]);
const providerEvidenceBillingColumns = await query<{ column_name: string }>(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'evaluation_provider_request_evidence'
    AND column_name IN (
      'reserved_cost_minor','budget_currency','actual_cost_minor',
      'billing_reconciliation_status','billing_reference','provider_request_id'
    )
  ORDER BY column_name
`);
assert.deepEqual(providerEvidenceBillingColumns, [
  { column_name: "actual_cost_minor" },
  { column_name: "billing_reconciliation_status" },
  { column_name: "billing_reference" },
  { column_name: "budget_currency" },
  { column_name: "provider_request_id" },
  { column_name: "reserved_cost_minor" },
]);
const providerEvidenceImageLink = await queryOne<{ column_name: string }>(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'evaluation_image_evidence'
    AND column_name = 'provider_request_evidence_id'
`);
assert.deepEqual(providerEvidenceImageLink, { column_name: "provider_request_evidence_id" });
const evaluationEventTables = await query<{ table_name: string }>(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN (
    'evaluation_billing_reconciliation_events',
    'evaluation_manual_assessment_events'
  )
  ORDER BY table_name
`);
assert.deepEqual(evaluationEventTables, [
  { table_name: "evaluation_billing_reconciliation_events" },
  { table_name: "evaluation_manual_assessment_events" },
]);
const immutableEvaluationEventTriggers = await query<{ trigger_name: string }>(`
  SELECT trigger_name FROM information_schema.triggers
  WHERE event_object_schema = 'public' AND trigger_name IN (
    'evaluation_billing_events_immutable_trigger',
    'evaluation_manual_events_immutable_trigger'
  )
  GROUP BY trigger_name
  ORDER BY trigger_name
`);
assert.deepEqual(immutableEvaluationEventTriggers, [
  { trigger_name: "evaluation_billing_events_immutable_trigger" },
  { trigger_name: "evaluation_manual_events_immutable_trigger" },
]);
console.log("  ✓ 真实评估单价/预算、快照完整性、双层图像链接与追加式审计表已建立");
const evaluationCodeShaSourceConstraint = await queryOne<{ definition: string }>(`
  SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint
  WHERE conname = 'evaluation_case_evidence_code_sha_source_check'
`);
assert.match(evaluationCodeShaSourceConstraint?.definition ?? "", /git-head/);
assert.match(evaluationCodeShaSourceConstraint?.definition ?? "", /build-identity/);
assert.doesNotMatch(evaluationCodeShaSourceConstraint?.definition ?? "", /deployment-env/);
console.log("  ✓ 评估证据仅接受 Git HEAD 或不可变构建身份来源");
const campaignTables = await query<{ table_name: string }>(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('evaluation_campaigns','evaluation_campaign_slots')
  ORDER BY table_name
`);
assert.deepEqual(campaignTables, [
  { table_name: "evaluation_campaign_slots" },
  { table_name: "evaluation_campaigns" },
]);
const campaignForeignKeys = await query<{ conname: string; definition: string }>(`
  SELECT conname, pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conname IN (
    'evaluation_authorization_campaign_fk',
    'evaluation_authorization_campaign_slot_fk',
    'generation_runs_evaluation_campaign_fk',
    'generation_runs_evaluation_campaign_slot_fk',
    'evaluation_case_campaign_fk',
    'evaluation_case_campaign_slot_fk'
  )
  ORDER BY conname
`);
assert.deepEqual(campaignForeignKeys.map((row) => row.conname), [
  "evaluation_authorization_campaign_fk",
  "evaluation_authorization_campaign_slot_fk",
  "evaluation_case_campaign_fk",
  "evaluation_case_campaign_slot_fk",
  "generation_runs_evaluation_campaign_fk",
  "generation_runs_evaluation_campaign_slot_fk",
]);
for (const foreignKey of campaignForeignKeys) {
  assert.match(foreignKey.definition, /ON DELETE RESTRICT/);
}
assert.match(
  campaignForeignKeys.find((row) => row.conname === "evaluation_authorization_campaign_slot_fk")?.definition ?? "",
  /FOREIGN KEY \(campaign_id, slot_id\) REFERENCES evaluation_campaign_slots\(campaign_id, slot_id\)/,
);
assert.match(
  campaignForeignKeys.find((row) => row.conname === "generation_runs_evaluation_campaign_slot_fk")?.definition ?? "",
  /FOREIGN KEY \(evaluation_campaign_id, evaluation_slot_id\) REFERENCES evaluation_campaign_slots\(campaign_id, slot_id\)/,
);
assert.match(
  campaignForeignKeys.find((row) => row.conname === "evaluation_case_campaign_slot_fk")?.definition ?? "",
  /FOREIGN KEY \(campaign_id, slot_id\) REFERENCES evaluation_campaign_slots\(campaign_id, slot_id\)/,
);
const campaignIndexes = await query<{ indexname: string; indexdef: string }>(`
  SELECT indexname, indexdef FROM pg_indexes
  WHERE schemaname = 'public' AND indexname IN (
    'evaluation_campaign_slots_campaign_status_idx',
    'generation_runs_evaluation_campaign_slot_unique'
  )
  ORDER BY indexname
`);
assert.deepEqual(campaignIndexes.map((row) => row.indexname), [
  "evaluation_campaign_slots_campaign_status_idx",
  "generation_runs_evaluation_campaign_slot_unique",
]);
assert.match(
  campaignIndexes.find((row) => row.indexname === "evaluation_campaign_slots_campaign_status_idx")?.indexdef ?? "",
  /campaign_id, status, slot_id/,
);
assert.match(
  campaignIndexes.find((row) => row.indexname === "generation_runs_evaluation_campaign_slot_unique")?.indexdef ?? "",
  /UNIQUE INDEX/,
);
const campaignTriggers = await query<{ trigger_name: string }>(`
  SELECT trigger_name FROM information_schema.triggers
  WHERE event_object_schema = 'public' AND trigger_name IN (
    'evaluation_campaign_immutable_trigger',
    'evaluation_campaign_slot_immutable_trigger',
    'evaluation_campaign_delete_trigger',
    'evaluation_campaign_slot_delete_trigger'
  )
  GROUP BY trigger_name
  ORDER BY trigger_name
`);
assert.deepEqual(campaignTriggers, [
  { trigger_name: "evaluation_campaign_delete_trigger" },
  { trigger_name: "evaluation_campaign_immutable_trigger" },
  { trigger_name: "evaluation_campaign_slot_delete_trigger" },
  { trigger_name: "evaluation_campaign_slot_immutable_trigger" },
]);
console.log("  ✓ Campaign/Slot 不可变账本、关联外键、索引与触发器已建立");
const uploadColumns = await query<{ column_name: string }>(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'files'
    AND column_name IN ('mime_type','width','height','byte_length','normalized')
  ORDER BY column_name
`);
assert.deepEqual(uploadColumns, [
  { column_name: "byte_length" },
  { column_name: "height" },
  { column_name: "mime_type" },
  { column_name: "normalized" },
  { column_name: "width" },
]);
console.log("  ✓ 用户上传标准化元数据列已建立");

const admin = await queryOne<{ id: string }>("SELECT id FROM users WHERE account_id = 'migration-admin'");
assert.ok(admin);
const now = new Date().toISOString();
fs.mkdirSync(path.join(temp, "uploads"), { recursive: true });
fs.writeFileSync(path.join(temp, "uploads", "legacy-rich.png"), "legacy-image");
await query(`
  INSERT INTO assets (id, owner_id, scope, name, category, image, created_at)
  VALUES ('migration-asset', $1, 'private', '迁移素材', 'reference', '/api/files/migration.png', $2)
`, [admin.id, now]);

fs.mkdirSync(path.join(temp, "assets"), { recursive: true });
fs.writeFileSync(path.join(temp, "assets", "legacy-rich.json"), JSON.stringify({
  id: "legacy-rich", name: "原始面料素材", category: "fabric",
  image: "/api/files/legacy-rich.png", sourceNote: "原始分类与备注必须保留", createdAt: now,
}));
fs.writeFileSync(path.join(temp, "assets", "private.json"), JSON.stringify({
  id: "legacy-private", name: "旧文件名", category: "reference",
  image: "/api/files/migration.png", sourceNote: "旧备注",
}));
await migrateLegacyData();
const migratedAsset = await queryOne<Record<string, unknown>>(`
  SELECT id, owner_id, scope, name, category, source_note
  FROM assets WHERE image = '/api/files/legacy-rich.png'
`);
assert.deepEqual(migratedAsset, {
  id: "legacy-rich",
  owner_id: null,
  scope: "global",
  name: "原始面料素材",
  category: "fabric",
  source_note: "原始分类与备注必须保留",
});
assert.ok(await queryOne("SELECT id FROM files WHERE id = 'legacy-rich.png'"));
fs.writeFileSync(path.join(temp, "uploads", "legacy-placeholder.png"), "legacy-placeholder");
fs.writeFileSync(path.join(temp, "assets", "legacy-placeholder.json"), JSON.stringify({
  id: "legacy-placeholder-original", name: "旧版原始印花", category: "print",
  image: "/api/files/legacy-placeholder.png", sourceNote: "旧版原始备注", createdAt: now,
}));
await query(`
  INSERT INTO assets (id, owner_id, scope, name, category, image, source_note, created_at)
  VALUES ('legacy-placeholder-row', NULL, 'global', '历史素材-legacy-placeholder', 'reference',
    '/api/files/legacy-placeholder.png', '从升级前服务器文件迁移', $1)
`, [now]);
await migrateLegacyData();
assert.equal((await queryOne<{ count: number }>(
  "SELECT COUNT(*)::int AS count FROM assets WHERE image = '/api/files/legacy-rich.png'",
))?.count, 1);
assert.deepEqual(await queryOne<Record<string, unknown>>(`
  SELECT id, name, category, source_note FROM assets
  WHERE image = '/api/files/legacy-placeholder.png'
`), {
  id: "legacy-placeholder-row",
  name: "旧版原始印花",
  category: "print",
  source_note: "旧版原始备注",
});
console.log("  ✓ legacy 素材 JSON 优先于上传目录占位记录且重复启动保持幂等");

const preserved = await queryOne<Record<string, unknown>>(
  "SELECT owner_id, scope, name, category, source_note FROM assets WHERE image = '/api/files/migration.png'",
);
assert.deepEqual(preserved, {
  owner_id: admin.id,
  scope: "private",
  name: "迁移素材",
  category: "reference",
  source_note: null,
});
console.log("  ✓ legacy 迁移不会在重复启动时夺取现有素材归属");

await query(`
  INSERT INTO users (
    id, account_id, display_name, role, password_hash, must_change_password,
    active, deleted_at, created_at, updated_at
  ) VALUES ('deleted-reusable', 'reusable-account', '旧账号', 'user', 'test', 0, 0, $1, $1, $1)
`, [now]);
await query(`
  INSERT INTO users (
    id, account_id, display_name, role, password_hash, must_change_password,
    active, created_at, updated_at
  ) VALUES ('active-reusable', 'reusable-account', '新账号', 'user', 'test', 1, 1, $1, $1)
`, [now]);
const reusable = await query<{ id: string }>(
  "SELECT id FROM users WHERE account_id = 'reusable-account' ORDER BY id",
);
assert.deepEqual(reusable, [{ id: "active-reusable" }, { id: "deleted-reusable" }]);
console.log("  ✓ 软删除账号不会永久占用登录名");

await query("ALTER TABLE project_asset_refs DROP CONSTRAINT project_asset_refs_project_id_fkey");
await query("DELETE FROM schema_migrations WHERE version = 2");
await query(`
  INSERT INTO project_asset_refs (project_id, asset_id, created_at)
  VALUES ('orphan-project', 'migration-asset', $1)
`, [now]);
await closeDatabaseForTests();
await initializeDatabase();

const orphan = await queryOne<{ count: number }>(
  "SELECT COUNT(*)::int AS count FROM project_asset_refs WHERE project_id = 'orphan-project'",
);
assert.equal(orphan?.count, 0);
const foreignKey = await queryOne<{ delete_action: string }>(`
  SELECT confdeltype AS delete_action
  FROM pg_constraint
  WHERE conname = 'project_asset_refs_project_id_fkey'
    AND conrelid = 'project_asset_refs'::regclass
`);
assert.equal(foreignKey?.delete_action, "c");
console.log("  ✓ 升级会清理孤立引用并恢复 ON DELETE CASCADE 外键");

await query(`
  INSERT INTO projects (id, owner_id, name, flow_json, updated_at, created_at)
  VALUES ('cascade-project', $1, 'Cascade', '{"schemaVersion":1,"nodes":[],"edges":[]}', $2, $2)
`, [admin.id, now]);
await query(`
  INSERT INTO project_asset_refs (project_id, asset_id, created_at)
  VALUES ('cascade-project', 'migration-asset', $1)
`, [now]);
await query("DELETE FROM projects WHERE id = 'cascade-project'");
const cascaded = await queryOne<{ count: number }>(
  "SELECT COUNT(*)::int AS count FROM project_asset_refs WHERE project_id = 'cascade-project'",
);
assert.equal(cascaded?.count, 0);
console.log("  ✓ 删除项目会级联移除素材引用");

await query("DROP INDEX IF EXISTS projects_active_initial_draft_owner_unique");
await query("ALTER TABLE projects DROP COLUMN lifecycle");
await query("ALTER TABLE projects DROP COLUMN draft_revision");
await query("DELETE FROM schema_migrations WHERE version = 12");
await query(`
  INSERT INTO projects (id, owner_id, name, flow_json, updated_at, created_at)
  VALUES ('pre-lifecycle-project', $1, '升级前项目',
    '{"schemaVersion":1,"nodes":[],"edges":[]}', $2, $2)
`, [admin.id, now]);
await closeDatabaseForTests();
await initializeDatabase();
assert.deepEqual(await queryOne<{ lifecycle: string; draft_revision: number; name: string }>(`
  SELECT lifecycle, draft_revision, name FROM projects WHERE id = 'pre-lifecycle-project'
`), {
  lifecycle: "saved",
  draft_revision: 0,
  name: "升级前项目",
});
assert.equal((await queryOne<{ count: number }>(`
  SELECT COUNT(*)::int AS count FROM schema_migrations WHERE version = 12
`))?.count, 1);
await closeDatabaseForTests();
await initializeDatabase();
assert.equal((await queryOne<{ count: number }>(`
  SELECT COUNT(*)::int AS count FROM schema_migrations WHERE version = 12
`))?.count, 1);
console.log("  ✓ 旧数据库无损补齐生命周期字段且迁移重复启动保持幂等");

// Reconstruct a real version-17 ledger that predates the immutable identity
// contract. Migration 18 must stop rather than silently relabel its
// deployment-env evidence as Git/build evidence.
const legacyEvaluationRunId = "legacy-deployment-env-run";
const legacyEvaluationCaseId = "legacy-deployment-env-case";
const legacyAuthorizationId = "legacy-deployment-env-authorization";
const legacyEvidenceId = "legacy-deployment-env-evidence";
const legacyCampaignId = "legacy-deployment-env-campaign";
const legacySlotId = "legacy-deployment-env-slot";
const legacyStartedAt = Date.now();
const legacyHash = (character: string) => character.repeat(64);
await query("DELETE FROM schema_migrations WHERE version = 18");
await query(`
  ALTER TABLE evaluation_case_evidence
    DROP CONSTRAINT evaluation_case_evidence_code_sha_source_check;
  ALTER TABLE evaluation_case_evidence
    ADD CONSTRAINT evaluation_case_evidence_code_sha_source_check
    CHECK (code_sha_source IN ('git-head','build-identity','deployment-env'))
`);
await query(`
  INSERT INTO evaluation_campaigns (
    campaign_id, owner_id, created_by_admin_id, stage, model_id,
    evaluation_unit_key, code_sha, max_provider_requests, budget_limit_minor,
    budget_currency, status, manifest_sha256, created_at
  ) VALUES (
    $1, $2, $2, 'internal-experiment', 'gpt-image-2.5-flare-vip',
    $3, $4, 1, 1, 'CNY', 'ready', $5, $6
  )
`, [
  legacyCampaignId,
  admin.id,
  `sha256:${legacyHash("a")}`,
  "b".repeat(40),
  legacyHash("f"),
  legacyStartedAt - 3_000,
]);
await query(`
  INSERT INTO evaluation_campaign_slots (
    slot_id, campaign_id, case_id, sample_id, resolved_prompt_sha256,
    native_parameters_sha256, reference_inputs_sha256, requested_image_count,
    max_provider_requests, price_minor_per_provider_request, budget_limit_minor,
    status, created_at
  ) VALUES ($1, $2, $3, 'legacy-sample', $4, $5, $6, 1, 1, 1, 1, 'ready', $7)
`, [
  legacySlotId,
  legacyCampaignId,
  legacyEvaluationCaseId,
  legacyHash("c"),
  legacyHash("d"),
  legacyHash("e"),
  legacyStartedAt - 2_500,
]);
await query(`
  INSERT INTO generation_runs (
    id, owner_id, node_id, node_label, kind, prompt, requested_count,
    successful_count, provider_requests, status, started_at, updated_at,
    run_type, retry_policy, evaluation_case_id, evaluation_authorization_id,
    evaluation_campaign_id, evaluation_slot_id, billing_reconciliation_status
  ) VALUES (
    $1, $2, 'legacy-node', 'Legacy identity node', 'image',
    'legacy identity evidence', 1, 0, 0, 'queued', $3, $3,
    'evaluation', 'no-retry', $4, $5, $6, $7, 'not-required'
  )
`, [
  legacyEvaluationRunId,
  admin.id,
  legacyStartedAt,
  legacyEvaluationCaseId,
  legacyAuthorizationId,
  legacyCampaignId,
  legacySlotId,
]);
await query(`
  INSERT INTO evaluation_run_authorizations (
    authorization_id, owner_id, created_by_admin_id, campaign_id, slot_id, scope_type, model_id,
    prompt_variant_id, evaluation_unit_key, max_provider_requests,
    price_minor_per_provider_request, budget_limit_minor, budget_currency,
    reason, expires_at, status, bound_case_id, bound_run_id,
    reserved_provider_requests, used_provider_requests, reserved_budget_minor,
    used_budget_minor, created_at, consumed_at
  ) VALUES (
    $1, $2, $2, $3, $4, 'evaluation-unit', 'gpt-image-2.5-flare-vip', NULL, $5, 1,
    1, 1, 'CNY', 'migration 18 fail-closed regression', $6, 'consumed', $7, $8,
    1, 0, 1, 0, $9, $10
  )
`, [
  legacyAuthorizationId,
  admin.id,
  legacyCampaignId,
  legacySlotId,
  `sha256:${legacyHash("a")}`,
  legacyStartedAt + 60_000,
  legacyEvaluationCaseId,
  legacyEvaluationRunId,
  legacyStartedAt - 2_000,
  legacyStartedAt - 1_000,
]);
await query(`
  UPDATE evaluation_campaign_slots
  SET authorization_id = $1, run_id = $2
  WHERE campaign_id = $3 AND slot_id = $4
`, [legacyAuthorizationId, legacyEvaluationRunId, legacyCampaignId, legacySlotId]);
await query(`
  INSERT INTO evaluation_case_evidence (
    id, run_id, owner_id, case_id, sample_id, authorization_id, campaign_id, slot_id,
    code_sha, code_sha_source, code_dirty, model_id, resolved_model_id,
    node_kind, operation_mode, task_family_id, preset_id, prompt_variant_id,
    prompt_version, prompt_sha256, evaluation_version, contract_hash,
    evaluation_unit_key, parameter_profile_id, parameter_profile_version,
    postprocess_version, input_normalization_version, golden_set_version,
    scoring_rubric_version, resolved_prompt, native_parameters_json,
    reference_inputs_json, requested_image_count, request_snapshot_sha256,
    snapshot_json, outcome, provider_request_count,
    billing_reconciliation_status, error_events_json, hard_blockers_json,
    started_at, created_at, updated_at
  ) VALUES (
    $1, $2, $3, $4, 'legacy-sample', $5, $6, $7,
    $8, 'deployment-env', FALSE, 'gpt-image-2.5-flare-vip', 'gpt-image-2.5-flare-vip',
    'image', 'generate', 'fashion-lookbook', 'fashion-lookbook',
    'legacy-variant', 'legacy-prompt-v1', $9, 'legacy-evaluation-v1', $10,
    $11, 'legacy-profile', '1.0.0', 'fit-pad-v1',
    'reference-input-sha256-v1', 'legacy-golden-v1', 'legacy-rubric-v1',
    'legacy prompt', '{}', '[]', 1, $12, '{}', 'queued', 0,
    'not-required', '[]', '[]', $13, $14, $14
  )
`, [
  legacyEvidenceId,
  legacyEvaluationRunId,
  admin.id,
  legacyEvaluationCaseId,
  legacyAuthorizationId,
  legacyCampaignId,
  legacySlotId,
  "b".repeat(40),
  legacyHash("c"),
  `sha256:${legacyHash("d")}`,
  `sha256:${legacyHash("a")}`,
  legacyHash("e"),
  legacyStartedAt,
  new Date(legacyStartedAt).toISOString(),
]);
await closeDatabaseForTests();
await assert.rejects(
  initializeDatabase(),
  /migration 18 requires review of legacy deployment-env evaluation evidence/,
  "version 18 must fail closed when a real version-17 ledger contains deployment-env evidence",
);
await closeDatabaseForTests();
assert.equal((await queryOne<{ count: number }>(`
  SELECT COUNT(*)::int AS count FROM schema_migrations WHERE version = 18
`))?.count, 0, "failed identity migration must not be recorded as applied");
assert.equal((await queryOne<{ count: number }>(`
  SELECT COUNT(*)::int AS count FROM evaluation_case_evidence
  WHERE code_sha_source = 'deployment-env'
`))?.count, 1, "failed identity migration must not rewrite legacy evidence");
await query("DELETE FROM evaluation_case_evidence WHERE id = $1", [legacyEvidenceId]);
// Campaign/Slot bindings are intentionally append-only, so the historical
// authorization/run fixture remains after removing the evidence that blocks v18.
await closeDatabaseForTests();
await initializeDatabase();
assert.equal((await queryOne<{ count: number }>(`
  SELECT COUNT(*)::int AS count FROM schema_migrations WHERE version = 18
`))?.count, 1);
console.log("  ✓ v17 deployment-env 真实证据阻断 v18，且失败事务不改写、不冒充来源");

await closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
