import { useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  selectActiveDocumentTarget,
  selectActiveProjectName,
  selectActiveReadOnly,
  selectNodeInputImages,
  useFlowStore,
} from "@/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import type { ImageNodeData } from "@/types/workflow";
import { thumbnailImageUrl } from "@/lib/images";
import { apiErrorMessage } from "@/lib/apiErrors";
import { assetNameFromUpload, saveImageToModelLibrary } from "@/lib/assetSave";
import { Checkbox } from "@/components/ui/checkbox";
import { OPEN_ASSET_PICKER_EVENT, type AssetPickerRequest } from "@/lib/overlayEvents";
import { NodeFrame } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { RefOrdinalBadge } from "./RefOrdinalBadge";
import { useReferenceOrdinal } from "./ReferenceOrdinals";
import { duplicateNode } from "./nodeDuplicate";

/**
 * v8 输入层图片节点（plan.md §1、data-model.md §3）：
 * 只做上传 / 展示 / 作为参考图来源，**不含**模型、画幅、数量、蒙版与运行按钮；
 * 全部生成语义归 image-generator（生成层）。
 * 工具条（plan.md §3.2）：[裁剪] [抠图] [复制] [替换]。
 * 上传入口可勾选「存入数字模特库」（asset-library-model.md §5）：勾选后本次上传的图片
 * 同时以 category="model" 存入素材库；勾选状态是节点本地 UI 状态，不进入文档数据。
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
  const readOnly = useFlowStore(selectActiveReadOnly);
  const uploadRequestRef = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  /** 勾选后本次上传的图片同时存入素材库「数字模特」分类（category="model"）。 */
  const [saveToModelLibrary, setSaveToModelLibrary] = useState(false);
  /** 入库的三态：idle 未入库 / saving 入库中 / saved 已入库 / error 入库失败（上传本身仍成功）。 */
  const [libraryState, setLibraryState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [libraryError, setLibraryError] = useState<string | null>(null);

  // 作为参考图来源时的序号（派生视图，永不持久化）。
  const referenceCount = useFlowStore(
    useShallow((s) => {
      const document = s.tabs.find((tab) => tab.id === s.activeTabId);
      return document ? selectNodeInputImages(document, id).length : 0;
    }),
  );

  /**
   * 入库到数字模特库：与上传解耦——入库失败只标记入库状态，
   * 不回写节点 status/error（图片已经上传成功，不能被辅助动作覆盖成失败）。
   */
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
        // 上传位语义：覆盖式写入 outputImages。
        updateNodeDataInTab(target, id, { outputImages: [upload.url], status: "success", error: undefined });
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
  /**
   * 节点内的真实文件选择器（视觉隐藏，由点击槽位 / 工具条「替换」触发）。
   * slot：空槽位时盖在最上层，同时接管点击、拖放与 Tab 停靠。
   * replace：已有图片时退到缩略图下方，只作「替换」的程序化入口——
   *          不抢占缩略图的单击看大图，也不新增不可见的 Tab 停靠点。
   */
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

  /** 上传入口的入库选项（asset-library-model.md §5）：控制本次上传是否同时进数字模特库。 */
  const modelLibraryOption = (
    <div className="nodrag nopan flex items-center justify-between gap-2 text-label text-[var(--gc-node-muted)]">
      <label className="flex items-center gap-2">
        <Checkbox
          aria-label="存入数字模特库"
          checked={saveToModelLibrary}
          disabled={readOnly}
          onCheckedChange={(checked) => {
            setSaveToModelLibrary(checked === true);
            // 目标库变了，允许对下一张上传图重新入库
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
            {/* 选择器排在缩略图之后：z-0 让缩略图保持可点，DOM 顺序让焦点落地仍先命中缩略图按钮。 */}
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
        <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
          {hasUpload
            ? "作为参考图来源：连到生成节点的 reference 输入"
            : "上传图片后可作为参考图来源；生成请用生图节点"}
          {referenceCount > 0 ? `（已被 ${referenceCount} 处引用）` : ""}
        </p>
      </NodeFrame>
      <Handle type="source" position={Position.Right} title="输出图片" />
    </>
  );
}

/** 序号徽标订阅位：由画布层提供 (选中目标, 本源图) 的派生序号。 */
function OrdinalBadgeSlot({ nodeId }: { nodeId: string }) {
  const ordinal = useReferenceOrdinal(nodeId);
  if (ordinal === null) return null;
  return <RefOrdinalBadge ordinal={ordinal} />;
}
