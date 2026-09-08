import { expect, test } from "./fixtures";
import sharp from "sharp";

const STUB_IMAGE = `data:image/png;base64,${(
  await sharp({
    create: { width: 8, height: 8, channels: 3, background: { r: 68, g: 92, b: 118 } },
  }).png().toBuffer()
).toString("base64")}`;

interface UploadedFile {
  url: string;
}

interface PromptBinding {
  prompt: string;
  promptVariantId: string;
  promptFamilyId: string;
  parameterProfileId: string;
  contractHash: string;
  evaluationVersion: string;
  postprocessVersion: string;
  aspectRatio: string;
  batchSize: number;
  modelOptions: Record<string, unknown>;
}

interface RunPlanSnapshot {
  onlyNodeId: string;
  nodes: unknown[];
  edges: unknown[];
}

async function uploadStubImage(page: import("@playwright/test").Page): Promise<string> {
  const response = await page.request.post("/api/files", { data: { dataUrl: STUB_IMAGE } });
  expect(response.ok(), await response.text()).toBeTruthy();
  const body = await response.json() as UploadedFile;
  expect(body.url).toMatch(/^\/api\/files\//);
  return body.url;
}

async function installReviewedEditBinding(
  page: import("@playwright/test").Page,
  roleProfile: readonly { order: number; role: string }[] = [
    { order: 0, role: "identity" },
    { order: 1, role: "pose_composition" },
    { order: 2, role: "garment_full" },
  ],
): Promise<PromptBinding> {
  return page.evaluate(async ({ roleProfile }) => {
    const load = (path: string) => import(/* @vite-ignore */ path);
    const [catalog, releaseTools, registry, profiles] = await Promise.all([
      load("/src/lib/garmentPromptPresets.ts"),
      load("/src/lib/promptEvaluationRelease.ts"),
      load("/src/lib/promptEvaluationReleaseRegistry.ts"),
      load("/src/types/modelParameterProfiles.ts"),
    ]);
    const codeSha = "0123456789abcdef0123456789abcdef01234567";
    (globalThis as unknown as {
      process?: { env?: Record<string, string> };
    }).process = { env: { GARMENT_CANVAS_CODE_SHA: codeSha } };
    const variant = catalog.getGarmentPromptVariant({
      familyId: "commerce-hero",
      modelId: "gpt-image-2-vip",
      nodeKind: "ai-modify",
      mode: "edit",
    });
    if (!variant) throw new Error("Missing E2E edit prompt variant");
    (variant as { supportStatus: string; requiredRoles: string[] }).supportStatus = "verified";
    (variant as { requiredRoles: string[] }).requiredRoles = [];
    const profile = profiles.getModelParameterProfile(variant.parameterProfileId);
    if (!profile) throw new Error("Missing E2E edit parameter profile");
    const releases = registry.PROMPT_EVALUATION_RELEASES as unknown as Array<unknown>;
    releases.push(releaseTools.createPromptEvaluationReleaseSnapshot(
      variant,
      roleProfile,
      "verified",
      "e2e-reference-role-confirmation",
      {
        evaluationStage: "formal-validation",
        evidenceArtifactSha256: "0".repeat(64),
        gateReceiptSha256: "0".repeat(64),
        evaluationUnitKey: `sha256:${"0".repeat(64)}`,
        codeSha,
      },
    ));
    const parameters = profiles.materializeModelParameterProfile(profile);
    return {
      prompt: catalog.buildGarmentPrompt(variant.variantId, "三张参考图角色确认验收"),
      promptVariantId: variant.variantId,
      promptFamilyId: variant.familyId,
      parameterProfileId: variant.parameterProfileId,
      contractHash: variant.contractHash,
      evaluationVersion: variant.evaluationVersion,
      postprocessVersion: profile.postprocess.version,
      aspectRatio: parameters.aspectRatio,
      batchSize: parameters.batchSize,
      modelOptions: parameters.modelOptions,
    };
  }, { roleProfile });
}

async function chooseRoleWithKeyboard(
  summary: import("@playwright/test").Locator,
  sourceLabel: string,
  optionIndex: number,
): Promise<void> {
  const selector = summary.getByRole("combobox", {
    name: new RegExp(`^参考图 \\d+：${sourceLabel} 的角色$`),
  });
  await selector.focus();
  await selector.press("Enter");
  const listboxId = await selector.getAttribute("aria-controls");
  expect(listboxId).toBeTruthy();
  const listbox = summary.page().locator(`[role="listbox"][id="${listboxId}"]`);
  await expect(listbox).toBeVisible();
  await listbox.getByRole("option").nth(optionIndex).press("Enter");
  await expect(selector).not.toHaveAttribute("aria-expanded", "true");
  await expect(selector).toBeFocused();
}

async function expectSummaryFitsViewport(
  summary: import("@playwright/test").Locator,
): Promise<void> {
  const summaryBox = await summary.boundingBox();
  expect(summaryBox).not.toBeNull();
  if (!summaryBox) throw new Error("reference summary geometry is unavailable");
  const rowBoxes = await summary.locator("[data-reference-order]").evaluateAll((rows) => rows.map((row) => {
    const box = row.getBoundingClientRect();
    return { right: box.right, bottom: box.bottom };
  }));
  for (const row of rowBoxes) {
    expect(row.right).toBeLessThanOrEqual(summaryBox.x + summaryBox.width + 1);
    expect(row.bottom).toBeLessThanOrEqual(summaryBox.y + summaryBox.height + 1);
  }
  const pageWidth = await summary.page().evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.innerWidth);
}

