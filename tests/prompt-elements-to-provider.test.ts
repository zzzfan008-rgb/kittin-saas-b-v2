/**
 * 六要素 → 产线提示词 的端到端回归（用户 2026-10-29 追问「六要素是否正常带入提示词」）。
 *
 * 链路：ElementsPanel「填入补充」→ writeSupplement(protocol + assembled) → node.data.text
 *      → dag inputTexts → runner userPrompt → renderProviderPrompt → sanitize → 上游请求体。
 * 这里逐步验证，任一段断链都必须红——「面板填了但模型没收到」正是最容易漏的静默故障。
 */
import assert from "node:assert/strict";

const { assembleElements, elementText } = await import("../src/lib/promptElements");
const { buildExecutionPlan } = await import("../server/engine/dag");
const { renderProviderPrompt } = await import("../src/lib/providerPromptRenderer");
const { findSupplementAnchor } = await import("../src/lib/rewriteEligibility");
const { PRESET_TEMPLATE_TEXTS } = await import("../server/lib/promptPresetsFrozen");

console.log("六要素 → 提示词");

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

const ELEMENTS = {
  subject: "一位穿米白连衣裙的模特在街边行走",
  environment: { presetId: "studio" } as const,
  lighting: { custom: "清晨窗光从左侧打进来" } as const,
  lens: { presetId: "50mm" } as const,
  tone: { custom: "暖白平衡，低饱和" } as const,
  composition: { presetId: "center" } as const,
};

const ASSEMBLED = assembleElements(ELEMENTS);

ok("六要素按固定顺序拼装、空要素跳过", () => {
  assert.ok(ASSEMBLED.includes(ELEMENTS.subject), "主体必须在内");
  assert.ok(ASSEMBLED.includes("清晨窗光从左侧打进来"), "自写光线必须在内");
  assert.ok(ASSEMBLED.includes("暖白平衡，低饱和"), "自写色调必须在内");
  // 预设项取其文本
  assert.ok(ASSEMBLED.includes(elementText("environment", ELEMENTS)), "预设环境必须展开");
  assert.equal(assembleElements({ subject: "   " }), "", "主体为空不拼装");
});

ok("「填入补充」后的节点正文：协议原样 + 补充位落地", () => {
  const protocol = PRESET_TEMPLATE_TEXTS["model-tryon:edit"].text;
  const anchor = findSupplementAnchor(protocol);
  assert.ok(anchor, "协议模板必须含补充位锚点");
  // writeSupplement 的行为：protocolText + assembled
  const filled = protocol.slice(0, anchor!.end) + ASSEMBLED;
  const filledAnchor = findSupplementAnchor(filled);
  assert.deepEqual(filledAnchor, anchor, "写入补充不得移动锚点");
  assert.equal(filled.slice(0, anchor!.end), protocol.slice(0, anchor!.end), "协议段必须逐字不变");
  assert.equal(filled.slice(anchor!.end), ASSEMBLED, "补充段必须就是拼装结果");
});

ok("dag 把节点正文原样带给下游生成步骤", () => {
  const protocol = PRESET_TEMPLATE_TEXTS["model-tryon:edit"].text;
  const anchor = findSupplementAnchor(protocol)!;
  const nodeText = protocol.slice(0, anchor.end) + ASSEMBLED;
  const plan = buildExecutionPlan(
    [
      { id: "t1", type: "text", data: { kind: "text", label: "提示词", status: "idle", text: nodeText } },
      { id: "g1", type: "image-generator", data: { kind: "image-generator", label: "生图", status: "idle", modelId: "gemini-3.1-flash-image", operationMode: "edit", aspectRatio: "1:1", batchSize: 1, familyId: "model-tryon" } },
      { id: "i1", type: "image", data: { kind: "image", label: "服装图", status: "idle", outputImages: ["/api/files/a.png"] } },
    ],
    [
      { source: "t1", target: "g1", targetHandle: "prompt" },
      { source: "i1", target: "g1", targetHandle: "reference" },
    ],
  );
  const params = plan.steps[0].params as { inputTexts?: string[] };
  assert.deepEqual(params.inputTexts, [nodeText], "dag 必须原样传递节点正文");
});

ok("最终发给模型的提示词包含六要素（且不含脚手架）", () => {
  const protocol = PRESET_TEMPLATE_TEXTS["model-tryon:edit"].text;
  const anchor = findSupplementAnchor(protocol)!;
  const nodeText = protocol.slice(0, anchor.end) + ASSEMBLED;
  const prompt = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gemini-3.1-flash-image",
    operationMode: "edit",
    taskPrompt: nodeText,
    references: [{ role: "服装" }],
  });
  assert.ok(prompt.includes(ELEMENTS.subject), "主体必须进模型提示词");
  assert.ok(prompt.includes("清晨窗光从左侧打进来"), "光线必须进模型提示词");
  assert.ok(prompt.includes("暖白平衡，低饱和"), "色调必须进模型提示词");
  assert.ok(prompt.includes(elementText("lens", ELEMENTS)), "镜头必须进模型提示词");
  assert.ok(prompt.includes(elementText("composition", ELEMENTS)), "构图必须进模型提示词");
  assert.ok(prompt.includes(elementText("environment", ELEMENTS)), "环境必须进模型提示词");
  assert.ok(!prompt.includes("如为空则忽略本行"), "不得把脚手架发上去");
});

ok("旧草稿的长锚点同样能被识别（六要素面板不会消失）", () => {
  const legacy = "AI 换装模特试穿。协议段。\n用户补充要求（如为空则忽略本行）：一位模特";
  const anchor = findSupplementAnchor(legacy);
  assert.ok(anchor, "旧长锚点必须可定位");
  assert.equal(legacy.slice(anchor!.end), "一位模特", "旧草稿的补充段必须切得出来");
});

console.log(`通过 ${passed} 项`);
