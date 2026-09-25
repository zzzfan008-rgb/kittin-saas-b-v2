import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { resolve } from "node:path";
import { buildWorstCaseEvaluationBudget } from "../src/lib/evaluationBudget";
import { GARMENT_PROMPT_VARIANTS, type PromptVariant } from "../src/lib/garmentPromptPresets";
import {
  PROMPT_EVALUATION_THRESHOLDS,
  promptEvaluationUnitKey,
} from "../src/lib/promptEvaluation";
import { promptEvaluationReleaseVector } from "../src/lib/promptEvaluationRelease";
import { RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS } from "../src/lib/promptEvaluationReleaseRegistry";
import { getModelParameterProfile } from "../src/types/modelParameterProfiles";
import type {
  PromptEvaluationUnit,
  PromptEvaluationVersionVector,
} from "../src/types/promptEvaluation";
import { currentEvaluationPromotionTarget } from "../server/lib/evaluationPromotion";
import { EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS } from "../server/lib/evaluationCampaign";

const ROOT_DIR = resolve(fileURLToPath(new URL("..", import.meta.url)));
export const DEFAULT_EVALUATION_MANIFEST_PATH = resolve(
  ROOT_DIR,
  "docs/ai/evaluation/evaluation-manifest-v1.json",
);
const PLAN_PATH = resolve(ROOT_DIR, "docs/ai/evaluation/evaluation-plan-v2.json");

const EXPECTED_BASE_UNIT_COUNT = 41;
const EXPECTED_PILOT_UNIT_COUNT = 9;

export interface EvaluationManifestStageRequestCap {
  stageId: "provider-probe" | "internal-experiment" | "formal-validation" | "recommendation";
  incrementalSamples: number;
  maxProviderRequestsPerSample: number;
  requestsPerUnit: number;
}

/**
 * 已封账评估单元的 project locator（裁决 5-a1）。
 *
 * 放在单元条目层而不是 `unit` 内部，原因有三：
 * 1. `unit` 的类型是闭合的 `PromptEvaluationUnit`（9 个字段，无 projectId），
 *    tests/evaluation-manifest.test.ts:42 显式断言版本向量等不得污染 unit；
 * 2. `unit` 会被喂给 `promptEvaluationUnitKey`（legacy 9 字段身份）与封账 envelope，
 *    把 locator 放进去就等于让规划字段参与身份计算（验收 17 禁止）；
 * 3. seal 只需要它来定位真实 project flow（§7.7 范围过滤），与身份无关。
 *
 * 键是 unitId。只有进入付费 campaign 的两个在册单元需要 locator。
 */
const EVALUATION_PROJECT_LOCATORS: Readonly<Record<string, string>> = {
  "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1": "U7lK9XXlq1",
  "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1": "EVALeditv1F",
};

export interface EvaluationManifestUnit {
  unitId: string;
  /**
   * Locator only: the saved project whose flow the seal path reads to derive the
   * authorization unit key. Never part of any identity/envelope computation
   * (62-envelope-authority-ruling.md acceptance 17). Absent for units that are
   * catalogued but not part of the paid campaign scope.
   */
  projectId?: string;
  unit: PromptEvaluationUnit;
  versions: PromptEvaluationVersionVector;
  businessFrame: {
    aspectRatio: "1:1" | "3:4" | "4:3" | "source";
    requestedOutputs: 1;
  };
  /** SHA-256 of the canonical release vector without a code SHA. */
  releaseVectorSha256: `sha256:${string}`;
}

export interface EvaluationManifest {
  schemaVersion: 1;
  version: "garment-base-evaluation-manifest-v1";
  sourcePlanVersion: string;
  sourcePlanSha256: `sha256:${string}`;
  status: "planned-no-paid-runs";
  option: "A";
  authorization: {
    paidProviderCallsAuthorized: 0;
    requiresSeparatePerCaseAuthorization: true;
    codeShaBound: false;
  };
  evidencePolicy: {
    evidenceReuseAcrossUnits: false;
    evidenceReuseAcrossStages: false;
    automaticRetries: 0;
    supplementalSamplesPerStage: 0;
    invalidOrUnknownAction: "stop-and-require-new-authorization";
  };
  recommendationBaseline: {
    status: typeof RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS;
    detachedBaselineScoresAccepted: false;
    pairedCandidateBaselineCasesRequired: true;
  };
  paidCampaign: {
    status: typeof EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS;
    manifestIsExecutionAuthorization: false;
    immutableStageSlotsRequired: true;
    gateMustLoadCompleteCampaignFromLedger: true;
  };
  stageRequestCaps: EvaluationManifestStageRequestCap[];
  requestCaps: {
    perBaseUnitFullLifecycle: number;
    initialPilotConnectivity: number;
    initialPilotFullLifecycle: number;
    allBaseUnitsFullLifecycle: number;
  };
  representativeProbePilot: {
    status: "awaiting-separate-paid-authorization";
    selectionPolicy: "commerce-hero-minimum-reference-complexity-plus-gpt-image-2-mask";
    unitIds: string[];
    unselectedBaseUnitsRemainUnverified: true;
  };
  requiredBeforePaidRun: readonly [
    "clean-exact-code-sha",
    "sample-and-case-ids",
    "resolved-local-assets-and-sha256",
    "current-per-request-prices-and-currency",
    "immutable-campaign-stage-ledger",
    "explicit-per-case-authorizations",
  ];
  baseUnits: EvaluationManifestUnit[];
}

