/**
 * 夹具生成脚本 v2：project-per-brief（48 个 evaluation project）
 *
 * generate 侧（24 个）：EVALgen-brief-01 .. EVALgen-brief-24
 *   - 结构对齐 U7lK9XXlq1 的 flow，text 节点填 golden-set brief
 * edit 侧（24 个）：EVALedit-brief-01 .. EVALedit-brief-24
 *   - 结构对齐 s1xf4H2MGa 的 flow，text 节点填 brief，
 *     image 节点 outputImages 填参考图 fileId（裁决 D：单一事实源 = golden-set）
 *
 * 审查修复清单（hermes 对 8bb76e5 的 8 项审查）：
 *   ① __dirname → import.meta.url + fileURLToPath（ESM）
 *   ② projects 表无 flow_json_sha256 列 → INSERT 不含该列（裁决 C 的列在
 *      evaluation_campaigns，由 migration 24 提供，seal 写入，与本脚本无关）
 *   ③ --commit 语义 = 直写 dev 库（garment_canvas），不 reset 任何库；
 *      幂等由 ON CONFLICT (id) DO NOTHING 保证；owner_id 运行时从库查询
 *   ④ sha256 白名单：磁盘实算 sha256 == golden-set 声称值；24 号必须
 *      2ffde870…（r4）；5f2a8589…（r2 含水印）直接拒绝
 *   ⑤ goldenSetBriefForSlot 抽到 server/lib/goldenSet.ts（单一实现）
 *   ⑥ 模板启动时从库读 U7lK9XXlq1 / s1xf4H2MGa 当前 flow_json，
 *      与脚本内模板 deep-equal 断言（不等即拒，防静默漂移）
 *   ⑦ SQL 参数化（query(text, params)），不拼接字符串
 *   ⑧ 时间戳 ISO 8601（new Date().toISOString()）
 *
 * 用法：
 *   npx tsx scripts/generate-evaluation-fixtures.ts            # dry-run（只读库）
 *   npx tsx scripts/generate-evaluation-fixtures.ts --commit   # 写 dev 库（需授权）
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  loadGoldenSet,
  goldenSetBriefForSlotFromSet,
  GOLDEN_SET_SIZE,
  REJECTED_SHA256,
  REQUIRED_SHA256,
  type GoldenSet,
} from "../server/lib/goldenSet";
import { query, queryOne, db, closeDatabaseForTests } from "../server/lib/database";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── types ──────────────────────────────────────────────────────────────

interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  width?: number;
  height?: number;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  data?: Record<string, unknown>;
  targetHandle?: string;
  sourceHandle?: string;
}

interface PersistedFlow {
  schemaVersion: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FixtureInsert {
  projectId: string;
  name: string;
  flowJson: string;
  flowSha256: string;
  sqlText: string;
  params: unknown[];
}

// ── templates（结构与库内 project 对齐，启动时 deep-equal 校验）─────────

const GEN_TEMPLATE: PersistedFlow = {
  schemaVersion: 8,
  nodes: [
    {
      id: "outfit-requirement",
      type: "text",
      position: { x: 0, y: -170 },
      data: {
        kind: "text",
        label: "场合/风格/身材",
        status: "idle",
        text: "【要求】描述场合、风格与身材",
      },
    },
    {
      id: "outfit-gen",
      type: "image-generator",
      position: { x: 380, y: -170 },
      data: {
        kind: "image-generator",
        label: "穿搭推荐",
        status: "idle",
        promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
        modelId: "gpt-image-2.5-flare-vip",
        modelOptions: { size: "1536x2048" },
        aspectRatio: "3:4",
        batchSize: 1,
      },
    },
  ],
  edges: [
    {
      id: "e-outfit-prompt",
      source: "outfit-requirement",
      target: "outfit-gen",
      data: {},
      targetHandle: "prompt",
    },
  ],
};

const EDIT_TEMPLATE: PersistedFlow = {
  schemaVersion: 8,
  nodes: [
    {
      id: "mutate-requirement",
      type: "text",
      position: { x: 0, y: -170 },
      data: {
        kind: "text",
        label: "裂变方向/数量",
        status: "idle",
        text: "【要求】描述印花裂变的方向与数量阿斯顿 ",
      },
    },
    {
      id: "print",
      type: "image",
      position: { x: 0, y: 20 },
      data: { kind: "image", label: "印花图", status: "idle", outputImages: [] },
    },
    {
      id: "mutate-gen",
      type: "image-generator",
      position: { x: 380, y: -75 },
      data: {
        kind: "image-generator",
        label: "印花裂变",
        status: "idle",
        promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
        modelId: "gpt-image-2.5-flare-vip",
        modelOptions: { size: "1536x2048" },
        aspectRatio: "3:4",
        batchSize: 2,
      },
    },
  ],
  edges: [
    {
      id: "e-mutate-prompt",
      source: "mutate-requirement",
      target: "mutate-gen",
      data: {},
      targetHandle: "prompt",
    },
    {
      id: "e-mutate-ref",
      source: "print",
      target: "mutate-gen",
      data: {},
      targetHandle: "reference",
    },
  ],
};

// 模板 project id（库内审计锚点，脚本只读）
const GEN_TEMPLATE_PROJECT_ID = "U7lK9XXlq1";
const EDIT_TEMPLATE_PROJECT_ID = "s1xf4H2MGa";

// ── helpers ─────────────────────────────────────────────────────────────

function sha256Hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function fixtureProjectId(variant: "gen" | "edit", sampleIdx: number): string {
  return `EVAL${variant}-brief-${String(sampleIdx + 1).padStart(2, "0")}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/** projects 表 INSERT（⑦ 参数化，幂等）。列与 database.ts:68-77 定义一致。 */
