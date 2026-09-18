import { selectActiveDocumentTarget, useFlowStore } from "@/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import { inputClass } from "./NodeFrame";
import {
  ReferenceImageList,
  type ReferenceImageListItem,
} from "./ReferenceImageList";
import {
  DEFAULT_GENERATION_MODEL_ID,
  GENERATION_IMAGE_MODEL_IDS,
  defaultImageModelOptions,
  getImageModelContract,
  imageModelLabel,
  normalizeImageModelOptions,
  type GenerationImageModelId,
  type ImageModelOptions,
} from "@/types/imageModels";
interface ModelControlsProps {
  nodeId: string;
  modelId?: GenerationImageModelId;
  retiredModelId?: string;
  modelOptions?: ImageModelOptions;
  preferredAspectRatio?: string;
  disabled?: boolean;
  referenceRows?: readonly ReferenceImageListItem[];
}

export function ModelControls({
  nodeId,
  modelId = DEFAULT_GENERATION_MODEL_ID,
  retiredModelId,
  modelOptions,
  preferredAspectRatio = "1:1",
  disabled = false,
  referenceRows,
}: ModelControlsProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const documentTarget = useFlowStore(useShallow(selectActiveDocumentTarget));
  const moveReferenceEdgeInTab = useFlowStore((state) => state.moveReferenceEdgeInTab);
  const removeReferenceEdgeInTab = useFlowStore((state) => state.removeReferenceEdgeInTab);
  const options = normalizeImageModelOptions(modelId, modelOptions, preferredAspectRatio);
  const updateOptions = (patch: Partial<ImageModelOptions>) => {
    updateNodeData(nodeId, { modelOptions: { ...options, ...patch }, error: undefined });
  };

  return (
    <div className="space-y-2 border-t border-[var(--gc-node-border)] pt-2">
      <label className="block space-y-1">
        <span className="text-[11px] text-neutral-500">图片模型</span>
        {retiredModelId && (
          <span role="alert" className="block rounded-md border border-amber-700/50 bg-amber-950/20 p-2 text-[11px] leading-relaxed text-amber-300">
            原模型 {retiredModelId} 已退出产品范围，系统没有自动换模。请手动选择一个新模型后再配置提示词与参数。
          </span>
        )}
        <select
          value={retiredModelId ? "" : modelId}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value as GenerationImageModelId;
            updateNodeData(nodeId, {
              modelId: next,
              retiredModelId: undefined,
              modelSelectionNeedsConfirmation: false,
              modelOptions: defaultImageModelOptions(next, preferredAspectRatio),
              promptVariantId: undefined,
              promptFamilyId: undefined,
              parameterProfileId: undefined,
              contractHash: undefined,
              evaluationVersion: undefined,
              postprocessVersion: undefined,
              error: undefined,
            });
          }}
          className={inputClass}
        >
          {retiredModelId && <option value="" disabled>{retiredModelId}（已停用，请重新选择）</option>}
          {GENERATION_IMAGE_MODEL_IDS.map((id) => (
            <option key={id} value={id}>{imageModelLabel(id)}</option>
          ))}
        </select>
      </label>

      {!retiredModelId && modelId === "gpt-image-2.5-flare-vip" && (
        <SelectOption
          label="输出尺寸"
          value={options.size ?? "auto"}
          values={getImageModelContract(modelId).sizes ?? []}
          disabled={disabled}
          onChange={(value) => updateOptions({ size: value })}
        />
      )}

      {!retiredModelId && modelId === "gemini-3.1-flash-image" && (
        <div className="grid grid-cols-2 gap-2">
          <SelectOption
            label="原生比例"
            value={options.aspectRatio ?? "1:1"}
            values={getImageModelContract(modelId).aspectRatios ?? []}
            disabled={disabled}
            onChange={(value) => updateOptions({ aspectRatio: value })}
          />
          <SelectOption
            label="原生尺寸"
            value={options.imageSize ?? "2K"}
            values={getImageModelContract(modelId).imageSizes ?? []}
            disabled={disabled}
            onChange={(value) => updateOptions({ imageSize: value })}
          />
        </div>
      )}

      {!retiredModelId && modelId === "flux-2-pro" && (
        <div className="grid grid-cols-2 gap-2">
          <NumberOption
            label="宽度" value={options.width ?? 2048} disabled={disabled}
            onChange={(value) => updateOptions({ width: value })}
          />
          <NumberOption
            label="高度" value={options.height ?? 2048} disabled={disabled}
            onChange={(value) => updateOptions({ height: value })}
          />
          <div className="col-span-2">
            <SelectOption
              label="输出格式"
              value={options.outputFormat ?? "png"}
              values={getImageModelContract(modelId).outputFormats ?? []}
              disabled={disabled}
              onChange={(value) => updateOptions({ outputFormat: value as "jpeg" | "png" })}
            />
          </div>
        </div>
      )}

      {!retiredModelId && modelId === "seedream-5-0-260128" && (
        <SelectOption
          label="原生尺寸"
          value={options.size ?? "2K"}
          values={getImageModelContract(modelId).sizes ?? []}
          disabled={disabled}
          onChange={(value) => updateOptions({ size: value })}
        />
      )}

      {referenceRows && referenceRows.length > 0 && (
        <ReferenceImageList
          references={referenceRows}
          disabled={disabled}
          onMove={(reference, direction) => {
            if (reference.edgeId) moveReferenceEdgeInTab(documentTarget, reference.edgeId, direction);
          }}
          onRemove={(reference) => {
            if (reference.edgeId) removeReferenceEdgeInTab(documentTarget, reference.edgeId);
          }}
        />
      )}

    </div>
  );
}

function SelectOption({
  label, value, values, disabled, onChange,
}: {
  label: string; value: string; values: string[]; disabled: boolean; onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {values.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function NumberOption({
  label, value, disabled, onChange,
}: {
  label: string; value: number; disabled: boolean; onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <input
        type="number" min={64} step={16} value={value} disabled={disabled}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isInteger(next) && next >= 64 && next % 16 === 0) onChange(next);
        }}
        className={inputClass}
      />
    </label>
  );
}
