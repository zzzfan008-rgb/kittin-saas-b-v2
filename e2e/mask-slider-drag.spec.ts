import type { Locator, Page } from "@playwright/test";
import sharp from "sharp";
import { expect, test } from "./fixtures";

/**
 * R-84：蒙版重绘页「笔刷大小」「羽化宽度」两个滑杆的**真实鼠标拖动**回归。
 *
 * 背景：用户 2026-10-08 报「蒙版重绘页的笔刷 / 羽化滑杆无法被鼠标按住拉动」。PR #102 用
 * `touch-none` 修掉了右栏滚动容器抢指针的问题，但当时只有键盘近似证据（press ArrowRight →
 * 值变化），**鼠标 按下 → 移动 → 抬起**这条路径没有任何自动化证据。本机工具链实测（bsk 0.3.2
 * 的 click/hover 没有 down-move-up 序列；`bsk evaluate` 合成 PointerEvent 对 base-ui slider
 * 完全无效——底层是原生 `<input type=range>`，只认真实输入通道），唯一能自动验证拖动的是
 * Playwright 的 `page.mouse`。
 *
 * 断言面（fail-closed，不做宽松断言掩盖「值其实没变」）：
 *  A. 笔刷大小（min 8 / max 300 / step 4，默认 80）：真实拖动后 aria-valuenow 真的变化，
 *     且反向拖回时变小（防「只能增大」的单向 bug）。
 *  B. 羽化宽度（min 0 / max 64 / step 1）：默认「羽化 · 自适应」勾选 ⇒ 滑杆 disabled，
 *     必须先取消勾选才能测；同样双向拖动断言。
 *  C. 布局回归：对话框仍是全屏（DialogContent 必须压住基类 `sm:max-w-sm`，PR #102 / R-83 的
 *     回归面）、左侧原图区宽于右侧面板、右栏宽度落在 `clamp(256px, 25%, 360px)` 内。
 *
 * 每条拖动断言都先读「拖动前 V0」再断言「≠ V0」；即使某条路径下 valuenow 不变，断言也会红。
 */

const VIEWPORTS = [
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

interface SliderContract {
  name: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}

const BRUSH: SliderContract = { name: "笔刷大小", min: 8, max: 300, step: 4, initial: 80 };
const FEATHER: SliderContract = { name: "羽化宽度", min: 0, max: 64, step: 1, initial: 32 };

/** 拖到轨道宽度的 85% / 15% 处。 */
const RATIO_HIGH = 0.85;
const RATIO_LOW = 0.15;
/**
 * 值 ↔ 轨道比例的允许误差。按下点在 thumb 上时 base-ui 记住按下点与 thumb 圆心的偏移
 * （≤ 7px），换算成比例约 0.01；0.06 远小于「值没变（比例差 ~0.7）」和「值跑飞」的差别。
 */
const RATIO_TOLERANCE = 0.06;

function expectedValue(contract: SliderContract, ratio: number): number {
  const raw = contract.min + (contract.max - contract.min) * ratio;
  const steps = Math.round((raw - contract.min) / contract.step);
  return contract.min + steps * contract.step;
}

function valueRatio(contract: SliderContract, value: number): number {
  return (value - contract.min) / (contract.max - contract.min);
}

async function sliderValue(input: Locator): Promise<number> {
  const raw = await input.getAttribute("aria-valuenow");
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`滑杆 aria-valuenow 不是数值：${String(raw)}`);
  return value;
}

/** 真实鼠标拖动：按下 → 分 12 步移动 → 抬起（page.mouse，走浏览器的真实输入通道）。 */
async function dragTrack(page: Page, root: Locator, toRatio: number): Promise<void> {
  const box = await root.boundingBox();
  if (!box) throw new Error("滑杆轨道不可见，拿不到拖动几何");
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * 0.5, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * toRatio, y, { steps: 12 });
  await page.mouse.up();
}

/**
 * 拖动一条滑杆并断言「值真的按方向变了、落在期望值附近、可视读数同步」。
 * 返回拖动后的值，供下一次（反向）拖动作基线。
 */
