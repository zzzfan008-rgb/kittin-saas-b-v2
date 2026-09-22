import sharp from "sharp";
import {
  WORKFLOW_SCHEMA_VERSION,
} from "../src/types/workflow";
import { expect, test } from "./fixtures";

interface InitialDraftBody {
  draft: null | {
    id: string;
    name: string;
    revision: number;
    flow: { schemaVersion: number; nodes: unknown[]; edges: unknown[] };
  };
}

interface ProjectSummaryBody {
  id: string;
  name: string;
}

const EMPTY_V8_FLOW = { schemaVersion: WORKFLOW_SCHEMA_VERSION, nodes: [], edges: [] };

test("the empty first screen stays local and only persists after the first substantial change", async ({ page }) => {
  test.slow();
  const accountId = process.env.E2E_ACCOUNT_ID;
  const password = process.env.E2E_PASSWORD;
  if (!accountId || !password) throw new Error("Missing E2E login credentials");

  const readDraft = async () => {
    const response = await page.context().request.get("/api/projects/initial-draft");
    expect(response.ok()).toBeTruthy();
    return (await response.json() as InitialDraftBody).draft;
  };

  // 方案 C 的空首屏前提是「无服务端草稿 + 无正式项目」。隔离库里前面的用例会同时留下
  // 两者，所以先清掉草稿、并把正式项目列表挡住（夹具动作，只作用于隔离测试账号）。
  const cleared = await page.request.post("/api/projects/initial-draft/force-clear", {
    data: { confirm: true },
  });
  expect(cleared.ok(), await cleared.text()).toBeTruthy();
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ json: [] });
  });

  const bootstrapRequests: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/projects/initial-draft/bootstrap"
    ) {
      bootstrapRequests.push(request.url());
    }
  });

  const canvas = page.getByRole("application", { name: "工作流画布" });
  await page.goto("/");
  // 2026-09-25 登录语义（决策 4）：冷启动 0 页签 → 首屏是「空工作区」引导（无画布、无工具栏）；
  // 「新建项目」才得到一个不落库的本地空白页签 —— 这本身就是本用例要锁定的事实。
  const guide = page.getByRole("region", { name: "空工作区" });
  await expect(guide).toBeVisible();
  await expect(canvas).toHaveCount(0);
  await guide.getByRole("button", { name: "新建项目" }).click();
  await expect(canvas).toBeVisible();

  // 空首屏：中央「上传图片开始」CTA（TaskLauncher 浮层已随 R-76 删除），画布为空。
  const cta = page.getByRole("region", { name: "开始创作" });
  await expect(cta).toBeVisible();
  await expect(cta.getByRole("button", { name: "上传图片开始" })).toBeVisible();
  await expect(cta.getByText("从左侧「添加」新建文本 / 图片 / 视频节点，或点击上方按钮上传图片")).toBeVisible();
  await expect(page.getByRole("region", { name: "开始第一个创作任务" })).toHaveCount(0);
  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(0);
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);
  // 空态不落库：既没有 bootstrap 请求，也没有服务端草稿记录。
  expect(bootstrapRequests).toEqual([]);
  expect(await readDraft()).toBeNull();

  // 仅重命名（blur 提交，非 Enter 保存）：改名只走瞬态本地路径，不触发 bootstrap、不落库。
  const transientName = `E2E 瞬态改名 ${Date.now()}`;
  const localTabName = page.getByTitle(/双击重命名/).first();
  await localTabName.dblclick();
  const nameBox = page.getByRole("textbox", { name: "项目名称" });
  await expect(nameBox).toBeVisible();
  await nameBox.fill(transientName);
  await nameBox.blur();
  await expect(nameBox).toBeHidden();
  await expect(page.getByTitle(`${transientName} · 双击重命名`)).toBeVisible();
  // 等待超过 initial_draft 同步防抖窗口（700ms），确认空改名没有迟到的落库请求。
  await page.waitForTimeout(1200);
  expect(bootstrapRequests).toEqual([]);
  expect(await readDraft()).toBeNull();

  // 首次实质变更（CTA 一键建输入层 image 节点）才落库；v8 起输入节点不接受入边，
  // 所以不再补出 auto-text 文本节点与 prompt 边。之前的瞬态改名随 bootstrap 的 name 字段一并持久化。
  await cta.getByRole("button", { name: "上传图片开始" }).click();
  await expect(nodes).toHaveCount(1);
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);
  await expect(cta).toHaveCount(0);
  await expect.poll(() => bootstrapRequests.length).toBe(1);
  await expect.poll(async () => (await readDraft())?.id ?? null).not.toBeNull();
  const bootstrapped = await readDraft();
  if (!bootstrapped) throw new Error("首次实质变更没有落库");
  expect(bootstrapped.flow.schemaVersion).toBe(WORKFLOW_SCHEMA_VERSION);
  expect(bootstrapped.flow.nodes).toHaveLength(1);
  expect(bootstrapped.flow.edges).toHaveLength(0);
  expect(bootstrapped.name).toBe(transientName);

  // v8 上传：图片直写 image 节点输出，且不产生任何边。
  const uploadImage = await sharp({
    create: { width: 96, height: 64, channels: 3, background: "#735b42" },
  }).png().toBuffer();
  await page.getByLabel("上传图片").setInputFiles({
    name: "first-screen.png",
    mimeType: "image/png",
    buffer: uploadImage,
  });
  await expect(page.getByAltText("已上传图片")).toBeVisible();
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);

  let draftSyncRequests = 0;
  await page.route("**/api/projects/initial-draft/*", async (route) => {
    if (route.request().method() !== "PUT") {
      await route.fallback();
      return;
    }
    draftSyncRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 900));
    await route.continue();
  });
  const canvasBeforeSync = await canvas.boundingBox();
  if (!canvasBeforeSync) throw new Error("Initial draft canvas is missing");

  const editedName = `E2E 未保存草稿 ${Date.now()}`;
  const tabName = page.getByTitle(/双击重命名/).first();
  await expect(tabName).toBeVisible();
  await tabName.dblclick();
  const projectName = page.getByRole("textbox", { name: "项目名称" });
  await expect(projectName).toBeVisible();
  await projectName.fill(editedName);
  await projectName.blur();
  await expect(projectName).toBeHidden();
  await expect(page.getByTitle(`${editedName} · 双击重命名`)).toBeVisible();
  await expect.poll(() => draftSyncRequests, { timeout: 5_000 }).toBeGreaterThan(0);
  // PUT 仍在途（路由里刻意延迟 900ms）：同步状态由 sr-only 的「正在同步未保存项目」
  // 暴露（InitialDraftSyncNotice），这里正反两面都断言，避免恒真/恒假 needle：
  // 在途时必须存在，收敛后必须消失；视觉位移由下面的 boundingBox 断言负责。
  await expect(page.getByText("正在同步未保存项目")).toHaveCount(1);
  const canvasDuringSync = await canvas.boundingBox();
  if (!canvasDuringSync) throw new Error("Initial draft canvas disappeared during sync");
  expect(Math.abs(canvasDuringSync.y - canvasBeforeSync.y)).toBeLessThan(1);
  expect(Math.abs(canvasDuringSync.height - canvasBeforeSync.height)).toBeLessThan(1);
  await expect.poll(async () => (await readDraft())?.name).toBe(editedName);
  await expect(page.getByText("正在同步未保存项目")).toHaveCount(0);
  const synchronized = await readDraft();
  expect(synchronized?.id).toBe(bootstrapped.id);

  await page.reload();
  await expect(page.getByTitle(`${editedName} · 双击重命名`)).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(1);
  expect((await readDraft())?.id).toBe(bootstrapped.id);

  // 决策 4 / 登录语义 A：新页（没有本机 tab 会话）不再自动恢复服务端草稿，而是落「空工作区」；
  // 草稿仍以账号为单位留在服务端（下面用 API 断言），并且「打开项目」入口可用。
  const secondPage = await page.context().newPage();
  await secondPage.goto("/");
  const secondGuide = secondPage.getByRole("region", { name: "空工作区" });
  await expect(secondGuide).toBeVisible();
  await expect(secondPage.getByTitle(`${editedName} · 双击重命名`)).toHaveCount(0);
  const secondTabDraft = await secondPage.context().request.get("/api/projects/initial-draft");
  expect(secondTabDraft.ok()).toBeTruthy();
  expect(((await secondTabDraft.json()) as InitialDraftBody).draft?.id).toBe(bootstrapped.id);
  await expect(secondGuide.getByRole("button", { name: "打开项目" })).toBeVisible();
  await secondPage.close();

  await page.getByRole("button", { name: /^账户菜单：/ }).click();
  await page.getByRole("menuitem", { name: "退出登录" }).click();
  await expect(page.getByRole("heading", { name: "登录工作台" })).toBeVisible();
  await page.getByRole("textbox", { name: "账号" }).fill(accountId);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录" }).click();

  // 同页重登 ≠ 新开页：本机 tab 会话（sessionStorage）仍在，页签照旧恢复、画布内容不丢；
  // 而「无 tab 会话的新页」才落空工作区（上一段已断言）。草稿以账号为单位存活在服务端，
  // 名字与内容与退出前一致 —— 这才是本用例要锁定的「不丢工作」语义。
  await expect(page.getByTitle(`${editedName} · 双击重命名`)).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(1);
  const afterRelogin = await readDraft();
  expect(afterRelogin?.id).toBe(bootstrapped.id);
  expect(afterRelogin?.name).toBe(editedName);
});

