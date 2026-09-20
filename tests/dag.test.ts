/**
 * DAG 三分支回归测试（R-53 P2-b，纯逻辑，不调真实 API/DB）。
 * 覆盖：extract 三分支（image 输出 outputImages / text·video 无图片输出）、
 * text 正文沿 text 边传播（inputTexts）、INV-2（上游 text 全空拒绝）、环检测。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/dag.test.ts
 */
import assert from "node:assert/strict";
import {
  buildExecutionPlan,
  assertPlanInputs,
  assertPromptRunAdmissions,
  PromptRunAdmissionError,
  DagError,
  type FlowNode,
  type FlowEdge,
} from "../server/engine/dag";
import type { WorkflowNodeData } from "../src/types/workflow";
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
  return {
    id,
    type: "text",
    data: { kind: "text", label: "提示词", status: "idle", text } as WorkflowNodeData,
  };
}

function imageNode(id: string, outputImages: string[] = []): FlowNode {
  return {
    id,
    type: "image",
    data: {
      kind: "image",
      label: "图片",
      status: "idle",
      aspectRatio: "3:4",
      batchSize: 1,
      outputImages,
      modelId: "gpt-image-2.5-flare-vip",
      promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
    } as WorkflowNodeData,
  };
}

const edge = (source: string, target: string, targetHandle = "prompt"): FlowEdge =>
  ({ source, target, targetHandle });

// R-78：variant 绑定是唯一事实源——parameterProfileId/postprocessVersion 由服务端
// 从已选变体推导，节点 data 不自描述（applyVariant 不写这两项）。下面构造一个
// 「选中变体但节点 data 不含 parameterProfileId/postprocessVersion」的真实 v7 节点。
const r78Variant = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "image",
  mode: "generate",
});
const r78Profile = getModelParameterProfile(r78Variant.parameterProfileId)!;
const r78Materialized = materializeModelParameterProfile(r78Profile);

function variantBoundImageNode(id: string): FlowNode {
  return {
    id,
    type: "image",
    data: {
      kind: "image",
      label: "图片",
      status: "idle",
      modelId: r78Variant.modelId,
      promptVariantId: r78Variant.variantId,
      promptFamilyId: r78Variant.familyId,
      contractHash: r78Variant.contractHash,
      evaluationVersion: r78Variant.evaluationVersion,
      // 故意不写 parameterProfileId / postprocessVersion（applyVariant 也不写），
      // 由 extractParams 从变体推导。
      aspectRatio: r78Materialized.aspectRatio,
      batchSize: r78Materialized.batchSize,
      modelOptions: r78Materialized.modelOptions,
      outputImages: [],
    } as WorkflowNodeData,
  };
}

function main() {
  console.log("DAG 三分支回归测试");

  ok("extract：image 节点输出 outputImages，text/video 无图片输出", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "你好"), imageNode("i1", ["/api/files/a.png"])],
      [edge("t1", "i1")],
    );
    const i1 = plan.steps.find((s) => s.nodeId === "i1")!;
    assert.deepStrictEqual(i1.inputImages, []);
    assert.deepStrictEqual(i1.upstream, [{ nodeId: "t1", images: [] }]);
  });

  ok("text 正文沿 text 边传播到 image 节点 params.inputTexts", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套连衣裙"), imageNode("i1")],
      [edge("t1", "i1")],
    );
    const i1 = plan.steps.find((s) => s.nodeId === "i1")!;
    assert.deepStrictEqual(i1.params.inputTexts, ["设计一套连衣裙"]);
  });

  ok("多 text 上游按边顺序拼接进 inputTexts", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "款式：连衣裙"), textNode("t2", "场景：浅灰背景"), imageNode("i1")],
      [edge("t1", "i1"), edge("t2", "i1")],
    );
    const i1 = plan.steps.find((s) => s.nodeId === "i1")!;
    assert.deepStrictEqual(i1.params.inputTexts, ["款式：连衣裙", "场景：浅灰背景"]);
  });

  ok("INV-2：上游 text 全空被 assertPlanInputs 拒绝", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "   "), imageNode("i1")],
      [edge("t1", "i1")],
    );
    assert.throws(
      () => assertPlanInputs(plan, [edge("t1", "i1")]),
      /还没有填写提示词/,
    );
  });

  ok("INV-2：至少一条上游 text 非空则通过", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "  "), textNode("t2", "有效正文"), imageNode("i1")],
      [edge("t1", "i1"), edge("t2", "i1")],
    );
    assert.doesNotThrow(() => assertPlanInputs(plan, [edge("t1", "i1"), edge("t2", "i1")]));
  });

  ok("环检测：A↔B 抛 DagError", () => {
    assert.throws(
      () => buildExecutionPlan(
        [imageNode("a"), imageNode("b")],
        [edge("a", "b", "reference"), edge("b", "a", "reference")],
      ),
      DagError,
    );
  });

  ok("局部重跑：onlyNodeId 只保留目标步骤", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "你好"), imageNode("i1"), imageNode("i2")],
      [edge("t1", "i1"), edge("i1", "i2", "reference")],
      { onlyNodeId: "i1", includeDownstream: false },
    );
    assert.deepStrictEqual(plan.steps.map((s) => s.nodeId), ["i1"]);
  });

  ok("R-78：选变体但节点 data 无 parameterProfileId/postprocessVersion，服务端从变体解析并放行", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代都市女装"), variantBoundImageNode("i1")],
      [edge("t1", "i1")],
    );
    const i1 = plan.steps.find((s) => s.nodeId === "i1")!;
    // extractParams 从变体推导，而非节点 data 回传（applyVariant 从不写这两项）。
    assert.equal(i1.params.parameterProfileId, r78Variant.parameterProfileId);
    assert.equal(i1.params.postprocessVersion, r78Profile.postprocess.version);
    assert.equal(i1.params.operationMode, r78Variant.mode);
    // 准予放行（unverified 变体需 evaluationRun 通道，与 prompt-run-admission 测试同义）。
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan, { evaluationRun: true }));
  });

  ok("R-78：错模型仍 binding-mismatch 拒绝（fail-closed 不弱化）", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代都市女装"), {
        id: "i1",
        type: "image",
        data: {
          ...variantBoundImageNode("i1").data,
          modelId: "flux-2-pro",
        } as WorkflowNodeData,
      }],
      [edge("t1", "i1")],
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
        id: "i1",
        type: "image",
        data: {
          kind: "image",
          label: "图片",
          status: "idle",
          modelId: "gemini-3.1-flash-image",
          aspectRatio: "3:4",
          batchSize: 1,
          outputImages: [],
        } as WorkflowNodeData,
      }],
      [edge("t1", "i1")],
    );
    assert.throws(
      () => assertPromptRunAdmissions(plan, { evaluationRun: true }),
      (error) => error instanceof PromptRunAdmissionError
        && error.decision.allowed === false
        && error.decision.code === "missing-binding",
      "未选变体（operationMode 缺失）必须在准入层以 missing-binding 拒绝",
    );
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
