import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  desktopShortcutPlatformFromValues,
  workbenchShortcutRows,
} from "../src/lib/keyboardShortcuts";

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

assert.equal(desktopShortcutPlatformFromValues("MacIntel"), "macos");
assert.equal(desktopShortcutPlatformFromValues("Win32"), "windows");
assert.equal(desktopShortcutPlatformFromValues("", "Mozilla/5.0 (Macintosh; Intel Mac OS X)"), "macos");
const macShortcuts = workbenchShortcutRows("macos");
const windowsShortcuts = workbenchShortcutRows("windows");
assert.deepEqual(macShortcuts.map(({ label }) => label), windowsShortcuts.map(({ label }) => label));
assert.equal(macShortcuts.find(({ label }) => label === "放大")?.shortcut, "⌘ +");
assert.equal(windowsShortcuts.find(({ label }) => label === "放大")?.shortcut, "Ctrl +");
assert.equal(macShortcuts.find(({ label }) => label === "删除")?.shortcut, "⌫");
assert.equal(windowsShortcuts.find(({ label }) => label === "删除")?.shortcut, "Delete");
assert.equal(macShortcuts.find(({ label }) => label === "取消撤销")?.shortcut, "⇧⌘ Z");
assert.equal(windowsShortcuts.find(({ label }) => label === "取消撤销")?.shortcut, "Ctrl Y");
console.log("  ✓ 快捷键菜单按 macOS / Windows 显示对应修饰键与系统删除键");

const relative = (file: string) => path.relative(path.resolve(testRoot, ".."), file);
const sources = files.map((file) => ({ file, source: fs.readFileSync(file, "utf8") }));
const combined = sources.map(({ source }) => source).join("\n");
const appSource = fs.readFileSync(path.resolve(testRoot, "../src/App.tsx"), "utf8");
const shellSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/workbench/WorkbenchShell.tsx"),
  "utf8",
);
const canvasFlowSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/CanvasFlow.tsx"),
  "utf8",
);
const canvasZoomControlsSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/CanvasZoomControls.tsx"),
  "utf8",
);
const topBarSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/panels/TopBar.tsx"),
  "utf8",
);
const indexCssSource = fs.readFileSync(path.resolve(testRoot, "../src/index.css"), "utf8");
const initialDraftWorkspaceSource = fs.readFileSync(
  path.resolve(testRoot, "../src/initialDraft/InitialDraftWorkspace.tsx"),
  "utf8",
);
const nodeFrameSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/nodes/NodeFrame.tsx"),
  "utf8",
);
const flowStoreSource = fs.readFileSync(path.resolve(testRoot, "../src/store/flowStore.ts"), "utf8");
const runPlanRouteSource = fs.readFileSync(path.resolve(testRoot, "../server/routes/runPlan.ts"), "utf8");
const railConfigSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/workbench/railConfig.tsx"),
  "utf8",
);
const resultDetailDialogSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/panels/ResultDetailDialog.tsx"),
  "utf8",
);
const canvasNodeActionsSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/panels/canvasNodeActions.ts"),
  "utf8",
);
const workbenchShellRenderSource = shellSource.slice(shellSource.indexOf("export function WorkbenchShell"));

