/**
 * 2026-11-10：生成过程中刷新浏览器，结果节点不得消失。
 *
 * 锁定四件事：
 *  1. 占位结果节点 + 溯源边 + 在途 runId 写进 sessionStorage 会话快照（刷新后画布不空）；
 *  2. 服务端文档快照仍过滤占位节点（runId 为空），绝不写进 flow_json；
 *  3. 启动恢复按 pendingRunId 重放 durable 事件，覆盖「刷新期间 run 已完成、已不在
 *     /api/history/active」的窗口：占位节点原地升级成真结果节点，且幂等；
 *  4. 恢复只发 GET/SSE，不重新提交付费任务；
 *  5. 2026-11-10 二次修复：恢复点独立存（inflightRuns），画布节点被文档重建冲掉时
 *     也能补回来，而不是依赖「刷新后画布上恰好还有那个节点」。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (rel: string) => readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), "utf8");

interface MemoryStorage {
  getItem(key: string): string | null;
  key(index: number): string | null;
  readonly length: number;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function memoryStorage(): MemoryStorage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

class MockEventSource {
  static instances: MockEventSource[] = [];
  onmessage: ((message: MessageEvent<string>) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  constructor(readonly url: string) { MockEventSource.instances.push(this); }
  close(): void { this.closed = true; }
  emit(payload: unknown, lastEventId: string): void {
    this.onmessage?.({ data: JSON.stringify(payload), lastEventId } as MessageEvent<string>);
  }
}

async function waitFor(condition: () => boolean, message: string): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (condition()) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(message);
}

const sessionStorage = memoryStorage();
if (typeof (globalThis as { CustomEvent?: unknown }).CustomEvent === "undefined") {
  Object.assign(globalThis, { CustomEvent: class {} });
}
Object.assign(globalThis, {
  window: {
    sessionStorage,
    localStorage: memoryStorage(),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    dispatchEvent: () => true,
  },
});

const { createDocumentSnapshot } = await import("../src/lib/documentSnapshot");
const {
  resumePendingResultNodes,
  readTabSessionSnapshot,
  useFlowStore,
  writeTabSessionSnapshot,
  TAB_SESSION_SCHEMA_VERSION,
} = await import("../src/store/flowStore");

let passed = 0;
function ok(name: string, fn: () => void | Promise<void>): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("生成中刷新 → 结果节点恢复测试");

const RUN_ID = "run-refresh-finished";
const RESULT_NODE_ID = `result-${RUN_ID}`;
const generator = {
  id: "gen-1",
  type: "image-generator",
  position: { x: 0, y: 0 },
  data: {
    kind: "image-generator", label: "生图", status: "running",
    modelId: "gpt-image-2.6-flare", modelOptions: {}, aspectRatio: "1:1", batchSize: 1,
  },
};
const pendingNode = {
  id: "pending-result-abc",
  type: "result-image",
  position: { x: 380, y: 0 },
  data: {
    kind: "result-image", label: "图片结果", status: "running",
    images: [], sourceGeneratorId: "gen-1", runId: "",
    startedAt: 1_700_000_000_000,
    pendingRunId: RUN_ID,
  },
};
const pendingEdge = {
  id: "e-result-pending-result-abc", source: "gen-1", sourceHandle: "result",
  target: "pending-result-abc", targetHandle: "result", data: {},
};
const tab = {
  id: "tab-refresh",
  projectId: "project-refresh",
  projectName: "刷新恢复项目",
  readOnly: false,
  nodes: [generator, pendingNode],
  edges: [pendingEdge],
  selectedNodeIds: [],
  selectedNodeId: null,
  selectedResultId: null,
  compareIds: [],
  saveState: "idle",
  hasBeenPersisted: true,
  revision: 1,
  savedRevision: 0,
  dirty: true,
  documentEpoch: 0,
  lifecycle: "saved",
};

ok("会话快照保留占位节点、溯源边与在途 runId；服务端文档快照仍过滤它", () => {
  const result = writeTabSessionSnapshot(sessionStorage, {
    schemaVersion: TAB_SESSION_SCHEMA_VERSION,
    tabs: [tab] as never,
    activeTabId: tab.id,
  });
  assert.equal(result.ok, true, "会话快照写入失败");
  const restored = readTabSessionSnapshot(sessionStorage);
  assert.ok(restored, "会话快照不可读");
  const restoredTab = restored.tabs[0]!;
  const restoredPending = restoredTab.nodes.find((node) => node.id === "pending-result-abc");
  assert.ok(restoredPending, "刷新后占位结果节点必须还在画布上");
  assert.equal(restoredPending.data.status, "running", "刷新后仍应是生成中态");
  assert.equal((restoredPending.data as unknown as Record<string, unknown>).pendingRunId, RUN_ID);
  assert.equal((restoredPending.data as unknown as Record<string, unknown>).startedAt, 1_700_000_000_000);
  assert.equal(
    restoredTab.edges.some((edge) => edge.target === "pending-result-abc"),
    true,
    "指向占位节点的溯源边也要恢复",
  );

  const document = createDocumentSnapshot({
    projectName: tab.projectName,
    nodes: [generator, pendingNode] as never,
    edges: [pendingEdge] as never,
  });
  assert.equal(document.nodes.some((node) => node.id === "pending-result-abc"), false,
    "占位节点不得进入服务端 flow_json");
  assert.equal(document.edges.length, 0, "占位节点的边不得进入服务端 flow_json");
});

ok("runNode 在 runId 确认后立刻写入会话恢复点", () => {
  const store = read("src/store/flowStore.ts");
  assert.match(store, /attachPendingRunId\(target, id, payload\.runId\)/);
  assert.match(store, /attachPendingRunId[\s\S]{0,400}flushTabSessionPersistence\(\)/);
  assert.match(store, /pendingRunSignature\(tab\)/, "会话 marker 必须感知在途 runId 变化");
  const app = read("src/App.tsx");
  assert.match(app, /resumePendingResultNodes\(\)/, "首屏必须触发在途运行恢复");
});

const originalFetch = globalThis.fetch;
const originalEventSource = globalThis.EventSource;
const originalWindow = globalThis.window;
const requests: string[] = [];
try {
  Object.assign(globalThis, {
    EventSource: MockEventSource,
    window: {
      ...originalWindow,
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
    },
  });
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    requests.push(url);
    if (url === "/api/projects") return Response.json({ ok: true });
    if (url === "/api/run-plan" && init?.method === "POST") {
      return Response.json({ runId: "run-live-submit", status: "queued" }, { status: 202 });
    }
    if (url.endsWith("/run-missing")) return new Response(null, { status: 404 });
    if (url.endsWith("/run-unauthorized")) return new Response(null, { status: 401 });
    // 模拟「刷新期间 run 已经跑完」：GET 状态是 finished，事件流是 durable 重放。
    return Response.json({ runId: RUN_ID, status: "succeeded", finished: true });
  }) as typeof fetch;

  // 模拟浏览器刷新后的 store：从会话快照归一出来的节点直接注入。
  const restored = readTabSessionSnapshot(sessionStorage);
  assert.ok(restored);
  useFlowStore.setState({
    tabs: restored.tabs,
    activeTabId: restored.activeTabId,
    recentResults: [],
  });

  resumePendingResultNodes();
  await waitFor(() => MockEventSource.instances.length === 1, "未建立刷新恢复连接");
  assert.equal(MockEventSource.instances[0]!.url, `/api/run-plan/${RUN_ID}/events`);

  MockEventSource.instances[0]!.emit({
    type: "result-node-created",
    resultNodeId: RESULT_NODE_ID,
    sourceGeneratorId: "gen-1",
    runId: RUN_ID,
    mediaKind: "image",
    urls: ["/api/files/refreshed.png"],
    outputSizes: ["1024x1024"],
    seq: 1,
  }, "1");
  MockEventSource.instances[0]!.emit({
    type: "node-status", nodeId: "gen-1", status: "success", seq: 2,
  }, "2");
  MockEventSource.instances[0]!.emit({ type: "done", seq: 3 }, "3");
  await waitFor(() => MockEventSource.instances[0]!.closed, "重放结束后连接未关闭");
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  const current = useFlowStore.getState().tabs.find((candidate) => candidate.id === "tab-refresh");
  assert.ok(current);
  const resultNode = current.nodes.find((node) => node.id === RESULT_NODE_ID);
  assert.ok(resultNode, "刷新期间完成的 run 必须把占位节点升级成真结果节点");
  assert.equal(resultNode.data.runId, RUN_ID);
  assert.deepEqual(resultNode.data.images, ["/api/files/refreshed.png"]);
  assert.equal(resultNode.data.status, "success");
  // 用户在 2026-11-10 明确要求「节点不跳位」：升级必须继承占位节点的坐标，
  // 不能按「生成节点右侧第 N 个结果」重新算（那样会整体右移一格）。
  assert.deepEqual(resultNode.position, { x: 380, y: 0 }, "升级后不得跳到别的位置");
  assert.equal(
    current.nodes.some((node) => node.id === "pending-result-abc"),
    false,
    "不得残留旧的占位节点",
  );
  assert.equal(
    current.nodes.filter((node) => node.data.kind === "result-image").length,
    1,
    "不得重复创建第二个结果节点",
  );
  assert.equal(
    current.edges.some((edge) => edge.target === RESULT_NODE_ID && edge.targetHandle === "result"),
    true,
    "溯源边必须随节点一起改名",
  );
  assert.equal(requests.length, 1, "恢复只应发起一次 GET 状态确认");
  assert.equal(requests.some((url) => url === "/api/run-plan"), false, "恢复不得重新提交生成任务");
  passed += 1;
  console.log("  ✓ 刷新期间已完成的 run 通过事件重放原地补齐结果节点（幂等、不重复提交）");

  // 重放同一事件（断线重连语义）不得再产生第二个结果节点或改动文档。
  const revisionAfter = current.revision;
  const { applyResultNodeCreatedEventToTab, documentTarget } = await import("../src/store/flowStore");
  assert.equal(
    applyResultNodeCreatedEventToTab(documentTarget(current), {
      type: "result-node-created",
      resultNodeId: RESULT_NODE_ID,
      sourceGeneratorId: "gen-1",
      runId: RUN_ID,
      mediaKind: "image",
      urls: ["/api/files/refreshed.png"],
    }),
    false,
    "重放必须是幂等 no-op",
  );
  const afterReplay = useFlowStore.getState().tabs.find((candidate) => candidate.id === "tab-refresh")!;
  assert.equal(afterReplay.nodes.filter((node) => node.data.kind === "result-image").length, 1);
  assert.equal(afterReplay.revision, revisionAfter);
  passed += 1;
  console.log("  ✓ 断线重连重复事件不改变文档");

  // 没有 pendingRunId 的占位节点（POST 响应尚未返回时刷新）不应触发付费相关重放。
  MockEventSource.instances.length = 0;
  const unresolved = useFlowStore.getState().tabs.map((candidate) => ({
    ...candidate,
    nodes: candidate.nodes.map((node) => (
      node.data.kind === "result-image"
        ? { ...node, data: { ...node.data, runId: "", pendingRunId: undefined } }
        : node
    )),
  }));
  useFlowStore.setState({ tabs: unresolved });
  resumePendingResultNodes();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  assert.equal(MockEventSource.instances.length, 0, "runId 未知时不得凭空重放");
  passed += 1;
  console.log("  ✓ runId 尚未确认时不建立恢复连接");

  // 真实提交链路：runNode 一拿到 runId 就同步写会话恢复点（不等 250ms debounce / SSE）。
  requests.length = 0;
  MockEventSource.instances.length = 0;
  const { setGenerationSafetyBlockReason } = await import("../src/store/generationSafety");
  const { addExistingNodes } = await import("../src/store/flowStore");
  setGenerationSafetyBlockReason(null);
  useFlowStore.getState().createBlankTab();
  const liveGenerator = {
    id: "live-gen", type: "image-generator", position: { x: 320, y: 0 },
    data: {
      kind: "image-generator", label: "实时提交", status: "idle",
      operationMode: "edit", modelId: "gpt-image-2.6-flare",
      modelOptions: { size: "2048x2048" }, aspectRatio: "1:1", batchSize: 1,
    },
  };
  const liveText = {
    id: "live-text", type: "text", position: { x: 0, y: 0 },
    data: { kind: "text", label: "提示词", status: "idle", text: "修改衣领" },
  };
  const liveReference = {
    id: "live-reference", type: "image", position: { x: 0, y: 160 },
    data: { kind: "image", label: "参考图", status: "idle", outputImages: ["/api/files/live-ref.png"] },
  };
  addExistingNodes([liveReference, liveText, liveGenerator] as never);
  const liveState = useFlowStore.getState();
  liveState.onConnect({
    source: liveText.id, target: liveGenerator.id, sourceHandle: null, targetHandle: "prompt",
  });
  liveState.onConnect({
    source: liveReference.id, target: liveGenerator.id, sourceHandle: null, targetHandle: null,
  });
  const running = useFlowStore.getState().runNode(liveGenerator.id);
  await waitFor(() => MockEventSource.instances.length === 1, "未建立实时运行连接");
  MockEventSource.instances[0]!.emit({
    type: "node-status", nodeId: liveGenerator.id, status: "success", seq: 1,
  }, "1");
  MockEventSource.instances[0]!.emit({ type: "done", seq: 2 }, "2");
  await running;
  assert.equal(requests.includes("/api/run-plan"), true, "真实链路必须提交一次生成请求");

  const liveTabId = useFlowStore.getState().activeTabId;
  const liveSession = readTabSessionSnapshot(sessionStorage);
  assert.ok(liveSession);
  const liveTab = liveSession.tabs.find((candidate) => candidate.id === liveTabId);
  assert.ok(liveTab);
  const livePending = liveTab.nodes.find((node) => {
    const data = node.data as unknown as Record<string, unknown>;
    return data.kind === "result-image" && data.runId === "";
  });
  assert.ok(livePending, "提交后会话快照必须保留占位结果节点");
  assert.equal(
    (livePending.data as unknown as Record<string, unknown>).pendingRunId,
    "run-live-submit",
    "runId 必须在首个 SSE 事件之前同步写入会话恢复点",
  );
  passed += 1;
  console.log("  ✓ 真实提交链路把 runId 同步写进会话恢复点");

  // 恢复查询失败分级：只有 404 才收口成「结果未知」；401/5xx 静默保留生成中态。
  const missingTab = (pendingRunId: string) => ({
    ...tab,
    id: "tab-recovery-failure",
    projectId: "project-recovery-failure",
    nodes: [
      { ...generator, id: "gen-recovery" },
      {
        ...pendingNode,
        id: "pending-recovery",
        data: { ...pendingNode.data, sourceGeneratorId: "gen-recovery", pendingRunId },
      },
    ],
    edges: [{
      ...pendingEdge, id: "e-recovery", source: "gen-recovery", target: "pending-recovery",
    }],
  });
  MockEventSource.instances.length = 0;
  useFlowStore.setState({
    tabs: [missingTab("run-missing")] as never,
    activeTabId: "tab-recovery-failure",
  });
  resumePendingResultNodes();
  await waitFor(() => (
    useFlowStore.getState().tabs[0]?.nodes.find((node) => node.id === "gen-recovery")?.data.status
      === "outcome_unknown"
  ), "404 应把运行收口为结果未知");
  const missingGenerator = useFlowStore.getState().tabs[0]!.nodes.find(
    (node) => node.id === "gen-recovery",
  )!;
  assert.match(missingGenerator.data.error ?? "", /勿重复提交/);
  assert.equal(MockEventSource.instances.length, 0, "404 不应再建立 SSE 连接");

  useFlowStore.setState({
    tabs: [missingTab("run-unauthorized")] as never,
    activeTabId: "tab-recovery-failure",
  });
  resumePendingResultNodes();
  await waitFor(
    () => requests.includes("/api/run-plan/run-unauthorized"),
    "未发起 401 场景的状态查询",
  );
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const unauthorizedGenerator = useFlowStore.getState().tabs[0]!.nodes.find(
    (node) => node.id === "gen-recovery",
  )!;
  assert.equal(unauthorizedGenerator.data.status, "running", "401 不得误判成结果未知");
  assert.equal(MockEventSource.instances.length, 0, "401 不应建立 SSE 连接");
  passed += 1;
  console.log("  ✓ 404 收口结果未知，401/5xx 静默保留生成中态");

  // 2026-11-10（二次修复）：刷新路径可能用服务端文档重建页签，把占位节点整体冲掉。
  // 恢复点独立存放后，画布上没有占位节点也要能补回来，并继续同步到结果落地。
  const REBUILT_RUN_ID = "run-refresh-rebuilt";
  const { rememberInflightRun, readInflightRuns } = await import("../src/store/inflightRuns");
  requests.length = 0;
  MockEventSource.instances.length = 0;
  useFlowStore.setState({
    tabs: [{
      ...tab,
      id: "tab-rebuilt",
      projectId: "project-rebuilt",
      nodes: [{ ...generator, id: "gen-rebuilt" }],
      edges: [],
    }] as never,
    activeTabId: "tab-rebuilt",
  });
  rememberInflightRun({
    tabId: "tab-rebuilt",
    projectId: "project-rebuilt",
    generatorId: "gen-rebuilt",
    nodeId: "pending-rebuilt",
    mediaKind: "image",
    position: { x: 380, y: 0 },
    startedAt: Date.now(),
    runId: REBUILT_RUN_ID,
  });
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    requests.push(url);
    return Response.json({ runId: REBUILT_RUN_ID, status: "running" });
  }) as typeof fetch;

  resumePendingResultNodes();
  await waitFor(
    () => Boolean(useFlowStore.getState().tabs[0]?.nodes.some((node) => node.id === "pending-rebuilt")),
    "按恢复点补回的占位节点未出现在画布上",
  );
  const rebuiltPending = useFlowStore.getState().tabs[0]!.nodes.find(
    (node) => node.id === "pending-rebuilt",
  )!;
  assert.equal(rebuiltPending.data.status, "running", "补回的占位节点必须是生成中态");
  assert.equal(
    (rebuiltPending.data as unknown as Record<string, unknown>).pendingRunId,
    REBUILT_RUN_ID,
    "补回的占位节点必须带上在途 runId",
  );
  assert.equal(
    useFlowStore.getState().tabs[0]!.edges.some((edge) => (
      edge.source === "gen-rebuilt" && edge.target === "pending-rebuilt"
    )),
    true,
    "补回时也要补上溯源边",
  );

  MockEventSource.instances[0]!.emit({
    type: "result-node-created",
    resultNodeId: `result-${REBUILT_RUN_ID}`,
    sourceGeneratorId: "gen-rebuilt",
    runId: REBUILT_RUN_ID,
    mediaKind: "image",
    urls: ["/api/files/rebuilt.png"],
    seq: 1,
  }, "1");
  MockEventSource.instances[0]!.emit({ type: "node-status", nodeId: "gen-rebuilt", status: "success", seq: 2 }, "2");
  MockEventSource.instances[0]!.emit({ type: "done", seq: 3 }, "3");
  await waitFor(() => MockEventSource.instances[0]!.closed, "补回后的重放未结束");
  const rebuiltTab = useFlowStore.getState().tabs[0]!;
  assert.equal(
    rebuiltTab.nodes.some((node) => node.id === `result-${REBUILT_RUN_ID}`),
    true,
    "补回的占位节点必须能被事件原地升级成真结果节点",
  );
  assert.equal(rebuiltTab.nodes.some((node) => node.id === "pending-rebuilt"), false);
  assert.equal(
    readInflightRuns().some((record) => record.nodeId === "pending-rebuilt"),
    false,
    "结果落地后恢复点必须回收",
  );
  passed += 1;
  console.log("  ✓ 占位节点被文档重建冲掉时，按恢复点补回并升级");
} finally {
  globalThis.fetch = originalFetch;
  Object.assign(globalThis, { EventSource: originalEventSource, window: originalWindow });
}

// 2026-11-10（用户反馈「点击之后占位节点都不见了」）：
// 运行中的保存失败会触发初始草稿对账，而服务端 flow_json 永远不含占位节点（runId 必须非空）。
// 任何「用服务端文档整体替换画布」的路径都必须把在途占位节点合并回来。
{
  const { mergeInflightPlaceholders } = await import("../src/store/flowStore");
  const serverNodes = [{ ...generator, data: { ...generator.data, status: "idle" } }];
  const merged = mergeInflightPlaceholders(
    { nodes: [generator, pendingNode] as never },
    serverNodes as never,
    [],
  );
  assert.equal(merged.nodes.length, 2, "对账后必须把占位节点补回画布");
  assert.equal(merged.nodes.some((node) => node.id === "pending-result-abc"), true);
  assert.equal(merged.edges.length, 1, "补回占位节点时同时补上溯源边");
  assert.equal(
    merged.nodes.find((node) => node.id === "gen-1")?.data.status,
    "running",
    "生成节点的运行态也要保住，否则界面回到「空闲」可被重复点击",
  );
  assert.equal(
    merged.edges[0]?.source === "gen-1" && merged.edges[0]?.target === "pending-result-abc",
    true,
    "溯源边必须连回原来的生成节点",
  );

  // 生成节点已不在新文档（换项目）→ 不补，避免留下没有来源的悬空节点。
  const foreign = mergeInflightPlaceholders(
    { nodes: [generator, pendingNode] as never },
    [{ id: "gen-other", type: "image-generator", position: { x: 0, y: 0 }, data: { kind: "image-generator", label: "别的", status: "idle" } }] as never,
    [],
  );
  assert.equal(foreign.nodes.some((node) => node.id === "pending-result-abc"), false);
  assert.equal(foreign.edges.length, 0);

  // 服务端文档已带同 id 节点（真结果已落库）→ 不重复添加。
  const landed = mergeInflightPlaceholders(
    { nodes: [generator, pendingNode] as never },
    [
      { ...generator },
      {
        id: "pending-result-abc", type: "result-image", position: { x: 380, y: 0 },
        data: {
          kind: "result-image", label: "图片结果", status: "success",
          images: ["/api/files/x.png"], sourceGeneratorId: "gen-1", runId: RUN_ID,
        },
      },
    ] as never,
    [],
  );
  assert.equal(landed.nodes.length, 2);
  assert.equal(
    landed.nodes.filter((node) => node.id === "pending-result-abc").length,
    1,
    "已落地时不得重复添加",
  );
  passed += 1;
  console.log("  ✓ 服务端文档整体替换画布时保留在途占位节点（换项目/已落地则丢弃）");
}

// 2026-11-10（合成编辑）：编辑没有占位结果节点，产物走 `image-node-updated` 原位回写。
// 运行若恰好在刷新期间跑完，它已不在 /api/history/active 里，resumeRecentResults 收不到，
// 只能靠同一份恢复点重放事件把图补回画布——且绝不重新提交。
{
  const { rememberInflightRun, readInflightRuns } = await import("../src/store/inflightRuns");
  const EDIT_RUN_ID = "run-edit-finished";
  const savedFetch = globalThis.fetch;
  const savedEventSource = globalThis.EventSource;
  const editRequests: string[] = [];
  try {
    Object.assign(globalThis, { EventSource: MockEventSource });
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      editRequests.push(url);
      return Response.json({ runId: EDIT_RUN_ID, status: "succeeded", finished: true });
    }) as typeof fetch;
    MockEventSource.instances.length = 0;

    const editableImage = {
      id: "edit-node",
      type: "image",
      position: { x: 0, y: 0 },
      data: {
        kind: "image", label: "待改图", status: "idle",
        outputImages: ["/api/files/before.png"], runId: "run-before",
      },
    };
    useFlowStore.setState({
      tabs: [{
        ...tab,
        id: "tab-edit",
        projectId: "project-edit",
        nodes: [editableImage],
        edges: [],
      }] as never,
      activeTabId: "tab-edit",
    });
    rememberInflightRun({
      target: "image",
      tabId: "tab-edit",
      projectId: "project-edit",
      generatorId: "edit-node",
      nodeId: "edit-node",
      mediaKind: "image",
      position: { x: 0, y: 0 },
      startedAt: Date.now(),
      runId: EDIT_RUN_ID,
    });

    resumePendingResultNodes();
    await waitFor(() => MockEventSource.instances.length === 1, "合成编辑刷新后未建立重放连接");
    assert.equal(MockEventSource.instances[0]!.url, `/api/run-plan/${EDIT_RUN_ID}/events`);
    const runningEdit = useFlowStore.getState().tabs[0]!.nodes.find((node) => node.id === "edit-node")!;
    assert.equal(
      runningEdit.data.status,
      "running",
      "刷新后必须回到生成中态，否则用户会再点一次、重复计费",
    );

    MockEventSource.instances[0]!.emit({
      type: "image-node-updated",
      nodeId: "edit-node",
      runId: EDIT_RUN_ID,
      urls: ["/api/files/after.png"],
      providerOutputSizes: ["1024x1024"],
      seq: 1,
    }, "1");
    MockEventSource.instances[0]!.emit({ type: "node-status", nodeId: "edit-node", status: "success", seq: 2 }, "2");
    MockEventSource.instances[0]!.emit({ type: "done", seq: 3 }, "3");
    await waitFor(() => MockEventSource.instances[0]!.closed, "合成编辑重放未结束");

    const edited = useFlowStore.getState().tabs[0]!.nodes.find((node) => node.id === "edit-node")!;
    assert.deepEqual(
      edited.data.outputImages,
      ["/api/files/after.png"],
      "刷新期间完成的合成编辑必须把图原位补回",
    );
    assert.equal(edited.data.status, "success");
    assert.equal(
      readInflightRuns().some((record) => record.runId === EDIT_RUN_ID),
      false,
      "产物回写后恢复点必须回收",
    );
    assert.equal(
      editRequests.some((url) => url === "/api/run-plan"),
      false,
      "编辑恢复同样不得重新提交付费任务",
    );
    passed += 1;
    console.log("  ✓ 合成编辑在刷新期间完成时，按恢复点重放 image-node-updated 把图补回");
  } finally {
    globalThis.fetch = savedFetch;
    Object.assign(globalThis, { EventSource: savedEventSource });
  }
}

console.log(`\n通过 ${passed} 项`);
