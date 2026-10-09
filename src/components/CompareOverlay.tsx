import { useEffect } from "react";
import { selectActiveCompareIds, useFlowStore } from "@/store/flowStore";
import { continueWithMask } from "@/lib/resultActions";
import type { RecentResult } from "@/store/flowStore";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** 多变体并排对比浮层：compareIds >= 2 时可打开，横向并排 2~4 张大图 */
export function CompareOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const compareIds = useFlowStore(selectActiveCompareIds);
  const recentResults = useFlowStore((s) => s.recentResults);
  const clearCompare = useFlowStore((s) => s.clearCompare);
  const activeTabReadOnly = useFlowStore(
    (s) => s.tabs.find((tab) => tab.id === s.activeTabId)?.readOnly ?? false,
  );

  const items = compareIds
    .map((id: string) => recentResults.find((r: RecentResult) => r.id === id))
    .filter((r): r is RecentResult => Boolean(r && r.status === "success" && r.image));

  useEffect(() => {
    if (items.length < 2) onOpenChange(false);
  }, [items.length, onOpenChange]);

  if (!open || items.length < 2) return null;

  const close = () => {
    onOpenChange(false);
    clearCompare();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="结果对比"
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-xs"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-xs font-medium tracking-widest text-[var(--gc-text-muted)]">
          对比 {items.length} 张
        </span>
        <button
          type="button"
          onClick={close}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--gc-border)] text-sm text-[var(--gc-text-muted)] transition-colors hover:border-gold hover:text-gold"
          title="关闭（Esc）"
        >
          ✕
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-stretch justify-center gap-4 px-6 pb-6">
        {items.map((r: RecentResult) => (
          <div
            key={r.id}
            className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--gc-border)] bg-[var(--gc-panel)]"
          >
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[var(--gc-control)] p-2">
              <img
                src={r.image}
                alt={r.nodeLabel}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="shrink-0 space-y-2 border-t border-[var(--gc-border)] px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium text-[var(--gc-text)]">
                  {r.nodeLabel}
                </span>
                <span className="shrink-0 text-meta-en text-[var(--gc-text-muted)]">
                  {formatTime(r.finishedAt ?? r.startedAt)}
                </span>
              </div>
              {r.prompt && (
                <p className="line-clamp-2 text-body leading-relaxed text-[var(--gc-text-muted)]">
                  {r.prompt}
                </p>
              )}
              {/* §E 对比视图沿用蒙版入口 */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void continueWithMask(r)}
                  disabled={activeTabReadOnly}
                  title={activeTabReadOnly ? "当前项目只读" : "以该图片为蒙版新建蒙版重绘节点"}
                  className="flex-1 rounded-sm border border-[var(--gc-border)] bg-[var(--gc-accent)]/10 px-2 py-1 text-xs font-medium text-[var(--gc-accent)] transition-colors hover:border-[var(--gc-accent)] hover:bg-[var(--gc-accent)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  沿用蒙版
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
