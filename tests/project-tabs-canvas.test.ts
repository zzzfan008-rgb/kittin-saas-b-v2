import assert from "node:assert/strict";
import fs from "node:fs";
import { maskRedrawReadiness } from "./lib/maskRedraw";
import { shouldWarnBeforeWorkspaceUnload } from "../src/lib/workspaceUnload";
import {
  VIP_SIZE_DEFAULT_TIER_INDEX,
  getImageModelContract,
  imageAspectRatioOptions,
  imageModelAspectRatioPatch,
  imageModelOptionsForAspectRatio,
  imagePromptSizePrefixOptions,
  imageSizeTierOptions,
} from "../src/types/imageModels";
import { resolveTargetHandle } from "../src/lib/documentSnapshot";
import type { Edge } from "@xyflow/react";
import {
  addExistingNodes,
  EMPTY_ACTIVE_DOCUMENT,
  applyResultNodeCreatedEventToTab,
  applyRunEventToTab,
  beginHistoryTransaction,
  beginMaskWork,
  endHistoryTransaction,
  isPristineProjectTab,
  normalizeTabSessionValue,
  selectActiveDocument,
  selectActiveDocumentTarget,
  selectNodeInputImages,
  useFlowStore,
  type DocumentTarget,
  type FlowNode,
  type RecentResult,
} from "../src/store/flowStore";
import { setGenerationSafetyBlockReason } from "../src/store/generationSafety";
// v9（64 Phase 3）：variant 绑定概念已删——夹具直给模型/模式/参数
// （值与原参数档案 materialize 等价：commerce-hero edit → aspectRatio "1:1"、batchSize 1；
// flare-vip modelOptions { size: "2048x2048" }；gemini modelOptions { aspectRatio: "1:1", imageSize: "2K" }）。
const AI_TEST_MODEL_ID = "gpt-image-2.5-flare-vip";
const AI_TEST_ASPECT_RATIO = "1:1";
const AI_TEST_BATCH_SIZE = 1;
const AI_TEST_MODEL_OPTIONS = { size: "2048x2048" };
/** v9：text 节点承载用户正文；系统提示词由 server 冻结常量在任务侧拼装（裁决 E）。 */
const AI_TEST_USER_PROMPT = "修改衣领";
const GEMINI_TEST_MODEL_ID = "gemini-3.1-flash-image";
const GEMINI_TEST_ASPECT_RATIO = "1:1";
const GEMINI_TEST_BATCH_SIZE = 1;
const GEMINI_TEST_MODEL_OPTIONS = { aspectRatio: "1:1", imageSize: "2K" };

let passed = 0;

function activeDocument(state = useFlowStore.getState()) {
  return selectActiveDocument(state);
}

function documentTargetForTab(tabId: string): DocumentTarget {
  const tab = useFlowStore.getState().tabs.find((candidate) => candidate.id === tabId);
  assert.ok(tab, `找不到页签 ${tabId}`);
  return { tabId, projectId: tab.projectId, documentEpoch: tab.documentEpoch };
}

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

// 2026-09-25 决策 4（A）：登录后没有任何打开页签——冷启动（无会话快照）tabs 为空，
// 画布区由 EmptyWorkspaceCTA 接管；页签全部由用户显式「新建项目 / 打开项目」产生。
const bootstrapState = useFlowStore.getState();
assert.equal(bootstrapState.tabs.length, 0, "冷启动不得自动打开任何页签");
assert.equal(bootstrapState.activeTabId, "", "无页签时 activeTabId 为空");
assert.equal(selectActiveDocument(bootstrapState), EMPTY_ACTIVE_DOCUMENT, "空工作区活动文档为空投影");

function imageNode(id: string, label: string): FlowNode {
  return {
    id,
    type: "image",
    position: { x: 0, y: 0 },
    data: { kind: "image", label, status: "idle" },
  };
}

function aiNode(id: string, label: string): FlowNode {
  // v9（64 Phase 3）：可运行的生成节点是 `image-generator`；正文由上游 text 提供，
  // 模式/模型直给（dag extractParams 同源形态），六绑定字段已随 variant 概念删除。
  return {
    id,
    type: "image-generator",
    position: { x: 320, y: 0 },
    data: {
      kind: "image-generator",
      label,
      status: "idle",
      operationMode: "edit",
      aspectRatio: AI_TEST_ASPECT_RATIO,
      batchSize: AI_TEST_BATCH_SIZE,
      modelId: AI_TEST_MODEL_ID,
      modelOptions: AI_TEST_MODEL_OPTIONS,
    },
  };
}

