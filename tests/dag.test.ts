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

  // ---------- 65a：蒙版搬到图片节点（Q1 官方 single mask 语义） ----------

  ok("65a：image 节点带 mask → 注入生成节点 params 且 operationMode 物化 mask-edit", () => {
    const maskedImage = {
      id: "i1",
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
        mask: "data:image/png;base64,MASK==",
        maskSourceRef: "/api/files/a.png",
        featherRadius: 12,
      } as WorkflowNodeData,
    };
    const plan = buildExecutionPlan(
      [textNode("t1", "把背景改成纯白"), maskedImage, imageGeneratorNode("g1")],
      [edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.equal(g1.params.operationMode, "mask-edit"); // 推断物化
    assert.equal(g1.params.mask, "data:image/png;base64,MASK==");
    assert.equal(g1.params.maskSourceRef, "/api/files/a.png");
    assert.equal(g1.params.featherRadius, 12);
    assert.doesNotThrow(() => assertPlanInputs(plan, [edge("t1", "g1"), edge("i1", "g1", "reference")]));
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan));
  });

  ok("65a：mask 缺省 maskSourceRef → 回落图自身引用（maskSourceRef===inputImages[0] 语义不变）", () => {
    const maskedImage = {
      id: "i1",
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
        mask: "data:image/png;base64,MASK==",
      } as WorkflowNodeData,
    };
    const plan = buildExecutionPlan(
      [textNode("t1", "把背景改成纯白"), maskedImage, imageGeneratorNode("g1")],
      [edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.equal(g1.params.maskSourceRef, "/api/files/a.png");
    assert.doesNotThrow(() => assertPlanInputs(plan, [edge("t1", "g1"), edge("i1", "g1", "reference")]));
  });

  ok("65a：image-generator 自身 data 带 mask（存量草稿）→ 静默丢弃，params 无 mask、不物化 mask-edit", () => {
    const plan = buildExecutionPlan(
      [
        textNode("t1", "设计一套现代女装"),
        imageNode("i1", ["/api/files/a.png"]),
        imageGeneratorNode("g1", undefined, { mask: "data:image/png;base64,OLD==", maskSourceRef: "/api/files/a.png", featherRadius: 8 }),
      ],
      [edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.ok(!("mask" in g1.params), "存量生成节点 mask 不得注入 params");
    assert.ok(!("maskSourceRef" in g1.params));
    assert.ok(!("featherRadius" in g1.params));
    assert.ok(!("operationMode" in g1.params), "无推断源时不物化 operationMode");
  });

  ok("65a：maskSourceRef 与 inputImages[0] 不一致 → assertPlanInputs 拒（校验语义不变）", () => {
    const maskedImage = {
      id: "i1",
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
        mask: "data:image/png;base64,MASK==",
        maskSourceRef: "/api/files/stale.png",
      } as WorkflowNodeData,
    };
    const edges = [edge("t1", "g1"), edge("i1", "g1", "reference")];
    const plan = buildExecutionPlan(
      [textNode("t1", "把背景改成纯白"), maskedImage, imageGeneratorNode("g1")],
      edges,
    );
    assert.throws(
      () => assertPlanInputs(plan, edges),
      (e: unknown) => e instanceof DagError && (e as Error).message === "Node g1 mask does not match its current source image",
    );
  });

  ok("65a 独占：同一带 mask 图片节点作两个生成节点 image[0] → submit 兜底 DagError（文案固定）", () => {
    const maskedImage = {
      id: "i1",
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
        mask: "data:image/png;base64,MASK==",
        maskSourceRef: "/api/files/a.png",
      } as WorkflowNodeData,
    };
    assert.throws(
      () => buildExecutionPlan(
        [
          textNode("t1", "提示词甲"), textNode("t2", "提示词乙"),
          maskedImage,
          imageGeneratorNode("g1"), imageGeneratorNode("g2"),
        ],
        [edge("t1", "g1"), edge("i1", "g1", "reference"), edge("t2", "g2"), edge("i1", "g2", "reference")],
      ),
      (e: unknown) => e instanceof DagError
        && (e as Error).message === "Node i1 的蒙版一次只能服务 1 个生成节点的 image[0]（官方 single mask 语义）；当前同时用于生成节点 g1, g2",
    );
  });

  ok("65a 独占豁免：不带 mask 的图作两个生成节点 image[0] → 允许（独占只约束蒙版）", () => {
    const plan = buildExecutionPlan(
      [
        textNode("t1", "提示词甲"), textNode("t2", "提示词乙"),
        imageNode("i1", ["/api/files/a.png"]),
        imageGeneratorNode("g1"), imageGeneratorNode("g2"),
      ],
      [edge("t1", "g1"), edge("i1", "g1", "reference"), edge("t2", "g2"), edge("i1", "g2", "reference")],
    );
    assert.deepStrictEqual(plan.steps.map((s) => s.nodeId).sort(), ["g1", "g2"]);
  });

  ok("65a 独占：mask 图作同一生成节点 image[0] 与其他生成节点的参考图 → 不误伤", () => {
    const maskedImage = {
      id: "i1",
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
        mask: "data:image/png;base64,MASK==",
        maskSourceRef: "/api/files/a.png",
      } as WorkflowNodeData,
    };
    const plan = buildExecutionPlan(
      [
        textNode("t1", "提示词甲"), textNode("t2", "提示词乙"),
        maskedImage, imageNode("i2", ["/api/files/b.png"]),
        imageGeneratorNode("g1"), imageGeneratorNode("g2"),
      ],
      // i2 边必须先于 i1：上游按 edges 数组顺序，g2 的 image[0] 落在 i2（无 mask），
      // i1 只作为 g2 的第二参考图（无蒙版推断），i1 的蒙版消费者仅 g1 → 独占不触发。
      [edge("t2", "g2"), edge("i2", "g2", "reference"), edge("i1", "g2", "reference"), edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    // g2 的 inputImages[0] 是 i2（边序决定）→ i1 在 g2 只是普通参考图，无蒙版推断。
    const g2 = plan.steps.find((s) => s.nodeId === "g2")!;
    assert.equal(g2.inputImages[0], "/api/files/b.png");
    assert.ok(!("mask" in g2.params));
  });

  // ---------- 65b Q3 canonicalize：mask-edit 自动锁 sunburst（运行链落地） ----------

  ok("65b Q3：图带 mask → plan params.modelId 强制收成 gpt-image-2.5-sunburst", () => {
    const maskedImage = {
      id: "i1",
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
        mask: "data:image/png;base64,MASK==",
      } as WorkflowNodeData,
    };
    const plan = buildExecutionPlan(
      [textNode("t1", "把背景改成纯白"), maskedImage, imageGeneratorNode("g1", "gpt-image-2.5-flare-vip")],
      [edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.equal(g1.params.operationMode, "mask-edit");
    // 前端面板无论送什么 modelId（flare-vip 等），运行链产物 params.modelId
    // 都必须是官方蒙版重绘模型 → runner resolveProvider 拿到 sunburst，验证闸放行。
    assert.equal(g1.params.modelId, "gpt-image-2.5-sunburst");
  });

  ok("65b Q3：canonicalize 只发生在 plan 构造期，不改写传入 node.data", () => {
    const maskedImage = {
      id: "i1",
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
        mask: "data:image/png;base64,MASK==",
      } as WorkflowNodeData,
    };
    const g1Node = imageGeneratorNode("g1", "gpt-image-2.5-flare-vip");
    const plan = buildExecutionPlan(
      [textNode("t1", "把背景改成纯白"), maskedImage, g1Node],
      [edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    // plan 产物：运行时 modelId 已收成官方蒙版重绘模型。
    assert.equal(plan.steps.find((s) => s.nodeId === "g1")!.params.modelId, "gpt-image-2.5-sunburst");
    // 传入节点对象本身保持前端全量送的 flare-vip：canonicalize 不回写 node.data。
    assert.equal((g1Node.data as { modelId: string }).modelId, "gpt-image-2.5-flare-vip");
    // image 节点 data 更不得被注入 modelId。
    assert.ok(!("modelId" in maskedImage.data));
  });

  ok("65b Q3：无 mask 时 modelId 保持前端送的任意生成模型（不强制）", () => {
    const plainImage = {
      id: "i1",
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
      } as WorkflowNodeData,
    };
    const plan = buildExecutionPlan(
      [textNode("t1", "改个背景"), plainImage, imageGeneratorNode("g1", "gpt-image-2.5-flare-vip", { operationMode: "edit" })],
      [edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.equal(g1.params.operationMode, "edit");
    assert.equal(g1.params.modelId, "gpt-image-2.5-flare-vip");
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
