import type { Locator, Page } from "@playwright/test";
import {
  WORKFLOW_SCHEMA_VERSION,
  missingTextUpstreamNodeIds,
  type WorkflowTemplate,
} from "../src/types/workflow";
import { expect, test } from "./fixtures";

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

const TEMPLATE_FIXTURES = Array.from({ length: 3 }, (_, index) => ({
  schemaVersion: WORKFLOW_SCHEMA_VERSION,
  id: `e2e-template-${index + 1}`,
  name: `E2E 模板 ${index + 1}`,
  description: "用于验证模板面板在桌面 Dock 组合下的响应式网格",
  builtIn: true,
  createdAt: "2026-08-24T00:00:00.000Z",
  flow: { schemaVersion: WORKFLOW_SCHEMA_VERSION, nodes: [], edges: [] },
})) satisfies WorkflowTemplate[];

const PROJECT_CENTER_PROJECT_FIXTURES = Array.from({ length: 5 }, (_, index) => ({
  id: `e2e-project-${index + 1}`,
  name: `超长项目名称 ${index + 1} · 用于验证单元长度折行在不同分辨率下的稳定展示`,
  ownerName: "E2E 演示用户",
  readOnly: index === 0,
  updatedAt: "2026-08-24T00:00:00.000Z",
}));

const PROJECT_CENTER_TEMPLATE_FIXTURES: Array<WorkflowTemplate> = [
  {
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    id: "e2e-template-builtin-1",
    name: "超长内置模板示例 1",
    description: "用于验证 3 列/4 列切换时模板卡片标题双行截断的稳定效果",
    builtIn: true,
    createdAt: "2026-08-24T00:00:00.000Z",
    flow: { schemaVersion: WORKFLOW_SCHEMA_VERSION, nodes: [], edges: [] },
  },
  {
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    id: "e2e-template-builtin-2",
    name: "内置模板示例 2",
    description: "快速创建一个基础画布与节点",
    builtIn: true,
    createdAt: "2026-08-24T00:00:01.000Z",
    flow: { schemaVersion: WORKFLOW_SCHEMA_VERSION, nodes: [], edges: [] },
  },
  {
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    id: "e2e-template-my-1",
    name: "超长自建模板名称 1",
    description: "用于验证我的模板卡片标题与动作区域在窄列下依然可见且不溢出",
    builtIn: false,
    createdAt: "2026-08-24T00:00:02.000Z",
    flow: { schemaVersion: WORKFLOW_SCHEMA_VERSION, nodes: [], edges: [] },
  },
];

const RESULTS_DENSITY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const RESULTS_DENSITY_FIXTURES = [
  {
    id: "e2e-result-success",
    runId: "e2e-run-success",
    image: RESULTS_DENSITY_IMAGE,
    thumbnail: RESULTS_DENSITY_IMAGE,
    nodeId: "node-success",
    nodeLabel: "超长成功结果卡片标题 · 用于验证双列布局下动作按钮可读性",
    kind: "sketch-to-render" as const,
    projectId: "e2e-project-1",
    projectName: "演示项目",
    prompt: "检查结果卡片动作与布局",
    model: "gpt-image-2.5-flare-vip",
    startedAt: 1760000000000,
    finishedAt: 1760000001000,
    status: "success" as const,
    ownerName: "E2E 演示用户",
  },
  {
    id: "e2e-result-failed",
    runId: "e2e-run-failed",
    image: RESULTS_DENSITY_IMAGE,
    nodeId: "node-failed",
    nodeLabel: "失败结果测试",
    kind: "sketch-to-render" as const,
    projectId: "e2e-project-2",
    prompt: "失败演示",
    startedAt: 1760000002000,
    status: "error" as const,
    error: "演示错误",
  },
  {
    id: "e2e-result-unknown",
    runId: "e2e-run-unknown",
    image: RESULTS_DENSITY_IMAGE,
    nodeId: "node-unknown",
    nodeLabel: "未知状态结果测试",
    kind: "sketch-to-render" as const,
    projectId: "e2e-project-3",
    prompt: "未知演示",
    startedAt: 1760000003000,
    status: "outcome_unknown" as const,
  },
];

async function rect(locator: Locator): Promise<Rect> {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      top: box.top,
      bottom: box.bottom,
      width: box.width,
      height: box.height,
    };
  });
}

async function expectWidth(locator: Locator, width: number) {
  await expect.poll(async () => (await rect(locator)).width).toBe(width);
}

async function expectInert(locator: Locator, inert: boolean) {
  await expect.poll(async () => locator.evaluate((element) => (element as HTMLElement).inert)).toBe(inert);
  expect(await locator.getAttribute("inert")).toBe(inert ? "" : null);
}

function expectInside(child: Rect, parent: Rect) {
  expect(child.left).toBeGreaterThanOrEqual(parent.left - 1);
  expect(child.right).toBeLessThanOrEqual(parent.right + 1);
  expect(child.top).toBeGreaterThanOrEqual(parent.top - 1);
  expect(child.bottom).toBeLessThanOrEqual(parent.bottom + 1);
}

async function gridColumnCount(locator: Locator): Promise<number> {
  return locator.evaluate((element) => (
    getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length
  ));
}

async function expectGridColumns(locator: Locator, count: number) {
  await expect(locator).toBeVisible();
  await expect.poll(async () => gridColumnCount(locator)).toBe(count);
}

async function expectTwoLineTitle(locator: Locator) {
  await expect(locator).toBeVisible();
  const metrics = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      lineClamp: style.webkitLineClamp,
    };
  });
  expect(metrics.lineClamp).toBe("2");
  expect(metrics.height).toBeGreaterThanOrEqual(31);
  expect(metrics.height).toBeLessThanOrEqual(33);
}

/**
 * 画布视口矩阵的确定性读取。
 *
 * 项目在 `prefers-reduced-motion: reduce` 下用 `* { transition-duration: 0.01ms !important }`
 * 兜底（src/index.css），但 `transition-property` 仍是 CSS 初值 `all`，于是每次写
 * `.react-flow__viewport` 的 transform 都会生成一条 0.01ms 的 CSS 过渡。没有渲染帧的
 * headless 环境下该过渡停在 currentTime=0，`getComputedStyle(transform)` 会持续返回**变更前**
 * 的矩阵（R-82 实测 1024/1280：inline 已是 `translate(100px,218px)`，computed 仍是
 * `matrix(…,-60,218)`，直到交互产生帧才追上）。量测几何前先把待处理过渡推到终态，
 * 得到的就是元素真实的最终矩阵；断言强度不变。
 */
async function readViewportMatrix(locator: Locator): Promise<string> {
  return locator.evaluate((element) => {
    element.getAnimations().forEach((animation) => {
      try {
        animation.finish();
      } catch {
        /* 无限时长的动画无法直接结束，保持原状 */
      }
    });
    return getComputedStyle(element).transform;
  });
}

