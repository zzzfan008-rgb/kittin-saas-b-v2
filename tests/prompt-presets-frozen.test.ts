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
  REWRITE_SYSTEM_PROMPTS,
  rewriteSystemPrompt,
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
  "image.generate": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "image.edit": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "image.mask-edit": "9623f4f460a21efad5eb4bbdc138c2c3a33f1c6f3b61a2d71ea9e77a7c2d9527",
  "video.generate": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "video.edit": "da0ffd1a8abecbff78e86dc79bfcfb41b2f8e142d38f2b6ef9f8ebf96b5e9335",
  "video.mask-edit": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
};

// 快照：PRESET_TEMPLATE_TEXTS 每条文本 sha256（键 = `${familyId}:${mode}`）。
const PRESET_TEMPLATE_TEXTS_SHA256: Record<string, string> = {
  "fashion-lookbook:generate": "1cade2d45df2ce7a0ddce28faf0291c5a07b71dbaf8609928cad32f7578e081f",
  "fashion-lookbook:edit": "d53d321b3c646a9db2fd19eedbe0e667fb6ec50cee4a6b9b869e81ef1f16f168",
  "upscale:edit": "0727dbe20d04a2520551814954e4c92fda3077de30e86dec0608ed06c55db6b8",
  "print-extract:edit": "6ad59f3b1d8b2107baaa745952d42cf5b231842a76348fa88d6aac28019bd220",
  "print-mutate:edit": "85bd164fd0352426373dca23c498d548ca43d7ce21928ed5287f65efacb9f889",
  "fabric-recolor:edit": "f206795ca802db450492dbfafc6fba80b2601c4eea2943e76d31c084bad0d48a",
  "mask-local-edit:mask-edit": "9623f4f460a21efad5eb4bbdc138c2c3a33f1c6f3b61a2d71ea9e77a7c2d9527",
  "video-animate:edit": "da0ffd1a8abecbff78e86dc79bfcfb41b2f8e142d38f2b6ef9f8ebf96b5e9335",
  "video-runway:edit": "70b8e99003bb3fa2072352f81e7ee52645cd4020a1679b60e543b08e7c5cdc01",
  "video-xhs:edit": "37ffcec1fc6b57503b14e424cc139a4f066423e267ab528e103f25bc4b74095e",
  "prompt-polish:edit": "2294316dfc5aa23cb63ea9baa80e6d924982bc001422957765aa1f2aa2031f51",
  "prompt-generate:generate": "55996590129a4b56e2a84e470411db7319b4be570d8dfd75a6bdeb0af02e17b8",
  "model-tryon:edit": "db1dd53d3093f1f4114f9e044df80907880e8235dcab4e20b8f9e815b7b158e8",
  "pose-shot:edit": "ec2a1476b35d2871c56e11c4b9f5021dab37de553a5d0c9f1e5c49f4965498d5",
  "background-swap:edit": "0b3d91515f04b76e22811ba19df707feef34518b66d85a963a2c98577fc9cad1",
  "digital-model:edit": "e58510948b4d1d1dacaabc7e8846176d14f9a210a6f047c050d5cfa86939f5d9",
  "fabric-swap:edit": "fac4692ca71b62acad6dcd74e43918328f54743485ff61956ead4d7094797148",
  "sketch-to-garment:edit": "83e04cc7042f74858e9c7bea4cca6280edc1b384b04c6eb02610396b36b610a9",
  "ai-restyle:edit": "85a72188417bb11bd8f0ae3b775ace041a883b2a945cd24b14c7f332b8053a5c",
  "person-to-mannequin:edit": "bd577fe5dd2d276a6e36382071bc927d160a18a857309ab7b77ea7e40cdc1e93",
};

