import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import express, { type Request } from "express";
import type { AddressInfo } from "node:net";
import type { AuthenticatedRequest, AuthUser } from "../server/lib/auth";
import type { ExecutionPlan } from "../src/types/workflow";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-authorization-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "authorization-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const { closeDatabaseForTests, db, initializeDatabase, query, queryOne } = await import("../server/lib/database");
const { deleteStoredImage, uploadsDir } = await import("../server/lib/fileStore");
const { createSession, SESSION_COOKIE } = await import("../server/lib/auth");
const { enqueueGenerationRun } = await import("../server/engine/runQueue");
const { buildExecutionPlan } = await import("../server/engine/dag");
const { authRouter } = await import("../server/routes/auth");
const { runPlanRouter, staticImageReferencesForPlan } = await import("../server/routes/runPlan");
const { generateRouter } = await import("../server/routes/generate");
const { assetsRouter } = await import("../server/routes/assets");
const { filesRouter } = await import("../server/routes/files");
const {
  initialDraftProjectName,
  projectsRouter,
  purgeExpiredProjects,
} = await import("../server/routes/projects");
const { usageRouter } = await import("../server/routes/usage");
const { historyRouter } = await import("../server/routes/history");
// v9（64 Phase 3）：variant 绑定概念已删——夹具直给模型/模式/参数（值与原参数档案
// materialize 等价：gemini commerce-hero generate → aspectRatio "1:1" + imageSize "2K"；
// flare-vip commerce-hero edit → aspectRatio "1:1" + size "2048x2048"）。
const GENERATE_MODEL_OPTIONS = { aspectRatio: "1:1", imageSize: "2K" };
const GENERATE_ASPECT_RATIO = "1:1";
const EDIT_MODEL_OPTIONS = { size: "2048x2048" };
const EDIT_ASPECT_RATIO = "1:1";

const users: Record<string, AuthUser> = {
  owner: {
    id: "user-owner",
    accountId: "owner",
    displayName: "Owner",
    role: "user",
    mustChangePassword: false,
  },
  other: {
    id: "user-other",
    accountId: "other",
    displayName: "Other",
    role: "user",
    mustChangePassword: false,
  },
  admin: {
    id: "user-admin",
    accountId: "admin",
    displayName: "Admin",
    role: "admin",
    mustChangePassword: false,
  },
};

