/**
 * 「找回已生成的图片」路由（2026-11-10）。
 *
 * 背景：上游是同步长连接。gpt-image 产物在跨区 CDN，若下载失败、进程中断或
 * 响应在传输层丢失，前端只看到失败，但图片可能已经生成并计费。此前没有任何出口，
 * 用户只能重新生成再付一次钱。
 *
 * 本路由只做一件事：**按运行期间存证的上游 URL 重新取图**，不调用模型、不重新计费。
 * - 上游 URL 由 worker 在下载之前写入 `generation_run_steps.provider_image_urls_json`；
 * - 只在 failed / outcome_unknown 的运行上允许；
 * - 取回成功后把该运行补成 succeeded，并补发 result-node-created，画布上直接出现结果节点。
 *
 * 明确不支持：上游从未回传 URL（如网关 504 / 连接中断）的运行——没有地址可查，
 * 只能重新生成。接口会返回可读原因，前端据此提示。
 */
import { Router } from "express";
import { nanoid } from "nanoid";
import { asyncHandler } from "../lib/asyncHandler";
import { requestUser } from "../lib/auth";
import { transaction, queryOne } from "../lib/database";
import {
  deleteStoredImage,
  downloadImageToDataUrl,
  persistImageRefWithReceipt,
  type PersistedImageReceipt,
} from "../lib/fileStore";
import { appendRunEvent } from "../engine/runQueue/events";
import { config } from "../config";
import { dispatchFetch } from "../providers/base";
import { extractAsyncImageUrls } from "../providers/asyncImageTask";
import type { RunEvent } from "../../src/types/workflow";

export const runRecoveryRouter = Router();

const SAFE_RUN_ID = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_RECOVER_IMAGES = 8;

interface RunRow {
  id: string;
  owner_id: string;
  status: string;
  project_id: string | null;
  node_id: string;
  target_step_id: string | null;
  started_at: number;
}

interface StepRow {
  id: string;
  step_index: number;
  node_id: string;
  kind: string;
  provider_image_urls_json: string;
  provider_images_json: string;
  prompts_json: string;
  model: string | null;
  provider_requests: number;
  provider_request_id: string | null;
  provider_task_id: string | null;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}


/**
 * 按请求 ID 恢复已保存的图片链接（兔子《异步媒体任务》指南）。
 * 只查一次：`processing_or_not_found` 无法区分"还在处理/记录不存在/无权访问"，
 * 绝不能据此无限轮询或重复提交（会重复计费）。
 */
async function recoverUrlsByRequestId(requestId: string): Promise<{
  urls: string[];
  pending: boolean;
}> {
  const url = `${config.gatewayBaseUrl()}/v1/images/generations/result?request_id=${encodeURIComponent(requestId)}`;
  let response: Response;
  try {
    response = await dispatchFetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${config.gatewayApiKey()}` },
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return { urls: [], pending: false };
  }
  if (!response.ok) return { urls: [], pending: false };
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { urls: [], pending: false };
  }
  const body = (payload ?? {}) as Record<string, unknown>;
  const status = typeof body.status === "string" ? body.status.toLowerCase() : "";
  const collected: string[] = [];
  const push = (value: unknown) => {
    if (typeof value === "string" && /^https?:\/\//i.test(value) && !collected.includes(value)) {
      collected.push(value);
    }
  };
  const rows = Array.isArray(body.data) ? body.data : [];
  for (const row of rows) {
    if (typeof row !== "object" || row === null) continue;
    const item = row as Record<string, unknown>;
    push(item.url);
    push(item.image_url);
  }
  push(body.url);
  push(body.image_url);
  if (Array.isArray(body.urls)) for (const item of body.urls) push(item);
  const pending = status.includes("processing") || status === "queued" || status === "in_progress";
  return { urls: collected, pending };
}

const TASK_ID_PATTERN = /^task_[A-Za-z0-9]{1,128}$/;
const TASK_PENDING_STATUSES = new Set([
  "queued", "pending", "starting", "in_progress", "running", "processing", "generating",
]);

/**
 * Gemini 异步图片任务：provider_request_id / provider_task_id 里存的是 task_id。
 * 查询 GET /v1/videos/{task_id} 是幂等只读，不调用模型、不计费，可安全重复点「找回」；
 * 任务可能出图后前端才失败，这条路径能把结果 URL 取回来。
 */
async function recoverUrlsByTaskId(taskId: string): Promise<{ urls: string[]; pending: boolean }> {
  const url = `${config.gatewayBaseUrl()}/v1/videos/${encodeURIComponent(taskId)}`;
  let response: Response;
  try {
    response = await dispatchFetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${config.gatewayApiKey()}` },
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return { urls: [], pending: false };
  }
  if (!response.ok) return { urls: [], pending: false };
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { urls: [], pending: false };
  }
  const body = (payload ?? {}) as Record<string, unknown>;
  const status = typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
  return {
    urls: extractAsyncImageUrls(payload).slice(0, MAX_RECOVER_IMAGES),
    pending: TASK_PENDING_STATUSES.has(status),
  };
}

