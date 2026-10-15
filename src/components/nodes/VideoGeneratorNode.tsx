import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import { isNodeRunActive, type VideoGeneratorNodeData } from "@/types/workflow";
import { Developing, NodeFrame, STATUS_TEXT } from "./NodeFrame";
import { GeneratorParamsPanel } from "./GeneratorParamsPanel";
import { DUPLICATE_UNAVAILABLE_REASON } from "./nodeDuplicate";

/**
 * v9 生成层生视频节点（64 Phase 2 §6.2）：
 * 操作 + 模型/画幅/模型参数面板（时长与运动由契约给出，plan.md T2）+ 运行；
 * 不承载任何媒体展示（产物归 result-video）。
 * 工具条：[运行] [复制]。
 * 输入端口（提示词 / 首帧图）融合在参数面板前两行，见 GeneratorParamsPanel。
 *
 * T4 裁定：本版禁止 video / result-video → video-generator 的 reference 边（schema 层拒绝）。
 */
export function VideoGeneratorNode({ id, data, selected }: NodeProps<Node<VideoGeneratorNodeData>>) {
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
      >
        <GeneratorParamsPanel nodeId={id} data={data} />
        {running && <Developing />}
      </NodeFrame>
      <Handle type="source" position={Position.Right} title="输出视频" />
    </>
  );
}