function buildInsertSql(): string {
  return [
    "INSERT INTO projects (id, owner_id, name, flow_json, created_at, updated_at)",
    "VALUES ($1, $2, $3, $4, $5, $6)",
    "ON CONFLICT (id) DO NOTHING",
  ].join(" ");
}

function buildFixture(
  projectId: string,
  name: string,
  flow: PersistedFlow,
  ownerId: string,
): FixtureInsert {
  const flowJson = JSON.stringify(flow);
  const now = new Date().toISOString(); // ⑧ ISO 8601
  return {
    projectId,
    name,
    flowJson,
    flowSha256: sha256Hex(flowJson),
    sqlText: buildInsertSql(),
    params: [projectId, ownerId, name, flowJson, now, now],
  };
}

// ── assertions ──────────────────────────────────────────────────────────

/** 裁决 B①：edges 顺序写死 + 逐条断言。 */
function assertEdgesOrder(
  flow: PersistedFlow,
  expectedEdgeIds: string[],
  projectId: string,
): void {
  const actualIds = flow.edges.map((e) => e.id);
  assert.deepStrictEqual(
    actualIds,
    expectedEdgeIds,
    `${projectId}: edges order drifted (ruling B①). expected ${JSON.stringify(expectedEdgeIds)}, got ${JSON.stringify(actualIds)}`,
  );
}

/** 裁决 B③：反恒真——两种 edges 排列必须产出不同 flow_json sha256。
 *  只对 ≥2 条 edges 的 flow 有意义：单 edge 的 reverse 是恒等排列，
 *  不存在「第二种排列」，order 漂移风险为零（gen 侧只有 1 条 prompt edge；
 *  referenceInputsSha256 的 order 敏感性只在 edit 侧 2 条 edges 时体现）。 */
function assertEdgeOrderSensitivity(flow: PersistedFlow, label: string): void {
  if (flow.edges.length < 2) {
    console.log(
      `  - anti-identity (${label}): skipped — single edge has no second permutation`,
    );
    return;
  }
  const original = sha256Hex(JSON.stringify(flow));
  const reversed = sha256Hex(JSON.stringify({ ...flow, edges: [...flow.edges].reverse() }));
  assert.notStrictEqual(
    original,
    reversed,
    `ANTI-IDENTITY FAILURE (${label}): reversing edges did not change flow_json sha256`,
  );
  console.log(
    `  ✓ anti-identity (${label}): edges reverse changes hash ${original.slice(0, 8)}… → ${reversed.slice(0, 8)}…`,
  );
}

/** ⑥ 模板与库内 project 当前 flow deep-equal（防静默漂移）。 */
async function assertTemplateMatchesDb(
  templateProjectId: string,
  template: PersistedFlow,
  label: string,
): Promise<void> {
  const row = await queryOne<{ flow_json: string }>(
    "SELECT flow_json FROM projects WHERE id = $1 AND deleted_at IS NULL",
    [templateProjectId],
  );
  assert.ok(
    row !== undefined,
    `template project ${templateProjectId} (${label}) not found in database — refusing to generate fixtures from an unverified template`,
  );
  const dbFlow = JSON.parse(row.flow_json) as PersistedFlow;
  assert.deepStrictEqual(
    template,
    dbFlow,
    `HARDCODED TEMPLATE DRIFT (${label}): script template != db ${templateProjectId} flow_json. ` +
      `Update the script template to match the database before generating fixtures.`,
  );
  console.log(`  ✓ template ${label}: deep-equal with db ${templateProjectId}`);
}

