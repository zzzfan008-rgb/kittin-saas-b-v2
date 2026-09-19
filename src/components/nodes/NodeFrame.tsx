import { useRef, useState, type ReactNode } from "react";
import { isNodeRunActive, type NodeKind, type NodeRunStatus } from "@/types/workflow";
import { useGenerationSafetyBlockReason } from "@/store/generationSafety";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { nodeProductPolicy } from "@/lib/nodeProductPolicy";
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
  children: ReactNode;
}

/** 节点通用卡片框架：标题栏（双击改名） + 状态点 + 内容区 */
export function NodeFrame({ title, status, error, selected, nodeId, children }: NodeFrameProps) {
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
    <div
      className={`gc-node-card w-[280px] rounded-xl border bg-[var(--gc-node-main)] shadow-xl shadow-black/40 transition-colors ${
        selected ? "border-gold" : "border-[var(--gc-node-border)]"
      }`}
    >
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
            className={`truncate text-xs font-medium tracking-wide text-neutral-200 ${nodeId ? "cursor-text" : ""}`}
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
      <div className="gc-node-body space-y-3 p-3">{children}</div>
      {error && (
        <div className="mx-3 mb-3 rounded-md border border-red-900/50 bg-red-950/40 px-2 py-1.5 text-[11px] leading-relaxed text-red-400">
          {error}
        </div>
      )}
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
      <button
        type="button"
        onClick={onClick}
        disabled={active || disabled || Boolean(disabledReason) || newGenerationBlocked}
        title={newGenerationBlocked ? safetyBlockReason ?? undefined : disabledReason}
        className={`nodrag w-full rounded-md px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed ${
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
      </button>
      {!active && !newGenerationBlocked && disabledReason && (
        <p className="text-[11px] leading-relaxed text-[var(--gc-warn-text)]">{disabledReason}</p>
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
      className="rounded-md border border-[var(--gc-border)] bg-[var(--gc-node-inner)] px-2 py-1.5 text-[11px] leading-relaxed text-[var(--gc-text-muted)]"
    >
      <p className="font-medium tracking-wide">暂不支持</p>
      <p className="mt-0.5">{policy.reason}</p>
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

/** V4 可灵 chip 提示词板：左侧 accent 引用条 + 边框，与输入框明确区分（非禁用态语义）。
 *  R-50 P1-3：亮 accent（--gc-node-accent）在白卡上仅 1.19–1.31:1，焦点边框改用
 *  行动色深档 --gc-accent-deep（三主题 on #ffffff 实测 5.14 / 5.57 / 5.41:1 ≥3:1）；
 *  静息左条保留亮 accent 作为 chip 身份标识，focus 时维持全亮。 */
export const promptChipClass =
  "nodrag w-full rounded-[10px] border border-[var(--gc-node-border)] border-l-[3px] border-l-[var(--gc-node-accent)] bg-[var(--gc-node-inner)] px-3 py-2.5 text-xs leading-relaxed text-[var(--gc-node-text)] placeholder:text-[var(--gc-node-muted)] focus:border-[var(--gc-accent-deep)] focus:border-l-[var(--gc-node-accent)] focus:outline-hidden";
