/**
 * VIS-05 UI 回归：画布缩放控制条上的网格吸附开关。
 * 静态渲染（与 five-node-model-ui.test.ts 同法），断言可访问性契约：
 * aria-label / aria-pressed，不依赖具体 class。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/grid-snap-ui.test.ts
 */
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactFlowProvider } from "@xyflow/react";
import { CanvasZoomControls } from "../src/components/CanvasZoomControls";

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

// 无 window → 开关服务端快照默认关。
delete (globalThis as { window?: unknown }).window;

console.log("VIS-05 网格吸附开关 UI");

const html = renderToStaticMarkup(
  createElement(ReactFlowProvider, null, createElement(CanvasZoomControls)),
);

ok("开关按钮存在且带 aria-label=网格吸附", () => {
  assert.match(html, /aria-label="网格吸附"/);
});

ok("默认关：aria-pressed=\"false\"", () => {
  assert.match(
    html,
    /aria-label="网格吸附"[^>]*aria-pressed="false"|aria-pressed="false"[^>]*aria-label="网格吸附"/,
  );
});

ok("开关挂在缩放控制条上", () => {
  assert.match(html, /data-testid="canvas-zoom-controls"/);
  assert.match(html, /data-testid="grid-snap-toggle"/);
});

process.on("exit", () => {
  if (process.exitCode) return;
  console.log(`\n${passed} 项通过`);
});