/** v8：提示词正文的宿主节点（生成节点由上游 text 供词）。 */
function textNode(id: string, text: string): FlowNode {
  return {
    id,
    type: "text",
    position: { x: 0, y: 0 },
    data: { kind: "text", label: "提示词", status: "idle", text },
  };
}

function runnableAiGraph(node: FlowNode): { nodes: FlowNode[]; edges: Edge[] } {
  const reference = imageNode(`${node.id}-reference`, `${node.data.label}参考图`);
  if (reference.data.kind !== "image") throw new Error("测试参考节点类型异常");
  reference.data.outputImages = [`/api/files/${node.id}-reference.png`];
  // v8：生成节点必须有 text 上游提供正文（runtime.md §5 / INV-1），否则运行准入 fail-closed。
  const prompt = textNode(`${node.id}-prompt`, AI_TEST_USER_PROMPT);
  return {
    nodes: [reference, prompt, node],
    edges: [
      { id: `${node.id}-reference-edge`, source: reference.id, target: node.id },
      { id: `${node.id}-prompt-edge`, source: prompt.id, target: node.id, targetHandle: "prompt" },
    ],
  };
}

function addRunnableAiNode(node: FlowNode): void {
  const graph = runnableAiGraph(node);
  addExistingNodes(graph.nodes);
  for (const edge of graph.edges) {
    useFlowStore.getState().onConnect({
      source: edge.source,
      target: edge.target,
      sourceHandle: null,
      targetHandle: edge.targetHandle ?? null,
    });
  }
}

function moveNode(nodeId: string, x: number, dragging = true): void {
  useFlowStore.getState().onNodesChange([{
    id: nodeId,
    type: "position",
    position: { x, y: 24 },
    dragging,
  }]);
}

