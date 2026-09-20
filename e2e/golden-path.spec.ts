import type { Page, Request } from "@playwright/test";
import sharp from "sharp";
import { missingTextUpstreamNodeIds, type NodeKind } from "../src/types/workflow";
import { expect, test } from "./fixtures";

const STUB_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n7sAAAAASUVORK5CYII=";

/** 六个内置模板（server/routes/templates.ts:92-231）。 */
const BUILTIN_TEMPLATE_COUNT = 6;
const PATTERN_TEMPLATE_NAME = "图案风格迁移";
/** builtin-pattern-style-transfer 的迁移节点绑定变体（templates.ts:56 EDIT_VARIANT）。 */
const TRANSFER_VARIANT_ID = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";

interface RunPlanNode {
  id: string;
  type: string;
  data: { kind: NodeKind; label?: string; promptVariantId?: string; text?: string };
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
          type: "node-status",
          nodeId,
          status: "success",
          images: [STUB_IMAGE],
          model: "e2e-stub-model",
          prompts: ["isolated golden path"],
          startedAt: now,
          finishedAt: now + 25,
        },
        { seq: 3, type: "done" },
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
      nodes: tab.nodes.map((node: { id: string; type?: string; data: { kind: string; label?: string; promptVariantId?: string; text?: string } }) => ({
        id: node.id,
        type: node.type ?? node.data.kind,
        data: {
          kind: node.data.kind,
          label: node.data.label,
          ...(node.data.promptVariantId ? { promptVariantId: node.data.promptVariantId } : {}),
          ...(typeof node.data.text === "string" ? { text: node.data.text } : {}),
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

test("an unverified starter stays blocked while a test-reviewed variant completes the isolated golden path", async ({ page }) => {
  const patternImage = await sharp({
    create: { width: 96, height: 64, channels: 3, background: "#735b42" },
  }).png().toBuffer();
  const styleImage = await sharp({
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

  // ---------- ② 项目中心：六个内置模板可启动（封面真实加载） ----------
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
    image instanceof HTMLImageElement && image.currentSrc.endsWith(".webp") && image.naturalWidth > 0
  )).length)).toBe(BUILTIN_TEMPLATE_COUNT);
  await expect(builtinPanel.getByText(PATTERN_TEMPLATE_NAME, { exact: true })).toBeVisible();

  // ---------- ③ 模板落地：上传位上传两张真实图片（参考图顺序：图1 → 图2） ----------
  // 模板落地会按「上传位」语义请求 native file chooser（activateFilePicker 依赖挂载时序，
  // 实测偶发不弹）。e2e 里统一直接写入节点的上传槽（与用户在该槽位选图是同一条上传路径），
  // 只消化可能出现的弹窗，避免悬挂的 chooser 阻塞后续交互。
  page.on("filechooser", (chooser) => {
    void chooser.setFiles([]);
  });
  await builtinPanel.getByRole("button", { name: new RegExp(`^${PATTERN_TEMPLATE_NAME}`) }).click();
  const patternNode = page.getByTestId("rf__node-pattern");
  const styleNode = page.getByTestId("rf__node-style");
  const transferNode = page.getByTestId("rf__node-transfer");
  await expect(patternNode).toBeVisible();
  await patternNode.getByLabel("上传图片").setInputFiles({
    name: "pattern.png",
    mimeType: "image/png",
    buffer: patternImage,
  });
  await expect(patternNode.getByAltText("已上传图片")).toBeVisible();
  await styleNode.getByLabel("上传图片").setInputFiles({
    name: "style.png",
    mimeType: "image/png",
    buffer: styleImage,
  });
  await expect(styleNode.getByAltText("已上传图片")).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(6);
  await expect(page.locator(".react-flow__edge")).toHaveCount(5);

  // ---------- ④ 未受审变体：目录未发布 + 运行不得触达 durable-run 边界 ----------
  await expect(transferNode).toContainText("风格迁移");
  // 参考图顺序 = 连线顺序（v7「只保留顺序语义」）：取 app 自己的派生函数，针对真实画布求值。
  const availableReferenceLabels = await page.evaluate(async () => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const admissionModuleUrl = "/src/hooks/usePromptRunAdmission.ts";
    const [store, admission] = await Promise.all([
      import(/* @vite-ignore */ storeModuleUrl),
      import(/* @vite-ignore */ admissionModuleUrl),
    ]);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((candidate: { id: string }) => candidate.id === state.activeTabId);
    if (!tab) throw new Error("当前没有活动文档");
    return admission.promptRunBrowserReferencesFromGraph(tab.nodes, tab.edges, "transfer")
      .filter((row: { available: boolean }) => row.available)
      .map((row: { sourceLabel: string }) => row.sourceLabel);
  });
  expect(availableReferenceLabels).toEqual(["图1 · 原始图案", "图2 · 风格参考"]);
  await transferNode.locator(".gc-node-header").click();
  await transferNode.getByRole("button", { name: "功能设置" }).click();
  const inspector = page.getByRole("dialog", { name: "风格迁移 · 功能设置" });
  await expect(inspector).toBeVisible();
  // 窗口先以 -9999px 离屏挂载，锚定几何在 effect/ResizeObserver 里收敛；等它落到画布内再点击。
  await expect.poll(async () => (await inspector.boundingBox())?.x ?? -9999).toBeGreaterThan(0);
  const catalog = inspector.getByRole("region", { name: "功能（系统提示词）" });
  await expect(catalog).toContainText("只列已发布");
  const catalogEntries = catalog.getByRole("button");
  const catalogCount = await catalogEntries.count();
  expect(catalogCount).toBeGreaterThan(0);
  for (let index = 0; index < catalogCount; index += 1) {
    const entry = catalogEntries.nth(index);
    await expect(entry).toContainText("未发布");
    await expect(entry).toBeDisabled();
    await expect(entry).toHaveAttribute("title", /尚未完成当前契约版本的真实评估/);
  }
  const runButton = inspector.getByRole("button", { name: "运 行" });
  const inspectorStatus = inspector.locator("p[aria-live='polite']");
  const nodeErrorText = async () => (await transferNode.locator(".text-red-400").allInnerTexts()).join(" | ");
  await expect(runButton).toBeEnabled();
  // 实测（1280×720）：窗口纵向 clamp 允许固定底部的「运 行」落到视口之外 → 鼠标点不到；
  // 而 Enter 又被 CanvasFlow 的 document keydown 吞掉（Enter 不能激活按钮，Space 可以）。
  // 这里用 Space 激活，测的是「运行准入」本身；几何与键盘缺陷另见卡片报告。
  await runButton.focus();
  await expect(runButton).toBeFocused();
  await page.keyboard.press(" ");
  await expect.poll(() => nodeErrorText(), {
    message: "未受审变体被拒绝时必须在节点上给出显式原因",
  }).not.toBe("");
  expect(runs, "未受审变体不得触达付费运行边界").toHaveLength(0);

  // ---------- ⑤ 受审变体：从 UI 发起隔离运行并跑完整条链路 ----------
  await installTestOnlyReviewedVariant(page, TRANSFER_VARIANT_ID);
  const runResponsePromise = page.waitForResponse((response) => (
    response.request().method() === "POST"
    && new URL(response.url()).pathname === "/api/run-plan"
  ), { timeout: 8_000 }).catch(() => null);
  await runButton.focus();
  await page.keyboard.press(" ");
  const runResponse = await runResponsePromise;
  expect(
    runResponse,
    `受审变体必须能由 UI 发起付费运行；实际未发出 POST /api/run-plan。节点/窗口给出的原因：${await nodeErrorText()} ｜ ${await inspectorStatus.innerText()}`,
  ).not.toBeNull();
  expect(runResponse?.status()).toBe(202);
  await expect(transferNode.getByLabel("状态：成功")).toBeVisible();

  // 运行载荷必须与画布文档同一形状，且满足 INV-1（image/video 有 text 上游）。
  expect(runs).toHaveLength(1);
  const run = runs[0];
  expect(run.onlyNodeId).toBe("transfer");
  expect(missingTextUpstreamNodeIds(run.nodes, run.edges)).toEqual([]);
  const documentGraph = await activeDocument(page);
  expect(run.nodes.map((node) => node.id).sort()).toEqual(documentGraph.nodes.map((node) => node.id).sort());
  expect(run.edges.map(edgeKey).sort()).toEqual(documentGraph.edges.map(edgeKey).sort());
  expect(documentGraph.nodes.find((node) => node.id === "transfer")?.data.promptVariantId).toBe(TRANSFER_VARIANT_ID);

  // ---------- ⑥ 结果面板：结果、动作、查看器、主题 token、节点库 ----------
  await page.keyboard.press("Escape");
  await expect(inspector).toHaveCount(0);
  // v7/R-80 布局：结果面板与属性面板同住在唯一占位 Dock 内（`WorkbenchShell` 的
  // `属性 / 结果` 入口，默认收起）。这里按真实用户路径先展开 Dock，再切到结果页签；
  // v6 的常驻右栏 / TaskLauncher 已不存在，等价入口只剩这一条。
  const contextToggle = page.getByRole("button", { name: "属性 / 结果" });
  await contextToggle.click();
  await expect(contextToggle).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("tab", { name: "结果 / 记录" }).click();
  const results = page.getByRole("region", { name: "最近生成" });
  await expect(results).toBeVisible();
  const resultCard = results.locator('article:has(img[alt="风格迁移"])');
  await expect(resultCard).toBeVisible();
  await resultCard.hover();
  const actionBar = resultCard.locator("div.absolute.inset-x-0.bottom-0");
  await expect(actionBar).toHaveClass(/grid-cols-2/);
  await expect(resultCard.locator('button[title="查看"]')).toBeVisible();
  await expect(resultCard.locator('button[title="加入对比"]')).toBeVisible();
  await expect(resultCard.locator('a[title="下载"]')).toHaveAttribute("download", "");

  const nodesBeforeApply = await page.locator(".react-flow__node").count();
  await resultCard.locator('button[title="设为输入"]').click();
  await expect(page.locator(".react-flow__node")).toHaveCount(nodesBeforeApply + 1);
  await page.getByRole("tab", { name: "结果 / 记录" }).click();
  await expect(resultCard).toBeVisible();

  await resultCard.locator('button[title="查看"]').click();
  await expect(page.getByText(/滚轮缩放 100%/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText(/滚轮缩放 100%/)).toHaveCount(0);

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

  const canvasNodes = page.locator(".react-flow__node");
  const nodeCountBeforeAdd = await canvasNodes.count();
  // v8：加节点入口是左侧工具栏的「添加」工作流菜单（节点库面板已下线）。
  await page.getByRole("button", { name: "添加" }).hover();
  const addMenu = page.getByRole("menu", { name: "添加" });
  await expect(addMenu).toBeVisible();
  await addMenu.getByRole("menuitem", { name: "文本" }).click();
  await expect(canvasNodes).toHaveCount(nodeCountBeforeAdd + 1);

  expect(await page.getByText("页面出现异常").count()).toBe(0);
  expect(pageErrors).toEqual([]);
});
