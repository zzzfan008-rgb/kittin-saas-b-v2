import type { Locator, Page } from "@playwright/test";
import sharp from "sharp";
import { expect, test } from "./fixtures";

/**
 * R-88：R-87 新交互的 e2e 验收。
 *
 * 覆盖面（逐项对应 R-88 卡片 §3）：
 *  - ③ 图片缩放（§B/§D）：滚轮缩放改变 scale（HUD 百分比）→ 双击在「适合画布 ↔ 100%」往返 →
 *    ± 按钮步进 → 范围 clamp 在 25%–400%（`src/components/ImageViewer.tsx` MIN_SCALE/MAX_SCALE）
 *    → HUD 可点击重置为适合画布 → Esc 关闭。
 *  - ⑤ 两页合并（§E）：点结果卡「查看详情」**直接打开 ImageViewer**（不再出现「结果详情」dialog），
 *    且查看器侧边栏包含从 ResultRecordDetail 迁来的字段（节点类型 / 上游实际尺寸，以及既有模型/时间）。
 *  - ⑥ 按钮区：`mask-redraw-save` 已删除、副标题「每次提交自动保存蒙版」可见。
 *  - ⑦ 模式按钮选中态（aria-pressed + 计算样式区分）与四个工具按钮文字化。
 *  - ⑧ 蒙版提交后清空：run 结束（成功/失败）后 node data 的 mask/maskSourceRef/featherRadius 为空。
 *
 * ⚠️ 未覆盖项（实现缺口，见 R-88 报告）：§D 场景A「蒙版重绘页原图缩放 + 坐标映射契约」（卡片 ④）。
 * 实测该页无缩放 HUD / 无滚轮响应，故无法用断言表达其契约——按卡片纪律报告，不造断言迁就实现。
 *
 * 断言强度：全部读**渲染后的可见文本与计算结果**，不读 class 名；缩放律用 HUD 百分比与
 * clamp 边界值双向断言（放大必须变大、缩小必须变小、越界必须停在边界）。
 */

/** 2000×1500 实色 PNG：让「适合画布」≠「100%」，缩放断言才有区分度（1×1 图两者恒等）。 */
async function makeLargeImage(): Promise<string> {
  const buffer = await sharp({
    create: { width: 2000, height: 1500, channels: 3, background: "#5b7a99" },
  }).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

/** 480×360 实色 PNG：蒙版页底图（涂抹层几何 = 原图自然尺寸）。 */
async function makeBaseImage(): Promise<Buffer> {
  return sharp({ create: { width: 480, height: 360, channels: 3, background: "#5b7a99" } }).png().toBuffer();
}

const STUB_RESULT_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const HISTORY_FIXTURE = {
  id: "r88-result-success",
  runId: "r88-run-success",
  image: "",
  nodeId: "node-r88",
  nodeLabel: "R88 验收结果图",
  kind: "result-image",
  projectId: "r88-project-1",
  projectName: "R88 验收项目",
  prompt: "R88 缩放与合并验收",
  model: "gpt-image-2.5-verify",
  startedAt: 1760000000000,
  finishedAt: 1760000001500,
  status: "success",
  ownerName: "E2E 演示用户",
  providerOutputSize: "1024x1024",
  requestedCount: 1,
  successfulCount: 1,
};

/** 用真图替换 fixture 的 image（ImageViewer 与缩略图同源）。 */
function historyFixture(image: string) {
  return [{ ...HISTORY_FIXTURE, image, thumbnail: image }];
}

/** 冷启动收敛到一个可用画布（空工作区 → 点「新建项目」）。 */
async function landOnCanvas(page: Page): Promise<void> {
  const guide = page.getByRole("region", { name: "空工作区" });
  const canvas = page.getByRole("application", { name: "工作流画布" });
  await expect(guide.or(canvas)).toBeVisible();
  if (await guide.isVisible()) {
    await guide.getByRole("button", { name: "新建项目" }).click();
  }
  await expect(canvas).toBeVisible();
}

/**
 * 结果浮层 + 画布就绪的工作区。history 桩提供一条带真图的成功记录，
 * projects 桩返回空列表（避免正式项目列表干扰）。
 */
async function openResultsWorkspace(page: Page): Promise<void> {
  const image = await makeLargeImage();
  await page.route("**/api/history*", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    if (new URL(route.request().url()).pathname === "/api/history/active") {
      await route.fulfill({ json: { records: [], nextCursor: null, hasMore: false } });
      return;
    }
    await route.fulfill({ json: { records: historyFixture(image), nextCursor: null, hasMore: false } });
  });
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ json: [] });
  });
  await page.goto("/");
  await landOnCanvas(page);
}

