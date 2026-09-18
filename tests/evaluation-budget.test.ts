import assert from "node:assert/strict";
import {
  buildWorstCaseEvaluationBudget,
  type EvaluationBudgetStageInput,
  type EvaluationBudgetUnitInput,
} from "../src/lib/evaluationBudget";

const stagedCounts: readonly EvaluationBudgetStageInput[] = [
  { stageId: "provider-probe", incrementalSamples: 1, maxProviderRequestsPerSample: 1 },
  { stageId: "internal-experiment", incrementalSamples: 8, maxProviderRequestsPerSample: 1 },
  { stageId: "formal-validation", incrementalSamples: 24, maxProviderRequestsPerSample: 1 },
  // 候选与同模型基线成对，因此每样本按最多 2 次付费请求显式计入。
  { stageId: "recommendation", incrementalSamples: 50, maxProviderRequestsPerSample: 2 },
];

const budget = buildWorstCaseEvaluationBudget([
  {
    unitId: "gpt-image-2.5-flare-vip:fashion-lookbook:generate",
    modelId: "gpt-image-2.5-flare-vip",
    operationMode: "generate",
    currency: "CNY",
    priceMinorPerProviderRequest: 12,
    stages: stagedCounts,
  },
  {
    unitId: "gemini-3.1-flash-image:fashion-lookbook:edit",
    modelId: "gemini-3.1-flash-image",
    operationMode: "edit",
    currency: "CNY",
    priceMinorPerProviderRequest: 25,
    stages: stagedCounts,
  },
]);
assert.deepEqual(budget, {
  currency: "CNY",
  maximumProviderRequests: 266,
  worstCaseCostMinor: 4_921,
  units: [
    {
      unitId: "gpt-image-2.5-flare-vip:fashion-lookbook:generate",
      maximumProviderRequests: 133,
      worstCaseCostMinor: 1_596,
    },
    {
      unitId: "gemini-3.1-flash-image:fashion-lookbook:edit",
      maximumProviderRequests: 133,
      worstCaseCostMinor: 3_325,
    },
  ],
});

assert.throws(
  () => buildWorstCaseEvaluationBudget([{ ...({
    unitId: "missing-price",
    modelId: "gpt-image-2.5-flare-vip",
    operationMode: "generate",
    currency: "CNY",
    stages: stagedCounts,
  } as unknown as EvaluationBudgetUnitInput) }]),
  /priceMinorPerProviderRequest must be an explicit/,
);
assert.throws(() => buildWorstCaseEvaluationBudget([
  {
    unitId: "cny-unit",
    modelId: "gpt-image-2.5-flare-vip",
    operationMode: "generate",
    currency: "CNY",
    priceMinorPerProviderRequest: 1,
    stages: stagedCounts,
  },
  {
    unitId: "usd-unit",
    modelId: "gemini-3.1-flash-image",
    operationMode: "edit",
    currency: "USD",
    priceMinorPerProviderRequest: 1,
    stages: stagedCounts,
  },
]), /same non-empty currency/);

console.log("评估调用量与最坏成本离线预算测试通过");
