import assert from "node:assert/strict";
import {
  fetchWithRetry,
  ProviderError,
  providerErrorFromResponse,
  providerRequestIdFromResponse,
  providerRetryAfterMs,
  publicProviderErrorMessage,
  sanitizedProviderDiagnostic,
} from "../server/providers/base";
import { generateExactImages } from "../server/providers/exact";
import { isRetryableProviderError } from "../server/engine/runQueueContracts";
import type { AIProvider } from "../src/types/workflow";

const originalFetch = globalThis.fetch;

let providerCalls = 0;
const retryableProvider: AIProvider = {
  id: "stub",
  async generate() {
    providerCalls += 1;
    if (providerCalls === 1) {
      throw new ProviderError("AI 服务当前繁忙，请稍后重试", 429, "stub", "rate_limited");
    }
    return { images: ["unexpected-local-retry"], model: "stub-model" };
  },
  async edit() { throw new Error("unexpected edit"); },
};

await assert.rejects(
  () => generateExactImages(
    retryableProvider,
    { prompt: "重试归队列", operationMode: "generate" },
    1,
  ),
  (error: unknown) => error instanceof ProviderError && error.status === 429,
);
assert.equal(providerCalls, 1, "Provider/精确批量层不得自行重放付费请求");

const providerRequestId = "req-provider-log-1";
const logCalls: unknown[][] = [];
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => { logCalls.push(args); };
try {
  const requestIdProvider: AIProvider = {
    id: "request-id-stub",
    async generate() {
      throw new ProviderError(
        "AI 服务暂不支持当前参数或参考图组合，请调整后重试",
        400,
        "request-id-stub",
        "invalid_request",
        "HTTP 400: request validation failed",
        providerRequestId,
      );
    },
    async edit() { throw new Error("unexpected edit"); },
  };
  let captured: unknown;
  try {
    await generateExactImages(
      requestIdProvider,
      { prompt: "request id log", operationMode: "generate" },
      1,
    );
  } catch (error) {
    captured = error;
  }
  assert.ok(captured instanceof ProviderError);
  assert.equal(captured.requestId, providerRequestId);
  assert.doesNotMatch(publicProviderErrorMessage(captured), new RegExp(providerRequestId));
  assert.doesNotMatch(sanitizedProviderDiagnostic(captured) ?? "", new RegExp(providerRequestId));
  const log = logCalls.find((args) => args[0] === "[ai-provider-failure]");
  assert.ok(log);
  const payload = JSON.parse(String(log[1])) as { requestId?: string; diagnostic?: string };
  assert.equal(payload.requestId, providerRequestId);
  assert.doesNotMatch(payload.diagnostic ?? "", new RegExp(providerRequestId));
} finally {
  console.error = originalConsoleError;
}

let fetchCalls = 0;
globalThis.fetch = (async () => {
  fetchCalls += 1;
  return new Response(JSON.stringify({ error: { message: "temporary channel capacity unavailable" } }), {
    status: 503,
  });
}) as typeof fetch;
try {
  await assert.rejects(
    () => fetchWithRetry("https://gateway.example/v1/images/generations", () => ({}), {
      providerId: "stub", maxRetries: 99,
    }),
    (error: unknown) => error instanceof ProviderError && error.category === "gateway_unavailable",
  );
  assert.equal(fetchCalls, 1);
} finally {
  globalThis.fetch = originalFetch;
}

let networkCalls = 0;
globalThis.fetch = (async () => {
  networkCalls += 1;
  throw new TypeError("connection reset after upload");
}) as typeof fetch;
try {
  await assert.rejects(
    () => fetchWithRetry("https://gateway.example/v1/images/edits", () => ({}), { providerId: "stub" }),
    (error: unknown) => error instanceof ProviderError && error.category === "outcome_unknown",
  );
  assert.equal(networkCalls, 1);
} finally {
  globalThis.fetch = originalFetch;
}

const deterministic503 = providerErrorFromResponse(
  503,
  JSON.stringify({ error: { message: "width=513 is unsupported; width must be a multiple of 16" } }),
  "flux-3-image",
);
assert.equal(deterministic503.category, "invalid_request");

const diagnostic = sanitizedProviderDiagnostic(new ProviderError(
  "失败",
  400,
  "stub",
  "invalid_request",
  'HTTP 400: {"error":{"message":"key sk-secret at https://signed.example/x?token=abc data:image/png;base64,AAAA","type":"invalid_request_error"}}',
));
assert.ok(diagnostic?.includes("[redacted-key]"));
assert.ok(diagnostic?.includes("[redacted-url]"));
assert.ok(diagnostic?.includes("[redacted-image]"));
assert.ok(!diagnostic?.includes("sk-secret"));
assert.ok(!diagnostic?.includes("signed.example"));

