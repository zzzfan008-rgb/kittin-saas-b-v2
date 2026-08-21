import assert from "node:assert/strict";

interface MemoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function memoryStorage(initial: Record<string, string> = {}, onSet?: (key: string) => void): MemoryStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      onSet?.(key);
      values.set(key, value);
    },
    removeItem: (key) => values.delete(key),
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
const sessionStorage = memoryStorage(
  { [sessionKey]: JSON.stringify(storedSession) },
  (key) => { if (key === sessionKey) sessionWrites += 1; },
);
const localStorage = memoryStorage({ [recentKey]: JSON.stringify(storedRecentResults) });
Object.assign(globalThis, { window: { sessionStorage, localStorage } });

const {
  applyRunEventToRecentResults,
  discardActiveTabSession,
  normalizeTabSessionValue,
  reconcileRunHistory,
  TAB_SESSION_SCHEMA_VERSION,
  useFlowStore,
} = await import("../src/store/flowStore");
const state = useFlowStore.getState();

console.log("项目页签会话恢复测试");

assert.deepEqual(state.edges, [restoredEdge]);
assert.deepEqual(state.tabs[0].edges, [restoredEdge]);
console.log("  ✓ 刷新恢复活动页签的完整连线");

assert.equal(state.saveState, "idle");
assert.equal(state.tabs[0].saveState, "idle");
assert.equal(state.dirty, true);
console.log("  ✓ 刷新将中断的 saving 状态归一为 idle 并保留未保存标记");

const persisted = JSON.parse(sessionStorage.getItem(sessionKey) ?? "null") as typeof storedSession;
assert.deepEqual(persisted.tabs[0].edges, [restoredEdge]);
assert.equal(persisted.tabs[0].saveState, "idle");
assert.equal((persisted as typeof storedSession & { schemaVersion: number }).schemaVersion, TAB_SESSION_SCHEMA_VERSION);
console.log("  ✓ 初始化持久化不会再次覆盖恢复后的连线或保存状态");

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
assert.equal(useFlowStore.getState().nodes[0].data.status, "idle");
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
assert.equal(useFlowStore.getState().nodes[0].data.status, "running");
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
assert.equal(useFlowStore.getState().nodes[0].data.status, "running");
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
assert.equal(useFlowStore.getState().nodes[0].data.status, "running");
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

console.log("\n通过 8 项");
