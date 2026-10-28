/**
 * 参考图角色随请求下发（用户 2026-10-28 拍板）。
 *
 * 背景：模板里早就有「参考图1=服装，参考图2=模特」这种角色声明，但那只在**提示词正文**里，
 * 数据层的 references 只有 {dataUrl, order, sha256, sourceNodeId}——图与角色没有绑定，
 * 模型只能靠数组顺序自己对齐，这正是"顺序搞反"的空间。
 *
 * 现在：dag 按族规则推导 role → reference 携带 → gemini 逐图标签内联；
 * 其余（只能传数组的）模型由渲染层生成一行「参考图对应：图1=服装，图2=模特」。
 */
import assert from "node:assert/strict";

const { buildExecutionPlan } = await import("../server/engine/dag");
const { renderProviderPrompt } = await import("../src/lib/providerPromptRenderer");
const { tryonRoleOf } = await import("../src/lib/referenceOrder");

console.log("参考图角色下发");

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

const imageNode = (id: string, label: string, outputImages: string[]) => ({
  id, type: "image" as const,
  data: { kind: "image" as const, label, status: "idle" as const, outputImages },
});
const generatorNode = (extra: Record<string, unknown>) => ({
  id: "gen", type: "image-generator" as const,
  data: {
    kind: "image-generator" as const, label: "生成", status: "idle" as const,
    modelId: "gemini-3.1-flash-image", operationMode: "edit" as const, aspectRatio: "1:1", batchSize: 1,
    ...extra,
  },
});
const edge = (source: string, target: string, targetHandle: string) => ({ source, target, targetHandle });

ok("model-tryon：角色按族规则落到每张参考图上（连线顺序反了也能纠正）", () => {
  const plan = buildExecutionPlan(
    [imageNode("garment", "服装图", ["/api/files/a.png"]), imageNode("model", "数字模特", ["/api/files/b.png"]), generatorNode({ familyId: "model-tryon" })],
    // 故意先连模特再连服装：徽标与拼装都应按「服装在前」重排
    [edge("model", "gen", "reference"), edge("garment", "gen", "reference")],
  );
  const refs = plan.steps[0].inputReferences ?? [];
  assert.deepEqual(refs.map((reference) => reference.role), ["服装", "模特"]);
  assert.deepEqual(refs.map((reference) => reference.order), [0, 1]);
  assert.deepEqual(refs.map((reference) => reference.imageRef), ["/api/files/a.png", "/api/files/b.png"]);
});

ok("非 model-tryon 族不猜语义：role 不下发", () => {
  const plan = buildExecutionPlan(
    [imageNode("garment", "服装图", ["/api/files/a.png"]), generatorNode({ familyId: "print-extract" })],
    [edge("garment", "gen", "reference")],
  );
  assert.equal(plan.steps[0].inputReferences?.[0]?.role, undefined);
});

ok("tryonRoleOf 与徽标/拼装共用同一族规则", () => {
  assert.equal(tryonRoleOf("garment", ""), "服装");
  assert.equal(tryonRoleOf("model", ""), "模特");
  assert.equal(tryonRoleOf("x1", "服装细节"), "服装");
  assert.equal(tryonRoleOf("x2", "模特全身"), "模特");
  assert.equal(tryonRoleOf("x3", "随便"), undefined);
});

ok("只能传数组的模型：渲染层补一行角色映射", () => {
  const prompt = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gpt-image-2.5-flare",
    operationMode: "edit",
    taskPrompt: "换装协议",
    references: [{ role: "服装" }, { role: "模特" }],
  });
  assert.equal(prompt, "换装协议\n参考图对应：图1=服装，图2=模特");
});

ok("gemini：角色内联在逐图标签里，提示词不重复映射行", () => {
  const prompt = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gemini-3.1-flash-image",
    operationMode: "edit",
    taskPrompt: "换装协议",
    references: [{ role: "服装" }, { role: "模特" }],
  });
  assert.equal(prompt, "换装协议", "gemini 不得出现映射行（标签已内联）");
});

ok("无角色（普通族）：既不加映射行也不报错", () => {
  const prompt = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gpt-image-2.5-flare",
    operationMode: "edit",
    taskPrompt: "换装协议",
    references: [{}, {}],
  });
  assert.equal(prompt, "换装协议");
});

ok("蒙版路径不受影响：仍走蒙版模板且不追加映射行", () => {
  const prompt = renderProviderPrompt({
    nodeKind: "image",
    modelId: "gpt-image-2.5-sunburst",
    operationMode: "mask-edit",
    taskPrompt: "把袖口改成银色拉链",
    references: [{ role: "服装" }],
    needsMask: true,
  });
  assert.match(prompt, /^目标修改：把袖口改成银色拉链。/);
  assert.doesNotMatch(prompt, /参考图对应/);
});

console.log(`通过 ${passed} 项`);