let passed = 0;
const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const TRUNCATED_PNG_DATA_URL = "data:image/png;base64,iVBORw0KGgo=";
async function test(name: string, fn: () => void | Promise<void>) {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

function promptTextNode(text: string) {
  return {
    id: "prompt",
    type: "text",
    position: { x: 0, y: 0 },
    data: { kind: "text", label: "提示词", status: "idle", text },
  };
}

function promptEdge(id: string, target: string) {
  return { id, source: "prompt", target, targetHandle: "prompt", data: {} };
}

function flow(images: string[] = []) {
  return {
    schemaVersion: 7,
    nodes: [
      promptTextNode("授权测试"),
      ...images.map((imageUrl, index) => ({
        id: `image_${index}`,
        type: "image",
        position: { x: (index + 1) * 100, y: 0 },
        data: {
          kind: "image",
          label: `图片 ${index + 1}`,
          status: "idle",
          aspectRatio: "1:1",
          batchSize: 1,
          outputImages: [imageUrl],
        },
      })),
    ],
    edges: images.map((_, index) => promptEdge(`prompt-image-${index}`, `image_${index}`)),
  };
}

function generationFlow(prompt: string) {
  // 64 Phase 1：v9 夹具——variant 绑定六字段删除；operationMode 缺省 generate（无参考图）。
  return {
    schemaVersion: 9,
    nodes: [
      promptTextNode(prompt),
      {
        id: "generate",
        type: "image-generator",
        position: { x: 320, y: 0 },
        data: {
          kind: "image-generator",
          label: "生成效果图",
          status: "idle",
          modelId: "gemini-3.1-flash-image",
          modelOptions: GENERATE_MODEL_OPTIONS,
          aspectRatio: GENERATE_ASPECT_RATIO,
          batchSize: 1,
        },
      },
    ],
    edges: [promptEdge("prompt-generate", "generate")],
  };
}

function editFlow(imageUrl: string) {
  // 64 Phase 1：v9 夹具——variant 绑定六字段删除；operationMode 显式 edit（带参考图）。
  return {
    schemaVersion: 9,
    nodes: [
      promptTextNode("改成短袖"),
      {
        id: "source",
        type: "image",
        position: { x: 320, y: 0 },
        data: {
          kind: "image",
          label: "原图",
          status: "idle",
          outputImages: [imageUrl],
        },
      },
      {
        id: "edit",
        type: "image-generator",
        position: { x: 640, y: 0 },
        data: {
          kind: "image-generator",
          label: "改款",
          status: "idle",
          operationMode: "edit",
          modelId: "gpt-image-2.5-flare",
          modelOptions: EDIT_MODEL_OPTIONS,
          aspectRatio: EDIT_ASPECT_RATIO,
          batchSize: 1,
        },
      },
    ],
    edges: [
      promptEdge("prompt-edit", "edit"),
      { id: "source-edit", source: "source", target: "edit", targetHandle: "reference", data: {} },
    ],
  };
}

function independentEditFlow(firstImageUrl: string, secondImageUrl: string) {
  const first = editFlow(firstImageUrl);
  const second = editFlow(secondImageUrl);
  return {
    schemaVersion: 9,
    nodes: [
      { ...first.nodes[0], id: "prompt-a" },
      { ...first.nodes[1], id: "source-a" },
      { ...first.nodes[2], id: "edit-a" },
      { ...second.nodes[0], id: "prompt-b" },
      { ...second.nodes[1], id: "source-b" },
      { ...second.nodes[2], id: "edit-b" },
    ],
    edges: [
      { ...first.edges[0], id: "prompt-a-edit-a", source: "prompt-a", target: "edit-a" },
      { ...first.edges[1], id: "source-a-edit-a", source: "source-a", target: "edit-a" },
      { ...second.edges[0], id: "prompt-b-edit-b", source: "prompt-b", target: "edit-b" },
      { ...second.edges[1], id: "source-b-edit-b", source: "source-b", target: "edit-b" },
    ],
  };
}

function branchedEditFlow(imageUrl: string) {
  const base = editFlow(imageUrl);
  const firstEdit = { ...base.nodes[2], id: "edit-a" };
  const secondEdit = {
    ...base.nodes[2],
    id: "edit-b",
    position: { x: 640, y: 240 },
  };
  const secondPrompt = { ...base.nodes[0], id: "prompt-b", position: { x: 0, y: 240 } };
  return {
    schemaVersion: 9,
    nodes: [base.nodes[0], base.nodes[1], firstEdit, secondPrompt, secondEdit],
    edges: [
      { ...base.edges[0], id: "prompt-edit-a", target: "edit-a" },
      { ...base.edges[1], id: "source-edit-a", source: "source", target: "edit-a" },
      { ...base.edges[0], id: "prompt-edit-b", source: "prompt-b", target: "edit-b" },
      { ...base.edges[1], id: "source-edit-b", source: "source", target: "edit-b" },
    ],
  };
}

function chainedEditFlow(sourceImageUrl: string, savedFirstOutput: string) {
  const base = editFlow(sourceImageUrl);
  const firstEdit = {
    ...base.nodes[2],
    id: "edit-first",
  };
  const resultOfFirst = {
    id: "result-first",
    type: "result-image",
    position: { x: 960, y: 0 },
    data: {
      kind: "result-image", label: "第一次结果", status: "idle",
      images: [savedFirstOutput],
      sourceGeneratorId: "edit-first",
      runId: "chained-run",
    },
  };
  const secondPrompt = { ...base.nodes[0], id: "prompt-b" };
  const secondEdit = {
    ...base.nodes[2],
    id: "edit-second",
    position: { x: 1280, y: 0 },
  };
  return {
    schemaVersion: 9,
    nodes: [base.nodes[0], base.nodes[1], firstEdit, resultOfFirst, secondPrompt, secondEdit],
    edges: [
      { ...base.edges[0], id: "prompt-edit-first", target: "edit-first" },
      { ...base.edges[1], id: "source-edit-first", source: "source", target: "edit-first" },
      { id: "result-first-edit-second", source: "result-first", target: "edit-second", targetHandle: "reference", data: {} },
      { ...base.edges[0], id: "prompt-edit-second", source: "prompt-b", target: "edit-second" },
    ],
  };
}

await initializeDatabase();
const now = new Date().toISOString();
for (const user of Object.values(users)) {
  await query(`
    INSERT INTO users (id, account_id, display_name, role, password_hash, active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, 'test-only', 1, $5, $5)
  `, [user.id, user.accountId, user.displayName, user.role, now]);
}
const adminSession = await createSession(users.admin.id, { markExistingAsReplaced: false });

// 自包含：原单文件在素材区统一落库共享种子；拆分后各文件独立 reset，需自建。
await query(`
  INSERT INTO files (id, owner_id, source_type, created_at)
  VALUES
    ('shared.png', $1, 'legacy', $3),
    ('private.png', $2, 'legacy', $3),
    ('own-private.png', $1, 'legacy', $3)
`, [users.owner.id, users.other.id, now]);
for (const id of ["shared.png", "private.png", "own-private.png"]) writeTestPng(id);
await query(`
  INSERT INTO assets (id, owner_id, scope, name, category, image, created_at)
  VALUES
    ('shared-asset', $1, 'shared', '共享素材', 'garment', '/api/files/shared.png', $3),
    ('other-private', $2, 'private', '他人私有素材', 'garment', '/api/files/private.png', $3),
    ('own-private', $1, 'private', '本人私有素材', 'garment', '/api/files/own-private.png', $3)
`, [users.owner.id, users.other.id, now]);
await query(`
  INSERT INTO projects (id, owner_id, name, flow_json, updated_at, created_at)
  VALUES ('owner-project', $1, 'Owner Project', $2, $3, $3)
`, [users.owner.id, JSON.stringify(flow()), now]);

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  const user = users[String(req.headers["x-test-user"] ?? "")];
  if (!user) {
    res.status(401).json({ error: "test user required" });
    return;
  }
  (req as AuthenticatedRequest).authUser = user;
  next();
});
app.use("/auth", authRouter);
app.use("/run-plan", runPlanRouter);
app.use("/generate", generateRouter);
app.use("/assets", assetsRouter);
app.use("/files", filesRouter);
app.use("/projects", projectsRouter);
app.use("/usage", usageRouter);
app.use("/history", historyRouter);

