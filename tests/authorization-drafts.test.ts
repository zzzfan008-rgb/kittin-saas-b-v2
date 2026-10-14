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
    ('shared-asset', $1, 'shared', '共享素材', 'reference', '/api/files/shared.png', $3),
    ('other-private', $2, 'private', '他人私有素材', 'reference', '/api/files/private.png', $3),
    ('own-private', $1, 'private', '本人私有素材', 'reference', '/api/files/own-private.png', $3)
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

console.log("草稿授权回归测试");

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


console.log(`\n通过 ${passed} 项`);
await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
await closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
