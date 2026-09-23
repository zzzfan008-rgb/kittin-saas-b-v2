import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import express, { type Request, type Response } from "express";
import { ProviderError } from "../server/providers/base";
import type { AuthenticatedRequest, AuthUser } from "../server/lib/auth";
import type { GenerationRecordContext } from "../server/engine/runQueue";
import type { EvaluationRunPolicy } from "../server/lib/evaluationRunPolicy";
import type { ProviderResolver } from "../server/engine/runner";
import type { AIProvider, ExecutionPlan, ImageGenRequest, ImageGenResult, NodeExecution, NodeStatusRunEvent } from "../src/types/workflow";
import type { ImageModelId } from "../src/types/imageModels";
import type { EvaluationShutdownRule } from "../src/types/promptEvaluation";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-run-queue-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "queue-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";
process.env.GARMENT_CANVAS_CODE_SHA = "a".repeat(40);

await resetPostgresTestDatabase();
const database = await import("../server/lib/database");
const queue = await import("../server/engine/runQueue");
const authorizationLedger = await import("../server/lib/evaluationAuthorizationLedger");
const evaluationCampaign = await import("../server/lib/evaluationCampaign");
const evaluationEvidenceStore = await import("../server/lib/evaluationEvidenceStore");
const evaluationEvidence = await import("../server/lib/evaluationEvidence");
const evaluationRunPolicy = await import("../server/lib/evaluationRunPolicy");
const fileStore = await import("../server/lib/fileStore");
const { executeStep } = await import("../server/engine/runner");
const { generateRouter } = await import("../server/routes/generate");
const { historyRouter } = await import("../server/routes/history");
const { streamDurableRunEvents } = await import("../server/routes/runPlan");
const {
  requireGarmentPromptVariant,
} = await import("../src/lib/garmentPromptPresets");
const {
  getModelParameterProfile,
  materializeModelParameterProfile,
} = await import("../src/types/modelParameterProfiles");
const { renderProviderPrompt } = await import("../src/lib/providerPromptRenderer");
const { PROMPT_RUNTIME_SHUTDOWN_RULES } = await import("../src/lib/promptRuntimeShutdown");
const {
  promotePromptVariantForTest,
  withdrawPromptVariantReleasesForTest,
} = await import("./promptReleaseTestSupport");
await database.initializeDatabase();

const queueVariant = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "generate",
});
// Queue tests exercise already-reviewed production jobs unless a test explicitly
// changes this status to prove execution-time fail-closed behaviour.
promotePromptVariantForTest(queueVariant);
const queueProfile = getModelParameterProfile(queueVariant.parameterProfileId)!;
const queueParameters = materializeModelParameterProfile(queueProfile);

const runtimeEditVariant = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "edit",
});
promotePromptVariantForTest(runtimeEditVariant);
const runtimeEditProfile = getModelParameterProfile(runtimeEditVariant.parameterProfileId)!;
const runtimeEditParameters = materializeModelParameterProfile(runtimeEditProfile);

const maskVariant = requireGarmentPromptVariant({
  familyId: "mask-local-edit",
  modelId: "gpt-image-2.5-sunburst",
  nodeKind: "image",
  mode: "mask-edit",
});
// This isolated queue/route fixture needs an accepted run to inspect persistence.
// Model reviewed evidence only inside this process; production catalog remains fail-closed.
promotePromptVariantForTest(maskVariant);
const maskProfile = getModelParameterProfile(maskVariant.parameterProfileId)!;
const maskParameters = materializeModelParameterProfile(maskProfile);

const owner = await database.queryOne<{ id: string }>("SELECT id FROM users WHERE account_id = 'queue-admin'");
assert.ok(owner);
const adminActor: AuthUser = {
  id: owner.id,
  accountId: "queue-admin",
  displayName: "管理员",
  role: "admin",
  mustChangePassword: true,
};

const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const OPAQUE_PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADUlEQVQImWP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";
const TEST_EVALUATION_CODE_IDENTITY = {
  codeSha: "a".repeat(40),
  source: "git-head" as const,
  dirty: false,
};
let sequence = 0;
let clock = Date.now() + 10_000;
let passed = 0;

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

function tick(amount = 1_000): number {
  clock = Math.max(clock + amount, Date.now() + 1_000);
  return clock;
}

function boundQueueParams(
  intent: string,
  overrides: Readonly<Record<string, unknown>> = {},
): NodeExecution["params"] {
  return {
    // v7：真实 DAG 产出——用户正文沿 text 边进入 inputTexts，params 无 prompt。
    inputTexts: [intent],
    promptVariantId: queueVariant.variantId,
    promptFamilyId: queueVariant.familyId,
    parameterProfileId: queueVariant.parameterProfileId,
    contractHash: queueVariant.contractHash,
    evaluationVersion: queueVariant.evaluationVersion,
    postprocessVersion: queueProfile.postprocess.version,
    operationMode: queueVariant.mode,
    modelId: queueVariant.modelId,
    modelOptions: queueParameters.modelOptions,
    aspectRatio: queueParameters.aspectRatio,
    batchSize: queueParameters.batchSize,
    ...overrides,
  };
}

function step(nodeId: string, upstream?: NodeExecution["upstream"]): NodeExecution {
  return {
    nodeId,
    kind: "image-generator",
    inputImages: [],
    upstream,
    params: boundQueueParams("生成服装效果图"),
  };
}

// 租约恢复测试手工模拟「Provider 请求已发出」状态；该请求必须逐字复刻
// runner.ts executeImageStep 的渲染输出（runtime.md §1 第 3/6 步），否则
// 评估证据侧会判定 prompt 与共享受审渲染器漂移。
function runnerTaskPromptForStep(step: NodeExecution): string {
  // 与 runner.ts inputTextsOf + 合成表达式逐字一致（inputTexts 优先，
  // 无 text 上游时回退 params.prompt；直连路径）。
  const inputTexts = Array.isArray(step.params.inputTexts)
    ? step.params.inputTexts.filter((value): value is string => typeof value === "string")
    : [];
  const userPrompt = inputTexts.length > 0
    ? inputTexts.join("\n\n")
    : (typeof step.params.prompt === "string" ? step.params.prompt : "");
  return `${queueVariant.fullPrompt}\n\n${userPrompt}`.trim();
}

function runnerPromptForGenerateStep(step: NodeExecution): string {
  return renderProviderPrompt({
    nodeKind: "image",
    modelId: queueVariant.modelId as ImageModelId,
    operationMode: queueVariant.mode,
    taskPrompt: runnerTaskPromptForStep(step),
    references: [],
    needsMask: false,
  });
}

function confirmedRuntimeEditStep(nodeId: string): NodeExecution {
  return {
    nodeId,
    kind: "image-generator",
    inputImages: [PNG_DATA_URL],
    inputReferences: [{
      imageRef: PNG_DATA_URL,
      order: 0,
      sourceNodeId: `${nodeId}-source`,
    }],
    params: {
      // v7：真实 DAG 产出——用户正文沿 text 边进入 inputTexts。
      inputTexts: ["保持服装结构并优化商业棚拍光线"],
      promptVariantId: runtimeEditVariant.variantId,
      promptFamilyId: runtimeEditVariant.familyId,
      parameterProfileId: runtimeEditVariant.parameterProfileId,
      contractHash: runtimeEditVariant.contractHash,
      evaluationVersion: runtimeEditVariant.evaluationVersion,
      postprocessVersion: runtimeEditProfile.postprocess.version,
      operationMode: runtimeEditVariant.mode,
      modelId: runtimeEditVariant.modelId,
      modelOptions: runtimeEditParameters.modelOptions,
      aspectRatio: runtimeEditParameters.aspectRatio,
      batchSize: runtimeEditParameters.batchSize,
    },
  };
}

function runtimeEditContext(nodeId: string): GenerationRecordContext {
  return {
    userId: owner.id,
    nodeId,
    nodeLabel: nodeId,
    kind: "image-generator",
    prompt: "保持服装结构并优化商业棚拍光线",
    requestedCount: 1,
  };
}

function context(nodeId: string): GenerationRecordContext {
  return {
    userId: owner.id,
    nodeId,
    nodeLabel: nodeId,
    kind: "image-generator",
    prompt: "生成服装效果图",
    requestedCount: 1,
  };
}

function canonicalJson(value: unknown): string {
  if (value === undefined || value === null || typeof value !== "object") {
    return JSON.stringify(value ?? null);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, nested]) => nested !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`).join(",")}}`;
}

function canonicalSha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

async function authorizeEvaluationPlan(
  plan: ExecutionPlan,
  ids: { caseId: string; sampleId: string; authorizationId: string },
  options: { expiresAt?: number; priceMinorPerProviderRequest?: number; budgetLimitMinor?: number } = {},
): Promise<EvaluationRunPolicy> {
  const policy: EvaluationRunPolicy = {
    ...ids,
    campaignId: `campaign-${ids.authorizationId}`,
    slotId: `slot-${ids.authorizationId}`,
    retryPolicy: "no-retry",
  };
  const persistedPlan = evaluationRunPolicy.attachEvaluationRunPolicy(plan, policy);
  const providerStep = persistedPlan.steps.find((candidate) => candidate.params.evaluationPolicy !== undefined);
  assert.ok(providerStep, "evaluation plan must contain one Provider step");
  const capture = new Error("capture sealed evaluation request");
  let capturedRequest: ImageGenRequest | undefined;
  const captureProvider: AIProvider = {
    id: providerStep.params.modelId as string,
    async generate() { throw new Error("Provider must not be called while capturing the sealed request"); },
    async edit() { throw new Error("Provider must not be called while capturing the sealed request"); },
  };
  try {
    await executeStep(providerStep, providerStep.inputImages, () => captureProvider, {
      referenceSources: providerStep.inputReferences ?? [],
      beforeProviderCall: async (_providerRequest, request) => {
        capturedRequest = request;
        throw capture;
      },
    });
  } catch (error) {
    if (error !== capture) throw error;
  }
  assert.ok(capturedRequest, "evaluation plan did not materialize a Provider request");
  const runtime = evaluationEvidence.buildEvaluationCaseSnapshotFromRuntime({
    plan: persistedPlan,
    step: providerStep,
    request: capturedRequest,
    policy,
    codeIdentity: TEST_EVALUATION_CODE_IDENTITY,
    capturedAt: "2026-09-08T00:00:00.000Z",
  });
  const target = authorizationLedger.evaluationAuthorizationTargetFromPlan(persistedPlan);
  assert.equal(runtime.authorizationUnitKey, target.evaluationUnitKey);
  const priceMinorPerProviderRequest = options.priceMinorPerProviderRequest ?? 1;
  const budgetLimitMinor = options.budgetLimitMinor
    ?? target.maximumProviderRequests * priceMinorPerProviderRequest;
  await database.transaction(async (client) => {
    await evaluationCampaign.createSealedEvaluationCampaign(client, adminActor, {
      campaignId: policy.campaignId,
      ownerId: owner.id,
      stage: "internal-experiment",
      modelId: target.modelId,
      authorizationUnitKey: target.evaluationUnitKey,
      codeSha: TEST_EVALUATION_CODE_IDENTITY.codeSha,
      maxProviderRequests: target.maximumProviderRequests,
      budgetLimitMinor,
      budgetCurrency: "CNY",
      slots: [{
        slotId: policy.slotId,
        caseId: policy.caseId,
        sampleId: policy.sampleId,
        resolvedPromptSha256: runtime.snapshot.resolvedPromptSha256,
        nativeParametersSha256: canonicalSha256(runtime.snapshot.nativeParameters),
        referenceInputsSha256: canonicalSha256(runtime.snapshot.references),
        requestedImageCount: runtime.snapshot.requestedImageCount,
        maxProviderRequests: target.maximumProviderRequests,
        priceMinorPerProviderRequest,
        budgetLimitMinor,
      }],
    });
    await authorizationLedger.registerEvaluationRunAuthorization(client, adminActor, {
      authorizationId: policy.authorizationId,
      ownerId: owner.id,
      campaignId: policy.campaignId,
      slotId: policy.slotId,
      scope: {
        type: "evaluation-unit",
        modelId: target.modelId,
        evaluationUnitKey: target.evaluationUnitKey,
      },
      maxProviderRequests: target.maximumProviderRequests,
      priceMinorPerProviderRequest,
      budgetLimitMinor,
      budgetCurrency: "CNY",
      expiresAt: options.expiresAt ?? Date.now() + 60 * 60 * 1_000,
      reason: "run-queue 零费用授权账本回归测试",
    });
  });
  return policy;
}

