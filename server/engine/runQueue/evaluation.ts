import { ClaimedJob, JobLockRow, parseJson, PromptAdmissionBlockedBeforeProviderCall } from "./types";
import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../../src/types/workflow";
import { isReferenceRole, NODE_SPECS } from "../../../src/types/workflow";
import type { EvaluationRunPolicy } from "../../lib/evaluationRunPolicy";
import {
  consumeEvaluationRunAuthorization,
  evaluationAuthorizationTargetFromPlan,
  lockEvaluationRunAuthorization,
} from "../../lib/evaluationAuthorizationLedger";
export function persistedEvaluationPolicy(
  input: Pick<
    ClaimedJob,
    | "runType"
    | "retryPolicy"
    | "evaluationCaseId"
    | "evaluationAuthorizationId"
    | "evaluationCampaignId"
    | "evaluationSlotId"
    | "step"
  >,
): EvaluationRunPolicy | undefined {
  if (input.runType !== "evaluation") return undefined;
  const raw = input.step.params.evaluationPolicy;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("evaluation Provider step lost its persisted policy snapshot");
  }
  const record = raw as Record<string, unknown>;
  if (
    input.retryPolicy !== "no-retry"
    || typeof input.evaluationCaseId !== "string"
    || typeof input.evaluationAuthorizationId !== "string"
    || typeof input.evaluationCampaignId !== "string"
    || typeof input.evaluationSlotId !== "string"
    || record.caseId !== input.evaluationCaseId
    || record.authorizationId !== input.evaluationAuthorizationId
    || record.campaignId !== input.evaluationCampaignId
    || record.slotId !== input.evaluationSlotId
    || typeof record.sampleId !== "string"
    || record.sampleId.length < 1
    || record.retryPolicy !== "no-retry"
  ) {
    throw new Error("evaluation policy snapshot drifted from the durable run binding");
  }
  return {
    caseId: input.evaluationCaseId,
    sampleId: record.sampleId,
    authorizationId: input.evaluationAuthorizationId,
    campaignId: input.evaluationCampaignId,
    slotId: input.evaluationSlotId,
    retryPolicy: "no-retry",
  };
}


export function persistedEvaluationPolicyFromRow(row: JobLockRow): EvaluationRunPolicy | undefined {
  const step = parseJson<NodeExecution | undefined>(row.step_json, undefined);
  if (!step) throw new Error("generation step payload is invalid while closing evaluation evidence");
  return persistedEvaluationPolicy({
    runType: row.run_type,
    retryPolicy: row.retry_policy,
    evaluationCaseId: row.evaluation_case_id,
    evaluationAuthorizationId: row.evaluation_authorization_id,
    evaluationCampaignId: row.evaluation_campaign_id,
    evaluationSlotId: row.evaluation_slot_id,
    step,
  });
}


export function assertEvaluationRuntimeReferenceBinding(
  job: ClaimedJob,
  runtimeUserReferences: readonly ReferenceImageInput[],
): void {
  if (job.runType !== "evaluation") return;
  try {
    const staticTarget = evaluationAuthorizationTargetFromPlan({ steps: [job.step] });
    const runtimeStep: NodeExecution = {
      ...job.step,
      inputImages: runtimeUserReferences.map((reference) => reference.dataUrl),
      inputReferences: runtimeUserReferences.map((reference) => ({
        imageRef: reference.dataUrl,
        role: reference.role,
        order: reference.order,
        ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
        roleNeedsConfirmation: reference.roleNeedsConfirmation,
      })),
    };
    const runtimeTarget = evaluationAuthorizationTargetFromPlan({ steps: [runtimeStep] });
    if (runtimeTarget.evaluationUnitKey !== staticTarget.evaluationUnitKey) {
      throw new Error("本次运行时用户参考角色顺序或数量已偏离已消费的 exact-unit 授权");
    }
  } catch (error) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      error instanceof Error ? error.message : "本次运行时参考角色无法与 exact-unit 授权绑定。",
    );
  }
}


export function planWithPersistedEvaluationPolicy(
  plan: ExecutionPlan,
  evaluationPolicy?: EvaluationRunPolicy,
): ExecutionPlan {
  if (!evaluationPolicy) return plan;
  let providerStepCount = 0;
  const policySnapshot: EvaluationRunPolicy = {
    caseId: evaluationPolicy.caseId,
    sampleId: evaluationPolicy.sampleId,
    authorizationId: evaluationPolicy.authorizationId,
    campaignId: evaluationPolicy.campaignId,
    slotId: evaluationPolicy.slotId,
    retryPolicy: "no-retry",
  };
  const steps = plan.steps.map((step) => {
    const { evaluationPolicy: _untrustedPolicy, ...params } = step.params;
    if (!NODE_SPECS[step.kind].providerId) return { ...step, params };
    providerStepCount += 1;
    return {
      ...step,
      params: { ...params, evaluationPolicy: policySnapshot },
    };
  });
  if (providerStepCount !== 1) {
    throw new Error("each evaluation run must persist exactly one Provider policy snapshot");
  }
  return { steps };
}
