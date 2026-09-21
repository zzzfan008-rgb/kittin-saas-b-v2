import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * v8 色彩工具面板（plan.md §5）：text 节点工具条「色彩工具」的内联面板。
 *
 * 预设色板的数据源是设计 token（`docs/design/2026-09-17-ui-audit/tokens.json`），
 * 在本仓库由 `src/index.css` 的 `--gc-*` 变量接入（同一事实源）。组件不写死任何
 * 规范色值：色块在挂载时从 token 变量运行时解析，解析不到的 token 不渲染色块，
 * 而不是回落到硬编码颜色（fail-closed）。
 *
 * 确定后由调用方把 `#RRGGBB` 插入正文光标处（无光标记录时插入正文末尾）。
 */

interface PresetToken {
  variable: string;
  label: string;
}

const PRESET_TOKENS: readonly PresetToken[] = [
  { variable: "--gc-accent", label: "主色" },
  { variable: "--gc-accent-deep", label: "行动色" },
  { variable: "--gc-node-accent", label: "节点强调" },
  { variable: "--gc-status-success", label: "成功" },
  { variable: "--gc-status-error", label: "失败" },
  { variable: "--gc-warn-text", label: "提示" },
];

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function resolveTokenHex(variable: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return HEX_COLOR.test(raw) ? raw.toUpperCase() : undefined;
}

export interface ColorToolPanelProps {
  /** 用户点「确定」；色值形如 `#RRGGBB`。 */
  onConfirm: (hex: string) => void;
  onClose: () => void;
}

export function ColorToolPanel({ onConfirm, onClose }: ColorToolPanelProps) {
  const presets = useMemo(
    () =>
      PRESET_TOKENS.flatMap(({ variable, label }) => {
        const hex = resolveTokenHex(variable);
        return hex ? [{ variable, label, hex }] : [];
      }),
    [],
  );
  const [selected, setSelected] = useState<string | undefined>(() => presets[0]?.hex);

  return (
    <div
      role="group"
      aria-label="色彩工具"
      className="nodrag nopan space-y-2 rounded-md border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] p-2"
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[var(--gc-node-muted)]">插入色值</span>
        <span className="font-mono text-[var(--gc-node-text)]">{selected ?? "未选择"}</span>
      </div>
      {presets.length === 0 ? (
        <p className="text-[11px] leading-relaxed text-[var(--gc-node-muted)]">
          当前主题没有可用的预设色值，请用自定义取色器。
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => {
            const active = selected === preset.hex;
            return (
              <button
                key={preset.variable}
                type="button"
                aria-label={`预设色 ${preset.label} ${preset.hex}`}
                aria-pressed={active}
                title={`${preset.label} ${preset.hex}`}
                onClick={() => setSelected(preset.hex)}
                className={`size-6 rounded-md border transition-shadow focus-visible:ring-2 focus-visible:ring-(--gc-accent-deep) ${
                  active ? "border-[var(--gc-accent-deep)] ring-2 ring-(--gc-accent-deep)" : "border-[var(--gc-node-border)]"
                }`}
                style={{ backgroundColor: preset.hex }}
              />
            );
          })}
        </div>
      )}
      <label className="flex items-center gap-2 text-[11px] text-[var(--gc-node-muted)]">
        自定义
        <input
          type="color"
          aria-label="自定义颜色"
          value={selected ?? "#000000"}
          onChange={(event) => setSelected(event.target.value.toUpperCase())}
          className="nodrag h-6 w-10 cursor-pointer rounded border border-[var(--gc-node-border)] bg-transparent"
        />
      </label>
      <div className="flex gap-1.5">
        <Button type="button" variant="outline" size="xs" onClick={onClose} className="flex-1">
          取消
        </Button>
        <Button
          type="button"
          size="xs"
          disabled={!selected}
          onClick={() => {
            if (selected) onConfirm(selected);
          }}
          className="flex-1"
        >
          确定
        </Button>
      </div>
    </div>
  );
}
