import assert from "node:assert/strict";
import { registerDragInterruptionHandlers } from "../src/components/CanvasFlow";
import {
  applyRunEventToTab,
  beginHistoryTransaction,
  endHistoryTransaction,
  reconcileRunHistory,
  useFlowStore,
  type FlowNode,
} from "../src/store/flowStore";

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

function aiNode(id = "history-node"): FlowNode {
  return {
    id,
    type: "ai-modify",
    position: { x: 0, y: 0 },
    data: {
      kind: "ai-modify",
      label: "历史事务节点",
      status: "idle",
      prompt: "保留衣身，修改领型",
      aspectRatio: "1:1",
      batchSize: 1,
      outputImages: ["/api/files/previous.png"],
    },
  };
}

function resetDocument(node = aiNode()): { tabId: string; nodeId: string } {
  useFlowStore.getState().loadFlow({
    projectId: `history-project-${node.id}`,
    projectName: "历史事务测试",
    nodes: [node],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();
  return { tabId: useFlowStore.getState().activeTabId, nodeId: node.id };
}

console.log("画布文档历史事务测试");

await test("queued/running/retry/cancel 运行态不进入撤销历史", () => {
  const { tabId, nodeId } = resetDocument();
  const before = useFlowStore.getState();

  for (const status of [
    "queued",
    "running",
    "retry_wait",
    "cancel_requested",
    "cancelled",
    "error",
    "outcome_unknown",
  ] as const) {
    applyRunEventToTab(tabId, nodeId, {
      type: "node-status",
      nodeId,
      status,
      ...(["retry_wait", "error", "outcome_unknown"].includes(status)
        ? { error: "状态同步中断" }
        : {}),
    });
  }

  const after = useFlowStore.getState();
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  assert.equal(after.revision, before.revision);
  assert.equal(after.dirty, before.dirty);
  assert.equal(after.saveState, before.saveState);
  assert.equal(after.nodes[0].data.status, "outcome_unknown");
});

await test("历史对账的运行态修复不进入撤销历史", () => {
  resetDocument();
  useFlowStore.getState().setNodeStatus("history-node", "queued");
  useFlowStore.temporal.getState().clear();
  const beforeRevision = useFlowStore.getState().revision;

  reconcileRunHistory([]);

  assert.equal(useFlowStore.getState().nodes[0].data.status, "idle");
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  assert.equal(useFlowStore.getState().revision, beforeRevision);
});

await test("一次节点拖拽只形成一条记录并一次撤销到起点", () => {
  const { nodeId } = resetDocument();
  const before = useFlowStore.getState();

  const transaction = beginHistoryTransaction("node-drag");
  for (const x of [24, 48, 96]) {
    useFlowStore.getState().onNodesChange([{
      id: nodeId,
      type: "position",
      position: { x, y: 16 },
      dragging: true,
    }]);
  }
  endHistoryTransaction(transaction);

  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  assert.equal(useFlowStore.getState().revision, before.revision + 1);
  assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 96, y: 16 });

  useFlowStore.getState().undo();
  assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 0, y: 0 });

  useFlowStore.getState().redo();
  assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 96, y: 16 });
});

await test("blur、pointercancel 与卸载都会提交最后可见拖拽位置", () => {
  for (const [reason, x] of [
    ["blur", 48],
    ["pointercancel", 96],
    ["unmount", 144],
  ] as const) {
    const { nodeId } = resetDocument(aiNode(`interrupted-${reason}`));
    const beforeRevision = useFlowStore.getState().revision;
    const transactionRef = {
      current: beginHistoryTransaction(`node-drag-${reason}`),
    };
    const target = new EventTarget();
    const cleanup = registerDragInterruptionHandlers(transactionRef, target);

    useFlowStore.getState().onNodesChange([{
      id: nodeId,
      type: "position",
      position: { x, y: 32 },
      dragging: true,
    }]);
    if (reason === "unmount") cleanup();
    else {
      target.dispatchEvent(new Event(reason));
      cleanup();
    }

    assert.equal(transactionRef.current, null, `${reason} 后不得遗留事务 token`);
    assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
    assert.equal(useFlowStore.getState().revision, beforeRevision + 1);
    assert.deepEqual(useFlowStore.getState().nodes[0].position, { x, y: 32 });
    assert.notEqual(useFlowStore.getState().nodes[0].dragging, true);

    useFlowStore.getState().undo();
    assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 0, y: 0 });
    assert.notEqual(useFlowStore.getState().nodes[0].dragging, true);
    useFlowStore.getState().redo();
    assert.deepEqual(useFlowStore.getState().nodes[0].position, { x, y: 32 });
    assert.notEqual(useFlowStore.getState().nodes[0].dragging, true);
  }
});

