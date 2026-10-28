import assert from "node:assert/strict";
import fs from "node:fs";
import { maskRedrawReadiness } from "./lib/maskRedraw";
import { shouldWarnBeforeWorkspaceUnload } from "../src/lib/workspaceUnload";
import {
  VIP_SIZE_DEFAULT_TIER_INDEX,
  getImageModelContract,
  imageAspectRatioOptions,
  imageModelAspectRatioPatch,
  imageModelOptionsForAspectRatio,
  imagePromptSizePrefixOptions,
  imageSizeTierOptions,
} from "../src/types/imageModels";
import { resolveTargetHandle } from "../src/lib/documentSnapshot";
import type { Edge } from "@xyflow/react";
import {
  addExistingNodes,
  EMPTY_ACTIVE_DOCUMENT,
  applyResultNodeCreatedEventToTab,
  applyRunEventToTab,
  beginHistoryTransaction,
  beginMaskWork,
  endHistoryTransaction,
  isPristineProjectTab,
  normalizeTabSessionValue,
  selectActiveDocument,
  selectActiveDocumentTarget,
  selectNodeInputImages,
  useFlowStore,
  type DocumentTarget,
  type FlowNode,
  type RecentResult,
} from "../src/store/flowStore";
import { setGenerationSafetyBlockReason } from "../src/store/generationSafety";
// v9（64 Phase 3）：variant 绑定概念已删——夹具直给模型/模式/参数
// （值与原参数档案 materialize 等价：commerce-hero edit → aspectRatio "1:1"、batchSize 1；
// flare-vip modelOptions { size: "2048x2048" }；gemini modelOptions { aspectRatio: "1:1", imageSize: "2K" }）。
const AI_TEST_MODEL_ID = "gpt-image-2.5-flare";
const AI_TEST_ASPECT_RATIO = "1:1";
const AI_TEST_BATCH_SIZE = 1;
const AI_TEST_MODEL_OPTIONS = { size: "2048x2048" };
/** v9：text 节点承载用户正文；系统提示词由 server 冻结常量在任务侧拼装（裁决 E）。 */
const AI_TEST_USER_PROMPT = "修改衣领";
const GEMINI_TEST_MODEL_ID = "gemini-3.1-flash-image";
const GEMINI_TEST_ASPECT_RATIO = "1:1";
const GEMINI_TEST_BATCH_SIZE = 1;
const GEMINI_TEST_MODEL_OPTIONS = { aspectRatio: "1:1", imageSize: "2K" };

let passed = 0;

function activeDocument(state = useFlowStore.getState()) {
  return selectActiveDocument(state);
}

function documentTargetForTab(tabId: string): DocumentTarget {
  const tab = useFlowStore.getState().tabs.find((candidate) => candidate.id === tabId);
  assert.ok(tab, `找不到页签 ${tabId}`);
  return { tabId, projectId: tab.projectId, documentEpoch: tab.documentEpoch };
}

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

// 2026-09-25 决策 4（A）：登录后没有任何打开页签——冷启动（无会话快照）tabs 为空，
// 画布区由 EmptyWorkspaceCTA 接管；页签全部由用户显式「新建项目 / 打开项目」产生。
const bootstrapState = useFlowStore.getState();
assert.equal(bootstrapState.tabs.length, 0, "冷启动不得自动打开任何页签");
assert.equal(bootstrapState.activeTabId, "", "无页签时 activeTabId 为空");
assert.equal(selectActiveDocument(bootstrapState), EMPTY_ACTIVE_DOCUMENT, "空工作区活动文档为空投影");

function imageNode(id: string, label: string): FlowNode {
  return {
    id,
    type: "image",
    position: { x: 0, y: 0 },
    data: { kind: "image", label, status: "idle" },
  };
}

