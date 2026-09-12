import assert from "node:assert/strict";
import { buildGarmentPrompt, requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionInputFromParams,
  promptRunReferenceSnapshotsFromGraph,
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
  nodeKind: "ai-modify",
  mode: "edit",
});
const profile = getModelParameterProfile(variant.parameterProfileId)!;
const materialized = materializeModelParameterProfile(profile);
const params = {
  modelId: variant.modelId,
  operationMode: variant.mode,
  prompt: buildGarmentPrompt(variant.variantId, "把黑色蕾丝上衣与白色阔腿裤穿到模特身上"),
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
  { order: 0, role: "identity" as const, roleNeedsConfirmation: false },
  { order: 1, role: "pose_composition" as const, roleNeedsConfirmation: false },
  { order: 2, role: "garment_top" as const, roleNeedsConfirmation: false },
  { order: 3, role: "garment_bottom" as const, roleNeedsConfirmation: false },
];

const graphNodes: PromptRunGraphNode[] = [
  {
    id: "multi-output",
    data: {
      kind: "ai-modify",
      label: "上游两张图",
      status: "success",
      operationMode: "edit",
      operationModeNeedsConfirmation: false,
      modelId: "gemini-3.1-flash-image",
      modelOptions: { aspectRatio: "1:1", imageSize: "1K" },
      prompt: "test",
      aspectRatio: "1:1",
      batchSize: 2,
      outputImages: ["image-a", "image-b"],
    },
  },
  {
    id: "identity",
    data: {
      kind: "image-input",
      label: "人物",
      status: "idle",
      imageUrl: "identity-image",
      imageRole: "identity",
      roleNeedsConfirmation: false,
    },
  },
  {
    id: "empty-garment",
    data: {
      kind: "image-input",
      label: "尚未上传",
      status: "idle",
      imageRole: "garment_full",
      roleNeedsConfirmation: false,
    },
  },
];
assert.deepEqual(promptRunReferenceSnapshotsFromGraph(graphNodes, [
  {
    source: "multi-output",
    target: "target",
    data: { role: "garment_top", roleNeedsConfirmation: false },
  },
  {
    source: "identity",
    target: "target",
    data: { role: "pose_composition", roleNeedsConfirmation: false },
  },
  { source: "empty-garment", target: "target" },
], "target"), [
  {
    order: 0,
    role: "garment_top",
    roleNeedsConfirmation: false,
    sourceNodeId: "multi-output",
  },
  {
    order: 1,
    role: "garment_top",
    roleNeedsConfirmation: false,
    sourceNodeId: "multi-output",
  },
  {
    order: 2,
    role: "pose_composition",
    roleNeedsConfirmation: false,
    sourceNodeId: "identity",
  },
], "显式 edge role 必须优先，并像 DAG 一样按连线顺序逐图片展开重复角色");

assert.deepEqual(promptRunReferenceSnapshotsFromGraph(graphNodes, [
  { source: "multi-output", target: "legacy-target" },
  { source: "identity", target: "legacy-target" },
], "legacy-target"), [
  {
    order: 0,
    role: "generic",
    roleNeedsConfirmation: true,
    sourceNodeId: "multi-output",
  },
  {
    order: 1,
    role: "generic",
    roleNeedsConfirmation: true,
    sourceNodeId: "multi-output",
  },
  {
    order: 2,
    role: "identity",
    roleNeedsConfirmation: false,
    sourceNodeId: "identity",
  },
], "旧 Provider 边不得继承含糊角色；已确认 image-input 可作为明确默认");

