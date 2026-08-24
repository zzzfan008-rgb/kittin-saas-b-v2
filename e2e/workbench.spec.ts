import type { Locator } from "@playwright/test";
import { expect, test } from "./fixtures";

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

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
  await leftToggle.focus();

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
