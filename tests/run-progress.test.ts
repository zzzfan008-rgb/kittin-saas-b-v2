/**
 * 2026-11-10（RUN-02）：生成阶段进度必须真的到界面。
 *
 * 背景：后端早就在发 `node-status.progress`（图片逐张 `{phase:"image",done,total}`、
 * 视频 `video-submitted`/`video-polling`），但客户端 `normalizeRunEvent` 的
 * 字段白名单把它整个丢掉了——DB 里有事件，SSE 也发了，界面永远只有「显影中」。
 *
 * 锁定四件事：
 *  1. 归一化保留合法 progress；非法计数（done>total、缺 total、total=0）只留 phase，
 *     绝不编造百分比（契约 §5）；
 *  2. 进度只进内存映射 `runProgressByNodeId`，不进节点 data / flow_json / 会话快照；
 *  3. 同一 phase 内 done 单调不减（SSE 重连会重放旧事件）；终态即回收；
 *  4. 阶段文案只表述后端给的信息，未知 phase 不猜。
 */
import assert from "node:assert/strict";

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
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (condition()) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(message);
}

if (typeof (globalThis as { CustomEvent?: unknown }).CustomEvent === "undefined") {
  Object.assign(globalThis, { CustomEvent: class {} });
}
Object.assign(globalThis, {
  window: {
    sessionStorage: memoryStorage(),
    localStorage: memoryStorage(),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    dispatchEvent: () => true,
  },
});

const { normalizeRunEvent } = await import("../src/store/flowRunEvents");
const { progressStageLabel } = await import("../src/lib/runProgress");
const { createDocumentSnapshot } = await import("../src/lib/documentSnapshot");
const {
  addExistingNodes,
  readTabSessionSnapshot,
  useFlowStore,
} = await import("../src/store/flowStore");
const { setGenerationSafetyBlockReason } = await import("../src/store/generationSafety");

let passed = 0;
console.log("生成阶段进度（RUN-02）测试");

// 1) 归一化：合法计数原样保留。
{
  const image = normalizeRunEvent({
    type: "node-status", nodeId: "gen-1", status: "running",
    progress: { phase: "image", done: 2, total: 5 },
  });
  assert.equal(image.type, "node-status");
  assert.deepEqual(
    image.type === "node-status" ? image.progress : undefined,
    { phase: "image", done: 2, total: 5 },
    "逐张出图的计数必须保留",
  );
  const video = normalizeRunEvent({
    type: "node-status", nodeId: "gen-1", status: "running",
    progress: { phase: "video-polling" },
  });
  assert.deepEqual(
    video.type === "node-status" ? video.progress : undefined,
    { phase: "video-polling" },
    "无百分比的视频阶段必须保留 phase",
  );
  passed += 1;
  console.log("  ✓ 归一化保留合法 progress（图片计数 / 视频阶段）");
}

// 2) 归一化：非法计数只留 phase，绝不编造百分比。
{
  const cases: Array<[string, unknown]> = [
    ["done 超过 total", { phase: "image", done: 9, total: 3 }],
    ["缺 total", { phase: "image", done: 2 }],
    ["total 为 0", { phase: "image", done: 0, total: 0 }],
    ["done 为负", { phase: "image", done: -1, total: 3 }],
  ];
  for (const [label, progress] of cases) {
    const event = normalizeRunEvent({
      type: "node-status", nodeId: "gen-1", status: "running", progress,
    });
    const normalized = event.type === "node-status" ? event.progress : undefined;
    assert.deepEqual(normalized, { phase: "image" }, `${label}：只能保留 phase`);
  }
  // 缺 phase：整块丢弃（没有阶段就没有可展示的信息）。
  const noPhase = normalizeRunEvent({
    type: "node-status", nodeId: "gen-1", status: "running", progress: { done: 1, total: 2 },
  });
  assert.equal(
    noPhase.type === "node-status" ? noPhase.progress : "unexpected",
    undefined,
    "缺 phase 时必须整体丢弃",
  );
  // 排队位次：非负数保留。
  const queued = normalizeRunEvent({
    type: "node-status", nodeId: "gen-1", status: "queued",
    progress: { phase: "queued", queuePosition: 3 },
  });
  assert.deepEqual(
    queued.type === "node-status" ? queued.progress : undefined,
    { phase: "queued", queuePosition: 3 },
  );
  passed += 1;
  console.log("  ✓ 非法计数降级为「只报阶段」，不编造百分比");
}

