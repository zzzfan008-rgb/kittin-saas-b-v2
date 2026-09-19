/**
 * 视频模型契约类型（Q2=A：video 节点，schema v7）。
 * 字段级契约唯一来源：docs/design/2026-09-18-three-node-model/contracts/data-model.md §5
 * （VideoModelId 六值 + VideoModelOptions）。
 *
 * 注意（契约 §5 末段）：完整视频模型契约产物 video-model-contracts.json **不在 P2-a 生成**——
 * P2-e 按知识库门禁走 docs:apiyi:lookup 后产出。本文件只落类型层：
 * VideoModelId 取值域（已由 data-model.md §5 定版）与自由 key-value 参数形状。
 */
export const VIDEO_MODEL_IDS = [
  "doubao-seedance-2-0-260128",
  "doubao-seedance-2-0-fast-260128",
  "doubao-seedance-2-0-mini-260615",
  "doubao-seedance-2-5-260628",
  "veo-3.1-fast-generate-preview",
  "veo-3.1-generate-preview",
] as const;

export type VideoModelId = (typeof VIDEO_MODEL_IDS)[number];

export function isVideoModelId(value: unknown): value is VideoModelId {
  return typeof value === "string" && (VIDEO_MODEL_IDS as readonly string[]).includes(value);
}

/**
 * R5：自由 key-value。seconds/resolution/aspectRatio/seed 为契约 §5 列出的已知键，
 * 联动约束（如 Veo 1080p 仅 8s）由 UI 层负责提示（P2-e），不在类型层强制。
 */
export interface VideoModelOptions {
  seconds?: string;        // Veo 要求字符串 "4"|"6"|"8"；Seedance 4–15/30 或 "-1"
  resolution?: string;     // "480p"|"720p"|"1080p"|"4k"（联动约束由 UI 负责）
  aspectRatio?: string;
  seed?: number;
  [key: string]: string | number | boolean | undefined;
}
