/**
 * 卡 #61：颜色 chip 渲染组件。
 *
 * 节点内渲染：{{color:#RRGGBB:名称}} → 小色块 + 中文名 + 删除 ×
 * 删除 chip 同步移除正文中的对应标记符。
 */
import { useCallback } from "react";
import { isValidHex } from "@/lib/color/colorToken";
import { nearestColorName } from "@/lib/color/chineseColorDictionary";

interface ColorChipProps {
  /** #RRGGBB（大写或小写） */
  hex: string;
  /** 显示名称；若省略则从字典就近匹配 */
  name?: string;
  /** 删除回调（传入 chip 在原文中的起始位置和长度） */
  onDelete: (index: number, length: number) => void;
  /** chip 在原文中的起始位置 */
  index: number;
  /** chip 完整匹配长度 */
  length: number;
}

/** 单个颜色 chip：色块 + 中文名 + 删除按钮。 */
export function ColorChip({ hex, name, onDelete, index, length }: ColorChipProps) {
  // fail-closed：非法 hex 不渲染 chip
  if (!isValidHex(hex)) return null;

  const upperHex = hex.toUpperCase();
  const chipName = name ?? nearestColorName(upperHex);
  const canDelete = onDelete != null;

  const handleDelete = useCallback(() => {
    if (canDelete) onDelete(index, length);
  }, [canDelete, onDelete, index, length]);

  return (
    <span
      data-color-chip={upperHex}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] px-1.5 py-0.5 align-middle font-mono text-[11px] text-[var(--gc-node-text)]"
    >
      {/* 色块 */}
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-sm border border-black/20"
        style={{ backgroundColor: upperHex }}
        aria-hidden="true"
      />
      {/* 名称 */}
      <span className="shrink-0 leading-none">{chipName}</span>
      {/* 删除 */}
      {canDelete && (
        <button
          type="button"
          aria-label={`移除颜色 chip ${chipName} ${upperHex}`}
          onClick={handleDelete}
          className="ml-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-[var(--gc-text-muted)] hover:bg-red-500/30 hover:text-red-400 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-[var(--gc-accent)]"
        >
          ×
        </button>
      )}
    </span>
  );
}

/** ColorChip 列表（供 TextNode 渲染多个 chips） */
export interface ColorChipEntry {
  full: string;
  hex: string;
  name: string;
  index: number;
  length: number;
}

interface ColorChipListProps {
  chips: ColorChipEntry[];
  onDelete: (index: number, length: number) => void;
}

export function ColorChipList({ chips, onDelete }: ColorChipListProps) {
  if (chips.length === 0) return null;
  return (
    <span className="flex flex-wrap items-center gap-1" aria-label="颜色 chips">
      {chips.map((chip, i) => (
        <ColorChip
          key={`${chip.hex}-${chip.index}-${i}`}
          hex={chip.hex}
          name={chip.name}
          index={chip.index}
          length={chip.length}
          onDelete={onDelete}
        />
      ))}
    </span>
  );
}