function aiNode(id: string, label: string): FlowNode {
  // v9（64 Phase 3）：可运行的生成节点是 `image-generator`；正文由上游 text 提供，
  // 模式/模型直给（dag extractParams 同源形态），六绑定字段已随 variant 概念删除。
  return {
    id,
    type: "image-generator",
    position: { x: 320, y: 0 },
    data: {
      kind: "image-generator",
      label,
      status: "idle",
      operationMode: "edit",
      aspectRatio: AI_TEST_ASPECT_RATIO,
      batchSize: AI_TEST_BATCH_SIZE,
      modelId: AI_TEST_MODEL_ID,
      modelOptions: AI_TEST_MODEL_OPTIONS,
    },
  };
}

/** v8：提示词正文的宿主节点（生成节点由上游 text 供词）。 */
function textNode(id: string, text: string): FlowNode {
  return {
    id,
    type: "text",
    position: { x: 0, y: 0 },
    data: { kind: "text", label: "提示词", status: "idle", text },
  };
}

function runnableAiGraph(node: FlowNode): { nodes: FlowNode[]; edges: Edge[] } {
  const reference = imageNode(`${node.id}-reference`, `${node.data.label}参考图`);
  if (reference.data.kind !== "image") throw new Error("测试参考节点类型异常");
  reference.data.outputImages = [`/api/files/${node.id}-reference.png`];
  // v8：生成节点必须有 text 上游提供正文（runtime.md §5 / INV-1），否则运行准入 fail-closed。
  const prompt = textNode(`${node.id}-prompt`, AI_TEST_USER_PROMPT);
  return {
    nodes: [reference, prompt, node],
    edges: [
      { id: `${node.id}-reference-edge`, source: reference.id, target: node.id },
      { id: `${node.id}-prompt-edge`, source: prompt.id, target: node.id, targetHandle: "prompt" },
    ],
  };
}

function addRunnableAiNode(node: FlowNode): void {
  const graph = runnableAiGraph(node);
  addExistingNodes(graph.nodes);
  for (const edge of graph.edges) {
    useFlowStore.getState().onConnect({
      source: edge.source,
      target: edge.target,
      sourceHandle: null,
      targetHandle: edge.targetHandle ?? null,
    });
  }
}

function moveNode(nodeId: string, x: number, dragging = true): void {
  useFlowStore.getState().onNodesChange([{
    id: nodeId,
    type: "position",
    position: { x, y: 24 },
    dragging,
  }]);
}

async function flushCommandMicrotasks(turns = 8): Promise<void> {
  for (let index = 0; index < turns; index += 1) await Promise.resolve();
}

function assertNodeModelSelection(
  nodes: FlowNode[],
  nodeId: string,
  expected: { modelId: string; modelOptions: Record<string, unknown> },
): void {
  const node = nodes.find((candidate) => candidate.id === nodeId);
  assert.ok(node, `找不到节点 ${nodeId}`);
  assert.equal(node.data.modelId, expected.modelId);
  assert.deepEqual(node.data.modelOptions, expected.modelOptions);
}

console.log("项目多页签状态测试");

// 此文件验证已完成历史对账后的运行路径；冷启动 fail-closed 由 generation-safety.test 覆盖。
setGenerationSafetyBlockReason(null);

// 决策 4（A）：冷启动无页签——本文件的画布用例显式新建一个空白项目起步。
useFlowStore.getState().createBlankTab();
const initial = useFlowStore.getState();
const tabA = initial.activeTabId;
initial.setProjectName("项目 A");
// 方案 C：空白 tab 不再自带 starter 节点，测试显式添加一个 image 节点再改标签。
const tabAStarterNodeId = initial.addNode("image", { x: 0, y: 0 });
assert.ok(tabAStarterNodeId);
initial.updateNodeData(tabAStarterNodeId, { label: "A 上传节点" });

useFlowStore.getState().openFlowTab({
  projectId: "project-b",
  projectName: "项目 B",
  nodes: [imageNode("b-node", "B 上传节点")],
  edges: [] as Edge[],
});
const tabB = useFlowStore.getState().activeTabId;

