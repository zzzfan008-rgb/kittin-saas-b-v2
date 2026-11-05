/**
 * e2e 交互加固助手（2026-10-30 复盘第 1 项）。
 *
 * 背景：近 3 周 139 次 CI run 里 30 次红（22%），其中 e2e 占 87%。逐条追下来，
 * 失败不是产品坏了，而是**交互写法本身不稳**：
 *   - 指针点击会被右下角 minimap / 浮层拦截（CI desktop-1280 实测
 *     `react-flow__minimap-svg … subtree intercepts pointer events`）；
 *   - 盲轮询（toPass + 每次 count==0 就重开）在画布重渲染时会陷入开/关循环；
 *   - 入场动画 zoom-in-95 会把包围盒临时缩到 95%，动画中途量尺寸必然偏小。
 *
 * 这三个助手把上述三类噪声收敛到一处，spec 里只表达意图。
 */
import { expect, type Locator, type Page } from "@playwright/test";

/**
 * 默认弹层：base-ui 的 select-popup（min-width 兜底写在它身上）。
 * 原生 listbox 的形态由调用方用 options.popup 显式传入——两者混在一个选择器里时
 * `.last()` 会命中内层 listbox（min-width 为 0），断言就量错了元素。
 */
const POPUP_SELECTOR = '[data-slot="select-popup"][data-open]';

/**
 * 键盘优先打开下拉：focus + Enter 是真实可达路径，且不受遮挡影响；
 * 只有键盘打不开时才回退到 force click。返回已可见的弹层 locator。
 */
export async function openCombobox(
  page: Page,
  trigger: Locator,
  options: { popup?: Locator; attempts?: number } = {},
): Promise<Locator> {
  const popup = options.popup ?? page.locator(POPUP_SELECTOR).last();
  const attempts = options.attempts ?? 3;
  await expect(trigger).toBeVisible();
  await trigger.scrollIntoViewIfNeeded();
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await popup.count() === 0) {
      await trigger.focus();
      await page.keyboard.press("Enter");
      if (await popup.count() === 0) await trigger.click({ force: true });
    }
    try {
      await expect(popup).toBeVisible({ timeout: 4_000 });
      return popup;
    } catch {
      // 画布重渲染会收起刚打开的下拉，下一轮重试即可。
    }
    if (attempt < attempts - 1) await page.waitForTimeout(300);
  }
  throw new Error(`下拉在 ${attempts} 次尝试后仍未打开`);
}

/** 等元素自身的入场动画（zoom-in / fade-in）结束，再量几何。 */
export async function waitForAnimationsSettled(locator: Locator): Promise<void> {
  await locator.evaluate(async (el: Element) => {
    const animations = typeof el.getAnimations === "function" ? el.getAnimations() : [];
    await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
  });
}

/**
 * 断言弹层没有塌缩：以**计算样式 min-width** 为准（不受入场动画缩放影响），
 * 渲染宽度只作为诊断返回值，由调用方决定是否硬断言。
 */
export async function expectNotCollapsed(locator: Locator, minWidth = 128): Promise<number> {
  const computed = await locator.evaluate((el) => Number.parseFloat(getComputedStyle(el).minWidth));
  expect(computed, `弹层 min-width 计算值不得低于 ${minWidth}px`).toBeGreaterThanOrEqual(minWidth);
  await waitForAnimationsSettled(locator);
  return (await locator.boundingBox())?.width ?? 0;
}
