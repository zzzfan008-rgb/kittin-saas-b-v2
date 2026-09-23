import {
  useFlowStore,
  type RecentResult,
} from "@/store/flowStore";
import {
  nodeSpecForKind,
  nodeTitleForKind,
} from "@/types/workflow";
import { UnsupportedNodeKindNotice } from "../nodes/NodeFrame";

/**
 * 单条「最近生成」结果的完整运行记录。
 *
 * 2026-09-25：本组件从 `InspectorPanel.tsx` 拆出，成为「结果详情」弹窗
 * （`ResultDetailDialog`）的主体内容；左侧 Dock 与其中的节点属性面板已一并移除。
 */
export function ResultRecordDetail({ resultId }: { resultId: string }) {
  const record = useFlowStore((s) => s.recentResults.find((r) => r.id === resultId));
  if (!record) return null;
  const spec = nodeSpecForKind(record.kind);
  const time = new Date(record.startedAt).toLocaleTimeString("zh-CN", { hour12: false });
  const duration = (((record.finishedAt ?? Date.now()) - record.startedAt) / 1000).toFixed(1);
  const statusText: Record<RecentResult["status"], string> = {
    queued: "排队中",
    running: "生成中",
    retry_wait: "等待重试",
    cancel_requested: "取消请求中",
    success: "成功",
    error: "失败",
    outcome_unknown: "结果未知",
    cancelled: "已取消",
  };
  const statusColor: Record<RecentResult["status"], string> = {
    queued: "text-[var(--gc-status-queued)]",
    running: "text-[var(--gc-status-running)]",
    retry_wait: "text-[var(--gc-status-retry)]",
    cancel_requested: "text-[var(--gc-status-retry)]",
    success: "text-[var(--gc-status-success)]",
    error: "text-[var(--gc-status-error)]",
    outcome_unknown: "text-[var(--gc-status-unknown)]",
    cancelled: "text-[var(--gc-status-idle)]",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-200">{record.nodeLabel}</span>
        <span
          className={`text-label ${statusColor[record.status]}`}
        >
          {statusText[record.status]}
        </span>
      </div>

      {!spec && <UnsupportedNodeKindNotice kind={record.kind} label={record.nodeLabel} />}

      {/* 大图由外层「结果详情」弹窗承载（可点进查看器），这里不再重复渲染同一张图。 */}

      <dl className="space-y-1.5 text-label">
        <div className="flex justify-between">
          <dt className="text-neutral-500">节点类型</dt>
          <dd className="text-neutral-300">{nodeTitleForKind(record.kind)}</dd>
        </div>
        {record.projectName && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-500">项目</dt>
            <dd className="truncate text-neutral-300" title={record.projectName}>
              {record.projectName}
            </dd>
          </div>
        )}
        {record.model && (
          <div className="flex justify-between">
            <dt className="text-neutral-500">模型</dt>
            <dd className="font-mono text-neutral-300">{record.model}</dd>
          </div>
        )}
        {record.providerOutputSize && (
          <div className="flex justify-between">
            <dt className="text-neutral-500">上游实际尺寸</dt>
            <dd className="font-mono text-neutral-300">{record.providerOutputSize}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-neutral-500">时间</dt>
          <dd className="text-neutral-300">
            {time} · {record.finishedAt ? "耗时" : "已等待"} {duration}s
          </dd>
        </div>
      </dl>

      {record.prompt && (
        <div className="space-y-1">
          <span className="text-label text-neutral-500">提示词</span>
          <p className="rounded-md border border-[var(--gc-border)] bg-[var(--gc-control)] px-2 py-1.5 text-body leading-relaxed text-[var(--gc-text-muted)]">
            {record.prompt}
          </p>
        </div>
      )}

      {record.error && (
        <div className="space-y-1">
          <span className="text-label text-red-400/80">错误信息</span>
          <p className="rounded-md border border-red-900/50 bg-red-950/20 px-2 py-1.5 text-body leading-relaxed text-red-300/90">
            {record.error}
          </p>
        </div>
      )}
    </div>
  );
}