async function flowCenter(canvas: Locator): Promise<{ x: number; y: number }> {
  return canvas.evaluate((element) => {
    const viewport = element.querySelector<HTMLElement>(".react-flow__viewport");
    if (!viewport) throw new Error("React Flow viewport is missing");
    // 与 readViewportMatrix 同理：先结束待处理的 transform 过渡，再量测几何。
    viewport.getAnimations().forEach((animation) => {
      try {
        animation.finish();
      } catch {
        /* 无限时长的动画无法直接结束，保持原状 */
      }
    });
    const canvasRect = element.getBoundingClientRect();
    const transform = new DOMMatrixReadOnly(getComputedStyle(viewport).transform);
    return {
      x: (canvasRect.width / 2 - transform.e) / transform.a,
      y: (canvasRect.height / 2 - transform.f) / transform.d,
    };
  });
}

async function expectFlowCenter(
  canvas: Locator,
  expected: { x: number; y: number },
) {
  await expect.poll(async () => {
    const current = await flowCenter(canvas);
    return Math.max(Math.abs(current.x - expected.x), Math.abs(current.y - expected.y));
  }).toBeLessThanOrEqual(1);
}

/**
 * 方案 C（R-75 §2）首屏语义：进入工作台是本地空白 tab（nodes=0 && edges=0），
 * 不 bootstrap、也没有 TaskLauncher 浮层（R-76 已删除）。工作台用例断言的是「已开始
 * 项目」的画布/面板机制，因此 before 钩子用真实用户动作完成「首次实质变更」：
 * 从左侧悬浮工具栏的「添加」菜单新建一个图片节点 —— v8 起输入层节点不接受任何入边，
 * v7 的 auto-text 兜底（补 text 节点 + prompt 边）已随三层模型退役，所以这次首变更恰好
 * 落库 1 个 image 节点、0 条边（POST /initial-draft/bootstrap）让项目真正诞生。
 *
 * 已落库草稿/正式项目被启动流程恢复时画布非空，本钩子不重复建节点，保持
 * 「空态不落库、首变更才落库」的单次语义。
 */
async function startFirstProject(page: Page): Promise<void> {
  const nodes = page.locator(".react-flow__node");
  if (await nodes.count() > 0) return;

  // 空态断言（方案 C）：中央 EmptyCanvasCTA 可见、旧 TaskLauncher 浮层（R-76 已删除）
  // 不存在、画布 nodes/edges 皆空；首变更前不允许发起 bootstrap —— 空态必须保持本地。
  const emptyCta = page.getByRole("region", { name: "开始创作" });
  await expect(emptyCta).toBeVisible();
  await expect(emptyCta.getByRole("button", { name: "上传图片开始" })).toBeVisible();
  await expect(
    emptyCta.getByText("从左侧「添加」新建文本 / 图片 / 视频节点，或点击上方按钮上传图片"),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "开始第一个创作任务" })).toHaveCount(0);
  await expect(nodes).toHaveCount(0);
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);

  const bootstrapUrls: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST"
      && new URL(request.url()).pathname === "/api/projects/initial-draft/bootstrap"
    ) {
      bootstrapUrls.push(request.url());
    }
  });
  expect(bootstrapUrls).toEqual([]);

  const bootstrapped = page.waitForResponse((response) => (
    response.request().method() === "POST"
    && new URL(response.url()).pathname === "/api/projects/initial-draft/bootstrap"
  ));
  await addRailNode(page, "图片");
  // v8：一个输入层 image 节点，0 条边（输入节点不接受入边，无 auto-text 兜底）。
  await expect(nodes).toHaveCount(1);
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);
  // 首个实质变更后空态 CTA 退场，且整段过程恰好一次 bootstrap（惰性落库）。
  await expect(emptyCta).toHaveCount(0);
  await expect.poll(() => bootstrapUrls).toHaveLength(1);
  // 落地意图会把焦点放到节点的首个可聚焦控件（图片节点是隐藏的 file input）；
  // 摘掉焦点，避免后续用例的 Cmd+A 被「输入框内快捷键让位原生编辑」规则吞掉。
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  const response = await bootstrapped;
  expect(response.ok(), `首次落库失败：HTTP ${response.status()}`).toBeTruthy();
}

/** 按节点种类取画布节点：React Flow 在 `.react-flow__node` 上暴露 data-id。 */
async function nodeIdOfKind(page: Page, kind: "text" | "image" | "video"): Promise<string> {
  const id = await page.evaluate(async (nodeKind) => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ storeModuleUrl);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((candidate: { id: string }) => candidate.id === state.activeTabId);
    return tab?.nodes.find((node: { data: { kind: string } }) => node.data.kind === nodeKind)?.id ?? null;
  }, kind);
  if (!id) throw new Error(`当前文档里没有 ${kind} 节点`);
  return id;
}

/** 当前文档的节点/边（只读形状），供 INV-1 等价断言使用。 */
async function activeDocumentGraph(page: Page): Promise<{
  nodes: Array<{ id: string; data: { kind: "text" | "image" | "video" } }>;
  edges: Array<{ source: string; target: string; targetHandle: string | null }>;
}> {
  return page.evaluate(async () => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ storeModuleUrl);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((candidate: { id: string }) => candidate.id === state.activeTabId);
    if (!tab) throw new Error("当前没有活动文档");
    return {
      nodes: tab.nodes.map((node: { id: string; data: { kind: string } }) => ({
        id: node.id,
        data: { kind: node.data.kind },
      })),
      edges: tab.edges.map((edge: { source: string; target: string; targetHandle?: string | null }) => ({
        source: edge.source,
        target: edge.target,
        targetHandle: edge.targetHandle ?? null,
      })),
    };
  });
}

/** 左侧悬浮工具栏「添加」工作流：hover 自动弹出菜单，选中即建节点（v8 起替代节点库面板）。 */
async function addRailNode(page: Page, label: "文本" | "图片" | "视频"): Promise<void> {
  const addButton = page.getByRole("button", { name: "添加" });
  await addButton.hover();
  const menu = page.getByRole("menu", { name: "添加" });
  await expect(menu).toBeVisible();
  const item = menu.getByRole("menuitem", { name: label });
  await expect(item).toBeVisible();
  // image 会顺带打开文件选择器；这里显式消化它，避免悬挂。
  await Promise.all([
    page.waitForEvent("filechooser", { timeout: 5_000 }).catch(() => undefined),
    item.click(),
  ]);
}

/**
 * 方案 C 的规范起点：空首屏（本地空 tab、不落库、无 TaskLauncher 浮层）。
 *
 * 隔离库里的初始草稿与页面 sessionStorage 都是跨用例、跨视口共享的：上一个用例的
 * 「设为输入」等动作会把节点写进草稿，下一次 page.goto 就会把它们恢复出来。实测
 * desktop-1280/1024 的「节点库加节点」用例因此读到两个 video 节点（旧草稿里的一个 +
 * 本用例新加的一个），选中态断言打在旧节点上而超时。这里在起点非空时显式回到空首屏：
 * 清本地会话 + 清服务端草稿 + 遮住正式项目列表，再重新加载。
 */
async function resetToEmptyFirstScreen(page: Page): Promise<void> {
  if (await page.locator(".react-flow__node").count() === 0) return;
  const cleared = await page.request.post("/api/projects/initial-draft/force-clear", {
    data: { confirm: true },
  });
  expect(cleared.ok(), await cleared.text()).toBeTruthy();
  await page.evaluate(() => window.sessionStorage.clear());
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ json: [] });
  });
  await page.reload();
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
  await expect(page.getByText(/正在确认运行历史|运行历史同步失败/)).toHaveCount(0);
  await resetToEmptyFirstScreen(page);
  await expect(page.getByText(/正在确认运行历史|运行历史同步失败/)).toHaveCount(0);
  await startFirstProject(page);
});

