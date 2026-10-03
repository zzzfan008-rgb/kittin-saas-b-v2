/**
 * 64 Phase 2 裁决 B：预设模板文本一致性锁定。
 *
 * 断言 src/lib/promptPresets.ts 中每条预设模板的正文与 server/lib/promptPresetsFrozen.ts
 * PRESET_TEMPLATE_TEXTS 逐字相同（fail-closed 防两端漂移）。
 */
import assert from "node:assert/strict";

import { TEXT_PROMPT_PRESETS, OPTIONAL_PROMPT_POLISH_PRESET } from "../src/lib/promptPresets";
import { PRESET_TEMPLATE_TEXTS } from "../server/lib/promptPresetsFrozen";

console.log("预设模板文本一致性锁定测试");

// v1 目录条目数（7 服装族）
const V1_COUNT = TEXT_PROMPT_PRESETS.length;
console.log(`  v1 服装族目录登记 ${V1_COUNT} 条`);

// -- 所有登记条目与冻结表逐字一致 --
for (const preset of TEXT_PROMPT_PRESETS) {
  const frozen = PRESET_TEMPLATE_TEXTS[preset.frozenKey];
  assert.ok(frozen, `预设 ${preset.id}（frozenKey=${preset.frozenKey}）在冻结表中不存在——客户端与 server 表不一致（fail-closed stop）`);
  assert.equal(
    preset.text,
    frozen.text,
    `预设 ${preset.id}（${preset.frozenKey}）正文与冻结表不同：客户端文本已有漂移，必须对齐冻结表（冻结表是事实源）`,
  );
  console.log(`  ✓ ${preset.frozenKey}`);
}

// -- 可选 polish 与冻结表一致 --
if (OPTIONAL_PROMPT_POLISH_PRESET) {
  const polishFrozen = PRESET_TEMPLATE_TEXTS[OPTIONAL_PROMPT_POLISH_PRESET.frozenKey];
  assert.ok(polishFrozen, `可选 polish frozenKey 不存在`);
  assert.equal(OPTIONAL_PROMPT_POLISH_PRESET.text, polishFrozen.text, `polish 文本漂移`);
  console.log(`  ✓ ${OPTIONAL_PROMPT_POLISH_PRESET.frozenKey}（可选 polish）`);
}

// -- 目录 id/frozenKey 无重复 --
const ids = TEXT_PROMPT_PRESETS.map((p) => p.id);
const frozenKeys = [...TEXT_PROMPT_PRESETS.map((p) => p.frozenKey), OPTIONAL_PROMPT_POLISH_PRESET?.frozenKey].filter(Boolean) as string[];
assert.deepEqual([...new Set(ids)], ids, "存在重复的预设 id");
assert.deepEqual([...new Set(frozenKeys)], frozenKeys, "存在重复的 frozenKey");

// -- 文本非空 --
for (const preset of TEXT_PROMPT_PRESETS) {
  assert.ok(preset.text.trim().length > 0, `预设 ${preset.id} 正文为空`);
  assert.ok(preset.name.trim().length > 0, `预设 ${preset.id} 名称为空`);
}

console.log(`\n一致性锁定通过 ✓`);