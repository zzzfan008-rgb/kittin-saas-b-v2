import assert from "node:assert/strict";
import { MockAgent } from "undici";
import {
  APIYI_TAIL_STALL_DEFAULTS,
  APIYI_UNDICI_PROFILE,
  closeApiyiDispatcher,
  getApiyiDispatcher,
  readApiyiJsonResponse,
  type ApiyiTailRecoveryEvent,
} from "../server/providers/apiyiTransport";
import { apiyiProviders } from "../server/providers/apiyi";
import { fetchWithRetry, ProviderError } from "../server/providers/base";

const encoder = new TextEncoder();
let passed = 0;

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

function controlledResponse(
  chunks: Array<{ afterMs: number; bytes: Uint8Array }>,
  options?: { closeAfterMs?: number; errorAfterMs?: number; headers?: HeadersInit; status?: number },
): { response: Response; cancelled: () => number } {
  let cancelCount = 0;
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        timers.push(setTimeout(() => controller.enqueue(chunk.bytes), chunk.afterMs));
      }
      if (options?.closeAfterMs !== undefined) {
        timers.push(setTimeout(() => controller.close(), options.closeAfterMs));
      }
      if (options?.errorAfterMs !== undefined) {
        timers.push(setTimeout(() => {
          controller.error(Object.assign(new Error("body stream interrupted"), { code: "UND_ERR_BODY_TIMEOUT" }));
        }, options.errorAfterMs));
      }
    },
    cancel() {
      cancelCount += 1;
      for (const timer of timers) clearTimeout(timer);
    },
  });
  return {
    response: new Response(stream, { status: options?.status ?? 200, headers: options?.headers }),
    cancelled: () => cancelCount,
  };
}

