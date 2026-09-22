import { useEffect, useRef, useState } from "react";
import { selectActiveSelectedResultId, useFlowStore } from "@/store/flowStore";
import { cn } from "@/lib/utils";
import { ResultsPanel } from "./ResultsPanel";
import { ResultRecordDetail } from "./InspectorPanel";

interface ResultsFabProps {
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * 画布右上角的「历史创作记录」文字图标。
 *
 * - 入口是纯文字「历史创作记录」（不是示意图形），用户一眼可辨。
 * - 点击展开悬浮面板：上方「最近生成」缩略图（3 列），下方选中结果的运行记录详情。
 * - 结果/记录两个模块在此合并为一个入口；节点「属性」留在左侧 Dock（ContextPanel）。
 *
 * 悬浮面板是受控绝对定位层，不依赖 React Flow 的 Panel，因此可放在 ReactFlowProvider
 * 之外的画布容器里，历史分页 props 由 App 工作区透传。
 */
export function ResultsFab({ hasMore = false, loadingMore = false, onLoadMore }: ResultsFabProps) {
  const [open, setOpen] = useState(false);
  const selectedResultId = useFlowStore(selectActiveSelectedResultId);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => setOpen((value) => !value);

  // 点击浮层外部时关闭（不拦截面板内部交互）。
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-30">
      <div className="pointer-events-auto relative flex flex-col items-end">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? "results-fab-panel" : undefined}
          title="历史创作记录"
          onClick={toggle}
          className={cn(
            "inline-flex h-9 items-center rounded-xl border px-3 text-sm font-semibold tracking-wide shadow-[0_0_0_.5px_rgba(0,0,0,.06),0_4px_10px_rgba(0,0,0,.12)] transition-colors motion-reduce:transition-none",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gc-accent)]",
            open
              ? "border-[var(--gc-accent)] bg-[var(--gc-accent)] text-[var(--gc-accent-cta-ink,#131313)]"
              : "border-[var(--gc-node-border,var(--gc-border))] bg-[var(--gc-panel)] text-[var(--gc-text)] hover:border-[var(--gc-accent)]",
          )}
        >
          历史创作记录
        </button>

        {open && (
          <div
            id="results-fab-panel"
            role="dialog"
            aria-label="历史创作记录"
            ref={panelRef}
            className="mt-2 flex max-h-[72vh] w-[560px] flex-col overflow-hidden rounded-2xl border border-[var(--gc-node-border,var(--gc-border))] bg-[var(--gc-panel)] shadow-[0_0_0_.5px_rgba(0,0,0,.06),0_16px_40px_rgba(0,0,0,.35)]"
          >
            <div className="min-h-0 flex-1">
              <ResultsPanel
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={onLoadMore}
                className="h-full border-0"
              />
            </div>
            {selectedResultId && (
              <div
                aria-label="运行记录"
                className="max-h-[38%] shrink-0 overflow-y-auto border-t border-[var(--gc-border)] p-3"
              >
                <div className="mb-2 text-[10px] font-medium uppercase tracking-widest text-[var(--gc-text-muted)]">
                  运行记录
                </div>
                <ResultRecordDetail resultId={selectedResultId} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}