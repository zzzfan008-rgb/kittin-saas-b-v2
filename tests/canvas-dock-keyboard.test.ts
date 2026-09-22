/**
 * R-80 R3 回归：document Enter 守卫的激活目标判定。
 * 纯逻辑（不依赖 DOM 运行时与 React Flow），运行：
 *   node node_modules/tsx/dist/cli.mjs tests/canvas-dock-keyboard.test.ts
 */
import assert from "node:assert/strict";
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
