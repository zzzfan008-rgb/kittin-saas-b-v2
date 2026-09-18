import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { IMAGE_MODEL_IDS, getImageModelContract } from "../src/types/imageModels";

const plan = JSON.parse(readFileSync(
  resolve(process.cwd(), "docs/ai/evaluation/evaluation-plan-v2.json"),
  "utf8",
)) as {
  version: string;
  supersedes: string;
  status: string;
  fairComparison: {
    modelIds: string[];
    outputCount: number;
    businessAspectRatio: string;
    maximumReferenceImages: number;
    sameAssetsAndReferenceOrder: boolean;
    persistProviderOriginalAndPostprocessed: boolean;
    separateGenerateAndEdit: boolean;
  };
  scenarioAxes: Array<{ id: string; operationMode: string }>;
  capabilityExtensions: Array<Record<string, unknown> & { id: string; modelIds: string[] }>;
  rules: Record<string, boolean>;
};

assert.equal(plan.version, "garment-evaluation-plan-v2");
assert.equal(plan.supersedes, "garment-evaluation-plan-v1");
assert.equal(plan.status, "unverified-no-paid-runs");
assert.deepEqual(plan.fairComparison.modelIds, IMAGE_MODEL_IDS.filter((id) => id !== "gpt-image-2.5-sunburst"));
assert.equal(plan.fairComparison.outputCount, 1);
assert.equal(plan.fairComparison.businessAspectRatio, "1:1");
assert.equal(plan.fairComparison.maximumReferenceImages, 4);
assert.equal(plan.fairComparison.sameAssetsAndReferenceOrder, true);
assert.equal(plan.fairComparison.persistProviderOriginalAndPostprocessed, true);
assert.equal(plan.fairComparison.separateGenerateAndEdit, true);

assert.deepEqual(plan.scenarioAxes.map((axis) => axis.id), [
  "text-generate",
  "single-image-edit",
  "multi-image-role-isolation",
  "reference-order-permutation",
  "complex-material",
  "lace-and-print",
  "occlusion-and-nontarget-preservation",
]);
assert.ok(plan.scenarioAxes.every((axis) => axis.operationMode === "generate" || axis.operationMode === "edit"));

const extensions = new Map(plan.capabilityExtensions.map((extension) => [extension.id, extension]));
assert.deepEqual(extensions.get("five-to-eight-reference-images")?.modelIds, [
  "gpt-image-2.5-flare-vip",
  "gemini-3.1-flash-image",
  "flux-2-pro",
  "seedream-5-0-260128",
]);
for (const modelId of extensions.get("five-to-eight-reference-images")?.modelIds ?? []) {
  assert.ok(getImageModelContract(modelId as never).edit.maxReferences >= 8);
}
assert.equal(extensions.has("grok-native-multi-output"), false);
assert.deepEqual(extensions.get("gpt-image-2.5-sunburst-mask-edit")?.modelIds, ["gpt-image-2.5-sunburst"]);
assert.equal(getImageModelContract("gpt-image-2.5-sunburst").edit.maxUserReferences, 7);

for (const rule of [
  "fixedOperationMode",
  "noRetry",
  "stopOnOutcomeUnknown",
  "diagnosticApiIsNotProductAcceptance",
  "productAcceptanceUsesCanvasAndDag",
  "oldObservedResultsAreNotPassingEvidence",
]) assert.equal(plan.rules[rule], true, `${rule} must stay fail-closed`);

console.log("五模型 v2 评估轨道与扩展能力矩阵测试通过");
