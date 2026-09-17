import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import matrix from "../docs/ai/evaluation/node-prompt-parameter-matrix-v1.json";
import {
  GARMENT_PROMPT_VARIANTS,
  type PromptVariant,
} from "../src/lib/garmentPromptPresets";
import {
  IMAGE_MODEL_IDS,
  getImageModelContract,
} from "../src/types/imageModels";
import {
  getModelParameterProfile,
} from "../src/types/modelParameterProfiles";
import {
  createExpectedNodePromptParameterMatrix,
  checkMaterializedNodePromptParameterMatrix,
} from "../scripts/node-prompt-parameter-matrix";
import type { NodePromptParameterMatrix } from "../scripts/node-prompt-parameter-matrix";

const actual = matrix as NodePromptParameterMatrix;
const expected = createExpectedNodePromptParameterMatrix();

assert.doesNotThrow(checkMaterializedNodePromptParameterMatrix);
assert.deepEqual(actual, expected, "物化矩阵必须由当前提示词、参数、Provider 和产品策略精确重算");
assert.equal(actual.scope.entryCount, 35);
assert.equal(actual.scope.supportedEntryCount, 9);
assert.equal(actual.scope.unsupportedEntryCount, 26);
assert.deepEqual(actual.scope.modelIds, IMAGE_MODEL_IDS);
assert.deepEqual(actual.scope.nodeKinds, [
  "sketch-to-render",
  "ai-modify",
  "mask-redraw",
  "fabric-recolor",
  "upscale",
  "print-extract",
  "print-mutate",
]);
assert.equal(actual.scope.noProviderCallsPerformed, true);
assert.equal(actual.scope.imageGenerationOrEditCalls, 0);
assert.equal(actual.sourceSkills[0], "awesome-gpt-image-2");
assert.equal(actual.sourceSkills[1], "apiyi");

const variantsById = new Map(GARMENT_PROMPT_VARIANTS.map((variant) => [variant.variantId, variant]));
const supported = actual.entries.filter((entry) => entry.supportStatus === "unverified");
const unsupported = actual.entries.filter((entry) => entry.supportStatus === "unsupported");

assert.equal(supported.length, 9);
assert.equal(unsupported.length, 26);
assert.equal(new Set(actual.entries.map((entry) => `${entry.nodeKind}\u0000${entry.modelId}`)).size, 35);

function assertPromptChecklist(variant: PromptVariant): void {
  const prompt = variant.fullPrompt;
  assert.ok(prompt.length > 150, `${variant.variantId} must retain a complete prompt`);
  assert.match(prompt, /服装|商品|局部修改/);
  assert.match(prompt, /生成|编辑|修改/);
  assert.match(prompt, /居中|视图|机位|构图/);
  assert.match(prompt, /材质|面料/);
  assert.match(prompt, /文字|Logo|水印/);
  assert.match(prompt, /1:1|3:4|4:3|同尺寸/);
  assert.match(prompt, /无|不得|不变|禁止/);
}

for (const entry of supported) {
  assert.equal(entry.productPolicy.status, "supported");
  assert.equal(entry.failClosedReason?.includes("unverified"), true);
  assert.ok(entry.promptVariantIds.length > 0);
  assert.equal(entry.promptReview.length, entry.promptVariantIds.length);
  assert.equal(entry.parameterProfiles.length, entry.parameterProfileIds.length);
  assert.deepEqual(
    entry.promptVariantIds,
    entry.promptReview.map((review) => review.promptVariantId),
  );
  assert.deepEqual(
    entry.parameterProfileIds,
    entry.parameterProfiles.map((profile) => profile.parameterProfileId),
  );
  for (const review of entry.promptReview) {
    const variant = variantsById.get(review.promptVariantId);
    assert.ok(variant, review.promptVariantId);
    assert.equal(variant.modelId, entry.modelId);
    assert.equal(variant.nodeKind, entry.nodeKind);
    assert.equal(review.familyId, variant.familyId);
    assert.equal(review.mode, variant.mode);
    assert.equal(review.promptSha256, `sha256:${createHash("sha256").update(variant.fullPrompt).digest("hex")}`);
    assert.deepEqual(review.checklist, [
      "subject-task",
      "composition",
      "style-material",
      "text-label",
      "aspect-output",
      "negative-constraints",
    ]);
    assertPromptChecklist(variant);
  }
  for (const profile of entry.parameterProfiles) {
    const current = getModelParameterProfile(profile.parameterProfileId);
    assert.ok(current, profile.parameterProfileId);
    assert.deepEqual(profile.businessFrame, current.businessFrame);
    assert.deepEqual(profile.native, current.native);
    assert.deepEqual(profile.postprocess, current.postprocess);
  }
  assert.ok(entry.providerRequests.length > 0);
  for (const request of entry.providerRequests) {
    const contract = getImageModelContract(entry.modelId);
    assert.equal(request.timeoutMs, contract.timeoutMs);
    assert.equal(request.endpoint.method, "POST");
    assert.equal(request.referenceInputs.totalMax, request.mode === "generate" ? 0 : Math.min(8, contract.edit.maxReferences));
    assert.equal(request.output.maxImages, contract.output.maxImages ?? 1);
  }
}

