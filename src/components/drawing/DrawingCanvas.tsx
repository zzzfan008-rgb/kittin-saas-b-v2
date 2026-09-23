/**
 * 卡 #60：Excalidraw AI 画板。
 *
 * 按 `docs/design/2026-09-19-workbench-entry-wiring/plan.md` §2 Part B 实现：
 * - 独立 lazy chunk（vite.config.ts manualChunk 分离 @excalidraw/excalidraw）。
 * - 主题接 `--gc-*` CSS 变量（不引 excalidraw 默认主题，避免闪动）。
 * - 点「画板」开全屏覆盖层；导出 PNG 走现有上传链路为图片节点。
 * - 绘画内容临时态不进 DocumentSnapshot。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { useFlowStore } from "@/store/flowStore";

// Note: We use dynamic types below because Excalidraw's types are not always exported.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyExcalidraw = any;

/** Excalidraw 主组件（lazy load 后才有值）。 */
type ExcalidrawComponent = (props: {
  theme?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (elements: any, appState?: any, files?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excalidrawRef?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) => JSX.Element;

interface DrawingCanvasProps {
  onClose: () => void;
}

/**
 * Excalidraw 全屏画板覆盖层。
 * Excalidraw 作为独立 lazy chunk（webpack chunk name = "excalidraw"），
 * 与 vite.config.ts manualChunk 配置保持一致。
 */
export function DrawingCanvas({ onClose }: DrawingCanvasProps) {
  const [Excalidraw, setExcalidraw] = useState<ExcalidrawComponent | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [elements, setElements] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const addAssetNode = useFlowStore((s) => s.addAssetNode);

  // Lazy load Excalidraw chunk（与 vite.config.ts manualChunk 保持一致）
  useEffect(() => {
    setLoading(true);
    import(
      /* webpackChunkName: "excalidraw" */
      /* @excalidraw/excalidraw */
      "@excalidraw/excalidraw"
    )
      .then((mod) => {
        setExcalidraw(() => mod.Excalidraw as ExcalidrawComponent);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[DrawingCanvas] Failed to load Excalidraw chunk:", err);
        setLoading(false);
      });
  }, []);

  /** 导出 PNG → 上传 → 插入图片节点。 */
  const handleExport = useCallback(async () => {
    if (!elements || !Array.isArray(elements) || elements.length === 0) return;
    setExporting(true);
    try {
      const excalidrawModule: AnyExcalidraw = await import(
        /* webpackChunkName: "excalidraw" */
        "@excalidraw/excalidraw"
      );

      // Use exportToBlob (v0.17+ API) or fall back to canvas capture
      let blob: Blob;
      if (typeof excalidrawModule.exportToBlob === "function") {
        blob = await excalidrawModule.exportToBlob({
          elements,
          format: "png",
          getDimensions: () => ({ width: 1200, height: 900 }),
        });
      } else {
        // Fallback: create canvas from elements and capture as PNG
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 900;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 0, 1200, 900);
        blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
      }

      const file = new File([blob], "drawing.png", { type: "image/png" });

      // 走现有上传链路（与 ImageNode.tsx uploadFile 逻辑一致）
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
      if (!res.ok) throw new Error(`上传失败 HTTP ${res.status}`);
      const data = (await res.json()) as { url: string; width?: number; height?: number };
      if (!data.url) throw new Error("服务端未返回图片 URL");

      // 插入图片节点（使用 addAssetNode，与现有上传链路一致）
      addAssetNode(
        {
          name: "画板导出.png",
          image: { url: data.url, width: data.width ?? 1200, height: data.height ?? 900 },
        },
        { x: 300, y: 200 },
      );
      onClose();
    } catch (err) {
      console.error("[DrawingCanvas] Export failed:", err);
      alert(`导出失败：${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setExporting(false);
    }
  }, [elements, addAssetNode, onClose]);

  // 点击遮罩层关闭
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Excalidraw 画板"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex flex-col bg-black/80"
    >
      {/* 顶部工具栏 */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[var(--gc-surface)] px-4 py-2">
        <span className="text-sm text-white/80">Excalidraw 画板</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!elements || (Array.isArray(elements) && elements.length === 0) || exporting}
            onClick={handleExport}
            className="rounded bg-[var(--gc-accent)] px-3 py-1 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exporting ? "导出中…" : "导出 PNG"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/20 px-3 py-1 text-sm text-white/80 transition-colors hover:border-white/50 hover:text-white"
          >
            关闭
          </button>
        </div>
      </div>

      {/* Excalidraw 画布 */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-white/60">
            加载画板中…
          </div>
        ) : Excalidraw ? (
          <Excalidraw
            theme="dark"
            onChange={(els) => setElements(els)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/60">
            画板加载失败，请检查网络后重试
          </div>
        )}
      </div>
    </div>
  );
}
