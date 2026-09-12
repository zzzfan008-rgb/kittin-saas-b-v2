import os from "node:os";
import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { nanoid } from "nanoid";
import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../src/types/workflow";
import { isReferenceRole, NODE_SPECS } from "../../src/types/workflow";
import { isImageModelId } from "../../src/types/imageModels";
import { config } from "../config";
import { db, query, queryOne, transaction } from "../lib/database";
import {
  deleteStoredImage,
  normalizeImageRef,
  persistImageRefWithReceipt,
  type PersistedImageReceipt,
} from "../lib/fileStore";
import { validateImageDataUrl } from "../lib/imageValidation";
import type { GenerationRecordContext } from "../lib/generationRecords";
import type { EvaluationRunPolicy } from "../lib/evaluationRunPolicy";
import {
  consumeEvaluationRunAuthorization,
  evaluationAuthorizationTargetFromPlan,
  lockEvaluationRunAuthorization,
} from "../lib/evaluationAuthorizationLedger";
import { finalizeEvaluationCampaignSlot } from "../lib/evaluationCampaign";
import type { EvaluationCodeIdentity, EvaluationErrorPhase } from "../lib/evaluationEvidence";
import {
  completeEvaluationCaseEvidence,
  failEvaluationCaseEvidence,
  recordEvaluationProviderRequestFailure,
  recordEvaluationProviderRequestSuccess,
  startEvaluationProviderRequestEvidence,
} from "../lib/evaluationEvidenceStore";
import { ACTIVE_RUN_LIMIT } from "../lib/generationLimits";
import { lockActiveOwner } from "../lib/ownerMutation";
import {
  evaluatePromptRunAdmission,
  promptRunAdmissionInputFromParams,
  type PromptRunReferenceSnapshot,
} from "../../src/lib/promptRunAdmission";
import { getProvider } from "../providers";
import {
  ProviderError,
  publicProviderErrorMessage,
  sanitizedProviderDiagnostic,
} from "../providers/base";
import { executeStep, type ProviderResolver, type RunEvent, type StepResult } from "./runner";
import {
  ActiveRunLimitError,
  CancelledBeforeProviderCall,
  EvaluationCaseConflictError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
  isRetryableProviderError,
  isTerminalRunStatus,
  outcomeUnknownMessage,
  type DurableRunStatus,
} from "./runQueueContracts";

export {
  ActiveRunLimitError,
  CancelledBeforeProviderCall,
  EvaluationCaseConflictError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
} from "./runQueueContracts";
export type { DurableRunStatus } from "./runQueueContracts";

const DEFAULT_LEASE_MS = 45_000;
const DEFAULT_HEARTBEAT_MS = 10_000;
const DEFAULT_RETRY_DELAYS_MS = [5_000, 30_000, 120_000] as const;
const CANCELLED_AFTER_START_WARNING = "取消请求未能中止已经开始的上游调用，结果已按实际返回保存";
export const DURABLE_RUN_EVENT_BATCH_SIZE = 500;
export const CLIENT_REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
export { ACTIVE_RUN_LIMIT } from "../lib/generationLimits";

export async function assertGenerationOwnerActive(
  client: PoolClient,
  ownerId: string,
): Promise<void> {
  if (!await lockActiveOwner(client, ownerId)) {
    throw new GenerationOwnerUnavailableError();
  }
}

interface DurableRunRow {
  id: string;
  owner_id: string;
  project_id: string | null;
  node_id: string;
  status: DurableRunStatus | "success" | "error";
  target_step_id: string | null;
  run_type: "workflow" | "direct" | "evaluation";
  started_at: number;
  finished_at: number | null;
}

interface ClaimedJob {
  id: string;
  runId: string;
  stepId: string;
  nodeId: string;
  stepIndex: number;
  step: NodeExecution;
  retryCount: number;
  startedAt: number;
  runType: "workflow" | "direct" | "evaluation";
  retryPolicy: "standard" | "no-retry";
  evaluationCaseId: string | null;
  evaluationAuthorizationId: string | null;
  evaluationCampaignId: string | null;
  evaluationSlotId: string | null;
}

interface JobLockRow {
  id: string;
  run_id: string;
  step_id: string;
  status: DurableRunStatus;
  retry_count: number;
  attempt_started_at: number | null;
  worker_id: string | null;
  node_id: string;
  step_index: number;
  step_json: string;
  step_started_at: number | null;
  target_step_id: string | null;
  run_type: "workflow" | "direct" | "evaluation";
  retry_policy: "standard" | "no-retry";
  evaluation_case_id: string | null;
  evaluation_authorization_id: string | null;
  evaluation_campaign_id: string | null;
  evaluation_slot_id: string | null;
}

interface EvaluationRecoveryEvidenceSummary {
  request_count: number;
  ambiguous_request_count: number;
  succeeded_request_count: number;
  succeeded_output_count: number;
  provider_original_count: number;
}

export interface ProcessGenerationJobOptions {
  resolveProvider?: ProviderResolver;
  /** Test-only injection; production workers always resolve the fail-closed runtime identity. */
  evaluationCodeIdentity?: EvaluationCodeIdentity;
  now?: () => number;
  retryDelaysMs?: readonly number[];
  random?: () => number;
  leaseMs?: number;
  heartbeatMs?: number;
}

class PromptAdmissionBlockedBeforeProviderCall extends Error {
  constructor(reason: string) {
    super(`执行前提示词准入阻断：${reason}`);
    this.name = "PromptAdmissionBlockedBeforeProviderCall";
  }
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function evaluateClaimedJobPromptAdmission(
  job: ClaimedJob,
  runtimeUserReferences?: readonly PromptRunReferenceSnapshot[],
): { allowed: boolean; reason: string } {
  if (!NODE_SPECS[job.step.kind].providerId) {
    return { allowed: true, reason: "非付费节点不调用 Provider。" };
  }
  const hasEvaluationPolicy = (
    job.runType === "evaluation"
    && job.retryPolicy === "no-retry"
    && typeof job.evaluationCaseId === "string"
    && job.evaluationCaseId.trim().length > 0
    && typeof job.evaluationAuthorizationId === "string"
    && job.evaluationAuthorizationId.trim().length > 0
    && typeof job.evaluationCampaignId === "string"
    && job.evaluationCampaignId.trim().length > 0
    && typeof job.evaluationSlotId === "string"
    && job.evaluationSlotId.trim().length > 0
  );
  if (job.runType === "evaluation" && !hasEvaluationPolicy) {
    return {
      allowed: false,
      reason: "真实评估任务缺少持久化的 no-retry、caseId、authorizationId、campaignId 或 slotId。",
    };
  }
  if (hasEvaluationPolicy) {
    try {
      persistedEvaluationPolicy(job);
    } catch (error) {
      return {
        allowed: false,
        reason: error instanceof Error ? error.message : "真实评估策略快照无法验证。",
      };
    }
  }
  if (
    job.runType !== "evaluation"
    && (
      job.retryPolicy !== "standard"
      || job.evaluationCaseId !== null
      || job.evaluationAuthorizationId !== null
      || job.evaluationCampaignId !== null
      || job.evaluationSlotId !== null
    )
  ) {
    return {
      allowed: false,
      reason: "普通任务不得携带真实评估授权或 no-retry 策略。",
    };
  }
  const references = runtimeUserReferences ?? (job.step.inputReferences ?? []).map((reference) => ({
    role: reference.role,
    order: reference.order,
    roleNeedsConfirmation: reference.roleNeedsConfirmation,
    ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
  }));
  return evaluatePromptRunAdmission(
    // Prompt/model/native parameter binding remains anchored to the reviewed,
    // durable step. Only the reference-role sequence is replaced at the final
    // Provider boundary with the inputs resolved for this run.
    promptRunAdmissionInputFromParams(job.step.kind, job.step.params, references),
    { evaluationRun: hasEvaluationPolicy },
  );
}

function runtimeUserReferenceInputs(
  job: ClaimedJob,
  request: ImageGenRequest,
): ReferenceImageInput[] {
  if (request.references !== undefined && !Array.isArray(request.references)) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "Provider 请求的结构化参考图不是数组。",
    );
  }
  if (request.referenceImages !== undefined && !Array.isArray(request.referenceImages)) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "Provider 请求的兼容参考图不是数组。",
    );
  }
  const references = request.references ?? [];
  const referenceImages = request.referenceImages ?? [];
  if (
    referenceImages.length !== references.length
    || referenceImages.some((image, index) => image !== references[index]?.dataUrl)
  ) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "Provider 请求的结构化参考图与兼容数组内容或顺序不一致。",
    );
  }

  references.forEach((reference, index) => {
    if (!Number.isSafeInteger(reference?.order) || reference.order !== index) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        `Provider 请求的参考图 references[${index}].order 必须是安全整数且等于 ${index}。`,
      );
    }
    let actualSha256: string;
    try {
      actualSha256 = createHash("sha256")
        .update(validateImageDataUrl(reference.dataUrl).buffer)
        .digest("hex");
    } catch (error) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        `Provider 请求的参考图 ${index + 1} 内容无法验证：${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (reference.assetSha256 !== actualSha256) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        `Provider 请求的参考图 ${index + 1} 内容与 assetSha256 证据不一致。`,
      );
    }
  });

  const maskGuideSourceNodeId = `${job.step.nodeId}:mask-guide`;
  let userReferences = references;
  if (job.step.kind === "mask-redraw" && request.operationMode === "mask-edit") {
    const guideIndexes = references.flatMap((reference, index) => (
      reference.sourceNodeId === maskGuideSourceNodeId ? [index] : []
    ));
    const guideIndex = guideIndexes[0];
    const guide = guideIndex === undefined ? undefined : references[guideIndex];
    if (
      guideIndexes.length !== 1
      || guideIndex !== references.length - 1
      || guide?.role !== "generic"
      || guide?.roleNeedsConfirmation !== false
    ) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        "蒙版 Provider 请求必须且只能在用户参考图之后附加一张已确认的系统引导图。",
      );
    }
    // promptRunReferenceRoleProfile owns the synthetic generic-guide + mask
    // suffix. Removing the runtime guide here prevents double-counting it.
    userReferences = references.slice(0, -1);
  } else if (references.some((reference) => reference.sourceNodeId === maskGuideSourceNodeId)) {
    throw new PromptAdmissionBlockedBeforeProviderCall(
      "非蒙版 Provider 请求不得携带系统蒙版引导图。",
    );
  }

  return userReferences.map((reference) => ({
    dataUrl: reference.dataUrl,
    role: reference.role,
    order: reference.order,
    assetSha256: reference.assetSha256,
    ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
    roleNeedsConfirmation: reference.roleNeedsConfirmation,
  }));
}

function assertEvaluationRuntimeReferenceBinding(
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

async function lockRun(client: PoolClient, runId: string): Promise<DurableRunRow | undefined> {
  return (await client.query<DurableRunRow>(
    `SELECT id, owner_id, project_id, node_id, status, target_step_id, run_type, started_at, finished_at
     FROM generation_runs WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
    [runId],
  )).rows[0];
}

