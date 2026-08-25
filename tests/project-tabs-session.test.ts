import assert from "node:assert/strict";
import { setGenerationSafetyBlockReason } from "../src/store/generationSafety";
import type { DocumentTarget } from "../src/store/flowStore";

interface MemoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function memoryStorage(
  initial: Record<string, string> = {},
  onSet?: (key: string) => void,
  shouldFail?: (key: string, value: string) => boolean,
): MemoryStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      onSet?.(key);
      if (shouldFail?.(key, value)) {
        const error = new Error("quota exceeded");
        error.name = "QuotaExceededError";
        throw error;
      }
      values.set(key, value);
    },
    removeItem: (key) => values.delete(key),
  };
}

function storedSelectionNode(id: string, selected?: boolean) {
  return {
    id,
    type: "image-input",
    position: { x: 0, y: 0 },
    data: {
      kind: "image-input",
      label: id,
      status: "idle",
      imageRole: "default",
    },
    ...(selected === undefined ? {} : { selected }),
  };
}

function storedSelectionTab(
  id: string,
  nodes: ReturnType<typeof storedSelectionNode>[],
  selection: {
    selectedNodeIds?: unknown;
    selectedNodeId?: unknown;
  } = {},
) {
  return {
    id,
    projectId: `project-${id}`,
    projectName: `项目 ${id}`,
    nodes,
    edges: [],
    selectedResultId: null,
    compareIds: [],
    saveState: "idle",
    revision: 0,
    savedRevision: 0,
    dirty: false,
    documentEpoch: 0,
    ...selection,
  };
}

const sessionKey = "garment-canvas-project-tabs";
const recentKey = "garment-canvas-recent-results";
const restoredEdge = { id: "edge-a-b", source: "node-a", target: "node-b" };
const storedSession = {
  activeTabId: "tab-a",
  tabs: [
    {
      id: "tab-a",
      projectId: "project-a",
      projectName: "项目 A",
      nodes: [
        {
          id: "node-a",
          type: "image-input",
          position: { x: 0, y: 0 },
          data: {
            kind: "image-input",
            label: "输入",
            status: "idle",
            imageRole: "default",
          },
        },
        {
          id: "node-b",
          type: "result",
          position: { x: 300, y: 0 },
          data: { kind: "result", label: "结果", status: "idle", images: [] },
        },
      ],
      edges: [restoredEdge],
      selectedNodeId: null,
      selectedResultId: null,
      compareIds: [],
      saveState: "saving",
      revision: 3,
      savedRevision: 2,
      dirty: true,
      documentEpoch: 0,
    },
  ],
};

const storedRecentResults = [
  {
    id: "record-project-b",
    image: "/api/files/project-b.png",
    nodeId: "node-project-b",
    nodeLabel: "项目 B 的生成记录",
    kind: "ai-modify",
    projectId: "project-b",
    projectName: "项目 B",
    startedAt: 1_000,
    finishedAt: 2_000,
    status: "success",
  },
  {
    id: "record-legacy",
    image: "/api/files/legacy.png",
    nodeId: "node-legacy",
    nodeLabel: "旧版生成记录",
    kind: "sketch-to-render",
    startedAt: 3_000,
    finishedAt: 4_000,
    status: "success",
  },
];

let sessionWrites = 0;
let failSessionWrites = false;
const sessionStorage = memoryStorage(
  { [sessionKey]: JSON.stringify(storedSession) },
  (key) => { if (key === sessionKey) sessionWrites += 1; },
  (key) => key === sessionKey && failSessionWrites,
);
const localStorage = memoryStorage({ [recentKey]: JSON.stringify(storedRecentResults) });
Object.assign(globalThis, { window: { sessionStorage, localStorage } });

const {
  applyRunEventToRecentResults,
  applyRunEventToTab,
  beginHistoryTransaction,
  discardActiveTabSession,
  endHistoryTransaction,
  normalizeTabSessionValue,
  reconcileRunHistory,
  retryTabSessionPersistence,
  selectActiveDocument,
  TAB_SESSION_SCHEMA_VERSION,
  useFlowStore,
} = await import("../src/store/flowStore");
const { createTemplateRequestPayload } = await import(
  "../src/components/panels/TemplatesDock"
);

function activeDocument(state = useFlowStore.getState()) {
  return selectActiveDocument(state);
}

function documentTargetForTab(tabId: string): DocumentTarget {
  const tab = useFlowStore.getState().tabs.find((candidate) => candidate.id === tabId);
  assert.ok(tab, `找不到页签 ${tabId}`);
  return { tabId, projectId: tab.projectId, documentEpoch: tab.documentEpoch };
}

// 本文件模拟的是历史已经完成对账后的会话恢复路径。
setGenerationSafetyBlockReason(null);
const state = useFlowStore.getState();
const document = activeDocument(state);

console.log("项目页签会话恢复测试");