/**
 * 本文件的用例内部会「退出登录 → 重新登录」，而账号是单设备会话：重登会吊销 storageState
 * 里 setup 写入的 token。常规运行时每个 e2e 隔离进程都从 npm run test:e2e 的全新库起步，
 * 收尾后内存态无所谓；但 CI 下 retries=1，失败重试会带着失效 token 起步（实测重试时在
 * force-clear 处得到 SESSION_REPLACED/401）。因此在 CI 中回写重登后的有效会话。
 * 这里刻意不用 --repeat-each 兼容同一进程内的二次执行：setup 依赖的「空库」前提只有
 * 外层 runner 重置数据库才能满足，那不是本文件该承担的状态。
 */
test.afterEach(async ({ page }) => {
  if (!process.env.CI) return;
  const authStatePath = process.env.E2E_AUTH_STATE_PATH;
  const accountId = process.env.E2E_ACCOUNT_ID;
  const password = process.env.E2E_PASSWORD;
  if (!authStatePath || !accountId || !password) return;
  const login = await page.request.post("/api/auth/login", { data: { accountId, password } });
  if (login.ok()) await page.context().storageState({ path: authStatePath });
});

test("relogin lands on the empty workspace without bootstrapping, and the saved project stays reachable", async ({ page }) => {
  const accountId = process.env.E2E_ACCOUNT_ID;
  const password = process.env.E2E_PASSWORD;
  if (!accountId || !password) throw new Error("Missing E2E login credentials");

  // The preceding recovery test deliberately logs out. Re-authenticate this
  // test's isolated page context instead of relying on a potentially revoked
  // storage-state session token.
  const login = await page.request.post("/api/auth/login", {
    data: { accountId, password },
  });
  expect(login.ok(), await login.text()).toBeTruthy();

  const draftResponse = await page.request.get("/api/projects/initial-draft");
  expect(draftResponse.ok()).toBeTruthy();
  const draft = (await draftResponse.json() as InitialDraftBody).draft;
  if (draft) {
    const discard = await page.request.delete(`/api/projects/initial-draft/${draft.id}`, {
      data: { confirm: true, expectedRevision: draft.revision },
    });
    expect(discard.ok(), await discard.text()).toBeTruthy();
  }

  const projectName = `E2E 最近正式项目 ${Date.now()}`;
  const createProject = await page.request.post("/api/projects", {
    data: {
      name: projectName,
      flow: EMPTY_V8_FLOW,
    },
  });
  expect(createProject.ok(), await createProject.text()).toBeTruthy();

  await page.goto("/");
  const bootstrapRequests: string[] = [];
  await page.route("**/api/projects/initial-draft/bootstrap", async (route) => {
    bootstrapRequests.push(route.request().url());
    await route.fallback();
  });
  await page.getByRole("button", { name: /^账户菜单：/ }).click();
  await page.getByRole("menuitem", { name: "退出登录" }).click();
  await expect(page.getByRole("heading", { name: "登录工作台" })).toBeVisible();
  await page.getByRole("textbox", { name: "账号" }).fill(accountId);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录" }).click();

  // 决策 4 / 登录语义 A：重登落「空工作区」，既不自动打开最近项目，也不 bootstrap 空白页。
  const guide = page.getByRole("region", { name: "空工作区" });
  await expect(guide).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(0);
  expect(bootstrapRequests).toHaveLength(0);

  // 但项目不能因为「不自动打开」就丢：从空工作区的「打开项目」入口进项目中心把它开回来。
  const project = await page.request.get("/api/projects");
  expect(project.ok()).toBeTruthy();
  const projects = await project.json() as ProjectSummaryBody[];
  expect(projects.some((item) => item.name === projectName)).toBeTruthy();

  await guide.getByRole("button", { name: "打开项目" }).click();
  const center = page.getByRole("dialog", { name: "项目中心" });
  await expect(center).toBeVisible();
  await center.getByRole("button", { name: new RegExp(`^${projectName}`) }).click();
  await expect(page.getByTitle(`${projectName} · 双击重命名`)).toBeVisible();
});