/** 打开「历史创作记录」浮层（弹层语义：查看器一开就收起，所以每次都显式重开）。 */
async function openResults(page: Page): Promise<Locator> {
  const fab = page.getByRole("button", { name: "历史创作记录", exact: true });
  if (await fab.getAttribute("aria-expanded") !== "true") await fab.click();
  const dialog = page.getByRole("dialog", { name: "历史创作记录" });
  await expect(dialog).toBeVisible();
  const region = dialog.getByRole("region", { name: "最近生成" });
  await expect(region).toBeVisible();
  const card = region.locator(`article:has(img[alt="${HISTORY_FIXTURE.nodeLabel}"])`);
  await expect(card).toBeVisible();
  return card;
}

/** 从结果卡「查看详情」进入 ImageViewer，返回 HUD 定位器。 */
async function openViewerFromCard(page: Page, card: Locator): Promise<Locator> {
  await card.hover();
  await card.locator('button[title="查看详情"]').click();
  const hud = page.locator(".zoom-hud");
  await expect(hud).toBeVisible();
  return hud;
}

async function hudLabel(hud: Locator): Promise<string> {
  return (await hud.innerText()).trim();
}

async function hudPercent(hud: Locator): Promise<number> {
  const label = await hudLabel(hud);
  const match = /^(\d+)%$/.exec(label);
  if (!match) throw new Error(`HUD 不是百分比读数：${label}`);
  return Number(match[1]);
}

/**
 * 走到蒙版重绘页：清干净首屏 → 建 image 节点 → 上传基图 → 工具条「蒙版」。
 * 起点显式清干净（隔离库草稿与 sessionStorage 跨用例共享）。
 */
async function openMaskPage(page: Page): Promise<{
  rail: Locator;
  runButton: Locator;
  imageNode: Locator;
  overlay: Locator;
}> {
  await page.goto("/");
  await landOnCanvas(page);
  const cleared = await page.request.post("/api/projects/initial-draft/force-clear", { data: { confirm: true } });
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
  await landOnCanvas(page);

  const nodes = page.locator(".react-flow__node");
  if (await nodes.count() === 0) {
    const addButton = page.getByRole("button", { name: "添加" });
    const menu = page.getByRole("menu", { name: "添加" });
    await expect(async () => {
      if (!(await menu.isVisible().catch(() => false))) {
        await page.mouse.move(0, 0);
        await addButton.hover();
      }
      await expect(menu).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
    const item = menu.getByRole("menuitem", { name: "图片" });
    await Promise.all([
      page.waitForEvent("filechooser", { timeout: 5_000 }).catch(() => undefined),
      item.click(),
    ]);
  }
  await expect(nodes).toHaveCount(1);

  const imageNodeId = await page.evaluate(async () => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ storeModuleUrl);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((c: { id: string }) => c.id === state.activeTabId);
    return tab?.nodes.find((n: { data: { kind: string } }) => n.data.kind === "image")?.id ?? null;
  });
  const imageNode = page.getByTestId(`rf__node-${imageNodeId}`);
  await imageNode.getByLabel("上传图片").setInputFiles({
    name: "base.png",
    mimeType: "image/png",
    buffer: await makeBaseImage(),
  });
  await expect(imageNode.getByAltText("已上传图片")).toBeVisible();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  const header = imageNode.locator(".gc-node-header");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await imageNode.locator("[data-node-toolbar]").count() > 0) break;
    await header.click();
    await page.waitForTimeout(150);
  }
  await imageNode.locator('[data-node-toolbar="image"]').getByRole("button", { name: "蒙版" }).click();

  const rail = page.getByTestId("mask-redraw-rail");
  await expect(rail).toBeVisible();
  const overlay = page.getByTestId("mask-editor-canvas");
  await expect(overlay).toBeVisible();
  await page.waitForFunction(() => {
    const img = document.querySelector('img[alt="蒙版重绘原图"]') as HTMLImageElement | null;
    return Boolean(img && img.complete && img.naturalWidth > 0);
  });
  return { rail, runButton: page.getByTestId("mask-redraw-run"), imageNode, overlay };
}