await test("拖拽回原位是净零事务", () => {
  const { nodeId } = resetDocument();
  const before = useFlowStore.getState();
  const transaction = beginHistoryTransaction("node-drag-net-zero");
  useFlowStore.getState().onNodesChange([{
    id: nodeId,
    type: "position",
    position: { x: 64, y: 32 },
    dragging: true,
  }]);
  useFlowStore.getState().onNodesChange([{
    id: nodeId,
    type: "position",
    position: { x: 0, y: 0 },
    dragging: false,
  }]);
  endHistoryTransaction(transaction);

  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  assert.equal(useFlowStore.getState().revision, before.revision);
  assert.equal(useFlowStore.getState().dirty, before.dirty);
});

await test("切换页签会回滚尚未结束的拖拽事务", () => {
  const { tabId: firstTabId, nodeId } = resetDocument(aiNode("transaction-cancelled"));
  useFlowStore.getState().openFlowTab({
    projectId: "history-second-project",
    projectName: "另一个项目",
    nodes: [aiNode("second-tab-node")],
    edges: [],
  });
  const secondTabId = useFlowStore.getState().activeTabId;
  useFlowStore.getState().switchTab(firstTabId);
  useFlowStore.temporal.getState().clear();
  const beforeRevision = useFlowStore.getState().revision;

  const transaction = beginHistoryTransaction("node-drag-cancelled-by-tab-switch");
  useFlowStore.getState().onNodesChange([{
    id: nodeId,
    type: "position",
    position: { x: 180, y: 64 },
    dragging: true,
  }]);
  applyRunEventToTab(firstTabId, nodeId, {
    type: "node-status",
    nodeId,
    status: "success",
    images: ["/api/files/success-before-switch.png"],
  });
  assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 180, y: 64 });

  useFlowStore.getState().switchTab(secondTabId);
  assert.equal(endHistoryTransaction(transaction), false, "失效 token 不能提交到新页签");
  const firstTab = useFlowStore.getState().tabs.find((tab) => tab.id === firstTabId);
  assert.deepEqual(firstTab?.nodes[0].position, { x: 0, y: 0 });
  assert.deepEqual(
    firstTab?.nodes[0].data.kind === "ai-modify" ? firstTab.nodes[0].data.outputImages : [],
    ["/api/files/success-before-switch.png"],
    "事务回滚不能丢掉期间完成的生成输出",
  );
  assert.equal(firstTab?.revision, beforeRevision + 1);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);

  useFlowStore.getState().switchTab(firstTabId);
  assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 0, y: 0 });
});

await test("无历史的 undo/redo 与同值更新不改变文档元数据", () => {
  const { nodeId } = resetDocument();
  useFlowStore.setState((state) => ({
    dirty: false,
    saveState: "saved",
    savedRevision: state.revision,
  }));
  const before = useFlowStore.getState();

  useFlowStore.getState().updateNodeData(nodeId, { label: before.nodes[0].data.label });
  useFlowStore.getState().undo();
  let after = useFlowStore.getState();
  assert.equal(after.revision, before.revision);
  assert.equal(after.savedRevision, before.savedRevision);
  assert.equal(after.dirty, before.dirty);
  assert.equal(after.saveState, before.saveState);

  useFlowStore.getState().redo();

  after = useFlowStore.getState();
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  assert.equal(useFlowStore.temporal.getState().futureStates.length, 0);
  assert.equal(after.revision, before.revision);
  assert.equal(after.savedRevision, before.savedRevision);
  assert.equal(after.dirty, before.dirty);
  assert.equal(after.saveState, before.saveState);
});

