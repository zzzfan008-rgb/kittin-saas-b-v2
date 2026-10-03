/**
 * 冻结提示词常量快照测试（64 Phase 1 / 裁决 E）。
 * 以 sha256 锁定 server/lib/promptPresetsFrozen.ts 每条文本与键集合，
 * 防止冻结表被无意改动（漂移 fail-closed）。文本源文件 Phase 3 删除后本测试仍有效。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/prompt-presets-frozen.test.ts
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  MODE_SYSTEM_TEXT,
  PRESET_TEMPLATE_TEXTS,
  FROZEN_PRESET_FAMILY_IDS,
  frozenPromptBindingForVariantId,
  modeSystemText,
  presetTemplateText,
} from "../server/lib/promptPresetsFrozen";

let passed = 0;
function ok(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

// 快照：MODE_SYSTEM_TEXT 每条文本 sha256（image/video × generate/edit/mask-edit）。
const MODE_SYSTEM_TEXT_SHA256: Record<string, string> = {
  "image.generate": EMPTY_SHA256,
  "image.edit": EMPTY_SHA256,
  "image.mask-edit": "920ce8fa929811ec24d889d94b5cbbf2c9cbf520676a2a3249c29d7e69359584",
  "video.generate": EMPTY_SHA256,
  "video.edit": "03eb58ffd8e4111fac6adf82cc525e5e34438e40411a997e62e5d61c2032d213",
  "video.mask-edit": EMPTY_SHA256,
};

// 快照：PRESET_TEMPLATE_TEXTS 每条文本 sha256（键 = `${familyId}:${mode}`）。
const PRESET_TEMPLATE_TEXTS_SHA256: Record<string, string> = {
  "fashion-lookbook:generate": "68e4712be141f9ffc8fc8a8fcaa8f0a57323830688d3f2fbb32533b81662332c",
  "fashion-lookbook:edit": "ef50e39cc527fc07fc58419b54f9ee72a0345a09cdf7bede7033b0db0a399d36",
  "commerce-hero:generate": "fec9a6aa5ccee11261344cc8be38f31f31a6414a3d3cb4fcd98419af48a64bb3",
  "commerce-hero:edit": "0d62719fd4050393afe861fa9c5365acfdfc0ee472ee81d209e571493b1f8050",
  "design-sheet:generate": "6a92a96d553981af2e98744d18fcb7f748217b0b76ebf90a773171d4038b9d95",
  "design-sheet:edit": "b9e29671caa7ee7111e03a5e250d17b81c72d53d8faa146b6551f914fa1d722e",
  "upscale:edit": "0727dbe20d04a2520551814954e4c92fda3077de30e86dec0608ed06c55db6b8",
  "print-extract:edit": "6792a0a53ac54d13658cae688639705f9811bd83b464f3fc9423a9b1f0648f55",
  "print-mutate:edit": "cd4cb5b909a8df99fce58b355f8411bc43e0ad4e4f61f808fae119355ce5730c",
  "fabric-recolor:edit": "1ff8b090df95fd4956d4e59bbe4566207ae775aedf5a62f41af3d6e0dcf98ef0",
  "mask-local-edit:mask-edit": "920ce8fa929811ec24d889d94b5cbbf2c9cbf520676a2a3249c29d7e69359584",
  "video-animate:edit": "03eb58ffd8e4111fac6adf82cc525e5e34438e40411a997e62e5d61c2032d213",
  "prompt-polish:edit": "2294316dfc5aa23cb63ea9baa80e6d924982bc001422957765aa1f2aa2031f51",
  "prompt-generate:generate": "55996590129a4b56e2a84e470411db7319b4be570d8dfd75a6bdeb0af02e17b8",
};

const EXPECTED_FAMILY_IDS = [
  "fashion-lookbook", "commerce-hero", "design-sheet", "upscale",
  "print-extract", "print-mutate", "fabric-recolor",
  "mask-local-edit", "video-animate", "prompt-polish", "prompt-generate",
];

const EXPECTED_PRESET_KEYS = [
  "fashion-lookbook:generate", "fashion-lookbook:edit",
  "commerce-hero:generate", "commerce-hero:edit",
  "design-sheet:generate", "design-sheet:edit",
  "upscale:edit", "print-extract:edit", "print-mutate:edit", "fabric-recolor:edit",
  "mask-local-edit:mask-edit", "video-animate:edit",
  "prompt-polish:edit", "prompt-generate:generate",
];

ok("键集合：FROZEN_PRESET_FAMILY_IDS 与快照一致（11 族）", () => {
  assert.deepEqual([...FROZEN_PRESET_FAMILY_IDS], EXPECTED_FAMILY_IDS);
});

ok("键集合：PRESET_TEMPLATE_TEXTS 与快照一致（14 条）", () => {
  assert.deepEqual(Object.keys(PRESET_TEMPLATE_TEXTS), EXPECTED_PRESET_KEYS);
});

ok("键集合：MODE_SYSTEM_TEXT 覆盖 image/video × 三模式", () => {
  assert.deepEqual(Object.keys(MODE_SYSTEM_TEXT).sort(), ["image", "video"]);
  for (const kind of ["image", "video"] as const) {
    assert.deepEqual(Object.keys(MODE_SYSTEM_TEXT[kind]).sort(), ["edit", "generate", "mask-edit"]);
  }
});

for (const [key, expected] of Object.entries(MODE_SYSTEM_TEXT_SHA256)) {
  ok(`快照：MODE_SYSTEM_TEXT.${key} 文本 hash 锁定`, () => {
    const [kind, mode] = key.split(".") as ["image" | "video", "generate" | "edit" | "mask-edit"];
    assert.equal(sha256(MODE_SYSTEM_TEXT[kind][mode]), expected);
  });
}

for (const [key, expected] of Object.entries(PRESET_TEMPLATE_TEXTS_SHA256)) {
  ok(`快照：PRESET_TEMPLATE_TEXTS["${key}"] 文本 hash 锁定`, () => {
    assert.equal(sha256(PRESET_TEMPLATE_TEXTS[key].text), expected);
  });
}

ok("generate 系统文本 = 空串（裁决 E，裸 API 零回归）", () => {
  assert.equal(MODE_SYSTEM_TEXT.image.generate, "");
  assert.equal(MODE_SYSTEM_TEXT.video.generate, "");
  assert.equal(MODE_SYSTEM_TEXT.image["mask-edit"] !== "", true);
});

ok("modeSystemText：非生成节点返回空串", () => {
  assert.equal(modeSystemText("text", "edit"), "");
  assert.equal(modeSystemText("result-image", "mask-edit"), "");
});

ok("presetTemplateText：已知项返回文本，未知项 undefined", () => {
  assert.equal(typeof presetTemplateText("print-extract", "edit"), "string");
  assert.equal(presetTemplateText("no-such-family", "edit"), undefined);
});

ok("frozenPromptBindingForVariantId：标准变体 id 解析（含 modelId 带点）", () => {
  const binding = frozenPromptBindingForVariantId("fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1");
  assert.ok(binding);
  assert.equal(binding.familyId, "fashion-lookbook");
  assert.equal(binding.mode, "edit");
  assert.equal(binding.text, PRESET_TEMPLATE_TEXTS["fashion-lookbook:edit"].text);
});

ok("frozenPromptBindingForVariantId：mask / video 变体 id 解析", () => {
  assert.equal(
    frozenPromptBindingForVariantId("mask-local-edit.gpt-image-2.5-sunburst.mask-edit.v1")?.mode,
    "mask-edit",
  );
  assert.equal(
    frozenPromptBindingForVariantId("video-animate.doubao-seedance-2-5-260628.edit.v1")?.familyId,
    "video-animate",
  );
});

ok("frozenPromptBindingForVariantId：未知族 / 坏 id / 非法 mode → undefined（丢弃绑定）", () => {
  assert.equal(frozenPromptBindingForVariantId("no-such-family.gpt-4o.edit.v1"), undefined);
  assert.equal(frozenPromptBindingForVariantId("garbage"), undefined);
  assert.equal(frozenPromptBindingForVariantId("fashion-lookbook.gpt-image-2.5-flare-vip.restyle.v1"), undefined);
  assert.equal(frozenPromptBindingForVariantId(""), undefined);
});

console.log(`\n${passed} 通过`);
