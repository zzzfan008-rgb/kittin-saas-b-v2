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

const EMPTY_V7_FLOW = { schemaVersion: WORKFLOW_SCHEMA_VERSION, nodes: [], edges: [] };

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
  await expect(canvas).toBeVisible();

  // 空首屏：中央「上传图片开始」CTA（TaskLauncher 浮层已随 R-76 删除），画布为空。
  const cta = page.getByRole("region", { name: "开始创作" });
  await expect(cta).toBeVisible();
  await expect(cta.getByRole("button", { name: "上传图片开始" })).toBeVisible();
  await expect(cta.getByText("从左侧节点库拖入文本 / 图片节点，或点击上方按钮上传图片")).toBeVisible();
  await expect(page.getByRole("region", { name: "开始第一个创作任务" })).toHaveCount(0);
  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(0);
  // 空态不落库：既没有 bootstrap 请求，也没有服务端草稿记录。
  expect(bootstrapRequests).toEqual([]);
  expect(await readDraft()).toBeNull();

  // 首次实质变更（CTA 一键建图片节点 + auto-text 兜底补文本节点与 prompt 边）才落库。
  await cta.getByRole("button", { name: "上传图片开始" }).click();
  await expect(nodes).toHaveCount(2);
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
  await expect(cta).toHaveCount(0);
  await expect.poll(() => bootstrapRequests.length).toBe(1);
  await expect.poll(async () => (await readDraft())?.id ?? null).not.toBeNull();
  const bootstrapped = await readDraft();
  if (!bootstrapped) throw new Error("首次实质变更没有落库");
  expect(bootstrapped.flow.schemaVersion).toBe(WORKFLOW_SCHEMA_VERSION);
  expect(bootstrapped.flow.nodes).toHaveLength(2);
  expect(bootstrapped.flow.edges).toHaveLength(1);

  // v7 上传：图片直写 image 节点输出，且不破坏 text→image 的 prompt 边（INV-1）。
  const uploadImage = await sharp({
    create: { width: 96, height: 64, channels: 3, background: "#735b42" },
  }).png().toBuffer();
  await page.getByLabel("上传图片").setInputFiles({
    name: "first-screen.png",
    mimeType: "image/png",
    buffer: uploadImage,
  });
  await expect(page.getByAltText("已上传图片")).toBeVisible();
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);

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
  await expect(page.getByText("正在同步未保存项目…")).toHaveCount(0);
  const canvasDuringSync = await canvas.boundingBox();
  if (!canvasDuringSync) throw new Error("Initial draft canvas disappeared during sync");
  expect(Math.abs(canvasDuringSync.y - canvasBeforeSync.y)).toBeLessThan(1);
  expect(Math.abs(canvasDuringSync.height - canvasBeforeSync.height)).toBeLessThan(1);
  await expect.poll(async () => (await readDraft())?.name).toBe(editedName);
  const synchronized = await readDraft();
  expect(synchronized?.id).toBe(bootstrapped.id);

  await page.reload();
  await expect(page.getByTitle(`${editedName} · 双击重命名`)).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(2);
  expect((await readDraft())?.id).toBe(bootstrapped.id);

  const secondPage = await page.context().newPage();
  await secondPage.goto("/");
  await expect(secondPage.getByTitle(`${editedName} · 双击重命名`)).toBeVisible();
  const secondTabDraft = await secondPage.context().request.get("/api/projects/initial-draft");
  expect(secondTabDraft.ok()).toBeTruthy();
  expect(((await secondTabDraft.json()) as InitialDraftBody).draft?.id).toBe(bootstrapped.id);
  await secondPage.close();

  await page.getByRole("button", { name: /^账户菜单：/ }).click();
  await page.getByRole("menuitem", { name: "退出登录" }).click();
  await expect(page.getByRole("heading", { name: "登录工作台" })).toBeVisible();
  await page.getByRole("textbox", { name: "账号" }).fill(accountId);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page.getByTitle(`${editedName} · 双击重命名`)).toBeVisible();
  const afterRelogin = await readDraft();
  expect(afterRelogin?.id).toBe(bootstrapped.id);
  expect(afterRelogin?.name).toBe(editedName);
});

test("relogin opens the latest saved project instead of bootstrapping a blank page", async ({ page }) => {
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
      flow: EMPTY_V7_FLOW,
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

  await expect(page.getByTitle(`${projectName} · 双击重命名`)).toBeVisible();
  expect(bootstrapRequests).toHaveLength(0);
  const project = await page.request.get("/api/projects");
  expect(project.ok()).toBeTruthy();
  const projects = await project.json() as ProjectSummaryBody[];
  expect(projects.some((item) => item.name === projectName)).toBeTruthy();
});
