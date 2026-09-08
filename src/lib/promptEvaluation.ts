import type {
  AutomaticRetryDecision,
  EvaluationHardBlocker,
  EvaluationReferenceRole,
  EvaluationReferenceRoleProfileEntry,
  EvaluationShutdownDecision,
  EvaluationShutdownRule,
  EvaluationStageThreshold,
  PostprocessedEvidence,
  PromptEvaluationAttempt,
  PromptEvaluationGateInput,
  PromptEvaluationGateResult,
  PromptEvaluationMetrics,
  PromptEvaluationScores,
  PromptEvaluationStage,
  PromptEvaluationUnit,
  PromptEvaluationVersionVector,
  PromptScoreCriterion,
  PromptSupportLevel,
  ProviderOriginalEvidence,
  VersionDowngradeDecision,
} from "../types/promptEvaluation";

export const PROMPT_SCORING_RUBRIC_VERSION = "garment-rubric-v1";
export const GOLDEN_GARMENT_SET_VERSION = "garment-gold-v1";

export const PROMPT_SCORE_WEIGHTS: Readonly<Record<PromptScoreCriterion, number>> = {
  garmentMaterialFidelity: 0.30,
  instructionFollowing: 0.25,
  referenceRoleFidelity: 0.20,
  artifactControl: 0.15,
  commercialUsability: 0.10,
};

export const GOLDEN_GARMENT_SAMPLE_IDS = [
  "garment-gold-01", "garment-gold-02", "garment-gold-03", "garment-gold-04",
  "garment-gold-05", "garment-gold-06", "garment-gold-07", "garment-gold-08",
  "garment-gold-09", "garment-gold-10", "garment-gold-11", "garment-gold-12",
  "garment-gold-13", "garment-gold-14", "garment-gold-15", "garment-gold-16",
  "garment-gold-17", "garment-gold-18", "garment-gold-19", "garment-gold-20",
  "garment-gold-21", "garment-gold-22", "garment-gold-23", "garment-gold-24",
] as const;

export const PROMPT_EVALUATION_STAGE_ORDER: readonly PromptEvaluationStage[] = [
  "contract",
  "provider-probe",
  "internal-experiment",
  "formal-validation",
  "recommendation",
];

export const PROMPT_EVALUATION_THRESHOLDS: Readonly<Record<PromptEvaluationStage, EvaluationStageThreshold>> = {
  contract: {
    exactDistinctSamples: 0,
    minimumValidResults: 0,
    minimumWeightedScore: 0,
  },
  "provider-probe": {
    exactDistinctSamples: 1,
    minimumValidResults: 0,
    minimumWeightedScore: 0,
    minimumRecentRequestCompletionRate: 1,
  },
  "internal-experiment": {
    exactDistinctSamples: 8,
    minimumValidResults: 8,
    minimumWeightedScore: 70,
  },
  "formal-validation": {
    requiredSampleIds: GOLDEN_GARMENT_SAMPLE_IDS,
    exactDistinctSamples: 24,
    minimumValidResults: 24,
    minimumWeightedScore: 80,
    minimumP10Score: 65,
    minimumTaskPassRate: 0.85,
    minimumRecentRequestCompletionRate: 0.95,
  },
  recommendation: {
    exactDistinctSamples: 50,
    minimumValidResults: 50,
    minimumWeightedScore: 88,
    minimumTaskPassRate: 0.90,
    minimumRecentRequestCompletionRate: 0.95,
    minimumBootstrapGainLowerBoundExclusive: 0,
  },
};

const REFERENCE_ROLE_ORDER: readonly EvaluationReferenceRole[] = [
  "identity",
  "pose_composition",
  "garment_top",
  "garment_bottom",
  "garment_full",
  "fabric",
  "accessory",
  "styling_only",
  "background",
  "generic",
  "mask",
];

