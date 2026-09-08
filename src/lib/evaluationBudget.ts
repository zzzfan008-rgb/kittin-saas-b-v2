export interface EvaluationBudgetStageInput {
  stageId: string;
  /** 该阶段新增样本数；是否复用旧证据由调用方明确决定。 */
  incrementalSamples: number;
  /** 包含基线对照、输出补发等最坏请求数。 */
  maxProviderRequestsPerSample: number;
}

export interface EvaluationBudgetUnitInput {
  unitId: string;
  modelId: string;
  operationMode: "generate" | "edit" | "mask-edit";
  currency: string;
  /** 以最小货币单位输入，避免浮点误差；必须由调用方显式传入。 */
  priceMinorPerProviderRequest: number;
  stages: readonly EvaluationBudgetStageInput[];
}

export interface EvaluationBudgetResult {
  currency: string;
  maximumProviderRequests: number;
  worstCaseCostMinor: number;
  units: Array<{
    unitId: string;
    maximumProviderRequests: number;
    worstCaseCostMinor: number;
  }>;
}

/**
 * 纯离线上界计算：不读取价格、不访问网络、不调用 Provider。
 * 所有价格和“每样本最多多少请求”均由审批前的调用方显式输入。
 */
export function buildWorstCaseEvaluationBudget(
  inputs: readonly EvaluationBudgetUnitInput[],
): EvaluationBudgetResult {
  if (inputs.length === 0) throw new RangeError("at least one evaluation unit is required");
  const currencies = new Set(inputs.map((input) => input.currency.trim()).filter(Boolean));
  if (currencies.size !== 1 || inputs.some((input) => !input.currency.trim())) {
    throw new RangeError("all evaluation units must explicitly use the same non-empty currency");
  }

  const units = inputs.map((input) => {
    if (!Number.isSafeInteger(input.priceMinorPerProviderRequest) || input.priceMinorPerProviderRequest < 0) {
      throw new RangeError(`${input.unitId} priceMinorPerProviderRequest must be an explicit non-negative integer`);
    }
    if (input.stages.length === 0) throw new RangeError(`${input.unitId} must include at least one stage`);
    let maximumProviderRequests = 0;
    for (const stage of input.stages) {
      if (!Number.isSafeInteger(stage.incrementalSamples) || stage.incrementalSamples < 0) {
        throw new RangeError(`${input.unitId}/${stage.stageId} incrementalSamples must be a non-negative integer`);
      }
      if (!Number.isSafeInteger(stage.maxProviderRequestsPerSample) || stage.maxProviderRequestsPerSample < 1) {
        throw new RangeError(`${input.unitId}/${stage.stageId} maxProviderRequestsPerSample must be a positive integer`);
      }
      maximumProviderRequests += stage.incrementalSamples * stage.maxProviderRequestsPerSample;
    }
    const worstCaseCostMinor = maximumProviderRequests * input.priceMinorPerProviderRequest;
    if (!Number.isSafeInteger(worstCaseCostMinor)) {
      throw new RangeError(`${input.unitId} worst-case cost exceeds safe integer range`);
    }
    return { unitId: input.unitId, maximumProviderRequests, worstCaseCostMinor };
  });

  return {
    currency: [...currencies][0]!,
    maximumProviderRequests: units.reduce((total, unit) => total + unit.maximumProviderRequests, 0),
    worstCaseCostMinor: units.reduce((total, unit) => total + unit.worstCaseCostMinor, 0),
    units,
  };
}
