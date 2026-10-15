import { useEffect, useMemo, useRef } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
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
import { paramsFromContract } from "@/lib/paramsFromContract";
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
interface ParamRowOption { value: string | number | boolean; label?: string; disabled?: boolean; }

/** 参数行：标签 + 选项直接平铺点选（Seedream 尺寸式交互），每参数独占一行。
 * 空 label 回退到 value，绝不渲染空白（select-visibility 契约）。
 * stack：长选项（模型 8 选）纵向通栏排列；短选项横向换行。 */
function ParamRow({ label, value, options, disabled, stack, onSelect }: {
  label: string;
  value: string | number | boolean | undefined;
  options: readonly ParamRowOption[];
  disabled?: boolean;
  stack?: boolean;
  onSelect: (v: string | number | boolean) => void;
}) {
  // 画幅行：选项值全是 W:H 时给数字上方配比例示意框。
  const ratioOf = (v: string | number | boolean): [number, number] | null => {
    const match = /^([1-9]\d*):([1-9]\d*)$/.exec(String(v));
    if (!match) return null;
    return [Number(match[1]), Number(match[2])];
  };
  const showRatios = options.length > 0 && options.every((o) => ratioOf(o.value) !== null);
  return (
    <div className="space-y-1.5">
      <span className="text-label text-[var(--gc-node-muted)]">{label}</span>
      <div className={stack ? "flex flex-col gap-1" : "flex flex-nowrap gap-1"} role="group" aria-label={label}>
        {options.map((o) => {
          const active = o.value === value;
          const ratio = showRatios ? ratioOf(o.value) : null;
          const tip = typeof o.label === "string" && o.label !== String(o.value)
            ? `${o.label} ${o.value}`
            : String(o.label || o.value);
          return (
            <button
              key={String(o.value)}
              type="button"
              disabled={disabled || o.disabled}
              aria-pressed={active}
              title={tip}
              onClick={() => onSelect(o.value)}
              className={`nodrag flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border px-1 py-1 text-[11px] transition-colors ${stack ? "w-full flex-row" : "flex-col"} ${
                active
                  ? "border-[var(--gc-accent)] bg-[var(--gc-accent)]/15 text-[var(--gc-node-text)]"
                  : "border-[var(--gc-node-border)] text-[var(--gc-node-muted)] hover:border-[var(--gc-accent)]/50 hover:text-[var(--gc-node-text)]"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {ratio && (
                <span
                  aria-hidden="true"
                  className="block shrink-0 rounded-[1px] border border-current opacity-70"
                  style={{
                    width: `${Math.max(3, Math.round((14 * ratio[0]) / Math.max(ratio[0], ratio[1])))}px`,
                    height: `${Math.max(3, Math.round((14 * ratio[1]) / Math.max(ratio[0], ratio[1])))}px`,
                  }}
                />
              )}
              <span className="truncate">{o.label || o.value || "—"}</span>
            </button>
          );
        })}
      </div>
    </div>
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

  const modelSel: ParamRowOption[] = mediaKind === "image"
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
  const optionsFor = (k: string): ParamRowOption[] => {
    if (paramOpts[k] && paramOpts[k].length > 0) return paramOpts[k];
    const spec = (recommended as Record<string, { examples?: Array<string | number | boolean> } | undefined>)[k];
    return (spec?.examples ?? []).map((v) => ({ value: v }));
  };

  // A 案摘要行：模型 ｜ 参数速览。图片：画幅 · 尺寸 · ×批次；视频：画幅 · 分辨率 · 时长。
  const modelLabel = modelSel.find((o) => o.value === effModel)?.label || effModel || "未选择模型";
  const summarySpecs: string[] = [];
  if (mediaKind === "image") {
    if (data.aspectRatio) summarySpecs.push(data.aspectRatio);
    const sizeEcho = curPromptSizeValue
      || sizeTierOptions?.find((o) => o.value === curSizeValue)?.label
      || curSizeValue
      || (typeof options.imageSize === "string" ? options.imageSize : "");
    if (sizeEcho) summarySpecs.push(sizeEcho);
    const batchEcho = (data as ImageGeneratorNodeData).batchSize;
    if (typeof batchEcho === "number") summarySpecs.push(`×${batchEcho}`);
  } else {
    if (data.aspectRatio) summarySpecs.push(data.aspectRatio);
    if (typeof options.resolution === "string" && options.resolution) summarySpecs.push(options.resolution);
    if (typeof options.seconds === "string" && options.seconds) summarySpecs.push(`${options.seconds}s`);
  }
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);

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

      {/* 隔离线：输入行（提示词/参考图）与模型参数摘要行分区 */}
      <div aria-hidden="true" className="border-t border-[var(--gc-node-border)]" />

      {/* 参数区收成一行摘要；明细在原位置向上伸出（side=top），每参数独占一行、选项直接点选 */}
      <Popover.Root>
        <Popover.Trigger
          ref={settingsTriggerRef}
          aria-label="模型参数设置"
          className="nodrag flex h-7 w-full items-center gap-2 rounded-md border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] px-2 text-[11px] text-[var(--gc-node-text)]"
        >
          <span className="min-w-0 flex-1 truncate text-left">{modelLabel}{summarySpecs.length > 0 ? ` ｜ ${summarySpecs.join(" · ")}` : ""}</span>
          <SlidersHorizontalIcon aria-hidden="true" className="size-3.5 shrink-0 text-[var(--gc-node-muted)]" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            side="top"
            align="start"
            sideOffset={7}
            collisionBoundary={typeof document === "undefined" ? undefined : document.body}
          >
            <Popover.Popup
              aria-label="模型参数设置"
              className="z-[72] max-h-[50vh] w-[460px] max-w-[calc(100vw-32px)] space-y-3 overflow-y-auto rounded-md border border-[var(--gc-border)] bg-[var(--gc-panel)] p-3 shadow-lg outline-none"
            >
              <section aria-label="模型参数" className="space-y-3">
              <ParamRow label="模型" value={effModel} options={modelSel} disabled={disabled} stack
                onSelect={(v) => patchModel(String(v))} />
              {promptSizeOptions ? (
                <ParamRow label="尺寸" value={curPromptSizeValue} options={promptSizeOptions} disabled={disabled}
                  onSelect={(v) => updateNodeData(nodeId, {
                    modelOptions: { ...options, promptSizePrefix: v === "" ? undefined : v },
                  })} />
              ) : (
                <ParamRow label="画幅" value={data.aspectRatio ?? ""} options={aspectRatioOptions} disabled={disabled}
                  onSelect={(v) => patchAspect(String(v))} />
              )}
              {mediaKind === "image" && (
                <ParamRow label="数量" value={String((data as ImageGeneratorNodeData).batchSize ?? "")}
                  options={[...BATCH_SIZES].map((s) => ({ value: String(s), label: String(s) }))} disabled={disabled}
                  onSelect={(n) => updateNodeData(nodeId, { batchSize: Number(n) as BatchSize })} />
              )}
              {sizeTierOptions && (
                <ParamRow label="尺寸" value={curSizeValue} options={sizeTierOptions} disabled={disabled}
                  onSelect={(v) => updateNodeData(nodeId, { modelOptions: { ...options, size: v } })} />
              )}
              {renderParamKeys.map((k) => (
                <ParamRow key={k} label={paramLabel(k)} value={options[k]} options={optionsFor(k)} disabled={disabled}
                  onSelect={(n) => setParam(k, n)} />
              ))}
              {warnings.map((w) => (
                <p key={w} role="status" className="text-label leading-relaxed text-[var(--gc-warn-text)]">⚠ {w}（仍可运行）</p>
              ))}
              </section>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>


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