const VERSION_FIELDS = [
  "presetVersion",
  "parameterProfileVersion",
  "providerContractVersion",
  "resolvedModelVersion",
  "providerPromptRendererVersion",
  "providerPromptRendererHash",
  "inputNormalizationVersion",
  "postprocessingVersion",
  "goldenSetVersion",
  "scoringRubricVersion",
] as const satisfies readonly (keyof PromptEvaluationVersionVector)[];

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertScore(value: number, criterion: PromptScoreCriterion): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${criterion} must be a finite score from 0 to 100`);
  }
}

export function canonicalReferenceRoleSet(
  roles: readonly EvaluationReferenceRole[],
): readonly EvaluationReferenceRole[] {
  const unique = new Set(roles);
  return REFERENCE_ROLE_ORDER.filter((role) => unique.has(role));
}

/**
 * Validate and copy the exact ordered profile. Unlike the legacy role-set
 * helper this intentionally preserves duplicates and count.
 */
export function canonicalReferenceRoleProfile(
  profile: readonly EvaluationReferenceRoleProfileEntry[],
): readonly EvaluationReferenceRoleProfileEntry[] {
  if (!Array.isArray(profile)) throw new TypeError("referenceRoleProfile must be an array");
  return profile.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new TypeError(`referenceRoleProfile[${index}] is invalid`);
    }
    if (entry.order !== index || !Number.isSafeInteger(entry.order)) {
      throw new Error("referenceRoleProfile order must be contiguous, zero-based, and match array order");
    }
    if (!REFERENCE_ROLE_ORDER.includes(entry.role)) {
      throw new TypeError(`referenceRoleProfile[${index}].role is invalid`);
    }
    return { order: entry.order, role: entry.role };
  });
}

export function promptEvaluationUnitKey(unit: PromptEvaluationUnit): string {
  return JSON.stringify({
    taskFamilyId: unit.taskFamilyId,
    promptVariantId: unit.promptVariantId,
    presetId: unit.presetId,
    presetVersion: unit.presetVersion,
    nodeKind: unit.nodeKind,
    modelId: unit.modelId,
    operationMode: unit.operationMode,
    referenceRoleProfile: canonicalReferenceRoleProfile(unit.referenceRoleProfile),
    parameterProfileId: unit.parameterProfileId,
    parameterProfileVersion: unit.parameterProfileVersion,
  });
}

export function scorePromptEvaluation(scores: PromptEvaluationScores) {
  const criteria = Object.keys(PROMPT_SCORE_WEIGHTS) as PromptScoreCriterion[];
  for (const criterion of criteria) assertScore(scores[criterion], criterion);
  return {
    weightedScore: round(criteria.reduce(
      (total, criterion) => total + scores[criterion] * PROMPT_SCORE_WEIGHTS[criterion],
      0,
    )),
    minimumCriterionScore: Math.min(...criteria.map((criterion) => scores[criterion])),
    scores: { ...scores },
  };
}

export function automaticRetryDecision(outcome: PromptEvaluationAttempt["outcome"]): AutomaticRetryDecision {
  switch (outcome) {
    case "transient-not-billed":
      return { allowed: true, reason: "confirmed-transient-not-billed" };
    case "succeeded":
      return { allowed: false, reason: "already-succeeded" };
    case "deterministic-failure":
      return { allowed: false, reason: "deterministic-failure" };
    case "billed-failure":
      return { allowed: false, reason: "already-billed" };
    case "outcome_unknown":
      return { allowed: false, reason: "outcome-unknown-no-retry" };
  }
}

export function versionDowngradeDecision(
  previous: PromptEvaluationVersionVector | undefined,
  current: PromptEvaluationVersionVector,
  currentSupportLevel: PromptSupportLevel,
): VersionDowngradeDecision {
  const changedFields = previous
    ? VERSION_FIELDS.filter((field) => previous[field] !== current[field])
    : [...VERSION_FIELDS];
  const requiresFullReevaluation = changedFields.length > 0;
  return {
    changedFields,
    requiresFullReevaluation,
    resultingSupportLevel: currentSupportLevel === "unsupported"
      ? "unsupported"
      : requiresFullReevaluation ? "unverified" : currentSupportLevel,
  };
}

function shutdownSpecificity(rule: EvaluationShutdownRule): number {
  switch (rule.scope.level) {
    case "global": return 0;
    case "task-family": return 1;
    case "model-variant": return 2;
    case "task-family-model-node": return 3;
  }
}

export function resolveEvaluationShutdown(
  unit: PromptEvaluationUnit,
  rules: readonly EvaluationShutdownRule[],
): EvaluationShutdownDecision {
  const matchingRules = rules
    .filter((rule) => {
      if (!rule.active) return false;
      switch (rule.scope.level) {
        case "global": return true;
        case "task-family": return rule.scope.taskFamilyId === unit.taskFamilyId;
        case "model-variant": return rule.scope.promptVariantId === unit.promptVariantId;
        case "task-family-model-node": return (
          rule.scope.taskFamilyId === unit.taskFamilyId
          && rule.scope.modelId === unit.modelId
          && rule.scope.nodeKind === unit.nodeKind
        );
      }
    })
    .sort((left, right) => (
      shutdownSpecificity(right) - shutdownSpecificity(left) || left.id.localeCompare(right.id)
    ));
  return {
    disabled: matchingRules.length > 0,
    effectiveRule: matchingRules[0],
    matchingRules,
  };
}

function evidenceIntegrityBlockers(
  attempt: PromptEvaluationAttempt,
  stage: PromptEvaluationStage,
): EvaluationHardBlocker[] {
  if (attempt.outcome !== "succeeded") return [];
  const blockers: EvaluationHardBlocker[] = [];
  const provider = attempt.providerOriginal;
  const postprocessed = attempt.postprocessed;
  const requiresQualityEvidence = stage === "internal-experiment"
    || stage === "formal-validation"
    || stage === "recommendation";
  if (!provider) {
    blockers.push({
      code: "missing-provider-original",
      detail: "Successful attempt has no immutable provider-original artifact.",
      attemptId: attempt.attemptId,
    });
  }
  if (requiresQualityEvidence && !postprocessed) {
    blockers.push({
      code: "missing-postprocessed-output",
      detail: "Successful attempt has no postprocessed business-output artifact.",
      attemptId: attempt.attemptId,
    });
  }
  if (requiresQualityEvidence && !attempt.scores) {
    blockers.push({
      code: "evidence-integrity-failure",
      detail: "Successful attempt has no rubric scorecard.",
      attemptId: attempt.attemptId,
    });
  } else if (attempt.scores) {
    try {
      scorePromptEvaluation(attempt.scores);
    } catch (error) {
      blockers.push({
        code: "evidence-integrity-failure",
        detail: `Successful attempt has an invalid rubric scorecard: ${error instanceof Error ? error.message : String(error)}.`,
        attemptId: attempt.attemptId,
      });
    }
  }
  if (requiresQualityEvidence && typeof attempt.taskPassed !== "boolean") {
    blockers.push({
      code: "evidence-integrity-failure",
      detail: "Quality-stage attempt has no explicit taskPassed decision.",
      attemptId: attempt.attemptId,
    });
  }
  if (stage === "recommendation" && !attempt.baselineScores) {
    blockers.push({
      code: "evidence-integrity-failure",
      detail: "Recommendation attempt has no paired same-model baseline scorecard.",
      attemptId: attempt.attemptId,
    });
  }
  if (!SHA256_PATTERN.test(attempt.requestSnapshotSha256)) {
    blockers.push({
      code: "evidence-integrity-failure",
      detail: "Request snapshot is not bound to a SHA-256 digest.",
      attemptId: attempt.attemptId,
    });
  }
  for (const evidence of [provider, postprocessed].filter(Boolean) as Array<ProviderOriginalEvidence | PostprocessedEvidence>) {
    if (!SHA256_PATTERN.test(evidence.artifactSha256) || evidence.width < 1 || evidence.height < 1) {
      blockers.push({
        code: "evidence-integrity-failure",
        detail: `Evidence ${evidence.evidenceId} has an invalid digest or dimensions.`,
        attemptId: attempt.attemptId,
        evidenceIds: [evidence.evidenceId],
      });
    }
  }
  if (provider && postprocessed && postprocessed.sourceEvidenceId !== provider.evidenceId) {
    blockers.push({
      code: "evidence-integrity-failure",
      detail: "Postprocessed evidence is not linked to this attempt's provider original.",
      attemptId: attempt.attemptId,
      evidenceIds: [provider.evidenceId, postprocessed.evidenceId],
    });
  }
  if (postprocessed && postprocessed.pipelineVersion !== attempt.versions.postprocessingVersion) {
    blockers.push({
      code: "evidence-integrity-failure",
      detail: "Postprocessed evidence pipeline version does not match the attempt version vector.",
      attemptId: attempt.attemptId,
      evidenceIds: [postprocessed.evidenceId],
    });
  }
  return blockers;
}

function changedVersionFields(
  expected: PromptEvaluationVersionVector,
  actual: PromptEvaluationVersionVector,
): readonly (keyof PromptEvaluationVersionVector)[] {
  return VERSION_FIELDS.filter((field) => expected[field] !== actual[field]);
}

function emptyMetrics(): PromptEvaluationMetrics {
  return {
    distinctSamples: 0,
    succeededSamples: 0,
    validResults: 0,
    requestCompletionRate: 0,
    taskPassRate: 0,
    averageWeightedScore: 0,
    p10WeightedScore: 0,
    criterionAverages: {
      garmentMaterialFidelity: 0,
      instructionFollowing: 0,
      referenceRoleFidelity: 0,
      artifactControl: 0,
      commercialUsability: 0,
    },
  };
}

function aggregateMetrics(
  attempts: readonly PromptEvaluationAttempt[],
): PromptEvaluationMetrics {
  if (attempts.length === 0) return emptyMetrics();
  const successful = attempts.filter((attempt) => attempt.outcome === "succeeded");
  const scoringPopulation = attempts.filter((attempt) => attempt.validForScoring !== false);
  const valid = successful.filter((attempt) => attempt.validForScoring !== false && attempt.scores);
  const scoreResults = scoringPopulation.map((attempt) => {
    if (attempt.outcome !== "succeeded" || !attempt.scores) return undefined;
    try {
      return scorePromptEvaluation(attempt.scores);
    } catch {
      return undefined;
    }
  });
  const weightedScores = scoreResults.map((result) => result?.weightedScore ?? 0);
  const criteria = Object.keys(PROMPT_SCORE_WEIGHTS) as PromptScoreCriterion[];
  const averageWeightedScore = weightedScores.length
    ? round(weightedScores.reduce((sum, score) => sum + score, 0) / weightedScores.length)
    : 0;
  const criterionAverages = Object.fromEntries(criteria.map((criterion) => [
    criterion,
    scoreResults.length
      ? round(scoreResults.reduce((sum, result) => sum + (result?.scores[criterion] ?? 0), 0) / scoreResults.length)
      : 0,
  ])) as unknown as PromptEvaluationScores;
  const sortedScores = [...weightedScores].sort((left, right) => left - right);
  const p10Index = sortedScores.length ? Math.max(0, Math.ceil(sortedScores.length * 0.1) - 1) : 0;
  const recent = attempts.filter((attempt) => attempt.recentRequest !== false);
  return {
    distinctSamples: new Set(attempts.map((attempt) => attempt.sampleId)).size,
    succeededSamples: successful.length,
    validResults: valid.length,
    requestCompletionRate: recent.length
      ? round(recent.filter((attempt) => attempt.outcome === "succeeded").length / recent.length)
      : 0,
    taskPassRate: scoringPopulation.length
      ? round(scoringPopulation.filter((attempt) => attempt.taskPassed === true).length / scoringPopulation.length)
      : 0,
    averageWeightedScore,
    p10WeightedScore: sortedScores[p10Index] ?? 0,
    bootstrapQualityGainLowerBound: bootstrapQualityGainLowerBound(valid),
    criterionAverages,
  };
}

/** 固定种子的配对 bootstrap，保证 CI 结果在门禁中可重放。 */
export function bootstrapQualityGainLowerBound(
  attempts: readonly PromptEvaluationAttempt[],
  iterations = 2_000,
): number | undefined {
  const deltas = attempts.flatMap((attempt) => {
    if (!attempt.scores || !attempt.baselineScores || attempt.validForScoring === false) return [];
    return [scorePromptEvaluation(attempt.scores).weightedScore
      - scorePromptEvaluation(attempt.baselineScores).weightedScore];
  });
  if (deltas.length < 2) return undefined;
  let seed = attempts.reduce((value, attempt) => {
    for (const character of attempt.sampleId) value = ((value * 31) + character.charCodeAt(0)) >>> 0;
    return value;
  }, 0x9e3779b9);
  const means: number[] = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let total = 0;
    for (let index = 0; index < deltas.length; index += 1) {
      seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
      total += deltas[seed % deltas.length];
    }
    means.push(total / deltas.length);
  }
  means.sort((left, right) => left - right);
  return round(means[Math.floor(iterations * 0.025)] ?? means[0]);
}

function requiredPreviousStages(stage: PromptEvaluationStage): readonly PromptEvaluationStage[] {
  return PROMPT_EVALUATION_STAGE_ORDER.slice(0, PROMPT_EVALUATION_STAGE_ORDER.indexOf(stage));
}

function supportLevelForStages(stages: readonly PromptEvaluationStage[]): PromptSupportLevel {
  const passed = new Set(stages);
  if (passed.has("recommendation")) return "recommended";
  if (passed.has("formal-validation")) return "verified";
  if (passed.has("internal-experiment")) return "experimental";
  return "unverified";
}

function sameSampleSet(actual: readonly string[], expected: readonly string[]): boolean {
  if (actual.length !== expected.length) return false;
  const actualSet = new Set(actual);
  return expected.every((sampleId) => actualSet.has(sampleId));
}

export function evaluatePromptEvaluationGate(input: PromptEvaluationGateInput): PromptEvaluationGateResult {
  const failures: string[] = [];
  const hardBlockers: EvaluationHardBlocker[] = [...(input.hardBlockers ?? [])];
  const unitKey = promptEvaluationUnitKey(input.unit);
  const threshold = PROMPT_EVALUATION_THRESHOLDS[input.stage];
  const shutdown = resolveEvaluationShutdown(input.unit, input.shutdownRules ?? []);
  if (shutdown.disabled) failures.push(`Evaluation unit is disabled by ${shutdown.effectiveRule?.id}.`);
  if (!input.contractVerified) failures.push("Provider contract has not been verified.");

  for (const previous of requiredPreviousStages(input.stage)) {
    if (!input.passedStages.includes(previous)) failures.push(`Previous stage ${previous} has not passed.`);
  }

  if (input.stage === "contract" && input.attempts.length > 0) {
    hardBlockers.push({
      code: "evidence-integrity-failure",
      detail: "Contract stage must not contain Provider attempts.",
    });
  } else if (input.stage !== "contract") {
    const duplicateSamples = input.attempts
      .map((attempt) => attempt.sampleId)
      .filter((sampleId, index, all) => all.indexOf(sampleId) !== index);
    if (duplicateSamples.length) {
      hardBlockers.push({
        code: "evidence-integrity-failure",
        detail: `Stage contains duplicate terminal attempts for: ${[...new Set(duplicateSamples)].join(", ")}.`,
      });
    }
    for (const attempt of input.attempts) {
      if (attempt.unitKey !== unitKey) {
        hardBlockers.push({
          code: "evidence-integrity-failure",
          detail: "Attempt belongs to a different evaluation unit.",
          attemptId: attempt.attemptId,
        });
      }
      if (attempt.outcome === "outcome_unknown") {
        hardBlockers.push({
          code: "outcome-unknown",
          detail: "Provider submission outcome is unknown and cannot be retried or counted.",
          attemptId: attempt.attemptId,
        });
      }
      const drift = changedVersionFields(input.currentVersions, attempt.versions);
      if (drift.length) {
        hardBlockers.push({
          code: "version-drift",
          detail: `Attempt version drift: ${drift.join(", ")}.`,
          attemptId: attempt.attemptId,
        });
      }
      hardBlockers.push(...evidenceIntegrityBlockers(attempt, input.stage), ...(attempt.hardBlockers ?? []));
    }
  }

  const baselineDecision = input.baselineVersions
    ? versionDowngradeDecision(input.baselineVersions, input.currentVersions, "verified")
    : undefined;
  if (baselineDecision?.requiresFullReevaluation) {
    hardBlockers.push({
      code: "version-drift",
      detail: `Evaluation-critical versions changed: ${baselineDecision.changedFields.join(", ")}.`,
    });
  }

  const metrics = aggregateMetrics(input.attempts);
  const actualSampleIds = [...new Set(input.attempts.map((attempt) => attempt.sampleId))];
  if (threshold.requiredSampleIds && !sameSampleSet(actualSampleIds, threshold.requiredSampleIds)) {
    failures.push(`Stage must use the exact ${threshold.requiredSampleIds.length}-sample golden set.`);
  }
  if (threshold.exactDistinctSamples !== undefined
    && metrics.distinctSamples !== threshold.exactDistinctSamples) {
    failures.push(`Stage requires exactly ${threshold.exactDistinctSamples} distinct sample(s).`);
  }
  if (input.stage !== "contract") {
    if (metrics.validResults < threshold.minimumValidResults) {
      failures.push(`Valid result count ${metrics.validResults} is below ${threshold.minimumValidResults}.`);
    }
    if (metrics.averageWeightedScore < threshold.minimumWeightedScore) {
      failures.push(`Weighted score ${metrics.averageWeightedScore} is below ${threshold.minimumWeightedScore}.`);
    }
    if (threshold.minimumP10Score !== undefined && metrics.p10WeightedScore < threshold.minimumP10Score) {
      failures.push(`P10 score ${metrics.p10WeightedScore} is below ${threshold.minimumP10Score}.`);
    }
    if (
      threshold.minimumTaskPassRate !== undefined
      && metrics.taskPassRate < threshold.minimumTaskPassRate
    ) {
      failures.push(`Task pass rate ${metrics.taskPassRate} is below ${threshold.minimumTaskPassRate}.`);
    }
    if (
      threshold.minimumRecentRequestCompletionRate !== undefined
      && metrics.requestCompletionRate < threshold.minimumRecentRequestCompletionRate
    ) {
      failures.push(
        `Recent request completion rate ${metrics.requestCompletionRate} is below ${threshold.minimumRecentRequestCompletionRate}.`,
      );
    }
    if (threshold.minimumBootstrapGainLowerBoundExclusive !== undefined) {
      if (metrics.bootstrapQualityGainLowerBound === undefined) {
        failures.push("Recommendation gate requires paired same-model baseline scores for bootstrap.");
      } else if (
        metrics.bootstrapQualityGainLowerBound <= threshold.minimumBootstrapGainLowerBoundExclusive
      ) {
        failures.push(
          `95% bootstrap gain lower bound ${metrics.bootstrapQualityGainLowerBound} must be greater than ${threshold.minimumBootstrapGainLowerBoundExclusive}.`,
        );
      }
    }
  }

  if (hardBlockers.length) failures.push("One or more hard blockers are present.");
  const passed = failures.length === 0;
  const passedStages = passed ? [...input.passedStages, input.stage] : [...input.passedStages];
  let supportLevel = supportLevelForStages(passedStages);
  if (hardBlockers.some((blocker) => blocker.code === "capability-unsupported")) {
    supportLevel = "unsupported";
  } else if (hardBlockers.some((blocker) => blocker.code === "version-drift")) {
    supportLevel = "unverified";
  }
  return { passed, stage: input.stage, supportLevel, failures, hardBlockers, metrics };
}