async function enqueueSingle(prefix: string): Promise<string> {
  sequence += 1;
  const nodeId = `${prefix}-${sequence}`;
  const run = await queue.enqueueGenerationRun({ steps: [step(nodeId)] }, owner.id, context(nodeId));
  return run.id;
}

function resolver(
  behavior: (request: ImageGenRequest, call: number) => ImageGenResult | Promise<ImageGenResult>,
): { resolveProvider: ProviderResolver; calls: () => number } {
  let calls = 0;
  const invoke = async (request: ImageGenRequest) => {
    calls += 1;
    return behavior(request, calls);
  };
  const provider: AIProvider = {
    id: "gpt-image-2.5-flare-vip",
    async generate(request) { return invoke(request); },
    async edit(request) { return invoke(request); },
  };
  return { resolveProvider: () => provider, calls: () => calls };
}

async function runRow(runId: string) {
  return database.queryOne<{
    status: string; error: string | null; provider_requests: number; successful_count: number;
  }>(
    "SELECT status, error, provider_requests, successful_count FROM generation_runs WHERE id = $1",
    [runId],
  );
}

interface ExplainPlanNode {
  "Node Type": string;
  "Sort Method"?: string;
  Plans?: ExplainPlanNode[];
}

function flattenPlan(node: ExplainPlanNode): ExplainPlanNode[] {
  return [node, ...(node.Plans ?? []).flatMap(flattenPlan)];
}

console.log("PostgreSQL 持久生成队列测试");

await test("入队立即返回且数据库重连后 queued 任务仍可执行并重放事件", async () => {
  const fake = resolver(() => ({
    images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip", providerOutputSizes: ["2048x2048"],
  }));
  const runId = await enqueueSingle("restart");
  assert.equal(fake.calls(), 0, "入队阶段不得调用上游");
  assert.equal((await runRow(runId))?.status, "queued");

  await database.closeDatabaseForTests();
  await database.initializeDatabase();
  const now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-restart", {
    resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0],
  }), true);
  assert.equal(fake.calls(), 1);
  assert.deepEqual(await runRow(runId), {
    status: "succeeded", error: null, provider_requests: 1, successful_count: 1,
  });
  const output = await database.queryOne<{
    image: string; provider_image: string | null; provider_output_size: string | null;
  }>(
    `SELECT image, provider_image, provider_output_size
     FROM generation_outputs WHERE run_id = $1 AND status = 'success'`, [runId],
  );
  assert.match(output?.image ?? "", /^\/api\/files\//);
  assert.match(output?.provider_image ?? "", /^\/api\/files\//);
  assert.notEqual(output?.provider_image, output?.image, "Provider 原图与业务成品必须使用独立证据地址");
  assert.equal(output?.provider_output_size, "2048x2048");
  const evidenceFiles = await database.query<{ id: string; source_type: string }>(`
    SELECT id, source_type FROM files WHERE run_id = $1 ORDER BY source_type
  `, [runId]);
  assert.deepEqual(evidenceFiles, [
    { id: path.basename(output!.image), source_type: "generated" },
    { id: path.basename(output!.provider_image!), source_type: "provider-original" },
  ]);
  const stepEvidence = await database.queryOne<{ provider_images_json: string }>(`
    SELECT provider_images_json FROM generation_run_steps WHERE run_id = $1
  `, [runId]);
  assert.deepEqual(JSON.parse(stepEvidence?.provider_images_json ?? "[]"), [output?.provider_image]);

  const allEvents = await queue.readDurableRunEvents(runId, owner.id, 0);
  assert.ok(allEvents && allEvents.length >= 4);
  assert.deepEqual(allEvents.map((event) => event.seq), allEvents.map((_event, index) => index + 1));
  const cursor = allEvents[1].seq ?? 0;
  const replay = await queue.readDurableRunEvents(runId, owner.id, cursor);
  assert.deepEqual(replay?.map((event) => event.seq), allEvents.slice(2).map((event) => event.seq));
});

await test("RUN-02：batchSize=4 的 executeStep 进度 done 单调不减", async () => {
  sequence += 1;
  const nodeId = `progress-${sequence}`;
  let calls = 0;
  const fake = resolver(() => {
    calls += 1;
    return { images: [`generated-${calls}`], model: "gpt-image-2.5-flare-vip" };
  });
  const progressEvents: NodeStatusRunEvent[] = [];
  const batchStep: NodeExecution = {
    ...step(nodeId),
    params: boundQueueParams("生成服装效果图", { batchSize: 4 }),
  };
  await executeStep(batchStep, [], fake.resolveProvider, {
    onProgress: (progress) => {
      progressEvents.push({ type: "node-status", nodeId, status: "running", progress });
    },
  });
  assert.equal(calls, 4, "每次只回 1 张时必须逐张补足 4 张");
  assert.deepEqual(progressEvents.map((event) => event.progress), [
    { phase: "image", done: 1, total: 4 },
    { phase: "image", done: 2, total: 4 },
    { phase: "image", done: 3, total: 4 },
    { phase: "image", done: 4, total: 4 },
  ]);
});

await test("RUN-02：Worker 持久化 progress 事件；无 progress 的旧事件行向后兼容", async () => {
  sequence += 1;
  const nodeId = `progress-w-${sequence}`;
  const run = await queue.enqueueGenerationRun({ steps: [step(nodeId)] }, owner.id, context(nodeId));
  const fake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-progress", {
    resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0],
  }), true);
  assert.equal(fake.calls(), 1);

  const events = await queue.readDurableRunEvents(run.id, owner.id, 0);
  assert.ok(events);
  const progressEvents = events!.filter((event) => event.type === "node-status" && event.progress);
  assert.equal(progressEvents.length, 1);
  assert.deepEqual(progressEvents[0].progress, { phase: "image", done: 1, total: 1 });
  // 无 progress 的旧形态事件仍存在且可被读取（queued/running 事件不带 progress）。
  assert.ok(events!.some((event) => event.type === "node-status" && !event.progress));

  // 直接构造改名前写入的旧事件行（无 progress 字段），读取侧必须原样兼容。
  const seqRow = await database.queryOne<{ nextSeq: number }>(
    "UPDATE generation_runs SET next_event_seq = next_event_seq + 1 WHERE id = $1 RETURNING next_event_seq::int AS \"nextSeq\"",
    [run.id],
  );
  assert.ok(seqRow);
  await database.query(`
    INSERT INTO generation_run_events (run_id, seq, payload_json, created_at)
    VALUES ($1, $2, $3, $4)
  `, [
    run.id,
    seqRow!.nextSeq,
    JSON.stringify({ type: "node-status", nodeId, status: "running", startedAt: now }),
    now,
  ]);
  const legacyRead = await queue.readDurableRunEvents(run.id, owner.id, seqRow!.nextSeq - 1);
  assert.equal(legacyRead?.length, 1);
  assert.equal(legacyRead?.[0].type, "node-status");
  assert.equal(legacyRead?.[0].progress, undefined);
});

await test("入队后发布状态降级时 Worker 二次准入且 Provider 零调用", async () => {
  const fake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const runId = await enqueueSingle("worker-release-drift");
  const restoreRelease = withdrawPromptVariantReleasesForTest(queueVariant.variantId);
  try {
    assert.equal(await queue.processNextGenerationJob("worker-release-drift", {
      resolveProvider: fake.resolveProvider,
      now: () => tick(),
      random: () => 0,
    }), true);
  } finally {
    restoreRelease();
  }
  assert.equal(fake.calls(), 0, "执行时发布已降级时不得触发 Provider");
  const blocked = await runRow(runId);
  assert.equal(blocked?.status, "failed");
  assert.equal(blocked?.provider_requests, 0);
  assert.equal(blocked?.successful_count, 0);
  assert.match(blocked?.error ?? "", /执行前提示词准入阻断/);
});

await test("Worker 不修复损坏的静态 reference order/imageRef/数量快照且 Provider 零调用", async () => {
  const corruptions: Array<{
    name: string;
    mutate: (queuedStep: NodeExecution) => void;
    expected: RegExp;
  }> = [
    {
      name: "order",
      mutate: (queuedStep) => { queuedStep.inputReferences![0].order = 1; },
      expected: /参考图结构或顺序无效/,
    },
    {
      name: "image-ref",
      mutate: (queuedStep) => {
        queuedStep.inputReferences![0].imageRef = "/api/files/must-not-be-resolved.png";
      },
      expected: /imageRef.*inputImages\[0\].*不一致/,
    },
    {
      name: "length",
      mutate: (queuedStep) => {
        queuedStep.inputImages.push(OPAQUE_PNG_DATA_URL);
      },
      expected: /持久化参考图快照与 inputImages 数量不一致/,
    },
  ];

  for (const corruption of corruptions) {
    const nodeId = `worker-static-snapshot-${corruption.name}-${++sequence}`;
    const originalStep = confirmedRuntimeEditStep(nodeId);
    const run = await queue.enqueueGenerationRun(
      { steps: [originalStep] },
      owner.id,
      runtimeEditContext(nodeId),
    );
    const stored = await database.queryOne<{ step_json: string }>(
      "SELECT step_json FROM generation_run_steps WHERE run_id = $1",
      [run.id],
    );
    assert.ok(stored);
    const damagedStep = JSON.parse(stored.step_json) as NodeExecution;
    corruption.mutate(damagedStep);
    await database.query(
      "UPDATE generation_run_steps SET step_json = $1 WHERE run_id = $2",
      [JSON.stringify(damagedStep), run.id],
    );

    const fake = resolver(() => ({ images: [PNG_DATA_URL], model: runtimeEditVariant.modelId }));
    assert.equal(await queue.processNextGenerationJob(`worker-static-snapshot-${corruption.name}`, {
      resolveProvider: fake.resolveProvider,
      now: () => tick(),
      random: () => 0,
    }), true);
    assert.equal(fake.calls(), 0, `${corruption.name} 损坏快照不得进入 Provider`);
    const blocked = await runRow(run.id);
    assert.equal(blocked?.status, "failed", corruption.name);
    assert.equal(blocked?.provider_requests, 0, corruption.name);
    assert.match(blocked?.error ?? "", corruption.expected, corruption.name);
  }
});

await test("Worker 拒绝绕过入队门禁的远程参考图且 Provider 零调用", async () => {
  const nodeId = `worker-remote-reference-${++sequence}`;
  const remoteReference = "https://references.example.invalid/garment.png";
  const providerStep = confirmedRuntimeEditStep(nodeId);
  providerStep.inputImages[0] = remoteReference;
  providerStep.inputReferences![0].imageRef = remoteReference;
  const run = await queue.enqueueGenerationRun(
    { steps: [providerStep] },
    owner.id,
    runtimeEditContext(nodeId),
  );
  const fake = resolver(() => ({ images: [PNG_DATA_URL], model: runtimeEditVariant.modelId }));

  assert.equal(await queue.processNextGenerationJob("worker-remote-reference", {
    resolveProvider: fake.resolveProvider,
    now: () => tick(),
    random: () => 0,
  }), true);
  assert.equal(fake.calls(), 0, "远程输入不得进入 Provider");
  const blocked = await runRow(run.id);
  assert.equal(blocked?.status, "failed");
  assert.equal(blocked?.provider_requests, 0);
  assert.equal(blocked?.successful_count, 0);
  assert.match(blocked?.error ?? "", /远程参考图不能直接用于生成，请先上传或导入后再试/);
});

