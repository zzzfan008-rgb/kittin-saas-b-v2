/**
 * R-94 全局图片放大 Lightbox。
 *
 * 与 ImageViewer（查看详情语义，含运行记录侧栏）分离：
 * 任何「点图 = 放大」的场景都打开本组件（lightboxStore），
 * 「查看详情」仍走 ImageViewer。缩放内核统一为 useImageZoom。
 */
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLightboxStore } from "@/store/lightboxStore";
import { useImageZoom, MIN_SCALE, MAX_SCALE } from "@/hooks/useImageZoom";

export function Lightbox() {
  const item = useLightboxStore((s) => s.item);
  const close = useLightboxStore((s) => s.close);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const zoom = useImageZoom({
    containerRef,
    wheelKey: item?.src,
    wheelRectRef: imgRef,
  });

  // 打开新图时：挂载即 fit（图片加载完成后算 fit scale）
  const fitImage = zoom.fitImage;
  useEffect(() => {
    if (!item) return;
    const container = containerRef.current;
    const imgEl = imgRef.current;
    if (!container || !imgEl) return;
    const applyFit = () => fitImage(container, imgEl);
    if (imgEl.complete && imgEl.naturalWidth > 0) {
      applyFit();
    } else {
      imgEl.addEventListener("load", applyFit, { once: true });
      return () => imgEl.removeEventListener("load", applyFit);
    }
  }, [item, item?.src, fitImage]);

  // Esc 关闭
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, close]);

  const handleOverlayClick = useCallback(() => {
    close();
  }, [close]);

  if (!item) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85"
      onClick={handleOverlayClick}
      data-testid="lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt ?? "图片放大预览"}
    >
      {/* 右上 ✕ */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white"
        aria-label="关闭"
      >
        ✕
      </button>

      {/* 操作栏：±按钮 + HUD */}
      <div
        className="absolute left-0 right-0 top-0 z-10 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-label text-white/70">
          <button
            type="button"
            onClick={zoom.zoomOut}
            disabled={zoom.scale <= MIN_SCALE}
            className="flex h-5 w-5 items-center justify-center rounded text-white/70 hover:text-white disabled:opacity-30"
            aria-label="缩小"
          >
            −
          </button>
          <span className="w-12 text-center text-xs">{zoom.hudLabel}</span>
          <button
            type="button"
            onClick={zoom.zoomIn}
            disabled={zoom.scale >= MAX_SCALE}
            className="flex h-5 w-5 items-center justify-center rounded text-white/70 hover:text-white disabled:opacity-30"
            aria-label="放大"
          >
            +
          </button>
        </div>
        <span className="text-label text-white/50">
          双击{zoom.hudLabel === "适合画布" ? "切换100%" : "适合画布"} · Esc 关闭
        </span>
        {item.alt && (
          <span className="ml-auto max-w-[40%] truncate text-label text-white/60">
            {item.alt}
          </span>
        )}
      </div>

      {/* 图片容器（滚轮 + 拖拽平移）；图片上的交互 stopPropagation，空白处点击关闭 */}
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-center justify-center overflow-hidden p-8"
        onDoubleClick={(e) => {
          e.stopPropagation();
          const imgEl = imgRef.current;
          if (imgEl && containerRef.current) {
            zoom.handleDoubleClick(e, containerRef.current, imgEl);
          }
        }}
        onMouseDown={zoom.handleMouseDown}
        onMouseMove={zoom.handleMouseMove}
        onMouseUp={zoom.handleMouseUp}
        onMouseLeave={zoom.handleMouseUp}
        style={{ cursor: zoom.cursor }}
      >
        <img
          ref={imgRef}
          src={item.src}
          alt={item.alt ?? "图片放大预览"}
          draggable={false}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          style={{
            transform: `translate(${zoom.panOffset.x}px, ${zoom.panOffset.y}px) scale(${zoom.scale})`,
            transformOrigin: "center center",
            transition: zoom.isPanningRef.current ? "none" : "transform 0.1s ease",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* HUD pill：点击适合画布 */}
      <button
        type="button"
        className="zoom-hud"
        onClick={(e) => {
          e.stopPropagation();
          const imgEl = imgRef.current;
          if (containerRef.current && imgEl) {
            zoom.fitImage(containerRef.current, imgEl);
          }
        }}
        title="点击适合画布"
        aria-label={`当前缩放：${zoom.hudLabel}，点击适合画布`}
      >
        {zoom.hudLabel}
      </button>
    </div>,
    document.body,
  );
}
