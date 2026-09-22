import type { Locator, Page } from "@playwright/test";
import { missingTextUpstreamNodeIds } from "../src/types/workflow";
import { expect, test } from "./fixtures";

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

const PROJECT_CENTER_PROJECT_FIXTURES = Array.from({ length: 5 }, (_, index) => ({
  id: `e2e-project-${index + 1}`,
  name: `超长项目名称 ${index + 1} · 用于验证单元长度折行在不同分辨率下的稳定展示`,
  ownerName: "E2E 演示用户",
  readOnly: index === 0,
  updatedAt: "2026-08-24T00:00:00.000Z",
}));

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
  // count() 同样不自动等待：先等「空态 CTA 或已有节点」之一落定，
  // 否则 reload / 切页签后的首帧会被误读成「画布为空」。
  await expect(page.getByRole("region", { name: "开始创作" }).or(nodes.first())).toBeVisible();
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

/** 当前文档的节点 id 与坐标（模板「右侧追加」语义的坐标断言用）。 */
async function documentNodePositions(page: Page): Promise<Array<{ id: string; x: number; y: number }>> {
  return page.evaluate(async () => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ storeModuleUrl);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((candidate: { id: string }) => candidate.id === state.activeTabId);
    if (!tab) throw new Error("当前没有活动文档");
    return tab.nodes.map((node: { id: string; position: { x: number; y: number } }) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
    }));
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
/**
 * 2026-09-25 登录语义（决策 4）：冷启动 0 页签，首屏是「空工作区」引导（无画布、无工具栏）。
 * 任何用例在断言画布 / 工具栏之前，都要先点「新建项目」拿到一个本地空白页签。
 */
async function openBlankCanvasFromGuide(page: Page): Promise<void> {
  const guide = page.getByRole("region", { name: "空工作区" });
  const canvas = page.getByRole("application", { name: "工作流画布" });
  // `Locator.count()` 不自动等待：reload 之后 React 首帧还没渲染时它会读成 0，把「还没渲染」
  // 误判成「画布已开」而提前 return（此后整条用例再没点过「新建项目」）。
  // 先等「空工作区 or 画布」之一落定，再决定要不要点。
  await expect(guide.or(canvas)).toBeVisible();
  if (await canvas.isVisible()) return;
  await guide.getByRole("button", { name: "新建项目" }).click();
  await expect(canvas).toBeVisible();
}

async function resetToEmptyFirstScreen(page: Page): Promise<void> {
  await openBlankCanvasFromGuide(page);
  // 2026-09-25（决策 4 之后）：冷启动落「空工作区」，本地画布为空 **不再等于** 服务端没有
  // 遗留 initial-draft。遗留草稿会在本档第一次实质变更（bootstrap）时进到新建的空白页签里——
  // 上一次用例画布的节点数会变成这里的起点，节点数断言随之漂移（实测：+4 模板用例之前的
  // 用例把草稿留成 2 节点，之后每条用例的 `toHaveCount(1)` 都拿到 2）。
  // 所以不再以「画布非空」为清除前提，一律清一次。
  // 契约依赖：`POST /api/projects/initial-draft/force-clear` 在**没有草稿**时也返回
  // 200 `{ok:true}`（server/routes/projects.ts:647-682，`none` 分支与 `cleared` 分支同样 200）。
  // backend 若改这个语义，这里会直接炸出来——这是有意的。
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
  // reload 后又回到空工作区（草稿已清、项目列表被遮住），需要再建一个本地空白页签。
  await openBlankCanvasFromGuide(page);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // 2026-09-25 登录语义（决策 4）：冷启动 0 页签 → 「空工作区」引导（无画布、无工具栏），
  // 画布要等点过「新建项目」之后才存在。
  await expect(page.getByRole("region", { name: "空工作区" })).toBeVisible();
  await expect(page.getByText(/正在确认运行历史|运行历史同步失败/)).toHaveCount(0);
  await resetToEmptyFirstScreen(page);
  await expect(page.getByText(/正在确认运行历史|运行历史同步失败/)).toHaveCount(0);
  await startFirstProject(page);
});

