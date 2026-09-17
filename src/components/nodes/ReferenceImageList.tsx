import { useRef } from "react";
import { thumbnailImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

export interface ReferenceImageListItem {
  order: number;
  edgeId?: string;
  sourceNodeId: string;
  sourceLabel: string;
  imageUrl?: string;
  available: boolean;
  unavailableReason?: string;
}

export type ReferenceImageListMoveDirection = "up" | "down";

export interface ReferenceImageListProps {
  references: readonly ReferenceImageListItem[];
  disabled?: boolean;
  onMove?: (
    reference: ReferenceImageListItem,
    direction: ReferenceImageListMoveDirection,
  ) => void;
  onRemove?: (reference: ReferenceImageListItem) => void;
}

export function ReferenceImageList({
  references,
  disabled = false,
  onMove,
  onRemove,
}: ReferenceImageListProps) {
  const listRef = useRef<HTMLElement>(null);
  if (references.length === 0) return null;

  const restoreFocus = (order: number | undefined) => {
    if (order === undefined || typeof window === "undefined") return;
    window.setTimeout(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-reference-order="${order}"] button`)
        ?.focus();
    }, 0);
  };

  return (
    <section
      ref={listRef}
      aria-label="参考图列表"
      className="space-y-2 rounded-md border border-[var(--gc-border)] bg-[var(--gc-panel-soft)] p-2"
    >
      <div className="space-y-0.5">
        <p className="text-[11px] font-medium text-[var(--gc-text)]">本次参考图</p>
        <p className="text-[11px] leading-relaxed text-[var(--gc-text-muted)]">
          按实际输入顺序传入；不可用时不能运行。
        </p>
      </div>

      <div className="space-y-1.5">
        {references.map((reference, referenceIndex) => {
          const status = !reference.available ? "不可用" : "可用";
          const reasonId = `reference-${reference.order}-unavailable-reason`;

          return (
            <div
              key={`${reference.sourceNodeId}:${reference.order}`}
              data-reference-order={reference.order}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-2 rounded border border-[var(--gc-border)] bg-[var(--gc-control)] p-1.5"
            >
              <div className="overflow-hidden rounded-sm border border-[var(--gc-border)] bg-black/20">
                {reference.available && reference.imageUrl ? (
                  <img
                    src={thumbnailImageUrl(reference.imageUrl)}
                    alt={`参考图 ${reference.order + 1}：${reference.sourceLabel}`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square h-full w-full object-cover"
                  />
                ) : (
                  <div
                    aria-label={`参考图 ${reference.order + 1}：${reference.sourceLabel} 不可用`}
                    className="flex aspect-square items-center justify-center text-[11px] text-amber-400"
                  >
                    不可用
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="min-w-0 truncate text-[var(--gc-text)]">
                    图 {reference.order + 1} · {reference.sourceLabel}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={cn(
                      reference.available ? "text-emerald-500" : "text-amber-500",
                    )}>
                      {status}
                    </span>
                    {(onMove || onRemove) && (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          aria-label={`上移参考图 ${reference.order + 1}`}
                          title="上移参考图"
                          disabled={disabled || !onMove || referenceIndex === 0}
                          onClick={() => onMove?.(reference, "up")}
                          className="rounded-sm p-0.5 text-[var(--gc-text-muted)] hover:text-[var(--gc-text)] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowUp aria-hidden="true" className="size-3" />
                        </button>
                        <button
                          type="button"
                          aria-label={`下移参考图 ${reference.order + 1}`}
                          title="下移参考图"
                          disabled={disabled || !onMove || referenceIndex === references.length - 1}
                          onClick={() => onMove?.(reference, "down")}
                          className="rounded-sm p-0.5 text-[var(--gc-text-muted)] hover:text-[var(--gc-text)] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowDown aria-hidden="true" className="size-3" />
                        </button>
                        <button
                          type="button"
                          aria-label={`移除参考图 ${reference.order + 1}`}
                          title="移除参考图"
                          disabled={disabled || !onRemove}
                          onClick={() => {
                            const focusTarget = references[referenceIndex + 1]
                              ?? references[referenceIndex - 1];
                            onRemove?.(reference);
                            restoreFocus(focusTarget?.order);
                          }}
                          className="rounded-sm p-0.5 text-amber-500/80 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 aria-hidden="true" className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] leading-relaxed text-[var(--gc-text-muted)]">
                  {!reference.available && <span className="text-amber-400">不可用</span>}
                </div>
                {!reference.available && reference.unavailableReason && (
                  <p id={reasonId} className="text-[11px] leading-relaxed text-amber-400">
                    {reference.unavailableReason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