function persistedEvaluationPolicy(
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

function persistedEvaluationPolicyFromRow(row: JobLockRow): EvaluationRunPolicy | undefined {
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

export async function appendRunEvent(
  client: PoolClient,
  runId: string,
  event: RunEvent,
  createdAt: number,
): Promise<RunEvent> {
  const seqRow = (await client.query<{ seq: number }>(`
    UPDATE generation_runs
    SET next_event_seq = next_event_seq + 1
    WHERE id = $1
    RETURNING next_event_seq::int AS seq
  `, [runId])).rows[0];
  if (!seqRow) throw new Error("generation run disappeared while appending an event");
  const sequenced = { ...event, seq: seqRow.seq } as RunEvent;
  await client.query(`
    INSERT INTO generation_run_events (run_id, seq, payload_json, created_at)
    VALUES ($1, $2, $3, $4)
  `, [runId, sequenced.seq, JSON.stringify(sequenced), createdAt]);
  return sequenced;
}

function planWithPersistedEvaluationPolicy(
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

async function insertGenerationRun(
  client: PoolClient,
  plan: ExecutionPlan,
  ownerId: string,
  context: GenerationRecordContext,
  runType: "workflow" | "direct" | "evaluation" = "workflow",
  evaluationPolicy?: EvaluationRunPolicy,
): Promise<{ id: string }> {
  if (!ownerId.trim() || context.userId !== ownerId) throw new Error("run owner is invalid");
  if (plan.steps.length === 0) throw new Error("execution plan has no steps");
  if ((runType === "evaluation") !== Boolean(evaluationPolicy)) {
    throw new Error("evaluation run type and policy must be supplied together");
  }
  await assertGenerationOwnerActive(client, ownerId);
  const clientRequestId = context.clientRequestId?.trim() || undefined;
  if (clientRequestId && !CLIENT_REQUEST_ID_PATTERN.test(clientRequestId)) {
    throw new Error("clientRequestId must contain only letters, digits, underscore or hyphen");
  }
  const runId = nanoid(10);
  const createdAt = Date.now();
  const persistedPlan = planWithPersistedEvaluationPolicy(plan, evaluationPolicy);
  const requestedTargetIndex = persistedPlan.steps.findIndex((step) => step.nodeId === context.nodeId);
  const targetIndex = requestedTargetIndex >= 0 ? requestedTargetIndex : persistedPlan.steps.length - 1;
  const stepIds = persistedPlan.steps.map(() => nanoid(12));
  const targetStep = persistedPlan.steps[targetIndex] ?? persistedPlan.steps.at(-1)!;
  const targetStepId = stepIds[targetIndex] ?? stepIds.at(-1)!;
  const initialModel = isImageModelId(targetStep.params.modelId) ? targetStep.params.modelId : null;
  const planJson = JSON.stringify(persistedPlan);
  const requestFingerprint = clientRequestId
    ? createHash("sha256")
      .update(JSON.stringify({
        runType,
        evaluationCaseId: evaluationPolicy?.caseId ?? null,
        evaluationAuthorizationId: evaluationPolicy?.authorizationId ?? null,
        evaluationCampaignId: evaluationPolicy?.campaignId ?? null,
        evaluationSlotId: evaluationPolicy?.slotId ?? null,
        projectId: context.projectId ?? null,
        nodeId: context.nodeId,
      }))
      .update("\0")
      .update(planJson)
      .digest("hex")
    : null;

  // 同一用户的新任务串行通过容量门禁；幂等重放先返回旧 Run，不占新名额。
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
    [`generation-run-owner:${ownerId}`],
  );
  if (clientRequestId) {
    const existing = (await client.query<{ id: string; request_fingerprint: string | null }>(`
      SELECT id, request_fingerprint FROM generation_runs
      WHERE owner_id = $1 AND client_request_id = $2
    `, [ownerId, clientRequestId])).rows[0];
    if (existing) {
      if (existing.request_fingerprint !== requestFingerprint) {
        throw new GenerationRequestConflictError();
      }
      return { id: existing.id };
    }
  }
  if (evaluationPolicy) {
    const existingCase = (await client.query<{ id: string }>(`
      SELECT id FROM generation_runs
      WHERE owner_id = $1 AND evaluation_case_id = $2
    `, [ownerId, evaluationPolicy.caseId])).rows[0];
    if (existingCase) throw new EvaluationCaseConflictError();
  }
  const activeCount = (await client.query<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM generation_runs
    WHERE owner_id = $1
      AND deleted_at IS NULL
      AND plan_json IS NOT NULL
      AND status IN ('queued','running','retry_wait','cancel_requested')
  `, [ownerId])).rows[0]?.count ?? 0;
  if (activeCount >= ACTIVE_RUN_LIMIT) throw new ActiveRunLimitError();

  // The ledger row is locked until this transaction either binds it to the new
  // run or rolls back. HTTP validation alone can never mint an authorization.
  const lockedEvaluationAuthorization = evaluationPolicy
    ? await lockEvaluationRunAuthorization(client, evaluationPolicy, ownerId, persistedPlan, createdAt)
    : undefined;

  const inserted = await client.query<{ id: string }>(`
      INSERT INTO generation_runs (
        id, owner_id, project_id, project_name, node_id, node_label, kind, prompt,
        parameters_json, reference_images_json, reference_inputs_json, model, requested_count, status,
        started_at, plan_json, target_step_id, run_type, updated_at,
        client_request_id, request_fingerprint, retry_policy,
        evaluation_case_id, evaluation_authorization_id, evaluation_campaign_id, evaluation_slot_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'queued',
        $14, $15, $16, $17, $14, $18, $19, $20, $21, $22, $23, $24
      )
      ON CONFLICT (owner_id, client_request_id)
        WHERE client_request_id IS NOT NULL
      DO NOTHING
      RETURNING id
    `, [
      runId, ownerId, context.projectId ?? null, context.projectName ?? null,
      context.nodeId, context.nodeLabel, context.kind, context.prompt ?? null,
      JSON.stringify(context.parameters ?? {}), JSON.stringify(context.referenceImages ?? targetStep.inputImages ?? []),
      JSON.stringify(context.referenceInputs ?? targetStep.inputReferences ?? []),
      initialModel, context.requestedCount, createdAt, planJson, targetStepId, runType,
      clientRequestId ?? null, requestFingerprint,
      evaluationPolicy?.retryPolicy ?? "standard",
      evaluationPolicy?.caseId ?? null,
      evaluationPolicy?.authorizationId ?? null,
      evaluationPolicy?.campaignId ?? null,
      evaluationPolicy?.slotId ?? null,
    ]);

  if (inserted.rowCount === 0) {
    const existing = (await client.query<{ id: string; request_fingerprint: string | null }>(`
      SELECT id, request_fingerprint FROM generation_runs
      WHERE owner_id = $1 AND client_request_id = $2
    `, [ownerId, clientRequestId])).rows[0];
    if (!existing || existing.request_fingerprint !== requestFingerprint) {
      throw new GenerationRequestConflictError();
    }
    return { id: existing.id };
  }

  if (evaluationPolicy && lockedEvaluationAuthorization) {
    await consumeEvaluationRunAuthorization(
      client,
      lockedEvaluationAuthorization,
      evaluationPolicy,
      ownerId,
      runId,
      createdAt,
    );
  }

  for (const [index, step] of persistedPlan.steps.entries()) {
    const stepId = stepIds[index];
    const model = isImageModelId(step.params.modelId) ? step.params.modelId : null;
    await client.query(`
        INSERT INTO generation_run_steps (
          id, run_id, step_index, node_id, kind, step_json, status, model
        ) VALUES ($1, $2, $3, $4, $5, $6, 'queued', $7)
      `, [stepId, runId, index, step.nodeId, step.kind, JSON.stringify(step), model]);
    await client.query(`
        INSERT INTO generation_jobs (
          id, run_id, step_id, idempotency_key, status, retry_count, available_at,
          run_started_at, step_index, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'queued', 0, $5, $5, $6, $5, $5)
      `, [nanoid(12), runId, stepId, `${runId}:${stepId}`, createdAt, index]);
    await appendRunEvent(client, runId, {
      type: "node-status", nodeId: step.nodeId, status: "queued", startedAt: createdAt,
    }, createdAt);
  }
  return { id: runId };
}

export async function enqueueGenerationRunInTransaction(
  client: PoolClient,
  plan: ExecutionPlan,
  ownerId: string,
  context: GenerationRecordContext,
  runType: "workflow" | "direct" | "evaluation" = "workflow",
  evaluationPolicy?: EvaluationRunPolicy,
): Promise<{ id: string }> {
  return insertGenerationRun(client, plan, ownerId, context, runType, evaluationPolicy);
}

export async function enqueueGenerationRun(
  plan: ExecutionPlan,
  ownerId: string,
  context: GenerationRecordContext,
  runType: "workflow" | "direct" | "evaluation" = "workflow",
  evaluationPolicy?: EvaluationRunPolicy,
): Promise<{ id: string }> {
  return transaction((client) => insertGenerationRun(
    client, plan, ownerId, context, runType, evaluationPolicy,
  ));
}

export const CLAIM_NEXT_JOB_SQL = `
  SELECT j.id, j.run_id, j.step_id, j.status, j.retry_count, j.attempt_started_at, j.worker_id,
    s.node_id, s.step_index, s.step_json, s.started_at AS step_started_at,
    r.target_step_id, r.run_type, r.retry_policy,
    r.evaluation_case_id, r.evaluation_authorization_id,
    r.evaluation_campaign_id, r.evaluation_slot_id
  FROM generation_jobs j
  JOIN generation_run_steps s ON s.id = j.step_id
  JOIN generation_runs r ON r.id = j.run_id
  WHERE j.status IN ('queued','retry_wait')
    AND j.available_at <= $1
    AND r.deleted_at IS NULL
    AND r.status IN ('queued','running','retry_wait')
    AND NOT EXISTS (
      SELECT 1 FROM generation_jobs previous
      WHERE previous.run_id = j.run_id
        AND previous.step_index < j.step_index
        AND previous.status <> 'succeeded'
    )
  ORDER BY j.available_at, j.run_started_at, j.step_index, j.id
  FOR UPDATE OF j SKIP LOCKED
  LIMIT 1
`;

export async function claimNextJob(
  workerId: string,
  now: number,
  leaseMs: number,
): Promise<ClaimedJob | undefined> {
  return transaction(async (client) => {
    const row = (await client.query<JobLockRow>(CLAIM_NEXT_JOB_SQL, [now])).rows[0];
    if (!row) return undefined;
    const run = await lockRun(client, row.run_id);
    if (!run || isTerminalRunStatus(run.status) || run.status === "cancel_requested") return undefined;
    await client.query(`
      UPDATE generation_jobs SET status = 'running', worker_id = $1, lease_expires_at = $2,
        attempt_started_at = NULL, updated_at = $3 WHERE id = $4
    `, [workerId, now + leaseMs, now, row.id]);
    await client.query(`
      UPDATE generation_run_steps SET status = 'running', started_at = COALESCE(started_at, $1), error = NULL
      WHERE id = $2
    `, [now, row.step_id]);
    await client.query(
      "UPDATE generation_runs SET status = 'running', updated_at = $1 WHERE id = $2",
      [now, row.run_id],
    );
    await appendRunEvent(client, row.run_id, {
      type: "node-status", nodeId: row.node_id, status: "running", startedAt: now,
    }, now);
    const step = parseJson<NodeExecution | undefined>(row.step_json, undefined);
    if (!step) throw new Error("generation step payload is invalid");
    return {
      id: row.id,
      runId: row.run_id,
      stepId: row.step_id,
      nodeId: row.node_id,
      stepIndex: row.step_index,
      step,
      retryCount: row.retry_count,
      startedAt: now,
      runType: row.run_type,
      retryPolicy: row.retry_policy,
      evaluationCaseId: row.evaluation_case_id,
      evaluationAuthorizationId: row.evaluation_authorization_id,
      evaluationCampaignId: row.evaluation_campaign_id,
      evaluationSlotId: row.evaluation_slot_id,
    };
  });
}

async function inputImagesForStep(
  runId: string,
  step: NodeExecution,
): Promise<{
  images: string[];
  references: ReferenceImageSource[];
  providerImages: Array<string | undefined>;
}> {
  if (!step.upstream?.length) {
    if (!Array.isArray(step.inputImages)) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        "持久化步骤的 inputImages 快照不是数组。",
      );
    }
    if (step.inputReferences !== undefined && !Array.isArray(step.inputReferences)) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        "持久化步骤的 inputReferences 快照不是数组。",
      );
    }
    const references = step.inputReferences ?? [];
    if (references.length !== step.inputImages.length) {
      throw new PromptAdmissionBlockedBeforeProviderCall(
        "持久化参考图快照与 inputImages 数量不一致。",
      );
    }
    references.forEach((reference, index) => {
      if (!Number.isSafeInteger(reference?.order) || reference.order !== index) {
        throw new PromptAdmissionBlockedBeforeProviderCall(
          `持久化参考图快照 inputReferences[${index}].order 必须等于 ${index}。`,
        );
      }
      if (reference.imageRef !== step.inputImages[index]) {
        throw new PromptAdmissionBlockedBeforeProviderCall(
          `持久化参考图快照 inputReferences[${index}].imageRef 与 inputImages[${index}] 不一致。`,
        );
      }
    });
    return {
      images: [...step.inputImages],
      references: references.map((reference) => ({ ...reference })),
      providerImages: step.inputImages.map(() => undefined),
    };
  }
  const rows = await query<{
    node_id: string;
    output_images_json: string;
    provider_images_json: string;
  }>(`
    SELECT node_id, output_images_json, provider_images_json FROM generation_run_steps
    WHERE run_id = $1 AND status = 'succeeded'
  `, [runId]);
  const outputs = new Map(rows.map((row) => [row.node_id, parseJson<string[]>(row.output_images_json, [])]));
  const providerOutputs = new Map(rows.map((row) => [
    row.node_id,
    parseJson<string[]>(row.provider_images_json, []),
  ]));
  const runtimeInputs = step.upstream.flatMap((upstream) => {
    const images = outputs.get(upstream.nodeId) ?? upstream.images;
    const providerImages = providerOutputs.get(upstream.nodeId) ?? [];
    const explicitRole = isReferenceRole(upstream.referenceRole)
      ? upstream.referenceRole
      : undefined;
    return images.map((imageRef, index) => ({
      imageRef,
      providerImage: providerImages.length === images.length ? providerImages[index] : undefined,
      role: explicitRole ?? "generic",
      sourceNodeId: upstream.nodeId,
      order: 0,
      // A stale false confirmation bit cannot turn a missing/invalid role into
      // an accepted generic reference. Only an explicit supported role may be confirmed.
      roleNeedsConfirmation: explicitRole === undefined || upstream.roleNeedsConfirmation !== false,
    }));
  }).map((reference, order) => ({ ...reference, order }));
  const references = runtimeInputs.map(({ providerImage: _providerImage, ...reference }) => reference);
  return {
    images: references.map((reference) => reference.imageRef),
    references,
    providerImages: runtimeInputs.map((reference) => reference.providerImage),
  };
}

async function markAttemptStarted(
  job: ClaimedJob,
  workerId: string,
  now: number,
  leaseMs: number,
  providerRequest: number,
  request: ImageGenRequest,
  evaluationCodeIdentity?: EvaluationCodeIdentity,
): Promise<void> {
  const evaluationPolicy = persistedEvaluationPolicy(job);
  await transaction(async (client) => {
    const row = (await client.query<{
      status: DurableRunStatus;
      worker_id: string | null;
      owner_id: string;
      run_type: "workflow" | "direct" | "evaluation";
      evaluation_case_id: string | null;
      evaluation_authorization_id: string | null;
      evaluation_campaign_id: string | null;
      evaluation_slot_id: string | null;
    }>(`
      SELECT j.status, j.worker_id, r.owner_id, r.run_type,
        r.evaluation_case_id, r.evaluation_authorization_id,
        r.evaluation_campaign_id, r.evaluation_slot_id
      FROM generation_jobs j
      JOIN generation_runs r ON r.id = j.run_id
      WHERE j.id = $1 AND r.deleted_at IS NULL
      FOR UPDATE OF j
    `,
      [job.id],
    )).rows[0];
    if (!row || row.worker_id !== workerId) throw new Error("generation job lease was lost");
    if (row.status === "cancel_requested") throw new CancelledBeforeProviderCall();
    if (row.status !== "running") throw new Error(`generation job is ${row.status}`);
    if (row.run_type === "evaluation") {
      if (
        !row.evaluation_case_id
        || !row.evaluation_authorization_id
        || !row.evaluation_campaign_id
        || !row.evaluation_slot_id
        || !evaluationPolicy
      ) throw new Error("evaluation run lost its authorization/campaign/slot binding");
      await startEvaluationProviderRequestEvidence(client, {
        runId: job.runId,
        ownerId: row.owner_id,
        plan: { steps: [job.step] },
        step: job.step,
        policy: evaluationPolicy,
        requestIndex: providerRequest,
        request,
        startedAt: now,
        ...(evaluationCodeIdentity ? { codeIdentity: evaluationCodeIdentity } : {}),
      });
    }
    await client.query(`
      UPDATE generation_jobs SET attempt_started_at = COALESCE(attempt_started_at, $1),
        lease_expires_at = $2, updated_at = $1 WHERE id = $3
    `, [now, now + leaseMs, job.id]);
    await client.query(`
      UPDATE generation_run_steps SET provider_requests = provider_requests + 1 WHERE id = $1
    `, [job.stepId]);
  });
}

async function assertJobOwnedForCompletion(job: ClaimedJob, workerId: string): Promise<void> {
  const row = await queryOne<{ status: DurableRunStatus; worker_id: string | null }>(`
    SELECT j.status, j.worker_id FROM generation_jobs j
    JOIN generation_runs r ON r.id = j.run_id
    WHERE j.id = $1 AND r.deleted_at IS NULL
  `,
    [job.id],
  );
  if (
    !row ||
    row.worker_id !== workerId ||
    (row.status !== "running" && row.status !== "cancel_requested")
  ) {
    throw new Error("generation job lease was lost before image persistence");
  }
}

async function persistStepImages(
  images: string[],
  job: ClaimedJob,
): Promise<PersistedImageReceipt[]> {
  const persisted: PersistedImageReceipt[] = [];
  try {
    for (const [index, image] of images.entries()) {
      persisted.push(await persistImageRefWithReceipt(image, `${job.runId}:${job.stepId}:${index}`));
    }
    return persisted;
  } catch (error) {
    for (const receipt of persisted) {
      if (receipt.created) deleteStoredImage(receipt.id);
    }
    throw error;
  }
}

async function captureProviderOriginals(
  artifact: {
    providerRequest: number;
    images: string[];
    model: string;
    providerOutputSizes?: Array<string | null>;
    providerRequestId?: string;
  },
  job: ClaimedJob,
  workerId: string,
  offset: number,
  createdAt: number,
): Promise<PersistedImageReceipt[]> {
  const evaluationPolicy = persistedEvaluationPolicy(job);
  await assertJobOwnedForCompletion(job, workerId);
  const persisted: PersistedImageReceipt[] = [];
  try {
    for (const [index, image] of artifact.images.entries()) {
      // Provider responses must become immutable evidence copies even if a mock or
      // future adapter returns an existing internal file reference.
      const evidenceSource = image.startsWith("/api/files/")
        ? await normalizeImageRef(image)
        : image;
      persisted.push(await persistImageRefWithReceipt(
        evidenceSource,
        `${job.runId}:${job.stepId}:provider:${offset + index}`,
      ));
    }
    await transaction(async (client) => {
      const locked = (await client.query<{ status: DurableRunStatus; worker_id: string | null }>(
        "SELECT status, worker_id FROM generation_jobs WHERE id = $1 FOR UPDATE",
        [job.id],
      )).rows[0];
      if (
        !locked || locked.worker_id !== workerId
        || (locked.status !== "running" && locked.status !== "cancel_requested")
      ) {
        throw new Error("generation job lease was lost before Provider original capture");
      }
      const run = await lockRun(client, job.runId);
      if (!run) throw new Error("generation run disappeared during Provider original capture");
      const step = (await client.query<{ provider_images_json: string }>(`
        SELECT provider_images_json FROM generation_run_steps WHERE id = $1 FOR UPDATE
      `, [job.stepId])).rows[0];
      if (!step) throw new Error("generation step disappeared during Provider original capture");
      const current = parseJson<string[]>(step.provider_images_json, []);
      const urls = persisted.map((image) => image.url);
      if (current.length !== offset) {
        throw new Error("Provider original capture order drifted");
      }
      await client.query(
        "UPDATE generation_run_steps SET provider_images_json = $1 WHERE id = $2",
        [JSON.stringify([...current, ...urls]), job.stepId],
      );
      for (const image of persisted) {
        await client.query(`
          INSERT INTO files (id, owner_id, source_type, project_id, node_id, run_id, created_at)
          VALUES ($1, $2, 'provider-original', $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [
          image.id, run.owner_id, run.project_id, job.nodeId, run.id,
          new Date(createdAt).toISOString(),
        ]);
      }
      await recordEvaluationProviderRequestSuccess(client, {
        runId: job.runId,
        policy: evaluationPolicy,
        requestIndex: artifact.providerRequest,
        providerModel: artifact.model,
        providerOutputSizes: artifact.providerOutputSizes,
        providerOriginalStorageRefs: urls,
        providerRequestId: artifact.providerRequestId,
        finishedAt: createdAt,
      });
    });
    return persisted;
  } catch (error) {
    for (const receipt of persisted) {
      if (!receipt.created) continue;
      const registered = await queryOne<{ id: string }>("SELECT id FROM files WHERE id = $1", [receipt.id])
        .catch(() => ({ id: receipt.id }));
      if (!registered) deleteStoredImage(receipt.id);
    }
    throw error;
  }
}

