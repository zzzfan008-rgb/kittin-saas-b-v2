/**
 * 视频 Provider 抽象（Q2=A：video 节点异步任务 submit + 轮询 + MP4 服务端落地，schema v7）。
 * 契约唯一来源：docs/design/2026-09-18-three-node-model/contracts/runtime.md §2。
 * 轮询循环由 runQueue worker 承载（复用现有重试/取消骨架），不在 HTTP 请求内同步等待；
 * poll 返回 completed 时必须已完成 MP4 落地并给出 files 引用。
 *
 * R10 最终裁定：仅 `doubao-seedance-2-5-260628`（Seedance 2.5）。
 * 证据：docs/ai/apiyi/video-model-contracts.json（seedance2/overview.md + video-generation.md）。
 */
import type { ReferenceImageInput } from "../../src/types/workflow";
import {
  getVideoModelContract,
  isVideoModelId,
  type VideoModelId,
  type VideoModelOptions,
} from "../../src/types/videoModels";
import { config } from "../config";
import { downloadVideoToBuffer, saveVideoBuffer } from "../lib/fileStore";
import {
  fetchWithRetry,
  inspectProviderTransportFailure,
  ProviderError,
} from "./base";
import { getApiyiDispatcher, readApiyiJsonResponse } from "./apiyiTransport";

const VIDEO_JSON_MAX_BYTES = 1024 * 1024;

export interface VideoGenRequest {
  prompt: string;
  firstFrame?: ReferenceImageInput;
  modelOptions?: VideoModelOptions;
  promptVariantId?: string;
  contractHash?: `sha256:${string}`;
}

export type VideoPollResult =
  | { status: "pending" | "running" }
  | { status: "completed"; videoFileRef: string; durationSec?: number }
  | { status: "failed"; error: string; billed: boolean };

