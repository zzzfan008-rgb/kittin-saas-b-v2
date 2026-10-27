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

await test("保存期间继续编辑会排队并最终写入最新版本", async () => {
  // 自包含：原单文件依赖前序用例留下的空白活动页签；拆分后头部自带 A/B 页签，需新建空白页签。
  useFlowStore.getState().createBlankTab();
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


console.log(`\n通过 ${passed} 项`);
