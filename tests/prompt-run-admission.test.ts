import assert from "node:assert/strict";
import {
  evaluatePromptRunAdmission,
  evaluatePromptRunCompatibility,
  promptRunAdmissionInputFromParams,
  promptRunInputTextsFromGraph,
  promptRunReferenceSnapshotsFromGraph,
  type PromptRunAdmissionInput,
  type PromptRunGraphNode,
} from "../src/lib/promptRunAdmission";

// v9（64 Phase 3）：v7 变体绑定五字段（promptVariantId/promptFamilyId/
// parameterProfileId/contractHash/evaluationVersion/postprocessVersion）已删。
// 本文件聚焦保留下来的两类职责：
//   1. 浏览器镜像闸的图采集函数（与 server/engine/dag.ts 同源同语义）；
//   2. 兼容性闸（operationMode / 参考图冲突与数量 / 结构校验）。
// v7 的绑定/drift/合成断言已随模块瘦身移除（合成文本由 server 冻结常量承载，
// 见 server/lib/promptPresetsFrozen.ts 与 tests/prompt-presets-catalog.test.ts）。

const references = [
  { order: 0, sourceNodeId: "multi-output" },
  { order: 1, sourceNodeId: "multi-output" },
  { order: 2, sourceNodeId: "identity" },
  { order: 3, sourceNodeId: "garment-top" },
];

const graphNodes: PromptRunGraphNode[] = [
  {
    id: "multi-output",
    data: {
      // 上游输出图由 image 节点 outputImages 承载（R8）。
      kind: "image",
      label: "上游两张图",
      status: "success",
      modelId: "gemini-3.1-flash-image",
      modelOptions: { aspectRatio: "1:1", imageSize: "1K" },
      aspectRatio: "1:1",
      batchSize: 2,
      outputImages: ["image-a", "image-b"],
    },
  },
  {
    id: "identity",
    data: {
      kind: "image",
      label: "人物",
      status: "idle",
      aspectRatio: "1:1",
      batchSize: 1,
      outputImages: ["identity-image"],
    },
  },
  {
    id: "empty-garment",
    data: {
      // 未上传的 image 节点 = outputImages 为空（R8 输入输出同体）。
      kind: "image",
      label: "尚未上传",
      status: "idle",
      aspectRatio: "1:1",
      batchSize: 1,
      outputImages: [],
    },
  },
];
assert.deepEqual(promptRunReferenceSnapshotsFromGraph(graphNodes, [
  { source: "multi-output", target: "target" },
  { source: "identity", target: "target" },
  { source: "empty-garment", target: "target" },
], "target"), [
  { order: 0, sourceNodeId: "multi-output" },
  { order: 1, sourceNodeId: "multi-output" },
  { order: 2, sourceNodeId: "identity" },
], "必须像 DAG 一样按连线顺序逐图片展开，跳过未上传的空节点");

assert.deepEqual(promptRunReferenceSnapshotsFromGraph(graphNodes, [
  { source: "multi-output", target: "legacy-target" },
  { source: "identity", target: "legacy-target" },
], "legacy-target"), [
  { order: 0, sourceNodeId: "multi-output" },
  { order: 1, sourceNodeId: "multi-output" },
  { order: 2, sourceNodeId: "identity" },
], "旧 Provider 边同样按连线顺序逐图片展开");

// 浏览器镜像闸按 dag 的 edges 顺序收集上游 text 正文（与
// server/engine/dag.ts buildExecutionPlan 同源同语义），跳过非 text 来源、
// 只取指向目标节点的边。
const inputTextsGraphNodes: PromptRunGraphNode[] = [
  { id: "t1", data: { kind: "text", label: "提示词1", status: "idle", text: "第一段正文" } },
  { id: "img-a", data: { kind: "image", label: "上游图", status: "success", aspectRatio: "1:1", batchSize: 1, outputImages: ["a"] } },
  { id: "t2", data: { kind: "text", label: "提示词2", status: "idle", text: "第二段正文" } },
];
assert.deepEqual(
  promptRunInputTextsFromGraph(inputTextsGraphNodes, [
    { source: "t1", target: "target" },
    { source: "img-a", target: "target" },
    { source: "t2", target: "target" },
    { source: "t2", target: "other-node" },
  ], "target"),
  ["第一段正文", "第二段正文"],
  "必须按 edges 顺序收集上游 text 正文，跳过非 text 来源与指向其他节点的边",
);
assert.deepEqual(
  promptRunInputTextsFromGraph(inputTextsGraphNodes, [], "target"),
  [],
  "目标节点无上游入边时正文为空",
);

// ---------- v9 兼容性闸 ----------
const params = {
  modelId: "gemini-3.1-flash-image",
  operationMode: "edit",
  inputTexts: ["把黑色蕾丝上衣与白色阔腿裤穿到模特身上"],
  aspectRatio: "1:1",
};

// edit + 参考图齐全：兼容性闸放行。
const input: PromptRunAdmissionInput = promptRunAdmissionInputFromParams(
  "image",
  params,
  references.slice(0, 1),
);
assert.equal(
  evaluatePromptRunCompatibility(input),
  undefined,
  "v9：operationMode 归节点 data（dag extractParams 同源），edit + 参考图兼容",
);
assert.deepEqual(
  evaluatePromptRunAdmission(input),
  { allowed: true, code: "verified", reason: "compatible" },
  "评估运行禁用入口在 runQueue/promptAdmission 统一拦截；此处只保留兼容性检查",
);

// edit 无参考图：edit-reference-missing（fail-closed）。
assert.equal(
  (evaluatePromptRunCompatibility({
    ...input,
    references: [],
  }) as { code: string }).code,
  "edit-reference-missing",
  "edit/mask-edit 模式至少需要一张参考图",
);

// generate 带参考图：generate-reference-conflict（fail-closed）。
assert.equal(
  (evaluatePromptRunCompatibility(promptRunAdmissionInputFromParams(
    "image",
    { ...params, operationMode: "generate", modelId: "gemini-3.1-flash-image" },
    references.slice(0, 1),
  )) as { code: string }).code,
  "generate-reference-conflict",
  "generate 模式不能携带参考图；请明确改为 edit，而不是由系统临时推断模式",
);

// operationMode 未定义（直连生成路由）：跳过参考图闸，由 server 侧 DAG/授权兜底。
assert.equal(
  evaluatePromptRunCompatibility(promptRunAdmissionInputFromParams(
    "image",
    { modelId: "gemini-3.1-flash-image", inputTexts: params.inputTexts },
    references.slice(0, 1),
  )),
  undefined,
  "operationMode 未定义时不拦参考图（server 侧授权兜底）",
);

// operationMode 非法：operation-mode-incompatible（fail-closed）。
assert.equal(
  (evaluatePromptRunCompatibility(promptRunAdmissionInputFromParams(
    "image",
    { ...params, operationMode: "invented-mode" },
    references.slice(0, 1),
  )) as { code: string }).code,
  "operation-mode-incompatible",
  "非法 operationMode 拒绝",
);

// 参考图超过模型上限：reference-limit-exceeded（fail-closed）。
assert.equal(
  (evaluatePromptRunCompatibility(promptRunAdmissionInputFromParams(
    "image",
    params,
    Array.from({ length: 10 }, (_, order) => ({ order, sourceNodeId: "overflow" })),
  )) as { code: string }).code,
  "reference-limit-exceeded",
  "超限参考图拒绝，系统不会静默裁剪",
);

console.log("提示词运行时准入（v9 兼容性闸）测试通过");
