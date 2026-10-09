import { useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  beginMaskWork,
  patchTab,
  runWithoutHistory,
  selectActiveDocumentTarget,
  selectActiveProjectName,
  selectActiveReadOnly,
  selectDocumentForTab,
  selectNodeInputImages,
  useFlowStore,
} from "@/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import type { ImageNodeData } from "@/types/workflow";
import { thumbnailImageUrl } from "@/lib/images";
import { apiErrorMessage } from "@/lib/apiErrors";
import { assetNameFromUpload, saveImageToModelLibrary } from "@/lib/assetSave";
import { saveMaskDraft } from "@/lib/maskUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { OPEN_ASSET_PICKER_EVENT, type AssetPickerRequest } from "@/lib/overlayEvents";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { NodeFrame } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { MaskEditor } from "./MaskEditor";
import { MultiRoundEditPanel } from "./MultiRoundEditPanel";
import { RefOrdinalBadge } from "./RefOrdinalBadge";
import { useReferenceOrdinal } from "./ReferenceOrdinals";
import { duplicateNode } from "./nodeDuplicate";

/**
 * v9 输入层图片节点（65b 蒙版入口迁入）：
 * 只做上传 / 展示 / 作为参考图来源，**不含**模型、画幅、数量与运行按钮；
 * 全部生成语义归 image-generator（生成层）。
 * 工具条：[裁剪] [抠图] [蒙版] [复制] [替换]。
 * 上传入口可勾选「存入数字模特库」。
 */

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

