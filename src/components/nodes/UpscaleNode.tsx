import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useFlowStore } from "@/store/flowStore";
import { isNodeRunActive, type UpscaleNodeData } from "@/types/workflow";
import { NodeFrame, NodeProductPolicyNotice, RunButton, Developing } from "./NodeFrame";
import { ImageGrid } from "./ImageGrid";
import { ModelControls } from "./ModelControls";
import { usePromptRunAdmission } from "@/hooks/usePromptRunAdmission";

const IMAGE_SIZES = [
  { value: "2K", label: "2K · 长边 2048" },
  { value: "4K", label: "4K · 长边 4096" },
] as const;

export function UpscaleNode({ id, data, selected }: NodeProps<Node<UpscaleNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const runNode = useFlowStore((s) => s.runNode);
  const running = isNodeRunActive(data.status);
  const admission = usePromptRunAdmission(id, data);

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <NodeFrame nodeId={id} title={data.label} status={data.status} error={data.error} selected={selected}>
        <NodeProductPolicyNotice kind={data.kind} />
        <div className="space-y-1">
          <span className="text-[10px] text-neutral-500">放大档位</span>
          <div className="grid grid-cols-2 gap-2">
            {IMAGE_SIZES.map(({ value, label }) => {
              const active = data.imageSize === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateNodeData(id, { imageSize: value })}
                  className={`nodrag rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-[#262626] bg-[#0f0f0f] text-neutral-400 hover:border-gold/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <ModelControls nodeId={id} modelId={data.modelId} retiredModelId={data.retiredModelId} modelOptions={data.modelOptions} disabled={running} referenceRows={admission.referenceRows} />
        <RunButton
          status={data.status}
          onClick={() => void runNode(id)}
          label="高清放大"
          disabledReason={admission.allowed ? undefined : admission.reason}
          disabledLabel="首版暂不支持"
        />
        {running && <Developing />}
        <ImageGrid images={data.outputImages} />
      </NodeFrame>
      <Handle type="source" position={Position.Right} />
    </>
  );
}
