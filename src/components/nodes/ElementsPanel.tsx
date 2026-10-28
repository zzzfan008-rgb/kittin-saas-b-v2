/**
 * 六要素面板（文本节点内）：协议模板的补充位结构化输入。
 *
 * - 只写 data.promptElements（结构化）+ 拼装后写补充位文本；
 *   下游 dag/改写/快照只读 text，本面板不碰任何运行路径。
 * - 视觉沿用 ParamRow 同款 pill（rounded-md/text-[11px]/gc-accent 选中态），
 *   状态点用 8 槽位状态色，风险黄字用 gc-warn-text。
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ELEMENT_DEFS,
  ELEMENT_LABELS,
  assembleElements,
  elementText,
  filledElementCount,
  missingElementLabels,
  rateElement,
  removeEmptyQualityWords,
  scanPromptRisks,
  type ElementKey,
  type ElementValue,
  type PromptElements,
} from "@/lib/promptElements";

const STATUS_DOT: Record<string, string> = {
  ok: "var(--gc-status-success)",
  vague: "var(--gc-status-retry)",
  empty: "var(--gc-status-idle)",
};

export interface ElementsPanelProps {
  elements: PromptElements;
  readOnly: boolean;
  /** 补充位当前文本（风险扫描 + 偏离提示用）。 */
  supplementText: string;
  onChange: (next: PromptElements) => void;
  /** "填入补充"：拼装结果写入补充位。 */
  onFill: (assembled: string) => void;
  /** 一键删除空泛词后写回补充位。 */
  onCleanRisks: (cleaned: string) => void;
}

