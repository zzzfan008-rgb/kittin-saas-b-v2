import { useRef, useState, type ReactNode } from "react";
import {
  isNodeRunActive,
  nodeTitleForKind,
  type NodeKind,
  type NodeRunStatus,
} from "@/types/workflow";
import { useGenerationSafetyBlockReason } from "@/store/generationSafety";
import { useFlowStore } from "@/store/flowStore";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { nodeProductPolicy } from "@/lib/nodeProductPolicy";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_STYLE: Record<NodeRunStatus, string> = {
  idle: "var(--gc-status-idle)",
  queued: "var(--gc-status-queued)",
  running: "var(--gc-status-running)",
  retry_wait: "var(--gc-status-retry)",
  cancel_requested: "var(--gc-status-retry)",
  success: "var(--gc-status-success)",
  error: "var(--gc-status-error)",
  outcome_unknown: "var(--gc-status-unknown)",
  cancelled: "var(--gc-status-idle)",
};

const STATUS_ANIMATE: Partial<Record<NodeRunStatus, string>> = {
  running: "animate-pulse",
  retry_wait: "animate-pulse",
  cancel_requested: "animate-pulse",
};

export const STATUS_TEXT: Record<NodeRunStatus, string> = {
  idle: "空闲",
  queued: "排队中",
  running: "运行中",
  retry_wait: "等待重试",
  cancel_requested: "取消请求中",
  success: "成功",
  error: "失败",
  outcome_unknown: "结果未知",
  cancelled: "已取消",
};