const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve, reject) => {
  server.once("listening", resolve);
  server.once("error", reject);
});
const address = server.address() as AddressInfo;
const baseUrl = `http://127.0.0.1:${address.port}`;

function request(pathname: string, user: keyof typeof users, init: RequestInit = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-test-user": user,
      ...init.headers,
    },
  });
}

async function waitForDatabaseCondition(
  description: string,
  condition: () => Promise<boolean>,
  timeoutMs = 5_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`等待数据库条件超时：${description}`);
}

function directGenerateBody(referenceImage: string, projectId?: string, clientRequestId = "direct-request") {
  return {
    clientRequestId,
    modelId: "gpt-image-2.5-flare",
    kind: "image-generator",
    projectId,
    projectName: "客户端伪造名称",
    nodeId: "direct-edit",
    request: {
      // v9 直连（64 Phase 1/3）：request.prompt 是纯用户正文；variant 绑定字段已删除，
      // operationMode 显式携带（裁决 A），系统文本由 runner 冻结映射拼装（裁决 E）。
      prompt: "改成短袖",
      operationMode: "edit",
      aspectRatio: EDIT_ASPECT_RATIO,
      batchSize: 1,
      references: [{
        dataUrl: referenceImage,
        order: 0,
        assetSha256: "a".repeat(64),
      }],
      modelOptions: EDIT_MODEL_OPTIONS,
    },
  };
}

function writeTestPng(id: string): void {
  fs.writeFileSync(
    path.join(uploadsDir(), id),
    Buffer.from(PNG_DATA_URL.slice(PNG_DATA_URL.indexOf(",") + 1), "base64"),
  );
}

console.log("历史与用量授权回归测试");

