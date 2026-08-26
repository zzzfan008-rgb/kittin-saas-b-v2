import type { Locator } from "@playwright/test";
import {
  WORKFLOW_SCHEMA_VERSION,
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

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
  await expect(page.getByText(/正在确认运行历史|运行历史同步失败/)).toHaveCount(0);
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

  // React Flow 的 .selected 投影必须与 store 的 canonical selection 同步。
  await nodeHeader.click();
  await expect(node).toHaveClass(/\bselected\b/);
  await expect(selectedNodes).toHaveCount(1);

  // Clipboard and Inspector share the same derived primary selection. The pasted
  // node becomes the sole selection, and one undo removes the whole paste action.
  await page.keyboard.press(`${modifier}+c`);
  await page.keyboard.press(`${modifier}+v`);
  await expect(nodes).toHaveCount(initialNodeCount + 1);
  await expect(selectedNodes).toHaveCount(1);
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
  await page.mouse.up();

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

  await page.keyboard.press(`${modifier}+Shift+z`);
  await expect.poll(
    () => node.evaluate((element) => (element as HTMLElement).style.transform),
  ).toBe(endTransform);
});

test("docks preserve canvas identity, geometry, focus, and results", async ({ page }, testInfo) => {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Desktop viewport is required");

  const leftToggle = page.getByRole("button", { name: "节点 / 素材" });
  const rightToggle = page.getByRole("button", { name: "属性 / 结果" });
  const leftRail = page.getByRole("navigation", { name: "工作台左侧工具" });
  const rightRail = page.getByRole("navigation", { name: "工作台右侧工具" });
  const leftPanel = page.locator("#workbench-library-panel");
  const rightPanel = page.locator("#workbench-inspector-panel");
  const canvas = page.getByRole("application", { name: "工作流画布" });
  const originalCanvas = await canvas.elementHandle();
  if (!originalCanvas) throw new Error("Canvas element is missing");
  const originalTransform = await page.locator(".react-flow__viewport").evaluate(
    (element) => getComputedStyle(element).transform,
  );

  await expect(leftToggle).toHaveAttribute("aria-expanded", "false");
  await expect(rightToggle).toHaveAttribute("aria-expanded", "false");
  await expect(leftPanel).toHaveAttribute("aria-hidden", "true");
  await expect(rightPanel).toHaveAttribute("aria-hidden", "true");
  await expectInert(leftPanel, true);
  await expectInert(rightPanel, true);
  await expectWidth(leftPanel, 0);
  await expectWidth(rightPanel, 0);
  await expectWidth(leftRail, 48);
  await expectWidth(rightRail, 48);
  await expectWidth(canvas, viewport.width - 96);

  // 右侧单开：不能覆盖画布、Controls 或 MiniMap。
  await rightToggle.click();
  await expect(rightToggle).toBeFocused();
  await expect(rightToggle).toHaveAttribute("aria-expanded", "true");
  await expect(rightPanel).toHaveAttribute("aria-hidden", "false");
  await expectInert(rightPanel, false);
  await expectWidth(rightPanel, 320);
  await expectWidth(canvas, viewport.width - 416);

  const rightOnlyCanvasRect = await rect(canvas);
  expect(Math.abs(rightOnlyCanvasRect.right - (await rect(rightPanel)).left)).toBeLessThanOrEqual(1);
  expectInside(await rect(page.locator(".react-flow__controls")), rightOnlyCanvasRect);
  expectInside(await rect(page.locator(".react-flow__minimap")), rightOnlyCanvasRect);

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

  await rightToggle.click();
  await expect(rightPanel).toHaveAttribute("aria-hidden", "true");
  await expectInert(rightPanel, true);
  await expectWidth(rightPanel, 0);
  await expectWidth(canvas, viewport.width - 96);
  await page.keyboard.press("Shift+Tab");
  const rightClosedFocus = await rightPanel.evaluate((panel) => ({
    inside: panel.contains(document.activeElement),
    tag: document.activeElement?.tagName,
  }));
  expect(rightClosedFocus.inside).toBe(false);
  expect(rightClosedFocus.tag).not.toBe("BODY");

  await rightToggle.click();
  await expect(resultsPanel).toBeVisible();
  expect(await resultsRegion.evaluate((current, original) => current === original, originalResultsRegion)).toBe(true);
  await expect.poll(async () => resultsScroller.evaluate((element) => element.scrollTop)).toBe(37);
  await rightToggle.click();
  await expectWidth(rightPanel, 0);

  // 左侧单开：Tab 应进入节点库；随后验证双 Dock 的完整几何。
  await leftToggle.click();
  await expect(leftToggle).toBeFocused();
  await expect(leftToggle).toHaveAttribute("aria-expanded", "true");
  await expect(leftPanel).toHaveAttribute("aria-hidden", "false");
  await expectInert(leftPanel, false);
  await expectWidth(leftPanel, 240);
  await expectWidth(canvas, viewport.width - 336);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "节点库" })).toBeFocused();
  const sessionBeforeDomFocus = await page.evaluate(() => (
    window.sessionStorage.getItem("garment-canvas-project-tabs")
  ));
  await leftToggle.focus();
  await expect.poll(() => page.evaluate(() => (
    window.sessionStorage.getItem("garment-canvas-project-tabs")
  ))).toBe(sessionBeforeDomFocus);

  await rightToggle.click();
  await expectInert(rightPanel, false);
  await expectWidth(rightPanel, 320);
  await expectWidth(canvas, viewport.width - 656);

  const leftPanelRect = await rect(leftPanel);
  const canvasRect = await rect(canvas);
  const rightPanelRect = await rect(rightPanel);
  expect(Math.abs(leftPanelRect.right - canvasRect.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(canvasRect.right - rightPanelRect.left)).toBeLessThanOrEqual(1);
  expectInside(await rect(page.locator(".react-flow__controls")), canvasRect);
  expectInside(await rect(page.locator(".react-flow__minimap")), canvasRect);

  // 模板浮层必须按双 Dock 后的中心宽度收缩，不能被画布容器裁切。
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
  const templatesToggle = page.getByRole("button", { name: /模板库/ });
  await templatesToggle.click();
  await expect(templatesToggle).toHaveAttribute("aria-expanded", "true");
  const templatesPanel = page.getByRole("region", { name: "工作流模板" });
  await expect(templatesPanel).toBeVisible();
  const templateCards = templatesPanel.getByTitle("从模板新建");
  await expect(templateCards).toHaveCount(TEMPLATE_FIXTURES.length);
  await expect(templateCards.first()).toBeVisible();
  const expectedTemplatesWidth = Math.min(660, canvasRect.width - 16);
  await expect.poll(async () => (
    Math.abs((await rect(templatesPanel)).width - expectedTemplatesWidth)
  )).toBeLessThanOrEqual(1);
  const templatesPanelRect = await rect(templatesPanel);
  expectInside(templatesPanelRect, canvasRect);
  expect(templatesPanelRect.left).toBeGreaterThanOrEqual(canvasRect.left + 7);
  expect(templatesPanelRect.right).toBeLessThanOrEqual(canvasRect.right - 7);
  const templatesScroller = templatesPanel.locator('[data-slot="templates-scroll-area"]');
  expect(await templatesScroller.evaluate(
    (element) => element.scrollWidth <= element.clientWidth + 1,
  )).toBe(true);
  const templateGrid = templatesPanel.locator('[data-slot="templates-grid"]');
  const expectedTemplateColumns = viewport.width === 1024 ? 2 : 3;
  expect(await templateGrid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
  )).toBe(expectedTemplateColumns);
  await testInfo.attach(`desktop-${viewport.width}-both-docks-template`, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  const closeTemplates = templatesPanel.getByRole("button", { name: "关闭 Esc" });
  await closeTemplates.focus();
  await page.keyboard.press("Escape");
  await expect(templatesToggle).toHaveAttribute("aria-expanded", "false");
  await expect(templatesPanel).toHaveCount(0);
  await expect(templatesToggle).toBeFocused();

  await templatesToggle.click();
  await expect(templateCards).toHaveCount(TEMPLATE_FIXTURES.length);
  const saveTemplateButton = templatesPanel.getByRole("button", { name: "当前画布存为模板" });
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
  await expect(templatesPanel).toBeVisible();
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
  await templatesPanel.getByRole("button", { name: "关闭 Esc" }).click();
  await expect(templatesPanel).toHaveCount(0);
  await expect(templatesToggle).toBeFocused();

  await resultsScroller.locator("[data-e2e-scroll-filler='true']").evaluate((element) => element.remove());
  await page.mouse.move(canvasRect.left + canvasRect.width / 2, canvasRect.top + 20);
  await page.waitForTimeout(300);

  await testInfo.attach(`desktop-${viewport.width}-both-docks`, {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  await rightToggle.click();
  await expect(rightToggle).toBeFocused();
  await expect(rightPanel).toHaveAttribute("aria-hidden", "true");
  await expectInert(rightPanel, true);
  await expectWidth(rightPanel, 0);
  await expectWidth(canvas, viewport.width - 336);

  await leftToggle.click();
  await expect(leftToggle).toBeFocused();
  await expect(leftPanel).toHaveAttribute("aria-hidden", "true");
  await expectInert(leftPanel, true);
  await expectWidth(leftPanel, 0);
  await expectWidth(canvas, viewport.width - 96);
  await page.keyboard.press("Tab");
  expect(await leftPanel.evaluate((panel) => panel.contains(document.activeElement))).toBe(false);

  expect(await canvas.evaluate((current, original) => current === original, originalCanvas)).toBe(true);
  await expect.poll(async () => page.locator(".react-flow__viewport").evaluate(
    (element) => getComputedStyle(element).transform,
  )).toBe(originalTransform);
});

test("theme picker reports state and restores focus", async ({ page }) => {
  const choices = [
    { label: "简白", id: "white" },
    { label: "护眼绿", id: "eye" },
    { label: "经典暗金", id: "current" },
  ];

  for (const choice of choices) {
    const trigger = page.getByRole("button", { name: /^切换主题，当前为/ });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: new RegExp(`^${choice.label}`) }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", choice.id);
    const updatedTrigger = page.getByRole("button", { name: `切换主题，当前为${choice.label}` });
    await expect(updatedTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#theme-picker-options")).toHaveCount(0);
    await expect(updatedTrigger).toBeFocused();
  }

  const trigger = page.getByRole("button", { name: /^切换主题，当前为/ });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: /^简白/ }).focus();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});
