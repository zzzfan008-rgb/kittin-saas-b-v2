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

async function login(page: import("@playwright/test").Page) {
  const request = page.context().request;
  let response = await request.post("/api/auth/login", {
    data: { accountId: "e2e-admin", password: "E2eFinal5678" },
  });
  if (response.status() === 401) {
    response = await request.post("/api/auth/login", {
      data: { accountId: "e2e-admin", password: "E2eInitial1234" },
    });
    const body = await response.json() as { user?: { mustChangePassword?: boolean }; error?: string };
    expect(response.ok(), body.error).toBeTruthy();
    if (body.user?.mustChangePassword) {
      const change = await request.post("/api/auth/change-password", {
        data: { currentPassword: "E2eInitial1234", newPassword: "E2eFinal5678" },
      });
      expect(change.ok(), await change.text()).toBeTruthy();
    }
  } else {
    expect(response.ok(), await response.text()).toBeTruthy();
  }
}

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
  await page.getByRole("button", { name: "添加" }).hover();
  const menu = page.getByRole("menu", { name: "添加" });
  await expect(menu).toBeVisible();
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
  await login(page);

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

  // Locate the image node via its file input (only the image input node has one).
  const imageNode = page.locator(".react-flow__node")
    .filter({ has: page.getByLabel("上传图片") }).first();
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

      // Detail dialog: view first success card.
      const region = resultsDialog.getByRole("region", { name: "最近生成" });
      await region.locator('button[title="查看详情"]').first().click();
      const detail = page.getByRole("dialog", { name: "结果详情" });
      await expect(detail).toBeVisible();
      await settle(detail);
      await shot(`${tag}-3-detail`);

      // Image viewer.
      await detail.getByRole("button", { name: /查看 .* 大图/ }).click();
      await expect(page.getByText(/滚轮缩放 100%/)).toBeVisible();
      await shot(`${tag}-4-viewer`);
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "关闭结果详情" }).click().catch(() => undefined);
      await expect(detail).toHaveCount(0);

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
      const picker = page.locator(".fixed.inset-0.z-50").filter({ hasText: "从素材库选择" });
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
  await page.goto("/login");
  // Wait for AuthGate's /api/auth check to finish; otherwise the full-screen
  // "正在验证登录状态…" fallback can be captured (its bg matches the login bg).
  await expect(page.getByRole("heading", { name: "登录工作台" })).toBeVisible();

  const file = join(outDir, `${phase}-login.png`);
  await page.screenshot({ path: file });
  console.log("shot:", file);
});
