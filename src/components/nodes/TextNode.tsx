/**
 * 卡 #61 TextNode chip 化。
 *
 * - 正文格式改为 {{color:#RRGGBB:名称}} 标记符。
 * - 节点内渲染 ColorChip：色块 + 中文名 + 删除 ×。
 * - 删除 chip 同步移除正文中的对应标记符。
 * - ColorToolPanel onConfirm 改为插入 chip 字符串。
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import type { TextNodeData } from "@/types/workflow";
import { NodeFrame, promptChipClass } from "./NodeFrame";
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

/**
 * v8 输入层文本节点（plan.md §1 / 卡 #61）：
 * 只承载提示词正文，不含任何生成语义字段与运行按钮；提示词由 text 边流向生成节点。
 * 工具条（plan.md §3.2）：[色彩工具] [复制]。
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

  /** 从正文解析所有颜色 chip。 */
  const chips = useMemo(() => parseColorChips(data.text ?? ""), [data.text]);

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

  /** 将正文文本与 chips 分离渲染：
   *
   * 策略：text 区域只渲染纯文本（隐藏 chip 标记），chips 以 overlay 形式渲染在
   * textarea 上方。方案 B（inline overlay）保证文本编辑和 chip 展示共存。
   *
   * 实现：chips 在 textarea 下方渲染，由 ColorChipList 组件承接删除回调。
   * textarea 的行高/字体与 chip 对齐。
   */
  return (
    <>
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
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
              copy: {
                onSelect: () => void duplicateNode(id),
                disabled: readOnly,
                disabledReason: "只读项目不能新增节点",
              },
            }}
          />
        }
      >
        <label className="block space-y-1">
          <span className="text-[11px] text-[var(--gc-node-muted)]">提示词正文</span>

          {/* 颜色 chips 展示区（在 textarea 上方） */}
          {chips.length > 0 && (
            <ColorChipList chips={chips} onDelete={handleDeleteChip} />
          )}

          {/* textarea：正文内容（chips 标记符在渲染时被 ColorChipList 提取显示） */}
          <textarea
            ref={textareaRef}
            value={data.text}
            {...textEdit.bind}
            rows={7}
            readOnly={readOnly}
            placeholder="写这段正文要表达什么：款式、场景、材质、要求…"
            className={`${promptChipClass} resize-none`}
          />
        </label>
        <p className="text-[11px] leading-relaxed text-[var(--gc-node-muted)]">
          连到生成节点的 prompt 输入决定生成内容
        </p>
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
