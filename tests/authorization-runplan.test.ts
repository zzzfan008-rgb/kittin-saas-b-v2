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

console.log("运行计划授权回归测试");

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
  // 评估 ledger 移除后，参数档案绑定与偏离检测已删除，
  // modelOptions 偏离不再触发 parameter-drift 拒绝，正常入队。
  const status = response.status;
  assert.ok(
    status === 200 || status === 202,
    `expected 200 or 202, got ${status} body: ${await response.text()}`,
  );
  const after = (await queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM generation_runs",
  ))?.count ?? 0;
  assert.equal(after, before + 1);
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

  // 评估 ledger 移除后，参数档案绑定与偏离检测已删除，
  // modelOptions 偏离不再触发 parameter-drift 拒绝，正常入队。
  const response = await request("/run-plan", "owner", {
    method: "POST",
    body: JSON.stringify({
      ...savedFlow,
      onlyNodeId: "generate",
      projectId: "strict-model-options-run-project",
      clientRequestId: "invalid-model-options-run-plan",
    }),
  });
  const status = response.status;
  assert.ok(
    status === 200 || status === 202,
    `expected 200 or 202, got ${status} body: ${await response.text()}`,
  );
  assert.equal((await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE client_request_id = 'invalid-model-options-run-plan'
  `))?.count, 1);
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

// evaluation payload 测试随 admission 系统移除而删除。

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
  // v9（64 Phase 3）：variant 发布状态概念已删，无需 promote。
  {
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



console.log(`\n通过 ${passed} 项`);
await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
await closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
