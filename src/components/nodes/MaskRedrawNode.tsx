import { useEffect, useMemo, useRef, useState } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  beginMaskWork,
  selectActiveEdges,
  selectActiveDocumentTarget,
  selectActiveNodeInputImages,
  selectActiveNodes,
  selectActiveReadOnly,
  selectDocumentForTab,
  selectNodeInputImages,
  useFlowStore,
} from "@/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import {
  isNodeRunActive,
  type MaskRedrawNodeData,
} from "@/types/workflow";
import { Developing, inputClass, NodeFrame, RunButton } from "./NodeFrame";
import { ImageGrid } from "./ImageGrid";
import { MaskEditor } from "./MaskEditor";
import { thumbnailImageUrl } from "@/lib/images";
import { maskRedrawReadiness } from "@/lib/maskRedraw";
import { saveMaskDraft } from "@/lib/maskUpload";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { usePromptRunAdmission } from "@/hooks/usePromptRunAdmission";
import { ReferenceRoleSummary } from "./ReferenceRoleSummary";
import {
  promptRunReferenceRoleProfile,
  promptRunReferenceSnapshotsFromGraph,
} from "@/lib/promptRunAdmission";
import {
  buildGarmentPrompt,
} from "@/lib/garmentPromptPresets";
import { getRuntimePromptVariantAvailability } from "@/lib/promptEvaluationRelease";
import {
  getModelParameterProfile,
  materializeModelParameterProfile,
} from "@/types/modelParameterProfiles";

