import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import { isNodeRunActive, type VideoGeneratorNodeData } from "@/types/workflow";
import { Developing, NodeFrame, STATUS_TEXT } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { GeneratorParamsPanel, focusGeneratorFunctionControl } from "./GeneratorParamsPanel";
import { DUPLICATE_UNAVAILABLE_REASON } from "./nodeDuplicate";

/**
 * v8 生成层生视频节点（plan.md §1、data-model.md §4）：
 * 功能选项 + 模型/画幅/模型参数面板（时长与运动由契约给出，plan.md T2）+ 运行；
 * 不承载任何媒体展示（产物归 result-video）。
 * 工具条（plan.md §3.2）：[功能选项] [运行] [复制]。
 *
 * 入边：prompt（文本节点）与 first-frame（图片 / 图片结果节点，0–1 条）。
 * T4 裁定：本版禁止 video / result-video → video-generator 的 reference 边（schema 层拒绝）。
 */
export function VideoGeneratorNode({ id, data, selected }: NodeProps<Node<VideoGeneratorNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const runNode = useFlowStore((s) => s.runNode);
  const running = isNodeRunActive(data.status);
  const disabled = readOnly || running;

  return (
    <>
      <Handle type="target" position={Position.Left} id="prompt" style={{ top: "20%" }} title="提示词（文本节点）" />
      <Handle type="target" position={Position.Left} id="first-frame" style={{ top: "60%" }} title="首帧图片（0–1 条）" />
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
              "function-picker": {
                onSelect: () => focusGeneratorFunctionControl(id),
                disabled,
                disabledReason: readOnly ? "只读项目不能修改功能" : "运行中不能修改功能",
              },
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
        {running && <Developing />}
      </NodeFrame>
      <Handle type="source" position={Position.Right} title="输出视频" />
    </>
  );
}
