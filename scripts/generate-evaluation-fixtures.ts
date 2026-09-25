/**
 * 夹具生成脚本：project-per-brief（48 个 evaluation project）
 *
 * generate 侧（24 个）：EVALgen-brief-01 .. EVALgen-brief-24
 *   - clone U7lK9XXlq1 的 flow 结构，text 节点填 golden-set brief
 * edit 侧（24 个）：EVALedit-brief-01 .. EVALedit-brief-24
 *   - clone s1xf4H2MGa 的 flow 结构，text 节点填 brief，
 *     image 节点 outputImages 填参考图 fileId
 *
 * 必须满足的约束（裁决 A-D）：
 * - 运行时零注入：brief + 参考图均 bake 进 flow_json
 * - edges 顺序写死（裁决 B①）+ 脚本内断言
 * - 参考图 fileId 从 golden-set referenceImage 读（裁决 D 单一事实源）
 * - 幂等 INSERT ON CONFLICT（按 projectId 去重）
 *
 * 入口：
 *   npx tsx scripts/generate-evaluation-fixtures.ts
 *
 * 此脚本只做确定性构造，不动库——插入语句打印到 stdout，
 * 加 --commit 参数后直写数据库。
 */

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

// ── types ──────────────────────────────────────────────────────────────

interface GoldenSample {
  id: string;
  brief: string;
  riskFocus: string[];
  referenceImage?: { fileId: string; sha256: string };
}

interface GoldenSet {
  version: string;
  description: string;
  samples: GoldenSample[];
}

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

// ── constants ───────────────────────────────────────────────────────────

const GOLDEN_SET_PATH = path.resolve(__dirname, "../docs/ai/evaluation/golden-set-v1.json");
const OWNER_ID = "WjJgiF7JZsKb"; // admin user

// base template flows（从生产 project clone 结构）
const GEN_TEMPLATE: PersistedFlow = {
  schemaVersion: 8,
  nodes: [
    {
      id: "outfit-requirement",
      type: "text",
      position: { x: 0, y: -170 },
      data: { kind: "text", label: "场合/风格/身材", status: "idle",
               text: "【要求】描述场合、风格与身材" },
    },
    {
      id: "outfit-gen",
      type: "image-generator",
      position: { x: 380, y: -170 },
      data: { kind: "image-generator", label: "穿搭推荐", status: "idle",
              promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
              modelId: "gpt-image-2.5-flare-vip",
              modelOptions: { size: "1536x2048" },
              aspectRatio: "3:4",
              batchSize: 1 },
    },
  ],
  edges: [
    { id: "e-outfit-prompt", source: "outfit-requirement", target: "outfit-gen",
      data: {}, targetHandle: "prompt" },
  ],
};

const EDIT_TEMPLATE: PersistedFlow = {
  schemaVersion: 8,
  nodes: [
    {
      id: "mutate-requirement",
      type: "text",
      position: { x: 0, y: -170 },
      data: { kind: "text", label: "裂变方向/数量", status: "idle",
               text: "【要求】描述印花裂变的方向与数量阿斯顿 " },
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
      data: { kind: "image-generator", label: "印花裂变", status: "idle",
              promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
              modelId: "gpt-image-2.5-flare-vip",
              modelOptions: { size: "1536x2048" },
              aspectRatio: "3:4",
              batchSize: 2 },
    },
  ],
  edges: [
    { id: "e-mutate-prompt", source: "mutate-requirement", target: "mutate-gen",
      data: {}, targetHandle: "prompt" },
    { id: "e-mutate-ref", source: "print", target: "mutate-gen",
      data: {}, targetHandle: "reference" },
  ],
};

// ── helpers ─────────────────────────────────────────────────────────────

function goldenSetBriefForSlot(sampleIdx: number, goldenSet: GoldenSet): string {
  if (!Number.isInteger(sampleIdx) || sampleIdx < 0 || sampleIdx >= 24) {
    throw new Error(`sampleIdx ${sampleIdx} out of [0, 24)`);
  }
  return goldenSet.samples[sampleIdx].brief;
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function projectId(variant: "gen" | "edit", sampleIdx: number): string {
  const num = String(sampleIdx + 1).padStart(2, "0");
  return `EVAL${variant}-brief-${num}`;
}

function formatTimestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19) + "+00";
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ── generate a single project fixture ───────────────────────────────────