/** ④ sha256 白名单：磁盘实算 vs golden-set 声称 vs 强制值。 */
function assertReferenceImageIntegrity(goldenSet: GoldenSet, imagesDir: string): void {
  for (const sample of goldenSet.samples) {
    if (!sample.referenceImage) continue;
    const imgPath = path.join(imagesDir, `${sample.id}.jpg`);
    if (!fs.existsSync(imgPath)) continue; // 磁盘文件缺失由入库脚本处理
    const diskSha = sha256File(imgPath);
    // 1. known-bad rejection (r2 watermark etc.)
    assert.ok(
      !REJECTED_SHA256.has(diskSha),
      `${sample.id}: REFUSED — disk sha256 ${diskSha} is in rejected list (watermarked r2)`,
    );
    // 2. pinned required value
    const required = REQUIRED_SHA256[sample.id];
    if (required !== undefined) {
      assert.strictEqual(
        diskSha,
        required,
        `${sample.id}: sha256 mismatch — required ${required}, disk ${diskSha}`,
      );
    }
    // 3. golden-set claimed value: disk file = original delivery, so compare
    //    against deliveredSourceSha256 (not assetSha256 = normalize output)
    const claimedSourceSha256 = sample.referenceImage.deliveredSourceSha256;
    assert.strictEqual(
      diskSha,
      claimedSourceSha256,
      `${sample.id}: disk sha256 ${diskSha} != golden-set deliveredSourceSha256 ${claimedSourceSha256 ?? "undefined"}`,
    );
    console.log(`  ✓ sha256 whitelist: ${sample.id} = ${diskSha.slice(0, 8)}…`);
  }
}

/** 裁决 D：edit project 的 fileId 与 sampleIdx 对应条相等（单一事实源）。 */
function assertFileIdMatchesSample(
  flow: PersistedFlow,
  expectedFileId: string,
  projectId: string,
): void {
  const imageNode = flow.nodes.find((n) => n.type === "image");
  assert.ok(imageNode, `${projectId}: image node missing`);
  const outputImages = imageNode.data.outputImages as Array<{ fileId: string }>;
  assert.ok(
    Array.isArray(outputImages) && outputImages.length === 1,
    `${projectId}: expected exactly 1 outputImage`,
  );
  assert.strictEqual(
    outputImages[0].fileId,
    expectedFileId,
    `${projectId}: outputImages fileId ${outputImages[0].fileId} != golden-set referenceImage.fileId ${expectedFileId} (ruling D)`,
  );
}