interface MaskRunBody {
  onlyNodeId?: string;
}

/**
 * 桩 /api/run-plan + SSE：第 1 次 run 成功（image-node-updated），之后每次失败（node-status error）。
 * 两次都走真实 POST /api/run-plan + SSE 消费路径，失败路径真实进入终态。
 */
async function stubRunPlanSuccessThenError(page: Page, successUrl: string): Promise<void> {
  const nodeIdByRun = new Map<string, string>();
  let runSequence = 0;
  await page.route("**/api/run-plan**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/run-plan" && request.method() === "POST") {
      const body = request.postDataJSON() as MaskRunBody;
      const runId = `e2e-r88-mask-${++runSequence}`;
      nodeIdByRun.set(runId, body.onlyNodeId ?? "");
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ runId, status: "queued" }),
      });
      return;
    }
    const match = pathname.match(/^\/api\/run-plan\/([^/]+)(\/events)?$/);
    if (!match) {
      await route.abort("blockedbyclient");
      return;
    }
    const runId = decodeURIComponent(match[1]);
    const nodeId = nodeIdByRun.get(runId);
    if (!nodeId) throw new Error(`桩不认识的运行 ${runId}`);
    if (match[2] !== "/events") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: runId, status: "running" }),
      });
      return;
    }
    const now = Date.now();
    const isFirstRun = runSequence === 1;
    const events = isFirstRun
      ? [
          { seq: 1, type: "node-status", nodeId, status: "running", startedAt: now },
          {
            seq: 2,
            type: "image-node-updated",
            nodeId,
            runId,
            urls: [successUrl],
            model: "e2e-r88-model",
            prompts: ["e2e r88"],
            providerOutputSizes: [null],
          },
          {
            seq: 3,
            type: "node-status",
            nodeId,
            status: "success",
            images: [successUrl],
            model: "e2e-r88-model",
            prompts: ["e2e r88"],
            startedAt: now,
            finishedAt: now + 25,
          },
          { seq: 4, type: "done" },
        ]
      : [
          { seq: 1, type: "node-status", nodeId, status: "running", startedAt: now },
          {
            seq: 2,
            type: "node-status",
            nodeId,
            status: "error",
            error: "e2e r88 模拟重绘失败",
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
  });
}

/** 读取 image 节点 data 的蒙版相关字段（清空断言的唯一事实源）。 */
async function maskFields(page: Page, nodeId: string) {
  return page.evaluate(async (id) => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ storeModuleUrl);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((c: { id: string }) => c.id === state.activeTabId);
    const node = tab?.nodes.find((n: { id: string }) => n.id === id);
    const data = (node?.data ?? {}) as Record<string, unknown>;
    return {
      mask: data.mask,
      maskSourceRef: data.maskSourceRef,
      featherRadius: data.featherRadius,
      editPrompt: data.editPrompt,
      editInputRef: data.editInputRef,
    };
  }, nodeId);
}

