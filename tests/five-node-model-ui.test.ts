import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactFlowProvider } from "@xyflow/react";
import { useFlowStore } from "../src/store/flowStore";
import { nodeTypes } from "../src/components/nodes";
import { TextNode } from "../src/components/nodes/TextNode";
import { ImageGeneratorNode } from "../src/components/nodes/ImageGeneratorNode";
import { ResultImageNode } from "../src/components/nodes/ResultImageNode";
import { NODE_SPECS } from "../src/types/workflow";
import type { FlowNode } from "../src/store/flowStore";

/**
 * v8 三层七节点 UI 渲染回归（plan.md §3）：把节点组件真实渲染成静态 DOM，
 * 断言几何/控件/文案来自契约，而不是断言 class 名。
 */

let passed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

function render(node: FlowNode, selected = true) {
  const Component = nodeTypes[node.type ?? ""] as typeof TextNode;
  assert.ok(Component, `节点类型未注册：${String(node.type)}`);
  const props = { id: node.id, data: node.data, selected } as unknown as Parameters<typeof Component>[0];
  return renderToStaticMarkup(
    createElement(ReactFlowProvider, null, createElement(Component, props)),
  );
}

console.log("v8 三层七节点 UI 渲染测试");

test("文本节点：工具条动作齐全，正文可编辑，且不再有「功能设置」入口条", () => {
  const node = {
    id: "text-1",
    type: "text",
    position: { x: 0, y: 0 },
    data: { kind: "text", label: "提示词", status: "idle", text: "一件棉质白衬衫" },
  } as unknown as FlowNode;
  useFlowStore.getState().openFlowTab({
    projectId: "v8-text-project",
    projectName: "v8 文本节点",
    nodes: [node],
    edges: [],
  });
  const html = render(node);
  const labels = ["色彩工具", "复制"];
  for (const label of labels) assert.match(html, new RegExp(`aria-label="${label}"`), `缺少工具条动作 ${label}`);
  assert.match(html, /role="toolbar"/);
  assert.match(html, /一件棉质白衬衫/);
  assert.doesNotMatch(html, /功能设置/);
  // v8 几何：卡片宽度只能来自 token，不在组件里硬编码 280px。
  assert.match(html, /w-\[var\(--gc-node-width\)\]/);
  assert.doesNotMatch(html, /w-\[280px\]/);
  // 未选中：工具条不占 DOM（plan.md §3.2「仅选中态渲染」）。
  const unselected = render(node, false);
  assert.doesNotMatch(unselected, /role="toolbar"/);
  assert.match(unselected, /一件棉质白衬衫/);
});

test("生图节点：功能 / 模型 / 画幅 / 运行内联在卡片上，未绑定功能时运行闸门关闭", () => {
  const node = {
    id: "image-generator-1",
    type: "image-generator",
    position: { x: 0, y: 0 },
    data: {
      kind: "image-generator",
      label: "生图",
      status: "idle",
      promptVariantId: "",
      modelId: "gemini-3.1-flash-image",
      modelOptions: { aspectRatio: "3:4", imageSize: "2K" },
      aspectRatio: "3:4",
      batchSize: 1,
    },
  } as unknown as FlowNode;
  useFlowStore.getState().openFlowTab({
    projectId: "v8-generator-project",
    projectName: "v8 生图节点",
    nodes: [node],
    edges: [],
  });
  const html = render(node);
  if (process.env.GC_DUMP) console.log(html.slice(-1500));
  assert.match(html, /aria-label="功能"/);
  assert.match(html, /aria-label="模型"/);
  assert.match(html, /aria-label="画幅"/);
  assert.match(html, /aria-label="模型参数"/);
  assert.match(html, /参考图 0 张 · 提示词 0 条/);
  // 未绑定功能（空串）= fail-closed：运行控件以不可运行态呈现并给出阻塞原因
  // （安全门未清算时显示「生成暂不可用」，否则显示准入判定原因）。
  assert.match(html, /生成暂不可用|尚不可运行/);
  assert.match(html, /disabled/);
  assert.doesNotMatch(html, /功能设置/);
});

test("图片结果节点：渲染产物与溯源，工具条按能力给出禁用原因", () => {
  const node = {
    id: "result-image-1",
    type: "result-image",
    position: { x: 0, y: 0 },
    data: {
      kind: "result-image",
      label: "图片结果",
      status: "success",
      images: ["/api/files/out-1.png", "/api/files/out-2.png"],
      sourceGeneratorId: "image-generator-1",
      runId: "run-1",
    },
  } as unknown as FlowNode;
  useFlowStore.getState().openFlowTab({
    projectId: "v8-result-project",
    projectName: "v8 结果节点",
    nodes: [node],
    edges: [],
  });
  const html = render(node);
  assert.match(html, /\/api\/files\/out-1\.png/);
  assert.match(html, /来自：/);
  assert.match(html, /aria-label="下载"/);
  assert.match(html, /aria-label="作为输入"/);
  assert.match(html, /暂不可用/);
});

test("生视频节点：提示词 / 首帧接线回显与 adaptive 画幅来自契约", () => {
  const node = {
    id: "video-generator-1",
    type: "video-generator",
    position: { x: 0, y: 0 },
    data: {
      kind: "video-generator",
      label: "生视频",
      status: "idle",
      promptVariantId: "",
      modelId: "doubao-seedance-2-5-260628",
      modelOptions: { aspectRatio: "adaptive" },
      aspectRatio: "adaptive",
    },
  } as unknown as FlowNode;
  useFlowStore.getState().openFlowTab({
    projectId: "v8-video-generator-project",
    projectName: "v8 生视频节点",
    nodes: [node],
    edges: [],
  });
  const html = render(node);
  assert.match(html, /aria-label="功能"/);
  // 视频侧接线回显是「提示词 M 条 · 首帧已接/未接」，不是参考图张数。
  assert.match(html, /提示词 0 条 · 首帧未接/);
  assert.match(html, /单次任务产出一个 MP4/);
  // 首尾帧任务必须 adaptive（C6）：画幅选项来自视频契约。
  assert.match(html, /adaptive/);
});

test("节点注册表覆盖七种 kind，且节点库只暴露 userCreatable 的 kind", () => {
  for (const kind of Object.keys(NODE_SPECS) as Array<keyof typeof NODE_SPECS>) {
    assert.ok(nodeTypes[kind], `节点类型未注册：${kind}`);
  }
  assert.equal(Object.keys(nodeTypes).length, 7);
  // 结果节点由 RunEvent 驱动创建，用户不可手动新增（runtime.md §1）。
  assert.equal(NODE_SPECS["result-image"].userCreatable, false);
  assert.equal(NODE_SPECS["result-video"].userCreatable, false);
  assert.equal(NODE_SPECS["image-generator"].userCreatable, true);
});

console.log(`\n通过 ${passed} 项`);
