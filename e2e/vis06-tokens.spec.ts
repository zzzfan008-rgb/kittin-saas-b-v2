import type { Page } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "./fixtures";

/**
 * VIS-06 门禁：小地图 / 序号徽章 / 滚动条三件套的视觉证据 + 色值可追溯。
 *
 * 事实源：src/index.css 的 --gc-* token（项目唯一 token 文件）。
 * 本 spec 在三主题（current / white / eye）下：
 *  1. 断言渲染色（minimap 节点/遮罩、徽章底色与描边、滚动条 thumb）
 *     与 token 经浏览器解析后的颜色一致；
 *  2. 输出截图到 test-results/vis06/（gitignored，作为任务附件交付）。
 *
 * 场景搭建复用 golden-path 的「模特试穿」模板：输入层两张图 → 生成器，
 * 选中生成器后源图节点出现序号徽章 1/2。
 */

const GENERATOR_NODE_ID = "tryon-gen";

const THEME_EXPECTED = {
  current: {
    minimapNode: "#9ba1a9",
    mask: "rgba(10,10,10,0.7)",
    borderStrong: "#454a53",
  },
  white: {
    minimapNode: "rgba(0,0,0,0.45)",
    mask: "rgba(29,29,31,0.08)",
    borderStrong: "rgba(0,0,0,0.16)",
  },
  eye: {
    minimapNode: "#47685A",
    mask: "rgba(48,69,43,0.15)",
    borderStrong: "#a8c2ac",
  },
} as const;

const BADGE_OVERLAY = "rgba(0,0,0,0.62)";
const BADGE_BORDER = "#ffffff";

const SHOT_DIR = resolve("test-results/vis06");

/** 用 canvas fillStyle 把任意颜色归一到 rgba() 串，便于跨格式比较。 */
async function normalizeColor(page: Page, color: string): Promise<string> {
  return page.evaluate((raw) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = "#000";
    ctx.fillStyle = raw;
    return ctx.fillStyle;
  }, color);
}

/** 读取页面上实际渲染的元素颜色集合（fill 属性 / computed style）。 */
async function minimapFills(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const svg = document.querySelector(".react-flow__minimap svg");
    if (!svg) return [];
    return Array.from(svg.querySelectorAll<SVGRectElement | SVGPathElement>("rect,path"))
      .map((rect) => {
        const attr = rect.getAttribute("fill");
        if (attr) return attr;
        return getComputedStyle(rect).fill;
      })
      .filter((value): value is string => Boolean(value));
  });
}

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
  const guide = page.getByRole("region", { name: "空工作区" });
  await expect(guide).toBeVisible();
  await guide.getByRole("button", { name: "新建项目" }).click();
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
}

async function selectCanvasNode(page: Page, testId: string): Promise<void> {
  const node = page.getByTestId(testId);
  const header = node.locator(".gc-node-header");
  await expect(header).toBeVisible();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await node.locator("[data-node-toolbar]").count() > 0) return;
    await header.click();
    await page.waitForTimeout(150);
  }
  await expect(node.locator("[data-node-toolbar]")).toHaveCount(1);
}

