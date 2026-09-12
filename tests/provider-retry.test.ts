import assert from "node:assert/strict";
import {
  fetchWithRetry,
  ProviderError,
  publicProviderErrorMessage,
  providerErrorFromResponse,
  sanitizedProviderDiagnostic,
} from "../server/providers/base";
import { generateExactImages } from "../server/providers/exact";
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
  "flux-2-pro",
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

console.log("  ✓ Provider 单次发送、请求 ID 证据、未知结果保护与诊断脱敏");
