import type { Page, Request } from "@playwright/test";
import sharp from "sharp";
import { illegalEdgeIndexes, missingTextUpstreamNodeIds, type NodeKind } from "../src/types/workflow";
import { expect, test } from "./fixtures";

const STUB_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n7sAAAAASUVORK5CYII=";

/** v8 内置模板：15 个（server/routes/templates.ts 的 builtinTemplates()）。 */
const BUILTIN_TEMPLATE_COUNT = 15;
/** 金路径使用的模板：AI 换装 → 模特试穿（builtin-model-tryon）。 */
const TEMPLATE_NAME = "模特试穿";
const GENERATOR_NODE_ID = "tryon-gen";
/** builtin-model-tryon 的生成节点绑定变体（templates.ts EDIT_VARIANT）。 */
const TRYON_VARIANT_ID = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";

interface RunPlanNode {
  id: string;
  type: string;
  data: { kind: NodeKind; label?: string; promptVariantId?: string; text?: string; images?: string[] };
}

interface RunPlanEdge {
  source: string;
  target: string;
  targetHandle?: string | null;
}

interface RunPlanBody {
  onlyNodeId: string;
  nodes: RunPlanNode[];
  edges: RunPlanEdge[];
}

interface ActiveDocument {
  nodes: RunPlanNode[];
  edges: RunPlanEdge[];
}

function postBody<T>(request: Request): T | null {
  if (request.method() !== "POST") return null;
  return request.postDataJSON() as T;
}

function edgeKey(edge: RunPlanEdge): string {
  return `${edge.source}->${edge.target}:${edge.targetHandle ?? ""}`;
}

/**
 * 方案 C（R-75 §2）首屏语义：进入工作台是本地空白 tab，不 bootstrap、也没有 TaskLauncher 浮层。
 * 隔离库里草稿是跨项目共享的，页面还会从 sessionStorage 恢复上次页签，所以金路径开头显式回到
 * 规范起点：清本地会话 + 清服务端草稿 + 遮住正式项目列表，再重新加载。
 */
async function openEmptyFirstScreen(page: Page): Promise<void> {
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

/**
 * 只桩掉 app 自己的 durable-run 边界：付费运行必须由 UI（store.runNode）发起，
 * 这里既捕获请求体，也回放一条最小的成功事件流。没有真实 Provider 主机可被触达。
 *
 * v8（runtime.md §3.1）：产物由独立的 `result-node-created` 事件送达并实例化结果节点，
 * `node-status(success)` 只收口生成节点状态——因此桩事件序列与 server/engine/runQueue/
 * lifecycle.ts 的真实发射顺序一致（result-node-created → node-status success → done）。
 */
async function stubRunBoundary(page: Page, runs: RunPlanBody[]): Promise<void> {
  const nodeIdByRun = new Map<string, string>();
  let runSequence = 0;
  await page.route("**/api/run-plan**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/run-plan" && request.method() === "POST") {
      const body = postBody<RunPlanBody>(request);
      if (!body) throw new Error("Missing stub run body");
      runs.push(body);
      const runId = `e2e-golden-${++runSequence}`;
      nodeIdByRun.set(runId, body.onlyNodeId);
      await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ runId, status: "queued" }) });
      return;
    }
    const match = pathname.match(/^\/api\/run-plan\/([^/]+)(\/events)?$/);
    if (!match) {
      await route.abort("blockedbyclient");
      return;
    }
    const runId = decodeURIComponent(match[1]);
    const nodeId = nodeIdByRun.get(runId);
    if (!nodeId) throw new Error(`Unknown stub run ${runId}`);
    if (match[2] === "/events") {
      const now = Date.now();
      const events = [
        { seq: 1, type: "node-status", nodeId, status: "running", startedAt: now },
        {
          seq: 2,
          type: "result-node-created",
          resultNodeId: `result-${runId}`,
          sourceGeneratorId: nodeId,
          runId,
          mediaKind: "image",
          urls: [STUB_IMAGE],
        },
        {
          seq: 3,
          type: "node-status",
          nodeId,
          status: "success",
          images: [STUB_IMAGE],
          model: "e2e-stub-model",
          prompts: ["isolated golden path"],
          startedAt: now,
          finishedAt: now + 25,
        },
        { seq: 4, type: "done" },
      ];
      const body = events.map((event) => `id: ${event.seq}\ndata: ${JSON.stringify(event)}\n\n`).join("");
      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body,
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: runId, status: "running" }) });
  });
}

