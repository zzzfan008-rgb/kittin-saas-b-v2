/**
 * 卡 #61 TextNode chip 化。
 *
 * - 正文格式改为 {{color:#RRGGBB:名称}} 标记符。
 * - 节点内渲染 ColorChip：色块 + 中文名 + 删除 ×。
 * - 删除 chip 同步移除正文中的对应标记符。
 * - ColorToolPanel onConfirm 改为插入 chip 字符串。
 *
 * UI 两态（与图片节点同构）：
 * - 空态：白卡（NodeFrame frameless=false）+ 卡内虚线 accent 槽位（同图片空槽位）；
 * - 有内容态：frameless，实线 accent 框包裹正文（同图片有图态）。
 * 槽位框始终存在于同一 DOM 位置（空态虚线/有内容态实线），首字输入触发两态切换时
 * textarea 不重挂载，编辑焦点不丢。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import type { TextNodeData } from "@/types/workflow";
import { NodeFrame } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { ColorToolPanel } from "./ColorToolPanel";
import { ColorChipList } from "./ColorChip";
import { duplicateNode } from "./nodeDuplicate";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import {
  parseColorChips,
  removeColorChip,
  COLOR_TOKEN_RE,
} from "@/lib/color/colorToken";
import { getTextPresetTemplate, listTextPresetTemplates } from "@/lib/promptPresets";

/** 正文高度上限：超过后 textarea 内部滚动（文本随内容自然变高，与图片固定比例不同）。 */
const TEXTAREA_MAX_HEIGHT = 320;

/**
 * v9 输入层文本节点（64 Phase 2 §6.1）：
 * 只承载提示词正文，不含任何生成语义字段与运行按钮；提示词由 text 边流向生成节点。
 * 工具条：[色彩工具] [预设下拉] [复制]。预设选中即替换写入 data.text（useCoalescedTextEdit+flush，可 undo）。
 *
 * 正文中的 {{color:#RRGGBB:名称}} 标记在渲染时展开为 ColorChip，
 * 删除时同步从原文中移除对应标记符。
 */
export function TextNode({ id, data, selected }: NodeProps<Node<TextNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const textEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId: id, field: "text" },
    { multiline: true },
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [colorToolOpen, setColorToolOpen] = useState(false);
  const [inputActive, setInputActive] = useState(false);
  const presetOptions = useMemo(() =>
    listTextPresetTemplates().map((p) => ({ value: p.id, label: p.name })),
  []);

  /** 从正文解析所有颜色 chip。 */
  const chips = useMemo(() => parseColorChips(data.text ?? ""), [data.text]);

  /** 是否已有正文（决定白卡空态 / frameless 有内容态）。 */
  const hasText = (data.text ?? "").trim().length > 0;

  /** 高度自适应：内容撑开（上限 TEXTAREA_MAX_HEIGHT 后内部滚动）；空态由 min-height 兜底。 */
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [data.text]);

  /** 删除一个 chip：移除原文中的标记符，同步 flush。 */
  const handleDeleteChip = useCallback(
    (index: number, length: number) => {
      if (readOnly) return;
      const current = data.text ?? "";
      const next = removeColorChip(current, index, length);
      textEdit.updateValue(next);
      textEdit.flush();
    },
    [data.text, textEdit, readOnly],
  );

  /** 插入颜色 chip：在光标处插入 chip 标记符。 */
  const insertColor = useCallback(
    (chip: string) => {
      if (readOnly) return;
      const textarea = textareaRef.current;
      const current = data.text ?? "";
      const start = textarea?.selectionStart ?? current.length;
      const end = textarea?.selectionEnd ?? current.length;
      const next = `${current.slice(0, start)}${chip}${current.slice(end)}`;
      textEdit.updateValue(next);
      textEdit.flush();
      setColorToolOpen(false);
      window.setTimeout(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.focus();
        const caret = start + chip.length;
        element.setSelectionRange(caret, caret);
      }, 0);
    },
    [data.text, textEdit, readOnly],
  );

  return (
    <>
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
        frameless={hasText}
        nodeKind="text"
        toolbar={
          <NodeToolbar
            kind="text"
            selected={selected}
            actions={{
              "color-tool": {
                onSelect: () => setColorToolOpen((open) => !open),
                disabled: readOnly,
                disabledReason: "只读项目不能修改正文",
                label: colorToolOpen ? "收起色彩工具" : "色彩工具",
              },
              "preset-picker": {
                presetOptions,
                onPresetSelect: (value) => {
                  if (readOnly) return;
                  const preset = getTextPresetTemplate(value);
                  if (!preset) return;
                  textEdit.updateValue(preset.text);
                  textEdit.flush();
                },
                disabled: readOnly,
                disabledReason: "只读项目不能修改正文",
              },
              copy: {
                onSelect: () => void duplicateNode(id),
                disabled: readOnly,
                disabledReason: "只读项目不能新增节点",
              },
            }}
          />
        }
      >
        {/* 槽位框（两态同一元素）：空态虚线 / 有内容态实线，均 2px accent、圆角 4px（同图片节点）。
            输入激活时加焦点光环（不改动框体本身）。 */}
        <div
          className={`nopan relative rounded-[4px] border-2 bg-[var(--gc-node-inner)] transition-shadow ${
            hasText ? "border-solid" : "border-dashed"
          } border-[var(--gc-accent)] ${
            inputActive ? "shadow-[0_0_0_2px_color-mix(in_srgb,var(--gc-accent)_45%,transparent)]" : ""
          }`}
        >
          {/* 颜色 chips 展示区（有 chip 时置于正文上方） */}
          {chips.length > 0 && (
            <div className="px-3 pt-2">
              <ColorChipList chips={chips} onDelete={handleDeleteChip} />
            </div>
          )}

          {/* textarea：正文内容（chips 标记符在渲染时被 ColorChipList 提取显示）
              - 未聚焦：无 nodrag（单击=选中节点，按住=拖动节点）；
              - 双击：聚焦进入编辑（加 nodrag 防止输入时误拖动）；
              - 失焦：退出编辑态，恢复可拖动。 */}
          <textarea
            ref={textareaRef}
            value={data.text}
            {...textEdit.bind}
            rows={3}
            readOnly={readOnly}
            placeholder={"TEXT · 槽位\n双击输入正文"}
            onMouseDown={(event) => {
              // 未进入编辑态时拦截默认聚焦：单击=选中/拖动节点，双击才聚焦编辑
              if (!inputActive) event.preventDefault();
            }}
            onDoubleClick={() => {
              if (readOnly) return;
              setInputActive(true);
              textareaRef.current?.focus();
            }}
            onFocus={() => setInputActive(true)}
            onBlur={() => setInputActive(false)}
            className={`w-full resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-xs leading-relaxed text-[var(--gc-node-text)] placeholder:text-[var(--gc-node-muted)] focus:outline-hidden ${
              hasText ? "min-h-[44px]" : "min-h-[88px]"
            } ${inputActive ? "nodrag cursor-text" : "cursor-grab active:cursor-grabbing"}`}
          />
        </div>
        {colorToolOpen && (
          <ColorToolPanel
            onConfirm={insertColor}
            onClose={() => setColorToolOpen(false)}
          />
        )}
      </NodeFrame>
      <Handle type="source" position={Position.Right} id="prompt" title="提示词" />
    </>
  );
}
