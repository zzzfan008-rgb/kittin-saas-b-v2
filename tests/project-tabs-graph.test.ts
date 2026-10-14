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
const AI_TEST_MODEL_ID = "gpt-image-2.5-flare-vip";
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


console.log(`\n通过 ${passed} 项`);
