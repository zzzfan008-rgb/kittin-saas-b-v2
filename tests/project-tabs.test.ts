import assert from "node:assert/strict";
import fs from "node:fs";
import { maskRedrawReadiness } from "../src/lib/maskRedraw";
import { shouldWarnBeforeWorkspaceUnload } from "../src/lib/workspaceUnload";
import { imageModelAspectRatioPatch } from "../src/types/imageModels";
import type { Edge } from "@xyflow/react";
import {
  applyRunEventToTab,
  beginMaskWork,
  selectNodeInputImages,
  useFlowStore,
  type FlowNode,
  type RecentResult,
} from "../src/store/flowStore";
import { setGenerationSafetyBlockReason } from "../src/store/generationSafety";

let passed = 0;

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

function imageNode(id: string, label: string): FlowNode {
  return {
    id,
    type: "image-input",
    position: { x: 0, y: 0 },
    data: { kind: "image-input", label, status: "idle", imageRole: "default" },
  };
}

function aiNode(id: string, label: string): FlowNode {
  return {
    id,
    type: "ai-modify",
    position: { x: 320, y: 0 },
    data: {
      kind: "ai-modify",
      label,
      status: "success",
      prompt: "修改衣领",
      aspectRatio: "1:1",
      batchSize: 1,
      outputImages: ["/api/files/previous.png"],
    },
  };
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

const initial = useFlowStore.getState();
const tabA = initial.activeTabId;
initial.setProjectName("项目 A");
initial.updateNodeData(initial.nodes[0].id, { label: "A 上传节点" });

useFlowStore.getState().openFlowTab({
  projectId: "project-b",
  projectName: "项目 B",
  nodes: [imageNode("b-node", "B 上传节点")],
  edges: [] as Edge[],
});
const tabB = useFlowStore.getState().activeTabId;

await test("切换页签保留各自画布与项目名称", () => {
  assert.notEqual(tabA, tabB);
  assert.equal(useFlowStore.getState().projectName, "项目 B");
  assert.equal(useFlowStore.getState().nodes[0].id, "b-node");
  useFlowStore.getState().switchTab(tabA);
  assert.equal(useFlowStore.getState().projectName, "项目 A");
  assert.equal(useFlowStore.getState().nodes[0].data.label, "A 上传节点");
  useFlowStore.getState().switchTab(tabB);
  assert.equal(useFlowStore.getState().nodes[0].data.label, "B 上传节点");
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
  assert.equal(useFlowStore.getState().nodes[0].data.label, "B 本地修改");
});

await test("后台任务可定向回写非当前页签", () => {
  useFlowStore.getState().switchTab(tabA);
  useFlowStore.getState().updateNodeDataInTab(tabB, "b-node", {
    status: "success",
    imageUrl: "/api/files/background-result.png",
  });
  assert.equal(useFlowStore.getState().projectName, "项目 A");
  useFlowStore.getState().switchTab(tabB);
  const node = useFlowStore.getState().nodes.find((candidate) => candidate.id === "b-node");
  assert.equal(node?.data.status, "success");
  assert.equal(node?.data.kind === "image-input" ? node.data.imageUrl : undefined, "/api/files/background-result.png");
});

await test("A 页签后台失败不影响 B 页签且保留 A 的上一版图片", () => {
  useFlowStore.getState().switchTab(tabA);
  useFlowStore.getState().addExistingNode(aiNode("a-ai-node", "A 后台改款"));
  useFlowStore.getState().switchTab(tabB);
  const beforeB = useFlowStore.getState().nodes;

  applyRunEventToTab(tabA, "a-ai-node", {
    type: "node-status",
    nodeId: "a-ai-node",
    status: "error",
    error: "AI 网关暂不可用",
  });

  assert.equal(useFlowStore.getState().activeTabId, tabB);
  assert.strictEqual(useFlowStore.getState().nodes, beforeB);
  useFlowStore.getState().switchTab(tabA);
  const failedNode = useFlowStore.getState().nodes.find((node) => node.id === "a-ai-node");
  assert.equal(failedNode?.data.status, "error");
  assert.equal(failedNode?.data.error, "AI 网关暂不可用");
  assert.deepEqual(
    failedNode?.data.kind === "ai-modify" ? failedNode.data.outputImages : undefined,
    ["/api/files/previous.png"],
  );
  useFlowStore.getState().switchTab(tabB);
});

await test("运行中的页签不能关闭，避免任务结果丢失画布回写", () => {
  useFlowStore.getState().updateNodeData("b-node", { status: "queued" });
  const count = useFlowStore.getState().tabs.length;
  useFlowStore.getState().closeTab(tabB);
  assert.equal(useFlowStore.getState().tabs.length, count);
  assert.equal(useFlowStore.getState().activeTabId, tabB);
  useFlowStore.getState().updateNodeData("b-node", { status: "idle" });
});

await test("关闭当前页签后切换到相邻页签，至少保留一个画布", () => {
  useFlowStore.getState().closeTab(tabB);
  assert.equal(useFlowStore.getState().activeTabId, tabA);
  assert.equal(useFlowStore.getState().tabs.length, 1);
  useFlowStore.getState().closeTab(tabA);
  assert.equal(useFlowStore.getState().tabs.length, 1);
  assert.ok(useFlowStore.getState().activeTabId);
  assert.equal(useFlowStore.getState().nodes.length, 1);
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

  assert.equal(useFlowStore.getState().nodes.length, 0);
  assert.equal(useFlowStore.getState().selectedNodeId, null);
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
  const added = useFlowStore.getState().nodes.find((node) => node.id === addedId);
  assert.equal(added?.data.kind, "image-input");
  assert.equal(added?.data.label, "金色面料");
  assert.equal(added?.data.status, "success");
  assert.equal(added?.data.kind === "image-input" ? added.data.imageUrl : undefined, "/api/files/gold-fabric.png");

  useFlowStore.getState().undo();
  assert.equal(useFlowStore.getState().nodes.length, 1);
  assert.equal(useFlowStore.getState().nodes[0].id, baseline.id);
  assert.equal(useFlowStore.getState().nodes.some((node) => node.id === addedId), false);
  assert.equal(useFlowStore.getState().selectedNodeId, null);

  const librarySource = fs.readFileSync(
    new URL("../src/components/panels/NodeLibraryPanel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(librarySource, /addAssetNode\(asset,/);
  assert.doesNotMatch(librarySource, /useFlowStore\.getState\(\)\.selectedNodeId|updateNodeData\(newId/);
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

    useFlowStore.getState().setProjectName("保存期间的新名称");
    const secondSave = useFlowStore.getState().saveProject();
    assert.equal(requests.length, 1, "第二次保存应等待当前请求完成");

    requests[0].resolve(Response.json({ ok: true }));
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(requests.length, 2, "旧快照完成后应自动发送最新快照");

    const latestPayload = JSON.parse(requests[1].body) as { name: string };
    assert.equal(latestPayload.name, "保存期间的新名称");
    requests[1].resolve(Response.json({ ok: true }));
    await Promise.all([firstSave, secondSave]);

    const after = useFlowStore.getState();
    assert.equal(after.dirty, false);
    assert.equal(after.saveState, "saved");
    assert.equal(after.savedRevision, after.revision);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("新建项目首次生成会先保存同一份项目，再提交运行", async () => {
  useFlowStore.getState().createBlankTab();
  useFlowStore.getState().addExistingNode(aiNode("first-run-ai", "首次生成"));
  const projectId = useFlowStore.getState().projectId;
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

await test("runNode 创建 queued 记录时保留当前结果选择", async () => {
  useFlowStore.getState().openFlowTab({
    projectId: "queued-selection-project",
    projectName: "运行选择测试",
    nodes: [aiNode("queued-selection-node", "不抢占选择")],
    edges: [],
  });
  const keptResult = {
    id: "kept-result-selection",
    image: "/api/files/kept.png",
    nodeId: "older-node",
    nodeLabel: "原已选结果",
    kind: "ai-modify",
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
    assert.equal(useFlowStore.getState().selectedResultId, keptResult.id);
    await running;
    assert.equal(useFlowStore.getState().selectedResultId, keptResult.id);
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
  const beforeStatus = useFlowStore.getState().nodes[0].data.status;
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
    assert.equal(useFlowStore.getState().nodes[0].data.status, beforeStatus);
  } finally {
    setGenerationSafetyBlockReason(null);
    globalThis.fetch = originalFetch;
  }
});

await test("Gemini 选择经上传回写、加蒙版、切页与运行全程保真", async () => {
  const generationNode = aiNode("model-invariant-ai", "Gemini 保真节点");
  generationNode.data.status = "idle";
  if (generationNode.data.kind !== "ai-modify") throw new Error("测试生成节点类型错误");
  generationNode.data.outputImages = [];
  useFlowStore.getState().openFlowTab({
    projectId: "model-invariant-project",
    projectName: "模型保真项目",
    nodes: [imageNode("model-invariant-upload", "异步上传"), generationNode],
    edges: [{ id: "model-invariant-edge", source: "model-invariant-upload", target: generationNode.id }],
  });
  const invariantTabId = useFlowStore.getState().activeTabId;
  const expected = {
    modelId: "gemini-3.1-flash-image",
    modelOptions: { aspectRatio: "16:9", imageSize: "4K" },
  };

  useFlowStore.getState().updateNodeData(generationNode.id, expected);
  assertNodeModelSelection(useFlowStore.getState().nodes, generationNode.id, expected);

  await Promise.resolve().then(() => {
    useFlowStore.getState().updateNodeDataInTab(invariantTabId, "model-invariant-upload", {
      status: "success",
      imageUrl: "/api/files/model-invariant-upload.png",
    });
  });
  assertNodeModelSelection(useFlowStore.getState().nodes, generationNode.id, expected);

  useFlowStore.getState().addExistingNode({
    id: "model-invariant-mask",
    type: "mask-redraw",
    position: { x: 320, y: 240 },
    data: {
      kind: "mask-redraw",
      label: "蒙版局部重绘",
      status: "idle",
      prompt: "仅替换被选中区域",
      modelId: "gpt-image-2",
      modelOptions: {},
      outputImages: [],
    },
  });
  useFlowStore.getState().onConnect({
    source: "model-invariant-upload",
    target: "model-invariant-mask",
    sourceHandle: null,
    targetHandle: null,
  });
  assertNodeModelSelection(useFlowStore.getState().nodes, generationNode.id, expected);

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
  assertNodeModelSelection(useFlowStore.getState().nodes, generationNode.id, expected);

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
    assertNodeModelSelection(useFlowStore.getState().nodes, generationNode.id, expected);

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

await test("节点与 Inspector 共用画幅补丁并同步 provider 参数", () => {
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

  const inspectorSource = fs.readFileSync(
    new URL("../src/components/panels/InspectorPanel.tsx", import.meta.url),
    "utf8",
  );
  const aiModifySource = fs.readFileSync(
    new URL("../src/components/nodes/AiModifyNode.tsx", import.meta.url),
    "utf8",
  );
  const sketchSource = fs.readFileSync(
    new URL("../src/components/nodes/SketchToRenderNode.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    inspectorSource,
    /imageModelAspectRatioPatch\(selectedModelId, selectedModelOptions, e\.target\.value\)/,
    "Inspector 修改画幅时必须同步业务比例与 provider modelOptions",
  );
  for (const source of [aiModifySource, sketchSource]) {
    assert.match(
      source,
      /imageModelAspectRatioPatch\(data\.modelId, data\.modelOptions, e\.target\.value\)/,
      "节点内画幅入口也必须复用同一 provider 参数补丁",
    );
  }
});

await test("项目保存失败时显示错误且绝不提交生成", async () => {
  useFlowStore.getState().createBlankTab();
  useFlowStore.getState().addExistingNode(aiNode("blocked-first-run", "保存失败生成"));
  const requests: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    requests.push(String(input));
    return Response.json({ error: "保存服务暂不可用" }, { status: 503 });
  };

  try {
    await useFlowStore.getState().runNode("blocked-first-run");
    assert.deepEqual(requests, ["/api/projects"]);
    const failedNode = useFlowStore.getState().nodes.find((node) => node.id === "blocked-first-run");
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
  useFlowStore.getState().addExistingNode(aiNode("snapshot-run", "快照生成"));
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
    useFlowStore.getState().updateNodeData("snapshot-run", { prompt: "保存期间的新提示词" });
    projectResolvers[0](Response.json({ ok: true }));
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(projectResolvers.length, 2, "保存队列应先持久化保存期间的编辑");
    projectResolvers[1](Response.json({ ok: true }));
    await running;

    assert.equal(runBodies.length, 1);
    const submitted = runBodies[0].nodes.find((node) => node.id === "snapshot-run");
    assert.equal(submitted?.data.kind, "ai-modify");
    assert.equal(submitted?.data.kind === "ai-modify" ? submitted.data.prompt : undefined, "修改衣领");
    assert.match(
      useFlowStore.getState().nodes.find((node) => node.id === "snapshot-run")?.data.error ?? "",
      /画布尚未保存或已在其他位置更新/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("保存预检期间取消会阻止生成请求", async () => {
  useFlowStore.getState().createBlankTab();
  useFlowStore.getState().addExistingNode(aiNode("cancel-preflight", "预检取消"));
  const requests: string[] = [];
  let resolveSave: ((response: Response) => void) | undefined;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input) => {
    const url = String(input);
    requests.push(url);
    if (url !== "/api/projects") throw new Error(`取消后不应请求：${url}`);
    return new Promise<Response>((resolve) => { resolveSave = resolve; });
  };

  try {
    const running = useFlowStore.getState().runNode("cancel-preflight");
    assert.equal(requests.length, 1);
    await useFlowStore.getState().cancelNodeRun("cancel-preflight");
    assert.equal(
      useFlowStore.getState().nodes.find((node) => node.id === "cancel-preflight")?.data.status,
      "cancel_requested",
    );
    resolveSave?.(Response.json({ ok: true }));
    await running;
    assert.deepEqual(requests, ["/api/projects"]);
    const node = useFlowStore.getState().nodes.find((candidate) => candidate.id === "cancel-preflight");
    assert.equal(node?.data.status, "cancelled");
    assert.match(node?.data.error ?? "", /调用生图服务前取消/);
    const result = useFlowStore.getState().recentResults.find(
      (record) => record.nodeId === "cancel-preflight",
    );
    assert.equal(result?.status, "cancelled");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("运行请求已发出但尚未返回 runId 时取消，收到 runId 后立即补发后端取消", async () => {
  useFlowStore.getState().createBlankTab();
  useFlowStore.getState().addExistingNode(aiNode("cancel-run-response", "响应窗口取消"));
  const requests: string[] = [];
  let resolveRun: ((response: Response) => void) | undefined;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input) => {
    const url = String(input);
    requests.push(url);
    if (url === "/api/projects") return Promise.resolve(Response.json({ ok: true }));
    if (url === "/api/run-plan") {
      return new Promise<Response>((resolve) => { resolveRun = resolve; });
    }
    if (url === "/api/run-plan/cancel-response-run/cancel") {
      return Promise.resolve(Response.json({ status: "cancelled", finished: true }));
    }
    if (url === "/api/run-plan/cancel-response-run") {
      return Promise.resolve(Response.json({ error: "测试终止状态同步" }, { status: 404 }));
    }
    throw new Error(`意外请求：${url}`);
  };

  try {
    const running = useFlowStore.getState().runNode("cancel-run-response");
    for (let index = 0; index < 5 && !resolveRun; index += 1) await Promise.resolve();
    assert.ok(resolveRun, "应已发出运行请求并等待 runId");
    await useFlowStore.getState().cancelNodeRun("cancel-run-response");
    resolveRun(Response.json({ runId: "cancel-response-run", status: "queued" }, { status: 202 }));
    await running;
    assert.ok(
      requests.includes("/api/run-plan/cancel-response-run/cancel"),
      "runId 返回后必须把等待中的取消送到后端",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("网络或网关响应不确定时复用同一请求号，已知 runId 后禁止重复付费", async () => {
  useFlowStore.getState().createBlankTab();
  useFlowStore.getState().addExistingNode(aiNode("idempotent-run", "幂等生成"));
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
    const uncertain = useFlowStore.getState().nodes.find((node) => node.id === "idempotent-run");
    assert.equal(uncertain?.data.status, "outcome_unknown");
    assert.match(uncertain?.data.error ?? "", /同一请求号安全确认/);

    await useFlowStore.getState().runNode("idempotent-run");
    assert.deepEqual(clientRequestIds.length, 2);
    assert.equal(clientRequestIds[1], clientRequestIds[0]);
    const gatewayUnknown = useFlowStore.getState().nodes.find((node) => node.id === "idempotent-run");
    assert.equal(gatewayUnknown?.data.status, "outcome_unknown");

    await useFlowStore.getState().runNode("idempotent-run");
    assert.equal(clientRequestIds[2], clientRequestIds[0]);
    const recovering = useFlowStore.getState().nodes.find((node) => node.id === "idempotent-run");
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
  useFlowStore.getState().addExistingNode(aiNode("ambiguous-conflict", "歧义冲突"));
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
    useFlowStore.getState().updateNodeData("ambiguous-conflict", { prompt: "响应丢失后的新提示词" });
    await useFlowStore.getState().runNode("ambiguous-conflict");
    await useFlowStore.getState().runNode("ambiguous-conflict");
    assert.equal(clientRequestIds.length, 3);
    assert.deepEqual(new Set(clientRequestIds).size, 1, "409 后不得换新请求号再次付费");
    const node = useFlowStore.getState().nodes.find((candidate) => candidate.id === "ambiguous-conflict");
    assert.equal(node?.data.status, "outcome_unknown");
    assert.match(node?.data.error ?? "", /旧请求可能已创建任务/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await test("取消请求断网不会产生未处理异常或把原任务误判为已取消", async () => {
  useFlowStore.getState().createBlankTab();
  useFlowStore.getState().addExistingNode(aiNode("cancel-network", "取消断网"));
  useFlowStore.getState().setNodeStatus("cancel-network", "running");
  const state = useFlowStore.getState();
  useFlowStore.setState({
    recentResults: [{
      id: "cancel-network-record",
      image: "",
      nodeId: "cancel-network",
      nodeLabel: "取消断网",
      kind: "ai-modify",
      projectId: state.projectId,
      projectName: state.projectName,
      runId: "cancel-network-run",
      startedAt: Date.now(),
      status: "running",
    }],
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError("取消连接中断");
  };

  try {
    await useFlowStore.getState().cancelNodeRun("cancel-network");
    const node = useFlowStore.getState().nodes.find((candidate) => candidate.id === "cancel-network");
    assert.equal(node?.data.status, "running");
    assert.match(node?.data.error ?? "", /取消结果未知.*继续同步/);
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
  const before = useFlowStore.getState();
  const originalPosition = { ...before.nodes[0].position };

  before.onNodesChange([{
    id: "dimension-node",
    type: "dimensions",
    dimensions: { width: 280, height: 162 },
  }]);

  const after = useFlowStore.getState();
  assert.equal(after.revision, before.revision);
  assert.equal(after.dirty, false);
  assert.deepEqual(after.nodes[0].position, originalPosition);
  assert.deepEqual(after.nodes[0].measured, { width: 280, height: 162 });
});

await test("打开含蒙版节点的项目时只订阅稳定的首张输入图", () => {
  const source = fs.readFileSync(
    new URL("../src/components/nodes/MaskRedrawNode.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(source.includes("const source = useFlowStore((state) => selectNodeInputImages(state, id)[0]);"));
  assert.doesNotMatch(source, /const sourceImages = useFlowStore/);
});

await test("保存当前原图的蒙版后局部重绘按钮立即恢复可点击", () => {
  const sourceRef = "/api/files/mask-source";
  useFlowStore.getState().openFlowTab({
    projectId: "mask-readiness-project",
    projectName: "蒙版按钮测试",
    nodes: [
      {
        id: "mask-source",
        type: "image-input",
        position: { x: 0, y: 0 },
        data: {
          kind: "image-input",
          label: "蒙版原图",
          status: "success",
          imageRole: "default",
          imageUrl: sourceRef,
        },
      },
      {
        id: "mask-node",
        type: "mask-redraw",
        position: { x: 320, y: 0 },
        data: {
          kind: "mask-redraw",
          label: "蒙版局部重绘",
          status: "idle",
          modelId: "gpt-image-2",
          modelOptions: {},
          prompt: "",
          outputImages: [],
        },
      },
    ],
    edges: [{ id: "mask-edge", source: "mask-source", target: "mask-node" }],
  });

  const source = selectNodeInputImages(useFlowStore.getState(), "mask-node")[0];
  assert.equal(source, sourceRef);
  const beforeSave = maskRedrawReadiness({ source, prompt: "" });
  assert.equal(beforeSave.canOpenRunAction, false);

  useFlowStore.getState().updateNodeData("mask-node", {
    mask: "data:image/png;base64,bWFzaw==",
    maskSourceRef: source,
  });
  const savedNode = useFlowStore.getState().nodes.find((node) => node.id === "mask-node");
  assert.equal(savedNode?.data.kind, "mask-redraw");
  if (savedNode?.data.kind !== "mask-redraw") throw new Error("蒙版节点丢失");
  const afterSave = maskRedrawReadiness({
    source,
    mask: savedNode.data.mask,
    maskSourceRef: savedNode.data.maskSourceRef,
    prompt: savedNode.data.prompt,
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
  const redrawSource = fs.readFileSync(
    new URL("../src/components/nodes/MaskRedrawNode.tsx", import.meta.url),
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
  assert.match(redrawSource, /selectNodeInputImages\(currentTab, id\)\[0\] !== source/);
  assert.match(redrawSource, /updateNodeDataInTab\(tabId, id, \{ mask: url, maskSourceRef: source/);
  assert.match(appSource, /shouldWarnBeforeWorkspaceUnload\(\{/);
  assert.match(appSource, /isWorkspaceUnloadWarningSuppressed\(\)/);
  assert.match(appSource, /window\.addEventListener\("beforeunload", warnBeforeUnload\)/);
  assert.match(appSource, /pendingMaskWorkCount > 0\) return/);
  assert.match(authSource, /const authenticatedUserId = useRef<string \| null>\(null\)/);
  assert.match(authSource, /shouldReloadForAuthenticatedUserTransition\(\s*authenticatedUserId\.current/);
  assert.match(authSource, /suppressWorkspaceUnloadWarning\(\);\s*window\.location\.reload\(\)/);
  assert.match(topBarSource, /onClick=\{retryTabSessionPersistence\}/);
});

await test("桌面工作台使用稳定 Dock 且顶栏不再依赖绝对居中", () => {
  const appSource = fs.readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const topBarSource = fs.readFileSync(
    new URL("../src/components/panels/TopBar.tsx", import.meta.url),
    "utf8",
  );
  const shellSource = fs.readFileSync(
    new URL("../src/components/workbench/WorkbenchShell.tsx", import.meta.url),
    "utf8",
  );

  assert.match(appSource, /<WorkbenchShell[\s\S]*library=\{<NodeLibraryPanel/);
  assert.equal((shellSource.match(/\{children\}/g) ?? []).length, 1);
  assert.equal((shellSource.match(/\{library\}/g) ?? []).length, 1);
  assert.equal((shellSource.match(/\{inspector\}/g) ?? []).length, 1);
  assert.doesNotMatch(shellSource, /MobileSheet|useMediaQuery|mobilePanel/);
  assert.match(shellSource, /aria-controls=\{controls\}/);
  assert.match(shellSource, /controls=\{LIBRARY_PANEL_ID\}/);
  assert.match(shellSource, /controls=\{INSPECTOR_PANEL_ID\}/);
  assert.match(shellSource, /transition-\[width,visibility\]/);
  assert.match(topBarSource, /min-w-0 flex-1/);
  assert.doesNotMatch(topBarSource, /absolute left-1\/2/);
});

console.log(`\n通过 ${passed} 项`);
