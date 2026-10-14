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
    // v9（64 Phase 3）：提示词正文由上游 text 节点供词——「换提示词」改的是 text 节点。
    useFlowStore.getState().updateNodeData("ambiguous-conflict-prompt", {
      text: "响应丢失后的新提示词",
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


console.log(`\n通过 ${passed} 项`);