await test("Worker 拒绝绕过入队门禁的远程蒙版且 Provider 零调用", async () => {
  const nodeId = `worker-remote-mask-${++sequence}`;
  const maskStep: NodeExecution = {
    nodeId,
    kind: "image-generator",
    inputImages: [PNG_DATA_URL],
    inputReferences: [{
      imageRef: PNG_DATA_URL,
      order: 0,
      sourceNodeId: `${nodeId}:user-garment`,
    }],
    params: {
      // v7：真实 DAG 产出——蒙版用户正文沿 text 边进入 inputTexts。
      inputTexts: ["仅修改蒙版区域的拉链颜色"],
      promptVariantId: maskVariant.variantId,
      promptFamilyId: maskVariant.familyId,
      parameterProfileId: maskVariant.parameterProfileId,
      contractHash: maskVariant.contractHash,
      evaluationVersion: maskVariant.evaluationVersion,
      postprocessVersion: maskProfile.postprocess.version,
      operationMode: maskVariant.mode,
      modelId: maskVariant.modelId,
      modelOptions: maskParameters.modelOptions,
      aspectRatio: maskParameters.aspectRatio,
      batchSize: maskParameters.batchSize,
      mask: "https://references.example.invalid/mask.png",
      maskSourceRef: PNG_DATA_URL,
      maskPipelineVersion: 3,
    },
  };
  const run = await queue.enqueueGenerationRun(
    { steps: [maskStep] },
    owner.id,
    {
      userId: owner.id,
      nodeId,
      nodeLabel: nodeId,
      kind: "image-generator",
      prompt: "仅修改蒙版区域的拉链颜色",
      requestedCount: 1,
    },
  );
  const fake = resolver(() => ({ images: [OPAQUE_PNG_DATA_URL], model: maskVariant.modelId }));

  assert.equal(await queue.processNextGenerationJob("worker-remote-mask", {
    resolveProvider: fake.resolveProvider,
    now: () => tick(),
    random: () => 0,
  }), true);
  assert.equal(fake.calls(), 0, "远程蒙版不得进入 Provider");
  const blocked = await runRow(run.id);
  assert.equal(blocked?.status, "failed");
  assert.equal(blocked?.provider_requests, 0);
  assert.equal(blocked?.successful_count, 0);
  assert.match(blocked?.error ?? "", /远程参考图不能直接用于生成，请先上传或导入后再试/);
});

await test("Worker 在普通与评估 Provider 边界拒绝与实际内容不符的 reference hash", async () => {
  for (const runType of ["workflow", "evaluation"] as const) {
    const nodeId = `worker-reference-hash-${runType}-${++sequence}`;
    const plan: ExecutionPlan = { steps: [confirmedRuntimeEditStep(nodeId)] };
    const evaluationPolicy = runType === "evaluation"
      ? await authorizeEvaluationPlan(plan, {
          caseId: `reference-hash-case-${sequence}`,
          sampleId: `reference-hash-sample-${sequence}`,
          authorizationId: `reference-hash-authorization-${sequence}`,
        })
      : undefined;
    const run = await queue.enqueueGenerationRun(
      plan,
      owner.id,
      runtimeEditContext(nodeId),
      runType,
      evaluationPolicy,
    );
    let validations = 0;
    let providerCalls = 0;
    const provider: AIProvider = {
      id: runtimeEditVariant.modelId,
      validate(request) {
        validations += 1;
        assert.ok(request.references?.[0]);
        request.references[0].assetSha256 = "0".repeat(64);
      },
      async generate() {
        providerCalls += 1;
        return { images: [PNG_DATA_URL], model: runtimeEditVariant.modelId };
      },
      async edit() {
        providerCalls += 1;
        return { images: [PNG_DATA_URL], model: runtimeEditVariant.modelId };
      },
    };
    assert.equal(await queue.processNextGenerationJob(`worker-reference-hash-${runType}`, {
      resolveProvider: () => provider,
      evaluationCodeIdentity: TEST_EVALUATION_CODE_IDENTITY,
      now: () => tick(),
      random: () => 0,
    }), true);
    assert.equal(validations, 1, `${runType} 应在网络调用前进入本地契约验证`);
    assert.equal(providerCalls, 0, `${runType} hash 损坏不得进入 Provider`);
    const blocked = await runRow(run.id);
    assert.equal(blocked?.status, "failed", runType);
    assert.equal(blocked?.provider_requests, 0, runType);
    assert.match(blocked?.error ?? "", /assetSha256 证据不一致/, runType);
  }
});

await test("Worker 拒绝 references 与 Provider 兼容数组内容分叉且 Provider 零调用", async () => {
  const nodeId = `worker-reference-content-mismatch-${++sequence}`;
  const run = await queue.enqueueGenerationRun(
    { steps: [confirmedRuntimeEditStep(nodeId)] },
    owner.id,
    runtimeEditContext(nodeId),
  );
  let validations = 0;
  let providerCalls = 0;
  const provider: AIProvider = {
    id: runtimeEditVariant.modelId,
    validate(request) {
      validations += 1;
      assert.ok(request.referenceImages?.[0]);
      request.referenceImages[0] = OPAQUE_PNG_DATA_URL;
    },
    async generate() {
      providerCalls += 1;
      return { images: [PNG_DATA_URL], model: runtimeEditVariant.modelId };
    },
    async edit() {
      providerCalls += 1;
      return { images: [PNG_DATA_URL], model: runtimeEditVariant.modelId };
    },
  };
  assert.equal(await queue.processNextGenerationJob("worker-reference-content-mismatch", {
    resolveProvider: () => provider,
    now: () => tick(),
    random: () => 0,
  }), true);
  assert.equal(validations, 1);
  assert.equal(providerCalls, 0);
  const blocked = await runRow(run.id);
  assert.equal(blocked?.status, "failed");
  assert.equal(blocked?.provider_requests, 0);
  assert.match(blocked?.error ?? "", /结构化参考图与兼容数组内容或顺序不一致/);
});

await test("Worker 拒绝 Provider 校验阶段篡改系统蒙版 guide order 且 Provider 零调用", async () => {
  const nodeId = `worker-mask-guide-order-${++sequence}`;
  const maskStep: NodeExecution = {
    nodeId,
    kind: "image-generator",
    inputImages: [PNG_DATA_URL],
    inputReferences: [{
      imageRef: PNG_DATA_URL,
      order: 0,
      sourceNodeId: `${nodeId}:user-garment`,
    }],
    params: {
      // v7：真实 DAG 产出——蒙版用户正文沿 text 边进入 inputTexts。
      inputTexts: ["仅修改蒙版区域的拉链颜色"],
      promptVariantId: maskVariant.variantId,
      promptFamilyId: maskVariant.familyId,
      parameterProfileId: maskVariant.parameterProfileId,
      contractHash: maskVariant.contractHash,
      evaluationVersion: maskVariant.evaluationVersion,
      postprocessVersion: maskProfile.postprocess.version,
      operationMode: maskVariant.mode,
      modelId: maskVariant.modelId,
      modelOptions: maskParameters.modelOptions,
      aspectRatio: maskParameters.aspectRatio,
      batchSize: maskParameters.batchSize,
      mask: PNG_DATA_URL,
      maskSourceRef: PNG_DATA_URL,
      maskPipelineVersion: 3,
    },
  };
  const run = await queue.enqueueGenerationRun(
    { steps: [maskStep] },
    owner.id,
    {
      userId: owner.id,
      nodeId,
      nodeLabel: nodeId,
      kind: "image-generator",
      prompt: "仅修改蒙版区域的拉链颜色",
      requestedCount: 1,
    },
  );
  let validations = 0;
  let generateCalls = 0;
  let editCalls = 0;
  const provider: AIProvider = {
    id: maskVariant.modelId,
    validate(request) {
      validations += 1;
      assert.ok(request.references && request.references.length >= 2);
      request.references[request.references.length - 1].order = 0;
    },
    async generate() {
      generateCalls += 1;
      return { images: [OPAQUE_PNG_DATA_URL], model: maskVariant.modelId };
    },
    async edit() {
      editCalls += 1;
      return { images: [OPAQUE_PNG_DATA_URL], model: maskVariant.modelId };
    },
  };

  assert.equal(await queue.processNextGenerationJob("worker-mask-guide-order", {
    resolveProvider: () => provider,
    now: () => tick(),
    random: () => 0,
  }), true);
  assert.equal(validations, 1);
  assert.equal(generateCalls, 0);
  assert.equal(editCalls, 0);
  const blocked = await runRow(run.id);
  assert.equal(blocked?.status, "failed");
  assert.equal(blocked?.provider_requests, 0);
  assert.match(blocked?.error ?? "", /references\[1\]\.order.*等于 1/);
});

await test("入队后命中运行时四级关闭规则时 Provider 零调用", async () => {
  const fake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const runId = await enqueueSingle("worker-shutdown-drift");
  const rules = PROMPT_RUNTIME_SHUTDOWN_RULES as EvaluationShutdownRule[];
  const rule: EvaluationShutdownRule = {
    id: `queue-test-shutdown-${++sequence}`,
    active: true,
    scope: { level: "model-variant", promptVariantId: queueVariant.variantId },
    reason: "执行前回归审计",
  };
  rules.push(rule);
  try {
    assert.equal(await queue.processNextGenerationJob("worker-shutdown-drift", {
      resolveProvider: fake.resolveProvider,
      now: () => tick(),
      random: () => 0,
    }), true);
  } finally {
    const index = rules.indexOf(rule);
    if (index >= 0) rules.splice(index, 1);
  }
  assert.equal(fake.calls(), 0, "入队后新生效的关闭规则必须阻止 Provider");
  const blocked = await runRow(runId);
  assert.equal(blocked?.status, "failed");
  assert.equal(blocked?.provider_requests, 0);
  assert.match(blocked?.error ?? "", /运行时关闭/);
});

