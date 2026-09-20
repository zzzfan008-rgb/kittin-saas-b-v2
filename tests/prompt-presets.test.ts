import assert from "node:assert/strict";
import {
  buildGarmentPrompt,
  GARMENT_PROMPT_PRESETS,
  GARMENT_PROMPT_VARIANTS,
  getGarmentPromptVariant,
  listGarmentPromptVariants,
  requireGarmentPromptVariant,
  type PromptFamilyId,
} from "../src/lib/garmentPromptPresets";
import { getRuntimePromptVariantAvailability } from "../src/lib/promptEvaluationRelease";
import {
  imageModelContractHash,
  type ImageModelId,
} from "../src/types/imageModels";
import { textModelContractHash, type TextModelId } from "../src/types/textModels";
import { videoModelContractHash, type VideoModelId } from "../src/types/videoModels";

assert.deepEqual(
  GARMENT_PROMPT_PRESETS.map((preset) => preset.id),
  ["fashion-lookbook", "commerce-hero", "design-sheet"],
);
assert.deepEqual(
  GARMENT_PROMPT_PRESETS.map((preset) => preset.aspectRatio),
  ["3:4", "1:1", "4:3"],
);

assert.equal(
  GARMENT_PROMPT_VARIANTS.length,
  48, // 4 image 模型×3 任务族×2 模式（含旧 ai-modify=edit / sketch-to-render=generate 的迁移落点）
      // + 4 image 模型×4 六族功能族×1 edit + 1 蒙版 + 3 文本模型×2 文本族 + 1 视频变体
  "v7 目录：三任务族 + 六族功能族 + 蒙版族 + 文本族 + 视频族",
);
assert.equal(new Set(GARMENT_PROMPT_VARIANTS.map((variant) => variant.variantId)).size, 48);
// §3.1：旧 ai-modify / sketch-to-render 不是新族——它们的文案就是三任务族的 edit / generate 变体。
assert.equal(
  listGarmentPromptVariants({ nodeKind: "image" }).filter(
    (variant) => variant.familyId === "fashion-lookbook"
      || variant.familyId === "commerce-hero"
      || variant.familyId === "design-sheet",
  ).length,
  24,
  "三任务族×四模型×两模式 = 24 个变体，即旧 ai-modify（edit）与 sketch-to-render（generate）的迁移落点",
);
assert.ok(
  new Set(GARMENT_PROMPT_VARIANTS.map((variant) => variant.fullPrompt)).size >= 30,
  "不同应用场景的变体不得大量共用完整提示词",
);

for (const modelId of ["gpt-image-2.5-flare-vip", "gemini-3.1-flash-image", "flux-2-pro", "seedream-5-0-260128"] as const) {
  const standard = listGarmentPromptVariants({ modelId, familyId: "fashion-lookbook" });
  assert.equal(standard.length, 2, `${modelId} fashion-lookbook 应有 generate/edit 独立变体`);
  assert.deepEqual(new Set(standard.map((variant) => variant.mode)), new Set(["generate", "edit"]));
}

const gptImage2Variants = listGarmentPromptVariants({ modelId: "gpt-image-2.5-sunburst" });
assert.equal(gptImage2Variants.length, 1);
assert.equal(gptImage2Variants[0]?.mode, "mask-edit");
assert.equal(gptImage2Variants[0]?.needsMask, true);
// v7：蒙版族迁移 = nodeKind 改 "image"（ID 不变，R-41 契约 §3.2）。
assert.equal(gptImage2Variants[0]?.nodeKind, "image");
assert.equal(gptImage2Variants[0]?.familyId, "mask-local-edit");

