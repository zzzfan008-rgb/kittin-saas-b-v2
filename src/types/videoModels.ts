/**
 * 视频模型契约类型（Q2=A：video 节点，schema v7）。
 * 字段级契约唯一来源：docs/design/2026-09-18-three-node-model/contracts/data-model.md §5
 * 运行形态（异步任务 submit + 轮询 + MP4 服务端落地）：contracts/runtime.md §2。
 *
 * R10 最终裁定（2026-09-19，用户拍板）：视频清单收敛为单个
 * `doubao-seedance-2-5-260628`；veo-3.1-* 不接入、Seedance 2.0 三档移除。
 * 令牌口径：支持配置专用令牌（server/config.ts 的 GATEWAY_VIDEO_API_KEY，
 * 缺省回退 GATEWAY_API_KEY）。
 *
 * 契约产物：docs/ai/gateway/video-model-contracts.json（独立文件，data-model.md §5 声明；
 * 契约哈希重算见 scripts/video-model-contract-hash.mjs）。清单与契约的一致性断言
 * 沿用 imageModels.ts 顶部 throw 同款防线：VIDEO_MODEL_IDS 必须与契约 models 区块完全一致。
 */
import contracts from "../../docs/ai/gateway/video-model-contracts.json";

export const VIDEO_MODEL_IDS = [
  "doubao-seedance-2-5-260628",
  "MiniMax-H3",
  // 2026-11-18 撤下 veo3.1：兔子文档 video-veo 页明确「本系列暂不提供可直接执行的
  // 本站生成请求」，参数表三行全部标「待核验 / verify」。给它配参数选项等于提供无效控件。
] as const;

export type VideoModelId = (typeof VIDEO_MODEL_IDS)[number];

/** 主力默认模型。 */
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
  /**
   * 各供应商的查询响应信封不同（兔子API 实测）：
   * - seedance / veo：顶层 `video_url`
   * - MiniMax-H3：`content.url`，错误在 `error.{code,message}`
   * 不声明就无法用同一段轮询代码解析三种返回。
   */
  responseShape?: {
    submitIdField: string;
    statusField: string;
    successStatus: string;
    pendingStatuses: readonly string[];
    failedStatuses: readonly string[];
    videoUrlFields: readonly string[];
    errorField?: string | null;
    taskWrapper?: string;
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
  // 已撤下/未知型号回退为原 id 字符串，保证旧草稿的节点标签可渲染（不抛错）。
  return contractMap.get(id)?.label ?? String(id);
}

/** recommendedOptions 元数据；缺省返回 {}（契约 data-model.md §4）。 */
export function videoModelRecommendedOptions(id: VideoModelId): Record<string, RecommendedOptionSpec> {
  // 已撤下/未知型号返回 {}（而非抛错）：面板据此呈现空参数区，旧草稿仍可打开。
  return contractMap.get(id)?.recommendedOptions ?? {};
}

/**
 * 生成节点「画幅」取值域（单一事实源）：契约 `recommendedOptions.ratio.examples`。
 *
 * 2026-11-18 修复（用户反馈「视频画幅弹出的窗口有问题」）：
 * 原实现读 `aspectRatio.examples`，但视频契约的画幅键是 **`ratio`**（与提交体字段同名，
 * 见 videoProvider.ts 的 buildSubmitBody：`ratio: options.aspectRatio`）。
 * 三个模型的 `aspectRatio` 键均不存在 → 函数恒返回 `[]` → 画幅下拉永远空白。
 *
 * 契约缺省时返回空数组，由 UI 呈现空态，而不是在组件里硬编码画幅枚举。
 */
export function videoAspectRatioOptions(modelId: VideoModelId): readonly string[] {
  // 未知/已撤下模型返回空数组而不是抛错：旧草稿可能引用已撤下型号（如 veo3.1），
  // 面板必须能渲染空态，而不是让整棵节点树崩溃。
  if (!isVideoModelId(modelId)) return [];
  const recommended = videoModelRecommendedOptions(modelId);
  // ratio 是现行契约键；aspectRatio 保留为历史文档写法的回退，不新增事实。
  const examples = recommended.ratio?.examples ?? recommended.aspectRatio?.examples;
  return examples && examples.length > 0 ? examples.map((item) => String(item)) : [];
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
