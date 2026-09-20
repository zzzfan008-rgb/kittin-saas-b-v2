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

await test("ensureTextUpstreamForNode 为 image 节点补空 text 节点 + prompt 边（INV-1）", () => {
  useFlowStore.getState().createBlankTab();
  const imageId = useFlowStore.getState().addNode("image", { x: 0, y: 0 });
  assert.ok(imageId);
  ensureTextUpstreamForNode("image", { x: 0, y: 0 }, imageId);

  const document = activeDocument();
  const textNode = document.nodes.find((node) => node.data.kind === "text");
  assert.ok(textNode, "必须补出一个空 text 节点");
  const promptEdge = document.edges.find(
    (edge) => edge.target === imageId && edge.targetHandle === "prompt",
  );
  assert.ok(promptEdge, "必须补出 text → image 的 prompt 边");
  assert.equal(promptEdge.source, textNode.id);
});

await test("ensureTextUpstreamForNode 幂等，且第二张 image 复用已有 text 节点", () => {
  useFlowStore.getState().createBlankTab();
  const firstImageId = useFlowStore.getState().addNode("image", { x: 0, y: 0 });
  assert.ok(firstImageId);
  ensureTextUpstreamForNode("image", { x: 0, y: 0 }, firstImageId);
  const textNodeCountAfterFirst = activeDocument().nodes.filter(
    (node) => node.data.kind === "text",
  ).length;
  assert.equal(textNodeCountAfterFirst, 1);

  // 第二次为同一个 image 调用：不重复补。
  ensureTextUpstreamForNode("image", { x: 0, y: 0 }, firstImageId);
  assert.equal(
    activeDocument().nodes.filter((node) => node.data.kind === "text").length,
    1,
    "幂等：不重复补 text 节点",
  );

  // 第二张 image：复用已有 text 节点，不新增第二个 text。
  const secondImageId = useFlowStore.getState().addNode("image", { x: 800, y: 0 });
  assert.ok(secondImageId);
  ensureTextUpstreamForNode("image", { x: 800, y: 0 }, secondImageId);
  assert.equal(
    activeDocument().nodes.filter((node) => node.data.kind === "text").length,
    1,
    "第二张 image 复用已有 text 节点",
  );
  const secondPromptEdge = activeDocument().edges.find(
    (edge) => edge.target === secondImageId && edge.targetHandle === "prompt",
  );
  assert.ok(secondPromptEdge, "第二张 image 也必须有 prompt 上游");
});

await test("素材节点（addAssetNode）原子补 text 上游且一次撤销完整移除", () => {
  useFlowStore.getState().createBlankTab();
  const addedId = useFlowStore.getState().addAssetNode(
    { name: "金色面料", image: "/api/files/gold-fabric.png" },
    { x: 0, y: 0 },
  );
  assert.ok(addedId);
  const document = activeDocument();
  const textNode = document.nodes.find((node) => node.data.kind === "text");
  assert.ok(textNode, "素材 image 节点必须有 text 上游");
  const promptEdge = document.edges.find(
    (edge) => edge.target === addedId && edge.targetHandle === "prompt",
  );
  assert.ok(promptEdge, "素材 image 节点必须有 prompt 入边");

  // 素材 image + text 是同一原子 action，一次撤销应回到空画布。
  useFlowStore.getState().undo();
  assert.equal(activeDocument().nodes.length, 0);
  assert.equal(activeDocument().edges.length, 0);
});

console.log(`\n通过 ${passed} 项`);