assert.deepEqual(document.edges, [restoredEdge]);
assert.deepEqual(state.tabs[0].edges, [restoredEdge]);
console.log("  ✓ 刷新恢复活动页签的完整连线");

assert.equal(document.saveState, "idle");
assert.equal(state.tabs[0].saveState, "idle");
assert.equal(document.dirty, true);
console.log("  ✓ 刷新将中断的 saving 状态归一为 idle 并保留未保存标记");

const persisted = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as typeof storedSession;
assert.deepEqual(persisted.tabs[0].edges, [restoredEdge]);
assert.equal(persisted.tabs[0].saveState, "idle");
assert.equal((persisted as typeof storedSession & { schemaVersion: number }).schemaVersion, TAB_SESSION_SCHEMA_VERSION);
console.log("  ✓ 初始化持久化不会再次覆盖恢复后的连线或保存状态");

const migratedLegacySelection = normalizeTabSessionValue({
  activeTabId: "legacy-selection-tab",
  tabs: [storedSelectionTab(
    "legacy-selection-tab",
    [storedSelectionNode("legacy-node-a"), storedSelectionNode("legacy-node-b")],
    { selectedNodeId: "legacy-node-b" },
  )],
});
assert.ok(migratedLegacySelection);
assert.deepEqual(migratedLegacySelection.tabs[0].selectedNodeIds, ["legacy-node-b"]);
assert.equal(migratedLegacySelection.tabs[0].selectedNodeId, "legacy-node-b");
assert.deepEqual(
  migratedLegacySelection.tabs[0].nodes.map((node) => [node.id, Boolean(node.selected)]),
  [["legacy-node-a", false], ["legacy-node-b", true]],
);
console.log("  ✓ 旧 selectedNodeId 会迁移为 canonical selectedNodeIds");

const filteredInvalidSelection = normalizeTabSessionValue({
  activeTabId: "invalid-selection-tab",
  tabs: [storedSelectionTab(
    "invalid-selection-tab",
    [storedSelectionNode("valid-node-a"), storedSelectionNode("valid-node-b")],
    { selectedNodeIds: ["missing-node", "valid-node-b"] },
  )],
});
assert.ok(filteredInvalidSelection);
assert.deepEqual(filteredInvalidSelection.tabs[0].selectedNodeIds, ["valid-node-b"]);
assert.equal(filteredInvalidSelection.tabs[0].selectedNodeId, "valid-node-b");
assert.deepEqual(
  filteredInvalidSelection.tabs[0].nodes.map((node) => [node.id, Boolean(node.selected)]),
  [["valid-node-a", false], ["valid-node-b", true]],
);
console.log("  ✓ canonical selectedNodeIds 会过滤当前页签不存在的节点");

const canonicalSelectionWins = normalizeTabSessionValue({
  activeTabId: "canonical-selection-tab",
  tabs: [storedSelectionTab(
    "canonical-selection-tab",
    [storedSelectionNode("raw-selected-node", true), storedSelectionNode("canonical-node", false)],
    {
      selectedNodeIds: ["canonical-node"],
      selectedNodeId: "raw-selected-node",
    },
  )],
});
assert.ok(canonicalSelectionWins);
assert.deepEqual(canonicalSelectionWins.tabs[0].selectedNodeIds, ["canonical-node"]);
assert.equal(canonicalSelectionWins.tabs[0].selectedNodeId, "canonical-node");
assert.deepEqual(
  canonicalSelectionWins.tabs[0].nodes.map((node) => [node.id, Boolean(node.selected)]),
  [["raw-selected-node", false], ["canonical-node", true]],
);
console.log("  ✓ canonical selectedNodeIds 覆盖旧 selectedNodeId 与原始 node.selected");

const transientDraggingIsDiscarded = normalizeTabSessionValue({
  activeTabId: "dragging-session-tab",
  tabs: [storedSelectionTab(
    "dragging-session-tab",
    [{ ...storedSelectionNode("dragging-node"), dragging: true }],
  )],
});
assert.ok(transientDraggingIsDiscarded);
assert.equal(transientDraggingIsDiscarded.tabs[0].nodes[0].dragging, undefined);
console.log("  ✓ 会话恢复丢弃中断拖拽遗留的 dragging 瞬态");

