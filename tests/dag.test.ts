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

  // ---------- 65d：蒙版重绘剥离出生成节点（决策 C 路线1）：生成节点不再消费蒙版 ----------

  ok("65d：image 节点带 mask → 生成节点不再注入 mask/不物化 mask-edit（决策 C：蒙版剥离出生成节点）", () => {
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
    // 65d：上游 mask 不再推断/注入生成节点 params，也不物化 mask-edit。
    assert.ok(!("mask" in g1.params), "65d：生成节点不再消费蒙版");
    assert.ok(!("maskSourceRef" in g1.params));
    assert.ok(!("featherRadius" in g1.params));
    assert.ok(!("operationMode" in g1.params), "无推断源时不物化 operationMode");
    // 无 mask-edit → assertPlanInputs / assertPromptRunAdmissions 不再有蒙版准入要求。
    assert.doesNotThrow(() => assertPlanInputs(plan, [edge("t1", "g1"), edge("i1", "g1", "reference")]));
    assert.doesNotThrow(() => assertPromptRunAdmissions(plan));
  });

  ok("65d：image 节点带 mask（缺省 maskSourceRef）→ 生成节点无 maskSourceRef 回落注入（推断已删）", () => {
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
    // 65d：不再有 maskSourceRef 回落注入（推断已删），生成节点 params 不含蒙版字段。
    assert.ok(!("maskSourceRef" in g1.params));
    assert.ok(!("mask" in g1.params));
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

  ok("65d：assertPlanInputs 仍拒 maskSourceRef 与 inputImages[0] 不一致（校验语义不变，供合成 step 用）", () => {
    const edges = [edge("t1", "g1"), edge("i1", "g1", "reference")];
    const plan = buildExecutionPlan(
      [textNode("t1", "把背景改成纯白"), imageNode("i1", ["/api/files/a.png"]), imageGeneratorNode("g1")],
      edges,
    );
    // 65d：生成节点不再从上游推断 mask；这里直接给 step 注入 mask-edit + mask + 陈旧 maskSourceRef，
    // 模拟合成 step 将产出的 params，验证 assertPlanInputs 的 maskSourceRef 校验语义不变。
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    g1.params.operationMode = "mask-edit";
    g1.params.mask = "data:image/png;base64,MASK==";
    g1.params.maskSourceRef = "/api/files/stale.png";
    assert.throws(
      () => assertPlanInputs(plan, edges),
      (e: unknown) => e instanceof DagError && (e as Error).message === "Node g1 mask does not match its current source image",
    );
  });

  ok("65d：带 mask 图片节点作两个生成节点 image[0] → 允许（决策 C：蒙版不再归属生成节点，独占随剥离失效）", () => {
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
        maskedImage,
        imageGeneratorNode("g1"), imageGeneratorNode("g2"),
      ],
      [edge("t1", "g1"), edge("i1", "g1", "reference"), edge("t2", "g2"), edge("i1", "g2", "reference")],
    );
    // 65d：不再抛独占 DagError；两生成节点均建 plan，且都不消费 i1 的蒙版（mask 剥离出生成节点）。
    assert.deepStrictEqual(plan.steps.map((s) => s.nodeId).sort(), ["g1", "g2"]);
    for (const s of plan.steps) {
      assert.ok(!("mask" in s.params), "65d：生成节点不再推断/消费蒙版");
      assert.ok(!("operationMode" in s.params) || s.params.operationMode !== "mask-edit", "65d：生成节点不物化 mask-edit");
    }
  });

  ok("65d：不带 mask 的图作两个生成节点 image[0] → 允许（生成节点共享参考图不受限）", () => {
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

  ok("65d：mask 图作同一生成节点 image[0] 与其他生成节点的参考图 → 边序决定 image[0]，蒙版不误伤生成节点", () => {
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
      // i1 只作为 g2 的第二参考图；65d 后蒙版不再推断到生成节点，本例仅验证边序 → image[0]。
      [edge("t2", "g2"), edge("i2", "g2", "reference"), edge("i1", "g2", "reference"), edge("t1", "g1"), edge("i1", "g1", "reference")],
    );
    // g2 的 inputImages[0] 是 i2（边序决定）→ i1 在 g2 只是普通参考图（65d：无蒙版推断）。
    const g2 = plan.steps.find((s) => s.nodeId === "g2")!;
    assert.equal(g2.inputImages[0], "/api/files/b.png");
    assert.ok(!("mask" in g2.params));
  });

  // ---------- 65d：生成节点不再 canonicalize（上游 mask 对生成节点惰性） ----------

  ok("65d：图带 mask → 生成节点不再推断 mask-edit/sunburst（剥离后 mask 对生成节点惰性）", () => {
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
    // 65d：上游 mask 不再推断到生成节点，也不再 canonicalize 成 sunburst。
    assert.ok(!("mask" in g1.params));
    assert.ok(!("maskSourceRef" in g1.params));
    assert.ok(!("operationMode" in g1.params), "无推断源时不物化 operationMode");
    assert.equal(g1.params.modelId, "gpt-image-2.5-flare-vip", "modelId 保持前端送的值，不再 canonicalize");
  });

  ok("65d：buildExecutionPlan 不改写传入 node.data（蒙版留在 image 节点，不注入生成节点）", () => {
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
    // plan 产物：生成节点不消费蒙版、不 canonicalize。
    const g1 = plan.steps.find((s) => s.nodeId === "g1")!;
    assert.ok(!("mask" in g1.params));
    assert.equal(g1.params.modelId, "gpt-image-2.5-flare-vip");
    // 传入节点对象不被改写：蒙版仍留在 image 节点 data，生成节点 data 不注入 mask/modelId。
    assert.equal((maskedImage.data as { mask?: string }).mask, "data:image/png;base64,MASK==");
    assert.ok(!("modelId" in maskedImage.data), "image 节点不被注入 modelId");
    assert.equal((g1Node.data as { modelId: string }).modelId, "gpt-image-2.5-flare-vip", "生成节点 data.modelId 不被改写");
  });

  ok("65d：无 mask 时 modelId/operationMode 保持前端送的值（不强制）", () => {
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

  // ---------- 65d §3：蒙版重绘/整图编辑合成 step（方案 A：onlyNodeId→image 节点不走 filter 主链）----------
  const MASK_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

  function imageWithEdit(
    id: string,
    fields: Record<string, unknown>,
  ): FlowNode {
    return {
      id,
      type: "image",
      data: {
        kind: "image", label: "图片", status: "idle",
        outputImages: ["/api/files/a.png"],
        ...fields,
      } as WorkflowNodeData,
    };
  }

  ok("65d §3.2：image 节点带 mask+editPrompt → 单个合成 step（mask-edit + sunburst）", () => {
    const plan = buildExecutionPlan(
      [imageWithEdit("i1", { mask: MASK_B64, maskSourceRef: "/api/files/a.png", featherRadius: 12, editPrompt: "把领口改成方领" })],
      [],
      { onlyNodeId: "i1" },
    );
    assert.equal(plan.steps.length, 1);
    const step = plan.steps[0]!;
    assert.equal(step.nodeId, "i1");
    assert.equal(step.kind, "image-generator");
    assert.deepEqual(step.inputImages, ["/api/files/a.png"]);
    assert.equal(step.params.operationMode, "mask-edit");
    assert.equal(step.params.modelId, "gpt-image-2.5-sunburst");
    assert.equal(step.params.mask, MASK_B64);
    assert.equal(step.params.maskSourceRef, "/api/files/a.png");
    assert.equal(step.params.featherRadius, 12);
  });

  ok("65d §3.2：image 节点无 mask + editPrompt → 单个合成 step（edit + flare-vip）", () => {
    const plan = buildExecutionPlan(
      [imageWithEdit("i1", { editPrompt: "换个纯色背景" })],
      [],
      { onlyNodeId: "i1" },
    );
    assert.equal(plan.steps.length, 1);
    const step = plan.steps[0]!;
    assert.equal(step.params.operationMode, "edit");
    assert.equal(step.params.modelId, "gpt-image-2.5-flare-vip");
    assert.equal(step.params.mask, undefined);
  });

  ok("65d §3.2：合成 step params 形状完整（prompt=inputTexts[0]、batchSize=1、显式 modelId）", () => {
    const plan = buildExecutionPlan(
      [imageWithEdit("i1", { editPrompt: "把袖子改短" })],
      [],
      { onlyNodeId: "i1" },
    );
    const step = plan.steps[0]!;
    assert.equal(step.params.prompt, "把袖子改短");
    assert.deepEqual(step.params.inputTexts, ["把袖子改短"]);
    assert.equal(step.params.batchSize, 1);
    assert.equal(step.params.modelId, "gpt-image-2.5-flare-vip");
  });

  ok("65d §3：image 节点无 editPrompt → 不合成（走正常 filter，返回空 steps）", () => {
    const plan = buildExecutionPlan(
      [imageWithEdit("i1", {})],
      [],
      { onlyNodeId: "i1" },
    );
    assert.equal(plan.steps.length, 0);
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
