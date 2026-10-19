import assert from "node:assert/strict";
import {
  assembleElements,
  ELEMENT_DEFS,
  ELEMENT_ORDER,
  elementText,
  filledElementCount,
  missingElementLabels,
  rateElement,
  removeEmptyQualityWords,
  scanPromptRisks,
} from "../src/lib/promptElements";

// 拼装顺序固定 1→6，空要素跳过。
{
  const assembled = assembleElements({
    subject: "红色针织开衫",
    environment: { presetId: "micro-cement" },
    lighting: undefined,
    lens: { presetId: "macro85" },
    tone: undefined,
    composition: { custom: "人物居右，左侧留白" },
  });
  assert.ok(assembled.startsWith("红色针织开衫，浅灰色微水泥台面"), `顺序/文案不对：${assembled}`);
  assert.ok(assembled.includes("85mm微距，f/5.6"), "镜头预设文案未拼入");
  assert.ok(assembled.endsWith("人物居右，左侧留白"), "custom 未拼入");
  assert.ok(!assembled.includes("伦勃朗") && !assembled.includes("白平衡"), "空要素未跳过");
}

// 主体为空 → 返回 ""（调用方禁用填入）。
{
  assert.equal(assembleElements({ subject: "  " }), "");
}

// custom 覆盖 preset（自写优先）。
{
  assert.equal(
    elementText("environment", { subject: "x", environment: { custom: "酒吧 neon 灯" } }),
    "酒吧 neon 灯",
  );
}

// 判定：preset=ok，自写过短=vague，空=empty。
{
  const els = { subject: "红裙", environment: { presetId: "studio" }, lighting: { custom: "亮" } } as never;
  assert.equal(rateElement("environment", els), "ok");
  assert.equal(rateElement("lighting", els), "vague");
  assert.equal(rateElement("tone", els), "empty");
  assert.equal(rateElement("subject", { subject: "红色针织开衫" }), "ok");
  assert.equal(rateElement("subject", { subject: "裙" }), "vague");
}

// 计数与缺失列表。
{
  const els = { subject: "红裙", environment: { presetId: "studio" } };
  assert.equal(filledElementCount(els), 2);
  assert.deepEqual(missingElementLabels(els), ["光线", "镜头与视角", "色调与介质", "构图"]);
}

// 预设表：主体无预设，其余各 4 预设；顺序 1→6。
{
  assert.deepEqual(ELEMENT_ORDER, ["subject", "environment", "lighting", "lens", "tone", "composition"]);
  assert.equal(ELEMENT_DEFS[0].presets.length, 0);
  for (const def of ELEMENT_DEFS.slice(1)) assert.equal(def.presets.length, 4, `${def.key} 预设不足 4`);
}

// 风险扫描五项。
{
  const risks = scanPromptRisks("超高清画质，把这个改成黑色再去掉背景，加标题");
  const ids = risks.map((r) => r.id);
  assert.ok(ids.includes("empty-quality-words"), "空泛词未检出");
  assert.ok(ids.includes("multi-edit"), "多编辑动作未检出");
  assert.ok(ids.includes("vague-ref"), "指代词未检出");
  assert.ok(ids.includes("text-declare"), "文字声明未检出");
  assert.deepEqual(scanPromptRisks("红色针织开衫，左上柔光"), [], "干净文本误报");
  const res = scanPromptRisks("输出4K分辨率");
  assert.ok(res.some((r) => r.id === "resolution"), "分辨率写法未检出");
}

// 一键删除空泛词。
{
  assert.equal(removeEmptyQualityWords("红裙，超高清画质，柔光"), "红裙，柔光");
}

console.log("六要素拼装/判定/风险 契约测试通过");
