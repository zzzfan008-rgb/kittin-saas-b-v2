/**
 * DAG v9 执行计划回归测试（R-85，纯逻辑，不调真实 API/DB；64 Phase 1 参数自治）。
 * 覆盖：只有生成节点是步骤、extractOutputImages（result-image → images）、
 * extractOutputVideos、text 正文沿 prompt 边传播、INV-2（上游 text 全空拒绝）、
 * C4 extractParams（operationMode 归节点 data、variant 字段零残留）、
 * C5 操作兼容校验（edit/mask-edit 需参考图入边）、环检测、局部重跑。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/dag.test.ts
 */
import assert from "node:assert/strict";
import {
  buildExecutionPlan,
  assertPlanInputs,
  assertPromptRunAdmissions,
  extractOutputVideos,
  DagError,
  type FlowNode,
  type FlowEdge,
} from "../server/engine/dag";
import type { ExecutionPlan, WorkflowNodeData } from "../src/types/workflow";

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
  extra: Record<string, unknown> = {},
): FlowNode {
  // v9 夹具（64 Phase 1）：variant 绑定字段已删除；operationMode 走 extra 显式注入。
  return {
    id,
    type: "image-generator",
    data: {
      kind: "image-generator", label: "生图", status: "idle",
      modelId, aspectRatio: "3:4", batchSize: 1,
      ...extra,
    } as WorkflowNodeData,
  };
}

const edge = (source: string, target: string, targetHandle = "prompt"): FlowEdge =>
  ({ source, target, targetHandle });

function main() {
  console.log("DAG v9 执行计划回归测试");

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

  // ---------- C4（64 Phase 1）：extractParams operationMode 归节点 data ----------
  ok("C4：operationMode 缺省不注入 params（缺省 = generate）", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代女装"), imageGeneratorNode("g1")],
      [edge("t1", "g1")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.ok(!("operationMode" in g1.params));
    assert.equal(g1.params.modelId, "gpt-image-2.5-flare-vip");
    assert.equal(g1.params.aspectRatio, "3:4");
    assert.equal(g1.params.batchSize, 1);
  });

  for (const mode of ["generate", "edit", "mask-edit"] as const) {
    ok(`C4：operationMode="${mode}" 从 data 注入 params`, () => {
      const plan = buildExecutionPlan(
        [textNode("t1", "设计一套现代女装"), imageNode("i1", ["/api/files/a.png"]), imageGeneratorNode("g1", undefined, { operationMode: mode })],
        [edge("t1", "g1"), edge("i1", "g1", "reference")],
      );
      const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
      assert.equal(g1.params.operationMode, mode);
    });
  }

  ok("C4：params 零 variant 字段残留（promptVariantId/promptFamilyId/contractHash/evaluationVersion/parameterProfileId/postprocessVersion）", () => {
    // 即使脏 data 携带旧字段，extractParams 也绝不注入（64 C4：variant 五字段注入删除）。
    const forged = imageGeneratorNode("g1", undefined, {
      promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
      promptFamilyId: "fashion-lookbook",
      contractHash: "sha256:" + "f".repeat(64),
      evaluationVersion: "forged-eval-v99",
      parameterProfileId: "forged-profile",
      postprocessVersion: "p1",
    });
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代都市女装"), forged],
      [edge("t1", "g1")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    for (const field of ["promptVariantId", "promptFamilyId", "contractHash", "evaluationVersion", "parameterProfileId", "postprocessVersion"]) {
      assert.ok(!(field in g1.params), `params 不得注入 ${field}（64 C4 variant 注入已删除）`);
    }
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan));
  });

  // ---------- C5（64 Phase 1）：操作兼容校验 ----------
  ok("C5：edit 无参考图入边 → DagError（文案固定）", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代女装"), imageGeneratorNode("g1", undefined, { operationMode: "edit" })],
      [edge("t1", "g1")],
    );
    assert.throws(
      () => assertPlanInputs(plan, [edge("t1", "g1")]),
      (e) => e instanceof DagError && (e as Error).message === "Node g1 操作 edit 需要至少 1 条参考图入边",
    );
  });

  ok("C5：mask-edit 无参考图入边 → DagError（文案固定）", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代女装"), imageGeneratorNode("g1", undefined, { operationMode: "mask-edit" })],
      [edge("t1", "g1")],
    );
    assert.throws(
      () => assertPlanInputs(plan, [edge("t1", "g1")]),
      (e) => e instanceof DagError && (e as Error).message === "Node g1 操作 mask-edit 需要至少 1 条参考图入边",
    );
  });

  ok("C5：generate 无参考图入边 → 通过（含 INV-2 文本检查）", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "设计一套现代女装"), imageGeneratorNode("g1")],
      [edge("t1", "g1")],
    );
    assert.doesNotThrow(() => assertPlanInputs(plan, [edge("t1", "g1")]));
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan));
  });

  ok("C5：edit 有参考图入边 → 通过（兼容性准入同过）", () => {
    const plan = buildExecutionPlan(
      [textNode("t1", "把这件衣服穿到模特身上"), imageNode("i1", ["/api/files/a.png"]), imageGeneratorNode("g1", undefined, { operationMode: "edit" })],
      [edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    assert.doesNotThrow(() => assertPlanInputs(plan, [edge("t1", "g1")]));
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan));
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

  console.log(`\n通过 ${passed} 项`);
}

main();
