import assert from "node:assert/strict";
import {
  assembleElements,
  ELEMENT_DEFS,
  ELEMENT_ORDER,
  ELEMENT_SLOT_COUNT,
  elementText,
  filledElementCount,
  missingElementLabels,
  rateElement,
  removeEmptyQualityWords,
  scanPromptRisks,
} from "../src/lib/promptElements";

// 拼装顺序固定（环境→光线→镜头→色调→构图），空要素跳过；主体已移出面板。
{
  const assembled = assembleElements({
    environment: { presetId: "micro-cement" },
    lighting: undefined,
    lens: { presetId: "macro85" },
    tone: undefined,
    composition: { custom: "人物居右，左侧留白" },
  });
  assert.ok(assembled.startsWith("浅灰色微水泥台面"), `顺序/文案不对：${assembled}`);
  assert.ok(assembled.includes("85mm微距，f/5.6"), "镜头预设文案未拼入");
  assert.ok(assembled.endsWith("人物居右，左侧留白"), "custom 未拼入");
  assert.ok(!assembled.includes("伦勃朗") && !assembled.includes("白平衡"), "空要素未跳过");
}

// 五维全空 → 返回 ""（调用方禁用填入）。旧草稿的 subject 不再参与拼装。
{
  assert.equal(assembleElements({}), "");
  assert.equal(assembleElements({ subject: "旧草稿里的主体" }), "", "subject 已不参与拼装");
}

// custom 覆盖 preset（自写优先）。
{
  assert.equal(
    elementText("environment", { environment: { custom: "酒吧 neon 灯" } }),
    "酒吧 neon 灯",
  );
}

// 判定：preset=ok，自写过短=vague，空=empty。
{
  const els = { environment: { presetId: "studio" }, lighting: { custom: "亮" } } as never;
  assert.equal(rateElement("environment", els), "ok");
  assert.equal(rateElement("lighting", els), "vague");
  assert.equal(rateElement("tone", els), "empty");
}

// 计数与缺失列表（5 个槽位）。
{
  const els = { environment: { presetId: "studio" } };
  assert.equal(filledElementCount(els), 1);
  assert.deepEqual(missingElementLabels(els), ["光线", "镜头与视角", "色调与介质", "构图"]);
  assert.equal(ELEMENT_SLOT_COUNT, 5);
}

// 预设表：五维各 4 预设；顺序固定且不含主体。
{
  assert.deepEqual(ELEMENT_ORDER, ["environment", "lighting", "lens", "tone", "composition"]);
  assert.ok(!(ELEMENT_ORDER as readonly string[]).includes("subject"), "主体必须已从面板要素中移除");
  for (const def of ELEMENT_DEFS) assert.equal(def.presets.length, 4, `${def.key} 预设不足 4`);
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
