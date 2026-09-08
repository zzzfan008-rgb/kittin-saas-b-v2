import type { ImageModelId } from "./imageModels";
import type { NodeKind, ReferenceRole } from "./workflow";

export type EvaluationNodeKind = Exclude<NodeKind, "image-input" | "result">;

export type EvaluationOperationMode = "generate" | "edit" | "mask-edit";

export type EvaluationReferenceRole = ReferenceRole | "mask";

/**
 * Exact ordered Provider-input role profile. `order` is zero-based and must
 * match the array position; duplicates are meaningful and are never collapsed.
 */
export interface EvaluationReferenceRoleProfileEntry {
  order: number;
  role: EvaluationReferenceRole;
}

/**
 * The smallest independently evaluated and releasable prompt/model combination.
 * A result from one unit must never be reused as evidence for another unit.
 */
export interface PromptEvaluationUnit {
  taskFamilyId: string;
  promptVariantId: string;
  presetId: string;
  presetVersion: string;
  nodeKind: EvaluationNodeKind;
  modelId: ImageModelId;
  operationMode: EvaluationOperationMode;
  referenceRoleProfile: readonly EvaluationReferenceRoleProfileEntry[];
  parameterProfileId: string;
  parameterProfileVersion: string;
}

export type PromptEvaluationStage =
  | "contract"
  | "provider-probe"
  | "internal-experiment"
  | "formal-validation"
  | "recommendation";

export type PromptSupportLevel =
  | "unsupported"
  | "unverified"
  | "experimental"
  | "verified"
  | "recommended";

export interface PromptEvaluationVersionVector {
  presetVersion: string;
  parameterProfileVersion: string;
  providerContractVersion: string;
  resolvedModelVersion: string;
  providerPromptRendererVersion: string;
  providerPromptRendererHash: string;
  inputNormalizationVersion: string;
  postprocessingVersion: string;
  goldenSetVersion: string;
  scoringRubricVersion: string;
}

export type PromptScoreCriterion =
  | "garmentMaterialFidelity"
  | "instructionFollowing"
  | "referenceRoleFidelity"
  | "artifactControl"
  | "commercialUsability";

export type PromptEvaluationScores = Record<PromptScoreCriterion, number>;

export interface PromptEvaluationScoreResult {
  weightedScore: number;
  minimumCriterionScore: number;
  scores: PromptEvaluationScores;
}

export type EvaluationHardBlockerCode =
  | "capability-unsupported"
  | "contract-mismatch"
  | "missing-provider-original"
  | "missing-postprocessed-output"
  | "reference-role-bleed"
  | "garment-identity-corruption"
  | "duplicate-billing"
  | "unsafe-output"
  | "rights-or-safety"
  | "evidence-integrity-failure"
  | "outcome-unknown"
  | "version-drift";

export interface EvaluationHardBlocker {
  code: EvaluationHardBlockerCode;
  detail: string;
  attemptId?: string;
  evidenceIds?: readonly string[];
}

interface EvaluationImageEvidenceBase {
  evidenceId: string;
  artifactSha256: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  storageRef: string;
  capturedAt: string;
}

export interface ProviderOriginalEvidence extends EvaluationImageEvidenceBase {
  layer: "provider-original";
}

export interface PostprocessedEvidence extends EvaluationImageEvidenceBase {
  layer: "postprocessed";
  sourceEvidenceId: string;
  pipelineVersion: string;
}

export type ProviderCallOutcome =
  | "succeeded"
  | "transient-not-billed"
  | "deterministic-failure"
  | "billed-failure"
  | "outcome_unknown";

export interface PromptEvaluationAttempt {
  attemptId: string;
  unitKey: string;
  sampleId: string;
  requestSnapshotSha256: string;
  outcome: ProviderCallOutcome;
  versions: PromptEvaluationVersionVector;
  providerOriginal?: ProviderOriginalEvidence;
  postprocessed?: PostprocessedEvidence;
  scores?: PromptEvaluationScores;
  /** 人工按当前任务族验收后的二元结论。 */
  taskPassed?: boolean;
  /** 严重失败不可通过删除来美化均分；非图像样本才可置 false。 */
  validForScoring?: boolean;
  /**
   * Legacy detached scorecard retained for pure-math/history compatibility.
   * Production promotion ignores it until separately traceable baseline cases exist.
   */
  baselineScores?: PromptEvaluationScores;
  /** 是否进入“近期请求完成率”窗口。 */
  recentRequest?: boolean;
  hardBlockers?: readonly EvaluationHardBlocker[];
}

export interface AutomaticRetryDecision {
  allowed: boolean;
  reason:
    | "confirmed-transient-not-billed"
    | "already-succeeded"
    | "deterministic-failure"
    | "already-billed"
    | "outcome-unknown-no-retry";
}

export interface VersionDowngradeDecision {
  changedFields: readonly (keyof PromptEvaluationVersionVector)[];
  requiresFullReevaluation: boolean;
  resultingSupportLevel: PromptSupportLevel;
}

export type EvaluationShutdownScope =
  | { level: "global" }
  | { level: "task-family"; taskFamilyId: string }
  | { level: "model-variant"; promptVariantId: string }
  | {
      level: "task-family-model-node";
      taskFamilyId: string;
      modelId: ImageModelId;
      nodeKind: EvaluationNodeKind;
    };

export interface EvaluationShutdownRule {
  id: string;
  active: boolean;
  scope: EvaluationShutdownScope;
  reason: string;
}

export interface EvaluationShutdownDecision {
  disabled: boolean;
  effectiveRule?: EvaluationShutdownRule;
  matchingRules: readonly EvaluationShutdownRule[];
}

export interface EvaluationStageThreshold {
  requiredSampleIds?: readonly string[];
  exactDistinctSamples?: number;
  minimumValidResults: number;
  minimumWeightedScore: number;
  minimumP10Score?: number;
  minimumTaskPassRate?: number;
  minimumRecentRequestCompletionRate?: number;
  minimumBootstrapGainLowerBoundExclusive?: number;
}

export interface PromptEvaluationGateInput {
  unit: PromptEvaluationUnit;
  stage: PromptEvaluationStage;
  contractVerified: boolean;
  passedStages: readonly PromptEvaluationStage[];
  attempts: readonly PromptEvaluationAttempt[];
  currentVersions: PromptEvaluationVersionVector;
  baselineVersions?: PromptEvaluationVersionVector;
  hardBlockers?: readonly EvaluationHardBlocker[];
  shutdownRules?: readonly EvaluationShutdownRule[];
}

export interface PromptEvaluationMetrics {
  distinctSamples: number;
  succeededSamples: number;
  validResults: number;
  requestCompletionRate: number;
  taskPassRate: number;
  averageWeightedScore: number;
  p10WeightedScore: number;
  bootstrapQualityGainLowerBound?: number;
  criterionAverages: PromptEvaluationScores;
}

export interface PromptEvaluationGateResult {
  passed: boolean;
  stage: PromptEvaluationStage;
  supportLevel: PromptSupportLevel;
  failures: readonly string[];
  hardBlockers: readonly EvaluationHardBlocker[];
  metrics: PromptEvaluationMetrics;
}
