import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { expect, test } from "./fixtures";

const phase = process.env.VIS01_PHASE ?? "shots";
const outDir = process.env.SHOT_DIR ?? "/tmp/vis01-shots";
mkdirSync(outDir, { recursive: true });

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const baseRecord = {
  runId: "run-x",
  image: PIXEL,
  thumbnail: PIXEL,
  projectId: "proj-1",
  projectName: "演示项目",
  ownerName: "E2E 演示用户",
  model: "gpt-image-2",
  providerOutputSize: "1024x1024",
  requestedCount: 2,
  successfulCount: 2,
  providerRequests: 1,
};

const FIXTURES = [
  {
    ...baseRecord,
    id: "r-success-1",
    nodeId: "n-success-1",
    nodeLabel: "成功结果一 · 图片生成",
    kind: "image" as const,
    prompt: "第一件：白底棚拍，正面全身，展示面料垂感与剪裁细节。",
    startedAt: 1760000100000,
    finishedAt: 1760000105000,
    status: "success" as const,
  },
  {
    ...baseRecord,
    id: "r-success-2",
    nodeId: "n-success-2",
    nodeLabel: "成功结果二 · 视频生成",
    kind: "video" as const,
    prompt: "第二件：走秀转场，镜头跟随，光影柔和。",
    startedAt: 1760000090000,
    finishedAt: 1760000098000,
    status: "success" as const,
  },
  {
    ...baseRecord,
    id: "r-running",
    nodeId: "n-running",
    nodeLabel: "正在生成的任务",
    kind: "image" as const,
    startedAt: Date.now(),
    status: "running" as const,
  },
  {
    ...baseRecord,
    id: "r-cancelled",
    nodeId: "n-cancelled",
    nodeLabel: "已取消的任务",
    kind: "image" as const,
    startedAt: 1760000000000,
    status: "cancelled" as const,
  },
  {
    ...baseRecord,
    id: "r-error",
    nodeId: "n-error",
    nodeLabel: "失败的任务",
    kind: "image" as const,
    startedAt: 1760000050000,
    finishedAt: 1760000052000,
    status: "error" as const,
    error: "上游超时（500ms）",
  },
];

async function dismissTutorial(page: import("@playwright/test").Page) {
  const tutorial = page.getByRole("dialog", { name: "欢迎使用服装设计工作台" });
  const info = await page.request.get("/api/tutorials/workbench-onboarding");
  const body = await info.json() as { acknowledged: boolean };
  if (body.acknowledged) return;
  await expect(tutorial).toBeVisible();
  const next = tutorial.getByRole("button", { name: "下一步" });
  const done = tutorial.getByRole("button", { name: "完成教程" });
  for (let i = 0; i < 8 && !await done.isVisible(); i += 1) await next.click();
  await done.click();
}

async function addRailNode(page: import("@playwright/test").Page, label: "文本" | "图片" | "视频") {
  const addButton = page.getByRole("button", { name: "添加" });
  const menu = page.getByRole("menu", { name: "添加" });
  // helper 加固（非本 PR 断言面）：rail 菜单是 hover 异步打开（WorkbenchShell 120ms openTimer
  // + 点击关闭后 250ms hover 抑制窗口），固定等待不足以覆盖；轮询菜单出现、必要时重新 hover。
  // 断言强度不变。
  await expect(async () => {
    if (!(await menu.isVisible().catch(() => false))) {
      await page.mouse.move(0, 0);
      await addButton.hover();
    }
    await expect(menu).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 30_000 });
  await Promise.all([
    page.waitForEvent("filechooser", { timeout: 4_000 }).catch(() => undefined),
    menu.getByRole("menuitem", { name: label }).click(),
  ]);
}

async function setTheme(page: import("@playwright/test").Page, id: string, label: string) {
  if (await page.locator("html").getAttribute("data-theme") === id) return;
  await page.getByRole("button", { name: /^切换主题，当前为/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp(`^${label}`) }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", id);
  await page.waitForTimeout(150);
}

// Wait until finite CSS animations inside an overlay have finished (infinite
// spinners are ignored). Playwright's toBeVisible resolves before the dialog's
// fade-in completes, which otherwise produces intermittent no-scrim captures.
async function settle(locator: import("@playwright/test").Locator) {
  const handle = await locator.elementHandle();
  if (!handle) return;
  await handle.evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        let tries = 0;
        const check = () => {
          const anims = el instanceof Element ? el.getAnimations({ subtree: true }) : [];
          const finite = anims.filter((a) => a.effect?.getTiming().iterations !== Infinity);
          if (finite.length === 0 || tries > 50) {
            resolve();
            return;
          }
          tries += 1;
          setTimeout(check, 30);
        };
        check();
      }),
  );
}

test.setTimeout(240_000);

