import { useEffect, useRef, useState } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  beginMaskWork,
  selectActiveDocumentTarget,
  selectActiveNodeInputImages,
  selectActiveReadOnly,
  selectDocumentForTab,
  selectNodeInputImages,
  useFlowStore,
} from "@/store/flowStore";
import {
  isNodeRunActive,
  normalizeMaskCompositeMode,
  type MaskCompositeMode,
  type MaskRedrawNodeData,
} from "@/types/workflow";
import { Developing, inputClass, NodeFrame, RunButton } from "./NodeFrame";
import { ImageGrid } from "./ImageGrid";
import { MaskEditor } from "./MaskEditor";
import { thumbnailImageUrl } from "@/lib/images";
import { maskRedrawReadiness } from "@/lib/maskRedraw";
import { saveMaskDraft } from "@/lib/maskUpload";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";

export function MaskRedrawNode({ id, data, selected }: NodeProps<Node<MaskRedrawNodeData>>) {
  const [editing, setEditing] = useState(false);
  const [promptRequired, setPromptRequired] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const updateNodeDataInTab = useFlowStore((state) => state.updateNodeDataInTab);
  const runNode = useFlowStore((state) => state.runNode);
  const cancelNodeRun = useFlowStore((state) => state.cancelNodeRun);
  const readOnly = useFlowStore(selectActiveReadOnly);
  const source = useFlowStore((state) => selectActiveNodeInputImages(state, id)[0]);
  const running = isNodeRunActive(data.status);
  const maskMode = normalizeMaskCompositeMode(data.maskMode);
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

  const run = () => {
    if (!readiness.canSubmit) {
      setPromptRequired(true);
      promptRef.current?.focus();
      return;
    }
    setPromptRequired(false);
    void runNode(id);
  };

  const selectMaskMode = (nextMode: MaskCompositeMode) => {
    if (readOnly || running || nextMode === maskMode) return;
    const target = selectActiveDocumentTarget(useFlowStore.getState());
    updateNodeDataInTab(target, id, { maskMode: nextMode });
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <NodeFrame nodeId={id} title={data.label} status={data.status} error={data.error} selected={selected}>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-neutral-500">图片模型</span>
          <span className="font-mono text-neutral-300">gpt-image-2</span>
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] text-neutral-500">处理方式</span>
          <div className="grid grid-cols-2 gap-1 rounded-md border border-[#333] bg-[#0f0f0f] p-1" role="group" aria-label="蒙版处理方式">
            {([
              ["preserve", "保持原图", "添加印花、刺绣或装饰，保留底色与光影"],
              ["replace", "替换选区", "改色、去除或重做，选区内容可能整体变化"],
            ] as const).map(([value, label, description]) => (
              <button
                key={value}
                type="button"
                aria-pressed={maskMode === value}
                disabled={readOnly || running}
                onClick={() => selectMaskMode(value)}
                className={`nodrag rounded px-2 py-1.5 text-left text-[10px] transition-colors disabled:opacity-40 ${
                  maskMode === value
                    ? "bg-gold text-ink"
                    : "text-neutral-400 hover:bg-[#1a1a1a] hover:text-neutral-200"
                }`}
              >
                <span className="block font-medium">{label}</span>
                <span className={`mt-0.5 block text-[9px] leading-3 ${maskMode === value ? "text-ink/70" : "text-neutral-600"}`}>
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>
        {source ? (
          <img
            src={thumbnailImageUrl(source)}
            alt="蒙版原图"
            className="aspect-4/3 w-full rounded-md border border-[#262626] object-contain"
          />
        ) : (
          <div className="flex aspect-4/3 items-center justify-center rounded-md border border-dashed border-[#333] text-[10px] text-neutral-600">
            连接需要局部修改的图片
          </div>
        )}
        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">修改说明</span>
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
            <span id={`${id}-prompt-required`} className="block text-[10px] text-red-400">
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
        {staleMask && <p className="text-[10px] text-orange-400">原图已变化，请重新绘制蒙版</p>}
        <RunButton
          status={data.status}
          onClick={run}
          onCancel={() => void cancelNodeRun(id)}
          label="局部重绘"
          disabled={!readiness.canOpenRunAction}
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