async function nodeIdOfImage(page: Page): Promise<string> {
  const id = await page.evaluate(async () => {
    const storeModuleUrl = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ storeModuleUrl);
    const state = store.useFlowStore.getState();
    const tab = state.tabs.find((c: { id: string }) => c.id === state.activeTabId);
    return tab?.nodes.find((n: { data: { kind: string } }) => n.data.kind === "image")?.id ?? null;
  });
  if (!id) throw new Error("当前文档里没有 image 节点");
  return id;
}

/** 在蒙版画布上真实涂抹一笔（按下 → 移动 → 抬起）。 */
async function paintMask(page: Page, overlay: Locator): Promise<void> {
  const box = await overlay.boundingBox();
  expect(box, "蒙版编辑器画布必须可见可命中").not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.3, box!.y + box!.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.7, box!.y + box!.height * 0.7, { steps: 12 });
  await page.mouse.up();
}

// ---------------------------------------------------------------------------

test("result card opens the viewer directly and the sidebar carries the merged record fields", async ({ page }) => {
  test.setTimeout(60_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await openResultsWorkspace(page);
  const card = await openResults(page);
  const hud = await openViewerFromCard(page, card);

  // ---------- ⑤ 两页合并：不再出现「结果详情」弹窗 ----------
  await expect(
    page.getByRole("dialog", { name: "结果详情" }),
    "点「查看详情」后不得再出现旧的「结果详情」弹窗（R-87 §E 已删除 ResultDetailDialog）",
  ).toHaveCount(0);

  // ---------- ⑤ 侧边栏迁移字段：节点类型 / 上游实际尺寸（新增）+ 模型 / 开始时间（既有） ----------
  const sidebar = page.locator("aside");
  await expect(sidebar).toBeVisible();
  const dl = sidebar.locator("dl");
  await expect(dl).toContainText("节点类型");
  await expect(dl).toContainText("上游实际尺寸");
  await expect(dl).toContainText("模型");
  await expect(dl).toContainText("开始时间");
  // 值必须来自当前记录（不是占位「—」）：节点类型取 nodeTitleForKind(result-image) = 「图片结果」。
  await expect(dl).toContainText("图片结果");
  await expect(dl).toContainText(HISTORY_FIXTURE.providerOutputSize);
  await expect(dl).toContainText(HISTORY_FIXTURE.model);
  await expect(sidebar).toContainText(HISTORY_FIXTURE.nodeLabel);

  // ---------- Esc 关闭 ----------
  await page.keyboard.press("Escape");
  await expect(hud).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test("viewer zoom contract: wheel / double-click anchors / ± step / 25%–400% clamp / HUD reset", async ({ page }) => {
  test.setTimeout(90_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await openResultsWorkspace(page);
  const card = await openResults(page);
  const hud = await openViewerFromCard(page, card);
  const area = page.locator("#viewer-image-area");
  await expect(area).toBeVisible();

  // ---------- 初始锚点 = 适合画布（plan.md §D：默认 Fit，非 100%） ----------
  await expect(hud, "打开查看器必须落在「适合画布」锚点").toHaveText("适合画布");
  const areaBox = await area.boundingBox();
  expect(areaBox, "查看器图片区必须可见").not.toBeNull();
  const center = { x: areaBox!.x + areaBox!.width / 2, y: areaBox!.y + areaBox!.height / 2 };
  // 双击落点：容器中部（避开顶部操作栏 z-10 的指针拦截，也避开右下角 HUD pill）。
  const dbl = { x: areaBox!.width / 2, y: areaBox!.height * 0.6 };
  await page.mouse.move(center.x, center.y);

  // ---------- 滚轮缩放：向上必须放大、向下必须缩小（HUD 百分比单调变化） ----------
  await page.mouse.wheel(0, -300);
  await expect.poll(() => hudLabel(hud)).toMatch(/^\d+%$/);
  const wheelA = await hudPercent(hud);
  await page.mouse.wheel(0, -300);
  const wheelB = await hudPercent(hud);
  expect(wheelB, `滚轮向上必须继续放大（实测 ${wheelA}% → ${wheelB}%）`).toBeGreaterThan(wheelA);
  await page.mouse.wheel(0, 300);
  const wheelC = await hudPercent(hud);
  expect(wheelC, `滚轮向下必须缩小（实测 ${wheelB}% → ${wheelC}%）`).toBeLessThan(wheelB);

  // ---------- 双击：适合画布 ↔ 100% 往返（当前非 fit，第一次双击回 Fit，第二次到 100%） ----------
  await area.dblclick({ position: dbl });
  await expect(hud, "双击必须切到「适合画布」锚点").toHaveText("适合画布");
  await area.dblclick({ position: dbl });
  await expect(hud, "再次双击必须切到 100% 锚点").toHaveText("100%");
  await area.dblclick({ position: dbl });
  await expect(hud, "第三次双击必须切回「适合画布」锚点").toHaveText("适合画布");

  // ---------- ± 按钮：固定步进（ZOOM_STEP = 0.1） ----------
  const zoomIn = page.getByRole("button", { name: "放大", exact: true });
  const zoomOut = page.getByRole("button", { name: "缩小", exact: true });
  await area.dblclick({ position: dbl }); // fit → 100%
  await expect(hud).toHaveText("100%");
  await zoomIn.click();
  await expect(hud, "「放大」按钮必须按 ZOOM_STEP 步进到 110%").toHaveText("110%");
  await zoomIn.click();
  await expect(hud).toHaveText("120%");
  await zoomOut.click();
  await expect(hud, "「缩小」按钮必须回退到 110%").toHaveText("110%");

  // ---------- 范围 clamp：上限 400% / 下限 25%（ImageViewer MIN_SCALE/MAX_SCALE） ----------
  await page.mouse.move(center.x, center.y);
  for (let i = 0; i < 60; i += 1) await page.mouse.wheel(0, -400);
  await expect(hud, "连续放大必须停在 400% 上限（不得越界）").toHaveText("400%");
  await expect(zoomIn, "到达上限后「放大」按钮必须 disabled").toBeDisabled();
  for (let i = 0; i < 120; i += 1) await page.mouse.wheel(0, 400);
  await expect(hud, "连续缩小必须停在 25% 下限（不得越界）").toHaveText("25%");
  await expect(zoomOut, "到达下限后「缩小」按钮必须 disabled").toBeDisabled();

  // ---------- HUD 可点击重置为适合画布 ----------
  await zoomIn.click();
  await expect(hud).not.toHaveText("适合画布");
  await hud.click();
  await expect(hud, "点击缩放 HUD 必须重置为「适合画布」").toHaveText("适合画布");

  // ---------- Esc 关闭查看器 ----------
  await page.keyboard.press("Escape");
  await expect(hud, "Esc 必须关闭查看器").toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test("mask redraw rail: save button removed, auto-save subtitle, mode selection state, and tool button labels", async ({ page }) => {
  test.setTimeout(90_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const { rail } = await openMaskPage(page);

  // ---------- ⑥ 按钮区：删除「保存蒙版」次按钮 + 保留自动保存副标题 ----------
  await expect(
    page.getByTestId("mask-redraw-save"),
    "R-87 §2.1 已删除「保存蒙版」次按钮：mask-redraw-save 不得存在",
  ).toHaveCount(0);
  await expect(rail).toContainText("每次提交自动保存蒙版");
  await expect(page.getByTestId("mask-redraw-run")).toBeVisible();

  // ---------- ⑦ 模式按钮选中态：edit 默认选中 → aria-pressed 与计算样式双通道可辨 ----------
  const editMode = rail.getByRole("button", { name: "涂抹修改区" });
  const preserveMode = rail.getByRole("button", { name: "恢复保留区" });
  await expect(editMode).toHaveAttribute("aria-pressed", "true");
  await expect(preserveMode).toHaveAttribute("aria-pressed", "false");

  const readStyle = (locator: Locator) => locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, weight: style.fontWeight, border: style.borderTopStyle };
  });
  const editOn = await readStyle(editMode);
  const preserveOff = await readStyle(preserveMode);
  expect(
    editOn.background !== preserveOff.background || editOn.weight !== preserveOff.weight,
    `选中态必须能被计算样式区分（选中 bg=${editOn.background}/w=${editOn.weight}，未选中 bg=${preserveOff.background}/w=${preserveOff.weight}）`,
  ).toBe(true);

  await preserveMode.click();
  await expect(preserveMode).toHaveAttribute("aria-pressed", "true");
  await expect(editMode).toHaveAttribute("aria-pressed", "false");
  const preserveOn = await readStyle(preserveMode);
  const editOff = await readStyle(editMode);
  // 选中态与未选中态互换后仍必须可辨（防「只有第一个按钮有底色」的伪实现）。
  expect(
    preserveOn.background !== editOff.background || preserveOn.weight !== editOff.weight,
    "切换模式后选中/未选中样式必须同步跟随",
  ).toBe(true);
  // 恢复默认，避免影响后续断言。
  await editMode.click();

  // ---------- ⑦ 四个工具按钮文字化：图标之外必须有可见中文标签 ----------
  for (const label of ["撤销", "重做", "清空", "反选"]) {
    const button = rail.getByRole("button", { name: label, exact: true });
    await expect(button, `工具按钮「${label}」必须可见`).toBeVisible();
    await expect(button, `工具按钮「${label}」必须带可见文字，而非只有图标`).toContainText(label);
  }

  expect(pageErrors).toEqual([]);
});

test("mask redraw run clears the mask fields on both success and failure", async ({ page }) => {
  test.setTimeout(90_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const { rail, runButton, overlay } = await openMaskPage(page);
  const imageNodeId = await nodeIdOfImage(page);
  // 成功产物用 480×360 实色 PNG：run#1 成功后底图被替换，仍需可涂抹以发起 run#2
  // （若用 1×1 图，第二次涂抹会覆盖整张画布而被前端校验拦下，测不到失败路径）。
  const successImage = `data:image/png;base64,${(await makeBaseImage()).toString("base64")}`;
  await stubRunPlanSuccessThenError(page, successImage);

  const promptInput = rail.getByRole("textbox");
  await promptInput.fill("把背景改成米色");
  await expect(runButton).toBeEnabled();
  await paintMask(page, overlay);

  // ---------- ⑧ 成功路径：run 结束后 mask 三字段清空 ----------
  await runButton.click();
  await expect(page.getByTestId("mask-redraw-note")).toHaveText("重绘完成");
  const afterSuccess = await maskFields(page, imageNodeId);
  expect(afterSuccess.mask, "成功 run 后 mask 必须清空").toBeUndefined();
  expect(afterSuccess.maskSourceRef, "成功 run 后 maskSourceRef 必须清空").toBeUndefined();
  expect(afterSuccess.featherRadius, "成功 run 后 featherRadius 必须清空").toBeUndefined();

  // ---------- ⑧ 失败路径：同样清空（R-87 review 漏掉的就是这条） ----------
  await promptInput.fill("再改成蓝色");
  await expect(runButton).toBeEnabled();
  await paintMask(page, overlay);
  await runButton.click();
  await expect(page.getByTestId("mask-redraw-note")).toHaveText("重绘未完成，请查看节点状态");
  const afterFailure = await maskFields(page, imageNodeId);
  expect(afterFailure.mask, "失败 run 后 mask 必须清空（不得残留导致下次打开带旧蒙版）").toBeUndefined();
  expect(afterFailure.maskSourceRef, "失败 run 后 maskSourceRef 必须清空").toBeUndefined();
  expect(afterFailure.featherRadius, "失败 run 后 featherRadius 必须清空").toBeUndefined();

  expect(pageErrors).toEqual([]);
});