async function main(): Promise<void> {
  console.log("API易 Undici 与尾部 JSON 传输测试");

  await test("Undici 分阶段超时配置固定且连接池模块级复用", async () => {
    assert.deepEqual(APIYI_UNDICI_PROFILE, {
      connectTimeoutMs: 30_000,
      headersTimeoutMs: 600_000,
      bodyTimeoutMs: 300_000,
      keepAliveTimeoutMs: 60_000,
      keepAliveMaxTimeoutMs: 60_000,
    });
    assert.equal(APIYI_TAIL_STALL_DEFAULTS.graceMs, 5_000);
    const first = getApiyiDispatcher();
    assert.equal(getApiyiDispatcher(), first);
    await closeApiyiDispatcher();
    assert.notEqual(getApiyiDispatcher(), first);
    await closeApiyiDispatcher();
  });

  await test("正常 EOF 解析 JSON 且不触发尾部恢复", async () => {
    const body = JSON.stringify({ ok: true, data: "x".repeat(1_100) });
    const events: ApiyiTailRecoveryEvent[] = [];
    const fixture = controlledResponse(
      [{ afterMs: 0, bytes: encoder.encode(body) }],
      { closeAfterMs: 1 },
    );
    const parsed = await readApiyiJsonResponse(fixture.response, "test", {
      maxBytes: 4_096,
      graceMs: 5,
      onSalvaged: (event) => events.push(event),
    });
    assert.deepEqual(parsed, JSON.parse(body));
    assert.equal(events.length, 0);
    assert.equal(fixture.cancelled(), 0);
  });

  await test("完整对象 JSON 无 EOF 时在宽限期后只取消一次并返回", async () => {
    const body = `${JSON.stringify({ ok: true, data: "x".repeat(1_100) })} \n`;
    const events: ApiyiTailRecoveryEvent[] = [];
    const fixture = controlledResponse([{ afterMs: 0, bytes: encoder.encode(body) }]);
    const parsed = await readApiyiJsonResponse(fixture.response, "gpt-image-2.5-flare-vip", {
      maxBytes: 4_096,
      graceMs: 5,
      onSalvaged: (event) => events.push(event),
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(parsed, JSON.parse(body));
    assert.equal(fixture.cancelled(), 1);
    assert.deepEqual(events, [{
      event: "apiyi_tail_stall_salvaged",
      providerId: "gpt-image-2.5-flare-vip",
      bytes: encoder.encode(body).byteLength,
      graceMs: 5,
    }]);
  });

  await test("宽限期先到仍复用同一 pending read，后续分块不丢失", async () => {
    const body = JSON.stringify({ ok: true, data: "x".repeat(1_100) });
    const splitAt = Math.floor(body.length / 2);
    const fixture = controlledResponse(
      [
        { afterMs: 0, bytes: encoder.encode(body.slice(0, splitAt)) },
        { afterMs: 18, bytes: encoder.encode(body.slice(splitAt)) },
      ],
      { closeAfterMs: 22 },
    );
    const parsed = await readApiyiJsonResponse(fixture.response, "test", {
      maxBytes: 4_096,
      minBytes: 1,
      graceMs: 5,
      onSalvaged: () => assert.fail("分块未结束前不得误恢复"),
    });
    assert.deepEqual(parsed, JSON.parse(body));
    assert.equal(fixture.cancelled(), 0);
  });

  await test("半截 JSON、数组顶层与读流错误均不能伪装为恢复成功", async () => {
    for (const body of [
      `{"data":"${"x".repeat(1_100)}`,
      JSON.stringify([{ data: "x".repeat(1_100) }]),
    ]) {
      let salvageCalls = 0;
      const fixture = controlledResponse(
        [{ afterMs: 0, bytes: encoder.encode(body) }],
        { errorAfterMs: 20 },
      );
      await assert.rejects(
        () => readApiyiJsonResponse(fixture.response, "test", {
          maxBytes: 4_096,
          graceMs: 5,
          onSalvaged: () => { salvageCalls += 1; },
        }),
        /body stream interrupted/,
      );
      assert.equal(salvageCalls, 0);
      assert.equal(fixture.cancelled(), 0);
    }
  });

  await test("Content-Length 与关闭开关都禁止尾部恢复", async () => {
    const body = JSON.stringify({ ok: true, data: "x".repeat(1_100) });
    for (const scenario of [
      { headers: { "Content-Length": String(encoder.encode(body).byteLength) }, salvageEnabled: true },
      { headers: undefined, salvageEnabled: false },
    ]) {
      let salvageCalls = 0;
      const fixture = controlledResponse(
        [{ afterMs: 0, bytes: encoder.encode(body) }],
        { headers: scenario.headers, errorAfterMs: 20 },
      );
      await assert.rejects(
        () => readApiyiJsonResponse(fixture.response, "test", {
          maxBytes: 4_096,
          salvageEnabled: scenario.salvageEnabled,
          graceMs: 5,
          onSalvaged: () => { salvageCalls += 1; },
        }),
      );
      assert.equal(salvageCalls, 0);
    }
  });

  await test("声明或实际响应超过上限时 outcome_unknown 且主动取消", async () => {
    const advertised = controlledResponse([], { headers: { "Content-Length": "100" } });
    await assert.rejects(
      () => readApiyiJsonResponse(advertised.response, "test", { maxBytes: 10 }),
      (error: unknown) => error instanceof ProviderError && error.category === "outcome_unknown",
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(advertised.cancelled(), 1);

    const streamed = controlledResponse([{ afterMs: 0, bytes: encoder.encode('{"data":"too large"}') }]);
    await assert.rejects(
      () => readApiyiJsonResponse(streamed.response, "test", { maxBytes: 8, minBytes: 1, graceMs: 5 }),
      (error: unknown) => error instanceof ProviderError && error.category === "outcome_unknown",
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(streamed.cancelled(), 1);

    const salvageOff = controlledResponse(
      [{ afterMs: 0, bytes: encoder.encode('{"data":"still bounded"}') }],
      { closeAfterMs: 20 },
    );
    await assert.rejects(
      () => readApiyiJsonResponse(salvageOff.response, "test", {
        maxBytes: 8,
        salvageEnabled: false,
      }),
      (error: unknown) => error instanceof ProviderError && error.category === "outcome_unknown",
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(salvageOff.cancelled(), 1, "关闭尾部收尾不得关闭流式大小护栏");
  });

  await test("dispatcher 只按请求注入，非法 URL 在创建连接池前拒绝", async () => {
    let factoryCalls = 0;
    let capturedInit: (RequestInit & { dispatcher?: unknown }) | undefined;
    const dispatcher = { dispatch: () => undefined };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (_input, init) => {
      capturedInit = init as RequestInit & { dispatcher?: unknown };
      return Response.json({ ok: true });
    }) as typeof fetch;
    try {
      await fetchWithRetry("https://gateway.example/test", () => ({}), {
        dispatcherFactory: () => { factoryCalls += 1; return dispatcher; },
      });
      assert.equal(factoryCalls, 1);
      assert.equal(capturedInit?.dispatcher, dispatcher);
      await assert.rejects(
        () => fetchWithRetry("http://gateway.example/test", () => ({}), {
          dispatcherFactory: () => { factoryCalls += 1; return dispatcher; },
        }),
        (error: unknown) => error instanceof ProviderError && error.category === "invalid_request",
      );
      assert.equal(factoryCalls, 1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await test("Node 全局 fetch 可使用外部 Undici dispatcher 且 MockAgent 禁止真实网络", async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    mockAgent.get("https://gateway.example")
      .intercept({ path: "/test", method: "POST" })
      .reply(200, { ok: true });
    try {
      const response = await fetchWithRetry(
        "https://gateway.example/test",
        () => ({ method: "POST" }),
        { dispatcherFactory: () => mockAgent },
      );
      assert.deepEqual(await response.json(), { ok: true });
      assert.deepEqual(mockAgent.pendingInterceptors(), []);
    } finally {
      await mockAgent.close();
    }
  });

  await test("Undici 各阶段超时保留诊断码、统一 outcome_unknown 且永不重放", async () => {
    const originalFetch = globalThis.fetch;
    try {
      for (const scenario of [
        { code: "UND_ERR_CONNECT_TIMEOUT", status: 504 },
        { code: "UND_ERR_HEADERS_TIMEOUT", status: 504 },
        { code: "UND_ERR_BODY_TIMEOUT", status: 504 },
        { code: "ECONNRESET", status: 502 },
      ]) {
        let calls = 0;
        globalThis.fetch = (async () => {
          calls += 1;
          const cause = Object.assign(new Error("transport failed"), { code: scenario.code });
          throw new TypeError("fetch failed", { cause });
        }) as typeof fetch;
        await assert.rejects(
          () => fetchWithRetry("https://gateway.example/test", () => ({}), {
            providerId: "test",
            maxRetries: 99,
          }),
          (error: unknown) => error instanceof ProviderError &&
            error.category === "outcome_unknown" &&
            error.status === scenario.status &&
            error.diagnostic.includes(scenario.code),
        );
        assert.equal(calls, 1);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await test("成功图片响应保留 API易 x-request-id", async () => {
    const originalFetch = globalThis.fetch;
    const previousKey = process.env.APIYI_API_KEY;
    const previousBase = process.env.APIYI_BASE_URL;
    process.env.APIYI_API_KEY = "test-key";
    process.env.APIYI_BASE_URL = "https://gateway.example";
    try {
      globalThis.fetch = (async () => Response.json({
        data: [{ url: "https://cdn.example/provider-image.png" }],
      }, {
        headers: { "x-request-id": "req-apiyi-success-1" },
      })) as typeof fetch;
      const result = await apiyiProviders["flux-2-pro"].generate({
        prompt: "provider request id",
        operationMode: "generate",
      });
      assert.equal(result.providerRequestId, "req-apiyi-success-1");
      assert.deepEqual(result.images, ["https://cdn.example/provider-image.png"]);
    } finally {
      globalThis.fetch = originalFetch;
      if (previousKey === undefined) delete process.env.APIYI_API_KEY;
      else process.env.APIYI_API_KEY = previousKey;
      if (previousBase === undefined) delete process.env.APIYI_BASE_URL;
      else process.env.APIYI_BASE_URL = previousBase;
      await closeApiyiDispatcher();
    }
  });

  await test("非 2xx 与 2xx 的 body 阶段超时都保留诊断且不重放", async () => {
    const originalFetch = globalThis.fetch;
    const previousKey = process.env.APIYI_API_KEY;
    const previousBase = process.env.APIYI_BASE_URL;
    process.env.APIYI_API_KEY = "test-key";
    process.env.APIYI_BASE_URL = "https://gateway.example";
    try {
      let calls = 0;
      globalThis.fetch = (async () => {
        calls += 1;
        return controlledResponse([], {
          status: 503,
          errorAfterMs: 0,
          headers: { "x-request-id": "req-apiyi-503-body-timeout" },
        }).response;
      }) as typeof fetch;
      await assert.rejects(
        () => fetchWithRetry("https://gateway.example/test", () => ({}), {
          providerId: "test",
          maxRetries: 99,
        }),
        (error: unknown) => error instanceof ProviderError &&
          error.category === "outcome_unknown" &&
          error.status === 504 &&
          error.diagnostic.includes("UND_ERR_BODY_TIMEOUT") &&
          error.requestId === "req-apiyi-503-body-timeout",
      );
      assert.equal(calls, 1, "503 body 读取不确定时不得转成可重试 gateway_unavailable");

      calls = 0;
      globalThis.fetch = (async () => {
        calls += 1;
        return controlledResponse([], {
          status: 200,
          errorAfterMs: 0,
          headers: { "x-request-id": "req-apiyi-200-body-timeout" },
        }).response;
      }) as typeof fetch;
      await assert.rejects(
        () => apiyiProviders["gpt-image-2.5-flare-vip"].generate({
          prompt: "body timeout",
          operationMode: "generate",
          modelOptions: { size: "1280x1280" },
        }),
        (error: unknown) => error instanceof ProviderError &&
          error.category === "outcome_unknown" &&
          error.status === 504 &&
          error.diagnostic.includes("UND_ERR_BODY_TIMEOUT") &&
          error.requestId === "req-apiyi-200-body-timeout",
      );
      assert.equal(calls, 1);
    } finally {
      globalThis.fetch = originalFetch;
      if (previousKey === undefined) delete process.env.APIYI_API_KEY;
      else process.env.APIYI_API_KEY = previousKey;
      if (previousBase === undefined) delete process.env.APIYI_BASE_URL;
      else process.env.APIYI_BASE_URL = previousBase;
      await closeApiyiDispatcher();
    }
  });

  console.log(`\n${passed} 项 API易传输测试全部通过。`);
}

await main();
