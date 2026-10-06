import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  selectActiveEdges,
  selectActiveNodes,
  selectActiveReadOnly,
  useFlowStore,
} from "@/store/flowStore";
import {
  BATCH_SIZES,
  isNodeRunActive,
  isPromptEdge,
  EDGE_HANDLE_FIRST_FRAME,
  type BatchSize,
  type GeneratorNodeData,
  type GeneratorNodeKind,
  type ImageGeneratorNodeData,
} from "@/types/workflow";
import {
  GENERATION_IMAGE_MODEL_IDS,
  defaultImageModelOptions,
  getImageModelContract,
  imageAspectRatioOptions,
  imageModelLabel,
  imageModelOptionsForAspectRatio,
  imageModelOptionsWarnings,
  isImageModelId,
  type ImageModelOptions,
} from "@/types/imageModels";
import {
  VIDEO_MODEL_IDS,
  videoAspectRatioOptions,
  videoModelLabel,
  videoModelOptionsWarnings,
  videoModelRecommendedOptions,
  type VideoModelId,
} from "@/types/videoModels";
import { usePromptRunAdmission } from "@/hooks/usePromptRunAdmission";
import { paramsFromContract, type ParamOption } from "@/lib/paramsFromContract";
import {
  Select,
  SelectItem,
  SelectList,
  SelectPopup,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RunButton } from "./NodeFrame";

const MEDIA_KIND: Record<GeneratorNodeKind, "image" | "video"> = {
  "image-generator": "image",
  "video-generator": "video",
};

const PARAM_LABELS: Record<string, string> = {
  aspectRatio: "画幅", size: "尺寸", imageSize: "分辨率档位",
  quality: "画质", outputFormat: "输出格式", width: "宽", height: "高",
  seconds: "时长（秒）", resolution: "分辨率", seed: "随机种子",
};
function paramLabel(k: string) { return PARAM_LABELS[k] ?? k; }
function paramText(v: unknown) { return v === undefined || v === null ? "" : String(v); }

interface SelectOption { value: string; label: string; disabled?: boolean; }

function OptionSelect({ label, value, options, disabled, placeholder, onChange, ariaLabel, hint }: {
  label: string; value: string; options: readonly SelectOption[]; disabled?: boolean;
  placeholder?: string; onChange: (n: string) => void; ariaLabel?: string; hint?: string;
}) {
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-label text-[var(--gc-node-muted)]">{label}</span>
      <Select value={value} disabled={disabled}
        onValueChange={(n) => { if (typeof n === "string") onChange(n); }}>
        <SelectTrigger aria-label={ariaLabel ?? label} className="nodrag h-7 w-full text-[11px]">
          <SelectValue placeholder={placeholder ?? "未选择"}>
            {(sel) => {
              const cur = typeof sel === "string" ? sel : "";
              const opt = options.find((o) => o.value === cur);
              return opt?.label || opt?.value || placeholder || "未选择";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectPortal><SelectPositioner><SelectPopup>
          <SelectList>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value} disabled={o.disabled}>{o.label || o.value || "—"}</SelectItem>
            ))}
          </SelectList>
        </SelectPopup></SelectPositioner></SelectPortal>
      </Select>
      {hint && <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">{hint}</p>}
    </label>
  );
}

function ParamControl({ name, value, options, disabled, onChange }: {
  name: string; value: string | number | boolean | undefined;
  options: readonly ParamOption[]; disabled?: boolean; onChange: (n: string | number) => void;
}) {
  return (
    <label className="flex min-h-[34px] items-center gap-2">
      <span className="w-20 shrink-0 truncate text-label text-[var(--gc-node-muted)]" title={name}>{paramLabel(name)}</span>
      <Select value={paramText(value)} disabled={disabled || options.length === 0}
        onValueChange={(n) => {
          const found = typeof n === "string" ? options.find((o) => String(o.value) === n) : undefined;
          if (found) { onChange(found.value as string | number); return; }
          if (typeof n === "string" || typeof n === "number" || typeof n === "boolean") onChange(n);
        }}>
        <SelectTrigger aria-label={paramLabel(name)} className="nodrag h-7 min-w-0 flex-1 text-[11px]">
          <SelectValue placeholder="默认">{(sel) => paramText(sel) || "默认"}</SelectValue>
        </SelectTrigger>
        <SelectPortal><SelectPositioner><SelectPopup>
          <SelectList>
            {options.map((o) => (
              <SelectItem key={String(o.value)} value={o.value} disabled={o.disabled}>{o.label || String(o.value)}</SelectItem>
            ))}
          </SelectList>
        </SelectPopup></SelectPositioner></SelectPortal>
      </Select>
    </label>
  );
}

