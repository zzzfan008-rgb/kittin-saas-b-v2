import type { AuthUser } from "./auth";
import type { ExecutionPlan } from "../../src/types/workflow";
import { NODE_SPECS } from "../../src/types/workflow";

export const EVALUATION_CASE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
export const EVALUATION_AUTHORIZATION_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
export const EVALUATION_SAMPLE_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,128}$/;
export const EVALUATION_CAMPAIGN_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
export const EVALUATION_SLOT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export interface EvaluationRunPolicy {
  caseId: string;
  sampleId: string;
  authorizationId: string;
  campaignId: string;
  slotId: string;
  retryPolicy: "no-retry";
}

export class EvaluationRunPolicyError extends Error {
  constructor(message: string, readonly status: 400 | 403 | 409) {
    super(message);
    this.name = "EvaluationRunPolicyError";
  }
}

/**
 * Paid evaluation is disabled by default. Enabling the deployment switch does
 * not grant access by itself: the authenticated actor must still be an admin
 * and must attach an auditable case, sample and persisted authorisation identifier.
 */
export function parseEvaluationRunPolicy(
  value: unknown,
  user: AuthUser,
): EvaluationRunPolicy | undefined {
  if (value === undefined) return undefined;
  if (process.env.ENABLE_PAID_EVALUATION_RUNS !== "true") {
    throw new EvaluationRunPolicyError("真实付费评估尚未获得部署级授权", 409);
  }
  if (user.role !== "admin") {
    throw new EvaluationRunPolicyError("真实评估运行仅允许管理员发起", 403);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new EvaluationRunPolicyError(
      "evaluation 必须包含 caseId、sampleId、authorizationId、campaignId 与 slotId",
      400,
    );
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.caseId !== "string"
    || !EVALUATION_CASE_ID_PATTERN.test(record.caseId)
  ) {
    throw new EvaluationRunPolicyError("evaluation.caseId 格式无效", 400);
  }
  if (
    typeof record.sampleId !== "string"
    || !EVALUATION_SAMPLE_ID_PATTERN.test(record.sampleId)
  ) {
    throw new EvaluationRunPolicyError("evaluation.sampleId 格式无效", 400);
  }
  if (
    typeof record.authorizationId !== "string"
    || !EVALUATION_AUTHORIZATION_ID_PATTERN.test(record.authorizationId)
  ) {
    throw new EvaluationRunPolicyError("evaluation.authorizationId 格式无效", 400);
  }
  if (
    typeof record.campaignId !== "string"
    || !EVALUATION_CAMPAIGN_ID_PATTERN.test(record.campaignId)
  ) {
    throw new EvaluationRunPolicyError("evaluation.campaignId 格式无效", 400);
  }
  if (
    typeof record.slotId !== "string"
    || !EVALUATION_SLOT_ID_PATTERN.test(record.slotId)
  ) {
    throw new EvaluationRunPolicyError("evaluation.slotId 格式无效", 400);
  }
  return {
    caseId: record.caseId,
    sampleId: record.sampleId,
    authorizationId: record.authorizationId,
    campaignId: record.campaignId,
    slotId: record.slotId,
    retryPolicy: "no-retry",
  };
}

/** A case is one evaluation unit/sample and therefore exactly one paid node. */
export function attachEvaluationRunPolicy(
  plan: ExecutionPlan,
  policy: EvaluationRunPolicy,
): ExecutionPlan {
  const providerSteps = plan.steps.filter((step) => NODE_SPECS[step.kind].providerId);
  if (providerSteps.length !== 1) {
    throw new EvaluationRunPolicyError("每个真实评估 case 必须且只能包含一个付费节点", 400);
  }
  return {
    steps: plan.steps.map((step) => NODE_SPECS[step.kind].providerId
      ? { ...step, params: { ...step.params, evaluationPolicy: policy } }
      : step),
  };
}
