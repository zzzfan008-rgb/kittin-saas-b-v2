/**
 * `✨ 帮我补全` 路由契约测试（隔离 PostgreSQL runner，碰库 → SERIAL）。
 * 覆盖契约 plan.md §6 路由契约：未登录 401；只读项目 403；入参非法 400；
 * 成功 200 {rewritten}；改写失败降级 200 {rewritten:null,skipped:true}；
 * 服务端按 nodeId 反查下游生成节点 kind/mode（不信任客户端传参）。
 *
 * 运行：node scripts/test-with-postgres.mjs tests/text-rewrite-route.test.ts
 */
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import express, { type Request, type Response, type NextFunction } from "express";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "text-rewrite-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const { closeDatabaseForTests, query, initializeDatabase } = await import("../server/lib/database");
const { createTextRewriteRouter } = await import("../server/routes/textRewrite");
const typeModule = await import("../src/types/workflow");
import type { AuthUser } from "../server/lib/auth";
import type { TextRewriteRouterDeps } from "../server/routes/textRewrite";
import type { RewriteContext, RewriteOutcome } from "../server/lib/textRewriter";

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const now = new Date("2026-10-12T00:00:00.000Z").toISOString();

const owner: AuthUser = { id: "rw-owner", accountId: "rw-owner-acct", displayName: "Owner", role: "user", mustChangePassword: false };
const other: AuthUser = { id: "rw-other", accountId: "rw-other-acct", displayName: "Other", role: "user", mustChangePassword: false };
const users: Record<string, AuthUser> = { owner, other };

await initializeDatabase();
for (const user of [owner, other]) {
  await query(
    `INSERT INTO users (id, account_id, display_name, role, password_hash, active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'test-only', 1, $5, $5)`,
    [user.id, user.accountId, user.displayName, user.role, now],
  );
}

// 合法 v9 flow：text(t1) —prompt→ image-generator(g1, edit)；另一个悬空 text(t2) 无下游。
const flow = {
  schemaVersion: typeModule.WORKFLOW_SCHEMA_VERSION,
  nodes: [
    { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "要求", status: "idle", text: "红裙室内" } },
    { id: "t2", type: "text", position: { x: 0, y: 1 }, data: { kind: "text", label: "悬空", status: "idle", text: "无下游" } },
    {
      id: "g1", type: "image-generator", position: { x: 1, y: 0 },
      data: {
        kind: "image-generator", label: "生图", status: "idle",
        modelId: "gpt-image-2.5-flare-vip", aspectRatio: "1:1", batchSize: 1, operationMode: "edit",
      },
    },
  ],
  edges: [
    { id: "e1", source: "t1", target: "g1", targetHandle: "prompt", data: {} },
  ],
};
await query(
  `INSERT INTO projects (id, owner_id, name, flow_json, lifecycle, updated_at, created_at)
   VALUES ('rw-proj', $1, 'RW Project', $2, 'saved', $3, $3)`,
  [owner.id, JSON.stringify(flow), now],
);

const rewriteDeps: TextRewriteRouterDeps = {};
function buildApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  // 测试门：无 x-test-user 头 → 401（复刻生产全局 requireAuth：未登录不可达本路由）。
  app.use((req: Request, res: Response, next: NextFunction) => {
    const user = users[String(req.headers["x-test-user"] ?? "")];
    if (!user) {
      res.status(401).json({ error: "请先登录", code: "UNAUTHENTICATED" });
      return;
    }
    (req as Request & { authUser: AuthUser }).authUser = user;
    next();
  });
  app.use("/api/text", createTextRewriteRouter(rewriteDeps));
  return app;
}

const server = buildApp().listen(0, "127.0.0.1");
await new Promise<void>((resolve, reject) => {
  server.once("listening", resolve);
  server.once("error", reject);
});
const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

async function call(pathname: string, init: { user?: string; body?: unknown } = {}): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (init.user) headers["x-test-user"] = init.user;
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "POST",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : {} };
}