export interface VideoProvider {
  readonly id: VideoModelId;
  /** 提交异步任务，返回 provider 侧 task id。 */
  submit(req: VideoGenRequest): Promise<{ taskId: string }>;
  /** 轮询；返回 completed 时必须已完成 MP4 服务端落地并给出 files 引用。 */
  poll(taskId: string): Promise<VideoPollResult>;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

/** Seedance 参数映射：seconds → duration、aspectRatio → ratio（data-model.md §5）。 */
function buildSubmitBody(modelId: VideoModelId, req: VideoGenRequest): Record<string, unknown> {
  const options = req.modelOptions ?? {};
  const content: Array<Record<string, unknown>> = [{ type: "text", text: req.prompt }];
  if (req.firstFrame?.dataUrl) {
    content.push({
      type: "image_url",
      image_url: { url: req.firstFrame.dataUrl },
      role: "first_frame",
    });
  }
  // 2.5 的 duration 缺省 -1（模型自选，成本翻倍）；契约推荐显式 5 秒（成本安全）。
  const seconds = typeof options.seconds === "string" && options.seconds.trim() !== "" ? options.seconds : "5";
  const duration = seconds === "-1" ? -1 : Number.parseInt(seconds, 10);
  return {
    model: modelId,
    content,
    resolution: typeof options.resolution === "string" ? options.resolution : "720p",
    ratio: typeof options.aspectRatio === "string" ? options.aspectRatio : "adaptive",
    duration: Number.isInteger(duration) ? duration : 5,
    generate_audio: false,
    watermark: false,
    ...(typeof options.seed === "number" ? { seed: options.seed } : {}),
  };
}

function submitHeaders(): Record<string, string> {
  // Seedance 网关 gzip 头与实际编码不符；显式 identity 避免 undici 自动解压报错（seedance2/overview.md）。
  return {
    "Content-Type": "application/json",
    "Accept-Encoding": "identity",
    Authorization: `Bearer ${config.apiyiVideoApiKey()}`,
  };
}

async function readVideoJson(response: Response, modelId: VideoModelId): Promise<Record<string, unknown>> {
  const payload = record(await readApiyiJsonResponse(response, modelId, { maxBytes: VIDEO_JSON_MAX_BYTES }));
  if (!payload) throw new ProviderError("AI 服务返回格式无效", 502, modelId, "invalid_response");
  return payload;
}

async function submitWithApiyi(modelId: VideoModelId, req: VideoGenRequest): Promise<{ taskId: string }> {
  const contract = getVideoModelContract(modelId);
  const response = await fetchWithRetry(
    `${config.apiyiBaseUrl()}${contract.endpoint.submitPath}`,
    () => ({
      method: "POST",
      headers: submitHeaders(),
      body: JSON.stringify(buildSubmitBody(modelId, req)),
    }),
    {
      providerId: modelId,
      timeoutMs: config.aiTimeoutMs(contract.timeoutMs),
      maxRetries: 0,
      dispatcherFactory: getApiyiDispatcher,
    },
  );
  const payload = await readVideoJson(response, modelId);
  const taskId = payload.id;
  if (typeof taskId !== "string" || !taskId.trim()) {
    throw new ProviderError("AI 服务未返回视频任务 ID", 502, modelId, "invalid_response");
  }
  return { taskId: taskId.trim() };
}

function pollStatus(status: unknown): VideoPollResult | undefined {
  if (status === "queued") return { status: "pending" };
  if (status === "running") return { status: "running" };
  return undefined;
}

async function pollWithApiyi(
  modelId: VideoModelId,
  taskId: string,
  downloadVideo: (url: string) => Promise<Buffer> = downloadVideoToBuffer,
): Promise<VideoPollResult> {
  const contract = getVideoModelContract(modelId);
  const pollPath = contract.endpoint.pollPathTemplate.replace("{id}", encodeURIComponent(taskId));
  const response = await fetchWithRetry(
    `${config.apiyiBaseUrl()}${pollPath}`,
    () => ({ method: "GET", headers: submitHeaders() }),
    {
      providerId: modelId,
      timeoutMs: config.aiTimeoutMs(contract.timeoutMs),
      maxRetries: 0,
      dispatcherFactory: getApiyiDispatcher,
    },
  );
  const payload = await readVideoJson(response, modelId);
  const status = payload.status;
  const pending = pollStatus(status);
  if (pending) return pending;
  if (status === "succeeded") {
    const content = record(payload.content);
    const videoUrl = content?.video_url;
    if (typeof videoUrl !== "string" || !videoUrl.trim()) {
      throw new ProviderError("AI 服务返回了无效视频地址", 502, modelId, "invalid_response");
    }
    const buffer = await downloadVideo(videoUrl);
    // Seedance 默认输出 mp4（本 Provider 不显式请求 mov）。
    const saved = saveVideoBuffer(buffer, "video/mp4");
    const durationSec = typeof payload.duration === "number" ? payload.duration : undefined;
    return { status: "completed", videoFileRef: saved.url, ...(durationSec ? { durationSec } : {}) };
  }
  if (status === "failed" || status === "expired") {
    const detail = record(payload.error);
    const message = typeof detail?.message === "string"
      ? detail.message
      : status === "expired" ? "视频任务已过期" : "视频生成失败";
    return { status: "failed", error: message, billed: false };
  }
  throw new ProviderError("AI 服务返回了未知任务状态", 502, modelId, "invalid_response", `status=${String(status)}`);
}

export function createApiyiVideoProvider(
  modelId: VideoModelId,
  dependencies?: { downloadVideo?: (url: string) => Promise<Buffer> },
): VideoProvider {
  const downloadVideo = dependencies?.downloadVideo ?? downloadVideoToBuffer;
  return {
    id: modelId,
    submit: (req) => submitWithApiyi(modelId, req),
    poll: (taskId) => pollWithApiyi(modelId, taskId, downloadVideo),
  };
}

export const apiyiVideoProviders = Object.fromEntries(
  (["doubao-seedance-2-5-260628"] as const).map((modelId) => [modelId, createApiyiVideoProvider(modelId)]),
) as Record<VideoModelId, VideoProvider>;

export function getVideoProvider(modelId: string): VideoProvider {
  if (!isVideoModelId(modelId)) {
    throw new ProviderError(`Unknown video provider id: ${modelId}`, 400);
  }
  return apiyiVideoProviders[modelId];
}

export function videoTransportTimeoutMessage(error: unknown): string {
  const failure = inspectProviderTransportFailure(error);
  return failure.timedOut ? "视频任务轮询超时" : "AI 服务暂时不可用，请稍后重试";
}
