import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  selectActiveCompareIds,
  useFlowStore,
} from "@/store/flowStore";
import {
  continueWithResult,
  openResultViewer,
  toggleResultCompare,
} from "@/lib/resultActions";
import { thumbnailImageUrl } from "@/lib/images";
import { ResultRecordDetail } from "./ResultRecordDetail";

interface ResultDetailDialogProps {
  /** 当前要查看的结果 id；null 表示关闭。 */
  resultId: string | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * 「结果详情」弹窗（2026-09-25 决策：左侧「属性 / 结果」栏移除后，结果详情改为在
 * 「历史创作记录」里点单个结果时弹出）。
 *
 * - 主体 = 大图 + 完整运行记录（`ResultRecordDetail`）；点大图才打开图片查看器，
 *   避免两层浮层直接叠在一起。
 * - 结果能力不削弱（AGENTS.md §3）：查看大图 / 加入对比 / 下载 / 设为输入 都在弹窗里可用，
 *   与浮层卡片上的动作共用 `@/lib/resultActions`。
 * - 记录已不在当前会话（切换项目或刷新过）时给明确空态，而不是渲染一片空白。
 * - 关闭路径：Esc / 右上角关闭按钮 / 点遮罩；焦点由 Base UI Dialog 交还给触发它的结果卡片。
 */
export function ResultDetailDialog({ resultId, onOpenChange }: ResultDetailDialogProps) {
  const record = useFlowStore((s) =>
    resultId ? s.recentResults.find((r) => r.id === resultId) ?? null : null,
  );
  const compareIds = useFlowStore(selectActiveCompareIds);
  const activeTabReadOnly = useFlowStore(
    (s) => s.tabs.find((tab) => tab.id === s.activeTabId)?.readOnly ?? false,
  );
  const comparing = record ? compareIds.includes(record.id) : false;

  return (
    <Dialog open={Boolean(resultId)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[70] bg-black/70 backdrop-blur-sm"
        className="gc-panel z-[71] flex max-h-[min(760px,calc(100vh-4rem))] w-[min(880px,calc(100vw-4rem))] max-w-none flex-col sm:max-w-none gap-0 overflow-hidden rounded-2xl border border-[var(--gc-border)] bg-[var(--gc-panel)] p-0 text-[var(--gc-text)] shadow-2xl shadow-black/70 ring-0"
      >
        <header className="flex items-start gap-3 border-b border-[var(--gc-border)] px-4 py-3">
          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold text-[var(--gc-text)]">
              结果详情
            </DialogTitle>
            <DialogDescription className="mt-0.5 truncate text-label text-[var(--gc-text-muted)]">
              {record ? record.nodeLabel : "该结果已不在当前会话中"}
            </DialogDescription>
          </div>
          <DialogClose
            type="button"
            aria-label="关闭结果详情"
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--gc-text-muted)] hover:bg-[var(--gc-panel-hover)] hover:text-[var(--gc-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gc-accent)]"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </DialogClose>
        </header>

        {record ? (
          <>
            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
              <button
                type="button"
                onClick={() => openResultViewer(record)}
                aria-label={`查看 ${record.nodeLabel} 大图`}
                title="查看大图"
                className="group relative flex min-h-[240px] cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-[var(--gc-border)] bg-[var(--gc-control)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gc-accent)]"
              >
                <img
                  src={record.thumbnail ?? thumbnailImageUrl(record.image)}
                  alt={record.nodeLabel}
                  loading="lazy"
                  decoding="async"
                  className="max-h-[46vh] w-full object-contain transition-transform motion-reduce:transition-none group-hover:scale-[1.02]"
                />
                <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-label text-white">
                  查看大图
                </span>
              </button>
              <div className="min-w-0">
                <ResultRecordDetail resultId={record.id} />
              </div>
            </div>

            <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--gc-border)] px-4 py-3">
              <Button type="button" onClick={() => openResultViewer(record)}>
                查看大图
              </Button>
              <Button
                type="button"
                variant="outline"
                aria-pressed={comparing}
                onClick={() => toggleResultCompare(record.id)}
              >
                {comparing ? "取消对比" : "加入对比"}
              </Button>
              <a
                href={record.image}
                download
                className={buttonVariants({ variant: "outline" })}
              >
                下载
              </a>
              <Button
                type="button"
                variant="outline"
                disabled={activeTabReadOnly}
                title={activeTabReadOnly ? "当前项目只读" : "把该结果作为输入节点放回画布"}
                onClick={() => continueWithResult(record)}
              >
                设为输入
              </Button>
            </footer>
          </>
        ) : (
          <div className="px-4 py-10 text-center text-xs leading-relaxed text-[var(--gc-text-muted)]">
            该结果记录已不在当前会话中（可能已切换项目或刷新过）。
            <br />
            请关闭后在「历史创作记录」里重新选择一条结果。
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