// ---------- 网关裸 5xx：只有「发生得足够早」才允许重试 ----------
// 2026-11-10 现场：flare 双图 2K 编辑第 16 秒收到 nginx 504（HTML 页面，无 JSON），
// 旧规则只认 connection_error 字样，导致一次网络抖动直接判死。
const nginx504 = new ProviderError(
  "AI 服务暂时不可用，请稍后重试",
  504,
  "gpt-image-2.6-flare",
  "gateway_unavailable",
  "HTTP 504: <html>\r\n<head><title>504 Gateway Time-out</title></head>\r\n<body>...</body>\r\n</html>\r\n",
);
assert.equal(isRetryableProviderError(nginx504, 16_000), true, "16 秒的 nginx 504 应重试");
assert.equal(isRetryableProviderError(nginx504, 59_999), true, "60 秒内仍视为未开始出图");
assert.equal(isRetryableProviderError(nginx504, 60_000), false, "60 秒及以上的 504 不重试，防重复计费");
assert.equal(isRetryableProviderError(nginx504), false, "无耗时信息时保守不重试");

const connectionError = new ProviderError(
  "AI 服务暂时不可用，请稍后重试",
  500,
  "gpt-image-2.6-flare",
  "gateway_unavailable",
  'HTTP 500: {"error":{"type":"connection_error","message":"服务连接失败，请稍后重试"}}',
);
assert.equal(isRetryableProviderError(connectionError, 120_000), true, "connection_error 与耗时无关");


// ---------- 兔子《AI API 通用错误码与排障指南》对齐（2026-11-10） ----------
async function isRetryableAsync(error: unknown): Promise<boolean> {
  const { isRetryableProviderError } = await import("../server/engine/runQueueContracts");
  return isRetryableProviderError(error);
}

// 429 不一定是"太快"：余额/日配额/套餐耗尽同样用 429，必须按业务码判为不可重试。
const quota429 = providerErrorFromResponse(
  429,
  JSON.stringify({ error: { type: "insufficient_quota", code: "insufficient_quota", message: "You exceeded your current quota" } }),
  "gpt-image-2.6-flare",
);
assert.equal(quota429.category, "account_credit", "429 + 余额/配额业务码应归 account_credit");
assert.equal(await isRetryableAsync(quota429), false, "余额/配额错误不得自动重试");

const plain429 = providerErrorFromResponse(
  429,
  JSON.stringify({ error: { type: "rate_limit_error", code: "rate_limit_exceeded", message: "Too many requests" } }),
  "gpt-image-2.6-flare",
);
assert.equal(plain429.category, "rate_limited");
assert.equal(await isRetryableAsync(plain429), true, "临时限流应重试");

// 529 Overloaded（Anthropic 语义）属于瞬时过载，可重试。
const overloaded529 = providerErrorFromResponse(529, "overloaded_error: Overloaded", "stub");
assert.equal(await isRetryableAsync(overloaded529), true, "529 过载应重试");

// 400 参数错误不得重试。
const badRequest = providerErrorFromResponse(
  400,
  JSON.stringify({ error: { message: "width=513 is unsupported; width must be a multiple of 16" } }),
  "flux-3-image",
);
assert.equal(await isRetryableAsync(badRequest), false, "确定性参数错误不得重试");

// Retry-After：秒数与毫秒级头都要能解析，并封顶 120s。
const retryAfterHeaders = (values: Record<string, string>) => ({
  headers: { get: (name: string) => values[name.toLowerCase()] ?? null },
});
assert.equal(providerRetryAfterMs(retryAfterHeaders({ "retry-after": "3" })), 3_000);
assert.equal(providerRetryAfterMs(retryAfterHeaders({ "retry-after": "999" })), 120_000, "上限 120 秒");
assert.equal(providerRetryAfterMs(retryAfterHeaders({ "retry-after-ms": "1500" })), 1_500);
assert.equal(providerRetryAfterMs(retryAfterHeaders({})), undefined);

// 请求 ID：兼容本站 X-Oneapi-Request-Id 与常见厂商头。
assert.equal(
  providerRequestIdFromResponse(retryAfterHeaders({ "x-oneapi-request-id": "oneapi-abc" })),
  "oneapi-abc",
);
assert.equal(
  providerRequestIdFromResponse(retryAfterHeaders({ "apim-request-id": "azure-123" })),
  "azure-123",
);

console.log("  ✓ Provider 单次发送、请求 ID 证据、未知结果保护与诊断脱敏");
