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
const {
  requireGarmentPromptVariant,
} = await import("../src/lib/garmentPromptPresets");
const {
  getModelParameterProfile,
  materializeModelParameterProfile,
} = await import("../src/types/modelParameterProfiles");
const { promotePromptVariantForTest } = await import("./promptReleaseTestSupport");

const generationVariant = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "image",
  mode: "generate",
});
const editVariant = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "edit",
});
// Route authorization tests need accepted jobs without changing production status.
// Mutate only this isolated process's catalog objects to model already-reviewed evidence.
for (const variant of [generationVariant, editVariant]) {
  promotePromptVariantForTest(variant);
}
const generationProfile = getModelParameterProfile(generationVariant.parameterProfileId)!;
const generationParameters = materializeModelParameterProfile(generationProfile);
const editProfile = getModelParameterProfile(editVariant.parameterProfileId)!;
const editParameters = materializeModelParameterProfile(editProfile);

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
  return {
    schemaVersion: 8,
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
          modelOptions: generationParameters.modelOptions,
          promptVariantId: generationVariant.variantId,
          promptFamilyId: generationVariant.familyId,
          parameterProfileId: generationVariant.parameterProfileId,
          contractHash: generationVariant.contractHash,
          evaluationVersion: generationVariant.evaluationVersion,
          postprocessVersion: generationProfile.postprocess.version,
          aspectRatio: generationParameters.aspectRatio,
          batchSize: 1,
        },
      },
    ],
    edges: [promptEdge("prompt-generate", "generate")],
  };
}

function editFlow(imageUrl: string) {
  return {
    schemaVersion: 8,
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
          modelId: "gpt-image-2.5-flare-vip",
          modelOptions: editParameters.modelOptions,
          promptVariantId: editVariant.variantId,
          promptFamilyId: editVariant.familyId,
          parameterProfileId: editVariant.parameterProfileId,
          contractHash: editVariant.contractHash,
          evaluationVersion: editVariant.evaluationVersion,
          postprocessVersion: editProfile.postprocess.version,
          aspectRatio: editParameters.aspectRatio,
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
    schemaVersion: 8,
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
    schemaVersion: 8,
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
    schemaVersion: 8,
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
    modelId: "gpt-image-2.5-flare-vip",
    kind: "image-generator",
    projectId,
    projectName: "客户端伪造名称",
    nodeId: "direct-edit",
    request: {
      // v7 直连：request.prompt 是纯用户正文；fullPrompt 由 worker 内联，
      // 不再提交 buildGarmentPrompt 包装。
      prompt: "改成短袖",
      promptVariantId: editVariant.variantId,
      promptFamilyId: editVariant.familyId,
      parameterProfileId: editVariant.parameterProfileId,
      contractHash: editVariant.contractHash,
      evaluationVersion: editVariant.evaluationVersion,
      postprocessVersion: editProfile.postprocess.version,
      operationMode: "edit",
      aspectRatio: editParameters.aspectRatio,
      batchSize: 1,
      references: [{
        dataUrl: referenceImage,
        order: 0,
        assetSha256: "a".repeat(64),
      }],
      modelOptions: editParameters.modelOptions,
    },
  };
}

function writeTestPng(id: string): void {
  fs.writeFileSync(
    path.join(uploadsDir(), id),
    Buffer.from(PNG_DATA_URL.slice(PNG_DATA_URL.indexOf(",") + 1), "base64"),
  );
}

console.log("运行任务与素材引用授权回归测试");

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
        promptVariantId: editVariant.variantId,
        modelId: "gpt-image-2.5-flare-vip",
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
      name: "越权共享", category: "reference", scope: "shared", image: uploaded.url,
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
    VALUES ('uploaded-shared-asset', $1, 'shared', '可共享图片', 'reference', $2, $3)
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
      name: "通用素材", category: "reference", scope: "global", image: uploaded.url,
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
        category: "reference",
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
    ('shared-asset', $1, 'shared', '共享素材', 'reference', '/api/files/shared.png', $3),
    ('other-private', $2, 'private', '他人私有素材', 'reference', '/api/files/private.png', $3),
    ('own-private', $1, 'private', '本人私有素材', 'reference', '/api/files/own-private.png', $3)
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
    VALUES ('other-deleted-shared', $1, 'shared', '他人已删共享素材', 'reference',
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
      ('search-percent', $1, 'private', 'A%B', 'reference', '/api/files/search-p.png', $2),
      ('search-plain', $1, 'private', 'AB', 'reference', '/api/files/search-q.png', $2),
      ('search-underscore', $1, 'private', 'A_C', 'reference', '/api/files/search-u.png', $2),
      ('search-anychar', $1, 'private', 'AXC', 'reference', '/api/files/search-x.png', $2)
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

await test("真实评估必须只执行显式 onlyNodeId，且禁止扩展到下游节点", async () => {
  const originalFlag = process.env.ENABLE_PAID_EVALUATION_RUNS;
  process.env.ENABLE_PAID_EVALUATION_RUNS = "true";
  const evaluation = {
    caseId: "route-scope-case",
    sampleId: "route-scope-sample",
    authorizationId: "route-scope-authorization",
    campaignId: "route-scope-campaign",
    slotId: "route-scope-slot",
  };
  try {
    const missingTarget = await request("/run-plan", "admin", {
      method: "POST",
      body: JSON.stringify({
        ...generationFlow("真实评估必须显式选中节点"),
        projectId: "scope-not-read-before-rejection",
        clientRequestId: "evaluation-missing-only-node",
        evaluation,
      }),
    });
    assert.equal(missingTarget.status, 400);
    assert.match(await missingTarget.text(), /onlyNodeId/);

    const downstream = await request("/run-plan", "admin", {
      method: "POST",
      body: JSON.stringify({
        ...generationFlow("真实评估不得执行下游"),
        onlyNodeId: "generate",
        includeDownstream: true,
        projectId: "scope-not-read-before-rejection",
        clientRequestId: "evaluation-downstream-blocked",
        evaluation: { ...evaluation, caseId: "route-downstream-case" },
      }),
    });
    assert.equal(downstream.status, 400);
    assert.match(await downstream.text(), /不得执行下游节点/);
    assert.equal((await queryOne<{ count: number }>(`
      SELECT COUNT(*)::int AS count FROM generation_runs
      WHERE client_request_id IN ('evaluation-missing-only-node','evaluation-downstream-blocked')
    `))?.count, 0);
  } finally {
    if (originalFlag === undefined) delete process.env.ENABLE_PAID_EVALUATION_RUNS;
    else process.env.ENABLE_PAID_EVALUATION_RUNS = originalFlag;
  }
});

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

await test("直连生成在入队前拒绝偏离已评估参数档案的 modelOptions", async () => {
  const before = (await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM generation_runs",
  ))?.count ?? 0;
  const body = directGenerateBody(PNG_DATA_URL);
  body.request.modelOptions = {
    ...body.request.modelOptions,
    aspect_ratio: "16:9",
  } as never;
  const response = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  assert.equal(response.status, 400, responseText);
  // R5 删除了 modelOptions 取值硬校验，未知/跨模型取值在入队前由准入层的
  // 「参数档案偏离」拒绝（parameter-drift），而非按字段名拒绝。
  assert.match(responseText, /parameter-drift/);
  const after = (await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM generation_runs",
  ))?.count ?? 0;
  assert.equal(after, before);
});