async function flushCommandMicrotasks(turns = 8): Promise<void> {
  for (let index = 0; index < turns; index += 1) await Promise.resolve();
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

// 决策 4（A）：冷启动无页签——本文件的画布用例显式新建一个空白项目起步。
useFlowStore.getState().createBlankTab();
const initial = useFlowStore.getState();
const tabA = initial.activeTabId;
initial.setProjectName("项目 A");
// 方案 C：空白 tab 不再自带 starter 节点，测试显式添加一个 image 节点再改标签。
const tabAStarterNodeId = initial.addNode("image", { x: 0, y: 0 });
assert.ok(tabAStarterNodeId);
initial.updateNodeData(tabAStarterNodeId, { label: "A 上传节点" });

useFlowStore.getState().openFlowTab({
  projectId: "project-b",
  projectName: "项目 B",
  nodes: [imageNode("b-node", "B 上传节点")],
  edges: [] as Edge[],
});
const tabB = useFlowStore.getState().activeTabId;

await test("Gemini 选择经上传回写、加蒙版、切页与运行全程保真", async () => {
  const generationNode = aiNode("model-invariant-ai", "Gemini 保真节点");
  generationNode.data.status = "idle";
  if (generationNode.data.kind !== "image-generator") throw new Error("测试生成节点类型错误");
  const invariantPrompt = textNode("model-invariant-prompt", "保持 Gemini 精确参数");
  const invariantUpload = imageNode("model-invariant-upload", "异步上传");
  if (invariantUpload.data.kind !== "image") throw new Error("测试上传节点类型错误");
  useFlowStore.getState().openFlowTab({
    projectId: "model-invariant-project",
    projectName: "模型保真项目",
    nodes: [invariantUpload, invariantPrompt, generationNode],
    edges: [
      { id: "model-invariant-edge", source: "model-invariant-upload", target: generationNode.id },
      {
        id: "model-invariant-prompt-edge",
        source: invariantPrompt.id,
        target: generationNode.id,
        targetHandle: "prompt",
      },
    ],
  });
  const invariantTabId = useFlowStore.getState().activeTabId;
  const expected = {
    modelId: GEMINI_TEST_MODEL_ID,
    modelOptions: GEMINI_TEST_MODEL_OPTIONS,
  };

  useFlowStore.getState().updateNodeData(generationNode.id, {
    ...expected,
    aspectRatio: GEMINI_TEST_ASPECT_RATIO,
    batchSize: GEMINI_TEST_BATCH_SIZE,
    operationMode: "edit",
  });
  assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

  await Promise.resolve().then(() => {
    useFlowStore.getState().updateNodeDataInTab(documentTargetForTab(invariantTabId), "model-invariant-upload", {
      status: "success",
      outputImages: ["/api/files/model-invariant-upload.png"],
    });
  });
  assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

  useFlowStore.getState().addExistingNode({
    id: "model-invariant-mask",
    type: "image-generator",
    position: { x: 320, y: 240 },
    data: {
      kind: "image-generator",
      label: "蒙版局部重绘",
      status: "idle",
      operationMode: "mask-edit",
      modelId: "gpt-image-2.5-sunburst",
      modelOptions: {},
      aspectRatio: "3:4",
      batchSize: 1,
    },
  });
  useFlowStore.getState().onConnect({
    source: "model-invariant-upload",
    target: "model-invariant-mask",
    sourceHandle: null,
    targetHandle: null,
  });
  assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

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
  assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

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
    assertNodeModelSelection(activeDocument().nodes, generationNode.id, expected);

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

await test("v7 原生参数由 Inspector 窗口唯一入口写回 modelOptions，节点体不设第二处编辑入口", () => {
  // 模型专属「业务画幅 ↔ provider 原生参数」联动助手行为保留（单元级契约）。
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

  // v7：旧 InspectorPanel / AiModifyNode / SketchToRenderNode 的画幅入口已随三节点重构
  // 移除；v8（plan.md §3.3）原生参数改由生成节点内联面板唯一写回，避免两处入口漂移。
  const generatorPanelSource = fs.readFileSync(
    new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
    "utf8",
  );
  const imageGeneratorNodeSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageGeneratorNode.tsx", import.meta.url),
    "utf8",
  );
  const resultRecordDetailSource = fs.readFileSync(
    new URL("../src/components/panels/ResultRecordDetail.tsx", import.meta.url),
    "utf8",
  );
  const imageNodeSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageNode.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(
    generatorPanelSource.includes(
      "const setParam = (k: string, n: string | number) => updateNodeData(nodeId, { modelOptions: { ...options, [k]: n } });",
    ),
    "生成节点内联面板必须是原生参数唯一写回入口",
  );
  assert.match(
    imageGeneratorNodeSource,
    /GeneratorParamsPanel/,
    "生图节点必须挂载内联参数面板",
  );
  assert.doesNotMatch(
    resultRecordDetailSource,
    /modelOptions/,
    "结果记录视图不得成为第二处原生参数编辑入口（属性面板已整体删除）",
  );
  assert.doesNotMatch(
    imageNodeSource,
    /modelOptions:\s*\{/,
    "输入节点不得内联编辑原生参数（v8：参数在生成节点内联面板）",
  );
});

await test("R-101：面板参数与 API易契约对齐（VIP 画幅 10 比例 / 尺寸档表无「自动」/ -all 尺寸前缀）", () => {
  // ① VIP×2 画幅补齐为契约 10 比例：此前面板硬编码 5 比例，10 比例 × 3 档里 15 档永远不可达。
  const vipRatios = imageAspectRatioOptions("gpt-image-2.5-flare-vip");
  assert.equal(vipRatios.length, 10, "VIP 画幅必须与契约 aspectRatios 的 10 比例一致");
  assert.deepEqual(
    vipRatios,
    getImageModelContract("gpt-image-2.5-flare-vip").aspectRatios,
    "VIP 画幅下拉必须直接取自契约，不得再硬编码子集",
  );
  assert.equal(imageAspectRatioOptions("gpt-image-2.5-sunburst-vip").length, 10, "两个 VIP 模型画幅必须一致");

  // ② 尺寸档表不再有「自动」项；且画幅联动填充的默认尺寸必须等于尺寸控件的默认档（同一契约来源）。
  for (const ratio of vipRatios) {
    const tiers = imageSizeTierOptions("gpt-image-2.5-flare-vip", ratio);
    assert.equal(tiers?.length, 3, `${ratio} 必须有快速/标准/高清三档`);
    assert.ok(!tiers!.some((option) => option.value === "auto"), `${ratio} 不得再有「自动」项`);
    assert.equal(
      imageModelOptionsForAspectRatio("gpt-image-2.5-flare-vip", {}, ratio).size,
      tiers![VIP_SIZE_DEFAULT_TIER_INDEX].value,
      `${ratio} 画幅联动填充的默认尺寸必须等于尺寸控件的默认档`,
    );
  }
  assert.equal(imageSizeTierOptions("gemini-3.1-flash-image", "1:1"), undefined, "非 VIP 模型不得出现专属尺寸控件");

  // ③ gpt-image-2.5-all：不接受 size，尺寸唯一手段是 prompt 前缀，标签需带实测分辨率。
  const prefixOptions = imagePromptSizePrefixOptions("gpt-image-2.5-all");
  assert.equal(prefixOptions?.length, 9, "-all 尺寸前缀 = 「不指定」+ 文档 8 档");
  assert.equal(prefixOptions![0].value, "", "首项必须是不指定（模型自适应）");
  assert.ok(
    prefixOptions!.slice(1).every((option) => /\d+×\d+/.test(option.label)),
    "-all 前缀标签必须带实测分辨率",
  );
  assert.deepEqual(
    prefixOptions!.slice(1).map((option) => option.value),
    getImageModelContract("gpt-image-2.5-all").recommendedOptions!.promptSizePrefix!.examples,
    "-all 前缀取值必须直接取自契约",
  );
  assert.equal(imagePromptSizePrefixOptions("gpt-image-2.5-flare-vip"), undefined, "尺寸前缀控件只属于 -all");
  assert.deepEqual(
    imageModelOptionsForAspectRatio("gpt-image-2.5-all", { promptSizePrefix: "横版 16:9" }, "3:4"),
    { promptSizePrefix: "横版 16:9" },
    "-all 的参数联动不得丢掉尺寸前缀",
  );
});

await test("React Flow 初始化尺寸不会移动节点或标记项目未保存", () => {
  useFlowStore.getState().openFlowTab({
    projectId: "dimension-init-project",
    projectName: "尺寸初始化测试",
    nodes: [imageNode("dimension-node", "尺寸初始化节点")],
    edges: [],
  });
  const before = activeDocument();
  const originalPosition = { ...before.nodes[0].position };

  useFlowStore.getState().onNodesChange([{
    id: "dimension-node",
    type: "dimensions",
    dimensions: { width: 280, height: 162 },
  }]);

  const after = activeDocument();
  assert.equal(after.revision, before.revision);
  assert.equal(after.dirty, false);
  assert.deepEqual(after.nodes[0].position, originalPosition);
  assert.deepEqual(after.nodes[0].measured, { width: 280, height: 162 });
});

await test("打开含蒙版节点的项目时蒙版源直取本节点首张产物，订阅保持稳定", () => {
  // 65b：蒙版入口从生成层面板迁回 ImageNode；蒙版源不再订阅上游首图，
  // 直接取图片节点自身的 data.outputImages[0]（零新增订阅）；
  // 输入层其它派生视图（引用序号）仍以 useShallow 稳定订阅。
  const imageNodeSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageNode.tsx", import.meta.url),
    "utf8",
  );
  const panelSource = fs.readFileSync(
    new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(imageNodeSource, /source=\{data\.outputImages\[0\]\}/);
  assert.match(imageNodeSource, /selectNodeInputImages\(document, id\)/);
  assert.match(panelSource, /useFlowStore\(useShallow\(/);
  // 反例守卫：两个订阅位都不得退化为每次渲染都新建数组的裸订阅。
  assert.doesNotMatch(imageNodeSource, /const sourceImages = useFlowStore/);
  assert.doesNotMatch(panelSource, /const sourceImages = useFlowStore/);
});

await test("羽化宽度经图片节点透传 MaskEditor 并在 0–64 内钳制，节点体不设滑块", () => {
  // 65b：蒙版编辑器入口挂图片节点，自节点 data 直读（无生成层面板透传层）；
  // 已保存的 featherRadius 仅在为有限数时透传（缺省 = 自适应），节点层不设第二处输入控件。
  const panelSource = fs.readFileSync(
    new URL("../src/components/nodes/GeneratorParamsPanel.tsx", import.meta.url),
    "utf8",
  );
  const imageNodeSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageNode.tsx", import.meta.url),
    "utf8",
  );
  const editorSource = fs.readFileSync(
    new URL("../src/components/nodes/MaskEditor.tsx", import.meta.url),
    "utf8",
  );
  assert.match(imageNodeSource, /featherRadius=\{/);
  assert.match(
    imageNodeSource,
    /typeof data\.featherRadius === "number" && Number\.isFinite\(data\.featherRadius\)[\s\S]*\? data\.featherRadius[\s\S]*: undefined/,
  );
  assert.doesNotMatch(panelSource, /<input[^>]*type="range"/);
  assert.doesNotMatch(imageNodeSource, /<input[^>]*type="range"/);
  assert.match(editorSource, /featherRadius\?: number/);
  // 0–64 边界钳制（原 Slider 的 min/max 约束）现在由预览侧保证；
  // 65d v2：上限收敛为 FEATHER_MAX 常量（=64），取消勾选时滑杆 0–64 可调。
  assert.match(editorSource, /FEATHER_MAX = 64/);
  assert.match(editorSource, /Math\.max\(0, Math\.min\(FEATHER_MAX, Math\.round\(featherRadius\)\)\)/);
  assert.match(editorSource, /adaptiveMaskFeatherRadius\(overlay\.width, overlay\.height, expansionRadius\)/);
});

await test("蒙版笔刷宽度按屏幕像素归一化，换分辨率底图视觉一致且未布局时不放大", async () => {
  const { brushStrokeWidth } = await import("../src/lib/maskGeometry");
  // 滑杆值按屏幕像素：乘「画布自然尺寸 / 显示尺寸」缩放比。
  // 4000px 底图显示 800px → 缩放 5；600px 底图显示 600px → 缩放 1。
  assert.equal(brushStrokeWidth(80, 4000, 800), 400);
  assert.equal(brushStrokeWidth(80, 600, 600), 80);
  // 两块底图落回屏幕后的粗细一致：400*(800/4000) === 80*(600/600) === 80。
  assert.equal(brushStrokeWidth(80, 4000, 800) * (800 / 4000), brushStrokeWidth(80, 600, 600) * (600 / 600));
  // 退化：画布尚未布局（显示宽度 0）时退化为原值，不放大、不产生 NaN。
  assert.equal(brushStrokeWidth(80, 4000, 0), 80);
  assert.equal(brushStrokeWidth(80, 0, 0), 80);
  // 非法输入 fail-closed 到 0，避免 lineWidth 为 NaN 让整条笔画静默不画。
  assert.equal(brushStrokeWidth(Number.NaN, 4000, 800), 0);
  assert.equal(brushStrokeWidth(0, 4000, 800), 0);
});

await test("蒙版重绘页控件走项目 shadcn 原语，不再手搓 Button/Slider/Checkbox", () => {
  const editorSource = fs.readFileSync(
    new URL("../src/components/nodes/MaskEditor.tsx", import.meta.url),
    "utf8",
  );
  // 项目规则 §2：通用 UI 表面必须组合 src/components/ui 原语。
  assert.match(editorSource, /import \{ Button \} from "@\/components\/ui\/button"/);
  assert.match(editorSource, /import \{ Slider \} from "@\/components\/ui\/slider"/);
  assert.match(editorSource, /import \{ Checkbox \} from "@\/components\/ui\/checkbox"/);
  assert.match(editorSource, /import \{ Dialog, DialogContent, DialogTitle \} from "@\/components\/ui\/dialog"/);
  // 手搓实现必须退场（历史教训：ModeButton/ToolbarButton 与姊妹面板视觉不一致）。
  assert.doesNotMatch(editorSource, /function ToolbarButton/);
  assert.doesNotMatch(editorSource, /function ModeButton/);
  assert.doesNotMatch(editorSource, /<input[^>]*type="range"/);
  assert.doesNotMatch(editorSource, /<input[^>]*type="checkbox"/);
  // 完成态状态行：run 结束时按终态更新文案；失败态不得说成完成（fail-closed）。
  assert.match(
    editorSource,
    /setStatusNote\(runStatus === "success" \? "重绘完成" : "重绘未完成，请查看节点状态"\)/,
  );
  // 结果预览位（右栏下方空白）：只在运行中或已有成功结果时出现；结果快照只在成功终态写入，
  // 避免把运行期的旧底图当成结果展示。
  // 标签语义（审查裁决 P2(b)）：快照只增不清，重试失败后仍展示上次成功图，故标「上次成功结果」，
  // 不得残留把上次成功图标成「本次」结果的误导文案（注释可提及旧标签，标记形态必须清除）。
  assert.match(editorSource, /aria-label="上次成功结果"/);
  assert.match(editorSource, /data-testid="mask-redraw-result-label">上次成功结果</);
  assert.match(editorSource, /alt="上次成功结果"/);
  assert.doesNotMatch(editorSource, /aria-label="本次结果"|alt="本次重绘结果"|>本次结果</);
  assert.match(editorSource, /data-testid="mask-redraw-result-preview"/);
  assert.match(editorSource, /if \(runStatus === "success"\) setLastResultUrl\(source\)/);
});

await test("保存当前原图的蒙版后局部重绘按钮立即恢复可点击", () => {
  const sourceRef = "/api/files/mask-source";
  useFlowStore.getState().openFlowTab({
    projectId: "mask-readiness-project",
    projectName: "蒙版按钮测试",
    nodes: [
      {
        id: "mask-source",
        type: "image",
        position: { x: 0, y: 0 },
        data: {
          kind: "image",
          label: "蒙版原图",
          status: "success",
          outputImages: [sourceRef],
        },
      },
      {
        id: "mask-node",
        type: "image-generator",
        position: { x: 320, y: 0 },
        data: {
          kind: "image-generator",
          label: "蒙版局部重绘",
          status: "idle",
          modelId: "gpt-image-2.5-sunburst",
          modelOptions: {},
          aspectRatio: "3:4",
          batchSize: 1,
        },
      },
    ],
    edges: [{ id: "mask-edge", source: "mask-source", target: "mask-node" }],
  });

  const source = selectNodeInputImages(activeDocument(), "mask-node")[0];
  assert.equal(source, sourceRef);
  const beforeSave = maskRedrawReadiness({ source, prompt: "" });
  assert.equal(beforeSave.canOpenRunAction, false);

  // 65b：蒙版写入图片节点 data（非生成节点）。
  useFlowStore.getState().updateNodeData("mask-source", {
    mask: "data:image/png;base64,bWFzaw==",
    maskSourceRef: source,
  });
  const savedNode = activeDocument().nodes.find((node) => node.id === "mask-source");
  assert.equal(savedNode?.data.kind, "image");
  if (savedNode?.data.kind !== "image") throw new Error("蒙版原图节点丢失");
  const afterSave = maskRedrawReadiness({
    source,
    mask: savedNode.data.mask,
    maskSourceRef: savedNode.data.maskSourceRef,
    // v8：正文由上游 text 节点提供，蒙版节点的就绪判定只关心蒙版本身。
    prompt: "",
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
  // 65b：蒙版上传 pending 与原图校验随蒙版入口迁回 ImageNode（65d v2 收敛为 persistMaskDraft 回调）。
  const redrawSource = fs.readFileSync(
    new URL("../src/components/nodes/ImageNode.tsx", import.meta.url),
    "utf8",
  );
  const appSource = fs.readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const authSource = fs.readFileSync(new URL("../src/auth/AuthContext.tsx", import.meta.url), "utf8");
  const topBarSource = fs.readFileSync(
    new URL("../src/components/panels/TopBar.tsx", import.meta.url),
    "utf8",
  );
  assert.match(editorSource, /if \(savingRef\.current\) return/);
  assert.match(editorSource, /if \(savingRef\.current \|\| running\) return/);
  assert.match(editorSource, /onClick=\{onClose\}\s+disabled=\{saving\}/);
  assert.match(editorSource, /aria-disabled=\{locked\}/);
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
  assert.match(redrawSource, /outputImages\?\.\[0\] !== sourceRef/);
  // R-94：AGENTS.md §3 要求蒙版这类异步写入绑定发起页签的 tabId + projectId + documentEpoch。
  // 65b 实现已回到 updateNodeDataInTab(target, id, ...)，锁定不退化成裸 updateNodeData。
  // 65d v2：commit 随蒙版写入 featherRadius（自适应=undefined，自定义=0–64）。
  assert.match(redrawSource, /updateNodeDataInTab\(target, id, \{ mask: url, maskSourceRef: sourceRef, featherRadius, error: undefined \}\)/);
  assert.match(appSource, /shouldWarnBeforeWorkspaceUnload\(\{/);
  assert.match(appSource, /isWorkspaceUnloadWarningSuppressed\(\)/);
  assert.match(appSource, /window\.addEventListener\("beforeunload", warnBeforeUnload\)/);
  assert.match(appSource, /pendingMaskWorkCount > 0\) return/);
  assert.match(authSource, /const authenticatedUserId = useRef<string \| null>\(null\)/);
  assert.match(authSource, /shouldReloadForAuthenticatedUserTransition\(\s*authenticatedUserId\.current/);
  assert.match(authSource, /suppressWorkspaceUnloadWarning\(\);\s*window\.location\.reload\(\)/);
  assert.match(topBarSource, /onClick=\{retryTabSessionPersistence\}/);
});

await test("桌面工作台使用稳定 Dock，主题通过三列网格严格居中", () => {
  const appSource = fs.readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const topBarSource = fs.readFileSync(
    new URL("../src/components/panels/TopBar.tsx", import.meta.url),
    "utf8",
  );
  const projectTabsSource = fs.readFileSync(
    new URL("../src/components/panels/ProjectTabs.tsx", import.meta.url),
    "utf8",
  );
  const projectCenterSource = fs.readFileSync(
    new URL("../src/components/panels/ProjectCenter.tsx", import.meta.url),
    "utf8",
  );
  const shellSource = fs.readFileSync(
    new URL("../src/components/workbench/WorkbenchShell.tsx", import.meta.url),
    "utf8",
  );

  // 2026-09-25 决策：左侧 Dock 与「属性 / 结果」入口整体移除后，工作台外壳只接收
  // 中心画布子树，不再有 library / inspector 两个面板插槽。
  assert.match(appSource, /<WorkbenchShell>/);
  assert.doesNotMatch(appSource, /library=\{<|inspector=\{</);
  assert.equal((shellSource.match(/\{children\}/g) ?? []).length, 1);
  assert.doesNotMatch(shellSource, /\{library\}|\{inspector\}|activePanel/);
  assert.doesNotMatch(shellSource, /MobileSheet|useMediaQuery|mobilePanel/);
  // 「属性 / 结果」入口与 Dock 容器（aria-controls / 两个 panel id / Dock 宽度过渡）已整体删除。
  assert.doesNotMatch(shellSource, /aria-controls|transition-\[width,visibility\]|w-80/);
  assert.match(topBarSource, /grid-cols-\[1fr_auto_1fr\]/);
  assert.match(topBarSource, /Coin AI - Canvas/);
  assert.match(topBarSource, /<ThemeSwitcher \/>/);
  assert.match(topBarSource, /absolute left-full ml-2/);
  assert.match(topBarSource, /<DropdownMenu>/);
  assert.match(topBarSource, /aria-label="查看快捷键"/);
  assert.match(topBarSource, /className="w-56 min-w-56/);
  assert.match(topBarSource, /<DropdownMenuShortcut/);
  assert.doesNotMatch(topBarSource, /onPointerEnter|点击图标可固定|setTimeout\(/);
  assert.doesNotMatch(topBarSource, /GARMENT CANVAS|ProjectPicker/);
  assert.doesNotMatch(appSource, /TemplatesDock/);
  assert.match(projectTabsSource, /<LazyProjectCenter open=\{projectCenterOpen\}/);
  assert.match(projectTabsSource, /onFocus=\{\(\) => void loadProjectCenter\(\)\}/);
  assert.match(projectTabsSource, /onPointerEnter=\{\(\) => void loadProjectCenter\(\)\}/);
  assert.match(projectTabsSource, /onDoubleClick=\{\(\) => beginRename\(tab\)\}/);
  assert.match(projectTabsSource, /aria-label="保存项目名称和画布"/);
  assert.match(projectTabsSource, /event\.nativeEvent\.isComposing \|\| renameComposingRef\.current/);
  assert.match(projectTabsSource, /const saved = await saveProject\(\)/);
  assert.match(projectTabsSource, /if \(!saved\) \{[\s\S]*setRenameError/);
  assert.match(projectTabsSource, /onBlur=\{\(event\) => \{[\s\S]*setEditingTabId\(null\)/);
  assert.match(projectTabsSource, /role="alert"/);
  // 2026-09-25 决策 3：项目中心只保留「最近项目」——「内置模板」迁到左侧工作流二级菜单,
  // 「我的模板」与「保存当前画布为模板」整体取消（模板/项目都自带自动保存）。
  assert.match(projectCenterSource, /最近项目/);
  assert.doesNotMatch(projectCenterSource, /内置模板|我的模板|保存当前画布为模板/);
  assert.doesNotMatch(projectCenterSource, /<Tabs|TabsTrigger|TabsContent|inferTemplateLaunchMode|launchTemplateInNewTab/);
  assert.doesNotMatch(projectCenterSource, /DELETE|AlertDialog|DropdownMenu|SAVE_TEMPLATE_COVER|BUILTIN_TEMPLATE_COVERS|templateProductPolicy/);
  assert.doesNotMatch(projectCenterSource, /projectDetails/);
  assert.match(projectCenterSource, /const requestVersion = \+\+openRequestVersion\.current/);
  assert.match(projectCenterSource, /if \(requestVersion !== openRequestVersion\.current\) return/);
  assert.match(projectCenterSource, /NEW_PROJECT_COVER/);
  assert.match(projectCenterSource, /EMPTY_PROJECT_COVER/);
  assert.match(projectCenterSource, /PROJECT_CENTER_CARD_GRID_CLASS = "grid grid-cols-3 xl:grid-cols-4 gap-4"/);
  assert.match(projectCenterSource, /PROJECT_CENTER_TITLE_CLASS = "min-w-0 flex-1 line-clamp-2 min-h-8 text-xs font-semibold text-\[var\(--gc-text\)\]"/);
  // 内置模板的落点在左侧工作流二级菜单：菜单项 → 映射表 → 合并进当前活动画布（不新建页签）。
  assert.match(shellSource, /WORKFLOW_MENU_MAPPING/);
  assert.match(shellSource, /mergeTemplateIntoActiveCanvas/);
  assert.match(shellSource, /workspaceEmpty &&/);
});

await test("最近生成成功卡显式提供查看、对比、下载与设为输入动作", () => {
  const resultsPanelSource = fs.readFileSync(
    new URL("../src/components/panels/ResultsPanel.tsx", import.meta.url),
    "utf8",
  );
  // 2026-09-25：卡片与查看器共用同一套动作实现，避免两处漂移。
  const resultActionsSource = fs.readFileSync(
    new URL("../src/lib/resultActions.ts", import.meta.url),
    "utf8",
  );
  const imageViewerSource = fs.readFileSync(
    new URL("../src/components/ImageViewer.tsx", import.meta.url),
    "utf8",
  );
  assert.match(resultsPanelSource, /aria-label=\{`查看 \$\{r\.nodeLabel\}`\}/);
  assert.match(resultsPanelSource, /aria-label=\{`\$\{compareIds\.includes\(r\.id\) \? "取消" : "加入"\}对比 \$\{r\.nodeLabel\}`\}/);
  assert.match(resultsPanelSource, /href=\{r\.image\}[\s\S]*download/);
  assert.match(resultsPanelSource, /aria-label=\{`将 \$\{r\.nodeLabel\} 设为输入，继续处理`\}/);
  // 「设为输入」的写回与落点引导在共享模块里，卡片只负责触发。
  assert.match(resultActionsSource, /state\.addAssetNode\(\s*\{ name: result\.nodeLabel, image: result\.image \}/);
  assert.match(resultActionsSource, /requestCanvasLanding\(\{ tabId: tab\.id, nodeId, fitView: false \}\)/);
  // 65d R-87 §3：ResultDetailDialog 已删除——查看器必须直接承接同一组结果能力
  //（查看大图主区 / 对比 / 下载 / 设为输入 / 完整运行记录字段）。
  assert.match(imageViewerSource, /from "@\/lib\/resultActions"/);
  assert.match(imageViewerSource, /设为输入/);
  assert.match(imageViewerSource, /下载/);
  assert.match(imageViewerSource, /加入对比|取消对比/);
  // 从 ResultRecordDetail 迁移的完整记录字段（含 R-87 新增的节点类型与上游实际尺寸）。
  assert.match(imageViewerSource, /节点类型/);
  assert.match(imageViewerSource, /上游实际尺寸/);
  assert.match(resultsPanelSource, /openViewer/, "卡片直接打开 ImageViewer（65d R-87 §3）");
  assert.match(resultsPanelSource, /isNodeRunActive\(r\.status\)/);
  assert.match(resultsPanelSource, /r\.status !== "success"/);
  assert.match(resultsPanelSource, /grid-cols-2/);
  assert.match(resultsPanelSource, /text-\[var\(--gc-media-overlay-text\)\]/);
});

await test("R-83 DialogContent base sm:max-w-sm 不穿透 MaskEditor 全屏分栏覆盖", () => {
  // 验证 twMerge 行为：MaskEditor 的 className 覆盖串中必须包含 sm:max-w-none，
  // 才能压制 DialogContent 基类的 sm:max-w-sm（384px）。若基类与覆盖串不在同一断点组
  //（如 max-w-none vs sm:max-w-sm），twMerge 不会形成冲突，导致全屏被钳为 384px。
  const editorSource = fs.readFileSync(
    new URL("../src/components/nodes/MaskEditor.tsx", import.meta.url),
    "utf8",
  );
  const dialogBase = "fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";
  assert.match(editorSource, /DialogContent[\s\S]{1,200}className="[^"]*sm:max-w-none[^"]*"/);
  // 同时验证 img 不含裸 max-w-full（会在收缩型 flex item 内塌为 0）：
  assert.doesNotMatch(editorSource, /img[\s\S]{1,200}className="[^"]*\bmax-w-full\b[^"]*"/);
});


console.log(`\n通过 ${passed} 项`);
