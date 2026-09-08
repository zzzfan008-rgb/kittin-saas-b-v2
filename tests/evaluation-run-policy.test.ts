import assert from "node:assert/strict";
import {
  EvaluationRunPolicyError,
  attachEvaluationRunPolicy,
  parseEvaluationRunPolicy,
} from "../server/lib/evaluationRunPolicy";
import type { AuthUser } from "../server/lib/auth";
import type { ExecutionPlan } from "../src/types/workflow";

const admin: AuthUser = {
  id: "admin", accountId: "admin", displayName: "Admin", role: "admin", mustChangePassword: false,
};
const user: AuthUser = { ...admin, id: "user", accountId: "user", role: "user" };
const oldFlag = process.env.ENABLE_PAID_EVALUATION_RUNS;
delete process.env.ENABLE_PAID_EVALUATION_RUNS;
assert.throws(
  () => parseEvaluationRunPolicy({
    caseId: "case-1", sampleId: "golden.lookbook.001", authorizationId: "approval-1",
  }, admin),
  (error: unknown) => error instanceof EvaluationRunPolicyError && error.status === 409,
);
process.env.ENABLE_PAID_EVALUATION_RUNS = "true";
assert.throws(
  () => parseEvaluationRunPolicy({
    caseId: "case-1", sampleId: "golden.lookbook.001", authorizationId: "approval-1",
  }, user),
  (error: unknown) => error instanceof EvaluationRunPolicyError && error.status === 403,
);
assert.throws(
  () => parseEvaluationRunPolicy({ caseId: "case-1", authorizationId: "approval-1" }, admin),
  (error: unknown) => error instanceof EvaluationRunPolicyError
    && error.status === 400
    && /sampleId/.test(error.message),
);
assert.throws(
  () => parseEvaluationRunPolicy({
    caseId: "case-1", sampleId: "contains spaces", authorizationId: "approval-1",
  }, admin),
  (error: unknown) => error instanceof EvaluationRunPolicyError
    && error.status === 400
    && /sampleId/.test(error.message),
);
const policy = parseEvaluationRunPolicy({
  caseId: "case-1", sampleId: "golden.lookbook.001", authorizationId: "approval-1",
  campaignId: "campaign-1", slotId: "slot-1",
}, admin)!;
assert.deepEqual(policy, {
  caseId: "case-1",
  sampleId: "golden.lookbook.001",
  authorizationId: "approval-1",
  campaignId: "campaign-1",
  slotId: "slot-1",
  retryPolicy: "no-retry",
});
assert.throws(
  () => parseEvaluationRunPolicy({
    caseId: "case-1", sampleId: "golden.lookbook.001", authorizationId: "approval-1",
    campaignId: "contains spaces", slotId: "slot-1",
  }, admin),
  (error: unknown) => error instanceof EvaluationRunPolicyError
    && error.status === 400
    && /campaignId/.test(error.message),
);
assert.throws(
  () => parseEvaluationRunPolicy({
    caseId: "case-1", sampleId: "golden.lookbook.001", authorizationId: "approval-1",
    campaignId: "campaign-1", slotId: "contains spaces",
  }, admin),
  (error: unknown) => error instanceof EvaluationRunPolicyError
    && error.status === 400
    && /slotId/.test(error.message),
);

const paidPlan: ExecutionPlan = { steps: [{
  nodeId: "generate", kind: "sketch-to-render", inputImages: [],
  params: { modelId: "gpt-image-2-vip", operationMode: "generate", prompt: "test" },
}] };
assert.deepEqual(
  attachEvaluationRunPolicy(paidPlan, policy).steps[0].params.evaluationPolicy,
  policy,
);
assert.throws(
  () => attachEvaluationRunPolicy({ steps: [...paidPlan.steps, { ...paidPlan.steps[0], nodeId: "second" }] }, policy),
  /只能包含一个付费节点/,
);

if (oldFlag === undefined) delete process.env.ENABLE_PAID_EVALUATION_RUNS;
else process.env.ENABLE_PAID_EVALUATION_RUNS = oldFlag;
console.log("真实评估运行授权与单节点策略测试通过");
