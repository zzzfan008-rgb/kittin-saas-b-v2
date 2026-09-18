/**
 * DAG 回归测试（纯逻辑，不调真实 API）：
 * 1. 线性链路：下游在执行时拿到上游本次产出（而非计划期快照）
 * 2. 分支 DAG：每个下游只收到其直接上游
 * 3. 环检测仍有效
 * 4. 单节点重跑：范围外上游回退快照
 * 运行：node node_modules/tsx/dist/cli.mjs tests/dag.test.ts
 */
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { assertPlanInputs, buildExecutionPlan, DagError, type FlowEdge, type FlowNode } from "../server/engine/dag";
import { validateAndMigrateFlow } from "../server/lib/workflowSchema";
import { renderProviderPrompt } from "../src/lib/providerPromptRenderer";
import { MASK_REDRAW_MODEL_ID } from "../src/types/imageModels";
import type {
  AIProvider,
  ImageOperationMode,
  ImageGenRequest,
  NodeExecution,
  NodeKind,
  ReferenceImageSource,
  WorkflowNodeData,
} from "../src/types/workflow";

// 所有测试文件都进入临时目录，绝不读写项目 data/。
const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-test-"));
process.env.DATA_DIR = TEST_DATA_DIR;

const { executeStep } = await import("../server/engine/runner");
const { uploadsDir } = await import("../server/lib/fileStore");

// 造一张真实存在的测试图片（落盘校验需要）。
const SEED_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const SECOND_PNG = await sharp({
  create: { width: 1, height: 1, channels: 3, background: { r: 24, g: 92, b: 180 } },
}).png().toBuffer();
const SEED_DATA_URL = `data:image/png;base64,${SEED_PNG.toString("base64")}`;
const SECOND_DATA_URL = `data:image/png;base64,${SECOND_PNG.toString("base64")}`;
const MASK_SOURCE_PNG = await sharp({
  create: { width: 128, height: 128, channels: 3, background: { r: 35, g: 92, b: 165 } },
}).png().toBuffer();
const MASK_SOURCE_DATA_URL = `data:image/png;base64,${MASK_SOURCE_PNG.toString("base64")}`;
const MASK_PIXELS = Buffer.alloc(128 * 128 * 4, 255);
for (let y = 40; y < 88; y += 1) {
  for (let x = 40; x < 88; x += 1) MASK_PIXELS[(y * 128 + x) * 4 + 3] = 0;
}
const MASK_PNG = await sharp(MASK_PIXELS, { raw: { width: 128, height: 128, channels: 4 } }).png().toBuffer();
const MASK_DATA_URL = `data:image/png;base64,${MASK_PNG.toString("base64")}`;
const REPLACE_PIXELS = Buffer.alloc(128 * 128 * 3);
for (let y = 0; y < 128; y += 1) {
  for (let x = 0; x < 128; x += 1) {
    const offset = (y * 128 + x) * 3;
    const isNewContour = y >= 30 && y < 98 && x >= 18 && x < 110;
    const color = isNewContour
      ? { r: 225, g: 42, b: 48 }
      : { r: 35, g: 92, b: 165 };
    REPLACE_PIXELS[offset] = color.r;
    REPLACE_PIXELS[offset + 1] = color.g;
    REPLACE_PIXELS[offset + 2] = color.b;
  }
}
const REPLACE_PNG = await sharp(REPLACE_PIXELS, {
  raw: { width: 128, height: 128, channels: 3 },
}).png().toBuffer();
const REPLACE_PROVIDER_PNG = await sharp(REPLACE_PNG).resize({ width: 816, height: 816, fit: "fill" }).png().toBuffer();
const REPLACE_PROVIDER_DATA_URL = `data:image/png;base64,${REPLACE_PROVIDER_PNG.toString("base64")}`;
fs.writeFileSync(path.join(uploadsDir(), "seed.png"), SEED_PNG);

let passed = 0;
function ok(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed++;
      console.log(`  ✓ ${name}`);
    })
    .catch((err) => {
      console.error(`  ✗ ${name}`);
      console.error(err);
      process.exitCode = 1;
    });
}

function imgNode(id: string, imageUrl?: string): FlowNode {
  return {
    id,
    type: "image-input",
    data: {
      kind: "image-input",
      label: id,
      status: "idle",
      imageUrl,
    } as WorkflowNodeData as FlowNode["data"],
  };
}

function aiNode(
  id: string,
  kind: "sketch-to-render" | "ai-modify",
  operationMode: Exclude<ImageOperationMode, "mask-edit">,
  outputImages: string[] = [],
): FlowNode {
  return {
    id,
    type: kind,
    data: {
      kind,
      label: id,
      status: "idle",
      prompt: "test",
      aspectRatio: "1:1",
      batchSize: 1,
      operationMode,
      operationModeNeedsConfirmation: false,
      modelId: "gpt-image-2.5-flare-vip",
      modelOptions: { size: "auto" },
      outputImages,
    } as WorkflowNodeData as FlowNode["data"],
  };
}