const isolatedTabSelections = normalizeTabSessionValue({
  activeTabId: "selection-tab-b",
  tabs: [
    storedSelectionTab(
      "selection-tab-a",
      [storedSelectionNode("tab-a-node-1", true), storedSelectionNode("tab-a-node-2", false)],
      { selectedNodeIds: ["tab-a-node-2"] },
    ),
    storedSelectionTab(
      "selection-tab-b",
      [storedSelectionNode("tab-b-node-1", false), storedSelectionNode("tab-b-node-2", true)],
      { selectedNodeIds: ["tab-b-node-1"] },
    ),
  ],
});
assert.ok(isolatedTabSelections);
assert.equal(isolatedTabSelections.activeTabId, "selection-tab-b");
assert.deepEqual(
  isolatedTabSelections.tabs.map((tab) => ({
    id: tab.id,
    selectedNodeIds: tab.selectedNodeIds,
    selectedNodeId: tab.selectedNodeId,
    selectedFlags: tab.nodes.map((node) => [node.id, Boolean(node.selected)]),
  })),
  [
    {
      id: "selection-tab-a",
      selectedNodeIds: ["tab-a-node-2"],
      selectedNodeId: "tab-a-node-2",
      selectedFlags: [["tab-a-node-1", false], ["tab-a-node-2", true]],
    },
    {
      id: "selection-tab-b",
      selectedNodeIds: ["tab-b-node-1"],
      selectedNodeId: "tab-b-node-1",
      selectedFlags: [["tab-b-node-1", true], ["tab-b-node-2", false]],
    },
  ],
);
console.log("  ✓ canonical 节点选择按页签隔离恢复且不会串页");

const clearedResultReferences = normalizeTabSessionValue({
  activeTabId: "stale-result-reference-tab",
  tabs: [{
    ...storedSelectionTab(
      "stale-result-reference-tab",
      [storedSelectionNode("reference-node")],
    ),
    selectedResultId: "result-from-previous-session",
    compareIds: ["result-from-previous-session", "another-stale-result"],
  }],
});
assert.ok(clearedResultReferences);
assert.equal(clearedResultReferences.tabs[0].selectedResultId, null);
assert.deepEqual(clearedResultReferences.tabs[0].compareIds, []);
console.log("  ✓ 会话不恢复尚未通过当前账号服务器历史确认的结果引用");

const migrated = normalizeTabSessionValue({
  activeTabId: "legacy-tab",
  tabs: [{
    id: "legacy-tab",
    projectId: "legacy-project",
    projectName: "旧项目",
    nodes: [
      {
        id: "legacy-ai",
        type: "ai-modify",
        position: { x: 10, y: 20 },
        data: { kind: "ai-modify", label: "改款", status: "idle", prompt: "换领型" },
      },
      { id: "broken", type: "unknown", position: { x: 0, y: 0 }, data: {} },
      {
        id: "legacy-result",
        type: "result",
        position: { x: 300, y: 20 },
        data: { kind: "result", label: "结果", status: "idle" },
      },
    ],
    edges: [
      { id: "valid-edge", source: "legacy-ai", target: "legacy-result" },
      { id: "dangling-edge", source: "broken", target: "legacy-result" },
    ],
    saveState: "saving",
    revision: 4,
    savedRevision: 4,
    dirty: false,
  }],
});
assert.ok(migrated);
assert.equal(migrated.schemaVersion, TAB_SESSION_SCHEMA_VERSION);
assert.deepEqual(migrated.tabs[0].nodes.map((node) => node.id), ["legacy-ai", "legacy-result"]);
assert.deepEqual(migrated.tabs[0].edges.map((edge) => edge.id), ["valid-edge"]);
const migratedAi = migrated.tabs[0].nodes[0].data;
assert.equal(migratedAi.kind, "ai-modify");
if (migratedAi.kind !== "ai-modify") throw new Error("unexpected node kind");
assert.equal(migratedAi.aspectRatio, "1:1");
assert.equal(migratedAi.batchSize, 1);
assert.deepEqual(migratedAi.outputImages, []);
assert.equal(migrated.tabs[0].saveState, "idle");
assert.equal(migrated.tabs[0].dirty, true);
console.log("  ✓ 旧会话逐节点补齐必需字段，并隔离坏节点和悬空边");

const generalModelPairs = [
  { modelId: "gpt-image-2-vip", modelOptions: { size: "2048x1152" }, aspectRatio: "16:9" },
  {
    modelId: "gemini-3.1-flash-image",
    modelOptions: { aspectRatio: "16:9", imageSize: "4K" },
    aspectRatio: "16:9",
  },
  {
    modelId: "flux-2-pro",
    modelOptions: { width: 2048, height: 1152, outputFormat: "png" },
    aspectRatio: "16:9",
  },
  { modelId: "seedream-5-0-260128", modelOptions: { size: "3K" }, aspectRatio: "1:1" },
  {
    modelId: "grok-imagine-image",
    modelOptions: { aspectRatio: "4:3", resolution: "1k" },
    aspectRatio: "4:3",
  },
] as const;
const restoredModels = normalizeTabSessionValue(JSON.parse(JSON.stringify({
  activeTabId: "model-pairs-tab",
  tabs: [{
    id: "model-pairs-tab",
    projectId: "model-pairs-project",
    projectName: "通用模型恢复",
    nodes: generalModelPairs.map((pair, index) => ({
      id: `model-pair-${index}`,
      type: "ai-modify",
      position: { x: index * 80, y: 0 },
      data: {
        kind: "ai-modify",
        label: pair.modelId,
        status: "idle",
        prompt: "保留模型参数",
        aspectRatio: pair.aspectRatio,
        batchSize: 1,
        outputImages: [],
        modelId: pair.modelId,
        modelOptions: pair.modelOptions,
      },
    })),
    edges: [],
  }],
})))!;
assert.ok(restoredModels);
for (const [index, pair] of generalModelPairs.entries()) {
  const restoredNode = restoredModels.tabs[0].nodes.find((node) => node.id === `model-pair-${index}`);
  assert.ok(restoredNode, pair.modelId);
  assert.equal(restoredNode.data.modelId, pair.modelId);
  assert.deepEqual(restoredNode.data.modelOptions, pair.modelOptions);
}
console.log("  ✓ 五个通用模型的合法 modelId/modelOptions 会话恢复保真");

