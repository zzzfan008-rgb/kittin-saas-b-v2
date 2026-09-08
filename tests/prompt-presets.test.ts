import assert from "node:assert/strict";
import {
  buildGarmentPrompt,
  GARMENT_PROMPT_PRESETS,
  GARMENT_PROMPT_VARIANTS,
  getGarmentPromptVariant,
  listGarmentPromptVariants,
  requireGarmentPromptVariant,
} from "../src/lib/garmentPromptPresets";
import { getRuntimePromptVariantAvailability } from "../src/lib/promptEvaluationRelease";
import {
  IMAGE_MODEL_IDS,
  getImageModelContract,
  imageModelContractHash,
} from "../src/types/imageModels";

assert.deepEqual(
  GARMENT_PROMPT_PRESETS.map((preset) => preset.id),
  ["fashion-lookbook", "commerce-hero", "design-sheet"],
);
assert.deepEqual(
  GARMENT_PROMPT_PRESETS.map((preset) => preset.aspectRatio),
  ["3:4", "1:1", "4:3"],
);

assert.equal(GARMENT_PROMPT_VARIANTS.length, 25, "4 个普通模型×3 任务族×2 模式 + 1 个 GPT Image 2 蒙版变体");
assert.equal(new Set(GARMENT_PROMPT_VARIANTS.map((variant) => variant.variantId)).size, 25);
assert.equal(new Set(GARMENT_PROMPT_VARIANTS.map((variant) => variant.fullPrompt)).size, 25, "不同模型/模式不得共用完整提示词");

for (const modelId of IMAGE_MODEL_IDS.filter((id) => id !== "gpt-image-2")) {
  const variants = listGarmentPromptVariants({ modelId });
  assert.equal(variants.length, 6, `${modelId} 应有三任务族的 generate/edit 独立变体`);
  assert.deepEqual(new Set(variants.map((variant) => variant.mode)), new Set(["generate", "edit"]));
}

const gptImage2Variants = listGarmentPromptVariants({ modelId: "gpt-image-2" });
assert.equal(gptImage2Variants.length, 1);
assert.equal(gptImage2Variants[0]?.mode, "mask-edit");
assert.equal(gptImage2Variants[0]?.nodeKind, "mask-redraw");
assert.equal(gptImage2Variants[0]?.familyId, "mask-local-edit");

for (const variant of GARMENT_PROMPT_VARIANTS) {
  assert.equal(variant.supportStatus, "unverified", "未运行真实评估前不得伪造通过状态");
  assert.match(variant.contractHash, /^sha256:[a-f0-9]{64}$/);
  assert.equal(
    variant.contractHash,
    imageModelContractHash(variant.modelId),
    `${variant.variantId} 必须绑定当前运行时模型契约，不得保留手写旧哈希`,
  );
  assert.equal(
    getImageModelContract(variant.modelId).contractHashScope,
    "sha256-canonical-semantic-envelope-v1",
  );
  assert.equal(variant.parameterProfileId, `${variant.modelId}:${variant.familyId}:${variant.mode}:v1`);
  assert.match(variant.statusReason, /尚未完成.*真实评估/);
  assert.ok(variant.fullPrompt.length > 150, `${variant.variantId} 必须保存完整独立提示词`);
}

for (const modelId of IMAGE_MODEL_IDS) {
  const hashes = new Set(listGarmentPromptVariants({ modelId }).map((variant) => variant.contractHash));
  assert.deepEqual(hashes, new Set([imageModelContractHash(modelId)]));
}

const geminiEdit = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "ai-modify",
  mode: "edit",
});
assert.match(geminiEdit.fullPrompt, /逐图建立序号/);
assert.match(geminiEdit.fullPrompt, /identity/);
assert.match(geminiEdit.fullPrompt, /styling_only/);

const fluxGenerate = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "flux-2-pro",
  nodeKind: "sketch-to-render",
  mode: "generate",
});
assert.match(fluxGenerate.fullPrompt, /优先级：1\./);

const seedreamEdit = requireGarmentPromptVariant({
  familyId: "design-sheet",
  modelId: "seedream-5-0-260128",
  nodeKind: "ai-modify",
  mode: "edit",
});
assert.match(seedreamEdit.fullPrompt, /按输入顺序/);
assert.match(seedreamEdit.fullPrompt, /未说明的细节不变/);

const vipEdit = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gpt-image-2-vip",
  nodeKind: "ai-modify",
  mode: "edit",
});
assert.match(vipEdit.fullPrompt, /图1、图2/);

const maskVariant = gptImage2Variants[0]!;
assert.match(maskVariant.fullPrompt, /Alpha PNG/);
assert.match(maskVariant.fullPrompt, /蒙版之外.*受保护/);
assert.match(maskVariant.fullPrompt, /自然融合.*蒙版边界/);

const exactMiss = getGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gpt-image-2-vip",
  nodeKind: "ai-modify",
  mode: "generate",
});
assert.equal(exactMiss, undefined, "节点/模式不匹配时不得回退到其他变体");

const unavailable = getRuntimePromptVariantAvailability({
  familyId: "fashion-lookbook",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "sketch-to-render",
  mode: "generate",
});
assert.equal(unavailable.enabled, false);
assert.match(unavailable.reason, /尚未完成.*真实评估/);

const unsupported = getRuntimePromptVariantAvailability({
  familyId: "fashion-lookbook",
  modelId: "gpt-image-2",
  nodeKind: "sketch-to-render",
  mode: "generate",
});
assert.equal(unsupported.enabled, false);
assert.match(unsupported.reason, /仅允许蒙版局部修改/);

const firstPrompt = buildGarmentPrompt(geminiEdit.variantId, "蓝色羊毛大衣");
assert.match(firstPrompt, /^主题与任务：蓝色羊毛大衣$/m);
assert.match(firstPrompt, new RegExp(`^提示词变体：${geminiEdit.variantId}$`, "m"));

const switchedPrompt = buildGarmentPrompt(
  fluxGenerate.variantId,
  `${firstPrompt}\n补充要求：保留可拆卸口袋。`,
);
assert.match(switchedPrompt, /^主题与任务：蓝色羊毛大衣$/m);
assert.match(switchedPrompt, /补充要求：保留可拆卸口袋。/);
assert.equal(switchedPrompt.includes(geminiEdit.variantId), false, "切换变体不得嵌套旧提示词");

assert.throws(() => buildGarmentPrompt("missing-variant", "test"), /未知服装提示词变体/);

console.log("五模型独立服装提示词目录测试通过");