await test("未登记 authorizationId 的真实评估在入队事务中阻断", async () => {
  const nodeId = `unregistered-evaluation-${++sequence}`;
  await assert.rejects(
    queue.enqueueGenerationRun(
      { steps: [step(nodeId)] },
      owner.id,
      context(nodeId),
      "evaluation",
      {
        caseId: `unregistered-evaluation-case-${sequence}`,
        sampleId: `unregistered-evaluation-sample-${sequence}`,
        authorizationId: `unregistered-evaluation-authorization-${sequence}`,
        retryPolicy: "no-retry",
      },
    ),
    /未登记/,
  );
  assert.equal((await database.queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE owner_id = $1 AND evaluation_case_id = $2
  `, [owner.id, `unregistered-evaluation-case-${sequence}`]))?.count, 0);
});

await test("未验证变体仅在持久化 evaluation + no-retry 策略下可执行", async () => {
  const ordinaryFake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const evaluationProviderRequestId = `req-evaluation-success-${sequence + 1}`;
  const evaluationFake = resolver(() => ({
    images: [PNG_DATA_URL],
    model: "gpt-image-2.5-flare-vip",
    providerRequestId: evaluationProviderRequestId,
  }));
  const ordinaryNodeId = `worker-forged-evaluation-${++sequence}`;
  const ordinaryStep = step(ordinaryNodeId);
  ordinaryStep.params = {
    ...ordinaryStep.params,
    evaluationPolicy: {
      caseId: `forged-case-${sequence}`,
      sampleId: `forged-sample-${sequence}`,
      authorizationId: `forged-authorization-${sequence}`,
      retryPolicy: "no-retry",
    },
  };
  const ordinaryRun = await queue.enqueueGenerationRun(
    { steps: [ordinaryStep] },
    owner.id,
    context(ordinaryNodeId),
  );
  const evaluationNodeId = `worker-persisted-evaluation-${++sequence}`;
  const evaluationPlan = { steps: [step(evaluationNodeId)] };
  const evaluationPolicy = await authorizeEvaluationPlan(evaluationPlan, {
    caseId: `worker-evaluation-case-${sequence}`,
    sampleId: `worker-evaluation-sample-${sequence}`,
    authorizationId: `worker-evaluation-authorization-${sequence}`,
  });
  const evaluationRun = await queue.enqueueGenerationRun(
    evaluationPlan,
    owner.id,
    context(evaluationNodeId),
    "evaluation",
    evaluationPolicy,
  );
  const restoreRelease = withdrawPromptVariantReleasesForTest(queueVariant.variantId);
  try {
    assert.equal(await queue.processNextGenerationJob("worker-forged-evaluation", {
      resolveProvider: ordinaryFake.resolveProvider,
      now: () => tick(),
      random: () => 0,
    }), true);
    assert.equal(await queue.processNextGenerationJob("worker-persisted-evaluation", {
      resolveProvider: evaluationFake.resolveProvider,
      evaluationCodeIdentity: TEST_EVALUATION_CODE_IDENTITY,
      now: () => tick(),
      random: () => 0,
    }), true);
  } finally {
    restoreRelease();
  }
  assert.equal(ordinaryFake.calls(), 0, "step.params 伪造的 evaluationPolicy 不得放行");
  assert.equal((await runRow(ordinaryRun.id))?.status, "failed");
  assert.equal((await runRow(ordinaryRun.id))?.provider_requests, 0);
  assert.equal(evaluationFake.calls(), 1, "只有数据库持久化的 evaluation 策略可放行");
  assert.equal((await runRow(evaluationRun.id))?.status, "succeeded");
  assert.equal((await runRow(evaluationRun.id))?.provider_requests, 1);
  const successfulEvidence = await database.queryOne<{
    sample_id: string;
    outcome: string;
    provider_request_count: number;
    billing_reconciliation_status: string;
    evidence_record_sha256: string | null;
    snapshot_json: string;
  }>(`
    SELECT sample_id, outcome, provider_request_count, billing_reconciliation_status,
      evidence_record_sha256, snapshot_json
    FROM evaluation_case_evidence WHERE run_id = $1
  `, [evaluationRun.id]);
  assert.equal(successfulEvidence?.sample_id, evaluationPolicy.sampleId);
  assert.equal(successfulEvidence?.outcome, "succeeded");
  assert.equal(successfulEvidence?.provider_request_count, 1);
  assert.equal(successfulEvidence?.billing_reconciliation_status, "pending");
  assert.match(successfulEvidence?.evidence_record_sha256 ?? "", /^[a-f0-9]{64}$/);
  assert.equal(JSON.parse(successfulEvidence?.snapshot_json ?? "{}").sampleId, evaluationPolicy.sampleId);
  assert.deepEqual(await database.query<{
    request_index: number; outcome: string; output_count: number; billing_reconciliation_status: string;
    provider_request_id: string | null;
  }>(`
    SELECT request_index, outcome, output_count, billing_reconciliation_status, provider_request_id
    FROM evaluation_provider_request_evidence WHERE run_id = $1 ORDER BY request_index
  `, [evaluationRun.id]), [{
    request_index: 1,
    outcome: "succeeded",
    output_count: 1,
    billing_reconciliation_status: "pending",
    provider_request_id: evaluationProviderRequestId,
  }]);
  const successfulImages = await database.query<{
    id: string; layer: string; source_evidence_id: string | null; provider_request_evidence_id: string | null;
    artifact_sha256: string;
  }>(`
    SELECT id, layer, source_evidence_id, provider_request_evidence_id, artifact_sha256
    FROM evaluation_image_evidence WHERE run_id = $1 ORDER BY layer DESC
  `, [evaluationRun.id]);
  assert.equal(successfulImages.length, 2);
  const original = successfulImages.find((image) => image.layer === "provider-original");
  const postprocessed = successfulImages.find((image) => image.layer === "postprocessed");
  assert.ok(original?.provider_request_evidence_id);
  assert.equal(original?.source_evidence_id, null);
  assert.equal(postprocessed?.source_evidence_id, original?.id);
  assert.equal(postprocessed?.provider_request_evidence_id, null);
  assert.match(original?.artifact_sha256 ?? "", /^[a-f0-9]{64}$/);
  assert.match(postprocessed?.artifact_sha256 ?? "", /^[a-f0-9]{64}$/);
});

await test("蒙版评估最终准入不重复计入系统 guide，证据固定为用户参考 + guide + mask", async () => {
  const nodeId = `evaluation-mask-runtime-profile-${++sequence}`;
  const maskStep: NodeExecution = {
    nodeId,
    kind: "image-generator",
    inputImages: [PNG_DATA_URL],
    inputReferences: [{
      imageRef: PNG_DATA_URL,
      order: 0,
      sourceNodeId: `${nodeId}:user-garment`,
    }],
    params: {
      // v7：真实 DAG 产出——蒙版用户正文沿 text 边进入 inputTexts。
      inputTexts: ["仅将蒙版区域改为银色拉链"],
      promptVariantId: maskVariant.variantId,
      promptFamilyId: maskVariant.familyId,
      parameterProfileId: maskVariant.parameterProfileId,
      contractHash: maskVariant.contractHash,
      evaluationVersion: maskVariant.evaluationVersion,
      postprocessVersion: maskProfile.postprocess.version,
      operationMode: maskVariant.mode,
      modelId: maskVariant.modelId,
      modelOptions: maskParameters.modelOptions,
      aspectRatio: maskParameters.aspectRatio,
      batchSize: maskParameters.batchSize,
      mask: PNG_DATA_URL,
      maskSourceRef: PNG_DATA_URL,
      maskPipelineVersion: 3,
    },
  };
  const plan: ExecutionPlan = { steps: [maskStep] };
  const policy = await authorizeEvaluationPlan(plan, {
    caseId: `evaluation-mask-case-${sequence}`,
    sampleId: `evaluation-mask-sample-${sequence}`,
    authorizationId: `evaluation-mask-authorization-${sequence}`,
  });
  let providerRequest: ImageGenRequest | undefined;
  const fake = resolver((request) => {
    providerRequest = request;
    return { images: [OPAQUE_PNG_DATA_URL], model: maskVariant.modelId };
  });
  const run = await queue.enqueueGenerationRun(
    plan,
    owner.id,
    {
      userId: owner.id,
      nodeId,
      nodeLabel: nodeId,
      kind: "image-generator",
      prompt: "仅将蒙版区域改为银色拉链",
      requestedCount: 1,
    },
    "evaluation",
    policy,
  );

  assert.equal(await queue.processNextGenerationJob("worker-evaluation-mask-runtime-profile", {
    resolveProvider: fake.resolveProvider,
    evaluationCodeIdentity: TEST_EVALUATION_CODE_IDENTITY,
    now: () => tick(),
    random: () => 0,
  }), true);
  assert.equal(fake.calls(), 1, "运行时动态 mask size 不应被误判为参数漂移");
  assert.equal((await runRow(run.id))?.status, "succeeded");
  assert.match(String(providerRequest?.modelOptions?.size ?? ""), /^\d+x\d+$/);

  const evidence = await database.queryOne<{
    snapshot_json: string;
    reference_inputs_json: string;
    native_parameters_json: string;
  }>(`
    SELECT snapshot_json, reference_inputs_json, native_parameters_json
    FROM evaluation_case_evidence WHERE run_id = $1
  `, [run.id]);
  assert.ok(evidence);
  const runtimeSnapshot = JSON.parse(evidence.snapshot_json) as {
    snapshot?: {
      references?: Array<{ order: number }>;
    };
  };
  assert.deepEqual(
    runtimeSnapshot.snapshot?.references?.map(({ order }) => ({ order })),
    [{ order: 0 }, { order: 1 }, { order: 2 }],
  );
  assert.deepEqual(
    (JSON.parse(evidence.reference_inputs_json) as Array<{ order: number }>)
      .map(({ order }) => ({ order })),
    [{ order: 0 }, { order: 1 }, { order: 2 }],
  );
  assert.match(
    String((JSON.parse(evidence.native_parameters_json) as { modelOptions?: { size?: string } }).modelOptions?.size ?? ""),
    /^\d+x\d+$/,
  );
});

await test("评估策略快照损坏时 Provider 零调用并确定性终止", async () => {
  const fake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const nodeId = `evaluation-policy-corrupt-${++sequence}`;
  const plan = { steps: [step(nodeId)] };
  const policy = await authorizeEvaluationPlan(plan, {
    caseId: `evaluation-policy-corrupt-case-${sequence}`,
    sampleId: `evaluation-policy-corrupt-sample-${sequence}`,
    authorizationId: `evaluation-policy-corrupt-authorization-${sequence}`,
  });
  const run = await queue.enqueueGenerationRun(
    plan,
    owner.id,
    context(nodeId),
    "evaluation",
    policy,
  );
  await database.query(`
    UPDATE generation_run_steps
    SET step_json = (step_json::jsonb #- '{params,evaluationPolicy}')::text
    WHERE run_id = $1
  `, [run.id]);

  assert.equal(await queue.processNextGenerationJob("worker-policy-corrupt", {
    resolveProvider: fake.resolveProvider,
    now: () => tick(),
    random: () => 0,
  }), true);
  const row = await runRow(run.id);
  assert.equal(row?.status, "failed");
  assert.equal(row?.provider_requests, 0);
  assert.match(row?.error ?? "", /策略快照损坏|lost its persisted policy snapshot/);
  assert.equal(fake.calls(), 0);
  assert.equal((await database.queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM evaluation_case_evidence WHERE run_id = $1
  `, [run.id]))?.count, 0);
});

await test("同一付费请求号并发重试只创建一个 run，语义漂移返回冲突", async () => {
  const nodeId = `request-idempotency-${++sequence}`;
  const clientRequestId = `client-request-${sequence}`;
  const plan = { steps: [step(nodeId)] };
  const runContext = { ...context(nodeId), clientRequestId };
  let runId: string | undefined;
  try {
    const [first, second] = await Promise.all([
      queue.enqueueGenerationRun(plan, owner.id, runContext),
      queue.enqueueGenerationRun(plan, owner.id, runContext),
    ]);
    runId = first.id;
    assert.equal(second.id, first.id);
    assert.equal((await database.queryOne<{ count: number }>(`
      SELECT COUNT(*)::int AS count FROM generation_runs
      WHERE owner_id = $1 AND client_request_id = $2
    `, [owner.id, clientRequestId]))?.count, 1);
    assert.equal((await database.queryOne<{ count: number }>(`
      SELECT COUNT(*)::int AS count FROM generation_jobs WHERE run_id = $1
    `, [first.id]))?.count, 1);

    const changed = step(nodeId);
    changed.params = { ...changed.params, inputTexts: ["另一份付费语义"] };
    await assert.rejects(
      queue.enqueueGenerationRun({ steps: [changed] }, owner.id, runContext),
      queue.GenerationRequestConflictError,
    );
  } finally {
    if (runId) await database.query("DELETE FROM generation_runs WHERE id = $1", [runId]);
  }
});

await test("停用账号即使持有旧会话上下文也不能新建付费任务", async () => {
  const userId = `inactive-owner-${++sequence}`;
  const nodeId = `inactive-owner-node-${sequence}`;
  const createdAt = new Date().toISOString();
  await database.query(`
    INSERT INTO users (
      id, account_id, display_name, role, password_hash, active, created_at, updated_at
    ) VALUES ($1, $1, '已停用账号', 'user', 'test-only', 0, $2, $2)
  `, [userId, createdAt]);
  try {
    await assert.rejects(
      queue.enqueueGenerationRun(
        { steps: [step(nodeId)] },
        userId,
        { ...context(nodeId), userId, clientRequestId: `inactive-request-${sequence}` },
      ),
      queue.GenerationOwnerUnavailableError,
    );
    assert.equal((await database.queryOne<{ count: number }>(`
      SELECT COUNT(*)::int AS count FROM generation_runs WHERE owner_id = $1
    `, [userId]))?.count, 0);
  } finally {
    await database.query("DELETE FROM users WHERE id = $1", [userId]);
  }
});

await test("没有执行计划的历史 queued 行不占活动任务容量", async () => {
  const prefix = `legacy-active-${++sequence}-`;
  const nodeId = `legacy-capacity-node-${sequence}`;
  let runId: string | undefined;
  try {
    await database.query(`
      INSERT INTO generation_runs (
        id, owner_id, node_id, node_label, kind, requested_count, status, started_at
      )
      SELECT $1 || index, $2, 'legacy-node-' || index, '历史任务',
        'image', 1, 'queued', index
      FROM generate_series(1, 180) AS index
    `, [prefix, owner.id]);
    const run = await queue.enqueueGenerationRun(
      { steps: [step(nodeId)] },
      owner.id,
      { ...context(nodeId), clientRequestId: `legacy-capacity-request-${sequence}` },
    );
    runId = run.id;
    assert.ok(runId);
  } finally {
    await database.query("DELETE FROM generation_runs WHERE id LIKE $1", [`${prefix}%`]);
    if (runId) await database.query("DELETE FROM generation_runs WHERE id = $1", [runId]);
  }
});