export interface EvaluationManifestSummary {
  version: string;
  baseUnits: number;
  representativeProbeUnits: number;
  unselectedBaseUnits: number;
  legalModelModePairs: number;
  perBaseUnitFullLifecycle: number;
  initialPilotConnectivity: number;
  initialPilotFullLifecycle: number;
  allBaseUnitsFullLifecycle: number;
  recommendationBaselineStatus: typeof RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS;
  paidCampaignStatus: typeof EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS;
  paidProviderCallsAuthorized: 0;
}

function sha256(value: string | Buffer): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function currentPlanIdentity(): { version: string; sha256: `sha256:${string}` } {
  const raw = readFileSync(PLAN_PATH);
  const value = JSON.parse(raw.toString("utf8")) as { version?: unknown };
  if (typeof value.version !== "string" || !value.version.trim()) {
    throw new Error("evaluation-plan-v2.json is missing a non-empty version");
  }
  return { version: value.version, sha256: sha256(raw) };
}

function stageRequestCaps(): EvaluationManifestStageRequestCap[] {
  const probeSamples = PROMPT_EVALUATION_THRESHOLDS["provider-probe"].exactDistinctSamples;
  const internalSamples = PROMPT_EVALUATION_THRESHOLDS["internal-experiment"].exactDistinctSamples;
  const formalSamples = PROMPT_EVALUATION_THRESHOLDS["formal-validation"].exactDistinctSamples;
  const recommendationSamples = PROMPT_EVALUATION_THRESHOLDS.recommendation.exactDistinctSamples;
  if (
    probeSamples === undefined
    || internalSamples === undefined
    || formalSamples === undefined
    || recommendationSamples === undefined
  ) {
    throw new Error("evaluation stage thresholds no longer define exact sample counts");
  }
  return [
    {
      stageId: "provider-probe",
      incrementalSamples: probeSamples,
      maxProviderRequestsPerSample: 1,
      requestsPerUnit: probeSamples,
    },
    {
      stageId: "internal-experiment",
      incrementalSamples: internalSamples,
      maxProviderRequestsPerSample: 1,
      requestsPerUnit: internalSamples,
    },
    {
      stageId: "formal-validation",
      incrementalSamples: formalSamples,
      maxProviderRequestsPerSample: 1,
      requestsPerUnit: formalSamples,
    },
    {
      stageId: "recommendation",
      incrementalSamples: recommendationSamples,
      maxProviderRequestsPerSample: 2,
      requestsPerUnit: recommendationSamples * 2,
    },
  ];
}

function currentBaseUnits(): EvaluationManifestUnit[] {
  // 按域分道：方案 A 的评估清单只物化 image 域变体（garment 评分规则 / 图像黄金集 /
  // 双层图像证据，见 docs/ai/evaluation/README.md）。text / video 域尚无评分规则与
  // 证据契约，不属于本清单——由各域后续评估设计另行覆盖。
  return GARMENT_PROMPT_VARIANTS
    .filter((variant) => variant.nodeKind === "image")
    .flatMap((variant) => {
      try {
        const target = currentEvaluationPromotionTarget(variant.variantId);
        const profile = getModelParameterProfile(variant.parameterProfileId);
        if (!profile) throw new Error(`missing parameter profile ${variant.parameterProfileId}`);
        return [{
          unitId: variant.variantId,
          // Locator only (acceptance 17): derived from EVALUATION_PROJECT_LOCATORS,
          // never fed into promptEvaluationUnitKey or the seal envelope.
          ...(EVALUATION_PROJECT_LOCATORS[variant.variantId] !== undefined
            ? { projectId: EVALUATION_PROJECT_LOCATORS[variant.variantId] }
            : {}),
          unit: target.unit,
          versions: target.versions,
          businessFrame: { ...profile.businessFrame },
          releaseVectorSha256: sha256(promptEvaluationReleaseVector(variant)),
        }];
      } catch {
        // variant is not yet covered by evaluation promotion (e.g. non-image
        // modelId or text/video domain) — skip without failing the manifest check
        return [];
      }
    });
}