assert.match(combined, /@\/components\/ui\//, "新外壳必须复用已安装的 shadcn 基础组件");
assert.match(combined, /aria-(?:label|labelledby|expanded|controls)/, "新外壳的交互入口必须提供可感知名称或状态");
assert.doesNotMatch(shellSource, /工作台右侧工具|border-l border-\[var\(--gc-border\)\]/, "工作台不得保留右侧工具栏或右侧 Dock");
assert.match(shellSource, /absolute left-4 top-4 z-40/, "工具栏入口应为画布左侧悬浮胶囊");
assert.match(canvasFlowSource, /new ResizeObserver/, "Dock 改变画布尺寸时必须监听容器几何变化");
assert.match(
  canvasFlowSource,
  /x: viewport\.x \+ delta\.width \/ 2/,
  "Dock 开合必须维持画布中心对应的世界坐标",
);
assert.match(canvasFlowSource, /compactMinimap \? 128 : 200/, "窄画布必须缩小 MiniMap");
assert.match(canvasFlowSource, /<CanvasZoomControls \/>/, "画布必须使用自定义横向缩放控制器");
assert.doesNotMatch(canvasFlowSource, /<Controls\b/, "画布不得继续使用 React Flow 竖向 Controls");
assert.match(canvasZoomControlsSource, /@\/components\/ui\/slider/, "缩放拖动条必须使用本地 shadcn Slider");
assert.match(canvasZoomControlsSource, /flex-row/, "缩放控制器必须横向排列");
assert.match(canvasZoomControlsSource, /zoomPercent/, "缩放控制器必须显示实时百分比");
assert.match(canvasZoomControlsSource, /CANVAS_ZOOM_COMMAND_EVENT/, "键盘缩放必须复用画布缩放控制器");
assert.match(canvasFlowSource, /multiSelectionKeyCode=\{multiSelectionKeyCode\}/, "多选修饰键必须按桌面系统显式配置");
assert.match(
  canvasFlowSource,
  /autoPanOnNodeDrag=\{false\}/,
  "拖动节点接近画布边缘时不得自动平移视口，否则松手时会产生画布跳动",
);
assert.doesNotMatch(
  indexCssSource,
  /\.react-flow__node[^}]*\{[^}]*\btranslate\s*:/s,
  "节点悬停不得改变 React Flow 坐标，否则拖拽状态切换会产生视觉跳动",
);
assert.match(
  initialDraftWorkspaceSource,
  /syncState !== "error"[\s\S]*?className="sr-only"[\s\S]*?<Card\b/,
  "正常草稿同步只能提供无布局占位的辅助状态，错误提示才允许显示 shadcn Card",
);
assert.match(
  initialDraftWorkspaceSource,
  /from "@\/components\/ui\/card"/,
  "草稿同步错误提示必须使用本地 shadcn Card",
);
assert.match(topBarSource, /from "@\/components\/ui\/dropdown-menu"/, "快捷键浮层必须使用本地 shadcn DropdownMenu");
assert.match(topBarSource, /DropdownMenuShortcut/, "快捷键标签必须使用 shadcn Shortcut 对齐槽位");
assert.match(topBarSource, /w-56 min-w-56/, "快捷键浮层宽度必须收敛到 224px");
assert.doesNotMatch(topBarSource, /ShortcutKey|pinned|openTimer|closeTimer/, "快捷键浮层不得保留手写键帽与悬停固定状态");
assert.match(appSource, /requestCanvasZoom\("in"\)/, "主修饰键加号必须缩放画布而不是浏览器页面");
assert.match(appSource, /copySelectedNodesToClipboard\(\)/, "复制快捷键必须读取 canonical 多选节点");
assert.match(appSource, /addExistingNodes\(additions\)/, "多节点粘贴必须通过原子批量 action 落入文档");
assert.doesNotMatch(combined, /absolute inset-y-0 (?:left|right)-0/, "桌面业务面板不得覆盖画布控件与结果");
assert.equal(
  (workbenchShellRenderSource.match(/\{children\}/g) ?? []).length,
  1,
  "中心画布子树必须只挂载一次，Dock 开合不得重建 React Flow",
);
assert.doesNotMatch(shellSource, /MobileSheet|useMediaQuery|DESKTOP_QUERY|mobilePanel/);
assert.doesNotMatch(appSource, /workspaceKey=\{activeTabId\}/);
// 2026-09-25 决策：左侧 Dock（节点库 / 属性）与「属性 / 结果」入口整体移除。
// 属性编辑内联在生成节点卡片上（双击节点标题改名），结果详情改到「历史创作记录」里弹出。
assert.doesNotMatch(shellSource, /activePanel|LIBRARY_PANEL_ID|INSPECTOR_PANEL_ID|openPanel/, "外壳不得保留任何左侧 Dock 面板状态或容器");
assert.doesNotMatch(shellSource, /\{library\}|\{inspector\}/, "外壳不得再挂载左侧面板插槽");
assert.doesNotMatch(railConfigSource, /panel:/, "左侧工具栏不得保留面板入口（属性 / 结果）");
assert.doesNotMatch(appSource, /ContextPanel|NodeLibraryPanel/, "App 不得再挂载左侧 Dock 面板");
assert.ok(!fs.existsSync(path.resolve(testRoot, "../src/components/panels/ContextPanel.tsx")), "ContextPanel 必须随左侧 Dock 一起删除");
assert.ok(!fs.existsSync(path.resolve(testRoot, "../src/components/panels/InspectorPanel.tsx")), "InspectorPanel 必须随属性面板一起删除");
assert.ok(!fs.existsSync(path.resolve(testRoot, "../src/components/workbench/workbenchState.ts")), "workbenchState 必须随面板状态一起删除");
assert.match(canvasNodeActionsSource, /export function addCanvasNode/, "「添加」菜单的节点新建动作必须保留（自 NodeLibraryPanel 迁出）");
const resultsFabSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/panels/ResultsFab.tsx"),
  "utf8",
);
assert.match(
  resultsFabSource,
  />\s*历史创作记录\s*<\/button>/,
  "画布右上角的入口必须以「历史创作记录」文字呈现（2026-09-25 决策 1），而不是示意图标",
);
// 2026-09-25 决策：点单个结果弹出「结果详情」（原内联在浮层下方的运行记录块已删除）。
assert.match(
  resultsFabSource,
  /<ResultsPanel[\s\S]*?onOpenDetail=\{setDetailResultId\}/,
  "历史创作记录浮层必须把「点结果」接到结果详情弹窗",
);
assert.match(
  resultsFabSource,
  /<ResultDetailDialog[\s\S]*?resultId=\{detailResultId\}/,
  "结果详情必须由受控弹窗承载（resultId=null 即关闭）",
);
assert.doesNotMatch(
  resultsFabSource,
  /<ResultRecordDetail/,
  "运行记录只能有一个家：浮层内联块必须删除，改由弹窗承载",
);
const resultsPanelSource = fs.readFileSync(
  path.resolve(testRoot, "../src/components/panels/ResultsPanel.tsx"),
  "utf8",
);
assert.match(
  resultsPanelSource,
  /grid-cols-3/,
  "结果缩略图必须以 3 个为一行呈现",
);
assert.match(
  appSource,
  /<ResultsFab[\s\S]*?\/>/,
  "右上角历史创作记录浮层必须挂载在中心画布容器内",
);
assert.doesNotMatch(
  appSource,
  /<ReactFlowProvider[\s\S]*?<ResultsPanel/,
  "Results 不应再占用中心画布底部",
);
// 结果详情弹窗必须复用本地 shadcn Dialog，并保留结果能力（查看大图 / 对比 / 下载 / 设为输入）。
assert.match(resultDetailDialogSource, /from "@\/components\/ui\/dialog"/, "结果详情必须使用本地 shadcn Dialog（居中弹窗）");
assert.match(resultDetailDialogSource, /from "@\/lib\/resultActions"/, "结果详情必须与结果卡片共用同一套动作实现");
assert.match(resultDetailDialogSource, /openResultViewer\(record\)/, "详情里必须能进入图片查看器（点大图，而不是打开详情时直接叠两层浮层）");
assert.match(resultDetailDialogSource, /下载/, "结果详情不得丢失下载入口");
assert.match(resultDetailDialogSource, /设为输入/, "结果详情不得丢失「设为输入」继续处理入口");
assert.doesNotMatch(resultDetailDialogSource, /window\.(?:alert|confirm)\s*\(/, "结果详情不得用阻塞式浏览器弹窗反馈错误");
assert.doesNotMatch(resultsPanelSource, /openViewer|openResultViewer\(r\)/, "结果卡片本身不再直接打开查看器，改由详情弹窗承接");
assert.match(appSource, /LazyAssetPickerOverlay/, "节点内的素材选择浮层必须继续保留");
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