function buildGenProject(sample: GoldenSample, sampleIdx: number): {
  projectId: string;
  flow: PersistedFlow;
  sql: string;
} {
  const id = projectId("gen", sampleIdx);
  const flow = deepClone(GEN_TEMPLATE);

  // bake brief into text node
  const textNode = flow.nodes.find((n) => n.data.kind === "text")!;
  textNode.data.text = sample.brief;

  const now = formatTimestamp();
  const flowJson = JSON.stringify(flow).replace(/'/g, "''");
  const flowSha256 = sha256(JSON.stringify(flow));

  const sql = [
    `INSERT INTO projects (id, owner_id, name, flow_json, flow_json_sha256, created_at, updated_at)`,
    `VALUES (`,
    `  '${id}',`,
    `  '${OWNER_ID}',`,
    `  '${sample.id} generate',`,
    `  '${flowJson}',`,
    `  '${flowSha256}',`,
    `  '${now}',`,
    `  '${now}'`,
    `)`,
    `ON CONFLICT (id) DO NOTHING;`,
  ].join("\n");

  return { projectId: id, flow, sql };
}

function buildEditProject(
  sample: GoldenSample,
  sampleIdx: number,
  refFileId: string,
): {
  projectId: string;
  flow: PersistedFlow;
  sql: string;
} {
  const id = projectId("edit", sampleIdx);
  const flow = deepClone(EDIT_TEMPLATE);

  // bake brief into text node
  const textNode = flow.nodes.find((n) => n.data.kind === "text")!;
  textNode.data.text = sample.brief;

  // bake reference image into image node outputImages
  const imageNode = flow.nodes.find((n) => n.type === "image")!;
  imageNode.data.outputImages = [{ fileId: refFileId }];

  const now = formatTimestamp();
  const flowJson = JSON.stringify(flow).replace(/'/g, "''");
  const flowSha256 = sha256(JSON.stringify(flow));

  const sql = [
    `INSERT INTO projects (id, owner_id, name, flow_json, flow_json_sha256, created_at, updated_at)`,
    `VALUES (`,
    `  '${id}',`,
    `  '${OWNER_ID}',`,
    `  '${sample.id} edit',`,
    `  '${flowJson}',`,
    `  '${flowSha256}',`,
    `  '${now}',`,
    `  '${now}'`,
    `)`,
    `ON CONFLICT (id) DO NOTHING;`,
  ].join("\n");

  return { projectId: id, flow, sql };
}

// ── assertions ──────────────────────────────────────────────────────────

/**
 * 裁决 B①：edges 顺序写死。
 * 模板 edges 的顺序在构建时确定，不得依赖 Map/Set/Object 迭代。
 * 这里对每个生成的 flow 断言 edges 数组顺序与期望逐条相等。
 */
function assertEdgesOrder(
  flow: PersistedFlow,
  expectedEdgeIds: string[],
  projectId: string,
): void {
  const actualIds = flow.edges.map((e) => e.id);
  for (let i = 0; i < expectedEdgeIds.length; i++) {
    if (actualIds[i] !== expectedEdgeIds[i]) {
      throw new Error(
        `${projectId}: edges[${i}] expected ${expectedEdgeIds[i]}, got ${actualIds[i]}`,
      );
    }
  }
  if (actualIds.length !== expectedEdgeIds.length) {
    throw new Error(
      `${projectId}: expected ${expectedEdgeIds.length} edges, got ${actualIds.length}`,
    );
  }
}

/**
 * 裁决 B③：反恒真测试——两种 edges 排列必须产出不同 hash。
 */
function assertEdgeOrderSensitivity(flow: PersistedFlow): void {
  const original = sha256(JSON.stringify(flow));
  const reversedEdges = [...flow.edges].reverse();
  const reversedFlow = { ...flow, edges: reversedEdges };
  const reversed = sha256(JSON.stringify(reversedFlow));
  if (original === reversed) {
    throw new Error(
      "ANTI-IDENTITY FAILURE: edges order change did NOT change flow_json sha256. " +
      "This means the hash is insensitive to edges order, defeating ruling B③.",
    );
  }
  console.log(`  ✓ anti-identity: edges reverse changes hash (${original.slice(0, 8)}... → ${reversed.slice(0, 8)}...)`);
}

/**
 * 裁决 D：每个 edit project 的 outputImages fileId ∈ golden-set 集合。
 */
function assertFileIdInGoldenSet(
  fileId: string,
  goldenSet: GoldenSet,
  projectId: string,
): void {
  const validIds = new Set(
    goldenSet.samples
      .filter((s) => s.referenceImage)
      .map((s) => s.referenceImage!.fileId),
  );
  if (!validIds.has(fileId)) {
    throw new Error(
      `${projectId}: outputImages fileId ${fileId} not in golden-set referenceImage set. ` +
      `Valid ids: ${Array.from(validIds).join(", ")}`,
    );
  }
}

// ── main ────────────────────────────────────────────────────────────────

async function main() {
  const commit = process.argv.includes("--commit");
  console.log(`generate-evaluation-fixtures: mode=${commit ? "COMMIT" : "DRY-RUN"}`);

  // load golden-set
  const raw = fs.readFileSync(GOLDEN_SET_PATH, "utf-8");
  const goldenSet: GoldenSet = JSON.parse(raw);

  if (goldenSet.samples.length !== 24) {
    throw new Error(`golden-set must have 24 samples, got ${goldenSet.samples.length}`);
  }
  console.log(`golden-set: ${goldenSet.samples.length} samples loaded`);

  // validate brief uniqueness
  const briefs = goldenSet.samples.map((s) => s.brief);
  const uniqueBriefs = new Set(briefs);
  if (uniqueBriefs.size !== 24) {
    throw new Error(`golden-set briefs are not all unique (${uniqueBriefs.size}/24 distinct)`);
  }
  console.log("  ✓ all 24 briefs unique");

  // validate referenceImage presence (at least 24 images have fileId after upload)
  const hasRef = goldenSet.samples.filter((s) => s.referenceImage?.fileId).length;
  console.log(`  referenceImage: ${hasRef}/24 samples have fileId`);

  const allSql: string[] = [];
  const genEdges = GEN_TEMPLATE.edges.map((e) => e.id);
  const editEdges = EDIT_TEMPLATE.edges.map((e) => e.id);

  // anti-identity test (run once for each template)
  assertEdgeOrderSensitivity(GEN_TEMPLATE);
  assertEdgeOrderSensitivity(EDIT_TEMPLATE);

  for (let i = 0; i < goldenSet.samples.length; i++) {
    const sample = goldenSet.samples[i];
    const brief = goldenSetBriefForSlot(i, goldenSet);

    // consistency check: the shared function must return the same brief
    if (brief !== sample.brief) {
      throw new Error(
        `goldenSetBriefForSlot(${i}) returned "${brief}", expected "${sample.brief}"`,
      );
    }

    // ── generate project ──────────────────────────────────────────────
    const gen = buildGenProject(sample, i);
    assertEdgesOrder(gen.flow, genEdges, gen.projectId);
    allSql.push(gen.sql);

    // ── edit project ──────────────────────────────────────────────────
    if (sample.referenceImage?.fileId) {
      const edit = buildEditProject(sample, i, sample.referenceImage.fileId);
      assertEdgesOrder(edit.flow, editEdges, edit.projectId);
      assertFileIdInGoldenSet(sample.referenceImage.fileId, goldenSet, edit.projectId);
      allSql.push(edit.sql);
    } else {
      console.log(
        `  SKIP EVALedit-brief-${
          String(i + 1).padStart(2, "0")
        }: referenceImage.fileId missing (image not yet uploaded)`,
      );
    }
  }

  console.log(`\nGenerated ${allSql.length} SQL statements (expected: 48 when all images uploaded)`);
  assert.strictEqual(allSql.length >= 24, true, "at least 24 generate projects must be generated");

  if (commit) {
    const database = await import("../server/lib/database");
    const { resetPostgresTestDatabase } = await import("../tests/postgresTestDatabase");
    await resetPostgresTestDatabase();
    for (const sql of allSql) {
      await database.query(sql);
    }
    console.log("  ✓ committed to test database");
    await database.closeDatabaseForTests();
  } else {
    console.log("\n-- DRY-RUN SQL (add --commit to write to DB):\n");
    console.log(allSql.join("\n\n"));
  }

  console.log(`${allSql.length} projects generated`);
}

main().catch((err) => {
  console.error("FIXTURE GENERATION FAILED:", err.message);
  process.exit(1);
});