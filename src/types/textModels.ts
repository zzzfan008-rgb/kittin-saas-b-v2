/**
 * 文本模型契约类型（Q1=B：text 节点可运行文本模型，schema v7）。
 * 字段级契约唯一来源：docs/design/2026-09-18-three-node-model/contracts/data-model.md §5b
 * 运行形态（同步 chat completions）：contracts/runtime.md §1b（Provider 实现归 P2-b）。
 *
 * 模型清单与契约区块的一致性断言沿用 imageModels.ts 顶部 throw 同款防线：
 * 契约区块（docs/ai/apiyi/model-contracts.json 的 textModels）必须与
 * TEXT_MODEL_IDS 完全一致，否则模块加载即抛错。
 */
import contracts from "../../docs/ai/apiyi/model-contracts.json";

/**
 * 网关模型 ID 以 API易 本地知识库页面实际模型名为准
 * （快照 2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd；R10 最终裁定 2026-09-19 实名定版）：
 * - gpt-4o → 计费目录登记实名 `"n": "gpt-4o"`
 *   （pages/models.md，SHA-256 33100d3f…9f00ed）
 * - claude-sonnet-4-5 → 横线形式见 chathub 场景页示例；计费目录登记
 *   claude-sonnet-4-5-20250929 / -thinking 变体（pages/models.md 同上）。
 *   实际可调性由 P2-b Provider 联调与评估链 campaign 证明
 *   （pages/scenarios/chat/chathub.md，SHA-256 9da7ec41…9a3b）
 * - gemini-3-pro-preview → 上线记录 + text-generation 示例 + native 计费表
 *   （pages/news/gemini-3-pro-preview-launch.md，SHA-256 d1e30e09…4eb8）
 * R10 裁定细节见 docs/design/2026-09-18-three-node-model/contracts/model-proposals.md §6。
 */
export const TEXT_MODEL_IDS = [
  "gpt-4o",
  "claude-sonnet-4-5",
  "gemini-3-pro-preview",
] as const;

export type TextModelId = (typeof TEXT_MODEL_IDS)[number];

/** 主力模型（R10 最终裁定 2026-09-19：gpt-4o 默认/主力）。 */
export const DEFAULT_TEXT_MODEL_ID: TextModelId = "gpt-4o";

/** R5：自由 key-value；契约区块提供 recommendedOptions 元数据，UI 负责默认填充。 */
export interface TextModelOptions {
  temperature?: number;
  maxTokens?: number;
  [key: string]: string | number | boolean | undefined;
}

/** recommendedOptions 条目结构（契约 data-model.md §4，与 image 域同构）。 */
export interface RecommendedOptionSpec {
  default?: string | number | boolean;
  examples?: Array<string | number | boolean>;
}

export interface TextModelContract {
  id: TextModelId;
  contractHashScope: "sha256-canonical-text-model-envelope-v1";
  contractHash: `sha256:${string}`;
  label: string;
  channel: string;
  endpoint: { path: string; contentType: string };
  contextWindow: { inputTokens: number; maxOutputTokens: number };
  timeoutMs: number;
  recommendedOptions?: Record<string, RecommendedOptionSpec>;
  /** 证据页（untrusted_document_content；快照内相对路径 + SHA-256）。 */
  knowledgeSources: ReadonlyArray<{ pageLocalPath: string; sha256: string }>;
}

const rawTextModels = (contracts as { textModels?: unknown }).textModels as unknown as TextModelContract[];
const textContractMap = new Map(rawTextModels.map((model) => [model.id, model]));

// ---------- 一致性断言（加载即校验，防线同 imageModels.ts 顶部 throw） ----------
if (!Array.isArray(rawTextModels) || rawTextModels.length === 0) {
  throw new Error("API易文本模型契约缺少 textModels 区块（model-contracts.json）");
}
for (const id of TEXT_MODEL_IDS) {
  if (!textContractMap.has(id)) throw new Error(`API易文本模型知识库缺少契约: ${id}`);
}
if (textContractMap.size !== TEXT_MODEL_IDS.length) {
  throw new Error("API易文本模型知识库与应用文本模型清单不一致");
}
for (const model of rawTextModels) {
  if (model.contractHashScope !== "sha256-canonical-text-model-envelope-v1") {
    throw new Error(`API易文本模型契约 contractHashScope 无效: ${model.id}`);
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(model.contractHash)) {
    throw new Error(`API易文本模型契约 contractHash 格式无效: ${model.id}`);
  }
}

export function isTextModelId(value: unknown): value is TextModelId {
  return typeof value === "string" && (TEXT_MODEL_IDS as readonly string[]).includes(value);
}

export function getTextModelContract(id: TextModelId): TextModelContract {
  return textContractMap.get(id)!;
}

export function textModelContractHash(id: TextModelId): `sha256:${string}` {
  return getTextModelContract(id).contractHash;
}

export function textModelLabel(id: TextModelId): string {
  return getTextModelContract(id).label;
}

/** recommendedOptions 元数据；缺省返回 {}（契约 data-model.md §4）。 */
export function textModelRecommendedOptions(id: TextModelId): Record<string, RecommendedOptionSpec> {
  return getTextModelContract(id).recommendedOptions ?? {};
}

/**
 * R5：文本参数仅产生 warning，永不产生错误；调用方不得据此拒绝保存/运行。
 * - 未知 key → 「参数 {key} 不在模型 {id} 的已知参数中」
 * - 值不在契约推荐集合 → 「{key}={v} 不在推荐取值 {examples} 中」
 * 行为消费方（悬浮窗口/运行链路）归 P2-b/P2-c 接线。
 */
export function textModelOptionsWarnings(modelId: TextModelId, value: unknown): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
  const recommended = textModelRecommendedOptions(modelId);
  const known = new Set(Object.keys(recommended).concat(["temperature", "maxTokens"]));
  const warnings: string[] = [];
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (raw === undefined) continue;
    if (typeof raw !== "string" && typeof raw !== "number" && typeof raw !== "boolean") continue;
    if (!known.has(key)) {
      warnings.push(`参数 ${key} 不在模型 ${modelId} 的已知参数中`);
      continue;
    }
    const spec = recommended[key];
    if (spec?.examples && spec.examples.length > 0 && !spec.examples.includes(raw)) {
      warnings.push(`${key}=${String(raw)} 不在推荐取值 ${spec.examples.map((item) => String(item)).join("、")} 中`);
    }
  }
  return warnings;
}
