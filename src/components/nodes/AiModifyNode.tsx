import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useFlowStore } from "@/store/flowStore";
import { BATCH_SIZES, isNodeRunActive, type AiModifyNodeData } from "@/types/workflow";
import { imageModelAspectRatioPatch } from "@/types/imageModels";
import { NodeFrame, RunButton, Developing, inputClass, promptChipClass } from "./NodeFrame";
import { ImageGrid } from "./ImageGrid";
import { ModelControls } from "./ModelControls";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { usePromptRunAdmission } from "@/hooks/usePromptRunAdmission";

const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];
export function AiModifyNode({ id, data, selected }: NodeProps<Node<AiModifyNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const runNode = useFlowStore((s) => s.runNode);
  const promptEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId: id, field: "prompt" },
    { multiline: true },
  );
  const running = isNodeRunActive(data.status);
  const admission = usePromptRunAdmission(id, data);

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <NodeFrame nodeId={id} title={data.label} status={data.status} error={data.error} selected={selected}>
        <label className="block space-y-1">
          <span className="text-[11px] text-neutral-500">编辑指令</span>
          <textarea
            value={data.prompt}
            {...promptEdit.bind}
            rows={9}
            placeholder="描述需要如何组合、迁移或修改参考图"
            className={`${promptChipClass} resize-none`}
          />
          <span className="text-[11px] text-neutral-600">可连接 1–8 张参考图，按连线顺序传入</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block space-y-1">
            <span className="text-[11px] text-neutral-500">画幅比例</span>
            <select
              value={data.aspectRatio}
              onChange={(e) => updateNodeData(
                id,
                imageModelAspectRatioPatch(data.modelId, data.modelOptions, e.target.value),
              )}
              className={inputClass}
            >
              {ASPECT_RATIOS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] text-neutral-500">生成数量</span>
            <select
              value={data.batchSize}
              onChange={(e) =>
                updateNodeData(id, { batchSize: Number(e.target.value) as 1 | 2 | 4 | 8 })
              }
              className={inputClass}
            >
              {BATCH_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} 张
                </option>
              ))}
            </select>
          </label>
        </div>
        <ModelControls nodeId={id} modelId={data.modelId} retiredModelId={data.retiredModelId} modelOptions={data.modelOptions} preferredAspectRatio={data.aspectRatio} disabled={running} referenceRows={admission.referenceRows} />
        <RunButton
          status={data.status}
          onClick={() => void runNode(id)}
          label={data.label}
          disabledReason={admission.allowed ? undefined : admission.reason}
        />
        {running && <Developing />}
        <ImageGrid images={data.outputImages} />
      </NodeFrame>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
