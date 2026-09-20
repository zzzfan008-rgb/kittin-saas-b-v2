import {
  selectActiveEdges,
  selectActiveNodes,
  selectActivePrimarySelectedNodeId,
  selectActiveSelectedResultId,
  useFlowStore,
  type RecentResult,
} from "@/store/flowStore";
import {
  isNodeRunActive,
  nodeSpecForKind,
  nodeTitleForKind,
} from "@/types/workflow";
import { inputClass, STATUS_TEXT, UnsupportedNodeKindNotice } from "../nodes/NodeFrame";
import { thumbnailImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { useNodeInspector } from "../nodes/NodeInspectorWindow";
import { Button } from "@/components/ui/button";

/**
 * R-40 §2.5（裁定 A：P2-c 单批次取代）：属性编辑（功能/参数/模型/运行）已迁入
 * 悬浮窗口（NodeInspectorWindowPortal）；本面板保留生成记录视图与节点名称编辑。
 */

function PropertySummary({ nodeId }: { nodeId: string }) {
  const node = useFlowStore((s) => selectActiveNodes(s).find((candidate) => candidate.id === nodeId));
  const readOnly = useFlowStore((s) => s.tabs.find((tab) => tab.id === s.activeTabId)?.readOnly ?? false);
  const openInspector = useNodeInspector((s) => s.open);
  const labelEdit = useCoalescedTextEdit(
    nodeId ? { kind: "node-data", nodeId, field: "label" } : null,
  );
  if (!node) return null;
  const d = node.data;
  const spec = nodeSpecForKind(d.kind);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-200">{nodeTitleForKind(d.kind)}节点</span>
        <span className="text-[11px] text-neutral-500">{STATUS_TEXT[d.status]}</span>
      </div>

      {!spec && <UnsupportedNodeKindNotice kind={d.kind} label={d.label} />}

      <label className="block space-y-1">
        <span className="text-[11px] text-neutral-500">节点名称</span>
        <input
          value={d.label}
          {...labelEdit.bind}
          disabled={readOnly || !spec || isNodeRunActive(d.status)}
          className={inputClass}
        />
      </label>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={readOnly || !spec}
        onClick={() => openInspector(nodeId)}
        className="w-full"
      >
        打开功能设置（双击节点 / Enter）
      </Button>

      <p className="text-[11px] leading-relaxed text-[var(--gc-text-muted)]">
        功能、参数与模型在节点的悬浮窗口中配置：双击节点体，选中后按 Enter，或点击节点上的「⚙ 功能」入口条。
      </p>
    </div>
  );
}

/** 「最近生成」条目对应的运行记录详情 */
function ResultRecordDetail({ resultId }: { resultId: string }) {
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
          className={`text-[11px] ${statusColor[record.status]}`}
        >
          {statusText[record.status]}
        </span>
      </div>

      {!spec && <UnsupportedNodeKindNotice kind={record.kind} label={record.nodeLabel} />}

      {record.image && (
        <img
          src={record.thumbnail ?? thumbnailImageUrl(record.image)}
          loading="lazy"
          decoding="async"
          alt={record.nodeLabel}
          className="w-full rounded-md border border-[var(--gc-border)] object-cover"
        />
      )}

      <dl className="space-y-1.5 text-[11px]">
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
          <span className="text-[10px] text-neutral-500">提示词</span>
          <p className="rounded-md border border-[var(--gc-border)] bg-[var(--gc-control)] px-2 py-1.5 text-[10px] leading-relaxed text-[var(--gc-text-muted)]">
            {record.prompt}
          </p>
        </div>
      )}

      {record.error && (
        <div className="space-y-1">
          <span className="text-[11px] text-red-400/80">错误信息</span>
          <p className="rounded-md border border-red-900/50 bg-red-950/20 px-2 py-1.5 text-[11px] leading-relaxed text-red-300/90">
            {record.error}
          </p>
        </div>
      )}
    </div>
  );
}

interface InspectorPanelProps {
  className?: string;
  view?: "auto" | "properties" | "result";
}

export function InspectorPanel({ className, view = "auto" }: InspectorPanelProps) {
  const selectedNodeId = useFlowStore(selectActivePrimarySelectedNodeId);
  const selectedResultId = useFlowStore(selectActiveSelectedResultId);
  const showResult = view === "result" || (view === "auto" && Boolean(selectedResultId));
  void selectActiveEdges;

  return (
    <aside
      className={cn(
        "gc-panel flex w-64 shrink-0 flex-col border-l border-[var(--gc-border)] bg-[var(--gc-panel)]",
        className,
      )}
    >
      <div className="border-b border-[var(--gc-border)] px-3 py-2.5 text-[10px] font-medium uppercase tracking-widest text-[var(--gc-text-muted)]">
        {showResult ? "生成记录" : "属性"}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {showResult ? (
          selectedResultId ? (
            <ResultRecordDetail resultId={selectedResultId} />
          ) : (
            <p className="py-4 text-center text-[11px] text-neutral-600">
              选择上方结果查看完整运行记录
            </p>
          )
        ) : selectedNodeId ? (
          <PropertySummary nodeId={selectedNodeId} />
        ) : (
          <p className="py-4 text-center text-[11px] text-neutral-600">
            点击画布节点查看属性
          </p>
        )}
      </div>
    </aside>
  );
}