async function compensatePersistedImages(
  persisted: PersistedImageReceipt[],
  job: ClaimedJob,
  workerId: string,
): Promise<void> {
  const owner = await queryOne<{ status: DurableRunStatus; worker_id: string | null }>(
    "SELECT status, worker_id FROM generation_jobs WHERE id = $1",
    [job.id],
  ).catch(() => undefined);
  if (
    owner &&
    owner.worker_id !== workerId &&
    (owner.status === "running" || owner.status === "cancel_requested")
  ) {
    return;
  }
  for (const receipt of persisted) {
    if (!receipt.created) continue;
    const registered = await queryOne<{ id: string }>("SELECT id FROM files WHERE id = $1", [receipt.id])
      .catch(() => ({ id: receipt.id }));
    if (!registered) deleteStoredImage(receipt.id);
  }
}

async function finalizeSuccessfulRun(
  client: PoolClient,
  run: DurableRunRow,
  finishedAt: number,
  cancellationWarning?: string,
): Promise<void> {
  const target = run.target_step_id
      ? (await client.query<{
        output_images_json: string; prompts_json: string; provider_output_sizes_json: string;
        provider_images_json: string; reference_inputs_json: string;
        failures_json: string; model: string | null;
      }>(`
        SELECT output_images_json, prompts_json, provider_output_sizes_json,
          provider_images_json, reference_inputs_json, failures_json, model
        FROM generation_run_steps WHERE id = $1
      `, [run.target_step_id])).rows[0]
    : undefined;
  const images = parseJson<string[]>(target?.output_images_json ?? "[]", []);
  const prompts = parseJson<string[]>(target?.prompts_json ?? "[]", []);
  const providerOutputSizes = parseJson<Array<string | null>>(target?.provider_output_sizes_json ?? "[]", []);
  const providerImages = parseJson<string[]>(target?.provider_images_json ?? "[]", []);
  const failures = parseJson<Array<{ prompt?: string; error: string }>>(target?.failures_json ?? "[]", []);
  const aggregate = (await client.query<{ provider_requests: number; model: string | null }>(`
    SELECT COALESCE(SUM(provider_requests), 0)::int AS provider_requests,
      (ARRAY_AGG(model ORDER BY step_index DESC) FILTER (WHERE model IS NOT NULL))[1] AS model
    FROM generation_run_steps WHERE run_id = $1
  `, [run.id])).rows[0];
  await client.query("DELETE FROM generation_outputs WHERE run_id = $1", [run.id]);
  for (const [index, image] of images.entries()) {
    await client.query(`
      INSERT INTO generation_outputs (
        id, run_id, image, provider_image, prompt, provider_output_size, status, error, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'success', NULL, $7)
    `, [
      nanoid(12), run.id, image, providerImages[index] ?? null, prompts[index] ?? null,
      providerOutputSizes[index] ?? null, finishedAt + index,
    ]);
  }
  for (const [index, failure] of failures.entries()) {
    await client.query(`
      INSERT INTO generation_outputs (id, run_id, image, prompt, status, error, created_at)
      VALUES ($1, $2, '', $3, 'error', $4, $5)
    `, [nanoid(12), run.id, failure.prompt ?? null, failure.error, finishedAt + images.length + index]);
  }
  const warning = cancellationWarning ?? (failures.length ? `${failures.length} 个生成任务失败` : null);
  const model = target?.model ?? aggregate?.model ?? null;
  const providerRequests = aggregate?.provider_requests ?? 0;
  if (providerImages.length > 0 && providerImages.length !== images.length) {
    throw new Error("Target Provider evidence cardinality does not match business outputs");
  }
  if (providerRequests > 0 && images.length > 0 && providerImages.length !== images.length) {
    throw new Error("A paid successful run cannot finalize without per-output Provider evidence");
  }
  await client.query(`
    UPDATE generation_runs SET status = 'succeeded', successful_count = $1, provider_requests = $2,
      model = $3, error = $4, finished_at = $5, updated_at = $5,
      billing_reconciliation_status = CASE
        WHEN run_type = 'evaluation' AND $2 > 0 THEN 'pending'
        ELSE billing_reconciliation_status
      END
    WHERE id = $6
  `, [images.length, providerRequests, model, warning, finishedAt, run.id]);
  if (images.length > 0) {
    await client.query(`
      INSERT INTO usage_events (
        id, owner_id, run_id, project_id, node_id, model, successful_count,
        provider_requests, duration_ms, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (run_id) DO UPDATE SET
        model = excluded.model, successful_count = excluded.successful_count,
        provider_requests = excluded.provider_requests, duration_ms = excluded.duration_ms,
        created_at = excluded.created_at
    `, [
      nanoid(12), run.owner_id, run.id, run.project_id, run.node_id, model, images.length,
      providerRequests, Math.max(0, finishedAt - run.started_at), new Date(finishedAt).toISOString(),
    ]);
  }
  await appendRunEvent(client, run.id, { type: "done" }, finishedAt);
}

