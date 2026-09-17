import { useRef } from "react";
import {
  Select,
  SelectItem,
  SelectList,
  SelectPopup,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { thumbnailImageUrl } from "@/lib/images";
import {
  getReferenceRoleDefinition,
  REFERENCE_ROLE_CATALOG,
} from "@/lib/referenceRoles";
import { cn } from "@/lib/utils";
import type { ReferenceRole } from "@/types/workflow";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

export interface ReferenceRoleSummaryReference {
  order: number;
  edgeId?: string;
  sourceNodeId: string;
  sourceLabel: string;
  role: ReferenceRole;
  roleNeedsConfirmation: boolean;
  imageUrl?: string;
  available: boolean;
  unavailableReason?: string;
}

export type ReferenceRoleSummaryMoveDirection = "up" | "down";

export interface ReferenceRoleSummaryProps {
  references: readonly ReferenceRoleSummaryReference[];
  disabled?: boolean;
  onRoleChange: (reference: ReferenceRoleSummaryReference, role: ReferenceRole) => void;
  onMove?: (
    reference: ReferenceRoleSummaryReference,
    direction: ReferenceRoleSummaryMoveDirection,
  ) => void;
  onRemove?: (reference: ReferenceRoleSummaryReference) => void;
}

function duplicateRoleCounts(
  references: readonly ReferenceRoleSummaryReference[],
): Map<ReferenceRole, number> {
  const counts = new Map<ReferenceRole, number>();
  for (const reference of references) {
    counts.set(reference.role, (counts.get(reference.role) ?? 0) + 1);
  }
  return counts;
}

export function ReferenceRoleSummary({
  references,
  disabled = false,
  onRoleChange,
  onMove,
  onRemove,
}: ReferenceRoleSummaryProps) {
  const summaryRef = useRef<HTMLElement>(null);
  if (references.length === 0) return null;
  const duplicateCounts = duplicateRoleCounts(references);

  const restoreFocus = (order: number | undefined) => {
    if (order === undefined || typeof window === "undefined") return;
    window.setTimeout(() => {
      summaryRef.current
        ?.querySelector<HTMLElement>(`[data-reference-order="${order}"] [role="combobox"]`)
        ?.focus();
    }, 0);
  };

  return (
    <section
      ref={summaryRef}
      aria-label="参考图角色摘要"
      className="space-y-2 rounded-md border border-[var(--gc-border)] bg-[var(--gc-panel-soft)] p-2"
    >
      <div className="space-y-0.5">
        <p className="text-[10px] font-medium text-[var(--gc-text)]">本次参考图</p>
        <p className="text-[10px] leading-relaxed text-[var(--gc-text-muted)]">
          按实际输入顺序确认每张图的唯一职责；待确认或不可用时不能运行。
        </p>
      </div>

      <div className="space-y-1.5">
        {references.map((reference, referenceIndex) => {
          const roleDefinition = getReferenceRoleDefinition(reference.role);
          const duplicate = (duplicateCounts.get(reference.role) ?? 0) > 1;
          const selectorLabel = `参考图 ${reference.order + 1}：${reference.sourceLabel} 的角色`;
          const selectorDisabled = disabled || !reference.available;
          const status = !reference.available
            ? "不可用"
            : reference.roleNeedsConfirmation
              ? "待确认"
              : "已确认";
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
                    className="flex aspect-square items-center justify-center text-[10px] text-amber-400"
                  >
                    不可用
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="min-w-0 truncate text-[var(--gc-text)]">
                    图 {reference.order + 1} · {reference.sourceLabel}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={cn(
                      status === "已确认" ? "text-emerald-500" : "text-amber-500",
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

                <Select
                  value={reference.role}
                  onValueChange={(value) => onRoleChange(reference, value as ReferenceRole)}
                >
                  <SelectTrigger
                    aria-label={selectorLabel}
                    aria-describedby={!reference.available && reference.unavailableReason ? reasonId : undefined}
                    disabled={selectorDisabled}
                    className="h-7 rounded-sm border-[var(--gc-border)] bg-[var(--gc-panel)] px-2 text-[10px]"
                  >
                    <SelectValue>{roleDefinition.label}</SelectValue>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectPositioner>
                      <SelectPopup>
                        <SelectList>
                          {REFERENCE_ROLE_CATALOG.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectList>
                      </SelectPopup>
                    </SelectPositioner>
                  </SelectPortal>
                </Select>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] leading-relaxed text-[var(--gc-text-muted)]">
                  <span>{roleDefinition.label}</span>
                  {duplicate && <span className="text-amber-400">重复角色</span>}
                  {!reference.available && <span className="text-amber-400">不可用</span>}
                </div>
                {!reference.available && reference.unavailableReason && (
                  <p id={reasonId} className="text-[10px] leading-relaxed text-amber-400">
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
