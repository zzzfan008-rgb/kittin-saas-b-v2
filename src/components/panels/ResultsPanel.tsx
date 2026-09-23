import {
  selectActiveCompareIds,
  selectActiveSelectedResultId,
  useFlowStore,
} from "@/store/flowStore";
import { OPEN_COMPARE_EVENT } from "@/lib/overlayEvents";
import { thumbnailImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { isNodeRunActive } from "@/types/workflow";
import { STATUS_TEXT } from "@/components/nodes/NodeFrame";
import { continueWithResult } from "@/lib/resultActions";

interface ResultsPanelProps {
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** 点单个结果时打开「结果详情」弹窗（浮层与弹窗都由 ResultsFab 承载）。 */
  onOpenDetail: (resultId: string) => void;
  className?: string;
}

/** 「历史创作记录」浮层里的跨项目结果列表（3 列缩略图，可继续加载）。 */
export function ResultsPanel({
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onOpenDetail,
  className,
}: ResultsPanelProps) {
  // 生成历史是跨项目的全局记录；即使项目页签未恢复，也必须能在刷新后找回。
  const recentResults = useFlowStore((s) => s.recentResults);
  const selectedResultId = useFlowStore(selectActiveSelectedResultId);
  const setSelectedResultId = useFlowStore((s) => s.setSelectedResultId);
  const compareIds = useFlowStore(selectActiveCompareIds);
  const toggleCompareId = useFlowStore((s) => s.toggleCompareId);
  const activeTabReadOnly = useFlowStore(
    (s) => s.tabs.find((tab) => tab.id === s.activeTabId)?.readOnly ?? false,
  );
  const resultCardClass = "aspect-square min-w-0 w-full";
  const resultActionClass =
    "rounded-sm px-1 py-1 text-label font-medium leading-none text-[var(--gc-media-overlay-text)] hover:bg-white/15 hover:text-white focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-45";

  // 点单个结果 = 打开「结果详情」弹窗（不再直接开图片查看器；查看器由弹窗里的大图进入）。
  const openDetail = (r: (typeof recentResults)[number]) => {
    setSelectedResultId(r.id);
    onOpenDetail(r.id);
  };

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
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {recentResults.length === 0 ? (
            <p className="py-3 text-center text-label text-[var(--gc-text-muted)]">
              运行 AI 节点后，生成结果与运行记录会汇总在这里
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
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
                          openDetail(r);
                        }
                      }}
                      aria-label={`查看 ${r.nodeLabel}`}
                      className="absolute inset-0 h-full w-full cursor-zoom-in focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <img
                        src={r.thumbnail ?? thumbnailImageUrl(r.image)}
                        alt={r.nodeLabel}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                    {compareIds.includes(r.id) && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-meta-en font-bold text-[var(--gc-accent-cta-ink)]">
                        {compareIds.indexOf(r.id) + 1}
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-1 bg-black/75 p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(r);
                        }}
                        className={resultActionClass}
                        aria-label={`查看 ${r.nodeLabel}`}
                        title="查看详情"
                      >
                        查看
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompareId(r.id);
                        }}
                        className={resultActionClass}
                        aria-label={`${compareIds.includes(r.id) ? "取消" : "加入"}对比 ${r.nodeLabel}`}
                        aria-pressed={compareIds.includes(r.id)}
                        title={compareIds.includes(r.id) ? "取消对比" : "加入对比"}
                      >
                        {compareIds.includes(r.id) ? "取消" : "对比"}
                      </button>
                      <a
                        href={r.image}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className={resultActionClass}
                        aria-label={`下载 ${r.nodeLabel}`}
                        title="下载"
                      >
                        下载
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          continueWithResult(r);
                        }}
                        disabled={activeTabReadOnly}
                        className={resultActionClass}
                        aria-label={`将 ${r.nodeLabel} 设为输入，继续处理`}
                        title={activeTabReadOnly ? "当前项目只读" : "设为输入"}
                      >
                        输入
                      </button>
                    </div>
                  </article>
                ),
              )}
              {hasMore && onLoadMore && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className={`${resultCardClass} rounded-md border border-dashed border-(--gc-border) text-label text-(--gc-text-muted) hover:border-(--gc-accent) hover:text-(--gc-accent) disabled:opacity-50`}
                >
                  {loadingMore ? "加载中…" : "加载更多"}
                </button>
              )}
            </div>
          )}
      </div>
    </section>
  );
}
