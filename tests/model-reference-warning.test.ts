/**
 * 模型参考图数量告警（用户 2026-10-28 定 P0）。
 *
 * 背景：flux-3-image 实测多图请求能带上参考图，但模型对「第几张图」辨识不稳定，
 * 会出现 status=succeeded 却张冠李戴的**静默错误**。故对 >1 张参考图给出非阻断告警，
 * 引导用户在多图场景改用 GPT2.5 快速/专业。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const { imageModelReferenceWarning } = await import("../src/types/imageModels");

const read = (rel: string) => readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), "utf8");

console.log("模型参考图数量告警");

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

ok("flux 单图不告警", () => {
  assert.equal(imageModelReferenceWarning("flux-3-image", 0), undefined);
  assert.equal(imageModelReferenceWarning("flux-3-image", 1), undefined);
});

ok("flux 多图给出告警，并指向替代模型", () => {
  const warning = imageModelReferenceWarning("flux-3-image", 2);
  assert.ok(warning, "2 张参考图必须告警");
  assert.match(warning!, /FLUX3/);
  assert.match(warning!, /GPT2\.5快速/);
  assert.equal(typeof imageModelReferenceWarning("flux-3-image", 8), "string", "上限张数同样告警");
});

ok("其它模型不受影响（当前无同类已知缺陷）", () => {
  for (const id of [
    "gpt-image-2.5-flare",
    "gpt-image-2.5-sunburst",
    "gemini-3.1-flash-image",
    "gemini-nano-banana-2.1",
    "qwen-image-3.0",
    "doubao-seedream-5-0-pro-260628",
  ] as const) {
    assert.equal(imageModelReferenceWarning(id, 3), undefined, `${id} 不应告警`);
  }
});

ok("面板把告警渲染成「⚠ …（仍可运行）」，且按参考图张数计算", () => {
  const panel = read("src/components/nodes/GeneratorParamsPanel.tsx");
  assert.match(panel, /imageModelReferenceWarning\(effModel, mediaSources\.length\)/, "必须按已连参考图张数计算");
  assert.match(panel, /referenceWarning \? \(/, "必须条件渲染");
  assert.match(panel, /⚠ \{referenceWarning\}（仍可运行）/, "文案口径需与既有非阻断告警一致");
});

console.log(`通过 ${passed} 项`);