// ── main ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const commit = process.argv.includes("--commit");
  const imagesDir = path.resolve(ROOT, "tmp/golden-set-images");
  console.log(
    `generate-evaluation-fixtures v2: mode=${commit ? "COMMIT (dev db)" : "DRY-RUN (read-only)"}`,
  );

  // load golden-set + validate
  const goldenSet = loadGoldenSet();
  assert.strictEqual(goldenSet.samples.length, GOLDEN_SET_SIZE);
  const briefs = new Set(goldenSet.samples.map((s) => s.brief));
  assert.strictEqual(briefs.size, GOLDEN_SET_SIZE, "golden-set briefs must be unique");
  console.log(`golden-set: ${goldenSet.samples.length} samples, all briefs unique`);

  // ⑥ template drift check (read-only, both modes)
  await assertTemplateMatchesDb(GEN_TEMPLATE_PROJECT_ID, GEN_TEMPLATE, "GEN");
  await assertTemplateMatchesDb(EDIT_TEMPLATE_PROJECT_ID, EDIT_TEMPLATE, "EDIT");

  // ④ reference image sha256 whitelist (if disk files present)
  if (fs.existsSync(imagesDir)) {
    assertReferenceImageIntegrity(goldenSet, imagesDir);
  } else {
    console.log(`  (images dir ${imagesDir} absent — sha256 whitelist check skipped)`);
  }

  // anti-identity (ruling B③)
  assertEdgeOrderSensitivity(GEN_TEMPLATE, "GEN_TEMPLATE");
  assertEdgeOrderSensitivity(EDIT_TEMPLATE, "EDIT_TEMPLATE");

  // ③ owner: 运行时从库查 admin user（不再硬编码）
  const ownerRow = await queryOne<{ id: string }>(
    "SELECT id FROM users WHERE account_id = $1 LIMIT 1",
    ["admin"],
  );
  assert.ok(
    ownerRow !== undefined,
    "admin user not found in database — cannot assign fixture ownership",
  );
  const ownerId = ownerRow.id;
  console.log(`owner: admin user ${ownerId} (queried from db, not hardcoded)`);

  const genEdgeIds = GEN_TEMPLATE.edges.map((e) => e.id);
  const editEdgeIds = EDIT_TEMPLATE.edges.map((e) => e.id);
  const fixtures: FixtureInsert[] = [];
  let editSkipped = 0;

  for (let i = 0; i < goldenSet.samples.length; i++) {
    const sample = goldenSet.samples[i];

    // ⑤ shared function (server/lib/goldenSet.ts) — 单一实现
    const brief = goldenSetBriefForSlotFromSet(goldenSet, "formal-validation", i);
    assert.strictEqual(brief, sample.brief);

    // ── generate fixture ────────────────────────────────────────────
    const genFlow = deepClone(GEN_TEMPLATE);
    const genTextNode = genFlow.nodes.find((n) => n.data.kind === "text");
    assert.ok(genTextNode);
    genTextNode.data.text = brief;
    assertEdgesOrder(genFlow, genEdgeIds, fixtureProjectId("gen", i));
    fixtures.push(
      buildFixture(fixtureProjectId("gen", i), `${sample.id} generate`, genFlow, ownerId),
    );

    // ── edit fixture ────────────────────────────────────────────────
    if (sample.referenceImage?.fileId) {
      const editFlow = deepClone(EDIT_TEMPLATE);
      const editTextNode = editFlow.nodes.find((n) => n.data.kind === "text");
      assert.ok(editTextNode);
      editTextNode.data.text = brief;
      const imageNode = editFlow.nodes.find((n) => n.type === "image");
      assert.ok(imageNode);
      imageNode.data.outputImages = [{ fileId: sample.referenceImage.fileId }];
      assertEdgesOrder(editFlow, editEdgeIds, fixtureProjectId("edit", i));
      assertFileIdMatchesSample(
        editFlow,
        sample.referenceImage.fileId,
        fixtureProjectId("edit", i),
      );
      fixtures.push(
        buildFixture(fixtureProjectId("edit", i), `${sample.id} edit`, editFlow, ownerId),
      );
    } else {
      editSkipped += 1;
      console.log(
        `  SKIP ${fixtureProjectId("edit", i)}: referenceImage.fileId missing (image not yet uploaded)`,
      );
    }
  }

  const genCount = fixtures.filter((f) => f.projectId.startsWith("EVALgen")).length;
  const editCount = fixtures.filter((f) => f.projectId.startsWith("EVALedit")).length;
  assert.strictEqual(genCount, GOLDEN_SET_SIZE, "must generate exactly 24 generate fixtures");
  console.log(
    `\nfixtures built: ${fixtures.length} total (${genCount} gen + ${editCount} edit, ${editSkipped} edit skipped)`,
  );

  // flow sha256 uniqueness (each brief distinct → each flow distinct)
  const shaSet = new Set(fixtures.map((f) => f.flowSha256));
  assert.strictEqual(shaSet.size, fixtures.length, "flow_json sha256 values must all be distinct");
  console.log(`  ✓ all ${fixtures.length} flow_json sha256 distinct`);

  if (commit) {
    // ③ --commit：直写 dev 库，不 reset 任何东西；幂等 ON CONFLICT DO NOTHING
    const dbNameRow = await queryOne<{ db: string }>("SELECT current_database() AS db");
    const dbName = dbNameRow?.db ?? "";
    assert.ok(
      !dbName.endsWith("_test"),
      `--commit must target the dev database, got "${dbName}" (test db)`,
    );
    let inserted = 0;
    let skipped = 0;
    for (const f of fixtures) {
      // raw pool query to get rowCount (wrapper query() returns rows only)
      const res = await db().query(f.sqlText, f.params);
      if ((res.rowCount ?? 0) > 0) inserted += 1;
      else skipped += 1;
    }
    console.log(`  ✓ committed: ${inserted} inserted, ${skipped} skipped (already exist)`);
  } else {
    console.log("\n-- DRY-RUN SQL (parameterized; add --commit to write to dev db):\n");
    for (const f of fixtures) {
      console.log(`-- ${f.projectId} (${f.name}) flow_sha256=${f.flowSha256.slice(0, 16)}…`);
      console.log(f.sqlText);
      console.log(
        `--   params: [$1=${f.projectId}, $2=${ownerId}, $3=${JSON.stringify(f.name)}, $4=<flow_json ${f.flowJson.length}B>, $5=$6=<now ISO>]`,
      );
      console.log();
    }
  }

  await closeDatabaseForTests();
  console.log(
    `generate-evaluation-fixtures: OK (${fixtures.length} fixtures, mode=${commit ? "COMMIT" : "DRY-RUN"})`,
  );
}

main().catch(async (err) => {
  console.error("FIXTURE GENERATION FAILED:", err instanceof Error ? err.message : err);
  try {
    await closeDatabaseForTests();
  } catch {
    /* best-effort */
  }
  process.exit(1);
});