import { useEffect, useState } from "react";
import {
  selectActiveEdges,
  selectActiveDocumentTarget,
  selectActiveNodes,
  selectActivePrimarySelectedNodeId,
  selectActiveReadOnly,
  selectActiveSelectedResultId,
  useFlowStore,
  type ConnectedNodeDirection,
  type RecentResult,
} from "@/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import {
  NODE_SPECS,
  IMAGE_OPERATION_MODE_VALUES,
  isNodeRunActive,
  type ImageOperationMode,
  type NodeKind,
} from "@/types/workflow";
import { inputClass, RunButton, STATUS_TEXT } from "../nodes/NodeFrame";
import { ModelControls } from "../nodes/ModelControls";
import { ReferenceRoleSummary } from "../nodes/ReferenceRoleSummary";
import { thumbnailImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import {
  imageModelAspectRatioPatch,
  imageModelOptionsErrorForOperation,
  isImageModelId,
  type GenerationImageModelId,
  type ImageModelOptions,
} from "@/types/imageModels";
import { requestCanvasLanding } from "@/lib/canvasLanding";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import {
  buildGarmentPrompt,
  GARMENT_PROMPT_PRESETS,
  type GarmentPromptPreset,
  type PromptOperationMode,
  type PromptVariant,
} from "@/lib/garmentPromptPresets";
import { getRuntimePromptVariantAvailability } from "@/lib/promptEvaluationRelease";
import {
  evaluatePromptRunAdmission,
  promptRunReferenceRoleProfile,
  promptRunAdmissionInputFromNode,
  promptRunReferenceSnapshotsFromGraph,
  type PromptRunReferenceSnapshot,
} from "@/lib/promptRunAdmission";
import { promptRunBrowserReferencesFromGraph } from "@/hooks/usePromptRunAdmission";
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
  type MaterializedModelParameterProfile,
  type ModelParameterProfile,
} from "@/types/modelParameterProfiles";
import { nodeProductPolicy } from "@/lib/nodeProductPolicy";

const UPSTREAM_SUGGESTIONS: Record<NodeKind, NodeKind[]> = {
  "image-input": [],
  "sketch-to-render": ["image-input"],
  "ai-modify": ["image-input", "sketch-to-render"],
  "fabric-recolor": ["image-input", "sketch-to-render"],
  upscale: ["sketch-to-render", "ai-modify"],
  "print-extract": ["image-input", "ai-modify"],
  "print-mutate": ["image-input", "print-extract"],
  "mask-redraw": ["image-input", "ai-modify"],
  result: ["sketch-to-render", "ai-modify", "upscale"],
};

const DOWNSTREAM_SUGGESTIONS: Record<NodeKind, NodeKind[]> = {
  "image-input": ["sketch-to-render", "ai-modify", "print-extract"],
  "sketch-to-render": ["ai-modify", "fabric-recolor", "upscale", "result"],
  "ai-modify": ["fabric-recolor", "upscale", "result"],
  "fabric-recolor": ["upscale", "result"],
  upscale: ["result"],
  "print-extract": ["print-mutate", "result"],
  "print-mutate": ["result"],
  "mask-redraw": ["result"],
  result: [],
};