assert.deepEqual(state.recentResults, [], "登录后的历史必须以服务器为准，不能泄露上一账号的 localStorage");
const writesBeforeHistory = sessionWrites;
useFlowStore.setState({ recentResults: storedRecentResults as never });
assert.deepEqual(useFlowStore.getState().recentResults.map((record) => record.id), ["record-project-b", "record-legacy"]);
assert.equal(sessionWrites, writesBeforeHistory, "历史/SSE 更新不应重新序列化项目页签");
console.log("  ✓ 忽略本地跨账号缓存，并能渲染服务器恢复的全局历史");

useFlowStore.getState().openFlowTab({
  projectId: "run-recovery-project",
  projectName: "运行恢复项目",
  nodes: [{
    id: "run-recovery-node",
    type: "ai-modify",
    position: { x: 0, y: 0 },
    data: {
      kind: "ai-modify",
      label: "运行恢复节点",
      status: "queued",
      prompt: "换领型",
      aspectRatio: "1:1",
      batchSize: 1,
      modelId: "gpt-image-2-vip",
      modelOptions: { size: "2048x2048" },
      outputImages: [],
    },
  }],
  edges: [],
});
reconcileRunHistory([]);
assert.equal(activeDocument().nodes[0].data.status, "idle");
useFlowStore.getState().setNodeStatus("run-recovery-node", "queued");
reconcileRunHistory([{
  id: "server-active-record",
  runId: "server-active-run",
  clientRequestId: "server-active-request",
  image: "",
  nodeId: "run-recovery-node",
  nodeLabel: "运行恢复节点",
  kind: "ai-modify",
  projectId: "run-recovery-project",
  projectName: "运行恢复项目",
  startedAt: 5_000,
  status: "running",
}]);
assert.equal(activeDocument().nodes[0].data.status, "running");
assert.equal(
  useFlowStore.getState().recentResults.find((record) => record.id === "server-active-record")?.runId,
  "server-active-run",
);
reconcileRunHistory([{
  id: "late-open-active-record",
  runId: "late-open-active-run",
  image: "",
  nodeId: "late-open-node",
  nodeLabel: "稍后打开节点",
  kind: "ai-modify",
  projectId: "late-open-project",
  projectName: "稍后打开项目",
  startedAt: 6_000,
  status: "running",
}, {
  id: "late-open-older-record",
  runId: "late-open-older-run",
  image: "",
  nodeId: "late-open-node",
  nodeLabel: "稍后打开节点",
  kind: "ai-modify",
  projectId: "late-open-project",
  projectName: "稍后打开项目",
  startedAt: 5_500,
  status: "retry_wait",
}]);
useFlowStore.getState().openFlowTab({
  projectId: "late-open-project",
  projectName: "稍后打开项目",
  nodes: [{
    id: "late-open-node",
    type: "ai-modify",
    position: { x: 0, y: 0 },
    data: {
      kind: "ai-modify",
      label: "稍后打开节点",
      status: "idle",
      prompt: "换袖型",
      aspectRatio: "1:1",
      batchSize: 1,
      modelId: "gpt-image-2-vip",
      modelOptions: { size: "2048x2048" },
      outputImages: [],
    },
  }],
  edges: [],
});
assert.equal(activeDocument().nodes[0].data.status, "running");
console.log("  ✓ 历史确认会解除孤儿运行态，并恢复真实服务端任务");