console.log("提示词改写补全路由契约测试");

await test("未登录（无身份头）→ 401", async () => {
  const r = await call("/api/text/rewrite", { body: { text: "红裙", projectId: "rw-proj" } });
  assert.equal(r.status, 401);
});

await test("只读项目（非 owner）→ 403", async () => {
  const r = await call("/api/text/rewrite", { user: "other", body: { text: "红裙", projectId: "rw-proj" } });
  assert.equal(r.status, 403);
  assert.equal(r.body.error, "只读项目不能改写提示词");
});

await test("入参非法 → 400 invalid_request", async () => {
  const bad: unknown[] = [
    { text: "", projectId: "rw-proj" },
    { text: "   ", projectId: "rw-proj" },
    { text: "x".repeat(20_001), projectId: "rw-proj" },
    { text: "红裙" },
    { text: "红裙", projectId: "bad id!!" },
    { text: 123, projectId: "rw-proj" },
  ];
  for (const body of bad) {
    const r = await call("/api/text/rewrite", { user: "owner", body });
    assert.equal(r.status, 400, `应 400：${JSON.stringify(body).slice(0, 40)}`);
    assert.equal(r.body.code, "invalid_request");
  }
});

await test("项目不存在 → 404", async () => {
  const r = await call("/api/text/rewrite", { user: "owner", body: { text: "红裙", projectId: "no-such-proj" } });
  assert.equal(r.status, 404);
});

await test("成功 200 {rewritten}，且按 nodeId 反查下游 kind/mode（不信客户端传参）", async () => {
  let capturedContext: RewriteContext | undefined;
  let capturedText: string | undefined;
  rewriteDeps.rewrite = async (text: string, ctx: RewriteContext): Promise<RewriteOutcome> => {
      capturedText = text;
      capturedContext = ctx;
      return { text: "改写后的红裙提示词", rewritten: true };
    };
  const r = await call("/api/text/rewrite", {
    user: "owner",
    body: { text: "红裙室内", projectId: "rw-proj", nodeId: "t1" },
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.rewritten, "改写后的红裙提示词");
  assert.equal(capturedText, "红裙室内");
  assert.ok(capturedContext, "必须把反查到的上下文传给改写核心");
  assert.equal(capturedContext!.kind, "image-generator");
  assert.equal(capturedContext!.mode, "edit");
});

await test("nodeId 无下游生成节点 → 默认上下文（image/generate），仍成功", async () => {
  let capturedContext: RewriteContext | undefined;
  rewriteDeps.rewrite = async (_text: string, ctx: RewriteContext): Promise<RewriteOutcome> => {
      capturedContext = ctx;
      return { text: "默认上下文改写", rewritten: true };
    };
  const r = await call("/api/text/rewrite", {
    user: "owner",
    body: { text: "悬空文本", projectId: "rw-proj", nodeId: "t2" },
  });
  assert.equal(r.status, 200);
  assert.equal(capturedContext!.kind, "image-generator");
  assert.equal(capturedContext!.mode, "generate");
});

await test("改写失败/跳过 → 200 {rewritten:null,skipped:true}（绝不 5xx）", async () => {
  rewriteDeps.rewrite = async (): Promise<RewriteOutcome> => ({ text: "原文", rewritten: false, reason: "text_transport_error" });
  const r = await call("/api/text/rewrite", { user: "owner", body: { text: "原文", projectId: "rw-proj" } });
  assert.equal(r.status, 200);
  assert.equal(r.body.rewritten, null);
  assert.equal(r.body.skipped, true);
});

server.close();
await query(`DELETE FROM projects WHERE id = 'rw-proj'`);
await query(`DELETE FROM users WHERE id IN ('rw-owner', 'rw-other')`);
await closeDatabaseForTests();

console.log(`\n通过 ${passed} 项提示词改写路由契约测试`);
