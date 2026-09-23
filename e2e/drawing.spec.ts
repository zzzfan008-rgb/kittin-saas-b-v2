import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/**
 * 卡 #60 机检验收：AI 画板主链路。
 *
 * 覆盖「打开画板 → 作画 → 导出 PNG → 画板关闭 → 画布出现 image 节点 → 图片可预览」，
 * 并锁死几条容易悄悄退化的性质：
 *  1. 画板层是全屏覆盖层（几何 == 视口、position: fixed、z-index 顶层），且**不重建 React Flow**
 *     （同一 .react-flow 实例、页签数不变）—— 卡 #60 明确要求「不新建文档、不重建 React Flow」；
 *  2. **绘画面必须可被指针命中**（elementFromPoint 的命中栈里必须有 excalidraw 交互 canvas）。
 *     这条是根因级断言：Excalidraw 是绝对定位的无限画布，一旦它的样式表没生效，
 *     canvas 会退回 static 流式布局、被挤出视口，用户点不到、画不上，而「画板打开了」仍然为真。
 *  3. 作画成功的判据用 Excalidraw 自己的 toolbar 「撤销」按钮 enabled（空场景 disabled），
 *     不依赖任何 class 名或坐标魔法。
 *  4. 导出走的是真上传链路：断言导出后的图片节点 src 来自 POST /api/files 的响应，且 naturalWidth > 0。
 *  5. AGENTS.md §6：桌面 UI 在三档宽度断言渲染几何（这里锁画板覆盖层在 1024/1280/1440 都等于视口）。
 *
 * 场景搭建（空工作区 → 新建本地空白页签）与 golden-path.spec.ts 的 openEmptyFirstScreen 同源：
 * 决策 4 之后登录落「空工作区」，而画板入口所在的悬浮工具栏在空工作区是隐藏的，必须有页签才谈得上入口。
 */

const TABS = 'nav[aria-label="项目画布页签"] button';
const DIALOG_NAME = "Excalidraw 画板";
const VIEWPORTS = [
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

async function openWorkspaceWithTab(page: Page): Promise<void> {
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

test("[drawing] AI 画板：作画 → 导出 PNG → 画布出现可预览的图片节点，且不重建画布", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto("/");
  await openWorkspaceWithTab(page);

  const canvas = page.getByRole("application", { name: "工作流画布" });
  const baseline = {
    reactFlow: await page.locator(".react-flow").count(),
    tabs: await page.locator(TABS).count(),
    nodes: await page.locator(".react-flow__node").count(),
  };
  expect(baseline.nodes).toBe(0);

  // 1) 打开画板：悬浮工具栏的「AI 画板」入口
  await page.getByRole("button", { name: "AI 画板" }).click();
  const dialog = page.getByRole("dialog", { name: DIALOG_NAME });
  await expect(dialog).toBeVisible();

  await expect
    .poll(async () => (await dialog.evaluate((el) => getComputedStyle(el).position)), { timeout: 10_000 })
    .toBe("fixed");
  expect(await dialog.evaluate((el) => getComputedStyle(el).zIndex)).toBe("9999");

  // 2) Excalidraw chunk 落地（dev 模式按需加载）
  await page.waitForSelector(".excalidraw", { timeout: 90_000 });

  // 3) 根因级：绘画面必须可被指针命中（当前实现在此处失败，见 drawableSurfaceHit 的实测）
  const hit = await page.evaluate(() => {
    const center = { x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight / 2) };
    const stack = document.elementsFromPoint(center.x, center.y);
    const canvasEl = document.querySelector<HTMLCanvasElement>("canvas.excalidraw__canvas.interactive");
    const rect = canvasEl?.getBoundingClientRect();
    return {
      center,
      canvasInHitStack: stack.some((el) => el === canvasEl),
      hitStack: stack.slice(0, 3).map((el) => `${el.tagName}.${(el as HTMLElement).className.toString().slice(0, 48)}`),
      canvasPosition: canvasEl ? getComputedStyle(canvasEl).position : null,
      canvasRect: rect ? { y: Math.round(rect.y), h: Math.round(rect.height) } : null,
    };
  });
  expect(
    hit.canvasInHitStack,
    `绘画面必须能被指针命中，否则用户画不上。实测：视口中心 ${hit.center.x},${hit.center.y} 的命中栈 = ${JSON.stringify(hit.hitStack)}；交互 canvas position=${hit.canvasPosition}，rect=${JSON.stringify(hit.canvasRect)}`,
  ).toBe(true);

  // 4) 作画：选矩形工具（点可点击的 label，radio input 本身不可见）后在画布上拖拽
  const undo = page.locator('[data-testid="button-undo"]');
  await expect(undo).toBeDisabled();
  await page.locator('label:has([data-testid="toolbar-rectangle"])').first().click();
  await expect(page.locator('[data-testid="toolbar-rectangle"]')).toBeChecked();

  const { width: vw, height: vh } = page.viewportSize() ?? { width: 1280, height: 720 };
  await page.mouse.move(Math.round(vw * 0.3), Math.round(vh * 0.45));
  await page.mouse.down();
  await page.mouse.move(Math.round(vw * 0.58), Math.round(vh * 0.7), { steps: 20 });
  await page.mouse.up();
  await expect(undo, "画完一个矩形后，Excalidraw 的撤销应可用（空场景时它是 disabled）").toBeEnabled();

  // 5) 导出 PNG → 上传 → 画板关闭
  const upload = page.waitForResponse((res) => res.url().includes("/api/files") && res.request().method() === "POST");
  await page.getByRole("button", { name: "导出 PNG" }).click({ timeout: 20_000 });
  await expect(dialog).toHaveCount(0);
  const uploadRes = await upload;
  expect(uploadRes.ok(), `上传必须成功：HTTP ${uploadRes.status()}`).toBeTruthy();
  const uploaded = (await uploadRes.json()) as { url?: string };
  expect(uploaded.url, "上传响应必须带 url").toBeTruthy();

  // 6) 主链路没有破坏画布身份：同一 React Flow 实例、页签数不变
  await expect(canvas).toBeVisible();
  expect(await page.locator(".react-flow").count(), "画板开关不得重建 React Flow").toBe(baseline.reactFlow);
  expect(await page.locator(TABS).count(), "画板开关不得增删页签").toBe(baseline.tabs);

  // 7) 画布上出现 image 节点，且图真的能预览
  await expect(page.locator(".react-flow__node")).toHaveCount(baseline.nodes + 1);
  const image = page.locator(".react-flow__node img").first();
  await expect(image).toBeVisible();
  await expect
    .poll(async () => image.evaluate((el) => (el as HTMLImageElement).naturalWidth), { timeout: 15_000 })
    .toBeGreaterThan(0);
  expect(await image.getAttribute("src")).toContain(uploaded.url as string);

  // 8) AGENTS.md §6：三档宽度下画板覆盖层几何都等于视口
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "AI 画板" }).click();
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box, `视口 ${viewport.width}×${viewport.height} 下画板层应铺满视口`).toEqual({
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
    await dialog.getByRole("button", { name: "关闭" }).click();
    await expect(dialog).toHaveCount(0);
  }
  });