import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ResultsPanel } from "./ResultsPanel";
import { ResultDetailDialog } from "./ResultDetailDialog";

interface ResultsFabProps {
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * 画布右上角的「历史创作记录」文字图标。
 *
 * - 入口是纯文字「历史创作记录」（不是示意图形），用户一眼可辨。
 * - 点击展开悬浮面板：「最近生成」缩略图（3 列，可继续加载）。
 * - 2026-09-25 决策：点单个结果弹出「结果详情」弹窗（`ResultDetailDialog`）。
 *   原先内联在浮层下方 38% 高的「运行记录」块已删除，详情只保留一个家；左侧
 *   「属性 / 结果」Dock 也已整体移除，节点属性编辑内联在生成节点卡片上。
 * - 弹窗打开期间不关闭浮层（关闭弹窗后回到原位与滚动位置），因此这里的两处
 *   文档级关闭手势在弹窗打开时直接让路。
 *
 * 悬浮面板是受控绝对定位层，不依赖 React Flow 的 Panel，因此可放在 ReactFlowProvider
 * 之外的画布容器里，历史分页 props 由 App 工作区透传。
 */
export function ResultsFab({ hasMore = false, loadingMore = false, onLoadMore }: ResultsFabProps) {
  const [open, setOpen] = useState(false);
  const [detailResultId, setDetailResultId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => setOpen((value) => !value);

  // 点击浮层外部时关闭（不拦截面板内部交互）；结果详情弹窗打开时不关闭浮层。
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (detailResultId) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // Esc 先交给「结果详情」弹窗（Base UI 自带收起与焦点归还），浮层保持不动。
      if (event.key === "Escape" && !detailResultId) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, detailResultId]);

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
                onOpenDetail={setDetailResultId}
                className="h-full border-0"
              />
            </div>
          </div>
        )}
      </div>

      <ResultDetailDialog
        resultId={detailResultId}
        onOpenChange={(next) => {
          if (!next) setDetailResultId(null);
        }}
      />
    </div>
  );
}
