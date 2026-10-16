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
          modelId: "gpt-image-2.5-flare-vip",
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
    modelId: "gpt-image-2.5-flare-vip",
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

console.log("项目授权回归测试");

await test("不存在或已删除的 projectId 不能污染运行历史元数据", async () => {
  const response = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      nodes: [{
        id: "result-only", type: "image", position: { x: 0, y: 0 },
        data: { kind: "image", label: "结果", status: "idle", images: [] },
      }],
      edges: [],
      projectId: "missing-project",
      clientRequestId: "missing-project-request",
    }),
  });
  assert.equal(response.status, 404);
});

await test("运行必须绑定项目，且他人与管理员都不能运行项目所有者的画布", async () => {
  const withoutProject = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({ ...flow(), clientRequestId: "missing-project-binding" }),
  });
  assert.equal(withoutProject.status, 400, await withoutProject.text());

  const withoutRequestId = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({ ...flow(), projectId: "owner-project" }),
  });
  assert.equal(withoutRequestId.status, 400, await withoutRequestId.text());

  for (const actor of ["other", "admin"] as const) {
    const denied = await request("/run-plan", actor, {
      method: "POST",
      body: JSON.stringify({
        ...flow(), projectId: "owner-project", clientRequestId: `forbidden-${actor}-request`,
      }),
    });
    assert.equal(denied.status, 403, actor);
    assert.deepEqual(await denied.json(), {
      error: "管理员只能查看其他用户项目，不能运行或修改",
    }, actor);
  }
});

// 真实评估 onlyNodeId/scope 检查随 admission 系统移除而删除。

await test("同 ID 项目不能被其他账号覆盖", async () => {
  const denied = await request("/projects", "other", {
    method: "POST",
    body: JSON.stringify({ id: "owner-project", name: "恶意覆盖", flow: generationFlow("恶意覆盖") }),
  });
  assert.equal(denied.status, 403, await denied.text());
  const row = await queryOne<{ owner_id: string; name: string; flow_json: string }>(
    "SELECT owner_id, name, flow_json FROM projects WHERE id = 'owner-project'",
  );
  assert.equal(row?.owner_id, users.owner.id);
  assert.equal(row?.name, "Owner Project");
  assert.deepEqual(JSON.parse(row?.flow_json ?? "{}"), flow());
});

await test("项目保存接受未知或跨模型 modelOptions，且原样落库不归一化", async () => {
  const freeFlow = editFlow(PNG_DATA_URL);
  freeFlow.nodes[2].data.modelOptions = {
    ...freeFlow.nodes[2].data.modelOptions,
    aspect_ratio: "16:9",
  } as never;
  const response = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({
      id: "free-model-options-project",
      name: "自由模型参数",
      flow: freeFlow,
    }),
  });
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const row = await queryOne<{ flow_json: string }>(
    "SELECT flow_json FROM projects WHERE id = 'free-model-options-project'",
  );
  assert.ok(row, "项目应已落库");
  const persisted = JSON.parse(row.flow_json) as {
    nodes: Array<{ data: { modelOptions?: Record<string, unknown> } }>;
  };
  // R5：自由 key-value，未知/跨模型取值不再被拒绝或归一化，原样保留。
  assert.equal(persisted.nodes[2].data.modelOptions?.aspect_ratio, "16:9");
});


await test("回收站项目不能被同 ID 保存请求隐式复活", async () => {
  await query(`
    INSERT INTO projects (
      id, owner_id, name, flow_json, updated_at, created_at, deleted_at, purge_after
    ) VALUES ('deleted-save-project', $1, '已删除项目', $2, $3, $3, $3, $4)
  `, [users.owner.id, JSON.stringify(flow()), now, new Date(Date.now() + 86_400_000).toISOString()]);
  const response = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({ id: "deleted-save-project", name: "不应复活", flow: flow() }),
  });
  assert.equal(response.status, 409, await response.text());
  const row = await queryOne<{ name: string; deleted_at: string | null }>(
    "SELECT name, deleted_at FROM projects WHERE id = 'deleted-save-project'",
  );
  assert.equal(row?.name, "已删除项目");
  assert.ok(row?.deleted_at);
});