await test("179 条活动任务下两个不同请求并发入队时只接受一个", async () => {
  const testId = ++sequence;
  const prefix = `capacity-race-${testId}-`;
  const acceptedRunIds: string[] = [];
  try {
    await database.query(`
      INSERT INTO generation_runs (
        id, owner_id, node_id, node_label, kind, requested_count, status, started_at, plan_json
      )
      SELECT $1 || index, $2, 'capacity-node-' || index, '容量任务',
        'image', 1, 'queued', index, '{"steps":[]}'
      FROM generate_series(1, 179) AS index
    `, [prefix, owner.id]);
    const outcomes = await Promise.allSettled(["a", "b"].map((suffix) => {
      const nodeId = `capacity-race-node-${testId}-${suffix}`;
      return queue.enqueueGenerationRun(
        { steps: [step(nodeId)] },
        owner.id,
        { ...context(nodeId), clientRequestId: `capacity-race-request-${testId}-${suffix}` },
      );
    }));
    const fulfilled = outcomes.filter(
      (outcome): outcome is PromiseFulfilledResult<{ id: string }> => outcome.status === "fulfilled",
    );
    const rejected = outcomes.filter(
      (outcome): outcome is PromiseRejectedResult => outcome.status === "rejected",
    );
    acceptedRunIds.push(...fulfilled.map((outcome) => outcome.value.id));
    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(rejected[0].reason instanceof queue.ActiveRunLimitError);
    assert.equal((await database.queryOne<{ count: number }>(`
      SELECT COUNT(*)::int AS count FROM generation_runs
      WHERE owner_id = $1
        AND deleted_at IS NULL
        AND plan_json IS NOT NULL
        AND status IN ('queued','running','retry_wait','cancel_requested')
    `, [owner.id]))?.count, 180);
  } finally {
    await database.query("DELETE FROM generation_runs WHERE id LIKE $1", [`${prefix}%`]);
    if (acceptedRunIds.length > 0) {
      await database.query("DELETE FROM generation_runs WHERE id = ANY($1::text[])", [acceptedRunIds]);
    }
  }
});

await test("已软删除的 queued Run 永远不会被 Worker 领取或调用上游", async () => {
  const fake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const runId = await enqueueSingle("soft-deleted");
  try {
    await database.query(`
      UPDATE generation_runs SET deleted_at = $1, purge_after = $1 WHERE id = $2
    `, [new Date().toISOString(), runId]);
    assert.equal(await queue.processNextGenerationJob("worker-soft-deleted", {
      resolveProvider: fake.resolveProvider,
      now: () => tick(),
      random: () => 0,
    }), false);
    assert.equal(fake.calls(), 0);
  } finally {
    await database.query("DELETE FROM generation_runs WHERE id = $1", [runId]);
  }
});

await test("retry_wait 在 available_at 前不可领取，到期后才对 Worker 可见", async () => {
  const fake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const runId = await enqueueSingle("available-at");
  const availableAt = tick(10_000);
  await database.query(
    "UPDATE generation_jobs SET status = 'retry_wait', available_at = $1 WHERE run_id = $2",
    [availableAt, runId],
  );
  await database.query("UPDATE generation_run_steps SET status = 'retry_wait' WHERE run_id = $1", [runId]);
  await database.query("UPDATE generation_runs SET status = 'retry_wait' WHERE id = $1", [runId]);

  assert.equal(await queue.processNextGenerationJob("worker-not-yet-available", {
    resolveProvider: fake.resolveProvider, now: () => availableAt - 1, random: () => 0,
  }), false);
  assert.equal(fake.calls(), 0);
  assert.equal((await runRow(runId))?.status, "retry_wait");

  assert.equal(await queue.processNextGenerationJob("worker-now-available", {
    resolveProvider: fake.resolveProvider, now: () => availableAt, random: () => 0,
  }), true);
  assert.equal(fake.calls(), 1);
  assert.equal((await runRow(runId))?.status, "succeeded");
});

await test("队列结果文件按稳定键幂等落盘", async () => {
  const key = `file-idempotency-${sequence += 1}`;
  const first = await fileStore.persistImageRefWithReceipt(PNG_DATA_URL, key);
  const second = await fileStore.persistImageRefWithReceipt(PNG_DATA_URL, key);
  try {
    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(second.id, first.id);
    assert.equal(second.url, first.url);
    assert.equal(fs.readdirSync(fileStore.uploadsDir()).filter((id) => id === first.id).length, 1);
  } finally {
    fileStore.deleteStoredImage(first.id);
  }
});

await test("成功事务回滚只补偿业务成品，Provider 原图证据保留", async () => {
  const fake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const nodeId = `rollback-file-${++sequence}`;
  const evaluationPlan = { steps: [step(nodeId)] };
  const evaluationPolicy = await authorizeEvaluationPlan(evaluationPlan, {
    caseId: `rollback-file-case-${sequence}`,
    sampleId: `rollback-file-sample-${sequence}`,
    authorizationId: `rollback-file-authorization-${sequence}`,
  });
  const run = await queue.enqueueGenerationRun(
    evaluationPlan,
    owner.id,
    context(nodeId),
    "evaluation",
    evaluationPolicy,
  );
  const runId = run.id;
  const before = new Set(fs.readdirSync(fileStore.uploadsDir()));
  await database.query(`
    CREATE OR REPLACE FUNCTION reject_test_generation_success() RETURNS trigger AS $$
    BEGIN
      IF NEW.status = 'succeeded' AND NEW.node_id LIKE 'rollback-file-%' THEN
        RAISE EXCEPTION 'forced completion rollback';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    CREATE TRIGGER reject_test_generation_success_trigger
      BEFORE UPDATE ON generation_run_steps
      FOR EACH ROW EXECUTE FUNCTION reject_test_generation_success();
  `);
  try {
    const now = tick();
    assert.equal(await queue.processNextGenerationJob("worker-rollback-file", {
      resolveProvider: fake.resolveProvider,
      evaluationCodeIdentity: TEST_EVALUATION_CODE_IDENTITY,
      now: () => now,
      random: () => 0,
    }), true);
  } finally {
    await database.query("DROP TRIGGER IF EXISTS reject_test_generation_success_trigger ON generation_run_steps");
    await database.query("DROP FUNCTION IF EXISTS reject_test_generation_success()");
  }
  assert.equal(fake.calls(), 1);
  assert.equal((await runRow(runId))?.status, "failed");
  const evidenceFiles = await database.query<{ id: string; source_type: string }>(
    "SELECT id, source_type FROM files WHERE run_id = $1", [runId],
  );
  assert.equal(evidenceFiles.length, 1);
  assert.equal(evidenceFiles[0]?.source_type, "provider-original");
  const stepEvidence = await database.queryOne<{ provider_images_json: string }>(
    "SELECT provider_images_json FROM generation_run_steps WHERE run_id = $1", [runId],
  );
  assert.deepEqual(
    JSON.parse(stepEvidence?.provider_images_json ?? "[]"),
    [`/api/files/${evidenceFiles[0]?.id}`],
  );
  const failureOutput = await database.queryOne<{
    image: string; provider_image: string | null; status: string; error: string | null;
  }>(`
    SELECT image, provider_image, status, error FROM generation_outputs WHERE run_id = $1
  `, [runId]);
  assert.equal(failureOutput?.image, "");
  assert.equal(failureOutput?.provider_image, null);
  assert.equal(failureOutput?.status, "error");
  assert.match(failureOutput?.error ?? "", /forced completion rollback/);
  const failedEvidence = await database.queryOne<{
    outcome: string; provider_request_count: number; billing_reconciliation_status: string;
    error_events_json: string; hard_blockers_json: string;
  }>(`
    SELECT outcome, provider_request_count, billing_reconciliation_status,
      error_events_json, hard_blockers_json
    FROM evaluation_case_evidence WHERE run_id = $1
  `, [runId]);
  assert.equal(failedEvidence?.outcome, "failed");
  assert.equal(failedEvidence?.provider_request_count, 1);
  assert.equal(failedEvidence?.billing_reconciliation_status, "pending");
  assert.equal(JSON.parse(failedEvidence?.error_events_json ?? "[]")[0]?.phase, "completion-persist");
  assert.ok(
    JSON.parse(failedEvidence?.hard_blockers_json ?? "[]")
      .some((blocker: { code?: string }) => blocker.code === "evidence-integrity-failure"),
  );
  assert.deepEqual(await database.query<{ layer: string }>(`
    SELECT layer FROM evaluation_image_evidence WHERE run_id = $1 ORDER BY layer
  `, [runId]), [{ layer: "provider-original" }]);
  assert.deepEqual(
    fs.readdirSync(fileStore.uploadsDir()).filter((id) => !before.has(id)),
    [evidenceFiles[0]?.id],
  );
});

await test("明确 429 最多自动重放三次并保留四次真实请求计数", async () => {
  const fake = resolver(() => {
    throw new ProviderError("AI 服务当前繁忙，请稍后重试", 429, "stub", "rate_limited");
  });
  const runId = await enqueueSingle("rate-limit");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const now = tick();
    assert.equal(await queue.processNextGenerationJob("worker-429", {
      resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0, 0],
    }), true);
  }
  assert.equal(fake.calls(), 4);
  assert.deepEqual(await runRow(runId), {
    status: "failed", error: "当前生成人数较多，请稍后再试", provider_requests: 4, successful_count: 0,
  });
  const job = await database.queryOne<{ retry_count: number; status: string }>(
    "SELECT retry_count, status FROM generation_jobs WHERE run_id = $1", [runId],
  );
  assert.deepEqual(job, { retry_count: 3, status: "failed" });
  const now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-429", {
    resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0, 0],
  }), false);
});

await test("确认临时的 503 连续两次失败后第三次成功且请求数准确", async () => {
  const fake = resolver((_request, call) => {
    if (call <= 2) {
      throw new ProviderError("AI 服务暂时不可用，请稍后重试", 503, "stub", "gateway_unavailable");
    }
    return { images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" };
  });
  const runId = await enqueueSingle("temporary-503");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const now = tick();
    assert.equal(await queue.processNextGenerationJob("worker-503", {
      resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0, 0],
    }), true);
  }
  assert.equal(fake.calls(), 3);
  assert.deepEqual(await runRow(runId), {
    status: "succeeded", error: null, provider_requests: 3, successful_count: 1,
  });
});

await test("连续三次 503 按 5/30/120 秒退避，第 4 次失败后终止", async () => {
  const fake = resolver(() => {
    throw new ProviderError("AI 服务暂时不可用，请稍后重试", 503, "stub", "gateway_unavailable");
  });
  const runId = await enqueueSingle("persistent-503");
  const expectedDelays = [5_000, 30_000, 120_000];
  let attemptNow = tick();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    assert.equal(await queue.processNextGenerationJob("worker-persistent-503", {
      resolveProvider: fake.resolveProvider, now: () => attemptNow, random: () => 0,
    }), true);
    if (attempt < expectedDelays.length) {
      const job = await database.queryOne<{ retry_count: number; status: string; available_at: number }>(
        "SELECT retry_count, status, available_at FROM generation_jobs WHERE run_id = $1", [runId],
      );
      assert.deepEqual({ retry_count: job?.retry_count, status: job?.status }, {
        retry_count: attempt + 1, status: "retry_wait",
      });
      assert.equal((job?.available_at ?? 0) - attemptNow, expectedDelays[attempt]);
      attemptNow = job!.available_at;
    }
  }
  clock = Math.max(clock, attemptNow);
  assert.equal(fake.calls(), 4);
  assert.deepEqual(await runRow(runId), {
    status: "failed", error: "AI 服务暂时不可用，请稍后重试", provider_requests: 4, successful_count: 0,
  });
  assert.deepEqual(await database.queryOne<{ retry_count: number; status: string }>(
    "SELECT retry_count, status FROM generation_jobs WHERE run_id = $1", [runId],
  ), { retry_count: 3, status: "failed" });
});