await test("run-plan 保留显式确认参考角色的普通 edit 正向入队", async () => {
  const confirmedFlow = editFlow(PNG_DATA_URL);
  const save = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({
      id: "confirmed-reference-project",
      name: "已确认参考角色项目",
      flow: confirmedFlow,
    }),
  });
  assert.equal(save.status, 200, await save.text());

  const response = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...confirmedFlow,
      onlyNodeId: "edit",
      projectId: "confirmed-reference-project",
      clientRequestId: "workflow-confirmed-reference",
    }),
  });
  const payload = await response.json() as { runId?: string; error?: string };
  assert.equal(response.status, 202, payload.error);
  assert.ok(payload.runId);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE client_request_id = 'workflow-confirmed-reference'
  `))?.count, 1);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_jobs
    WHERE run_id = $1
  `, [payload.runId]))?.count, 1);
});

await test("run-plan 对已保存快照中偏离已评估档案的未知 modelOptions 严格拒绝且零入队", async () => {
  // v7：提交画布必须与已保存快照同拓扑（不一致由 409 快照冲突负责）；参数漂移
  // 针对的是快照本身——历史画布可能携带当前五模型契约不认识的原生键。
  const savedFlow = structuredClone(generationFlow("严格参数项目"));
  (savedFlow.nodes[1] as unknown as { data: { modelOptions: unknown } }).data.modelOptions = {
    size: "2048x2048",
    aspect_ratio: "16:9",
  };
  const save = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({
      id: "strict-model-options-run-project",
      name: "严格参数项目",
      flow: savedFlow,
    }),
  });
  assert.equal(save.status, 200, await save.text());

  // 提交同一份已保存快照：通过 409 一致性检查后，必须在准入层被 parameter-drift 拒绝。
  const response = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...savedFlow,
      onlyNodeId: "generate",
      projectId: "strict-model-options-run-project",
      clientRequestId: "invalid-model-options-run-plan",
    }),
  });
  const responseText = await response.text();
  assert.equal(response.status, 400, responseText);
  assert.match(responseText, /偏离已评估参数档案/);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE client_request_id = 'invalid-model-options-run-plan'
  `))?.count, 0);
});

await test("运行只接受当前已保存画布，且项目名称以服务端为准", async () => {
  const savedFlow = generationFlow("已保存提示词");
  const save = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({
      id: "run-persisted-project",
      name: "服务端项目名",
      flow: savedFlow,
    }),
  });
  assert.equal(save.status, 200, await save.text());

  const forged = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...generationFlow("未保存的篡改提示词"),
      onlyNodeId: "generate",
      projectId: "run-persisted-project",
      projectName: "伪造项目名",
      clientRequestId: "forged-persisted-plan",
    }),
  });
  assert.equal(forged.status, 409, await forged.text());

  const queuedClientFlow = structuredClone(savedFlow);
  queuedClientFlow.nodes[1].position = { x: 999, y: 999 };
  queuedClientFlow.nodes[1].data.label = "客户端瞬态标签";
  queuedClientFlow.nodes[1].data.status = "queued";
  const accepted = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...queuedClientFlow,
      onlyNodeId: "generate",
      projectId: "run-persisted-project",
      projectName: "伪造项目名",
      clientRequestId: "accepted-persisted-plan",
    }),
  });
  const payload = await accepted.json() as { runId?: string; error?: string };
  assert.equal(accepted.status, 202, payload.error);
  const row = await queryOne<{ project_name: string; parameters_json: string }>(
    "SELECT project_name, parameters_json FROM generation_runs WHERE id = $1",
    [payload.runId],
  );
  assert.equal(row?.project_name, "服务端项目名");
  // v7：DAG 路径不再持久化 v6 包装 prompt；用户正文沿 text 边进入 inputTexts。
  const persistedParameters = JSON.parse(row?.parameters_json ?? "{}") as {
    prompt?: unknown;
    inputTexts?: unknown;
  };
  assert.equal(persistedParameters.prompt, undefined, "v7 DAG 参数不再携带包装 prompt");
  assert.deepEqual(persistedParameters.inputTexts, ["已保存提示词"]);

  const replay = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...queuedClientFlow,
      onlyNodeId: "generate",
      projectId: "run-persisted-project",
      clientRequestId: "accepted-persisted-plan",
    }),
  });
  const replayPayload = await replay.json() as { runId?: string; error?: string };
  assert.equal(replay.status, 202, replayPayload.error);
  assert.equal(replayPayload.runId, payload.runId);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE owner_id = $1 AND client_request_id = 'accepted-persisted-plan'
  `, [users.owner.id]))?.count, 1);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_jobs WHERE run_id = $1
  `, [payload.runId]))?.count, 1);

  const changedSavedFlow = generationFlow("后来保存的提示词");
  const changedSave = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({
      id: "run-persisted-project",
      name: "服务端项目名",
      flow: changedSavedFlow,
    }),
  });
  assert.equal(changedSave.status, 200, await changedSave.text());
  const semanticDrift = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...changedSavedFlow,
      onlyNodeId: "generate",
      projectId: "run-persisted-project",
      clientRequestId: "accepted-persisted-plan",
    }),
  });
  assert.equal(semanticDrift.status, 409, await semanticDrift.text());
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE owner_id = $1 AND client_request_id = 'accepted-persisted-plan'
  `, [users.owner.id]))?.count, 1);
});

await test("项目保存与运行都拒绝引用他人的私有文件", async () => {
  await query(`
    INSERT INTO files (id, owner_id, source_type, created_at)
    VALUES ('other-secret.png', $1, 'upload', $2)
  `, [users.other.id, now]);
  writeTestPng("other-secret.png");
  const unsafeFlow = editFlow("/api/files/other-secret.png");
  const deniedSave = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({ id: "unsafe-save-project", name: "越权项目", flow: unsafeFlow }),
  });
  assert.equal(deniedSave.status, 403, await deniedSave.text());
  assert.equal(await queryOne("SELECT id FROM projects WHERE id = 'unsafe-save-project'"), undefined);

  await query(`
    INSERT INTO projects (id, owner_id, name, flow_json, updated_at, created_at)
    VALUES ('legacy-unsafe-project', $1, '历史越权项目', $2, $3, $3)
  `, [users.owner.id, JSON.stringify(unsafeFlow), now]);
  const deniedRun = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...unsafeFlow,
      onlyNodeId: "edit",
      projectId: "legacy-unsafe-project",
      clientRequestId: "legacy-unsafe-request",
    }),
  });
  assert.equal(deniedRun.status, 403);
  assert.deepEqual(await deniedRun.json(), {
    error: "参考图不可用，请重新选择后再试",
    code: "reference-image-unavailable",
    references: [{
      order: 0,
      sourceNodeId: "source",
      targetNodeId: "edit",
      reason: "reference image is unavailable",
    }],
  });
});

