import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  COALESCED_TEXT_EDIT_IDLE_MS,
  applyResultNodeCreatedEventToTab,
  applyRunEventToTab,
  flushActiveTextEdit,
  selectActiveDocument,
  setCoalescedTextEditComposing,
  updateCoalescedTextEdit,
  useFlowStore,
  type DocumentTarget,
  type FlowNode,
} from "../src/store/flowStore";
import { createCompositionEnterGuard } from "../src/hooks/useCoalescedTextEdit";

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

function textNode(id = "coalesced-text-node"): FlowNode {
  // v8：提示词正文住在 text 节点上（生成节点由上游 text 供词），所以连续文本编辑
  // 的宿主就是 text 节点的 `text` 字段。
  return {
    id,
    type: "text",
    position: { x: 0, y: 0 },
    data: {
      kind: "text",
      label: "连续文本节点",
      status: "idle",
      text: "初始提示词",
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
  return data.kind === "text" ? data.text : "";
}

function resetDocument(id = "coalesced-text-node") {
  flushActiveTextEdit();
  useFlowStore.getState().loadFlow({
    projectId: `coalesced-project-${id}`,
    projectName: "连续文本测试",
    nodes: [textNode(id)],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();
}

console.log("连续文本编辑事务测试");

await test("一个输入 burst 实时更新，但只提交一次 history/revision", () => {
  resetDocument("single-burst");
  const beforeRevision = activeDocument().revision;
  let token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "single-burst", field: "text" },
    "第",
  );
  assert.ok(token);
  token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "single-burst", field: "text" },
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
  const descriptor = { kind: "node-data", nodeId: "idle-boundary", field: "text" } as const;
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
  const descriptor = { kind: "node-data", nodeId: "ime-boundary", field: "text" } as const;
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

await test("IME 候选确认 Enter 的 compositionend 后 keyup 不成为多行提交边界", () => {
  const guard = createCompositionEnterGuard();
  guard.markKeyDown("Enter", true);
  // compositionend happens here and intentionally does not clear the guard.
  assert.equal(guard.consumeKeyUp("Enter"), true);
  assert.equal(guard.consumeKeyUp("Enter"), false);

  guard.markKeyDown("Enter", false);
  assert.equal(guard.consumeKeyUp("Enter"), false);
  guard.markKeyDown("Enter", true);
  guard.markKeyDown("Enter", false);
  assert.equal(guard.consumeKeyUp("Enter"), false);
  guard.markKeyDown("Enter", true);
  guard.reset();
  assert.equal(guard.consumeKeyUp("Enter"), false);
});

await test("标签切换先提交源标签文本，旧 token 不能写入新项目", () => {
  resetDocument("tab-source");
  const sourceTabId = useFlowStore.getState().activeTabId;
  const token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "tab-source", field: "text" },
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

await test("运行态回写不进入撤销历史，产物经结果节点落地（v8）", () => {
  resetDocument("async-success-order");
  const token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "async-success-order", field: "text" },
    "运行前最终提示词",
  );
  assert.ok(token);
  assert.equal(flushActiveTextEdit(token), true);
  applyRunEventToTab(activeTarget(), "async-success-order", {
    type: "node-status",
    nodeId: "async-success-order",
    status: "success",
    images: ["/api/files/success.png"],
  });
  // v8（runtime.md §1/§3）：node-status 只回写运行态，既不提交文档也不产生撤销步。
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1, "运行态回写不得进入撤销历史");
  assert.equal(prompt(), "运行前最终提示词");
  assert.equal(activeDocument().nodes[0].data.status, "success");

  assert.equal(
    applyResultNodeCreatedEventToTab(activeTarget(), {
      type: "result-node-created",
      resultNodeId: "async-success-result",
      sourceGeneratorId: "async-success-order",
      runId: "run-async",
      mediaKind: "image",
      urls: ["/api/files/success.png"],
    }),
    true,
  );
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 2, "结果节点落地是一次文档变更");
  useFlowStore.getState().undo();
  assert.equal(
    activeDocument().nodes.filter((node) => node.data.kind === "result-image").length,
    0,
    "撤销先回退结果节点",
  );
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
    nodes: [textNode("foreground-edit")],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();

  const foregroundBeforeRevision = activeDocument().revision;
  const token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "foreground-edit", field: "text" },
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
  assert.equal(
    backgroundTab?.nodes.filter((node) => node.data.kind === "result-image").length,
    0,
    "运行态回写不产生结果节点",
  );
  // v8：后台产物经结果节点事件落地，仍不影响前台正在组合的文本事务。
  assert.equal(
    applyResultNodeCreatedEventToTab(backgroundTarget, {
      type: "result-node-created",
      resultNodeId: "background-success-result",
      sourceGeneratorId: "background-success",
      runId: "run-background",
      mediaKind: "image",
      urls: ["/api/files/background-success.png"],
    }),
    true,
  );
  assert.equal(prompt(), "衣身", "后台结果落地不得打断前台组合输入");
  assert.equal(activeDocument().revision, foregroundBeforeRevision, "前台文档 revision 不受后台页签影响");
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  const backgroundTabAfterResult = useFlowStore.getState().tabs.find((tab) => tab.id === backgroundTabId);
  assert.deepEqual(
    backgroundTabAfterResult?.nodes
      .filter((node) => node.data.kind === "result-image")
      .flatMap((node) => (node.data.kind === "result-image" ? node.data.images : [])),
    ["/api/files/background-success.png"],
  );

  const finalToken = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "foreground-edit", field: "text" },
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