/**
 * 受审发布的浏览器侧注入（只作用于本用例的页面）：与生产同一条 effectivePromptSupport
 * 证据链——目录状态 + 同代码 SHA 的受审发布快照才算 verified。这里显式注入 e2e 专属证据，
 * 未受审目录项仍保持「未发布」。
 */
async function installTestOnlyReviewedVariant(page: Page, variantId: string): Promise<void> {
  await page.evaluate(async (targetVariantId) => {
    const promptCatalogPath = "/src/lib/garmentPromptPresets.ts";
    const releasePath = "/src/lib/promptEvaluationRelease.ts";
    const registryPath = "/src/lib/promptEvaluationReleaseRegistry.ts";
    const [catalog, releaseTools, registry] = await Promise.all([
      import(/* @vite-ignore */ promptCatalogPath),
      import(/* @vite-ignore */ releasePath),
      import(/* @vite-ignore */ registryPath),
    ]);
    const codeSha = "0123456789abcdef0123456789abcdef01234567";
    (globalThis as unknown as { process?: { env?: Record<string, string> } }).process = {
      env: { GARMENT_CANVAS_CODE_SHA: codeSha },
    };
    const variant = catalog.getGarmentPromptVariantById(targetVariantId);
    if (!variant) throw new Error(`Missing E2E prompt variant ${targetVariantId}`);
    variant.supportStatus = "verified";
    const releases = registry.PROMPT_EVALUATION_RELEASES as unknown as Array<unknown>;
    releases.push(releaseTools.createPromptEvaluationReleaseSnapshot(
      variant,
      "verified",
      "e2e-test-only-evidence",
      {
        evaluationStage: "formal-validation",
        evidenceArtifactSha256: "0".repeat(64),
        gateReceiptSha256: "0".repeat(64),
        evaluationUnitKey: `sha256:${"0".repeat(64)}`,
        codeSha,
      },
    ));
  }, variantId);
}

/** 当前文档的节点/边（只读形状），用于「运行载荷 == 画布文档」的同一性断言。 */
async function activeDocument(page: Page): Promise<ActiveDocument> {
  return page.evaluate(async () => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ storeModuleUrl);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((candidate: { id: string }) => candidate.id === state.activeTabId);
    if (!tab) throw new Error("当前没有活动文档");
    return {
      nodes: tab.nodes.map((node: { id: string; type?: string; data: { kind: string; label?: string; promptVariantId?: string; text?: string; images?: string[] } }) => ({
        id: node.id,
        type: node.type ?? node.data.kind,
        data: {
          kind: node.data.kind,
          label: node.data.label,
          ...(node.data.promptVariantId ? { promptVariantId: node.data.promptVariantId } : {}),
          ...(typeof node.data.text === "string" ? { text: node.data.text } : {}),
          ...(Array.isArray(node.data.images) ? { images: node.data.images } : {}),
        },
      })),
      edges: tab.edges.map((edge: { source: string; target: string; targetHandle?: string | null }) => ({
        source: edge.source,
        target: edge.target,
        targetHandle: edge.targetHandle ?? null,
      })),
    } as unknown as { nodes: RunPlanNode[]; edges: RunPlanEdge[] };
  });
}

/** 选中画布节点（工具条仅选中态渲染），以工具条出现为准，容忍页签落地首帧吞掉的一次点击。 */
async function selectCanvasNode(node: ReturnType<Page["locator"]>): Promise<void> {
  const header = node.locator(".gc-node-header");
  await expect(header).toBeVisible();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await node.locator("[data-node-toolbar]").count() > 0) return;
    await header.click();
    await node.page().waitForTimeout(150);
  }
  await expect(node.locator("[data-node-toolbar]")).toHaveCount(1);
}