async function expectDragChangesValue(
  page: Page,
  input: Locator,
  root: Locator,
  readout: Locator,
  contract: SliderContract,
  options: { from: number; to: number; direction: "increase" | "decrease" },
): Promise<number> {
  const { from, to, direction } = options;
  const expected = expectedValue(contract, to);
  const arrow = direction === "increase" ? "增大" : "减小";

  await dragTrack(page, root, to);
  const moved = await sliderValue(input);

  expect(moved, `${contract.name}：真实鼠标拖动必须改变 aria-valuenow（拖动前 ${from}）`).not.toBe(from);
  if (direction === "increase") {
    expect(moved, `${contract.name}：拖到轨道 ${to} 处应${arrow}，实测 ${from} → ${moved}`).toBeGreaterThan(from);
  } else {
    expect(moved, `${contract.name}：拖回轨道 ${to} 处应${arrow}，实测 ${from} → ${moved}`).toBeLessThan(from);
  }
  expect(moved, `${contract.name}：拖到轨道 ${to} 处应落在 ${expected} 附近，实测 ${moved}`)
    .toBeGreaterThanOrEqual(expected - contract.step * 2);
  expect(moved, `${contract.name}：拖到轨道 ${to} 处应落在 ${expected} 附近，实测 ${moved}`)
    .toBeLessThanOrEqual(expected + contract.step * 2);
  expect(
    Math.abs(valueRatio(contract, moved) - to),
    `${contract.name}：值必须与轨道命中比例对应，实测值 ${moved}（比例 ${valueRatio(contract, moved).toFixed(3)}），期望 ${to}`,
  ).toBeLessThanOrEqual(RATIO_TOLERANCE);
  // 可视读数必须同步：证明指针事件确实进了 React 状态，而不是只改了 DOM 属性。
  await expect(readout, `${contract.name}：可视读数必须同步为 ${moved}px`).toHaveText(`${moved}px`);

  return moved;
}

/**
 * 方案 C 的规范起点（与 workbench.spec.ts 同源）：空首屏 → 新建本地空白页签。
 * 隔离库里的初始草稿与 sessionStorage 是跨用例共享的，起点必须显式清干净。
 */
async function openBlankCanvasFromGuide(page: Page): Promise<void> {
  const guide = page.getByRole("region", { name: "空工作区" });
  const canvas = page.getByRole("application", { name: "工作流画布" });
  await expect(guide.or(canvas)).toBeVisible();
  if (await canvas.isVisible()) return;
  await guide.getByRole("button", { name: "新建项目" }).click();
  await expect(canvas).toBeVisible();
}

async function resetToEmptyFirstScreen(page: Page): Promise<void> {
  await openBlankCanvasFromGuide(page);
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
  await openBlankCanvasFromGuide(page);
}

/**
 * 左侧悬浮工具栏「添加」工作流：hover 自动弹出菜单，选中即建节点。
 * hover 打开是异步路径（250ms 抑制窗口 + 120ms openTimer），故轮询菜单出现、必要时重新 hover。
 */
async function addRailNode(page: Page, label: "图片"): Promise<void> {
  const addButton = page.getByRole("button", { name: "添加" });
  const menu = page.getByRole("menu", { name: "添加" });
  await expect(async () => {
    if (!(await menu.isVisible().catch(() => false))) {
      await page.mouse.move(0, 0);
      await addButton.hover();
    }
    await expect(menu).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 30_000 });
  const item = menu.getByRole("menuitem", { name: label });
  await expect(item).toBeVisible();
  await Promise.all([
    page.waitForEvent("filechooser", { timeout: 5_000 }).catch(() => undefined),
    item.click(),
  ]);
}

