/**
 * 按模型熔断器的契约测试（2026-11-10）。
 *
 * 覆盖：连续瞬时失败开闸、冷却后半开只放一个探测、成功归零、
 * 非供应商错误（参数/余额）视为可达并重置，以及熔断错误不进入重试。
 */
import assert from "node:assert/strict";
import {
  isProviderCallAllowed,
  recordProviderFailure,
  recordProviderReachable,
  recordProviderSuccess,
  resetProviderCircuitBreakerForTests,
} from "../server/providers/circuitBreaker";
import { ProviderError } from "../server/providers/base";
import { isRetryableProviderError } from "../server/engine/runQueueContracts";

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("按模型熔断器");

ok("连续 5 次供应商故障后开闸，冷却 30 秒内快速失败", () => {
  resetProviderCircuitBreakerForTests();
  const key = "gpt-image-2.6-flare";
  const t0 = 1_000_000;
  for (let i = 0; i < 5; i += 1) {
    assert.equal(isProviderCallAllowed(key, t0), true);
    recordProviderFailure(key, t0);
  }
  assert.equal(isProviderCallAllowed(key, t0 + 1), false, "第 5 次失败后应开闸");
  assert.equal(isProviderCallAllowed(key, t0 + 29_999), false, "冷却期内一律拒绝");
});

ok("冷却结束进入半开：只放一个探测，第二个继续拒绝", () => {
  resetProviderCircuitBreakerForTests();
  const key = "gpt-image-2.6-sunburst";
  const t0 = 2_000_000;
  for (let i = 0; i < 5; i += 1) recordProviderFailure(key, t0);
  assert.equal(isProviderCallAllowed(key, t0 + 30_000), true, "冷却后放行探测");
  assert.equal(isProviderCallAllowed(key, t0 + 30_001), false, "探测在途时不得再放行");
});

ok("探测成功后闭合，恢复正常放行", () => {
  resetProviderCircuitBreakerForTests();
  const key = "gpt-image-2.6-flare";
  const t0 = 3_000_000;
  for (let i = 0; i < 5; i += 1) recordProviderFailure(key, t0);
  assert.equal(isProviderCallAllowed(key, t0 + 30_000), true);
  recordProviderSuccess(key);
  assert.equal(isProviderCallAllowed(key, t0 + 30_001), true);
  assert.equal(isProviderCallAllowed(key, t0 + 30_002), true);
});

ok("参数/余额类错误视为通道可达，重置连续计数", () => {
  resetProviderCircuitBreakerForTests();
  const key = "gpt-image-2.6-flare";
  const t0 = 4_000_000;
  for (let i = 0; i < 4; i += 1) recordProviderFailure(key, t0);
  recordProviderReachable(key);
  for (let i = 0; i < 4; i += 1) recordProviderFailure(key, t0);
  assert.equal(isProviderCallAllowed(key, t0 + 1), true, "未达阈值不得开闸");
});

ok("熔断错误即使 503 也不进入自动重试", () => {
  const open = new ProviderError(
    "该模型连续失败，已暂停 30 秒，请稍后再试或切换模型",
    503,
    "gpt-image-2.6-flare",
    "gateway_unavailable",
    "circuit_open: gpt-image-2.6-flare temporarily suspended",
  );
  assert.equal(isRetryableProviderError(open, 1_000), false);
  const ordinary = new ProviderError("AI 服务暂时不可用，请稍后重试", 503, "m", "gateway_unavailable", "service unavailable");
  assert.equal(isRetryableProviderError(ordinary, 1_000), true);
});

console.log(`\n通过 ${passed} 项熔断测试`);