await test("同页签换项目后迟到的旧 success 不会提交新文档 IME 事务", () => {
  resetDocument("stale-run-source");
  const staleTarget = activeTarget();
  useFlowStore.getState().loadFlow({
    projectId: "coalesced-project-reused-tab",
    projectName: "同页签新项目",
    nodes: [textNode("reused-tab-edit")],
    edges: [],
  });
  useFlowStore.temporal.getState().clear();

  const beforeRevision = activeDocument().revision;
  const token = updateCoalescedTextEdit(
    { kind: "node-data", nodeId: "reused-tab-edit", field: "text" },
    "新项目正在组合",
    null,
    { composing: true },
  );
  assert.ok(token);
  applyRunEventToTab(staleTarget, "stale-run-source", {
    type: "node-status",
    nodeId: "stale-run-source",
    status: "success",
    images: ["/api/files/stale-success.png"],
  });

  assert.equal(prompt(), "新项目正在组合");
  assert.equal(activeDocument().revision, beforeRevision);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 0);
  assert.equal(
    activeDocument().nodes.filter((node) => node.data.kind === "result-image").length,
    0,
    "迟到的旧 success 不得在新文档里留下产物",
  );

  assert.equal(setCoalescedTextEditComposing(token, false), true);
  assert.equal(flushActiveTextEdit(token), true);
  assert.equal(activeDocument().revision, beforeRevision + 1);
  assert.equal(useFlowStore.temporal.getState().pastStates.length, 1);
});

await test("页面退出、关闭页签和所有文本入口都接入统一提交边界", async () => {
  const [app, projectTabs, topBar, inspector, nodeFrame, textEditHook] = await Promise.all([
    readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/panels/ProjectTabs.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/panels/TopBar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/panels/InspectorPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/nodes/NodeFrame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/hooks/useCoalescedTextEdit.ts", import.meta.url), "utf8"),
  ]);
  assert.match(app, /flushActiveTextEdit\(\);\s*flushTabSessionPersistence\(\);/);
  assert.match(projectTabs, /flushActiveTextEdit\(\);[\s\S]*useFlowStore\.getState\(\)\.tabs\.find/);
  assert.match(projectTabs, /useCoalescedTextEdit\([\s\S]*kind: "project-name"/);
  assert.doesNotMatch(topBar, /kind: "project-name"/);
  assert.match(inspector, /field: "label"/);
  assert.match(nodeFrame, /labelEdit\.cancel\(\)/);
  assert.match(textEditHook, /markKeyDown\(event\.key, composing\)/);
  assert.match(textEditHook, /consumeKeyUp\(event\.key\)\) return/);
});

console.log(`\n通过 ${passed} 项`);