test("VIS-06: minimap / ordinal badge / scrollbar colors trace to tokens (3 themes)", async ({ page }) => {
  mkdirSync(SHOT_DIR, { recursive: true });
  const garmentImage = await sharp({
    create: { width: 96, height: 64, channels: 3, background: "#735b42" },
  }).png().toBuffer();
  const modelImage = await sharp({
    create: { width: 64, height: 96, channels: 3, background: "#2f4858" },
  }).png().toBuffer();

  page.on("filechooser", (chooser) => {
    void chooser.setFiles([]);
  });

  await page.goto("/");
  await openEmptyFirstScreen(page);

  // 模板落地：左侧工具胶囊 → AI 换装工作流 → 模特试穿
  const workflowRail = page.getByRole("navigation", { name: "工作台左侧工具" });
  await workflowRail.getByRole("button", { name: "AI 换装工作流" }).hover();
  const tryonMenu = page.getByRole("menu", { name: "AI 换装工作流" });
  await expect(tryonMenu).toBeVisible();
  await tryonMenu.getByRole("menuitem", { name: "模特试穿" }).click();

  const garmentNode = page.getByTestId("rf__node-garment");
  const modelNode = page.getByTestId("rf__node-model");
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

  // 选中生成器：两个源图节点出现序号徽章
  await selectCanvasNode(page, `rf__node-${GENERATOR_NODE_ID}`);
  await expect(page.locator(".ref-ordinal-badge")).toHaveCount(2);

  for (const theme of ["current", "white", "eye"] as const) {
    const expected = THEME_EXPECTED[theme];
    // 经生产代码 applyTheme 切主题（设置属性 + 持久化 + 通知 React 重渲染，
    // minimap 的 maskColor prop 才会随之更新）
    await page.evaluate(async (value) => {
      const themeModuleUrl = "/src/lib/theme.ts";
      const themeModule = await import(/* @vite-ignore */ themeModuleUrl);
      themeModule.applyTheme(value);
    }, theme);
    await page.waitForTimeout(200);

    // ---------- token 原始值追溯（事实源 = src/index.css） ----------
    const rawTokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        minimapNode: styles.getPropertyValue("--gc-minimap-node").trim(),
        textMuted: styles.getPropertyValue("--gc-text-muted").trim(),
        maskCurrent: styles.getPropertyValue("--gc-canvas-mask-current").trim(),
        maskWhite: styles.getPropertyValue("--gc-canvas-mask-white").trim(),
        maskEye: styles.getPropertyValue("--gc-canvas-mask-eye").trim(),
        borderStrong: styles.getPropertyValue("--gc-border-strong").trim(),
        mediaOverlay: styles.getPropertyValue("--gc-media-overlay").trim(),
        nodeMain: styles.getPropertyValue("--gc-node-main").trim(),
      };
    });
    console.log(`[VIS-06][${theme}] raw tokens: ${JSON.stringify(rawTokens)}`);

    // --gc-minimap-node 在三主题下解析后的计算值必须等于 D-2 裁定色
    // （current/eye 定义为 var(--gc-text-muted)，白色主题为字面 rgba）
    expect(await normalizeColor(page, rawTokens.minimapNode))
      .toBe(await normalizeColor(page, expected.minimapNode));

    // ---------- 小地图：节点色 + 遮罩色的实际渲染 ----------
    const fills = await minimapFills(page);
    const normFills = await Promise.all(fills.map((f) => normalizeColor(page, f)));
    const wantNode = await normalizeColor(page, expected.minimapNode);
    const wantMask = await normalizeColor(page, expected.mask);
    console.log(`[VIS-06][${theme}] minimap rendered fills: ${JSON.stringify(normFills)}`);
    expect(normFills, "小地图节点色必须 = --gc-minimap-node").toContain(wantNode);
    expect(normFills, "小地图遮罩色必须 = --gc-canvas-mask-*").toContain(wantMask);

    // ---------- 序号徽章：底色 / 文字 / 描边 ----------
    const badgeStyle = await page.locator(".ref-ordinal-badge").first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, border: cs.borderColor, color: cs.color };
    });
    console.log(`[VIS-06][${theme}] badge computed: ${JSON.stringify(badgeStyle)}`);
    expect(await normalizeColor(page, badgeStyle.bg)).toBe(await normalizeColor(page, BADGE_OVERLAY));
    expect(await normalizeColor(page, badgeStyle.border)).toBe(await normalizeColor(page, BADGE_BORDER));

    // 截图：画布（徽章 + 小地图同框）
    await page.screenshot({ path: resolve(SHOT_DIR, `${theme}-canvas.png`) });

    // ---------- 滚动条：功能下拉列表（压低视口保证列表溢出滚动） ----------
    await page.setViewportSize({ width: 1280, height: 500 });
    const generatorNode = page.getByTestId(`rf__node-${GENERATOR_NODE_ID}`);
    await generatorNode.getByRole("combobox", { name: "功能" }).click();
    const listbox = page.locator('[role="listbox"]').last();
    await expect(listbox).toBeVisible();
    await page.waitForTimeout(150);

    const thumb = await listbox.evaluate((el) => ({
      bg: getComputedStyle(el, "::-webkit-scrollbar-thumb").backgroundColor,
      scrollable: el.scrollHeight > el.clientHeight,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    console.log(`[VIS-06][${theme}] scrollbar thumb: ${JSON.stringify(thumb)}`);
    expect(await normalizeColor(page, thumb.bg)).toBe(await normalizeColor(page, expected.borderStrong));

    await page.screenshot({ path: resolve(SHOT_DIR, `${theme}-scrollbar.png`) });
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 1280, height: 720 });
  }

  expect(await page.getByText("页面出现异常").count()).toBe(0);
});
