import { ClaimedJob, JobLockRow, ProcessGenerationJobOptions, PromptAdmissionBlockedBeforeProviderCall, lockRun, parseJson, DEFAULT_LEASE_MS, DEFAULT_HEARTBEAT_MS, DEFAULT_RETRY_DELAYS_MS } from "./types";
import { appendRunEvent } from "./events";
import { persistedEvaluationPolicy, assertEvaluationRuntimeReferenceBinding } from "./evaluation";
import { evaluateClaimedJobPromptAdmission, runtimeUserReferenceInputs } from "./promptAdmission";
import { inputImagesForStep, persistStepImages, captureProviderOriginals, compensatePersistedImages, assertJobOwnedForCompletion } from "./persist";
import { claimNextJob, recoverExpiredGenerationJobs, markAttemptStarted } from "./claim";
import { completeJobSuccess, terminateRun } from "./lifecycle";
import os from "node:os";
import { nanoid } from "nanoid";
import { config } from "../../config";
import { db, query, queryOne, transaction } from "../../lib/database";
import {
  deleteStoredImage,
  normalizeImageRef,
  persistImageRefWithReceipt,
  type PersistedImageReceipt,
} from "../../lib/fileStore";
import type { EvaluationCodeIdentity, EvaluationErrorPhase } from "../../lib/evaluationEvidence";
import type { ReferenceRole } from "../../../src/types/workflow";
import {
  completeEvaluationCaseEvidence,
  failEvaluationCaseEvidence,
  recordEvaluationProviderRequestFailure,
  recordEvaluationProviderRequestSuccess,
  startEvaluationProviderRequestEvidence,
} from "../../lib/evaluationEvidenceStore";
import { getProvider } from "../../providers";
import {
  ProviderError,
  publicProviderErrorMessage,
  sanitizedProviderDiagnostic,
} from "../../providers/base";
import { executeStep, type ProviderResolver, type RunEvent, type StepResult } from "../runner";
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
export async function handleJobError(
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
              // TODO(R-02/R-03): 移除角色后删除此守卫
              role: reference.role as ReferenceRole,
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