test("三张参考图按顺序经键盘确认后从 blocked 变为 ready，且桌面摘要保持紧凑", async ({ page }) => {
  const imageUrls = await Promise.all([
    uploadStubImage(page),
    uploadStubImage(page),
    uploadStubImage(page),
  ]);
  const projectId = `e2e-reference-role-${Date.now()}`;
  const projectName = `E2E 三参考图角色确认 ${projectId.slice(-6)}`;
  const targetNodeId = "reference-role-target";
  const flow = {
    schemaVersion: 6,
    nodes: [
      ...[
        ["identity-reference", "人物参考", imageUrls[0]],
        ["pose-reference", "姿势参考", imageUrls[1]],
        ["garment-reference", "服装参考", imageUrls[2]],
      ].map(([id, label, imageUrl], index) => ({
        id,
        type: "image-input",
        position: { x: index * 320, y: 0 },
        data: {
          kind: "image-input",
          label,
          status: "idle",
          imageRole: "generic",
          roleNeedsConfirmation: true,
          imageUrl,
        },
      })),
      {
        id: targetNodeId,
        type: "ai-modify",
        position: { x: 480, y: 360 },
        data: {
          kind: "ai-modify",
          label: "三张参考图确认目标",
          status: "idle",
          prompt: "验收前置提示词",
          aspectRatio: "1:1",
          batchSize: 1,
          outputImages: [],
          operationMode: "edit",
          operationModeNeedsConfirmation: false,
          modelId: "gpt-image-2-vip",
          modelOptions: { size: "auto" },
        },
      },
    ],
    edges: [
      ["identity-reference", "identity-edge"],
      ["pose-reference", "pose-edge"],
      ["garment-reference", "garment-edge"],
    ].map(([source, id]) => ({
      id,
      source,
      target: targetNodeId,
      sourceHandle: null,
      targetHandle: null,
      data: { role: "generic", roleNeedsConfirmation: true },
    })),
  };

  const save = await page.request.post("/api/projects", {
    data: { id: projectId, name: projectName, flow },
  });
  expect(save.ok(), await save.text()).toBeTruthy();

  await page.goto("/");
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
  const binding = await installReviewedEditBinding(page);

  await page.getByRole("button", { name: "打开项目中心" }).click();
  const projectCenter = page.getByRole("dialog", { name: "项目中心" });
  await expect(projectCenter).toBeVisible();
  await projectCenter.locator("button").filter({ hasText: projectName }).click();

  const targetNode = page.locator(".react-flow__node").filter({ hasText: "三张参考图确认目标" });
  await expect(targetNode).toBeVisible();
  await targetNode.click();
  await page.evaluate(async ({ targetNodeId, binding }) => {
    const modulePath = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ modulePath);
    store.useFlowStore.getState().updateNodeData(targetNodeId, binding);
  }, { targetNodeId, binding });

  await page.getByRole("button", { name: "属性 / 结果" }).click();
  const properties = page.getByRole("tabpanel", { name: "属性" });
  const summary = properties.getByRole("region", { name: "参考图角色摘要" });
  await expect(summary).toBeVisible();
  await expect(summary.locator("[data-reference-order]")).toHaveCount(3);
  await expect(summary.locator("[data-reference-order]").filter({ hasText: "待确认" })).toHaveCount(3);
  const blockedRun = properties.getByRole("button", { name: "未验证不可运行" });
  await expect(blockedRun).toBeDisabled();
  await expect(properties.getByText("参考图角色尚未全部确认")).toBeVisible();

  await chooseRoleWithKeyboard(summary, "人物参考", 0);
  await chooseRoleWithKeyboard(summary, "姿势参考", 1);
  await chooseRoleWithKeyboard(summary, "服装参考", 4);

  await expect(summary.locator("[data-reference-order]").filter({ hasText: "已确认" })).toHaveCount(3);
  const readyRun = properties.getByRole("button", { name: "运行此节点" });
  await expect(readyRun).toBeEnabled();

  await expectSummaryFitsViewport(summary);
});