/** 首屏首个实质变更：建 1 个 image 节点（0 条边）让项目真正落库。 */
async function startFirstProject(page: Page): Promise<void> {
  const nodes = page.locator(".react-flow__node");
  await expect(page.getByRole("region", { name: "开始创作" }).or(nodes.first())).toBeVisible();
  if (await nodes.count() > 0) return;

  const emptyCta = page.getByRole("region", { name: "开始创作" });
  await expect(emptyCta).toBeVisible();
  const bootstrapped = page.waitForResponse((response) => (
    response.request().method() === "POST"
    && new URL(response.url()).pathname === "/api/projects/initial-draft/bootstrap"
  ));
  await addRailNode(page, "图片");
  await expect(nodes).toHaveCount(1);
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);
  await expect(emptyCta).toHaveCount(0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  const response = await bootstrapped;
  expect(response.ok(), `首次落库失败：HTTP ${response.status()}`).toBeTruthy();
}

/** 按节点种类取画布节点 id（React Flow 在 `.react-flow__node` 上暴露 data-id）。 */
async function nodeIdOfKind(page: Page, kind: "image"): Promise<string> {
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

/** 选中画布节点：点击卡片标题栏（工具条仅选中态渲染），以工具条出现为准重试。 */
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

/**
 * 480×360 实色 PNG：底图要真的解码完成，涂抹层与原图尺寸一致（MaskEditor 的 canvas = 原图尺寸），
 * 且左栏几何才有意义——64×64 的小图会让「面板塌缩」这类布局回归看不出来。
 */
async function makeBaseImage(): Promise<Buffer> {
  return sharp({ create: { width: 480, height: 360, channels: 3, background: "#5b7a99" } }).png().toBuffer();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "空工作区" })).toBeVisible();
  await resetToEmptyFirstScreen(page);
  await startFirstProject(page);

  // 走到蒙版重绘页：图片节点 → 上传基图 → 工具条「蒙版」。
  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(1);
  const imageNodeId = await nodeIdOfKind(page, "image");
  const imageNode = page.getByTestId(`rf__node-${imageNodeId}`);
  await imageNode.getByLabel("上传图片").setInputFiles({
    name: "base.png",
    mimeType: "image/png",
    buffer: await makeBaseImage(),
  });
  await expect(imageNode.getByAltText("已上传图片")).toBeVisible();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  await selectCanvasNode(imageNode);
  await imageNode.locator('[data-node-toolbar="image"]').getByRole("button", { name: "蒙版" }).click();
  await expect(page.getByTestId("mask-redraw-rail")).toBeVisible();
  await expect(page.getByTestId("mask-editor-canvas")).toBeVisible();
  // 底图必须真正解码完成：涂抹层几何 = 原图尺寸，未就绪时容器高 0。
  await page.waitForFunction(() => {
    const img = document.querySelector('img[alt="蒙版重绘原图"]') as HTMLImageElement | null;
    return Boolean(img && img.complete && img.naturalWidth > 0);
  });
});