function resultNode(id: string): FlowNode {
  return {
    id,
    type: "result",
    data: { kind: "result", label: id, status: "idle", images: [] } as WorkflowNodeData as FlowNode["data"],
  };
}

const edge = (
  source: string,
  target: string,
): FlowEdge => ({ source, target });

interface RecordedProviderCall {
  method: "generate" | "edit";
  request: ImageGenRequest;
}

async function runRecordedAiStep(
  kind: Exclude<NodeKind, "image-input" | "result">,
  params: Record<string, unknown> & { operationMode: ImageOperationMode },
  inputImages: string[],
  providerImages?: string[],
  referenceSources?: ReferenceImageSource[],
) {
  const calls: RecordedProviderCall[] = [];
  const providerIds: string[] = [];
  const record = (method: RecordedProviderCall["method"], request: ImageGenRequest) => {
    calls.push({
      method,
      request: {
        ...request,
        references: request.references?.map((reference) => ({ ...reference })),
        referenceImages: request.referenceImages ? [...request.referenceImages] : undefined,
      },
    });
    const count = Math.max(1, request.batchSize ?? 1);
    return {
      images: providerImages ?? Array.from({ length: count }, () => SEED_DATA_URL),
      model: "runner-stub-model",
    };
  };
  const provider: AIProvider = {
    id: "runner-stub",
    async generate(request) { return record("generate", request); },
    async edit(request) { return record("edit", request); },
  };
  const step: NodeExecution = {
    nodeId: `runner-${kind}`,
    kind,
    inputImages,
    inputReferences: referenceSources,
    params: { modelId: "gpt-image-2.5-flare-vip", ...params },
  };
  const result = await executeStep(step, inputImages, (providerId) => {
    providerIds.push(providerId);
    return provider;
  }, referenceSources ? { referenceSources } : undefined);
  return { calls, providerIds, result };
}

