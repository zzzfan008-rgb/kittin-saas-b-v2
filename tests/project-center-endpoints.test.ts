/**
 * 项目中心服务端端点测试（DELETE 软删 / PATCH 改名 / GET 列表 previewImage 封面）。
 *
 * 覆盖契约：
 * - DELETE /api/projects/:id：owner 软删 saved 项目（deleted_at + purge_after），
 *   他人 404（owner 限定）、初始草稿 409（走专属端点）、非法 id 400、重复删 404。
 * - PATCH /api/projects/:id：owner 改名（name/updated_at 刷新），他人/不存在 404，
 *   空 name / 超长 400，回收站项目 404。
 * - GET /api/projects：previewImage = 最后一次成功生成步的最后一张图；
 *   无生成记录 → 字段缺省（undefined，不落 null）。
 *
 * 运行：node scripts/test-with-postgres.mjs tests/project-center-endpoints.test.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import express, { type Request } from "express";
import type { AddressInfo } from "node:net";
import type { AuthenticatedRequest, AuthUser } from "../server/lib/auth";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-project-center-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "project-center-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const { initializeDatabase, closeDatabaseForTests, query, queryOne } = await import("../server/lib/database");
const { projectsRouter } = await import("../server/routes/projects");
const { createSession, SESSION_COOKIE } = await import("../server/lib/auth");
await initializeDatabase();

const users: Record<string, AuthUser> = {
  owner: {
    id: "user-owner", accountId: "owner", displayName: "Owner",
    role: "user", mustChangePassword: false,
  },
  other: {
    id: "user-other", accountId: "other", displayName: "Other",
    role: "user", mustChangePassword: false,
  },
};

const now = new Date().toISOString();
for (const user of Object.values(users)) {
  await query(`
    INSERT INTO users (id, account_id, display_name, role, password_hash, active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, 'test-only', 1, $5, $5)
  `, [user.id, user.accountId, user.displayName, user.role, now]);
}

const app = express();
app.use(express.json({ limit: "512mb" }));
app.use((req: Request, _res, next) => {
  const user = users[String(req.headers["x-test-user"] ?? "")];
  if (!user) {
    _res.status(401).json({ error: "test user required" });
    return;
  }
  (req as AuthenticatedRequest).authUser = user;
  next();
});
app.use("/projects", projectsRouter);

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

const MINIMAL_FLOW = {
  schemaVersion: 9,
  nodes: [
    { id: "text-1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "文本", status: "idle", text: "红裙" } },
  ],
  edges: [],
};

async function createSavedProject(id: string, name: string, user: keyof typeof users = "owner") {
  const response = await request("/projects/", user, {
    method: "POST",
    body: JSON.stringify({ id, name, flow: MINIMAL_FLOW }),
  });
  assert.equal(response.status, 200, `创建项目 ${id} 失败: ${await response.text()}`);
}

async function insertGenerationStep(
  projectId: string,
  runStartedAt: number,
  images: string[],
): Promise<void> {
  const runId = `run-${projectId}-${runStartedAt}`;
  await query(
    `INSERT INTO generation_runs (
      id, owner_id, project_id, project_name, node_id, node_label, kind,
      requested_count, successful_count, status, started_at, finished_at
    ) VALUES ($1, $2, $3, $4, 'image-1', '生图', 'image-generator', 1, $5, 'succeeded', $6, $6)`,
    [runId, "user-owner", projectId, projectId, images.length, runStartedAt],
  );
  await query(
    `INSERT INTO generation_run_steps (
      id, run_id, step_index, node_id, kind, step_json, status, output_images_json
    ) VALUES ($1, $2, 0, 'image-1', 'image-generator', '{}', 'succeeded', $3)`,
    [`step-${runId}`, runId, JSON.stringify(images)],
  );
}

let passed = 0;
const failures: Array<{ name: string; error: unknown }> = [];
async function test(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`  ✗ ${name}`);
    console.error(error);
  }
}

// ── DELETE 软删 ──

await test("DELETE /:id：owner 软删 saved 项目，落 deleted_at + purge_after", async () => {
  await createSavedProject("del-ok-1", "待删除项目");
  const response = await request("/projects/del-ok-1", "owner", { method: "DELETE" });
  assert.equal(response.status, 200);
  const body = await response.json() as { ok: boolean; purgeAfter: string };
  assert.equal(body.ok, true);
  assert.ok(Date.parse(body.purgeAfter) > Date.now(), "purgeAfter 必须是未来时间（30 天保留期）");
  const row = await queryOne<{ deleted_at: string; purge_after: string }>(
    "SELECT deleted_at, purge_after FROM projects WHERE id = 'del-ok-1'",
  );
  assert.ok(row?.deleted_at, "deleted_at 必须落库");
  assert.ok(row?.purge_after, "purge_after 必须落库");
});

await test("DELETE /:id：删除后列表不可见、GET 单项 404、重复 DELETE 404", async () => {
  await createSavedProject("del-ok-2", "二次验证项目");
  const first = await request("/projects/del-ok-2", "owner", { method: "DELETE" });
  assert.equal(first.status, 200);
  const second = await request("/projects/del-ok-2", "owner", { method: "DELETE" });
  assert.equal(second.status, 404, "重复删除应 404（deleted_at IS NULL 过滤）");
  const detail = await request("/projects/del-ok-2", "owner");
  assert.equal(detail.status, 404);
  const list = await request("/projects/", "owner");
  const summaries = await list.json() as Array<{ id: string }>;
  assert.ok(!summaries.some((item) => item.id === "del-ok-2"), "列表不得再含已删项目");
});

await test("DELETE /:id：他人项目 404（owner 限定，不泄露存在性）", async () => {
  await createSavedProject("del-other-1", "他人项目", "owner");
  const response = await request("/projects/del-other-1", "other", { method: "DELETE" });
  assert.equal(response.status, 404);
  const row = await queryOne<{ deleted_at: string | null }>(
    "SELECT deleted_at FROM projects WHERE id = 'del-other-1'",
  );
  assert.equal(row?.deleted_at, null, "他人删除不得生效");
});

await test("DELETE /:id：初始草稿 409（走草稿专属端点，带 revision 保护）", async () => {
  await query(
    `INSERT INTO projects (id, owner_id, name, flow_json, lifecycle, draft_revision, updated_at, created_at)
     VALUES ('del-draft-1', 'user-owner', '草稿', $1, 'initial_draft', 0, $2, $2)`,
    [JSON.stringify(MINIMAL_FLOW), new Date().toISOString()],
  );
  const response = await request("/projects/del-draft-1", "owner", { method: "DELETE" });
  assert.equal(response.status, 409);
  const body = await response.json() as { error: string };
  assert.match(body.error, /初始草稿/);
});

await test("DELETE /:id：非法 id 400", async () => {
  const response = await request("/projects/bad id with space", "owner", { method: "DELETE" });
  assert.equal(response.status, 400);
});

// ── PATCH 改名 ──

await test("PATCH /:id：owner 改名成功，name 落库 + updated_at 刷新 + 返回新名", async () => {
  await createSavedProject("ren-1", "旧名字");
  const before = await queryOne<{ updated_at: string }>(
    "SELECT updated_at FROM projects WHERE id = 'ren-1'",
  );
  await new Promise((resolve) => setTimeout(resolve, 5));
  const response = await request("/projects/ren-1", "owner", {
    method: "PATCH",
    body: JSON.stringify({ name: "  新名字带空白  " }),
  });
  assert.equal(response.status, 200);
  const body = await response.json() as { ok: boolean; id: string; name: string; updatedAt: string };
  assert.equal(body.ok, true);
  assert.equal(body.id, "ren-1");
  assert.equal(body.name, "新名字带空白", "name 必须 trim 后落库");
  const row = await queryOne<{ name: string; updated_at: string }>(
    "SELECT name, updated_at FROM projects WHERE id = 'ren-1'",
  );
  assert.equal(row?.name, "新名字带空白");
  assert.ok(
    before && row && row.updated_at > before.updated_at,
    "updated_at 必须刷新（列表按 updated_at 排序）",
  );
});

await test("PATCH /:id：他人 404、不存在 404、回收站项目 404", async () => {
  await createSavedProject("ren-2", "他人不能改");
  const other = await request("/projects/ren-2", "other", {
    method: "PATCH", body: JSON.stringify({ name: "抢注名" }),
  });
  assert.equal(other.status, 404);
  const missing = await request("/projects/ren-missing", "owner", {
    method: "PATCH", body: JSON.stringify({ name: "幽灵" }),
  });
  assert.equal(missing.status, 404);

  await createSavedProject("ren-3", "已删不能改");
  await request("/projects/ren-3", "owner", { method: "DELETE" });
  const trashed = await request("/projects/ren-3", "owner", {
    method: "PATCH", body: JSON.stringify({ name: "复活名" }),
  });
  assert.equal(trashed.status, 404, "回收站项目不得通过 PATCH 复活");
});

await test("PATCH /:id：非法 name 400（空串 / 纯空白 / 超过 200 字）", async () => {
  await createSavedProject("ren-4", "校验载体");
  for (const bad of ["", "   ", "x".repeat(201)]) {
    const response = await request("/projects/ren-4", "owner", {
      method: "PATCH", body: JSON.stringify({ name: bad }),
    });
    assert.equal(response.status, 400, `name=${JSON.stringify(bad.slice(0, 10))}… 应 400`);
  }
  const row = await queryOne<{ name: string }>("SELECT name FROM projects WHERE id = 'ren-4'");
  assert.equal(row?.name, "校验载体", "非法请求不得污染原 name");
});

// ── GET 列表 previewImage 封面 ──

await test("GET /：previewImage = 最后一次生成步的最后一张图（run 时间降序）", async () => {
  await createSavedProject("prev-1", "有封面项目");
  const old = Date.now() - 10_000;
  await insertGenerationStep("prev-1", old, ["/api/files/generated-old-1.png"]);
  await insertGenerationStep("prev-1", Date.now(), [
    "/api/files/generated-latest-a.png",
    "/api/files/generated-latest-b.png",
  ]);
  const response = await request("/projects/", "owner");
  assert.equal(response.status, 200);
  const summaries = await response.json() as Array<{ id: string; previewImage?: string }>;
  const mine = summaries.find((item) => item.id === "prev-1");
  assert.ok(mine, "列表必须含 prev-1");
  assert.equal(
    mine?.previewImage,
    "/api/files/generated-latest-b.png",
    "封面 = 最新 run 最后一张图（不是最早的，也不是数组第一张）",
  );
});

await test("GET /：无生成记录 → previewImage 字段缺省（undefined 而非 null）", async () => {
  await createSavedProject("prev-2", "无封面项目");
  const response = await request("/projects/", "owner");
  const summaries = await response.json() as Array<{ id: string; previewImage?: string }>;
  const mine = summaries.find((item) => item.id === "prev-2");
  assert.ok(mine, "列表必须含 prev-2");
  assert.equal("previewImage" in (mine ?? {}), false, "无封面时字段应整体缺省（前端 previewImage?: string）");
});

await test("GET /：列表项不含 flow_json（封面优化：不再传全量画布）", async () => {
  const response = await request("/projects/", "owner");
  const text = await response.text();
  assert.ok(!text.includes("flow_json"), "响应不得含 flow_json 字段");
  assert.ok(!text.includes("nodes"), "响应不得泄漏画布节点（flow 结构）");
});

server.close();
if (failures.length > 0) {
  console.error(`\n${failures.length} 项失败：${failures.map((f) => f.name).join("；")}`);
  process.exit(1);
}
console.log(`\n${passed} 通过（项目中心端点）`);
await closeDatabaseForTests();
process.exit(0);