await test("不可用本地文件返回同一结构化 403，且不能进入运行队列", async () => {
  const missingFlow = editFlow("/api/files/missing-image.png");
  const missingSave = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({ id: "missing-file-project", name: "缺失文件", flow: missingFlow }),
  });
  assert.equal(missingSave.status, 403, await missingSave.text());

  await query(`
    INSERT INTO files (id, owner_id, source_type, created_at, deleted_at, purge_after)
    VALUES ('deleted-image.png', $1, 'upload', $2, $2, $3)
  `, [users.owner.id, now, new Date(Date.now() + 86_400_000).toISOString()]);
  writeTestPng("deleted-image.png");
  const deletedFlow = editFlow("/api/files/deleted-image.png");
  const deletedSave = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({ id: "deleted-file-project", name: "已删文件", flow: deletedFlow }),
  });
  assert.equal(deletedSave.status, 403, await deletedSave.text());

  await query(`
    INSERT INTO files (id, owner_id, source_type, created_at)
    VALUES
      ('metadata-only-image.png', $1, 'upload', $2),
      ('unreadable-image.png', $1, 'upload', $2),
      ('truncated-image.png', $1, 'upload', $2)
  `, [users.owner.id, now]);
  fs.writeFileSync(path.join(uploadsDir(), "unreadable-image.png"), "not an image");
  fs.writeFileSync(
    path.join(uploadsDir(), "truncated-image.png"),
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  const metadataOnlyFlow = editFlow("/api/files/metadata-only-image.png");
  const unreadableFlow = editFlow("/api/files/unreadable-image.png");
  const truncatedFlow = editFlow("/api/files/truncated-image.png");

  for (const [projectId, projectFlow] of [
    ["legacy-missing-file", missingFlow],
    ["legacy-deleted-file", deletedFlow],
    ["legacy-metadata-only-file", metadataOnlyFlow],
    ["legacy-unreadable-file", unreadableFlow],
    ["legacy-truncated-file", truncatedFlow],
  ] as const) {
    await query(`
      INSERT INTO projects (id, owner_id, name, flow_json, updated_at, created_at)
      VALUES ($1, $2, '历史项目', $3, $4, $4)
    `, [projectId, users.owner.id, JSON.stringify(projectFlow), now]);
    const response = await request("/run-plan", "owner", {
      method: "POST",
      body: JSON.stringify({
        ...projectFlow,
        onlyNodeId: "edit",
        projectId,
        clientRequestId: `${projectId}-request`,
      }),
    });
    assert.equal(response.status, 403, projectId);
    assert.deepEqual(await response.json(), {
      error: "参考图不可用，请重新选择后再试",
      code: "reference-image-unavailable",
      references: [{
        order: 0,
        sourceNodeId: "source",
        targetNodeId: "edit",
        reason: "reference image is unavailable",
      }],
    }, projectId);
  }
  const rejectedRequestIds = [
    "legacy-missing-file-request",
    "legacy-deleted-file-request",
    "legacy-metadata-only-file-request",
    "legacy-unreadable-file-request",
    "legacy-truncated-file-request",
  ];
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE client_request_id = ANY($1::text[])
  `, [rejectedRequestIds]))?.count, 0);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_jobs
    WHERE run_id IN (
      SELECT id FROM generation_runs WHERE client_request_id = ANY($1::text[])
    )
  `, [rejectedRequestIds]))?.count, 0);
});

await test("run-plan 在入队前拒绝 HTTP(S) 静态参考图并保留目标归因", async () => {
  const projectId = "remote-reference-project";
  const clientRequestId = "remote-reference-request";
  const remoteFlow = editFlow("https://cdn.example/reference.png?token=temporary");
  const saved = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({ id: projectId, name: "远程参考图", flow: remoteFlow }),
  });
  assert.equal(saved.status, 200, await saved.text());

  const response = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...remoteFlow,
      onlyNodeId: "edit",
      projectId,
      clientRequestId,
    }),
  });
  const payload = await response.json();
  assert.equal(response.status, 403, JSON.stringify(payload));
  assert.deepEqual(payload, {
    error: "远程参考图不能直接用于生成，请先上传或导入后再试",
    code: "reference-image-unavailable",
    references: [{
      order: 0,
      sourceNodeId: "source",
      targetNodeId: "edit",
      reason: "remote reference must be uploaded or imported before generation",
    }],
  });
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs WHERE client_request_id = $1
  `, [clientRequestId]))?.count, 0);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_jobs
    WHERE run_id IN (SELECT id FROM generation_runs WHERE client_request_id = $1)
  `, [clientRequestId]))?.count, 0);
});

await test("多 Provider 计划会报告非目标步骤的静态不可用引用", async () => {
  const projectId = "multi-step-static-reference";
  const clientRequestId = "multi-step-static-reference-request";
  const projectFlow = independentEditFlow(
    "/api/files/missing-image.png",
    "/api/files/own-private.png",
  );
  await query(`
    INSERT INTO projects (id, owner_id, name, flow_json, lifecycle, updated_at, created_at)
    VALUES ($1, $2, '多步静态引用', $3, 'saved', $4, $4)
  `, [projectId, users.owner.id, JSON.stringify(projectFlow), now]);

  const response = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...projectFlow,
      // v7：source 节点是静态输入而非执行目标；单节点运行只跑 edit-a，
      // 其画布快照引用（source-a）在入队前做静态可达性检查。
      onlyNodeId: "edit-a",
      includeDownstream: false,
      projectId,
      clientRequestId,
    }),
  });
  const responsePayload = await response.json();
  assert.equal(response.status, 403, JSON.stringify(responsePayload));
  assert.deepEqual(responsePayload, {
    error: "参考图不可用，请重新选择后再试",
    code: "reference-image-unavailable",
    references: [{
      order: 0,
      sourceNodeId: "source-a",
      targetNodeId: "edit-a",
      reason: "reference image is unavailable",
    }],
  });
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs WHERE client_request_id = $1
  `, [clientRequestId]))?.count, 0);
});

await test("run-plan 静态引用投影：同轮 Provider 旧快照占位，非执行静态来源保留顺序", () => {
  // v7（runtime.md §5 result 归位）：独立 result 汇总节点已删除。同一轮里要执行的
  // Provider 节点其持久化旧输出一律占位为空；不在本轮执行范围的静态来源才把快照
  // 投影进入入队前可达性检查。
  const plan: ExecutionPlan = {
    steps: [
      {
        nodeId: "provider-a",
        kind: "image",
        inputImages: [],
        upstream: [],
        params: {},
      },
      {
        nodeId: "provider-b",
        kind: "image",
        inputImages: [
          "/api/files/stale-provider.png",
          "/api/files/actual-static.png",
        ],
        upstream: [
          { nodeId: "provider-a", images: ["/api/files/stale-provider.png"] },
          { nodeId: "static-source", images: ["/api/files/actual-static.png"] },
        ],
        params: {},
      },
    ],
  };

  assert.deepEqual(staticImageReferencesForPlan(plan), [{
    // provider-a 同轮执行 → 陈旧快照占位丢弃（但顺序位保留）；
    // static-source 不在执行范围 → 投影，order 接续占位为 1。
    imageRef: "/api/files/actual-static.png",
    order: 1,
    sourceNodeId: "static-source",
    targetNodeId: "provider-b",
  }]);

  const inputOnlyPlan: ExecutionPlan = {
    steps: [{
      nodeId: "input-only-provider",
      kind: "image",
      inputImages: ["/api/files/input-only-static.png"],
      inputReferences: [{
        imageRef: "/api/files/input-only-static.png",
        order: 0,
        sourceNodeId: "persisted-source",
      }],
      params: {},
    }],
  };
  assert.deepEqual(staticImageReferencesForPlan(inputOnlyPlan), [{
    imageRef: "/api/files/input-only-static.png",
    order: 0,
    sourceNodeId: "persisted-source",
    targetNodeId: "input-only-provider",
  }]);

  // v7：面料（fabricImageUrl）特化随旧 kind 删除；蒙版辅助引用改由
  // mask-edit 变体（params.operationMode）驱动，仍进入同一静态准入序列。
  const auxiliaryPlan: ExecutionPlan = {
    steps: [
      {
        nodeId: "mask-provider",
        kind: "image",
        inputImages: ["/api/files/mask-base.png"],
        inputReferences: [{
          imageRef: "/api/files/mask-base.png",
          order: 0,
          sourceNodeId: "mask-base-source",
        }],
        params: {
          operationMode: "mask-edit",
          mask: "https://references.example/mask.png",
        },
      },
    ],
  };
  assert.deepEqual(staticImageReferencesForPlan(auxiliaryPlan), [
    {
      imageRef: "/api/files/mask-base.png",
      order: 0,
      sourceNodeId: "mask-base-source",
      targetNodeId: "mask-provider",
    },
    {
      imageRef: "https://references.example/mask.png",
      order: 1,
      sourceNodeId: "mask-provider",
      targetNodeId: "mask-provider",
    },
  ], "蒙版辅助引用必须与用户参考图进入同一静态准入序列");
});

await test("同一静态来源输入多个 Provider 时失败证据可唯一归因", async () => {
  const projectId = "branched-static-reference";
  const projectFlow = branchedEditFlow("/api/files/missing-image.png");
  await query(`
    INSERT INTO projects (id, owner_id, name, flow_json, lifecycle, updated_at, created_at)
    VALUES ($1, $2, '分支静态引用', $3, 'saved', $4, $4)
  `, [projectId, users.owner.id, JSON.stringify(projectFlow), now]);

  // v7：单节点运行，两个分支 edit 分别提交；source 是静态输入不参与执行，
  // 失败证据各自归因到目标节点。
  for (const [targetNodeId, requestId] of [
    ["edit-a", "branched-static-reference-request-a"],
    ["edit-b", "branched-static-reference-request-b"],
  ] as const) {
    const response = await request("/run-plan", "owner", {
      method: "POST",
      body: JSON.stringify({
        ...projectFlow,
        onlyNodeId: targetNodeId,
        includeDownstream: false,
        projectId,
        clientRequestId: requestId,
      }),
    });
    const payload = await response.json();
    assert.equal(response.status, 403, JSON.stringify(payload));
    assert.deepEqual(payload, {
      error: "参考图不可用，请重新选择后再试",
      code: "reference-image-unavailable",
      references: [
        {
          order: 0,
          sourceNodeId: "source",
          targetNodeId: targetNodeId,
          reason: "reference image is unavailable",
        },
      ],
    });
  }
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs WHERE client_request_id LIKE 'branched-static-reference-request-%'
  `))?.count, 0);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_jobs
    WHERE run_id IN (SELECT id FROM generation_runs WHERE client_request_id LIKE 'branched-static-reference-request-%')
  `, []))?.count, 0);
});

await test("run-plan 在入队前真解码实际静态 inline 图片", async () => {
  const projectId = "truncated-inline-reference";
  const clientRequestId = "truncated-inline-reference-request";
  const projectFlow = editFlow(TRUNCATED_PNG_DATA_URL);
  const saved = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({ id: projectId, name: "截断 inline 图片", flow: projectFlow }),
  });
  assert.equal(saved.status, 200, await saved.text());

  const response = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...projectFlow,
      onlyNodeId: "edit",
      projectId,
      clientRequestId,
    }),
  });
  const payload = await response.json();
  assert.equal(response.status, 403, JSON.stringify(payload));
  assert.deepEqual(payload, {
    error: "参考图不可用，请重新选择后再试",
    code: "reference-image-unavailable",
    references: [{
      order: 0,
      sourceNodeId: "source",
      targetNodeId: "edit",
      reason: "reference image is unavailable",
    }],
  });
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs WHERE client_request_id = $1
  `, [clientRequestId]))?.count, 0);
});