async function main() {
  console.log("DAG 回归测试");

  await ok("线性链路：下游步骤携带上游依赖（ID + 快照）", () => {
    const plan = buildExecutionPlan(
      [
        imgNode("input", "/api/files/a.png"),
        aiNode("render", "sketch-to-render", "edit"),
        aiNode("modify", "ai-modify", "edit"),
      ],
      [edge("input", "render"), edge("render", "modify")],
    );
    const modify = plan.steps.find((s) => s.nodeId === "modify")!;
    // 计划期 render 无产出 → 快照为空，但依赖关系必须保留（运行时解析）
    assert.deepStrictEqual(modify.upstream, [{
      nodeId: "render",
      images: [],
    }]);
    assert.deepStrictEqual(modify.inputImages, []);
  });

  await ok("分支 DAG：每个下游只挂自己的直接上游", () => {
    const plan = buildExecutionPlan(
      [
        imgNode("in1", "/a.png"),
        imgNode("in2", "/b.png"),
        aiNode("r1", "sketch-to-render", "edit"),
        aiNode("r2", "ai-modify", "edit"),
        resultNode("out"),
      ],
      [edge("in1", "r1"), edge("in2", "r2"), edge("r1", "out"), edge("r2", "out")],
    );
    const r1 = plan.steps.find((s) => s.nodeId === "r1")!;
    const r2 = plan.steps.find((s) => s.nodeId === "r2")!;
    const out = plan.steps.find((s) => s.nodeId === "out")!;
    assert.deepStrictEqual(r1.upstream?.map((u) => u.nodeId), ["in1"]);
    assert.deepStrictEqual(r2.upstream?.map((u) => u.nodeId), ["in2"]);
    assert.deepStrictEqual(out.upstream?.map((u) => u.nodeId), ["r1", "r2"]);
  });

  await ok("蒙版执行计划统一为版本化局部修改，不再携带旧处理模式", () => {
    const maskNode = (id: string, legacyMaskMode?: "preserve" | "replace"): FlowNode => ({
      id,
      type: "mask-redraw",
      data: {
        kind: "mask-redraw",
        label: "蒙版重绘",
        status: "idle",
        prompt: "替换胸前图案",
        mask: MASK_DATA_URL,
        maskSourceRef: MASK_SOURCE_DATA_URL,
        ...(legacyMaskMode ? { maskMode: legacyMaskMode } : {}),
        outputImages: [],
        operationMode: "mask-edit",
        operationModeNeedsConfirmation: false,
        modelId: MASK_REDRAW_MODEL_ID,
        modelOptions: {},
      },
    });
    const legacyStep = buildExecutionPlan([maskNode("legacy", "preserve")], []).steps[0];
    const replaceStep = buildExecutionPlan([maskNode("replace", "replace")], []).steps[0];
    assert.equal(legacyStep.params.maskPipelineVersion, 3);
    assert.equal(replaceStep.params.maskPipelineVersion, 3);
    assert.equal(legacyStep.params.maskMode, undefined);
    assert.equal(replaceStep.params.maskMode, undefined);
  });

  await ok("蒙版羽化宽度透传到执行参数，缺省回退自适应", () => {
    const maskNode = (featherRadius?: number): FlowNode => ({
      id: "mask-feather",
      type: "mask-redraw",
      data: {
        kind: "mask-redraw",
        label: "蒙版重绘",
        status: "idle",
        prompt: "替换胸前图案",
        mask: MASK_DATA_URL,
        maskSourceRef: MASK_SOURCE_DATA_URL,
        outputImages: [],
        operationMode: "mask-edit",
        operationModeNeedsConfirmation: false,
        modelId: MASK_REDRAW_MODEL_ID,
        modelOptions: {},
        ...(featherRadius !== undefined ? { featherRadius } : {}),
      },
    });
    assert.equal(buildExecutionPlan([maskNode(24)], []).steps[0].params.featherRadius, 24);
    assert.equal(buildExecutionPlan([maskNode(0)], []).steps[0].params.featherRadius, 0);
    assert.equal(buildExecutionPlan([maskNode()], []).steps[0].params.featherRadius, undefined);
  });

  await ok("风格迁移：双参考图按人物、场景的连线顺序传入", () => {
    const transfer = aiNode("transfer", "ai-modify", "edit");
    const plan = buildExecutionPlan(
      [
        imgNode("subject", "/api/files/person.png"),
        imgNode("scene", "/api/files/scene.png"),
        transfer,
      ],
      [edge("subject", "transfer"), edge("scene", "transfer")],
    );
    const step = plan.steps.find((item) => item.nodeId === "transfer")!;
    assert.deepStrictEqual(step.upstream, [
      {
        nodeId: "subject",
        images: ["/api/files/person.png"],
      },
      {
        nodeId: "scene",
        images: ["/api/files/scene.png"],
      },
    ]);
    assert.deepStrictEqual(step.inputImages, [
      "/api/files/person.png",
      "/api/files/scene.png",
    ]);
  });

  await ok("edge 按实际多输出展开，保留来源与连线顺序", () => {
    const garment = aiNode(
      "garment-output",
      "ai-modify",
      "edit",
      ["/api/files/top-front.png", "/api/files/top-back.png"],
    );
    const identity = imgNode("identity-source", "/api/files/person.png");
    const target = aiNode("edge-role-target", "ai-modify", "edit");
    const orderedEdges = [
      edge(garment.id, target.id),
      edge(identity.id, target.id),
    ];
    const step = buildExecutionPlan([garment, identity, target], orderedEdges, {
      onlyNodeId: target.id,
      includeDownstream: false,
    }).steps[0];

    assert.deepStrictEqual(step.inputImages, [
      "/api/files/top-front.png",
      "/api/files/top-back.png",
      "/api/files/person.png",
    ]);
    assert.deepStrictEqual(step.inputReferences, [
      {
        imageRef: "/api/files/top-front.png",
        sourceNodeId: "garment-output",
        order: 0,
      },
      {
        imageRef: "/api/files/top-back.png",
        sourceNodeId: "garment-output",
        order: 1,
      },
      {
        imageRef: "/api/files/person.png",
        sourceNodeId: "identity-source",
        order: 2,
      },
    ]);

    const reordered = buildExecutionPlan(
      [garment, identity, target],
      [orderedEdges[1], orderedEdges[0]],
      { onlyNodeId: target.id, includeDownstream: false },
    ).steps[0];
    assert.deepStrictEqual(reordered.inputReferences?.map(({ imageRef }) => ({ imageRef })), [
      { imageRef: "/api/files/person.png" },
      { imageRef: "/api/files/top-front.png" },
      { imageRef: "/api/files/top-back.png" },
    ]);
  });

  await ok("生成上游的当前输出仍按连线顺序进入下游 inputReferences", () => {
    const generated = aiNode("generated", "ai-modify", "edit", ["/api/files/generated.png"]);
    const target = aiNode("target", "ai-modify", "edit");
    const plan = buildExecutionPlan(
      [generated, target],
      [{ ...edge(generated.id, target.id), sourceHandle: "images", targetHandle: "reference" }],
      { onlyNodeId: target.id, includeDownstream: false },
    );
    assert.deepEqual(plan.steps[0].inputReferences, [{
      imageRef: "/api/files/generated.png",
      sourceNodeId: "generated",
      order: 0,
    }]);
  });

  await ok("同一来源连到不同目标时分别采用各自连线顺序", () => {
    const source = imgNode("shared-source", "/api/files/shared.png");
    const first = aiNode("first-target", "ai-modify", "edit");
    const second = aiNode("second-target", "ai-modify", "edit");
    const plan = buildExecutionPlan(
      [source, first, second],
      [
        edge(source.id, first.id),
        edge(source.id, second.id),
      ],
    );
    assert.equal(plan.steps.find((step) => step.nodeId === first.id)?.inputReferences?.[0]?.imageRef, "/api/files/shared.png");
    assert.equal(plan.steps.find((step) => step.nodeId === second.id)?.inputReferences?.[0]?.imageRef, "/api/files/shared.png");
  });

  await ok("带提示词的 AI 节点最多接受 8 张参考图", () => {
    const inputs = Array.from({ length: 9 }, (_, index) =>
      imgNode(`ref${index + 1}`, `/api/files/ref${index + 1}.png`),
    );
    const transfer = aiNode("transfer", "ai-modify", "edit");
    const eightEdges = inputs.slice(0, 8).map((node) => edge(node.id, "transfer"));
    const valid = buildExecutionPlan([...inputs.slice(0, 8), transfer], eightEdges, {
      onlyNodeId: "transfer",
      includeDownstream: false,
    });
    assert.doesNotThrow(() => assertPlanInputs(valid, eightEdges));

    const nineEdges = inputs.map((node) => edge(node.id, "transfer"));
    const invalid = buildExecutionPlan([...inputs, transfer], nineEdges, {
      onlyNodeId: "transfer",
      includeDownstream: false,
    });
    assert.throws(() => assertPlanInputs(invalid, nineEdges), /at most 8 reference images/);
  });

  await ok("局部修改在入队前拒绝会占满引导图名额的 8 张用户参考图", () => {
    const references = Array.from({ length: 8 }, (_, index) => `/api/files/mask-ref-${index + 1}.png`);
    const upstream = aiNode("mask-upstream", "ai-modify", "edit", references);
    const maskNode: FlowNode = {
      id: "mask-target",
      type: "mask-redraw",
      data: {
        kind: "mask-redraw",
        label: "局部修改",
        status: "idle",
        prompt: "修改衣袖",
        mask: MASK_DATA_URL,
        maskSourceRef: references[0],
        outputImages: [],
        operationMode: "mask-edit",
        operationModeNeedsConfirmation: false,
        modelId: MASK_REDRAW_MODEL_ID,
        modelOptions: {},
      } as WorkflowNodeData as FlowNode["data"],
    };
    const maskEdge = edge(upstream.id, maskNode.id);
    const plan = buildExecutionPlan([upstream, maskNode], [maskEdge], {
      onlyNodeId: maskNode.id,
      includeDownstream: false,
    });

    assert.throws(
      () => assertPlanInputs(plan, [maskEdge]),
      /at most 7 user reference images/,
    );
  });

  await ok("环检测：A↔B 抛 DagError", () => {
    assert.throws(
      () => buildExecutionPlan(
        [aiNode("a", "ai-modify", "edit"), aiNode("b", "ai-modify", "edit")],
        [edge("a", "b"), edge("b", "a")],
      ),
      DagError,
    );
  });

  await ok("单节点重跑：范围外上游保留快照回退", () => {
    const plan = buildExecutionPlan(
      [
        aiNode("render", "sketch-to-render", "edit", ["/api/files/rendered.png"]),
        aiNode("modify", "ai-modify", "edit"),
      ],
      [edge("render", "modify")],
      { onlyNodeId: "modify" },
    );
    assert.strictEqual(plan.steps.length, 1);
    const modify = plan.steps[0];
    assert.deepStrictEqual(modify.upstream, [
      {
        nodeId: "render",
        images: ["/api/files/rendered.png"],
      },
    ]);
  });

  await ok("画布单节点执行：显式关闭下游扩展，避免额外 AI 调用", () => {
    const plan = buildExecutionPlan(
      [
        imgNode("input", "/api/files/seed.png"),
        aiNode("render", "sketch-to-render", "edit"),
        aiNode("modify", "ai-modify", "edit"),
        resultNode("out"),
      ],
      [edge("input", "render"), edge("render", "modify"), edge("modify", "out")],
      { onlyNodeId: "render", includeDownstream: false },
    );
    assert.deepStrictEqual(plan.steps.map((step) => step.nodeId), ["render"]);
    assert.deepStrictEqual(plan.steps[0].upstream, [
      {
        nodeId: "input",
        images: ["/api/files/seed.png"],
      },
    ]);
  });

  await ok("面料配色计划：保留颜色数组交给后端一色一图", () => {
    const recolor: FlowNode = {
      id: "recolor",
      type: "fabric-recolor",
      data: {
        kind: "fabric-recolor",
        label: "配色",
        status: "idle",
        colors: ["#112233", "#AABBCC"],
        prompt: "",
        operationMode: "edit",
        operationModeNeedsConfirmation: false,
        modelId: "gpt-image-2.5-flare-vip",
        modelOptions: { size: "auto" },
        outputImages: [],
      },
    };
    const plan = buildExecutionPlan([imgNode("input", "/api/files/seed.png"), recolor], [edge("input", "recolor")]);
    assert.deepStrictEqual(plan.steps.find((step) => step.nodeId === "recolor")?.params.colors, [
      "#112233",
      "#AABBCC",
    ]);
    assert.doesNotThrow(() => assertPlanInputs(plan, [edge("input", "recolor")]));
  });

  await ok("付费节点输入门禁：拒绝空输入与只有 fabric 的配色计划", () => {
    const modifyPlan = buildExecutionPlan([aiNode("modify", "ai-modify", "edit")], [], {
      onlyNodeId: "modify",
      includeDownstream: false,
    });
    assert.throws(() => assertPlanInputs(modifyPlan, []), /requires an upstream image/);

    const fabricOnly: FlowNode = {
      id: "recolor",
      type: "fabric-recolor",
      data: {
        kind: "fabric-recolor",
        label: "配色",
        status: "idle",
        colors: ["#112233"],
        prompt: "",
        operationMode: "edit",
        operationModeNeedsConfirmation: false,
        modelId: "gpt-image-2.5-flare-vip",
        modelOptions: { size: "auto" },
        outputImages: [],
      },
    };
    const fabricEdges = [{ ...edge("fabric", "recolor"), targetHandle: "fabric" }];
    const fabricPlan = buildExecutionPlan(
      [imgNode("fabric", "/api/files/seed.png"), fabricOnly],
      fabricEdges,
      { onlyNodeId: "recolor", includeDownstream: false },
    );
    assert.throws(() => assertPlanInputs(fabricPlan, fabricEdges), /requires a garment image/);
  });

  await ok("文生图：有提示词时允许生成节点无图片输入", () => {
    const plan = buildExecutionPlan([aiNode("generate", "sketch-to-render", "generate")], []);
    assert.doesNotThrow(() => assertPlanInputs(plan, []));
    const step = plan.steps[0];
    assert.equal(step.params.prompt, "test");
    assert.deepStrictEqual(step.inputImages, []);
  });

  await ok("DAG 对 modelOptions 原样严格校验，不静默删除跨模型或运行时字段", () => {
    const vipAspectField = aiNode("vip-aspect-field", "ai-modify", "edit");
    vipAspectField.data.modelOptions = { size: "2048x2048", aspectRatio: "3:4" } as never;
    assert.throws(
      () => buildExecutionPlan([vipAspectField], []),
      /aspectRatio/,
    );

    const vipGeminiField = aiNode("vip-gemini-field", "ai-modify", "edit");
    vipGeminiField.data.modelOptions = { size: "2048x2048", imageSize: "2K" } as never;
    assert.throws(
      () => buildExecutionPlan([vipGeminiField], []),
      /imageSize/,
    );

    const mask = {
      id: "mask-runtime-size",
      type: "mask-redraw",
      data: {
        kind: "mask-redraw",
        label: "蒙版节点",
        status: "idle",
        prompt: "改色",
        mask: MASK_DATA_URL,
        maskSourceRef: MASK_SOURCE_DATA_URL,
        outputImages: [],
        operationMode: "mask-edit",
        operationModeNeedsConfirmation: false,
        modelId: MASK_REDRAW_MODEL_ID,
        modelOptions: { size: "816x816" },
      },
    } as unknown as FlowNode;
    assert.throws(
      () => buildExecutionPlan([mask], []),
      /empty modelOptions/,
    );
  });

  await ok("runner 草图效果图：有参考图走 edit 并按批量返回", async () => {
    const prompt = "保留轮廓，渲染成真丝礼服";
    const { calls, providerIds, result } = await runRecordedAiStep(
      "sketch-to-render",
      { prompt, aspectRatio: "3:4", batchSize: 2, operationMode: "edit" },
      [SEED_DATA_URL],
    );
    assert.deepStrictEqual(providerIds, ["gpt-image-2.5-flare-vip"]);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, "edit");
    assert.strictEqual(calls[0].request.operationMode, "edit");
    assert.deepStrictEqual(calls[0].request.referenceImages, [SEED_DATA_URL]);
    const expectedPrompt = renderProviderPrompt({
      nodeKind: "sketch-to-render",
      modelId: "gpt-image-2.5-flare-vip",
      operationMode: "edit",
      taskPrompt: prompt,
      references: [{}],
    });
    assert.strictEqual(calls[0].request.prompt, expectedPrompt);
    assert.strictEqual(calls[0].request.aspectRatio, "3:4");
    assert.strictEqual(calls[0].request.batchSize, 2);
    assert.strictEqual(result.images.length, 2);
    assert.deepStrictEqual(result.prompts, [expectedPrompt, expectedPrompt]);
    assert.strictEqual(result.providerRequests, 1);
  });

  await ok("runner 文生图：无参考图走 generate 并保留数量", async () => {
    const prompt = "生成一组沙漠金属感礼服";
    const { calls, providerIds, result } = await runRecordedAiStep(
      "sketch-to-render",
      { prompt, aspectRatio: "16:9", batchSize: 2, operationMode: "generate" },
      [],
    );
    assert.deepStrictEqual(providerIds, ["gpt-image-2.5-flare-vip"]);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, "generate");
    assert.strictEqual(calls[0].request.operationMode, "generate");
    assert.strictEqual(calls[0].request.referenceImages, undefined);
    assert.strictEqual(calls[0].request.prompt, prompt);
    assert.strictEqual(calls[0].request.batchSize, 2);
    assert.strictEqual(result.images.length, 2);
    assert.strictEqual(result.providerRequests, 1);
  });

  await ok("runner AI 改款：多参考图顺序传入 edit 并生成用户数量", async () => {
    const prompt = "改成娃娃领和短袖";
    const { calls, providerIds, result } = await runRecordedAiStep(
      "ai-modify",
      { prompt, aspectRatio: "1:1", batchSize: 4, operationMode: "edit" },
      [SEED_DATA_URL, SECOND_DATA_URL],
    );
    assert.deepStrictEqual(providerIds, ["gpt-image-2.5-flare-vip"]);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, "edit");
    assert.deepStrictEqual(calls[0].request.referenceImages, [SEED_DATA_URL, SECOND_DATA_URL]);
    assert.strictEqual(
      calls[0].request.prompt,
      renderProviderPrompt({
        nodeKind: "ai-modify",
        modelId: "gpt-image-2.5-flare-vip",
        operationMode: "edit",
        taskPrompt: prompt,
        references: [{}, {}],
      }),
    );
    assert.strictEqual(calls[0].request.batchSize, 4);
    assert.strictEqual(result.images.length, 4);
    assert.strictEqual(result.prompts?.length, 4);
    assert.strictEqual(result.providerRequests, 1);
  });

  await ok("runner 请求按 edge 展开的逐图顺序写入 Provider references", async () => {
    const referenceSources: ReferenceImageSource[] = [
      {
        imageRef: SEED_DATA_URL,
        order: 0,
        sourceNodeId: "multi-output-source",
      },
      {
        imageRef: SECOND_DATA_URL,
        order: 1,
        sourceNodeId: "multi-output-source",
      },
    ];
    const { calls, result } = await runRecordedAiStep(
      "ai-modify",
      { prompt: "把两张视图作为同一件上衣", aspectRatio: "1:1", batchSize: 1, operationMode: "edit" },
      [SEED_DATA_URL, SECOND_DATA_URL],
      undefined,
      referenceSources,
    );

    assert.equal(calls.length, 1);
    assert.deepStrictEqual(calls[0].request.references?.map((reference) => ({
      order: reference.order,
      sourceNodeId: reference.sourceNodeId,
    })), [
      {
        order: 0,
        sourceNodeId: "multi-output-source",
      },
      {
        order: 1,
        sourceNodeId: "multi-output-source",
      },
    ]);
    assert.match(calls[0].request.references?.[0]?.assetSha256 ?? "", /^[a-f0-9]{64}$/);
    assert.deepStrictEqual(result.references?.map(({ order }) => ({ order })), [
      { order: 0 },
      { order: 1 },
    ]);
  });

  await ok("runner 面料配色：一色一次 edit，成衣与面料参考均传入", async () => {
    const colors = ["#DE2910", "#002FA7"];
    const { calls, providerIds, result } = await runRecordedAiStep(
      "fabric-recolor",
      { colors, fabricImageUrl: SECOND_DATA_URL, operationMode: "edit" },
      [SEED_DATA_URL],
      undefined,
      [{
        imageRef: SEED_DATA_URL,
        order: 0,
        sourceNodeId: "garment-source",
      }],
    );
    assert.deepStrictEqual(providerIds, ["gpt-image-2.5-flare-vip"]);
    assert.strictEqual(calls.length, colors.length);
    assert.ok(calls.every((call) => call.method === "edit"));
    assert.ok(calls.every((call) => call.request.batchSize === 1));
    for (const call of calls) {
      assert.deepStrictEqual(call.request.referenceImages, [SEED_DATA_URL, SECOND_DATA_URL]);
      assert.deepStrictEqual(
        call.request.references?.map(({ dataUrl, order, sourceNodeId }) => ({
          dataUrl, order, sourceNodeId,
        })),
        [
          {
            dataUrl: SEED_DATA_URL,
            order: 0,
            sourceNodeId: "garment-source",
          },
          {
            dataUrl: SECOND_DATA_URL,
            order: 1,
            sourceNodeId: "runner-fabric-recolor",
          },
        ],
      );
      assert.deepStrictEqual(
        call.request.referenceImages,
        call.request.references?.map((reference) => reference.dataUrl),
      );
    }
    assert.match(calls[0].request.prompt, /中国红\(#DE2910\)/);
    assert.match(calls[1].request.prompt, /克莱因蓝\(#002FA7\)/);
    assert.strictEqual(result.images.length, colors.length);
    assert.deepStrictEqual(result.prompts, calls.map((call) => call.request.prompt));
    assert.strictEqual(result.providerRequests, colors.length);
  });

  await ok("runner 面料配色：损坏持久化顺序在图片解析和 Provider 前失败关闭", async () => {
    let providerCalls = 0;
    const provider: AIProvider = {
      id: "gpt-image-2.5-flare-vip",
      async generate() {
        providerCalls += 1;
        return { images: [SEED_DATA_URL], model: "runner-stub-model" };
      },
      async edit() {
        providerCalls += 1;
        return { images: [SEED_DATA_URL], model: "runner-stub-model" };
      },
    };
    const damagedSources: ReferenceImageSource[] = [{
      imageRef: "/api/files/must-not-be-resolved.png",
      order: 1,
      sourceNodeId: "damaged-garment",
    }];
    await assert.rejects(
      () => executeStep({
        nodeId: "runner-fabric-recolor-damaged",
        kind: "fabric-recolor",
        inputImages: ["/api/files/must-not-be-resolved.png"],
        inputReferences: damagedSources,
        params: {
          modelId: "gpt-image-2.5-flare-vip",
          operationMode: "edit",
          colors: ["#DE2910"],
          fabricImageUrl: SECOND_DATA_URL,
        },
      }, ["/api/files/must-not-be-resolved.png"], () => provider, {
        referenceSources: damagedSources,
      }),
      /referenceSources\[0\]\.order must be a safe integer equal to 0/,
    );
    assert.strictEqual(providerCalls, 0);
  });

  await ok("runner 高清放大：单参考图走 edit，固定单图并传递 2K", async () => {
    const { calls, providerIds, result } = await runRecordedAiStep(
      "upscale",
      { imageSize: "2K", operationMode: "edit" },
      [SEED_DATA_URL],
    );
    assert.deepStrictEqual(providerIds, ["gpt-image-2.5-flare-vip"]);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, "edit");
    assert.deepStrictEqual(calls[0].request.referenceImages, [SEED_DATA_URL]);
    assert.match(calls[0].request.prompt, /放大为超高清版本/);
    assert.strictEqual(calls[0].request.imageSize, "2K");
    assert.strictEqual(calls[0].request.batchSize, 1);
    assert.strictEqual(result.images.length, 1);
    assert.strictEqual(result.providerRequests, 1);
  });

  await ok("runner 印花提取：参考图走 edit，合并固定与用户提示词", async () => {
    const extra = "只要胸前的主图案";
    const { calls, providerIds, result } = await runRecordedAiStep(
      "print-extract",
      { prompt: extra, operationMode: "edit" },
      [SEED_DATA_URL],
    );
    assert.deepStrictEqual(providerIds, ["gpt-image-2.5-flare-vip"]);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, "edit");
    assert.deepStrictEqual(calls[0].request.referenceImages, [SEED_DATA_URL]);
    assert.match(calls[0].request.prompt, /提取这件衣服上的印花图案/);
    assert.match(calls[0].request.prompt, new RegExp(`补充要求：${extra}`));
    assert.strictEqual(calls[0].request.batchSize, 1);
    assert.strictEqual(result.images.length, 1);
    assert.strictEqual(result.providerRequests, 1);
  });

  await ok("runner 严格使用节点保存的模型与模型原生参数", async () => {
    const modelOptions = { width: 1024, height: 768, outputFormat: "png" };
    const { calls, providerIds } = await runRecordedAiStep(
      "print-extract",
      { prompt: "提取主图案", modelId: "flux-2-pro", modelOptions, operationMode: "edit" },
      [SEED_DATA_URL],
    );
    assert.deepStrictEqual(providerIds, ["flux-2-pro"]);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, "edit");
    assert.deepStrictEqual(calls[0].request.modelOptions, modelOptions);
  });

  await ok("runner 缺失模型时直接阻断，不静默回退到默认模型", async () => {
    let providerCalls = 0;
    await assert.rejects(
      () => executeStep({
        nodeId: "missing-model",
        kind: "print-extract",
        inputImages: [SEED_DATA_URL],
        params: { prompt: "提取主图案", operationMode: "edit" },
      }, [SEED_DATA_URL], () => {
        providerCalls += 1;
        throw new Error("provider must not be resolved");
      }),
      /must select an explicit supported image model/,
    );
    assert.strictEqual(providerCalls, 0);
  });

  await ok("runner 印花裂变：参考图走 edit，按 count 返回且合并提示词", async () => {
    const extra = "转为水墨风格";
    const { calls, providerIds, result } = await runRecordedAiStep(
      "print-mutate",
      { prompt: extra, count: 3, operationMode: "edit" },
      [SEED_DATA_URL],
    );
    assert.deepStrictEqual(providerIds, ["gpt-image-2.5-flare-vip"]);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, "edit");
    assert.deepStrictEqual(calls[0].request.referenceImages, [SEED_DATA_URL]);
    assert.match(calls[0].request.prompt, /生成风格一致的新变体/);
    assert.match(calls[0].request.prompt, new RegExp(`补充要求：${extra}`));
    assert.strictEqual(calls[0].request.batchSize, 3);
    assert.strictEqual(result.images.length, 3);
    assert.strictEqual(result.prompts?.length, 3);
    assert.strictEqual(result.providerRequests, 1);
  });

  await ok("runner 统一局部修改：整图比例、核心非裁切与连续融合贯穿完整链路", async () => {
    const { calls, providerIds, result } = await runRecordedAiStep(
      "mask-redraw",
      {
        prompt: "在胸前添加红色刺绣并替换旧标识",
        operationMode: "mask-edit",
        mask: MASK_DATA_URL,
        maskSourceRef: MASK_SOURCE_DATA_URL,
        modelId: MASK_REDRAW_MODEL_ID,
        modelOptions: {},
      },
      [MASK_SOURCE_DATA_URL],
      [REPLACE_PROVIDER_DATA_URL],
    );
    assert.deepStrictEqual(providerIds, [MASK_REDRAW_MODEL_ID]);
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].method, "edit");
    assert.strictEqual((calls[0].request as unknown as Record<string, unknown>).maskMode, undefined);
    assert.strictEqual(calls[0].request.referenceImages?.length, 2);
    assert.strictEqual(calls[0].request.referenceImages?.[0], MASK_SOURCE_DATA_URL);
    assert.notStrictEqual(calls[0].request.referenceImages?.[1], MASK_SOURCE_DATA_URL);
    assert.match(calls[0].request.prompt, /参考图2[^\n]{0,80}区域引导图/);
    assert.match(calls[0].request.prompt, /红色[^\n]{0,40}修改核心/);
    assert.match(calls[0].request.prompt, /金色[^\n]{0,60}缓冲区/);
    assert.match(calls[0].request.prompt, /(整幅|完整)画面[^\n]{0,80}(构图|比例)/);
    assert.match(calls[0].request.prompt, /添加、替换、删除或调整/);
    assert.match(calls[0].request.prompt, /冲突的旧对象、旧包带、旧颜色/);
    assert.match(calls[0].request.prompt, /完整重建被遮挡的底层服装或背景/);
    assert.match(calls[0].request.prompt, /禁止用模糊、暗斑、色块、漂浮投影或半透明残影/);
    assert.match(calls[0].request.prompt, /真实接触并符合整幅画面光源方向的阴影/);
    assert.match(calls[0].request.prompt, /PNG 完整最终图片/);
    assert.deepStrictEqual(calls[0].request.modelOptions, { size: "816x816" });
    assert.notStrictEqual(calls[0].request.mask, MASK_DATA_URL, "模型必须收到扩展后的安全区蒙版");
    assert.strictEqual(result.images.length, 1);
    const decoded = await sharp(Buffer.from(result.images[0].split(",")[1], "base64"))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const backgroundOffset = (64 * decoded.info.width + 10) * decoded.info.channels;
    assert.deepStrictEqual(
      Array.from(decoded.data.subarray(backgroundOffset, backgroundOffset + 3)),
      [35, 92, 165],
      "融合区外必须逐像素保持原色",
    );
  });

  await ok("runner 蒙版多参考图：保留用户图号并把区域引导图追加到最后", async () => {
    const { calls } = await runRecordedAiStep(
      "mask-redraw",
      {
        prompt: "将选中区域修改为图2的手提包",
        operationMode: "mask-edit",
        mask: MASK_DATA_URL,
        maskSourceRef: MASK_SOURCE_DATA_URL,
        modelId: MASK_REDRAW_MODEL_ID,
        modelOptions: {},
      },
      [MASK_SOURCE_DATA_URL, SECOND_DATA_URL],
      [REPLACE_PROVIDER_DATA_URL],
    );
    const references = calls[0].request.referenceImages ?? [];
    assert.strictEqual(references.length, 3);
    assert.strictEqual(references[0], MASK_SOURCE_DATA_URL);
    assert.strictEqual(references[1], SECOND_DATA_URL, "用户的图2必须原样传给模型");
    assert.notStrictEqual(references[2], SECOND_DATA_URL, "区域引导图必须追加到所有用户参考图之后");
    assert.match(calls[0].request.prompt, /参考图2是用户提供的目标内容参考图/);
    assert.match(calls[0].request.prompt, /最后一张参考图（参考图3）才是区域引导图/);
    assert.doesNotMatch(calls[0].request.prompt, /参考图2是区域引导图/);
  });

  await ok("runner 蒙版参考图上限：为内部区域引导图预留一个模型名额", async () => {
    await assert.rejects(
      () => runRecordedAiStep(
        "mask-redraw",
        {
          prompt: "替换选中的服装细节",
          operationMode: "mask-edit",
          mask: MASK_DATA_URL,
          maskSourceRef: MASK_SOURCE_DATA_URL,
          modelId: MASK_REDRAW_MODEL_ID,
          modelOptions: {},
        },
        Array.from({ length: 8 }, (_, index) => index === 0 ? MASK_SOURCE_DATA_URL : SECOND_DATA_URL),
        [REPLACE_PROVIDER_DATA_URL],
      ),
      /accepts at most 7 user reference images/,
    );
  });


  console.log(`\n通过 ${passed} 项`);
}

void main().finally(() => fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true }));
