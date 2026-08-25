import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  COALESCED_TEXT_EDIT_IDLE_MS,
  applyRunEventToTab,
  flushActiveTextEdit,
  selectActiveDocument,
  setCoalescedTextEditComposing,
  updateCoalescedTextEdit,
  useFlowStore,
  type DocumentTarget,
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

function aiNode(id = "coalesced-text-node"): FlowNode {
  return {
    id,
    type: "ai-modify",
    position: { x: 0, y: 0 },
    data: {
      kind: "ai-modify",
      label: "连续文本节点",
      status: "idle",
      prompt: "初始提示词",
      aspectRatio: "1:1",
      batchSize: 1,
      outputImages: [],
    },
  };
}

function activeDocument() {
  return selectActiveDocument(useFlowStore.getState());
}

function activeTarget(): DocumentTarget {
  const state = useFlowStore.getState();
  const tab = activeDocument();
  return { tabId: state.activeTabId, projectId: tab.projectId, documentEpoch: tab.documentEpoch };
}

function prompt(): string {
  const data = activeDocument().nodes[0].data;
  return data.kind === "ai-modify" ? data.prompt : "";
}

function resetDocument(id = "coalesced-text-node") {
  flushActiveTextEdit();
  useFlowStore.getState().loadFlow({
    projectId: `coalesced-project-${id}`,
    projectName: "连续文本测试",
    nodes: [aiNode(id)],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();
}

console.log("连续文本编辑事务测试");

await test("一个输入 burst 实时更新，但只提交一次 history/revision", () => {
  resetDocument("single-burst");
  const beforeRevision = activeDocument().revision;
  let token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "single-burst", field: "prompt" },
    "第",
  );
  assert.ok(token);
  token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "single-burst", field: "prompt" },
    "第一版完整提示词",
    token,
  );
  assert.ok(token);
  assert.equal(prompt(), "第一版完整提示词");
  assert.equal(activeDocument().revision, beforeRevision);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);

  assert.equal(flushActiveTextEdit(token), true);
  assert.equal(activeDocument().revision, beforeRevision + 1);
  assert.equal(activeDocument().dirty, true);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);

  useFlowStore.getState().undo();
  assert.equal(prompt(), "初始提示词");
  useFlowStore.getState().redo();
  assert.equal(prompt(), "第一版完整提示词");
});

await test("800ms 空闲自动收口，下一次输入形成独立撤销步", async () => {
  resetDocument("idle-boundary");
  const descriptor = { kind: "node-data", nodeId: "idle-boundary", field: "prompt" } as const;
  const token = updateCoalescedTextEdit(descriptor, "第一次 burst");
  assert.ok(token);
  await new Promise((resolve) => setTimeout(resolve, COALESCED_TEXT_EDIT_IDLE_MS + 40));
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);

  const nextToken = updateCoalescedTextEdit(descriptor, "第二次 burst", token);
  assert.ok(nextToken);
  assert.notEqual(nextToken.id, token.id);
  flushActiveTextEdit(nextToken);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 2);
  useFlowStore.getState().undo();
  assert.equal(prompt(), "第一次 burst");
});

await test("IME 组合输入期间不会被空闲计时器中途提交", async () => {
  resetDocument("ime-boundary");
  const descriptor = { kind: "node-data", nodeId: "ime-boundary", field: "prompt" } as const;
  const token = updateCoalescedTextEdit(descriptor, "衣", null, { composing: true });
  assert.ok(token);
  await new Promise((resolve) => setTimeout(resolve, COALESCED_TEXT_EDIT_IDLE_MS + 40));
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  assert.equal(activeDocument().revision, 0);

  const finalToken = updateCoalescedTextEdit(descriptor, "衣身保持不变", token, { composing: true });
  assert.ok(finalToken);
  assert.equal(setCoalescedTextEditComposing(finalToken, false), true);
  flushActiveTextEdit(finalToken);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
  assert.equal(prompt(), "衣身保持不变");
});

