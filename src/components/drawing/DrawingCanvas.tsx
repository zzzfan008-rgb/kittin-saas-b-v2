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
import type { ComponentType } from "react";
import "@excalidraw/excalidraw/index.css";
import { useFlowStore } from "@/store/flowStore";

interface DrawingCanvasProps {
  onClose: () => void;
}

/** Excalidraw 元素的最小公共接口（避免 `typeof import("@excalidraw/excalidraw")` 被 Rollup 当作静态依赖）。 */
interface ExcalidrawElement {
  readonly id: string;
  readonly type: string;
  [key: string]: unknown;
}

/** Excalidraw onChange 回调：元素数组 + appState + files。 */
type ExcalidrawOnChange = (
  elements: readonly ExcalidrawElement[],
  appState: Record<string, unknown>,
  files: Record<string, unknown>,
) => void;

/** Excalidraw 组件的 props 子集（我们只传 theme + onChange）。 */
interface ExcalidrawComponentProps {
  theme?: string;
  onChange?: ExcalidrawOnChange;
  [key: string]: unknown;
}

type ExcalidrawComponentType = React.ComponentType<ExcalidrawComponentProps>;

/** ExcalidrawModule 的运行时形状（仅 exportToBlob / Excalidraw）。 */
interface ExcalidrawRuntimeModule {
  Excalidraw: ExcalidrawComponentType;
  exportToBlob?: (opts: {
    elements: readonly ExcalidrawElement[];
    format: string;
    getDimensions: () => { width: number; height: number };
  }) => Promise<Blob>;
}

/**
 * Excalidraw 全屏画板覆盖层。
 * Excalidraw 作为独立 lazy chunk（webpack chunk name = "excalidraw"），
 * 与 vite.config.ts manualChunk 配置保持一致。
 */
export function DrawingCanvas({ onClose }: DrawingCanvasProps) {
  const [ExcalidrawComp, setExcalidrawComp] = useState<ExcalidrawComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState<readonly ExcalidrawElement[] | null>(null);
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
        setExcalidrawComp(
          () => mod.Excalidraw as ExcalidrawComponentType,
        );
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
      const excalidrawModule = await import(
        /* webpackChunkName: "excalidraw" */
        "@excalidraw/excalidraw"
      ) as ExcalidrawRuntimeModule;

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

      // 插入图片节点（Asset.image 是 string，与 resultActions.ts 的 continueWithResult 一致）
      addAssetNode(
        { name: "画板导出.png", image: data.url },
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
            className="rounded bg-gold px-3 py-1 text-sm font-medium text-[var(--gc-accent-cta-ink)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
        ) : ExcalidrawComp ? (
          <ExcalidrawComp
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