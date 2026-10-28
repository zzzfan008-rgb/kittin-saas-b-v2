import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import { EDGE_HANDLE_RESULT, isNodeRunActive, type ImageGeneratorNodeData } from "@/types/workflow";
import { NodeFrame, STATUS_TEXT } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { GeneratorParamsPanel } from "./GeneratorParamsPanel";
import { DUPLICATE_UNAVAILABLE_REASON } from "./nodeDuplicate";

/**
 * v9 生成层生图节点（64 Phase 2 §6.2）：
 * 操作 + 模型/画幅/尺寸/批次/模型参数面板 + 运行；不承载任何媒体展示（产物归 result-image）。
 * 工具条：[运行] [复制]。
 * 输入端口（提示词 / 参考图）融合在参数面板前两行，见 GeneratorParamsPanel。
 */
export function ImageGeneratorNode({ id, data, selected }: NodeProps<Node<ImageGeneratorNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const runNode = useFlowStore((s) => s.runNode);
  const running = isNodeRunActive(data.status);
  const disabled = readOnly || running;

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
            kind="image-generator"
            selected={selected}
            actions={{
              run: {
                onSelect: () => void runNode(id),
                disabled,
                disabledReason: readOnly ? "只读项目不能运行" : undefined,
                label: running ? STATUS_TEXT[data.status] : data.status === "success" ? "重新运行" : "运行",
              },
              copy: {
                disabled: true,
                disabledReason: DUPLICATE_UNAVAILABLE_REASON,
              },
            }}
          />
        }
      >
        <GeneratorParamsPanel nodeId={id} data={data} />
      </NodeFrame>
      {/* 输出柄：只承载「生成节点 → 结果节点」的溯源边，故不可手动拖拽（isConnectable=false），
        避免用户误连出数据流边。溯源边由 result-node-created 事件自动创建。 */}
      <Handle id={EDGE_HANDLE_RESULT} type="source" position={Position.Right} title="输出图片（连到结果节点）" isConnectable={false} />
    </>
  );
}