function representativeProbeUnitIds(units: readonly EvaluationManifestUnit[]): string[] {
  return units
    .filter(({ unit }) => unit.taskFamilyId === "commerce-hero" || unit.operationMode === "mask-edit")
    .map(({ unitId }) => unitId);
}

function maximumProviderRequests(
  units: readonly EvaluationManifestUnit[],
  stages: readonly EvaluationManifestStageRequestCap[],
): number {
  if (units.length === 0) return 0;
  return buildWorstCaseEvaluationBudget(units.map(({ unitId, unit }) => ({
    unitId,
    modelId: unit.modelId,
    operationMode: unit.operationMode,
    currency: "REQUEST_COUNT",
    priceMinorPerProviderRequest: 0,
    stages: stages.map(({ stageId, incrementalSamples, maxProviderRequestsPerSample }) => ({
      stageId,
      incrementalSamples,
      maxProviderRequestsPerSample,
    })),
  }))).maximumProviderRequests;
}

export function createExpectedEvaluationManifest(): EvaluationManifest {
  const plan = currentPlanIdentity();
  const baseUnits = currentBaseUnits();
  const stages = stageRequestCaps();
  const pilotUnitIds = representativeProbeUnitIds(baseUnits);
  const pilotUnits = baseUnits.filter(({ unitId }) => pilotUnitIds.includes(unitId));
  const probe = stages.find(({ stageId }) => stageId === "provider-probe");
  if (!probe) throw new Error("provider-probe request cap is missing");
  return {
    schemaVersion: 1,
    version: "garment-base-evaluation-manifest-v1",
    sourcePlanVersion: plan.version,
    sourcePlanSha256: plan.sha256,
    status: "planned-no-paid-runs",
    option: "A",
    authorization: {
      paidProviderCallsAuthorized: 0,
      requiresSeparatePerCaseAuthorization: true,
      codeShaBound: false,
    },
    evidencePolicy: {
      evidenceReuseAcrossUnits: false,
      evidenceReuseAcrossStages: false,
      automaticRetries: 0,
      supplementalSamplesPerStage: 0,
      invalidOrUnknownAction: "stop-and-require-new-authorization",
    },
    recommendationBaseline: {
      status: RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS,
      detachedBaselineScoresAccepted: false,
      pairedCandidateBaselineCasesRequired: true,
    },
    paidCampaign: {
      status: EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS,
      manifestIsExecutionAuthorization: false,
      immutableStageSlotsRequired: true,
      gateMustLoadCompleteCampaignFromLedger: true,
    },
    stageRequestCaps: stages,
    requestCaps: {
      perBaseUnitFullLifecycle: maximumProviderRequests([baseUnits[0]!], stages),
      initialPilotConnectivity: pilotUnits.length * probe.requestsPerUnit,
      initialPilotFullLifecycle: maximumProviderRequests(pilotUnits, stages),
      allBaseUnitsFullLifecycle: maximumProviderRequests(baseUnits, stages),
    },
    representativeProbePilot: {
      status: "awaiting-separate-paid-authorization",
      selectionPolicy: "commerce-hero-minimum-reference-complexity-plus-gpt-image-2-mask",
      unitIds: pilotUnitIds,
      unselectedBaseUnitsRemainUnverified: true,
    },
    requiredBeforePaidRun: [
      "clean-exact-code-sha",
      "sample-and-case-ids",
      "resolved-local-assets-and-sha256",
      "current-per-request-prices-and-currency",
      "immutable-campaign-stage-ledger",
      "explicit-per-case-authorizations",
    ],
    baseUnits,
  };
}

