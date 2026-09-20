/**
 * R-80 R2/R3 回归：Dock 开合的视口居中控件契约 + document Enter 守卫的激活目标判定。
 * 纯逻辑（不依赖 DOM 运行时与 React Flow），运行：
 *   node node_modules/tsx/dist/cli.mjs tests/canvas-dock-keyboard.test.ts
 */
import assert from "node:assert/strict";
import {
  DOCK_OPEN_WIDTH_PX,
  dockWidthChange,
  shiftViewportForWidthChange,
} from "../src/lib/dockViewport";
import { isNativeActivationTarget } from "../src/lib/keyboardActivation";

let passed = 0;
function ok(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

interface FakeElement {
  tagName: string;
  role?: string | null;
  href?: string | null;
  getAttribute(name: string): string | null;
}
function el(tagName: string, attrs: { role?: string | null; href?: string | null } = {}): FakeElement {
  return {
    tagName,
    role: attrs.role ?? null,
    href: attrs.href ?? null,
    getAttribute(name: string) {
      if (name === "role") return attrs.role ?? null;
      if (name === "href") return attrs.href ?? null;
      return null;
    },
  };
}

console.log("dock 宽度增量（R-80 R2）");

ok("展开 Dock 让画布收缩一个 Dock 宽度（-320）", () => {
  assert.equal(dockWidthChange(false, true), -DOCK_OPEN_WIDTH_PX);
  assert.equal(dockWidthChange(false, true), -320);
});

ok("收起 Dock 让画布展开一个 Dock 宽度（+320）", () => {
  assert.equal(dockWidthChange(true, false), 320);
});

ok("同级面板切换（library↔inspector）宽度增量为 0", () => {
  assert.equal(dockWidthChange(true, true), 0);
  assert.equal(dockWidthChange(false, false), 0);
});

ok("视口 x 平移宽度增量的一半，y/zoom 不变（中心世界坐标守恒）", () => {
  const viewport = { x: 100, y: 218, zoom: 1 };
  const centerBefore = { x: (1440 / 2 - viewport.x) / 1, y: (812 / 2 - viewport.y) / 1 };

  const opened = shiftViewportForWidthChange(viewport, -320);
  assert.deepEqual(opened, { x: -60, y: 218, zoom: 1 });
  const centerOpened = { x: (1120 / 2 - opened.x) / 1, y: (812 / 2 - opened.y) / 1 };
  assert.ok(Math.abs(centerOpened.x - centerBefore.x) < 1e-9);
  assert.ok(Math.abs(centerOpened.y - centerBefore.y) < 1e-9);

  const closed = shiftViewportForWidthChange(opened, 320);
  assert.deepEqual(closed, { x: 100, y: 218, zoom: 1 });
});

ok("非 1 缩放下中心同样守恒（zoom=1.25）", () => {
  const viewport = { x: 40, y: 80, zoom: 1.25 };
  const centerBefore = (1440 / 2 - viewport.x) / 1.25;
  const next = shiftViewportForWidthChange(viewport, -320);
  const centerAfter = (1120 / 2 - next.x) / 1.25;
  assert.ok(Math.abs(centerAfter - centerBefore) < 1e-9);
});

ok("不修改传入的视口对象（返回新对象）", () => {
  const viewport = { x: 100, y: 200, zoom: 1 };
  const next = shiftViewportForWidthChange(viewport, -320);
  assert.notEqual(next, viewport);
  assert.deepEqual(viewport, { x: 100, y: 200, zoom: 1 });
});

console.log("Enter 原生激活目标判定（R-80 R3）");

ok("<button> 是原生激活目标，document 守卫必须让位", () => {
  assert.equal(isNativeActivationTarget(el("BUTTON")), true);
});

ok("role=tab（base-ui Tabs.Tab）是原生激活目标", () => {
  assert.equal(isNativeActivationTarget(el("DIV", { role: "tab" })), true);
});

for (const role of ["button", "link", "checkbox", "radio", "switch", "menuitem", "option"]) {
  ok(`role=${role} 是原生激活目标`, () => {
    assert.equal(isNativeActivationTarget(el("DIV", { role })), true);
  });
}

ok("带 href 的 <a> 是原生激活目标", () => {
  assert.equal(isNativeActivationTarget(el("A", { href: "/projects" })), true);
});

ok("无 href 的 <a> 不算", () => {
  assert.equal(isNativeActivationTarget(el("A")), false);
});

ok("<summary> 是原生激活目标（details 展开）", () => {
  assert.equal(isNativeActivationTarget(el("SUMMARY")), true);
});

ok("普通 div / body / null 不是激活目标（Enter 快捷键照常生效）", () => {
  assert.equal(isNativeActivationTarget(el("DIV")), false);
  assert.equal(isNativeActivationTarget(el("BODY")), false);
  assert.equal(isNativeActivationTarget(null), false);
  assert.equal(isNativeActivationTarget(undefined), false);
});

ok("画布 pane（div + tabindex）仍允许 Enter 打开功能设置", () => {
  const pane = el("DIV", { role: "application" });
  assert.equal(isNativeActivationTarget(pane), false);
});

console.log(`\n${passed} 项通过`);
