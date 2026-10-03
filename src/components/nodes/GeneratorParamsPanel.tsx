import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  beginMaskWork,
  selectActiveDocumentTarget,
  selectActiveEdges,
  selectActiveNodes,
  selectActiveReadOnly,
  selectDocumentForTab,
  selectNodeInputImages,
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
  type VideoGeneratorNodeData,
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
import { saveMaskDraft } from "@/lib/maskUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { MaskEditor } from "./MaskEditor";
import { RunButton } from "./NodeFrame";

/**
 * v9 生成节点内联参数面板（64 Phase 2 §6.2 / 裁决 C）。
 *
 * - 字段顺序：操作 → 模型 → 画幅 + 批次 → 模型其它参数 → 接线回显 → 运行。
 * - operationMode 显式归节点 data（裁决 A），缺省 generate；edit/mask-edit 显示兼容提示。
 * - 模型与「模型其它参数」全部按契约动态渲染（`recommendedOptions`），组件不硬编码参数表。
 * - 视频节点的「时长 / 运动」由模型契约给出（seconds 等既出现在模型参数段，不新增独立字段）。
 */

const MEDIA_KIND: Record<GeneratorNodeKind, "image" | "video"> = {
  "image-generator": "image",
  "video-generator": "video",
};

/** 操作模式选项（mask-edit 仅 image 可用，video 不展示）。 */
const IMAGE_OPERATION_OPTIONS = [
  { value: "generate", label: "生成" },
  { value: "edit", label: "编辑" },
  { value: "mask-edit", label: "局部重绘（蒙版）" },
] as const;

const VIDEO_OPERATION_OPTIONS = [
  { value: "generate", label: "生成" },
  { value: "edit", label: "编辑" },
] as const;

/** 模型参数的中文名字（未知 key 原样显示，不隐藏）。 */
const PARAM_LABELS: Record<string, string> = {
  aspectRatio: "画幅",
  size: "尺寸",
  imageSize: "分辨率档位",
  quality: "画质",
  outputFormat: "输出格式",
  width: "宽",
  height: "高",
  seconds: "时长（秒）",
  resolution: "分辨率",
  seed: "随机种子",
};

function paramLabel(key: string): string {
  return PARAM_LABELS[key] ?? key;
}

function paramText(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

function OptionSelect({
  label,
  value,
  options,
  disabled,
  placeholder,
  onChange,
  ariaLabel,
}: {
  label: string;
  value: string;
  options: readonly SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  onChange: (next: string) => void;
  ariaLabel?: string;
}) {
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-label text-[var(--gc-node-muted)]">{label}</span>
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          if (typeof next === "string") onChange(next);
        }}
      >
        {/* §5.2 1a：text-label → text-[11px] 处置 twMerge 挤掉 text-foreground 的冲突源头 */}
        <SelectTrigger aria-label={ariaLabel ?? label} className="nodrag h-7 w-full text-[11px]">
          <SelectValue placeholder={placeholder ?? "未选择"}>
            {(selected) => {
              const current = typeof selected === "string" ? selected : "";
              const option = options.find((candidate) => candidate.value === current);
              return option?.label || option?.value || placeholder || "未选择";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectPortal>
          <SelectPositioner>
            <SelectPopup>
              <SelectList>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label || option.value || "—"}
                  </SelectItem>
                ))}
              </SelectList>
            </SelectPopup>
          </SelectPositioner>
        </SelectPortal>
      </Select>
    </label>
  );
}

