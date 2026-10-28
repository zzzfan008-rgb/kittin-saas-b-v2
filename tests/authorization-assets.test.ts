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

console.log("素材引用授权回归测试");

await test("Run 状态与 SSE 仅任务所有者可读，管理员也不隐式越权", async () => {
  const plan = buildExecutionPlan([
    {
      id: "prompt",
      type: "text",
      data: { kind: "text", label: "提示词", status: "idle", text: "授权测试" },
    },
    {
      id: "result",
      type: "image-generator",
      data: {
        kind: "image-generator", label: "结果", status: "idle",
        operationMode: "edit",
        modelId: "gpt-image-2.5-flare",
        aspectRatio: "3:4", batchSize: 1,
      },
    },
  ], [
    { id: "prompt-edge", source: "prompt", target: "result", targetHandle: "prompt" },
  ]);
  const run = await enqueueGenerationRun(plan, users.owner.id, {
    userId: users.owner.id,
    nodeId: "result",
    nodeLabel: "结果",
    kind: "image-generator",
    requestedCount: 1,
  });

  assert.equal((await request(`/run-plan/${run.id}`, "owner")).status, 200);
  assert.equal((await request(`/run-plan/${run.id}`, "other")).status, 404);
  assert.equal((await request(`/run-plan/${run.id}`, "admin")).status, 404);
  assert.equal((await request(`/run-plan/${run.id}/events`, "other")).status, 404);
});

await test("所有鉴权图片禁止缓存，撤回共享后立即恢复访问控制", async () => {
  const upload = await request("/files", "owner", {
    method: "POST",
    body: JSON.stringify({
      dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    }),
  });
  const uploaded = await upload.json() as { id: string; url: string; error?: string };
  assert.equal(upload.status, 200, uploaded.error);

  const hijack = await request("/assets", "other", {
    method: "POST",
    body: JSON.stringify({
      name: "越权共享", category: "garment", scope: "shared", image: uploaded.url,
    }),
  });
  assert.equal(hijack.status, 404);

  for (const pathname of [`/files/${uploaded.id}`, `/files/${uploaded.id}/thumbnail`]) {
    const privateResponse = await request(pathname, "owner");
    assert.equal(privateResponse.status, 200);
    assert.equal(privateResponse.headers.get("cache-control"), "private, no-store");
    assert.match(privateResponse.headers.get("vary") ?? "", /(?:^|,\s*)Cookie(?:,|$)/i);
    await privateResponse.arrayBuffer();

    assert.equal((await request(pathname, "other")).status, 403);
  }

  await query(`
    INSERT INTO assets (id, owner_id, scope, name, category, image, created_at)
    VALUES ('uploaded-shared-asset', $1, 'shared', '可共享图片', 'garment', $2, $3)
  `, [users.owner.id, uploaded.url, now]);

  for (const pathname of [`/files/${uploaded.id}`, `/files/${uploaded.id}/thumbnail`]) {
    const sharedResponse = await request(pathname, "other");
    assert.equal(sharedResponse.status, 200);
    assert.equal(sharedResponse.headers.get("cache-control"), "private, no-store");
    assert.match(sharedResponse.headers.get("vary") ?? "", /(?:^|,\s*)Cookie(?:,|$)/i);
    await sharedResponse.arrayBuffer();
  }

  const revoke = await request("/assets/uploaded-shared-asset", "owner", {
    method: "PATCH",
    body: JSON.stringify({ scope: "private" }),
  });
  assert.equal(revoke.status, 200, await revoke.text());

  for (const pathname of [`/files/${uploaded.id}`, `/files/${uploaded.id}/thumbnail`]) {
    const denied = await request(pathname, "other");
    assert.equal(denied.status, 403);
    await denied.arrayBuffer();

    const ownerResponse = await request(pathname, "owner");
    assert.equal(ownerResponse.status, 200);
    assert.equal(ownerResponse.headers.get("cache-control"), "private, no-store");
    assert.match(ownerResponse.headers.get("vary") ?? "", /(?:^|,\s*)Cookie(?:,|$)/i);
    await ownerResponse.arrayBuffer();
  }
});

await test("没有 files 元数据的物理孤儿文件拒绝所有账号读取", async () => {
  const orphanId = "purge-failed-orphan.png";
  fs.writeFileSync(
    path.join(uploadsDir(), orphanId),
    Buffer.from(PNG_DATA_URL.slice(PNG_DATA_URL.indexOf(",") + 1), "base64"),
  );
  assert.equal(await queryOne("SELECT id FROM files WHERE id = $1", [orphanId]), undefined);
  for (const actor of ["owner", "other", "admin"] as const) {
    assert.equal((await request(`/files/${orphanId}`, actor)).status, 403);
    assert.equal((await request(`/files/${orphanId}/thumbnail`, actor)).status, 403);
  }
  deleteStoredImage(orphanId);
});

