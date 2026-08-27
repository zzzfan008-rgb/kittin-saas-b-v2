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
assert.deepEqual(state, { libraryOpen: false, inspectorOpen: false });

state = workbenchUiReducer(state, { type: "toggle-library" });
assert.deepEqual(state, { libraryOpen: true, inspectorOpen: false });
state = workbenchUiReducer(state, { type: "toggle-inspector" });
assert.deepEqual(state, { libraryOpen: true, inspectorOpen: true });
state = workbenchUiReducer(state, { type: "toggle-library" });
assert.deepEqual(state, { libraryOpen: false, inspectorOpen: true });
console.log("  ✓ 外壳 reducer 只管理两个桌面 Dock 的开合状态");

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
const nodeFrameSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/nodes/NodeFrame.tsx"),
  "utf8",
);
const flowStoreSource = fs.readFileSync(path.resolve(testRoot, "../src/store/flowStore.ts"), "utf8");
const runPlanRouteSource = fs.readFileSync(path.resolve(testRoot, "../server/routes/runPlan.ts"), "utf8");
const workbenchShellRenderSource = shellSource.slice(shellSource.indexOf("export function WorkbenchShell"));

assert.match(combined, /@\/components\/ui\//, "新外壳必须复用已安装的 shadcn 基础组件");
assert.match(combined, /aria-(?:label|labelledby|expanded|controls)/, "新外壳的交互入口必须提供可感知名称或状态");
assert.match(combined, /transition-\[width,visibility\]/, "桌面 Dock 应通过占位宽度开合，避免遮挡画布控件与结果");
assert.doesNotMatch(combined, /absolute inset-y-0 (?:left|right)-0/, "桌面业务面板不得覆盖画布控件与结果");
assert.equal(
  (workbenchShellRenderSource.match(/\{children\}/g) ?? []).length,
  1,
  "中心画布子树必须只挂载一次，Dock 开合不得重建 React Flow",
);
assert.equal(
  (workbenchShellRenderSource.match(/\{library\}/g) ?? []).length,
  1,
  "节点与素材 Dock 必须保持单实例挂载",
);
assert.equal(
  (workbenchShellRenderSource.match(/\{inspector\}/g) ?? []).length,
  1,
  "属性与结果 Dock 必须保持单实例挂载",
);
assert.match(shellSource, /<aside[\s\S]*?id=\{LIBRARY_PANEL_ID\}[\s\S]*?inert=\{!state\.libraryOpen\}/);
assert.match(shellSource, /<aside[\s\S]*?id=\{INSPECTOR_PANEL_ID\}[\s\S]*?inert=\{!state\.inspectorOpen\}/);
assert.doesNotMatch(shellSource, /MobileSheet|useMediaQuery|DESKTOP_QUERY|mobilePanel/);
assert.doesNotMatch(appSource, /workspaceKey=\{activeTabId\}/);
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
assert.doesNotMatch(nodeFrameSource, /onCancel|>\s*取消\s*</, "生成按钮不得再暴露取消入口");
assert.doesNotMatch(flowStoreSource, /cancelNodeRun|\/api\/run-plan\/.*\/cancel/, "客户端不得保留任务取消模块");
assert.doesNotMatch(runPlanRouteSource, /\/:id\/cancel|cancelDurableRun/, "运行 API 不得暴露用户取消端点");
console.log("  ✓ 生成节点、客户端 Store 与运行 API 均不再暴露取消功能");

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
