/**
 * 余额接口契约测试。
 *
 * 覆盖：未配置凭据、quota→金额换算、面板鉴权失败降级、上游超时降级、
 * 结果缓存合并、以及 panelSession 的「401 自动重登一次」。
 *
 * 本路由不碰数据库，故不依赖 PostgreSQL runner：
 *   npx tsx tests/billing-balance.test.ts
 */
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import express from "express";

process.env.APIYI_BASE_URL = "https://api.example.test";
process.env.APIYI_PANEL_USERNAME = "panel-user";
process.env.APIYI_PANEL_PASSWORD = "panel-pass";

const { createBillingRouter, resetBillingCaches, toAmount } = await import("../server/routes/billing");
const {
  PanelAuthError,
  PanelUpstreamError,
  fetchPanelUserSelf,
  resetPanelSession,
} = await import("../server/lib/panelSession");

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const META = { symbol: "¥", quotaPerUnit: 500_000, rate: 0.7 };

function buildServer(deps: Parameters<typeof createBillingRouter>[0]) {
  const app = express();
  app.use("/api/billing", createBillingRouter(deps));
  return app.listen(0, "127.0.0.1");
}

async function withServer<T>(
  deps: Parameters<typeof createBillingRouter>[0],
  fn: (url: string) => Promise<T>,
): Promise<T> {
  const server = buildServer(deps);
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    return await fn(url);
  } finally {
    server.close();
  }
}

async function getBalance(url: string): Promise<{ status: number; body: any }> {
  const response = await fetch(`${url}/api/billing/balance`);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : {} };
}

console.log("余额接口契约测试");

await test("换算：quota 35000 / 500000 × 0.7 = 0.05", () => {
  assert.equal(toAmount(35_000, META), 0.05);
  assert.equal(toAmount(500_000, META), 0.7);
  assert.equal(toAmount(0, META), 0);
});

await test("未配置面板凭据：200 + configured:false，不视为错误", async () => {
  resetBillingCaches();
  await withServer({ configured: () => false }, async (url) => {
    const r = await getBalance(url);
    assert.equal(r.status, 200, "未配置不应返回错误码");
    assert.equal(r.body.configured, false);
    assert.equal(r.body.available, false);
    assert.equal(r.body.reason, "not_configured");
    assert.equal(r.body.amount, null);
  });
});

await test("正常返回：额度换算为人民币并带原始 quota", async () => {
  resetBillingCaches();
  await withServer(
    {
      configured: () => true,
      fetchUserSelf: async () => ({ quota: 35_000, usedQuota: 1_000 }),
      loadMeta: async () => META,
      cacheTtlMs: 0,
    },
    async (url) => {
      const r = await getBalance(url);
      assert.equal(r.status, 200);
      assert.equal(r.body.configured, true);
      assert.equal(r.body.available, true);
      assert.equal(r.body.symbol, "¥");
      assert.equal(r.body.amount, 0.05);
      assert.equal(r.body.quota, 35_000);
      assert.ok(typeof r.body.updatedAt === "string");
      assert.equal(r.body.reason, undefined);
    },
  );
});

await test("面板鉴权失败：降级为 auth_failed，仍返回 200", async () => {
  resetBillingCaches();
  await withServer(
    {
      configured: () => true,
      fetchUserSelf: async () => { throw new PanelAuthError("登录被拒绝", "invalid_token"); },
      loadMeta: async () => META,
      cacheTtlMs: 0,
    },
    async (url) => {
      const r = await getBalance(url);
      assert.equal(r.status, 200, "上游失败不能变成 5xx");
      assert.equal(r.body.available, false);
      assert.equal(r.body.reason, "auth_failed");
      assert.equal(r.body.amount, null);
    },
  );
});

await test("上游异常/超时：降级为 upstream_error", async () => {
  resetBillingCaches();
  await withServer(
    {
      configured: () => true,
      fetchUserSelf: async () => { throw new PanelUpstreamError("面板接口超时"); },
      loadMeta: async () => META,
      cacheTtlMs: 0,
    },
    async (url) => {
      const r = await getBalance(url);
      assert.equal(r.status, 200);
      assert.equal(r.body.available, false);
      assert.equal(r.body.reason, "upstream_error");
    },
  );
});

await test("5 秒缓存：连续两次请求只打一次面板", async () => {
  resetBillingCaches();
  let calls = 0;
  await withServer(
    {
      configured: () => true,
      fetchUserSelf: async () => { calls += 1; return { quota: 500_000, usedQuota: 0 }; },
      loadMeta: async () => META,
      cacheTtlMs: 5_000,
    },
    async (url) => {
      const first = await getBalance(url);
      const second = await getBalance(url);
      assert.equal(first.body.amount, 0.7);
      assert.equal(second.body.amount, 0.7);
      assert.equal(calls, 1, "缓存期内只应查询一次上游");
    },
  );
});

await test("panelSession：会话失效后自动重登一次并成功返回", async () => {
  resetPanelSession();
  const originalFetch = globalThis.fetch;
  let loginCalls = 0;
  let selfCalls = 0;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/api/user/login")) {
      loginCalls += 1;
      // 实测网关：body 没有 access_token，会话走 set-cookie
      return new Response(
        JSON.stringify({ success: true, message: "", data: { id: 57630 } }),
        {
          status: 200,
          headers: { "set-cookie": `session=sess-${loginCalls}; Path=/; HttpOnly; Secure; SameSite=Lax` },
        },
      );
    }
    if (url.endsWith("/api/user/self")) {
      selfCalls += 1;
      // 第一次用旧会话 → 401；重登后再请求 → 200
      if (selfCalls === 1) {
        return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });
      }
      const headers = (init?.headers ?? {}) as Record<string, string>;
      assert.equal(headers.Cookie, "session=sess-2", "重试必须使用新会话 Cookie");
      assert.equal(headers["New-Api-User"], "57630", "须带上面板用户 id");
      return new Response(JSON.stringify({ success: true, data: { quota: 123_000, used_quota: 456 } }), { status: 200 });
    }
    throw new Error(`unexpected url ${url}`);
  }) as typeof fetch;

  try {
    const self = await fetchPanelUserSelf();
    assert.equal(self.quota, 123_000);
    assert.equal(self.usedQuota, 456);
    assert.equal(loginCalls, 2, "首次登录 + 失效后重登，共 2 次");
    assert.equal(selfCalls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    resetPanelSession();
  }
});

await test("panelSession：登录成功但未下发任何会话凭据 → 判定为鉴权失败", async () => {
  resetPanelSession();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(
    JSON.stringify({ success: true, data: { id: 1 } }),
    { status: 200 },
  )) as typeof fetch;

  try {
    await assert.rejects(
      () => fetchPanelUserSelf(),
      (error: unknown) => error instanceof PanelAuthError,
    );
  } finally {
    globalThis.fetch = originalFetch;
    resetPanelSession();
  }
});

console.log(`\n通过 ${passed} 项余额接口测试`);