await test("初始草稿名称按上海日期固定生成", () => {
  assert.equal(
    initialDraftProjectName(new Date("2026-08-25T15:59:59.000Z")),
    "未修改项目名称20260825000000",
  );
  assert.equal(
    initialDraftProjectName(new Date("2026-08-25T16:00:00.000Z")),
    "未修改项目名称20260826000000",
  );
});

await test("项目保存按最终画布原子同步可访问素材引用", async () => {
  const save = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({
      id: "owner-project",
      name: "Owner Project",
      flow: flow(["/api/files/shared.png", "/api/files/own-private.png"]),
    }),
  });
  assert.equal(save.status, 200, await save.text());
  const refs = await query<{ asset_id: string }>(
    "SELECT asset_id FROM project_asset_refs WHERE project_id = $1 ORDER BY asset_id",
    ["owner-project"],
  );
  assert.deepEqual(refs, [{ asset_id: "own-private" }, { asset_id: "shared-asset" }]);

  const clear = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({ id: "owner-project", name: "Owner Project", flow: flow() }),
  });
  assert.equal(clear.status, 200, await clear.text());
  const remaining = await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM project_asset_refs WHERE project_id = $1",
    ["owner-project"],
  );
  assert.equal(remaining?.count, 0);
});

await test("素材删除与项目引用写入使用互斥行锁避免 TOCTOU", () => {
  const assetsSource = fs.readFileSync(new URL("../server/routes/assets.ts", import.meta.url), "utf8");
  const projectsSource = fs.readFileSync(new URL("../server/routes/projects.ts", import.meta.url), "utf8");
  assert.match(assetsSource, /SELECT owner_id, scope FROM assets[\s\S]*FOR UPDATE/);
  assert.match(projectsSource, /FROM assets[\s\S]*FOR KEY SHARE/);
});