async function finalizeCancelledTargetRun(
  client: PoolClient,
  run: DurableRunRow,
  targetNodeId: string,
  message: string,
  finishedAt: number,
): Promise<void> {
  const aggregate = (await client.query<{ provider_requests: number; model: string | null }>(`
    SELECT COALESCE(SUM(provider_requests), 0)::int AS provider_requests,
      (ARRAY_AGG(model ORDER BY step_index DESC) FILTER (WHERE model IS NOT NULL))[1] AS model
    FROM generation_run_steps WHERE run_id = $1
  `, [run.id])).rows[0];
  await client.query("DELETE FROM generation_outputs WHERE run_id = $1", [run.id]);
  await client.query(`
    UPDATE generation_runs SET status = 'cancelled', successful_count = 0, provider_requests = $1,
      model = $2, error = $3, finished_at = $4, updated_at = $4 WHERE id = $5
  `, [aggregate?.provider_requests ?? 0, aggregate?.model ?? null, message, finishedAt, run.id]);
  await appendRunEvent(client, run.id, {
    type: "node-status", nodeId: targetNodeId, status: "cancelled", error: message, finishedAt,
  }, finishedAt);
  await appendRunEvent(client, run.id, { type: "done" }, finishedAt);
}

async function completeJobSuccess(
  job: ClaimedJob,
  workerId: string,
  result: StepResult,
  persistedImages: PersistedImageReceipt[],
  providerImageUrls: string[],
  persistedProviderImages: PersistedImageReceipt[],
  runtimeReferenceImages: string[],
  finishedAt: number,
): Promise<void> {
  const imageUrls = persistedImages.map((image) => image.url);
  const isProviderStep = Boolean(NODE_SPECS[job.step.kind].providerId);
  if (providerImageUrls.length > 0 && providerImageUrls.length !== imageUrls.length) {
    throw new Error("Provider originals and business outputs must have identical cardinality");
  }
  if (isProviderStep && persistedProviderImages.length !== imageUrls.length) {
    throw new Error("Provider step completion requires one captured original per business output");
  }
  const referenceEvidence = (result.references ?? []).map((reference: ReferenceImageInput) => ({
    role: reference.role,
    order: reference.order,
    assetSha256: reference.assetSha256,
    ...(reference.sourceNodeId ? { sourceNodeId: reference.sourceNodeId } : {}),
    roleNeedsConfirmation: reference.roleNeedsConfirmation !== false,
  }));
  const evaluationPolicy = persistedEvaluationPolicy(job);
  await transaction(async (client) => {
    const locked = (await client.query<{ status: DurableRunStatus; worker_id: string | null }>(
      "SELECT status, worker_id FROM generation_jobs WHERE id = $1 FOR UPDATE",
      [job.id],
    )).rows[0];
    if (
      !locked ||
      locked.worker_id !== workerId ||
      (locked.status !== "running" && locked.status !== "cancel_requested")
    ) {
      throw new Error("generation job lease was lost before completion");
    }
    const run = await lockRun(client, job.runId);
    if (!run) throw new Error("generation run disappeared");
    const cancellationWarning = locked.status === "cancel_requested" ? CANCELLED_AFTER_START_WARNING : undefined;
    await client.query(`
      UPDATE generation_jobs SET status = 'succeeded', worker_id = NULL, lease_expires_at = NULL,
        updated_at = $1, last_error = NULL WHERE id = $2
    `, [finishedAt, job.id]);
    await client.query(`
      UPDATE generation_run_steps SET status = 'succeeded', model = $1, output_images_json = $2,
        provider_images_json = $3, reference_inputs_json = $4,
        prompts_json = $5, provider_output_sizes_json = $6, failures_json = $7,
        error = $8, finished_at = $9
      WHERE id = $10
    `, [
      result.model ?? null, JSON.stringify(imageUrls), JSON.stringify(providerImageUrls),
      JSON.stringify(referenceEvidence), JSON.stringify(result.prompts ?? []),
      JSON.stringify(result.providerOutputSizes ?? []), JSON.stringify(result.failures ?? []),
      cancellationWarning ?? null, finishedAt, job.stepId,
    ]);
    if (run.target_step_id === job.stepId) {
      await client.query(
        "UPDATE generation_runs SET reference_inputs_json = $1, reference_images_json = $2 WHERE id = $3",
        [JSON.stringify(referenceEvidence), JSON.stringify(runtimeReferenceImages), run.id],
      );
    }
    for (const image of persistedImages) {
      if (!image.url.startsWith("/api/files/")) continue;
      await client.query(`
        INSERT INTO files (id, owner_id, source_type, project_id, node_id, run_id, created_at)
        VALUES ($1, $2, 'generated', $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING
      `, [image.id, run.owner_id, run.project_id, job.nodeId, run.id, new Date(finishedAt).toISOString()]);
    }
    for (const image of persistedProviderImages) {
      if (!image.url.startsWith("/api/files/")) continue;
      await client.query(`
        INSERT INTO files (id, owner_id, source_type, project_id, node_id, run_id, created_at)
        VALUES ($1, $2, 'provider-original', $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING
      `, [image.id, run.owner_id, run.project_id, job.nodeId, run.id, new Date(finishedAt).toISOString()]);
    }
    await completeEvaluationCaseEvidence(client, {
      runId: job.runId,
      policy: evaluationPolicy,
      postprocessedStorageRefs: imageUrls,
      finishedAt,
    });
    const partialWarning = result.failures?.length ? `${result.failures.length} 个生成任务失败` : undefined;
    await appendRunEvent(client, run.id, {
      type: "node-status",
      nodeId: job.nodeId,
      status: "success",
      images: imageUrls,
      model: result.model,
      prompts: result.prompts,
      providerOutputSizes: result.providerOutputSizes,
      failures: result.failures,
      error: cancellationWarning ?? partialWarning,
      startedAt: job.startedAt,
      finishedAt,
    }, finishedAt);

    if (cancellationWarning) {
      await client.query(`
        UPDATE generation_jobs SET status = 'cancelled', worker_id = NULL, lease_expires_at = NULL, updated_at = $1
        WHERE run_id = $2 AND status IN ('queued','retry_wait','cancel_requested')
      `, [finishedAt, run.id]);
      await client.query(`
        UPDATE generation_run_steps SET status = 'cancelled', finished_at = $1, error = '用户取消了后续步骤'
        WHERE run_id = $2 AND status IN ('queued','retry_wait','cancel_requested')
      `, [finishedAt, run.id]);
    }

    const active = (await client.query<{ count: number }>(`
      SELECT COUNT(*)::int AS count FROM generation_jobs
      WHERE run_id = $1 AND status IN ('queued','running','retry_wait','cancel_requested')
    `, [run.id])).rows[0]?.count ?? 0;
    if (active === 0) {
      const target = run.target_step_id
        ? (await client.query<{ status: DurableRunStatus; node_id: string; error: string | null }>(`
            SELECT status, node_id, error FROM generation_run_steps WHERE id = $1
          `, [run.target_step_id])).rows[0]
        : undefined;
      if (target?.status === "cancelled") {
        await finalizeCancelledTargetRun(
          client,
          run,
          target.node_id,
          target.error ?? "用户取消了目标步骤",
          finishedAt,
        );
      } else if (target?.status === "succeeded" || !target) {
        await finalizeSuccessfulRun(client, run, finishedAt, cancellationWarning);
      } else {
        throw new Error(`generation target step ended as ${target.status}`);
      }
    } else {
      await client.query("UPDATE generation_runs SET status = 'running', updated_at = $1 WHERE id = $2", [finishedAt, run.id]);
    }
  });
}

