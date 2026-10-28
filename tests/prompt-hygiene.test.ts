/**
 * 产线提示词卫生门（用户 2026-10-28 拍板）：
 * 发给生图模型的提示词里不得残留任何协议脚手架或自指词——
 * 「用户补充要求（如为空则忽略本行）：」「参考图:参考图1、参考图2」「正文」。
 *
 * 为什么要有这道门：脚手架是给用户看的输入位标签/清单，对模型零信息量；
 * 补充为空时「如为空则忽略本行」更是一句悬空指令，会与真正的作图指令抢注意力。
 */
import assert from "node:assert/strict";

const { PRESET_TEMPLATE_TEXTS } = await import("../server/lib/promptPresetsFrozen");
const { renderProviderPrompt, sanitizeProviderTaskPrompt } = await import(
  "../src/lib/providerPromptRenderer"
);

console.log("产线提示词卫生");

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

/** 改写器的系统提示（发给文本模型，不是生图提示词），不参与本门禁。 */
const REWRITER_KEYS = new Set(["prompt-polish:edit", "prompt-generate:generate"]);
const FORBIDDEN = ["如为空则忽略本行", "参考图:", "正文", "补充要求："];

ok("全部生图预设渲染后不含脚手架/自指词", () => {
  const offenders: string[] = [];
  for (const [key, preset] of Object.entries(
    PRESET_TEMPLATE_TEXTS as Record<string, { text: string; mode: string }>,
  )) {
    if (REWRITER_KEYS.has(key)) continue;
    const rendered = renderProviderPrompt({
      nodeKind: "image",
      modelId: "gpt-image-2.5-flare",
      operationMode: preset.mode as never,
      taskPrompt: preset.text,
      references: [{}, {}],
    });
    for (const token of FORBIDDEN) {
      if (rendered.includes(token)) offenders.push(`${key} → 「${token}」`);
    }
  }
  assert.deepEqual(offenders, [], `以下预设仍带脚手架：\n${offenders.join("\n")}`);
});

ok("冻结表本身不再含旧长标记", () => {
  for (const [key, preset] of Object.entries(
    PRESET_TEMPLATE_TEXTS as Record<string, { text: string }>,
  )) {
    assert.ok(
      !preset.text.includes("用户补充要求（如为空则忽略本行）"),
      `${key} 仍含旧标记，应改为「补充要求：」`,
    );
  }
});

ok("补充为空：整行标记被丢弃，不留悬空行", () => {
  const cleaned = sanitizeProviderTaskPrompt("写实穿搭生成。三行描述。\n补充要求：");
  assert.equal(cleaned, "写实穿搭生成。三行描述。", "标记行必须整行消失且不留空行");
});

ok("补充非空：内容保留，标记行消失", () => {
  const cleaned = sanitizeProviderTaskPrompt("换装协议正文。\n补充要求：\n换成红色真丝");
  assert.ok(cleaned.includes("换成红色真丝"), "用户补充必须保留");
  assert.ok(!cleaned.includes("补充要求："), "标签行必须消失");
});

ok("旧草稿长标记同样被清除（向后兼容）", () => {
  const cleaned = sanitizeProviderTaskPrompt("旧协议。\n用户补充要求（如为空则忽略本行）：");
  assert.equal(cleaned, "旧协议。");
});

ok("自指词「正文」按协议词汇归一，不动用户描述", () => {
  assert.equal(
    sanitizeProviderTaskPrompt("按正文描述的场合，不与正文冲突"),
    "按补充要求描述的场合，不与补充要求冲突",
  );
  assert.equal(
    sanitizeProviderTaskPrompt("用户在正文中描述的动作"),
    "用户在补充要求中描述的动作",
  );
  // 普通中文里的「正文」不会被误伤成别的词（只有协议短语命中改写表）
  assert.equal(sanitizeProviderTaskPrompt("正文三个字"), "正文三个字");
});

ok("幂等：连续净化两次结果一致", () => {
  const once = sanitizeProviderTaskPrompt("协议。\n补充要求：\n红色");
  assert.equal(sanitizeProviderTaskPrompt(once), once);
});

console.log(`通过 ${passed} 项`);
