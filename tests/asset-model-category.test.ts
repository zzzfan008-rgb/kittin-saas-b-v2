import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import express from "express";
import type { AddressInfo } from "node:net";
import type { AuthenticatedRequest, AuthUser } from "../server/lib/auth";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

// R-86 数字模特库：assets.category 扩容 'model' 的后端聚焦回归。
// 独立于 authorization.test.ts，避免被该分支进行中的 v8 flow 夹具重构所阻断。
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-asset-model-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "asset-model-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

await resetPostgresTestDatabase();
const { closeDatabaseForTests, initializeDatabase, query } = await import("../server/lib/database");
const { assetsRouter } = await import("../server/routes/assets");
const { filesRouter } = await import("../server/routes/files");

await initializeDatabase();

const owner: AuthUser = {
  id: "user-owner",
  accountId: "owner",
  displayName: "Owner",
  role: "user",
  mustChangePassword: false,
};
const now = new Date().toISOString();
await query(`
  INSERT INTO users (id, account_id, display_name, role, password_hash, active, created_at, updated_at)
  VALUES ($1, $2, $3, $4, 'test-only', 1, $5, $5)
`, [owner.id, owner.accountId, owner.displayName, owner.role, now]);

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use((req, _res, next) => {
  (req as AuthenticatedRequest).authUser = owner;
  next();
});
app.use("/assets", assetsRouter);
app.use("/files", filesRouter);

const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve, reject) => {
  server.once("listening", resolve);
  server.once("error", reject);
});
const address = server.address() as AddressInfo;
const baseUrl = `http://127.0.0.1:${address.port}`;

function request(pathname: string, init: RequestInit = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

let passed = 0;
async function test(name: string, fn: () => Promise<void>) {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

await test("GET /assets?category=model 返回 200（空库）", async () => {
  const response = await request("/assets?category=model");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

await test("POST /assets 接受 category=model 并可按 model 分类往返过滤", async () => {
  const upload = await request("/files", {
    method: "POST",
    body: JSON.stringify({ dataUrl: PNG_DATA_URL }),
  });
  const uploaded = await upload.json() as { id: string; url: string; error?: string };
  assert.equal(upload.status, 200, uploaded.error);

  const create = await request("/assets", {
    method: "POST",
    body: JSON.stringify({
      name: "数字模特示例", category: "model", scope: "private", image: uploaded.url,
    }),
  });
  const created = await create.json() as { id?: string; error?: string };
  assert.equal(create.status, 201, created.error);
  assert.ok(created.id);

  const filtered = await request("/assets?category=model");
  assert.equal(filtered.status, 200);
  const rows = await filtered.json() as Array<{ id: string; category: string }>;
  assert.deepEqual(rows.map((row) => row.category), ["model"]);
  assert.ok(rows.some((row) => row.id === created.id));
});

await test("GET /assets?category=bogus 仍返回 400（枚举白名单收窄）", async () => {
  const response = await request("/assets?category=bogus");
  assert.equal(response.status, 400);
});

// ---------- 2026-11-05 拍板 C：用户主动上传默认入库 ----------

async function countUncategorized(): Promise<number> {
  const res = await request("/assets?category=uncategorized");
  assert.equal(res.status, 200);
  const rows = await res.json() as Array<{ id: string }>;
  return rows.length;
}

await test("POST /files 带 createAsset → 同事务建素材（默认 uncategorized）", async () => {
  const before = await countUncategorized();
  const upload = await request("/files", {
    method: "POST",
    body: JSON.stringify({ dataUrl: PNG_DATA_URL, assetName: "节点上传的图", createAsset: true }),
  });
  assert.equal(upload.status, 200, await upload.text());
  const after = await countUncategorized();
  assert.equal(after, before + 1, "带 createAsset 的上传必须建一条未分类素材");

  const rows = await (await request("/assets?category=uncategorized")).json() as Array<{ name: string }>;
  assert.ok(rows.some((row) => row.name === "节点上传的图"), "素材名取上传文件名");
});

await test("POST /files 不带标记 → 不入库（裁切/手绘等派生结果）", async () => {
  const before = await countUncategorized();
  const upload = await request("/files", {
    method: "POST",
    body: JSON.stringify({ dataUrl: PNG_DATA_URL }),
  });
  assert.equal(upload.status, 200, await upload.text());
  assert.equal(await countUncategorized(), before, "派生结果不得污染素材库");
});

await test("POST /files 带显式分类 → 落到该分类", async () => {
  const beforeFabric = (await (await request("/assets?category=fabric")).json() as unknown[]).length;
  const upload = await request("/files", {
    method: "POST",
    body: JSON.stringify({ dataUrl: PNG_DATA_URL, assetCategory: "fabric", assetName: "面料素材" }),
  });
  assert.equal(upload.status, 200, await upload.text());
  const afterFabric = (await (await request("/assets?category=fabric")).json() as unknown[]).length;
  assert.equal(afterFabric, beforeFabric + 1);
});

await test("POST /files 非法 assetCategory → 400（fail-closed）", async () => {
  const upload = await request("/files", {
    method: "POST",
    body: JSON.stringify({ dataUrl: PNG_DATA_URL, assetCategory: "bogus" }),
  });
  assert.equal(upload.status, 400);
});

server.close();
await closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
console.log(`数字模特库后端聚焦回归通过（${passed} 项）`);
