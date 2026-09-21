import { useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import type { TextNodeData } from "@/types/workflow";
import { NodeFrame, promptChipClass } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { ColorToolPanel } from "./ColorToolPanel";
import { duplicateNode } from "./nodeDuplicate";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";

/**
 * v8 输入层文本节点（plan.md §1、data-model.md §3）：
 * 只承载提示词正文，不含任何生成语义字段与运行按钮；提示词由 text 边流向生成节点。
 * 工具条（plan.md §3.2）：[色彩工具] [复制]。
 */
export function TextNode({ id, data, selected }: NodeProps<Node<TextNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const textEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId: id, field: "text" },
    { multiline: true },
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [colorToolOpen, setColorToolOpen] = useState(false);

  /** plan.md §5：确定后在正文光标处插入 #RRGGBB；无光标记录时插入末尾。 */
  const insertColor = (hex: string) => {
    const textarea = textareaRef.current;
    const current = data.text ?? "";
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${hex}${current.slice(end)}`;
    textEdit.updateValue(next);
    textEdit.flush();
    setColorToolOpen(false);
    window.setTimeout(() => {
      const element = textareaRef.current;
      if (!element) return;
      element.focus();
      const caret = start + hex.length;
      element.setSelectionRange(caret, caret);
    }, 0);
  };

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
        {colorToolOpen && <ColorToolPanel onConfirm={insertColor} onClose={() => setColorToolOpen(false)} />}
      </NodeFrame>
      <Handle type="source" position={Position.Right} id="prompt" title="提示词" />
    </>
  );
}