// 3) 阶段文案：只表述后端给的信息。
{
  assert.equal(progressStageLabel(undefined), undefined);
  assert.equal(progressStageLabel({ phase: "image", done: 3, total: 8 }), "生成中 3/8");
  assert.equal(progressStageLabel({ phase: "image" }), "生成中");
  assert.equal(progressStageLabel({ phase: "video-submitted" }), "已提交上游，等待出片");
  assert.equal(progressStageLabel({ phase: "video-polling" }), "上游生成中");
  assert.equal(progressStageLabel({ phase: "queued", queuePosition: 2 }), "排队中 · 第 2 位");
  assert.equal(progressStageLabel({ phase: "queued" }), "排队中");
  assert.equal(progressStageLabel({ phase: "future-unknown-phase" }), undefined, "未知阶段不猜文案");
  passed += 1;
  console.log("  ✓ 阶段文案映射（含未知阶段降级为不显示）");
}

// 4) 集成：事件 → 内存映射；单调不减；终态回收；不进文档/会话。
const originalFetch = globalThis.fetch;
const originalEventSource = globalThis.EventSource;
const requests: string[] = [];
try {
  Object.assign(globalThis, { EventSource: MockEventSource });
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    requests.push(url);
    if (url === "/api/run-plan") {
      return Response.json({ runId: "run-progress-1", status: "queued" }, { status: 202 });
    }
    return Response.json({ ok: true });
  }) as typeof fetch;

  setGenerationSafetyBlockReason(null);
  useFlowStore.getState().createBlankTab();
  const generator = {
    id: "gen-progress", type: "image-generator", position: { x: 320, y: 0 },
    data: {
      kind: "image-generator", label: "进度", status: "idle",
      modelId: "gpt-image-2.6-flare", modelOptions: {}, aspectRatio: "1:1", batchSize: 3,
    },
  };
  const text = {
    id: "text-progress", type: "text", position: { x: 0, y: 0 },
    data: { kind: "text", label: "提示词", status: "idle", text: "白色衬衫" },
  };
  addExistingNodes([text, generator] as never);
  useFlowStore.getState().onConnect({
    source: text.id, target: generator.id, sourceHandle: null, targetHandle: "prompt",
  });

  const running = useFlowStore.getState().runNode(generator.id);
  await waitFor(() => MockEventSource.instances.length === 1, "未建立运行事件连接");
  const source = MockEventSource.instances[0]!;

  source.emit({
    type: "node-status", nodeId: generator.id, status: "running",
    progress: { phase: "image", done: 1, total: 3 }, seq: 1,
  }, "1");
  assert.deepEqual(
    useFlowStore.getState().runProgressByNodeId[generator.id],
    { phase: "image", done: 1, total: 3 },
    "进度事件必须落到内存映射",
  );

  // 回退的旧事件（重连重放）不得把进度条拉回去。
  source.emit({
    type: "node-status", nodeId: generator.id, status: "running",
    progress: { phase: "image", done: 0, total: 3 }, seq: 2,
  }, "2");
  assert.equal(
    useFlowStore.getState().runProgressByNodeId[generator.id]?.done,
    1,
    "同一阶段内 done 必须单调不减",
  );

  // 进度不得进文档：服务端 flow_json 与浏览器会话快照的节点 data 都不该出现它。
  const activeTab = useFlowStore.getState().tabs.find(
    (tab) => tab.id === useFlowStore.getState().activeTabId,
  )!;
  const document = createDocumentSnapshot({
    projectName: activeTab.projectName,
    nodes: activeTab.nodes,
    edges: activeTab.edges,
  });
  assert.equal(
    document.nodes.some((node) => Object.prototype.hasOwnProperty.call(node.data, "progress")),
    false,
    "运行进度不得进入服务端文档快照的节点数据",
  );
  const session = readTabSessionSnapshot(window.sessionStorage as unknown as Storage);
  assert.equal(
    session
      ? session.tabs.some((tab) => tab.nodes.some(
        (node) => Object.prototype.hasOwnProperty.call(node.data, "progress"),
      ))
      : false,
    false,
    "运行进度不得进入会话快照的节点数据",
  );

  // 终态收口：撤回进度，界面不能一边显示 success 一边显示「生成中 1/3」。
  source.emit({
    type: "node-status", nodeId: generator.id, status: "success", seq: 3,
  }, "3");
  source.emit({ type: "done", seq: 4 }, "4");
  await running;
  assert.equal(
    useFlowStore.getState().runProgressByNodeId[generator.id],
    undefined,
    "终态必须回收进度",
  );
  passed += 1;
  console.log("  ✓ 进度进内存映射、单调不减、终态回收，且不落文档/会话");
} finally {
  globalThis.fetch = originalFetch;
  Object.assign(globalThis, { EventSource: originalEventSource });
}

console.log(`\n通过 ${passed} 项`);
