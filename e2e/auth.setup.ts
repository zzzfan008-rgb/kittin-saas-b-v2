import sharp from "sharp";
import {
  WORKFLOW_SCHEMA_VERSION,
  illegalEdgeIndexes,
  type GraphEdgeLike,
  type NodeKind,
} from "../src/types/workflow";
import { expect, test as setup } from "./fixtures";

interface LoginBody {
  error?: string;
  user?: { id?: string; mustChangePassword?: boolean };
}

interface TutorialBody {
  acknowledged?: boolean;
}

/**
 * 服务端已落库草稿的形状（server/routes/projects.ts 的 initialDraftPayload）。
 * 这里只声明断言需要的字段；`flow` 由服务端 validateAndMigrateFlow 归一化后返回。
 */
interface PersistedDraft {
  id: string;
  name: string;
  revision: number;
  flow: {
    schemaVersion: number;
    nodes: Array<{ id: string; data: { kind: NodeKind; outputImages?: unknown[] } }>;
    edges: GraphEdgeLike[];
  };
}

interface InitialDraftBody {
  draft: PersistedDraft | null;
}

/**
 * 建立可复用的 authenticated storage state。
 *
 * 方案 C（docs/design/2026-09-18-three-node-model/r75-lazy-empty-canvas.md §2）之后，登录态
 * 不再由「进入工作台即 bootstrap 出起始草稿」隐含建立：空首屏只是本地空 tab（nodes=0 &&
 * edges=0），服务端没有任何记录。因此本 setup 必须自己走完方案 C 的第一个实质变更
 * ——空画布中央 CTA「上传图片开始」（v8 三层七节点模型下 = 一个输入层 image 节点；
 * 输入节点不接受任何入边，不再有 v7 的 auto-text 兜底 text 节点与 prompt 边，
 * 见 docs/design/2026-09-21-five-node-model/plan.md §1.1/§2.1）——并确认它以
 * WORKFLOW_SCHEMA_VERSION(8) 落库，然后把 storage state 建立在这个「真实存在、v8 合法」
 * 的项目上，供后续 spec 复用。
 *
 * 这里刻意不依赖任何已被方案 C / v8 删除或改变的语义：不靠重命名结束 pristine（重命名不再
 * 落库）、不靠 starter node（不再制造）、不靠 TaskLauncher 浮层（R-76 已删除）、不靠输入节点
 * 的 auto-text 上游（v8 输入层节点 0 入边）。
 */