await test("标签切换先提交源标签文本，旧 token 不能写入新项目", () => {
  resetDocument("tab-source");
  const sourceTabId = useFlowStore.getState().activeTabId;
  const token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "tab-source", field: "prompt" },
    "切换前必须保留",
  );
  assert.ok(token);
  useFlowStore.getState().createBlankTab();
  const newProjectName = activeDocument().projectName;
  assert.notEqual(useFlowStore.getState().activeTabId, sourceTabId);
  const source = useFlowStore.getState().tabs.find((tab) => tab.id === sourceTabId);
  assert.equal(source?.revision, 1);
  assert.equal(source?.dirty, true);
  assert.equal(
    updateCoalescedTextEdit({ kind: "project-name" }, "旧事件污染", token),
    null,
  );
  assert.equal(activeDocument().projectName, newProjectName);
});

await test("异步成功回写前先提交文本，撤销顺序保持为 success→text", () => {
  resetDocument("async-success-order");
  const token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "async-success-order", field: "prompt" },
    "运行前最终提示词",
  );
  assert.ok(token);
  applyRunEventToTab(activeTarget(), "async-success-order", {
    type: "node-status",
    nodeId: "async-success-order",
    status: "success",
    images: ["/api/files/success.png"],
  });
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 2);
  assert.deepEqual(activeDocument().nodes[0].data.outputImages, ["/api/files/success.png"]);

  useFlowStore.getState().undo();
  assert.equal(prompt(), "运行前最终提示词");
  assert.deepEqual(activeDocument().nodes[0].data.outputImages, []);
  useFlowStore.getState().undo();
  assert.equal(prompt(), "初始提示词");
});

await test("后台页签 success 不会拆分前台页签的输入或 IME 事务", () => {
  resetDocument("background-success");
  const backgroundTarget = activeTarget();
  const backgroundTabId = backgroundTarget.tabId;
  useFlowStore.getState().createBlankTab();
  useFlowStore.getState().loadFlow({
    projectId: "coalesced-project-foreground-edit",
    projectName: "前台连续输入",
    nodes: [aiNode("foreground-edit")],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();

  const foregroundBeforeRevision = activeDocument().revision;
  const token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "foreground-edit", field: "prompt" },
    "衣身",
    null,
    { composing: true },
  );
  assert.ok(token);

  applyRunEventToTab(backgroundTarget, "background-success", {
    type: "node-status",
    nodeId: "background-success",
    status: "success",
    images: ["/api/files/background-success.png"],
  });

  assert.equal(prompt(), "衣身");
  assert.equal(activeDocument().revision, foregroundBeforeRevision);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  const backgroundTab = useFlowStore.getState().tabs.find((tab) => tab.id === backgroundTabId);
  assert.deepEqual(
    backgroundTab?.nodes[0].data.outputImages,
    ["/api/files/background-success.png"],
  );

  const finalToken = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "foreground-edit", field: "prompt" },
    "衣身保持不变",
    token,
    { composing: true },
  );
  assert.ok(finalToken);
  assert.equal(setCoalescedTextEditComposing(finalToken, false), true);
  assert.equal(flushActiveTextEdit(finalToken), true);
  assert.equal(prompt(), "衣身保持不变");
  assert.equal(activeDocument().revision, foregroundBeforeRevision + 1);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
});

await test("页面退出、关闭页签和所有文本入口都接入统一提交边界", async () => {
  const [app, projectTabs, topBar, inspector, nodeFrame] = await Promise.all([
    readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/panels/ProjectTabs.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/panels/TopBar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/panels/InspectorPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/nodes/NodeFrame.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(app, /flushActiveTextEdit\(\);\s*flushTabSessionPersistence\(\);/);
  assert.match(projectTabs, /flushActiveTextEdit\(\);[\s\S]*useFlowStore\.getState\(\)\.tabs\.find/);
  assert.match(topBar, /useCoalescedTextEdit\(\{ kind: "project-name" \}\)/);
  assert.match(inspector, /field: "label"[\s\S]*field: "prompt"[\s\S]*field: "note"/);
  assert.match(nodeFrame, /labelEdit\.cancel\(\)/);
});

console.log(`\n通过 ${passed} 项`);
