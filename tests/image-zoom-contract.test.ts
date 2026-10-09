/**
 * R-90 坐标映射契约测试（useImageZoom hook 核心数学）。
 *
 * 覆盖：
 * 1. 互逆性：screenToImage(imageToScreen(p)) ≈ p（任意 scale/pan/rect）
 * 2. 平移后落点（P0 回归锚）：scale=2, pan=(100,50), rect=(left=140,top=90,w=400,h=300)
 * 3. 滚轮锚点（P1 锚）：指针位置 × sOld→sNew，锚图像素坐标不变（X + Y 双轴）
 * 4. 边界：scale 钳在 0.25–4；fit 态 pan=0 落点正确
 *
 * 运行：
 *   node node_modules/tsx/dist/cli.mjs tests/image-zoom-contract.test.ts
 */
import assert from "node:assert/strict";

// ── 核心坐标映射（useImageZoom.ts 的纯数学副本）──────────────────────────────
// rect = DOMRect（已含 CSS transform 的效果）
// screenToImage：屏幕 → 原图像素
function screenToImage(sx: number, sy: number, rect: { left: number; top: number }, scale: number) {
  return {
    x: (sx - rect.left) / scale,
    y: (sy - rect.top) / scale,
  };
}
// imageToScreen：原图像素 → 屏幕
function imageToScreen(ix: number, iy: number, rect: { left: number; top: number }, scale: number) {
  return {
    x: ix * scale + rect.left,
    y: iy * scale + rect.top,
  };
}
// handleWheel 锚点计算（配合 transformOrigin:"0 0"）
// rectBefore = 变换后的实时 DOMRect（已含 translate(panOld) + scale*origin）
//   rectBefore.left = B + panOld    B = 未变换布局常量（transformOrigin="0 0" 时）
// panOld = 当前 panOffset.x/y（变换前 rect 的pan 吸收量）
// 返回 panNew：绝对值，直接替换 panOffset
function wheelPanNew(
  e: { clientX: number; clientY: number; deltaY: number },
  rectBefore: { left: number; top: number },
  panOld: { x: number; y: number },
  sOld: number,
) {
  const sNew = Math.min(4, Math.max(0.25, sOld - e.deltaY * 0.0015 * sOld));
  if (sNew === sOld) return { sNew, panNew: { x: panOld.x, y: panOld.y } };
  // 布局常量 B = rectBefore.left - panOld.x（反推未变换布局位置）
  const Bx = rectBefore.left - panOld.x;
  const By = rectBefore.top - panOld.y;
  const localX = (e.clientX - rectBefore.left) / sOld;
  const localY = (e.clientY - rectBefore.top) / sOld;
  const panNewX = e.clientX - Bx - localX * sNew;
  const panNewY = e.clientY - By - localY * sNew;
  return { sNew, panNew: { x: panNewX, y: panNewY } };
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

function makeRect(left: number, top: number, width: number, height: number) {
  return { left, top, right: left + width, bottom: top + height, width, height, x: left, y: top };
}

// ── 测试 ───────────────────────────────────────────────────────────────────
console.log("R-90 坐标映射契约测试");

// 1. 互逆性
ok("互逆性：pan=0, scale=1", async () => {
  const rect = makeRect(100, 50, 400, 300);
  const original = { x: 120, y: 80 };
  const screen = imageToScreen(original.x, original.y, rect, 1);
  const back = screenToImage(screen.x, screen.y, rect, 1);
  assert(Math.abs(back.x - original.x) < 0.001);
  assert(Math.abs(back.y - original.y) < 0.001);
});

ok("互逆性：pan≠0, scale=2.5", async () => {
  // pan=200 => rect.left 包含 pan，所以只测 rect 抽象
  const rect = makeRect(200, 100, 400, 300);
  const original = { x: 55.5, y: 33.3 };
  const screen = imageToScreen(original.x, original.y, rect, 2.5);
  const back = screenToImage(screen.x, screen.y, rect, 2.5);
  assert(Math.abs(back.x - original.x) < 0.001);
  assert(Math.abs(back.y - original.y) < 0.001);
});

ok("互逆性：pan≠0, scale=0.5（最小）", async () => {
  const rect = makeRect(80, 70, 200, 150);
  const original = { x: 300, y: 200 };
  const screen = imageToScreen(original.x, original.y, rect, 0.5);
  const back = screenToImage(screen.x, screen.y, rect, 0.5);
  assert(Math.abs(back.x - original.x) < 0.001);
  assert(Math.abs(back.y - original.y) < 0.001);
});

// 2. 平移后落点（P0 回归锚）
ok("平移后落点：scale=2, pan=(100,50), rect=(140,90,400,300)", async () => {
  // stage: translate(100,50) scale(2), transformOrigin:"0 0"
  // rect.left = 未变换左上角屏幕位置 = 140（不含 pan，因为 origin="0 0"）
  // rect.top  = 90
  // 变换后 rect.left 实际包含 pan，但公式不在乎——它直接用 rect.left
  const rect = makeRect(140, 90, 400, 300);
  const scale = 2;
  // 屏幕点 (200, 180) 应映射到原图
  const img = screenToImage(200, 180, rect, scale);
  // 期望：x = (200-140)/2 = 30, y = (180-90)/2 = 45
  assert(Math.abs(img.x - 30) < 0.001, `x: expected 30, got ${img.x}`);
  assert(Math.abs(img.y - 45) < 0.001, `y: expected 45, got ${img.y}`);
  // 验证图像素→屏幕逆映射
  const screen = imageToScreen(img.x, img.y, rect, scale);
  assert(Math.abs(screen.x - 200) < 0.001);
  assert(Math.abs(screen.y - 180) < 0.001);
});

// 3. 滚轮锚点（P1 锚）
ok("滚轮锚点：指针(300) 下 sOld=1→sNew=1.999，原图像素坐标不变", async () => {
  // rectBefore = 变换后 rect（B=0, panOld=0）
  const rectBefore = makeRect(0, 0, 600, 400);
  const sOld = 1;
  const pointer = 300; // 屏幕 x
  // sOld=1: 指针下的原图 x = (300 - 0) / 1 = 300
  const result = wheelPanNew({ clientX: pointer, clientY: 0, deltaY: -666 }, rectBefore, { x: 0, y: 0 }, sOld);
  // deltaY=-666 × 0.0015 = -0.999, sOld - (-0.999) = 1.999
  assert(Math.abs(result.sNew - 1.999) < 0.001, `sNew: expected ~1.999, got ${result.sNew}`);
  // 验证锚点：sNew=1.999, localX=300
  // panNew = 300 - 0 - 300*1.999 = -299.7
  assert(Math.abs(result.panNew.x - (-299.7)) < 0.01, `panNew.x: expected ~-299.7, got ${result.panNew.x}`);
  // y 不应变化
  assert(Math.abs(result.panNew.y - 0) < 0.01);
  // 验证：新 rect.left = C + panNew = -299.7，屏幕 pointer=300 下原图 x 仍为 300
  // 新局部 = (300 - (-299.7)) / 1.999 = 599.7 / 1.999 ≈ 300 ✓
});

ok("滚轮锚点：连续两次缩放，锚点保持", async () => {
  const rect0 = makeRect(0, 0, 800, 600);
  const s0 = 1;
  const pointerX = 400;
  const pointerY = 250;
  // 第一次：1 → ~2，panOld=0
  const r1 = wheelPanNew({ clientX: pointerX, clientY: pointerY, deltaY: -666 }, rect0, { x: 0, y: 0 }, s0);
  // r1.panNew 是绝对值（直接替换 panOffset）
  // 变换后 rect1.left = B + r1.panNew.x，B=0（布局常量） → rect1.left = r1.panNew.x
  const rect1 = makeRect(r1.panNew.x, r1.panNew.y, 800, 600);
  // 第二次：~2 → ~4，传入 panOld = r1.panNew
  const r2 = wheelPanNew({ clientX: pointerX, clientY: pointerY, deltaY: -666 }, rect1, r1.panNew, r1.sNew);
  // r2.panNew 是绝对值，rect2.left = r2.panNew.x
  const rect2 = makeRect(r2.panNew.x, r2.panNew.y, 800, 600);
  // 验证：pointer=400 下原图锚 x 仍应为 400
  const anchor = screenToImage(pointerX, pointerY, rect2, r2.sNew);
  assert(Math.abs(anchor.x - 400) < 0.01, `anchor x: expected 400, got ${anchor.x}`);
  assert(Math.abs(anchor.y - 250) < 0.01, `anchor y: expected 250, got ${anchor.y}`);
});

// 4. 边界
ok("边界：scale clamp 到 [0.25, 4]", async () => {
  const rect = makeRect(0, 0, 600, 400);
  // deltaY 正数（向下滚 = 缩小），sOld=0.25 时应不变化
  const r1 = wheelPanNew({ clientX: 300, clientY: 200, deltaY: 1000 }, rect, { x: 0, y: 0 }, 0.25);
  assert(r1.sNew === 0.25, "should not go below MIN_SCALE");
  // deltaY 负数（向上滚 = 放大），sOld=4 时应不变化
  const r2 = wheelPanNew({ clientX: 300, clientY: 200, deltaY: -1000 }, rect, { x: 0, y: 0 }, 4);
  assert(r2.sNew === 4, "should not go above MAX_SCALE");
});

ok("滚轮锚点：Y 轴连续两次缩放，Y 锚点保持（clientY=250）", async () => {
  // 验证 Y 轴同样被锚定，不会每次滚轮跳回 0
  const rect0 = makeRect(0, 0, 800, 600);
  const s0 = 1;
  const pointerX = 400;
  const pointerY = 250;
  const r1 = wheelPanNew({ clientX: pointerX, clientY: pointerY, deltaY: -666 }, rect0, { x: 0, y: 0 }, s0);
  const rect1 = makeRect(r1.panNew.x, r1.panNew.y, 800, 600);
  const r2 = wheelPanNew({ clientX: pointerX, clientY: pointerY, deltaY: -666 }, rect1, r1.panNew, r1.sNew);
  const rect2 = makeRect(r2.panNew.x, r2.panNew.y, 800, 600);
  // Y 锚点应保持 250（两次都不跳回 0）
  const anchor = screenToImage(pointerX, pointerY, rect2, r2.sNew);
  assert(Math.abs(anchor.x - 400) < 0.01, `anchor x: expected 400, got ${anchor.x}`);
  assert(Math.abs(anchor.y - 250) < 0.01, `anchor y: expected 250, got ${anchor.y}`);
});

ok("fit 态：scale≈1, pan=0, 屏幕点映射正确", async () => {
  const rect = makeRect(200, 150, 400, 300);
  const scale = 1;
  // 未变换 rect.left = 200
  const img = screenToImage(300, 250, rect, scale);
  assert(Math.abs(img.x - 100) < 0.001, `x: expected 100, got ${img.x}`);
  assert(Math.abs(img.y - 100) < 0.001, `y: expected 100, got ${img.y}`);
});

// ── 等待完成 ────────────────────────────────────────────────────────────────
sequence.then(() => {
  console.log(`\n${passed} passed`);
  if (process.exitCode === 1) process.exit(1);
});
