import sharp from "sharp";
import {
  WORKFLOW_SCHEMA_VERSION,
  missingTextUpstreamNodeIds,
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
 * 服务端已落库草稿的 v7 形状（server/routes/projects.ts 的 initialDraftPayload）。
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
 * ——空画布中央 CTA「上传图片开始」（= image 节点 + auto-text 兜底 text 节点 + prompt 边）+
 * 真实上传一张图片——并确认它以 WORKFLOW_SCHEMA_VERSION(7) 落库，然后把 storage state
 * 建立在这个「真实存在、v7 合法、满足 INV-1」的项目上，供后续 spec 复用。
 *
 * 这里刻意不依赖任何已被方案 C 删除或改变的语义：不靠重命名结束 pristine（重命名不再落库）、
 * 不靠 starter node（不再制造）、不靠 TaskLauncher 浮层（R-76 已删除）。
 */
setup("create an authenticated desktop session on a persisted v7 project", async ({ page }) => {
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

  const readDraft = async (): Promise<PersistedDraft | null> => {
    const draftResponse = await request.get("/api/projects/initial-draft");
    expect(draftResponse.ok()).toBeTruthy();
    return (await draftResponse.json() as InitialDraftBody).draft;
  };

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

  // ---------- ② 首个实质变更：CTA 一键建 image + auto-text 兜底，并等待 v7 落库 ----------
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

  // CTA = image 节点 + auto-text 兜底补出的 text 节点 + 一条 prompt 边；落库形状必须是 v7 合法图。
  await expect(nodes).toHaveCount(2);
  await expect(edges).toHaveCount(1);
  await expect(emptyCta).toHaveCount(0);
  expect(draft.flow.schemaVersion).toBe(WORKFLOW_SCHEMA_VERSION);
  expect(draft.flow.nodes).toHaveLength(2);
  expect(draft.flow.edges).toHaveLength(1);
  expect(
    missingTextUpstreamNodeIds(draft.flow.nodes, draft.flow.edges),
    "首次落库的草稿不得存在缺 text 上游的 image/video 节点（INV-1）",
  ).toEqual([]);

  // ---------- ③ 真实上传：图片直写 image 节点输出，且不破坏 text→image 的 prompt 边 ----------
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
  await expect(edges).toHaveCount(1);

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
  expect(persisted.flow.nodes.map((node) => node.data.kind).sort()).toEqual(["image", "text"]);
  expect(persisted.flow.edges).toHaveLength(1);
  expect(
    missingTextUpstreamNodeIds(persisted.flow.nodes, persisted.flow.edges),
    "上传后服务端草稿仍须满足 INV-1",
  ).toEqual([]);

  await page.context().storageState({ path: authStatePath });
  // 可审计的运行证据：本次 setup 把登录态建立在这个已落库的 v7 草稿上。
  console.log(
    `[auth.setup] persisted initial draft: id=${persisted.id} name=${persisted.name} `
    + `schemaVersion=${persisted.flow.schemaVersion} revisions=${persisted.revision} `
    + `nodes=${persisted.flow.nodes.map((node) => node.data.kind).join("+")} `
    + `edges=${persisted.flow.edges.length} storageState=${authStatePath}`,
  );
});
