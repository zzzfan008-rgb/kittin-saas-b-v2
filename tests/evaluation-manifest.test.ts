import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createExpectedEvaluationManifest,
  loadEvaluationManifest,
  validateEvaluationManifest,
  type EvaluationManifest,
} from "../scripts/evaluation-manifest";
import { GARMENT_PROMPT_VARIANTS } from "../src/lib/garmentPromptPresets";
import { evaluatePromptEvaluationGate, promptEvaluationUnitKey } from "../src/lib/promptEvaluation";
import { IMAGE_MODEL_IDS } from "../src/types/imageModels";
import { MODEL_PARAMETER_PROFILES } from "../src/types/modelParameterProfiles";
import type { PromptEvaluationAttempt } from "../src/types/promptEvaluation";

const manifest = loadEvaluationManifest();
const summary = validateEvaluationManifest(manifest);

assert.deepEqual(summary, {
  version: "garment-base-evaluation-manifest-v1",
  baseUnits: 41,
  representativeProbeUnits: 9,
  unselectedBaseUnits: 32,
  legalModelModePairs: 9,
  perBaseUnitFullLifecycle: 133,
  initialPilotConnectivity: 9,
  initialPilotFullLifecycle: 1_197,
  allBaseUnitsFullLifecycle: 5_453,
  recommendationBaselineStatus: "blocked-pending-reviewed-definition",
  paidCampaignStatus: "ready",
  paidProviderCallsAuthorized: 0,
});
assert.deepEqual(manifest, createExpectedEvaluationManifest(), "静态清单必须精确绑定当前代码与计划");

const units = manifest.baseUnits.map(({ unit }) => unit);
assert.equal(units.filter(({ operationMode }) => operationMode === "generate").length, 12);
assert.equal(units.filter(({ operationMode }) => operationMode === "edit").length, 28);
assert.equal(units.filter(({ operationMode }) => operationMode === "mask-edit").length, 1);
assert.ok((units as unknown as Array<Record<string, unknown>>)
  .every((unit) => unit.referenceRoleProfile === undefined));
const maskUnit = units.find(({ operationMode }) => operationMode === "mask-edit");
assert.equal(Object.hasOwn(maskUnit ?? {}, "versions"), false, "版本向量只存放在单元外层，不污染 PromptEvaluationUnit");

assert.equal(new Set(units.map(promptEvaluationUnitKey)).size, 41);
assert.ok(manifest.baseUnits.every(({ releaseVectorSha256 }) => /^sha256:[a-f0-9]{64}$/.test(releaseVectorSha256)));
assert.ok(manifest.baseUnits.every(({ unit }) => unit.modelId !== ("grok-imagine-image" as never)));
assert.ok(manifest.baseUnits.every(({ unit }) => unit.nodeKind === "image"), "R-62：text/video 域排除出图片评估清单");
const imageVariantModelIds = [...new Set(GARMENT_PROMPT_VARIANTS.filter(({ nodeKind }) => nodeKind === "image").map(({ modelId }) => modelId))].sort();
assert.deepEqual(
  [...new Set(units.map(({ modelId }) => modelId))].sort(),
  imageVariantModelIds,
  "基础单元必须精确覆盖当前有图片提示词变体的模型集合",
);
assert.deepEqual(
  Object.fromEntries(imageVariantModelIds.map((modelId) => [
    modelId,
    units.filter((unit) => unit.modelId === modelId).length,
  ])),
  {
    "gpt-image-2.5-sunburst": 1,
    "gpt-image-2.5-flare-vip": 10,
    "gemini-3.1-flash-image": 10,
    "flux-2-pro": 10,
    "seedream-5-0-260128": 10,
  },
  "基础单元分布必须保持四个普通模型各 10 个（三任务族 generate/edit 6 条 + 四功能族 edit 4 条）、GPT Image 2 为 1 个（10+10+10+10+1）",
);

const manifestVariantIds = manifest.baseUnits.map(({ unit }) => unit.promptVariantId);
const manifestParameterProfileIds = manifest.baseUnits.map(({ unit }) => unit.parameterProfileId);
assert.equal(new Set(manifestVariantIds).size, 41);
assert.equal(new Set(manifestParameterProfileIds).size, 41);
const imageVariantIds = GARMENT_PROMPT_VARIANTS.filter(({ nodeKind }) => nodeKind === "image").map(({ variantId }) => variantId);
assert.deepEqual(
  [...manifestVariantIds].sort(),
  [...imageVariantIds].sort(),
  "41 个基础单元必须与 41 个图片域提示词变体双向一一对应（R-62：text/video 变体不进本清单）",
);
assert.deepEqual(
  [...manifestParameterProfileIds].sort(),
  MODEL_PARAMETER_PROFILES.map(({ profileId }) => profileId).sort(),
  "41 个基础单元必须与 41 个参数档案双向一一对应",
);
for (const { unit } of manifest.baseUnits) {
  const variant = GARMENT_PROMPT_VARIANTS.find(({ variantId }) => variantId === unit.promptVariantId);
  assert.equal(variant?.parameterProfileId, unit.parameterProfileId);
}