export function ImageNode({ id, data, selected }: NodeProps<Node<ImageNodeData>>) {
  const updateNodeDataInTab = useFlowStore((s) => s.updateNodeDataInTab);
  const openViewer = useFlowStore((s) => s.openViewer);
  const runImageEdit = useFlowStore((s) => s.runImageEdit);
  const readOnly = useFlowStore(selectActiveReadOnly);
  const uploadRequestRef = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saveToModelLibrary, setSaveToModelLibrary] = useState(false);
  const [libraryState, setLibraryState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [editingMask, setEditingMask] = useState(false);
  const [editingMulti, setEditingMulti] = useState(false);
  // 65d：图片节点本地编辑 —— editPrompt 走与 label/prompt 同一 coalesced 历史通道（IME/撤销安全）。
  const editPromptEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId: id, field: "editPrompt" },
  );
  const editPrompt = data.editPrompt ?? "";

  // 65d v2：保存蒙版草稿（真上传 /api/files/mask + 写 node data.mask/maskSourceRef/featherRadius）。
  // 不关闭编辑页——主按钮「蒙版重绘」保存后由 onRun 发起重绘，次按钮「保存蒙版」只存；
  // 保存成功后 image-node-updated 会把新产物覆盖左图（source 实时响应 outputImages[0]）。
  const persistMaskDraft = useCallback(
    async (mask: string, featherRadius: number | undefined) => {
      const releaseUploadPending = beginMaskWork();
      const state = useFlowStore.getState();
      const target = selectActiveDocumentTarget(state);
      const tab = selectDocumentForTab(state, target.tabId);
      try {
        if (!tab || tab.readOnly || !tab.nodes.some((node) => node.id === id)) {
          throw new Error(tab?.readOnly ? "只读项目不能保存蒙版" : "当前节点已关闭，请重新打开项目后再试");
        }
        const sourceRef = data.outputImages[0];
        await saveMaskDraft(
          {
            dataUrl: mask,
            sourceRef,
            projectId: tab.projectId,
            nodeId: id,
          },
          {
            commit: (url) => {
              const current = useFlowStore.getState();
              const currentTab = selectDocumentForTab(current, target.tabId);
              if (
                !currentTab ||
                currentTab.readOnly ||
                !currentTab.nodes.some((node) => node.id === id) ||
                (currentTab.nodes.find((node) => node.id === id)?.data as ImageNodeData | undefined)?.outputImages?.[0] !== sourceRef
              ) {
                throw new Error("原图已变化，旧蒙版未覆盖当前节点，请基于新原图重新绘制");
              }
              // 65b/65d v2：蒙版写入图片节点 data（非生成节点）；featherRadius 随蒙版写入
              // （自适应 = undefined，自定义 = 0–64，server 按契约自适应/固定判定）。
              updateNodeDataInTab(target, id, { mask: url, maskSourceRef: sourceRef, featherRadius, error: undefined });
            },
            close: () => {},
          },
        );
      } finally {
        releaseUploadPending();
      }
    },
    [id, data.outputImages, updateNodeDataInTab],
  );

  // 作为参考图来源时的序号（派生视图，永不持久化）。
  const referenceCount = useFlowStore(
    useShallow((s) => {
      const document = s.tabs.find((tab) => tab.id === s.activeTabId);
      return document ? selectNodeInputImages(document, id).length : 0;
    }),
  );

  const storeToModelLibrary = useCallback(
    async (image: string, fileName: string, requestId: number) => {
      setLibraryState("saving");
      setLibraryError(null);
      try {
        await saveImageToModelLibrary({
          name: assetNameFromUpload(fileName, data.label),
          image,
          sourceNote: `来自项目「${selectActiveProjectName(useFlowStore.getState())}」的图片上传`,
        });
        if (requestId !== uploadRequestRef.current) return;
        setLibraryState("saved");
      } catch (err) {
        if (requestId !== uploadRequestRef.current) return;
        setLibraryError(err instanceof Error ? err.message : String(err));
        setLibraryState("error");
      }
    },
    [data.label],
  );

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (readOnly || !file || !file.type.startsWith("image/")) return;
      const requestId = ++uploadRequestRef.current;
      const target = selectActiveDocumentTarget(useFlowStore.getState());
      setUploading(true);
      try {
        const upload = await uploadFile(file);
        if (requestId !== uploadRequestRef.current) return;
        // 上传位语义：覆盖式写入 outputImages；蒙版随图片重置清除。
        updateNodeDataInTab(target, id, {
          outputImages: [upload.url],
          status: "success",
          error: undefined,
          mask: undefined,
          maskSourceRef: undefined,
          featherRadius: undefined,
        });
        if (saveToModelLibrary) void storeToModelLibrary(upload.url, file.name, requestId);
      } catch (err) {
        if (requestId !== uploadRequestRef.current) return;
        const message = err instanceof Error ? err.message : String(err);
        updateNodeDataInTab(target, id, { status: "error", error: message || "上传失败，请重试" });
      } finally {
        if (requestId === uploadRequestRef.current) setUploading(false);
      }
    },
    [id, readOnly, saveToModelLibrary, storeToModelLibrary, updateNodeDataInTab],
  );

  // Ctrl+V 粘贴（节点被选中时生效）
  useEffect(() => {
    if (!selected || readOnly) return;
    const onPaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find((candidate) =>
        candidate.type.startsWith("image/"),
      );
      if (file) {
        event.preventDefault();
        void handleFile(file);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleFile, readOnly, selected]);

  const openAssetPicker = useCallback(() => {
    const detail: AssetPickerRequest = {
      target: selectActiveDocumentTarget(useFlowStore.getState()),
      nodeId: id,
    };
    window.dispatchEvent(new CustomEvent(OPEN_ASSET_PICKER_EVENT, { detail }));
  }, [id]);

  const hasUpload = data.outputImages.length > 0;
  const hasMask = typeof data.mask === "string" && data.mask.length > 0;

  const renderFileInput = (variant: "slot" | "replace") => (
    <input
      type="file"
      accept="image/*"
      multiple={false}
      disabled={readOnly}
      tabIndex={variant === "replace" ? -1 : undefined}
      aria-label={hasUpload ? "重新上传图片" : "上传图片"}
      className={`nodrag nopan absolute inset-0 h-full w-full cursor-pointer opacity-0 ${
        variant === "replace" ? "z-0" : "z-10"
      }`}
      onChange={(event) => {
        void handleFile(event.target.files?.[0]);
        event.target.value = "";
      }}
    />
  );

  const modelLibraryOption = (
    <div className="nodrag nopan flex items-center justify-between gap-2 text-label text-[var(--gc-node-muted)]">
      <label className="flex items-center gap-2">
        <Checkbox
          aria-label="存入数字模特库"
          checked={saveToModelLibrary}
          disabled={readOnly}
          onCheckedChange={(checked) => {
            setSaveToModelLibrary(checked === true);
            setLibraryState("idle");
            setLibraryError(null);
          }}
          className="border-[var(--gc-node-border)] data-checked:border-gold data-checked:bg-gold/20 data-checked:text-gold"
        />
        <span>上传时存入数字模特库</span>
      </label>
      {libraryState !== "idle" && (
        <span
          role="status"
          aria-live="polite"
          title={libraryError ?? undefined}
          className={
            libraryState === "error"
              ? "text-[var(--gc-warn-text)]"
              : libraryState === "saved"
                ? "text-gold"
                : undefined
          }
        >
          {libraryState === "saving" ? "存入中…" : libraryState === "saved" ? "已存入" : "存入失败"}
        </span>
      )}
    </div>
  );

  return (
    <>
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
        toolbar={
          <NodeToolbar
            kind="image"
            selected={selected}
            actions={{
              crop: {
                disabled: true,
                disabledReason: "暂不可用：图片裁剪能力尚未接入",
              },
              matting: {
                disabled: true,
                disabledReason: "暂不可用：抠图能力尚未接入",
              },
              mask: {
                onSelect: () => setEditingMask(true),
                disabled: !hasUpload || readOnly,
                disabledReason: !hasUpload ? "请先上传图片后再绘制蒙版" : "只读项目不能编辑蒙版",
                label: hasMask ? "编辑蒙版" : "蒙版",
              },
              "multi-edit": {
                // 65d v2：打开多轮修改专属编辑页（标记→合成→editInputRef 合成 run）。
                // fail-closed（裁决 §4.4 第一层前端禁用）：带蒙版时禁用——mask 与
                // editInputRef 并存会让 dag 的 primary 错误指向合成图污染 mask 路径；
                // server 层另有 imageEditGate 400 与 dag DagError 兜底。
                onSelect: () => setEditingMulti(true),
                disabled: !hasUpload || readOnly || hasMask,
                disabledReason: !hasUpload
                  ? "请先上传图片后再使用多轮修改"
                  : hasMask
                    ? "已有蒙版时请用蒙版重绘"
                    : "只读项目不能多轮修改",
              },
              copy: {
                onSelect: () => void duplicateNode(id),
                disabled: readOnly,
                disabledReason: "只读项目不能新增节点",
              },
              replace: {
                onSelect: () => {
                  const input = document.querySelector<HTMLInputElement>(
                    `.react-flow__node[data-id="${CSS.escape(id)}"] input[type="file"]`,
                  );
                  input?.click();
                },
                disabled: readOnly,
                disabledReason: "只读项目不能替换图片",
              },
            }}
          />
        }
      >
        {hasUpload ? (
          <div className="nodrag relative overflow-hidden rounded-[10px] border border-[var(--gc-node-border)]">
            <button
              type="button"
              className="relative z-10 block w-full cursor-zoom-in"
              title="单击查看大图"
              onClick={() => openViewer({ url: data.outputImages[0], title: data.label })}
            >
              <img
                src={thumbnailImageUrl(data.outputImages[0])}
                loading="lazy"
                decoding="async"
                alt="已上传图片"
                className="max-h-40 w-full bg-[var(--gc-node-inner)] object-contain"
              />
            </button>
            {renderFileInput("replace")}
            <OrdinalBadgeSlot nodeId={id} />
          </div>
        ) : (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              void handleFile(event.dataTransfer.files?.[0]);
            }}
            className={`nodrag nopan relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-[10px] border bg-[var(--gc-node-inner)] text-center transition-colors focus-within:ring-2 focus-within:ring-(--gc-accent-deep) ${
              dragOver
                ? "border-gold bg-gold/8 text-gold"
                : "border-[var(--gc-node-border)] text-[var(--gc-node-muted)] hover:border-[var(--gc-text-muted)]"
            }`}
          >
            {renderFileInput("slot")}
            <span className="pointer-events-none font-mono text-label tracking-wider opacity-70">
              {uploading ? "素材处理中…" : "IMAGE · 槽位"}
            </span>
            <span className="pointer-events-none text-label leading-relaxed opacity-50">
              点击 / 拖拽 / Ctrl+V
            </span>
          </div>
        )}
        {modelLibraryOption}
        {hasUpload && (
          <button
            type="button"
            onClick={openAssetPicker}
            disabled={readOnly}
            className="w-full rounded-md border border-[var(--gc-node-border)] py-1 text-label text-[var(--gc-text-muted)] hover:border-gold/60 hover:text-gold disabled:opacity-40"
          >
            从素材库替换
          </button>
        )}
        {/* 65d v2：本地编辑控件全部迁入专属编辑页（蒙版重绘页 / 多轮修改页），节点上不再内联。 */}
        <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
          {hasUpload
            ? "作为参考图来源：连到生成节点的 reference 输入"
            : "上传图片后可作为参考图来源；生成请用生图节点"}
          {referenceCount > 0 ? `（已被 ${referenceCount} 处引用）` : ""}
        </p>
      </NodeFrame>
      <Handle type="source" position={Position.Right} title="输出图片" />

      {/* 蒙版编辑器（65b：蒙版入口从生成节点面板迁入图片节点） */}
      {/* 蒙版重绘页（65d v2）：右栏约 1/4 宽整合控件；主按钮=保存+重绘且不关闭面板，
          运行期左栏显影中，image-node-updated 覆盖左图后用户手动关闭。 */}
      {editingMask && hasUpload && (
        <MaskEditor
          source={data.outputImages[0]}
          initialMask={
            typeof data.maskSourceRef === "string" && data.maskSourceRef === data.outputImages[0]
              ? data.mask
              : undefined
          }
          featherRadius={
            typeof data.featherRadius === "number" && Number.isFinite(data.featherRadius)
              ? data.featherRadius
              : undefined
          }
          editPrompt={editPrompt}
          promptBind={editPromptEdit.bind}
          runStatus={data.status}
          readOnly={readOnly}
          onClose={() => {
            // 65d R-87 §2.4 补充决策：用户画了 mask 但没点重绘就关面板，下次打开会带残留蒙版。
            // 决策：做——关闭时清 mask 三字段（node data 层；不删文件本体）。
            const state = useFlowStore.getState();
            const target = selectActiveDocumentTarget(state);
            const tab = target ? selectDocumentForTab(state, target.tabId) : undefined;
            if (!tab) { setEditingMask(false); return; }
            const node = tab.nodes.find((n) => n.id === id) as (typeof tab.nodes)[number] | undefined;
            if (node && (node.data as ImageNodeData).mask != null) {
              runWithoutHistory(() =>
                patchTab(useFlowStore.setState, target!.tabId, {
                  nodes: tab.nodes.map((n) =>
                    n.id !== id
                      ? n
                      : { ...n, data: { ...n.data, mask: undefined, maskSourceRef: undefined, featherRadius: undefined } },
                  ),
                }),
              );
            }
            setEditingMask(false);
          }}
          onSaveDraft={persistMaskDraft}
          onRun={async (mask, featherRadius) => {
            await persistMaskDraft(mask, featherRadius);
            // 保存成功 → 发起局部重绘 run。flush 后从 store 读最新 editPrompt
            //（防 coalesced 200ms debounce 窗口内读到旧值）；不传 opts，store 内部置空 editInputRef。
            editPromptEdit.flush();
            const current = useFlowStore.getState();
            const fresh = (selectDocumentForTab(current, selectActiveDocumentTarget(current).tabId)
              ?.nodes.find((node) => node.id === id)?.data as ImageNodeData | undefined)?.editPrompt ?? "";
            void runImageEdit(id, fresh.trim());
          }}
        />
      )}
      {/* 多轮修改页（65d v2）：标记→合成→edit-draft→runImageEdit(editInputRef)；
          多轮状态客户端自管理（面板内记录条）；fail-closed：带蒙版时工具条已禁用。 */}
      {editingMulti && hasUpload && (
        <MultiRoundEditPanel
          baseSource={data.outputImages[0]}
          projectId={
            selectDocumentForTab(useFlowStore.getState(), selectActiveDocumentTarget(useFlowStore.getState()).tabId)?.projectId ?? ""
          }
          nodeId={id}
          readOnly={readOnly}
          hasMask={hasMask}
          editPrompt={editPrompt}
          promptBind={editPromptEdit.bind}
          readFreshPrompt={() => {
            editPromptEdit.flush();
            const current = useFlowStore.getState();
            return (selectDocumentForTab(current, selectActiveDocumentTarget(current).tabId)
              ?.nodes.find((node) => node.id === id)?.data as ImageNodeData | undefined)?.editPrompt ?? "";
          }}
          runStatus={data.status}
          onRun={(editInputRef) => {
            // flush 后从 store 读最新 editPrompt，作为合成 run 的 editPrompt。
            editPromptEdit.flush();
            const current = useFlowStore.getState();
            const fresh = (selectDocumentForTab(current, selectActiveDocumentTarget(current).tabId)
              ?.nodes.find((node) => node.id === id)?.data as ImageNodeData | undefined)?.editPrompt ?? "";
            void runImageEdit(id, fresh.trim(), { editInputRef });
          }}
          onClose={() => setEditingMulti(false)}
        />
      )}
    </>
  );
}

function OrdinalBadgeSlot({ nodeId }: { nodeId: string }) {
  const ordinal = useReferenceOrdinal(nodeId);
  if (ordinal === null) return null;
  return <RefOrdinalBadge ordinal={ordinal} />;
}