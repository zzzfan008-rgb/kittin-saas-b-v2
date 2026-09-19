import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useFlowStore } from "@/store/flowStore";
import { isNodeRunActive, type TextNodeData } from "@/types/workflow";
import { NodeFrame, RunButton, promptChipClass } from "./NodeFrame";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { useNodeInspector } from "./NodeInspectorWindow";
import { usePromptRunAdmission } from "@/hooks/usePromptRunAdmission";
import { getGarmentPromptVariantById } from "@/lib/garmentPromptPresets";

/**
 * v7 文本节点（R2）：提示词正文由文本节点承载，画布可见、可连线。
 * 正文是用户所有权字段——文本运行的 outputText 是「建议」，采纳前永不覆盖正文。
 */
export function TextNode({ id, data, selected }: NodeProps<Node<TextNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const runNode = useFlowStore((s) => s.runNode);
  const textEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId: id, field: "text" },
    { multiline: true },
  );
  const running = isNodeRunActive(data.status);
  const admission = usePromptRunAdmission(id, data);
  const openInspector = useNodeInspector((s) => s.open);
  const variant = data.promptVariantId ? getGarmentPromptVariantById(data.promptVariantId) : undefined;
  const hasUnadoptedProposal = Boolean(data.outputText && data.outputText !== data.text);

  return (
    <>
      <Handle type="target" position={Position.Left} id="prompt" />
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
        onBodyDoubleClick={() => openInspector(id)}
      >
        <label className="block space-y-1">
          <span className="text-[11px] text-neutral-500">提示词正文</span>
          <textarea
            value={data.text}
            {...textEdit.bind}
            rows={7}
            placeholder="写这段正文要表达什么：款式、场景、材质、要求…"
            className={`${promptChipClass} resize-none`}
          />
          <span className="text-[11px] text-neutral-600">
            可串联多个文本节点，运行时按连线顺序拼接
          </span>
        </label>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-500">功能</span>
          <span className={variant ? "text-[var(--gc-node-text)]" : "text-[var(--gc-node-muted)]"}>
            {variant ? variant.variantId.split(".")[0] : "未选择（双击节点配置）"}
          </span>
        </div>
        {hasUnadoptedProposal && (
          <p role="status" className="rounded-md border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] px-2 py-1.5 text-[11px] leading-relaxed text-[var(--gc-node-muted)]">
            有未采纳的提案：下游仍读取当前正文。双击节点打开功能设置查看并采纳。
          </p>
        )}
        <RunButton
          status={data.status}
          onClick={() => void runNode(id)}
          label={data.status === "success" ? "重新运行" : "运行文本功能"}
          disabledReason={admission.allowed ? undefined : admission.reason}
          disabledLabel="先在功能设置中选择功能"
        />
      </NodeFrame>
      <Handle type="source" position={Position.Right} id="prompt" />
    </>
  );
}
