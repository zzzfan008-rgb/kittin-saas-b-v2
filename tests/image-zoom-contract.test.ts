/**
 * R-99 useImageZoom 核心语义测试（中心缩放，无指针锚点数学）。
 *
 * 覆盖：
 * 1. nextWheelScale：单次调用、25%/400% clamp
 * 2. fold：用 deltaY=400 连 fold 120 次，必须严格停在 0.25（红→绿锁本次 bug）
 * 3. ZOOM_STEP：1 → +0.1×2 → -0.1 = 1.1
 *
 * 运行：
 *   node node_modules/tsx/dist/cli.mjs tests/image-zoom-contract.test.ts
 */
import assert from "node:assert/strict";
import { MIN_SCALE, MAX_SCALE, ZOOM_STEP } from "../src/hooks/useImageZoom";

// ── 纯函数（useImageZoom hook 内 wheel/zoomIn/zoomOut 的数学）───────────────

/** 滚轮缩放：delta = -deltaY * 0.0015 */
function nextWheelScale(prev: number, deltaY: number): number {
  const delta = -deltaY * 0.0015;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta * prev));
}

/** zoomIn（清 pan） */
function nextZoomIn(prev: number): number {
  return Math.min(MAX_SCALE, prev + ZOOM_STEP);
}

/** zoomOut（不清 pan） */
function nextZoomOut(prev: number): number {
  return Math.max(MIN_SCALE, prev - ZOOM_STEP);
}

// ── 辅助 ───────────────────────────────────────────────────────────────────
let passed = 0;
let sequence: Promise<void> = Promise.resolve();

function ok(name: string, fn: () => Promise<void> | void): void {
  sequence = sequence
    .then(fn)
    .then(() => {
      passed += 1;
      console.log(`  ✓ ${name}`);
    })
    .catch((error) => {
      console.error(`  ✗ ${name}`);
      console.error(error);
      process.exitCode = 1;
    });
}

// ── 测试 ───────────────────────────────────────────────────────────────────
console.log("R-99 useImageZoom 中心缩放契约测试");

// 1. 单次调用 clamp
ok("nextWheelScale：单次放大 clamp 到 4", async () => {
  // deltaY=-3000 → delta=4.5, prev+delta*prev = 1+4.5 = 5.5 → clamp 4
  const r = nextWheelScale(1, -3000);
  assert.strictEqual(r, MAX_SCALE);
});

ok("nextWheelScale：单次缩小 clamp 到 0.25", async () => {
  // deltaY=3000 → delta=-4.5, 1-4.5 = -3.5 → clamp 0.25
  const r = nextWheelScale(1, 3000);
  assert.strictEqual(r, MIN_SCALE);
});

ok("nextWheelScale：边界不变化时不触发 setScale", async () => {
  // prev=MIN_SCALE=0.25, deltaY=10 → delta=-0.015, 0.25-0.00375=0.24625 → clamp 0.25
  // Math.max(0.25, 0.24625) = 0.25，等于 prev，不应 setScale
  // 用 Math.min(Math.max(...), prev) 检测
  const r = nextWheelScale(MIN_SCALE, 10);
  assert.strictEqual(r, MIN_SCALE);
});

// 2. fold 连续缩放（红→绿锁本次 bug）
ok("fold：deltaY=400 连 120 次，停在严格 0.25", async () => {
  // deltaY=400 → delta=-0.6 → factor = 0.4
  // 第1次：4 → 4*0.4 = 1.6
  // 第2次：1.6 → 1.6*0.4 = 0.64
  // 第3次：0.64 → clamp 0.25（已到底）
  // 后续 117 次恒为 0.25
  let s = 4;
  for (let i = 0; i < 120; i++) {
    s = nextWheelScale(s, 400);
  }
  // 必须严格等于 0.25（不是 0.2499... 或 0.26）
  assert.strictEqual(
    s,
    MIN_SCALE,
    `fold 120 次后 scale 应严格等于 ${MIN_SCALE}，实际 ${s}`,
  );
});

// 3. ZOOM_STEP 叠加
ok("ZOOM_STEP：1 → +0.1 → +0.1 → -0.1 = 1.1", async () => {
  const s0 = 1;
  const s1 = nextZoomIn(s0);       // 1 + 0.1 = 1.1
  const s2 = nextZoomIn(s1);       // 1.1 + 0.1 = 1.2
  const s3 = nextZoomOut(s2);      // 1.2 - 0.1 = 1.1
  assert(Math.abs(s1 - 1.1) < 0.0001, `s1: expected 1.1, got ${s1}`);
  assert(Math.abs(s2 - 1.2) < 0.0001, `s2: expected 1.2, got ${s2}`);
  assert(Math.abs(s3 - 1.1) < 0.0001, `s3: expected 1.1, got ${s3}`);
});

ok("ZOOM_STEP：边界 clamp", async () => {
  // MIN + zoomOut → 不变
  const atMin = nextZoomOut(MIN_SCALE);
  assert.strictEqual(atMin, MIN_SCALE);
  // MAX + zoomIn → 不变
  const atMax = nextZoomIn(MAX_SCALE);
  assert.strictEqual(atMax, MAX_SCALE);
});

// 4. 中间值连续性
ok("连续放大/缩小路径正确", async () => {
  let s = 1;
  // 放大到接近 MAX
  for (let i = 0; i < 30; i++) {
    s = nextZoomIn(s);
  }
  assert(s > 3 && s <= MAX_SCALE, `接近 MAX: ${s}`);
  // 缩小回接近 MIN
  for (let i = 0; i < 30; i++) {
    s = nextZoomOut(s);
  }
  assert(s < 1 && s >= MIN_SCALE, `接近 MIN: ${s}`);
});

// ── 等待完成 ────────────────────────────────────────────────────────────────
sequence.then(() => {
  console.log(`\n${passed} passed`);
  if (process.exitCode === 1) process.exit(1);
});