/**
 * 从项目中心启动一个真实内置模板（v8 的生成节点只能由模板落地的图产生：生成 / 结果节点
 * 不接受手动新增，「添加」菜单只暴露 text / image / video 三个输入层入口）。
 */
async function startBuiltinTemplate(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: "打开项目中心" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await expect(center).toBeVisible();
  await center.getByRole("tab", { name: "内置模板" }).click();
  const panel = center.getByRole("tabpanel", { name: "内置模板" });
  await panel.getByRole("button", { name: new RegExp(`^${name}`) }).click();
  await expect(center).toHaveCount(0);
}

/**
 * 选中画布节点：点击卡片标题栏。页签切换 / 模板落地后的首帧可能吞掉这一次点击，因此以
 * 「工具条是否已渲染」为准重试，而不是盲等固定时长。
 */
async function selectCanvasNode(node: Locator): Promise<void> {
  const header = node.locator(".gc-node-header");
  await expect(header).toBeVisible();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await node.locator("[data-node-toolbar]").count() > 0) return;
    await header.click();
    await node.page().waitForTimeout(150);
  }
  await expect(node.locator("[data-node-toolbar]")).toHaveCount(1);
}

test("generator nodes keep params inline while unverified variants stay blocked with an explicit reason", async ({ page }) => {
  // v8：生成与参数从 v7 的悬浮「功能设置」窗口迁到生成节点卡片内联（plan.md §1.1/§3.3），
  // 输入节点完全不承载生成语义。断言强度落在同一个产品事实上：未受审变体不得触达运行。
  await startBuiltinTemplate(page, "模特试穿");
  await expect(page.locator(".react-flow__node")).toHaveCount(4);
  await expect(page.locator(".react-flow__edge")).toHaveCount(3);

  const generator = page.getByTestId("rf__node-tryon-gen");
  await expect(generator).toBeVisible();
  // 内联参数面板字段顺序：功能 → 模型 → 画幅 + 数量 → 模型参数（plan.md §3.3）。
  const functionSelect = generator.getByRole("combobox", { name: "功能" });
  await expect(functionSelect).toContainText("写实穿搭");
  await expect(functionSelect).toContainText("（未发布）");
  await expect(generator.getByRole("combobox", { name: "模型" })).toContainText("GPT Image 2.5 Flare VIP");
  await expect(generator.getByRole("combobox", { name: "画幅" })).toContainText("3:4");
  await expect(generator.getByRole("combobox", { name: "数量" })).toContainText("1");
  const params = generator.getByRole("region", { name: "模型参数" });
  await expect(params).toBeVisible();
  await expect(params.getByRole("combobox", { name: "画质" })).toBeVisible();
  await expect(params.getByRole("button", { name: "+ 添加参数" })).toBeVisible();
  await expect(
    generator.getByText("目录中的功能都还没有当前版本的受审评估发布快照，运行会被拒绝。"),
  ).toBeVisible();
  // 目录里的未受审变体在「功能」下拉里必须不可选（v7 悬浮窗口的目录强度不变）。
  await generator.getByRole("combobox", { name: "功能" }).click();
  const variantOptions = page.getByRole("option");
  await expect.poll(() => variantOptions.count()).toBeGreaterThan(0);
  await expect.poll(() => variantOptions.evaluateAll((options) => (
    options.filter((option) => option.getAttribute("aria-disabled") === "true").length
  ))).toBeGreaterThan(0);
  await page.keyboard.press("Escape");

  // 运行准入不通过时，卡片内运行按钮为禁用态并给出可读原因（不静默、不隐藏）。
  // 准入按序给出首个阻断原因：这里还没上传参考图，因此先报「缺参考图」；未受审变体
  // 那个原因在参考图就位后接管（见 golden-path 的完整链路）。
  const runButton = generator.getByRole("button", { name: "尚不可运行" });
  await expect(runButton).toBeDisabled();
  await expect(runButton).toHaveAttribute("title", /edit 模式至少需要一张参考图/);

  // 输入层节点不再承载任何生成入口（v7 的「选择功能」已随五合一 image 节点退役）。
  const garment = page.getByTestId("rf__node-garment");
  await expect(garment.getByRole("button", { name: "选择功能" })).toHaveCount(0);
  await expect(garment.getByText("上传图片后可作为参考图来源；生成请用生图节点")).toBeVisible();
  // v7 的悬浮「功能设置」窗口在本版本已退役。
  await expect(page.getByRole("dialog", { name: /功能设置/ })).toHaveCount(0);
});

test("node toolbars follow the v8 per-kind contract and the color tool no longer occupies the rail", async ({ page }) => {
  // plan.md §3.2：工具条仅选中态渲染，内容按 kind 互不雷同；R-88 把色彩工具从左侧 Rail
  // 移入 text 节点工具条。
  await addRailNode(page, "文本");
  const textNodeId = await nodeIdOfKind(page, "text");
  const textNode = page.locator(`.react-flow__node[data-id="${textNodeId}"]`);
  await expect(textNode.locator('[data-node-toolbar="text"]')).toBeVisible();
  await expect(textNode.getByRole("button", { name: "色彩工具" })).toBeVisible();
  await expect(textNode.getByRole("button", { name: "复制" })).toBeVisible();
  // 未选中节点不渲染工具条（不占 DOM）。
  const imageNodeId = await nodeIdOfKind(page, "image");
  const imageNode = page.locator(`.react-flow__node[data-id="${imageNodeId}"]`);
  await expect(imageNode.locator('[data-node-toolbar="image"]')).toHaveCount(0);

  await selectCanvasNode(imageNode);
  const imageToolbar = imageNode.locator('[data-node-toolbar="image"]');
  await expect(imageToolbar).toBeVisible();
  await expect(imageToolbar).toHaveAttribute("aria-label", "图片工具栏");
  // 未上传图片时「裁剪 / 抠图」保持可见但禁用，并给出原因（不隐藏）。
  const crop = imageNode.getByRole("button", { name: "裁剪" });
  await expect(crop).toBeDisabled();
  await expect(crop).toHaveAttribute("title", /图片裁剪能力尚未接入/);
  await expect(imageNode.getByRole("button", { name: "抠图" })).toBeDisabled();
  await expect(imageNode.getByRole("button", { name: "复制" })).toBeEnabled();
  await expect(imageNode.getByRole("button", { name: "替换" })).toBeEnabled();

  // 色彩工具已从 Rail 移除，只保留在文本节点工具条内。
  const rail = page.getByRole("navigation", { name: "工作台左侧工具" });
  await expect(rail.getByRole("button", { name: "色彩工具" })).toHaveCount(0);

  // 生成节点工具条：[功能选项] [运行] [复制]（复制尚未接入 → 禁用并给出原因）。
  await startBuiltinTemplate(page, "模特试穿");
  const generator = page.getByTestId("rf__node-tryon-gen");
  await selectCanvasNode(generator);
  const generatorToolbar = generator.locator('[data-node-toolbar="image-generator"]');
  await expect(generatorToolbar).toHaveAttribute("aria-label", "生图工具栏");
  await expect(generatorToolbar.getByRole("button", { name: "功能选项" })).toBeEnabled();
  await expect(generatorToolbar.getByRole("button", { name: "运行", exact: true })).toBeEnabled();
  const generatorCopy = generatorToolbar.getByRole("button", { name: "复制" });
  await expect(generatorCopy).toBeDisabled();
  await expect(generatorCopy).toHaveAttribute("title", /生成 \/ 结果节点的创建尚未接入/);
});