for (const variant of GARMENT_PROMPT_VARIANTS) {
  assert.equal(variant.supportStatus, "unverified", "未运行真实评估前不得伪造通过状态");
  assert.match(variant.contractHash, /^sha256:[a-f0-9]{64}$/);
  const expectedHash = variant.nodeKind === "text"
    ? textModelContractHash(variant.modelId as TextModelId)
    : variant.nodeKind === "video"
      ? videoModelContractHash(variant.modelId as VideoModelId)
      : imageModelContractHash(variant.modelId as ImageModelId);
  assert.equal(
    variant.contractHash,
    expectedHash,
    `${variant.variantId} 必须绑定当前运行时契约，不得保留手写旧哈希`,
  );
  assert.equal(variant.parameterProfileId, `${variant.modelId}:${variant.familyId}:${variant.mode}:v1`);
  assert.match(variant.statusReason, /尚未完成.*真实评估/);
  // 六族功能文案按 §3.1 逐字迁移，短于三族/文本族的整段文案（最长 76 字），因此这里只做非空下限；
  // 它们的完整性由下方 MIGRATED_FUNCTION_PROMPTS 的逐字比对保证。
  assert.ok(variant.fullPrompt.length >= 40, `${variant.variantId} 必须保存完整独立提示词`);
  // §1.2：needsMask 必须显式声明（不留 undefined）；只有蒙版族为 true。
  assert.equal(typeof variant.needsMask, "boolean", `${variant.variantId} 必须显式声明 needsMask`);
  assert.equal(variant.needsMask, variant.familyId === "mask-local-edit");
}

// ---------- 六族文案逐字迁移对照（contracts/prompt-variant-schema.md §3.1 / §3.2 / §3.5） ----------
// 迁移源 = P2-b 之前 server/engine/runner.ts（upscale / print-extract / print-mutate 三个分支字面量）
// 与 src/lib/colors.ts:140 `buildRecolorPrompt`；差异只有两处：删除 `。补充要求：${extra}` 拼接、
// 删除 `{colors}` 占位。下方字符串即旧实现的原文（或占位删除后的等价文本），逐字比对。
const MIGRATED_FUNCTION_PROMPTS = {
  upscale: "将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变",
  "print-extract": "提取这件衣服上的印花图案：将印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影和穿着效果，印花的比例、细节和色彩与原图保持一致，适合作为印花素材复用",
  "print-mutate": "基于这张印花图案生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图与组合方式，纯白背景，适合作为印花素材复用",
  "fabric-recolor": "保持服装的版型、款式细节、构图和光线完全不变，仅将面料配色替换为用户指定的配色。配色应用于面料主体，呈现真实面料质感与准确色彩，无文字无水印。",
} as const;
assert.deepEqual(
  listGarmentPromptVariants({ nodeKind: "image" })
    .filter((variant) => variant.familyId in MIGRATED_FUNCTION_PROMPTS)
    .length,
  16,
  "六族功能族×四模型 = 16 个 edit 变体",
);
for (const modelId of ["gpt-image-2.5-flare-vip", "gemini-3.1-flash-image", "flux-2-pro", "seedream-5-0-260128"] as const) {
  for (const [familyId, source] of Object.entries(MIGRATED_FUNCTION_PROMPTS)) {
    const migrated = requireGarmentPromptVariant({
      familyId: familyId as PromptFamilyId,
      modelId,
      nodeKind: "image",
      mode: "edit",
    });
    assert.equal(migrated.variantId, `${familyId}.${modelId}.edit.v1`);
    assert.equal(migrated.parameterProfileId, `${modelId}:${familyId}:edit:v1`);
    assert.equal(migrated.needsMask, false);
    assert.equal(migrated.fullPrompt, source, `${migrated.variantId} 的文案必须与迁移源逐字一致`);
  }
}

