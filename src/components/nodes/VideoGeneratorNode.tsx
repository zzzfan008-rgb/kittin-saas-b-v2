import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import { isNodeRunActive, type VideoGeneratorNodeData } from "@/types/workflow";
import { Developing, NodeFrame, STATUS_TEXT } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { GeneratorParamsPanel } from "./GeneratorParamsPanel";
import { NodePort } from "./NodePort";
import { DUPLICATE_UNAVAILABLE_REASON } from "./nodeDuplicate";

/**
 * v9 生成层生视频节点（64 Phase 2 §6.2）：
 * 操作 + 模型/画幅/模型参数面板（时长与运动由契约给出，plan.md T2）+ 运行；
 * 不承载任何媒体展示（产物归 result-video）。
 * 工具条：[运行] [复制]。
 * 左侧端口：提示词 / 首帧图（带文字标签，常显）。
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
        toolbar={
          <NodeToolbar
            kind="video-generator"
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
        <div className="flex gap-3">
          <div className="flex shrink-0 flex-col justify-center gap-6 py-1">
            <NodePort type="target" id="prompt" label="提示词" />
            <NodePort type="target" id="first-frame" label="首帧图" />
          </div>
          <div className="min-w-0 flex-1">
            <GeneratorParamsPanel nodeId={id} data={data} />
          </div>
        </div>
        {running && <Developing />}
      </NodeFrame>
      <Handle type="source" position={Position.Right} title="输出视频" />
    </>
  );
}
