/**
 * 卡 #61 色彩工具面板：chip 化改造。
 *
 * - 正文格式改为 {{color:#RRGGBB:名称}} 标记符。
 * - 预设色来自 token label，自定义色匹配内置中文颜色字典。
 * - onConfirm 改为插入 chip 字符串（由调用方写入正文）。
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  COLOR_TOKEN_RE,
  isValidHex,
  makeColorChipFromHex,
  validateColorChip,
} from "@/lib/color/colorToken";
import { nearestColorName } from "@/lib/color/chineseColorDictionary";

/**
 * v8 色彩工具面板（plan.md §5 / 卡 #61）。
 *
 * 预设色板的数据源是设计 token（`src/index.css` 的 `--gc-*` 变量）。
 * 组件不写死任何规范色值：色块在挂载时从 token 变量运行时解析，
 * 解析不到的 token 不渲染色块（fail-closed）。
 *
 * 确定后由调用方把 `{{color:#RRGGBB:名称}}` chip 字符串插入正文。
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
  /**
   * 用户点「确定」；返回 `{{color:#RRGGBB:名称}}` chip 字符串。
   * 调用方负责将此字符串插入正文。
   */
  onConfirm: (chip: string) => void;
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
  const [customHex, setCustomHex] = useState<string>("#000000");

  /** 当前选中的 hex（优先自定义输入，其次预设选中） */
  const currentHex = selected ?? customHex;

  const handleConfirm = () => {
    if (!currentHex) return;
    // 自定义色：验证 hex，匹配中文名
    if (!selected) {
      if (!isValidHex(customHex)) return;
      const chip = makeColorChipFromHex(customHex.toUpperCase());
      onConfirm(chip);
      return;
    }
    // 预设色：从 token label 取名
    const preset = presets.find((p) => p.hex === selected);
    const name = preset?.label ?? nearestColorName(selected);
    const validated = validateColorChip(selected, name);
    if (!validated) return;
    onConfirm(`{{color:${validated.hex}:${validated.name}}}`);
  };

  return (
    <div
      role="group"
      aria-label="色彩工具"
      className="nodrag nopan space-y-2 rounded-md border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] p-2"
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[var(--gc-node-muted)]">插入色值</span>
        <span className="font-mono text-[var(--gc-node-text)]">{currentHex ?? "未选择"}</span>
      </div>

      {/* 预设色板 */}
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

      {/* 自定义取色 */}
      <label className="flex items-center gap-2 text-[11px] text-[var(--gc-node-muted)]">
        <span>自定义</span>
        <input
          type="color"
          aria-label="自定义颜色"
          value={customHex}
          onChange={(event) => {
            setCustomHex(event.target.value.toUpperCase());
            setSelected(undefined); // 清预设选中
          }}
          className="nodrag h-6 w-10 cursor-pointer rounded border border-[var(--gc-node-border)] bg-transparent"
        />
        {/* 手动 hex 输入 */}
        <input
          type="text"
          aria-label="手动输入 hex"
          value={customHex}
          maxLength={7}
          onChange={(event) => {
            const v = event.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setCustomHex(v);
          }}
          className="nodrag w-[72px] rounded border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--gc-node-text)] focus:border-[var(--gc-accent-deep)] focus:outline-hidden"
          placeholder="#000000"
        />
        {/* 字典匹配预览名 */}
        {isValidHex(customHex) && (
          <span className="shrink-0 truncate text-[10px] text-[var(--gc-text-muted)]">
            {nearestColorName(customHex)}
          </span>
        )}
      </label>

      {/* 操作按钮 */}
      <div className="flex gap-1.5">
        <Button type="button" variant="outline" size="xs" onClick={onClose} className="flex-1">
          取消
        </Button>
        <Button
          type="button"
          size="xs"
          disabled={!currentHex || !isValidHex(currentHex)}
          onClick={handleConfirm}
          className="flex-1"
        >
          确定
        </Button>
      </div>
    </div>
  );
}