test("确认后的参考图可键盘重排和移除，保存重开不改写旧运行快照", async ({ page }) => {
  const imageUrls = await Promise.all([
    uploadStubImage(page),
    uploadStubImage(page),
    uploadStubImage(page),
  ]);
  const projectId = `e2e-reference-edit-${Date.now()}`;
  const projectName = `E2E 参考图编辑快照 ${projectId.slice(-6)}`;
  const targetNodeId = "reference-edit-target";
  const flow = {
    schemaVersion: 6,
    nodes: [
      ...[
        ["edit-identity-reference", "人物参考", imageUrls[0]],
        ["edit-pose-reference", "姿势参考", imageUrls[1]],
        ["edit-garment-reference", "服装参考", imageUrls[2]],
      ].map(([id, label, imageUrl], index) => ({
        id,
        type: "image-input",
        position: { x: index * 320, y: 0 },
        data: {
          kind: "image-input",
          label,
          status: "idle",
          imageRole: "generic",
          roleNeedsConfirmation: true,
          imageUrl,
        },
      })),
      {
        id: targetNodeId,
        type: "ai-modify",
        position: { x: 480, y: 360 },
        data: {
          kind: "ai-modify",
          label: "参考图编辑快照目标",
          status: "idle",
          prompt: "验收前置提示词",
          aspectRatio: "1:1",
          batchSize: 1,
          outputImages: [],
          operationMode: "edit",
          operationModeNeedsConfirmation: false,
          modelId: "gpt-image-2-vip",
          modelOptions: { size: "auto" },
        },
      },
    ],
    edges: [
      ["edit-identity-reference", "edit-identity-edge"],
      ["edit-pose-reference", "edit-pose-edge"],
      ["edit-garment-reference", "edit-garment-edge"],
    ].map(([source, id]) => ({
      id,
      source,
      target: targetNodeId,
      sourceHandle: null,
      targetHandle: null,
      data: { role: "generic", roleNeedsConfirmation: true },
    })),
  };

  const save = await page.request.post("/api/projects", {
    data: { id: projectId, name: projectName, flow },
  });
  expect(save.ok(), await save.text()).toBeTruthy();

  const runs: RunPlanSnapshot[] = [];
  const nodeIdByRun = new Map<string, string>();
  let runSequence = 0;
  await page.route("**/api/run-plan**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/run-plan" && request.method() === "POST") {
      const body = request.postDataJSON() as RunPlanSnapshot;
      runs.push(structuredClone(body));
      const runId = `e2e-reference-edit-${++runSequence}`;
      nodeIdByRun.set(runId, body.onlyNodeId);
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ runId, status: "queued" }),
      });
      return;
    }
    const match = pathname.match(/^\/api\/run-plan\/([^/]+)(\/events)?$/);
    if (!match) {
      await route.abort("blockedbyclient");
      return;
    }
    const runId = decodeURIComponent(match[1]);
    const nodeId = nodeIdByRun.get(runId);
    if (!nodeId) throw new Error(`Unknown reference-edit run ${runId}`);
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
          prompts: ["reference edit snapshot"],
          startedAt: now,
          finishedAt: now + 25,
        },
        { seq: 3, type: "done" },
      ];
      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: events.map((event) => `id: ${event.seq}\ndata: ${JSON.stringify(event)}\n\n`).join(""),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: runId, status: "running" }),
    });
  });

  await page.goto("/");
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
  const binding = await installReviewedEditBinding(page);

  await page.getByRole("button", { name: "打开项目中心" }).click();
  const projectCenter = page.getByRole("dialog", { name: "项目中心" });
  await expect(projectCenter).toBeVisible();
  await projectCenter.locator("button").filter({ hasText: projectName }).click();

  const targetNode = page.locator(".react-flow__node").filter({ hasText: "参考图编辑快照目标" });
  await expect(targetNode).toBeVisible();
  await targetNode.click();
  await page.evaluate(async ({ targetNodeId, binding }) => {
    const modulePath = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ modulePath);
    store.useFlowStore.getState().updateNodeData(targetNodeId, binding);
  }, { targetNodeId, binding });

  await page.getByRole("button", { name: "属性 / 结果" }).click();
  const properties = page.getByRole("tabpanel", { name: "属性" });
  const summary = properties.getByRole("region", { name: "参考图角色摘要" });
  await expect(summary).toBeVisible();
  await chooseRoleWithKeyboard(summary, "人物参考", 0);
  await chooseRoleWithKeyboard(summary, "姿势参考", 1);
  await chooseRoleWithKeyboard(summary, "服装参考", 4);
  const runButton = properties.getByRole("button", { name: "运行此节点" });
  await expect(runButton).toBeEnabled();

  await runButton.click();
  await expect.poll(() => runs.length).toBe(1);
  const originalRunEdges = structuredClone(runs[0].edges);
  await expect(targetNode.getByTitle("成功")).toBeVisible();

  const roleSelector = summary.getByRole("combobox", { name: "参考图 1：人物参考 的角色" });
  await chooseRoleWithKeyboard(summary, "人物参考", 8);
  await expect(roleSelector).toHaveText("背景");

  const moveUp = summary.getByRole("button", { name: "上移参考图 2" });
  await moveUp.focus();
  await moveUp.press("Enter");
  await expect(summary.locator('[data-reference-order="0"]')).toContainText("姿势参考");
  await expect(summary.locator('[data-reference-order="1"]')).toContainText("人物参考");

  const removeLast = summary.getByRole("button", { name: "移除参考图 3" });
  await removeLast.focus();
  await removeLast.press("Enter");
  await expect(summary.locator("[data-reference-order]")).toHaveCount(2);
  await expect(summary.getByRole("combobox", { name: "参考图 2：人物参考 的角色" })).toBeFocused();
  expect(runs[0].edges).toEqual(originalRunEdges);

  const tabs = page.getByRole("navigation", { name: "项目画布页签" });
  await tabs.getByRole("button", { name: projectName, exact: true }).dblclick();
  const saveButton = tabs.getByRole("button", { name: "保存项目名称和画布" });
  await expect(saveButton).toBeVisible();
  const saveResponse = page.waitForResponse((response) => (
    response.url().endsWith("/api/projects") && response.request().method() === "POST"
  ));
  await saveButton.click();
  await expect((await saveResponse).ok()).toBeTruthy();

  await tabs.getByRole("button", { name: `关闭 ${projectName}`, exact: true }).click();
  await page.getByRole("button", { name: "打开项目中心" }).click();
  const reopenedCenter = page.getByRole("dialog", { name: "项目中心" });
  await expect(reopenedCenter).toBeVisible();
  await reopenedCenter.locator("button").filter({ hasText: projectName }).click();

  const reopenedTarget = page.locator(".react-flow__node").filter({ hasText: "参考图编辑快照目标" });
  await expect(reopenedTarget).toBeVisible();
  await reopenedTarget.click();
  const reopenedProperties = page.getByRole("tabpanel", { name: "属性" });
  const reopenedSummary = reopenedProperties.getByRole("region", { name: "参考图角色摘要" });
  await expect(reopenedSummary.locator("[data-reference-order]")).toHaveCount(2);
  await expect(reopenedSummary.locator('[data-reference-order="0"]')).toContainText("姿势参考");
  await expect(reopenedSummary.locator('[data-reference-order="1"]')).toContainText("人物参考");
  await expect(reopenedSummary.getByRole("combobox", { name: "参考图 1：姿势参考 的角色" })).toHaveText("姿势与构图");
  await expect(reopenedSummary.getByRole("combobox", { name: "参考图 2：人物参考 的角色" })).toHaveText("背景");
  await expectSummaryFitsViewport(reopenedSummary);
  expect(runs[0].edges).toEqual(originalRunEdges);
});