/**
 * 悬停左侧工具胶囊，展开它的二级菜单（railConfig.tsx 的 WORKFLOW_MENU 决定归属）。
 * 返回 menu locator，调用方直接点里面的 menuitem。
 */
async function openRailMenu(page: Page, entryLabel: string): Promise<Locator> {
  const rail = page.getByRole("navigation", { name: "工作台左侧工具" });
  await rail.getByRole("button", { name: entryLabel }).hover();
  const menu = page.getByRole("menu", { name: entryLabel });
  await expect(menu).toBeVisible();
  return menu;
}

/** 模板名 → 左侧工作流二级菜单里的入口文案（railConfig.tsx 的 WORKFLOW_MENU）。 */
const BUILTIN_TEMPLATE_ENTRY: Record<string, string> = {
  模特试穿: "AI 换装工作流",
};

/**
 * 从左侧工作流二级菜单启动一个真实内置模板（v8 的生成节点只能由模板落地的图产生：生成 /
 * 结果节点不接受手动新增，「添加」菜单只暴露 text / image / video 三个输入层入口）。
 *
 * 2026-09-25 决策：内置模板入口从项目中心迁到左侧工具胶囊的二级菜单，且落地语义变成
 * **把模板整套节点 + 边追加进当前活动画布**（右侧扩展、同 Y 对齐），不再新建页签、
 * 也不再经过项目中心。
 */