const pilotUnits = manifest.representativeProbePilot.unitIds.map((unitId) => {
  const selected = manifest.baseUnits.find((candidate) => candidate.unitId === unitId);
  assert.ok(selected, `${unitId} 必须属于基础清单`);
  return selected;
});
assert.ok(pilotUnits.every(({ unit }) => (
  unit.operationMode === "mask-edit" || unit.taskFamilyId === "commerce-hero"
)));
assert.equal(new Set(pilotUnits.map(({ unit }) => `${unit.modelId}\u0000${unit.operationMode}`)).size, 9);

function changed(mutator: (draft: EvaluationManifest) => void): EvaluationManifest {
  const draft = structuredClone(manifest);
  mutator(draft);
  return draft;
}

for (const invalid of [
  changed((draft) => { draft.evidencePolicy.evidenceReuseAcrossUnits = true as false; }),
  changed((draft) => { draft.evidencePolicy.evidenceReuseAcrossStages = true as false; }),
  changed((draft) => { draft.evidencePolicy.automaticRetries = 1 as 0; }),
  changed((draft) => { draft.evidencePolicy.supplementalSamplesPerStage = 1 as 0; }),
  changed((draft) => { draft.recommendationBaseline.detachedBaselineScoresAccepted = true as false; }),
  changed((draft) => { draft.recommendationBaseline.pairedCandidateBaselineCasesRequired = false as true; }),
  changed((draft) => { draft.stageRequestCaps[3]!.maxProviderRequestsPerSample = 1; }),
  changed((draft) => { draft.requestCaps.allBaseUnitsFullLifecycle = 5_452; }),
  changed((draft) => { draft.representativeProbePilot.unitIds.pop(); }),
  changed((draft) => { draft.baseUnits.pop(); }),
]) {
  assert.throws(
    () => validateEvaluationManifest(invalid),
    /does not exactly match/,
    "任何复用、重试、补样、少算基线或单位缺失都必须使离线门禁失败",
  );
}

const source = readFileSync(resolve(process.cwd(), "scripts/evaluation-manifest.ts"), "utf8");
assert.doesNotMatch(source, /from\s+["'](?:undici|node:https|node:http)["']/);
assert.doesNotMatch(source, /\bfetch\s*\(/);

const sourceUnit = manifest.baseUnits.find(({ unitId }) => (
  unitId === "commerce-hero.gpt-image-2.5-flare-vip.generate.v1"
));
const targetUnit = manifest.baseUnits.find(({ unitId }) => (
  unitId === "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1"
));
assert.ok(sourceUnit);
assert.ok(targetUnit);
assert.equal(sourceUnit.unit.modelId, targetUnit.unit.modelId, "反例必须锁定同一个模型");
assert.equal(sourceUnit.unit.operationMode, targetUnit.unit.operationMode, "反例必须锁定同一种模式");
assert.notEqual(sourceUnit.unit.taskFamilyId, targetUnit.unit.taskFamilyId);
const crossUnitAttempt: PromptEvaluationAttempt = {
  attemptId: "manifest-no-reuse-proof",
  unitKey: promptEvaluationUnitKey(sourceUnit.unit),
  sampleId: "pilot-connectivity-01",
  requestSnapshotSha256: "a".repeat(64),
  outcome: "succeeded",
  versions: targetUnit.versions,
  recentRequest: true,
  providerOriginal: {
    evidenceId: "manifest-provider-original",
    layer: "provider-original",
    artifactSha256: "b".repeat(64),
    mimeType: "image/png",
    width: 1,
    height: 1,
    storageRef: "test-only/provider.png",
    capturedAt: "2026-09-03T00:00:00.000Z",
  },
};
const noReuseGate = evaluatePromptEvaluationGate({
  unit: targetUnit.unit,
  stage: "provider-probe",
  contractVerified: true,
  passedStages: ["contract"],
  attempts: [crossUnitAttempt],
  currentVersions: targetUnit.versions,
  baselineVersions: targetUnit.versions,
});
assert.equal(noReuseGate.passed, false);
assert.ok(noReuseGate.hardBlockers.some(({ code, detail }) => (
  code === "evidence-integrity-failure" && detail === "Attempt belongs to a different evaluation unit."
)));

console.log("方案 A 的 41 基础单元、9 探针与零付费预算清单测试通过");
