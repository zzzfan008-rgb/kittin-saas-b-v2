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
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

// ===== 64 Phase 3（3c-4）：data/templates/builtin JSON 快照一致性 =====
// 断言内置模板 JSON 的 text 节点文本与 server 冻结表 PRESET_TEMPLATE_TEXTS 逐字一致：
// 手改任一边（模板 JSON 的提示词正文 / server 冻结常量）CI 即红。
// JSON 是 v9 再生产物（PR #89 收敛入库）；文本随预设模板进 text 节点，模式在 generator 的
// operationMode（生成节点任务文本由 runner 冻结系统文本拼装，不进模板 JSON）。
console.log("\n--- 3c-4：data/templates/builtin JSON 快照一致性 ---");
const BUILTIN_DIR = join(process.cwd(), "data", "templates", "builtin");
const builtinFiles = readdirSync(BUILTIN_DIR).filter((name) => name.endsWith(".json"));
assert.ok(builtinFiles.length > 0, "data/templates/builtin 下必须有内置模板 JSON");

interface BuiltinNodeLike {
  id?: string;
  type?: string;
  data?: { kind?: string; text?: string; operationMode?: string };
}

for (const fileName of builtinFiles) {
  const raw = JSON.parse(readFileSync(join(BUILTIN_DIR, fileName), "utf8")) as {
    flow?: { nodes?: BuiltinNodeLike[] };
    nodes?: BuiltinNodeLike[];
  };
  const nodes = raw.flow?.nodes ?? raw.nodes;
  assert.ok(Array.isArray(nodes), `${fileName}: 缺少 nodes`);
  const textNodes = nodes.filter((node) => node.data?.kind === "text" && typeof node.data.text === "string" && node.data.text.trim() !== "");
  const imageGenerators = nodes.filter((node) => node.data?.kind === "image-generator");
  const videoGenerators = nodes.filter((node) => node.data?.kind === "video-generator");
  assert.ok(textNodes.length > 0, `${fileName}: 缺少携带预设文本的 text 节点`);
  assert.ok(imageGenerators.length + videoGenerators.length > 0, `${fileName}: 缺少生成节点`);
  // image 模板：节点 operationMode 与冻结表条目 mode 同轴（预设目录 familyId:mode = 节点模式）。
  // video 模板：节点 operationMode 为 video 生成轴的 "generate"，预设目录轴记为
  // video-animate:edit（Seedance 协议文本条目）——两套轴不同，文本逐字命中即可，
  // mode 断言按 video 生成节点的真实语义走（文本必须命中 video-animate:edit 条目）。
  for (const textNode of textNodes) {
    const nodeText = textNode.data?.text ?? "";
    if (imageGenerators.length > 0 && videoGenerators.length === 0) {
      const operationMode = imageGenerators[0]?.data?.operationMode;
      assert.ok(
        typeof operationMode === "string" && operationMode.length > 0,
        `${fileName}: 生成节点缺少 operationMode（v9 模式归节点 data）`,
      );
      // 命中冻结表：存在同文本条目且 mode 匹配（JSON text 与 frozen 表逐字一致）。
      const matchedKeys = serverKeys.filter((key) => {
        const entry = PRESET_TEMPLATE_TEXTS[key];
        return entry.text === nodeText && entry.mode === operationMode;
      });
      assert.ok(
        matchedKeys.length > 0,
        `${fileName}: text 节点「${nodeText.slice(0, 40)}…」在冻结表中不存在（mode=${operationMode}）——模板 JSON 与 server 冻结常量漂移`,
      );
      assert.equal(
        matchedKeys.length,
        1,
        `${fileName}: text 节点命中多条冻结表条目（${matchedKeys.join(", ")}）——条目应唯一`,
      );
      console.log(`  ✓ ${fileName} → ${matchedKeys[0]}（mode=${operationMode}）`);
    } else {
      // video 模板：文本必须逐字命中 video-animate:edit（Seedance 协议文本）。
      const videoEntry = PRESET_TEMPLATE_TEXTS["video-animate:edit"];
      assert.ok(videoEntry, "冻结表缺少 video-animate:edit 条目");
      assert.equal(
        nodeText,
        videoEntry.text,
        `${fileName}: video 模板 text 与 video-animate:edit 冻结文本漂移`,
      );
      assert.equal(
        videoGenerators[0]?.data?.operationMode,
        "generate",
        `${fileName}: video 生成节点 operationMode 必须是 generate（视频生成轴）`,
      );
      console.log(`  ✓ ${fileName} → video-animate:edit（video 生成轴 operationMode=generate）`);
    }
  }
}
console.log(`\n3c-4：${builtinFiles.length} 个内置模板 JSON 与冻结表逐字一致 ✓`);