async function terminateRun(
  client: PoolClient,
  row: JobLockRow,
  status: "failed" | "outcome_unknown" | "cancelled",
  message: string,
  finishedAt: number,
  phase: EvaluationErrorPhase = "provider",
): Promise<void> {
  const run = await lockRun(client, row.run_id);
  if (!run || isTerminalRunStatus(run.status)) return;
  let evaluationPolicy: EvaluationRunPolicy | undefined;
  let terminalMessage = message;
  let policyIntegrityFailure: string | undefined;
  try {
    evaluationPolicy = persistedEvaluationPolicyFromRow(row);
  } catch (error) {
    policyIntegrityFailure = error instanceof Error ? error.message : String(error);
    terminalMessage = `${message}；评估证据策略快照损坏：${policyIntegrityFailure}`;
  }
  await client.query(`
    UPDATE generation_jobs SET status = $1, worker_id = NULL, lease_expires_at = NULL,
      last_error = $2, updated_at = $3 WHERE id = $4
  `, [status, terminalMessage, finishedAt, row.id]);
  await client.query(`
    UPDATE generation_run_steps SET status = $1, error = $2, finished_at = $3 WHERE id = $4
  `, [status, terminalMessage, finishedAt, row.step_id]);
  await client.query(`
    UPDATE generation_jobs SET status = 'cancelled', worker_id = NULL, lease_expires_at = NULL,
      last_error = $1, updated_at = $2
    WHERE run_id = $3 AND id <> $4 AND status IN ('queued','retry_wait','cancel_requested')
  `, ["上游步骤未完成，后续任务已停止", finishedAt, row.run_id, row.id]);
  await client.query(`
    UPDATE generation_run_steps SET status = 'cancelled', error = $1, finished_at = $2
    WHERE run_id = $3 AND id <> $4 AND status IN ('queued','retry_wait','cancel_requested')
  `, ["上游步骤未完成，后续任务已停止", finishedAt, row.run_id, row.step_id]);
  const aggregate = (await client.query<{ provider_requests: number; model: string | null }>(`
    SELECT COALESCE(SUM(provider_requests), 0)::int AS provider_requests,
      (ARRAY_AGG(model ORDER BY step_index DESC) FILTER (WHERE model IS NOT NULL))[1] AS model
    FROM generation_run_steps WHERE run_id = $1
  `, [row.run_id])).rows[0];
  await failEvaluationCaseEvidence(client, {
    runId: row.run_id,
    policy: evaluationPolicy,
    outcome: status,
    phase,
    code: status === "outcome_unknown" ? "provider-outcome-unknown" : `evaluation-${status}`,
    message: terminalMessage,
    finishedAt,
    hardBlockers: policyIntegrityFailure ? [{
      code: "evidence-integrity-failure",
      detail: policyIntegrityFailure,
    }] : undefined,
  });
  if (!evaluationPolicy && row.run_type === "evaluation") {
    if (!row.evaluation_campaign_id || !row.evaluation_slot_id || !row.evaluation_authorization_id) {
      throw new Error("evaluation run lost its campaign/slot binding before terminal closure");
    }
    await finalizeEvaluationCampaignSlot(client, {
      campaignId: row.evaluation_campaign_id,
      slotId: row.evaluation_slot_id,
      authorizationId: row.evaluation_authorization_id,
      runId: row.run_id,
      outcome: status,
    });
  }
  await client.query(`
    UPDATE generation_runs SET status = $1, error = $2, provider_requests = $3,
      model = COALESCE($4, model), finished_at = $5, updated_at = $5,
      billing_reconciliation_status = CASE
        WHEN run_type = 'evaluation' AND $3 > 0 THEN 'pending'
        ELSE billing_reconciliation_status
      END
    WHERE id = $6
  `, [status, terminalMessage, aggregate?.provider_requests ?? 0, aggregate?.model ?? null, finishedAt, row.run_id]);
  await client.query("DELETE FROM generation_outputs WHERE run_id = $1", [row.run_id]);
  if (status === "failed") {
    await client.query(`
      INSERT INTO generation_outputs (id, run_id, image, status, error, created_at)
      VALUES ($1, $2, '', 'error', $3, $4)
    `, [nanoid(12), row.run_id, terminalMessage, finishedAt]);
  }
  const clientStatus = status === "failed" ? "error" : status;
  await appendRunEvent(client, row.run_id, {
    type: "node-status", nodeId: row.node_id, status: clientStatus, error: terminalMessage,
    startedAt: row.step_started_at ?? undefined, finishedAt,
  } as RunEvent, finishedAt);
  if (status === "failed") {
    await appendRunEvent(client, row.run_id, {
      type: "run-error", nodeId: row.node_id, error: terminalMessage, finishedAt,
    }, finishedAt);
  } else {
    await appendRunEvent(client, row.run_id, { type: "done" }, finishedAt);
  }
}