const maskEntry = actual.entries.find((entry) => entry.nodeKind === "mask-redraw" && entry.modelId === "gpt-image-2");
assert.ok(maskEntry);
assert.equal(maskEntry.supportStatus, "unverified");
assert.deepEqual(maskEntry.promptVariantIds, ["mask-local-edit.gpt-image-2.mask-edit.v1"]);
assert.deepEqual(maskEntry.parameterProfileIds, ["gpt-image-2:mask-local-edit:mask-edit:v1"]);
assert.deepEqual(maskEntry.providerRequests[0]?.requiredFields, [
  "model",
  "prompt",
  "size (runtime-derived)",
  "image[] (ordered)",
  "mask",
  "background=opaque",
  "output_format=png",
]);
assert.deepEqual(maskEntry.providerRequests[0]?.forbiddenFields, ["input_fidelity", "response_format", "n"]);
assert.equal(maskEntry.providerRequests[0]?.referenceInputs.userMax, 7);
assert.equal(maskEntry.providerRequests[0]?.referenceInputs.totalMax, 8);

for (const seedreamEntry of supported.filter((entry) => entry.modelId === "seedream-5-0-260128")) {
  for (const profile of seedreamEntry.parameterProfiles) {
    assert.equal(profile.native.kind, "seedream-image");
    if (profile.native.kind !== "seedream-image") continue;
    assert.equal(profile.native.responseFormat, "b64_json");
    assert.equal(profile.native.watermark, false);
    assert.equal(profile.native.sequentialImageGeneration, "disabled");
    assert.deepEqual(profile.native.forbiddenFields, ["n", "aspect_ratio"]);
    assert.equal(profile.native.recordActualOutputSize, true);
  }
  for (const request of seedreamEntry.providerRequests) {
    assert.ok(request.requiredFields.includes("response_format=b64_json"));
    assert.ok(request.requiredFields.includes("watermark=false"));
    assert.ok(request.requiredFields.includes("sequential_image_generation=disabled"));
    assert.deepEqual(request.omittedFields, ["aspect_ratio"]);
    assert.deepEqual(request.forbiddenFields, ["n"]);
    assert.equal(request.output.recordsActualProviderSize, true);
  }
}

for (const entry of unsupported) {
  assert.equal(entry.productPolicy.status, "unsupported");
  assert.ok(entry.productPolicy.reason);
  assert.ok(entry.failClosedReason);
  assert.equal(entry.promptVariantId, null);
  assert.deepEqual(entry.promptVariantIds, []);
  assert.deepEqual(entry.promptReview, []);
  assert.equal(entry.parameterProfileId, null);
  assert.deepEqual(entry.parameterProfileIds, []);
  assert.deepEqual(entry.parameterProfiles, []);
  assert.deepEqual(entry.providerRequests, []);
}

for (const entry of actual.entries.filter((candidate) => candidate.modelId === "gpt-image-2")) {
  if (entry.nodeKind === "mask-redraw") continue;
  assert.equal(entry.supportStatus, "unsupported");
  assert.match(entry.failClosedReason ?? "", /仅允许 mask-redraw/);
}

for (const entry of actual.entries.filter((candidate) => candidate.nodeKind === "mask-redraw" && candidate.modelId !== "gpt-image-2")) {
  assert.equal(entry.supportStatus, "unsupported");
  assert.match(entry.failClosedReason ?? "", /只支持 GPT Image 2/);
}

console.log("节点×模型提示词、参数和 API易接口矩阵测试通过");