const overflowActiveRecords = Array.from({ length: 180 }, (_, index) => ({
  id: `overflow-active-${index}`,
  runId: `overflow-run-${index}`,
  image: "",
  nodeId: `overflow-node-${index}`,
  nodeLabel: `活动节点 ${index}`,
  kind: "ai-modify" as const,
  projectId: `overflow-project-${index}`,
  projectName: `活动项目 ${index}`,
  startedAt: 10_000 - index,
  status: "running" as const,
}));
const overflowTerminalRecords = Array.from({ length: 160 }, (_, index) => ({
  id: `overflow-terminal-${index}`,
  runId: `overflow-terminal-run-${Math.floor(index / 8)}`,
  image: `/api/files/overflow-${index}.png`,
  nodeId: `terminal-node-${index}`,
  nodeLabel: "终态输出",
  kind: "ai-modify" as const,
  projectId: "terminal-project",
  projectName: "终态项目",
  startedAt: 20_000 - index,
  finishedAt: 21_000 - index,
  status: "success" as const,
}));
useFlowStore.getState().openFlowTab({
  projectId: "overflow-project-179",
  projectName: "最旧活动项目",
  nodes: [{
    id: "overflow-node-179",
    type: "ai-modify",
    position: { x: 0, y: 0 },
    data: {
      kind: "ai-modify",
      label: "最旧活动节点",
      status: "idle",
      prompt: "保持运行",
      aspectRatio: "1:1",
      batchSize: 1,
      modelId: "gpt-image-2-vip",
      modelOptions: { size: "2048x2048" },
      outputImages: [],
    },
  }],
  edges: [],
});
reconcileRunHistory([...overflowActiveRecords, ...overflowTerminalRecords]);
assert.equal(activeDocument().nodes[0].data.status, "running");
assert.equal(
  useFlowStore.getState().recentResults.some((record) => record.runId === "overflow-run-179"),
  true,
);
assert.equal(useFlowStore.getState().recentResults.length, 200);

useFlowStore.setState((current) => ({
  recentResults: applyRunEventToRecentResults(current.recentResults, "overflow-active-0", {
    type: "node-status",
    nodeId: "overflow-node-0",
    status: "success",
    images: ["/api/files/overflow-active-0.png"],
    finishedAt: 30_000,
  }),
}));
assert.equal(
  useFlowStore.getState().recentResults.some((record) => record.runId === "overflow-run-179"),
  true,
  "其他任务终态更新后，最旧活动 Run 仍须保留",
);
useFlowStore.getState().setNodeStatus("overflow-node-179", "idle");
const previousFetch = globalThis.fetch;
let generationRequests = 0;
try {
  globalThis.fetch = (async () => {
    generationRequests += 1;
    return Response.json({ error: "不应发出请求" }, { status: 500 });
  }) as typeof fetch;
  await useFlowStore.getState().runNode("overflow-node-179");
  assert.equal(generationRequests, 0, "活动历史门禁不得因展示裁剪而失效");
} finally {
  globalThis.fetch = previousFetch;
}
console.log("  ✓ 20 个八图终态叠加 180 个活动任务时仍保留完整活动门禁");

useFlowStore.getState().openFlowTab({
  projectId: "quota-project",
  projectName: "容量恢复项目",
  nodes: [{
    id: "quota-source",
    type: "image-input",
    position: { x: 0, y: 0 },
    data: {
      kind: "image-input", label: "原图", status: "idle", imageRole: "default",
      imageUrl: "/api/files/quota-source.png",
    },
  }, {
    id: "quota-mask",
    type: "mask-redraw",
    position: { x: 300, y: 0 },
    data: {
      kind: "mask-redraw", label: "局部重绘", status: "idle", prompt: "改色",
      modelId: "gpt-image-2", modelOptions: {}, outputImages: [],
      mask: "/api/files/old-mask.png", maskSourceRef: "/api/files/quota-source.png",
    },
  }],
  edges: [{ id: "quota-edge", source: "quota-source", target: "quota-mask" }],
});
assert.match(sessionStorage.getItem(sessionKey) ?? "", /old-mask\.png/);
failSessionWrites = true;
const oversizedInlineMask = `data:image/png;base64,${"x".repeat(300_000)}`;
useFlowStore.getState().updateNodeData("quota-mask", { mask: oversizedInlineMask });
assert.equal(sessionStorage.getItem(sessionKey), null, "写失败后必须移除旧快照，不能刷新恢复旧蒙版");
assert.match(useFlowStore.getState().tabSessionPersistenceError ?? "", /刷新会丢失/);

failSessionWrites = false;
useFlowStore.getState().updateNodeData("quota-mask", { mask: "/api/files/old-mask.png" });
assert.match(
  sessionStorage.getItem(sessionKey) ?? "",
  /old-mask\.png/,
  "失败后撤销回旧成功指纹也必须重新写入已被移除的 session key",
);
assert.equal(useFlowStore.getState().tabSessionPersistenceError, null);

failSessionWrites = true;
useFlowStore.getState().updateNodeData("quota-mask", { mask: oversizedInlineMask });
assert.equal(sessionStorage.getItem(sessionKey), null);
failSessionWrites = false;
assert.equal(retryTabSessionPersistence(), true, "同一份未变化快照必须能够显式重试");
assert.match(sessionStorage.getItem(sessionKey) ?? "", /data:image\/png;base64/);
assert.equal(useFlowStore.getState().tabSessionPersistenceError, null);
useFlowStore.getState().updateNodeData("quota-mask", { mask: "/api/files/latest-mask.png" });
const compactSession = sessionStorage.getItem(sessionKey) ?? "";
assert.match(compactSession, /latest-mask\.png/);
assert.doesNotMatch(compactSession, /data:image\/png;base64/);
console.log("  ✓ 容量写失败废弃旧快照并允许同内容重试，短蒙版 URL 可恢复持久化");