await test("同一轮上游 Provider 会替换的旧输出快照不阻断入队", async () => {
  const projectId = "provider-snapshot-replaced";
  const clientRequestId = "provider-snapshot-replaced-request";
  const projectFlow = chainedEditFlow(
    "/api/files/own-private.png",
    "/api/files/metadata-only-image.png",
  );
  const saved = await request("/projects", "owner", {
    method: "POST",
    body: JSON.stringify({ id: projectId, name: "Provider 快照替换", flow: projectFlow }),
  });
  assert.equal(saved.status, 200, await saved.text());

  const response = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...projectFlow,
      // v7：从 edit-first 起跑并含下游 edit-second；source 为静态输入不执行，
      // edit-first 同轮产出在 Provider 边界替换其持久化旧快照。
      onlyNodeId: "edit-first",
      includeDownstream: true,
      projectId,
      clientRequestId,
    }),
  });
  const payload = await response.json() as { runId?: string; error?: string };
  assert.equal(response.status, 202, payload.error);
  assert.ok(payload.runId, payload.error);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs WHERE client_request_id = $1
  `, [clientRequestId]))?.count, 1);
});

await test("直连生成在授权和入队前拒绝任何 evaluation payload", async () => {
  const before = (await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM generation_runs",
  ))?.count ?? 0;
  for (const [index, evaluation] of [
    null,
    {
      caseId: "direct-evaluation-case",
      sampleId: "direct-evaluation-sample",
      authorizationId: "direct-evaluation-authorization",
    },
  ].entries()) {
    const body = {
      ...directGenerateBody(PNG_DATA_URL, undefined, `direct-evaluation-rejected-${index}`),
      evaluation,
    };
    const response = await request("/generate", "admin", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const responseText = await response.text();
    assert.equal(response.status, 400, responseText);
    assert.match(responseText, /\/api\/run-plan/);
    assert.match(responseText, /onlyNodeId/);
  }
  const after = (await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM generation_runs",
  ))?.count ?? 0;
  assert.equal(after, before);
});

await test("直连生成在入队前拒绝非图片引用与不安全 sourceNodeId", async () => {
  const clientRequestIds: string[] = [];
  for (const [index, reference] of [
    "../../etc/passwd",
    "file:///etc/passwd",
    "data:image/png;base64,not-base64",
    TRUNCATED_PNG_DATA_URL,
    "/api/files/nested/other-secret.png",
    "https://[invalid",
  ].entries()) {
    const clientRequestId = `direct-invalid-image-ref-${index}`;
    clientRequestIds.push(clientRequestId);
    const response = await request("/generate", "owner", {
      method: "POST",
      body: JSON.stringify(directGenerateBody(reference, undefined, clientRequestId)),
    });
    assert.equal(response.status, 400, `${reference}: ${await response.text()}`);
  }

  const sourceNodeRequestId = "direct-invalid-source-node";
  clientRequestIds.push(sourceNodeRequestId);
  const unsafeSourceNode = directGenerateBody(PNG_DATA_URL, undefined, sourceNodeRequestId);
  (unsafeSourceNode.request.references[0] as { sourceNodeId?: string }).sourceNodeId = "../../forged-node";
  const unsafeSourceNodeResponse = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(unsafeSourceNode),
  });
  assert.equal(unsafeSourceNodeResponse.status, 400, await unsafeSourceNodeResponse.text());

  const nonStringRequestId = "direct-invalid-non-string-reference";
  clientRequestIds.push(nonStringRequestId);
  const nonStringReference = directGenerateBody(PNG_DATA_URL, undefined, nonStringRequestId);
  delete (nonStringReference.request as { references?: unknown }).references;
  (nonStringReference.request as { referenceImages?: unknown }).referenceImages = [123];
  const nonStringResponse = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(nonStringReference),
  });
  assert.equal(nonStringResponse.status, 400, await nonStringResponse.text());

  // v7：fabricImageUrl 旁路已随参考图角色体系删除（docs/design/2026-09-17-remove-reference-roles），
  // 服务端不再读取该字段；唯一的图片通道是 references[].dataUrl，其路径穿越/远程/非图片拒绝
  // 已由上方六个用例覆盖，故不再为已删除的输入通道保留拒绝断言。

  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE client_request_id = ANY($1::text[])
  `, [clientRequestIds]))?.count, 0);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_jobs
    WHERE run_id IN (
      SELECT id FROM generation_runs WHERE client_request_id = ANY($1::text[])
    )
  `, [clientRequestIds]))?.count, 0);
});

await test("直连生成在入队前拒绝 HTTP(S) 参考图并要求先上传或导入", async () => {
  const clientRequestIds = [
    "direct-remote-http",
    "direct-remote-https",
    "direct-remote-normalized-url",
  ];
  for (const [index, reference] of [
    "http://images.example/reference.png",
    "https://cdn.example/reference.png?token=temporary",
    "https:\t//images.example/reference.png",
  ].entries()) {
    const response = await request("/generate", "owner", {
      method: "POST",
      body: JSON.stringify(directGenerateBody(reference, undefined, clientRequestIds[index])),
    });
    const payload = await response.json();
    assert.equal(response.status, 403, JSON.stringify(payload));
    assert.deepEqual(payload, {
      error: "远程参考图不能直接用于生成，请先上传或导入后再试",
      code: "reference-image-unavailable",
      references: [{
        order: 0,
        reason: "remote reference must be uploaded or imported before generation",
      }],
    });
  }
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE client_request_id = ANY($1::text[])
  `, [clientRequestIds]))?.count, 0);
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_jobs
    WHERE run_id IN (
      SELECT id FROM generation_runs WHERE client_request_id = ANY($1::text[])
    )
  `, [clientRequestIds]))?.count, 0);
});

await test("直连生成复用项目与文件授权，且不信任客户端项目名称", async () => {
  const before = (await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM generation_runs",
  ))?.count ?? 0;
  const missingRequestIdBody = directGenerateBody(PNG_DATA_URL);
  delete (missingRequestIdBody as { clientRequestId?: string }).clientRequestId;
  const missingRequestId = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(missingRequestIdBody),
  });
  assert.equal(missingRequestId.status, 400, await missingRequestId.text());

  const missingKindBody = directGenerateBody(PNG_DATA_URL);
  delete (missingKindBody as { kind?: string }).kind;
  const missingKind = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(missingKindBody),
  });
  assert.equal(missingKind.status, 400, await missingKind.text());

  const missingOptionsBody = directGenerateBody(PNG_DATA_URL);
  delete (missingOptionsBody.request as { modelOptions?: unknown }).modelOptions;
  const missingOptions = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(missingOptionsBody),
  });
  assert.equal(missingOptions.status, 400, await missingOptions.text());

  const accepted = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(directGenerateBody(
      PNG_DATA_URL,
      "run-persisted-project",
      "direct-project-request",
    )),
  });
  const acceptedBody = await accepted.json() as { runId?: string; error?: string };
  assert.equal(accepted.status, 202, acceptedBody.error);
  const stored = await queryOne<{ project_id: string; project_name: string; owner_id: string }>(
    "SELECT project_id, project_name, owner_id FROM generation_runs WHERE id = $1",
    [acceptedBody.runId],
  );
  assert.deepEqual(stored, {
    project_id: "run-persisted-project",
    project_name: "服务端项目名",
    owner_id: users.owner.id,
  });
  const replay = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(directGenerateBody(
      PNG_DATA_URL,
      "run-persisted-project",
      "direct-project-request",
    )),
  });
  const replayBody = await replay.json() as { runId?: string; error?: string };
  assert.equal(replay.status, 202, replayBody.error);
  assert.equal(replayBody.runId, acceptedBody.runId);
  const changedBody = directGenerateBody(
    PNG_DATA_URL,
    "run-persisted-project",
    "direct-project-request",
  );
  changedBody.request.prompt = "同请求号的另一份语义";
  const conflict = await request("/generate", "owner", {
    method: "POST",
    body: JSON.stringify(changedBody),
  });
  assert.equal(conflict.status, 409, await conflict.text());

  const otherProject = await request("/generate", "other", {
    method: "POST",
    body: JSON.stringify(directGenerateBody(
      PNG_DATA_URL,
      "run-persisted-project",
      "direct-forbidden-project",
    )),
  });
  assert.equal(otherProject.status, 403);
  assert.deepEqual(await otherProject.json(), {
    error: "无权把直接生成任务写入此项目",
  });

  for (const [index, ref] of [
    "/api/files/other-secret.png",
    "/api/files/missing-image.png",
    "/api/files/deleted-image.png",
    "/api/files/metadata-only-image.png",
    "/api/files/unreadable-image.png",
    "/api/files/truncated-image.png",
  ].entries()) {
    const denied = await request("/generate", "owner", {
      method: "POST",
      body: JSON.stringify(directGenerateBody(ref, undefined, `direct-denied-${index}`)),
    });
    assert.equal(denied.status, 403, ref);
    assert.deepEqual(await denied.json(), {
      error: "参考图不可用，请重新选择后再试",
      code: "reference-image-unavailable",
      references: [{ order: 0, reason: "reference image is unavailable" }],
    }, ref);
  }

  const duplicateBody = directGenerateBody(
    "/api/files/missing-image.png",
    undefined,
    "direct-denied-duplicate",
  );
  duplicateBody.request.references.push({
    ...duplicateBody.request.references[0],
    order: 1,
  });
  promotePromptVariantForTest(editVariant, "verified");
  try {
    const duplicateDenied = await request("/generate", "owner", {
      method: "POST",
      body: JSON.stringify(duplicateBody),
    });
    assert.equal(duplicateDenied.status, 403);
    assert.deepEqual(await duplicateDenied.json(), {
      error: "参考图不可用，请重新选择后再试",
      code: "reference-image-unavailable",
      references: [
        { order: 0, reason: "reference image is unavailable" },
        { order: 1, reason: "reference image is unavailable" },
      ],
    });
  } finally {
    promotePromptVariantForTest(editVariant);
  }

  const shared = await request("/generate", "other", {
    method: "POST",
    body: JSON.stringify(directGenerateBody(
      "/api/files/shared.png",
      undefined,
      "direct-shared-request",
    )),
  });
  assert.equal(shared.status, 202, await shared.text());
  const after = (await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM generation_runs",
  ))?.count ?? 0;
  assert.equal(after, before + 2, "只有项目内合法请求与共享图片请求可以入队");
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

await test("并发 bootstrap 只创建一个草稿，revision 冲突不覆盖且正式保存原子提升同一项目", async () => {
  const candidateIds = ["initial-draft-concurrent-a", "initial-draft-concurrent-b"];
  let draftId = "";
  try {
    const responses = await Promise.all(candidateIds.map((id) => request(
      "/projects/initial-draft/bootstrap",
      "owner",
      {
        method: "POST",
        body: JSON.stringify({ id, flow: flow() }),
      },
    )));
    assert.deepEqual(responses.map((response) => response.status).sort(), [200, 201]);
    const payloads = await Promise.all(responses.map((response) => response.json() as Promise<{
      created: boolean;
      draft: {
        id: string;
        name: string;
        revision: number;
        lifecycle: string;
        flow: ReturnType<typeof flow>;
      };
    }>));
    assert.equal(payloads.filter((payload) => payload.created).length, 1);
    assert.equal(new Set(payloads.map((payload) => payload.draft.id)).size, 1);
    draftId = payloads[0].draft.id;
    assert.match(payloads[0].draft.name, /^未修改项目名称\d{8}000000$/);
    assert.equal(payloads[0].draft.revision, 0);
    assert.equal(payloads[0].draft.lifecycle, "initial_draft");

    const storedDrafts = await query<{ id: string; lifecycle: string; draft_revision: number }>(`
      SELECT id, lifecycle, draft_revision FROM projects
      WHERE owner_id = $1 AND lifecycle = 'initial_draft' AND deleted_at IS NULL
    `, [users.owner.id]);
    assert.deepEqual(storedDrafts, [{ id: draftId, lifecycle: "initial_draft", draft_revision: 0 }]);

    const ownerDraftResponse = await request("/projects/initial-draft", "owner");
    assert.equal(ownerDraftResponse.status, 200);
    assert.equal(ownerDraftResponse.headers.get("cache-control"), "no-store");
    const ownerDraft = await ownerDraftResponse.json() as { draft: { id: string; revision: number } | null };
    assert.equal(ownerDraft.draft?.id, draftId);
    assert.equal(ownerDraft.draft?.revision, 0);
    const otherDraft = await (await request("/projects/initial-draft", "other")).json() as { draft: unknown };
    assert.equal(otherDraft.draft, null);

    for (const viewer of ["owner", "admin"] as const) {
      const list = await (await request("/projects", viewer)).json() as Array<{ id: string }>;
      assert.equal(list.some((project) => project.id === draftId), false);
      assert.equal((await request(`/projects/${draftId}`, viewer)).status, 404);
    }

    const editedFlow = flow(["/api/files/own-private.png"]);
    const synchronized = await request(`/projects/initial-draft/${draftId}`, "owner", {
      method: "PUT",
      body: JSON.stringify({
        expectedRevision: 0,
        name: "本地旧草稿名称",
        flow: editedFlow,
      }),
    });
    const synchronizedPayload = await synchronized.json() as {
      draft: { id: string; name: string; revision: number };
      error?: string;
    };
    assert.equal(synchronized.status, 200, synchronizedPayload.error);
    assert.equal(synchronizedPayload.draft.id, draftId);
    assert.equal(synchronizedPayload.draft.name, "本地旧草稿名称");
    assert.equal(synchronizedPayload.draft.revision, 1);
    assert.deepEqual(await query<{ asset_id: string }>(`
      SELECT asset_id FROM project_asset_refs WHERE project_id = $1 ORDER BY asset_id
    `, [draftId]), [{ asset_id: "own-private" }]);

    const runsBeforeDraftBypass = (await queryOne<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM generation_runs",
    ))?.count ?? 0;
    const draftRunPlan = await request("/run-plan", "owner", {
      method: "POST",
      body: JSON.stringify({
        nodes: editedFlow.nodes,
        edges: editedFlow.edges,
        onlyNodeId: "image_0",
        includeDownstream: false,
        projectId: draftId,
        clientRequestId: "initial-draft-run-plan-blocked",
      }),
    });
    assert.equal(draftRunPlan.status, 404, await draftRunPlan.text());
    const draftDirectRun = await request("/generate", "owner", {
      method: "POST",
      body: JSON.stringify(directGenerateBody(
        PNG_DATA_URL,
        draftId,
        "initial-draft-direct-blocked",
      )),
    });
    assert.equal(draftDirectRun.status, 404, await draftDirectRun.text());
    assert.equal((await queryOne<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM generation_runs",
    ))?.count, runsBeforeDraftBypass);

    const stale = await request(`/projects/initial-draft/${draftId}`, "owner", {
      method: "PUT",
      body: JSON.stringify({ expectedRevision: 0, name: "不应覆盖", flow: flow() }),
    });
    const stalePayload = await stale.json() as { currentRevision: number; error?: string };
    assert.equal(stale.status, 409, stalePayload.error);
    assert.equal(stalePayload.currentRevision, 1);
    assert.deepEqual(await queryOne<{ name: string; draft_revision: number }>(`
      SELECT name, draft_revision FROM projects WHERE id = $1
    `, [draftId]), { name: "本地旧草稿名称", draft_revision: 1 });

    const stalePromotion = await request("/projects", "owner", {
      method: "POST",
      body: JSON.stringify({
        id: draftId,
        name: "旧设备不应提升",
        flow: flow(),
        expectedDraftRevision: 0,
      }),
    });
    const stalePromotionPayload = await stalePromotion.json() as {
      currentRevision?: number;
      error?: string;
    };
    assert.equal(stalePromotion.status, 409, stalePromotionPayload.error);
    assert.equal(stalePromotionPayload.currentRevision, 1);

    const deniedPromotion = await request("/projects", "owner", {
      method: "POST",
      body: JSON.stringify({
        id: draftId,
        name: "不应提升",
        flow: flow(["/api/files/other-secret.png"]),
        expectedDraftRevision: 1,
      }),
    });
    assert.equal(deniedPromotion.status, 403, await deniedPromotion.text());
    assert.deepEqual(await queryOne<{ lifecycle: string; name: string; draft_revision: number }>(`
      SELECT lifecycle, name, draft_revision FROM projects WHERE id = $1
    `, [draftId]), {
      lifecycle: "initial_draft",
      name: "本地旧草稿名称",
      draft_revision: 1,
    });

    const promoted = await request("/projects", "owner", {
      method: "POST",
      body: JSON.stringify({
        id: draftId,
        name: "正式项目",
        flow: editedFlow,
        expectedDraftRevision: 1,
      }),
    });
    assert.equal(promoted.status, 200, await promoted.text());
    const savedBeforeStaleTab = await queryOne<{
      id: string;
      lifecycle: string;
      name: string;
      flow_json: string;
    }>(`
      SELECT id, lifecycle, name, flow_json FROM projects WHERE id = $1
    `, [draftId]);
    assert.equal(savedBeforeStaleTab?.id, draftId);
    assert.equal(savedBeforeStaleTab?.lifecycle, "saved");
    assert.equal(savedBeforeStaleTab?.name, "正式项目");

    const staleTabPromotion = await request("/projects", "owner", {
      method: "POST",
      body: JSON.stringify({
        id: draftId,
        name: "旧页签不应覆盖",
        flow: flow(),
        expectedDraftRevision: 1,
      }),
    });
    assert.equal(staleTabPromotion.status, 409, await staleTabPromotion.text());
    assert.deepEqual(await queryOne<{
      id: string;
      lifecycle: string;
      name: string;
      flow_json: string;
    }>(`
      SELECT id, lifecycle, name, flow_json FROM projects WHERE id = $1
    `, [draftId]), savedBeforeStaleTab);
    const afterPromotion = await (await request("/projects/initial-draft", "owner")).json() as { draft: unknown };
    assert.equal(afterPromotion.draft, null);
    const officialList = await (await request("/projects", "owner")).json() as Array<{ id: string }>;
    assert.equal(officialList.some((project) => project.id === draftId), true);
  } finally {
    await query("DELETE FROM projects WHERE id = ANY($1::text[])", [candidateIds]);
  }
});

await test("草稿权限统一隐藏，放弃需确认且 15 天内可恢复", async () => {
  const ownerDraftId = "abandon-owner-initial-draft";
  const otherDraftId = "abandon-other-initial-draft";
  const replacementDraftId = "abandon-owner-replacement";
  const maskFileId = "abandon-owner-mask";
  const retiredMaskFileId = "abandon-owner-retired-mask";
  try {
    for (const [user, id] of [["owner", ownerDraftId], ["other", otherDraftId]] as const) {
      const bootstrap = await request("/projects/initial-draft/bootstrap", user, {
        method: "POST",
        body: JSON.stringify({ id, flow: flow() }),
      });
      assert.equal(bootstrap.status, 201, await bootstrap.text());
    }
    const retiredPurgeAfter = new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000).toISOString();
    await query(`
      INSERT INTO files (
        id, owner_id, source_type, mime_type, project_id, node_id, created_at,
        deleted_at, purge_after
      ) VALUES
        ($1, $3, 'mask', 'image/png', $4, 'mask-node', $5, NULL, NULL),
        ($2, $3, 'mask', 'image/png', $4, 'retired-mask-node', $5, NULL, $6)
    `, [
      maskFileId,
      retiredMaskFileId,
      users.owner.id,
      ownerDraftId,
      now,
      retiredPurgeAfter,
    ]);

    const deniedUpdate = await request(`/projects/initial-draft/${ownerDraftId}`, "other", {
      method: "PUT",
      body: JSON.stringify({ expectedRevision: 0, name: "不应该可见", flow: flow() }),
    });
    const unknownUpdate = await request("/projects/initial-draft/unknown-draft-id", "other", {
      method: "PUT",
      body: JSON.stringify({ expectedRevision: 0, name: "不存在", flow: flow() }),
    });
    assert.equal(deniedUpdate.status, 404);
    assert.equal(unknownUpdate.status, 404);
    assert.deepEqual(await deniedUpdate.json(), await unknownUpdate.json());

    const deniedDelete = await request(`/projects/initial-draft/${ownerDraftId}`, "other", {
      method: "DELETE",
      body: JSON.stringify({ confirm: true, expectedRevision: 0 }),
    });
    assert.equal(deniedDelete.status, 404, await deniedDelete.text());

    const missingConfirmation = await request(`/projects/initial-draft/${ownerDraftId}`, "owner", {
      method: "DELETE",
      body: JSON.stringify({ expectedRevision: 0 }),
    });
    assert.equal(missingConfirmation.status, 400, await missingConfirmation.text());
    const stale = await request(`/projects/initial-draft/${ownerDraftId}`, "owner", {
      method: "DELETE",
      body: JSON.stringify({ confirm: true, expectedRevision: 1 }),
    });
    assert.equal(stale.status, 409, await stale.text());
    assert.deepEqual(await queryOne<{ deleted_at: string | null; draft_revision: number }>(`
      SELECT deleted_at, draft_revision FROM projects WHERE id = $1
    `, [ownerDraftId]), { deleted_at: null, draft_revision: 0 });

    const beforeAbandon = Date.now();
    const abandoned = await request(`/projects/initial-draft/${ownerDraftId}`, "owner", {
      method: "DELETE",
      body: JSON.stringify({ confirm: true, expectedRevision: 0 }),
    });
    const abandonedPayload = await abandoned.json() as { ok?: boolean; purgeAfter?: string; error?: string };
    assert.equal(abandoned.status, 200, abandonedPayload.error);
    assert.equal(abandonedPayload.ok, true);
    const purgeAfterMs = new Date(abandonedPayload.purgeAfter ?? "").getTime();
    assert.ok(purgeAfterMs >= beforeAbandon + 15 * 24 * 60 * 60 * 1_000 - 2_000);
    assert.ok(purgeAfterMs <= Date.now() + 15 * 24 * 60 * 60 * 1_000 + 2_000);
    const abandonedRow = await queryOne<{
      lifecycle: string;
      deleted_at: string | null;
      purge_after: string | null;
    }>(`
      SELECT lifecycle, deleted_at, purge_after FROM projects WHERE id = $1
    `, [ownerDraftId]);
    assert.equal(abandonedRow?.lifecycle, "initial_draft");
    assert.ok(abandonedRow?.deleted_at);
    assert.equal(abandonedRow?.purge_after, abandonedPayload.purgeAfter);
    const abandonedMask = await queryOne<{ deleted_at: string | null; purge_after: string | null }>(`
      SELECT deleted_at, purge_after FROM files WHERE id = $1
    `, [maskFileId]);
    assert.ok(abandonedMask?.deleted_at);
    assert.equal(abandonedMask?.purge_after, abandonedPayload.purgeAfter);
    const afterAbandon = await (await request("/projects/initial-draft", "owner")).json() as { draft: unknown };
    assert.equal(afterAbandon.draft, null);

    const replacement = await request("/projects/initial-draft/bootstrap", "owner", {
      method: "POST",
      body: JSON.stringify({ id: replacementDraftId, flow: flow() }),
    });
    const replacementPayload = await replacement.json() as { draft?: { id: string }; error?: string };
    assert.equal(replacement.status, 201, replacementPayload.error);
    assert.equal(replacementPayload.draft?.id, replacementDraftId);

    const blockedRestore = await request(`/projects/initial-draft/${ownerDraftId}/restore`, "owner", {
      method: "POST",
      body: "{}",
    });
    const blockedRestorePayload = await blockedRestore.json() as { currentDraftId?: string; error?: string };
    assert.equal(blockedRestore.status, 409, blockedRestorePayload.error);
    assert.equal(blockedRestorePayload.currentDraftId, replacementDraftId);

    const abandonReplacement = await request(`/projects/initial-draft/${replacementDraftId}`, "owner", {
      method: "DELETE",
      body: JSON.stringify({ confirm: true, expectedRevision: 0 }),
    });
    assert.equal(abandonReplacement.status, 200, await abandonReplacement.text());
    const restored = await request(`/projects/initial-draft/${ownerDraftId}/restore`, "owner", {
      method: "POST",
      body: "{}",
    });
    const restoredPayload = await restored.json() as { draft?: { id: string; revision: number }; error?: string };
    assert.equal(restored.status, 200, restoredPayload.error);
    assert.equal(restoredPayload.draft?.id, ownerDraftId);
    assert.equal(restoredPayload.draft?.revision, 0);
    assert.deepEqual(await queryOne<{ deleted_at: string | null; purge_after: string | null }>(`
      SELECT deleted_at, purge_after FROM files WHERE id = $1
    `, [maskFileId]), { deleted_at: null, purge_after: null });
    assert.deepEqual(await queryOne<{ deleted_at: string | null; purge_after: string | null }>(`
      SELECT deleted_at, purge_after FROM files WHERE id = $1
    `, [retiredMaskFileId]), { deleted_at: null, purge_after: retiredPurgeAfter });
  } finally {
    await query("DELETE FROM files WHERE id = ANY($1::text[])", [[maskFileId, retiredMaskFileId]]);
    await query("DELETE FROM projects WHERE id = ANY($1::text[])", [[
      ownerDraftId,
      otherDraftId,
      replacementDraftId,
    ]]);
  }
});

await test("强制清除草稿：按当前用户定位、需确认、幂等且只影响本人", async () => {
  const ownerDraftId = "force-clear-owner-draft";
  const otherDraftId = "force-clear-other-draft";
  const ownerMaskId = "force-clear-owner-mask";
  try {
    for (const [user, id] of [["owner", ownerDraftId], ["other", otherDraftId]] as const) {
      const bootstrap = await request("/projects/initial-draft/bootstrap", user, {
        method: "POST",
        body: JSON.stringify({ id, flow: flow() }),
      });
      assert.equal(bootstrap.status, 201, await bootstrap.text());
    }
    await query(`
      INSERT INTO files (
        id, owner_id, source_type, mime_type, project_id, node_id, created_at, deleted_at, purge_after
      ) VALUES ($1, $2, 'mask', 'image/png', $3, 'mask-node', $4, NULL, NULL)
    `, [ownerMaskId, users.owner.id, ownerDraftId, now]);

    const missingConfirm = await request("/projects/initial-draft/force-clear", "owner", {
      method: "POST",
      body: "{}",
    });
    assert.equal(missingConfirm.status, 400, await missingConfirm.text());
    assert.equal((await queryOne<{ deleted_at: string | null }>(
      "SELECT deleted_at FROM projects WHERE id = $1",
      [ownerDraftId],
    ))?.deleted_at, null);

    const beforeClear = Date.now();
    const cleared = await request("/projects/initial-draft/force-clear", "owner", {
      method: "POST",
      body: JSON.stringify({ confirm: true }),
    });
    const clearedPayload = await cleared.json() as { ok?: boolean; purgeAfter?: string; error?: string };
    assert.equal(cleared.status, 200, clearedPayload.error);
    assert.equal(clearedPayload.ok, true);
    const purgeAfterMs = new Date(clearedPayload.purgeAfter ?? "").getTime();
    assert.ok(purgeAfterMs >= beforeClear + 15 * 24 * 60 * 60 * 1_000 - 2_000);
    assert.ok(purgeAfterMs <= Date.now() + 15 * 24 * 60 * 60 * 1_000 + 2_000);
    const ownerRow = await queryOne<{ deleted_at: string | null; purge_after: string | null }>(
      "SELECT deleted_at, purge_after FROM projects WHERE id = $1",
      [ownerDraftId],
    );
    assert.ok(ownerRow?.deleted_at);
    assert.equal(ownerRow?.purge_after, clearedPayload.purgeAfter);
    assert.equal((await (await request("/projects/initial-draft", "owner")).json() as { draft: unknown }).draft, null);
    const ownerMask = await queryOne<{ deleted_at: string | null; purge_after: string | null }>(
      "SELECT deleted_at, purge_after FROM files WHERE id = $1",
      [ownerMaskId],
    );
    assert.ok(ownerMask?.deleted_at);
    assert.equal(ownerMask?.purge_after, clearedPayload.purgeAfter);

    const otherRow = await queryOne<{ deleted_at: string | null }>(
      "SELECT deleted_at FROM projects WHERE id = $1",
      [otherDraftId],
    );
    assert.equal(otherRow?.deleted_at, null);

    const idempotent = await request("/projects/initial-draft/force-clear", "owner", {
      method: "POST",
      body: JSON.stringify({ confirm: true }),
    });
    assert.equal(idempotent.status, 200);
    const idempotentPayload = await idempotent.json() as { ok?: boolean; error?: string };
    assert.equal(idempotentPayload.ok, true);

    const otherCleared = await request("/projects/initial-draft/force-clear", "other", {
      method: "POST",
      body: JSON.stringify({ confirm: true }),
    });
    assert.equal(otherCleared.status, 200, await otherCleared.text());
    assert.ok((await queryOne<{ deleted_at: string | null }>(
      "SELECT deleted_at FROM projects WHERE id = $1",
      [otherDraftId],
    ))?.deleted_at);
  } finally {
    await query("DELETE FROM files WHERE id = ANY($1::text[])", [[ownerMaskId]]);
    await query("DELETE FROM projects WHERE id = ANY($1::text[])", [[ownerDraftId, otherDraftId]]);
  }
});

await test("强制清除草稿：含退役 modelId 的损坏草稿无需解析即可清除并重新 bootstrap", async () => {
  const corruptedDraftId = "force-clear-corrupted-draft";
  const reboundDraftId = "force-clear-rebound-draft";
  const retiredModelFlow = {
    schemaVersion: 6,
    nodes: [{
      id: "retired-model-node",
      type: "image",
      position: { x: 0, y: 0 },
      data: {
        kind: "image",
        label: "退役模型节点",
        status: "idle",
        modelId: "gpt-image-2-vip",
        operationMode: "generate",
        prompt: "旧草稿提示词",
        aspectRatio: "1:1",
        batchSize: 1,
        outputImages: [],
      },
    }],
    edges: [],
  };
  try {
    await query(`
      INSERT INTO projects (
        id, owner_id, name, flow_json, lifecycle, draft_revision, updated_at, created_at
      ) VALUES ($1, $2, '损坏草稿', $3, 'initial_draft', 0, $4, $4)
    `, [corruptedDraftId, users.owner.id, JSON.stringify(retiredModelFlow), now]);

    const blocked = await request("/projects/initial-draft", "owner");
    assert.equal(blocked.status, 422, await blocked.text());

    const cleared = await request("/projects/initial-draft/force-clear", "owner", {
      method: "POST",
      body: JSON.stringify({ confirm: true }),
    });
    const clearedPayload = await cleared.json() as { ok?: boolean; purgeAfter?: string; error?: string };
    assert.equal(cleared.status, 200, clearedPayload.error);
    assert.equal(clearedPayload.ok, true);
    assert.ok(typeof clearedPayload.purgeAfter === "string" && clearedPayload.purgeAfter);
    assert.ok((await queryOne<{ deleted_at: string | null }>(
      "SELECT deleted_at FROM projects WHERE id = $1",
      [corruptedDraftId],
    ))?.deleted_at);

    const rebound = await request("/projects/initial-draft/bootstrap", "owner", {
      method: "POST",
      body: JSON.stringify({ id: reboundDraftId, flow: flow() }),
    });
    assert.equal(rebound.status, 201, await rebound.text());
  } finally {
    await query("DELETE FROM projects WHERE id = ANY($1::text[])", [[corruptedDraftId, reboundDraftId]]);
  }
});

await test("账号转移遇到双方各自的初始草稿时明确拒绝且不改变归属", async () => {
  const sourceDraftId = "transfer-source-initial-draft";
  const targetDraftId = "transfer-target-initial-draft";
  await query(`
    INSERT INTO projects (
      id, owner_id, name, flow_json, lifecycle, draft_revision, updated_at, created_at
    ) VALUES
      ($1, $3, '转出草稿', $5, 'initial_draft', 0, $6, $6),
      ($2, $4, '接收草稿', $5, 'initial_draft', 0, $6, $6)
  `, [sourceDraftId, targetDraftId, users.owner.id, users.other.id, JSON.stringify(flow()), now]);
  try {
    const response = await request(`/auth/users/${users.owner.id}`, "admin", {
      method: "DELETE",
      headers: { cookie: `${SESSION_COOKIE}=${adminSession.token}` },
      body: JSON.stringify({ transferToUserId: users.other.id }),
    });
    const payload = await response.json() as { error: string };
    assert.equal(response.status, 409, payload.error);
    assert.match(payload.error, /初始草稿/);
    assert.deepEqual(await query<{ id: string; owner_id: string }>(`
      SELECT id, owner_id FROM projects WHERE id = ANY($1::text[]) ORDER BY id
    `, [[sourceDraftId, targetDraftId]]), [
      { id: sourceDraftId, owner_id: users.owner.id },
      { id: targetDraftId, owner_id: users.other.id },
    ]);
    assert.equal((await queryOne<{ active: number }>(`
      SELECT active FROM users WHERE id = $1
    `, [users.owner.id]))?.active, 1);
  } finally {
    await query("DELETE FROM projects WHERE id = ANY($1::text[])", [[sourceDraftId, targetDraftId]]);
  }
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
      ($1, $3, 'private', '锁前名称', 'reference', '/api/files/lock-patch.png', $4, NULL, NULL),
      ($2, $3, 'private', '回收站素材', 'reference', '/api/files/lock-restore.png', $4, $4, $4)
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
          name: "被阻止素材", category: "reference", scope: "private", image: PNG_DATA_URL,
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