await test("项目写入先持 owner 锁时，真实账号转移等待并接收刚提交的数据", async () => {
  const sourceKey = "lockTransferSource";
  const targetKey = "lockTransferTarget";
  const source: AuthUser = {
    id: "owner-lock-transfer-source", accountId: sourceKey, displayName: "锁转移来源",
    role: "user", mustChangePassword: false,
  };
  const target: AuthUser = {
    id: "owner-lock-transfer-target", accountId: targetKey, displayName: "锁转移目标",
    role: "user", mustChangePassword: false,
  };
  users[sourceKey] = source;
  users[targetKey] = target;
  const projectId = "owner-lock-order-project";
  const createdAt = new Date().toISOString();
  await query(`
    INSERT INTO users (id, account_id, display_name, role, password_hash, active, created_at, updated_at)
    VALUES
      ($1, $2, $3, 'user', 'test-only', 1, $7, $7),
      ($4, $5, $6, 'user', 'test-only', 1, $7, $7)
  `, [source.id, source.accountId, source.displayName, target.id, target.accountId, target.displayName, createdAt]);
  await query(`
    INSERT INTO projects (id, owner_id, name, flow_json, updated_at, created_at)
    VALUES ($1, $2, '锁顺序旧名称', $3, $4, $4)
  `, [projectId, source.id, JSON.stringify(flow()), createdAt]);
  const projectBlocker = await db().connect();
  let projectBlockerOpen = false;
  let savePromise: Promise<Response> | undefined;
  let transferPromise: Promise<Response> | undefined;
  try {
    await projectBlocker.query("BEGIN");
    projectBlockerOpen = true;
    const blockerPid = (await projectBlocker.query<{ pid: number }>(
      "SELECT pg_backend_pid() AS pid",
    )).rows[0].pid;
    await projectBlocker.query("SELECT id FROM projects WHERE id = $1 FOR UPDATE", [projectId]);

    savePromise = request("/projects", sourceKey, {
      method: "POST",
      body: JSON.stringify({ id: projectId, name: "锁顺序新名称", flow: flow() }),
    });
    let saveBackendPid = 0;
    await waitForDatabaseCondition("项目保存已在 owner guard 后等待项目行锁", async () => {
      const row = await queryOne<{ pid: number }>(`
        SELECT activity.pid FROM pg_stat_activity activity
        WHERE $1::int = ANY(pg_blocking_pids(activity.pid))
          AND activity.query LIKE '%FROM projects WHERE id = $1 FOR UPDATE%'
        LIMIT 1
      `, [blockerPid]);
      saveBackendPid = row?.pid ?? 0;
      return saveBackendPid > 0;
    });

    transferPromise = request(`/auth/users/${source.id}`, "admin", {
      method: "DELETE",
      headers: { cookie: `${SESSION_COOKIE}=${adminSession.token}` },
      body: JSON.stringify({ transferToUserId: target.id }),
    });
    await waitForDatabaseCondition("真实账号转移等待项目保存持有的用户共享锁", async () => {
      const row = await queryOne<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM pg_stat_activity activity
        WHERE $1::int = ANY(pg_blocking_pids(activity.pid))
          AND activity.query LIKE '%SELECT id, active, deleted_at FROM users%FOR NO KEY UPDATE%'
      `, [saveBackendPid]);
      return (row?.count ?? 0) >= 1;
    });

    await projectBlocker.query("COMMIT");
    projectBlockerOpen = false;
    const [saveResponse, transferResponse] = await Promise.all([savePromise, transferPromise]);
    assert.equal(saveResponse.status, 200, await saveResponse.text());
    assert.equal(transferResponse.status, 200, await transferResponse.text());
    assert.deepEqual(await queryOne<{ owner_id: string; name: string }>(`
      SELECT owner_id, name FROM projects WHERE id = $1
    `, [projectId]), { owner_id: target.id, name: "锁顺序新名称" });
    const transferredSource = await queryOne<{ active: number; deleted_at: string | null }>(`
      SELECT active, deleted_at FROM users WHERE id = $1
    `, [source.id]);
    assert.equal(transferredSource?.active, 0);
    assert.ok(transferredSource?.deleted_at);
  } finally {
    if (projectBlockerOpen) await projectBlocker.query("ROLLBACK");
    if (savePromise || transferPromise) {
      await Promise.allSettled([savePromise, transferPromise].filter(Boolean) as Promise<Response>[]);
    }
    projectBlocker.release();
    await query("DELETE FROM project_asset_refs WHERE project_id = $1", [projectId]);
    await query("DELETE FROM projects WHERE id = $1", [projectId]);
    await query("DELETE FROM sessions WHERE user_id = ANY($1::text[])", [[source.id, target.id]]);
    await query("DELETE FROM users WHERE id = ANY($1::text[])", [[source.id, target.id]]);
    delete users[sourceKey];
    delete users[targetKey];
  }
});

await test("真实账号删除先持 owner 锁时，全部并发写入等待后拒绝并补偿文件", async () => {
  const sourceKey = "lockDeleteSource";
  const source: AuthUser = {
    id: "owner-lock-delete-source", accountId: sourceKey, displayName: "锁删除来源",
    role: "user", mustChangePassword: false,
  };
  users[sourceKey] = source;
  const patchAssetId = "owner-lock-patch-asset";
  const restoreAssetId = "owner-lock-restore-asset";
  const existingFileId = "owner-lock-existing.png";
  const runId = "owner-lock-history-run";
  const outputId = "owner-lock-history-output";
  const blockerProjectId = "owner-lock-existing-project";
  const projectId = "owner-lock-blocked-project";
  const createdAt = new Date().toISOString();
  await query(`
    INSERT INTO users (id, account_id, display_name, role, password_hash, active, created_at, updated_at)
    VALUES ($1, $2, $3, 'user', 'test-only', 1, $4, $4)
  `, [source.id, source.accountId, source.displayName, createdAt]);
  await query(`
    INSERT INTO projects (id, owner_id, name, flow_json, updated_at, created_at)
    VALUES ($1, $2, '账号删除锁项目', $3, $4, $4)
  `, [blockerProjectId, source.id, JSON.stringify(flow()), createdAt]);
  await query(`
    INSERT INTO files (id, owner_id, source_type, created_at)
    VALUES ($1, $2, 'upload', $3)
  `, [existingFileId, source.id, createdAt]);
  await query(`
    INSERT INTO assets (
      id, owner_id, scope, name, category, image, created_at, deleted_at, purge_after
    ) VALUES
      ($1, $3, 'private', '锁前名称', 'garment', '/api/files/lock-patch.png', $4, NULL, NULL),
      ($2, $3, 'private', '回收站素材', 'garment', '/api/files/lock-restore.png', $4, $4, $4)
  `, [patchAssetId, restoreAssetId, source.id, createdAt]);
  await query(`
    INSERT INTO generation_runs (
      id, owner_id, node_id, node_label, kind, requested_count, status, started_at, finished_at
    ) VALUES ($1, $2, 'history-node', '历史节点', 'image', 1, 'failed', 1, 2)
  `, [runId, source.id]);
  await query(`
    INSERT INTO generation_outputs (id, run_id, image, status, error, created_at)
    VALUES ($1, $2, '', 'error', '失败', 2)
  `, [outputId, runId]);
  const beforeStored = new Set(fs.readdirSync(uploadsDir()));
  const lifecycleBlocker = await db().connect();
  let lifecycleBlockerOpen = false;
  let deletePromise: Promise<Response> | undefined;
  let responsesPromise: Promise<Response[]> | undefined;
  try {
    await lifecycleBlocker.query("BEGIN");
    lifecycleBlockerOpen = true;
    const blockerPid = (await lifecycleBlocker.query<{ pid: number }>(
      "SELECT pg_backend_pid() AS pid",
    )).rows[0].pid;
    await lifecycleBlocker.query(
      "SELECT id FROM projects WHERE id = $1 FOR UPDATE",
      [blockerProjectId],
    );

    deletePromise = request(`/auth/users/${source.id}`, "admin", {
      method: "DELETE",
      headers: { cookie: `${SESSION_COOKIE}=${adminSession.token}` },
      body: JSON.stringify({ deleteData: true }),
    });
    let lifecyclePid = 0;
    await waitForDatabaseCondition("真实账号删除已持用户锁并等待项目扫描", async () => {
      const row = await queryOne<{ pid: number }>(`
        SELECT activity.pid FROM pg_stat_activity activity
        WHERE $1::int = ANY(pg_blocking_pids(activity.pid))
          AND activity.query LIKE '%UPDATE projects SET deleted_at%'
        LIMIT 1
      `, [blockerPid]);
      lifecyclePid = row?.pid ?? 0;
      return lifecyclePid > 0;
    });

    responsesPromise = Promise.all([
      request("/projects", sourceKey, {
        method: "POST",
        body: JSON.stringify({ id: projectId, name: "被阻止项目", flow: flow() }),
      }),
      request("/files", sourceKey, {
        method: "POST",
        body: JSON.stringify({ dataUrl: PNG_DATA_URL }),
      }),
      request("/assets", sourceKey, {
        method: "POST",
        body: JSON.stringify({
          name: "被阻止素材", category: "garment", scope: "private", image: PNG_DATA_URL,
        }),
      }),
      request(`/assets/${patchAssetId}`, sourceKey, {
        method: "PATCH",
        body: JSON.stringify({ name: "不应写入的新名称" }),
      }),
      request(`/assets/${restoreAssetId}/restore`, sourceKey, { method: "POST" }),
      request(`/history/${outputId}`, sourceKey, { method: "DELETE" }),
    ]);
    await waitForDatabaseCondition("六类 owner 写请求均等待真实账号删除锁", async () => {
      const row = await queryOne<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM pg_stat_activity activity
        WHERE $1::int = ANY(pg_blocking_pids(activity.pid))
          AND activity.query LIKE '%SELECT active, deleted_at FROM users%FOR SHARE%'
      `, [lifecyclePid]);
      return (row?.count ?? 0) >= 6;
    });

    await lifecycleBlocker.query("COMMIT");
    lifecycleBlockerOpen = false;
    const [deleteResponse, responses] = await Promise.all([deletePromise, responsesPromise]);
    assert.equal(deleteResponse.status, 200, await deleteResponse.text());
    assert.deepEqual(responses.map((response) => response.status), [409, 409, 409, 409, 409, 409]);

    assert.equal(await queryOne("SELECT id FROM projects WHERE id = $1", [projectId]), undefined);
    assert.equal(await queryOne("SELECT id FROM assets WHERE name = '被阻止素材'"), undefined);
    for (const [table, id] of [
      ["projects", blockerProjectId],
      ["files", existingFileId],
      ["assets", patchAssetId],
      ["assets", restoreAssetId],
      ["generation_runs", runId],
    ] as const) {
      assert.ok((await queryOne<{ deleted_at: string | null }>(
        `SELECT deleted_at FROM ${table} WHERE id = $1`,
        [id],
      ))?.deleted_at, `${table}/${id} 应进入回收期`);
    }
    assert.equal((await queryOne<{ name: string }>(
      "SELECT name FROM assets WHERE id = $1",
      [patchAssetId],
    ))?.name, "锁前名称");
    assert.ok(await queryOne("SELECT id FROM generation_outputs WHERE id = $1", [outputId]));
    assert.deepEqual(new Set(fs.readdirSync(uploadsDir())), beforeStored);
  } finally {
    if (lifecycleBlockerOpen) await lifecycleBlocker.query("ROLLBACK");
    if (deletePromise || responsesPromise) {
      await Promise.allSettled([deletePromise, responsesPromise].filter(Boolean) as Promise<unknown>[]);
    }
    lifecycleBlocker.release();
    await query("DELETE FROM generation_outputs WHERE run_id = $1", [runId]);
    await query("DELETE FROM generation_jobs WHERE run_id = $1", [runId]);
    await query("DELETE FROM generation_run_steps WHERE run_id = $1", [runId]);
    await query("DELETE FROM usage_events WHERE run_id = $1", [runId]);
    await query("DELETE FROM generation_runs WHERE id = $1", [runId]);
    await query("DELETE FROM project_asset_refs WHERE project_id = ANY($1::text[])", [
      [projectId, blockerProjectId],
    ]);
    await query("DELETE FROM projects WHERE id = ANY($1::text[])", [[projectId, blockerProjectId]]);
    await query("DELETE FROM assets WHERE id = ANY($1::text[]) OR name = '被阻止素材'", [
      [patchAssetId, restoreAssetId],
    ]);
    await query("DELETE FROM files WHERE id = $1", [existingFileId]);
    await query("DELETE FROM sessions WHERE user_id = $1", [source.id]);
    await query("DELETE FROM users WHERE id = $1", [source.id]);
    delete users[sourceKey];
    const leakedFiles = fs.readdirSync(uploadsDir()).filter((id) => !beforeStored.has(id));
    if (leakedFiles.length > 0) {
      await query("DELETE FROM files WHERE id = ANY($1::text[])", [leakedFiles]);
      leakedFiles.forEach(deleteStoredImage);
    }
  }
});


console.log(`\n通过 ${passed} 项`);
await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
await closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
