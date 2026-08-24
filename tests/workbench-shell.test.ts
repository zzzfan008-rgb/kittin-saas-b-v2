import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  INITIAL_WORKBENCH_UI_STATE,
  workbenchUiReducer,
  type WorkbenchUiState,
} from "../src/components/workbench/workbenchState";

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const workbenchRoot = path.resolve(testRoot, "../src/components/workbench");

function sourceFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(absolute));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(absolute);
  }
  return files.sort();
}

console.log("新工作台外壳源码契约测试");

const files = sourceFiles(workbenchRoot);
assert.ok(files.length > 0, "缺少 src/components/workbench 外壳源码");

let state: WorkbenchUiState = INITIAL_WORKBENCH_UI_STATE;
assert.deepEqual(state, { libraryOpen: false, inspectorOpen: false, mobilePanel: null });

state = workbenchUiReducer(state, { type: "toggle-library" });
assert.deepEqual(state, { libraryOpen: true, inspectorOpen: false, mobilePanel: null });
state = workbenchUiReducer(state, { type: "toggle-inspector" });
assert.deepEqual(state, { libraryOpen: true, inspectorOpen: true, mobilePanel: null });
state = workbenchUiReducer(state, { type: "toggle-library" });
assert.deepEqual(state, { libraryOpen: false, inspectorOpen: true, mobilePanel: null });

state = workbenchUiReducer(state, { type: "open-mobile", panel: "library" });
assert.equal(state.mobilePanel, "library");
state = workbenchUiReducer(state, { type: "open-mobile", panel: "inspector" });
assert.equal(state.mobilePanel, "inspector", "移动端辅助面板必须互斥");
const alreadyOpen = state;
state = workbenchUiReducer(state, { type: "open-mobile", panel: "inspector" });
assert.strictEqual(state, alreadyOpen, "重复打开当前模态 Sheet 不得制造无意义状态更新");
state = workbenchUiReducer(state, { type: "close-mobile" });
assert.equal(state.mobilePanel, null, "Sheet 必须能通过关闭按钮、遮罩或 Escape 关闭");
const alreadyClosed = state;
state = workbenchUiReducer(state, { type: "close-mobile" });
assert.strictEqual(state, alreadyClosed, "重复关闭不得制造无意义状态更新");
assert.equal(state.inspectorOpen, true, "移动端面板动作不得污染桌面端 Dock 偏好");
console.log("  ✓ 外壳 reducer 隔离桌面 Dock，并保证移动面板互斥与幂等关闭");

const relative = (file: string) => path.relative(path.resolve(testRoot, ".."), file);
const sources = files.map((file) => ({ file, source: fs.readFileSync(file, "utf8") }));
const combined = sources.map(({ source }) => source).join("\n");
const appSource = fs.readFileSync(path.resolve(testRoot, "../src/App.tsx"), "utf8");
const shellSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/workbench/WorkbenchShell.tsx"),
  "utf8",
);
const contextPanelSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/panels/ContextPanel.tsx"),
  "utf8",
);
const sheetSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/ui/sheet.tsx"),
  "utf8",
);
const workbenchShellRenderSource = shellSource.slice(shellSource.indexOf("export function WorkbenchShell"));

assert.match(combined, /@\/components\/ui\//, "新外壳必须复用已安装的 shadcn 基础组件");
assert.match(combined, /aria-(?:label|labelledby|expanded|controls)/, "新外壳的交互入口必须提供可感知名称或状态");
assert.match(combined, /data-workbench-shortcuts="block"/, "Sheet 必须阻止全局画布快捷键穿透");
assert.match(combined, /transition-\[width,visibility\]/, "桌面 Dock 应通过占位宽度开合，避免遮挡画布控件与结果");
assert.doesNotMatch(combined, /absolute inset-y-0 (?:left|right)-0/, "桌面业务面板不得覆盖画布控件与结果");
assert.equal(
  (workbenchShellRenderSource.match(/\{children\}/g) ?? []).length,
  1,
  "中心画布子树必须只挂载一次，断点切换不得重建 React Flow",
);
assert.doesNotMatch(
  shellSource,
  /if \(isDesktop\)/,
  "工作台不得根据 1024px 断点返回两棵不同的布局树",
);
assert.match(
  shellSource,
  /portalProps=\{\{ container: portalContainer, keepMounted: true/,
  "Dock 与移动 Sheet 应复用同一个持久化 Portal 子树",
);
assert.equal(
  (shellSource.match(/z-50 w-0[\s\S]*?lg:z-30/g) ?? []).length,
  2,
  "两个移动 Sheet Portal 宿主都必须高于顶栏，并在桌面恢复 Dock 层级",
);
assert.match(sheetSource, /portalProps\?: SheetPrimitive\.Portal\.Props/);
assert.equal(
  (contextPanelSource.match(/<Tabs\.Panel[\s\S]*?keepMounted/g) ?? []).length,
  2,
  "属性与结果 Tab 都必须 keepMounted",
);
assert.match(appSource, /inspector=\{\([\s\S]*?<ContextPanel/);
assert.doesNotMatch(
  appSource,
  /<ReactFlowProvider[\s\S]*?<ResultsPanel/,
  "Results 不应再占用中心画布底部",
);

const saveShortcutIndex = appSource.indexOf('if (key === "s")');
const sheetBlockIndex = appSource.indexOf("target?.closest('[data-workbench-shortcuts=\"block\"]')");
assert.ok(saveShortcutIndex >= 0 && sheetBlockIndex > saveShortcutIndex, "Sheet 应拦截画布编辑快捷键，但必须保留 Cmd/Ctrl+S 项目保存");

for (const { file, source } of sources) {
  assert.doesNotMatch(
    source,
    /(?:bg|text|border|ring|outline|fill|stroke)-\[#[0-9a-f]{3,8}\]/i,
    `${relative(file)} 不应把旧十六进制视觉常量带进新外壳`,
  );
  assert.doesNotMatch(
    source,
    /(?:classList\.(?:add|remove|toggle)|dataset\.theme)[\s\S]{0,100}(?:dark|current|white|eye)/,
    `${relative(file)} 不得建立第二套主题状态，主题写入必须继续走 src/lib/theme.ts`,
  );
  assert.doesNotMatch(
    source,
    /window\.(?:alert|confirm)\s*\(/,
    `${relative(file)} 的确认与错误反馈应使用可访问的工作台 UI，而非阻塞式浏览器弹窗`,
  );
}

console.log(`  ✓ ${files.length} 个 workbench 源文件使用语义 token、共享 UI primitives 与可访问入口`);
