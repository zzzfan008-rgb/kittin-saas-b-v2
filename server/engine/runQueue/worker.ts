import { ClaimedJob, JobLockRow, ProcessGenerationJobOptions, lockRun, parseJson, DEFAULT_LEASE_MS, DEFAULT_HEARTBEAT_MS, DEFAULT_RETRY_DELAYS_MS } from "./types";
import { appendRunEvent } from "./events";
import { runtimeUserReferenceInputs } from "./promptAdmission";
import { inputImagesForStep, persistStepImages, captureProviderOriginals, compensatePersistedImages, assertJobOwnedForCompletion, recordProviderImageUrls } from "./persist";
import { claimNextJob, recoverExpiredGenerationJobs, markAttemptStarted, markVideoTaskSubmitted, markImageTaskSubmitted } from "./claim";
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
import { getProvider } from "../../providers";
import { runWithAsyncImageTaskHook } from "../../providers/asyncTaskContext";
import { getVideoProvider } from "../../providers/videoProvider";
import {
  ProviderError,
  publicProviderErrorMessage,
  sanitizedProviderDiagnostic,
} from "../../providers/base";
import { executeStep, type ProviderResolver, type RunEvent, type StepResult } from "../runner";
import {
  ActiveRunLimitError,
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
): Promise<void> {
  const now = options.now?.() ?? Date.now();
  const message = error instanceof ProviderError
    ? publicProviderErrorMessage(error)
    : error instanceof Error ? error.message : String(error);
  if (error instanceof ProviderError) {
    console.error("[ai-provider-worker-failure]", JSON.stringify({
      runId: job.runId, nodeId: job.nodeId, providerId: error.providerId, status: error.status ?? null,
      category: error.category, retryCount: job.retryCount, requestId: error.requestId ?? null,
      diagnostic: sanitizedProviderDiagnostic(error) ?? error.message,
    }));
  } else {
    // 非 Provider 失败（产物下载、后处理、落盘等）此前完全静默，
    // 只留一行英文原因在库里，线上无法排查。这里补一条结构化日志。
    console.warn("[generation-job-failure]", JSON.stringify({
      runId: job.runId,
      nodeId: job.nodeId,
      retryCount: job.retryCount,
      name: error instanceof Error ? error.name : typeof error,
      message: message.slice(0, 200),
    }));
  }
  await transaction(async (client) => {
    const row = (await client.query<JobLockRow>(`
      SELECT j.id, j.run_id, j.step_id, j.status, j.retry_count, j.attempt_started_at, j.worker_id,
        s.node_id, s.step_index, s.step_json, s.started_at AS step_started_at,
        r.target_step_id, r.run_type, r.retry_policy
      FROM generation_jobs j JOIN generation_run_steps s ON s.id = j.step_id
      JOIN generation_runs r ON r.id = j.run_id
      WHERE j.id = $1 AND r.deleted_at IS NULL FOR UPDATE OF j
    `, [job.id])).rows[0];
    if (!row || row.worker_id !== workerId) return;
    // 指南：保存请求 ID。没有任务 ID 时，可用它调
    // GET /v1/images/generations/result?request_id=... 恢复已保存的图片链接。
    if (error instanceof ProviderError && error.requestId) {
      await client.query(
        "UPDATE generation_run_steps SET provider_request_id = $1 WHERE id = $2",
        [error.requestId, row.step_id],
      );
    }
    if (error instanceof ProviderError && error.category === "outcome_unknown") {
      await terminateRun(client, row, "outcome_unknown", outcomeUnknownMessage(message), now);
      return;
    }
    const retryDelays = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
    const maxRetries = Math.min(retryDelays.length, DEFAULT_RETRY_DELAYS_MS.length);
    // 本次尝试已耗时：用于判定「网关 5xx 是否发生在可能出图之前」（见 isEarlyGatewayTimeout）。
    const attemptElapsedMs = Math.max(0, now - (row.attempt_started_at ?? job.startedAt));
    if (isRetryableProviderError(error, attemptElapsedMs) && row.retry_count < maxRetries) {
      const retryNumber = row.retry_count + 1;
      const scheduledDelay = retryDelays[row.retry_count] ?? DEFAULT_RETRY_DELAYS_MS[row.retry_count];
      // 指南：优先遵守上游 Retry-After（已换算并封顶 120s），但不小于本地退避。
      const retryAfterMs = error instanceof ProviderError ? (error.retryAfterMs ?? 0) : 0;
      const baseDelay = Math.max(scheduledDelay, retryAfterMs);
      const jitter = Math.floor((options.random?.() ?? Math.random()) * 1_000);
      const availableAt = now + Math.max(0, baseDelay) + jitter;
      console.warn("[generation-job-retry]", JSON.stringify({
        runId: row.run_id, nodeId: row.node_id, retryCount: retryNumber,
        delayMs: Math.max(0, baseDelay) + jitter, retryAfterMs, exhausted: false,
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
    if (isRetryableProviderError(error, attemptElapsedMs)) {
      console.warn("[generation-job-retry]", JSON.stringify({
        runId: row.run_id, nodeId: row.node_id, retryCount: row.retry_count,
        delayMs: null, exhausted: true,
      }));
    }
    await terminateRun(client, row, "failed", message, now);
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
      WHERE id = $3 AND worker_id = $4 AND status = 'running'
    `, [heartbeatNow + leaseMs, heartbeatNow, job.id, workerId]).catch((error) => {
      console.error("[coin-ai-canvas] generation lease heartbeat failed", error);
    });
  }, heartbeatMs);
  heartbeat.unref();
  try {
    const input = await inputImagesForStep(job.runId, job.step);
    const capturedProviderReceipts: PersistedImageReceipt[] = [];
    // 让异步图片任务在「提交成功的那一刻」就能把 task_id 落库，
    // 而不必等到整轮轮询结束（进程中途被杀也能找回）。
    const result = await runWithAsyncImageTaskHook({
      onSubmitted: async (taskId) => {
        await markImageTaskSubmitted(job, workerId, taskId, options.now?.() ?? Date.now(), leaseMs);
      },
    }, () => executeStep(
      job.step,
      input.images,
      options.resolveProvider ?? getProvider,
      {
        runId: job.runId,
        referenceSources: input.references,
        inputProviderImages: input.providerImages,
        resolveVideoProvider: options.resolveVideoProvider ?? getVideoProvider,
        onVideoTaskSubmitted: async (taskId) => {
          await markVideoTaskSubmitted(job, workerId, taskId, options.now?.() ?? Date.now(), leaseMs);
        },
        onProgress: async (progress) => {
          const progressNow = options.now?.() ?? Date.now();
          await transaction(async (client) => {
            await appendRunEvent(client, job.runId, {
              type: "node-status",
              nodeId: job.nodeId,
              status: "running",
              progress,
            }, progressNow);
          });
        },
        beforeProviderCall: async (providerRequest, request) => {
          // Format validation only — does NOT gate admission (admission gates removed in v8rel7).
          runtimeUserReferenceInputs(job, request);
          await markAttemptStarted(
            job,
            workerId,
            options.now?.() ?? Date.now(),
            leaseMs,
            providerRequest,
            request,
          );
        },
        captureProviderImages: async (artifact) => {
          // 先存 URL 再下载：下载失败时「找回」能只重取图片，不重新生成。
          await recordProviderImageUrls(job, artifact.images, artifact.providerRequestId);
          const captured = await captureProviderOriginals(
            artifact,
            job,
            workerId,
            capturedProviderReceipts.length,
            options.now?.() ?? Date.now(),
          );
          capturedProviderReceipts.push(...captured);
          return captured.map((image) => image.url);
        },
      },
    ));
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
      await completeJobSuccess(
        job,
        workerId,
        result,
        persistedImages,
        providerImageUrls,
        capturedProviderReceipts,
        input.images,
        result.videos ?? [],
        options.now?.() ?? Date.now(),
      );
    } catch (error) {
      // Provider originals are already durable evidence and must survive post-processing/completion failure.
      await compensatePersistedImages(persistedImages, job, workerId);
      throw error;
    }
  } catch (error) {
    await handleJobError(job, workerId, error, options);
  } finally {
    clearInterval(heartbeat);
  }
  return true;
}


/**
 * 单个 worker 循环：领取 → 执行 → 继续领，空闲时按轮询间隔重试。
 * 领取 SQL 使用 `FOR UPDATE ... SKIP LOCKED`，多个循环并发领取不会互相阻塞。
 */
function startWorkerLoop(): () => void {
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
      console.error("[coin-ai-canvas] generation worker failed", error);
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

/**
 * 生成本身是分钟级的长任务。单循环会让第二个请求一直排队（多人同时用尤其明显），
 * 这里按 GENERATION_WORKER_CONCURRENCY（默认 2，上限 4）起多个循环并行消费队列。
 */
export function startGenerationWorker(): () => void {
  const concurrency = config.generationWorkerConcurrency();
  const stops = Array.from({ length: concurrency }, () => startWorkerLoop());
  return () => stops.forEach((stop) => stop());
}