await test("历史记录只有所有者能删除，其他人与不存在记录统一返回 404", async () => {
  await query(`
    INSERT INTO generation_runs (
      id, owner_id, node_id, node_label, kind, requested_count, status, started_at, finished_at
    ) VALUES
      ('history-other-run', $1, 'node', '节点', 'image', 1, 'error', 1, 2),
      ('history-owner-run', $2, 'node', '节点', 'image', 1, 'error', 1, 2)
  `, [users.other.id, users.owner.id]);
  await query(`
    INSERT INTO generation_outputs (id, run_id, image, status, error, created_at)
    VALUES
      ('history-other-output', 'history-other-run', '', 'error', '失败', 2),
      ('history-owner-output', 'history-owner-run', '', 'error', '失败', 2)
  `);
  assert.equal((await request("/history/history-other-output", "owner", { method: "DELETE" })).status, 404);
  assert.equal((await request("/history/missing-output", "owner", { method: "DELETE" })).status, 404);
  assert.equal((await request("/history/history-owner-output", "owner", { method: "DELETE" })).status, 200);
  assert.equal(await queryOne("SELECT id FROM generation_outputs WHERE id = 'history-owner-output'"), undefined);
});

interface HistoryPage {
  records: Array<{
    id: string;
    runId: string;
    clientRequestId?: string;
    status?: string;
    parameters?: unknown;
    referenceImages?: unknown;
  }>;
  nextCursor: string | null;
  hasMore: boolean;
}

await test("普通历史不会把无执行计划的旧活动状态恢复成正在运行", async () => {
  const runIds = ["legacy-planless-active", "legacy-planless-terminal"];
  try {
    await query(`
      INSERT INTO generation_runs (
        id, owner_id, node_id, node_label, kind, requested_count, status, started_at, finished_at
      ) VALUES
        ($1, $3, 'legacy-active-node', '旧活动任务', 'image', 1, 'queued', 95000, NULL),
        ($2, $3, 'legacy-terminal-node', '旧终态任务', 'image', 1, 'failed', 94000, 94001)
    `, [runIds[0], runIds[1], users.owner.id]);

    const response = await request("/history?limit=20&before=100000", "owner");
    assert.equal(response.status, 200);
    const page = await response.json() as HistoryPage;
    assert.equal(page.records.some((record) => record.runId === runIds[0]), false);
    assert.equal(page.records.some((record) => record.runId === runIds[1]), true);
  } finally {
    await query("DELETE FROM generation_runs WHERE id = ANY($1::text[])", [runIds]);
  }
});

await test("活动任务使用独立完整集合，不会被最近历史的 20 条分页截断", async () => {
  const ids = ["old-active-run"];
  try {
    await query(`
      INSERT INTO generation_runs (
        id, owner_id, node_id, node_label, kind, requested_count, status, started_at,
        plan_json, client_request_id, request_fingerprint
      ) VALUES (
        'old-active-run', $1, 'old-active-node', '旧活动任务', 'image', 1, 'running', 90000,
        '{"steps":[]}', 'old-active-request', 'old-active-fingerprint'
      )
    `, [users.owner.id]);
    for (let index = 0; index < 25; index += 1) {
      const id = `newer-terminal-${index}`;
      ids.push(id);
      await query(`
        INSERT INTO generation_runs (
          id, owner_id, node_id, node_label, kind, requested_count, status, started_at,
          finished_at, plan_json
        ) VALUES ($1, $2, 'terminal-node', '新终态', 'image', 1, 'failed', $3, $3, '{"steps":[]}')
      `, [id, users.owner.id, 100000 + index]);
    }

    const recent = await request("/history?limit=20&before=200000", "owner");
    assert.equal(recent.status, 200);
    const recentPage = await recent.json() as HistoryPage;
    assert.equal(recentPage.records.some((record) => record.runId === "old-active-run"), false);

    const active = await request("/history/active", "owner");
    const activePage = await active.json() as HistoryPage;
    assert.equal(active.status, 200, JSON.stringify(activePage));
    const oldActive = activePage.records.find((record) => record.runId === "old-active-run");
    assert.equal(oldActive?.status, "running");
    assert.equal(oldActive?.clientRequestId, "old-active-request");
    assert.equal(oldActive?.parameters, undefined, "活动恢复接口不得回传大参数体");
    assert.equal(oldActive?.referenceImages, undefined, "活动恢复接口不得回传参考图数组");
    assert.equal(activePage.hasMore, false);
  } finally {
    await query("DELETE FROM generation_runs WHERE id = ANY($1::text[])", [ids]);
  }
});

