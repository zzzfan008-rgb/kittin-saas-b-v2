import { RUN_PROGRESS_PHASES, type RunProgress } from "@/types/workflow";

/**
 * RUN-02（契约 §5）：把 `progress` 翻成一句人话。
 *
 * 原则：**只表述后端真的给了的信息**。
 * - 没有 `done/total` 就绝不显示百分比（契约明确禁止编造进度）；
 * - `phase` 是开放词表，未知阶段返回 undefined —— 宁可不显示，也不猜一个可能错的词；
 * - `queuePosition` 优先于 phase：有具体位次时，位次比「排队中」信息量更大。
 */
export function progressStageLabel(progress?: RunProgress): string | undefined {
  if (!progress) return undefined;
  if (progress.queuePosition !== undefined) return `排队中 · 第 ${progress.queuePosition} 位`;
  switch (progress.phase) {
    case RUN_PROGRESS_PHASES.queued:
      return "排队中";
    case RUN_PROGRESS_PHASES.image:
      return progress.done !== undefined && progress.total !== undefined
        ? `生成中 ${progress.done}/${progress.total}`
        : "生成中";
    case RUN_PROGRESS_PHASES.videoSubmitted:
      return "已提交上游，等待出片";
    case RUN_PROGRESS_PHASES.videoPolling:
      return "上游生成中";
    default:
      return undefined;
  }
}