function PromptPresetPicker({
  currentPrompt,
  currentAspectRatio,
  currentBatchSize,
  currentModelOptions,
  modelId,
  nodeKind,
  operationMode,
  references,
  hasUnconfirmedReferences,
  disabled,
  onApply,
}: {
  currentPrompt: string;
  currentAspectRatio: string;
  currentBatchSize: number;
  currentModelOptions?: ImageModelOptions;
  modelId?: GenerationImageModelId;
  nodeKind: "sketch-to-render" | "ai-modify";
  operationMode: PromptOperationMode;
  references: readonly PromptRunReferenceSnapshot[];
  hasUnconfirmedReferences: boolean;
  disabled: boolean;
  onApply: (application: {
    preset: GarmentPromptPreset;
    variant: PromptVariant;
    profile: ModelParameterProfile;
    parameters: MaterializedModelParameterProfile;
    prompt: string;
  }) => void;
}) {
  const [pending, setPending] = useState<{
    contextKey: string;
    preset: GarmentPromptPreset;
    variant: PromptVariant;
    profile: ModelParameterProfile;
    parameters: MaterializedModelParameterProfile;
    prompt: string;
  } | null>(null);
  const referenceRoleProfile = promptRunReferenceRoleProfile({
    nodeKind,
    operationMode,
    references,
  });
  const roleSet = new Set(references.map((reference) => reference.role));
  const contextKey = JSON.stringify({
    currentAspectRatio,
    currentBatchSize,
    currentModelOptions: currentModelOptions ?? {},
    currentPrompt,
    disabled,
    hasUnconfirmedReferences,
    modelId: modelId ?? null,
    nodeKind,
    operationMode,
    referenceRoleProfile,
  });
  const activePending = pending?.contextKey === contextKey ? pending : null;

  useEffect(() => {
    if (pending && pending.contextKey !== contextKey) setPending(null);
  }, [contextKey, pending]);

  return (
    <Collapsible className="rounded-lg border border-[var(--gc-border)] bg-[var(--gc-panel-soft)] px-2.5 py-2">
      <CollapsibleTrigger className="cursor-pointer select-none rounded-sm text-[10px] font-medium text-[var(--gc-text-muted)] data-open:[&_svg]:rotate-180">
        <span>服装提示词预设</span>
        <ChevronDownIcon aria-hidden="true" className="size-3 transition-transform" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        <p className="text-[10px] leading-relaxed text-[var(--gc-text-muted)]">
          保留当前内容作为设计意图，再补齐构图、材质、画幅和约束。
        </p>
        {GARMENT_PROMPT_PRESETS.map((preset) => {
          const availability = modelId
            ? getRuntimePromptVariantAvailability(
                {
                  familyId: preset.id,
                  modelId,
                  nodeKind,
                  mode: operationMode,
                },
                { referenceRoleProfile },
              )
            : { enabled: false, reason: "请先选择明确的图片模型。" };
          const variant = availability.variant;
          const profile = variant ? getModelParameterProfile(variant.parameterProfileId) : undefined;
          const profileMatches = Boolean(
            variant && profile
            && profile.modelId === variant.modelId
            && profile.familyId === variant.familyId
            && profile.mode === variant.mode,
          );
          const missingRoles = variant?.requiredRoles.filter((role) => !roleSet.has(role)) ?? [];
          const referenceReason = hasUnconfirmedReferences
            ? "参考图中存在待确认角色，不能用于已验证变体。"
            : missingRoles.length > 0
              ? `缺少参考角色：${missingRoles.join("、")}`
              : "";
          const reason = !availability.enabled
            ? availability.reason
            : !profileMatches
              ? "参数档案缺失或与模型、任务族、模式不一致。"
              : referenceReason;
          const enabled = !disabled && availability.enabled && profileMatches && !referenceReason;
          const reasonId = `prompt-preset-${nodeKind}-${preset.id}-reason`;
          return (
            <div key={preset.id} className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!enabled}
                aria-describedby={reason ? reasonId : undefined}
                onClick={() => {
                  if (!variant || !profile) return;
                  setPending({
                    contextKey,
                    preset,
                    variant,
                    profile,
                    parameters: materializeModelParameterProfile(profile),
                    prompt: buildGarmentPrompt(variant.variantId, currentPrompt),
                  });
                }}
                className="h-auto w-full flex-col items-stretch gap-0 rounded-md border-[var(--gc-border)] bg-[var(--gc-control)] px-2 py-1.5 text-left whitespace-normal hover:border-[var(--gc-accent)]"
              >
                <span className="flex items-center justify-between gap-2 text-[10px] text-[var(--gc-text)]">
                  <span>{preset.name}</span>
                  <span className="shrink-0 text-[10px] text-[var(--gc-accent)]">{preset.aspectRatio}</span>
                </span>
                <span className="mt-0.5 block text-[10px] leading-relaxed text-[var(--gc-text-muted)]">{preset.description}</span>
                <span className="mt-1 block text-[10px] text-[var(--gc-text-muted)]">
                  {preset.templateName} · case {preset.exampleCaseIds.join(", ")}
                </span>
              </Button>
              {reason && <p id={reasonId} className="px-1 text-[10px] leading-relaxed text-amber-500/90">{reason}</p>}
            </div>
          );
        })}
        {activePending && (
          <div aria-live="polite" className="space-y-2 rounded-md border border-[var(--gc-accent)]/40 bg-black/20 p-2 text-[10px] text-[var(--gc-text-muted)]">
            <p className="font-medium text-[var(--gc-text)]">确认应用：{activePending.preset.name}</p>
            <dl className="space-y-1">
              <div className="space-y-0.5"><dt>提示词变体</dt><dd className="break-all font-mono text-[var(--gc-text)]">{activePending.variant.variantId}</dd></div>
              <div className="space-y-0.5"><dt>参数档案</dt><dd className="break-all font-mono text-[var(--gc-text)]">{activePending.profile.profileId}</dd></div>
              <div className="flex justify-between gap-3"><dt>业务画幅</dt><dd>{currentAspectRatio} → {activePending.parameters.aspectRatio}</dd></div>
              <div className="flex justify-between gap-3"><dt>输出数量</dt><dd>{currentBatchSize} → {activePending.parameters.batchSize}</dd></div>
              <div className="space-y-0.5"><dt>模型原生参数</dt><dd className="break-all text-[var(--gc-text)]">{JSON.stringify(currentModelOptions ?? {})} → {JSON.stringify(activePending.parameters.modelOptions)}</dd></div>
              <div className="space-y-0.5"><dt>后处理</dt><dd className="text-[var(--gc-text)]">{activePending.profile.postprocess.version} · {activePending.profile.postprocess.finalAspectRatio}</dd></div>
              {activePending.parameters.ignoredNativeFields.length > 0 && (
                <div className="space-y-0.5"><dt>将清除/忽略</dt><dd className="text-amber-400">{activePending.parameters.ignoredNativeFields.join("、")}</dd></div>
              )}
            </dl>
            <div className="space-y-0.5">
              <p>提示词预览</p>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-sm border border-[var(--gc-border)] bg-[var(--gc-control)] p-1.5 font-sans leading-relaxed text-[var(--gc-text)]">{activePending.prompt}</pre>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setPending(null)}>取消</Button>
              <Button type="button" size="sm" onClick={() => { onApply(activePending); setPending(null); }}>确认应用</Button>
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function QuickConnect({ nodeId, kind }: { nodeId: string; kind: NodeKind }) {
  const edges = useFlowStore(selectActiveEdges);
  const readOnly = useFlowStore(selectActiveReadOnly);
  const addConnectedNode = useFlowStore((state) => state.addConnectedNode);
  const upstreamFull = edges.filter((edge) => edge.target === nodeId).length >= NODE_SPECS[kind].inputs;

  const add = (nextKind: NodeKind, direction: ConnectedNodeDirection) => {
    const addedId = addConnectedNode(nodeId, nextKind, direction);
    if (!addedId) return;
    requestCanvasLanding({
      tabId: useFlowStore.getState().activeTabId,
      nodeId: addedId,
      fitView: false,
      activateFilePicker: nextKind === "image-input",
      selectText: nextKind !== "image-input" && nextKind !== "result",
    });
  };

  const groups = [
    { label: "快速添加上游", direction: "upstream" as const, kinds: UPSTREAM_SUGGESTIONS[kind], disabled: upstreamFull },
    { label: "快速添加下游", direction: "downstream" as const, kinds: DOWNSTREAM_SUGGESTIONS[kind], disabled: false },
  ].filter((group) => group.kinds.length > 0);
  if (groups.length === 0) return null;

  return (
    <section aria-label="快捷建图" className="space-y-2 border-t border-[var(--gc-border)] pt-3">
      <p className="text-[10px] font-medium text-[var(--gc-text-muted)]">快捷建图</p>
      {groups.map((group) => (
        <div key={group.direction} className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-neutral-600">
            <span>{group.label}</span>
            {group.disabled && <span>输入已满</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.kinds.map((nextKind) => {
              const productPolicy = nodeProductPolicy(nextKind);
              const disabled = readOnly || group.disabled || !productPolicy.canCreate;
              return (
                <button
                  key={nextKind}
                  type="button"
                  disabled={disabled}
                  title={!productPolicy.canCreate ? productPolicy.reason : undefined}
                  onClick={() => add(nextKind, group.direction)}
                  className="rounded-md border border-[var(--gc-border)] bg-[var(--gc-panel-soft)] px-2 py-1 text-[10px] text-[var(--gc-text-muted)] transition-colors hover:border-[var(--gc-accent)] hover:text-[var(--gc-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {group.direction === "upstream" ? "← " : "+ "}{NODE_SPECS[nextKind].title}
                  {!productPolicy.canCreate && " · unsupported"}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-[10px] leading-relaxed text-neutral-600">新增节点与连线属于同一次撤销操作。</p>
    </section>
  );
}

function PropertyEditor({ nodeId }: { nodeId: string }) {
  const activeNodes = useFlowStore(selectActiveNodes);
  const activeEdges = useFlowStore(selectActiveEdges);
  const node = activeNodes.find((candidate) => candidate.id === nodeId);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const updateEdgeReferenceRole = useFlowStore((s) => s.updateEdgeReferenceRole);
  const documentTarget = useFlowStore(useShallow(selectActiveDocumentTarget));
  const moveReferenceEdgeInTab = useFlowStore((s) => s.moveReferenceEdgeInTab);
  const removeReferenceEdgeInTab = useFlowStore((s) => s.removeReferenceEdgeInTab);
  const runNode = useFlowStore((s) => s.runNode);
  const readOnly = useFlowStore(selectActiveReadOnly);
  const labelEdit = useCoalescedTextEdit({ kind: "node-data", nodeId, field: "label" });
  const promptEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId, field: "prompt" },
    { multiline: true },
  );
  const noteEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId, field: "note" },
    { multiline: true },
  );
  if (!node) return null;
  const d = node.data;
  const spec = NODE_SPECS[d.kind];
  const productPolicy = nodeProductPolicy(d.kind);
  const selectedModelId: GenerationImageModelId | undefined =
    "modelId" in d && isImageModelId(d.modelId) && d.modelId !== "gpt-image-2" ? d.modelId : undefined;
  const selectedModelOptions = "modelOptions" in d && typeof d.modelOptions === "object" && d.modelOptions !== null
    ? d.modelOptions as ImageModelOptions
    : undefined;
  const operationMode: ImageOperationMode | undefined =
    "operationMode" in d
    && typeof d.operationMode === "string"
    && IMAGE_OPERATION_MODE_VALUES.includes(d.operationMode as ImageOperationMode)
      ? d.operationMode as ImageOperationMode
      : undefined;
  const incomingReferenceState = promptRunReferenceSnapshotsFromGraph(
    activeNodes,
    activeEdges,
    nodeId,
  );
  const referenceRows = promptRunBrowserReferencesFromGraph(activeNodes, activeEdges, nodeId);
  const modelParameterError = selectedModelId && operationMode
    ? imageModelOptionsErrorForOperation(
        selectedModelId,
        selectedModelOptions ?? {},
        operationMode,
      )
    : undefined;
  const promptAdmission = spec.providerId
    ? evaluatePromptRunAdmission(promptRunAdmissionInputFromNode(d, incomingReferenceState))
    : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-200">{spec.title}</span>
        <span className="text-[10px] text-neutral-500">{STATUS_TEXT[d.status]}</span>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">节点名称</span>
        <input
          value={d.label}
          {...labelEdit.bind}
          className={inputClass}
        />
      </label>

      {!productPolicy.paidRunAllowed && (
        <section
          aria-label="节点产品支持状态"
          data-product-support="unsupported"
          className="rounded-md border border-amber-700/50 bg-amber-950/25 p-2 text-[10px] leading-relaxed text-amber-300"
        >
          <p className="font-medium uppercase tracking-wide">unsupported · 首版暂不支持</p>
          <p className="mt-0.5">{productPolicy.reason}</p>
        </section>
      )}

      {d.kind === "sketch-to-render" && (
        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">操作模式（固定写入任务）</span>
          <select
            value={d.operationMode}
            disabled={readOnly || isNodeRunActive(d.status)}
            onChange={(event) => updateNodeData(nodeId, {
              operationMode: event.target.value as "generate" | "edit",
              operationModeNeedsConfirmation: false,
              promptVariantId: undefined,
              promptFamilyId: undefined,
              parameterProfileId: undefined,
              contractHash: undefined,
              evaluationVersion: undefined,
              postprocessVersion: undefined,
            })}
            className={inputClass}
          >
            <option value="generate">文生图（不接受参考图）</option>
            <option value="edit">参考图编辑（至少 1 张）</option>
          </select>
          {d.operationModeNeedsConfirmation && (
            <span className="text-[10px] leading-relaxed text-amber-500">旧项目模式无法可靠推断，请确认后再运行。</span>
          )}
        </label>
      )}
      {d.kind === "ai-modify" && (
        <p className="text-[10px] text-neutral-500">操作模式：参考图编辑（节点固定）</p>
      )}

      {spec.providerId && referenceRows.length > 0 && (
        <ReferenceRoleSummary
          references={referenceRows}
          disabled={readOnly || isNodeRunActive(d.status)}
          onRoleChange={(reference, role) => {
            const edge = activeEdges.find((candidate) => candidate.id === reference.edgeId);
            if (edge) updateEdgeReferenceRole(edge.id, role);
          }}
          onMove={(reference, direction) => {
            if (reference.edgeId) moveReferenceEdgeInTab(documentTarget, reference.edgeId, direction);
          }}
          onRemove={(reference) => {
            if (reference.edgeId) removeReferenceEdgeInTab(documentTarget, reference.edgeId);
          }}
        />
      )}

      {(d.kind === "sketch-to-render" || d.kind === "ai-modify" || d.kind === "fabric-recolor") && (
        <div className="space-y-2">
          <label className="block space-y-1">
            <span className="text-[10px] text-neutral-500">提示词</span>
            <textarea
              value={d.prompt}
              {...promptEdit.bind}
              rows={12}
              className={`${inputClass} resize-none`}
            />
            <span className="text-[10px] text-neutral-600">每条入边的参考角色必须确认；可连接最多 8 张参考图，按连线顺序传入</span>
          </label>
          {(d.kind === "sketch-to-render" || d.kind === "ai-modify") && (
            <PromptPresetPicker
              key={`${selectedModelId ?? "none"}:${d.operationMode}`}
              currentPrompt={d.prompt}
              currentAspectRatio={d.aspectRatio}
              currentBatchSize={d.batchSize}
              currentModelOptions={selectedModelOptions}
              modelId={selectedModelId}
              nodeKind={d.kind}
              operationMode={d.operationMode}
              references={incomingReferenceState}
              hasUnconfirmedReferences={incomingReferenceState.some((reference) => reference.roleNeedsConfirmation)}
              disabled={readOnly || isNodeRunActive(d.status)}
              onApply={({ variant, profile, parameters, prompt }) => {
                promptEdit.flush();
                updateNodeData(nodeId, {
                  prompt,
                  aspectRatio: parameters.aspectRatio,
                  batchSize: parameters.batchSize,
                  modelOptions: parameters.modelOptions,
                  promptVariantId: variant.variantId,
                  promptFamilyId: variant.familyId,
                  parameterProfileId: profile.profileId,
                  contractHash: variant.contractHash,
                  evaluationVersion: variant.evaluationVersion,
                  postprocessVersion: profile.postprocess.version,
                });
              }}
            />
          )}
        </div>
      )}

      {(d.kind === "sketch-to-render" || d.kind === "ai-modify") && (
        <div className="grid grid-cols-2 gap-2">
          <label className="block space-y-1">
            <span className="text-[10px] text-neutral-500">画幅比例</span>
            <select
              value={d.aspectRatio}
              onChange={(e) => updateNodeData(
                nodeId,
                imageModelAspectRatioPatch(selectedModelId, selectedModelOptions, e.target.value),
              )}
              className={inputClass}
            >
              {["1:1", "3:4", "4:3", "9:16", "16:9"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] text-neutral-500">生成数量</span>
            <select
              value={d.batchSize}
              onChange={(e) =>
                updateNodeData(nodeId, { batchSize: Number(e.target.value) as 1 | 2 | 4 | 8 })
              }
              className={inputClass}
            >
              {[1, 2, 4, 8].map((n) => (
                <option key={n} value={n}>
                  {n} 张
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {d.kind === "result" && (
        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">备注</span>
          <textarea
            value={d.note ?? ""}
            {...noteEdit.bind}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </label>
      )}

      {spec.providerId && d.kind !== "mask-redraw" && selectedModelId && operationMode && (
        <ModelControls
          nodeId={nodeId}
          modelId={selectedModelId}
          retiredModelId={"retiredModelId" in d && typeof d.retiredModelId === "string" ? d.retiredModelId : undefined}
          modelOptions={selectedModelOptions}
          preferredAspectRatio={"aspectRatio" in d && typeof d.aspectRatio === "string" ? d.aspectRatio : undefined}
          disabled={isNodeRunActive(d.status)}
        />
      )}

      {modelParameterError && (
        <p className="rounded-md border border-amber-800/50 bg-amber-950/20 p-2 text-[10px] leading-relaxed text-amber-400">
          当前模式的模型参数未确认：{modelParameterError}
        </p>
      )}

      {spec.providerId && (
        <RunButton
          status={d.status}
          disabled={
            ("operationModeNeedsConfirmation" in d && d.operationModeNeedsConfirmation === true)
            || Boolean(modelParameterError)
          }
          disabledReason={promptAdmission?.allowed === false ? promptAdmission.reason : undefined}
          disabledLabel={!productPolicy.paidRunAllowed ? "首版暂不支持" : undefined}
          onClick={() => void runNode(nodeId)}
          label="运行此节点"
        />
      )}

      <QuickConnect nodeId={nodeId} kind={d.kind} />
    </div>
  );
}

/** 「最近生成」条目对应的运行记录详情 */
function ResultRecordDetail({ resultId }: { resultId: string }) {
  const record = useFlowStore((s) => s.recentResults.find((r) => r.id === resultId));
  if (!record) return null;
  const time = new Date(record.startedAt).toLocaleTimeString("zh-CN", { hour12: false });
  const duration = (((record.finishedAt ?? Date.now()) - record.startedAt) / 1000).toFixed(1);
  const statusText: Record<RecentResult["status"], string> = {
    queued: "排队中",
    running: "生成中",
    retry_wait: "等待重试",
    cancel_requested: "取消请求中",
    success: "成功",
    error: "失败",
    outcome_unknown: "结果未知",
    cancelled: "已取消",
  };
  const statusColor: Record<RecentResult["status"], string> = {
    queued: "text-yellow-400",
    running: "text-blue-400",
    retry_wait: "text-amber-400",
    cancel_requested: "text-orange-400",
    success: "text-emerald-400",
    error: "text-red-400",
    outcome_unknown: "text-orange-500",
    cancelled: "text-neutral-500",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-200">{record.nodeLabel}</span>
        <span
          className={`text-[10px] ${statusColor[record.status]}`}
        >
          {statusText[record.status]}
        </span>
      </div>

      {record.image && (
        <img
          src={record.thumbnail ?? thumbnailImageUrl(record.image)}
          loading="lazy"
          decoding="async"
          alt={record.nodeLabel}
          className="w-full rounded-md border border-[#262626] object-cover"
        />
      )}

      <dl className="space-y-1.5 text-[10px]">
        <div className="flex justify-between">
          <dt className="text-neutral-500">节点类型</dt>
          <dd className="text-neutral-300">{NODE_SPECS[record.kind].title}</dd>
        </div>
        {record.projectName && (
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-500">项目</dt>
            <dd className="truncate text-neutral-300" title={record.projectName}>
              {record.projectName}
            </dd>
          </div>
        )}
        {record.model && (
          <div className="flex justify-between">
            <dt className="text-neutral-500">模型</dt>
            <dd className="font-mono text-neutral-300">{record.model}</dd>
          </div>
        )}
        {record.providerOutputSize && (
          <div className="flex justify-between">
            <dt className="text-neutral-500">上游实际尺寸</dt>
            <dd className="font-mono text-neutral-300">{record.providerOutputSize}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-neutral-500">时间</dt>
          <dd className="text-neutral-300">
            {time} · {record.finishedAt ? "耗时" : "已等待"} {duration}s
          </dd>
        </div>
      </dl>

      {record.prompt && (
        <div className="space-y-1">
          <span className="text-[10px] text-neutral-500">提示词</span>
          <p className="rounded-md border border-[#262626] bg-[#0f0f0f] px-2 py-1.5 text-[10px] leading-relaxed text-neutral-400">
            {record.prompt}
          </p>
        </div>
      )}

      {record.error && (
        <div className="space-y-1">
          <span className="text-[10px] text-red-400/80">错误信息</span>
          <p className="rounded-md border border-red-900/50 bg-red-950/20 px-2 py-1.5 text-[10px] leading-relaxed text-red-300/90">
            {record.error}
          </p>
        </div>
      )}
    </div>
  );
}

interface InspectorPanelProps {
  className?: string;
  view?: "auto" | "properties" | "result";
}

export function InspectorPanel({ className, view = "auto" }: InspectorPanelProps) {
  const selectedNodeId = useFlowStore(selectActivePrimarySelectedNodeId);
  const selectedResultId = useFlowStore(selectActiveSelectedResultId);
  const showResult = view === "result" || (view === "auto" && Boolean(selectedResultId));

  return (
    <aside
      className={cn(
        "gc-panel flex w-64 shrink-0 flex-col border-l border-[#262626] bg-[#141414]",
        className,
      )}
    >
      <div className="border-b border-[#262626] px-3 py-2.5 text-[10px] font-medium uppercase tracking-widest text-neutral-500">
        {showResult ? "生成记录" : "属性"}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {showResult ? (
          selectedResultId ? (
            <ResultRecordDetail resultId={selectedResultId} />
          ) : (
            <p className="py-4 text-center text-[10px] text-neutral-600">
              选择上方结果查看完整运行记录
            </p>
          )
        ) : selectedNodeId ? (
          <PropertyEditor nodeId={selectedNodeId} />
        ) : (
          <p className="py-4 text-center text-[10px] text-neutral-600">
            点击画布节点查看属性
          </p>
        )}
      </div>
    </aside>
  );
}
