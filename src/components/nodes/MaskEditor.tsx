// 65d v2 蒙版重绘页（契约 v2 §2.2 + 架构师裁决）：
// - 去顶栏，改为「左 stage（原图+涂抹层） + 右栏约 1/4 宽（clamp）」承载全部控件；
//   标题「蒙版重绘」+ 关闭（✕/ESC）在右栏顶部。
// - 主按钮「蒙版重绘」= 保存蒙版（真上传 /api/files/mask）+ 发起局部重绘 run，
//   **不关闭面板**：运行期左栏切「显影中」动效，完成后结果覆盖左图（source 实时响应
//   outputImages[0]），用户手动关闭。次按钮「保存蒙版」只存不执行。
// - 羽化 v2：勾选式自适应（默认勾选 = 未定义 → server adaptiveMaskFeatherRadius）；
//   取消勾选后滑杆 0–64 可调。提交时 featherRadius = 自适应 ? undefined : 滑杆值。
// - 运行期与保存期画布锁定（pointer-events-none），错误显示在右栏状态行。
import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { createLatestMaskLoadGuard } from "@/lib/maskUpload";
import { adaptiveMaskExpansionRadius, adaptiveMaskFeatherRadius } from "@/lib/maskGeometry";
import type { NodeRunStatus } from "@/types/workflow";
import { isNodeRunActive } from "@/types/workflow";
import type { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";

interface MaskEditorProps {
  /** 实时底图（data.outputImages[0]）：运行完成原位替换后本组件重置涂抹层。 */
  source: string;
  initialMask?: string;
  /** 已存羽化宽度（px）；undefined/非有限数 = 自适应（勾选态）。 */
  featherRadius?: number;
  /** editPrompt 渲染值（coalesced 通道当前值，由 ImageNode 持有 hook 传入）。 */
  editPrompt: string;
  /** textarea 事件绑定（IME/撤销安全）。 */
  promptBind: ReturnType<typeof useCoalescedTextEdit>["bind"];
  /** 节点运行状态：active 时左栏显影中 + 画布锁定。 */
  runStatus: NodeRunStatus;
  readOnly?: boolean;
  /** 只保存蒙版（写 node data.mask/featherRadius），不执行。 */
  onSaveDraft: (mask: string, featherRadius: number | undefined) => void | Promise<void>;
  /** 保存蒙版 + 发起局部重绘 run（面板不关闭）。 */
  onRun: (mask: string, featherRadius: number | undefined) => void | Promise<void>;
  onClose: () => void;
}

type BrushMode = "edit" | "preserve";
const MAX_MASK_BYTES = 4 * 1024 * 1024;
const MAX_HISTORY = 12;
/** 羽化滑杆上限（与 maskGeometry.adaptiveMaskFeatherRadius 上界一致）。 */
const FEATHER_MAX = 64;
/** 自适应未勾选时的滑杆默认值（v1 行为中位值）。 */
const FEATHER_DEFAULT = 32;

export function MaskEditor({
  source,
  initialMask,
  featherRadius,
  editPrompt,
  promptBind,
  runStatus,
  readOnly = false,
  onSaveDraft,
  onRun,
  onClose,
}: MaskEditorProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const savingRef = useRef(false);
  const loadGuardRef = useRef(createLatestMaskLoadGuard());
  const snapshotLoadGuardRef = useRef(createLatestMaskLoadGuard());
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<BrushMode>("edit");
  const [brushSize, setBrushSize] = useState(80);
  // 羽化 v2：勾选式自适应（默认开）；取消勾选后滑杆值生效。
  const [featherEnabled, setFeatherEnabled] = useState(() => !(typeof featherRadius === "number" && Number.isFinite(featherRadius)));
  const [featherValue, setFeatherValue] = useState(() =>
    typeof featherRadius === "number" && Number.isFinite(featherRadius)
      ? Math.max(0, Math.min(FEATHER_MAX, Math.round(featherRadius)))
      : FEATHER_DEFAULT,
  );
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const running = isNodeRunActive(runStatus);
  const hasPrompt = editPrompt.trim().length > 0;
  const locked = saving || running || readOnly;

  const renderOverlay = () => {
    const mask = maskRef.current;
    const overlay = overlayRef.current;
    if (!mask || !overlay) return;
    const context = overlay.getContext("2d");
    if (!context) return;
    const selectionLayer = (fillStyle: string) => {
      const layer = document.createElement("canvas");
      layer.width = overlay.width;
      layer.height = overlay.height;
      const layerContext = layer.getContext("2d");
      if (!layerContext) return layer;
      layerContext.fillStyle = fillStyle;
      layerContext.fillRect(0, 0, layer.width, layer.height);
      layerContext.globalCompositeOperation = "destination-out";
      layerContext.drawImage(mask, 0, 0);
      layerContext.globalCompositeOperation = "source-over";
      return layer;
    };
    context.clearRect(0, 0, overlay.width, overlay.height);
    context.globalCompositeOperation = "source-over";
    const maskContext = mask.getContext("2d");
    const pixels = maskContext?.getImageData(0, 0, mask.width, mask.height).data;
    let left = mask.width;
    let right = -1;
    let top = mask.height;
    let bottom = -1;
    if (pixels) {
      for (let offset = 3; offset < pixels.length; offset += 4) {
        if (pixels[offset] > 242) continue;
        const index = (offset - 3) / 4;
        const x = index % mask.width;
        const y = Math.floor(index / mask.width);
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    const extent = right >= left && bottom >= top
      ? { width: right - left + 1, height: bottom - top + 1 }
      : { width: 1, height: 1 };
    const expansionRadius = adaptiveMaskExpansionRadius(overlay.width, overlay.height, extent);
    // 勾选自适应 → 沿用 adaptiveMaskFeatherRadius 预览；取消勾选 → 按滑杆值预览（0 = 硬边）。
    const featherRadiusPreview = featherEnabled
      ? adaptiveMaskFeatherRadius(overlay.width, overlay.height, expansionRadius)
      : Math.max(0, Math.min(FEATHER_MAX, Math.round(featherValue)));
    if (expansionRadius > 0) {
      context.save();
      context.filter = `blur(${Math.max(2, Math.round((expansionRadius + featherRadiusPreview) / 2))}px)`;
      context.drawImage(selectionLayer("rgba(245, 158, 11, 0.3)"), 0, 0);
      context.restore();
    }
    context.drawImage(selectionLayer("rgba(239, 68, 68, 0.48)"), 0, 0);
    context.globalCompositeOperation = "source-over";
  };

  const loadMaskSnapshot = (snapshot: string) => {
    const mask = maskRef.current;
    if (!mask) return;
    const isCurrentLoad = snapshotLoadGuardRef.current.begin();
    const image = new Image();
    image.onload = () => {
      if (!isCurrentLoad()) return;
      const context = mask.getContext("2d");
      if (!context) return;
      context.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, mask.width, mask.height);
      context.drawImage(image, 0, 0, mask.width, mask.height);
      renderOverlay();
    };
    image.src = snapshot;
  };

  const captureMask = () => maskRef.current?.toDataURL("image/png") ?? "";

  const pushUndo = () => {
    const snapshot = captureMask();
    if (!snapshot) return;
    setUndoStack((current) => [...current.slice(-(MAX_HISTORY - 1)), snapshot]);
    setRedoStack([]);
  };

  const initializeCanvases = () => {
    const image = imageRef.current;
    const mask = maskRef.current;
    const overlay = overlayRef.current;
    if (!image || !mask || !overlay || !image.naturalWidth || !image.naturalHeight) return;
    snapshotLoadGuardRef.current.invalidate();
    const isCurrentLoad = loadGuardRef.current.begin();
    setReady(false);
    mask.width = image.naturalWidth;
    mask.height = image.naturalHeight;
    overlay.width = image.naturalWidth;
    overlay.height = image.naturalHeight;
    const context = mask.getContext("2d");
    if (!context) return;
    context.fillStyle = "rgba(255,255,255,1)";
    context.fillRect(0, 0, mask.width, mask.height);
    if (initialMask) {
      const existing = new Image();
      existing.onload = () => {
        if (!isCurrentLoad()) return;
        if (existing.naturalWidth !== mask.width || existing.naturalHeight !== mask.height) {
          setError("已保存蒙版与当前原图尺寸不一致，请重新绘制");
          renderOverlay();
          setReady(true);
          return;
        }
        context.clearRect(0, 0, mask.width, mask.height);
        context.drawImage(existing, 0, 0);
        renderOverlay();
        setReady(true);
      };
      existing.onerror = () => {
        if (!isCurrentLoad()) return;
        setError("无法读取已保存蒙版，请重新绘制");
        renderOverlay();
        setReady(true);
      };
      existing.src = initialMask;
      return;
    }
    renderOverlay();
    setReady(true);
  };

  // 最新闭包存入 ref：useLayoutEffect 只依赖触发值（source/initialMask/羽化值），
  // 经 ref 调用当轮闭包（门禁 no-error-suppression：不得用抑制注释绕过依赖检查）。
  const renderOverlayRef = useRef(renderOverlay);
  renderOverlayRef.current = renderOverlay;
  const initializeCanvasesRef = useRef(initializeCanvases);
  initializeCanvasesRef.current = initializeCanvases;

  useLayoutEffect(() => {
    // source 变化（运行完成换新图）或 initialMask 变化（清空）时使旧回调失效并重置。
    loadGuardRef.current.invalidate();
    snapshotLoadGuardRef.current.invalidate();
    drawingRef.current = false;
    lastPointRef.current = null;
    setReady(false);
    setError(null);
    setUndoStack([]);
    setRedoStack([]);
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth && image.naturalHeight) initializeCanvasesRef.current();
    return () => {
      loadGuardRef.current.invalidate();
      snapshotLoadGuardRef.current.invalidate();
    };
  }, [source, initialMask]);

  // 羽化状态变化 → 重绘预览。
  useLayoutEffect(() => {
    renderOverlayRef.current();
  }, [featherEnabled, featherValue]);

  const pointForEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const drawSegment = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const mask = maskRef.current;
    const overlay = overlayRef.current;
    if (!mask || !overlay) return;
    const maskContext = mask.getContext("2d");
    const overlayContext = overlay.getContext("2d");
    if (!maskContext || !overlayContext) return;
    snapshotLoadGuardRef.current.invalidate();
    for (const [context, target] of [[maskContext, "mask"], [overlayContext, "overlay"]] as const) {
      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = brushSize;
      context.globalCompositeOperation = mode === "edit"
        ? target === "mask" ? "destination-out" : "source-over"
        : target === "mask" ? "source-over" : "destination-out";
      context.strokeStyle = target === "mask" ? "rgba(255,255,255,1)" : "rgba(239,68,68,0.48)";
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.restore();
    }
  };

  const startDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!ready || locked) return;
    snapshotLoadGuardRef.current.invalidate();
    pushUndo();
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointForEvent(event);
    lastPointRef.current = point;
    drawSegment(point, point);
  };

  const continueDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (locked || !drawingRef.current || !lastPointRef.current) return;
    const point = pointForEvent(event);
    drawSegment(lastPointRef.current, point);
    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
    renderOverlay();
  };

  const clearMask = () => {
    if (locked) return;
    snapshotLoadGuardRef.current.invalidate();
    const mask = maskRef.current;
    if (!mask) return;
    pushUndo();
    const context = mask.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "rgba(255,255,255,1)";
    context.fillRect(0, 0, mask.width, mask.height);
    renderOverlay();
  };

  const invertMask = () => {
    if (locked) return;
    snapshotLoadGuardRef.current.invalidate();
    const mask = maskRef.current;
    if (!mask) return;
    pushUndo();
    const temporary = document.createElement("canvas");
    temporary.width = mask.width;
    temporary.height = mask.height;
    temporary.getContext("2d")?.drawImage(mask, 0, 0);
    const context = mask.getContext("2d");
    if (!context) return;
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "rgba(255,255,255,1)";
    context.fillRect(0, 0, mask.width, mask.height);
    context.globalCompositeOperation = "destination-out";
    context.drawImage(temporary, 0, 0);
    context.globalCompositeOperation = "source-over";
    renderOverlay();
  };

  const undo = () => {
    if (locked) return;
    const snapshot = undoStack.at(-1);
    if (!snapshot) return;
    const current = captureMask();
    setUndoStack((stack) => stack.slice(0, -1));
    if (current) setRedoStack((stack) => [...stack.slice(-(MAX_HISTORY - 1)), current]);
    loadMaskSnapshot(snapshot);
  };

  const redo = () => {
    if (locked) return;
    const snapshot = redoStack.at(-1);
    if (!snapshot) return;
    const current = captureMask();
    setRedoStack((stack) => stack.slice(0, -1));
    if (current) setUndoStack((stack) => [...stack.slice(-(MAX_HISTORY - 1)), current]);
    loadMaskSnapshot(snapshot);
  };

  /** 提交羽化值：自适应 → undefined（server 按原图尺寸自适应）；自定义 → 0–64。 */
  const resolvedFeatherRadius = (): number | undefined =>
    featherEnabled ? undefined : Math.max(0, Math.min(FEATHER_MAX, Math.round(featherValue)));

  const encodeMask = async () => {
    const mask = maskRef.current;
    if (!mask) throw new Error("蒙版画布不可用");
    snapshotLoadGuardRef.current.invalidate();
    const blob = await new Promise<Blob>((resolve, reject) => {
      mask.toBlob((value) => value ? resolve(value) : reject(new Error("蒙版编码失败")), "image/png");
    });
    if (blob.size > MAX_MASK_BYTES) throw new Error("蒙版 PNG 超过 4MB，请减少画布尺寸后重试");
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("蒙版读取失败"));
      reader.readAsDataURL(blob);
    });
  };

  /** 次按钮：只保存蒙版（不执行）。 */
  const saveDraft = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    setStatusNote(null);
    try {
      const dataUrl = await encodeMask();
      await onSaveDraft(dataUrl, resolvedFeatherRadius());
      setStatusNote("已保存蒙版");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  /** 主按钮：保存蒙版 + 发起局部重绘 run（面板不关闭，等 image-node-updated 覆盖左图）。 */
  const saveAndRun = async () => {
    if (savingRef.current || running) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);
    setStatusNote(null);
    try {
      const dataUrl = await encodeMask();
      await onRun(dataUrl, resolvedFeatherRadius());
      setStatusNote("已保存蒙版，正在重绘…");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  // ESC 关闭（保存/运行中忽略，防丢帧）。
  useLayoutEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (savingRef.current) return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const disabledRun = !ready || locked || !hasPrompt || readOnly;
  const disabledDraft = !ready || locked || readOnly;

  return createPortal(
    <div className="fixed inset-0 z-100 flex bg-black/70" data-panel="mask-redraw" role="dialog" aria-modal="true" aria-label="蒙版重绘">
      {/* 左 stage：原图 + 涂抹层 + 运行期显影中 */}
      <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden p-4">
        <div className="relative inline-flex max-h-full max-w-full shadow-2xl shadow-black">
          <img
            ref={imageRef}
            src={source}
            alt="蒙版重绘原图"
            onLoad={initializeCanvases}
            onError={() => setError("无法读取原图")}
            className="block max-h-[calc(100vh-32px)] max-w-[calc(100vw-320px)] select-none object-contain"
            draggable={false}
          />
          <canvas
            ref={overlayRef}
            onPointerDown={startDrawing}
            onPointerMove={continueDrawing}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            aria-disabled={locked}
            data-testid="mask-editor-canvas"
            className={`absolute inset-0 h-full w-full touch-none ${ready && !locked ? "cursor-crosshair" : "cursor-wait"} ${locked ? "pointer-events-none" : ""}`}
          />
          <canvas ref={maskRef} className="hidden" />
          {running ? (
            <div
              className="develop-overlay pointer-events-none absolute inset-0 z-10 overflow-hidden"
              data-testid="mask-redraw-developing"
            >
              <div className="develop-gridlines" aria-hidden="true" />
              <div className="develop-scanline" aria-hidden="true" />
              <div className="develop-float">
                <div className="develop-sigil" aria-hidden="true">
                  <span>✦</span>
                </div>
                <div>显影中…</div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* 右栏：约 1/4 宽（clamp），承载全部控件 */}
      <aside
        className="flex h-full w-[clamp(256px,25%,360px)] shrink-0 flex-col border-l border-[var(--gc-border)] bg-[var(--gc-panel)]"
        data-testid="mask-redraw-rail"
      >
        <div className="flex items-center justify-between border-b border-[var(--gc-border)] px-4 py-3">
          <strong className="text-sm font-medium text-[var(--gc-text)]">蒙版重绘</strong>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="关闭"
            title="关闭（ESC）"
            data-testid="mask-redraw-close"
            className="rounded-md border border-[var(--gc-border)] px-2.5 py-1.5 text-xs text-[var(--gc-text)] hover:border-[var(--gc-text-muted)] disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* 绘画工具 */}
          <section className="flex flex-col gap-3" aria-label="绘画工具">
            <div className="flex rounded-md border border-[var(--gc-border)] p-0.5 self-start">
              <ModeButton active={mode === "edit"} label="涂抹修改区" disabled={locked} onClick={() => setMode("edit")} />
              <ModeButton active={mode === "preserve"} label="恢复保留区" disabled={locked} onClick={() => setMode("preserve")} />
            </div>
            <label className="flex items-center gap-2 text-label text-[var(--gc-text-muted)]">
              笔刷
              <input
                type="range" min={8} max={300} step={4} value={brushSize}
                onChange={(event) => setBrushSize(Number(event.target.value))}
                disabled={locked}
                className="min-w-0 flex-1 accent-gold disabled:opacity-40"
              />
              <span className="tabular-nums">{brushSize}px</span>
            </label>
            {/* 羽化行 v2：勾选式自适应 + 滑杆 */}
            <div className="flex flex-col gap-1.5" aria-label="羽化">
              <div className="flex items-center gap-2 text-label text-[var(--gc-text-muted)]">
                <input
                  type="checkbox"
                  id={`mask-feather-adaptive-${source.slice(-24)}`}
                  checked={featherEnabled}
                  disabled={locked}
                  onChange={(event) => setFeatherEnabled(event.currentTarget.checked)}
                  data-testid="mask-redraw-feather"
                  className="accent-gold"
                />
                <label htmlFor={`mask-feather-adaptive-${source.slice(-24)}`}>羽化 · 自适应</label>
                <span className="ml-auto tabular-nums">
                  {featherEnabled ? "自适应" : `${featherValue}px`}
                </span>
              </div>
              <input
                type="range" min={0} max={FEATHER_MAX} value={featherValue}
                disabled={locked || featherEnabled}
                aria-label="羽化宽度"
                className="w-full accent-gold disabled:opacity-40"
                onChange={(event) => {
                  setFeatherEnabled(false);
                  setFeatherValue(Number(event.target.value));
                }}
              />
            </div>
            <div className="flex gap-1">
              <ToolbarButton label="撤销" disabled={locked || !undoStack.length} onClick={undo} />
              <ToolbarButton label="重做" disabled={locked || !redoStack.length} onClick={redo} />
              <ToolbarButton label="清空" disabled={locked} onClick={clearMask} />
              <ToolbarButton label="反选" disabled={locked} onClick={invertMask} />
            </div>
          </section>

          {/* 修改描述 */}
          <section className="flex flex-col gap-1.5" aria-label="修改描述">
            <label htmlFor="mask-redraw-prompt" className="text-xs font-medium text-[var(--gc-text)]">修改描述</label>
            <textarea
              id="mask-redraw-prompt"
              value={editPrompt}
              maxLength={500}
              rows={4}
              placeholder="描述红色区域如何修改，例如：把背景改成米色…"
              className="rounded-md border border-[var(--gc-border)] bg-transparent px-2 py-1.5 text-sm text-[var(--gc-text)] outline-none focus:border-[var(--gc-text-muted)]"
              {...promptBind}
            />
            <span className="text-right text-xs text-[var(--gc-text-muted)]">{editPrompt.length} / 500</span>
          </section>

          {/* 按钮区 */}
          <section className="flex flex-col gap-2" aria-label="执行">
            <button
              type="button"
              onClick={() => void saveAndRun()}
              disabled={disabledRun}
              title={!ready ? "图片还在载入" : locked ? "运行中，请稍候" : readOnly ? "只读项目内不能重绘" : !hasPrompt ? "请先填写修改描述" : ""}
              data-testid="mask-redraw-run"
              className="rounded-md bg-gold px-4 py-2 text-xs font-medium text-[var(--gc-accent-cta-ink)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "保存中…" : running ? "运行中…" : "蒙版重绘"}
            </button>
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={disabledDraft}
              data-testid="mask-redraw-save"
              className="rounded-md border border-[var(--gc-border)] px-4 py-2 text-xs text-[var(--gc-text)] hover:border-[var(--gc-text-muted)] disabled:opacity-40"
            >
              {saving ? "保存中…" : "保存蒙版"}
            </button>
          </section>

          {/* 状态行 + 说明 */}
          <section className="flex flex-col gap-1" aria-live="polite">
            {error ? (
              <p className="text-xs text-red-400" role="alert" data-testid="mask-redraw-error">{error}</p>
            ) : null}
            {statusNote ? (
              <p className="text-xs text-[var(--gc-text-muted)]" data-testid="mask-redraw-note">{statusNote}</p>
            ) : null}
            <p className="text-xs leading-relaxed text-[var(--gc-text-muted)]">
              红色是修改中心，不是裁切框 · 新内容可在金色融合区内完整延展
            </p>
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function ToolbarButton({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="rounded-md border border-[var(--gc-border)] px-2.5 py-1.5 text-label text-[var(--gc-text-muted)] hover:border-gold/50 hover:text-gold disabled:opacity-30">
      {label}
    </button>
  );
}

function ModeButton({ active, label, onClick, disabled = false }: { active: boolean; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`rounded-sm px-3 py-1.5 text-label disabled:opacity-40 ${active ? "bg-gold text-[var(--gc-accent-cta-ink)]" : "text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"}`}>
      {label}
    </button>
  );
}
