/**
 * 参考图解析（角色分组 / 单图清洗 / 质量闸 / 写回合并 / 冻结提示词）单元测试。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/reference-analysis.test.ts
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  classifyReferences,
  isUsableRoleAnalysis,
  MAX_ANALYZED_REFERENCES,
  sanitizeRoleAnalysis,
} from "../server/lib/referenceAnalyzer";
import { ROLE_PROMPTS } from "../server/lib/referenceAnalysisPrompt";
import { mergeAnalysisIntoPrompt } from "../src/lib/promptAnalysisMerge";

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

// ---------- 角色分组 ----------
ok("按名称识别角色，未识别的进 unmatched", () => {
  const result = classifyReferences([
    { order: 1, imageRef: "/a.png", label: "服装图" },
    { order: 2, imageRef: "/b.png", label: "数字模特" },
    { order: 3, imageRef: "/c.png", label: "素材1" },
    { order: 4, imageRef: "/d.png", label: "场景图" },
  ]);
  assert.deepEqual(result.matched.map((item) => [item.order, item.role]), [[1, "服装"], [2, "模特"], [4, "场景"]]);
  assert.deepEqual(result.unmatched, [{ order: 3, label: "素材1" }]);
  assert.equal(result.droppedCount, 0);
});

ok("最多只解析前 4 张，其余计入 droppedCount", () => {
  const result = classifyReferences([
    { order: 1, imageRef: "/1.png", label: "服装" },
    { order: 2, imageRef: "/2.png", label: "模特" },
    { order: 3, imageRef: "/3.png", label: "姿态" },
    { order: 4, imageRef: "/4.png", label: "场景" },
    { order: 5, imageRef: "/5.png", label: "服装" },
    { order: 6, imageRef: "/6.png", label: "模特" },
  ]);
  assert.equal(result.matched.length, MAX_ANALYZED_REFERENCES);
  assert.equal(result.droppedCount, 2);
});

ok("模板内置 id 优先于名称", () => {
  const result = classifyReferences([{ order: 1, imageRef: "/x.png", label: "素材1", sourceNodeId: "garment" }]);
  assert.equal(result.matched[0]?.role, "服装");
});

// ---------- 单图清洗 ----------
ok("清洗掉角色前缀、列表符、协议词与夸大词", () => {
  const raw = "- 图1（服装）：白色纯棉T恤，前后双车线，参考图1的版型，8K超高清。";
  const cleaned = sanitizeRoleAnalysis(raw, "服装");
  assert.ok(!cleaned.includes("图1"));
  assert.ok(!cleaned.includes("参考图"));
  assert.ok(!cleaned.includes("8K"));
  assert.ok(cleaned.startsWith("白色纯棉T恤") || cleaned.startsWith("：白色"));
  assert.ok(cleaned.length > 0);
});

ok("按角色截断到各自上限", () => {
  const long = "白色纯棉圆领短袖T恤，".repeat(40);
  for (const role of ["服装", "模特", "姿态", "场景"] as const) {
    const cleaned = sanitizeRoleAnalysis(long, role);
    assert.ok(cleaned.length <= ROLE_PROMPTS[role].maxChars, `${role} 超长: ${cleaned.length}`);
  }
});

ok("质量闸：过短判失败，正常长度通过", () => {
  assert.equal(isUsableRoleAnalysis("白色T恤。", "服装"), false);
  assert.equal(isUsableRoleAnalysis("纯白色圆领短袖T恤，常规直筒版型，哑光棉质针织面料，胸前有棕色小熊印花图案。", "服装"), true);
});

ok("质量闸：单图「不可辨识」出现两次以上判失败", () => {
  const text = "不可辨识，不可辨识，服装细节不可辨识";
  assert.equal(isUsableRoleAnalysis(text, "服装"), false);
});

// ---------- 写回合并 ----------
const ORIGINAL = "AI 换装模特试穿。图1=服装，图2=模特。\n补充要求：客户要夏天通勤风";
ok("写回替换补充段，协议段逐字保留", () => {
  const merged = mergeAnalysisIntoPrompt(ORIGINAL, "图1（服装）：纯白圆领T恤。");
  assert.equal(merged.changed, true);
  const head = ORIGINAL.slice(0, ORIGINAL.indexOf("补充要求：") + "补充要求：".length);
  assert.ok(merged.text.startsWith(head));
  assert.ok(!merged.text.includes("夏天通勤风"));
  assert.ok(merged.text.includes("图1（服装）：纯白圆领T恤。"));
});

ok("无锚点时不改写", () => {
  const merged = mergeAnalysisIntoPrompt("随便一句用户提示词", "图1（服装）：白色T恤。");
  assert.equal(merged.changed, false);
  assert.equal(merged.missingAnchor, true);
  assert.equal(merged.text, "随便一句用户提示词");
});

ok("解析为空时不改写", () => {
  const merged = mergeAnalysisIntoPrompt(ORIGINAL, "   ");
  assert.equal(merged.changed, false);
});

// ---------- 冻结提示词语义抽查 ----------
ok("四类角色各有专用提示词且覆盖关键维度", () => {
  assert.ok(ROLE_PROMPTS.服装.systemPrompt.includes("面料与光泽"));
  assert.ok(ROLE_PROMPTS.服装.systemPrompt.includes("结构细节"));
  assert.ok(ROLE_PROMPTS.模特.systemPrompt.includes("发型"));
  assert.ok(ROLE_PROMPTS.姿态.systemPrompt.includes("取景范围"));
  assert.ok(ROLE_PROMPTS.场景.systemPrompt.includes("光线"));
  // 「宁短勿杂」：单图上限不超过 150 字
  for (const spec of Object.values(ROLE_PROMPTS)) assert.ok(spec.maxChars <= 150);
});

ok("冻结提示词 sha256 快照", () => {
  const hash = createHash("sha256")
    .update(Object.values(ROLE_PROMPTS).map((spec) => spec.systemPrompt).join("\n---\n"), "utf8")
    .digest("hex");
  assert.equal(hash, "84f985fdff1c6898520ffd819be9b16cd3c06c47170ecfb59cf39716eec5c0c6");
});

console.log(`\n${passed} 项通过`);