test("VIS-01 screenshot matrix", async ({ page }) => {
  // History fixtures must be in place before the app bootstraps.
  await page.route("**/api/history*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/api/history/active") {
      await route.fulfill({ json: { records: [], nextCursor: null, hasMore: false } });
      return;
    }
    await route.fulfill({ json: { records: FIXTURES, nextCursor: null, hasMore: false } });
  });

  // Fresh blank first screen.
  await page.request.post("/api/projects/initial-draft/force-clear", { data: { confirm: true } });
  await page.goto("/");
  await dismissTutorial(page);
  await page.evaluate(() => window.sessionStorage.clear());
  await page.reload();
  await page.getByRole("region", { name: "空工作区" }).getByRole("button", { name: "新建项目" }).click();
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();

  // The dot-wave canvas animates continuously (and ignores reduced-motion), so
  // it would differ on every capture. It is decorative chrome; hide it in both
  // phases so the comparison measures the UI under migration only.
  await page.addStyleTag({
    content: ".react-flow canvas.pointer-events-none { display: none !important; }",
  });

  // Three input nodes.
  await addRailNode(page, "图片");
  await addRailNode(page, "文本");
  await addRailNode(page, "视频");
  await expect(page.locator(".react-flow__node")).toHaveCount(3);
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);

  // 图片节点锚点：上传入口是无图空槽位里的隐藏 file input（9cebe44 A 案），上传成功后
  // 空槽位被图片取代、该 input 随之消失 —— 不能把它当惰性 locator 的节点锚（会失配）。
  // 先在上传前读出承载节点的 data-id，再用 testid 做稳定锚（与 mask-slider/r87 同一手法）。
  const uploadInput = page.getByLabel("上传图片").first();
  const imageNodeId = await uploadInput.evaluate(
    (el) => el.closest(".react-flow__node")?.getAttribute("data-id") ?? null,
  );
  if (!imageNodeId) throw new Error("找不到承载「上传图片」的图片节点");
  const imageNode = page.getByTestId(`rf__node-${imageNodeId}`);
  const png = await sharp({ create: { width: 160, height: 200, channels: 3, background: "#7a6a52" } })
    .png().toBuffer();
  await imageNode.getByLabel("上传图片").setInputFiles({ name: "a.png", mimeType: "image/png", buffer: png });
  await expect(imageNode.getByAltText("已上传图片")).toBeVisible();

  const shot = async (name: string) => {
    const file = join(outDir, `${phase}-${name}.png`);
    await page.screenshot({ path: file });
    console.log("shot:", file);
  };

  const fab = page.getByRole("button", { name: "历史创作记录", exact: true });
  const resultsDialog = page.getByRole("dialog", { name: "历史创作记录" });
  const openResults = async () => {
    if (await fab.getAttribute("aria-expanded") !== "true") await fab.click();
    await expect(resultsDialog).toBeVisible();
    await settle(resultsDialog);
  };

  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 900 });
    for (const [themeId, themeLabel] of [["current", "曜黑·荧光绿"], ["white", "简白"], ["eye", "护眼绿"]] as const) {
      const tag = `${themeId}-${width}`;
      await setTheme(page, themeId, themeLabel);
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await shot(`${tag}-1-canvas`);

      // Results panel.
      await openResults();
      await shot(`${tag}-2-results`);

      // 结果详情弹窗已删除，点卡片主体直接打开 ImageViewer（大图区并入查看器）。
      const region = resultsDialog.getByRole("region", { name: "最近生成" });
      await region.locator("article").first().getByRole("button", { name: /查看/ }).click();
      const zoomHud = page.locator(".zoom-hud");
      await expect(zoomHud).toBeVisible();
      await shot(`${tag}-3-viewer`);
      await page.keyboard.press("Escape");
      await expect(zoomHud).toHaveCount(0);
      // 确认不存在遗留的「结果详情」弹窗。
      await expect(page.getByRole("dialog", { name: "结果详情" })).toHaveCount(0);

      // Compare overlay: mark two success cards, then header compare button.
      await openResults();
      const successCards = region.locator("article");
      await successCards.nth(0).hover();
      await successCards.nth(0).locator('button[title="加入对比"]').click();
      await successCards.nth(1).hover();
      await successCards.nth(1).locator('button[title="加入对比"]').click();
      await region.getByRole("button", { name: /^对比 \d+ 张$/ }).click();
      const compare = page.getByRole("dialog", { name: "结果对比" });
      await expect(compare).toBeVisible();
      await settle(compare);
      await shot(`${tag}-5-compare`);
      await page.keyboard.press("Escape");
      await expect(compare).toHaveCount(0);

      // Asset picker: dispatch its open event; show empty/loading state.
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent("garment:open-asset-picker", {
          detail: { target: "upload", nodeId: "n1", initialCategory: "all" },
        }));
      });
      const picker = page.locator(".fixed.inset-0.z-50").filter({ hasText: "资产库" });
      await expect(picker).toBeVisible();
      await settle(picker);
      await shot(`${tag}-6-picker`);
      await picker.getByRole("button", { name: "关闭" }).click();
      await expect(picker).toHaveCount(0);
    }
  }
});

test("login page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  // The vis01 project authenticates via setup storage state; clear it so the
  // logged-out login form is what gets captured.
  await page.context().clearCookies();
  await page.goto("/login");
  // Wait for AuthGate's /api/auth check to finish; otherwise the full-screen
  // "正在验证登录状态…" fallback can be captured (its bg matches the login bg).
  await expect(page.getByRole("heading", { name: "登录工作台" })).toBeVisible();

  const file = join(outDir, `${phase}-login.png`);
  await page.screenshot({ path: file });
  console.log("shot:", file);
});
