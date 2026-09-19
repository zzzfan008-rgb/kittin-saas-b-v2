import { useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  selectActiveDocumentTarget,
  selectDocumentForTab,
  selectNodeInputImages,
  useFlowStore,
} from "@/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import { isNodeRunActive, type ImageNodeData } from "@/types/workflow";
import { thumbnailImageUrl } from "@/lib/images";
import { apiErrorMessage } from "@/lib/apiErrors";
import { OPEN_ASSET_PICKER_EVENT, type AssetPickerRequest } from "@/lib/overlayEvents";
import { NodeFrame, Developing } from "./NodeFrame";
import { ImageGrid } from "./ImageGrid";
import { MaskEditor } from "./MaskEditor";
import { RefOrdinalBadge } from "./RefOrdinalBadge";
import { useReferenceOrdinal } from "./ReferenceOrdinals";
import { useNodeInspector } from "./NodeInspectorWindow";
import { usePromptRunAdmission } from "@/hooks/usePromptRunAdmission";
import { getGarmentPromptVariantById } from "@/lib/garmentPromptPresets";
import { saveMaskDraft } from "@/lib/maskUpload";
import { beginMaskWork } from "@/store/flowStore";

interface NormalizedUploadResponse {
  id: string;
  url: string;
  mimeType: "image/png" | "image/jpeg";
  width: number;
  height: number;
  byteLength: number;
  normalized: true;
}

async function uploadFile(file: File): Promise<NormalizedUploadResponse> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const res = await fetch("/api/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  const data = await res.json().catch(() => ({})) as Partial<NormalizedUploadResponse> & { error?: string };
  if (!res.ok) throw new Error(apiErrorMessage(res.status, data, `上传失败 HTTP ${res.status}`));
  if (
    data.normalized !== true || typeof data.url !== "string" || !data.url ||
    (data.mimeType !== "image/png" && data.mimeType !== "image/jpeg") ||
    !Number.isInteger(data.width) || !Number.isInteger(data.height) || !Number.isInteger(data.byteLength)
  ) {
    throw new Error("服务端未完成素材标准化，请重试");
  }
  return data as NormalizedUploadResponse;
}

/**
 * v7 图片节点（R8 输入输出同体）：上传图直写 outputImages；生成结果由运行写回。
 * 既是参考图来源（image 出边），也承载产出网格。蒙版由选中变体的 needsMask 声明驱动。
 */
