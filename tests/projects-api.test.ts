// 项目中心管理操作客户端契约测试（重命名 / 删除）。
// 与 text-rewrite-client.test.ts 同款：注入 mock fetch，锁方法 / 路径 / body / 错误透传。
import assert from "node:assert/strict";
import { deleteProjectRequest, renameProjectRequest } from "../src/lib/projectsApi";

console.log("项目中心管理操作客户端契约测试");

type Call = { url: string; init?: RequestInit; body?: unknown };
const record = (calls: Call[], status: number, payload: unknown = {}) =>
  (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      init,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    return Response.json(payload, { status });
  }) as typeof fetch;

// ---------- 1. 重命名：PATCH + JSON {name} + 路径编码，返回服务端结果 ----------
const renameCalls: Call[] = [];
const renameResult = await renameProjectRequest(
  "p/1 x",
  "新名称",
  record(renameCalls, 200, { ok: true, id: "p/1 x", name: "新名称", updatedAt: "2026-10-20T08:00:00.000Z" }),
);
assert.equal(renameCalls.length, 1);
assert.equal(renameCalls[0]!.init?.method, "PATCH");
assert.equal(renameCalls[0]!.url, "/api/projects/p%2F1%20x");
assert.equal(
  (renameCalls[0]!.init?.headers as Record<string, string>)["Content-Type"],
  "application/json",
);
assert.deepEqual(renameCalls[0]!.body, { name: "新名称" });
assert.equal(renameResult.name, "新名称");
assert.equal(renameResult.updatedAt, "2026-10-20T08:00:00.000Z");
console.log("  ✓ 重命名发 PATCH /api/projects/:id + JSON {name}，id 经 encodeURIComponent，返回服务端结果");

// ---------- 2. 删除：DELETE、无 body ----------
const deleteCalls: Call[] = [];
await deleteProjectRequest("p2", record(deleteCalls, 200));
assert.equal(deleteCalls.length, 1);
assert.equal(deleteCalls[0]!.init?.method, "DELETE");
assert.equal(deleteCalls[0]!.url, "/api/projects/p2");
assert.equal(deleteCalls[0]!.body, undefined);
console.log("  ✓ 删除发 DELETE /api/projects/:id，不带 body");

// ---------- 3. 非 2xx + 服务端 {error} 文案 → 透传文案 ----------
await assert.rejects(
  () => renameProjectRequest("p3", "x", record([], 403, { error: "只读项目不能改名" })),
  /只读项目不能改名/,
);
console.log("  ✓ 重命名 403 透出服务端 error 文案");

await assert.rejects(
  () => deleteProjectRequest("p3", record([], 500, { error: "数据库繁忙" })),
  /数据库繁忙/,
);
console.log("  ✓ 删除 500 透出服务端 error 文案");

// ---------- 4. 非 2xx + 无 JSON body → 回退到 HTTP 状态文案 ----------
const noBodyFetch = (async () => new Response(null, { status: 404 })) as typeof fetch;
await assert.rejects(() => deleteProjectRequest("p4", noBodyFetch), /删除失败 HTTP 404/);
console.log("  ✓ 删除 404 无 body 时回退「删除失败 HTTP 404」");

console.log("项目中心管理操作客户端契约测试通过");