export function MaskRedrawNode({ id, data, selected }: NodeProps<Node<MaskRedrawNodeData>>) {
  const [editing, setEditing] = useState(false);
  const [promptRequired, setPromptRequired] = useState(false);
  const [presetPending, setPresetPending] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const updateNodeDataInTab = useFlowStore((state) => state.updateNodeDataInTab);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const updateEdgeReferenceRole = useFlowStore((state) => state.updateEdgeReferenceRole);
  const documentTarget = useFlowStore(useShallow(selectActiveDocumentTarget));
  const moveReferenceEdgeInTab = useFlowStore((state) => state.moveReferenceEdgeInTab);
  const removeReferenceEdgeInTab = useFlowStore((state) => state.removeReferenceEdgeInTab);
  const runNode = useFlowStore((state) => state.runNode);
  const readOnly = useFlowStore(selectActiveReadOnly);
  const activeNodes = useFlowStore(selectActiveNodes);
  const activeEdges = useFlowStore(selectActiveEdges);
  const source = useFlowStore((state) => selectActiveNodeInputImages(state, id)[0]);
  const running = isNodeRunActive(data.status);
  const admission = usePromptRunAdmission(id, data);
  const presetReferenceRoleProfile = useMemo(() => promptRunReferenceRoleProfile({
    nodeKind: "mask-redraw",
    operationMode: "mask-edit",
    references: promptRunReferenceSnapshotsFromGraph(activeNodes, activeEdges, id),
  }), [activeEdges, activeNodes, id]);
  const presetAvailability = getRuntimePromptVariantAvailability(
    {
      familyId: "mask-local-edit",
      modelId: "gpt-image-2",
      nodeKind: "mask-redraw",
      mode: "mask-edit",
    },
    { referenceRoleProfile: presetReferenceRoleProfile },
  );
  const presetVariant = presetAvailability.variant;
  const presetProfile = presetVariant
    ? getModelParameterProfile(presetVariant.parameterProfileId)
    : undefined;
  const readiness = maskRedrawReadiness({
    source,
    mask: data.mask,
    maskSourceRef: data.maskSourceRef,
    prompt: data.prompt,
  });
  const staleMask = Boolean(data.mask && source && !readiness.hasCurrentMask);
  const editorVisible = editing && Boolean(source);
  const promptEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId: id, field: "prompt" },
    { multiline: true },
  );

  useEffect(() => {
    if (!editorVisible) return;
    return beginMaskWork();
  }, [editorVisible]);

  useEffect(() => {
    if (!presetAvailability.enabled || running || readOnly) setPresetPending(false);
  }, [presetAvailability.enabled, readOnly, running]);

  const run = () => {
    if (!readiness.canSubmit) {
      setPromptRequired(true);
      promptRef.current?.focus();
      return;
    }
    setPromptRequired(false);
    void runNode(id);
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <NodeFrame nodeId={id} title={data.label} status={data.status} error={data.error} selected={selected}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-500">图片模型</span>
          <span className="font-mono text-neutral-300">gpt-image-2</span>
        </div>
        {admission.referenceRows.length > 0 && (
          <ReferenceRoleSummary
            references={admission.referenceRows}
            disabled={running || readOnly}
            onRoleChange={(reference, role) => {
              if (reference.edgeId) updateEdgeReferenceRole(reference.edgeId, role);
            }}
            onMove={(reference, direction) => {
              if (reference.edgeId) moveReferenceEdgeInTab(documentTarget, reference.edgeId, direction);
            }}
            onRemove={(reference) => {
              if (reference.edgeId) removeReferenceEdgeInTab(documentTarget, reference.edgeId);
            }}
          />
        )}
        <p className="rounded-md border border-[#2b2b2b] bg-[#111] px-2.5 py-2 text-[11px] leading-4 text-neutral-500">
          涂抹需要修改的大致区域，再描述要添加、替换或调整的内容。涂抹区不是裁切框，新内容会结合整幅服装自动延展并融合。
        </p>
        <div className="space-y-1 rounded-md border border-[#2b2b2b] bg-[#111] p-2">
          <button
            type="button"
            disabled={!presetAvailability.enabled || !presetVariant || !presetProfile || running || readOnly}
            aria-describedby={!presetAvailability.enabled ? `${id}-mask-preset-reason` : undefined}
            onClick={() => setPresetPending(true)}
            className="nodrag w-full rounded-md border border-[#333] px-2 py-1.5 text-[11px] text-neutral-300 hover:border-gold/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            应用 GPT Image 2 局部修改专轨
          </button>
          {!presetAvailability.enabled && (
            <p id={`${id}-mask-preset-reason`} className="text-[11px] leading-relaxed text-amber-400">{presetAvailability.reason}</p>
          )}
          {presetPending && presetVariant && presetProfile && (
            <div aria-live="polite" className="space-y-1.5 rounded-md border border-amber-700/50 bg-amber-950/20 p-2 text-[11px] text-amber-200">
              <p>将写入独立提示词变体、契约哈希、参数档案与后处理版本；模型仍为 gpt-image-2，业务画幅跟随来源图片。</p>
              <dl className="space-y-0.5">
                <div><dt>提示词变体</dt><dd className="break-all font-mono text-neutral-200">{presetVariant.variantId}</dd></div>
                <div><dt>参数档案</dt><dd className="break-all font-mono text-neutral-200">{presetProfile.profileId}</dd></div>
              </dl>
              <div className="space-y-0.5">
                <p>提示词预览</p>
                <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words rounded border border-amber-800/60 bg-black/20 p-1.5 font-sans leading-relaxed text-neutral-200">{buildGarmentPrompt(presetVariant.variantId, data.prompt)}</pre>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={!presetAvailability.enabled || running || readOnly}
                  onClick={() => {
                    promptEdit.flush();
                    const parameters = materializeModelParameterProfile(presetProfile);
                    updateNodeData(id, {
                      prompt: buildGarmentPrompt(presetVariant.variantId, data.prompt),
                      modelOptions: parameters.modelOptions,
                      promptVariantId: presetVariant.variantId,
                      promptFamilyId: presetVariant.familyId,
                      parameterProfileId: presetProfile.profileId,
                      contractHash: presetVariant.contractHash,
                      evaluationVersion: presetVariant.evaluationVersion,
                      postprocessVersion: presetProfile.postprocess.version,
                    });
                    setPresetPending(false);
                  }}
                  className="rounded border border-amber-500/60 px-2 py-1"
                >
                  确认应用
                </button>
                <button type="button" onClick={() => setPresetPending(false)} className="rounded border border-[#555] px-2 py-1">
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
        {source ? (
          <img
            src={thumbnailImageUrl(source)}
            alt="蒙版原图"
            className="aspect-4/3 w-full rounded-md border border-[#262626] object-contain"
          />
        ) : (
          <div className="flex aspect-4/3 items-center justify-center rounded-md border border-dashed border-[#333] text-[11px] text-neutral-600">
            连接需要局部修改的图片
          </div>
        )}
        <label className="block space-y-1">
          <span className="text-[11px] text-neutral-500">修改说明</span>
          <textarea
            ref={promptRef}
            value={data.prompt}
            {...promptEdit.bind}
            onChange={(event) => {
              const prompt = event.target.value;
              promptEdit.updateValue(prompt);
              if (prompt.trim()) setPromptRequired(false);
            }}
            rows={4}
            placeholder="如：将选中区域改成银色金属拉链"
            aria-invalid={promptRequired}
            aria-describedby={promptRequired ? `${id}-prompt-required` : undefined}
            className={`${inputClass} resize-none ${promptRequired ? "border-red-500" : ""}`}
          />
          {promptRequired && (
            <span id={`${id}-prompt-required`} className="block text-[11px] text-red-400">
              请先填写需要如何修改选中区域
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={!source || running || readOnly}
          className="nodrag w-full rounded-md border border-[#333] px-3 py-1.5 text-xs text-neutral-300 hover:border-gold/60 hover:text-gold disabled:opacity-40"
        >
          {data.mask && !staleMask ? "编辑蒙版" : "绘制蒙版"}
        </button>
        {staleMask && <p className="text-[11px] text-orange-400">原图已变化，请重新绘制蒙版</p>}
        <RunButton
          status={data.status}
          onClick={run}
          label="生成局部修改"
          disabled={!readiness.canOpenRunAction}
          disabledReason={admission.allowed ? undefined : admission.reason}
        />
        {running && <Developing />}
        <ImageGrid images={data.outputImages} />
      </NodeFrame>
      <Handle type="source" position={Position.Right} />
      {editing && source && (
        <MaskEditor
          source={source}
          initialMask={data.maskSourceRef === source ? data.mask : undefined}
          onClose={() => setEditing(false)}
          onSave={async (mask) => {
            const releaseUploadPending = beginMaskWork();
            const state = useFlowStore.getState();
            const target = selectActiveDocumentTarget(state);
            const tab = selectDocumentForTab(state, target.tabId);
            try {
              if (!tab || tab.readOnly || !tab.nodes.some((node) => node.id === id)) {
                throw new Error(tab?.readOnly ? "只读项目不能保存蒙版" : "当前蒙版节点已关闭，请重新打开项目后再试");
              }
              await saveMaskDraft({
                dataUrl: mask,
                sourceRef: source,
                projectId: tab.projectId,
                nodeId: id,
              }, {
                commit: (url) => {
                  const current = useFlowStore.getState();
                  const currentTab = selectDocumentForTab(current, target.tabId);
                  const targetStillMatches = currentTab?.projectId === target.projectId &&
                    currentTab.documentEpoch === target.documentEpoch;
                  if (!targetStillMatches || !currentTab || currentTab.readOnly || !currentTab.nodes.some((node) => node.id === id)) {
                    throw new Error(currentTab?.readOnly ? "只读项目不能保存蒙版" : "当前蒙版节点已关闭，请重新打开项目后再试");
                  }
                  if (selectNodeInputImages(currentTab, id)[0] !== source) {
                    throw new Error("原图已变化，旧蒙版未覆盖当前节点，请基于新原图重新绘制");
                  }
                  updateNodeDataInTab(target, id, { mask: url, maskSourceRef: source, error: undefined });
                },
                close: () => setEditing(false),
              });
            } finally {
              releaseUploadPending();
            }
          }}
        />
      )}
    </>
  );
}
