import { CLIENT_REQUEST_ID_PATTERN, ClaimedJob, DurableRunRow, PromptAdmissionBlockedBeforeProviderCall, lockRun, parseJson } from "./types";
import { appendRunEvent } from "./events";
import { persistedEvaluationPolicy, planWithPersistedEvaluationPolicy } from "./evaluation";

import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { nanoid } from "nanoid";
import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
  ReferenceImageInput,
  ReferenceImageSource,
} from "../../../src/types/workflow";
import { isReferenceRole, NODE_SPECS } from "../../../src/types/workflow";
import { isImageModelId } from "../../../src/types/imageModels";
import { db, query, queryOne, transaction } from "../../lib/database";
import {
  deleteStoredImage,
  normalizeImageRef,
  persistImageRefWithReceipt,
  type PersistedImageReceipt,
} from "../../lib/fileStore";
import type { GenerationRecordContext } from "../../lib/generationRecords";
import type { EvaluationRunPolicy } from "../../lib/evaluationRunPolicy";
import {
  consumeEvaluationRunAuthorization,
  evaluationAuthorizationTargetFromPlan,
  lockEvaluationRunAuthorization,
} from "../../lib/evaluationAuthorizationLedger";
import {
  completeEvaluationCaseEvidence,
  failEvaluationCaseEvidence,
  recordEvaluationProviderRequestFailure,
  recordEvaluationProviderRequestSuccess,
  startEvaluationProviderRequestEvidence,
} from "../../lib/evaluationEvidenceStore";
import { ACTIVE_RUN_LIMIT } from "../../lib/generationLimits";
import { lockActiveOwner } from "../../lib/ownerMutation";
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
} from "../runQueueContracts";
export async function assertGenerationOwnerActive(
  client: PoolClient,
  ownerId: string,
): Promise<void> {
  if (!await lockActiveOwner(client, ownerId)) {
    throw new GenerationOwnerUnavailableError();
  }
}


export async function insertGenerationRun(
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


export async function inputImagesForStep(
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


export async function persistStepImages(
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


export async function captureProviderOriginals(
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


export async function compensatePersistedImages(
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


export async function assertJobOwnedForCompletion(job: ClaimedJob, workerId: string): Promise<void> {
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