const input = promptRunAdmissionInputFromParams("ai-modify", params, references);
assert.equal(evaluatePromptRunAdmission(input).code, "support-status-blocked");
assert.equal(evaluatePromptRunAdmission(input).allowed, false);
assert.equal(evaluatePromptRunAdmission(input, { evaluationRun: true }).code, "evaluation-only");
assert.equal(evaluatePromptRunAdmission(input, { evaluationRun: true }).allowed, true);
assert.equal(evaluatePromptRunAdmission({ ...input, promptVariantId: undefined }).code, "missing-binding");
assert.equal(evaluatePromptRunAdmission({ ...input, contractHash: `sha256:${"0".repeat(64)}` }).code, "binding-mismatch");
assert.equal(evaluatePromptRunAdmission({ ...input, prompt: `${params.prompt}\n额外静默改写` }).code, "prompt-drift");
assert.equal(evaluatePromptRunAdmission({ ...input, modelOptions: { imageSize: "4K" } }).code, "parameter-drift");
assert.equal(evaluatePromptRunAdmission({
  ...input,
  references: references.map((reference, index) => index === 0
    ? { ...reference, roleNeedsConfirmation: true }
    : reference),
}).code, "reference-role-unconfirmed");
const missingConfirmationDecision = evaluatePromptRunAdmission({
  ...input,
  references: references.map(({ order, role }) => ({ order, role })),
}, { evaluationRun: true });
assert.equal(missingConfirmationDecision.code, "reference-role-unconfirmed");
assert.deepEqual(missingConfirmationDecision.references, references.map(({ order }) => ({
  order,
  reason: "roleNeedsConfirmation is not false",
})));
assert.equal(evaluatePromptRunAdmission({ ...input, references: references.slice(0, 2) }).code, "reference-role-missing");
assert.equal(evaluatePromptRunAdmission(input, {
  evaluationRun: true,
  shutdownRules: [{
    id: "lookbook-gemini-edit-stop",
    active: true,
    scope: {
      level: "task-family-model-node",
      taskFamilyId: "fashion-lookbook",
      modelId: "gemini-3.1-flash-image",
      nodeKind: "ai-modify",
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
  modelId: "gpt-image-2-vip",
  retiredModelId: "grok-imagine-image",
  modelSelectionNeedsConfirmation: true,
}, { evaluationRun: true });
assert.equal(retiredDecision.code, "retired-model");
assert.equal(retiredDecision.allowed, false, "评估运行也不得绕过退役模型手选门禁");
assert.match(retiredDecision.reason, /不会静默换模.*手动选择新模型/);
assert.equal(evaluatePromptRunAdmission({ ...input, modelId: "gpt-image-2" }).code, "model-node-incompatible");
assert.equal(evaluatePromptRunAdmission({ ...input, operationMode: "generate" }).code, "operation-mode-incompatible");
assert.equal(evaluatePromptRunAdmission({
  ...input,
  operationModeNeedsConfirmation: true,
}).code, "operation-mode-incompatible");
assert.equal(evaluatePromptRunAdmission({
  ...input,
  nodeKind: "sketch-to-render",
  operationMode: "generate",
}).code, "generate-reference-conflict");
assert.equal(evaluatePromptRunAdmission({ ...input, references: [] }).code, "edit-reference-missing");
for (const nodeKind of ["fabric-recolor", "upscale", "print-extract", "print-mutate"] as const) {
  const blocked = evaluatePromptRunAdmission({ ...input, nodeKind }, { evaluationRun: true });
  assert.equal(blocked.code, "node-product-policy-blocked", nodeKind);
  assert.equal(blocked.allowed, false, `${nodeKind} 即使评估运行也不得绕过首版产品政策`);
  assert.match(blocked.reason, /历史项目仍可读取、查看和编辑/);
}
assert.equal(evaluatePromptRunAdmission({
  ...input,
  references: Array.from({ length: 9 }, (_value, order) => ({
    order,
    role: "generic" as const,
    roleNeedsConfirmation: false,
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
assert.equal(invalidReferenceDecision.code, "reference-role-invalid");
assert.deepEqual(invalidReferenceDecision.references, [{
  order: 0,
  sourceNodeId: "identity-source",
  reason: "references[0].order must be a safe integer equal to 0",
}], "无效顺序必须定位到权威数组中的具体参考图");
const invalidRoleDecision = evaluatePromptRunAdmission({
  ...input,
  references: references.map((reference, index) => index === 1
    ? { ...reference, role: "unsupported-role", sourceNodeId: "pose-source" }
    : reference),
});
assert.equal(invalidRoleDecision.code, "reference-role-invalid");
assert.deepEqual(invalidRoleDecision.references, [{
  order: 1,
  sourceNodeId: "pose-source",
  reason: "references[1].role must be a supported reference role",
}]);

const originalSupport = variant.supportStatus;
try {
  (variant as { supportStatus: string }).supportStatus = "verified";
  const releasedProfile = references.map(({ order, role }) => ({ order, role }));
  const release = createPromptEvaluationReleaseSnapshot(
    variant,
    releasedProfile,
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
    "support-status-blocked",
    "一个 referenceRoleProfile 的 verified 发布不得泛化到顺序不同的输入",
  );
  const duplicateReferences = [
    ...references,
    { order: 4, role: "garment_bottom" as const, roleNeedsConfirmation: false },
  ];
  assert.equal(
    evaluatePromptRunAdmission({ ...input, references: duplicateReferences }, {
      releases: [release],
      currentCodeSha: TEST_PROMPT_RELEASE_CODE_SHA,
    }).code,
    "support-status-blocked",
    "一个 referenceRoleProfile 的 verified 发布不得泛化到数量或重复不同的输入",
  );
} finally {
  (variant as { supportStatus: string }).supportStatus = originalSupport;
}

const maskVariant = requireGarmentPromptVariant({
  familyId: "mask-local-edit",
  modelId: "gpt-image-2",
  nodeKind: "mask-redraw",
  mode: "mask-edit",
});
const maskProfile = getModelParameterProfile(maskVariant.parameterProfileId)!;
const maskInput = promptRunAdmissionInputFromParams("mask-redraw", {
  modelId: maskVariant.modelId,
  operationMode: maskVariant.mode,
  prompt: buildGarmentPrompt(maskVariant.variantId, "将蒙版区域改成银色拉链"),
  promptVariantId: maskVariant.variantId,
  promptFamilyId: maskVariant.familyId,
  parameterProfileId: maskVariant.parameterProfileId,
  contractHash: maskVariant.contractHash,
  evaluationVersion: maskVariant.evaluationVersion,
  postprocessVersion: maskProfile.postprocess.version,
  modelOptions: {},
}, [{ order: 0, role: "garment_full", roleNeedsConfirmation: false }]);
assert.equal(evaluatePromptRunAdmission(maskInput).allowed, false);
assert.equal(evaluatePromptRunAdmission(maskInput, { evaluationRun: true }).code, "evaluation-only");

console.log("提示词运行时发布门禁测试通过");