await test("切换页签保留各自画布与项目名称", () => {
  assert.notEqual(tabA, tabB);
  assert.equal(activeDocument().projectName, "项目 B");
  assert.equal(activeDocument().nodes[0].id, "b-node");
  useFlowStore.getState().switchTab(tabA);
  assert.equal(activeDocument().projectName, "项目 A");
  assert.equal(activeDocument().nodes[0].data.label, "A 上传节点");
  useFlowStore.getState().switchTab(tabB);
  assert.equal(activeDocument().nodes[0].data.label, "B 上传节点");
});

await test("参考边编辑按目标文档作用域执行", () => {
  const sharedSource = imageNode("scoped-shared-source", "共享参考图");
  const secondSource = imageNode("scoped-second-source", "第二参考图");
  const targetA = aiNode("scoped-target-a", "目标 A");
  const targetB = aiNode("scoped-target-b", "目标 B");
  const edgeA = {
    id: "scoped-edge-a",
    source: sharedSource.id,
    target: targetA.id,
  };
  const edgeB = {
    id: "scoped-edge-b",
    source: secondSource.id,
    target: targetA.id,
  };
  const otherTargetEdge = {
    id: "scoped-other-target-edge",
    source: sharedSource.id,
    target: targetB.id,
  };
  useFlowStore.getState().openFlowTab({
    projectId: "scoped-edge-edit-project",
    projectName: "目标作用域边编辑",
    nodes: [sharedSource, secondSource, targetA, targetB],
    edges: [edgeA, edgeB, otherTargetEdge],
  });
  const testTabId = useFlowStore.getState().activeTabId;
  const target = selectActiveDocumentTarget(useFlowStore.getState());

  assert.equal(useFlowStore.getState().moveReferenceEdgeInTab(target, edgeB.id, "up"), true);
  assert.deepEqual(activeDocument().edges.map((edge) => edge.id), [
    edgeB.id,
    edgeA.id,
    otherTargetEdge.id,
  ]);
  assert.equal(useFlowStore.getState().moveReferenceEdgeInTab(target, edgeB.id, "down"), true);
  assert.deepEqual(activeDocument().edges.map((edge) => edge.id), [
    edgeA.id,
    edgeB.id,
    otherTargetEdge.id,
  ]);

  assert.equal(useFlowStore.getState().removeReferenceEdgeInTab(target, edgeA.id), true);
  assert.deepEqual(activeDocument().edges.map((edge) => edge.id), [
    edgeB.id,
    otherTargetEdge.id,
  ]);
  useFlowStore.getState().closeTab(testTabId);
  useFlowStore.getState().switchTab(tabB);
});

await test("非活动页签可定向编辑，旧 documentEpoch 请求不会穿透新项目", () => {
  const source = imageNode("scoped-inactive-source", "非活动参考图");
  const targetNode = aiNode("scoped-inactive-target", "非活动目标");
  useFlowStore.getState().openFlowTab({
    projectId: "scoped-inactive-project",
    projectName: "非活动作用域",
    nodes: [source, targetNode],
    edges: [{
      id: "scoped-inactive-edge",
      source: source.id,
      target: targetNode.id,
    }],
  });
  const inactiveTarget = selectActiveDocumentTarget(useFlowStore.getState());
  const inactiveTabId = inactiveTarget.tabId;
  useFlowStore.getState().switchTab(tabA);

  useFlowStore.getState().switchTab(inactiveTabId);
  assert.equal(activeDocument().edges[0].data, undefined);

  const staleTarget = selectActiveDocumentTarget(useFlowStore.getState());
  useFlowStore.getState().loadFlow({
    projectId: "scoped-replacement-project",
    projectName: "替换后的项目",
    nodes: [imageNode("scoped-replacement-source", "替换参考图"), aiNode("scoped-replacement-target", "替换目标")],
    edges: [],
  });
  const before = activeDocument();
  assert.equal(
    useFlowStore.getState().removeReferenceEdgeInTab(staleTarget, "scoped-inactive-edge"),
    false,
  );
  assert.equal(activeDocument().projectId, "scoped-replacement-project");
  assert.equal(activeDocument().documentEpoch, staleTarget.documentEpoch + 1);
  assert.deepEqual(activeDocument().edges, before.edges);
  useFlowStore.getState().closeTab(inactiveTabId);
  useFlowStore.getState().switchTab(tabB);
});