export function ElementsPanel({ elements, readOnly, supplementText, onChange, onFill, onCleanRisks }: ElementsPanelProps) {
  const [customOpen, setCustomOpen] = useState<Partial<Record<ElementKey, boolean>>>({});
  const filled = filledElementCount(elements);
  const missing = missingElementLabels(elements);
  const risks = useMemo(() => scanPromptRisks(supplementText), [supplementText]);
  const assembled = useMemo(() => assembleElements(elements), [elements]);
  const canFill = (elements.subject ?? "").trim().length > 0 && !readOnly;

  const setValue = (key: ElementKey, value: ElementValue) => {
    if (readOnly) return;
    onChange({ ...elements, [key]: value });
  };

  return (
    // 2026-10-28：加 overflow-hidden + max-w-full —— 面板内容（预设 pill 行）曾横向溢出
    // 节点盒子，既视觉溢出，又会在画布上拦截相邻节点标题栏的点击（e2e 实测）。
    <div className="nodrag max-w-full overflow-hidden rounded-xl border-2 border-[var(--gc-accent)] bg-[var(--gc-node-inner)] px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-label text-[var(--gc-node-muted)]">六要素</span>
        <span className="text-label font-semibold text-[var(--gc-node-text)]">{filled}/6</span>
      </div>
      <div className="mt-1.5 space-y-2.5">
        {/* 主体：纯文本输入，无预设 */}
        <div>
          <span className="text-label flex items-center gap-1.5 text-[var(--gc-node-muted)]">
            <span
              className="inline-block size-[7px] shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_DOT[rateElement("subject", elements)] }}
            />
            主体（必填）
          </span>
          <textarea
            value={elements.subject ?? ""}
            readOnly={readOnly}
            rows={2}
            placeholder="例：一只哑光黑色陶瓷手冲杯，盛八分满黑咖啡"
            onChange={(event) => {
              if (readOnly) return;
              onChange({ ...elements, subject: event.target.value });
            }}
            className="nodrag mt-1 w-full resize-none rounded-md border border-[var(--gc-node-border)] bg-white px-2 py-1.5 text-[11px] leading-relaxed text-[var(--gc-node-text)] placeholder:text-[var(--gc-node-muted)] focus:outline-hidden"
          />
        </div>
        {ELEMENT_DEFS.filter((def) => def.key !== "subject").map((def) => {
          const current = elements[def.key] as ElementValue;
          const activePreset = current !== undefined && "presetId" in current ? current.presetId : undefined;
          const customText = current !== undefined && "custom" in current ? current.custom : "";
          return (
            <div key={def.key}>
              <span className="text-label flex items-center gap-1.5 text-[var(--gc-node-muted)]" title={def.missingHint}>
                <span
                  className="inline-block size-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_DOT[rateElement(def.key, elements)] }}
                />
                {ELEMENT_LABELS[def.key]}
              </span>
              <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label={ELEMENT_LABELS[def.key]}>
                {def.presets.map((preset) => {
                  const active = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={readOnly}
                      aria-pressed={active}
                      title={preset.text}
                      onClick={() => setValue(def.key, active ? undefined : { presetId: preset.id })}
                      className={`nodrag rounded-md border px-1.5 py-1 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        active
                          ? "border-[var(--gc-accent)] bg-[var(--gc-accent)]/15 font-semibold text-[var(--gc-node-text)]"
                          : "border-[var(--gc-node-border)] text-[var(--gc-node-muted)] hover:border-[var(--gc-accent)]/50 hover:text-[var(--gc-node-text)]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={readOnly}
                  aria-pressed={customText.trim() !== ""}
                  title="自写文案（覆盖预设）"
                  onClick={() => setCustomOpen((prev) => ({ ...prev, [def.key]: !prev[def.key] }))}
                  className={`nodrag rounded-md border border-dashed px-1.5 py-1 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    customText.trim() !== ""
                      ? "border-[var(--gc-accent)] bg-[var(--gc-accent)]/15 font-semibold text-[var(--gc-node-text)]"
                      : "border-[var(--gc-node-border)] text-[var(--gc-node-muted)] hover:border-[var(--gc-accent)]/50 hover:text-[var(--gc-node-text)]"
                  }`}
                >
                  +自写
                </button>
              </div>
              {(customOpen[def.key] || customText.trim() !== "") && (
                <textarea
                  value={customText}
                  readOnly={readOnly}
                  rows={1}
                  placeholder={def.placeholder}
                  onChange={(event) => {
                    if (readOnly) return;
                    const next = event.target.value;
                    setValue(def.key, next.trim() === "" ? undefined : { custom: next });
                  }}
                  className="nodrag mt-1 w-full resize-none rounded-md border border-[var(--gc-node-border)] bg-white px-2 py-1.5 text-[11px] leading-relaxed text-[var(--gc-node-text)] placeholder:text-[var(--gc-node-muted)] focus:outline-hidden"
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-label border-t border-[var(--gc-node-border)] pt-1.5 text-[var(--gc-node-muted)]">
        已选 <b className="text-[var(--gc-node-text)]">{filled}/6</b>
        {missing.length > 0 ? ` · 缺：${missing.join("、")}` : " · 齐了"}
      </p>
      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="xs"
          disabled={!canFill}
          title={!canFill ? "先描述主体" : "把拼装结果写入补充框"}
          onClick={() => onFill(assembled)}
          className="h-6 border-[var(--gc-accent)] bg-[var(--gc-accent)] px-2 text-[11px] font-semibold text-black hover:opacity-90"
        >
          填入补充
        </Button>
      </div>
      {risks.length > 0 && (
        <p className="text-label leading-relaxed text-[var(--gc-warn-text)]">
          ⚠️ {risks[0].message}
          {risks[0].id === "empty-quality-words" && (
            <button
              type="button"
              className="nodrag ml-1 underline"
              onClick={() => onCleanRisks(removeEmptyQualityWords(supplementText))}
            >
              一键删除
            </button>
          )}
        </p>
      )}
      {elementText("subject", elements) === "" && (
        <p className="text-label text-[var(--gc-node-muted)]">先描述主体，其余要素可点选</p>
      )}
    </div>
  );
}
