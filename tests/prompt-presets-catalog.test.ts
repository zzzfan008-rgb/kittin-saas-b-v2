/**
 * 64 Phase 2 / Phase 3a：预设模板文本与 variantId→binding 一致性锁定。
 *
 * 断言：
 * - src/lib/promptPresets.ts TEXT_PROMPT_PRESETS 与 server PRESET_TEMPLATE_TEXTS 逐字一致（Phase 2）
 * - src/lib/promptPresetsFrozenClient.ts 冻结 binding 表与 server PRESET_TEMPLATE_TEXTS / frozenPromptBindingForVariantId 逐项一致（Phase 3a）
 *
 * 测试可跨层 import server 文件（tests/ 不受 depcruise src→server 限制，
 * server→src 已有反向引用，单向 dep 不变）。
 */
import assert from "node:assert/strict";

import { TEXT_PROMPT_PRESETS, OPTIONAL_PROMPT_POLISH_PRESET } from "../src/lib/promptPresets";
import {
  frozenPromptBindingForVariantId,
  FROZEN_PROMPT_ENTRY_COUNT,
  FROZEN_PROMPT_FAMILY_IDS,
} from "../src/lib/promptPresetsFrozenClient";
import {
  PRESET_TEMPLATE_TEXTS,
  frozenPromptBindingForVariantId as serverBindingFn,
  FROZEN_PRESET_FAMILY_IDS,
} from "../server/lib/promptPresetsFrozen";

console.log("预设模板文本 + variantId 冻结绑定一致性锁定测试");

// ===== Phase 2：TEXT_PROMPT_PRESETS 7 族 + polish =====
console.log("\n--- Phase 2：文本节点预设目录 ---");
console.log(`  v1 服装族目录登记 ${TEXT_PROMPT_PRESETS.length} 条`);

for (const preset of TEXT_PROMPT_PRESETS) {
  const frozen = PRESET_TEMPLATE_TEXTS[preset.frozenKey];
  assert.ok(frozen, `预设 ${preset.id}（frozenKey=${preset.frozenKey}）在冻结表中不存在`);
  assert.equal(
    preset.text,
    frozen.text,
    `预设 ${preset.id}（${preset.frozenKey}）正文与冻结表不同`,
  );
  console.log(`  ✓ ${preset.frozenKey}`);
}

// 可选 polish
if (OPTIONAL_PROMPT_POLISH_PRESET) {
  const polishFrozen = PRESET_TEMPLATE_TEXTS[OPTIONAL_PROMPT_POLISH_PRESET.frozenKey];
  assert.ok(polishFrozen, "可选 polish frozenKey 不存在");
  assert.equal(OPTIONAL_PROMPT_POLISH_PRESET.text, polishFrozen.text, "polish 文本漂移");
  console.log(`  ✓ ${OPTIONAL_PROMPT_POLISH_PRESET.frozenKey}（可选 polish）`);
}

// ===== Phase 3a：冻结 binding 表与 server 逐项一致 =====
console.log("\n--- Phase 3a：客户端冻结 variantId→binding 表 ---");

// 条目数一致
const serverKeys = Object.keys(PRESET_TEMPLATE_TEXTS);
console.log(`  server PRESET_TEMPLATE_TEXTS: ${serverKeys.length} 条`);
console.log(`  client FROZEN_PROMPT_ENTRY_COUNT: ${FROZEN_PROMPT_ENTRY_COUNT}`);
assert.equal(FROZEN_PROMPT_ENTRY_COUNT, serverKeys.length, "冻结条目数与 server 不一致——增删了预设模板？");

// 每个 server entry 的文本与客户端 frozenPromptBinding 文本逐字一致
for (const [key, entry] of Object.entries(PRESET_TEMPLATE_TEXTS)) {
  const clientBinding = frozenPromptBindingForVariantId(`test.${key}.v1`);
  // 用 familyId:mode 直接构造 variantId（模拟迁移输入），断言解析成功
  const variantId = `${entry.familyId}.gpt-image-2.5-flare-vip.${entry.mode}.v1`;
  const binding = frozenPromptBindingForVariantId(variantId);
  assert.ok(binding, `客户端冻结绑定未命中 server 键 ${key}（variantId=${variantId}）`);
  assert.equal(binding.familyId, entry.familyId, `${key}: familyId 不一致`);
  assert.equal(binding.mode, entry.mode, `${key}: mode 不一致`);
  assert.equal(binding.text, entry.text, `${key}: 冻结文本漂移`);
}

console.log(`  ✓ ${serverKeys.length} 条冻结 binding 与 server 逐字一致`);