await test("重复打开同一项目复用已有页签且不覆盖未保存状态", () => {
  useFlowStore.getState().updateNodeData("b-node", { label: "B 本地修改" });
  const count = useFlowStore.getState().tabs.length;
  useFlowStore.getState().openFlowTab({
    projectId: "project-b",
    projectName: "服务端旧名称",
    nodes: [imageNode("replacement", "不应覆盖")],
    edges: [],
  });
  assert.equal(useFlowStore.getState().tabs.length, count);
  assert.equal(useFlowStore.getState().activeTabId, tabB);
  assert.equal(activeDocument().nodes[0].data.label, "B 本地修改");
});

await test("后台任务可定向回写非当前页签", () => {
  useFlowStore.getState().switchTab(tabA);
  useFlowStore.getState().updateNodeDataInTab(documentTargetForTab(tabB), "b-node", {
    status: "success",
    outputImages: ["/api/files/background-result.png"],
  });
  assert.equal(activeDocument().projectName, "项目 A");
  useFlowStore.getState().switchTab(tabB);
  const node = activeDocument().nodes.find((candidate) => candidate.id === "b-node");
  assert.equal(node?.data.status, "success");
  assert.deepEqual(
    node?.data.kind === "image" ? node.data.outputImages : undefined,
    ["/api/files/background-result.png"],
  );
});

await test("A 页签后台失败不影响 B 页签且保留 A 的上一版结果", () => {
  useFlowStore.getState().switchTab(tabA);
  useFlowStore.getState().addExistingNode(aiNode("a-ai-node", "A 后台改款"));
  // v8：产物住在结果节点上（生成节点不带 outputImages），先铺一个上一版结果节点。
  assert.equal(
    applyResultNodeCreatedEventToTab(documentTargetForTab(tabA), {
      type: "result-node-created",
      resultNodeId: "a-previous-result",
      sourceGeneratorId: "a-ai-node",
      runId: "run-a-previous",
      mediaKind: "image",
      urls: ["/api/files/previous.png"],
    }),
    true,
  );
  useFlowStore.getState().switchTab(tabB);
  const beforeB = activeDocument().nodes;

  applyRunEventToTab(documentTargetForTab(tabA), "a-ai-node", {
    type: "node-status",
    nodeId: "a-ai-node",
    status: "error",
    error: "AI 网关暂不可用",
  });

  assert.equal(useFlowStore.getState().activeTabId, tabB);
  assert.strictEqual(activeDocument().nodes, beforeB);
  useFlowStore.getState().switchTab(tabA);
  const failedNode = activeDocument().nodes.find((node) => node.id === "a-ai-node");
  assert.equal(failedNode?.data.status, "error");
  assert.equal(failedNode?.data.error, "AI 网关暂不可用");
  assert.deepEqual(
    activeDocument().nodes
      .filter((node) => node.data.kind === "result-image")
      .flatMap((node) => (node.data.kind === "result-image" ? node.data.images : [])),
    ["/api/files/previous.png"],
    "失败运行不得丢弃上一版结果",
  );
  useFlowStore.getState().switchTab(tabB);
});

await test("活动任务对账完成前禁止关闭看似空闲的恢复页签", () => {
  const count = useFlowStore.getState().tabs.length;
  setGenerationSafetyBlockReason("正在确认运行历史");
  try {
    useFlowStore.getState().closeTab(tabB);
    assert.equal(useFlowStore.getState().tabs.length, count);
    assert.ok(useFlowStore.getState().tabs.some((tab) => tab.id === tabB));
  } finally {
    setGenerationSafetyBlockReason(null);
  }
});

