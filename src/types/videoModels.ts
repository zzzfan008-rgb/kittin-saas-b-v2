/**
 * 视频模型契约类型（Q2=A：video 节点，schema v7）。
 * 字段级契约唯一来源：docs/design/2026-09-18-three-node-model/contracts/data-model.md §5
 * （VideoModelId 单值 + VideoModelOptions）。
 *
 * R10 最终裁定（2026-09-19，用户拍板）：视频清单收敛为单个
 * `doubao-seedance-2-5-260628`；veo-3.1-* 不接入、Seedance 2.0 三档移除。
 * 令牌口径：支持配置专用令牌（用户已新建专用令牌调用 Seedance，
 * 原「需勾选 SeeDance2 分组（0.18x）」运营动作取消；具体配置形态归 P2-e）。
 * 证据：docs/ai/apiyi/site/snapshots/2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd/pages/api-capabilities/seedance2/overview.md
 * （SHA-256 693a068a2a1ba83fdce83f745ea49ad36b1f0f7c3e8fca89b2cef57fd78f606f）。
 *
 * 注意（契约 §5 末段）：完整视频模型契约产物 video-model-contracts.json **不在 P2-a 生成**——
 * P2-e 按知识库门禁走 docs:apiyi:lookup 后产出。本文件只落类型层：
 * VideoModelId 取值域（已由 data-model.md §5 定版）与自由 key-value 参数形状。
 */
export const VIDEO_MODEL_IDS = [
  "doubao-seedance-2-5-260628",
] as const;

export type VideoModelId = (typeof VIDEO_MODEL_IDS)[number];

export function isVideoModelId(value: unknown): value is VideoModelId {
  return typeof value === "string" && (VIDEO_MODEL_IDS as readonly string[]).includes(value);
}

/**
 * R5：自由 key-value。seconds/resolution/aspectRatio/seed 为契约 §5 列出的已知键。
 * Seedance 2.5 语义（seedance2/overview.md）：duration 4–30 整数、缺省 "-1"（模型自定）；
 * resolution 小写 480p/720p/1080p（不支持 4k）；ratio 七选一含 adaptive。
 */
export interface VideoModelOptions {
  seconds?: string;        // Seedance 2.5：4–30 整数或 "-1"（模型自定时长）
  resolution?: string;     // "480p"|"720p"|"1080p"（2.5 支持到 1080p；不支持 4k）
  aspectRatio?: string;    // Seedance 参数名为 ratio，七选一含 adaptive
  seed?: number;
  [key: string]: string | number | boolean | undefined;
}
