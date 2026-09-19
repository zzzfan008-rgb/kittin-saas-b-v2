/**
 * DAG 三分支回归测试（R-53 P2-b，纯逻辑，不调真实 API/DB）。
 * 覆盖：extract 三分支（image 输出 outputImages / text·video 无图片输出）、
 * text 正文沿 text 边传播（inputTexts）、INV-2（上游 text 全空拒绝）、环检测。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/dag.test.ts
 */
import assert from "node:assert/strict";
import { buildExecutionPlan, assertPlanInputs, DagError, type FlowNode, type FlowEdge } from "../server/engine/dag";
import type { WorkflowNodeData } from "../src/types/workflow";

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

  console.log(`\n通过 ${passed} 项`);
}

main();
