import { useCallback, useEffect, useRef, useState } from "react";
import { selectActiveCompareIds, useFlowStore } from "@/store/flowStore";
import { thumbnailImageUrl } from "@/lib/images";
import { useGenerationSafetyBlockReason } from "@/store/generationSafety";
import { normalizeReferenceImageEvidence } from "@/lib/referenceEvidence";
import { saveImageAsAsset } from "@/lib/assetSave";
import { continueWithResult, toggleResultCompare } from "@/lib/resultActions";
import { nodeSpecForKind, nodeTitleForKind } from "@/types/workflow";
import { Checkbox } from "@/components/ui/checkbox";
import { useImageZoom, MIN_SCALE, MAX_SCALE } from "@/hooks/useImageZoom";

export function ReferenceEvidenceList({
  images,
  evidence,
}: {
  images: readonly string[];
  evidence: unknown;
}) {
  const normalizedEvidence = normalizeReferenceImageEvidence(evidence, images.length);
  return (
    <div className="mt-4">
      <p className="text-label text-[var(--gc-text-muted)]">参考图 · {images.length} 张</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {images.map((image, index) => {
          const item = normalizedEvidence[index]!;
          const stateLabel = item.evidenceState === "confirmed"
            ? "已确认"
            : item.evidenceState === "legacy" ? "历史证据，待复核" : "证据不可用，待复核";
          return (
            <div key={`${image}-${index}`} className="min-w-0">
              <img
                src={thumbnailImageUrl(image)}
                alt={`参考图 ${item.order + 1}`}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full rounded-sm border border-[var(--gc-border)] object-cover"
              />
              <p className="mt-1 truncate text-label text-[var(--gc-text-muted)]">
                参考图 {item.order + 1} · {stateLabel}
              </p>
              {item.sourceNodeId && (
                <p className="truncate text-label text-[var(--gc-text-muted)]">来源：{item.sourceNodeId}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 全局图片查看器：滚轮缩放（25%–400%）、双击锚点切换、±按钮、拖拽平移、适合画布默认。
 * 侧边栏从 ResultRecordDetail 迁移全部字段，并新增「节点类型」和「上游实际尺寸」。
 */
export function ImageViewer() {
  const viewer = useFlowStore((s) => s.viewer);
  const record = useFlowStore((s) => (
    s.viewer?.resultId
      ? s.recentResults.find((item) => item.id === s.viewer?.resultId)
      : undefined
  ));
  const closeViewer = useFlowStore((s) => s.closeViewer);
  const compareIds = useFlowStore(selectActiveCompareIds);
  const activeTabReadOnly = useFlowStore(
    (s) => s.tabs.find((tab) => tab.id === s.activeTabId)?.readOnly ?? false,
  );

  // R-89 §D 缩放状态：共用 useImageZoom hook（MaskEditor + ImageViewer 共用同一实现）
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerImgRef = useRef<HTMLImageElement>(null);
  const zoom = useImageZoom({ containerRef: viewerContainerRef, wheelKey: viewer?.url, wheelRectRef: viewerImgRef });

  // 辅助
  const generationSafetyBlockReason = useGenerationSafetyBlockReason();
  const unsupportedKind = record !== undefined && !nodeSpecForKind(record.kind);
  const comparing = record ? compareIds.includes(record.id) : false;

  if (!viewer) return null;

  const providerOriginals = record?.providerImages?.length
    ? record.providerImages
    : record?.providerImage ? [record.providerImage] : [];

  const statusText: Record<string, string> = {
    queued: "排队中", running: "生成中", retry_wait: "等待重试",
    cancel_requested: "取消请求中", success: "成功", error: "失败",
    outcome_unknown: "结果未知", cancelled: "已取消",
  };
  const statusColor: Record<string, string> = {
    queued: "text-[var(--gc-status-queued)]",
    running: "text-[var(--gc-status-running)]",
    retry_wait: "text-[var(--gc-status-retry)]",
    cancel_requested: "text-[var(--gc-status-retry)]",
    success: "text-[var(--gc-status-success)]",
    error: "text-[var(--gc-status-error)]",
    outcome_unknown: "text-[var(--gc-status-unknown)]",
    cancelled: "text-[var(--gc-status-idle)]",
  };

  // 键盘 Esc
  useEffect(() => {
    if (!viewer) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); closeViewer(); }
    };
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [viewer, closeViewer]);

  // 保存资产
  const [assetState, setAssetState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveToModelLibrary, setSaveToModelLibrary] = useState(false);

  useEffect(() => {
    zoom.resetScale(1);
    setAssetState("idle");
    setSaveToModelLibrary(false);
  }, [viewer?.url]);

  const saveAsAsset = async () => {
    setAssetState("saving");
    try {
      await saveImageAsAsset({
        name: `${record?.nodeLabel ?? viewer.title ?? "生成素材"}-${new Date().toLocaleDateString("zh-CN")}`,
        category: saveToModelLibrary ? "model" : "reference",
        image: viewer.url,
        sourceNote: record?.projectName ? `来自项目「${record.projectName}」` : "来自生成记录",
      });
      setAssetState("saved");
    } catch {
      setAssetState("error");
    }
  };

  // 重新生成
  const runAgain = () => {
    if (!record || generationSafetyBlockReason) return;
    const store = useFlowStore.getState();
    const tab = store.tabs.find((item) => item.projectId === record.projectId);
    if (!tab || !tab.nodes.some((node) => node.id === record.nodeId)) return;
    store.switchTab(tab.id);
    closeViewer();
    window.setTimeout(() => void useFlowStore.getState().runNode(record.nodeId), 0);
  };

  // 加入/取消对比（走共享 resultActions，与结果卡片同一实现）
  const toggleCompare = () => {
    if (!record) return;
    toggleResultCompare(record.id);
  };

  // 设为输入（走共享 resultActions，与结果卡片同一实现）
  const handleContinueWithResult = () => {
    if (!record) return;
    continueWithResult(record);
    closeViewer();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-stretch bg-black/85"
      onClick={closeViewer}
    >
      {/* 左侧图片区 */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* 操作栏：±按钮 + 提示 */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-label text-white/70">
            <button type="button" onClick={zoom.zoomOut} disabled={zoom.scale <= MIN_SCALE} className="flex h-5 w-5 items-center justify-center rounded text-white/70 hover:text-white disabled:opacity-30" aria-label="缩小">−</button>
            <span className="w-12 text-center text-xs">{zoom.hudLabel}</span>
            <button type="button" onClick={zoom.zoomIn} disabled={zoom.scale >= MAX_SCALE} className="flex h-5 w-5 items-center justify-center rounded text-white/70 hover:text-white disabled:opacity-30" aria-label="放大">+</button>
          </div>
          <span className="text-label text-white/50">
            双击{zoom.hudLabel === "适合画布" ? "切换100%" : "适合画布"} · Esc 关闭
          </span>
        </div>

        {/* 图片容器（滚轮 + 拖拽平移） */}
        <div
          ref={viewerContainerRef}
          id="viewer-image-area"
          className="relative flex flex-1 items-center justify-center overflow-hidden p-8"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            const imgEl = viewerContainerRef.current?.querySelector("img") as HTMLImageElement | null;
            if (imgEl) zoom.handleDoubleClick(e, viewerContainerRef.current!, imgEl);
          }}
          onMouseDown={zoom.handleMouseDown}
          onMouseMove={zoom.handleMouseMove}
          onMouseUp={zoom.handleMouseUp}
          onMouseLeave={zoom.handleMouseUp}
          style={{ cursor: zoom.cursor }}
        >
          <img
            ref={viewerImgRef}
            src={viewer.url}
            alt={viewer.title ?? "图片预览"}
            draggable={false}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            style={{
              transform: `translate(${zoom.panOffset.x}px, ${zoom.panOffset.y}px) scale(${zoom.scale})`,
              transformOrigin: "center center",
              transition: zoom.isPanningRef.current ? "none" : "transform 0.1s ease",
            }}
          />
        </div>

        {/* 缩放指示器 pill（右下角） */}
        <button
          type="button"
          className="zoom-hud"
          onClick={(e) => {
            e.stopPropagation();
            const imgEl = viewerContainerRef.current?.querySelector("img") as HTMLImageElement | null;
            if (viewerContainerRef.current && imgEl) zoom.fitImage(viewerContainerRef.current, imgEl);
          }}
          title="点击适合画布"
          aria-label={`当前缩放：${zoom.hudLabel}，点击适合画布`}
        >
          {zoom.hudLabel}
        </button>
      </div>

      {/* 侧边栏 */}
      <aside className="w-[420px] shrink-0 overflow-y-auto border-l border-[var(--gc-border)] bg-[var(--gc-panel)]/98 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-[var(--gc-text)]">{record?.nodeLabel ?? viewer.title ?? "生成结果"}</h2>
            <p className="mt-1 text-label text-[var(--gc-text-muted)]">{record?.projectName ?? "当前项目"}</p>
          </div>
          <button type="button" onClick={closeViewer} className="text-sm text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]" aria-label="关闭">✕</button>
        </div>

        {/* 从 ResultRecordDetail 迁移的字段 */}
        <dl className="mt-5 space-y-2 border-y border-[var(--gc-border)] py-4 text-label">
          {[
            ["状态", record ? <span className={statusColor[record.status] ?? ""}>{statusText[record.status] ?? record.status}</span> : "—"],
            ["节点类型", record ? nodeTitleForKind(record.kind) : "—"],
            ["模型", record?.model ?? "—"],
            ["数量", record?.requestedCount ? `${record.successfulCount ?? 0}/${record.requestedCount}` : "—"],
            ["上游实际尺寸", record?.providerOutputSize ?? "—"],
            ["服务请求", record?.providerRequests ?? "—"],
            ["开始时间", record?.startedAt ? new Date(record.startedAt).toLocaleString("zh-CN") : "—"],
            ["耗时", record?.finishedAt && record.startedAt ? `${((record.finishedAt - record.startedAt) / 1000).toFixed(1)}s` : "—"],
          ].map(([label, value]) => <div key={String(label)} className="flex justify-between gap-4"><dt className="text-[var(--gc-text-muted)]">{label}</dt><dd className="text-right text-[var(--gc-text)]">{value}</dd></div>)}
        </dl>

        {/* 提示词 */}
        {(record?.prompt || viewer.prompt) && (
          <div className="mt-4">
            <p className="text-label text-[var(--gc-text-muted)]">提示词</p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg border border-[var(--gc-border)] bg-[var(--gc-control)] p-3 text-body leading-relaxed text-[var(--gc-text)]">
              {record?.prompt ?? viewer.prompt}
            </p>
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(record?.prompt ?? viewer.prompt ?? "")}
              className="mt-2 rounded-sm border border-[var(--gc-border)] px-2 py-1 text-label text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
            >
              复制提示词
            </button>
          </div>
        )}

        {/* Provider 原图 */}
        {providerOriginals.length > 0 && (
          <div className="mt-4">
            <p className="text-label text-[var(--gc-text-muted)]">Provider 原图（业务后处理前）· {providerOriginals.length} 张</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {providerOriginals.map((image, index) => (
                <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" className="block">
                  <img src={thumbnailImageUrl(image)} alt={`Provider 原图 ${index + 1}`} className="max-h-44 rounded-md border border-[var(--gc-border)] object-contain" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 参考图 */}
        {record?.referenceImages && record.referenceImages.length > 0 && (
          <ReferenceEvidenceList images={record.referenceImages} evidence={record.referenceInputs} />
        )}

        {/* 生成参数折叠 */}
        {record?.parameters && Object.keys(record.parameters).length > 0 && (
          <details className="mt-4 rounded-lg border border-[var(--gc-border)] p-3 text-label text-[var(--gc-text-muted)]">
            <summary className="cursor-pointer">生成参数</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all">{JSON.stringify(record.parameters, null, 2)}</pre>
          </details>
        )}

        {/* 错误信息 */}
        {record?.error && (
          <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-body text-red-300">{record.error}</div>
        )}

        {/* 操作区 */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleCompare}
            disabled={!record}
            className="rounded-sm border border-[var(--gc-border)] px-3 py-1.5 text-label text-[var(--gc-text)] disabled:opacity-50"
          >
            {comparing ? "取消对比" : "加入对比"}
          </button>
          <a href={viewer.url} download className="rounded-sm bg-gold px-3 py-1.5 text-label font-medium text-[var(--gc-accent-cta-ink)]">下载图片</a>
          <label className="mr-auto flex items-center gap-2 text-label text-[var(--gc-text)]">
            <Checkbox
              aria-label="存入数字模特库"
              checked={saveToModelLibrary}
              onCheckedChange={(checked) => {
                setSaveToModelLibrary(checked === true);
                setAssetState("idle");
              }}
              className="border-[var(--gc-border)] data-checked:border-gold data-checked:bg-gold/20 data-checked:text-gold"
            />
            <span>存入数字模特库</span>
          </label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void saveAsAsset()}
            disabled={assetState === "saving" || assetState === "saved"}
            className="rounded-sm border border-[var(--gc-border)] px-3 py-1.5 text-label text-[var(--gc-text)] disabled:opacity-60"
          >
            {assetState === "saving" ? "保存中…" : assetState === "saved" ? "已保存" : assetState === "error" ? "保存失败，重试" : saveToModelLibrary ? "存入数字模特库" : "收藏为资产"}
          </button>
          {record && (
            <button
              type="button"
              onClick={runAgain}
              disabled={Boolean(generationSafetyBlockReason) || unsupportedKind}
              title={generationSafetyBlockReason ?? (unsupportedKind ? "该结果来自旧版本，不支持重新生成" : undefined)}
              className="rounded-sm border border-[var(--gc-border)] px-3 py-1.5 text-label text-[var(--gc-text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generationSafetyBlockReason ? "生成暂不可用" : "重新生成"}
            </button>
          )}
          {!activeTabReadOnly && (
            <button
              type="button"
              onClick={handleContinueWithResult}
              disabled={!record}
              title={activeTabReadOnly ? "当前项目只读" : "把该结果作为输入节点放回画布"}
              className="rounded-sm border border-[var(--gc-border)] px-3 py-1.5 text-label text-[var(--gc-text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              设为输入
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