function assertManifestInvariants(manifest: EvaluationManifest): EvaluationManifestSummary {
  const unitIds = manifest.baseUnits.map(({ unitId }) => unitId);
  const unitKeys = manifest.baseUnits.map(({ unit }) => promptEvaluationUnitKey(unit));
  if (manifest.baseUnits.length !== EXPECTED_BASE_UNIT_COUNT) {
    throw new Error(`expected ${EXPECTED_BASE_UNIT_COUNT} base units, got ${manifest.baseUnits.length}`);
  }
  if (new Set(unitIds).size !== unitIds.length || new Set(unitKeys).size !== unitKeys.length) {
    throw new Error("base evaluation unit IDs and exact unit keys must both be unique");
  }
  const pilotIds = manifest.representativeProbePilot.unitIds;
  if (pilotIds.length !== EXPECTED_PILOT_UNIT_COUNT || new Set(pilotIds).size !== pilotIds.length) {
    throw new Error(`representative pilot must contain ${EXPECTED_PILOT_UNIT_COUNT} unique units`);
  }
  if (pilotIds.some((unitId) => !unitIds.includes(unitId))) {
    throw new Error(`representative pilot contains a unit outside the ${EXPECTED_BASE_UNIT_COUNT}-unit base manifest`);
  }
  const pilotPairs = pilotIds.map((unitId) => {
    const unit = manifest.baseUnits.find((candidate) => candidate.unitId === unitId)?.unit;
    if (!unit) throw new Error(`pilot unit ${unitId} is missing`);
    return `${unit.modelId}\u0000${unit.operationMode}`;
  });
  const legalPairs = manifest.baseUnits.map(({ unit }) => `${unit.modelId}\u0000${unit.operationMode}`);
  if (new Set(pilotPairs).size !== EXPECTED_PILOT_UNIT_COUNT
    || !isDeepStrictEqual([...new Set(pilotPairs)].sort(), [...new Set(legalPairs)].sort())) {
    throw new Error("representative pilot must cover every legal model × mode pair exactly once");
  }
  if (manifest.authorization.paidProviderCallsAuthorized !== 0
    || manifest.authorization.codeShaBound
    || manifest.evidencePolicy.evidenceReuseAcrossUnits
    || manifest.evidencePolicy.evidenceReuseAcrossStages
    || manifest.evidencePolicy.automaticRetries !== 0
    || manifest.evidencePolicy.supplementalSamplesPerStage !== 0
    || manifest.recommendationBaseline.status !== RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS
    || manifest.recommendationBaseline.detachedBaselineScoresAccepted
    || !manifest.recommendationBaseline.pairedCandidateBaselineCasesRequired
    || manifest.paidCampaign.status !== EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS
    || manifest.paidCampaign.manifestIsExecutionAuthorization
    || !manifest.paidCampaign.immutableStageSlotsRequired
    || !manifest.paidCampaign.gateMustLoadCompleteCampaignFromLedger) {
    throw new Error("option A must remain zero-authority, no-retry, no-reuse, and zero-supplement");
  }
  return {
    version: manifest.version,
    baseUnits: manifest.baseUnits.length,
    representativeProbeUnits: pilotIds.length,
    unselectedBaseUnits: manifest.baseUnits.length - pilotIds.length,
    legalModelModePairs: new Set(legalPairs).size,
    ...manifest.requestCaps,
    recommendationBaselineStatus: manifest.recommendationBaseline.status,
    paidCampaignStatus: manifest.paidCampaign.status,
    paidProviderCallsAuthorized: 0,
  };
}

export function validateEvaluationManifest(value: unknown): EvaluationManifestSummary {
  // Ruling 62-envelope-authority-ruling.md acceptance 17: no manifest field may
  // participate in envelope/identity computation. The structural guarantee is
  // that `unit` stays a pure closed PromptEvaluationUnit — it is the object fed
  // to promptEvaluationUnitKey — while projectId lives at the entry level as a
  // locator only. Assert that here rather than stripping it away: stripping
  // would let a wrong or drifted projectId pass the check unnoticed, and seal
  // loads the real project flow from it.
  const parsed = value as EvaluationManifest;
  for (const entry of parsed.baseUnits ?? []) {
    if (Object.hasOwn(entry.unit ?? {}, "projectId")) {
      throw new Error(
        `baseUnit "${String(entry.unitId)}" carries projectId inside "unit". `
          + "projectId is a locator and must sit at the entry level: unit is the closed "
          + "9-field PromptEvaluationUnit fed to promptEvaluationUnitKey, so any extra "
          + "field there would make manifest planning data participate in identity "
          + "(ruling 62 acceptance 17).",
      );
    }
  }
  const expected = createExpectedEvaluationManifest();
  if (!isDeepStrictEqual(value, expected)) {
    throw new Error(
      "evaluation manifest does not exactly match the current prompt catalog, parameter profiles, "
      + "version vectors, plan hash, option-A pilot selection, request caps, or project locators",
    );
  }
  return assertManifestInvariants(parsed);
}

export function loadEvaluationManifest(
  manifestPath = DEFAULT_EVALUATION_MANIFEST_PATH,
): EvaluationManifest {
  return JSON.parse(readFileSync(manifestPath, "utf8")) as EvaluationManifest;
}

function parseManifestPath(args: readonly string[]): string {
  if (args.length === 0) return DEFAULT_EVALUATION_MANIFEST_PATH;
  if (args.length === 2 && args[0] === "--manifest") return resolve(args[1]!);
  throw new Error("Usage: tsx scripts/evaluation-manifest.ts [--manifest PATH | --print]");
}

function main(args: readonly string[]): void {
  if (args.length === 1 && args[0] === "--print") {
    process.stdout.write(`${JSON.stringify(createExpectedEvaluationManifest(), null, 2)}\n`);
    return;
  }
  const manifestPath = parseManifestPath(args);
  const summary = validateEvaluationManifest(loadEvaluationManifest(manifestPath));
  process.stdout.write(`${JSON.stringify({
    ok: true,
    manifestPath,
    ...summary,
  }, null, 2)}\n`);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