export function StatusDot({ status }: { status: NodeRunStatus }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              aria-label={`状态：${STATUS_TEXT[status]}`}
              className={`inline-block shrink-0 rounded-full ${STATUS_ANIMATE[status] ?? ""}`}
              style={{
                width: "var(--gc-dot-status)",
                height: "var(--gc-dot-status)",
                backgroundColor: STATUS_STYLE[status],
                opacity: status === "cancelled" ? 0.6 : undefined,
              }}
            />
          }
        />
        <TooltipContent side="top" sideOffset={6}>
          {STATUS_TEXT[status]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface NodeFrameProps {
  title: string;
  status: NodeRunStatus;
  error?: string;
  selected?: boolean;
  /** 传入 nodeId 后标题支持双击改名（回车/失焦确认，Esc 取消） */
  nodeId?: string;
  /** 节点卡正上方 8px 的工具条槽位（v8 plan.md §3.2）；由各 kind 通过 NodeToolbar 提供。 */
  toolbar?: ReactNode;
  /** 无边框模式：渲染为纯内容 + 左上角名称徽标（名称仍可双击改名），内容自身带边框 */
  frameless?: boolean;
  /** 节点类型 + 创建序号（frameless 模式渲染为「图1」式徽标） */
  nodeKind?: NodeKind;
  /** 覆盖徽标文案（如空槽位显示「请上传图片」）；优先级高于序号徽标 */
  badgeLabel?: string;
  children: ReactNode;
}

/** 节点通用卡片框架：标题栏（双击改名） + 状态点 + 内容区 + 正上方工具条槽位 */
export function NodeFrame({ title, status, error, selected, nodeId, toolbar, frameless = false, nodeKind, badgeLabel, children }: NodeFrameProps) {
  const kindOrdinal = useFlowStore((s) => {
    if (!nodeId || !nodeKind) return null;
    const tab = s.tabs.find((t) => t.id === s.activeTabId);
    if (!tab) return null;
    const sameKind = tab.nodes.filter((n) => n.type === nodeKind);
    const idx = sameKind.findIndex((n) => n.id === nodeId);
    return idx >= 0 ? idx + 1 : null;
  });
  const badgePrefix = nodeKind === "image" ? "图" : nodeKind === "video" ? "视" : nodeKind === "text" ? "文" : null;
  const badgeText = badgeLabel ?? (frameless && badgePrefix && kindOrdinal != null ? `${badgePrefix}${kindOrdinal}` : title);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const cancelledRef = useRef(false);
  const labelEdit = useCoalescedTextEdit(
    nodeId ? { kind: "node-data", nodeId, field: "label" } : null,
  );

  const commit = () => {
    const v = draft.trim();
    if (!v) labelEdit.cancel();
    else {
      labelEdit.updateValue(v);
      labelEdit.flush();
    }
    setEditing(false);
  };

  return (
    <div className="gc-node-root relative w-[var(--gc-node-width)]">
      {toolbar}
      {/* 内容槽位：frameless 与白卡共用同一 DOM 结构——children 始终位于同一位置，
          frameless 切换（如文本节点空↔有内容）不重挂载 children，文本框编辑焦点不丢。 */}
      <div
        className={
          frameless
            ? "gc-frameless relative w-full"
            : `gc-node-card w-full rounded-xl border bg-[var(--gc-node-main)] shadow-xl shadow-black/40 transition-colors ${
                selected ? "border-gold" : "border-[var(--gc-node-border)]"
              }`
        }
      >
        {frameless ? (
          <div
            data-node-badge
            className="absolute bottom-full left-1/2 z-20 mb-2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border border-[var(--gc-node-border,var(--gc-border))] bg-[var(--gc-panel)] px-1.5 py-0.5"
          >
            <StatusDot status={status} />
            {editing ? (
              <input
                value={draft}
                autoFocus
                {...labelEdit.bind}
                onChange={(event) => {
                  setDraft(event.target.value);
                  labelEdit.updateValue(event.target.value);
                }}
                onBlur={() => {
                  if (cancelledRef.current) {
                    cancelledRef.current = false;
                    return;
                  }
                  commit();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) commit();
                  if (e.key === "Escape") {
                    cancelledRef.current = true;
                    labelEdit.cancel();
                    setEditing(false);
                  }
                }}
                className="nodrag w-24 rounded-sm border border-[var(--gc-node-accent)] bg-[var(--gc-node-inner)] px-1 py-0.5 text-xs text-[var(--gc-node-text)] focus:border-[var(--gc-accent-deep)] focus:outline-hidden"
              />
            ) : (
              <span
                className={`truncate text-xs font-medium tracking-wide text-[var(--gc-text)] ${nodeId ? "cursor-text" : ""}`}
                title={nodeId ? `双击改名（当前：${title}）` : undefined}
                onDoubleClick={
                  nodeId
                    ? (e) => {
                        e.stopPropagation();
                        cancelledRef.current = false;
                        setDraft(title);
                        setEditing(true);
                      }
                    : undefined
                }
              >
                {badgeText}
              </span>
            )}
          </div>
        ) : (
          <div className="gc-node-header flex items-center gap-2 rounded-t-xl border-b border-[var(--gc-node-border)] bg-[var(--gc-node-header)] px-3 py-2">
            <StatusDot status={status} />
            {editing ? (
              <input
                value={draft}
                autoFocus
                {...labelEdit.bind}
                onChange={(event) => {
                  setDraft(event.target.value);
                  labelEdit.updateValue(event.target.value);
                }}
                onBlur={() => {
                  if (cancelledRef.current) {
                    cancelledRef.current = false;
                    return;
                  }
                  commit();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) commit();
                  if (e.key === "Escape") {
                    cancelledRef.current = true;
                    labelEdit.cancel();
                    setEditing(false);
                  }
                }}
                className="nodrag min-w-0 flex-1 rounded-sm border border-[var(--gc-node-accent)] bg-[var(--gc-node-inner)] px-1.5 py-0.5 text-xs text-[var(--gc-node-text)] focus:border-[var(--gc-accent-deep)] focus:outline-hidden"
              />
            ) : (
              <span
                className={`truncate text-xs font-medium tracking-wide text-[var(--gc-node-text)] ${nodeId ? "cursor-text" : ""}`}
                title={nodeId ? "双击改名" : undefined}
                onDoubleClick={
                  nodeId
                    ? () => {
                        cancelledRef.current = false;
                        setDraft(title);
                        setEditing(true);
                      }
                    : undefined
                }
              >
                {title}
              </span>
            )}
          </div>
        )}
        <div className={frameless ? "contents" : "gc-node-body space-y-3 p-3"}>
          {children}
        </div>
        {error && (
          <div
            className={
              frameless
                ? "mt-2 rounded-md border border-red-900/50 bg-red-950/40 px-2 py-1.5 text-body leading-relaxed text-red-400"
                : "mx-3 mb-3 rounded-md border border-red-900/50 bg-red-950/40 px-2 py-1.5 text-body leading-relaxed text-red-400"
            }
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

interface RunButtonProps {
  status: NodeRunStatus;
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  disabledReason?: string;
  disabledLabel?: string;
}

export function RunButton({
  status,
  onClick,
  label = "运行",
  disabled,
  disabledReason,
  disabledLabel = "未验证不可运行",
}: RunButtonProps) {
  const active = isNodeRunActive(status);
  const safetyBlockReason = useGenerationSafetyBlockReason();
  const newGenerationBlocked = !active && Boolean(safetyBlockReason);
  return (
    <div className="space-y-1">
      <Button
        type="button"
        onClick={onClick}
        disabled={active || disabled || Boolean(disabledReason) || newGenerationBlocked}
        title={newGenerationBlocked ? safetyBlockReason ?? undefined : disabledReason}
        className={`nodrag w-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed ${
          active ? "btn-running-breathe text-[var(--gc-warn-text)]" : "bg-gold text-[var(--gc-accent-cta-ink)] disabled:opacity-40"
        }`}
        style={active ? { backgroundColor: "var(--gc-panel-hover)" } : undefined}
      >
        {active
          ? STATUS_TEXT[status]
          : newGenerationBlocked
            ? "生成暂不可用"
            : disabledReason
              ? disabledLabel
              : label}
      </Button>
      {!active && !newGenerationBlocked && disabledReason && (
        <p className="text-label leading-relaxed text-[var(--gc-warn-text)]">{disabledReason}</p>
      )}
    </div>
  );
}

/** Visible phase-one policy marker for historical nodes that remain editable. */
export function NodeProductPolicyNotice({ kind }: { kind: NodeKind }) {
  const policy = nodeProductPolicy(kind);
  if (policy.paidRunAllowed) return null;
  return (
    <div
      role="note"
      data-product-support="unsupported"
      className="rounded-md border border-[var(--gc-border)] bg-[var(--gc-node-inner)] px-2 py-1.5 text-label leading-relaxed text-[var(--gc-text-muted)]"
    >
      <p className="font-medium tracking-wide">暂不支持</p>
      <p className="mt-0.5">{policy.reason}</p>
    </div>
  );
}

/**
 * R-79：未知/legacy kind 的显式降级占位。不是吞错——记录/节点仍渲染，但以统一
 * 文案明确告知「内容不可查看/运行/编辑」，并保留节点名与类型可读。
 */
export function UnsupportedNodeKindNotice({
  kind,
  label,
}: {
  kind: unknown;
  label?: string;
}) {
  const kindTitle = nodeTitleForKind(kind);
  return (
    <div
      role="note"
      data-unsupported-kind="true"
      className="rounded-md border border-[var(--gc-border)] bg-[var(--gc-node-inner)] px-2 py-1.5 text-label leading-relaxed text-[var(--gc-text-muted)]"
    >
      <p className="font-medium tracking-wide">不支持的旧版本内容</p>
      <p className="mt-0.5">
        {label ? `节点「${label}」的` : "该"}类型「{kindTitle}」来自旧版本，当前版本不支持查看、运行或编辑。
      </p>
    </div>
  );
}

/** 方案 E「暗房显影」占位动画：节点运行期间展示在结果图片区 */
export function Developing() {
  return (
    <div className="develop-overlay nodrag h-28 w-full">
      <div className="develop-gridlines" />
      <div className="develop-scanline" />
      <span className="develop-label">显影中</span>
    </div>
  );
}

export const inputClass =
  "nodrag w-full rounded-md border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] px-2 py-1.5 text-xs text-[var(--gc-node-text)] placeholder:text-[var(--gc-node-muted)] focus:border-[var(--gc-accent-deep)] focus:outline-hidden";
