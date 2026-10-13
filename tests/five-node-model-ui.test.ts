import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
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

test("文本节点：工具条动作齐全（含预设下拉），正文可编辑，且不再有「功能设置」入口条", () => {
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
  const labels = ["色彩工具", "提示词预设", "复制"];
  for (const label of labels) assert.match(html, new RegExp(`aria-label="${label}"`), `缺少工具条动作 ${label}`);
  assert.match(html, /role="toolbar"/);
  assert.match(html, /一件棉质白衬衫/);
  assert.doesNotMatch(html, /功能设置/);
  assert.match(html, /w-\[var\(--gc-node-width\)\]/);
  assert.doesNotMatch(html, /w-\[280px\]/);
  const unselected = render(node, false);
  assert.doesNotMatch(unselected, /role="toolbar"/);
  assert.match(unselected, /一件棉质白衬衫/);
});

test("文本节点：「帮我补全」按钮有正文时可点，空正文禁用并提示", () => {
  const nodeWithText = {
    id: "text-rewrite-1",
    type: "text",
    position: { x: 0, y: 0 },
    data: { kind: "text", label: "提示词", status: "idle", text: "一条红色连衣裙" },
  } as unknown as FlowNode;
  useFlowStore.getState().openFlowTab({
    projectId: "rewrite-with-text",
    projectName: "有正文",
    nodes: [nodeWithText],
    edges: [],
  });
  const html = render(nodeWithText);
  // 按钮存在，带 ✨ 图标（SparklesIcon 渲染为 svg）和「帮我补全」文案。
  assert.match(html, /data-testid="text-rewrite-button"/, "缺少帮我补全按钮");
  assert.match(html, /帮我补全/);
  // 有正文时按钮不禁用（无 disabled="" 属性；注意 class 里的 disabled: 前缀是 Tailwind 伪类）。
  const buttonTag = html.match(/<button[^>]*data-testid="text-rewrite-button"[^>]*>/)?.[0];
  assert.ok(buttonTag, "按钮标签必须可定位");
  assert.ok(!/disabled=""/.test(buttonTag), "有正文时按钮不应禁用");
  // 提示挂在外层 span（disabled 按钮不触发 hover，title 必须在可 hover 的包装元素上）。
  const wrapTag = html.match(/<span[^>]*data-testid="text-rewrite-wrap"[^>]*>/)?.[0];
  assert.ok(wrapTag, "按钮外层包装 span 必须存在");
  assert.match(wrapTag, /title="AI 补全提示词"/, "有正文时 title 为 AI 补全提示词");
  assert.match(wrapTag, /nodrag/, "包装元素必须 nodrag 防拖动");

  // 空正文节点：按钮禁用且包装 title 提示「先写点要求再补全」。
  const emptyNode = {
    id: "text-rewrite-empty",
    type: "text",
    position: { x: 0, y: 0 },
    data: { kind: "text", label: "提示词", status: "idle", text: "" },
  } as unknown as FlowNode;
  useFlowStore.getState().openFlowTab({
    projectId: "rewrite-empty",
    projectName: "空正文",
    nodes: [emptyNode],
    edges: [],
  });
  const emptyHtml = render(emptyNode);
  const emptyButtonTag = emptyHtml.match(/<button[^>]*data-testid="text-rewrite-button"[^>]*>/)?.[0];
  assert.ok(emptyButtonTag, "空正文也应有按钮");
  assert.match(emptyButtonTag, /disabled=""/, "空正文时按钮必须禁用");
  const emptyWrapTag = emptyHtml.match(/<span[^>]*data-testid="text-rewrite-wrap"[^>]*>/)?.[0];
  assert.ok(emptyWrapTag, "空正文也应有包装 span");
  assert.match(emptyWrapTag, /先写点要求再补全/, "空正文 title 必须提示先写要求");
});