await test("运行中的页签不能关闭，避免任务结果丢失画布回写", () => {
  useFlowStore.getState().updateNodeData("b-node", { status: "queued" });
  const count = useFlowStore.getState().tabs.length;
  useFlowStore.getState().closeTab(tabB);
  assert.equal(useFlowStore.getState().tabs.length, count);
  assert.equal(useFlowStore.getState().activeTabId, tabB);
  useFlowStore.getState().updateNodeData("b-node", { status: "idle" });
});

await test("关闭当前页签后切换到相邻页签；关掉最后一个页签留空工作区（第 6 条）", () => {
  useFlowStore.getState().closeTab(tabB);
  assert.equal(useFlowStore.getState().activeTabId, tabA);
  assert.equal(useFlowStore.getState().tabs.length, 1);
  useFlowStore.getState().closeTab(tabA);
  // 第 6 条：允许关掉全部页签，不再偷偷补回一个空白页签；画布区由 EmptyWorkspaceCTA 接管。
  assert.equal(useFlowStore.getState().tabs.length, 0);
  assert.equal(useFlowStore.getState().activeTabId, "");
  // 空工作区仍可安全读取：活动文档边界返回冻结空投影，而不是抛错。
  assert.equal(selectActiveDocument(useFlowStore.getState()), EMPTY_ACTIVE_DOCUMENT);
  assert.deepEqual(selectActiveDocumentTarget(useFlowStore.getState()), {
    tabId: "",
    projectId: "",
    documentEpoch: 0,
  });
  assert.deepEqual(selectActiveDocument(useFlowStore.getState()).nodes, []);
  // 空工作区里写不进任何文档变更，也不会凭空造出幽灵页签。
  assert.equal(useFlowStore.getState().addNode("image", { x: 0, y: 0 }), null);
  assert.equal(useFlowStore.getState().tabs.length, 0);
  // 引导按钮「新建项目」→ createBlankTab：全新的未保存空白项目（第 4 条口径）。
  useFlowStore.getState().createBlankTab();
  assert.equal(useFlowStore.getState().tabs.length, 1);
  assert.equal(activeDocument().nodes.length, 0);
  assert.equal(activeDocument().dirty, false);
  assert.equal(isPristineProjectTab(activeDocument()), true);
  assert.equal(useFlowStore.getState().activeTabId, activeDocument().id);
});

await test("删除已选节点时同步清理 selectedNodeId", () => {
  useFlowStore.getState().openFlowTab({
    projectId: "selection-removal-project",
    projectName: "选择清理测试",
    nodes: [imageNode("selected-for-removal", "待删除节点")],
    edges: [],
  });
  useFlowStore.getState().setSelectedNodeId("selected-for-removal");

  useFlowStore.getState().onNodesChange([{
    id: "selected-for-removal",
    type: "remove",
  }]);

  assert.equal(activeDocument().nodes.length, 0);
  assert.equal(activeDocument().selectedNodeId, null);
});

