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
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "@/types/modelParameterProfiles";
import {
  getGarmentPromptVariantById,
  listGarmentPromptVariants,
  type PromptVariant,
} from "@/lib/garmentPromptPresets";
import { effectivePromptSupport } from "@/lib/promptEvaluationRelease";
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
 * v8 生成节点内联参数面板（plan.md §3.3）。
 *
 * - 字段顺序固定：功能 → 模型 → 画幅比例 + 数量 → 模型其它参数 → 接线回显 → 运行。
 * - 模型与「模型其它参数」全部按契约动态渲染（`recommendedOptions`），组件不硬编码参数表；
 *   契约未声明的既有 key 仍以自由 key-value 形式可编辑（R5 语义），只产生 warning 不阻断。
 * - 视频节点的「时长 / 运动」由模型契约给出（plan.md T2）：`seconds` 等既出现在模型参数段，
 *   不新增独立字段。
 * - 本面板取代 v7 悬浮窗口（NodeInspectorWindowPortal）承载功能目录与参数的职责。
 */

const MEDIA_KIND: Record<GeneratorNodeKind, "image" | "video"> = {
  "image-generator": "image",
  "video-generator": "video",
};

/** 目录族的展示名（功能选项下拉用）。 */
export function promptFamilyLabel(familyId: string): string {
  const names: Record<string, string> = {
    "fashion-lookbook": "写实穿搭",
    "commerce-hero": "电商主图",
    "design-sheet": "服装设定表",
    "mask-local-edit": "局部重绘（蒙版）",
    upscale: "高清放大",
    "print-extract": "印花提取",
    "print-mutate": "印花变体",
    "fabric-recolor": "面料换色",
    "prompt-polish": "提示词润色",
    "prompt-generate": "提示词生成",
    "video-animate": "款式动效",
  };
  return names[familyId] ?? familyId;
}

/** 模型参数的中文名字（未知 key 原样显示，不隐藏）。 */
const PARAM_LABELS: Record<string, string> = {
  aspectRatio: "画幅比例",
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
        <SelectTrigger aria-label={ariaLabel ?? label} className="nodrag h-7 w-full text-label">
          <SelectValue placeholder={placeholder ?? "未选择"}>
            {(selected) => {
              const current = typeof selected === "string" ? selected : "";
              return options.find((option) => option.value === current)?.label ?? placeholder ?? "未选择";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectPortal>
          <SelectPositioner>
            <SelectPopup>
              <SelectList>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
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
          <SelectTrigger aria-label={paramLabel(name)} className="nodrag h-7 min-w-0 flex-1 text-label">
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
          className="nodrag h-7 min-w-0 flex-1 bg-[var(--gc-node-inner)] text-label text-[var(--gc-node-text)]"
        />
      )}
    </label>
  );
}