async function handleJobError(
  job: ClaimedJob,
  workerId: string,
  error: unknown,
  options: ProcessGenerationJobOptions,
  phase: EvaluationErrorPhase,
): Promise<void> {
  const now = options.now?.() ?? Date.now();
  const message = error instanceof CancelledBeforeProviderCall
    ? error.message
    : error instanceof ProviderError
      ? publicProviderErrorMessage(error)
      : error instanceof Error ? error.message : String(error);
  if (error instanceof ProviderError) {
    console.error("[ai-provider-worker-failure]", JSON.stringify({
      runId: job.runId, nodeId: job.nodeId, providerId: error.providerId, status: error.status ?? null,
      category: error.category, retryCount: job.retryCount, requestId: error.requestId ?? null,
      diagnostic: sanitizedProviderDiagnostic(error) ?? error.message,
    }));
  }
  await transaction(async (client) => {
    const row = (await client.query<JobLockRow>(`
      SELECT j.id, j.run_id, j.step_id, j.status, j.retry_count, j.attempt_started_at, j.worker_id,
        s.node_id, s.step_index, s.step_json, s.started_at AS step_started_at,
        r.target_step_id, r.run_type, r.retry_policy,
        r.evaluation_case_id, r.evaluation_authorization_id,
        r.evaluation_campaign_id, r.evaluation_slot_id
      FROM generation_jobs j JOIN generation_run_steps s ON s.id = j.step_id
      JOIN generation_runs r ON r.id = j.run_id
      WHERE j.id = $1 AND r.deleted_at IS NULL FOR UPDATE OF j
    `, [job.id])).rows[0];
    if (!row || (row.worker_id !== workerId && row.status !== "cancel_requested")) return;
    if (error instanceof CancelledBeforeProviderCall) {
      await terminateRun(client, row, "cancelled", message, now, phase);
      return;
    }
    if (error instanceof ProviderError && error.category === "outcome_unknown") {
      await terminateRun(client, row, "outcome_unknown", outcomeUnknownMessage(message), now, phase);
      return;
    }
    if (row.status === "cancel_requested") {
      await terminateRun(client, row, "cancelled", "用户取消了任务，系统未继续重试", now, phase);
      return;
    }
    if (row.retry_policy === "no-retry") {
      await terminateRun(
        client,
        row,
        "failed",
        `真实评估采用 no-retry，未自动重放：${message}`,
        now,
        phase,
      );
      return;
    }
    const retryDelays = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
    const maxRetries = Math.min(retryDelays.length, DEFAULT_RETRY_DELAYS_MS.length);
    if (isRetryableProviderError(error) && row.retry_count < maxRetries) {
      const retryNumber = row.retry_count + 1;
      const baseDelay = retryDelays[row.retry_count] ?? DEFAULT_RETRY_DELAYS_MS[row.retry_count];
      const jitter = Math.floor((options.random?.() ?? Math.random()) * 1_000);
      const availableAt = now + Math.max(0, baseDelay) + jitter;
      console.warn("[generation-job-retry]", JSON.stringify({
        runId: row.run_id, nodeId: row.node_id, retryCount: retryNumber,
        delayMs: Math.max(0, baseDelay) + jitter, exhausted: false,
      }));
      await lockRun(client, row.run_id);
      await client.query(`
        UPDATE generation_jobs SET status = 'retry_wait', retry_count = $1, available_at = $2,
          worker_id = NULL, lease_expires_at = NULL, attempt_started_at = NULL, last_error = $3, updated_at = $4
        WHERE id = $5
      `, [retryNumber, availableAt, message, now, row.id]);
      await client.query(`
        UPDATE generation_run_steps SET status = 'retry_wait', error = $1 WHERE id = $2
      `, [message, row.step_id]);
      await client.query("UPDATE generation_runs SET status = 'retry_wait', error = $1, updated_at = $2 WHERE id = $3", [
        message, now, row.run_id,
      ]);
      await appendRunEvent(client, row.run_id, {
        type: "node-status", nodeId: row.node_id, status: "retry_wait", error: message,
        startedAt: row.step_started_at ?? job.startedAt,
      }, now);
      return;
    }
    if (isRetryableProviderError(error)) {
      console.warn("[generation-job-retry]", JSON.stringify({
        runId: row.run_id, nodeId: row.node_id, retryCount: row.retry_count,
        delayMs: null, exhausted: true,
      }));
    }
    await terminateRun(client, row, "failed", message, now, phase);
  });
}

