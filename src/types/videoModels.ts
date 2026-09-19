/**
 * 视频模型契约类型（Q2=A：video 节点，schema v7）。
 * 字段级契约唯一来源：docs/design/2026-09-18-three-node-model/contracts/data-model.md §5
 * 运行形态（异步任务 submit + 轮询 + MP4 服务端落地）：contracts/runtime.md §2。
 *
 * R10 最终裁定（2026-09-19，用户拍板）：视频清单收敛为单个
 * `doubao-seedance-2-5-260628`；veo-3.1-* 不接入、Seedance 2.0 三档移除。
 * 令牌口径：支持配置专用令牌（server/config.ts 的 APIYI_VIDEO_API_KEY，
 * 缺省回退 APIYI_API_KEY）。
 *
 * 契约产物：docs/ai/apiyi/video-model-contracts.json（独立文件，data-model.md §5 声明；
 * 契约哈希重算见 scripts/video-model-contract-hash.mjs）。清单与契约的一致性断言
 * 沿用 imageModels.ts 顶部 throw 同款防线：VIDEO_MODEL_IDS 必须与契约 models 区块完全一致。
 */
import contracts from "../../docs/ai/apiyi/video-model-contracts.json";

export const VIDEO_MODEL_IDS = [
  "doubao-seedance-2-5-260628",
] as const;

export type VideoModelId = (typeof VIDEO_MODEL_IDS)[number];

/** 主力（且唯一）模型。 */
export const DEFAULT_VIDEO_MODEL_ID: VideoModelId = "doubao-seedance-2-5-260628";

export function isVideoModelId(value: unknown): value is VideoModelId {
  return typeof value === "string" && (VIDEO_MODEL_IDS as readonly string[]).includes(value);
}

/**
 * R5：自由 key-value。seconds/resolution/aspectRatio/seed 为契约 §5 列出的已知键。
 * Seedance 2.5 语义（seedance2/overview.md）：
 * - seconds 映射 Seedance `duration`：4–30 整数或 "-1"（模型自定时长；2.5 缺省 -1，成本敏感须显式传）。
 * - resolution 小写 480p/720p/1080p（不支持 4k）。
 * - aspectRatio 映射 Seedance `ratio`：16:9/4:3/1:1/3:4/9:16/21:9/adaptive 七选一。
 */
export interface VideoModelOptions {
  seconds?: string;
  resolution?: string;
  aspectRatio?: string;
  seed?: number;
  [key: string]: string | number | boolean | undefined;
}

/** recommendedOptions 条目结构（契约 data-model.md §4，与 image/text 域同构）。 */
export interface RecommendedOptionSpec {
  default?: string | number | boolean;
  examples?: Array<string | number | boolean>;
}

/** 视频模型运行时契约（顶层 runtime 区块）。 */
export interface VideoRuntimeContract {
  upstreamMode: "async-task";
  submitEndpoint: string;
  pollEndpointTemplate: string;
  successStatus: string;
  pendingStatuses: readonly string[];
  terminalStatuses: readonly string[];
  pollInitialDelayMs: number;
  pollIntervalMs: number;
  pollTimeoutMs: number;
  videoUrlExpirySeconds: number;
  downloadTimeoutMs: number;
}

export interface VideoModelContract {
  id: VideoModelId;
  contractHashScope: "sha256-canonical-video-model-envelope-v1";
  contractHash: `sha256:${string}`;
  label: string;
  channel: string;
  vendor?: string;
  timeoutMs: number;
  endpoint: {
    submitPath: string;
    pollPathTemplate: string;
    contentType: string;
  };
  recommendedOptions?: Record<string, RecommendedOptionSpec>;
  /** 证据页（untrusted_document_content；快照内相对路径 + SHA-256）。 */
  knowledgeSources: ReadonlyArray<{ pageLocalPath: string; sha256: string }>;
}

interface VideoContractFile {
  schemaVersion: number;
  contractLayer: string;
  baseUrl: string;
  runtime: VideoRuntimeContract;
  models: VideoModelContract[];
}

const raw = contracts as unknown as VideoContractFile;
const rawModels = Array.isArray(raw.models) ? raw.models : [];
const contractMap = new Map(rawModels.map((model) => [model.id, model]));

// ---------- 一致性断言（加载即校验，防线同 imageModels.ts 顶部 throw） ----------
if (!Array.isArray(rawModels) || rawModels.length === 0) {
  throw new Error("API易视频模型契约缺少 models 区块（video-model-contracts.json）");
}
for (const id of VIDEO_MODEL_IDS) {
  if (!contractMap.has(id)) throw new Error(`API易视频模型知识库缺少契约: ${id}`);
}
if (contractMap.size !== VIDEO_MODEL_IDS.length) {
  throw new Error("API易视频模型知识库与应用视频模型清单不一致");
}
for (const model of rawModels) {
  if (model.contractHashScope !== "sha256-canonical-video-model-envelope-v1") {
    throw new Error(`API易视频模型契约 contractHashScope 无效: ${model.id}`);
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(model.contractHash)) {
    throw new Error(`API易视频模型契约 contractHash 格式无效: ${model.id}`);
  }
}

export function getVideoModelContract(id: VideoModelId): VideoModelContract {
  return contractMap.get(id)!;
}

export function getVideoRuntimeContract(): VideoRuntimeContract {
  return raw.runtime;
}

export function videoModelContractHash(id: VideoModelId): `sha256:${string}` {
  return getVideoModelContract(id).contractHash;
}

export function videoModelLabel(id: VideoModelId): string {
  return getVideoModelContract(id).label;
}

/** recommendedOptions 元数据；缺省返回 {}（契约 data-model.md §4）。 */
export function videoModelRecommendedOptions(id: VideoModelId): Record<string, RecommendedOptionSpec> {
  return getVideoModelContract(id).recommendedOptions ?? {};
}

/**
 * R5：视频参数仅产生 warning，永不产生错误；调用方不得据此拒绝保存/运行。
 * - 未知 key → 「参数 {key} 不在模型 {id} 的已知参数中」
 * - 值不在契约推荐集合 → 「{key}={v} 不在推荐取值 {examples} 中」
 */
export function videoModelOptionsWarnings(modelId: VideoModelId, value: unknown): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
  const recommended = videoModelRecommendedOptions(modelId);
  const known = new Set(Object.keys(recommended).concat(["seconds", "resolution", "aspectRatio", "seed"]));
  const warnings: string[] = [];
  for (const [key, rawValue] of Object.entries(value as Record<string, unknown>)) {
    if (rawValue === undefined) continue;
    if (typeof rawValue !== "string" && typeof rawValue !== "number" && typeof rawValue !== "boolean") continue;
    if (!known.has(key)) {
      warnings.push(`参数 ${key} 不在模型 ${modelId} 的已知参数中`);
      continue;
    }
    const spec = recommended[key];
    if (spec?.examples && spec.examples.length > 0 && !spec.examples.includes(rawValue)) {
      warnings.push(`${key}=${String(rawValue)} 不在推荐取值 ${spec.examples.map((item) => String(item)).join("、")} 中`);
    }
  }
  return warnings;
}