await test("真实评估的 no-retry 策略跨数据库重连持久生效，503 不进入重试队列", async () => {
  const nodeId = `evaluation-no-retry-${++sequence}`;
  const evaluationPlan = { steps: [step(nodeId)] };
  const evaluationPolicy = await authorizeEvaluationPlan(evaluationPlan, {
    caseId: `evaluation-known-failure-${sequence}`,
    sampleId: `evaluation-known-failure-sample-${sequence}`,
    authorizationId: `evaluation-authorization-${sequence}`,
  });
  const evaluationFailureRequestId = `req-evaluation-failure-${sequence}`;
  const fake = resolver(() => {
    throw new ProviderError(
      "AI 服务暂时不可用，请稍后重试",
      503,
      "stub",
      "gateway_unavailable",
      undefined,
      evaluationFailureRequestId,
    );
  });
  const run = await queue.enqueueGenerationRun(
    evaluationPlan,
    owner.id,
    context(nodeId),
    "evaluation",
    evaluationPolicy,
  );
  assert.deepEqual(await database.queryOne<{
    run_type: string;
    retry_policy: string;
    evaluation_case_id: string | null;
    evaluation_authorization_id: string | null;
    billing_reconciliation_status: string;
  }>(`
    SELECT run_type, retry_policy, evaluation_case_id, evaluation_authorization_id,
      billing_reconciliation_status
    FROM generation_runs WHERE id = $1
  `, [run.id]), {
    run_type: "evaluation",
    retry_policy: "no-retry",
    evaluation_case_id: evaluationPolicy.caseId,
    evaluation_authorization_id: evaluationPolicy.authorizationId,
    billing_reconciliation_status: "not-required",
  });

  await database.closeDatabaseForTests();
  await database.initializeDatabase();
  const now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-evaluation-no-retry", {
    resolveProvider: fake.resolveProvider,
    evaluationCodeIdentity: TEST_EVALUATION_CODE_IDENTITY,
    now: () => now,
    random: () => 0,
    retryDelaysMs: [0, 0, 0],
  }), true);
  assert.equal(fake.calls(), 1);
  const failed = await database.queryOne<{
    status: string;
    error: string | null;
    provider_requests: number;
    retry_policy: string;
    billing_reconciliation_status: string;
  }>(`
    SELECT status, error, provider_requests, retry_policy, billing_reconciliation_status
    FROM generation_runs WHERE id = $1
  `, [run.id]);
  assert.equal(failed?.status, "failed");
  assert.equal(failed?.provider_requests, 1);
  assert.equal(failed?.retry_policy, "no-retry");
  assert.equal(failed?.billing_reconciliation_status, "pending");
  assert.match(failed?.error ?? "", /no-retry.*未自动重放/);
  assert.doesNotMatch(failed?.error ?? "", new RegExp(evaluationFailureRequestId));
  const failedCaseEvidence = await database.queryOne<{
    outcome: string; billing_reconciliation_status: string; error_events_json: string;
  }>(`
    SELECT outcome, billing_reconciliation_status, error_events_json
    FROM evaluation_case_evidence WHERE run_id = $1
  `, [run.id]);
  assert.equal(failedCaseEvidence?.outcome, "failed");
  assert.equal(failedCaseEvidence?.billing_reconciliation_status, "pending");
  assert.equal(JSON.parse(failedCaseEvidence?.error_events_json ?? "[]")[0]?.phase, "provider");
  assert.deepEqual(await database.queryOne<{ outcome: string; provider_request_id: string | null }>(`
    SELECT outcome, provider_request_id FROM evaluation_provider_request_evidence WHERE run_id = $1
  `, [run.id]), {
    outcome: "failed",
    provider_request_id: evaluationFailureRequestId,
  });
  assert.deepEqual(await database.queryOne<{ retry_count: number; status: string }>(
    "SELECT retry_count, status FROM generation_jobs WHERE run_id = $1",
    [run.id],
  ), { retry_count: 0, status: "failed" });

  assert.equal(await queue.processNextGenerationJob("worker-evaluation-no-retry-no-replay", {
    resolveProvider: fake.resolveProvider,
    now: () => tick(),
    random: () => 0,
    retryDelaysMs: [0, 0, 0],
  }), false);
  assert.equal(fake.calls(), 1, "no-retry 评估失败后不得发生第二次 Provider 提交");
});

await test("真实评估超时结果持久化为 outcome_unknown 与 pending，且绝不自动重放", async () => {
  const nodeId = `evaluation-outcome-unknown-${++sequence}`;
  const evaluationPlan = { steps: [step(nodeId)] };
  const evaluationPolicy = await authorizeEvaluationPlan(evaluationPlan, {
    caseId: `evaluation-outcome-unknown-${sequence}`,
    sampleId: `evaluation-outcome-unknown-sample-${sequence}`,
    authorizationId: `evaluation-authorization-${sequence}`,
  });
  const fake = resolver(() => {
    throw new ProviderError(
      "AI 请求已超时，结果可能已经生成；为避免重复计费，系统不会自动重试",
      504,
      "stub",
      "outcome_unknown",
    );
  });
  const run = await queue.enqueueGenerationRun(
    evaluationPlan,
    owner.id,
    context(nodeId),
    "evaluation",
    evaluationPolicy,
  );

  const now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-evaluation-outcome-unknown", {
    resolveProvider: fake.resolveProvider,
    evaluationCodeIdentity: TEST_EVALUATION_CODE_IDENTITY,
    now: () => now,
    random: () => 0,
    retryDelaysMs: [0, 0, 0],
  }), true);
  assert.equal(fake.calls(), 1);
  const unknown = await database.queryOne<{
    status: string;
    error: string | null;
    provider_requests: number;
    retry_policy: string;
    evaluation_case_id: string | null;
    billing_reconciliation_status: string;
  }>(`
    SELECT status, error, provider_requests, retry_policy, evaluation_case_id,
      billing_reconciliation_status
    FROM generation_runs WHERE id = $1
  `, [run.id]);
  assert.equal(unknown?.status, "outcome_unknown");
  assert.equal(unknown?.provider_requests, 1);
  assert.equal(unknown?.retry_policy, "no-retry");
  assert.equal(unknown?.evaluation_case_id, evaluationPolicy.caseId);
  assert.equal(unknown?.billing_reconciliation_status, "pending");
  assert.match(unknown?.error ?? "", /核对 API易消耗记录/);
  const unknownEvidence = await database.queryOne<{
    outcome: string; billing_reconciliation_status: string; hard_blockers_json: string;
  }>(`
    SELECT outcome, billing_reconciliation_status, hard_blockers_json
    FROM evaluation_case_evidence WHERE run_id = $1
  `, [run.id]);
  assert.equal(unknownEvidence?.outcome, "outcome_unknown");
  assert.equal(unknownEvidence?.billing_reconciliation_status, "pending");
  assert.ok(
    JSON.parse(unknownEvidence?.hard_blockers_json ?? "[]")
      .some((blocker: { code?: string }) => blocker.code === "outcome-unknown"),
  );
  assert.equal((await database.queryOne<{ outcome: string }>(`
    SELECT outcome FROM evaluation_provider_request_evidence WHERE run_id = $1
  `, [run.id]))?.outcome, "outcome_unknown");
  assert.deepEqual(await database.queryOne<{ retry_count: number; status: string }>(
    "SELECT retry_count, status FROM generation_jobs WHERE run_id = $1",
    [run.id],
  ), { retry_count: 0, status: "outcome_unknown" });

  assert.equal(await queue.processNextGenerationJob("worker-evaluation-outcome-unknown-no-replay", {
    resolveProvider: fake.resolveProvider,
    now: () => tick(),
    random: () => 0,
    retryDelaysMs: [0, 0, 0],
  }), false);
  assert.equal(fake.calls(), 1, "outcome_unknown 待账单核对时不得发生第二次 Provider 提交");
});

await test("超时或连接不确定结果进入 outcome_unknown 且绝不重放", async () => {
  const fake = resolver(() => {
    throw new ProviderError(
      "AI 请求已超时，结果可能已经生成；为避免重复计费，系统不会自动重试",
      504,
      "stub",
      "outcome_unknown",
    );
  });
  const runId = await enqueueSingle("unknown");
  let now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-unknown", {
    resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0],
  }), true);
  assert.equal(fake.calls(), 1);
  const unknown = await runRow(runId);
  assert.equal(unknown?.status, "outcome_unknown");
  assert.equal(unknown?.provider_requests, 1);
  assert.match(unknown?.error ?? "", /核对 API易消耗记录/);
  assert.match(unknown?.error ?? "", /确认未扣费后.*手动重新提交/);
  now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-unknown", {
    resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0],
  }), false);
  assert.equal(fake.calls(), 1);
});

await test("入队后参数偏离受审档案时 Worker 在首次 Provider 前阻断", async () => {
  const nodeId = `partial-unknown-${++sequence}`;
  const fake = resolver(() => ({
    images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip", providerOutputSizes: ["2048x2048"],
  }));
  const plan: ExecutionPlan = {
    steps: [{
      nodeId,
      kind: "image-generator",
      inputImages: [],
      params: boundQueueParams("生成两张服装效果图", { batchSize: 2 }),
    }],
  };
  const run = await queue.enqueueGenerationRun(plan, owner.id, {
    userId: owner.id,
    nodeId,
    nodeLabel: nodeId,
    kind: "image-generator",
    prompt: "生成两张服装效果图",
    requestedCount: 2,
  });
  const firstAttemptAt = tick();
  assert.equal(await queue.processNextGenerationJob("worker-partial-unknown", {
    resolveProvider: fake.resolveProvider,
    now: () => firstAttemptAt,
    random: () => 0,
    retryDelaysMs: [0, 0],
  }), true);
  assert.equal(fake.calls(), 0);
  const blocked = await runRow(run.id);
  assert.equal(blocked?.status, "failed");
  assert.equal(blocked?.provider_requests, 0);
  assert.equal(blocked?.successful_count, 0);
  assert.match(blocked?.error ?? "", /原生参数.*偏离已评估参数档案/);
  assert.deepEqual(await database.query<{ id: string }>(
    "SELECT id FROM files WHERE run_id = $1",
    [run.id],
  ), []);
});