test("文本节点：只读项目中「帮我补全」按钮禁用（源码接线断言；SSR useSyncExternalStore 不反映 store 变更）", () => {
  // SSR 下 zustand 钩子固定读 server snapshot（默认非只读），无法通过 renderToStaticMarkup
  // 验证只读态；此处用源码接线断言锁定 disabled/title/handler 三处 readOnly 门控，
  // 行为由 e2e 只读项目用例覆盖。
  const source = readFileSync(
    fileURLToPath(new URL("../src/components/nodes/TextNode.tsx", import.meta.url)),
    "utf8",
  );
  // 按钮 disabled 表达式含 readOnly
  assert.match(
    source,
    /disabled=\{readOnly \|\| rewriting \|\| !hasText\}/,
    "按钮 disabled 必须含 readOnly 门控",
  );
  // title 文案含只读提示
  assert.match(source, /只读项目不能改写提示词/);
  // handler 首行门控 readOnly
  assert.match(
    source,
    /if \(readOnly \|\| rewriting \|\| !projectId\) return/,
    "handleRewrite 必须门控 readOnly",
  );
  // P1 核心：先保存再走改写（编排在 textRewriteFlow，本处确认组件接了 runPromptRewriteFlow）
  assert.match(
    source,
    /runPromptRewriteFlow\(/,
    "改写必须走 textRewriteFlow 编排（先保存防草稿 404）",
  );
  assert.match(
    source,
    /saveProject: \(\) => useFlowStore\.getState\(\)\.saveProject\(\)/,
    "必须经过 saveProject 先保存（防项目 404）",
  );
  // 成功写回走 updateValue+flush（commit 回调内，与预设写入同款，可 undo）
  assert.match(
    source,
    /textEdit\.updateValue\(text\)/,
    "成功改写必须走 textEdit.updateValue",
  );
  assert.match(
    source,
    /textEdit\.flush\(\)/,
    "成功改写必须 flush（落历史栈，可 undo）",
  );
  // 错误不再静默吞：透出到 text-rewrite-error 展示位
  assert.match(
    source,
    /data-testid="text-rewrite-error"/,
    "必须渲染改写错误透出行（不再静默 404/403）",
  );
  assert.match(
    source,
    /setError: setRewriteError/,
    "flow 的 setError 必须接组件 state（文案透出）",
  );
  // 文本变更即清除上一次错误
  assert.match(
    source,
    /useEffect\(\(\) => \{\s*setRewriteError\(null\);\s*\}, \[data\.text\]\)/,
    "文本变更必须清除上一次改写错误",
  );
});

test("生图节点：操作 / 模型 / 画幅 / 批次内联在卡片上，运行闸门按兼容判定", () => {
  const node = {
    id: "image-generator-1",
    type: "image-generator",
    position: { x: 0, y: 0 },
    data: {
      kind: "image-generator",
      label: "生图",
      status: "idle",
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
  // 65b：操作由接线自动推断（不再有 aria-label="操作" 下拉）
  assert.match(html, /aria-label="模型"/);
  assert.match(html, /aria-label="画幅"/);
  assert.match(html, /aria-label="模型参数"/);
  // 端口行 + 来源胶囊取代底部统计行：两行端口（提示词/参考图）未接线时值列均为「未连接」
  assert.match(html, /data-handleid="prompt"/);
  assert.match(html, /data-handleid="reference"/);
  assert.equal((html.match(/未连接/g) ?? []).length, 2);
  assert.match(html, /未接参考图 → 文生图/);
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
  // 65b：视频操作模式由接线自动推断（无 aria-label="操作" 下拉）
  assert.match(html, /未接首帧 → 文生视频/);
  // 视频侧端口行为 提示词 / 首帧图；未接线时值列为「未连接」（底部统计行已并入端口胶囊）。
  assert.match(html, /data-handleid="first-frame"/);
  assert.equal((html.match(/未连接/g) ?? []).length, 2);
  assert.match(html, /未接首帧 → 文生视频/);
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
