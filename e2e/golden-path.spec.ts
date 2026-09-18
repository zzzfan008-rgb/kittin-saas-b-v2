import type { Request } from "@playwright/test";
import sharp from "sharp";
import { expect, test } from "./fixtures";

const STUB_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n7sAAAAASUVORK5CYII=";

interface ProjectSaveBody {
  id: string;
  name: string;
  flow: { nodes: unknown[]; edges: unknown[] };
}

interface RunPlanBody {
  onlyNodeId: string;
  nodes: unknown[];
  edges: unknown[];
}

function postBody<T>(request: Request): T | null {
  if (request.method() !== "POST") return null;
  return request.postDataJSON() as T;
}

async function installTestOnlyReviewedTextVariant(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate(async () => {
    const promptCatalogPath = "/src/lib/garmentPromptPresets.ts";
    const releasePath = "/src/lib/promptEvaluationRelease.ts";
    const registryPath = "/src/lib/promptEvaluationReleaseRegistry.ts";
    const [catalog, releaseTools, registry] = await Promise.all([
      import(/* @vite-ignore */ promptCatalogPath),
      import(/* @vite-ignore */ releasePath),
      import(/* @vite-ignore */ registryPath),
    ]);
    const codeSha = "0123456789abcdef0123456789abcdef01234567";
    (globalThis as unknown as {
      process?: { env?: Record<string, string> };
    }).process = { env: { GARMENT_CANVAS_CODE_SHA: codeSha } };
    const variant = catalog.getGarmentPromptVariant({
      familyId: "commerce-hero",
      modelId: "gpt-image-2.5-flare-vip",
      nodeKind: "sketch-to-render",
      mode: "generate",
    });
    if (!variant) throw new Error("Missing E2E prompt variant");
    variant.supportStatus = "verified";
    const releases = registry.PROMPT_EVALUATION_RELEASES as unknown as Array<unknown>;
    releases.push(releaseTools.createPromptEvaluationReleaseSnapshot(
      variant,
      "verified",
      "e2e-test-only-evidence",
      {
        evaluationStage: "formal-validation",
        evidenceArtifactSha256: "0".repeat(64),
        gateReceiptSha256: "0".repeat(64),
        evaluationUnitKey: `sha256:${"0".repeat(64)}`,
        codeSha,
      },
    ));
  });
}