/** 按存证类型分流：task_ 前缀走异步任务查询，其余走网关 request_id 一次性查询。 */
export function recoverByIdentifier(identifier: string): Promise<{ urls: string[]; pending: boolean }> {
  return TASK_ID_PATTERN.test(identifier)
    ? recoverUrlsByTaskId(identifier)
    : recoverUrlsByRequestId(identifier);
}

runRecoveryRouter.post("/:runId/recover", asyncHandler(async (req, res) => {
  const user = requestUser(req);
  const runId = String(req.params.runId ?? "");
  if (!SAFE_RUN_ID.test(runId)) {
    res.status(400).json({ error: "运行编号无效" });
    return;
  }

  const run = await queryOne<RunRow>(`
    SELECT id, owner_id, status, project_id, node_id, target_step_id, started_at
    FROM generation_runs
    WHERE id = $1 AND deleted_at IS NULL
  `, [runId]);
  if (!run) {
    res.status(404).json({ error: "找不到这次运行" });
    return;
  }
  // 找回会写产物与运行记录，属于写操作：管理员对他人的运行同样只读（与 textRewrite 口径一致）。
  if (run.owner_id !== user.id) {
    res.status(403).json({ error: "只读账号不能找回他人的生成结果" });
    return;
  }
  if (run.status !== "failed" && run.status !== "outcome_unknown") {
    res.status(409).json({ error: "只有失败或结果未知的运行可以找回" });
    return;
  }
  if (!run.target_step_id) {
    res.status(409).json({ error: "这次运行没有可恢复的目标步骤" });
    return;
  }

  const step = await queryOne<StepRow>(`
    SELECT id, step_index, node_id, kind, provider_image_urls_json, provider_images_json,
      prompts_json, model, provider_requests, provider_request_id, provider_task_id
    FROM generation_run_steps WHERE id = $1
  `, [run.target_step_id]);
  if (!step) {
    res.status(409).json({ error: "找不到这次运行的步骤记录" });
    return;
  }

  // 异步图片任务提交时把 task_id 同时写入两列；任一列有值都可作为找回凭据。
  const recoveryIdentifier = step.provider_request_id ?? step.provider_task_id;
  // 优先上游 URL；若运行期已落盘了 Provider 原图，也可直接复用（不会重复下载）。
  const urls = parseJson<string[]>(step.provider_image_urls_json, []);
  const localImages = parseJson<string[]>(step.provider_images_json, []);
  const candidates = [...new Set([
    ...urls,
    ...localImages.filter((url) => url.startsWith("/api/files/")),
  ])].slice(0, MAX_RECOVER_IMAGES);
  // 没有直接存证时，按请求 ID 向网关索要已保存的图片链接（只查一次，不轮询）。
  if (candidates.length === 0 && recoveryIdentifier) {
    const recoveredByRequest = await recoverByIdentifier(recoveryIdentifier);
    if (recoveredByRequest.urls.length > 0) candidates.push(...recoveredByRequest.urls.slice(0, MAX_RECOVER_IMAGES));
    else if (recoveredByRequest.pending) {
      res.status(409).json({
        error: "暂时查不到这个请求的结果（可能仍在处理，也可能没有保存记录）；请 1–2 分钟后重试，仍失败可重新生成",
        reason: "processing",
      });
      return;
    }
  }
  if (candidates.length === 0) {
    res.status(409).json({
      error: "上游没有回传图片地址，无法找回；请重新生成（会再次计费）",
      reason: "no_provider_evidence",
    });
    return;
  }

  const persisted: PersistedImageReceipt[] = [];
  try {
    for (const [index, url] of candidates.entries()) {
      const dataUrl = url.startsWith("/api/files/") ? url : await downloadImageToDataUrl(url);
      persisted.push(await persistImageRefWithReceipt(
        dataUrl,
        `${run.id}:${step.id}:recover:${index}`,
      ));
    }
  } catch (error) {
    for (const receipt of persisted) if (receipt.created) deleteStoredImage(receipt.id);
    persisted.length = 0;
    // 存证 URL 可能已过期：再用请求 ID 换一次新链接重试（仍只取一次图）。
    if (recoveryIdentifier) {
      const fresh = await recoverByIdentifier(recoveryIdentifier);
      const retryUrls = fresh.urls.slice(0, MAX_RECOVER_IMAGES);
      if (retryUrls.length > 0) {
        try {
          for (const [index, url] of retryUrls.entries()) {
            const dataUrl = await downloadImageToDataUrl(url);
            persisted.push(await persistImageRefWithReceipt(
              dataUrl, `${run.id}:${step.id}:recover:req:${index}`,
            ));
          }
          candidates.length = 0;
          candidates.push(...retryUrls);
        } catch {
          for (const receipt of persisted) if (receipt.created) deleteStoredImage(receipt.id);
          persisted.length = 0;
        }
      }
    }
    if (persisted.length === 0) {
      console.warn("[run-recovery-failed]", JSON.stringify({
        runId: run.id,
        message: (error instanceof Error ? error.message : String(error)).slice(0, 200),
      }));
      res.status(409).json({
        error: "图片地址已失效或下载失败，暂时无法找回；可稍后再试",
        reason: "download_failed",
      });
      return;
    }
  }

  const imageUrls = persisted.map((item) => item.url);
  const prompts = parseJson<string[]>(step.prompts_json, []);
  const finishedAt = Date.now();

  try {
    await transaction(async (client) => {
    const locked = (await client.query<{ status: string }>(
      "SELECT status FROM generation_runs WHERE id = $1 FOR UPDATE",
      [run.id],
    )).rows[0];
    // 并发点击或运行状态已被别处改写时，不做第二次恢复。
    if (!locked || (locked.status !== "failed" && locked.status !== "outcome_unknown")) {
      throw new Error("RUN_NOT_RECOVERABLE");
    }

    await client.query(`
      UPDATE generation_run_steps SET status = 'succeeded', output_images_json = $1,
        provider_images_json = $1, error = NULL, finished_at = $2
      WHERE id = $3
    `, [JSON.stringify(imageUrls), finishedAt, step.id]);
    await client.query(`
      UPDATE generation_jobs SET status = 'succeeded', worker_id = NULL,
        lease_expires_at = NULL, last_error = NULL, updated_at = $1
      WHERE run_id = $2 AND step_id = $3
    `, [finishedAt, run.id, step.id]);
    await client.query("DELETE FROM generation_outputs WHERE run_id = $1", [run.id]);
    for (const [index, image] of imageUrls.entries()) {
      await client.query(`
        INSERT INTO generation_outputs (
          id, run_id, image, provider_image, prompt, status, error, created_at
        ) VALUES ($1, $2, $3, $3, $4, 'success', NULL, $5)
      `, [nanoid(12), run.id, image, prompts[index] ?? null, finishedAt + index]);
    }
    await client.query(`
      UPDATE generation_runs SET status = 'succeeded', successful_count = $1,
        error = NULL, finished_at = $2, updated_at = $2
      WHERE id = $3
    `, [imageUrls.length, finishedAt, run.id]);
    await client.query(`
      INSERT INTO usage_events (
        id, owner_id, run_id, project_id, node_id, model, successful_count,
        provider_requests, duration_ms, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (run_id) DO UPDATE SET
        successful_count = excluded.successful_count,
        duration_ms = excluded.duration_ms
    `, [
      nanoid(12), run.owner_id, run.id, run.project_id, run.node_id, step.model,
      imageUrls.length, step.provider_requests, Math.max(0, finishedAt - run.started_at),
      new Date(finishedAt).toISOString(),
    ]);
    for (const image of persisted) {
      await client.query(`
        INSERT INTO files (id, owner_id, source_type, project_id, node_id, run_id, created_at)
        VALUES ($1, $2, 'generated', $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING
      `, [image.id, run.owner_id, run.project_id, run.node_id, run.id, new Date(finishedAt).toISOString()]);
      await client.query(`
        INSERT INTO files (id, owner_id, source_type, project_id, node_id, run_id, created_at)
        VALUES ($1, $2, 'provider-original', $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING
      `, [image.id, run.owner_id, run.project_id, run.node_id, run.id, new Date(finishedAt).toISOString()]);
    }

    const mediaKind = step.kind === "video-generator" ? "video" : "image";
    if (step.kind !== "video-generator") {
      await appendRunEvent(client, run.id, {
        type: "result-node-created",
        resultNodeId: `result-${run.id}`,
        sourceGeneratorId: step.node_id,
        runId: run.id,
        mediaKind,
        urls: imageUrls,
      } as RunEvent, finishedAt);
    }
    await appendRunEvent(client, run.id, {
      type: "node-status",
      nodeId: step.node_id,
      status: "success",
      images: imageUrls,
      model: step.model ?? undefined,
      prompts,
      finishedAt,
    } as RunEvent, finishedAt);
    await appendRunEvent(client, run.id, { type: "done" }, finishedAt);
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RUN_NOT_RECOVERABLE") {
      res.status(409).json({ error: "这次运行状态已变化，无需找回" });
      return;
    }
    throw error;
  }

  console.log("[run-recovery-ok]", JSON.stringify({
    runId: run.id,
    images: imageUrls.length,
    elapsedMs: Date.now() - finishedAt,
  }));
  res.json({ recovered: true, images: imageUrls, runId: run.id });
}));
