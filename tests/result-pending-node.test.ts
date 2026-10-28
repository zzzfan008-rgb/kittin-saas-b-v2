/**
 * 「点运行即出结果节点 + 生成中动效」（用户 2026-10-28）。
 *
 * 锁定四件事：
 *  1. 占位结果节点（runId 为空）**不落库**，指向它的边也一并过滤；
 *  2. 结果节点在 running 态渲染「暗房显影」+ 已用时角标，而不是空态文案；
 *  3. store 在 runNode 里插入占位节点，并在事件到达时原地升级（不新建第二个节点）；
 *  4. 蒙版重绘 / 多轮修改右栏在运行中渲染同一套进度块。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactFlowProvider } from "@xyflow/react";

const read = (rel: string) => readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), "utf8");

const { createDocumentSnapshot } = await import("../src/lib/documentSnapshot");
const { ResultImageNode } = await import("../src/components/nodes/ResultImageNode");

console.log("点运行即出结果节点 + 生成中动效");

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const generator = {
  id: "gen-1",
  type: "image-generator",
  position: { x: 0, y: 0 },
  data: {
    kind: "image-generator", label: "生图", status: "running",
    operationMode: "edit", modelId: "gpt-image-2.5-flare", modelOptions: {}, aspectRatio: "1:1", batchSize: 1,
  },
};
const pendingResult = {
  id: "pending-result-abc",
  type: "result-image",
  position: { x: 380, y: 0 },
  data: {
    kind: "result-image", label: "图片结果", status: "running",
    images: [], sourceGeneratorId: "gen-1", runId: "", startedAt: Date.now(),
  },
};
const pendingEdge = {
  id: "e-result-pending-result-abc", source: "gen-1", sourceHandle: "result",
  target: "pending-result-abc", targetHandle: "result", data: {},
};

ok("占位结果节点不落库：快照里既没有节点也没有它的溯源边", () => {
  const snapshot = createDocumentSnapshot({
    projectName: "p",
    nodes: [generator, pendingResult] as never,
    edges: [pendingEdge] as never,
  });
  assert.equal(snapshot.nodes.some((node) => node.id === "pending-result-abc"), false, "占位节点必须被过滤");
  assert.equal(snapshot.nodes.some((node) => node.id === "gen-1"), true, "生成节点必须保留");
  assert.equal(snapshot.edges.length, 0, "指向占位节点的边必须一起过滤");
});

ok("已完成的结果节点正常落库（runId 非空不受影响）", () => {
  const done = { ...pendingResult, id: "res-done", data: { ...pendingResult.data, runId: "run-1", images: ["/api/files/a.png"] } };
  const snapshot = createDocumentSnapshot({
    projectName: "p",
    nodes: [generator, done] as never,
    edges: [{ ...pendingEdge, target: "res-done" }] as never,
  });
  assert.equal(snapshot.nodes.some((node) => node.id === "res-done"), true);
  assert.equal(snapshot.edges.length, 1);
});

ok("结果节点 running 态渲染显影动效 + 已用时角标，不显示空态文案", () => {
  const html = renderToStaticMarkup(createElement(
    ReactFlowProvider,
    null,
    createElement(ResultImageNode, {
      id: "pending-result-abc",
      type: "result-image",
      selected: false,
      dragging: false,
      zIndex: 0,
      isConnectable: true,
      data: { ...pendingResult.data, startedAt: Date.now() - 5000 },
    } as never),
  ));
  assert.match(html, /data-testid="run-progress-block"/, "缺少生成中进度块");
  assert.match(html, /develop-overlay/, "缺少暗房显影动画");
  assert.match(html, /data-testid="result-elapsed"/, "缺少已用时角标");
  assert.doesNotMatch(html, /本次运行没有产物/, "运行中不得显示空态文案");
});

ok("store：runNode 插入占位节点，事件到达时原地升级", () => {
  const store = read("src/store/flowStore.ts");
  assert.match(store, /createPendingResultNode\(tab, id\)/, "runNode 必须插入占位结果节点");
  assert.match(store, /isPendingResultNode/, "必须有占位节点判定");
  // 原地升级时必须把节点 id 改成服务端 resultNodeId（结果节点 id 属服务端契约）。
  assert.match(
    store,
    /const upgraded: FlowNode = \{ \.\.\.pending, id: event\.resultNodeId, type: node\.type, data: node\.data \}/,
    "事件到达必须原地升级并采用服务端 resultNodeId",
  );
});

ok("生成节点自身不再渲染「显影中」（用户 2026-10-28：结果节点已承担）", () => {
  for (const file of ["src/components/nodes/ImageGeneratorNode.tsx", "src/components/nodes/VideoGeneratorNode.tsx"]) {
    const source = read(file);
    assert.doesNotMatch(source, /<Developing\s*\/>/, `${file} 不得再渲染 Developing`);
    assert.doesNotMatch(source, /import \{[^}]*Developing/, `${file} 不应再导入 Developing`);
  }
});

ok("蒙版重绘 / 多轮修改右栏都接入同一进度块", () => {
  for (const file of ["src/components/nodes/MaskEditor.tsx", "src/components/nodes/MultiRoundEditPanel.tsx"]) {
    const source = read(file);
    assert.match(source, /RunProgressBlock/, `${file} 必须渲染 RunProgressBlock`);
    assert.match(source, /data-testid|RunProgressBlock nodeId=/, `${file} 需要接入进度块`);
  }
});

console.log(`通过 ${passed} 项`);