async function startBuiltinTemplate(page: Page, name: string): Promise<void> {
  const entryLabel = BUILTIN_TEMPLATE_ENTRY[name];
  if (!entryLabel) throw new Error(`未登记模板「${name}」所属的左侧工作流入口`);
  const menu = await openRailMenu(page, entryLabel);
  await menu.getByRole("menuitem", { name }).click();
  await expect(menu).toHaveCount(0);
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
  // 模板并入当前画布（不再新建页签）：原有 1 个图片节点 + 模板 4 个节点，模板自带 3 条边。
  const nodesBeforeTemplate = await page.locator(".react-flow__node").count();
  await startBuiltinTemplate(page, "模特试穿");
  await expect(page.locator(".react-flow__node")).toHaveCount(nodesBeforeTemplate + 4);
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
  // 下拉会在目录/对账数据落地的那次重渲染里被收起（满负载全量跑 1024 实测：先是 0 个选项，
  // 再是选项已渲染但下拉已被收起）。所以按「必须存在 aria-disabled 的选项」这一结果收敛，
  // 必要时重开下拉，而不是只断言一次「选项存在」。
  await functionSelect.click();
  const variantOptions = page.getByRole("option");
  const disabledVariantCount = () => variantOptions.evaluateAll((options) => (
    options.filter((option) => option.getAttribute("aria-disabled") === "true").length
  ));
  await expect(async () => {
    if (await disabledVariantCount() === 0) {
      await page.keyboard.press("Escape");
      await functionSelect.click();
    }
    expect(await disabledVariantCount()).toBeGreaterThan(0);
  }).toPass({ timeout: 20_000 });
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
  await expect(imageNode.getByRole("button", { name: "替换", exact: true })).toBeEnabled();

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

test("workflow menu templates merge into the active canvas without opening a tab", async ({ page }) => {
  const tabNav = page.getByRole("navigation", { name: "项目画布页签" });
  const tabsBefore = await tabNav.getByRole("tab").count();
  const positionsBefore = await documentNodePositions(page);
  expect(positionsBefore).toHaveLength(1); // beforeEach：空首屏 + 左侧「添加」1 个图片节点

  // 2026-09-25 决策：项目中心只留「最近项目」；模板入口迁到左侧二级菜单，自建模板能力整体下线。
  await page.getByRole("button", { name: "打开项目中心" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await expect(center).toBeVisible();
  await expect(center.getByText("最近项目", { exact: true })).toBeVisible();
  await expect(center.getByRole("tab")).toHaveCount(0);
  await expect(center.getByRole("button", { name: /保存当前画布为模板|管理模板/ })).toHaveCount(0);
  await center.getByRole("button", { name: "关闭项目中心" }).click();
  await expect(center).toHaveCount(0);

  // 新落点语义：模板整套节点 + 边追加进当前活动画布（不新建页签）。
  const menu = await openRailMenu(page, "AI 换装工作流");
  const tryonItem = menu.getByRole("menuitem", { name: "模特试穿" });
  await expect(tryonItem).toBeVisible();
  await tryonItem.click();
  await expect(page.locator(".react-flow__node")).toHaveCount(positionsBefore.length + 4);
  await expect(page.locator(".react-flow__edge")).toHaveCount(3);
  await expect(tabNav.getByRole("tab")).toHaveCount(tabsBefore);

  // 追加语义落实到坐标：既有节点原地不动，模板节点整体排到原节点右侧，且保持各自的 Y。
  const positionsAfter = await documentNodePositions(page);
  const beforeById = new Map(positionsBefore.map((node) => [node.id, node]));
  for (const node of positionsBefore) {
    const after = positionsAfter.find((candidate) => candidate.id === node.id);
    expect(after, `原节点 ${node.id} 不应被模板落地改动`).toBeDefined();
    expect(after!.x).toBeCloseTo(node.x, 5);
    expect(after!.y).toBeCloseTo(node.y, 5);
  }
  const addedNodes = positionsAfter.filter((node) => !beforeById.has(node.id));
  expect(addedNodes).toHaveLength(4);
  const rightmostBefore = Math.max(...positionsBefore.map((node) => node.x));
  for (const node of addedNodes) {
    expect(node.x, `模板节点 ${node.id} 应落在既有节点右侧`).toBeGreaterThan(rightmostBefore);
  }
  const addedTemplateYs = addedNodes.map((node) => node.y);
  expect(new Set(addedTemplateYs).size, "模板内部各层的 Y 关系必须保留").toBeGreaterThan(1);

  // 同一套模板加第二次不得被静默吞掉：撞 id 的节点改名后仍然落地（+4 节点 / +3 边）。
  const menuAgain = await openRailMenu(page, "AI 换装工作流");
  await menuAgain.getByRole("menuitem", { name: "模特试穿" }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(positionsBefore.length + 8);
  await expect(page.locator(".react-flow__edge")).toHaveCount(6);
  await expect(tabNav.getByRole("tab")).toHaveCount(tabsBefore);

  // 延后项（映射里 templateId 为 null）：点了不落地，只给可读提示条（role=status，5s 自动消失）。
  const nodesBeforePending = await page.locator(".react-flow__node").count();
  const videoMenu = await openRailMenu(page, "视频生成工作流");
  await videoMenu.getByRole("menuitem", { name: "首尾帧" }).click();
  await expect(page.getByRole("status").filter({ hasText: "首尾帧模板正在开发中" })).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(nodesBeforePending);
});

test("workflow menu reports a readable error and leaves the canvas untouched when template loading fails", async ({ page }) => {
  await page.route("**/api/templates", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 500, json: { error: "template fixture unavailable" } });
  });

  const tabNav = page.getByRole("navigation", { name: "项目画布页签" });
  const nodesBefore = await page.locator(".react-flow__node").count();
  const tabsBefore = await tabNav.getByRole("tab").count();
  const menu = await openRailMenu(page, "AI 换装工作流");
  await menu.getByRole("menuitem", { name: "模特试穿" }).click();

  // 失败走 role=alert 的可读提示条；画布与页签都不得被改动。
  // 页面上可能同时存在多条提示（如运行历史对账），按文案收窄到本条的提示条。
  await expect(page.getByRole("alert").filter({ hasText: "加载「模特试穿」失败" })).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(nodesBefore);
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);
  await expect(tabNav.getByRole("tab")).toHaveCount(tabsBefore);
});

