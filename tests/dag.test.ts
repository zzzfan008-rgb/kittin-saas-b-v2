/**
 * DAG v8 执行计划回归测试（R-85，纯逻辑，不调真实 API/DB）。
 * 覆盖：只有生成节点是步骤、extractOutputImages（result-image → images）、
 * extractOutputVideos、text 正文沿 prompt 边传播、INV-2（上游 text 全空拒绝）、
 * 环检测、局部重跑、R-78 变体绑定解析。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/dag.test.ts
 */
import assert from "node:assert/strict";
import {
  buildExecutionPlan,
  assertPlanInputs,
  assertPromptRunAdmissions,
  extractOutputVideos,
  PromptRunAdmissionError,
  DagError,
  type FlowNode,
  type FlowEdge,
} from "../server/engine/dag";
import type { ExecutionPlan, WorkflowNodeData } from "../src/types/workflow";
import { requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "../src/types/modelParameterProfiles";

let passed = 0;
function ok(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function textNode(id: string, text: string): FlowNode {
  return { id, type: "text", data: { kind: "text", label: "提示词", status: "idle", text } as WorkflowNodeData };
}

function imageNode(id: string, outputImages: string[] = []): FlowNode {
  return { id, type: "image", data: { kind: "image", label: "图片", status: "idle", outputImages } as WorkflowNodeData };
}

function resultImageNode(id: string, images: string[]): FlowNode {
  return {
    id,
    type: "result-image",
    data: { kind: "result-image", label: "结果", status: "idle", images, sourceGeneratorId: "g1", runId: "run-1" } as WorkflowNodeData,
  };
}

function imageGeneratorNode(
  id: string,
  modelId = "gpt-image-2.5-flare-vip",
  promptVariantId = "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
): FlowNode {
  return {
    id,
    type: "image-generator",
    data: {
      kind: "image-generator", label: "生图", status: "idle",
      modelId, promptVariantId, aspectRatio: "3:4", batchSize: 1,
    } as WorkflowNodeData,
  };
}

const edge = (source: string, target: string, targetHandle = "prompt"): FlowEdge =>
  ({ source, target, targetHandle });

// R-78：variant 绑定是唯一事实源——parameterProfileId/postprocessVersion 由服务端从已选变体推导。
const r78Variant = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "image",
  mode: "generate",
});
const r78Profile = getModelParameterProfile(r78Variant.parameterProfileId)!;
const r78Materialized = materializeModelParameterProfile(r78Profile);

function variantBoundImageGeneratorNode(id: string): FlowNode {
  return {
    id,
    type: "image-generator",
    data: {
      kind: "image-generator",
      label: "生图",
      status: "idle",
      modelId: r78Variant.modelId,
      promptVariantId: r78Variant.variantId,
      promptFamilyId: r78Variant.familyId,
      contractHash: r78Variant.contractHash,
      evaluationVersion: r78Variant.evaluationVersion,
      aspectRatio: r78Materialized.aspectRatio,
      batchSize: r78Materialized.batchSize,
      modelOptions: r78Materialized.modelOptions,
    } as WorkflowNodeData,
  };
}

// #62 见证测试用的 gpt-image 变体（与真实 generate 侧 project 同一变体）
const w62Variant = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "generate",
});
const w62Profile = getModelParameterProfile(w62Variant.parameterProfileId)!;
const w62Materialized = materializeModelParameterProfile(w62Profile);

/**
 * 真实 project flow 的 image-generator 节点形态：只携带 7 个 key
 * （kind/label/modelId/promptVariantId/aspectRatio/batchSize/status），
 * 3 个身份字段（promptFamilyId/contractHash/evaluationVersion）由服务端从变体注册表派生。
 */
function w62RealFlowImageGeneratorNode(id: string): FlowNode {
  return {
    id,
    type: "image-generator",
    data: {
      kind: "image-generator",
      label: "生图",
      status: "idle",
      modelId: w62Variant.modelId,
      promptVariantId: w62Variant.variantId,
      aspectRatio: w62Materialized.aspectRatio,
      batchSize: w62Materialized.batchSize,
      modelOptions: w62Materialized.modelOptions,
    } as WorkflowNodeData,
  };
}