await test("项目名称作为文档字段可撤销重做且不回退运行态", () => {
  const { tabId, nodeId } = resetDocument(aiNode("project-name-history"));
  const before = useFlowStore.getState();

  useFlowStore.getState().setProjectName("重命名后的项目");
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  assert.equal(useFlowStore.getState().revision, before.revision + 1);

  applyRunEventToTab(tabId, nodeId, {
    type: "node-status",
    nodeId,
    status: "running",
  });
  useFlowStore.getState().undo();
  assert.equal(useFlowStore.getState().projectName, before.projectName);
  assert.equal(useFlowStore.getState().nodes[0].data.status, "running");

  useFlowStore.getState().redo();
  assert.equal(useFlowStore.getState().projectName, "重命名后的项目");
  assert.equal(useFlowStore.getState().nodes[0].data.status, "running");
});

await test("项目名称的撤销栈按页签隔离", () => {
  const { tabId: firstTabId } = resetDocument(aiNode("project-name-tab-a"));
  useFlowStore.getState().setProjectName("A 重命名");
  useFlowStore.getState().openFlowTab({
    projectId: "project-name-tab-b",
    projectName: "B 原名",
    nodes: [aiNode("project-name-tab-b-node")],
    edges: [],
  });
  const secondTabId = useFlowStore.getState().activeTabId;
  useFlowStore.getState().setProjectName("B 重命名");

  useFlowStore.getState().switchTab(firstTabId);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  useFlowStore.getState().undo();
  assert.equal(useFlowStore.getState().projectName, "历史事务测试");

  useFlowStore.getState().switchTab(secondTabId);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  useFlowStore.getState().undo();
  assert.equal(useFlowStore.getState().projectName, "B 原名");
});

await test("成功生成输出作为一次提交，撤销输出时保留最新运行态", () => {
  const { tabId, nodeId } = resetDocument();
  const beforeRevision = useFlowStore.getState().revision;

  applyRunEventToTab(tabId, nodeId, {
    type: "node-status",
    nodeId,
    status: "running",
  });
  applyRunEventToTab(tabId, nodeId, {
    type: "node-status",
    nodeId,
    status: "success",
    images: ["/api/files/final-a.png", "/api/files/final-b.png"],
    finishedAt: 2_000,
  });

  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  assert.equal(useFlowStore.getState().revision, beforeRevision + 1);
  assert.deepEqual(
    useFlowStore.getState().nodes[0].data.kind === "ai-modify"
      ? useFlowStore.getState().nodes[0].data.outputImages
      : [],
    ["/api/files/final-a.png", "/api/files/final-b.png"],
  );

  useFlowStore.getState().undo();
  const undone = useFlowStore.getState().nodes[0].data;
  assert.equal(undone.status, "success", "undo 只撤销文档输出，不倒退服务端运行态");
  assert.deepEqual(undone.kind === "ai-modify" ? undone.outputImages : [], ["/api/files/previous.png"]);

  useFlowStore.getState().redo();
  const redone = useFlowStore.getState().nodes[0].data;
  assert.equal(redone.status, "success");
  assert.deepEqual(
    redone.kind === "ai-modify" ? redone.outputImages : [],
    ["/api/files/final-a.png", "/api/files/final-b.png"],
  );
});

await test("拖拽期间的成功输出与位置历史彼此独立", () => {
  const { tabId, nodeId } = resetDocument(aiNode("concurrent-success"));
  const beforeRevision = useFlowStore.getState().revision;
  const transaction = beginHistoryTransaction("node-drag-with-success");
  useFlowStore.getState().onNodesChange([{
    id: nodeId,
    type: "position",
    position: { x: 120, y: 48 },
    dragging: true,
  }]);
  applyRunEventToTab(tabId, nodeId, {
    type: "node-status",
    nodeId,
    status: "success",
    images: ["/api/files/concurrent.png"],
  });
  endHistoryTransaction(transaction);

  assert.equal(useFlowStore.temporal.getState().pastStates.length, 2);
  assert.equal(useFlowStore.getState().revision, beforeRevision + 2);
  assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 120, y: 48 });

  useFlowStore.getState().undo();
  let data = useFlowStore.getState().nodes[0].data;
  assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 0, y: 0 });
  assert.deepEqual(data.kind === "ai-modify" ? data.outputImages : [], ["/api/files/concurrent.png"]);

  useFlowStore.getState().undo();
  data = useFlowStore.getState().nodes[0].data;
  assert.deepEqual(useFlowStore.getState().nodes[0].position, { x: 0, y: 0 });
  assert.deepEqual(data.kind === "ai-modify" ? data.outputImages : [], ["/api/files/previous.png"]);
});