test("project center keeps 最近项目 usable when the project list fails", async ({ page }) => {
  // 模板入口迁走后，项目中心的唯一数据源是 GET /api/projects；它挂掉时「最近项目」仍要可用。
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 500, json: { error: "project fixture unavailable" } });
  });

  await page.getByRole("button", { name: "打开项目中心" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await expect(center).toBeVisible();
  await expect(center.getByText("最近项目", { exact: true })).toBeVisible();
  await expect(center.getByRole("button", { name: "新建项目" })).toBeVisible();
  await expect(center.getByRole("alert")).toContainText("加载失败");
  await expect(center.getByLabel("正在加载模板")).toHaveCount(0);

  // 列表失败不得堵死主路径：仍能从「新建项目」拿到可用的空画布。
  await center.getByRole("button", { name: "新建项目" }).click();
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(0);
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
  // 项目中心已不再加载模板（入口迁到左侧二级菜单），这里只 stub 项目列表。

  await page.reload();
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();

  // 结果入口已从左侧 Dock 迁到画布右上角的纯文字图标浮层（ResultsFab.tsx）；
  // 2026-09-25 决策：按钮与浮层文案统一为「历史创作记录」。
  const resultsFab = page.getByRole("button", { name: "历史创作记录", exact: true });
  const resultsDialog = page.getByRole("dialog", { name: "历史创作记录" });
  const resultsRegion = resultsDialog.getByRole("region", { name: "最近生成" });
  // 浮层是弹层语义：点浮层外 / Esc / 打开图片查看器都会把它收起，所以重开才是稳定前置条件。
  const openResults = async () => {
    // isVisible() 不自动等待：改用触发按钮的 ARIA 状态（浮层开合与 aria-expanded 同源），
    // 避免「浮层正在打开」时把它读成关闭、再点一次反而收起。
    if (await resultsFab.getAttribute("aria-expanded") !== "true") await resultsFab.click();
    await expect(resultsDialog).toBeVisible();
  };
  await expect(resultsFab).toHaveAttribute("aria-haspopup", "dialog");
  await openResults();
  await expect(resultsFab).toHaveAttribute("aria-expanded", "true");
  await expect(resultsRegion).toBeVisible();
  // 浮层必须落在画布区内：1024/1280/1440 三档都不能溢出画布。
  expectInside(await rect(resultsDialog), await rect(page.getByRole("application", { name: "工作流画布" })));

  // 断言渲染出来的栅格列数，而不是 class 名（AGENTS.md §6）。
  const resultsGrid = resultsRegion.locator("article").first().locator("xpath=..");
  await expectGridColumns(resultsGrid, 3);

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
  // 2026-09-25 第 5 批（ab68c16）：「查看」改为「查看详情」→ 打开「结果详情」弹窗（图片查看器在弹窗里）。
  const viewButton = firstSuccessCard.locator('button[title="查看详情"]');
  const downloadButton = firstSuccessCard.locator('a[title="下载"]');
  const applyButton = firstSuccessCard.locator('button[title="设为输入"]');
  await expect(compareButton).toBeVisible();
  await expect(viewButton).toBeVisible();
  await expect(downloadButton).toBeVisible();
  await expect(applyButton).toBeVisible();

  const resultsRect = await rect(resultsScroller);
  await expectInside(await rect(firstSuccessCard), resultsRect);

  await viewButton.click();
  const detailDialog = page.getByRole("dialog", { name: "结果详情" });
  await expect(detailDialog).toBeVisible();
  await detailDialog.getByRole("button", { name: /查看 .* 大图/ }).click();
  const viewerHint = page.getByText(/滚轮缩放 100%/);
  await expect(viewerHint).toBeVisible();
  // 遮挡实测（Playwright 的 toBeVisible 不看遮挡）：查看器顶层的那个点必须真的属于查看器，
  // 否则说明它被「结果详情」弹窗（overlay z-[70] / content z-[71]）压住了。
  const viewerTopmost = await page.evaluate(() => {
    const hint = [...document.querySelectorAll("span")]
      .find((el) => el.textContent?.includes("滚轮缩放 100%"));
    if (!hint) return { found: false } as const;
    const overlay = hint.closest("div.fixed") as HTMLElement | null;
    const box = hint.getBoundingClientRect();
    const top = document.elementFromPoint(box.left + 2, box.top + 2);
    return {
      found: true,
      overlayZ: overlay ? getComputedStyle(overlay).zIndex : null,
      topmostIsViewer: Boolean(overlay && top && overlay.contains(top)),
      topmostTag: top ? `${top.tagName.toLowerCase()}.${(top.className || "").toString().slice(0, 40)}` : null,
    };
  });
  expect(
    viewerTopmost.found && viewerTopmost.topmostIsViewer,
    `图片查看器必须位于最上层（实测最上层元素=${viewerTopmost.topmostTag ?? "?"}，查看器 overlay z-index=${viewerTopmost.overlayZ ?? "?"}）`,
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(viewerHint).toBeHidden();
  // Esc 可能只关掉查看器：确定性地收掉详情弹窗，避免后续点击被遮罩拦截。
  if (await page.getByRole("button", { name: "关闭结果详情" }).count() > 0) {
    await page.getByRole("button", { name: "关闭结果详情" }).click();
  }
  await expect(detailDialog).toHaveCount(0);

  // 查看器 Esc 会连带收起结果浮层（ResultsFab 也监听 Esc），所以下一步先重开。
  await openResults();
  await compareButton.click();
  await expect(firstSuccessCard.locator('button[title="取消对比"]')).toBeVisible();

  const download = page.waitForEvent("download");
  await downloadButton.click();
  await download;

  const nodeCountBeforeApply = await page.locator(".react-flow__node").count();
  await applyButton.click();
  await expect(page.locator(".react-flow__node")).toHaveCount(nodeCountBeforeApply + 1);
  await openResults();
  await expect(resultsRegion).toBeVisible();

  const themes = [
    { label: "简白", id: "white" },
    { label: "护眼绿", id: "eye" },
    { label: "曜黑·荧光绿", id: "current" },
  ];
  for (const theme of themes) {
    // 结果浮层在 document 上有 pointerdown 关闭逻辑：它开着时点主题菜单项，首个 pointerdown
    // 先把浮层关掉 → 重渲染 → 菜单项被 detach（element was detached from the DOM）。
    // 不用 Escape（是否被别处消费不确定），改成确定性地关掉浮层并断言，再按「主题是否真的生效」收敛；
    // 菜单项选中后卸载属正常收尾，所以重试整段直到 data-theme 生效。
    await expect(async () => {
      if (await resultsFab.getAttribute("aria-expanded") === "true") await resultsFab.click();
      await expect(resultsDialog).toHaveCount(0);
      if (await page.locator("html").getAttribute("data-theme") === theme.id) return;
      const themeTrigger = page.getByRole("button", { name: /^切换主题，当前为/ });
      await themeTrigger.click();
      await page.getByRole("menuitemradio", { name: new RegExp(`^${theme.label}`) })
        .click({ timeout: 3_000 });
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme.id);
    }).toPass({ timeout: 20_000 });
    await openResults();
    await expectGridColumns(resultsGrid, 3);

    await page.getByRole("button", { name: "打开项目中心" }).click();
    const center = page.getByRole("dialog", { name: "项目中心" });
    await expect(center).toBeVisible();
    // 2026-09-25 决策：项目中心只留「最近项目」（模板入口已迁到左侧工作流二级菜单）。
    await expect(center.getByText("最近项目", { exact: true })).toBeVisible();
    await expect(center.getByRole("tab")).toHaveCount(0);
    // 「新建项目」卡是唯一稳定锚点（初始草稿卡按会话存在与否出现），用它反查所在栅格。
    const recentGrid = center.getByRole("button", { name: "新建项目" }).locator("xpath=../..");
    await expectGridColumns(recentGrid, expectedProjectColumns);
    if (theme.id === "white") {
      await expectTwoLineTitle(center.getByText(PROJECT_CENTER_PROJECT_FIXTURES[0].name, { exact: true }));
      const projectCardHeights = await center.getByRole("button", { name: /^超长项目名称/ }).evaluateAll(
        (elements) => elements.map((element) => element.getBoundingClientRect().height),
      );
      expect(projectCardHeights).toHaveLength(PROJECT_CENTER_PROJECT_FIXTURES.length);
      expect(Math.max(...projectCardHeights) - Math.min(...projectCardHeights)).toBeLessThanOrEqual(1);
    }

    // 栅格子项必须落在栅格盒内且可见（读同一帧，避免切换动画期间的错帧读数）。
    await expect.poll(async () => recentGrid.evaluate((grid) => {
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

test("floating rail, zoom controls, and the results layer preserve canvas identity, geometry, and focus", async ({ page }, testInfo) => {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Desktop viewport is required");
  const modifier = process.platform === "darwin" ? "Meta" : "Control";

  // 2026-09-25 第 5 批（ab68c16）：左侧 Dock 与其「属性 / 结果」入口整体移除，
  // 画布不再被面板推挤，恒定占满视口宽度；左侧只剩浮动工具栏，结果由右上浮层承载。
  const floatingRail = page.getByRole("navigation", { name: "工作台左侧工具" });
  const canvas = page.getByRole("application", { name: "工作流画布" });
  const zoomControls = page.getByTestId("canvas-zoom-controls");
  const zoomSlider = page.getByRole("slider", { name: "画布缩放比例" });
  const zoomOutput = zoomControls.locator("output");
  const originalCanvas = await canvas.elementHandle();
  if (!originalCanvas) throw new Error("Canvas element is missing");
  const originalFlowCenter = await flowCenter(canvas);
  await expect(floatingRail).toBeVisible();
  await expect(page.locator('aside[aria-label="工作台左侧面板"]')).toHaveCount(0);
  await expect(page.locator("#workbench-inspector-panel")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "属性 / 结果" })).toHaveCount(0);
  await expectWidth(canvas, viewport.width);

  const closedCanvasRect = await rect(canvas);
  const zoomControlsRect = await rect(zoomControls);
  expectInside(zoomControlsRect, closedCanvasRect);
  expect(zoomControlsRect.width).toBeGreaterThan(zoomControlsRect.height * 3);
  // 画布在加载/落地时会自动 fitView 一次（CanvasFlow：minZoom 0.35 / maxZoom 0.8），因此初始
  // 缩放不再是假定的 100%，而是按内容适应后的 ≤100%。先断言缩放控件与画布状态自洽，
  // 再归一到 100% 验证滑块与快捷键的可预测行为（不把具体适应比例写死成断言）。
  const initialZoom = Number((await zoomOutput.textContent() ?? "").replace("%", ""));
  expect(Number.isFinite(initialZoom)).toBe(true);
  expect(initialZoom).toBeLessThanOrEqual(100);
  await expect(zoomOutput).toHaveAttribute("aria-label", `当前缩放 ${initialZoom}%`);
  await zoomSlider.fill("100");
  await expect(zoomOutput).toHaveText("100%");
  await zoomSlider.fill("125");
  await expect(zoomOutput).toHaveText("125%");
  await zoomSlider.fill("100");
  await expect(zoomOutput).toHaveText("100%");

  await page.keyboard.press(`${modifier}+=`);
  await expect(zoomOutput).toHaveText("120%");
  await page.keyboard.press(`${modifier}+-`);
  await expect(zoomOutput).toHaveText("100%");
  // 归一后的视口基线：初始 fitView 的 ≤100% 已被上面的滑块归到 100%，文末「Dock 开合不改视口」
  // 只能拿这一份做基线（此刻 Dock 同样是关闭态，画布尺寸与文末一致）。
  const restoredTransform = await readViewportMatrix(page.locator(".react-flow__viewport"));

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

  // 浮动工具栏不占布局：MiniMap 与缩放条必须仍落在画布内，画布中心不因浮层而漂移。
  const contextMinimap = page.locator(".react-flow__minimap");
  const contextMinimapRect = await rect(contextMinimap);
  expectInside(contextMinimapRect, closedCanvasRect);
  // 响应式 minimap 宽度经 ResizeObserver → setState → 重渲染才收敛，须等待而非同步断言。
  await expect.poll(async () => (await rect(contextMinimap)).width)
    .toBe(closedCanvasRect.width < 760 ? 128 : 200);
  await expectFlowCenter(canvas, originalFlowCenter);

  // 结果模块由画布右上角「历史创作记录」浮层承载（`ResultsFab`，2026-09-25 决策）。浮层是弹层语义：
  // 收起即卸载；旧 Dock 页签时代的「两个 Panel 必须常驻挂载 + 保持滚动状态」契约已随 Dock 移除退役。
  const resultsFab = page.getByRole("button", { name: "历史创作记录", exact: true });
  const resultsPanelHost = page.locator("#results-fab-panel");
  await expect(page.getByRole("tab", { name: "属性" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "结果 / 记录" })).toHaveCount(0);

  await expect(resultsFab).toBeVisible();
  await expect(resultsFab).toHaveAttribute("aria-expanded", "false");
  await expect(resultsPanelHost).toHaveCount(0);
  await resultsFab.click();
  await expect(resultsFab).toHaveAttribute("aria-expanded", "true");
  await expect(resultsFab).toHaveAttribute("aria-controls", "results-fab-panel");
  await expect(resultsPanelHost).toBeVisible();
  const resultsRegion = resultsPanelHost.getByRole("region", { name: "最近生成" });
  await expect(resultsRegion).toContainText("运行 AI 节点后，生成结果与运行记录会汇总在这里");

  // 浮层必须落在画布区内：右侧浮层不得越出画布边界（第 5 批后画布占满视口宽）。
  const fabPanelRect = await rect(resultsPanelHost);
  expectInside(fabPanelRect, await rect(canvas));

  // 键盘路径：浮层此刻已由上面的点击打开 → Esc 收起，焦点必须留在触发按钮上（不丢焦点）；
  // 再用 Enter 从键盘打开一次，确认不是「只有鼠标能开」。
  await resultsFab.focus();
  await page.keyboard.press("Escape");
  await expect(resultsPanelHost).toHaveCount(0);
  await expect(resultsFab).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(resultsPanelHost).toBeVisible();
  await expect(resultsFab).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(resultsPanelHost).toHaveCount(0);
  await expect(resultsFab).toBeFocused();
  await expect(resultsFab).toHaveAttribute("aria-expanded", "false");

  // 浮层收起后画布几何与中心必须与打开前一致；缩放条与 MiniMap 仍在画布内。
  await expect(page.getByRole("button", { name: "历史创作记录", exact: true })).toBeVisible();
  await expect(page.locator("#results-fab-panel")).toHaveCount(0);

  const canvasRect = await rect(canvas);
  expect(canvasRect.left).toBe(closedCanvasRect.left);
  expect(canvasRect.width).toBe(closedCanvasRect.width);
  expectInside(await rect(zoomControls), canvasRect);
  const minimap = page.locator(".react-flow__minimap");
  const minimapRect = await rect(minimap);
  expectInside(minimapRect, canvasRect);
  await expect.poll(async () => (await rect(minimap)).width)
    .toBe(canvasRect.width < 760 ? 128 : 200);
  await expectFlowCenter(canvas, originalFlowCenter);

  // 项目中心（只剩「最近项目」）必须按当前 Dock 后的中心宽度收缩，不能被画布容器裁切；
  // 打开 / 关闭后焦点要回到入口按钮（浮层不夺焦、也不丢焦）。
  // 旧「存为模板 / 我的模板」表单及其跨会话竞态用例随 POST /api/templates 一起下线。
  const projectCenterToggle = page.getByRole("button", { name: "打开项目中心" });
  await projectCenterToggle.click();
  const projectCenter = page.getByRole("dialog", { name: "项目中心" });
  await expect(projectCenter).toBeVisible();
  await expect(projectCenter.getByText("最近项目", { exact: true })).toBeVisible();
  await expect(projectCenter.getByRole("button", { name: "新建项目" })).toBeVisible();
  const projectCenterRect = await rect(projectCenter);
  expect(projectCenterRect.left).toBeGreaterThanOrEqual(39);
  expect(projectCenterRect.right).toBeLessThanOrEqual(viewport.width - 39);
  await testInfo.attach(`desktop-${viewport.width}-workbench-layout-project-center`, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  await projectCenter.getByRole("button", { name: "关闭项目中心" }).click();
  await expect(projectCenter).toHaveCount(0);
  await expect(projectCenterToggle).toBeFocused();

  await page.mouse.move(canvasRect.left + canvasRect.width / 2, canvasRect.top + 20);
  await page.waitForTimeout(300);

  await testInfo.attach(`desktop-${viewport.width}-workbench-layout`, {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  // 全流程跑完后画布必须仍占满视口宽：没有任何浮层把画布挤窄（第 5 批后无 Dock 推挤）。
  await expectWidth(canvas, viewport.width);
  expect(await canvas.evaluate((current, original) => current === original, originalCanvas)).toBe(true);
  await expect.poll(
    () => readViewportMatrix(page.locator(".react-flow__viewport")),
  ).toBe(restoredTransform);
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

/**
 * 2026-09-25 UI 修复第 6 条：允许关掉全部页签，落底是空工作区引导，而不是被自动塞回一个空白页签。
 */
test("closing the last project tab falls back to the empty workspace guide", async ({ page }) => {
  const tabNav = page.getByRole("navigation", { name: "项目画布页签" });
  const closeButtons = tabNav.getByRole("button", { name: /^关闭 / });
  const emptyGuide = page.getByRole("region", { name: "空工作区" });
  const projectCreates: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/projects") {
      projectCreates.push(request.url());
    }
  });

  // 对账已收敛（beforeEach 保证）→ × 不被封锁，默认 title 是可读文案而不是 alert。
  const tabCountBefore = await closeButtons.count();
  expect(tabCountBefore).toBeGreaterThanOrEqual(1);
  await expect(closeButtons.first()).toBeEnabled();
  await expect(closeButtons.first()).toHaveAttribute("title", "关闭页签");

  while (await closeButtons.count() > 0) {
    const before = await closeButtons.count();
    await closeButtons.first().click();
    await expect.poll(async () => closeButtons.count()).toBeLessThan(before);
  }
  await expect(emptyGuide).toBeVisible();
  await expect(emptyGuide).toContainText("当前没有打开的项目");
  await expect(emptyGuide.getByRole("button", { name: "新建项目" })).toBeVisible();
  await expect(emptyGuide.getByRole("button", { name: "打开项目" })).toBeVisible();

  // 关光后不得自动补回页签：等首屏 bootstrap / 会话恢复的异步分支落定后再断言一次。
  await page.waitForTimeout(600);
  await expect(closeButtons).toHaveCount(0);
  await expect(emptyGuide).toBeVisible();

  // 「新建项目」→ 一个未保存的本地空白页签：画布回归、0 节点、不创建服务端项目。
  // 注意：上面关闭带节点的初始草稿页签时应用会先正式落库（POST /api/projects），
  // 那是「不丢工作」的正确行为，因此只比较点击「新建项目」前后的增量。
  const createsBeforeNewProject = projectCreates.length;
  await emptyGuide.getByRole("button", { name: "新建项目" }).click();
  await expect(emptyGuide).toHaveCount(0);
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(0);
  await expect(closeButtons).toHaveCount(1);
  await expect(closeButtons.first()).toBeEnabled();
  await expect(closeButtons.first()).toHaveAttribute("title", "关闭页签");
  expect(projectCreates.length).toBe(createsBeforeNewProject + 0);
});

/**
 * 2026-09-25 UI 修复第 6 条：页签 × 在封锁态（这里用「运行历史对账未完成」）置灰 + title 说明，
 * 点击不再 window.alert 打断，也不静默改变页签数量。
 */
test("project tab close stays blocked with a readable reason while run history is unsettled", async ({ page }) => {
  const dialogs: string[] = [];
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });

  // 对账请求永不落定 → 生成安全门保持封锁（顶部横幅与 × 的置灰判定同源）。
  await page.route("**/api/history*", async () => { /* 故意不 fulfill：模拟对账未完成 */ });
  await page.reload();
  await expect(page.getByText(/正在确认运行历史/)).toBeVisible();
  // 恢复出来的首个页签带 1 个输入层节点（beforeEach 已落库），因此不再是「从未落库的空白页签」。
  await expect(page.locator(".react-flow__node")).toHaveCount(1);

  const tabNav = page.getByRole("navigation", { name: "项目画布页签" });
  const closeButton = tabNav.getByRole("button", { name: /^关闭 / });
  await expect(closeButton).toHaveCount(1);
  await expect(closeButton.first()).toBeDisabled();
  await expect(closeButton.first()).toHaveAttribute("title", /正在确认运行历史/);

  await closeButton.first().dispatchEvent("click");
  await page.waitForTimeout(200);
  await expect(closeButton).toHaveCount(1);
  expect(dialogs).toEqual([]);
});