test("旧项目打开后保留含糊参考图并在确认前阻断，generic 确认仍服从具体角色", async ({ page }) => {
  const imageUrls = await Promise.all([
    uploadStubImage(page),
    uploadStubImage(page),
  ]);
  const projectId = `e2e-reference-legacy-${Date.now()}`;
  const projectName = `E2E 旧项目参考图 ${projectId.slice(-6)}`;
  const targetNodeId = "legacy-reference-target";
  const flow = {
    schemaVersion: 4,
    nodes: [
      {
        id: "legacy-garment-reference",
        type: "image-input",
        position: { x: 0, y: 0 },
        data: {
          kind: "image-input",
          label: "历史服装参考",
          status: "idle",
          imageRole: "garment",
          imageUrl: imageUrls[0],
        },
      },
      {
        id: "legacy-unknown-reference",
        type: "image-input",
        position: { x: 320, y: 0 },
        data: {
          kind: "image-input",
          label: "历史含糊参考",
          status: "idle",
          imageRole: "reference",
          imageUrl: imageUrls[1],
        },
      },
      {
        id: targetNodeId,
        type: "ai-modify",
        position: { x: 480, y: 360 },
        data: {
          kind: "ai-modify",
          label: "旧项目复核目标",
          status: "idle",
          prompt: "旧项目迁移验收",
          outputImages: [],
        },
      },
    ],
    edges: [
      {
        id: "legacy-garment-edge",
        source: "legacy-garment-reference",
        target: targetNodeId,
      },
      {
        id: "legacy-unknown-edge",
        source: "legacy-unknown-reference",
        target: targetNodeId,
      },
    ],
  };
  const save = await page.request.post("/api/projects", {
    data: { id: projectId, name: projectName, flow },
  });
  expect(save.ok(), await save.text()).toBeTruthy();

  await page.goto("/");
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();
  const binding = await installReviewedEditBinding(page, [
    { order: 0, role: "garment_full" },
    { order: 1, role: "generic" },
  ]);
  await page.getByRole("button", { name: "打开项目中心" }).click();
  const projectCenter = page.getByRole("dialog", { name: "项目中心" });
  await expect(projectCenter).toBeVisible();
  await projectCenter.locator("button").filter({ hasText: projectName }).click();

  const targetNode = page.locator(".react-flow__node").filter({ hasText: "旧项目复核目标" });
  await expect(targetNode).toBeVisible();
  await targetNode.click();
  await page.evaluate(async ({ targetNodeId, binding }) => {
    const modulePath = "/src/store/flowStore.ts";
    const store = await import(/* @vite-ignore */ modulePath);
    store.useFlowStore.getState().updateNodeData(targetNodeId, binding);
  }, { targetNodeId, binding });

  await page.getByRole("button", { name: "属性 / 结果" }).click();
  const properties = page.getByRole("tabpanel", { name: "属性" });
  const summary = properties.getByRole("region", { name: "参考图角色摘要" });
  await expect(summary.locator("[data-reference-order]")).toHaveCount(2);
  await expect(summary.locator('[data-reference-order="0"]')).toContainText("历史服装参考");
  await expect(summary.locator('[data-reference-order="1"]')).toContainText("历史含糊参考");
  await expect(summary.locator('[data-reference-order="0"]')).toContainText("待确认");
  await expect(summary.locator('[data-reference-order="1"]')).toContainText("待确认");
  await expect(properties.getByRole("button", { name: "未验证不可运行" })).toBeDisabled();
  await expect(properties.getByText("参考图角色尚未全部确认")).toBeVisible();

  await chooseRoleWithKeyboard(summary, "历史含糊参考", 9);
  await expect(summary.locator('[data-reference-order="1"]')).toContainText("已确认");
  await expect(summary.locator('[data-reference-order="1"]')).toContainText("通用补充参考");
  await expect(properties.getByRole("button", { name: "未验证不可运行" })).toBeDisabled();

  await chooseRoleWithKeyboard(summary, "历史服装参考", 4);
  await expect(summary.locator('[data-reference-order="0"]')).toContainText("已确认");
  await expect(summary.locator('[data-reference-order="0"]')).toContainText("整套服装");
  await expect(properties.getByRole("button", { name: "运行此节点" })).toBeEnabled();
  await expectSummaryFitsViewport(summary);
});