useFlowStore.getState().loadFlow({
  projectId: "drag-session-project",
  projectName: "拖拽会话项目",
  nodes: [{
    id: "drag-session-node",
    type: "image-input",
    position: { x: 0, y: 0 },
    data: { kind: "image-input", label: "拖拽节点", status: "idle", imageRole: "default" },
  }],
  edges: [],
});
const durableBeforeDrag = sessionStorage.getItem(sessionKey);
const writesBeforeDrag = sessionWrites;
const dragTransaction = beginHistoryTransaction("session-crash-contract");
useFlowStore.getState().onNodesChange([{
  id: "drag-session-node",
  type: "position",
  position: { x: 180, y: 72 },
  dragging: true,
}]);
assert.equal(sessionWrites, writesBeforeDrag, "未提交拖拽帧不得写入 session");
assert.equal(
  sessionStorage.getItem(sessionKey),
  durableBeforeDrag,
  "崩溃或刷新必须恢复拖拽前的 durable snapshot",
);
assert.equal(retryTabSessionPersistence(), false, "事务中显式重试也不得固化中间帧");
assert.equal(sessionStorage.getItem(sessionKey), durableBeforeDrag);

assert.equal(endHistoryTransaction(dragTransaction), true);
const durableAfterDrag = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as {
  tabs: Array<{
    projectId: string;
    nodes: Array<{ id: string; position: { x: number; y: number } }>;
    revision: number;
    dirty: boolean;
  }>;
};
const committedDragTab = durableAfterDrag.tabs.find((tab) => tab.projectId === "drag-session-project");
assert.deepEqual(
  committedDragTab?.nodes.find((node) => node.id === "drag-session-node")?.position,
  { x: 180, y: 72 },
);
assert.equal(committedDragTab?.revision, 1);
assert.equal(committedDragTab?.dirty, true);

useFlowStore.getState().loadFlow({
  projectId: "drag-session-no-move-success",
  projectName: "无位移成功项目",
  nodes: [{
    id: "drag-session-no-move-node",
    type: "ai-modify",
    position: { x: 0, y: 0 },
    data: {
      kind: "ai-modify",
      label: "无位移生成节点",
      status: "idle",
      prompt: "生成成功",
      aspectRatio: "1:1",
      batchSize: 1,
      outputImages: ["/api/files/before-no-move.png"],
    },
  }],
  edges: [],
});
const noMoveTabId = useFlowStore.getState().activeTabId;
const durableBeforeNoMoveSuccess = sessionStorage.getItem(sessionKey);
const writesBeforeNoMoveSuccess = sessionWrites;
const noMoveTransaction = beginHistoryTransaction("session-no-move-success");
applyRunEventToTab(documentTargetForTab(noMoveTabId), "drag-session-no-move-node", {
  type: "node-status",
  nodeId: "drag-session-no-move-node",
  status: "success",
  images: ["/api/files/no-move-success.png"],
});
assert.equal(sessionWrites, writesBeforeNoMoveSuccess, "无位移事务中的 success 必须延迟落盘");
assert.equal(sessionStorage.getItem(sessionKey), durableBeforeNoMoveSuccess);
assert.equal(endHistoryTransaction(noMoveTransaction), false);
const durableAfterNoMoveSuccess = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as {
  tabs: Array<{
    projectId: string;
    nodes: Array<{ id: string; data: { outputImages?: string[] } }>;
    revision: number;
    dirty: boolean;
  }>;
};
const noMoveSuccessTab = durableAfterNoMoveSuccess.tabs.find(
  (tab) => tab.projectId === "drag-session-no-move-success",
);
assert.deepEqual(
  noMoveSuccessTab?.nodes.find((node) => node.id === "drag-session-no-move-node")?.data.outputImages,
  ["/api/files/no-move-success.png"],
);
assert.equal(noMoveSuccessTab?.revision, 1);
assert.equal(noMoveSuccessTab?.dirty, true);