test("unverified upload stays blocked while a test-reviewed text starter completes the isolated golden path", async ({ page }) => {
  const uploadImage = await sharp({
    create: { width: 96, height: 64, channels: 3, background: "#735b42" },
  }).png().toBuffer();
  const saves: ProjectSaveBody[] = [];
  const runs: RunPlanBody[] = [];
  let runSequence = 0;
  const nodeIdByRun = new Map<string, string>();

  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/projects") {
      const body = postBody<ProjectSaveBody>(request);
      if (body) saves.push(body);
    }
  });

  // Only the app's durable-run boundary is stubbed. No provider host or real AI key is reachable.
  await page.route("**/api/run-plan**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/run-plan" && request.method() === "POST") {
      const body = postBody<RunPlanBody>(request);
      if (!body) throw new Error("Missing stub run body");
      runs.push(body);
      const runId = `e2e-golden-${++runSequence}`;
      nodeIdByRun.set(runId, body.onlyNodeId);
      await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ runId, status: "queued" }) });
      return;
    }
    const match = pathname.match(/^\/api\/run-plan\/([^/]+)(\/events)?$/);
    if (!match) {
      await route.abort("blockedbyclient");
      return;
    }
    const runId = decodeURIComponent(match[1]);
    const nodeId = nodeIdByRun.get(runId);
    if (!nodeId) throw new Error(`Unknown stub run ${runId}`);
    if (match[2] === "/events") {
      const now = Date.now();
      const events = [
        { seq: 1, type: "node-status", nodeId, status: "running", startedAt: now },
        {
          seq: 2,
          type: "node-status",
          nodeId,
          status: "success",
          images: [STUB_IMAGE],
          model: "e2e-stub-model",
          prompts: ["isolated golden path"],
          startedAt: now,
          finishedAt: now + 25,
        },
        { seq: 3, type: "done" },
      ];
      const body = events.map((event) => `id: ${event.seq}\ndata: ${JSON.stringify(event)}\n\n`).join("");
      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body,
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: runId, status: "running" }) });
  });

  await page.goto("/");
  await expect(page.getByText(/正在确认运行历史|运行历史同步失败/)).toHaveCount(0);
  const initialDraftResponse = await page.context().request.get("/api/projects/initial-draft");
  expect(initialDraftResponse.ok()).toBeTruthy();
  const initialDraft = await initialDraftResponse.json() as { draft?: { id?: string } };
  expect(initialDraft.draft?.id).toBeTruthy();
  const launcher = page.getByRole("region", { name: "开始第一个创作任务" });
  if (!await launcher.isVisible()) {
    await page.getByRole("button", { name: "打开项目中心" }).click();
    const center = page.getByRole("dialog", { name: "项目中心" });
    await expect(center).toBeVisible();
    await center.getByRole("button", { name: "新建项目" }).click();
  }
  await expect(launcher).toBeVisible();
  await expect(launcher.getByRole("button", { name: /使用内置模板：/ })).toHaveCount(6);
  const coverImages = launcher.locator('img[aria-hidden="true"]');
  await expect(coverImages).toHaveCount(6);
  await expect.poll(() => coverImages.evaluateAll((images) => images.filter((image) => {
    if (!(image instanceof HTMLImageElement)) return false;
    return image.currentSrc.endsWith(".webp") && image.naturalWidth > 0;
  }).length)).toBe(6);

  await launcher.getByRole("button", { name: "使用内置模板：图案风格迁移（图案→参考风格）" }).click();
  const uploadNode = page.getByTestId("rf__node-pattern");
  await expect(uploadNode).toBeVisible();
  const uploadFileChooser = page.waitForEvent("filechooser");
  await uploadNode.getByRole("button", { name: "上传图片" }).click();
  const fileChooser = await uploadFileChooser;
  await fileChooser.setFiles({ name: "starter.png", mimeType: "image/png", buffer: uploadImage });
  await expect(uploadNode.getByAltText("已上传图片")).toBeVisible();

  const uploadGenerateNode = page.getByTestId("rf__node-transfer");
  await expect(uploadGenerateNode.getByRole("button", { name: "未验证不可运行" })).toBeDisabled();
  await expect(uploadGenerateNode.getByText(/没有绑定当前版本的独立提示词变体/)).toBeVisible();
  expect(runs).toHaveLength(0);

  await page.getByRole("button", { name: "打开项目中心" }).click();
  const projectCenter = page.getByRole("dialog", { name: "项目中心" });
  await expect(projectCenter).toBeVisible();
  await projectCenter.getByRole("button", { name: /新建项目/ }).click();
  await expect(launcher).toBeVisible();
  await expect(launcher.getByRole("button", { name: /使用内置模板：/ })).toHaveCount(6);
  await installTestOnlyReviewedTextVariant(page);
  await launcher.getByRole("button", { name: "使用内置模板：文生图（服装设计）" }).click();
  const textNode = page.locator(".react-flow__node").filter({ hasText: "文生图" });
  const prompt = textNode.locator("textarea").first();
  await expect(prompt).toBeFocused();
  await expect.poll(() => page.evaluate(() => {
    const control = document.activeElement;
    return control instanceof HTMLTextAreaElement &&
      control.value.length > 0 &&
      control.selectionStart === 0 &&
      control.selectionEnd === control.value.length;
  })).toBe(true);
  await prompt.fill("极简黑白通勤女装，写实摄影，浅灰背景");

  const contextToggle = page.getByRole("button", { name: "属性 / 结果" });
  await contextToggle.click();
  const properties = page.getByRole("tabpanel", { name: "属性" });
  await properties.getByRole("button", { name: "服装提示词预设" }).click();
  await properties.getByRole("button", { name: /电商主图/ }).click();
  await properties.getByRole("button", { name: "确认应用" }).click();

  await textNode.getByRole("button", { name: "生成效果图" }).click();
  await expect(textNode.getByLabel("状态：成功")).toBeVisible();
  await expect.poll(() => runs.length).toBe(1);
  await expect.poll(() => saves.length).toBe(1);
  expect(runs[0].nodes).toEqual(saves[0].flow.nodes);
  expect(runs[0].edges).toEqual(saves[0].flow.edges);

  await page.getByRole("tab", { name: "结果 / 记录" }).click();
  const results = page.getByRole("region", { name: "最近生成" });
  const textResult = results.getByAltText("文生图");
  await expect(textResult).toBeVisible();

  const textResultCard = results.locator('article:has(img[alt="文生图"])');
  await textResultCard.hover();
  const actionBar = textResultCard.locator('div.absolute.inset-x-0.bottom-0');
  await expect(actionBar).toHaveClass(/grid-cols-2/);
  await expect(textResultCard.locator('button[title="查看"]')).toBeVisible();
  await expect(textResultCard.locator('button[title="加入对比"]')).toBeVisible();
  await expect(textResultCard.locator('a[title="下载"]')).toHaveAttribute("download", "");
  const textInputNodesBefore = await page.locator(".react-flow__node").filter({ hasText: "文生图" }).count();
  await textResultCard.locator('button[title="设为输入"]').click();
  await expect(page.locator(".react-flow__node").filter({ hasText: "文生图" })).toHaveCount(textInputNodesBefore + 1);
  await page.getByRole("tab", { name: "结果 / 记录" }).click();

  await textResultCard.locator('button[title="查看"]').click();
  await expect(page.getByText(/滚轮缩放 100%/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText(/滚轮缩放 100%/)).toHaveCount(0);

  // 「设为输入」会选中新节点并把面板切到「属性」，其异步落地可能与后续步骤竞态；
  // 重新切回「结果 / 记录」并等结果卡片可见，避免主题循环里读不到动作按钮。
  await page.getByRole("tab", { name: "结果 / 记录" }).click();
  await expect(textResultCard).toBeVisible();

  for (const theme of ["white", "eye", "current"] as const) {
    await page.evaluate((value) => {
      document.documentElement.setAttribute("data-theme", value);
    }, theme);
    // 读 token 而非 computed color：computed color 受 hover:text-white 影响（鼠标移出后
    // :hover 要到下一帧才失效，存在竞态）；token 在三种主题下都应稳定为 #f4f4f4。
    const viewToken = await textResultCard.locator('button[title="查看"]').evaluate(
      (element) => getComputedStyle(element).getPropertyValue("--gc-media-overlay-text").trim(),
    );
    expect(viewToken).toBe("#f4f4f4");
    const inputToken = await textResultCard.locator('button[title="设为输入"]').evaluate(
      (element) => getComputedStyle(element).getPropertyValue("--gc-media-overlay-text").trim(),
    );
    expect(inputToken).toBe("#f4f4f4");
  }

  const canvasNodes = page.locator(".react-flow__node");
  const nodeCountBeforeLibraryClick = await canvasNodes.count();
  await page.getByRole("button", { name: "节点库" }).click();
  const library = page.getByRole("region", { name: "节点库" });
  await library.getByRole("button", { name: /AI 改款/ }).click();
  await expect(canvasNodes).toHaveCount(nodeCountBeforeLibraryClick + 1);
  const clickedNode = canvasNodes.filter({ hasText: "AI 改款" });
  await expect(clickedNode.locator("textarea").first()).toBeFocused();
});
