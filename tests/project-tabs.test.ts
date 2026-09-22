import assert from "node:assert/strict";
import fs from "node:fs";
import { maskRedrawReadiness } from "./lib/maskRedraw";
import { shouldWarnBeforeWorkspaceUnload } from "../src/lib/workspaceUnload";
import { imageModelAspectRatioPatch } from "../src/types/imageModels";
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
import {
  buildGarmentPrompt,
  requireGarmentPromptVariant,
  type PromptVariant,
} from "../src/lib/garmentPromptPresets";
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "../src/types/modelParameterProfiles";
import { promotePromptVariantForTest } from "./promptReleaseTestSupport";

const aiTestVariant = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "edit",
});
// These tests exercise store concurrency and persistence after admission. Keep
// the production catalog closed while modelling reviewed evidence in-process.
promotePromptVariantForTest(aiTestVariant);
const aiTestProfile = getModelParameterProfile(aiTestVariant.parameterProfileId)!;
const aiTestParameters = materializeModelParameterProfile(aiTestProfile);
const AI_TEST_PROMPT = buildGarmentPrompt(aiTestVariant.variantId, "修改衣领");
/** v8：text 节点承载的是用户正文，系统提示词由 variant.fullPrompt 在服务端内联。 */
const AI_TEST_USER_PROMPT = "修改衣领";
const geminiTestVariant = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "image",
  mode: "edit",
});
promotePromptVariantForTest(geminiTestVariant);
const geminiTestProfile = getModelParameterProfile(geminiTestVariant.parameterProfileId)!;
const geminiTestParameters = materializeModelParameterProfile(geminiTestProfile);

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
  // v8：可运行的生成节点是 `image-generator`；正文由上游 text 提供，产物归结果节点。
  return {
    id,
    type: "image-generator",
    position: { x: 320, y: 0 },
    data: {
      kind: "image-generator",
      label,
      status: "idle",
      aspectRatio: aiTestParameters.aspectRatio,
      batchSize: aiTestParameters.batchSize,
      modelId: aiTestVariant.modelId,
      modelOptions: aiTestParameters.modelOptions,
      promptVariantId: aiTestVariant.variantId,
      promptFamilyId: aiTestVariant.familyId,
      parameterProfileId: aiTestVariant.parameterProfileId,
      contractHash: aiTestVariant.contractHash,
      evaluationVersion: aiTestVariant.evaluationVersion,
      postprocessVersion: aiTestProfile.postprocess.version,
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

await test("快捷建图原子新增节点与合法连线，一次撤销完整恢复", () => {
  const anchor = textNode("quick-anchor", "快捷上游提示词");
  useFlowStore.getState().openFlowTab({
    projectId: "quick-connect-project",
    projectName: "快捷建图测试",
    nodes: [anchor],
    edges: [],
  });
  const beforeRevision = activeDocument().revision;
  const addedId = useFlowStore.getState().addConnectedNode(
    anchor.id,
    "image-generator",
    "downstream",
  );
  assert.ok(addedId);
  assert.equal(activeDocument().nodes.length, 2);
  assert.equal(activeDocument().edges.length, 1);
  assert.equal(activeDocument().edges[0].source, anchor.id);
  assert.equal(activeDocument().edges[0].target, addedId);
  assert.deepEqual(activeDocument().edges[0].data, {}, "新连线不写入角色数据");
  assert.equal(
    resolveTargetHandle(
      anchor.data.kind,
      "image-generator",
      activeDocument().edges[0].targetHandle ?? null,
    ),
    "prompt",
    "text → generator 的连接必须落在 prompt 区",
  );
  assert.equal(activeDocument().selectedNodeId, addedId);
  assert.equal(activeDocument().revision, beforeRevision + 1);

  // v8：输入层节点不接受入边，因此「从图片节点向下游快捷建图」必须 fail-closed。
  const inputAnchor = imageNode("quick-input-anchor", "输入图");
  useFlowStore.getState().addExistingNode(inputAnchor);
  assert.equal(
    useFlowStore.getState().addConnectedNode(inputAnchor.id, "image", "downstream"),
    null,
    "输入节点不能作为任何边的目标",
  );

  useFlowStore.getState().undo();
  useFlowStore.getState().undo();
  assert.deepEqual(activeDocument().nodes.map((node) => node.id), [anchor.id]);
  assert.equal(activeDocument().edges.length, 0);
});

await test("新连线不再写入角色数据（edge data 为空对象）", () => {
  const confirmedSource = imageNode("confirmed-edge-source", "参考人物");
  if (confirmedSource.data.kind !== "image") throw new Error("测试参考节点类型异常");
  confirmedSource.data.outputImages = ["/api/files/confirmed-person.png"];
  const firstTarget = aiNode("confirmed-edge-target", "第一目标");
  const secondTarget = aiNode("explicit-edge-target", "第二目标");
  useFlowStore.getState().openFlowTab({
    projectId: "edge-role-creation-project",
    projectName: "连线角色创建",
    nodes: [confirmedSource, firstTarget, secondTarget],
    edges: [],
  });

  useFlowStore.getState().onConnect({
    source: confirmedSource.id,
    target: firstTarget.id,
    sourceHandle: null,
    targetHandle: null,
  });
  useFlowStore.getState().onConnect({
    source: confirmedSource.id,
    target: secondTarget.id,
    sourceHandle: null,
    targetHandle: null,
  });

  assert.deepEqual(activeDocument().edges.map((candidate) => candidate.data), [
    {},
    {},
  ]);
});

await test("专用面料/角色句柄在新连线时被拒绝，不再写入角色数据", () => {
  const source = imageNode("dedicated-handle-source", "参考来源");
  const targetId = "dedicated-handle-target";
  const target = {
    id: targetId,
    type: "image",
    position: { x: 320, y: 0 },
    data: {
      kind: "image" as const,
      label: "面料换色",
      status: "idle" as const,
      colors: [],
      prompt: "",
      outputImages: [],
      operationMode: "edit" as const,
      operationModeNeedsConfirmation: false,
      modelId: "gpt-image-2.5-sunburst" as const,
      modelOptions: {},
    },
  } satisfies FlowNode;
  useFlowStore.getState().openFlowTab({
    projectId: "dedicated-handle-role-project",
    projectName: "专用句柄角色",
    nodes: [source, target],
    edges: [],
  });

  useFlowStore.getState().onConnect({
    source: source.id,
    target: targetId,
    sourceHandle: null,
    targetHandle: "fabric",
  });
  useFlowStore.getState().onConnect({
    source: source.id,
    target: targetId,
    sourceHandle: null,
    targetHandle: "garment",
  });

  assert.deepEqual(activeDocument().edges.map((edge) => edge.data), []);
});

await test("快捷建图复用输入上限与只读门禁", () => {
  const target: FlowNode = {
    id: "full-target",
    type: "image",
    position: { x: 380, y: 0 },
    data: { kind: "image", label: "图片", status: "idle", aspectRatio: "3:4", batchSize: 1, outputImages: [] },
  };
  // 图片节点 reference 入边上限为 8：8 个上游已满，第 9 个快捷建图被拒绝。
  const upstreams = Array.from({ length: 8 }, (_, index) => imageNode(`upstream-${index}`, `上游 ${index + 1}`));
  useFlowStore.getState().openFlowTab({
    projectId: "quick-connect-full",
    projectName: "输入已满",
    nodes: [...upstreams, target],
    edges: upstreams.map((node, index) => ({ id: `upstream-${index}-edge`, source: node.id, target: target.id })),
  });
  assert.equal(
    useFlowStore.getState().addConnectedNode(target.id, "image", "upstream"),
    null,
  );
  assert.equal(activeDocument().nodes.length, 9);

  useFlowStore.getState().openFlowTab({
    projectId: "quick-connect-readonly",
    projectName: "只读快捷建图",
    nodes: [imageNode("readonly-anchor", "只读节点")],
    edges: [],
    readOnly: true,
  });
  assert.equal(
    useFlowStore.getState().addConnectedNode("readonly-anchor", "image", "downstream"),
    null,
  );
  assert.equal(activeDocument().nodes.length, 1);
  assert.equal(activeDocument().edges.length, 0);
  useFlowStore.getState().createBlankTab();
});

await test("保存期间继续编辑会排队并最终写入最新版本", async () => {
  const requests: Array<{ body: string; resolve: (response: Response) => void }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_input, init) =>
    new Promise<Response>((resolve) => {
      requests.push({ body: String(init?.body ?? ""), resolve });
    });

  try {
    const before = useFlowStore.getState();
    const firstSave = before.saveProject();
    assert.equal(requests.length, 1);

    // 方案 C：空 tab 重命名是瞬态字段，不再 bump revision；用添加节点作为保存期间的实质编辑。
    const editNodeId = useFlowStore.getState().addNode("text", { x: 0, y: 0 });
    assert.ok(editNodeId);
    const secondSave = useFlowStore.getState().saveProject();
    assert.equal(requests.length, 1, "第二次保存应等待当前请求完成");

    requests[0].resolve(Response.json({ ok: true }));
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(requests.length, 2, "旧快照完成后应自动发送最新快照");

    const latestPayload = JSON.parse(requests[1].body) as { flow: { nodes: unknown[] } };
    assert.equal(latestPayload.flow.nodes.length, 1);
    const duplicateSameSnapshot = useFlowStore.getState().saveProject();
    assert.equal(requests.length, 2, "同快照的显式重复保存应由当前请求覆盖");
    requests[1].resolve(Response.json({ ok: true }));
    await Promise.all([firstSave, secondSave, duplicateSameSnapshot]);
    await flushCommandMicrotasks();
    assert.equal(requests.length, 2, "当前快照成功后不得为重复点击发第三次请求");

    const after = activeDocument();
    assert.equal(after.dirty, false);
    assert.equal(after.saveState, "saved");
    assert.equal(after.savedRevision, after.revision);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("旧保存响应不得将同页签新项目标记为已保存", async () => {
  const sharedNodeId = "same-tab-save-identity";
  useFlowStore.getState().loadFlow({
    projectId: "same-tab-save-project-a",
    projectName: "同页签项目 A",
    nodes: [aiNode(sharedNodeId, "A")],
    edges: [],
    markDirty: true,
  });
  const source = selectActiveDocumentTarget(useFlowStore.getState());
  let resolveSave: ((response: Response) => void) | undefined;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => new Promise<Response>((resolve) => {
    resolveSave = resolve;
  });

  try {
    const saving = useFlowStore.getState().saveProject();
    assert.ok(resolveSave, "旧项目保存请求应已发出");
    useFlowStore.getState().loadFlow({
      projectId: "same-tab-save-project-b",
      projectName: "同页签项目 B",
      nodes: [aiNode(sharedNodeId, "B")],
      edges: [],
      markDirty: true,
    });
    const replacement = activeDocument();
    assert.equal(replacement.id, source.tabId);
    assert.equal(replacement.documentEpoch, source.documentEpoch + 1);

    resolveSave(Response.json({ ok: true }));
    assert.equal(await saving, false, "失效保存响应必须报告未保存新项目");
    const after = activeDocument();
    assert.equal(after.projectId, "same-tab-save-project-b");
    assert.equal(after.dirty, true);
    assert.equal(after.saveState, "idle");
    assert.equal(after.savedRevision, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("旧上传回写与运行预检不得穿透同页签 documentEpoch", async () => {
  const sharedNodeId = "same-tab-async-identity";
  const referenceNode = imageNode("same-tab-async-reference", "旧项目参考图");
  if (referenceNode.data.kind !== "image") throw new Error("测试参考节点类型异常");
  referenceNode.data.outputImages = ["/api/files/garment-reference.png"];
  const sourceNode = aiNode(sharedNodeId, "旧项目节点");
  sourceNode.data.status = "idle";
  // v8：生成节点的提示词来自上游 text 节点，缺失即 fail-closed。
  const promptNode = textNode("same-tab-async-prompt", "修改衣领");
  useFlowStore.getState().loadFlow({
    projectId: "same-tab-async-project-a",
    projectName: "异步项目 A",
    nodes: [referenceNode, promptNode, sourceNode],
    edges: [
      { id: "same-tab-async-edge", source: referenceNode.id, target: sourceNode.id },
      { id: "same-tab-async-prompt-edge", source: promptNode.id, target: sourceNode.id, targetHandle: "prompt" },
    ],
    markDirty: true,
  });
  const staleTarget = selectActiveDocumentTarget(useFlowStore.getState());
  const requests: string[] = [];
  let resolveSave: ((response: Response) => void) | undefined;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input) => {
    const url = String(input);
    requests.push(url);
    if (url === "/api/projects") {
      return new Promise<Response>((resolve) => {
        resolveSave = resolve;
      });
    }
    return Promise.resolve(Response.json({ runId: "must-not-be-created" }, { status: 202 }));
  };

  try {
    const running = useFlowStore.getState().runNode(sharedNodeId);
    assert.ok(resolveSave, "运行应先等待旧项目保存");
    const replacementNode = aiNode(sharedNodeId, "新项目节点");
    replacementNode.data.status = "idle";
    useFlowStore.getState().loadFlow({
      projectId: "same-tab-async-project-b",
      projectName: "异步项目 B",
      nodes: [replacementNode],
      edges: [],
      markDirty: true,
    });
    useFlowStore.getState().updateNodeDataInTab(staleTarget, sharedNodeId, {
      label: "旧上传误写",
      status: "success",
    });
    assert.equal(activeDocument().nodes[0].data.label, "新项目节点");

    resolveSave(Response.json({ ok: true }));
    await running;
    assert.deepEqual(requests, ["/api/projects"], "失效旧快照不得继续创建付费 Run");
    const after = activeDocument();
    assert.equal(after.projectId, "same-tab-async-project-b");
    assert.equal(after.nodes[0].data.label, "新项目节点");
    assert.equal(after.nodes[0].data.status, "idle");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("保存失败响应落在拖拽中时，等待结束后再标记最终 dirty 版本", async () => {
  const node = aiNode("drag-save-failure", "拖拽保存失败");
  useFlowStore.getState().openFlowTab({
    projectId: "drag-save-failure-project",
    projectName: "拖拽保存失败",
    nodes: [node],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();
  const before = activeDocument();
  const requests: Array<{ body: string; resolve: (response: Response) => void }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_input, init) => new Promise<Response>((resolve) => {
    requests.push({ body: String(init?.body ?? ""), resolve });
  });

  try {
    let saveSettled = false;
    const saving = useFlowStore.getState().saveProject().finally(() => {
      saveSettled = true;
    });
    assert.equal(requests.length, 1);
    const transaction = beginHistoryTransaction("drag-save-failure");
    moveNode(node.id, 64);
    requests[0].resolve(Response.json({ error: "测试失败" }, { status: 503 }));
    await flushCommandMicrotasks();
    assert.equal(saveSettled, false, "失败响应不得在拖拽中提前改写元数据");
    assert.equal(activeDocument().saveState, "saving");

    moveNode(node.id, 160);
    assert.equal(endHistoryTransaction(transaction), true);
    assert.equal(await saving, false);
    const after = activeDocument();
    assert.deepEqual(after.nodes[0].position, { x: 160, y: 24 });
    assert.notEqual(after.nodes[0].dragging, true);
    assert.equal(after.revision, before.revision + 1);
    assert.equal(after.savedRevision, before.savedRevision);
    assert.equal(after.dirty, true);
    assert.equal(after.saveState, "error");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("净零拖拽保存等待结束后只写入起点快照", async () => {
  const node = aiNode("net-zero-drag-save", "净零拖拽保存");
  node.position = { x: 0, y: 24 };
  useFlowStore.getState().openFlowTab({
    projectId: "net-zero-drag-save-project",
    projectName: "净零拖拽保存",
    nodes: [node],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();
  const before = activeDocument();
  const requests: Array<{ body: string; resolve: (response: Response) => void }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_input, init) => new Promise<Response>((resolve) => {
    requests.push({ body: String(init?.body ?? ""), resolve });
  });

  try {
    const transaction = beginHistoryTransaction("net-zero-drag-save");
    moveNode(node.id, 80);
    const saving = useFlowStore.getState().saveProject();
    moveNode(node.id, 0, false);
    assert.equal(requests.length, 0);
    assert.equal(endHistoryTransaction(transaction), false);
    await flushCommandMicrotasks();

    assert.equal(requests.length, 1);
    const payload = JSON.parse(requests[0].body) as { flow: { nodes: FlowNode[] } };
    assert.deepEqual(payload.flow.nodes[0].position, { x: 0, y: 24 });
    assert.notEqual(payload.flow.nodes[0].dragging, true);
    requests[0].resolve(Response.json({ ok: true }));
    assert.equal(await saving, true);

    const after = activeDocument();
    assert.equal(after.revision, before.revision);
    assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
    assert.equal(after.dirty, false);
    assert.equal(after.saveState, "saved");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("失败响应先等待拖拽时，后到的显式保存会重试一次且不多发", async () => {
  const node = aiNode("queued-drag-save", "排队拖拽保存");
  useFlowStore.getState().openFlowTab({
    projectId: "queued-drag-save-project",
    projectName: "排队拖拽保存",
    nodes: [node],
    edges: [],
  });
  const requests: Array<{ body: string; resolve: (response: Response) => void }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_input, init) => new Promise<Response>((resolve) => {
    requests.push({ body: String(init?.body ?? ""), resolve });
  });

  try {
    let firstSettled = false;
    const firstSave = useFlowStore.getState().saveProject().finally(() => {
      firstSettled = true;
    });
    assert.equal(requests.length, 1);
    const transaction = beginHistoryTransaction("queued-drag-save");
    moveNode(node.id, 64);

    requests[0].resolve(Response.json({ error: "首次保存失败" }, { status: 503 }));
    await flushCommandMicrotasks();
    assert.equal(firstSettled, false, "失败响应已先登记 settlement waiter");
    assert.equal(activeDocument().saveState, "saving");

    const secondSave = useFlowStore.getState().saveProject();
    assert.equal(requests.length, 1, "显式重试不得发送拖拽中间帧");

    moveNode(node.id, 128);
    assert.equal(endHistoryTransaction(transaction), true);
    await flushCommandMicrotasks(12);
    assert.equal(requests.length, 2);
    const latestPayload = JSON.parse(requests[1].body) as { flow: { nodes: FlowNode[] } };
    assert.deepEqual(latestPayload.flow.nodes[0].position, { x: 128, y: 24 });
    assert.notEqual(latestPayload.flow.nodes[0].dragging, true);

    requests[1].resolve(Response.json({ ok: true }));
    await Promise.all([firstSave, secondSave]);
    await flushCommandMicrotasks();
    assert.equal(requests.length, 2, "第二次成功已覆盖显式重试，不得发第三次请求");
    const after = activeDocument();
    assert.equal(after.dirty, false);
    assert.equal(after.saveState, "saved");
    assert.equal(after.savedRevision, after.revision);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("切页取消拖拽后，保存继续定向写入源页签回滚快照", async () => {
  const sourceNode = aiNode("switch-drag-save-source", "切页保存源节点");
  useFlowStore.getState().openFlowTab({
    projectId: "switch-drag-save-source-project",
    projectName: "切页保存源页签",
    nodes: [sourceNode],
    edges: [],
  });
  const sourceTabId = useFlowStore.getState().activeTabId;
  useFlowStore.getState().openFlowTab({
    projectId: "switch-drag-save-target-project",
    projectName: "切页保存目标页签",
    nodes: [aiNode("switch-drag-save-target", "切页保存目标节点")],
    edges: [],
  });
  const targetTabId = useFlowStore.getState().activeTabId;
  useFlowStore.getState().switchTab(sourceTabId);
  const requests: Array<{ body: string; resolve: (response: Response) => void }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_input, init) => new Promise<Response>((resolve) => {
    requests.push({ body: String(init?.body ?? ""), resolve });
  });

  try {
    const transaction = beginHistoryTransaction("switch-drag-save");
    moveNode(sourceNode.id, 180);
    const saving = useFlowStore.getState().saveProject();
    assert.equal(requests.length, 0);
    useFlowStore.getState().switchTab(targetTabId);
    await flushCommandMicrotasks();

    assert.equal(endHistoryTransaction(transaction), false);
    assert.equal(requests.length, 1);
    const payload = JSON.parse(requests[0].body) as {
      id: string;
      flow: { nodes: FlowNode[] };
    };
    assert.equal(payload.id, "switch-drag-save-source-project");
    assert.deepEqual(payload.flow.nodes[0].position, { x: 320, y: 0 });
    assert.notEqual(payload.flow.nodes[0].dragging, true);

    requests[0].resolve(Response.json({ ok: true }));
    assert.equal(await saving, true);
    const sourceTab = useFlowStore.getState().tabs.find((tab) => tab.id === sourceTabId);
    assert.equal(sourceTab?.dirty, false);
    assert.equal(sourceTab?.saveState, "saved");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("关闭活动页签会取消拖拽与待执行保存", async () => {
  const sourceNode = aiNode("close-active-drag-save", "关闭活动页签");
  useFlowStore.getState().openFlowTab({
    projectId: "close-active-drag-save-project",
    projectName: "关闭活动页签",
    nodes: [sourceNode],
    edges: [],
  });
  const sourceTabId = useFlowStore.getState().activeTabId;
  useFlowStore.getState().openFlowTab({
    projectId: "close-active-fallback-project",
    projectName: "关闭后目标",
    nodes: [aiNode("close-active-fallback", "关闭后目标")],
    edges: [],
  });
  const fallbackTabId = useFlowStore.getState().activeTabId;
  useFlowStore.getState().switchTab(sourceTabId);
  const originalFetch = globalThis.fetch;
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return Response.json({ ok: true });
  };

  try {
    const transaction = beginHistoryTransaction("close-active-drag-save");
    moveNode(sourceNode.id, 640);
    const saving = useFlowStore.getState().saveProject();
    useFlowStore.getState().closeTab(sourceTabId);
    await flushCommandMicrotasks();

    assert.equal(await saving, false);
    assert.equal(requestCount, 0);
    assert.equal(endHistoryTransaction(transaction), false);
    assert.equal(useFlowStore.getState().tabs.some((tab) => tab.id === sourceTabId), false);
    assert.equal(useFlowStore.getState().activeTabId, fallbackTabId);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("Undo→Save 会先撤销拖拽，再保存撤销后快照", async () => {
  const node = aiNode("undo-then-save", "Undo 后保存");
  useFlowStore.getState().openFlowTab({
    projectId: "undo-then-save-project",
    projectName: "Undo 后保存",
    nodes: [node],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();
  const requests: Array<{ body: string; resolve: (response: Response) => void }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_input, init) => new Promise<Response>((resolve) => {
    requests.push({ body: String(init?.body ?? ""), resolve });
  });

  try {
    const transaction = beginHistoryTransaction("undo-then-save");
    moveNode(node.id, 500);
    useFlowStore.getState().undo();
    const saving = useFlowStore.getState().saveProject();
    assert.equal(requests.length, 0);

    assert.equal(endHistoryTransaction(transaction), true);
    await flushCommandMicrotasks(12);
    assert.equal(requests.length, 1);
    const payload = JSON.parse(requests[0].body) as { flow: { nodes: FlowNode[] } };
    assert.deepEqual(payload.flow.nodes[0].position, { x: 320, y: 0 });
    assert.deepEqual(activeDocument().nodes[0].position, { x: 320, y: 0 });
    assert.equal(useFlowStore.temporal.getState().futureStates.length, 1);

    requests[0].resolve(Response.json({ ok: true }));
    assert.equal(await saving, true);
    assert.equal(activeDocument().dirty, false);
    assert.equal(activeDocument().saveState, "saved");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("Save→Undo 先发送拖拽终点，再排队补写撤销快照", async () => {
  const node = aiNode("save-then-undo", "保存后 Undo");
  useFlowStore.getState().openFlowTab({
    projectId: "save-then-undo-project",
    projectName: "保存后 Undo",
    nodes: [node],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();
  const requests: Array<{ body: string; resolve: (response: Response) => void }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_input, init) => new Promise<Response>((resolve) => {
    requests.push({ body: String(init?.body ?? ""), resolve });
  });

  try {
    const transaction = beginHistoryTransaction("save-then-undo");
    moveNode(node.id, 500);
    const saving = useFlowStore.getState().saveProject();
    useFlowStore.getState().undo();
    assert.equal(requests.length, 0);

    assert.equal(endHistoryTransaction(transaction), true);
    await flushCommandMicrotasks(12);
    assert.equal(requests.length, 1);
    const firstPayload = JSON.parse(requests[0].body) as { flow: { nodes: FlowNode[] } };
    assert.deepEqual(firstPayload.flow.nodes[0].position, { x: 500, y: 24 });
    assert.notEqual(firstPayload.flow.nodes[0].dragging, true);
    assert.deepEqual(activeDocument().nodes[0].position, { x: 320, y: 0 });

    requests[0].resolve(Response.json({ ok: true }));
    await flushCommandMicrotasks(12);
    assert.equal(requests.length, 2, "Undo 改变 revision 后应补写最新快照");
    const secondPayload = JSON.parse(requests[1].body) as { flow: { nodes: FlowNode[] } };
    assert.deepEqual(secondPayload.flow.nodes[0].position, { x: 320, y: 0 });

    requests[1].resolve(Response.json({ ok: true }));
    assert.equal(await saving, true);
    assert.equal(activeDocument().dirty, false);
    assert.equal(activeDocument().saveState, "saved");
    assert.equal(useFlowStore.temporal.getState().futureStates.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("新建项目首次生成会先保存同一份项目，再提交运行", async () => {
  useFlowStore.getState().createBlankTab();
  addRunnableAiNode(aiNode("first-run-ai", "首次生成"));
  const projectId = activeDocument().projectId;
  const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    requests.push({ url, body });
    if (url === "/api/projects") return Response.json({ ok: true });
    if (url === "/api/run-plan") {
      return Response.json({ error: "测试在付费调用前终止" }, { status: 400 });
    }
    throw new Error(`意外请求：${url}`);
  };

  try {
    await useFlowStore.getState().runNode("first-run-ai");
    assert.deepEqual(requests.map((request) => request.url), ["/api/projects", "/api/run-plan"]);

    const saveBody = requests[0].body as {
      id: string;
      flow: { nodes: FlowNode[]; edges: Edge[] };
    };
    const runBody = requests[1].body as {
      projectId: string;
      nodes: FlowNode[];
      edges: Edge[];
    };
    assert.equal(saveBody.id, projectId);
    assert.equal(runBody.projectId, projectId);
    assert.deepEqual(runBody.nodes, saveBody.flow.nodes);
    assert.deepEqual(runBody.edges, saveBody.flow.edges);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("runNode 等待拖拽结束后向保存与运行提交同一最终快照", async () => {
  const node = aiNode("drag-run-node", "拖拽后运行");
  const graph = runnableAiGraph(node);
  useFlowStore.getState().openFlowTab({
    projectId: "drag-run-project",
    projectName: "拖拽后运行",
    nodes: graph.nodes,
    edges: graph.edges,
  });
  const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    requests.push({ url, body });
    if (url === "/api/projects") return Response.json({ ok: true });
    if (url === "/api/run-plan") {
      return Response.json({ error: "测试在付费调用前终止" }, { status: 400 });
    }
    throw new Error(`意外请求：${url}`);
  };

  try {
    const transaction = beginHistoryTransaction("drag-before-run");
    moveNode(node.id, 384);
    const running = useFlowStore.getState().runNode(node.id);
    assert.equal(requests.length, 0, "运行不得读取拖拽中间帧");

    moveNode(node.id, 544);
    assert.equal(endHistoryTransaction(transaction), true);
    await running;

    assert.deepEqual(requests.map((request) => request.url), ["/api/projects", "/api/run-plan"]);
    const savedNodes = (requests[0].body as { flow: { nodes: FlowNode[] } }).flow.nodes;
    const runNodes = (requests[1].body as { nodes: FlowNode[] }).nodes;
    const savedTarget = savedNodes.find((candidate) => candidate.id === node.id);
    assert.ok(savedTarget);
    assert.deepEqual(savedTarget.position, { x: 544, y: 24 });
    assert.notEqual(savedTarget.dragging, true);
    assert.deepEqual(runNodes, savedNodes);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("runNode 创建 queued 记录时保留当前结果选择", async () => {
  const graph = runnableAiGraph(aiNode("queued-selection-node", "不抢占选择"));
  useFlowStore.getState().openFlowTab({
    projectId: "queued-selection-project",
    projectName: "运行选择测试",
    nodes: graph.nodes,
    edges: graph.edges,
  });
  const keptResult = {
    id: "kept-result-selection",
    image: "/api/files/kept.png",
    nodeId: "older-node",
    nodeLabel: "原已选结果",
    kind: "image",
    projectId: "older-project",
    startedAt: 1,
    finishedAt: 2,
    status: "success",
  } satisfies RecentResult;
  useFlowStore.setState({ recentResults: [keptResult] });
  useFlowStore.getState().setSelectedResultId(keptResult.id);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url === "/api/projects") return Response.json({ ok: true });
    if (url === "/api/run-plan") {
      return Response.json({ error: "测试在调用生图服务前终止" }, { status: 400 });
    }
    throw new Error(`意外请求：${url}`);
  };

  try {
    const running = useFlowStore.getState().runNode("queued-selection-node");
    const queued = useFlowStore.getState().recentResults.find(
      (record) => record.nodeId === "queued-selection-node",
    );
    assert.equal(queued?.status, "queued");
    assert.equal(activeDocument().selectedResultId, keptResult.id);
    await running;
    assert.equal(activeDocument().selectedResultId, keptResult.id);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("历史安全门从 runNode 唯一入口阻止新的付费运行", async () => {
  useFlowStore.getState().openFlowTab({
    projectId: "history-gate-project",
    projectName: "历史安全门测试",
    nodes: [aiNode("history-gate-node", "门禁节点")],
    edges: [],
  });
  const before = useFlowStore.getState().recentResults.length;
  const beforeStatus = activeDocument().nodes[0].data.status;
  const originalFetch = globalThis.fetch;
  let requested = false;
  globalThis.fetch = async () => {
    requested = true;
    throw new Error("安全门开启时不应发起请求");
  };
  setGenerationSafetyBlockReason("运行历史同步失败");

  try {
    await useFlowStore.getState().runNode("history-gate-node");
    assert.equal(requested, false);
    assert.equal(useFlowStore.getState().recentResults.length, before);
    assert.equal(activeDocument().nodes[0].data.status, beforeStatus);
  } finally {
    setGenerationSafetyBlockReason(null);
    globalThis.fetch = originalFetch;
  }
});

await test("Gemini 选择经上传回写、加蒙版、切页与运行全程保真", async () => {
  const generationNode = aiNode("model-invariant-ai", "Gemini 保真节点");
  generationNode.data.status = "idle";
  if (generationNode.data.kind !== "image-generator") throw new Error("测试生成节点类型错误");
  const invariantPrompt = textNode("model-invariant-prompt", "保持 Gemini 精确参数");
  const invariantUpload = imageNode("model-invariant-upload", "异步上传");
  if (invariantUpload.data.kind !== "image") throw new Error("测试上传节点类型错误");
  useFlowStore.getState().openFlowTab({
    projectId: "model-invariant-project",
    projectName: "模型保真项目",
    nodes: [invariantUpload, invariantPrompt, generationNode],
    edges: [
      { id: "model-invariant-edge", source: "model-invariant-upload", target: generationNode.id },
      {
        id: "model-invariant-prompt-edge",
        source: invariantPrompt.id,
        target: generationNode.id,
        targetHandle: "prompt",
      },
    ],
  });
  const invariantTabId = useFlowStore.getState().activeTabId;
  const expected = {
    modelId: geminiTestVariant.modelId,
    modelOptions: geminiTestParameters.modelOptions,
  };

  useFlowStore.getState().updateNodeData(generationNode.id, {
    ...expected,
    aspectRatio: geminiTestParameters.aspectRatio,
    batchSize: geminiTestParameters.batchSize,
    promptVariantId: geminiTestVariant.variantId,
    promptFamilyId: geminiTestVariant.familyId,
    parameterProfileId: geminiTestVariant.parameterProfileId,
    contractHash: geminiTestVariant.contractHash,
    evaluationVersion: geminiTestVariant.evaluationVersion,
    postprocessVersion: geminiTestProfile.postprocess.version,
  });
  assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

  await Promise.resolve().then(() => {
    useFlowStore.getState().updateNodeDataInTab(documentTargetForTab(invariantTabId), "model-invariant-upload", {
      status: "success",
      outputImages: ["/api/files/model-invariant-upload.png"],
    });
  });
  assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

  useFlowStore.getState().addExistingNode({
    id: "model-invariant-mask",
    type: "image-generator",
    position: { x: 320, y: 240 },
    data: {
      kind: "image-generator",
      label: "蒙版局部重绘",
      status: "idle",
      promptVariantId: geminiTestVariant.variantId,
      modelId: "gpt-image-2.5-sunburst",
      modelOptions: {},
      aspectRatio: "3:4",
      batchSize: 1,
    },
  });
  useFlowStore.getState().onConnect({
    source: "model-invariant-upload",
    target: "model-invariant-mask",
    sourceHandle: null,
    targetHandle: null,
  });
  assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

  useFlowStore.getState().openFlowTab({
    projectId: "model-invariant-other-project",
    projectName: "切换目标项目",
    nodes: [imageNode("model-invariant-other-upload", "另一页")],
    edges: [],
  });
  const storedInvariantTab = useFlowStore.getState().tabs.find((tab) => tab.id === invariantTabId);
  assert.ok(storedInvariantTab);
  assertNodeModelSelection(storedInvariantTab.nodes, generationNode.id, expected);
  useFlowStore.getState().switchTab(invariantTabId);
  assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

  const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    requests.push({ url, body });
    if (url === "/api/projects") return Response.json({ ok: true });
    if (url === "/api/run-plan") {
      return Response.json({ error: "测试在 Provider 调用前终止" }, { status: 400 });
    }
    throw new Error(`意外请求：${url}`);
  };

  try {
    await useFlowStore.getState().runNode(generationNode.id);
    assert.deepEqual(requests.map((request) => request.url), ["/api/projects", "/api/run-plan"]);
    assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

    const savedFlow = (requests[0].body as { flow: { nodes: FlowNode[] } }).flow;
    const runNodes = (requests[1].body as { nodes: FlowNode[] }).nodes;
    assertNodeModelSelection(savedFlow.nodes, generationNode.id, expected);
    assertNodeModelSelection(runNodes, generationNode.id, expected);
    assert.deepEqual(
      runNodes.find((node) => node.id === generationNode.id),
      savedFlow.nodes.find((node) => node.id === generationNode.id),
      "/projects 与 /run-plan 必须提交同一个目标节点快照",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("v7 原生参数由 Inspector 窗口唯一入口写回 modelOptions，节点体不设第二处编辑入口", () => {
  // 模型专属「业务画幅 ↔ provider 原生参数」联动助手行为保留（单元级契约）。
  assert.deepEqual(
    imageModelAspectRatioPatch(
      "gemini-3.1-flash-image",
      { aspectRatio: "3:4", imageSize: "2K" },
      "16:9",
    ),
    {
      aspectRatio: "16:9",
      modelOptions: { aspectRatio: "16:9", imageSize: "2K" },
    },
  );

  // v7：旧 InspectorPanel / AiModifyNode / SketchToRenderNode 的画幅入口已随三节点重构
  // 移除；v8（plan.md §3.3）原生参数改由生成节点内联面板唯一写回，避免两处入口漂移。
  const generatorPanelSource = fs.readFileSync(
    new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
    "utf8",
  );
  const imageGeneratorNodeSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageGeneratorNode.tsx", import.meta.url),
    "utf8",
  );
  const resultRecordDetailSource = fs.readFileSync(
    new URL("../src/components/panels/ResultRecordDetail.tsx", import.meta.url),
    "utf8",
  );
  const imageNodeSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageNode.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    generatorPanelSource,
    /updateNodeData\(nodeId, \{ modelOptions: \{ \.\.\.options, \[key\]: next \} \}\)/,
    "生成节点内联面板必须是原生参数唯一写回入口",
  );
  assert.match(
    imageGeneratorNodeSource,
    /GeneratorParamsPanel/,
    "生图节点必须挂载内联参数面板",
  );
  assert.doesNotMatch(
    resultRecordDetailSource,
    /modelOptions/,
    "结果记录视图不得成为第二处原生参数编辑入口（属性面板已整体删除）",
  );
  assert.doesNotMatch(
    imageNodeSource,
    /modelOptions:\s*\{/,
    "输入节点不得内联编辑原生参数（v8：参数在生成节点内联面板）",
  );
});

await test("项目保存失败时显示错误且绝不提交生成", async () => {
  useFlowStore.getState().createBlankTab();
  addRunnableAiNode(aiNode("blocked-first-run", "保存失败生成"));
  const requests: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    requests.push(String(input));
    return Response.json({ error: "保存服务暂不可用" }, { status: 503 });
  };

  try {
    await useFlowStore.getState().runNode("blocked-first-run");
    assert.deepEqual(requests, ["/api/projects"]);
    const failedNode = activeDocument().nodes.find((node) => node.id === "blocked-first-run");
    assert.equal(failedNode?.data.status, "error");
    assert.match(failedNode?.data.error ?? "", /项目保存失败.*未调用生图服务.*保存服务暂不可用/);
    const result = useFlowStore.getState().recentResults.find(
      (record) => record.nodeId === "blocked-first-run",
    );
    assert.equal(result?.status, "error");
    assert.match(result?.error ?? "", /项目保存失败.*未调用生图服务.*保存服务暂不可用/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("保存等待期间的编辑不会悄悄改变已点击的付费请求", async () => {
  useFlowStore.getState().createBlankTab();
  addRunnableAiNode(aiNode("snapshot-run", "快照生成"));
  const projectResolvers: Array<(response: Response) => void> = [];
  const runBodies: Array<{ nodes: FlowNode[] }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    const url = String(input);
    if (url === "/api/projects") {
      return new Promise<Response>((resolve) => projectResolvers.push(resolve));
    }
    if (url === "/api/run-plan") {
      runBodies.push(JSON.parse(String(init?.body ?? "{}")) as { nodes: FlowNode[] });
      return Promise.resolve(Response.json(
        { error: "画布尚未保存或已在其他位置更新，请保存后重试" },
        { status: 409 },
      ));
    }
    throw new Error(`意外请求：${url}`);
  };

  try {
    const running = useFlowStore.getState().runNode("snapshot-run");
    assert.equal(projectResolvers.length, 1);
    // v7：用户提示词归属上游 text 节点，图片节点不再携带 prompt；以持久化字段 label
    // 作为「保存等待期间发生编辑」的载体，验证付费请求仍绑定点击时的不可变快照。
    useFlowStore.getState().updateNodeData("snapshot-run", { label: "保存期间的新名称" });
    projectResolvers[0](Response.json({ ok: true }));
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(projectResolvers.length, 2, "保存队列应先持久化保存期间的编辑");
    projectResolvers[1](Response.json({ ok: true }));
    await running;

    assert.equal(runBodies.length, 1);
    const submitted = runBodies[0].nodes.find((node) => node.id === "snapshot-run");
    assert.equal(submitted?.data.kind, "image-generator");
    assert.equal(submitted?.data.label, "快照生成", "run-plan 必须提交点击时快照，不被等待期间的编辑改写");
    assert.match(
      activeDocument().nodes.find((node) => node.id === "snapshot-run")?.data.error ?? "",
      /画布尚未保存或已在其他位置更新/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("网络或网关响应不确定时复用同一请求号，已知 runId 后禁止重复付费", async () => {
  useFlowStore.getState().createBlankTab();
  addRunnableAiNode(aiNode("idempotent-run", "幂等生成"));
  const clientRequestIds: string[] = [];
  let submissions = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === "/api/projects") return Response.json({ ok: true });
    if (url === "/api/run-plan") {
      submissions += 1;
      const body = JSON.parse(String(init?.body ?? "{}")) as { clientRequestId?: string };
      assert.ok(body.clientRequestId);
      clientRequestIds.push(body.clientRequestId);
      if (submissions === 1) throw new TypeError("响应连接已断开");
      if (submissions === 2) {
        return Response.json({ error: "网关暂不可用" }, { status: 503 });
      }
      return Response.json({ runId: "idempotent-server-run", status: "queued" }, { status: 202 });
    }
    if (url === "/api/run-plan/idempotent-server-run") {
      return Response.json({ error: "状态服务暂不可用" }, { status: 503 });
    }
    throw new Error(`意外请求：${url}`);
  };

  try {
    await useFlowStore.getState().runNode("idempotent-run");
    const uncertain = activeDocument().nodes.find((node) => node.id === "idempotent-run");
    assert.equal(uncertain?.data.status, "outcome_unknown");
    assert.match(uncertain?.data.error ?? "", /同一请求号安全确认/);

    await useFlowStore.getState().runNode("idempotent-run");
    assert.deepEqual(clientRequestIds.length, 2);
    assert.equal(clientRequestIds[1], clientRequestIds[0]);
    const gatewayUnknown = activeDocument().nodes.find((node) => node.id === "idempotent-run");
    assert.equal(gatewayUnknown?.data.status, "outcome_unknown");

    await useFlowStore.getState().runNode("idempotent-run");
    assert.equal(clientRequestIds[2], clientRequestIds[0]);
    const recovering = activeDocument().nodes.find((node) => node.id === "idempotent-run");
    assert.equal(recovering?.data.status, "retry_wait");
    assert.match(recovering?.data.error ?? "", /勿重复提交/);

    await useFlowStore.getState().runNode("idempotent-run");
    assert.equal(submissions, 3, "已有 runId 但跟踪失败时必须继续阻止新的付费提交");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("丢失响应后即使参数变化收到 409，也持续复用原付费请求号", async () => {
  useFlowStore.getState().createBlankTab();
  addRunnableAiNode(aiNode("ambiguous-conflict", "歧义冲突"));
  const clientRequestIds: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === "/api/projects") return Response.json({ ok: true });
    if (url === "/api/run-plan") {
      const body = JSON.parse(String(init?.body ?? "{}")) as { clientRequestId?: string };
      assert.ok(body.clientRequestId);
      clientRequestIds.push(body.clientRequestId);
      if (clientRequestIds.length === 1) throw new TypeError("首次响应丢失");
      return Response.json(
        { error: "clientRequestId 已用于另一份生成请求，请重新提交" },
        { status: 409 },
      );
    }
    throw new Error(`意外请求：${url}`);
  };

  try {
    await useFlowStore.getState().runNode("ambiguous-conflict");
    useFlowStore.getState().updateNodeData("ambiguous-conflict", {
      prompt: buildGarmentPrompt(aiTestVariant.variantId, "响应丢失后的新提示词"),
    });
    await useFlowStore.getState().runNode("ambiguous-conflict");
    await useFlowStore.getState().runNode("ambiguous-conflict");
    assert.equal(clientRequestIds.length, 3);
    assert.deepEqual(new Set(clientRequestIds).size, 1, "409 后不得换新请求号再次付费");
    const node = activeDocument().nodes.find((candidate) => candidate.id === "ambiguous-conflict");
    assert.equal(node?.data.status, "outcome_unknown");
    assert.match(node?.data.error ?? "", /旧请求可能已创建任务/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("React Flow 初始化尺寸不会移动节点或标记项目未保存", () => {
  useFlowStore.getState().openFlowTab({
    projectId: "dimension-init-project",
    projectName: "尺寸初始化测试",
    nodes: [imageNode("dimension-node", "尺寸初始化节点")],
    edges: [],
  });
  const before = activeDocument();
  const originalPosition = { ...before.nodes[0].position };

  useFlowStore.getState().onNodesChange([{
    id: "dimension-node",
    type: "dimensions",
    dimensions: { width: 280, height: 162 },
  }]);

  const after = activeDocument();
  assert.equal(after.revision, before.revision);
  assert.equal(after.dirty, false);
  assert.deepEqual(after.nodes[0].position, originalPosition);
  assert.deepEqual(after.nodes[0].measured, { width: 280, height: 162 });
});

await test("打开含蒙版节点的项目时只订阅稳定的首张输入图", () => {
  // v8（R-83）：蒙版能力随生成层 UI 从 ImageNode 迁入 GeneratorParamsPanel；
  // 输入层 ImageNode 仍以 useShallow 稳定订阅输入图，蒙版源仍是稳定订阅后的首张输入图。
  const imageNodeSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageNode.tsx", import.meta.url),
    "utf8",
  );
  const panelSource = fs.readFileSync(
    new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(imageNodeSource, /selectNodeInputImages\(document, id\)/);
  assert.match(panelSource, /const maskSource = useFlowStore\(\s*useShallow\(/);
  assert.match(panelSource, /selectNodeInputImages\(document, nodeId\)\[0\]/);
  // 反例守卫：两个订阅位都不得退化为每次渲染都新建数组的裸订阅。
  assert.doesNotMatch(imageNodeSource, /const sourceImages = useFlowStore/);
  assert.doesNotMatch(panelSource, /const sourceImages = useFlowStore/);
});

await test("羽化宽度经生成层参数面板透传 MaskEditor 并在 0–64 内钳制，节点体不设滑块", () => {
  // v8（R-83）：蒙版编辑器入口随生成层 UI 迁入 GeneratorParamsPanel；该面板只把已保存的
  // featherRadius 透传给 MaskEditor（缺省 = 自适应），节点层不设第二处输入控件。
  const panelSource = fs.readFileSync(
    new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
    "utf8",
  );
  const imageNodeSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageNode.tsx", import.meta.url),
    "utf8",
  );
  const editorSource = fs.readFileSync(
    new URL("../src/components/nodes/MaskEditor.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    panelSource,
    /<MaskEditor[\s\S]*featherRadius=\{typeof \(data as ImageGeneratorNodeData\)\.featherRadius === "number"[\s\S]*: undefined\}/,
  );
  assert.doesNotMatch(panelSource, /<input[^>]*type="range"/);
  assert.doesNotMatch(imageNodeSource, /<input[^>]*type="range"/);
  assert.match(editorSource, /featherRadius\?: number/);
  // 0–64 边界钳制（原 Slider 的 min/max 约束）现在由预览侧保证。
  assert.match(editorSource, /Math\.max\(0, Math\.min\(64, Math\.round\(featherRadius\)\)\)/);
  assert.match(editorSource, /adaptiveMaskFeatherRadius\(overlay\.width, overlay\.height, expansionRadius\)/);
});

await test("保存当前原图的蒙版后局部重绘按钮立即恢复可点击", () => {
  const sourceRef = "/api/files/mask-source";
  useFlowStore.getState().openFlowTab({
    projectId: "mask-readiness-project",
    projectName: "蒙版按钮测试",
    nodes: [
      {
        id: "mask-source",
        type: "image",
        position: { x: 0, y: 0 },
        data: {
          kind: "image",
          label: "蒙版原图",
          status: "success",
          outputImages: [sourceRef],
        },
      },
      {
        id: "mask-node",
        type: "image-generator",
        position: { x: 320, y: 0 },
        data: {
          kind: "image-generator",
          label: "蒙版局部重绘",
          status: "idle",
          promptVariantId: "",
          modelId: "gpt-image-2.5-sunburst",
          modelOptions: {},
          aspectRatio: "3:4",
          batchSize: 1,
        },
      },
    ],
    edges: [{ id: "mask-edge", source: "mask-source", target: "mask-node" }],
  });

  const source = selectNodeInputImages(activeDocument(), "mask-node")[0];
  assert.equal(source, sourceRef);
  const beforeSave = maskRedrawReadiness({ source, prompt: "" });
  assert.equal(beforeSave.canOpenRunAction, false);

  useFlowStore.getState().updateNodeData("mask-node", {
    mask: "data:image/png;base64,bWFzaw==",
    maskSourceRef: source,
  });
  const savedNode = activeDocument().nodes.find((node) => node.id === "mask-node");
  assert.equal(savedNode?.data.kind, "image-generator");
  if (savedNode?.data.kind !== "image-generator") throw new Error("蒙版节点丢失");
  const afterSave = maskRedrawReadiness({
    source,
    mask: savedNode.data.mask,
    maskSourceRef: savedNode.data.maskSourceRef,
    // v8：正文由上游 text 节点提供，蒙版节点的就绪判定只关心蒙版本身。
    prompt: "",
  });
  assert.equal(afterSave.hasCurrentMask, true);
  assert.equal(afterSave.canOpenRunAction, true, "保存蒙版后按钮不应再因提示词为空而保持 disabled");
  assert.equal(afterSave.canSubmit, false, "提示词仍应在点击动作时单独校验");

  const afterPrompt = maskRedrawReadiness({
    source,
    mask: "data:image/png;base64,bWFzaw==",
    maskSourceRef: source,
    prompt: "将选中区域改成银色拉链",
  });
  assert.equal(afterPrompt.canSubmit, true);

  const staleMask = maskRedrawReadiness({
    source: "/api/files/new-source",
    mask: "data:image/png;base64,bWFzaw==",
    maskSourceRef: source,
    prompt: "将选中区域改成银色拉链",
  });
  assert.equal(staleMask.canOpenRunAction, false, "原图变化后旧蒙版仍必须禁用");
});

await test("蒙版编辑与上传分别持有离页保护，释放操作幂等", () => {
  assert.equal(useFlowStore.getState().pendingMaskWorkCount, 0);
  const releaseEditor = beginMaskWork();
  const releaseUpload = beginMaskWork();
  assert.equal(useFlowStore.getState().pendingMaskWorkCount, 2);
  assert.equal(shouldWarnBeforeWorkspaceUnload({
    hasDirtyTabs: false,
    tabSessionPersistenceError: null,
    pendingMaskWorkCount: useFlowStore.getState().pendingMaskWorkCount,
  }), true, "尚未写入节点的蒙版工作也必须阻止静默离页");

  releaseEditor();
  assert.equal(useFlowStore.getState().pendingMaskWorkCount, 1, "编辑器卸载不能清除仍在进行的上传 pending");
  releaseEditor();
  assert.equal(useFlowStore.getState().pendingMaskWorkCount, 1, "重复 cleanup 不得重复递减");
  releaseUpload();
  assert.equal(useFlowStore.getState().pendingMaskWorkCount, 0);

  assert.equal(shouldWarnBeforeWorkspaceUnload({
    hasDirtyTabs: true,
    tabSessionPersistenceError: "quota",
    pendingMaskWorkCount: 0,
  }), true);
  assert.equal(shouldWarnBeforeWorkspaceUnload({
    hasDirtyTabs: true,
    tabSessionPersistenceError: null,
    pendingMaskWorkCount: 0,
  }), false, "会话快照正常时普通 dirty 页签仍可刷新恢复");
});

await test("蒙版异步保存接线冻结编辑、校验最新原图并保持失败界面", () => {
  const editorSource = fs.readFileSync(
    new URL("../src/components/nodes/MaskEditor.tsx", import.meta.url),
    "utf8",
  );
  // v8（R-83）：蒙版上传 pending 与原图校验随生成层 UI 迁入 GeneratorParamsPanel.onSave 闭包。
  const redrawSource = fs.readFileSync(
    new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
    "utf8",
  );
  const appSource = fs.readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const authSource = fs.readFileSync(new URL("../src/auth/AuthContext.tsx", import.meta.url), "utf8");
  const topBarSource = fs.readFileSync(
    new URL("../src/components/panels/TopBar.tsx", import.meta.url),
    "utf8",
  );
  assert.match(editorSource, /if \(!ready \|\| savingRef\.current\) return/);
  assert.match(editorSource, /onClick=\{onClose\} disabled=\{saving\}/);
  assert.match(editorSource, /aria-disabled=\{saving\}/);
  assert.match(editorSource, /loadGuardRef\.current\.invalidate\(\)/);
  assert.match(editorSource, /if \(!isCurrentLoad\(\)\) return/);
  assert.match(editorSource, /const snapshotLoadGuardRef = useRef\(createLatestMaskLoadGuard\(\)\)/);
  assert.match(editorSource, /const isCurrentLoad = snapshotLoadGuardRef\.current\.begin\(\)/);
  assert.ok(
    (editorSource.match(/snapshotLoadGuardRef\.current\.invalidate\(\)/g) ?? []).length >= 6,
    "source 切换、初始化、绘制、清空、反选与保存都必须废弃旧历史加载",
  );
  assert.match(redrawSource, /const releaseUploadPending = beginMaskWork\(\)/);
  assert.match(redrawSource, /finally \{\s*releaseUploadPending\(\)/);
  assert.match(redrawSource, /selectNodeInputImages\(currentTab, nodeId\)\[0\] !== maskSource/);
  // R-94：AGENTS.md §3 要求蒙版这类异步写入绑定发起页签的 tabId + projectId + documentEpoch。
  // 当前 v8 实现回退为 updateNodeData(nodeId, ...)（写「提交时」的活动文档），此断言不弱化：
  // 必须回到 updateNodeDataInTab(target, nodeId, ...)。缺陷已在本卡评论上交。
  assert.match(redrawSource, /updateNodeDataInTab\(target, nodeId, \{ mask: url, maskSourceRef: maskSource/);
  assert.match(appSource, /shouldWarnBeforeWorkspaceUnload\(\{/);
  assert.match(appSource, /isWorkspaceUnloadWarningSuppressed\(\)/);
  assert.match(appSource, /window\.addEventListener\("beforeunload", warnBeforeUnload\)/);
  assert.match(appSource, /pendingMaskWorkCount > 0\) return/);
  assert.match(authSource, /const authenticatedUserId = useRef<string \| null>\(null\)/);
  assert.match(authSource, /shouldReloadForAuthenticatedUserTransition\(\s*authenticatedUserId\.current/);
  assert.match(authSource, /suppressWorkspaceUnloadWarning\(\);\s*window\.location\.reload\(\)/);
  assert.match(topBarSource, /onClick=\{retryTabSessionPersistence\}/);
});

await test("桌面工作台使用稳定 Dock，主题通过三列网格严格居中", () => {
  const appSource = fs.readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const topBarSource = fs.readFileSync(
    new URL("../src/components/panels/TopBar.tsx", import.meta.url),
    "utf8",
  );
  const projectTabsSource = fs.readFileSync(
    new URL("../src/components/panels/ProjectTabs.tsx", import.meta.url),
    "utf8",
  );
  const projectCenterSource = fs.readFileSync(
    new URL("../src/components/panels/ProjectCenter.tsx", import.meta.url),
    "utf8",
  );
  const shellSource = fs.readFileSync(
    new URL("../src/components/workbench/WorkbenchShell.tsx", import.meta.url),
    "utf8",
  );

  // 2026-09-25 决策：左侧 Dock 与「属性 / 结果」入口整体移除后，工作台外壳只接收
  // 中心画布子树，不再有 library / inspector 两个面板插槽。
  assert.match(appSource, /<WorkbenchShell>/);
  assert.doesNotMatch(appSource, /library=\{<|inspector=\{</);
  assert.equal((shellSource.match(/\{children\}/g) ?? []).length, 1);
  assert.doesNotMatch(shellSource, /\{library\}|\{inspector\}|activePanel/);
  assert.doesNotMatch(shellSource, /MobileSheet|useMediaQuery|mobilePanel/);
  // 「属性 / 结果」入口与 Dock 容器（aria-controls / 两个 panel id / Dock 宽度过渡）已整体删除。
  assert.doesNotMatch(shellSource, /aria-controls|transition-\[width,visibility\]|w-80/);
  assert.match(topBarSource, /grid-cols-\[1fr_auto_1fr\]/);
  assert.match(topBarSource, /Coin AI - Canvas/);
  assert.match(topBarSource, /<ThemeSwitcher \/>/);
  assert.match(topBarSource, /absolute left-full ml-2/);
  assert.match(topBarSource, /<DropdownMenu>/);
  assert.match(topBarSource, /aria-label="查看快捷键"/);
  assert.match(topBarSource, /className="w-56 min-w-56/);
  assert.match(topBarSource, /<DropdownMenuShortcut/);
  assert.doesNotMatch(topBarSource, /onPointerEnter|点击图标可固定|setTimeout\(/);
  assert.doesNotMatch(topBarSource, /GARMENT CANVAS|ProjectPicker/);
  assert.doesNotMatch(appSource, /TemplatesDock/);
  assert.match(projectTabsSource, /<LazyProjectCenter open=\{projectCenterOpen\}/);
  assert.match(projectTabsSource, /onFocus=\{\(\) => void loadProjectCenter\(\)\}/);
  assert.match(projectTabsSource, /onPointerEnter=\{\(\) => void loadProjectCenter\(\)\}/);
  assert.match(projectTabsSource, /onDoubleClick=\{\(\) => beginRename\(tab\)\}/);
  assert.match(projectTabsSource, /aria-label="保存项目名称和画布"/);
  assert.match(projectTabsSource, /event\.nativeEvent\.isComposing \|\| renameComposingRef\.current/);
  assert.match(projectTabsSource, /const saved = await saveProject\(\)/);
  assert.match(projectTabsSource, /if \(!saved\) \{[\s\S]*setRenameError/);
  assert.match(projectTabsSource, /onBlur=\{\(event\) => \{[\s\S]*setEditingTabId\(null\)/);
  assert.match(projectTabsSource, /role="alert"/);
  // 2026-09-25 决策 3：项目中心只保留「最近项目」——「内置模板」迁到左侧工作流二级菜单,
  // 「我的模板」与「保存当前画布为模板」整体取消（模板/项目都自带自动保存）。
  assert.match(projectCenterSource, /最近项目/);
  assert.doesNotMatch(projectCenterSource, /内置模板|我的模板|保存当前画布为模板/);
  assert.doesNotMatch(projectCenterSource, /<Tabs|TabsTrigger|TabsContent|inferTemplateLaunchMode|launchTemplateInNewTab/);
  assert.doesNotMatch(projectCenterSource, /DELETE|AlertDialog|DropdownMenu|SAVE_TEMPLATE_COVER|BUILTIN_TEMPLATE_COVERS|templateProductPolicy/);
  assert.doesNotMatch(projectCenterSource, /projectDetails/);
  assert.match(projectCenterSource, /const requestVersion = \+\+openRequestVersion\.current/);
  assert.match(projectCenterSource, /if \(requestVersion !== openRequestVersion\.current\) return/);
  assert.match(projectCenterSource, /NEW_PROJECT_COVER/);
  assert.match(projectCenterSource, /EMPTY_PROJECT_COVER/);
  assert.match(projectCenterSource, /PROJECT_CENTER_CARD_GRID_CLASS = "grid grid-cols-3 xl:grid-cols-4 gap-4"/);
  assert.match(projectCenterSource, /PROJECT_CENTER_TITLE_CLASS = "min-w-0 flex-1 line-clamp-2 min-h-8 text-xs font-semibold text-\[var\(--gc-text\)\]"/);
  // 内置模板的落点在左侧工作流二级菜单：菜单项 → 映射表 → 合并进当前活动画布（不新建页签）。
  assert.match(shellSource, /WORKFLOW_MENU_MAPPING/);
  assert.match(shellSource, /mergeTemplateIntoActiveCanvas/);
  assert.match(shellSource, /workspaceEmpty &&/);
});

await test("最近生成成功卡显式提供查看、对比、下载与设为输入动作", () => {
  const resultsPanelSource = fs.readFileSync(
    new URL("../src/components/panels/ResultsPanel.tsx", import.meta.url),
    "utf8",
  );
  // 2026-09-25：卡片与「结果详情」弹窗共用同一套动作实现，避免两处漂移。
  const resultActionsSource = fs.readFileSync(
    new URL("../src/lib/resultActions.ts", import.meta.url),
    "utf8",
  );
  const resultDetailDialogSource = fs.readFileSync(
    new URL("../src/components/panels/ResultDetailDialog.tsx", import.meta.url),
    "utf8",
  );
  assert.match(resultsPanelSource, /aria-label=\{`查看 \$\{r\.nodeLabel\}`\}/);
  assert.match(resultsPanelSource, /aria-label=\{`\$\{compareIds\.includes\(r\.id\) \? "取消" : "加入"\}对比 \$\{r\.nodeLabel\}`\}/);
  assert.match(resultsPanelSource, /href=\{r\.image\}[\s\S]*download/);
  assert.match(resultsPanelSource, /aria-label=\{`将 \$\{r\.nodeLabel\} 设为输入，继续处理`\}/);
  // 「设为输入」的写回与落点引导在共享模块里，卡片只负责触发。
  assert.match(resultActionsSource, /state\.addAssetNode\(\s*\{ name: result\.nodeLabel, image: result\.image \}/);
  assert.match(resultActionsSource, /requestCanvasLanding\(\{ tabId: tab\.id, nodeId, fitView: false \}\)/);
  // 结果详情弹窗必须保留同一组结果能力（查看大图 / 对比 / 下载 / 设为输入）。
  assert.match(resultDetailDialogSource, /from "@\/lib\/resultActions"/);
  assert.match(resultDetailDialogSource, /openResultViewer\(record\)/);
  assert.match(resultDetailDialogSource, /设为输入/);
  assert.match(resultDetailDialogSource, /下载/);
  assert.doesNotMatch(resultsPanelSource, /openViewer/, "卡片本身不再直接打开查看器，改由详情弹窗进入");
  assert.match(resultsPanelSource, /isNodeRunActive\(r\.status\)/);
  assert.match(resultsPanelSource, /r\.status !== "success"/);
  assert.match(resultsPanelSource, /grid-cols-2/);
  assert.match(resultsPanelSource, /text-\[var\(--gc-media-overlay-text\)\]/);
});

console.log(`\n通过 ${passed} 项`);