test("an unverified starter stays blocked while a test-reviewed variant completes the isolated golden path", async ({ page }) => {
  const garmentImage = await sharp({
    create: { width: 96, height: 64, channels: 3, background: "#735b42" },
  }).png().toBuffer();
  const modelImage = await sharp({
    create: { width: 64, height: 96, channels: 3, background: "#2f4858" },
  }).png().toBuffer();
  const runs: RunPlanBody[] = [];
  const pageErrors: string[] = [];
  const bootstrapRequests: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/projects/initial-draft/bootstrap") {
      bootstrapRequests.push(request.url());
    }
  });
  await stubRunBoundary(page, runs);

  // ---------- ① 空首屏：本地空 tab，不落库，中央 CTA 就位 ----------
  await page.goto("/");
  await expect(page.getByText(/正在确认运行历史|运行历史同步失败/)).toHaveCount(0);
  await openEmptyFirstScreen(page);
  const cta = page.getByRole("region", { name: "开始创作" });
  await expect(cta).toBeVisible();
  await expect(cta.getByRole("button", { name: "上传图片开始" })).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(0);
  expect(bootstrapRequests).toEqual([]);

  // ---------- ② 项目中心：v8 的 15 个内置模板可启动（封面真实加载） ----------
  await page.getByRole("button", { name: "打开项目中心" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await expect(center).toBeVisible();
  await center.getByRole("tab", { name: "内置模板" }).click();
  const builtinPanel = center.getByRole("tabpanel", { name: "内置模板" });
  const templateCards = builtinPanel.getByRole("button");
  await expect(templateCards).toHaveCount(BUILTIN_TEMPLATE_COUNT);
  await expect.poll(() => templateCards.evaluateAll((buttons) => (
    buttons.filter((button) => button.textContent?.includes("内置")).length
  ))).toBe(BUILTIN_TEMPLATE_COUNT);
  const covers = builtinPanel.locator("img");
  await expect(covers).toHaveCount(BUILTIN_TEMPLATE_COUNT);
  await expect.poll(() => covers.evaluateAll((images) => images.filter((image) => (
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
  )).length)).toBe(BUILTIN_TEMPLATE_COUNT);
  await expect(builtinPanel.getByText(TEMPLATE_NAME, { exact: true })).toBeVisible();

  // ---------- ③ 模板落地：上传位上传两张真实图片（参考图顺序：图1 → 图2） ----------
  // 模板落地会按「上传位」语义请求 native file chooser（activateFilePicker 依赖挂载时序，
  // 实测偶发不弹）。e2e 里统一直接写入节点的上传槽（与用户在该槽位选图是同一条上传路径），
  // 只消化可能出现的弹窗，避免悬挂的 chooser 阻塞后续交互。
  page.on("filechooser", (chooser) => {
    void chooser.setFiles([]);
  });
  await builtinPanel.getByRole("button", { name: new RegExp(`^${TEMPLATE_NAME}`) }).click();
  const garmentNode = page.getByTestId("rf__node-garment");
  const modelNode = page.getByTestId("rf__node-model");
  const generatorNode = page.getByTestId(`rf__node-${GENERATOR_NODE_ID}`);
  await expect(garmentNode).toBeVisible();
  await garmentNode.getByLabel("上传图片").setInputFiles({
    name: "garment.png",
    mimeType: "image/png",
    buffer: garmentImage,
  });
  await expect(garmentNode.getByAltText("已上传图片")).toBeVisible();
  await modelNode.getByLabel("上传图片").setInputFiles({
    name: "model.png",
    mimeType: "image/png",
    buffer: modelImage,
  });
  await expect(modelNode.getByAltText("已上传图片")).toBeVisible();
  // v8 模板形状：输入层 3 个（文本 + 服装图 + 数字模特）+ 生成层 1 个，3 条边。
  await expect(page.locator(".react-flow__node")).toHaveCount(4);
  await expect(page.locator(".react-flow__edge")).toHaveCount(3);

  // ---------- ④ 未受审变体：目录未发布 + 运行不得触达 durable-run 边界 ----------
  await expect(generatorNode).toContainText("试穿生成");
  await expect(generatorNode.getByRole("combobox", { name: "功能" })).toContainText("（未发布）");
  // 参考图顺序 = 连线顺序（v8「只保留顺序语义」）：取 app 自己的派生函数，针对真实画布求值。
  const availableReferenceLabels = await page.evaluate(async (generatorId) => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const admissionModuleUrl = "/src/hooks/usePromptRunAdmission.ts";
    const [store, admission] = await Promise.all([
      import(/* @vite-ignore */ storeModuleUrl),
      import(/* @vite-ignore */ admissionModuleUrl),
    ]);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((candidate: { id: string }) => candidate.id === state.activeTabId);
    if (!tab) throw new Error("当前没有活动文档");
    return admission.promptRunBrowserReferencesFromGraph(tab.nodes, tab.edges, generatorId)
      .filter((row: { available: boolean }) => row.available)
      .map((row: { sourceLabel: string }) => row.sourceLabel);
  }, GENERATOR_NODE_ID);
  expect(availableReferenceLabels).toEqual(["服装图", "数字模特"]);
  // 卡片内运行按钮：准入不通过 → 禁用 + 给出可读原因（未受审变体不得静默运行）。
  const runButton = generatorNode.getByRole("button", { name: "尚不可运行" });
  await expect(runButton).toBeDisabled();
  await expect(runButton).toHaveAttribute("title", /尚未完成当前契约版本的真实评估/);
  // 工具条「运行」是同一动作的另一入口；这里用它触发被拒绝的运行，并在节点上取回显式原因。
  await selectCanvasNode(generatorNode);
  const generatorToolbar = generatorNode.locator('[data-node-toolbar="image-generator"]');
  await generatorToolbar.getByRole("button", { name: "运行", exact: true }).click();
  await expect.poll(
    async () => (await generatorNode.locator(".text-red-400").allInnerTexts()).join(" | "),
    { message: "未受审变体被拒绝时必须在节点上给出显式原因" },
  ).toContain("尚未完成当前契约版本的真实评估");
  expect(runs, "未受审变体不得触达付费运行边界").toHaveLength(0);

  // ---------- ⑤ 受审变体：从 UI 发起隔离运行并跑完整条链路 ----------
  await installTestOnlyReviewedVariant(page, TRYON_VARIANT_ID);
  // 运行载荷以「发起时刻」的文档为准：受审运行随后会追加结果节点，所以先冻结文档快照。
  const documentGraph = await activeDocument(page);
  const runResponsePromise = page.waitForResponse((response) => (
    response.request().method() === "POST"
    && new URL(response.url()).pathname === "/api/run-plan"
  ), { timeout: 8_000 }).catch(() => null);
  await generatorToolbar.getByRole("button", { name: "运行", exact: true }).click();
  const runResponse = await runResponsePromise;
  expect(
    runResponse,
    `受审变体必须能由 UI 发起付费运行；实际未发出 POST /api/run-plan。节点给出的原因：${
      (await generatorNode.locator(".text-red-400").allInnerTexts()).join(" | ")
    }`,
  ).not.toBeNull();
  expect(runResponse?.status()).toBe(202);
  await expect(generatorNode.getByLabel("状态：成功")).toBeVisible();

  // 运行载荷必须与画布文档同一形状，且满足 INV-1（生成节点有 text 上游）。
  expect(runs).toHaveLength(1);
  const run = runs[0];
  expect(run.onlyNodeId).toBe(GENERATOR_NODE_ID);
  expect(missingTextUpstreamNodeIds(run.nodes, run.edges)).toEqual([]);
  expect(illegalEdgeIndexes(run.nodes, run.edges)).toEqual([]);
  expect(run.nodes.map((node) => node.id).sort()).toEqual(documentGraph.nodes.map((node) => node.id).sort());
  expect(run.edges.map(edgeKey).sort()).toEqual(documentGraph.edges.map(edgeKey).sort());
  expect(documentGraph.nodes.find((node) => node.id === GENERATOR_NODE_ID)?.data.promptVariantId)
    .toBe(TRYON_VARIANT_ID);

  // ---------- ⑥ 结果节点：RunEvent 驱动的独立结果节点（v8 §3.4 / runtime.md §3.1） ----------
  const resultNodeId = `result-${"e2e-golden-1"}`;
  const resultNode = page.getByTestId(`rf__node-${resultNodeId}`);
  await expect(resultNode).toBeVisible();
  const resultGraph = await activeDocument(page);
  const persistedResult = resultGraph.nodes.find((node) => node.id === resultNodeId);
  expect(persistedResult?.data.kind).toBe("result-image");
  expect(persistedResult?.data.images).toEqual([STUB_IMAGE]);
  // 生成节点不再承载任何媒体（产物归结果节点），也不被结果连带写入。
  expect(resultGraph.nodes.find((node) => node.id === GENERATOR_NODE_ID)?.data.images).toBeUndefined();
  await selectCanvasNode(resultNode);
  const resultToolbar = resultNode.locator('[data-node-toolbar="result-image"]');
  await expect(resultToolbar).toHaveAttribute("aria-label", "图片结果工具栏");
  for (const label of ["预览", "下载", "作为输入", "复制"]) {
    await expect(resultToolbar.getByRole("button", { name: label })).toBeVisible();
  }

  // ---------- ⑦ 结果面板：结果、动作、查看器、主题 token ----------
  // v7/R-80 布局：结果面板与属性面板同住在唯一占位 Dock 内（`WorkbenchShell` 的
  // `属性 / 结果` 入口，默认收起）。这里按真实用户路径先展开 Dock，再切到结果页签。
  const contextToggle = page.getByRole("button", { name: "属性 / 结果" });
  await contextToggle.click();
  await expect(contextToggle).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("tab", { name: "结果 / 记录" }).click();
  const results = page.getByRole("region", { name: "最近生成" });
  await expect(results).toBeVisible();
  const resultCard = results.locator('article:has(img[alt="试穿生成"])');
  await expect(resultCard).toBeVisible();
  await resultCard.hover();
  const actionBar = resultCard.locator("div.absolute.inset-x-0.bottom-0");
  await expect(actionBar).toHaveClass(/grid-cols-2/);
  await expect(resultCard.locator('button[title="查看"]')).toBeVisible();
  await expect(resultCard.locator('button[title="加入对比"]')).toBeVisible();
  await expect(resultCard.locator('a[title="下载"]')).toHaveAttribute("download", "");

  const nodesBeforeApply = await page.locator(".react-flow__node").count();
  // 媒体遮罩文字 token 的主题稳定性：必须在查看器打开前读——查看器关闭（Escape）会收起 Dock。
  const originalTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  for (const theme of ["white", "eye", "current"] as const) {
    await page.evaluate((value) => {
      document.documentElement.setAttribute("data-theme", value);
    }, theme);
    // 读 token 而非 computed color：computed color 受 hover:text-white 影响（鼠标移出后
    // :hover 要到下一帧才失效，存在竞态）；token 在三种主题下都应稳定为 #f4f4f4。
    const overlayToken = await resultCard.locator('button[title="查看"]').evaluate(
      (element) => getComputedStyle(element).getPropertyValue("--gc-media-overlay-text").trim(),
    );
    expect(overlayToken).toBe("#f4f4f4");
  }
  await page.evaluate((value) => {
    if (value) document.documentElement.setAttribute("data-theme", value);
  }, originalTheme);

  await resultCard.locator('button[title="查看"]').click();
  await expect(page.getByText(/滚轮缩放 100%/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText(/滚轮缩放 100%/)).toHaveCount(0);

  // ---------- ⑦b 设为输入：把结果回灌成新的输入层节点 ----------
  if (await contextToggle.getAttribute("aria-expanded") !== "true") {
    await contextToggle.click();
  }
  await expect(contextToggle).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("tab", { name: "结果 / 记录" }).click();
  await expect(resultCard).toBeVisible();
  await resultCard.locator('button[title="设为输入"]').click();
  await expect(page.locator(".react-flow__node")).toHaveCount(nodesBeforeApply + 1);

  // ---------- ⑧ 加节点入口：左侧工具栏的「添加」工作流菜单（节点库面板已下线） ----------
  const canvasNodes = page.locator(".react-flow__node");
  const nodeCountBeforeAdd = await canvasNodes.count();
  const rail = page.getByRole("navigation", { name: "工作台左侧工具" });
  await rail.getByRole("button", { name: "添加", exact: true }).hover();
  const addMenu = page.getByRole("menu", { name: "添加" });
  await expect(addMenu).toBeVisible();
  await addMenu.getByRole("menuitem", { name: "文本" }).click();
  await expect(canvasNodes).toHaveCount(nodeCountBeforeAdd + 1);

  expect(await page.getByText("页面出现异常").count()).toBe(0);
  expect(pageErrors).toEqual([]);
});