/** 生成节点的「功能选项」动作：v8 功能目录内联在节点内，动作 = 聚焦功能选择器。 */
export function focusGeneratorFunctionControl(nodeId: string): void {
  const panel = document.querySelector<HTMLElement>(`[data-generator-panel="${CSS.escape(nodeId)}"]`);
  const control = panel?.querySelector<HTMLElement>('[aria-haspopup], input, select, button');
  control?.focus();
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
  /** 「+ 添加参数」的草稿行：只在本地存活，键名为空时不写回节点数据。 */
  const [draftParam, setDraftParam] = useState<{ key: string; value: string } | null>(null);

  // 接线回显（plan.md §3.3 末段）：入边按 targetHandle 分类计数。
  const wiring = useFlowStore(
    useShallow((s) => {
      const edges = selectActiveEdges(s);
      const nodes = selectActiveNodes(s);
      let prompt = 0;
      let firstFrame = 0;
      for (const edge of edges) {
        if (edge.target !== nodeId) continue;
        if (isPromptEdge(edge) && nodes.find((node) => node.id === edge.source)?.data.kind === "text") {
          prompt += 1;
        } else if (edge.targetHandle === EDGE_HANDLE_FIRST_FRAME) {
          firstFrame += 1;
        }
      }
      return { prompt, firstFrame };
    }),
  );

  const catalog = useMemo(
    () => listGarmentPromptVariants({ nodeKind: mediaKind }),
    [mediaKind],
  );
  const selectedVariant: PromptVariant | undefined = data.promptVariantId
    ? getGarmentPromptVariantById(data.promptVariantId)
    : undefined;
  const support = selectedVariant ? effectivePromptSupport(selectedVariant) : undefined;
  const variantRevoked = Boolean(
    support && support.status !== "verified" && support.status !== "recommended" && support.status !== "unverified",
  );

  const variantOptions: SelectOption[] = catalog.map((variant) => {
    const variantSupport = effectivePromptSupport(variant);
    const published = variantSupport.status === "verified" || variantSupport.status === "recommended";
    return {
      value: variant.variantId,
      label: `${promptFamilyLabel(variant.familyId)} · ${variant.mode}${published ? "" : "（未发布）"}`,
      disabled: !published,
    };
  });

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

  const patchModel = (modelId: string) => {
    if (mediaKind === "image") {
      // 换模型必须显式解除功能绑定（不静默换模、不借用旧评估结论）。
      updateNodeData(nodeId, {
        modelId,
        modelOptions: defaultImageModelOptions(modelId as ImageModelOptionsId, data.aspectRatio),
        promptVariantId: "",
        promptFamilyId: undefined,
        contractHash: undefined,
        evaluationVersion: undefined,
        error: undefined,
      });
      return;
    }
    const videoId = modelId as VideoModelId;
    updateNodeData(nodeId, {
      modelId: videoId,
      modelOptions: defaultVideoModelOptions(videoId),
      promptVariantId: "",
      contractHash: undefined,
      evaluationVersion: undefined,
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

  const applyVariant = (variant: PromptVariant) => {
    const patch: Record<string, unknown> = {
      promptVariantId: variant.variantId,
      promptFamilyId: variant.familyId,
      contractHash: variant.contractHash,
      evaluationVersion: variant.evaluationVersion,
      error: undefined,
    };
    if (mediaKind === "image" && isImageModelId(variant.modelId)) {
      patch.modelId = variant.modelId;
      const profile = getModelParameterProfile(variant.parameterProfileId);
      if (profile) {
        const materialized = materializeModelParameterProfile(profile);
        patch.modelOptions = materialized.modelOptions;
        patch.batchSize = materialized.batchSize;
        if (materialized.aspectRatio !== "source") patch.aspectRatio = materialized.aspectRatio;
      }
    } else if (mediaKind === "video") {
      patch.modelId = variant.modelId;
    }
    updateNodeData(nodeId, patch);
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
  // 蒙版字段只存在于 image-generator 数据；联合类型下按 image 形状读取。
  const displayMask = typeof (data as ImageGeneratorNodeData).mask === "string"
    ? (data as ImageGeneratorNodeData).mask
    : undefined;
  const maskSourceRef = (data as ImageGeneratorNodeData).maskSourceRef;

  return (
    <div className="space-y-3" data-generator-panel={nodeId}>
      <OptionSelect
        label="功能"
        value={data.promptVariantId ?? ""}
        options={variantOptions}
        disabled={disabled}
        placeholder={catalog.length === 0 ? "当前没有可用功能" : "选择功能"}
        onChange={(next) => {
          const variant = catalog.find((candidate) => candidate.variantId === next);
          if (variant) applyVariant(variant);
        }}
      />
      {variantOptions.length > 0 && variantOptions.every((option) => option.disabled) && (
        <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
          目录中的功能都还没有当前版本的受审评估发布快照，运行会被拒绝。
        </p>
      )}
      {variantRevoked && selectedVariant && (
        <p role="alert" className="rounded-md border border-[var(--gc-status-error)]/40 px-2 py-1.5 text-label leading-relaxed text-[var(--gc-status-error)]">
          所选功能已被撤销，请重新选择；运行会被拒绝。
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
            label="数量"
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
              className="nodrag h-7 min-w-0 flex-1 text-label"
            />
            <Input
              value={draftParam.value}
              aria-label="新参数值"
              placeholder="值"
              disabled={disabled}
              onChange={(event) => setDraftParam({ ...draftParam, value: event.target.value })}
              className="nodrag h-7 min-w-0 flex-1 text-label"
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
          className="w-full text-label"
        >
          + 添加参数
        </Button>
      </section>

      <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
        {mediaKind === "image"
          ? `参考图 ${admission.referenceRows.length} 张 · 提示词 ${wiring.prompt} 条`
          : `提示词 ${wiring.prompt} 条 · 首帧${wiring.firstFrame > 0 ? "已接" : "未接"}`}
      </p>

      {selectedVariant?.needsMask && (
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

type ImageModelOptionsId = Parameters<typeof defaultImageModelOptions>[0];

/** 视频模型契约的推荐默认值（`recommendedOptions.default`）。 */
function defaultVideoModelOptions(modelId: VideoModelId) {
  const recommended = videoModelRecommendedOptions(modelId);
  const defaults: Record<string, string | number | boolean> = {};
  for (const [key, spec] of Object.entries(recommended)) {
    if (spec.default !== undefined) defaults[key] = spec.default;
  }
  return defaults;
}