export interface GeneratorParamsPanelProps { nodeId: string; data: GeneratorNodeData; }

export function GeneratorParamsPanel({ nodeId, data }: GeneratorParamsPanelProps) {
  const mediaKind = MEDIA_KIND[data.kind as GeneratorNodeKind];
  const readOnly = useFlowStore(selectActiveReadOnly);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const runNode = useFlowStore((s) => s.runNode);
  const running = isNodeRunActive(data.status);
  const disabled = readOnly || running;
  const admission = usePromptRunAdmission(nodeId, data);

  // 65d（决策 C 路线1）：mask-edit 推断已从生成节点剥离；operationMode 仅剩 generate/edit，
  // 仍由 65b「参考图边自动推断」决定（契约 §3.5）。
  const inferredMode = useFlowStore(useShallow((s) => {
    const edges = selectActiveEdges(s);
    const nodes = selectActiveNodes(s);
    let hasRef = false;
    for (const e of edges) {
      if (e.target !== nodeId) continue;
      if (!isPromptEdge(e) && e.targetHandle !== EDGE_HANDLE_FIRST_FRAME) {
        const src = nodes.find((n) => n.id === e.source);
        if (src && src.data.kind === "image") hasRef = true;
      }
    }
    if (mediaKind === "video") return hasRef ? ("edit" as const) : ("generate" as const);
    return hasRef ? ("edit" as const) : ("generate" as const);
  }));

  const curOp = (data as ImageGeneratorNodeData).operationMode;
  if (curOp !== inferredMode) updateNodeData(nodeId, { operationMode: inferredMode });

  // 用户语态状态提示（仅 generate/edit 两分支，契约 §3.5）
  const opHint = (() => {
    if (mediaKind === "video") return inferredMode === "edit" ? "已接首帧 → 编辑模式" : "未接首帧 → 文生视频";
    if (inferredMode === "edit") return "已接参考图 → 编辑模式";
    return "未接参考图 → 文生图";
  })();

  const wiring = useFlowStore(useShallow((s) => {
    const edges = selectActiveEdges(s);
    const nodes = selectActiveNodes(s);
    let prompt = 0, ff = 0, ref = 0;
    for (const e of edges) {
      if (e.target !== nodeId) continue;
      if (isPromptEdge(e) && nodes.find((n) => n.id === e.source)?.data.kind === "text") prompt++;
      else if (e.targetHandle === EDGE_HANDLE_FIRST_FRAME) ff++;
      else { const sk = nodes.find((n) => n.id === e.source)?.data.kind; if (sk === "image" || sk === "result-image") ref++; }
    }
    return { prompt, firstFrame: ff, reference: ref };
  }));

  const effModel = data.modelId ?? "";

  const modelSel: SelectOption[] = mediaKind === "image"
    ? GENERATION_IMAGE_MODEL_IDS.map((id) => ({ value: id, label: imageModelLabel(id) }))
    : VIDEO_MODEL_IDS.map((id) => ({ value: id, label: videoModelLabel(id) }));

  const options = (data.modelOptions ?? {}) as ImageModelOptions;
  const recommended = mediaKind === "image" && isImageModelId(effModel)
    ? getImageModelContract(effModel).recommendedOptions ?? {}
    : mediaKind === "video" ? videoModelRecommendedOptions(effModel as VideoModelId) : {};
  const warnings = mediaKind === "image" && isImageModelId(effModel)
    ? imageModelOptionsWarnings(effModel, options)
    : mediaKind === "video" ? videoModelOptionsWarnings(effModel as VideoModelId, options) : [];
  const declaredKeys = Object.keys(recommended);

  const aspectRatioOptions = mediaKind === "image" && isImageModelId(effModel)
    ? imageAspectRatioOptions(effModel).map((r) => ({ value: r, label: r }))
    : mediaKind === "video" ? videoAspectRatioOptions(effModel as VideoModelId).map((r) => ({ value: r, label: r })) : [];

  const paramOpts = useMemo(() =>
    effModel && mediaKind === "image" ? paramsFromContract(effModel) : {}
  , [effModel, mediaKind]);

  const patchModel = (mid: string) => {
    if (mediaKind === "image") {
      updateNodeData(nodeId, { modelId: mid, modelOptions: defaultImageModelOptions(mid as any, data.aspectRatio), error: undefined });
    } else {
      updateNodeData(nodeId, { modelId: mid, modelOptions: defaultVideoModelOptions(mid as VideoModelId), error: undefined });
    }
  };

  const patchAspect = (ar: string) => {
    if (mediaKind === "image" && isImageModelId(effModel)) {
      updateNodeData(nodeId, { aspectRatio: ar, modelOptions: imageModelOptionsForAspectRatio(effModel, options, ar) });
    } else {
      updateNodeData(nodeId, { aspectRatio: ar, modelOptions: { ...options, aspectRatio: ar } });
    }
  };

  const setParam = (k: string, n: string | number) => updateNodeData(nodeId, { modelOptions: { ...options, [k]: n } });

  return (
    <div className="space-y-3" data-generator-panel={nodeId}>
      <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">{opHint}</p>

      <OptionSelect label="模型" value={effModel} options={modelSel}
        disabled={disabled} onChange={patchModel} />

      <div className="grid grid-cols-2 gap-2">
        <OptionSelect label="画幅" value={data.aspectRatio ?? ""} options={aspectRatioOptions} disabled={disabled} onChange={patchAspect} />
        {mediaKind === "image" && (
          <OptionSelect label="批次" value={String((data as ImageGeneratorNodeData).batchSize ?? "")}
            options={[...BATCH_SIZES].map((s) => ({ value: String(s), label: String(s) }))} disabled={disabled}
            onChange={(n) => updateNodeData(nodeId, { batchSize: Number(n) as BatchSize })} />
        )}
      </div>

      <section aria-label="模型参数" className="space-y-1">
        {declaredKeys.length === 0 && (
          <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">当前模型没有可调参数。</p>
        )}
        {declaredKeys.filter((k) => k !== "aspectRatio").map((k) => (
          <ParamControl key={k} name={k} value={options[k]} options={paramOpts[k] ?? []} disabled={disabled}
            onChange={(n) => setParam(k, n)} />
        ))}
        {warnings.map((w) => (
          <p key={w} role="status" className="text-label leading-relaxed text-[var(--gc-warn-text)]">⚠ {w}（仍可运行）</p>
        ))}
      </section>

      <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
        {mediaKind === "image"
          ? `参考图 ${wiring.reference} 张 · 提示词 ${wiring.prompt} 条`
          : `提示词 ${wiring.prompt} 条 · 首帧${wiring.firstFrame > 0 ? "已接" : "未接"}`}
      </p>

      <RunButton status={data.status} onClick={() => void runNode(nodeId)}
        label={data.status === "success" ? "重新运行" : "运行"}
        disabledReason={admission.allowed ? undefined : admission.reason} disabledLabel="尚不可运行" />
    </div>
  );
}

function defaultVideoModelOptions(modelId: VideoModelId) {
  const rec = videoModelRecommendedOptions(modelId);
  const d: Record<string, string | number | boolean> = {};
  for (const [k, s] of Object.entries(rec)) { if (s.default !== undefined) d[k] = s.default; }
  return d;
}