export async function recoverExpiredGenerationJobs(now = Date.now()): Promise<number> {
  return transaction(async (client) => {
    const rows = (await client.query<JobLockRow>(`
      SELECT j.id, j.run_id, j.step_id, j.status, j.retry_count, j.attempt_started_at, j.worker_id,
        s.node_id, s.step_index, s.step_json, s.started_at AS step_started_at,
        r.target_step_id, r.run_type, r.retry_policy,
        r.evaluation_case_id, r.evaluation_authorization_id,
        r.evaluation_campaign_id, r.evaluation_slot_id
      FROM generation_jobs j JOIN generation_run_steps s ON s.id = j.step_id
      JOIN generation_runs r ON r.id = j.run_id
      WHERE j.status IN ('running','cancel_requested')
        AND j.lease_expires_at < $1
        AND r.deleted_at IS NULL
      ORDER BY j.lease_expires_at ASC FOR UPDATE OF j SKIP LOCKED LIMIT 50
    `, [now])).rows;
    for (const row of rows) {
      if (row.attempt_started_at !== null) {
        if (row.run_type === "evaluation") {
          const evidence = (await client.query<EvaluationRecoveryEvidenceSummary>(`
            SELECT
              COUNT(*)::int AS request_count,
              COUNT(*) FILTER (WHERE outcome IN ('started','outcome_unknown'))::int
                AS ambiguous_request_count,
              COUNT(*) FILTER (WHERE outcome = 'succeeded')::int AS succeeded_request_count,
              COALESCE(SUM(output_count) FILTER (WHERE outcome = 'succeeded'), 0)::int
                AS succeeded_output_count,
              (
                SELECT COUNT(*)::int FROM evaluation_image_evidence images
                WHERE images.run_id = $1 AND images.layer = 'provider-original'
              ) AS provider_original_count
            FROM evaluation_provider_request_evidence requests
            WHERE requests.run_id = $1
          `, [row.run_id])).rows[0];
          if (evidence && evidence.request_count > 0 && evidence.ambiguous_request_count === 0) {
            const providerSucceeded = evidence.succeeded_request_count > 0;
            const originalsComplete = providerSucceeded
              && evidence.succeeded_output_count > 0
              && evidence.provider_original_count === evidence.succeeded_output_count;
            const phase: EvaluationErrorPhase = providerSucceeded
              ? originalsComplete ? "postprocess" : "provider-persist"
              : "provider";
            const message = originalsComplete
              ? "Worker 在 Provider 请求已确认成功且原图已持久化后中断；本次评估按后处理失败关闭，不进入待核对队列"
              : providerSucceeded
                ? "Worker 在 Provider 请求已确认成功后中断，但原图证据不完整；本次评估按证据持久化失败关闭"
                : "Worker 在 Provider 请求已记录为确定失败后中断；本次评估按确定失败关闭，不进入待核对队列";
            await terminateRun(client, row, "failed", message, now, phase);
            continue;
          }
        }
        await terminateRun(
          client, row, "outcome_unknown",
          outcomeUnknownMessage("Worker 在上游调用开始后中断，结果可能已经生成；系统不会自动重试"), now,
        );
        continue;
      }
      if (row.status === "cancel_requested") {
        await terminateRun(client, row, "cancelled", "任务已在上游调用开始前取消", now);
        continue;
      }
      await lockRun(client, row.run_id);
      await client.query(`
        UPDATE generation_jobs SET status = 'queued', worker_id = NULL, lease_expires_at = NULL,
          available_at = $1, updated_at = $1 WHERE id = $2
      `, [now, row.id]);
      await client.query("UPDATE generation_run_steps SET status = 'queued', error = NULL WHERE id = $1", [row.step_id]);
      await client.query("UPDATE generation_runs SET status = 'queued', error = NULL, updated_at = $1 WHERE id = $2", [now, row.run_id]);
      await appendRunEvent(client, row.run_id, {
        type: "node-status", nodeId: row.node_id, status: "queued",
        error: "Worker 租约过期，任务已安全重新排队",
      }, now);
    }
    return rows.length;
  });
}