// ===== 11 族 family 覆盖 =====
console.log("\n--- 11 族覆盖 ---");
assert.deepEqual(
  [...FROZEN_PROMPT_FAMILY_IDS].sort(),
  [...FROZEN_PRESET_FAMILY_IDS].sort(),
  "客户端 FROZEN_PROMPT_FAMILY_IDS 与 server FROZEN_PRESET_FAMILY_IDS 不一致",
);
console.log(`  ${FROZEN_PROMPT_FAMILY_IDS.length} 族全量覆盖 ✓`);

// ===== variantId 解析三态 =====
console.log("\n--- variantId 解析三态 ---");
// 已知 family（fashion-lookbook, generate）→ 命中
const known = frozenPromptBindingForVariantId("fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1");
assert.ok(known, "已知 fashion-lookbook.generate 未命中");
assert.equal(known.familyId, "fashion-lookbook");
assert.equal(known.mode, "generate");
console.log(`  ✓ fashion-lookbook.generate → familyId="${known.familyId}" mode="${known.mode}"`);

// 未知 family → undefined
const unknownFamily = frozenPromptBindingForVariantId("nonexistent.gpt-image-2.5-flare-vip.generate.v1");
assert.equal(unknownFamily, undefined, "未知 family 应返回 undefined");
console.log(`  ✓ 未知 family → undefined`);

// 格式错误 → undefined
const badFormat = frozenPromptBindingForVariantId("garbage");
assert.equal(badFormat, undefined, "格式错误应返回 undefined");
console.log(`  ✓ 格式错误 → undefined`);

// mask-local-edit:mask-edit → 命中
const maskBinding = frozenPromptBindingForVariantId("mask-local-edit.gpt-image-2.5-flare-vip.mask-edit.v1");
assert.ok(maskBinding, "mask-local-edit 未命中");
assert.equal(maskBinding.mode, "mask-edit");
console.log(`  ✓ mask-local-edit → mode=mask-edit, text 非空 (${maskBinding.text.length} chars)`);

// video-animate:edit → 命中
const videoBinding = frozenPromptBindingForVariantId("video-animate.doubao-seedance-2-5-260628.edit.v1");
assert.ok(videoBinding, "video-animate 未命中");
console.log(`  ✓ video-animate → mode=edit, text 非空 (${videoBinding.text.length} chars)`);

// prompt-generate:generate → 命中
const genBinding = frozenPromptBindingForVariantId("prompt-generate.gpt-image-2.5-flare-vip.generate.v1");
assert.ok(genBinding, "prompt-generate 未命中");
console.log(`  ✓ prompt-generate → mode=generate, text 非空 (${genBinding.text.length} chars)`);

// ===== 客户端 server 函数结果一致（同一 variantId 输入） =====
console.log("\n--- 客户端 vs server frozenPromptBindingForVariantId 逐项比较 ---");
const TEST_VARIANT_IDS = [
  "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1",
  "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
  "commerce-hero.gpt-image-2.5-flare-vip.generate.v1",
  "commerce-hero.grok-imagine-image.edit.v1",
  "design-sheet.gpt-image-2.5-flare-vip.generate.v1",
  "upscale.gpt-image-2.5-flare-vip.edit.v1",
  "print-extract.gpt-image-2.5-flare-vip.edit.v1",
  "print-mutate.gpt-image-2.5-flare-vip.edit.v1",
  "fabric-recolor.gpt-image-2.5-flare-vip.edit.v1",
  "mask-local-edit.gpt-image-2.5-flare-vip.mask-edit.v1",
  "video-animate.doubao-seedance-2-5-260628.edit.v1",
  "prompt-polish.gpt-image-2.5-flare-vip.edit.v1",
  "prompt-generate.gpt-image-2.5-flare-vip.generate.v1",
];
for (const variantId of TEST_VARIANT_IDS) {
  const clientResult = frozenPromptBindingForVariantId(variantId);
  const serverResult = serverBindingFn(variantId);
  if (clientResult) {
    assert.ok(serverResult, `${variantId}: 客户端命中但 server 未命中`);
    assert.equal(clientResult.familyId, serverResult.familyId, `${variantId}: familyId`);
    assert.equal(clientResult.mode, serverResult.mode, `${variantId}: mode`);
    assert.equal(clientResult.text, serverResult.text, `${variantId}: text`);
    console.log(`  ✓ ${variantId}`);
  } else {
    assert.equal(serverResult, undefined, `${variantId}: 客户端未命中但 server 命中`);
    console.log(`  ⊘ ${variantId}（两边均未命中）`);
  }
}

console.log(`\n全量一致性锁定通过 ✓`);