await test("owner_id 为 NULL 且无显式共享素材的文件拒绝所有账号读取", async () => {
  const unownedId = "unowned-orphan.png";
  await query(`
    INSERT INTO files (id, owner_id, source_type, created_at)
    VALUES ($1, NULL, 'legacy', $2)
  `, [unownedId, now]);
  assert.equal(
    (await queryOne<{ owner_id: string | null }>(
      "SELECT owner_id FROM files WHERE id = $1",
      [unownedId],
    ))?.owner_id,
    null,
  );
  writeTestPng(unownedId);
  try {
    for (const actor of ["owner", "other", "admin"] as const) {
      assert.equal((await request(`/files/${unownedId}`, actor)).status, 403);
      assert.equal((await request(`/files/${unownedId}/thumbnail`, actor)).status, 403);
    }
  } finally {
    await query("DELETE FROM files WHERE id = $1", [unownedId]);
    deleteStoredImage(unownedId);
  }
});

await test("管理员创建通用素材时解除底层文件的个人归属", async () => {
  const upload = await request("/files", "admin", {
    method: "POST",
    body: JSON.stringify({
      dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    }),
  });
  const uploaded = await upload.json() as { id: string; url: string; error?: string };
  assert.equal(upload.status, 200, uploaded.error);

  const create = await request("/assets", "admin", {
    method: "POST",
    body: JSON.stringify({
      name: "通用素材", category: "garment", scope: "global", image: uploaded.url,
    }),
  });
  assert.equal(create.status, 201, await create.text());
  assert.deepEqual(
    await queryOne<{ owner_id: string | null; deleted_at: string | null; purge_after: string | null }>(
      "SELECT owner_id, deleted_at, purge_after FROM files WHERE id = $1",
      [uploaded.id],
    ),
    { owner_id: null, deleted_at: null, purge_after: null },
  );
});

await test("已有文件创建素材持共享锁，使并发 TTL 清理等待并保留刚提交的引用", async () => {
  const fileId = "asset-purge-race.png";
  const advisoryKey = 2_608_210_317;
  fs.writeFileSync(
    path.join(uploadsDir(), fileId),
    Buffer.from(PNG_DATA_URL.slice(PNG_DATA_URL.indexOf(",") + 1), "base64"),
  );
  await query(`
    INSERT INTO files (
      id, owner_id, source_type, mime_type, created_at, purge_after
    ) VALUES ($1, $2, 'upload', 'image/png', $3, $4)
  `, [fileId, users.owner.id, now, new Date(Date.now() - 1_000).toISOString()]);
  await query(`
    CREATE OR REPLACE FUNCTION test_block_asset_insert() RETURNS trigger
    LANGUAGE plpgsql AS $$
    BEGIN
      PERFORM pg_advisory_xact_lock(${advisoryKey});
      RETURN NEW;
    END;
    $$;
    CREATE TRIGGER test_block_asset_insert_trigger
    BEFORE INSERT ON assets
    FOR EACH ROW WHEN (NEW.name = '并发回收素材')
    EXECUTE FUNCTION test_block_asset_insert();
  `);

  const blocker = await db().connect();
  let createRequest: Promise<Response> | undefined;
  let purgeRequest: Promise<void> | undefined;
  let createdAssetId: string | undefined;
  try {
    await blocker.query("SELECT pg_advisory_lock($1)", [advisoryKey]);
    createRequest = request("/assets", "owner", {
      method: "POST",
      body: JSON.stringify({
        name: "并发回收素材",
        category: "garment",
        scope: "private",
        image: `/api/files/${fileId}`,
      }),
    });
    await waitForDatabaseCondition("素材 INSERT 已在触发器等待", async () => {
      const waiting = await queryOne<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM pg_stat_activity
        WHERE wait_event_type = 'Lock'
          AND query LIKE '%INSERT INTO assets%'
      `);
      return (waiting?.count ?? 0) > 0;
    });

    purgeRequest = purgeExpiredProjects();
    await waitForDatabaseCondition("TTL 清理在已授权文件共享锁处等待", async () => {
      const waiting = await queryOne<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM pg_stat_activity
        WHERE wait_event_type = 'Lock'
          AND query LIKE '%SELECT f.id%'
          AND query LIKE '%FOR UPDATE OF f%'
      `);
      return (waiting?.count ?? 0) > 0;
    });

    assert.equal((await blocker.query<{ unlocked: boolean }>(
      "SELECT pg_advisory_unlock($1) AS unlocked",
      [advisoryKey],
    )).rows[0]?.unlocked, true);
    const createResponse = await createRequest;
    const createBody = await createResponse.json() as { id?: string; error?: string };
    assert.equal(createResponse.status, 201, createBody.error);
    assert.ok(createBody.id);
    createdAssetId = createBody.id;
    await purgeRequest;

    assert.ok(await queryOne("SELECT id FROM files WHERE id = $1", [fileId]));
    assert.ok(fs.existsSync(path.join(uploadsDir(), fileId)));
    assert.deepEqual(
      await queryOne<{ image: string }>("SELECT image FROM assets WHERE id = $1", [createdAssetId]),
      { image: `/api/files/${fileId}` },
    );
  } finally {
    try { await blocker.query("SELECT pg_advisory_unlock($1)", [advisoryKey]); } catch { /* best effort */ }
    blocker.release();
    await createRequest?.catch(() => undefined);
    await purgeRequest?.catch(() => undefined);
    await query("DROP TRIGGER IF EXISTS test_block_asset_insert_trigger ON assets");
    await query("DROP FUNCTION IF EXISTS test_block_asset_insert()");
    await query("DELETE FROM assets WHERE id = $1 OR name = '并发回收素材'", [createdAssetId ?? ""]);
    await query("DELETE FROM files WHERE id = $1", [fileId]);
    deleteStoredImage(fileId);
  }
});

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