test("蒙版重绘页两个滑杆的真实鼠标拖动与全屏分栏几何（1024/1280/1440）", async ({ page }) => {
  test.setTimeout(180_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const dialog = page.getByRole("dialog", { name: "蒙版重绘" });
  await expect(dialog).toBeVisible();
  const stage = dialog.locator("main");
  const rail = page.getByTestId("mask-redraw-rail");
  const overlay = page.getByTestId("mask-editor-canvas");

  // 滑杆 locator：`getByRole("slider")` 命中的是 base-ui 内被视觉隐藏的原生
  // `<input type=range>`（aria-valuenow / min / max / step 都在它上面）；拖动几何要取它的
  // 根容器 `[data-slot="slider"]`（指针交互由根内的 Control 处理）。
  const brushInput = page.getByRole("slider", { name: BRUSH.name });
  const brushRoot = page.locator('[data-slot="slider"]').filter({ has: brushInput });
  const brushReadout = brushRoot.locator("xpath=..").locator("span.tabular-nums");

  const featherInput = page.getByRole("slider", { name: FEATHER.name });
  const featherRoot = page.locator('[data-slot="slider"]').filter({ has: featherInput });
  const featherSection = page.locator('div[aria-label="羽化"]');
  const featherReadout = featherSection.locator("span.tabular-nums");
  const featherCheckbox = page.getByTestId("mask-redraw-feather");

  // ---------- ① 初始态：笔刷 80 可拖；羽化被「自适应」勾选门控为 disabled ----------
  await expect(brushInput).toHaveAttribute("aria-valuenow", String(BRUSH.initial));
  await expect(brushInput).toBeEnabled();
  await expect(brushReadout).toHaveText(`${BRUSH.initial}px`);
  await expect(featherCheckbox).toBeChecked();
  await expect(featherInput).toBeDisabled();
  await expect(featherInput).toHaveAttribute("aria-valuenow", String(FEATHER.initial));

  // 解除门控：取消勾选后羽化滑杆才可拖（默认勾选 = 自适应 → 不给手调）。
  await featherCheckbox.click();
  await expect(featherCheckbox).not.toBeChecked();
  await expect(featherInput).toBeEnabled();
  await expect(featherReadout).toHaveText(`${FEATHER.initial}px`);

  let brushValue = await sliderValue(brushInput);
  let featherValue = await sliderValue(featherInput);

  for (const size of VIEWPORTS) {
    await page.setViewportSize({ width: size.width, height: size.height });
    // 等重排收敛：对话框是全屏层（w-screen/h-dvh），宽度必须等于视口宽度。
    await expect.poll(
      async () => (await dialog.boundingBox())?.width ?? 0,
      { message: `视口 ${size.width}×${size.height} 下蒙版重绘对话框必须铺满视口宽度` },
    ).toBe(size.width);

    // ---------- C. 布局回归（PR #102 / R-83）----------
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox, `视口 ${size.width}×${size.height} 下对话框必须可见`).not.toBeNull();
    expect(dialogBox, "对话框必须保持全屏覆盖（DialogContent 不得被基类 sm:max-w-sm 压回 384px）")
      .toEqual({ x: 0, y: 0, width: size.width, height: size.height });
    const stageBox = await stage.boundingBox();
    const railBox = await rail.boundingBox();
    expect(stageBox, "左侧原图区必须可见").not.toBeNull();
    expect(railBox, "右侧面板必须可见").not.toBeNull();
    expect(railBox!.width, "右栏宽度必须落在 clamp(256px, 25%, 360px) 内").toBeGreaterThanOrEqual(256);
    expect(railBox!.width, "右栏宽度必须落在 clamp(256px, 25%, 360px) 内").toBeLessThanOrEqual(360);
    expect(stageBox!.width, "左侧原图区必须宽于右侧面板（PR #102 回归面）").toBeGreaterThan(railBox!.width);
    expect(
      Math.abs(stageBox!.width + railBox!.width - size.width),
      `左图区 + 右栏必须正好铺满视口：${stageBox!.width} + ${railBox!.width} vs ${size.width}`,
    ).toBeLessThanOrEqual(1);
    expect(
      railBox!.x + railBox!.width,
      "右栏必须贴住视口右缘（面板塌缩时它会缩到中间）",
    ).toBeCloseTo(size.width, 0);
    const overlayBox = await overlay.boundingBox();
    expect(overlayBox, "涂抹层必须可见").not.toBeNull();
    expect(overlayBox!.width, "R-83 症状：面板塌缩时涂抹层只剩约 95px").toBeGreaterThan(200);

    // ---------- A. 笔刷大小：真实鼠标拖动（双向）----------
    brushValue = await expectDragChangesValue(page, brushInput, brushRoot, brushReadout, BRUSH, {
      from: brushValue,
      to: RATIO_HIGH,
      direction: "increase",
    });
    brushValue = await expectDragChangesValue(page, brushInput, brushRoot, brushReadout, BRUSH, {
      from: brushValue,
      to: RATIO_LOW,
      direction: "decrease",
    });

    // ---------- B. 羽化宽度：真实鼠标拖动（双向）----------
    featherValue = await expectDragChangesValue(page, featherInput, featherRoot, featherReadout, FEATHER, {
      from: featherValue,
      to: RATIO_HIGH,
      direction: "increase",
    });
    featherValue = await expectDragChangesValue(page, featherInput, featherRoot, featherReadout, FEATHER, {
      from: featherValue,
      to: RATIO_LOW,
      direction: "decrease",
    });
  }

  // 拖动过程不得伴随页面异常。
  expect(pageErrors).toEqual([]);
});