await test("活动任务超过安全恢复上限时接口 fail-closed", async () => {
  // 自包含：原单文件由前序用例落库 run-persisted-project；拆分后各文件独立 reset，需自建。
  const setupSave = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({
      id: "run-persisted-project",
      name: "服务端项目名",
      flow: generationFlow("后来保存的提示词"),
    }),
  });
  assert.equal(setupSave.status, 200, await setupSave.text());
  try {
    await query(`
      INSERT INTO generation_runs (
        id, owner_id, node_id, node_label, kind, requested_count, status, started_at, plan_json
      )
      SELECT
        'active-overflow-' || index, $1, 'active-overflow-node-' || index,
        '活动任务上限', 'image', 1, 'running', 300000 + index, '{"steps":[]}'
      FROM generate_series(1, 181) AS index
    `, [users.owner.id]);
    const response = await request("/history/active", "owner");
    assert.equal(response.status, 409, await response.text());
    const enqueue = await request("/run-plan", "owner", {
      method: "POST",
      body: JSON.stringify({
        ...generationFlow("后来保存的提示词"),
        onlyNodeId: "generate",
        projectId: "run-persisted-project",
        clientRequestId: "active-overflow-new-request",
      }),
    });
    const enqueueBody = await enqueue.text();
    assert.equal(enqueue.status, 409, enqueueBody);
    assert.match(enqueueBody, /活动任务.*上限/);
    assert.equal(
      await queryOne("SELECT id FROM generation_runs WHERE client_request_id = 'active-overflow-new-request'"),
      undefined,
    );
  } finally {
    await query("DELETE FROM generation_runs WHERE id LIKE 'active-overflow-%'");
  }
});

await test("历史分页固定在首次快照，期间新增记录不会推移游标造成缺口", async () => {
  for (const [id, startedAt] of [["snapshot-3", 3_000], ["snapshot-2", 2_000], ["snapshot-1", 1_000]] as const) {
    await query(`
      INSERT INTO generation_runs (
        id, owner_id, node_id, node_label, kind, requested_count, status, started_at, finished_at
      ) VALUES ($1, $2, 'node', '节点', 'image', 1, 'error', $3, $3)
    `, [id, users.owner.id, startedAt]);
    await query(`
      INSERT INTO generation_outputs (id, run_id, image, status, error, created_at)
      VALUES ($1, $2, '', 'error', '失败', $3)
    `, [`${id}-output`, id, startedAt]);
  }
  const first = await request("/history?limit=1&before=2500", "owner");
  assert.equal(first.status, 200);
  const firstPage = await first.json() as HistoryPage;
  assert.equal(firstPage.records[0].runId, "snapshot-2");
  assert.equal(firstPage.hasMore, true);
  assert.ok(firstPage.nextCursor);
  await query(`
    INSERT INTO generation_runs (
      id, owner_id, node_id, node_label, kind, requested_count, status, started_at, finished_at
    ) VALUES ('snapshot-new', $1, 'node', '节点', 'image', 1, 'error', 4000, 4000)
  `, [users.owner.id]);
  await query(`
    INSERT INTO generation_outputs (id, run_id, image, status, error, created_at)
    VALUES ('snapshot-new-output', 'snapshot-new', '', 'error', '失败', 4000)
  `);
  const second = await request(
    `/history?limit=1&cursor=${encodeURIComponent(firstPage.nextCursor ?? "")}`,
    "owner",
  );
  assert.equal(second.status, 200);
  assert.equal(((await second.json()) as HistoryPage).records[0].runId, "snapshot-1");
});

