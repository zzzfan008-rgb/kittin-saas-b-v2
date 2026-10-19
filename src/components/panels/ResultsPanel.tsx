import {
  selectActiveCompareIds,
  selectActiveSelectedResultId,
  useFlowStore,
} from "@/store/flowStore";
import { useLayoutEffect, useRef } from "react";
import { OPEN_COMPARE_EVENT } from "@/lib/overlayEvents";
import { thumbnailImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { isNodeRunActive } from "@/types/workflow";
import { STATUS_TEXT } from "@/components/nodes/NodeFrame";

interface ResultsPanelProps {
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** 点单个结果时打开 ImageViewer（65d R-87 §3：ResultDetailDialog 已删除）。 */
  className?: string;
  /** 固定可见行数（5 列网格 × 6 行 = 30 条一页）；列表高度 = 行数 × 行高，超出部分滚轮滚动自动加载更多。 */
  rowsVisible?: number;
}

/** 「历史创作记录」浮层里的跨项目结果列表（5 列缩略图；首屏一页 30 条，滚轮到底自动加载下一页）。 */
export function ResultsPanel({
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  className,
  rowsVisible,
}: ResultsPanelProps) {
  // 生成历史是跨项目的全局记录；即使项目页签未恢复，也必须能在刷新后找回。
  const recentResults = useFlowStore((s) => s.recentResults);
  const selectedResultId = useFlowStore(selectActiveSelectedResultId);
  const setSelectedResultId = useFlowStore((s) => s.setSelectedResultId);
  const compareIds = useFlowStore(selectActiveCompareIds);
  const toggleCompareId = useFlowStore((s) => s.toggleCompareId);
  const resultCardClass = "aspect-square min-w-0 w-full";
  const resultActionClass =
    "rounded-sm px-1 py-1 text-label font-medium leading-none text-[var(--gc-media-overlay-text)] hover:bg-white/15 hover:text-white focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-45";

  const openViewer = useFlowStore((s) => s.openViewer);
  // 65d R-87 §3：ResultDetailDialog 已删除；点「查看详情」直接打开 ImageViewer。
  const openDetail = (r: (typeof recentResults)[number]) => {
    setSelectedResultId(r.id);
    // 查看器直接用原图 URL（r.image 即服务端 /api/files 原图），不用缩略图代理。
    openViewer({ url: r.image, title: r.nodeLabel, resultId: r.id });
  };
  const isVideoRecord = (r: (typeof recentResults)[number]) =>
    r.kind === "video-generator" || /\.mp4($|[?#])/i.test(r.image);

  // rowsVisible：首行实测行高 → 固定列表视口高度（行数 × 行高），右侧滚动条自由滚动。
  const scrollerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // 滚轮无限加载：接近底部自动拉下一页，不用点按钮。
  const maybeLoadMore = () => {
    if (!hasMore || loadingMore || !onLoadMore) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const remain = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (remain < 320) onLoadMore();
  };
  useLayoutEffect(() => {
    if (!rowsVisible) return;
    const scroller = scrollerRef.current;
    const grid = gridRef.current;
    if (!scroller || !grid) return;
    const row = grid.firstElementChild as HTMLElement | null;
    if (!row) return;
    const styles = getComputedStyle(grid);
    const rowH = row.getBoundingClientRect().height;
    const gap = parseFloat(styles.rowGap || styles.gap || "0") || 0;
    scroller.style.maxHeight = `${rowsVisible * rowH + (rowsVisible - 1) * gap + 24}px`;
  }, [rowsVisible, recentResults.length]);

  // 内容不足一屏（滚不动）时才补一页，避免首屏不满 5×6 却要手动点；
  // 之前无条件补页会导致打开即拉穿所有页（36 条一次全出），必须按需加载。
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (scroller.scrollHeight <= scroller.clientHeight + 48) maybeLoadMore();
  });

  return (
    <section
      aria-label="最近生成"
      className={cn("gc-panel flex min-h-0 flex-col bg-[var(--gc-panel)]", className)}
    >
      <div className="flex min-w-0 items-center gap-2 border-b border-[var(--gc-border)] px-3 py-2">
        <span className="text-label font-medium uppercase tracking-widest text-[var(--gc-text-muted)]">
          最近生成
        </span>
        <span className="text-label text-[var(--gc-text-muted)]">{recentResults.length} 条</span>
        <span className="ml-auto flex min-w-0 shrink-0 items-center gap-3">
          {compareIds.length >= 2 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent(OPEN_COMPARE_EVENT));
              }}
              className="rounded-sm border border-gold/60 bg-gold/10 px-2 py-0.5 text-label font-medium text-gold transition-colors hover:bg-gold/20"
            >
              对比 {compareIds.length} 张
            </button>
          )}
        </span>
      </div>
      <div
        ref={scrollerRef}
        onScroll={maybeLoadMore}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
      >
          {recentResults.length === 0 ? (
            <p className="py-3 text-center text-label text-[var(--gc-text-muted)]">
              运行 AI 节点后，生成结果与运行记录会汇总在这里
            </p>
          ) : (
            <div ref={gridRef} className="grid grid-cols-5 gap-2">
              {recentResults.map((r) =>
                isNodeRunActive(r.status) ? (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedResultId(r.id)}
                    className={`flex ${resultCardClass} flex-col items-center justify-center gap-2 rounded-md border bg-[var(--gc-control)] px-1 ${
                      selectedResultId === r.id
                        ? "border-gold"
                        : "border-[var(--gc-border)] hover:border-gold/60"
                    }`}
                    title={STATUS_TEXT[r.status]}
                  >
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                    <span className="text-label text-gold">
                      {STATUS_TEXT[r.status]}
                    </span>
                    <span className="w-full truncate text-center text-label text-[var(--gc-text-muted)]">
                      {r.nodeLabel}
                    </span>
                  </button>
                ) : r.status !== "success" ? (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedResultId(r.id)}
                    className={`flex ${resultCardClass} flex-col items-center justify-center gap-1 rounded-md border bg-[var(--gc-control)] px-1 ${
                      selectedResultId === r.id
                        ? r.status === "cancelled" ? "border-neutral-500" : "border-red-400"
                        : r.status === "cancelled"
                          ? "border-neutral-700 hover:border-neutral-500"
                          : "border-red-900/50 hover:border-red-400/60"
                    }`}
                    title={r.error ?? STATUS_TEXT[r.status]}
                  >
                    <span className={`text-label ${r.status === "cancelled" ? "text-[var(--gc-text-muted)]" : "text-red-400"}`}>
                      {STATUS_TEXT[r.status]}
                    </span>
                    <span className="w-full truncate text-center text-label text-[var(--gc-text-muted)]">
                      {r.nodeLabel}
                    </span>
                  </button>
                ) : (
                  <article
                    key={r.id}
                    className={`group relative ${resultCardClass} overflow-hidden rounded-md border bg-[var(--gc-control)] ${
                      compareIds.includes(r.id)
                        ? "border-gold ring-2 ring-gold/70"
                        : selectedResultId === r.id
                          ? "border-gold ring-1 ring-gold"
                          : "border-[var(--gc-border)] hover:border-gold/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          toggleCompareId(r.id);
                        } else {
                          // 主点击进详情页（与「查看」一致），不再只弹轻量灯箱。
                          openDetail(r);
                        }
                      }}
                      aria-label={`查看 ${r.nodeLabel} 详情`}
                      className="absolute inset-0 h-full w-full cursor-zoom-in focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {isVideoRecord(r) ? (
                        <video
                          src={r.image}
                          preload="metadata"
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={r.thumbnail ?? thumbnailImageUrl(r.image)}
                          alt={r.nodeLabel}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                    </button>
                    {compareIds.includes(r.id) && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-meta-en font-bold text-[var(--gc-accent-cta-ink)]">
                        {compareIds.indexOf(r.id) + 1}
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompareId(r.id);
                        }}
                        className={`${resultActionClass} w-full`}
                        aria-label={`${compareIds.includes(r.id) ? "取消" : "加入"}对比 ${r.nodeLabel}`}
                        aria-pressed={compareIds.includes(r.id)}
                        title={compareIds.includes(r.id) ? "取消对比" : "加入对比"}
                      >
                        {compareIds.includes(r.id) ? "取消对比" : "加入对比"}
                      </button>
                    </div>
                  </article>
                ),
              )}
              {loadingMore && (
                <div className={`${resultCardClass} flex items-center justify-center rounded-md border border-dashed border-[var(--gc-border)] text-label text-[var(--gc-text-muted)]`}>
                  加载中…
                </div>
              )}
            </div>
          )}
      </div>
    </section>
  );
}
