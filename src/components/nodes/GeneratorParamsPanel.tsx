import { useEffect, useMemo, useRef } from "react";
import { Handle, Position, useConnection } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import {
  isDocumentConnectionValid,
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
  VIP_SIZE_DEFAULT_TIER_INDEX,
  defaultImageModelOptions,
  getImageModelContract,
  imageAspectRatioOptions,
  imageModelLabel,
  imageModelOptionsForAspectRatio,
  imageModelOptionsWarnings,
  imagePromptSizePrefixOptions,
  imageSizeTierOptions,
  isImageModelId,
  vipSizeTiersForRatio,
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

/** 参数下拉横向偏移：弹窗左缘 = 所在节点右缘外 7px。
 * 触发器有全宽（模型/尺寸）与半格（画幅/批次）两种宽度，写死数值必在某种宽度下
 * 落进节点内；定位时实时量触发器→节点右缘距离（屏幕像素，天然跟随缩放）。 */
function nodeOutsideOffset(trigger: HTMLElement | null): number {
  const triggerBox = trigger?.getBoundingClientRect();
  const nodeBox = trigger?.closest(".react-flow__node")?.getBoundingClientRect();
  if (!triggerBox || !nodeBox) return 17;
  return Math.max(0, nodeBox.right - triggerBox.right) + 7;
}

interface SelectOption { value: string; label: string; disabled?: boolean; }

function OptionSelect({ label, value, options, disabled, placeholder, onChange, ariaLabel, hint }: {
  label: string; value: string; options: readonly SelectOption[]; disabled?: boolean;
  placeholder?: string; onChange: (n: string) => void; ariaLabel?: string; hint?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-label text-[var(--gc-node-muted)]">{label}</span>
      <Select value={value} disabled={disabled}
        onValueChange={(n) => { if (typeof n === "string") onChange(n); }}>
        <SelectTrigger ref={triggerRef} aria-label={ariaLabel ?? label} className="nodrag h-7 w-full text-[11px]">
          <SelectValue placeholder={placeholder ?? "未选择"}>
            {(sel) => {
              const cur = typeof sel === "string" ? sel : "";
              const opt = options.find((o) => o.value === cur);
              return opt?.label || opt?.value || placeholder || "未选择";
            }}
          </SelectValue>
        </SelectTrigger>
        {/* 参数下拉统一在参数右侧弹出、与参数顶部对齐（用户裁决） */}
        <SelectPortal><SelectPositioner
          side="right"
          align="start"
          // Base UI 默认按“选中项与触发器文本对齐”摆弹窗（alignItemWithTrigger=true），
          // 会覆盖 side/align 导致弹窗压住节点：参数下拉必须固定右侧顶部。
          alignItemWithTrigger={false}
          // 忽略 React Flow 视口（overflow:hidden 限幅祖先）导致的误 flip。
          collisionBoundary={typeof document === "undefined" ? undefined : document.body}
          sideOffset={() => nodeOutsideOffset(triggerRef.current)}
        ><SelectPopup>
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

/** 分段 pills：2–4 个短选项时比下拉更直观（quality/imageSize/outputFormat）；多选项回落下拉。 */
function SegmentedParam({ name, value, options, disabled, onSelect }: {
  name: string;
  value: string | number | boolean | undefined;
  options: readonly ParamOption[];
  disabled?: boolean;
  onSelect: (v: string | number | boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label={paramLabel(name)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            disabled={disabled || o.disabled}
            aria-pressed={active}
            title={o.label || String(o.value)}
            onClick={() => onSelect(o.value)}
            className={`nodrag rounded-md border px-2 py-1 text-[11px] transition-colors ${
              active
                ? "border-[var(--gc-accent)] bg-[var(--gc-accent)]/15 text-[var(--gc-node-text)]"
                : "border-[var(--gc-node-border)] text-[var(--gc-node-muted)] hover:border-[var(--gc-accent)]/50 hover:text-[var(--gc-node-text)]"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {o.label || String(o.value)}
          </button>
        );
      })}
    </div>
  );
}

/** 选项少且短时用 pills，否则用下拉（阈值：≤4 项且标签总长 ≤12 字）。 */
function shouldSegmentOptions(options: readonly ParamOption[]): boolean {
  if (options.length < 2 || options.length > 4) return false;
  return options.every((o) => !o.disabled) &&
    options.reduce((n, o) => n + (o.label || String(o.value)).length, 0) <= 12;
}

function ParamControl({ name, value, options, disabled, onChange }: {
  name: string; value: string | number | boolean | undefined;
  options: readonly ParamOption[]; disabled?: boolean; onChange: (n: string | number | boolean) => void;
}) {
  const paramTriggerRef = useRef<HTMLButtonElement | null>(null);
  const segmented = shouldSegmentOptions(options);
  if (segmented) {
    return (
      <div className="flex min-h-[34px] flex-col gap-1.5">
        <span className="text-label text-[var(--gc-node-muted)]" title={name}>{paramLabel(name)}</span>
        <SegmentedParam name={name} value={value} options={options} disabled={disabled} onSelect={onChange} />
      </div>
    );
  }
  return (
    <label className="flex min-h-[34px] items-center gap-2">
      <span className="w-20 shrink-0 truncate text-label text-[var(--gc-node-muted)]" title={name}>{paramLabel(name)}</span>
      <Select value={paramText(value)} disabled={disabled || options.length === 0}
        onValueChange={(n) => {
          const found = typeof n === "string" ? options.find((o) => String(o.value) === n) : undefined;
          if (found) { onChange(found.value as string | number); return; }
          if (typeof n === "string" || typeof n === "number" || typeof n === "boolean") onChange(n);
        }}>
        <SelectTrigger ref={paramTriggerRef} aria-label={paramLabel(name)} className="nodrag h-7 min-w-0 flex-1 text-[11px]">
          <SelectValue placeholder="默认">{(sel) => paramText(sel) || "默认"}</SelectValue>
        </SelectTrigger>
        <SelectPortal><SelectPositioner
          side="right"
          align="start"
          alignItemWithTrigger={false}
          collisionBoundary={typeof document === "undefined" ? undefined : document.body}
          sideOffset={() => nodeOutsideOffset(paramTriggerRef.current)}
        ><SelectPopup>
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

interface UpstreamSource { edgeId: string; label: string; }

/** 输入端口行：圆点在 label 列内（position:static 文档流，RF 按实测盒位算锚点），值列=来源胶囊 */
/** 拖线中的落点状态：idle 平时 / valid 可落下高亮 / invalid 不可落 */
export type PortDropState = "idle" | "valid" | "invalid";

function UpstreamPortRow({ id, label, sources, disabled, dropState, onDisconnect }: {
  id: string;
  label: string;
  sources: UpstreamSource[];
  disabled: boolean;
  /** 拖线高亮：valid 高亮、可落；idle 且未连接时熄灭 */
  dropState?: PortDropState;
  onDisconnect: (edgeId: string) => void;
}) {
  const connected = sources.length > 0;
  const dotClass = dropState === "valid"
    ? "size-2.5 shrink-0 rounded-full bg-[var(--gc-accent)] ring-2 ring-[var(--gc-accent)] ring-offset-1 ring-offset-transparent scale-125"
    : dropState === "invalid"
      ? "size-2.5 shrink-0 rounded-full opacity-30"
      : connected
        ? "size-2.5 shrink-0 rounded-full"
        : "size-2.5 shrink-0 rounded-full opacity-30";
  return (
    <div className="flex min-h-[34px] items-center gap-2">
      <span className="flex h-7 w-20 shrink-0 items-center gap-1 text-label text-[var(--gc-node-muted)]">
        <Handle
          type="target"
          position={Position.Left}
          id={id}
          style={{ position: "static", transform: "none" }}
          className={dotClass}
        />
        {label}
      </span>
      {sources.length === 0 ? (
        <span className="text-label text-[var(--gc-node-muted)]">未连接</span>
      ) : (
        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
          {sources.map((s) => (
            <button
              key={s.edgeId}
              type="button"
              disabled={disabled}
              className="nodrag gc-upstream-chip"
              title={disabled ? "只读项目不能断开连线" : `点击断开与「${s.label}」的连线`}
              onClick={() => onDisconnect(s.edgeId)}
            >
              <span className="truncate">{s.label}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  // 输入端口（方案 A+胶囊）：端口即参数面板前两行；已连线=上游来源胶囊（accent 高亮，
  // 点击断开该条边）；未连线=灰字「未连接」。边判定与上方 inferredMode/wiring 同源。
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  // 注意：useShallow 只做一层 Object.is 比较，必须返回扁平原始值字段（新数组/对象引用会引发无限重渲染）。
  const upstream = useFlowStore(useShallow((s) => {
    const edges = selectActiveEdges(s);
    const nodes = selectActiveNodes(s);
    const prompt: string[] = [];
    const media: string[] = [];
    for (const e of edges) {
      if (e.target !== nodeId) continue;
      const src = nodes.find((n) => n.id === e.source);
      if (!src) continue;
      const item = `${e.id}::${String(src.data.label ?? src.data.kind)}`;
      if (isPromptEdge(e) && src.data.kind === "text") prompt.push(item);
      else if (mediaKind === "video" ? e.targetHandle === EDGE_HANDLE_FIRST_FRAME
        : (src.data.kind === "image" || src.data.kind === "result-image")) {
        media.push(item);
      }
    }
    return { prompt: prompt.join("|"), media: media.join("|") };
  }));
  const toSources = (joined: string): UpstreamSource[] =>
    joined ? joined.split("|").map((v) => { const i = v.indexOf("::"); return { edgeId: v.slice(0, i), label: v.slice(i + 2) }; }) : [];
  const promptSources = toSources(upstream.prompt);
  const mediaSources = toSources(upstream.media);

  // 拖线落点高亮：拖线进行中时，用文档连线规则逐端口判定可落性；
  // 合法落点高亮（accent），其余保持熄灭。平时未连接端口熄灭（见 UpstreamPortRow）。
  const connection = useConnection();
  const dropStateFor = (targetHandle: string): PortDropState => {
    if (!connection.inProgress) return "idle";
    const fromNodeId = connection.fromNode?.id;
    if (!fromNodeId || fromNodeId === nodeId) return "invalid";
    const state = useFlowStore.getState();
    const document = state.tabs.find((tab) => tab.id === state.activeTabId);
    if (!document) return "invalid";
    return isDocumentConnectionValid(document, {
      source: fromNodeId,
      target: nodeId,
      sourceHandle: connection.fromHandle?.id ?? null,
      targetHandle,
    }) ? "valid" : "invalid";
  };

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
  /** 模型参数区展示的键：画幅（VIP 及其它图片模型）与尺寸前缀（gpt-image-2.5-all）都有专属控件，不在此重复。 */
  const renderParamKeys = declaredKeys.filter((k) => k !== "aspectRatio" && k !== "promptSizePrefix");

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
      const next = imageModelOptionsForAspectRatio(effModel, options, ar);
      // 尺寸档位联动：VIP 系已选档位保留同档（快速/标准/高清）；未设置或非法 size 落到新画幅
      // 的标准档（imageModelOptionsForAspectRatio 内已置标准档）。面板已无「自动」项，
      // 故不再有「保持自动」的分支。
      const curSize = typeof options.size === "string" && options.size ? options.size : undefined;
      if (curSize) {
        const curTiers = vipSizeTiersForRatio(effModel, data.aspectRatio ?? "");
        const nextTiers = vipSizeTiersForRatio(effModel, ar);
        const idx = curTiers?.findIndex((t) => t.size === curSize) ?? -1;
        if (idx >= 0 && nextTiers?.[idx]) next.size = nextTiers[idx].size;
      }
      updateNodeData(nodeId, { aspectRatio: ar, modelOptions: next });
    } else {
      updateNodeData(nodeId, { aspectRatio: ar, modelOptions: { ...options, aspectRatio: ar } });
    }
  };

  const effectiveAspectRatio = data.aspectRatio || "1:1";

  /** 「尺寸」参数（仅 VIP 系模型；其他模型的档位由契约参数区自带）。 */
  const sizeTierOptions = mediaKind === "image" && isImageModelId(effModel)
    ? imageSizeTierOptions(effModel, effectiveAspectRatio)
    : undefined;
  /** VIP 尺寸默认档（标准档）——面板删除「自动」项后未设置/非法 size 的展示与落点。 */
  const vipDefaultSizeValue = sizeTierOptions?.[VIP_SIZE_DEFAULT_TIER_INDEX]?.value;
  const curSizeValue = sizeTierOptions && typeof options.size === "string" && sizeTierOptions.some((o) => o.value === options.size)
    ? options.size
    : vipDefaultSizeValue ?? "";
  // VIP 系不允许留空 size（面板已无「自动」项）：旧卡片缺 size 或值已失效时写回标准档，
  // 避免请求体缺 size → multipart 端拼出 size="undefined" 被上游判为参数不支持。
  const vipSizeWriteBack = sizeTierOptions && !sizeTierOptions.some((o) => o.value === options.size)
    ? vipDefaultSizeValue
    : undefined;
  useEffect(() => {
    if (disabled || !vipSizeWriteBack) return;
    updateNodeData(nodeId, { modelOptions: { ...options, size: vipSizeWriteBack } });
  }, [disabled, nodeId, options, updateNodeData, vipSizeWriteBack]);

  /** 「尺寸」参数（仅 gpt-image-2.5-all：唯一可控尺寸的手段是拼在 prompt 最前的尺寸前缀）。 */
  const promptSizeOptions = mediaKind === "image" && isImageModelId(effModel)
    ? imagePromptSizePrefixOptions(effModel)
    : undefined;
  const curPromptSizeValue = typeof options.promptSizePrefix === "string" ? options.promptSizePrefix : "";

  const setParam = (k: string, n: string | number | boolean) => updateNodeData(nodeId, { modelOptions: { ...options, [k]: n } });

  return (
    <div className="space-y-3" data-generator-panel={nodeId}>
      <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">{opHint}</p>

      <UpstreamPortRow id="prompt" label="提示词" sources={promptSources} disabled={disabled}
        dropState={dropStateFor("prompt")}
        onDisconnect={(edgeId) => onEdgesChange([{ id: edgeId, type: "remove" }])} />
      <UpstreamPortRow id={mediaKind === "video" ? EDGE_HANDLE_FIRST_FRAME : "reference"}
        label={mediaKind === "video" ? "首帧图" : "参考图"} sources={mediaSources} disabled={disabled}
        dropState={dropStateFor(mediaKind === "video" ? EDGE_HANDLE_FIRST_FRAME : "reference")}
        onDisconnect={(edgeId) => onEdgesChange([{ id: edgeId, type: "remove" }])} />

      <OptionSelect label="模型" value={effModel} options={modelSel}
        disabled={disabled} onChange={patchModel} />

      <div className="grid grid-cols-2 gap-2">
        {promptSizeOptions ? (
          // gpt-image-2.5-all 既不接受 size 也不接受画幅参数，尺寸只能靠 prompt 前缀控制
          // （契约 recommendedOptions.promptSizePrefix），故画幅位换成尺寸前缀下拉。
          <OptionSelect label="尺寸" value={curPromptSizeValue} options={promptSizeOptions} disabled={disabled}
            onChange={(v) => updateNodeData(nodeId, {
              modelOptions: { ...options, promptSizePrefix: v === "" ? undefined : v },
            })} />
        ) : (
          <OptionSelect label="画幅" value={data.aspectRatio ?? ""} options={aspectRatioOptions} disabled={disabled} onChange={patchAspect} />
        )}
        {mediaKind === "image" && (
          <OptionSelect label="批次" value={String((data as ImageGeneratorNodeData).batchSize ?? "")}
            options={[...BATCH_SIZES].map((s) => ({ value: String(s), label: String(s) }))} disabled={disabled}
            onChange={(n) => updateNodeData(nodeId, { batchSize: Number(n) as BatchSize })} />
        )}
      </div>

      {sizeTierOptions && (
        <OptionSelect label="尺寸" value={curSizeValue} options={sizeTierOptions} disabled={disabled}
          onChange={(v) => updateNodeData(nodeId, { modelOptions: { ...options, size: v } })} />
      )}

      <section aria-label="模型参数" className="space-y-1">
        {renderParamKeys.length === 0 && (
          <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">当前模型没有可调参数。</p>
        )}
        {renderParamKeys.map((k) => (
          <ParamControl key={k} name={k} value={options[k]} options={paramOpts[k] ?? []} disabled={disabled}
            onChange={(n) => setParam(k, n)} />
        ))}
        {warnings.map((w) => (
          <p key={w} role="status" className="text-label leading-relaxed text-[var(--gc-warn-text)]">⚠ {w}（仍可运行）</p>
        ))}
      </section>

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