await test("多步运行逐节点保留 Provider 与业务成品映射，历史暴露目标编辑节点的配对", async () => {
  const testId = ++sequence;
  const firstNodeId = `mapping-first-${testId}`;
  const secondNodeId = `mapping-second-${testId}`;
  const targetNodeId = `mapping-result-${testId}`;
  const generationStep = (nodeId: string, prompt: string): NodeExecution => ({
    nodeId,
    kind: "image-generator",
    inputImages: [],
    params: boundQueueParams(prompt),
  });
  // v7（runtime.md §5「result 归位」）：独立 result 汇总节点已删除，run 的业务产出
  // 锚定目标 image 节点。目标节点是真实的付费 edit 步骤，运行时消费两个上游生成
  // 节点本次运行的产出（flare edit 契约允许 1-8 张参考图）；inputReferences 是
  // 入队时的画布快照，Worker 以本次 run 的实际产出在 Provider 边界替换。
  const editStep: NodeExecution = {
    nodeId: targetNodeId,
    kind: "image-generator",
    inputImages: [PNG_DATA_URL, PNG_DATA_URL],
    inputReferences: [
      { imageRef: PNG_DATA_URL, order: 0, sourceNodeId: firstNodeId },
      { imageRef: PNG_DATA_URL, order: 1, sourceNodeId: secondNodeId },
    ],
    upstream: [
      { nodeId: firstNodeId, images: [] },
      { nodeId: secondNodeId, images: [] },
    ],
    params: {
      // v7：真实 DAG 产出——用户正文沿 text 边进入 inputTexts。
      inputTexts: ["整合两组服装效果图为统一商业棚拍画面"],
      promptVariantId: runtimeEditVariant.variantId,
      promptFamilyId: runtimeEditVariant.familyId,
      parameterProfileId: runtimeEditVariant.parameterProfileId,
      contractHash: runtimeEditVariant.contractHash,
      evaluationVersion: runtimeEditVariant.evaluationVersion,
      postprocessVersion: runtimeEditProfile.postprocess.version,
      operationMode: runtimeEditVariant.mode,
      modelId: runtimeEditVariant.modelId,
      modelOptions: runtimeEditParameters.modelOptions,
      aspectRatio: runtimeEditParameters.aspectRatio,
      batchSize: runtimeEditParameters.batchSize,
    },
  };
  const plan: ExecutionPlan = {
    steps: [
      generationStep(firstNodeId, "第一组效果图"),
      generationStep(secondNodeId, "第二组效果图"),
      editStep,
    ],
  };
  const fake = resolver((request) => ({
    images: Array.from({ length: Number(request.batchSize) || 1 }, () => PNG_DATA_URL),
    model: "gpt-image-2.5-flare-vip",
  }));
  const run = await queue.enqueueGenerationRun(plan, owner.id, {
    userId: owner.id,
    nodeId: targetNodeId,
    nodeLabel: targetNodeId,
    kind: "image-generator",
    requestedCount: 1,
  });
  for (let jobIndex = 0; jobIndex < 3; jobIndex += 1) {
    const now = tick();
    assert.equal(await queue.processNextGenerationJob(`worker-mapping-${jobIndex}`, {
      resolveProvider: fake.resolveProvider,
      now: () => now,
      random: () => 0,
    }), true);
  }
  assert.equal(fake.calls(), 3);
  assert.deepEqual(await runRow(run.id), {
    status: "succeeded", error: null, provider_requests: 3, successful_count: 1,
  });

  const allSteps = await database.query<{
    node_id: string; output_images_json: string; provider_images_json: string;
    reference_inputs_json: string;
  }>(`
    SELECT node_id, output_images_json, provider_images_json, reference_inputs_json
    FROM generation_run_steps
    WHERE run_id = $1 AND node_id = ANY($2::text[])
    ORDER BY step_index
  `, [run.id, [firstNodeId, secondNodeId, targetNodeId]]);
  assert.deepEqual(allSteps.map((row) => row.node_id), [firstNodeId, secondNodeId, targetNodeId]);
  const businessByNode = new Map<string, string[]>();
  const providerByNode = new Map<string, string[]>();
  for (const row of allSteps) {
    const business = JSON.parse(row.output_images_json) as string[];
    const providers = JSON.parse(row.provider_images_json) as string[];
    assert.equal(business.length, 1, `${row.node_id} 每个 image 步骤产出一张业务成品`);
    assert.equal(providers.length, 1, `${row.node_id} 每张业务成品必须有独立 Provider 原图证据`);
    assert.notEqual(
      business[0],
      providers[0],
      `${row.node_id} Provider 原图与业务成品必须使用独立证据地址`,
    );
    businessByNode.set(row.node_id, business);
    providerByNode.set(row.node_id, providers);
  }
  // 三个步骤的业务成品与 Provider 原图都必须逐张可区分（相同字节也落独立证据）。
  assert.equal(new Set([...businessByNode.values()].flat()).size, 3);
  assert.equal(new Set([...providerByNode.values()].flat()).size, 3);
  const targetStepRow = allSteps.find((row) => row.node_id === targetNodeId)!;
  const targetRuntimeReferences = JSON.parse(targetStepRow.reference_inputs_json) as Array<{
    order: number;
    sourceNodeId?: string;
  }>;
  assert.deepEqual(
    targetRuntimeReferences.map(({ order, sourceNodeId }) => ({ order, sourceNodeId })),
    [
      { order: 0, sourceNodeId: firstNodeId },
      { order: 1, sourceNodeId: secondNodeId },
    ],
  );

  const outputRows = await database.query<{ image: string; provider_image: string | null }>(`
    SELECT image, provider_image FROM generation_outputs
    WHERE run_id = $1 AND status = 'success'
    ORDER BY created_at, id
  `, [run.id]);
  const targetPair = {
    image: businessByNode.get(targetNodeId)![0] as string,
    providerImage: providerByNode.get(targetNodeId)![0] as string,
  };
  const app = express();
  app.use((req, _res, next) => {
    (req as AuthenticatedRequest).authUser = {
      id: owner.id, accountId: "queue-admin", displayName: "Queue Admin",
      role: "admin", mustChangePassword: false,
    };
    next();
  });
  app.use("/api/history", historyRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/history?limit=100&before=${Date.now() + 60_000}`,
    );
    const responseText = await response.text();
    assert.equal(response.status, 200, responseText);
    const payload = JSON.parse(responseText) as {
      records: Array<{
        runId: string;
        image: string;
        providerImage: string;
        providerImages: string[];
      }>;
    };
    const historyRows = payload.records
      .filter((record) => record.runId === run.id)
      .map((record) => ({ image: record.image, providerImage: record.providerImage }));
    const historyProviderImages = payload.records
      .filter((record) => record.runId === run.id)
      .flatMap((record) => record.providerImages);
    const expectedPairs = [targetPair];
    assert.deepEqual({
      outputs: outputRows.map((row) => ({ image: row.image, providerImage: row.provider_image })),
      history: historyRows,
      distinctHistoryProviderImages: new Set(historyRows.map((row) => row.providerImage)).size,
    }, {
      outputs: expectedPairs,
      history: expectedPairs,
      distinctHistoryProviderImages: 1,
    });
    // 历史列表的 Provider 原图数组优先取目标步骤证据，且逐张对应业务成品。
    assert.deepEqual(historyProviderImages, [targetPair.providerImage]);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

await test("invalid_response 是确定失败且不会进入自动重试", async () => {
  const fake = resolver(() => {
    throw new ProviderError("AI 服务返回了损坏的图片数据", 502, "stub", "invalid_response");
  });
  const runId = await enqueueSingle("invalid-response");
  let now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-invalid-response", {
    resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0],
  }), true);
  assert.equal(fake.calls(), 1);
  assert.equal((await runRow(runId))?.status, "failed");
  const job = await database.queryOne<{ retry_count: number; status: string }>(
    "SELECT retry_count, status FROM generation_jobs WHERE run_id = $1", [runId],
  );
  assert.deepEqual(job, { retry_count: 0, status: "failed" });
  now = tick();
  assert.equal(await queue.processNextGenerationJob("worker-invalid-response", {
    resolveProvider: fake.resolveProvider, now: () => now, random: () => 0, retryDelaysMs: [0, 0],
  }), false);
  assert.equal(fake.calls(), 1);
});

await test("租约在上游调用前过期可安全重排，调用开始后过期则结果未知", async () => {
  const safeRunId = await enqueueSingle("lease-safe");
  const expiredAt = tick();
  await database.query(`
    UPDATE generation_jobs SET status = 'running', worker_id = 'dead-worker', lease_expires_at = $1,
      attempt_started_at = NULL WHERE run_id = $2
  `, [expiredAt - 1, safeRunId]);
  await database.query("UPDATE generation_run_steps SET status = 'running' WHERE run_id = $1", [safeRunId]);
  await database.query("UPDATE generation_runs SET status = 'running' WHERE id = $1", [safeRunId]);
  assert.equal(await queue.recoverExpiredGenerationJobs(expiredAt), 1);
  assert.equal((await runRow(safeRunId))?.status, "queued");
  const safeFake = resolver(() => ({ images: [PNG_DATA_URL], model: "gpt-image-2.5-flare-vip" }));
  const safeNow = tick();
  assert.equal(await queue.processNextGenerationJob("worker-recovered", {
    resolveProvider: safeFake.resolveProvider, now: () => safeNow, random: () => 0,
  }), true);
  assert.equal((await runRow(safeRunId))?.status, "succeeded");

  const unknownRunId = await enqueueSingle("lease-unknown");
  const unknownExpiry = tick();
  await database.query(`
    UPDATE generation_jobs SET status = 'running', worker_id = 'dead-worker', lease_expires_at = $1,
      attempt_started_at = $2 WHERE run_id = $3
  `, [unknownExpiry - 1, unknownExpiry - 100, unknownRunId]);
  await database.query(`
    UPDATE generation_run_steps SET status = 'running', provider_requests = 1 WHERE run_id = $1
  `, [unknownRunId]);
  await database.query("UPDATE generation_runs SET status = 'running' WHERE id = $1", [unknownRunId]);
  assert.equal(await queue.recoverExpiredGenerationJobs(unknownExpiry), 1);
  const unknown = await runRow(unknownRunId);
  assert.equal(unknown?.status, "outcome_unknown");
  assert.equal(unknown?.provider_requests, 1);
  assert.match(unknown?.error ?? "", /核对 API易消耗记录/);
});

await test("评估恢复仍存在 started 请求时保持 outcome_unknown 并等待账单核对", async () => {
  const nodeId = `lease-started-evaluation-${++sequence}`;
  const evaluationPlan: ExecutionPlan = { steps: [step(nodeId)] };
  const evaluationPolicy = await authorizeEvaluationPlan(evaluationPlan, {
    caseId: `lease-started-case-${sequence}`,
    sampleId: `lease-started-sample-${sequence}`,
    authorizationId: `lease-started-authorization-${sequence}`,
  });
  const run = await queue.enqueueGenerationRun(
    evaluationPlan,
    owner.id,
    context(nodeId),
    "evaluation",
    evaluationPolicy,
  );
  const startedAt = tick();
  const claimed = await queue.claimNextJob("dead-started-evaluation-worker", startedAt, 1_000);
  assert.ok(claimed);
  assert.equal(claimed.runId, run.id);
  const request: ImageGenRequest = {
    prompt: runnerPromptForGenerateStep(claimed.step),
    operationMode: "generate",
    aspectRatio: claimed.step.params.aspectRatio as string,
    batchSize: 1,
    modelOptions: claimed.step.params.modelOptions as ImageGenRequest["modelOptions"],
  };
  await database.transaction(async (client) => {
    await evaluationEvidenceStore.startEvaluationProviderRequestEvidence(client, {
      runId: run.id,
      ownerId: owner.id,
      plan: { steps: [claimed.step] },
      step: claimed.step,
      policy: evaluationPolicy,
      requestIndex: 1,
      request,
      startedAt,
      codeIdentity: TEST_EVALUATION_CODE_IDENTITY,
    });
    await client.query(`
      UPDATE generation_jobs SET attempt_started_at = $1, lease_expires_at = $2
      WHERE id = $3
    `, [startedAt, startedAt - 1, claimed.id]);
    await client.query(
      "UPDATE generation_run_steps SET provider_requests = 1 WHERE id = $1",
      [claimed.stepId],
    );
  });

  assert.equal(await queue.recoverExpiredGenerationJobs(tick()), 1);
  const recovered = await runRow(run.id);
  assert.equal(recovered?.status, "outcome_unknown");
  assert.match(recovered?.error ?? "", /核对 API易消耗记录/);
  assert.equal((await database.queryOne<{ outcome: string }>(`
    SELECT outcome FROM evaluation_provider_request_evidence WHERE run_id = $1
  `, [run.id]))?.outcome, "outcome_unknown");
  const blockers = await database.queryOne<{ hard_blockers_json: string }>(`
    SELECT hard_blockers_json FROM evaluation_case_evidence WHERE run_id = $1
  `, [run.id]);
  assert.equal(
    JSON.parse(blockers?.hard_blockers_json ?? "[]")
      .some((blocker: { code?: string }) => blocker.code === "outcome-unknown"),
    true,
  );
});

await test("评估请求已成功且原图落库后租约过期按后处理失败关闭，而非 outcome_unknown", async () => {
  const nodeId = `lease-known-evaluation-${++sequence}`;
  const evaluationPlan: ExecutionPlan = { steps: [step(nodeId)] };
  const evaluationPolicy = await authorizeEvaluationPlan(evaluationPlan, {
    caseId: `lease-known-case-${sequence}`,
    sampleId: `lease-known-sample-${sequence}`,
    authorizationId: `lease-known-authorization-${sequence}`,
  });
  const run = await queue.enqueueGenerationRun(
    evaluationPlan,
    owner.id,
    context(nodeId),
    "evaluation",
    evaluationPolicy,
  );
  const startedAt = tick();
  const claimed = await queue.claimNextJob("dead-evaluation-worker", startedAt, 1_000);
  assert.ok(claimed);
  assert.equal(claimed.runId, run.id);
  const request: ImageGenRequest = {
    prompt: runnerPromptForGenerateStep(claimed.step),
    operationMode: "generate",
    aspectRatio: claimed.step.params.aspectRatio as string,
    batchSize: 1,
    modelOptions: claimed.step.params.modelOptions as ImageGenRequest["modelOptions"],
  };
  await database.transaction(async (client) => {
    await evaluationEvidenceStore.startEvaluationProviderRequestEvidence(client, {
      runId: run.id,
      ownerId: owner.id,
      plan: { steps: [claimed.step] },
      step: claimed.step,
      policy: evaluationPolicy,
      requestIndex: 1,
      request,
      startedAt,
      codeIdentity: TEST_EVALUATION_CODE_IDENTITY,
    });
    await client.query(`
      UPDATE generation_jobs SET attempt_started_at = $1, lease_expires_at = $2
      WHERE id = $3
    `, [startedAt, startedAt - 1, claimed.id]);
    await client.query(
      "UPDATE generation_run_steps SET provider_requests = 1 WHERE id = $1",
      [claimed.stepId],
    );
  });
  const original = await fileStore.persistImageRefWithReceipt(
    PNG_DATA_URL,
    `${run.id}:${claimed.stepId}:provider:0`,
  );
  const providerFinishedAt = tick();
  await database.transaction(async (client) => {
    await client.query(`
      UPDATE generation_run_steps SET provider_images_json = $1 WHERE id = $2
    `, [JSON.stringify([original.url]), claimed.stepId]);
    await client.query(`
      INSERT INTO files (id, owner_id, source_type, node_id, run_id, created_at)
      VALUES ($1, $2, 'provider-original', $3, $4, $5)
    `, [original.id, owner.id, nodeId, run.id, new Date(providerFinishedAt).toISOString()]);
    await evaluationEvidenceStore.recordEvaluationProviderRequestSuccess(client, {
      runId: run.id,
      policy: evaluationPolicy,
      requestIndex: 1,
      providerModel: queueVariant.modelId,
      providerOutputSizes: ["1024x1024"],
      providerOriginalStorageRefs: [original.url],
      finishedAt: providerFinishedAt,
    });
  });

  const recoveredAt = tick();
  assert.equal(await queue.recoverExpiredGenerationJobs(recoveredAt), 1);
  const recovered = await runRow(run.id);
  assert.equal(recovered?.status, "failed");
  assert.doesNotMatch(recovered?.error ?? "", /结果未知|核对 API易消耗记录/);
  assert.match(recovered?.error ?? "", /原图已持久化.*后处理失败/);
  assert.equal((await database.queryOne<{ outcome: string }>(`
    SELECT outcome FROM evaluation_provider_request_evidence WHERE run_id = $1
  `, [run.id]))?.outcome, "succeeded");
  const caseEvidence = await database.queryOne<{
    outcome: string; error_events_json: string; hard_blockers_json: string;
  }>(`
    SELECT outcome, error_events_json, hard_blockers_json
    FROM evaluation_case_evidence WHERE run_id = $1
  `, [run.id]);
  assert.equal(caseEvidence?.outcome, "failed");
  assert.equal(JSON.parse(caseEvidence?.error_events_json ?? "[]")[0]?.phase, "postprocess");
  const blockerCodes = JSON.parse(caseEvidence?.hard_blockers_json ?? "[]")
    .map((blocker: { code?: string }) => blocker.code);
  assert.equal(blockerCodes.includes("evidence-integrity-failure"), true);
  assert.equal(blockerCodes.includes("outcome-unknown"), false);
});

await test("同一 run 的并发事件通过原子序号严格递增且无缺口", async () => {
  const runId = await enqueueSingle("concurrent-events");
  const first = await database.db().connect();
  const second = await database.db().connect();
  let secondAppend: Promise<unknown> | undefined;
  try {
    await first.query("BEGIN");
    await second.query("BEGIN");
    const firstEvent = await queue.appendRunEvent(first, runId, {
      type: "node-status", nodeId: "concurrent-events-a", status: "queued",
    }, tick());
    let secondSettled = false;
    secondAppend = queue.appendRunEvent(second, runId, {
      type: "node-status", nodeId: "concurrent-events-b", status: "queued",
    }, tick()).then((event) => { secondSettled = true; return event; });
    await new Promise<void>((resolve) => setTimeout(resolve, 50));
    assert.equal(secondSettled, false, "第二个事务应等待同一 run 的序号分配锁");
    await first.query("COMMIT");
    const secondEvent = await secondAppend as { seq?: number };
    await second.query("COMMIT");
    assert.deepEqual([firstEvent.seq, secondEvent.seq], [2, 3]);
  } finally {
    await first.query("ROLLBACK").catch(() => undefined);
    await second.query("ROLLBACK").catch(() => undefined);
    await secondAppend?.catch(() => undefined);
    first.release();
    second.release();
  }
  const events = await queue.readDurableRunEvents(runId, owner.id, 0);
  assert.deepEqual(events?.map((event) => event.seq), [1, 2, 3]);
  await database.query("DELETE FROM generation_runs WHERE id = $1", [runId]);
});

await test("SSE 在观察到终态后再次 drain，发送同一提交中的最后事件", async () => {
  const request = new EventEmitter() as EventEmitter & Request;
  request.get = () => undefined;
  const writes: string[] = [];
  let ended = false;
  const response = {
    writeHead: () => response,
    write: (chunk: string) => { writes.push(chunk); return true; },
    end: () => { ended = true; return response; },
  } as unknown as Response;
  let reads = 0;
  await streamDurableRunEvents("race-run", owner.id, request, response, {
    readEvents: async (_runId, _ownerId, afterSeq) => {
      reads += 1;
      if (afterSeq === 0) {
        return [{ type: "node-status", nodeId: "race-node", status: "running", seq: 1 }];
      }
      if (afterSeq === 1) {
        return [
          {
            type: "node-status", nodeId: "race-node", status: "success",
            images: ["/api/files/race.png"], seq: 2,
          },
          { type: "done", seq: 3 },
        ];
      }
      return [];
    },
    getRun: async () => ({ id: "race-run", status: "succeeded", finished: true }),
    wait: async () => undefined,
  });
  const body = writes.join("");
  assert.equal(reads, 2);
  assert.match(body, /id: 2/);
  assert.match(body, /\"type\":\"done\"/);
  assert.equal(ended, true);
});

await test("直连蒙版任务把第一张参考图持久绑定为 maskSourceRef", async () => {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use((req, _res, next) => {
    (req as AuthenticatedRequest).authUser = {
      id: owner.id, accountId: "queue-admin", displayName: "Queue Admin",
      role: "admin", mustChangePassword: false,
    };
    next();
  });
  app.use("/api/generate", generateRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address() as AddressInfo;
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientRequestId: "direct-mask-request",
        modelId: "gpt-image-2.5-sunburst",
        kind: "image-generator",
        nodeId: "direct-mask-test",
        request: {
          // v7 直连路径：request.prompt 是纯用户正文（runner 回退 params.prompt
          // 后再内联 variant.fullPrompt），不再提交 v6 包装文本。
          prompt: "只修改左侧衣袖",
          promptVariantId: maskVariant.variantId,
          promptFamilyId: maskVariant.familyId,
          parameterProfileId: maskVariant.parameterProfileId,
          contractHash: maskVariant.contractHash,
          evaluationVersion: maskVariant.evaluationVersion,
          postprocessVersion: maskProfile.postprocess.version,
          operationMode: "mask-edit",
          aspectRatio: maskParameters.aspectRatio,
          batchSize: maskParameters.batchSize,
          references: [{
            dataUrl: PNG_DATA_URL,
            order: 0,
            assetSha256: "a".repeat(64),
          }],
          mask: PNG_DATA_URL,
          maskMode: "replace",
          modelOptions: maskParameters.modelOptions,
        },
      }),
    });
    const body = await response.json() as { runId?: string; error?: string };
    assert.equal(response.status, 202, body.error);
    assert.ok(body.runId);
    const stored = await database.queryOne<{ step_json: string }>(
      "SELECT step_json FROM generation_run_steps WHERE run_id = $1", [body.runId],
    );
    assert.ok(stored);
    const queuedStep = JSON.parse(stored.step_json) as NodeExecution;
    assert.equal(queuedStep.kind, "image-generator");
    assert.deepEqual(queuedStep.inputImages, [PNG_DATA_URL]);
    assert.equal(queuedStep.params.maskSourceRef, PNG_DATA_URL);
    assert.equal(queuedStep.params.maskMode, undefined);
    assert.equal(queuedStep.params.maskPipelineVersion, 3);
    const storedRun = await database.queryOne<{ parameters_json: string }>(
      "SELECT parameters_json FROM generation_runs WHERE id = $1", [body.runId],
    );
    const parameters = JSON.parse(storedRun?.parameters_json ?? "{}") as Record<string, unknown>;
    assert.equal(parameters.maskMode, undefined);
    assert.equal(parameters.maskPipelineVersion, 3);

    const overLimitResponse = await fetch(`http://127.0.0.1:${address.port}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientRequestId: "direct-mask-over-limit",
        modelId: "gpt-image-2.5-sunburst",
        kind: "image-generator",
        nodeId: "direct-mask-over-limit",
        request: {
          prompt: "局部修改",
          promptVariantId: maskVariant.variantId,
          promptFamilyId: maskVariant.familyId,
          parameterProfileId: maskVariant.parameterProfileId,
          contractHash: maskVariant.contractHash,
          evaluationVersion: maskVariant.evaluationVersion,
          postprocessVersion: maskProfile.postprocess.version,
          operationMode: "mask-edit",
          aspectRatio: maskParameters.aspectRatio,
          batchSize: maskParameters.batchSize,
          references: Array.from({ length: 8 }, (_value, order) => ({
            dataUrl: PNG_DATA_URL,
            order,
            assetSha256: "b".repeat(64),
          })),
          mask: PNG_DATA_URL,
          modelOptions: maskParameters.modelOptions,
        },
      }),
    });
    const overLimitBody = await overLimitResponse.json() as { error?: string };
    assert.equal(overLimitResponse.status, 400);
    assert.match(overLimitBody.error ?? "", /at most 7 user images/);

    await database.query("DELETE FROM generation_runs WHERE id = $1", [body.runId]);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

