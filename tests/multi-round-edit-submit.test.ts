/**
 * 多轮修改（runImageEdit）提交链路行为测试（2026-11-10，用户报障复现与修复验证）。
 *
 * 报障现象：面板提示「本次修改未能发起：可能有进行中的任务、额度不足或项目只读」。
 * 线上证据（nginx）：4 次点击都只到 edit-draft 上传，连 POST /api/projects / run-plan
 * 都没发出 → 某道门禁静默返回 false。根因有二：
 *  1. runImageEdit 的 7 道门禁全部匿名返回 false，面板只能瞎猜文案；
 *  2. 「最近结果里该节点仍有活动记录」这道门禁可能被 SSE 中断留下的陈旧 running
 *     记录卡死（历史对账只在页面加载时跑，会话内不自愈）——节点明明 idle、按钮可点。
 *
 * 修复：门禁逐一返回具体原因（string）；被「陈旧活动记录」拦下时先 GET 权威状态，
 * 已终态就本地收口并放行（只读，不重新提交）。
 *
 * 运行：npx tsx tests/multi-round-edit-submit.test.ts
 */
import assert from "node:assert/strict";

interface MemoryStorage {
  getItem(key: string): string | null;
  key(index: number): string | null;
  readonly length: number;
  setItem(key: string, value: string): void;
  removeItem(key: string, value: string): void;
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
  for (let attempt = 0; attempt < 80; attempt += 1) {
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

console.log("多轮修改提交链路（真实 store + mock fetch/SSE）");

const originalFetch = globalThis.fetch;
const originalEventSource = globalThis.EventSource;
const originalWindow = globalThis.window;
const requests: string[] = [];
/** 可变的场景开关：陈旧运行的服务端权威状态 / 项目保存是否失败。 */
let staleRunStatus: "succeeded" | "running" | undefined;
let saveProjectsFails = false;

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
    requests.push(`${init?.method ?? "GET"} ${url}`);
    if (url === "/api/projects" && init?.method === "POST") {
      if (saveProjectsFails) return Response.json({ error: "flow 校验失败（探针注入）" }, { status: 400 });
      return Response.json({ ok: true, id: "NcfYOvYbCE" });
    }
    if (url === "/api/run-plan" && init?.method === "POST") {
      return Response.json({ runId: "run-edit-probe", status: "queued" }, { status: 202 });
    }
    if (url === "/api/run-plan/run-edit-probe") {
      return Response.json({ runId: "run-edit-probe", status: "queued", finished: false });
    }
    if (url === "/api/run-plan/run-stale") {
      return Response.json({ runId: "run-stale", status: staleRunStatus ?? "succeeded", finished: true });
    }
    return Response.json({ ok: true });
  }) as typeof fetch;

  const { useFlowStore, addExistingNodes } = await import("../src/store/flowStore");
  const { setGenerationSafetyBlockReason } = await import("../src/store/generationSafety");
  setGenerationSafetyBlockReason(null);
  useFlowStore.setState({ recentResults: [] });
  useFlowStore.getState().createBlankTab();
  const imageNode = {
    id: "model",
    type: "image",
    position: { x: 0, y: 0 },
    data: {
      kind: "image", label: "模特图", status: "idle",
      outputImages: ["/api/files/model.png"],
    },
  };
  addExistingNodes([imageNode] as never);

  // 把页签整成用户当时的形态：已保存项目、revision 与 savedRevision 一致、非只读。
  const blankTabId = useFlowStore.getState().activeTabId!;
  useFlowStore.setState((state) => ({
    tabs: state.tabs.map((tab) => tab.id === blankTabId ? {
      ...tab,
      projectId: "NcfYOvYbCE",
      projectName: "未命名-2026-11-10",
      readOnly: false,
      lifecycle: "saved" as const,
      hasBeenPersisted: true,
      revision: 6,
      savedRevision: 6,
      dirty: false,
      saveState: "idle" as const,
    } : tab),
  }));

  let passed = 0;
  function ok(name: string): void {
    passed += 1;
    console.log(`  ✓ ${name}`);
  }

  /** 跑一轮「点击 → 提交 → 事件收口」；被门禁拦截（无 SSE）时直接返回拦截原因。 */
  async function submitRound(prompt: string, editInputRef: string): Promise<boolean | string> {
    requests.length = 0;
    MockEventSource.instances.length = 0;
    const promise = useFlowStore.getState().runImageEdit("model", prompt, { editInputRef });
    let resolved = false;
    const tracked = promise.then((value) => {
      resolved = true;
      return value;
    });
    // 被门禁拦截的轮次不会建立事件连接，promise 会直接 resolve。
    await waitFor(
      () => MockEventSource.instances.length === 1 || resolved,
      "未建立运行事件连接，且提交也未收口",
    );
    if (MockEventSource.instances.length === 1) {
      MockEventSource.instances[0]!.emit({
        type: "image-node-updated",
        nodeId: "model",
        runId: "run-edit-probe",
        urls: ["/api/files/edited.png"],
        providerOutputSizes: ["1024x1024"],
        seq: 1,
      }, "1");
      MockEventSource.instances[0]!.emit({ type: "node-status", nodeId: "model", status: "success", seq: 2 }, "2");
      MockEventSource.instances[0]!.emit({ type: "done", seq: 3 }, "3");
    }
    return await tracked;
  }

  // ---------- 场景 1：干净状态，两轮连发 ----------
  {
    const first = await submitRound("发型改为短发", "/api/files/edit/abc.png");
    assert.equal(first, true, `首次提交应返回 true，实际：${String(first)}`);
    assert.equal(requests.some((entry) => entry === "POST /api/run-plan"), true, "必须真实提交");
    const second = await submitRound("领口改低一点", "/api/files/edit/def.png");
    assert.equal(second, true, `第二轮应返回 true，实际：${String(second)}`);
    const nodeFinal = useFlowStore.getState().tabs
      .find((tab) => tab.id === blankTabId)?.nodes.find((node) => node.id === "model");
    assert.equal(nodeFinal?.data.status, "success");
    assert.equal(
      (nodeFinal?.data as { editPrompt?: string }).editPrompt,
      undefined,
      "收口后不得残留编辑态字段",
    );
    ok("干净状态两轮连发均真实提交并收口");
  }

  // ---------- 场景 2：陈旧活动记录（用户报障的最可疑分支）----------
  {
    // 复刻：上一轮蒙版重绘的 SSE 中断 → 最近结果里残留 running 记录，节点却已回 idle。
    useFlowStore.setState((state) => ({
      tabs: state.tabs.map((tab) => tab.id === blankTabId ? {
        ...tab,
        nodes: tab.nodes.map((node) => node.id === "model"
          ? { ...node, data: { ...node.data, status: "idle" as const } }
          : node),
      } : tab),
      recentResults: [{
        id: "rec-stale",
        image: "",
        nodeId: "model",
        nodeLabel: "模特图",
        kind: "image" as const,
        projectId: "NcfYOvYbCE",
        projectName: "未命名-2026-11-10",
        prompt: "改成红色的头发",
        startedAt: Date.now() - 600_000,
        status: "running" as const,
        runId: "run-stale",
        requestedCount: 1,
      }],
    }));
    staleRunStatus = "succeeded";
    const healed = await submitRound("再改一轮", "/api/files/edit/ghi.png");
    assert.equal(healed, true, `陈旧记录核对为已完成后应放行，实际：${String(healed)}`);
    assert.equal(requests.some((entry) => entry === "GET /api/run-plan/run-stale"), true,
      "放行前必须先 GET 权威状态核对");
    assert.equal(requests.some((entry) => entry === "POST /api/run-plan"), true, "核对后应真实提交");
    assert.equal(
      useFlowStore.getState().recentResults.find((record) => record.id === "rec-stale")?.status,
      "success",
      "陈旧记录要本地收口，否则下一轮还会被拦",
    );
    ok("陈旧活动记录：GET 核对已终态 → 本地收口并放行");
  }

  // ---------- 场景 3：运行确实还在进行 → 拦截并给出具体原因 ----------
  {
    useFlowStore.setState((state) => ({
      tabs: state.tabs.map((tab) => tab.id === blankTabId ? {
        ...tab,
        nodes: tab.nodes.map((node) => node.id === "model"
          ? { ...node, data: { ...node.data, status: "idle" as const } }
          : node),
      } : tab),
      recentResults: state.recentResults.map((record) => record.id === "rec-stale"
        ? { ...record, status: "running" as const }
        : record),
    }));
    staleRunStatus = "running";
    const blocked = await submitRound("再试一次", "/api/files/edit/jkl.png");
    assert.equal(
      typeof blocked === "string" && /还在进行中/.test(blocked),
      true,
      `确实还在跑时应返回具体原因，实际：${String(blocked)}`,
    );
    assert.equal(requests.some((entry) => entry === "POST /api/run-plan"), false,
      "运行进行中时不得重复提交（防重复计费）");
    ok("运行确实进行中：拦截 + 具体原因，不重复提交");
  }

  // ---------- 场景 4：保存失败 → 带回真实保存错误，不再是匿名 false ----------
  {
    staleRunStatus = "succeeded";
    saveProjectsFails = true;
    const failed = await submitRound("保存会失败的一轮", "/api/files/edit/mno.png");
    saveProjectsFails = false;
    assert.equal(
      typeof failed === "string" && /保存失败|校验失败/.test(failed),
      true,
      `保存失败应返回具体错误，实际：${String(failed)}`,
    );
    assert.equal(requests.some((entry) => entry === "POST /api/run-plan"), false,
      "保存失败时不得调用生图服务");
    ok("保存失败：面板拿到真实保存错误，且不触发生图");
  }

  console.log(`\n通过 ${passed} 项`);
} finally {
  globalThis.fetch = originalFetch;
  Object.assign(globalThis, { EventSource: originalEventSource, window: originalWindow });
}