useFlowStore.getState().loadFlow({
  projectId: "drag-session-net-zero-success",
  projectName: "净零位移成功项目",
  nodes: [{
    id: "drag-session-net-zero-node",
    type: "ai-modify",
    position: { x: 0, y: 0 },
    data: {
      kind: "ai-modify",
      label: "净零位移生成节点",
      status: "idle",
      prompt: "生成成功",
      aspectRatio: "1:1",
      batchSize: 1,
      outputImages: ["/api/files/before-net-zero.png"],
    },
  }],
  edges: [],
});
const netZeroTabId = useFlowStore.getState().activeTabId;
const durableBeforeNetZeroSuccess = sessionStorage.getItem(sessionKey);
const writesBeforeNetZeroSuccess = sessionWrites;
const netZeroTransaction = beginHistoryTransaction("session-net-zero-success");
useFlowStore.getState().onNodesChange([{
  id: "drag-session-net-zero-node",
  type: "position",
  position: { x: 160, y: 64 },
  dragging: true,
}]);
applyRunEventToTab(documentTargetForTab(netZeroTabId), "drag-session-net-zero-node", {
  type: "node-status",
  nodeId: "drag-session-net-zero-node",
  status: "success",
  images: ["/api/files/net-zero-success.png"],
});
useFlowStore.getState().onNodesChange([{
  id: "drag-session-net-zero-node",
  type: "position",
  position: { x: 0, y: 0 },
  dragging: false,
}]);
assert.equal(sessionWrites, writesBeforeNetZeroSuccess, "净零位移事务中的 success 必须延迟落盘");
assert.equal(sessionStorage.getItem(sessionKey), durableBeforeNetZeroSuccess);
assert.equal(endHistoryTransaction(netZeroTransaction), false);
const durableAfterNetZeroSuccess = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as {
  tabs: Array<{
    projectId: string;
    nodes: Array<{
      id: string;
      position: { x: number; y: number };
      data: { outputImages?: string[] };
    }>;
    revision: number;
    dirty: boolean;
  }>;
};
const netZeroSuccessTab = durableAfterNetZeroSuccess.tabs.find(
  (tab) => tab.projectId === "drag-session-net-zero-success",
);
const durableNetZeroNode = netZeroSuccessTab?.nodes.find(
  (node) => node.id === "drag-session-net-zero-node",
);
assert.deepEqual(durableNetZeroNode?.position, { x: 0, y: 0 });
assert.deepEqual(durableNetZeroNode?.data.outputImages, ["/api/files/net-zero-success.png"]);
assert.equal(netZeroSuccessTab?.revision, 1);
assert.equal(netZeroSuccessTab?.dirty, true);
console.log("  ✓ 无位移与净零位移事务结束后补写期间完成的 success 输出");

useFlowStore.getState().loadFlow({
  projectId: "drag-session-project",
  projectName: "拖拽会话项目",
  nodes: [{
    id: "drag-session-node",
    type: "image-input",
    position: { x: 0, y: 0 },
    data: { kind: "image-input", label: "拖拽节点", status: "idle", imageRole: "default" },
  }],
  edges: [],
});
const firstDragTabId = useFlowStore.getState().activeTabId;
useFlowStore.getState().openFlowTab({
  projectId: "drag-session-switch-target",
  projectName: "切换目标",
  nodes: [{
    id: "drag-session-target-node",
    type: "image-input",
    position: { x: 0, y: 0 },
    data: { kind: "image-input", label: "目标节点", status: "idle", imageRole: "default" },
  }],
  edges: [],
});
const secondDragTabId = useFlowStore.getState().activeTabId;
useFlowStore.getState().switchTab(firstDragTabId);
const cancelledDrag = beginHistoryTransaction("session-switch-cancel");
useFlowStore.getState().onNodesChange([{
  id: "drag-session-node",
  type: "position",
  position: { x: 240, y: 96 },
  dragging: true,
}]);
useFlowStore.getState().switchTab(secondDragTabId);
assert.equal(endHistoryTransaction(cancelledDrag), false);
const durableAfterSwitch = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as {
  tabs: Array<{
    projectId: string;
    nodes: Array<{ id: string; position: { x: number; y: number } }>;
    revision: number;
    dirty: boolean;
  }>;
};
const cancelledDragTab = durableAfterSwitch.tabs.find((tab) => tab.projectId === "drag-session-project");
assert.deepEqual(
  cancelledDragTab?.nodes.find((node) => node.id === "drag-session-node")?.position,
  { x: 0, y: 0 },
);
assert.equal(cancelledDragTab?.revision, 0);
assert.equal(cancelledDragTab?.dirty, false);
console.log("  ✓ 拖拽中间帧不落 session，提交原子持久化，切页取消恢复 durable snapshot");