function ParamControl({
  name,
  value,
  examples,
  disabled,
  onChange,
}: {
  name: string;
  value: string | number | boolean | undefined;
  examples?: readonly (string | number | boolean)[];
  disabled?: boolean;
  onChange: (next: string | number) => void;
}) {
  return (
    <label className="flex min-h-[34px] items-center gap-2">
      <span className="w-20 shrink-0 truncate text-label text-[var(--gc-node-muted)]" title={name}>
        {paramLabel(name)}
      </span>
      {examples && examples.length > 0 ? (
        <Select
          value={paramText(value)}
          disabled={disabled}
          onValueChange={(next) => {
            if (typeof next === "string") {
              onChange(next);
              return;
            }
            if (typeof next === "number" || typeof next === "boolean") onChange(next);
          }}
        >
          <SelectTrigger aria-label={paramLabel(name)} className="nodrag h-7 min-w-0 flex-1 text-[11px]">
            <SelectValue placeholder="未设置">{(selected) => paramText(selected) || "未设置"}</SelectValue>
          </SelectTrigger>
          <SelectPortal>
            <SelectPositioner>
              <SelectPopup>
                <SelectList>
                  {examples.map((example) => (
                    <SelectItem key={String(example)} value={example}>
                      {String(example)}
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectPopup>
            </SelectPositioner>
          </SelectPortal>
        </Select>
      ) : (
        <Input
          value={paramText(value)}
          disabled={disabled}
          aria-label={paramLabel(name)}
          onChange={(event) => {
            const raw = event.target.value;
            const numeric = typeof value === "number" && raw !== "" && Number.isFinite(Number(raw));
            onChange(numeric ? Number(raw) : raw);
          }}
          className="nodrag h-7 min-w-0 flex-1 bg-[var(--gc-node-inner)] text-[11px] text-[var(--gc-node-text)]"
        />
      )}
    </label>
  );
}

export interface GeneratorParamsPanelProps {
  nodeId: string;
  data: GeneratorNodeData;
}

export function GeneratorParamsPanel({ nodeId, data }: GeneratorParamsPanelProps) {
  const mediaKind = MEDIA_KIND[data.kind as GeneratorNodeKind];
  const readOnly = useFlowStore(selectActiveReadOnly);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const updateNodeDataInTab = useFlowStore((s) => s.updateNodeDataInTab);
  const runNode = useFlowStore((s) => s.runNode);
  const running = isNodeRunActive(data.status);
  const disabled = readOnly || running;
  const admission = usePromptRunAdmission(nodeId, data);
  const [editingMask, setEditingMask] = useState(false);
  const [draftParam, setDraftParam] = useState<{ key: string; value: string } | null>(null);

  // v9（裁决 A）：operationMode 显式归节点 data，缺省 generate。
  const operationMode = (data as ImageGeneratorNodeData).operationMode ?? "generate";

  // 接线回显：入边按 targetHandle 分类计数。
  const wiring = useFlowStore(
    useShallow((s) => {
      const edges = selectActiveEdges(s);
      const nodes = selectActiveNodes(s);
      let prompt = 0;
      let firstFrame = 0;
      let reference = 0;
      for (const edge of edges) {
        if (edge.target !== nodeId) continue;
        if (isPromptEdge(edge) && nodes.find((node) => node.id === edge.source)?.data.kind === "text") {
          prompt += 1;
        } else if (edge.targetHandle === EDGE_HANDLE_FIRST_FRAME) {
          firstFrame += 1;
        } else {
          const sourceKind = nodes.find((node) => node.id === edge.source)?.data.kind;
          if (sourceKind === "image" || sourceKind === "result-image") reference += 1;
        }
      }
      return { prompt, firstFrame, reference };
    }),
  );

  const modelOptions: SelectOption[] = mediaKind === "image"
    ? GENERATION_IMAGE_MODEL_IDS.map((id) => ({ value: id, label: imageModelLabel(id) }))
    : VIDEO_MODEL_IDS.map((id) => ({ value: id, label: videoModelLabel(id) }));

  const options = (data.modelOptions ?? {}) as ImageModelOptions;
  const recommended = mediaKind === "image" && isImageModelId(data.modelId)
    ? getImageModelContract(data.modelId).recommendedOptions ?? {}
    : mediaKind === "video"
      ? videoModelRecommendedOptions(data.modelId as VideoModelId)
      : {};
  const warnings = mediaKind === "image" && isImageModelId(data.modelId)
    ? imageModelOptionsWarnings(data.modelId, options)
    : mediaKind === "video"
      ? videoModelOptionsWarnings(data.modelId as VideoModelId, options)
      : [];
  const declaredKeys = Object.keys(recommended);
  const extraKeys = Object.keys(options).filter((key) => !declaredKeys.includes(key));

  const aspectRatioOptions = mediaKind === "image" && isImageModelId(data.modelId)
    ? imageAspectRatioOptions(data.modelId).map((ratio) => ({ value: ratio, label: ratio }))
    : mediaKind === "video"
      ? videoAspectRatioOptions(data.modelId as VideoModelId).map((ratio) => ({ value: ratio, label: ratio }))
      : [];

  const operationOptions = mediaKind === "image"
    ? IMAGE_OPERATION_OPTIONS
    : VIDEO_OPERATION_OPTIONS;

  const patchModel = (modelId: string) => {
    if (mediaKind === "image") {
      // v9（裁决 C）：换模型时物化默认 modelOptions，不再清除 variant binding（已随概念删除）。
      updateNodeData(nodeId, {
        modelId,
        modelOptions: defaultImageModelOptions(modelId as Parameters<typeof defaultImageModelOptions>[0], data.aspectRatio),
        error: undefined,
      });
      return;
    }
    const videoId = modelId as VideoModelId;
    updateNodeData(nodeId, {
      modelId: videoId,
      modelOptions: defaultVideoModelOptions(videoId),
      error: undefined,
    });
  };

  const patchAspectRatio = (aspectRatio: string) => {
    if (mediaKind === "image" && isImageModelId(data.modelId)) {
      updateNodeData(nodeId, {
        aspectRatio,
        modelOptions: imageModelOptionsForAspectRatio(data.modelId, options, aspectRatio),
      });
      return;
    }
    updateNodeData(nodeId, { aspectRatio, modelOptions: { ...options, aspectRatio } });
  };

  const setParam = (key: string, next: string | number) => {
    updateNodeData(nodeId, { modelOptions: { ...options, [key]: next } });
  };

  const maskSource = useFlowStore(
    useShallow((s) => {
      const document = s.tabs.find((tab) => tab.id === s.activeTabId);
      return document ? selectNodeInputImages(document, nodeId)[0] : undefined;
    }),
  );
  const displayMask = typeof (data as ImageGeneratorNodeData).mask === "string"
    ? (data as ImageGeneratorNodeData).mask
    : undefined;
  const maskSourceRef = (data as ImageGeneratorNodeData).maskSourceRef;

  return (
    <div className="space-y-3" data-generator-panel={nodeId}>
      {/* 操作（裁决 A：operationMode 归节点 data） */}
      <OptionSelect
        label="操作"
        value={operationMode}
        options={operationOptions as unknown as readonly SelectOption[]}
        disabled={disabled}
        onChange={(next) => updateNodeData(nodeId, { operationMode: next })}
      />
      {/* 兼容提示（裁决 C5 语义对齐 server DagError 文案） */}
      {mediaKind === "image" && operationMode === "edit" && (
        <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">需上游参考图</p>
      )}
      {mediaKind === "image" && operationMode === "mask-edit" && (
        <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
          需上游参考图，且需先绘制蒙版
        </p>
      )}

      <OptionSelect
        label="模型"
        value={data.modelId ?? ""}
        options={modelOptions}
        disabled={disabled}
        onChange={patchModel}
      />

      <div className="grid grid-cols-2 gap-2">
        <OptionSelect
          label="画幅"
          value={data.aspectRatio ?? ""}
          options={aspectRatioOptions}
          disabled={disabled}
          onChange={patchAspectRatio}
        />
        {mediaKind === "image" && (
          <OptionSelect
            label="批次"
            value={String((data as ImageGeneratorNodeData).batchSize ?? "")}
            options={[...BATCH_SIZES].map((size) => ({ value: String(size), label: String(size) }))}
            disabled={disabled}
            onChange={(next) => updateNodeData(nodeId, { batchSize: Number(next) as BatchSize })}
          />
        )}
      </div>
      {mediaKind === "video" && (
        <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
          视频单次任务产出一个 MP4；时长与运动参数由模型契约给出（见下方模型参数）。
        </p>
      )}

      <section aria-label="模型参数" className="space-y-1">
        {declaredKeys.length === 0 && extraKeys.length === 0 && (
          <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
            当前模型契约没有声明可调参数。
          </p>
        )}
        {declaredKeys
          .filter((key) => key !== "aspectRatio")
          .map((key) => (
            <ParamControl
              key={key}
              name={key}
              value={options[key]}
              examples={recommended[key]?.examples}
              disabled={disabled}
              onChange={(next) => setParam(key, next)}
            />
          ))}
        {extraKeys.map((key) => (
          <div key={key} className="flex items-center gap-1">
            <ParamControl
              name={key}
              value={options[key]}
              disabled={disabled}
              onChange={(next) => setParam(key, next)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`移除参数 ${key}`}
              disabled={disabled}
              onClick={() => {
                const next = { ...options };
                delete next[key];
                updateNodeData(nodeId, { modelOptions: next });
              }}
              className="shrink-0 text-[var(--gc-node-muted)]"
            >
              ✕
            </Button>
          </div>
        ))}
        {warnings.map((warning) => (
          <p key={warning} role="status" className="text-label leading-relaxed text-[var(--gc-warn-text)]">
            ⚠ {warning}（仍可运行）
          </p>
        ))}
        {draftParam && (
          <div className="flex items-center gap-1">
            <Input
              autoFocus
              value={draftParam.key}
              aria-label="新参数名"
              placeholder="参数名"
              disabled={disabled}
              onChange={(event) => setDraftParam({ ...draftParam, key: event.target.value })}
              className="nodrag h-7 min-w-0 flex-1 text-[11px]"
            />
            <Input
              value={draftParam.value}
              aria-label="新参数值"
              placeholder="值"
              disabled={disabled}
              onChange={(event) => setDraftParam({ ...draftParam, value: event.target.value })}
              className="nodrag h-7 min-w-0 flex-1 text-[11px]"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="确认添加参数"
              disabled={disabled || draftParam.key.trim().length === 0}
              onClick={() => {
                const key = draftParam.key.trim();
                if (!key) return;
                updateNodeData(nodeId, { modelOptions: { ...options, [key]: draftParam.value } });
                setDraftParam(null);
              }}
              className="shrink-0"
            >
              ✓
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="取消添加参数"
              onClick={() => setDraftParam(null)}
              className="shrink-0 text-[var(--gc-node-muted)]"
            >
              ✕
            </Button>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled || draftParam !== null}
          onClick={() => setDraftParam({ key: "", value: "" })}
          className="w-full text-[11px]"
        >
          + 添加参数
        </Button>
      </section>

      <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
        {mediaKind === "image"
          ? `参考图 ${wiring.reference} 张 · 提示词 ${wiring.prompt} 条`
          : `提示词 ${wiring.prompt} 条 · 首帧${wiring.firstFrame > 0 ? "已接" : "未接"}`}
      </p>

      {mediaKind === "image" && operationMode === "mask-edit" && (
        <div className="space-y-1.5 rounded-md border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] p-2">
          <div className="flex items-center justify-between text-label">
            <span className="text-[var(--gc-node-muted)]">蒙版（该功能要求）</span>
            <span className="text-[var(--gc-node-muted)]">源：参考图 1</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={!maskSource || running}
            onClick={() => setEditingMask(true)}
            className="w-full"
          >
            {displayMask ? "编辑蒙版" : "绘制蒙版"}
          </Button>
          {!displayMask && <p className="text-label text-[var(--gc-warn-text)]">该功能需要先涂蒙版</p>}
        </div>
      )}

      <RunButton
        status={data.status}
        onClick={() => void runNode(nodeId)}
        label={data.status === "success" ? "重新运行" : "运行"}
        disabledReason={admission.allowed ? undefined : admission.reason}
        disabledLabel="尚不可运行"
      />

      {editingMask && maskSource && (
        <MaskEditor
          source={maskSource}
          initialMask={maskSourceRef === maskSource ? displayMask : undefined}
          featherRadius={typeof (data as ImageGeneratorNodeData).featherRadius === "number"
            ? (data as ImageGeneratorNodeData).featherRadius
            : undefined}
          onClose={() => setEditingMask(false)}
          onSave={async (mask) => {
            const releaseUploadPending = beginMaskWork();
            const state = useFlowStore.getState();
            const target = selectActiveDocumentTarget(state);
            const tab = selectDocumentForTab(state, target.tabId);
            try {
              if (!tab || tab.readOnly || !tab.nodes.some((node) => node.id === nodeId)) {
                throw new Error(tab?.readOnly ? "只读项目不能保存蒙版" : "当前节点已关闭，请重新打开项目后再试");
              }
              await saveMaskDraft(
                {
                  dataUrl: mask,
                  sourceRef: maskSource,
                  projectId: tab.projectId,
                  nodeId,
                },
                {
                  commit: (url) => {
                    const current = useFlowStore.getState();
                    const currentTab = selectDocumentForTab(current, target.tabId);
                    if (
                      !currentTab ||
                      currentTab.readOnly ||
                      !currentTab.nodes.some((node) => node.id === nodeId) ||
                      selectNodeInputImages(currentTab, nodeId)[0] !== maskSource
                    ) {
                      throw new Error("原图已变化，旧蒙版未覆盖当前节点，请基于新原图重新绘制");
                    }
                    updateNodeDataInTab(target, nodeId, { mask: url, maskSourceRef: maskSource, error: undefined });
                  },
                  close: () => setEditingMask(false),
                },
              );
            } finally {
              releaseUploadPending();
            }
          }}
        />
      )}
    </div>
  );
}

/** 视频模型契约的推荐默认值（`recommendedOptions.default`）。 */
function defaultVideoModelOptions(modelId: VideoModelId) {
  const recommended = videoModelRecommendedOptions(modelId);
  const defaults: Record<string, string | number | boolean> = {};
  for (const [key, spec] of Object.entries(recommended)) {
    if (spec.default !== undefined) defaults[key] = spec.default;
  }
  return defaults;
}