await test("素材引用接口拒绝跨用户与管理员写入他人项目", async () => {
  for (const actor of ["other", "admin"] as const) {
    const response = await request("/assets/shared-asset/references", actor, {
      method: "POST",
      body: JSON.stringify({ projectId: "owner-project" }),
    });
    assert.equal(response.status, 404);
  }
  const missing = await request("/assets/shared-asset/references", "owner", {
    method: "POST",
    body: JSON.stringify({ projectId: "unsaved-project" }),
  });
  assert.equal(missing.status, 404);
  const count = await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM project_asset_refs WHERE project_id = 'owner-project'",
  );
  assert.equal(count?.count, 0);
});

await test("普通用户的回收站只显示自己删除的素材", async () => {
  await query(`
    INSERT INTO assets (id, owner_id, scope, name, category, image, created_at, deleted_at, purge_after)
    VALUES ('other-deleted-shared', $1, 'shared', '他人已删共享素材', 'garment',
      '/api/files/deleted-shared.png', $2, $2, $3)
  `, [users.other.id, now, new Date(Date.now() + 86_400_000).toISOString()]);
  const response = await request("/assets?deleted=true", "owner");
  assert.equal(response.status, 200);
  const rows = await response.json() as Array<{ id: string }>;
  assert.equal(rows.some((row) => row.id === "other-deleted-shared"), false);
});

await test("素材名称搜索按字面子串匹配，且不绕过 scope 权限过滤", async () => {
  await query(`
    INSERT INTO assets (id, owner_id, scope, name, category, image, created_at)
    VALUES
      ('search-own-print', $1, 'private', '花朵印花A', 'print', '/api/files/search-a.png', $3),
      ('search-other-private', $2, 'private', '花朵印花B', 'print', '/api/files/search-b.png', $3)
  `, [users.owner.id, users.other.id, now]);
  const response = await request("/assets?search=%E8%8A%B1%E6%9C%B5", "owner");
  assert.equal(response.status, 200);
  const ids = (await response.json() as Array<{ id: string }>).map((row) => row.id);
  assert.equal(ids.includes("search-own-print"), true);
  assert.equal(ids.includes("search-other-private"), false);
});

await test("素材名称搜索把 % 和 _ 当字面字符而非 LIKE 通配符", async () => {
  await query(`
    INSERT INTO assets (id, owner_id, scope, name, category, image, created_at)
    VALUES
      ('search-percent', $1, 'private', 'A%B', 'garment', '/api/files/search-p.png', $2),
      ('search-plain', $1, 'private', 'AB', 'garment', '/api/files/search-q.png', $2),
      ('search-underscore', $1, 'private', 'A_C', 'garment', '/api/files/search-u.png', $2),
      ('search-anychar', $1, 'private', 'AXC', 'garment', '/api/files/search-x.png', $2)
  `, [users.owner.id, now]);

  const percent = await request("/assets?search=A%25B", "owner");
  assert.equal(percent.status, 200);
  const percentIds = (await percent.json() as Array<{ id: string }>).map((row) => row.id);
  assert.equal(percentIds.includes("search-percent"), true);
  assert.equal(percentIds.includes("search-plain"), false);

  const underscore = await request("/assets?search=A_C", "owner");
  assert.equal(underscore.status, 200);
  const underscoreIds = (await underscore.json() as Array<{ id: string }>).map((row) => row.id);
  assert.equal(underscoreIds.includes("search-underscore"), true);
  assert.equal(underscoreIds.includes("search-anychar"), false);
});


console.log(`\n通过 ${passed} 项`);
await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
await closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
