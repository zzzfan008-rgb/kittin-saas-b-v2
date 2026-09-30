import assert from "node:assert/strict";
import { requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import {
  evaluatePromptRunAdmission,
  evaluatePromptRunCompatibility,
  promptRunAdmissionInputFromParams,
  promptRunInputTextsFromGraph,
  promptRunReferenceSnapshotsFromGraph,
  synthesizeVariantTaskPrompt,
  type PromptRunAdmissionInput,
  type PromptRunGraphNode,
} from "../src/lib/promptRunAdmission";
import { createPromptEvaluationReleaseSnapshot } from "../src/lib/promptEvaluationRelease";
import { TEST_PROMPT_RELEASE_CODE_SHA } from "./promptReleaseTestSupport";
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "../src/types/modelParameterProfiles";

const variant = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "image",
  mode: "edit",
});
const profile = getModelParameterProfile(variant.parameterProfileId)!;
const materialized = materializeModelParameterProfile(profile);
const params = {
  modelId: variant.modelId,
  operationMode: variant.mode,
  // v7：用户提示词只沿 text 边进入 params.inputTexts（dag.ts buildExecutionPlan），
  // image 分支不再产出 params.prompt。
  inputTexts: ["把黑色蕾丝上衣与白色阔腿裤穿到模特身上"],
  promptVariantId: variant.variantId,
  promptFamilyId: variant.familyId,
  parameterProfileId: variant.parameterProfileId,
  contractHash: variant.contractHash,
  evaluationVersion: variant.evaluationVersion,
  postprocessVersion: profile.postprocess.version,
  aspectRatio: materialized.aspectRatio,
  batchSize: materialized.batchSize,
  modelOptions: materialized.modelOptions,
};
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
      // v7：上游输出图由 image 节点 outputImages 承载（R8）。
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
      // v7：未上传的 image 节点 = outputImages 为空（R8 输入输出同体）。
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

// v7（P2-b）：浏览器镜像闸按 dag 的 edges 顺序收集上游 text 正文（与
// server/engine/dag.ts buildExecutionPlan 同源同语义），跳过非 text 来源、
// 只取指向目标节点的边。若此处与服务端收集不一致，UI 会在 prompt-drift 误拦。
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
  "目标节点无上游入边时正文为空（随后由 prompt-drift 拒绝）",
);

const input = promptRunAdmissionInputFromParams("image", params, references);
// 评估运行禁用入口已在 runQueue/promptAdmission.ts 统一拦截，单元测试仅保留兼容性检查
void input; // 防止 input 未使用警告

// v7 mode 归属反转（R-76/R-78，P2-b）：浏览器节点 data 不再携带 operationMode，
// 也不携带 parameterProfileId / postprocessVersion（applyVariant 只写绑定五字段），
// admission 输入必须从选中变体推导出这三项（与 dag.ts extractParams 同源），
// golden-path 受审变体因此不再在 UI 镜像闸被 operation-mode-incompatible /
// binding-mismatch / parameter-drift 死拦。
const {
  operationMode: _browserParamsDoNotCarryMode,
  parameterProfileId: _browserParamsDoNotCarryProfile,
  postprocessVersion: _browserParamsDoNotCarryPostprocess,
  ...browserNodeParams
} = params;
const browserInput: PromptRunAdmissionInput = promptRunAdmissionInputFromParams(
  "image",
  browserNodeParams,
  references,
);
assert.equal(
  evaluatePromptRunCompatibility(browserInput),
  undefined,
  "选中目录内变体后兼容性闸放行",
);
assert.notEqual(
  evaluatePromptRunAdmission({ ...input, inputTexts: ["任意自由用户意图：换成其他文案也仍绑定同一受审系统提示词"] }).code,
  "prompt-drift",
  "用户正文内容自由，不再有 v6 客户端包装后缀校验",
);
// 合成必须与 runner.executeImageStep 逐字同一套：fullPrompt + "\n\n" + inputTexts.join("\n\n")。
assert.equal(
  synthesizeVariantTaskPrompt(input, variant),
  `${variant.fullPrompt}\n\n${params.inputTexts.join("\n\n")}`.trim(),
);
// 无 text 上游的直连路径回退 params.prompt（generate.ts），合成规则同样逐字一致。
assert.equal(
  synthesizeVariantTaskPrompt({ prompt: "直连用户正文" }, variant),
  `${variant.fullPrompt}\n\n直连用户正文`,
);
// v6 包装协议彻底失效：包装形状的字符串不再被识别为身份证据，它在回退路径里
// 只是普通用户正文（能否通过只看 v7 合成，不看任何「提示词变体：」后缀）。
const v6Wrapped = `任意前缀\n提示词变体：${variant.variantId}\n${variant.fullPrompt}`;
assert.equal(
  synthesizeVariantTaskPrompt({ prompt: v6Wrapped }, variant),
  `${variant.fullPrompt}\n\n${v6Wrapped}`,
);
// 合成必须与 runner.executeImageStep 逐字同一套：fullPrompt + "\n\n" + inputTexts.join("\n\n")。
console.log("提示词运行时发布门禁测试通过");
