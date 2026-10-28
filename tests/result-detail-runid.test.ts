/**
 * 结果页「生成ID」与失败记录可打开（用户 2026-10-28）。
 *
 * 诉求：
 *  1. 历史创作记录里的失败结果也能打开结果页（不再只高亮）；
 *  2. 结果页新增「生成ID」= 服务端 generation_runs.id，唯一值，拿到即可精确定位。
 *
 * 这两个都是渲染/交互契约，纯源码断言锁定（SSR 无法覆盖 store 驱动的弹层）。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (rel: string) => readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), "utf8");

console.log("结果页：生成ID + 失败记录可打开");

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const panel = read("src/components/panels/ResultsPanel.tsx");
const viewer = read("src/components/ImageViewer.tsx");

ok("历史记录：失败态卡片点击走 openDetail（打开结果页），不再只 setSelectedResultId", () => {
  // 失败分支的特征串：红色边框 + 「失败/已取消」状态文案卡片
  const failedBranchStart = panel.indexOf('border-red-900/50');
  assert.ok(failedBranchStart > 0, "找不到失败态卡片分支");
  const failedBranch = panel.slice(Math.max(0, failedBranchStart - 1200), failedBranchStart);
  assert.match(
    failedBranch,
    /onClick=\{\(\) => openDetail\(r\)\}/,
    "失败卡片必须调用 openDetail 打开结果页",
  );
});

ok("历史记录：运行中卡片也可打开结果页", () => {
  const runningStart = panel.indexOf("animate-spin rounded-full border-2 border-gold/30");
  assert.ok(runningStart > 0, "找不到运行中卡片分支");
  const runningBranch = panel.slice(Math.max(0, runningStart - 900), runningStart);
  assert.match(runningBranch, /onClick=\{\(\) => openDetail\(r\)\}/, "运行中卡片必须调用 openDetail");
});

ok("结果页：新增「生成ID」字段，取服务端 runId（唯一值）", () => {
  assert.match(viewer, /\["生成ID",/, "结果页必须渲染「生成ID」字段");
  assert.match(viewer, /record\?\.runId/, "生成ID 必须取自 record.runId（服务端 generation_runs.id）");
});

ok("结果页：无产物（失败/未知）时显示状态占位而不是空图", () => {
  assert.match(viewer, /const hasProduct = imageUrl\.length > 0;/, "必须显式判定有没有产物");
  assert.match(viewer, /!hasProduct \? \(/, "无产物时必须走占位分支");
  assert.match(viewer, /本次运行没有生成图片。/, "占位文案缺失");
});

ok("结果页：无产物时禁用下载与设为输入", () => {
  assert.match(viewer, /无产物可下载/, "下载入口必须显式降级");
  assert.match(viewer, /disabled=\{!record \|\| !hasProduct\}/, "设为输入必须要求有产物");
});

ok("store：viewer.url 允许为空（失败记录只有元数据）", () => {
  const store = read("src/store/flowStore.ts");
  assert.match(store, /viewer: \{ url\?: string;/, "viewer.url 必须是可选字段");
  assert.match(store, /openViewer: \(v: \{ url\?: string;/, "openViewer 必须接受无 url 的调用");
});

console.log(`通过 ${passed} 项`);