test("project center separates built-in and user templates and keeps template actions reachable", async ({ page }, testInfo) => {
  const templateName = `E2E 我的模板 ${testInfo.project.name}`;
  const createResponse = await page.request.post("/api/templates", {
    data: {
      name: templateName,
      description: "验证我的模板入口、保存入口与删除确认层级",
      flow: {
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
        nodes: [],
        edges: [],
      },
    },
  });
  expect(createResponse.ok(), await createResponse.text()).toBeTruthy();

  await page.getByRole("button", { name: "打开项目中心" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await expect(center).toBeVisible();

  await center.getByRole("tab", { name: "内置模板" }).click();
  await expect(center.getByText("模特试穿", { exact: true })).toBeVisible();
  await expect(center.getByText(templateName)).toHaveCount(0);

  await center.getByRole("tab", { name: "我的模板" }).click();
  await expect(center.getByRole("button", { name: "保存当前画布为模板" })).toBeVisible();
  await expect(center.getByText(templateName)).toBeVisible();
  await expect(center.getByText("模特试穿")).toHaveCount(0);

  await center.getByRole("button", { name: "保存当前画布为模板" }).click();
  const saveDialog = page.getByRole("dialog", { name: "存为模板" });
  await expect(saveDialog).toBeVisible();
  await saveDialog.getByRole("button", { name: "取消" }).click();
  await expect(saveDialog).toBeHidden();

  await center.getByRole("button", { name: `管理模板 ${templateName}` }).click();
  await page.getByRole("menuitem", { name: "删除模板" }).click();
  const deleteDialog = page.getByRole("alertdialog", { name: `删除“${templateName}”？` });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole("button", { name: "保留模板" }).click();
  await expect(deleteDialog).toBeHidden();
  await expect(center.getByText(templateName)).toBeVisible();
});

test("project center keeps projects usable when template loading fails", async ({ page }) => {
  await page.route("**/api/templates", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 500, json: { error: "template fixture unavailable" } });
      return;
    }
    await route.fallback();
  });

  await page.getByRole("button", { name: "打开项目中心" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await expect(center).toBeVisible();
  await expect(center.getByRole("button", { name: "新建项目" })).toBeVisible();
  await expect(center.getByRole("alert")).toContainText("模板 HTTP 500");
  await expect(center.getByText("正在加载模板")).toHaveCount(0);
});

test("results and project center follow desktop density for cards", async ({ page }) => {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Desktop viewport is required");
  const expectedProjectColumns = viewport.width >= 1280 ? 4 : 3;

  await page.route("**/api/history*", async (route) => {
    const method = route.request().method();
    const pathname = new URL(route.request().url()).pathname;
    if (method !== "GET") {
      await route.fallback();
      return;
    }
    if (pathname === "/api/history/active") {
      await route.fulfill({
        json: { records: [], nextCursor: null, hasMore: false },
      });
      return;
    }
    await route.fulfill({
      json: { records: RESULTS_DENSITY_FIXTURES, nextCursor: null, hasMore: false },
    });
  });
  await page.route("**/api/projects", (route) => {
    if (route.request().method() !== "GET") {
      route.fallback();
      return;
    }
    route.fulfill({ json: PROJECT_CENTER_PROJECT_FIXTURES });
  });
  await page.route("**/api/templates", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: PROJECT_CENTER_TEMPLATE_FIXTURES });
      return;
    }
    await route.fallback();
  });

  await page.reload();
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();

  const contextToggle = page.getByRole("button", { name: "属性 / 结果" });
  await contextToggle.click();
  await page.getByRole("tab", { name: "结果 / 记录" }).click();
  const resultsRegion = page.getByRole("region", { name: "最近生成" });
  await expect(resultsRegion).toBeVisible();

  const resultsGrid = resultsRegion.locator("div.grid.grid-cols-2.gap-2");
  await expect(resultsGrid).toHaveCount(1);
  await expectGridColumns(resultsGrid, 2);

  const resultsScroller = resultsRegion.locator(".overflow-y-auto");
  const resultCards = resultsGrid.locator(":scope > *");
  const visibleResults = await resultCards.count();
  expect(visibleResults).toBeGreaterThanOrEqual(1);
  await expect(resultsRegion.getByRole("img", { name: "超长成功结果卡片标题 · 用于验证双列布局下动作按钮可读性" })).toBeVisible();
  await expect(resultsRegion).toContainText("失败结果测试");
  await expect(resultsRegion).toContainText("未知状态结果测试");
  const firstSuccessCard = resultsGrid.locator("article").first();
  await expect(firstSuccessCard).toBeVisible();
  await firstSuccessCard.hover();
  const compareButton = firstSuccessCard.locator('button[title="加入对比"]');
  const viewButton = firstSuccessCard.locator('button[title="查看"]');
  const downloadButton = firstSuccessCard.locator('a[title="下载"]');
  const applyButton = firstSuccessCard.locator('button[title="设为输入"]');
  await expect(compareButton).toBeVisible();
  await expect(viewButton).toBeVisible();
  await expect(downloadButton).toBeVisible();
  await expect(applyButton).toBeVisible();

  const resultsRect = await rect(resultsScroller);
  await expectInside(await rect(firstSuccessCard), resultsRect);

  await viewButton.click();
  const viewerHint = page.getByText(/滚轮缩放 100%/);
  await expect(viewerHint).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewerHint).toBeHidden();

  await compareButton.click();
  await expect(firstSuccessCard.locator('button[title="取消对比"]')).toBeVisible();

  const download = page.waitForEvent("download");
  await downloadButton.click();
  await download;

  const nodeCountBeforeApply = await page.locator(".react-flow__node").count();
  await applyButton.click();
  await expect(page.locator(".react-flow__node")).toHaveCount(nodeCountBeforeApply + 1);
  await page.getByRole("tab", { name: "结果 / 记录" }).click();
  await expect(resultsRegion).toBeVisible();

  const themes = [
    { label: "简白", id: "white" },
    { label: "护眼绿", id: "eye" },
    { label: "曜黑·荧光绿", id: "current" },
  ];
  for (const theme of themes) {
    const themeTrigger = page.getByRole("button", { name: /^切换主题，当前为/ });
    await themeTrigger.click();
    await page.getByRole("menuitemradio", { name: new RegExp(`^${theme.label}`) }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme.id);
    await expectGridColumns(resultsGrid, 2);

    await page.getByRole("button", { name: "打开项目中心" }).click();
    const center = page.getByRole("dialog", { name: "项目中心" });
    await expect(center).toBeVisible();
    const sectionGrid = (name: string) => (
      center.getByRole("tabpanel", { name }).locator(":scope > .grid").first()
    );

    await center.getByRole("tab", { name: "最近项目" }).click();
    const recentGrid = sectionGrid("最近项目");
    await expectGridColumns(recentGrid, expectedProjectColumns);
    if (theme.id === "white") {
      await expectTwoLineTitle(center.getByText(PROJECT_CENTER_PROJECT_FIXTURES[0].name, { exact: true }));
      const projectCardHeights = await center.getByRole("button", { name: /^超长项目名称/ }).evaluateAll(
        (elements) => elements.map((element) => element.getBoundingClientRect().height),
      );
      expect(projectCardHeights).toHaveLength(PROJECT_CENTER_PROJECT_FIXTURES.length);
      expect(Math.max(...projectCardHeights) - Math.min(...projectCardHeights)).toBeLessThanOrEqual(1);
    }

    await center.getByRole("tab", { name: "内置模板" }).click();
    const builtinTemplatesGrid = sectionGrid("内置模板");
    await expectGridColumns(builtinTemplatesGrid, expectedProjectColumns);
    if (theme.id === "white") {
      await expectTwoLineTitle(center.getByText(PROJECT_CENTER_TEMPLATE_FIXTURES[0].name, { exact: true }));
    }

    await center.getByRole("tab", { name: "我的模板" }).click();
    const myTemplatesGrid = sectionGrid("我的模板");
    await expectGridColumns(myTemplatesGrid, expectedProjectColumns);
    if (theme.id === "white") {
      await expectTwoLineTitle(center.getByText(PROJECT_CENTER_TEMPLATE_FIXTURES[2].name, { exact: true }));
    }

    // Read the named panel's grid and children atomically: during a Base UI tab
    // transition a generic "first tabpanel" locator can re-resolve to the outgoing
    // panel between separate visibility and geometry reads.
    await expect.poll(async () => myTemplatesGrid.evaluate((grid) => {
      const gridRect = grid.getBoundingClientRect();
      const cards = Array.from(grid.children).slice(0, 8);
      return cards.length > 0 && cards.every((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardStyle = getComputedStyle(card);
        const visible = cardRect.width > 0
          && cardRect.height > 0
          && cardStyle.visibility !== "hidden";
        return visible
          && cardRect.left >= gridRect.left - 1
          && cardRect.right <= gridRect.right + 1
          && cardRect.top >= gridRect.top - 1
          && cardRect.bottom <= gridRect.bottom + 1;
      });
    })).toBe(true);
    await center.getByRole("button", { name: "关闭项目中心" }).click();
  }
});