function main() {
  console.log("DAG v8 执行计划回归测试");

  ok("只有生成节点是步骤；text/image 输入节点不是步骤", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "你好"), imageNode("i1", ["/api/files/a.png"]), imageGeneratorNode("g1")],
      [edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    assert.deepStrictEqual(plan.steps.map((s) => s.nodeId), ["g1"]);
  });

  ok("extract：result-image → images 作为下游 generator 的 reference 输入", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "你好"), imageGeneratorNode("g1"), resultImageNode("r1", ["/api/files/r.png"]), imageGeneratorNode("g2")],
      [edge("t1", "g1"), edge("t1", "g2"), edge("r1", "g2", "reference")],
    );
    const g2 = plan.steps.find((s) => s.nodeId === "g2")!;
    assert.deepStrictEqual(g2.inputImages, ["/api/files/r.png"]);
    assert.deepStrictEqual(g2.inputReferences, [{ imageRef: "/api/files/r.png", sourceNodeId: "r1", order: 0 }]);
  });

  ok("text 正文沿 prompt 边传播到 generator 的 params.inputTexts", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套连衣裙"), imageGeneratorNode("g1")],
      [edge("t1", "g1")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.deepStrictEqual(g1.params.inputTexts, ["设计一套连衣裙"]);
  });

  ok("多 text 上游按边顺序拼接进 inputTexts", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "款式：连衣裙"), textNode("t2", "场景：浅灰背景"), imageGeneratorNode("g1")],
      [edge("t1", "g1"), edge("t2", "g1")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.deepStrictEqual(g1.params.inputTexts, ["款式：连衣裙", "场景：浅灰背景"]);
  });

  ok("extractOutputVideos：video → outputVideos、result-video → videos、其余 []", () => {
    assert.deepStrictEqual(
      extractOutputVideos({ kind: "video", label: "v", status: "idle", outputVideos: ["/api/files/v.mp4"] }),
      ["/api/files/v.mp4"],
    );
    assert.deepStrictEqual(
      extractOutputVideos({ kind: "result-video", label: "r", status: "idle", videos: ["/api/files/r.mp4"], sourceGeneratorId: "g", runId: "run" }),
      ["/api/files/r.mp4"],
    );
    assert.deepStrictEqual(
      extractOutputVideos({ kind: "image", label: "i", status: "idle", outputImages: ["/api/files/a.png"] }),
      [],
    );
  });

  ok("INV-2：上游 text 全空被 assertPlanInputs 拒绝", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "   "), imageGeneratorNode("g1")],
      [edge("t1", "g1")],
    );
    assert.throws(
      () => assertPlanInputs(plan, [edge("t1", "g1")]),
      /还没有填写提示词/,
    );
  });

  ok("环检测：A↔B 抛 DagError", () => {
    assert.throws(
      () => buildExecutionPlan(
        [imageGeneratorNode("a"), imageGeneratorNode("b")],
        [edge("a", "b", "reference"), edge("b", "a", "reference")],
      ),
      DagError,
    );
  });

  ok("局部重跑：onlyNodeId 只保留目标生成步骤", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "你好"), imageGeneratorNode("g1"), imageGeneratorNode("g2")],
      [edge("t1", "g1"), edge("t1", "g2")],
      { onlyNodeId: "g1", includeDownstream: false },
    );
    assert.deepStrictEqual(plan.steps.map((s) => s.nodeId), ["g1"]);
  });

  ok("R-78：image-generator 选变体但节点 data 无 parameterProfileId/postprocessVersion，服务端从变体解析并放行", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代都市女装"), variantBoundImageGeneratorNode("g1")],
      [edge("t1", "g1")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.equal(g1.params.parameterProfileId, r78Variant.parameterProfileId);
    assert.equal(g1.params.postprocessVersion, r78Profile.postprocess.version);
    assert.equal(g1.params.operationMode, r78Variant.mode);
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan, { evaluationRun: true }));
  });

  ok("R-78：错模型仍 binding-mismatch 拒绝（fail-closed 不弱化）", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代都市女装"), {
        id: "g1",
        type: "image-generator",
        data: { ...variantBoundImageGeneratorNode("g1").data, modelId: "flux-2-pro" } as WorkflowNodeData,
      }],
      [edge("t1", "g1")],
    );
    assert.throws(
      () => assertPromptRunAdmissions(plan, { evaluationRun: true }),
      (error) => error instanceof PromptRunAdmissionError && error.decision.code === "binding-mismatch",
      "模型与变体绑定不一致必须仍在 binding 关拒绝",
    );
  });

  ok("R-78/P2-b：未选变体仍 fail-closed 拒绝（missing-binding）", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代都市女装"), {
        id: "g1",
        type: "image-generator",
        data: {
          kind: "image-generator", label: "生图", status: "idle",
          modelId: "gemini-3.1-flash-image", aspectRatio: "3:4", batchSize: 1,
        } as WorkflowNodeData,
      }],
      [edge("t1", "g1")],
    );
    assert.throws(
      () => assertPromptRunAdmissions(plan, { evaluationRun: true }),
      (error) => error instanceof PromptRunAdmissionError
        && error.decision.allowed === false
        && error.decision.code === "missing-binding",
      "未选变体（operationMode 缺失）必须在准入层以 missing-binding 拒绝",
    );
  });

  // ---------- #62 envelope authority witnesses (62-envelope-authority-ruling.md) ----------

  ok("回归见证：image-generator 步骤必须携带 promptVariantId/aspectRatio/batchSize/modelOptions + 3 个注册表派生字段", () => {
    // feaa817 曾整块重写 extractParams 的 image-generator return，误删 4 行
    // （aspectRatio/batchSize/modelOptions/promptVariantId）→ promptVariantId 不进
    // step.params → 准入闸 missing-binding → generate 侧真实路径全挂。
    // tsc 看不出（这些字段在类型里可选），只有这条断言能拦住。
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代都市女装"), w62RealFlowImageGeneratorNode("g1")],
      [edge("t1", "g1")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.equal(
      g1.params.promptVariantId,
      w62Variant.variantId,
      "extractParams 必须把 data.promptVariantId 放进 step.params（删掉即回归）",
    );
    assert.equal(g1.params.aspectRatio, w62Materialized.aspectRatio);
    assert.equal(g1.params.batchSize, w62Materialized.batchSize);
    assert.deepStrictEqual(g1.params.modelOptions, w62Materialized.modelOptions);
    // 3 字段来自 variant 注册表（dag.ts:323-325），不是 data.*
    assert.equal(g1.params.promptFamilyId, w62Variant.familyId);
    assert.equal(g1.params.contractHash, w62Variant.contractHash);
    assert.equal(g1.params.evaluationVersion, w62Variant.evaluationVersion);
    assert.equal(g1.params.postprocessVersion, w62Profile.postprocess.version);
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan, { evaluationRun: true }));
  });

  ok("变异验收：从 step.params 删 promptVariantId → 准入必须红（missing-binding）", () => {
    // 模拟 feaa817 的缺陷形态：extractParams 不再输出 promptVariantId。
    // 若准入闸没有拦住，说明这道闸被弱化——必须立刻红。
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代都市女装"), w62RealFlowImageGeneratorNode("g1")],
      [edge("t1", "g1")],
    );
    // 前置对照：未变异时必须通过准入，否则这条变异测试是假阳性
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan, { evaluationRun: true }));
    const mutated: ExecutionPlan = {
      steps: plan.steps.map((s) => ({
        ...s,
        params: Object.fromEntries(
          Object.entries(s.params).filter(([k]) => k !== "promptVariantId"),
        ),
      })),
    };
    assert.throws(
      () => assertPromptRunAdmissions(mutated, { evaluationRun: true }),
      (error) => error instanceof PromptRunAdmissionError
        && error.decision.allowed === false
        && error.decision.code === "missing-binding",
      "删除 promptVariantId 后准入必须以 missing-binding 拒绝，不得静默放行",
    );
  });

  ok("裁决 2 见证：节点 data 上的 contractHash/evaluationVersion/promptFamilyId 不得覆盖注册表值", () => {
    // 62-envelope-authority-ruling.md 裁决 2：dag.ts 原 :320-322 读 data.* 被删除，
    // 不得保留为 override —— 保留等于允许用户在画布上写契约哈希改变授权身份（违反 §4）。
    const forged: FlowNode = {
      id: "g1",
      type: "image-generator",
      data: {
        ...w62RealFlowImageGeneratorNode("g1").data,
        // 伪造值：若 extractParams 仍读 data.*，这些会覆盖注册表值 → 授权身份被篡改
        contractHash: "sha256:" + "f".repeat(64),
        evaluationVersion: "forged-eval-v99",
        promptFamilyId: "forged-family",
      } as WorkflowNodeData,
    };
    const plan = buildExecutionPlan([textNode("t1", "设计一套现代都市女装"), forged], [edge("t1", "g1")]);
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.equal(g1.params.contractHash, w62Variant.contractHash, "contractHash 必须来自注册表，不得被 data.* 覆盖");
    assert.equal(g1.params.evaluationVersion, w62Variant.evaluationVersion, "evaluationVersion 必须来自注册表");
    assert.equal(g1.params.promptFamilyId, w62Variant.familyId, "promptFamilyId 必须来自注册表");
    assert.notEqual(g1.params.contractHash, "sha256:" + "f".repeat(64));
    assert.notEqual(g1.params.evaluationVersion, "forged-eval-v99");
    assert.notEqual(g1.params.promptFamilyId, "forged-family");
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