await test("500 个 job 的领取计划无 Sort 且 claimNextJob P95 小于 50ms", async () => {
  const runIds: string[] = [];
  for (let runIndex = 0; runIndex < 100; runIndex += 1) {
    sequence += 1;
    const nodes = Array.from({ length: 5 }, (_value, stepIndex) => "perf-" + sequence + "-" + stepIndex);
    const steps = nodes.map((nodeId, stepIndex) => step(
      nodeId,
      stepIndex === 0 ? undefined : [{ nodeId: nodes[stepIndex - 1], images: [] }],
    ));
    const run = await queue.enqueueGenerationRun({ steps }, owner.id, context(nodes.at(-1)!));
    runIds.push(run.id);
  }
  try {
    assert.equal((await database.queryOne<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM generation_jobs WHERE run_id = ANY($1::text[])", [runIds],
    ))?.count, 500);
    await database.query("ANALYZE generation_jobs, generation_run_steps, generation_runs");
    const benchmarkNow = tick(10_000);
    const explain = await database.query<{ "QUERY PLAN": Array<{ Plan: ExplainPlanNode }> }>(
      "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + queue.CLAIM_NEXT_JOB_SQL,
      [benchmarkNow],
    );
    const root = explain[0]?.["QUERY PLAN"]?.[0]?.Plan;
    assert.ok(root);
    const sortNodes = flattenPlan(root).filter((node) => node["Node Type"].includes("Sort"));
    assert.deepEqual(sortNodes.map((node) => ({
      nodeType: node["Node Type"], sortMethod: node["Sort Method"] ?? null,
    })), []);

    const durations: number[] = [];
    for (let index = 0; index < 20; index += 1) {
      const started = process.hrtime.bigint();
      const claimed = await queue.claimNextJob("perf-worker-" + index, benchmarkNow, 60_000);
      durations.push(Number(process.hrtime.bigint() - started) / 1_000_000);
      assert.ok(claimed && runIds.includes(claimed.runId));
    }
    durations.sort((left, right) => left - right);
    const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
    assert.ok(p95 < 50, "claimNextJob P95 " + p95.toFixed(2) + "ms exceeds 50ms");
    console.log("    claimNextJob P95 " + p95.toFixed(2) + "ms");
  } finally {
    await database.query("DELETE FROM generation_runs WHERE id = ANY($1::text[])", [runIds]);
  }
});

await database.closeDatabaseForTests();
fs.rmSync(temp, { recursive: true, force: true });
console.log(`\n通过 ${passed} 项`);