setup("create an authenticated desktop session on a persisted v8 project", async ({ page }) => {
  const accountId = process.env.E2E_ACCOUNT_ID;
  const initialPassword = process.env.E2E_INITIAL_PASSWORD;
  const password = process.env.E2E_PASSWORD;
  const authStatePath = process.env.E2E_AUTH_STATE_PATH;
  if (!accountId || !initialPassword || !password || !authStatePath) {
    throw new Error("Missing E2E authentication environment variables");
  }

  const request = page.context().request;
  let currentPassword = password;
  let response = await request.post("/api/auth/login", {
    data: { accountId, password },
  });

  if (response.status() === 401) {
    currentPassword = initialPassword;
    response = await request.post("/api/auth/login", {
      data: { accountId, password: initialPassword },
    });
  }

  const loginBody = await response.json() as LoginBody;
  expect(response.ok(), loginBody.error ?? "E2E login failed").toBeTruthy();
  expect(loginBody.user?.id).toBeTruthy();

  if (loginBody.user?.mustChangePassword) {
    const changeResponse = await request.post("/api/auth/change-password", {
      data: { currentPassword, newPassword: password },
    });
    const changeBody = await changeResponse.json() as LoginBody;
    expect(changeResponse.ok(), changeBody.error ?? "E2E password change failed").toBeTruthy();
  }

  const meResponse = await request.get("/api/auth/me");
  const meBody = await meResponse.json() as LoginBody;
  expect(meResponse.ok(), meBody.error ?? "E2E session verification failed").toBeTruthy();
  expect(meBody.user?.mustChangePassword).toBe(false);

  const readDraft = async (): Promise<PersistedDraft | null> => {
    const draftResponse = await request.get("/api/projects/initial-draft");
    expect(draftResponse.ok()).toBeTruthy();
    return (await draftResponse.json() as InitialDraftBody).draft;
  };

  // 重试韧性 + 脏库韧性：空首屏前提（无服务端草稿 + 无被恢复的正式项目）由夹具显式恢复。
  // CI 的 retries=1 会在同一个隔离库里重跑本 setup，上一次尝试可能已经落库；本地复用测试库时
  // 也可能残留上一次运行的正式项目。两者都只作用于隔离测试账号，且本用例随后就会重新走一遍
  // 首变更落库，因此不掩盖任何产品行为（与 initial-draft.spec.ts 同一条夹具惯例）。
  const clearedDraft = await request.post("/api/projects/initial-draft/force-clear", {
    data: { confirm: true },
  });
  expect(clearedDraft.ok(), await clearedDraft.text()).toBeTruthy();

  await page.goto("/");
  const tutorial = page.getByRole("dialog", { name: "欢迎使用服装设计工作台" });
  const tutorialResponse = await request.get("/api/tutorials/workbench-onboarding");
  const tutorialBody = await tutorialResponse.json() as TutorialBody;
  expect(tutorialResponse.ok()).toBeTruthy();
  if (tutorialBody.acknowledged) {
    await expect(tutorial).toBeHidden();
  } else {
    await expect(tutorial).toBeVisible();
    const nextButton = tutorial.getByRole("button", { name: "下一步" });
    const completeButton = tutorial.getByRole("button", { name: "完成教程" });
    for (let step = 0; step < 8 && !await completeButton.isVisible(); step += 1) {
      await nextButton.click();
    }
    await expect(completeButton).toBeVisible();
    await completeButton.click();
  }
  await expect(tutorial).toBeHidden();
  await page.reload();
  await expect(tutorial).toBeHidden();
  await expect(page.getByRole("navigation", { name: "工作台左侧工具" })).toBeVisible();

  // 回到规范起点：清页面会话里的项目页签，并遮住正式项目列表，避免脏库里上一次运行的
  // 项目被启动流程恢复出来（「空态不落库」的断言前提）。
  await page.evaluate(() => window.sessionStorage.clear());
  await page.route("**/api/projects", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ json: [] });
  });
  await page.reload();
  await expect(page.getByRole("navigation", { name: "工作台左侧工具" })).toBeVisible();

  // ---------- ① 空首屏：本地空 tab，登录态此时还没有任何服务端项目 ----------
  const canvas = page.getByRole("application", { name: "工作流画布" });
  const nodes = page.locator(".react-flow__node");
  const edges = page.locator(".react-flow__edge");
  const emptyCta = page.getByRole("region", { name: "开始创作" });
  await expect(canvas).toBeVisible();
  await expect(emptyCta).toBeVisible();
  await expect(emptyCta.getByRole("button", { name: "上传图片开始" })).toBeVisible();
  await expect(page.getByRole("region", { name: "开始第一个创作任务" })).toHaveCount(0);
  await expect(nodes).toHaveCount(0);
  await expect(edges).toHaveCount(0);
  expect(await readDraft(), "空首屏不得在首次实质变更前落库").toBeNull();

  // ---------- ② 首个实质变更：CTA 一键建输入层 image 节点，并等待 v8 落库 ----------
  // CTA 的「上传图片开始」会请求原生文件选择器；这里显式消化它，避免悬挂的 chooser 阻塞
  // 后续交互。真正的上传在下一步走节点的上传槽——与用户在该槽位选图是同一条生产路径。
  page.on("filechooser", (chooser) => {
    void chooser.setFiles([]);
  });

  const bootstrapResponsePromise = page.waitForResponse((candidate) => (
    candidate.request().method() === "POST"
    && new URL(candidate.url()).pathname === "/api/projects/initial-draft/bootstrap"
  ));
  await emptyCta.getByRole("button", { name: "上传图片开始" }).click();
  const bootstrapResponse = await bootstrapResponsePromise;
  expect(
    bootstrapResponse.ok(),
    `首次实质变更落库失败：HTTP ${bootstrapResponse.status()} ${await bootstrapResponse.text()}`,
  ).toBeTruthy();
  const bootstrapped = await bootstrapResponse.json() as { created?: boolean; draft?: PersistedDraft };
  expect(bootstrapped.created, "首次落库必须创建初始草稿（而不是复用已有记录）").toBe(true);
  const draft = bootstrapped.draft;
  if (!draft) throw new Error("首次落库响应缺少 draft");

  // v8：CTA = 一个输入层 image 节点，0 条边（输入节点不接受任何入边，v7 的 auto-text 兜底
  // 在 v8 会造出非法边，已在 store 层退役）。落库形状必须是 v8 合法图。
  await expect(nodes).toHaveCount(1);
  await expect(edges).toHaveCount(0);
  await expect(emptyCta).toHaveCount(0);
  expect(draft.flow.schemaVersion).toBe(WORKFLOW_SCHEMA_VERSION);
  expect(draft.flow.nodes.map((node) => node.data.kind)).toEqual(["image"]);
  expect(draft.flow.edges).toHaveLength(0);
  expect(
    illegalEdgeIndexes(draft.flow.nodes, draft.flow.edges),
    "首次落库的草稿不得含非法边（INV-3 / 结果源 / 生成源规则）",
  ).toEqual([]);

  // ---------- ③ 真实上传：图片直写 image 节点输出 ----------
  const imageNodeId = draft.flow.nodes.find((node) => node.data.kind === "image")?.id;
  if (!imageNodeId) throw new Error("首次落库的草稿缺少 image 节点");
  const imageNode = page.getByTestId(`rf__node-${imageNodeId}`);
  const uploadImage = await sharp({
    create: { width: 96, height: 64, channels: 3, background: "#735b42" },
  }).png().toBuffer();
  await imageNode.getByLabel("上传图片").setInputFiles({
    name: "setup-first-change.png",
    mimeType: "image/png",
    buffer: uploadImage,
  });
  await expect(imageNode.getByAltText("已上传图片")).toBeVisible();
  await expect(edges).toHaveCount(0);

  // ---------- ④ 落库确认：上传后的形状（含 outputImages）必须同步到服务端草稿 ----------
  await expect.poll(async () => {
    const current = await readDraft();
    const persistedImage = current?.flow.nodes.find((node) => node.data.kind === "image");
    return persistedImage?.data.outputImages?.length ?? -1;
  }, { timeout: 15_000 }).toBeGreaterThan(0);

  const persisted = await readDraft();
  if (!persisted) throw new Error("上传后服务端初始草稿不应消失");
  expect(persisted.id).toBe(draft.id);
  expect(persisted.flow.schemaVersion).toBe(WORKFLOW_SCHEMA_VERSION);
  expect(persisted.flow.nodes.map((node) => node.data.kind)).toEqual(["image"]);
  expect(persisted.flow.edges).toHaveLength(0);
  expect(
    illegalEdgeIndexes(persisted.flow.nodes, persisted.flow.edges),
    "上传后服务端草稿仍须是 v8 合法图",
  ).toEqual([]);

  await page.context().storageState({ path: authStatePath });
  // 可审计的运行证据：本次 setup 把登录态建立在这个已落库的 v8 草稿上。
  console.log(
    `[auth.setup] persisted initial draft: id=${persisted.id} name=${persisted.name} `
    + `schemaVersion=${persisted.flow.schemaVersion} revisions=${persisted.revision} `
    + `nodes=${persisted.flow.nodes.map((node) => node.data.kind).join("+")} `
    + `edges=${persisted.flow.edges.length} storageState=${authStatePath}`,
  );
});
