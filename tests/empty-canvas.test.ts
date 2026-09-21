import assert from "node:assert/strict";
import {
  ensureTextUpstreamForNode,
  isPristineProjectTab,
  selectActiveDocument,
  useFlowStore,
} from "../src/store/flowStore";

let passed = 0;

async function test(name: string, run: () => void | Promise<void>): Promise<void> {
  try {
    await run();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

function activeDocument() {
  return selectActiveDocument(useFlowStore.getState());
}

console.log("方案 C 空画布 + auto-text 兜底测试");

await test("空白 tab 是 pristine，重命名不落库（不 bump revision/dirty）", () => {
  useFlowStore.getState().createBlankTab();
  assert.equal(isPristineProjectTab(activeDocument()), true);
  const beforeRevision = activeDocument().revision;

  useFlowStore.getState().setProjectName("我的空项目");
  assert.equal(activeDocument().projectName, "我的空项目");
  assert.equal(activeDocument().revision, beforeRevision, "重命名不得 bump revision");
  assert.equal(activeDocument().dirty, false, "重命名不得置 dirty");
  // 空态由「无节点无边」判定（EmptyCanvasCTA 同源），重命名后仍是空画布。
  assert.equal(activeDocument().nodes.length, 0);
  assert.equal(activeDocument().edges.length, 0);
});

await test("空 tab 加 text 节点后不再是 pristine（首次实质变更即诞生）", () => {
  useFlowStore.getState().createBlankTab();
  const nodeId = useFlowStore.getState().addNode("text", { x: 0, y: 0 });
  assert.ok(nodeId);
  assert.equal(isPristineProjectTab(activeDocument()), false);
  assert.equal(activeDocument().revision, 1);
  assert.equal(activeDocument().dirty, true);
});

await test("ensureTextUpstreamForNode 为生成节点补空 text 节点 + prompt 边（INV-1）", () => {
  useFlowStore.getState().createBlankTab();
  const generatorId = useFlowStore.getState().addNode("image-generator", { x: 0, y: 0 });
  assert.ok(generatorId);
  ensureTextUpstreamForNode("image-generator", { x: 0, y: 0 }, generatorId);

  const document = activeDocument();
  const textNode = document.nodes.find((node) => node.data.kind === "text");
  assert.ok(textNode, "必须补出一个空 text 节点");
  const promptEdge = document.edges.find(
    (edge) => edge.target === generatorId && edge.targetHandle === "prompt",
  );
  assert.ok(promptEdge, "必须补出 text → generator 的 prompt 边");
  assert.equal(promptEdge.source, textNode.id);

  // v8（NODE_SPECS.image.inputs 全 0）：输入层节点不需要提示词上游，调用必须是 no-op。
  const inputImageId = useFlowStore.getState().addNode("image", { x: 400, y: 0 });
  assert.ok(inputImageId);
  const nodesBeforeNoop = activeDocument().nodes.length;
  const edgesBeforeNoop = activeDocument().edges.length;
  ensureTextUpstreamForNode("image", { x: 400, y: 0 }, inputImageId);
  assert.equal(activeDocument().nodes.length, nodesBeforeNoop, "输入节点不得补 text 上游");
  assert.equal(activeDocument().edges.length, edgesBeforeNoop, "输入节点不得补 prompt 边");
});

await test("ensureTextUpstreamForNode 幂等，且不抢占已绑定的 text 节点（INV-2）", () => {
  useFlowStore.getState().createBlankTab();
  const firstGeneratorId = useFlowStore.getState().addNode("image-generator", { x: 0, y: 0 });
  assert.ok(firstGeneratorId);
  ensureTextUpstreamForNode("image-generator", { x: 0, y: 0 }, firstGeneratorId);
  const textNodeCountAfterFirst = activeDocument().nodes.filter(
    (node) => node.data.kind === "text",
  ).length;
  assert.equal(textNodeCountAfterFirst, 1);

  // 第二次为同一个生成节点调用：不重复补。
  ensureTextUpstreamForNode("image-generator", { x: 0, y: 0 }, firstGeneratorId);
  assert.equal(
    activeDocument().nodes.filter((node) => node.data.kind === "text").length,
    1,
    "幂等：不重复补 text 节点",
  );

  // 第二个生成节点：已有 text 已绑定第一个生成节点（INV-2 / plan.md §207「不静默替换」），
  // 因此必须新建一个空 text 节点，而不是把既有提示词改接过来。
  const firstTextId = activeDocument().nodes.find((node) => node.data.kind === "text")?.id;
  const secondGeneratorId = useFlowStore.getState().addNode("image-generator", { x: 800, y: 0 });
  assert.ok(secondGeneratorId);
  ensureTextUpstreamForNode("image-generator", { x: 800, y: 0 }, secondGeneratorId);
  assert.equal(
    activeDocument().nodes.filter((node) => node.data.kind === "text").length,
    2,
    "已绑定的 text 节点不得被抢占，必须新建空 text 节点",
  );
  const secondPromptEdge = activeDocument().edges.find(
    (edge) => edge.target === secondGeneratorId && edge.targetHandle === "prompt",
  );
  assert.ok(secondPromptEdge, "第二个生成节点也必须有 prompt 上游");
  assert.notEqual(secondPromptEdge.source, firstTextId, "不得抢占第一个生成节点的提示词");
  assert.equal(
    activeDocument().edges.find(
      (edge) => edge.target === firstGeneratorId && edge.targetHandle === "prompt",
    )?.source,
    firstTextId,
    "第一个生成节点的绑定保持不变",
  );
});

await test("素材节点（addAssetNode）以输入层 image 落地，一次撤销完整移除", () => {
  useFlowStore.getState().createBlankTab();
  const addedId = useFlowStore.getState().addAssetNode(
    { name: "金色面料", image: "/api/files/gold-fabric.png" },
    { x: 0, y: 0 },
  );
  assert.ok(addedId);
  const document = activeDocument();
  const assetNode = document.nodes.find((node) => node.id === addedId);
  assert.equal(assetNode?.data.kind, "image");
  assert.deepEqual(assetNode?.data.outputImages, ["/api/files/gold-fabric.png"]);
  // v8：素材是输入层节点（NODE_SPECS.image.inputs 全 0），不再自动补 text 上游/prompt 边。
  assert.equal(
    document.nodes.filter((node) => node.data.kind === "text").length,
    0,
    "输入层素材节点不得自动补 text 上游",
  );
  assert.equal(document.edges.length, 0, "输入层素材节点不得有任何入边");

  // 素材节点是一次独立原子 action，一次撤销应回到空画布。
  useFlowStore.getState().undo();
  assert.equal(activeDocument().nodes.length, 0);
  assert.equal(activeDocument().edges.length, 0);
});

console.log(`\n通过 ${passed} 项`);