const unsafeDocumentNode = {
  id: "pure-boundary-node",
  type: "ai-modify",
  position: { x: 120, y: 48 },
  selected: true,
  dragging: true,
  measured: { width: 320, height: 180 },
  width: 320,
  height: 180,
  unknownNodeShell: "不得持久化",
  data: {
    kind: "ai-modify",
    label: "纯文档边界",
    status: "error",
    error: "旧运行错误不得持久化",
    prompt: "保留衣身，只修改领型",
    aspectRatio: "1:1",
    batchSize: 1,
    outputImages: ["/api/files/pure-boundary-before.png"],
    modelId: "gpt-image-2-vip",
    modelOptions: { size: "2048x2048" },
    unknownData: "不得持久化",
  },
} as import("../src/store/flowStore").FlowNode;
const unsafeDocumentEdge = {
  id: "pure-boundary-edge",
  source: "pure-boundary-node",
  target: "pure-boundary-node",
  sourceHandle: "output",
  targetHandle: "input",
  selected: true,
  unknownEdgeShell: "不得持久化",
};
useFlowStore.getState().openFlowTab({
  projectId: "pure-boundary-project",
  projectName: "纯文档边界项目",
  nodes: [unsafeDocumentNode],
  edges: [unsafeDocumentEdge],
});
useFlowStore.getState().setSelectedNodeId(unsafeDocumentNode.id);

const boundaryState = useFlowStore.getState();
const boundaryDocument = activeDocument(boundaryState);
const templatePayload = createTemplateRequestPayload({
  name: "纯文档边界模板",
  description: "四条持久化路径必须共享同一序列化器",
  projectName: boundaryDocument.projectName,
  nodes: boundaryDocument.nodes,
  edges: boundaryDocument.edges,
});
const boundaryRequests: Array<{ url: string; body: Record<string, unknown> }> = [];
const fetchBeforeBoundaryTest = globalThis.fetch;
try {
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    boundaryRequests.push({ url, body });
    if (url === "/api/projects") return Response.json({ ok: true });
    if (url === "/api/run-plan") {
      return Response.json({ error: "测试在 Provider 调用前终止" }, { status: 400 });
    }
    throw new Error(`意外请求：${url}`);
  };
  await useFlowStore.getState().runNode(unsafeDocumentNode.id);
} finally {
  globalThis.fetch = fetchBeforeBoundaryTest;
}

assert.deepEqual(
  boundaryRequests.map((request) => request.url),
  ["/api/projects", "/api/run-plan"],
);
const projectPayload = boundaryRequests[0].body as {
  flow: { schemaVersion: number; nodes: unknown[]; edges: unknown[] };
};
const runPayload = boundaryRequests[1].body as { nodes: unknown[]; edges: unknown[] };
const runWorkflow = {
  schemaVersion: projectPayload.flow.schemaVersion,
  nodes: runPayload.nodes,
  edges: runPayload.edges,
};
const boundarySession = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as {
  tabs: Array<{
    projectId: string;
    nodes: unknown[];
    edges: unknown[];
    selectedNodeIds?: string[];
    selectedNodeId?: string | null;
    selectedResultId?: string | null;
    compareIds?: string[];
  }>;
};
const sessionTab = boundarySession.tabs.find(
  (tab) => tab.projectId === "pure-boundary-project",
);
assert.ok(sessionTab);
const sessionWorkflow = {
  schemaVersion: projectPayload.flow.schemaVersion,
  nodes: sessionTab.nodes,
  edges: sessionTab.edges,
};

assert.deepEqual(templatePayload.flow, projectPayload.flow);
assert.deepEqual(runWorkflow, projectPayload.flow);
assert.deepEqual(sessionWorkflow, projectPayload.flow);
const persistedBoundaryNode = projectPayload.flow.nodes[0] as Record<string, unknown>;
const persistedBoundaryData = persistedBoundaryNode.data as Record<string, unknown>;
assert.deepEqual(Object.keys(persistedBoundaryNode).sort(), ["data", "id", "position", "type"]);
assert.equal(persistedBoundaryData.status, "idle");
assert.equal("error" in persistedBoundaryData, false);
assert.equal("unknownData" in persistedBoundaryData, false);
assert.deepEqual(
  Object.keys(projectPayload.flow.edges[0] as Record<string, unknown>).sort(),
  ["id", "source", "sourceHandle", "target", "targetHandle"],
);
assert.deepEqual(sessionTab.selectedNodeIds, []);
assert.equal(sessionTab.selectedNodeId, null);
assert.equal(sessionTab.selectedResultId, null);
assert.deepEqual(sessionTab.compareIds, []);
console.log("  ✓ 项目、模板、运行与 v1 会话共享纯文档序列化边界");

sessionStorage.setItem(sessionKey, JSON.stringify({
  activeTabId: "bad-tab",
  tabs: [
    { id: "good-tab", projectId: "good-project", projectName: "可恢复项目", nodes: [], edges: [] },
    { id: "bad-tab", projectId: "bad-project", projectName: "损坏项目", nodes: [], edges: [] },
  ],
}));
discardActiveTabSession();
const recovered = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as {
  activeTabId: string;
  tabs: Array<{ id: string }>;
};
assert.equal(recovered.activeTabId, "good-tab");
assert.deepEqual(recovered.tabs.map((tab) => tab.id), ["good-tab"]);
console.log("  ✓ 错误恢复只清除当前损坏页签并保留其他页签");

console.log("\n通过 13 项");