test("adding a node from the rail keeps the canvas mounted and adds no implicit edges", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const canvas = page.getByRole("application", { name: "工作流画布" });
  const originalCanvas = await canvas.elementHandle();
  const nodes = page.locator(".react-flow__node");
  const edges = page.locator(".react-flow__edge");
  const initialNodeCount = await nodes.count();
  const initialEdgeCount = await edges.count();
  expect(initialEdgeCount).toBe(0);

  // v8：「添加」菜单直接从左侧悬浮工具栏落地输入层节点（节点库面板下线），并且不再有
  // v7 的 auto-text 兜底——输入层节点不接受任何入边，所以加节点不会带来任何边。
  const imageNodeId = await nodeIdOfKind(page, "image");
  await page.locator(`.react-flow__node[data-id="${imageNodeId}"]`).locator(".gc-node-header").click();
  const addButton = page.getByRole("button", { name: "添加" });
  await addButton.hover();
  const addMenu = page.getByRole("menu", { name: "添加" });
  await expect(addMenu).toBeVisible();
  // 「添加」菜单固定暴露文本 / 图片 / 视频三个基础节点入口（生成 / 结果节点不可手动新增）。
  for (const label of ["文本", "图片", "视频"]) {
    await expect(addMenu.getByRole("menuitem", { name: label })).toBeVisible();
  }
  await addMenu.getByRole("menuitem", { name: "视频" }).click();

  await expect(nodes).toHaveCount(initialNodeCount + 1);
  await expect(edges).toHaveCount(initialEdgeCount);
  const graph = await activeDocumentGraph(page);
  expect(missingTextUpstreamNodeIds(graph.nodes, graph.edges)).toEqual([]);

  const videoNodeId = await nodeIdOfKind(page, "video");
  const videoNode = page.locator(`.react-flow__node[data-id="${videoNodeId}"]`);
  await expect(videoNode.getByText("作为参考素材来源：连到生成节点的输入柄")).toBeVisible();
  // 视频输入槽尚未接入上传能力：槽位保留并显式给出原因（不隐藏、不静默）。
  await expect(videoNode.getByText("暂不可用：视频上传接口尚未接入")).toBeVisible();
  // 工具条只在选中态渲染：新落地的视频节点即选中态，被覆盖的图片节点工具条退场。
  await expect(videoNode.locator('[data-node-toolbar="video"]')).toBeVisible();
  await expect(
    page.locator(`.react-flow__node[data-id="${imageNodeId}"]`).locator('[data-node-toolbar="image"]'),
  ).toHaveCount(0);
  await expect(canvas).toBeVisible();
  expect(await canvas.evaluate((current, original) => current === original, originalCanvas)).toBe(true);
  await expect(page.getByText("页面出现异常")).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test("node drag is one undo transaction and selection stays canonical", async ({ page }) => {
  const modifier = process.platform === "darwin" ? "Meta" : "Control";
  const nodes = page.locator(".react-flow__node");
  const selectedNodes = page.locator(".react-flow__node.selected");
  const node = nodes.first();
  const initialNodeCount = await nodes.count();
  const nodeHeader = node.locator(".gc-node-header");
  const pane = page.locator(".react-flow__pane");

  await expect(node).toBeVisible();
  await expect(nodeHeader).toBeVisible();

  // 悬停反馈不得移动节点；否则 React Flow 加上 dragging 类时会瞬间跳回原位。
  await nodeHeader.hover();
  await expect.poll(
    () => node.evaluate((element) => getComputedStyle(element).translate),
  ).toBe("none");

  // React Flow 的 .selected 投影必须与 store 的 canonical selection 同步。
  await nodeHeader.click();
  await expect(node).toHaveClass(/\bselected\b/);
  await expect(selectedNodes).toHaveCount(1);

  // 全选、复制与粘贴共用 canonical selection。批量粘贴只形成一次撤销记录。
  await page.keyboard.press(`${modifier}+a`);
  await expect(selectedNodes).toHaveCount(initialNodeCount);
  await page.keyboard.press(`${modifier}+c`);
  await page.keyboard.press(`${modifier}+v`);
  await expect(nodes).toHaveCount(initialNodeCount * 2);
  await expect(selectedNodes).toHaveCount(initialNodeCount);
  await page.keyboard.press(`${modifier}+z`);
  await expect(nodes).toHaveCount(initialNodeCount);
  await expect(selectedNodes).toHaveCount(0);

  // 主修饰键 + D 复用同一原子批量复制路径。
  await page.keyboard.press(`${modifier}+a`);
  await page.keyboard.press(`${modifier}+d`);
  await expect(nodes).toHaveCount(initialNodeCount * 2);
  await expect(selectedNodes).toHaveCount(initialNodeCount);
  await page.keyboard.press(`${modifier}+z`);
  await expect(nodes).toHaveCount(initialNodeCount);
  await expect(selectedNodes).toHaveCount(0);
  await nodeHeader.click();
  await expect(selectedNodes).toHaveCount(1);

  const paneBox = await pane.boundingBox();
  if (!paneBox) throw new Error("React Flow pane is missing");
  await page.mouse.click(paneBox.x + paneBox.width - 80, paneBox.y + 80);
  await expect(selectedNodes).toHaveCount(0);

  const start = await node.boundingBox();
  const startTransform = await node.evaluate((element) => (element as HTMLElement).style.transform);
  const handle = await nodeHeader.boundingBox();
  if (!start || !handle) throw new Error("Initial workflow node is missing");
  const dragDelta = { x: 160, y: 90 };
  const pointer = {
    x: handle.x + Math.min(24, handle.width / 2),
    y: handle.y + handle.height / 2,
  };

  await page.mouse.move(pointer.x, pointer.y);
  await page.mouse.down();
  await page.mouse.move(pointer.x + dragDelta.x, pointer.y + dragDelta.y, { steps: 12 });
  // React Flow 通过 rAF 异步落地最后一次 position change；`mouse.move` 返回时最后一帧的
  // transform 可能尚未写入 DOM，此刻采样 boundingBox 会读到差一步（160/12≈13px、90/12≈7px）
  // 的旧位置，把「最后一帧位移」误判成释放瞬间的跳变。等两帧再采样「释放前」位置。
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  const beforeRelease = await node.boundingBox();
  const viewportBeforeRelease = await readViewportMatrix(page.locator(".react-flow__viewport"));
  if (!beforeRelease) throw new Error("Dragged workflow node disappeared before pointer release");
  await page.mouse.up();
  const immediatelyAfterRelease = await node.boundingBox();
  await page.waitForTimeout(250);
  const settledAfterRelease = await node.boundingBox();
  const viewportAfterRelease = await readViewportMatrix(page.locator(".react-flow__viewport"));
  if (!immediatelyAfterRelease || !settledAfterRelease) {
    throw new Error("Dragged workflow node disappeared after pointer release");
  }
  expect(Math.abs(immediatelyAfterRelease.x - beforeRelease.x)).toBeLessThan(1);
  expect(Math.abs(immediatelyAfterRelease.y - beforeRelease.y)).toBeLessThan(1);
  expect(Math.abs(settledAfterRelease.x - beforeRelease.x)).toBeLessThan(1);
  expect(Math.abs(settledAfterRelease.y - beforeRelease.y)).toBeLessThan(1);
  expect(viewportAfterRelease).toBe(viewportBeforeRelease);

  // React Flow 会先跨过内部拖拽阈值，最终位移无需等于指针位移，但必须明显移动。
  await expect.poll(async () => {
    const box = await node.boundingBox();
    return box ? Math.round(box.x - start.x) : 0;
  }).toBeGreaterThan(100);
  await expect.poll(async () => {
    const box = await node.boundingBox();
    return box ? Math.round(box.y - start.y) : 0;
  }).toBeGreaterThan(50);
  const end = await node.boundingBox();
  if (!end) throw new Error("Dragged workflow node is missing");
  const endTransform = await node.evaluate((element) => (element as HTMLElement).style.transform);
  expect(endTransform).not.toBe(startTransform);

  // 尽管鼠标产生多个 position change，一次撤销必须完整返回拖拽前位置。
  await page.keyboard.press(`${modifier}+z`);
  await expect.poll(
    () => node.evaluate((element) => (element as HTMLElement).style.transform),
  ).toBe(startTransform);

  await page.keyboard.press(process.platform === "darwin" ? `${modifier}+Shift+z` : `${modifier}+y`);
  await expect.poll(
    () => node.evaluate((element) => (element as HTMLElement).style.transform),
  ).toBe(endTransform);

  // 还原到拖拽前位置：拖拽/撤销/重做会持久化节点位置，若不还原，后续视口的
  // 用例会读到被拖动的节点（位置漂移甚至与相邻节点重叠，使 header hover 被拦截）。
  await page.keyboard.press(`${modifier}+z`);
  await expect.poll(
    () => node.evaluate((element) => (element as HTMLElement).style.transform),
  ).toBe(startTransform);
});

test("dragging a node near the canvas edge never auto-pans the viewport", async ({ page }) => {
  const node = page.locator(".react-flow__node").first();
  const nodeHeader = node.locator(".gc-node-header");
  const pane = page.locator(".react-flow__pane");
  const viewport = page.locator(".react-flow__viewport");

  await expect(nodeHeader).toBeVisible();
  // 先结束待处理的 transform 过渡：headless 无帧时 computed 矩阵会停在过渡起点（见
  // readViewportMatrix 注释），那会让下面量到的节点/画布几何整体偏移一个 Dock 宽度。
  await readViewportMatrix(viewport);

  const handle = await nodeHeader.boundingBox();
  const paneBox = await pane.boundingBox();
  if (!handle || !paneBox) throw new Error("Workflow node or React Flow pane is missing");

  const initialTransform = await node.evaluate((element) => (element as HTMLElement).style.transform);
  const initialViewport = await readViewportMatrix(viewport);
  await page.mouse.move(handle.x + Math.min(24, handle.width / 2), handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(paneBox.x + paneBox.width - 8, handle.y + handle.height / 2, { steps: 16 });
  await page.waitForTimeout(250);
  const viewportWhileDragging = await readViewportMatrix(viewport);
  await page.mouse.up();
  await page.waitForTimeout(100);
  const viewportAfterRelease = await readViewportMatrix(viewport);

  expect(viewportWhileDragging).toBe(initialViewport);
  expect(viewportAfterRelease).toBe(initialViewport);

  // 还原被拖到边缘的节点：该用例把节点拖到画布右缘后并不需要保留位置，若不撤销，
  // 会污染后续用例（节点漂移到边缘、与相邻节点重叠，导致后续 header hover 被拦截）。
  await page.keyboard.press(process.platform === "darwin" ? "Meta+z" : "Control+z");
  await expect.poll(
    () => node.evaluate((element) => (element as HTMLElement).style.transform),
  ).toBe(initialTransform);
});

test("left dock and horizontal zoom controls preserve canvas identity, geometry, focus, and results", async ({ page }, testInfo) => {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Desktop viewport is required");
  const modifier = process.platform === "darwin" ? "Meta" : "Control";

  const contextToggle = page.getByRole("button", { name: "属性 / 结果" });
  const floatingRail = page.getByRole("navigation", { name: "工作台左侧工具" });
  const dock = page.locator('aside[aria-label="工作台左侧面板"]');
  const contextPanel = page.locator("#workbench-inspector-panel");
  const canvas = page.getByRole("application", { name: "工作流画布" });
  const zoomControls = page.getByTestId("canvas-zoom-controls");
  const zoomSlider = page.getByRole("slider", { name: "画布缩放比例" });
  const zoomOutput = zoomControls.locator("output");
  const originalCanvas = await canvas.elementHandle();
  if (!originalCanvas) throw new Error("Canvas element is missing");
  const originalTransform = await readViewportMatrix(page.locator(".react-flow__viewport"));
  const originalFlowCenter = await flowCenter(canvas);
  await expect(contextToggle).toHaveAttribute("aria-expanded", "false");
  await expect(dock).toHaveAttribute("aria-hidden", "true");
  await expectInert(dock, true);
  await expectWidth(dock, 0);
  await expect(floatingRail).toBeVisible();
  await expectWidth(canvas, viewport.width);

  const closedCanvasRect = await rect(canvas);
  const zoomControlsRect = await rect(zoomControls);
  expectInside(zoomControlsRect, closedCanvasRect);
  expect(zoomControlsRect.width).toBeGreaterThan(zoomControlsRect.height * 3);
  await expect(zoomOutput).toHaveText("100%");
  await zoomSlider.fill("125");
  await expect(zoomOutput).toHaveText("125%");
  await zoomSlider.fill("100");
  await expect(zoomOutput).toHaveText("100%");

  await page.keyboard.press(`${modifier}+=`);
  await expect(zoomOutput).toHaveText("120%");
  await page.keyboard.press(`${modifier}+-`);
  await expect(zoomOutput).toHaveText("100%");

  const shortcutTrigger = page.getByRole("button", { name: "查看快捷键" });
  const shortcutMenu = page.locator("#workbench-shortcuts");
  await shortcutTrigger.click();
  await expect(shortcutMenu).toBeVisible();
  await expectWidth(shortcutMenu, 224);
  await expect(shortcutMenu).toContainText(process.platform === "darwin" ? "macOS" : "Windows");
  await expect(shortcutMenu).toContainText("移动画布");
  await expect(shortcutMenu).toContainText(process.platform === "darwin" ? "⌘ +" : "Ctrl +");
  await expect(shortcutMenu).toContainText(process.platform === "darwin" ? "⇧⌘ Z" : "Ctrl Y");
  await page.keyboard.press("Escape");
  await expect(shortcutMenu).toBeHidden();
  await expect(shortcutTrigger).toBeFocused();

  // 属性与结果迁移到唯一左侧 Dock，不能覆盖横向缩放条或 MiniMap。
  await contextToggle.click();
  await expect(contextToggle).toBeFocused();
  await expect(contextToggle).toHaveAttribute("aria-expanded", "true");
  await expect(dock).toHaveAttribute("aria-hidden", "false");
  await expectInert(dock, false);
  await expect(contextPanel).toHaveAttribute("aria-hidden", "false");
  await expectInert(contextPanel, false);
  await expectWidth(dock, 320);
  await expectWidth(canvas, viewport.width - 320);

  const contextCanvasRect = await rect(canvas);
  expect(Math.abs((await rect(dock)).right - contextCanvasRect.left)).toBeLessThanOrEqual(1);
  expectInside(await rect(zoomControls), contextCanvasRect);
  const contextMinimap = page.locator(".react-flow__minimap");
  const contextMinimapRect = await rect(contextMinimap);
  expectInside(contextMinimapRect, contextCanvasRect);
  // 响应式 minimap 宽度经 ResizeObserver → setState → 重渲染才收敛，须等待而非同步断言。
  await expect.poll(async () => (await rect(contextMinimap)).width)
    .toBe(contextCanvasRect.width < 760 ? 128 : 200);
  await expectFlowCenter(canvas, originalFlowCenter);

  // 两个 Tab Panel 必须保持挂载；切换与 Dock 关闭不能丢失 Results DOM/滚动状态。
  const propertiesTab = page.getByRole("tab", { name: "属性" });
  const resultsTab = page.getByRole("tab", { name: "结果 / 记录" });
  const propertiesPanelId = await propertiesTab.getAttribute("aria-controls");
  const resultsPanelId = await resultsTab.getAttribute("aria-controls");
  if (!propertiesPanelId || !resultsPanelId) throw new Error("Context tabs are missing aria-controls");
  const propertiesPanel = page.locator(`[id="${propertiesPanelId}"]`);
  const resultsPanel = page.locator(`[id="${resultsPanelId}"]`);
  await expect(propertiesPanel).toHaveCount(1);
  await expect(resultsPanel).toHaveCount(1);
  await expect(propertiesPanel).toBeVisible();
  await expect(resultsPanel).toBeHidden();
  await expect(propertiesTab).toHaveAttribute("aria-selected", "true");

  await propertiesTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(resultsTab).toBeFocused();
  await expect(resultsTab).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("Enter");
  await expect(resultsTab).toHaveAttribute("aria-selected", "true");
  await expect(propertiesTab).toHaveAttribute("aria-selected", "false");
  await expect(resultsPanel).toBeVisible();
  await expect(propertiesPanel).toBeHidden();

  const resultsRegion = page.getByRole("region", { name: "最近生成" });
  await expect(resultsRegion).toContainText("运行 AI 节点后，生成结果与运行记录会汇总在这里");
  const originalResultsRegion = await resultsRegion.elementHandle();
  if (!originalResultsRegion) throw new Error("Results region is missing");
  const resultsScroller = resultsRegion.locator(".overflow-y-auto");
  await resultsScroller.evaluate((element) => {
    const filler = document.createElement("div");
    filler.dataset.e2eScrollFiller = "true";
    filler.style.height = "1000px";
    element.appendChild(filler);
    element.scrollTop = 37;
  });
  await expect.poll(async () => resultsScroller.evaluate((element) => element.scrollTop)).toBe(37);

  await propertiesTab.click();
  await expect(propertiesPanel).toBeVisible();
  await expect(resultsPanel).toBeHidden();
  await resultsTab.click();
  await expect(resultsPanel).toBeVisible();
  expect(await resultsRegion.evaluate((current, original) => current === original, originalResultsRegion)).toBe(true);
  await expect.poll(async () => resultsScroller.evaluate((element) => element.scrollTop)).toBe(37);

  await contextToggle.click();
  await expect(dock).toHaveAttribute("aria-hidden", "true");
  await expectInert(dock, true);
  await expectWidth(dock, 0);
  await expectWidth(canvas, viewport.width);
  await page.keyboard.press("Shift+Tab");
  const contextClosedFocus = await contextPanel.evaluate((panel) => ({
    inside: panel.contains(document.activeElement),
    tag: document.activeElement?.tagName,
  }));
  expect(contextClosedFocus.inside).toBe(false);
  expect(contextClosedFocus.tag).not.toBe("BODY");

  await contextToggle.click();
  await expect(resultsPanel).toBeVisible();
  expect(await resultsRegion.evaluate((current, original) => current === original, originalResultsRegion)).toBe(true);
  await expect.poll(async () => resultsScroller.evaluate((element) => element.scrollTop)).toBe(37);

  // v8：左侧工具栏只有「属性 / 结果」一个面板入口；节点库面板已下线，
  // 加节点改由「添加」工作流菜单直接完成（见上方 library-node 用例）。
  await expect(contextToggle).toHaveAttribute("aria-expanded", "true");
  await expect(dock).toHaveAttribute("aria-hidden", "false");
  await expectInert(dock, false);
  await expect(contextPanel).toHaveAttribute("aria-hidden", "false");
  await expectInert(contextPanel, false);
  await expectWidth(dock, 320);
  await expectWidth(canvas, viewport.width - 320);
  const sessionBeforeDomFocus = await page.evaluate(() => (
    window.sessionStorage.getItem("garment-canvas-project-tabs")
  ));
  await contextToggle.focus();
  await expect.poll(() => page.evaluate(() => (
    window.sessionStorage.getItem("garment-canvas-project-tabs")
  ))).toBe(sessionBeforeDomFocus);

  const canvasRect = await rect(canvas);
  expect(Math.abs((await rect(dock)).right - canvasRect.left)).toBeLessThanOrEqual(1);
  expectInside(await rect(zoomControls), canvasRect);
  const minimap = page.locator(".react-flow__minimap");
  const minimapRect = await rect(minimap);
  expectInside(minimapRect, canvasRect);
  await expect.poll(async () => (await rect(minimap)).width)
    .toBe(canvasRect.width < 760 ? 128 : 200);
  await expectFlowCenter(canvas, originalFlowCenter);

  // 模板浮层必须按当前 Dock 后的中心宽度收缩，不能被画布容器裁切。
  const releaseTemplateSaves: Array<() => void> = [];
  const templateSaveGates = Array.from({ length: 3 }, () => new Promise<void>((resolve) => {
    releaseTemplateSaves.push(resolve);
  }));
  let resolveFailedOldRequest: (() => void) | undefined;
  const failedOldRequestHandled = new Promise<void>((resolve) => {
    resolveFailedOldRequest = resolve;
  });
  let templateSaveRequestIndex = 0;
  await page.route("**/api/templates", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: TEMPLATE_FIXTURES });
      return;
    }
    if (route.request().method() === "POST") {
      const requestIndex = templateSaveRequestIndex++;
      await templateSaveGates[requestIndex];
      if (requestIndex === 1) {
        await route.abort("failed");
        resolveFailedOldRequest?.();
        return;
      }
      await route.fulfill({ status: 201, json: TEMPLATE_FIXTURES[0] });
      return;
    }
    await route.fallback();
  });
  const projectCenterToggle = page.getByRole("button", { name: "打开项目中心" });
  await projectCenterToggle.click();
  const projectCenter = page.getByRole("dialog", { name: "项目中心" });
  await expect(projectCenter).toBeVisible();
  await projectCenter.getByRole("tab", { name: "我的模板" }).click();
  await expect(projectCenter.getByRole("button", { name: "保存当前画布为模板" })).toBeVisible();
  const projectCenterRect = await rect(projectCenter);
  expect(projectCenterRect.left).toBeGreaterThanOrEqual(39);
  expect(projectCenterRect.right).toBeLessThanOrEqual(viewport.width - 39);
  await testInfo.attach(`desktop-${viewport.width}-dock-layout-template`, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  const saveTemplateButton = projectCenter.getByRole("button", { name: "保存当前画布为模板" });
  await saveTemplateButton.click();
  const saveTemplateDialog = page.getByRole("dialog", { name: "存为模板" });
  await expect(saveTemplateDialog).toBeVisible();
  const saveTemplateName = saveTemplateDialog.getByRole("textbox", { name: "名称" });
  const submitTemplate = saveTemplateDialog.getByRole("button", { name: /^保存/ });
  await expect(saveTemplateName).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(submitTemplate).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(saveTemplateName).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(saveTemplateDialog).toHaveCount(0);
  await expect(projectCenter).toBeVisible();
  await expect(saveTemplateButton).toBeFocused();

  // 已关闭会话的延迟响应不得关闭或改写后来重新打开的表单。
  await saveTemplateButton.click();
  await saveTemplateName.fill("旧会话模板");
  const oldSaveResponse = page.waitForResponse((response) => (
    response.request().method() === "POST" &&
    response.request().postData()?.includes("旧会话模板") === true
  ));
  await submitTemplate.click();
  await expect(submitTemplate).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(saveTemplateDialog).toHaveCount(0);
  await saveTemplateButton.click();
  await expect(saveTemplateName).toHaveValue("");
  await saveTemplateName.fill("新会话模板");
  releaseTemplateSaves[0]();
  await oldSaveResponse;
  await expect(saveTemplateDialog).toBeVisible();
  await expect(saveTemplateName).toHaveValue("新会话模板");
  await expect(submitTemplate).toBeEnabled();
  await expect(saveTemplateDialog.locator(".text-red-400")).toHaveCount(0);

  // 旧网络异常的 catch/finally 也不能污染仍在提交的新会话。
  await saveTemplateName.fill("失败旧会话");
  const failedOldSaveRequest = page.waitForRequest((request) => (
    request.method() === "POST" && request.postData()?.includes("失败旧会话") === true
  ));
  await submitTemplate.click();
  await failedOldSaveRequest;
  await expect(submitTemplate).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(saveTemplateDialog).toHaveCount(0);
  await saveTemplateButton.click();
  await saveTemplateName.fill("并发新会话");
  const currentSaveResponse = page.waitForResponse((response) => (
    response.request().method() === "POST" &&
    response.request().postData()?.includes("并发新会话") === true
  ));
  await submitTemplate.click();
  await expect(submitTemplate).toBeDisabled();
  releaseTemplateSaves[1]();
  await failedOldRequestHandled;
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  await expect(saveTemplateDialog).toBeVisible();
  await expect(saveTemplateName).toHaveValue("并发新会话");
  await expect(submitTemplate).toBeDisabled();
  await expect(saveTemplateDialog.locator(".text-red-400")).toHaveCount(0);
  releaseTemplateSaves[2]();
  await currentSaveResponse;
  await expect(saveTemplateDialog).toHaveCount(0);
  await expect(saveTemplateButton).toBeFocused();
  await projectCenter.getByRole("button", { name: "关闭项目中心" }).click();
  await expect(projectCenter).toHaveCount(0);
  await expect(projectCenterToggle).toBeFocused();

  await resultsScroller.locator("[data-e2e-scroll-filler='true']").evaluate((element) => element.remove());
  await page.mouse.move(canvasRect.left + canvasRect.width / 2, canvasRect.top + 20);
  await page.waitForTimeout(300);

  await testInfo.attach(`desktop-${viewport.width}-dock-layout`, {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  await contextToggle.click();
  await expect(contextToggle).toBeFocused();
  await expect(dock).toHaveAttribute("aria-hidden", "true");
  await expectInert(dock, true);
  await expectWidth(dock, 0);
  await expectWidth(canvas, viewport.width);
  await page.keyboard.press("Tab");
  expect(await contextPanel.evaluate((panel) => panel.contains(document.activeElement))).toBe(false);

  expect(await canvas.evaluate((current, original) => current === original, originalCanvas)).toBe(true);
  await expect.poll(
    () => readViewportMatrix(page.locator(".react-flow__viewport")),
  ).toBe(originalTransform);
});

test("theme picker reports state and restores focus", async ({ page }) => {
  const choices = [
    { label: "简白", id: "white" },
    { label: "护眼绿", id: "eye" },
    { label: "曜黑·荧光绿", id: "current" },
  ];

  for (const choice of choices) {
    const trigger = page.getByRole("button", { name: /^切换主题，当前为/ });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("menuitemradio", { name: new RegExp(`^${choice.label}`) }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", choice.id);
    const updatedTrigger = page.getByRole("button", { name: `切换主题，当前为${choice.label}` });
    await expect(updatedTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#theme-picker-options")).toHaveCount(0);
    await expect(updatedTrigger).toBeFocused();
  }

  const trigger = page.getByRole("button", { name: /^切换主题，当前为/ });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("menuitemradio", { name: /^简白/ }).focus();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});
