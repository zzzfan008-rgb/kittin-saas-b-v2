/**
 * 按模型的极简熔断器（2026-11-10，对齐兔子《AI API 生产可靠性》）。
 *
 * 目的：上游某个模型通道连续失败时，快速失败 30 秒，避免请求在"重试 → 再失败"
 * 之间反复占住连接与 worker 并发，形成重试风暴。
 *
 * 口径（与指南一致）：
 * - 只统计**供应商故障**（gateway_unavailable / network_error）；
 * - 鉴权、余额、参数、内容拒绝说明通道是活的，反而重置计数；
 * - 连续 5 次失败 → open 30 秒 → 半开只放一个探测请求；
 * - 探测成功 → closed；探测失败 → 重新 open。
 *
 * 状态在进程内存中，单实例部署足够；多实例时各自熔断，最坏是多打几次探测。
 */

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30_000;

interface BreakerState {
  consecutiveFailures: number;
  openedUntil: number;
  halfOpenInFlight: boolean;
}

const states = new Map<string, BreakerState>();

function stateOf(key: string): BreakerState {
  let state = states.get(key);
  if (!state) {
    state = { consecutiveFailures: 0, openedUntil: 0, halfOpenInFlight: false };
    states.set(key, state);
  }
  return state;
}

export function isProviderCallAllowed(key: string, now = Date.now()): boolean {
  const state = stateOf(key);
  if (state.openedUntil === 0) return true;
  if (now < state.openedUntil) return false;
  // 冷却结束：只放一个探测请求（半开）。
  if (state.halfOpenInFlight) return false;
  state.halfOpenInFlight = true;
  return true;
}

export function recordProviderSuccess(key: string): void {
  states.set(key, { consecutiveFailures: 0, openedUntil: 0, halfOpenInFlight: false });
}

/** 通道有响应（即使业务失败），说明供应商可达：重置连续失败计数。 */
export function recordProviderReachable(key: string): void {
  const state = stateOf(key);
  state.consecutiveFailures = 0;
  state.openedUntil = 0;
  state.halfOpenInFlight = false;
}

export function recordProviderFailure(key: string, now = Date.now()): void {
  const state = stateOf(key);
  state.consecutiveFailures += 1;
  state.halfOpenInFlight = false;
  if (state.consecutiveFailures >= FAILURE_THRESHOLD) {
    state.openedUntil = now + COOLDOWN_MS;
    console.warn("[provider-circuit-open]", JSON.stringify({
      providerId: key,
      consecutiveFailures: state.consecutiveFailures,
      cooldownMs: COOLDOWN_MS,
    }));
  }
}

/** 仅测试使用。 */
export function resetProviderCircuitBreakerForTests(): void {
  states.clear();
}