await test("后台页签的成功输出在切回后仍可独立撤销", () => {
  const { tabId: firstTabId, nodeId } = resetDocument(aiNode("background-success"));
  useFlowStore.getState().openFlowTab({
    projectId: "background-success-second-project",
    projectName: "前台项目",
    nodes: [aiNode("foreground-node")],
    edges: [],
  });
  const secondTabId = useFlowStore.getState().activeTabId;

  applyRunEventToTab(firstTabId, nodeId, {
    type: "node-status",
    nodeId,
    status: "success",
    images: ["/api/files/background-success.png"],
  });
  const backgroundTab = useFlowStore.getState().tabs.find((tab) => tab.id === firstTabId);
  assert.deepEqual(
    backgroundTab?.nodes[0].data.kind === "ai-modify"
      ? backgroundTab.nodes[0].data.outputImages
      : [],
    ["/api/files/background-success.png"],
  );

  useFlowStore.getState().switchTab(firstTabId);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  useFlowStore.getState().undo();
  const undone = useFlowStore.getState().nodes[0].data;
  assert.equal(undone.status, "success");
  assert.deepEqual(undone.kind === "ai-modify" ? undone.outputImages : [], ["/api/files/previous.png"]);

  useFlowStore.getState().switchTab(secondTabId);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  useFlowStore.getState().switchTab(firstTabId);
  assert.equal(useFlowStore.temporal.getState().futureStates.length, 1, "页签切换不能丢失 redo");
  useFlowStore.getState().redo();
  const redone = useFlowStore.getState().nodes[0].data;
  assert.deepEqual(
    redone.kind === "ai-modify" ? redone.outputImages : [],
    ["/api/files/background-success.png"],
  );
});

await test("每个项目页签保留独立的撤销与重做栈", () => {
  const { tabId: firstTabId, nodeId: firstNodeId } = resetDocument(aiNode("tab-history-a"));
  useFlowStore.getState().updateNodeData(firstNodeId, { prompt: "A 的新提示词" });
  useFlowStore.getState().openFlowTab({
    projectId: "tab-history-project-b",
    projectName: "页签 B",
    nodes: [aiNode("tab-history-b")],
    edges: [],
  });
  const secondTabId = useFlowStore.getState().activeTabId;
  useFlowStore.getState().updateNodeData("tab-history-b", { prompt: "B 的新提示词" });

  useFlowStore.getState().switchTab(firstTabId);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  useFlowStore.getState().undo();
  const firstData = useFlowStore.getState().nodes[0].data;
  assert.equal(firstData.kind === "ai-modify" ? firstData.prompt : "", "保留衣身，修改领型");

  useFlowStore.getState().switchTab(secondTabId);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  useFlowStore.getState().undo();
  const secondData = useFlowStore.getState().nodes[0].data;
  assert.equal(secondData.kind === "ai-modify" ? secondData.prompt : "", "保留衣身，修改领型");
});

await test("运行态写入不清除已有 redo，成功事件重放不新增历史", () => {
  const { tabId, nodeId } = resetDocument();
  useFlowStore.getState().updateNodeData(nodeId, { prompt: "第一次修改" });
  useFlowStore.getState().undo();
  assert.equal(useFlowStore.temporal.getState().futureStates.length, 1);

  applyRunEventToTab(tabId, nodeId, { type: "node-status", nodeId, status: "running" });
  assert.equal(useFlowStore.temporal.getState().futureStates.length, 1);
  useFlowStore.getState().redo();
  assert.equal(
    useFlowStore.getState().nodes[0].data.kind === "ai-modify"
      ? useFlowStore.getState().nodes[0].data.prompt
      : "",
    "第一次修改",
  );

  applyRunEventToTab(tabId, nodeId, {
    type: "node-status",
    nodeId,
    status: "success",
    images: ["/api/files/replayed.png"],
  });
  const historyCount = useFlowStore.temporal.getState().pastStates.length;
  const revision = useFlowStore.getState().revision;
  applyRunEventToTab(tabId, nodeId, {
    type: "node-status",
    nodeId,
    status: "success",
    images: ["/api/files/replayed.png"],
  });
  assert.equal(useFlowStore.temporal.getState().pastStates.length, historyCount);
  assert.equal(useFlowStore.getState().revision, revision);
});

console.log(`\n通过 ${passed} 项`);
