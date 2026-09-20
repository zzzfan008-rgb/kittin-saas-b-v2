import assert from "node:assert/strict";
import { requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionInputFromParams,
  promptRunReferenceSnapshotsFromGraph,
  synthesizeVariantTaskPrompt,
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

const input = promptRunAdmissionInputFromParams("image", params, references);
assert.equal(evaluatePromptRunAdmission(input).code, "support-status-blocked");
assert.equal(evaluatePromptRunAdmission(input).allowed, false);
assert.equal(evaluatePromptRunAdmission(input, { evaluationRun: true }).code, "evaluation-only");
assert.equal(evaluatePromptRunAdmission(input, { evaluationRun: true }).allowed, true);
assert.equal(evaluatePromptRunAdmission({ ...input, promptVariantId: undefined }).code, "missing-binding");
assert.equal(evaluatePromptRunAdmission({ ...input, contractHash: `sha256:${"0".repeat(64)}` }).code, "binding-mismatch");
// v7 drift 语义（runtime.md §1 第 3 步）：受审身份是 variant.fullPrompt，由服务端目录
// 钉死；用户正文沿 text 边进入 inputTexts，承载自由意图，其内容变化不构成 drift。
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
// fail-closed：既无上游 text 正文也无回退 prompt，无法合成受审运行提示词。
const { inputTexts: _omittedTexts, ...inputWithoutTexts } = input;
assert.equal(
  evaluatePromptRunAdmission(inputWithoutTexts).code,
  "prompt-drift",
  "空用户正文不得借用受审变体身份发起付费运行",
);
// fail-closed：inputTexts 形状非法（伪造请求/脏持久化）不得静默过滤放行。
assert.equal(evaluatePromptRunAdmission({ ...input, inputTexts: "not-an-array" }).code, "prompt-drift");
assert.equal(evaluatePromptRunAdmission({ ...input, inputTexts: ["正文", 42] }).code, "prompt-drift");
assert.equal(evaluatePromptRunAdmission({ ...input, inputTexts: [] }).code, "prompt-drift");
assert.equal(evaluatePromptRunAdmission({ ...input, modelOptions: { imageSize: "4K" } }).code, "parameter-drift");
assert.equal(evaluatePromptRunAdmission(input, {
  evaluationRun: true,
  shutdownRules: [{
    id: "lookbook-gemini-edit-stop",
    active: true,
    scope: {
      level: "task-family-model-node",
      taskFamilyId: "fashion-lookbook",
      modelId: "gemini-3.1-flash-image",
      nodeKind: "image",
    },
    reason: "回归审计中",
  }],
}).code, "shutdown");

assert.equal(evaluatePromptRunAdmission({ ...input, modelId: "unknown-model" }).code, "unsupported-model");
assert.equal(
  evaluatePromptRunAdmission({ ...input, modelId: "grok-imagine-image" }).code,
  "unsupported-model",
  "退役 ID 本身不得被当作当前模型接受",
);
const retiredDecision = evaluatePromptRunAdmission({
  ...input,
  modelId: "gpt-image-2.5-flare-vip",
  retiredModelId: "grok-imagine-image",
  modelSelectionNeedsConfirmation: true,
}, { evaluationRun: true });
assert.equal(retiredDecision.code, "retired-model");
assert.equal(retiredDecision.allowed, false, "评估运行也不得绕过退役模型手选门禁");
assert.match(retiredDecision.reason, /不会静默换模.*手动选择新模型/);
// v7：sunburst 仅蒙版变体可用的限制改由变体声明驱动（data-model.md §3 检查 1），
// 模型×kind 硬闸不再拒绝；fail-closed 落点变为绑定比对（modelId 与变体不符）。
assert.equal(evaluatePromptRunAdmission({ ...input, modelId: "gpt-image-2.5-sunburst" }).code, "binding-mismatch");
// v7：operationMode 归属反转给变体后，nodeKind×mode 硬闸删除；
// generate + 参考图的冲突由 reference 闸拦截。
assert.equal(evaluatePromptRunAdmission({ ...input, operationMode: "generate" }).code, "generate-reference-conflict");
// v7：operationModeNeedsConfirmation 字段族删除，该断言随字段一并移除。
// v7：旧「草图渲染节点 + generate + 参考图」冲突反例改为 image kind 表达。
assert.equal(evaluatePromptRunAdmission({
  ...input,
  operationMode: "generate",
}).code, "generate-reference-conflict");
assert.equal(evaluatePromptRunAdmission({ ...input, references: [] }).code, "edit-reference-missing");
// v7：首版四族 kind 产品政策收窄清单随旧 kind 退役删除（nodeProductPolicy 恒 supported）；
// 对应「node-product-policy-blocked」断言随之删除——三值 kind 无收窄位。
assert.equal(evaluatePromptRunAdmission({
  ...input,
  references: Array.from({ length: 9 }, (_value, order) => ({
    order,
    sourceNodeId: `source-${order}`,
  })),
}).code, "reference-limit-exceeded", "现役模型超过 8 张参考图仍必须在准入层拒绝");
const invalidReferenceDecision = evaluatePromptRunAdmission({
  ...input,
  references: references.map((reference, index) => ({
    ...reference,
    order: index === 0 ? 1 : index,
    ...(index === 0 ? { sourceNodeId: "identity-source" } : {}),
  })),
});
assert.equal(invalidReferenceDecision.code, "reference-structure-invalid");
assert.deepEqual(invalidReferenceDecision.references, [{
  order: 0,
  sourceNodeId: "identity-source",
  reason: "references[0].order must be a safe integer equal to 0",
}], "无效顺序必须定位到权威数组中的具体参考图");

const originalSupport = variant.supportStatus;
try {
  (variant as { supportStatus: string }).supportStatus = "verified";
  const release = createPromptEvaluationReleaseSnapshot(
    variant,
    "verified",
    "test-only:exact-reference-profile",
    {
      evaluationStage: "formal-validation",
      evidenceArtifactSha256: "0".repeat(64),
      gateReceiptSha256: "0".repeat(64),
      evaluationUnitKey: `sha256:${"0".repeat(64)}`,
      codeSha: TEST_PROMPT_RELEASE_CODE_SHA,
    },
  );
  assert.equal(evaluatePromptRunAdmission(input, {
    releases: [release],
    currentCodeSha: TEST_PROMPT_RELEASE_CODE_SHA,
  }).code, "verified");
  const reorderedReferences = [
    { ...references[1], order: 0 },
    { ...references[0], order: 1 },
    ...references.slice(2),
  ];
  assert.equal(
    evaluatePromptRunAdmission({ ...input, references: reorderedReferences }, {
      releases: [release],
      currentCodeSha: TEST_PROMPT_RELEASE_CODE_SHA,
    }).code,
    "verified",
    "顺序变化不再影响 verified 发布的准入判定",
  );
  const duplicateReferences = [
    ...references,
    { order: 4, sourceNodeId: "garment-bottom" },
  ];
  assert.equal(
    evaluatePromptRunAdmission({ ...input, references: duplicateReferences }, {
      releases: [release],
      currentCodeSha: TEST_PROMPT_RELEASE_CODE_SHA,
    }).code,
    "verified",
    "数量或重复不同不再影响 verified 发布的准入判定",
  );
} finally {
  (variant as { supportStatus: string }).supportStatus = originalSupport;
}

const maskVariant = requireGarmentPromptVariant({
  familyId: "mask-local-edit",
  modelId: "gpt-image-2.5-sunburst",
  // v7：蒙版族迁移 = nodeKind 改 "image"（ID 不变，R-41 契约 §3.2）。
  nodeKind: "image",
  mode: "mask-edit",
});
const maskProfile = getModelParameterProfile(maskVariant.parameterProfileId)!;
const maskInput = promptRunAdmissionInputFromParams("image", {
  modelId: maskVariant.modelId,
  operationMode: maskVariant.mode,
  // v7：蒙版用户正文同样沿 text 边进入 inputTexts。
  inputTexts: ["将蒙版区域改成银色拉链"],
  promptVariantId: maskVariant.variantId,
  promptFamilyId: maskVariant.familyId,
  parameterProfileId: maskVariant.parameterProfileId,
  contractHash: maskVariant.contractHash,
  evaluationVersion: maskVariant.evaluationVersion,
  postprocessVersion: maskProfile.postprocess.version,
  // v7：蒙版重绘节点的 batchSize 豁免随旧 kind 退役；蒙版 profile 物化值同样比对。
  aspectRatio: materializeModelParameterProfile(maskProfile).aspectRatio,
  batchSize: materializeModelParameterProfile(maskProfile).batchSize,
  modelOptions: {},
}, [{ order: 0, sourceNodeId: "mask-source" }]);
assert.equal(evaluatePromptRunAdmission(maskInput).allowed, false);
assert.equal(evaluatePromptRunAdmission(maskInput, { evaluationRun: true }).code, "evaluation-only");

console.log("提示词运行时发布门禁测试通过");