export function ImageNode({ id, data, selected }: NodeProps<Node<ImageNodeData>>) {
  const updateNodeDataInTab = useFlowStore((s) => s.updateNodeDataInTab);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const openViewer = useFlowStore((s) => s.openViewer);
  const documentTarget = useFlowStore(useShallow(selectActiveDocumentTarget));
  const openInspector = useNodeInspector((s) => s.open);
  const uploadRequestRef = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editingMask, setEditingMask] = useState(false);
  const [orderChangedNotice, setOrderChangedNotice] = useState(false);

  const running = isNodeRunActive(data.status);
  const admission = usePromptRunAdmission(id, data);
  const variant = data.promptVariantId ? getGarmentPromptVariantById(data.promptVariantId) : undefined;
  // Q4=A：蒙版能力仅当所选变体声明 needsMask 时启用；目录重写（P2-d）前以 mode 判定。
  const needsMask = variant?.mode === "mask-edit";

  const referenceImages = useFlowStore(
    useShallow((s) => {
      const document = s.tabs.find((tab) => tab.id === s.activeTabId);
      return document ? selectNodeInputImages(document, id) : [];
    }),
  );
  const maskSource = referenceImages[0];

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file || !file.type.startsWith("image/")) return;
      const requestId = ++uploadRequestRef.current;
      const target = selectActiveDocumentTarget(useFlowStore.getState());
      setUploading(true);
      try {
        const upload = await uploadFile(file);
        if (requestId !== uploadRequestRef.current) return;
        // R8：上传图直写 outputImages（覆盖式——上传位语义）。
        updateNodeDataInTab(target, id, { outputImages: [upload.url], status: "success", error: undefined });
      } catch (err) {
        if (requestId !== uploadRequestRef.current) return;
        const message = err instanceof Error ? err.message : String(err);
        updateNodeDataInTab(target, id, { status: "error", error: message || "上传失败，请重试" });
      } finally {
        if (requestId === uploadRequestRef.current) setUploading(false);
      }
    },
    [id, updateNodeDataInTab],
  );

  // Ctrl+V 粘贴（节点被选中时生效）
  useEffect(() => {
    if (!selected) return;
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        void handleFile(file);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [selected, handleFile]);

  // 序号补位一次性提示（inspector.orderChanged，graph-invariants §2b.4）
  const referenceCount = admission.referenceRows.length;
  const previousReferenceCount = useRef(referenceCount);
  useEffect(() => {
    if (previousReferenceCount.current > referenceCount) {
      setOrderChangedNotice(true);
      const timer = window.setTimeout(() => setOrderChangedNotice(false), 4000);
      previousReferenceCount.current = referenceCount;
      return () => window.clearTimeout(timer);
    }
    previousReferenceCount.current = referenceCount;
  }, [referenceCount]);

  const openAssetPicker = useCallback(() => {
    const detail: AssetPickerRequest = {
      target: selectActiveDocumentTarget(useFlowStore.getState()),
      nodeId: id,
    };
    window.dispatchEvent(new CustomEvent(OPEN_ASSET_PICKER_EVENT, { detail }));
  }, [id]);

  const hasUpload = data.outputImages.length > 0;
  const fileInput = (
    <input
      type="file"
      accept="image/*"
      multiple={false}
      aria-label={hasUpload ? "重新上传图片" : "上传图片"}
      className="nodrag nopan absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      onChange={(event) => {
        void handleFile(event.target.files?.[0]);
        event.target.value = "";
      }}
    />
  );

  return (
    <>
      <Handle type="target" position={Position.Left} id="prompt" style={{ top: "30%" }} title="提示词（文本节点）" />
      <Handle type="target" position={Position.Left} id="reference" style={{ top: "70%" }} title="参考图（图片节点）" />
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
        onBodyDoubleClick={(event) => {
          // R-40 §2.1.1：双击节点体打开窗口；阻止冒泡到 renderer 的 dblclick.zoom。
          event.stopPropagation();
          openInspector(id);
        }}
        entryBar={
          <button
            type="button"
            onClick={() => openInspector(id)}
            className="nodrag flex w-full items-center gap-2 rounded-full border border-[var(--gc-border-strong)] bg-[var(--gc-node-inner)] px-3 py-1.5 text-[12px] font-semibold text-[var(--gc-node-text)]"
          >
            ⚙ {variant ? "功能设置" : "选择功能"}
            <span aria-hidden="true" className="ml-auto font-bold text-[var(--gc-accent)]">›</span>
          </button>
        }
      >
        {hasUpload ? (
          <div className="nodrag relative overflow-hidden rounded-[10px] border border-[var(--gc-node-border)]">
            <button
              type="button"
              className="block w-full cursor-zoom-in"
              title="单击查看大图"
              onClick={() => openViewer({ url: data.outputImages[0], title: data.label })}
            >
              <img
                src={thumbnailImageUrl(data.outputImages[0])}
                loading="lazy"
                decoding="async"
                alt="已上传图片"
                className="max-h-40 w-full object-contain bg-[var(--gc-node-inner)]"
              />
            </button>
            {/* R-38 徽标位置：缩略图右上角（选中目标语境由画布层序号订阅提供） */}
            <OrdinalBadgeSlot nodeId={id} />
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`nodrag nopan relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-[10px] border bg-[var(--gc-node-inner)] text-center transition-colors focus-within:ring-2 focus-within:ring-(--gc-accent-deep) ${
              dragOver
                ? "border-gold bg-gold/8 text-gold"
                : "border-[var(--gc-node-border)] text-[var(--gc-node-muted)] hover:border-[var(--gc-text-muted)]"
            }`}
          >
            {fileInput}
            <span className="pointer-events-none font-mono text-[10px] tracking-wider opacity-70">
              {uploading ? "素材处理中…" : "IMAGE · 槽位"}
            </span>
            <span className="pointer-events-none text-[10px] leading-relaxed opacity-50">
              点击 / 拖拽 / Ctrl+V
            </span>
          </div>
        )}
        {hasUpload && (
          <div className="nodrag flex gap-1.5">
            <div className="nodrag nopan relative flex-1 cursor-pointer rounded-md border border-[var(--gc-node-border)] py-1 text-center text-[10px] text-[var(--gc-node-muted)] hover:border-[var(--gc-text-muted)] hover:text-[var(--gc-node-text)] focus-within:border-(--gc-accent-deep) focus-within:ring-2 focus-within:ring-(--gc-accent-deep)">
              {fileInput}
              <span className="pointer-events-none">重新上传</span>
            </div>
            <button
              type="button"
              onClick={openAssetPicker}
              className="flex-1 rounded-md border border-[var(--gc-node-border)] py-1 text-[10px] text-[var(--gc-text-muted)] hover:border-gold/60 hover:text-gold"
            >
              素材库
            </button>
          </div>
        )}
        {admission.referenceRows.length > 0 && (
          <p className="text-[11px] leading-relaxed text-[var(--gc-node-muted)]">
            参考图 {admission.referenceRows.length} 张（按连线顺序；序号见源图右上角）
          </p>
        )}
        {orderChangedNotice && (
          <p role="status" aria-live="polite" className="text-[11px] leading-relaxed text-[var(--gc-warn-text)]">
            顺序已变更，角色对应关系以新顺序为准
          </p>
        )}
        {needsMask && (
          <div className="space-y-1.5 rounded-md border border-[var(--gc-node-border)] bg-[var(--gc-node-inner)] p-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">蒙版（该功能要求）</span>
              <span className="text-[var(--gc-node-muted)]">源：参考图 1</span>
            </div>
            <button
              type="button"
              onClick={() => setEditingMask(true)}
              disabled={!maskSource || running}
              className="nodrag w-full rounded-md border border-[var(--gc-node-border)] px-3 py-1.5 text-xs text-[var(--gc-node-text)] hover:border-gold/60 hover:text-gold disabled:opacity-40"
            >
              {data.mask ? "编辑蒙版" : "绘制蒙版"}
            </button>
            {!data.mask && (
              <p className="text-[11px] text-[var(--gc-warn-text)]">该功能需要先涂蒙版</p>
            )}
          </div>
        )}
        {running && <Developing />}
        <ImageGrid images={data.outputImages} empty={hasUpload ? undefined : "暂无产出（可先上传图片作为输入）"} />
      </NodeFrame>
      <Handle type="source" position={Position.Right} title="输出图片" />
      {editingMask && maskSource && (
        <MaskEditor
          source={maskSource}
          initialMask={data.maskSourceRef === maskSource ? data.mask : undefined}
          featherRadius={typeof data.featherRadius === "number" ? data.featherRadius : undefined}
          onClose={() => setEditingMask(false)}
          onSave={async (mask) => {
            const releaseUploadPending = beginMaskWork();
            const state = useFlowStore.getState();
            const target = selectActiveDocumentTarget(state);
            const tab = selectDocumentForTab(state, target.tabId);
            try {
              if (!tab || tab.readOnly || !tab.nodes.some((node) => node.id === id)) {
                throw new Error(tab?.readOnly ? "只读项目不能保存蒙版" : "当前节点已关闭，请重新打开项目后再试");
              }
              await saveMaskDraft({
                dataUrl: mask,
                sourceRef: maskSource,
                projectId: tab.projectId,
                nodeId: id,
              }, {
                commit: (url) => {
                  const current = useFlowStore.getState();
                  const currentTab = selectDocumentForTab(current, target.tabId);
                  if (
                    !currentTab || currentTab.readOnly ||
                    !currentTab.nodes.some((node) => node.id === id) ||
                    selectNodeInputImages(currentTab, id)[0] !== maskSource
                  ) {
                    throw new Error("原图已变化，旧蒙版未覆盖当前节点，请基于新原图重新绘制");
                  }
                  updateNodeDataInTab(target, id, { mask: url, maskSourceRef: maskSource, error: undefined });
                },
                close: () => setEditingMask(false),
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

/** 序号徽标订阅位：由画布层提供 (选中目标, 本源图) 的派生序号。 */
function OrdinalBadgeSlot({ nodeId }: { nodeId: string }) {
  const ordinal = useReferenceOrdinal(nodeId);
  if (ordinal === null) return null;
  return <RefOrdinalBadge ordinal={ordinal} />;
}