await test("运行任务完成并展开为多条输出时不会令下一页漏项或重复", async () => {
  for (const [id, startedAt, status] of [
    ["cursor-running", 7_000, "running"],
    ["cursor-second", 6_000, "error"],
    ["cursor-third", 5_000, "error"],
  ] as const) {
    await query(`
      INSERT INTO generation_runs (
        id, owner_id, node_id, node_label, kind, requested_count, status, started_at, finished_at,
        plan_json
      ) VALUES ($1, $2, 'node', '节点', 'image', 2, $3, $4, $4, $5)
    `, [id, users.owner.id, status, startedAt, status === "running" ? '{"steps":[]}' : null]);
    if (status === "error") {
      await query(`
        INSERT INTO generation_outputs (id, run_id, image, status, error, created_at)
        VALUES ($1, $2, '', 'error', '失败', $3)
      `, [`${id}-output`, id, startedAt]);
    }
  }

  const first = await request("/history?limit=2&before=7500", "owner");
  assert.equal(first.status, 200);
  const firstPage = await first.json() as HistoryPage;
  assert.deepEqual(firstPage.records.map((record) => record.runId), ["cursor-running", "cursor-second"]);
  assert.ok(firstPage.nextCursor);

  await query(`
    INSERT INTO generation_outputs (id, run_id, image, status, created_at) VALUES
      ('cursor-running-output-1', 'cursor-running', '/api/files/cursor-1.png', 'success', 7100),
      ('cursor-running-output-2', 'cursor-running', '/api/files/cursor-2.png', 'success', 7101)
  `);
  await query(
    "UPDATE generation_runs SET status = 'success', successful_count = 2, finished_at = 7101 WHERE id = 'cursor-running'",
  );

  const second = await request(
    `/history?limit=2&cursor=${encodeURIComponent(firstPage.nextCursor ?? "")}`,
    "owner",
  );
  assert.equal(second.status, 200);
  const secondPage = await second.json() as HistoryPage;
  assert.equal(secondPage.records[0].runId, "cursor-third");
  assert.equal(secondPage.records.some((record) => record.runId === "cursor-running"), false);
  assert.equal(secondPage.records.some((record) => record.runId === "cursor-second"), false);
});

await query("UPDATE users SET display_name = $1 WHERE id = $2", [
  "  =HYPERLINK(\"https://example.invalid\",\"打开\")",
  users.owner.id,
]);
await query(`
  INSERT INTO generation_runs (
    id, owner_id, project_id, node_id, node_label, kind, model,
    requested_count, successful_count, provider_requests, status, started_at, finished_at
  ) VALUES
    ('usage-owner-run', $1, '+PROJECT', '@NODE', '测试节点', 'image', '-MODEL', 1, 1, 1, 'success', 1, 2),
    ('usage-other-run', $2, 'other-project', 'other-node', '其他节点', 'image', 'safe-model', 1, 1, 1, 'success', 1, 2)
`, [users.owner.id, users.other.id]);
await query(`
  INSERT INTO usage_events (
    id, owner_id, run_id, project_id, node_id, model,
    successful_count, provider_requests, duration_ms, created_at
  ) VALUES
    ('usage-owner', $1, 'usage-owner-run', '+PROJECT', '@NODE', '-MODEL', 1, 1, 1, $3),
    ('usage-other', $2, 'usage-other-run', 'other-project', 'other-node', 'safe-model', 1, 1, 1, $3)
`, [users.owner.id, users.other.id, now]);

await test("消耗记录按用户隔离，管理员可查看全部且响应禁止缓存", async () => {
  const forbidden = await request(`/usage?userId=${users.other.id}`, "owner");
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.headers.get("cache-control"), "no-store");

  const ownerResponse = await request("/usage?all=true", "owner");
  assert.equal(ownerResponse.status, 200);
  assert.equal(ownerResponse.headers.get("cache-control"), "no-store");
  const ownerRows = await ownerResponse.json() as Array<{ id: string }>;
  assert.deepEqual(ownerRows.map((row) => row.id), ["usage-owner"]);

  const adminResponse = await request("/usage?all=true", "admin");
  assert.equal(adminResponse.status, 200);
  assert.deepEqual(
    (await adminResponse.json() as Array<{ id: string }>).map((row) => row.id).sort(),
    ["usage-other", "usage-owner"],
  );
});

await test("CSV 导出阻断公式注入并设置安全下载响应头", async () => {
  const response = await request("/usage?all=true&format=csv", "admin");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type") ?? "", /^text\/csv;\s*charset=utf-8/i);
  assert.match(response.headers.get("content-disposition") ?? "", /^attachment; filename="usage-\d{4}-\d{2}-\d{2}\.csv"$/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");

  const csvBytes = Buffer.from(await response.arrayBuffer());
  assert.deepEqual([...csvBytes.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  const csv = csvBytes.subarray(3).toString("utf8");
  assert.ok(csv.startsWith("记录ID,"));
  assert.match(csv, /"'  =HYPERLINK\(""https:\/\/example\.invalid"",""打开""\)"/);
  assert.match(csv, /,'\+PROJECT,'@NODE,'-MODEL,1,1,1,/);
  assert.match(csv, /\r\n/);
});


console.log(`\n通过 ${passed} 项`);
await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
await closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