const EXPECTED_FAMILY_IDS = [
  "fashion-lookbook",
  "upscale",
  "print-extract",
  "print-mutate",
  "fabric-recolor",
  "mask-local-edit",
  "video-animate",
  "video-runway",
  "video-xhs",
  "prompt-polish",
  "prompt-generate",
  "model-tryon",
  "pose-shot",
  "background-swap",
  "digital-model",
  "fabric-swap",
  "sketch-to-garment",
  "ai-restyle",
  "person-to-mannequin",
];

const EXPECTED_PRESET_KEYS = [
  "fashion-lookbook:generate",
  "fashion-lookbook:edit",
  "upscale:edit",
  "print-extract:edit",
  "print-mutate:edit",
  "fabric-recolor:edit",
  "mask-local-edit:mask-edit",
  "video-animate:edit",
  "video-runway:edit",
  "video-xhs:edit",
  "prompt-polish:edit",
  "prompt-generate:generate",
  "model-tryon:edit",
  "pose-shot:edit",
  "background-swap:edit",
  "digital-model:edit",
  "fabric-swap:edit",
  "sketch-to-garment:edit",
  "ai-restyle:edit",
  "person-to-mannequin:edit",
];

ok("键集合：FROZEN_PRESET_FAMILY_IDS 与快照一致（19 族）", () => {
  assert.deepEqual([...FROZEN_PRESET_FAMILY_IDS], EXPECTED_FAMILY_IDS);
});

ok("键集合：PRESET_TEMPLATE_TEXTS 与快照一致（20 条）", () => {
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
  const binding = frozenPromptBindingForVariantId("fashion-lookbook.gpt-image-2.5-flare.edit.v1");
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
  assert.equal(frozenPromptBindingForVariantId("fashion-lookbook.gpt-image-2.5-flare.restyle.v1"), undefined);
  assert.equal(frozenPromptBindingForVariantId(""), undefined);
});

// 快照：提示词改写层 REWRITE_SYSTEM_PROMPTS 每条文本 sha256（2026-10-12 拍板，逐字冻结）。
const REWRITE_SYSTEM_PROMPTS_SHA256: Record<string, string> = {
  "default": "c43357148a16b64ab9bbd94fd75ac0568048a008612b94375fcc296c235a5beb",
  "model-tryon": "c7bde1799035d2bbfe22e83f6f3e15b333811218fc705499f5c2e9c031e68fe8",
  "model-tryon-supplement": "0d79b8b503422ae61ffaa3faa2666c9d0a40a16cb124fb6d2cfb1d344820e06f",
};

ok("键集合：REWRITE_SYSTEM_PROMPTS 与快照一致（default + model-tryon + model-tryon-supplement）", () => {
  assert.deepEqual(Object.keys(REWRITE_SYSTEM_PROMPTS).sort(), Object.keys(REWRITE_SYSTEM_PROMPTS_SHA256).sort());
});

for (const [key, expected] of Object.entries(REWRITE_SYSTEM_PROMPTS_SHA256)) {
  ok(`快照：REWRITE_SYSTEM_PROMPTS["${key}"] 文本 hash 锁定（拍板逐字，不得改措辞）`, () => {
    assert.equal(sha256(REWRITE_SYSTEM_PROMPTS[key]), expected);
  });
}

ok("rewriteSystemPrompt：undefined/未知族落 default；model-tryon 命中专用条（保护冻结协议）", () => {
  assert.equal(rewriteSystemPrompt(undefined), REWRITE_SYSTEM_PROMPTS.default);
  assert.equal(rewriteSystemPrompt("not-a-family"), REWRITE_SYSTEM_PROMPTS.default);
  assert.equal(rewriteSystemPrompt("model-tryon"), REWRITE_SYSTEM_PROMPTS["model-tryon"]);
  assert.match(REWRITE_SYSTEM_PROMPTS["model-tryon"], /冻结协议部分必须逐字原样保留/);
  for (const banned of ["8K", "杰作", "大师级", "完美光线", "超高清"]) {
    assert.match(REWRITE_SYSTEM_PROMPTS.default, new RegExp(banned));
  }
});

console.log(`\n${passed} 通过`);