await test("素材节点以单一原子 action 加入，一次撤销完整移除", () => {
  const baseline = imageNode("asset-baseline", "基准节点");
  useFlowStore.getState().openFlowTab({
    projectId: "atomic-asset-project",
    projectName: "原子素材测试",
    nodes: [baseline],
    edges: [],
  });
  const addedId = useFlowStore.getState().addAssetNode(
    { name: "金色面料", image: "/api/files/gold-fabric.png" },
    { x: -320, y: 40 },
  );
  assert.ok(addedId);
  const added = activeDocument().nodes.find((node) => node.id === addedId);
  assert.equal(added?.data.kind, "image");
  assert.equal(added?.data.label, "金色面料");
  assert.equal(added?.data.status, "success");
  assert.deepEqual(added?.data.kind === "image" ? added.data.outputImages : [], ["/api/files/gold-fabric.png"]);

  useFlowStore.getState().undo();
  assert.equal(activeDocument().nodes.length, 1);
  assert.equal(activeDocument().nodes[0].id, baseline.id);
  assert.equal(activeDocument().nodes.some((node) => node.id === addedId), false);
  assert.equal(activeDocument().selectedNodeId, null);

  const canvasNodeActionsSource = fs.readFileSync(
    new URL("../src/components/panels/canvasNodeActions.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    canvasNodeActionsSource,
    /addAssetNode\(asset,|AssetList|\/api\/assets/,
    "独立节点库不再承担素材管理，但 Store 的原子素材节点 action 仍需保持可用",
  );
  assert.doesNotMatch(canvasNodeActionsSource, /useFlowStore\.getState\(\)\.selectedNodeId|updateNodeData\(newId/);
});

await test("多选节点批量粘贴只产生一次文档提交与撤销记录", () => {
  const baseline = imageNode("batch-copy-baseline", "批量复制基准");
  useFlowStore.getState().openFlowTab({
    projectId: "batch-copy-project",
    projectName: "批量复制测试",
    nodes: [baseline],
    edges: [],
  });
  const beforeRevision = activeDocument().revision;
  const additions = [
    imageNode("batch-copy-a", "副本 A"),
    imageNode("batch-copy-b", "副本 B"),
  ].map((node, index) => ({
    ...node,
    position: { x: 80 + index * 120, y: 60 + index * 40 },
  }));

  assert.deepEqual(addExistingNodes(additions), ["batch-copy-a", "batch-copy-b"]);
  assert.equal(activeDocument().nodes.length, 3);
  assert.deepEqual(activeDocument().selectedNodeIds, ["batch-copy-a", "batch-copy-b"]);
  assert.equal(activeDocument().revision, beforeRevision + 1);

  useFlowStore.getState().undo();
  assert.deepEqual(activeDocument().nodes.map((node) => node.id), [baseline.id]);
  assert.equal(activeDocument().selectedNodeIds.length, 0);
});

await test("空白项目启动器只在从未持久化的 pristine 文档中生效", async () => {
  useFlowStore.getState().createBlankTab();
  assert.equal(isPristineProjectTab(activeDocument()), true);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ error: "offline" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
  try {
    assert.equal(await useFlowStore.getState().saveProject(), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.equal(activeDocument().saveState, "error");
  assert.equal(activeDocument().hasBeenPersisted, false);
  assert.equal(isPristineProjectTab(activeDocument()), true);
  const restoredAfterFailure = normalizeTabSessionValue({
    schemaVersion: 2,
    activeTabId: useFlowStore.getState().activeTabId,
    tabs: [activeDocument()],
  });
  assert.ok(restoredAfterFailure);
  assert.equal(restoredAfterFailure.tabs[0].hasBeenPersisted, false);
  assert.equal(isPristineProjectTab(restoredAfterFailure.tabs[0]), true);

  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  try {
    assert.equal(await useFlowStore.getState().saveProject(), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.equal(activeDocument().saveState, "saved");
  assert.equal(activeDocument().hasBeenPersisted, true);
  assert.equal(isPristineProjectTab(activeDocument()), false);

  const emptyNodes = activeDocument().nodes.map((node) => ({
    ...node,
    data: { ...node.data },
  }));
  useFlowStore.getState().openFlowTab({
    projectId: "persisted-empty-project",
    projectName: "未命名设计项目",
    nodes: emptyNodes,
    edges: [],
  });
  assert.equal(activeDocument().saveState, "saved");
  assert.equal(activeDocument().hasBeenPersisted, true);
  assert.equal(isPristineProjectTab(activeDocument()), false);

  useFlowStore.getState().createBlankTab();
  const addedId = useFlowStore.getState().addNode("image", { x: 380, y: 0 });
  assert.ok(addedId);
  assert.equal(isPristineProjectTab(activeDocument()), false);
});


console.log(`\n通过 ${passed} 项`);