for (const modelId of [...new Set(GARMENT_PROMPT_VARIANTS.map((variant) => variant.modelId))]) {
  const hashes = new Set(listGarmentPromptVariants({ modelId }).map((variant) => variant.contractHash));
  const expectedHash = modelId === "gpt-image-2.5-sunburst" || modelId === "gpt-image-2.5-flare-vip" || modelId === "gemini-3.1-flash-image" || modelId === "flux-2-pro" || modelId === "seedream-5-0-260128"
    ? imageModelContractHash(modelId as ImageModelId)
    : modelId === "gpt-4o" || modelId === "claude-sonnet-4-5" || modelId === "gemini-3-pro-preview"
      ? textModelContractHash(modelId as TextModelId)
      : videoModelContractHash(modelId as VideoModelId);
  assert.deepEqual(hashes, new Set([expectedHash]));
}

const geminiEdit = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "image",
  mode: "edit",
});
assert.match(geminiEdit.fullPrompt, /逐图/);
assert.match(geminiEdit.fullPrompt, /identity/);
assert.match(geminiEdit.fullPrompt, /styling_only/);

const fluxGenerate = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "flux-2-pro",
  nodeKind: "image",
  mode: "generate",
});
assert.match(fluxGenerate.fullPrompt, /优先级：1\./);

const seedreamEdit = requireGarmentPromptVariant({
  familyId: "design-sheet",
  modelId: "seedream-5-0-260128",
  nodeKind: "image",
  mode: "edit",
});
assert.match(seedreamEdit.fullPrompt, /按输入顺序/);
assert.match(seedreamEdit.fullPrompt, /未说明的细节不变/);

const vipEdit = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "edit",
});
assert.match(vipEdit.fullPrompt, /图1、图2/);

const maskVariant = gptImage2Variants[0]!;
assert.match(maskVariant.fullPrompt, /Alpha PNG/);
assert.match(maskVariant.fullPrompt, /蒙版之外.*受保护/);
assert.match(maskVariant.fullPrompt, /自然融合.*蒙版边界/);

// v7：旧「nodeKind 不同但四键其余相同 → miss」的反例随 nodeKind 收敛失效
//（image 现在是合法命中）。改为用目录外 familyId（cast 绕过联合类型）验证绝不回退语义。
const exactMiss = getGarmentPromptVariant({
  familyId: "nonexistent-family" as PromptFamilyId,
  modelId: "gpt-image-2.5-flare-vip",
  nodeKind: "image",
  mode: "generate",
});
assert.equal(exactMiss, undefined, "familyId 不匹配时不得回退到其他变体");

const unavailable = getRuntimePromptVariantAvailability({
  familyId: "fashion-lookbook",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "image",
  mode: "generate",
});
assert.equal(unavailable.enabled, false);
assert.match(unavailable.reason, /尚未完成.*真实评估/);

const unsupported = getRuntimePromptVariantAvailability({
  familyId: "fashion-lookbook",
  modelId: "gpt-image-2.5-sunburst",
  nodeKind: "image",
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

// ---------- 文本族 / 视频族（§3.3 / §3.4） ----------
const textVariants = listGarmentPromptVariants({ nodeKind: "text" });
assert.deepEqual(
  textVariants.map((variant) => `${variant.familyId}:${variant.mode}`).sort(),
  [
    "prompt-generate:generate", "prompt-generate:generate", "prompt-generate:generate",
    "prompt-polish:edit", "prompt-polish:edit", "prompt-polish:edit",
  ],
  "文本族：润色=有上游输入的 edit、生成=零上游的 generate，各覆盖三个文本模型",
);
assert.deepEqual(
  [...new Set(textVariants.map((variant) => variant.modelId))].sort(),
  ["claude-sonnet-4-5", "gemini-3-pro-preview", "gpt-4o"],
);
for (const variant of textVariants) {
  assert.equal(variant.needsMask, false, "文本变体恒 false（§1.2）");
  assert.ok(variant.fullPrompt.length > 100);
}
const videoVariants = listGarmentPromptVariants({ nodeKind: "video" });
assert.deepEqual(videoVariants.map((variant) => variant.variantId), [
  "video-animate.doubao-seedance-2-5-260628.edit.v1",
]);
assert.equal(videoVariants[0]?.needsMask, false);

console.log("五模型独立服装提示词目录测试通过");