export async function processNextGenerationJob(
  workerId: string,
  options: ProcessGenerationJobOptions = {},
): Promise<boolean> {
  const now = options.now?.() ?? Date.now();
  const leaseMs = options.leaseMs ?? DEFAULT_LEASE_MS;
  await recoverExpiredGenerationJobs(now);
  const job = await claimNextJob(workerId, now, leaseMs);
  if (!job) return false;
  const heartbeatMs = options.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
  const heartbeat = setInterval(() => {
    const heartbeatNow = options.now?.() ?? Date.now();
    void db().query(`
      UPDATE generation_jobs SET lease_expires_at = $1, updated_at = $2
      WHERE id = $3 AND worker_id = $4 AND status IN ('running','cancel_requested')
    `, [heartbeatNow + leaseMs, heartbeatNow, job.id, workerId]).catch((error) => {
      console.error("[garment-canvas] generation lease heartbeat failed", error);
    });
  }, heartbeatMs);
  heartbeat.unref();
  let failurePhase: EvaluationErrorPhase = "admission";
  try {
    const preflightAdmission = evaluateClaimedJobPromptAdmission(job);
    if (!preflightAdmission.allowed) {
      throw new PromptAdmissionBlockedBeforeProviderCall(preflightAdmission.reason);
    }
    const input = await inputImagesForStep(job.runId, job.step);
    const capturedProviderReceipts: PersistedImageReceipt[] = [];
    const result = await executeStep(
      job.step,
      input.images,
      options.resolveProvider ?? getProvider,
      {
        runId: job.runId,
        referenceSources: input.references,
        inputProviderImages: input.providerImages,
        beforeProviderCall: async (providerRequest, request) => {
          const runtimeUserReferences = runtimeUserReferenceInputs(job, request);
          const admission = evaluateClaimedJobPromptAdmission(
            job,
            runtimeUserReferences.map((reference) => ({
              role: reference.role,
              order: reference.order,
              roleNeedsConfirmation: reference.roleNeedsConfirmation,
            })),
          );
          if (!admission.allowed) {
            throw new PromptAdmissionBlockedBeforeProviderCall(admission.reason);
          }
          assertEvaluationRuntimeReferenceBinding(job, runtimeUserReferences);
          await markAttemptStarted(
            job,
            workerId,
            options.now?.() ?? Date.now(),
            leaseMs,
            providerRequest,
            request,
            options.evaluationCodeIdentity,
          );
          failurePhase = "provider";
        },
        onProviderCallError: async ({ providerRequest, error }) => {
          const evaluationPolicy = persistedEvaluationPolicy(job);
          await transaction((client) => recordEvaluationProviderRequestFailure(client, {
            runId: job.runId,
            policy: evaluationPolicy,
            requestIndex: providerRequest,
            outcome: error instanceof ProviderError && error.category === "outcome_unknown"
              ? "outcome_unknown"
              : "failed",
            errorCategory: error instanceof ProviderError ? error.category : "provider-error",
            errorMessage: error instanceof Error ? error.message : String(error),
            providerRequestId: error instanceof ProviderError ? error.requestId : undefined,
            finishedAt: options.now?.() ?? Date.now(),
          }));
        },
        captureProviderImages: async (artifact) => {
          failurePhase = "provider-persist";
          const captured = await captureProviderOriginals(
            artifact,
            job,
            workerId,
            capturedProviderReceipts.length,
            options.now?.() ?? Date.now(),
          );
          capturedProviderReceipts.push(...captured);
          failurePhase = "postprocess";
          return captured.map((image) => image.url);
        },
      },
    );
    await assertJobOwnedForCompletion(job, workerId);
    const providerImageUrls = result.providerImages ?? capturedProviderReceipts.map((image) => image.url);
    if (providerImageUrls.length > 0 && providerImageUrls.length !== result.images.length) {
      throw new Error("Provider originals and business outputs must have identical cardinality");
    }
    if (capturedProviderReceipts.length > 0 && (
      capturedProviderReceipts.length !== providerImageUrls.length
      || capturedProviderReceipts.some((image, index) => image.url !== providerImageUrls[index])
    )) {
      throw new Error("Captured Provider originals drifted from the step result");
    }
    const persistedImages: PersistedImageReceipt[] = [];
    try {
      persistedImages.push(...await persistStepImages(result.images, job));
      failurePhase = "completion-persist";
      await completeJobSuccess(
        job,
        workerId,
        result,
        persistedImages,
        providerImageUrls,
        capturedProviderReceipts,
        input.images,
        options.now?.() ?? Date.now(),
      );
    } catch (error) {
      // Provider originals are already durable evidence and must survive post-processing/completion failure.
      await compensatePersistedImages(persistedImages, job, workerId);
      throw error;
    }
  } catch (error) {
    await handleJobError(job, workerId, error, options, failurePhase);
  } finally {
    clearInterval(heartbeat);
  }
  return true;
}

export function startGenerationWorker(): () => void {
  const workerId = `${os.hostname()}:${process.pid}:${nanoid(6)}`;
  let stopped = false;
  let busy = false;
  const tick = async () => {
    if (stopped || busy) return;
    busy = true;
    try {
      while (!stopped && await processNextGenerationJob(workerId)) {
        // Drain immediately available work before returning to the poll interval.
      }
    } catch (error) {
      console.error("[garment-canvas] generation worker failed", error);
    } finally {
      busy = false;
    }
  };
  const pollMs = config.generationWorkerPollMs();
  const timer = setInterval(() => void tick(), pollMs);
  timer.unref();
  void tick();
  return () => {
    stopped = true;
    clearInterval(timer);
  };
}

export async function getDurableRunForUser(
  runId: string,
  ownerId: string,
): Promise<{ id: string; status: string; finished: boolean } | undefined> {
  const row = await queryOne<{ id: string; status: string }>(`
    SELECT id, status FROM generation_runs
    WHERE id = $1 AND owner_id = $2 AND plan_json IS NOT NULL AND deleted_at IS NULL
  `, [runId, ownerId]);
  return row ? { id: row.id, status: row.status, finished: isTerminalRunStatus(row.status) } : undefined;
}

export async function readDurableRunEvents(
  runId: string,
  ownerId: string,
  afterSeq: number,
): Promise<RunEvent[] | undefined> {
  const run = await queryOne<{ id: string }>(`
    SELECT id FROM generation_runs
    WHERE id = $1 AND owner_id = $2 AND plan_json IS NOT NULL AND deleted_at IS NULL
  `, [runId, ownerId]);
  if (!run) return undefined;
  const rows = await query<{ seq: number; payload_json: string }>(`
    SELECT seq, payload_json FROM generation_run_events
    WHERE run_id = $1 AND seq > $2 ORDER BY seq ASC LIMIT $3
  `, [runId, afterSeq, DURABLE_RUN_EVENT_BATCH_SIZE]);
  return rows.map((row) => ({ ...parseJson<RunEvent>(row.payload_json, { type: "done" }), seq: row.seq }));
}
