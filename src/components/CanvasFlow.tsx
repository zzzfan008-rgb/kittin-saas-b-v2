import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  useNodesInitialized,
  useReactFlow,
  useStoreApi,
  type Connection,
  type FinalConnectionState,
  type NodeChange,
} from "@xyflow/react";
import {
  beginHistoryTransaction,
  documentConnectionRejection,
  endHistoryTransaction,
  ensureTextUpstreamForNode,
  selectActiveEdges,
  selectActiveNodes,
  selectActiveReadOnly,
  selectActiveSelectedNodeIds,
  useFlowStore,
  type FlowNode,
  type HistoryTransactionToken,
} from "@/store/flowStore";
import { DotWaveBackground } from "./DotWaveBackground";
import { PulseEdge } from "./edges/PulseEdge";
import { nodeTypes } from "./nodes";
import { ReferenceOrdinalsProvider } from "./nodes/ReferenceOrdinals";
import { useTheme, type ThemeId } from "@/lib/theme";
import type { NodeKind } from "@/types/workflow";
import {
  CANVAS_LANDING_EVENT,
  consumeCanvasLanding,
  peekCanvasLanding,
  type CanvasLandingIntent,
} from "@/lib/canvasLanding";
import { CanvasZoomControls } from "./CanvasZoomControls";
import { detectDesktopShortcutPlatform } from "@/lib/keyboardShortcuts";
import {
  DOCK_VIEWPORT_WILL_CHANGE_EVENT,
  shiftViewportForWidthChange,
  type DockViewportWillChangeDetail,
} from "@/lib/dockViewport";
import { isNativeActivationTarget } from "@/lib/keyboardActivation";

export const DND_MIME = "application/garment-node";

const edgeTypes = { pulse: PulseEdge };

function isVisibleControl(element: HTMLElement): boolean {
  // offsetParent 为 null 表示 display:none 或不在渲染树中；
  // visibility:hidden 会让 focus() 静默失败，必须跳过。
  if (element.offsetParent === null) return false;
  const style = window.getComputedStyle(element);
  return style.visibility !== "hidden" && style.display !== "none";
}

function landingControl(nodeId: string): HTMLElement | null {
  const node = document.querySelector<HTMLElement>(
    `.react-flow__node[data-id="${CSS.escape(nodeId)}"]`,
  );
  if (!node) return null;
  // 优先 textarea（文本节点的提示词输入框），再考虑其他可聚焦控件。
  // 跳过 visibility:hidden / display:none 的控件（如 opacity-0 的 file input），
  // 否则 focus() 会静默失败，导致「本地偶过 / CI 必挂」的焦点竞态。
  const textareas = Array.from(node.querySelectorAll<HTMLElement>("textarea"));
  for (const textarea of textareas) {
    if (isVisibleControl(textarea)) return textarea;
  }
  const controls = Array.from(
    node.querySelectorAll<HTMLElement>(
      'input[type="file"], input:not([type="hidden"]), select, button',
    ),
  );
  for (const control of controls) {
    if (isVisibleControl(control)) return control;
  }
  return null;
}

/**
 * 把焦点落到新落地节点的首个可聚焦控件上。
 *
 * 不能用 requestAnimationFrame 做重试：无头/未聚焦页面 rAF 会被节流甚至不触发，
 * 导致「本地偶过 / CI 必挂」的焦点竞态。改为同步 layout 读取 + focus + 立即验证，
 * 失败时用 setTimeout(0) 重试（宏任务不受 rAF 节流影响）。
 */
function focusLandingControl(intent: CanvasLandingIntent, attempts = 20): void {
  if (!intent.nodeId) return;
  const control = landingControl(intent.nodeId);
  if (!control) {
    if (attempts > 0) setTimeout(() => focusLandingControl(intent, attempts - 1), 0);
    return;
  }
  // 强制同步 layout，确保 Chromium 在 focus 前已完成样式计算；
  // React 18 concurrent + React Flow 初始化时序下，rAF 回调里的 focus 会被静默吞掉。
  void control.getBoundingClientRect();
  control.focus({ preventScroll: true });
  if (document.activeElement !== control && attempts > 0) {
    setTimeout(() => focusLandingControl(intent, attempts - 1), 0);
    return;
  }
  if (
    intent.selectText &&
    (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)
  ) control.select();
  if (
    intent.activateFilePicker &&
    control instanceof HTMLInputElement &&
    control.type === "file"
  ) control.click();
}

interface DragHistoryTransactionRef {
  current: HistoryTransactionToken | null;
  /** Native drag gesture identity; event.timeStamp is monotonic within the page. */
  startedAt: number | null;
}

const cancelledDragPositionRefs = new WeakSet<DragHistoryTransactionRef>();

/**
 * A tab/load transition can cancel a drag before React Flow emits dragStop.
 * Ignore only late position frames from that old gesture; selection changes
 * remain live, and the suppression ends at the gesture boundary.
 */
export function filterCancelledDragPositionChanges(
  ref: DragHistoryTransactionRef,
  changes: NodeChange<FlowNode>[],
): NodeChange<FlowNode>[] {
  return cancelledDragPositionRefs.has(ref)
    ? changes.filter((change) => change.type !== "position")
    : changes;
}

/**
 * 拖拽被浏览器中断时提交最后可见位置，保留一次可撤销的用户操作。
 * 页签/项目转换的取消与回滚仍由 flowStore 在转换前处理。
 */
export function finishDragHistoryTransaction(
  ref: DragHistoryTransactionRef,
  stoppedAt?: number,
): boolean {
  if (stoppedAt !== undefined && ref.startedAt !== null && stoppedAt < ref.startedAt) {
    return false;
  }
  const token = ref.current;
  cancelledDragPositionRefs.delete(ref);
  ref.startedAt = null;
  if (!token) return false;
  ref.current = null;
  return endHistoryTransaction(token);
}

/** 开始拖拽并让 store 侧的保存/撤销/切页命令能够同步清除本地 token。 */
export function beginDragHistoryTransaction(
  ref: DragHistoryTransactionRef,
  startedAt: number,
): void {
  if (ref.startedAt !== null && startedAt < ref.startedAt) return;
  finishDragHistoryTransaction(ref, startedAt);
  cancelledDragPositionRefs.delete(ref);
  ref.startedAt = startedAt;
  ref.current = beginHistoryTransaction("node-drag", (outcome, settledToken) => {
    if (ref.current !== settledToken) return;
    ref.current = null;
    if (outcome === "cancelled") cancelledDragPositionRefs.add(ref);
  });
}

/** 统一收束 blur、pointercancel 与组件卸载造成的拖拽中断。 */
export function registerDragInterruptionHandlers(
  ref: DragHistoryTransactionRef,
  target: Pick<EventTarget, "addEventListener" | "removeEventListener">,
): () => void {
  const finishOnBlur = () => {
    finishDragHistoryTransaction(ref);
  };
  const finishOnPointerCancel = (event: Event) => {
    finishDragHistoryTransaction(ref, event.timeStamp);
  };
  target.addEventListener("blur", finishOnBlur);
  target.addEventListener("pointercancel", finishOnPointerCancel);
  return () => {
    target.removeEventListener("blur", finishOnBlur);
    target.removeEventListener("pointercancel", finishOnPointerCancel);
    finishDragHistoryTransaction(ref);
  };
}

/** 小地图配色随主题（直接引用 CSS 变量，保证三主题一致） */
const MINIMAP_COLORS: Record<ThemeId, { bg: string; node: string; mask: string }> = {
  current: { bg: "var(--gc-canvas)", node: "var(--gc-border)", mask: "rgba(10,10,10,0.7)" },
  white: { bg: "var(--gc-canvas)", node: "var(--gc-border)", mask: "rgba(29,29,31,0.08)" },
  eye: { bg: "var(--gc-canvas)", node: "var(--gc-border)", mask: "rgba(48,69,43,0.15)" },
};

export function CanvasFlow() {
  const nodes = useFlowStore(selectActiveNodes);
  const edges = useFlowStore(selectActiveEdges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const isValidConnection = useFlowStore((s) => s.isValidConnection);
  const addNode = useFlowStore((s) => s.addNode);
  const setSelectedNodeIds = useFlowStore((s) => s.setSelectedNodeIds);
  const activeTabId = useFlowStore((s) => s.activeTabId);
  const readOnly = useFlowStore(selectActiveReadOnly);
  // 连线被拒的明确反馈（R3：连错线要有反馈，不是静默失败）。
  const [connectionRejection, setConnectionRejection] = useState<string | null>(null);
  const { fitView, getViewport, screenToFlowPosition, setViewport } = useReactFlow();
  const reactFlowStore = useStoreApi();
  const nodesInitialized = useNodesInitialized();
  const [landingVersion, setLandingVersion] = useState(0);
  const [compactMinimap, setCompactMinimap] = useState(false);
  const [theme] = useTheme();
  const minimap = MINIMAP_COLORS[theme];
  const multiSelectionKeyCode = detectDesktopShortcutPlatform() === "macos" ? "Meta" : "Control";
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasSizeRef = useRef<{ width: number; height: number } | null>(null);
  const pendingResizeDeltaRef = useRef({ width: 0, height: 0 });
  const resizeFrameRef = useRef<number | null>(null);
  /**
   * Dock 开合期间锚定的「画布中心世界坐标」。在 CSS 宽度过渡的若干帧内逐帧
   * 把视口拉回该中心，对过渡帧、React Flow 内部重新同步都幂等，确保几何在
   * 切换后确定性收敛（R-80 R2）。
   */
  const centerAnchorRef = useRef<{
    x: number;
    targetWidth: number;
    expiresAt: number;
    stableFrames: number;
    /** ResizeObserver 是否已送达目标宽度；防止锚定退出后迟到的 RO 重复补偿。 */
    observerSawTarget: boolean;
  } | null>(null);
  const anchorFrameRef = useRef<number | null>(null);
  const dragTransactionRef = useRef<DragHistoryTransactionRef>({
    current: null,
    startedAt: null,
  }).current;

  useEffect(
    () => registerDragInterruptionHandlers(dragTransactionRef, window),
    [],
  );

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const applyViewport = (viewport: { x: number; y: number; zoom: number }) => {
      // React Flow 的 setViewport 经由 d3 transition 异步提交；Dock 开关发生在点击
      // 事件当拍，测试/浏览器可在提交前读到旧矩阵。panZoom.syncViewport 会同步
      // 更新 d3 内部状态与 DOM transform，保证 React 渲染新布局时矩阵已经就绪。
      const { panZoom, translateExtent } = reactFlowStore.getState();
      if (panZoom) {
        // React Flow 的 panZoom 缓存上一帧 pane 尺寸；Dock 宽度刚提交时直接
        // setViewport/syncViewport 会按旧 extent 把 x 夹住。显式传入当前容器
        // extent，让 d3-zoom 同步更新内部 __zoom、store 与 transform。
        const { width, height } = container.getBoundingClientRect();
        void panZoom.setViewportConstrained(
          viewport,
          [
            [0, 0],
            [width, height],
          ],
          translateExtent,
        );
        const applyFinalTransform = () => {
          reactFlowStore.setState({
            transform: [viewport.x, viewport.y, viewport.zoom],
          });
          const viewportElement = container.querySelector<HTMLElement>(".react-flow__viewport");
          viewportElement?.style.setProperty(
            "transform",
            `translate(${viewport.x}px,${viewport.y}px) scale(${viewport.zoom})`,
          );
        };
        applyFinalTransform();
        // panZoom 的 transform promise 会在同一提交阶段稍后回写一次；
        // 微任务里以已按新 extent 计算好的最终值收尾，保证点击返回前 DOM 已稳定。
        queueMicrotask(applyFinalTransform);
        return true;
      }
      void setViewport(viewport, { duration: 0 });
      return false;
    };

    // 锚定存活期间（含等待 ResizeObserver 送达目标宽度的收尾阶段），宽度增量
    // 统一交给逐帧锚定循环处理，避免双重补偿；高度增量仍走常规 rAF 补偿。
    const anchorActive = () => centerAnchorRef.current !== null;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const nextSize = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
      setCompactMinimap(nextSize.width < 760);

      const previousSize = canvasSizeRef.current;
      canvasSizeRef.current = nextSize;
      if (!previousSize) return;

      const suppressWidth = anchorActive();
      if (
        suppressWidth &&
        centerAnchorRef.current &&
        Math.abs(nextSize.width - centerAnchorRef.current.targetWidth) <= 1
      ) {
        // 目标宽度已被 ResizeObserver 观测到：迟到的宽度通知不会再重复补偿。
        centerAnchorRef.current.observerSawTarget = true;
      }
      pendingResizeDeltaRef.current.width += suppressWidth
        ? 0
        : nextSize.width - previousSize.width;
      pendingResizeDeltaRef.current.height += nextSize.height - previousSize.height;
      // ResizeObserver 在绘制前触发；同步提交补偿，避免旧实现延到下一帧后正好
      // 落在后续测试/用户第一次拖拽读取视口的窗口里（R-80 R2）。
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      const delta = pendingResizeDeltaRef.current;
      pendingResizeDeltaRef.current = { width: 0, height: 0 };
      if (delta.width !== 0 || delta.height !== 0) {
        const viewport = getViewport();
        applyViewport({
          ...viewport,
          x: viewport.x + delta.width / 2,
          y: viewport.y + delta.height / 2,
          zoom: viewport.zoom,
        });
      }
      // panZoom 自己的 pane ResizeObserver 会先刷新 d3 extent；这里收到目标宽度后
      // 立刻重放锚定矩阵，不能再等下一帧（Playwright/用户可能在绘制前读取视口）。
      if (
        suppressWidth &&
        centerAnchorRef.current &&
        Math.abs(nextSize.width - centerAnchorRef.current.targetWidth) <= 1
      ) {
        enforceAnchor();
      }
    });

    /**
     * R-80 R2：Dock 开合当拍锁定「画布中心对应的世界坐标」，随后逐帧校验实际
     * 视口矩阵并把 x 拉回该中心，直到容器宽度到位且矩阵连续两帧正确。只写 x
     * （Dock 只改宽度），zoom 沿用当前矩阵；用户以中心缩放时 desiredX 与当前
     * e 天然相等，不会与 zoomTo/panZoom 抢写。
     */
    const enforceAnchor = () => {
      anchorFrameRef.current = null;
      const anchor = centerAnchorRef.current;
      if (!anchor) return;
      const expired = performance.now() >= anchor.expiresAt;
      const rectWidth = container.getBoundingClientRect().width;
      const settled = Math.abs(rectWidth - anchor.targetWidth) <= 1;

      const viewportElement = container.querySelector<HTMLElement>(".react-flow__viewport");
      let matrixCorrect = true;
      if (viewportElement) {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(viewportElement).transform);
        const desiredX = rectWidth / 2 - anchor.x * matrix.a;
        if (Math.abs(matrix.e - desiredX) > 0.5) {
          matrixCorrect = false;
          anchor.stableFrames = 0;
          const viewport = getViewport();
          applyViewport({ x: desiredX, y: viewport.y, zoom: viewport.zoom });
        }
      }

      if (matrixCorrect && settled) anchor.stableFrames += 1;
      // 必须等 ResizeObserver 也送达目标宽度再退出，否则迟到的 RO 会二次补偿。
      const done = settled && anchor.stableFrames >= 2 && anchor.observerSawTarget;
      if (!expired && !done) {
        anchorFrameRef.current = requestAnimationFrame(enforceAnchor);
      } else {
        centerAnchorRef.current = null;
      }
    };

    const onDockWillChange = (event: Event) => {
      const detail = (event as CustomEvent<DockViewportWillChangeDetail>).detail;
      const widthDelta = detail?.widthDelta ?? 0;
      if (widthDelta === 0) return;
      const rect = container.getBoundingClientRect();
      const viewport = getViewport();
      console.log("R80DBG5 event " + JSON.stringify({ widthDelta, width: rect.width, viewport }));
      const shifted = shiftViewportForWidthChange(viewport, widthDelta);
      const existing = centerAnchorRef.current;
      const anchor = {
        x:
          existing && performance.now() < existing.expiresAt
            ? existing.x
            : (rect.width / 2 - shifted.x) / viewport.zoom,
        targetWidth: rect.width,
        expiresAt: performance.now() + 600,
        stableFrames: 0,
        observerSawTarget: false,
      };
      centerAnchorRef.current = anchor;
      const applied = applyViewport(shifted);
      // panZoom 尚未就绪（挂载首帧）时锚定循环也无法改写 DOM，交给常规补偿。
      if (!applied) centerAnchorRef.current = null;
      // 废弃任何按旧基线排队的常规补偿，防止与锚定循环叠加。
      pendingResizeDeltaRef.current = { width: 0, height: 0 };
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      if (anchorFrameRef.current !== null) cancelAnimationFrame(anchorFrameRef.current);
      anchorFrameRef.current = requestAnimationFrame(enforceAnchor);
    };
    window.addEventListener(DOCK_VIEWPORT_WILL_CHANGE_EVENT, onDockWillChange);

    observer.observe(container);
    const dbgProbe = window.setInterval(() => {
      const el = document.querySelector<HTMLElement>('[role="application"][aria-label="工作流画布"]');
      const vp = el?.querySelector<HTMLElement>(".react-flow__viewport");
      if (!el || !vp) return;
      const r = el.getBoundingClientRect();
      const m = new DOMMatrixReadOnly(getComputedStyle(vp).transform);
      console.log("R80DBG5 probe " + JSON.stringify({ w: r.width, x: m.e, z: m.a, cx: r.width / 2 - m.e }));
    }, 100);
    return () => {
      window.clearInterval(dbgProbe);
      observer.disconnect();
      window.removeEventListener(DOCK_VIEWPORT_WILL_CHANGE_EVENT, onDockWillChange);
      if (resizeFrameRef.current !== null) cancelAnimationFrame(resizeFrameRef.current);
      if (anchorFrameRef.current !== null) cancelAnimationFrame(anchorFrameRef.current);
      resizeFrameRef.current = null;
      anchorFrameRef.current = null;
      canvasSizeRef.current = null;
      pendingResizeDeltaRef.current = { width: 0, height: 0 };
      centerAnchorRef.current = null;
    };
  }, [getViewport, setViewport, reactFlowStore]);

  useEffect(() => {
    const onLanding = (event: Event) => {
      const intent = (event as CustomEvent<CanvasLandingIntent>).detail;
      if (intent?.tabId === activeTabId) setLandingVersion((version) => version + 1);
    };
    window.addEventListener(CANVAS_LANDING_EVENT, onLanding);
    return () => window.removeEventListener(CANVAS_LANDING_EVENT, onLanding);
  }, [activeTabId]);

  useEffect(() => {
    if (!nodesInitialized || !peekCanvasLanding(activeTabId)) return;
    const intent = consumeCanvasLanding(activeTabId);
    if (!intent) return;
    let cancelled = false;
    void (async () => {
      if (intent.fitView) {
        await fitView({ padding: 0.16, minZoom: 0.35, maxZoom: 1, duration: 0 });
      }
      if (!cancelled) focusLandingControl(intent);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTabId, fitView, landingVersion, nodesInitialized]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData(DND_MIME) as NodeKind | "";
      if (!kind || readOnly) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const nodeId = addNode(kind, position);
      // 方案 C auto-text 共享兜底：image/video 节点必须有 text 上游（INV-1）。
      if (nodeId && (kind === "image" || kind === "video")) {
        ensureTextUpstreamForNode(kind, position, nodeId);
      }
    },
    [addNode, screenToFlowPosition, readOnly],
  );

  // 连线结束时的拒绝反馈（onConnectEnd；React Flow 12.3.6 提供 FinalConnectionState）。
  const handleConnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      const state = useFlowStore.getState();
      const document = state.tabs.find((tab) => tab.id === state.activeTabId);
      if (!document) return;
      const candidate: Connection | null = connectionState.fromHandle && connectionState.toHandle
        ? {
            source: connectionState.fromNode?.id ?? "",
            target: connectionState.toNode?.id ?? "",
            sourceHandle: connectionState.fromHandle.id ?? null,
            targetHandle: connectionState.toHandle.id ?? null,
          }
        : null;
      if (!candidate || !candidate.source || !candidate.target) return;
      const reason = documentConnectionRejection(document, candidate);
      if (reason) {
        setConnectionRejection(reason);
        window.setTimeout(() => setConnectionRejection(null), 3500);
      }
    },
    [],
  );

  // v8（plan.md §3.3）：功能与参数内联在生成节点上，R-40 悬浮窗口已退役；
  // 选中节点 + Enter 不再打开任何窗口（库内置「Enter=选中」保持不变）。

  const handlePaneClick = useCallback(() => {
    setSelectedNodeIds([]);
  }, [setSelectedNodeIds]);


  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      const filtered = filterCancelledDragPositionChanges(dragTransactionRef, changes);
      if (filtered.length > 0) onNodesChange(filtered);
    },
    [onNodesChange],
  );

  return (
    <div ref={canvasContainerRef} className="min-h-0 flex-1">
      <ReferenceOrdinalsProvider>
        <ReactFlow
          aria-label="工作流画布"
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={handleConnectEnd}
          isValidConnection={isValidConnection}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
          onNodeDragStart={(event) => {
            if (readOnly) return;
            beginDragHistoryTransaction(dragTransactionRef, event.timeStamp);
          }}
          onNodeDragStop={(event) => {
            finishDragHistoryTransaction(dragTransactionRef, event.timeStamp);
          }}
          onPaneClick={handlePaneClick}
          deleteKeyCode={readOnly ? null : ["Delete", "Backspace"]}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          selectionOnDrag
          multiSelectionKeyCode={multiSelectionKeyCode}
          panOnDrag={[1, 2]}
          autoPanOnNodeDrag={false}
          defaultViewport={{ x: 100, y: 200, zoom: 1 }}
          proOptions={{ hideAttribution: true }}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: "pulse" }}
        >
          <DotWaveBackground />
          <MiniMap
            position="bottom-right"
            bgColor={minimap.bg}
            nodeColor={minimap.node}
            maskColor={minimap.mask}
            style={{
              width: compactMinimap ? 128 : 200,
              height: compactMinimap ? 96 : 150,
            }}
            pannable
            zoomable
          />
          <CanvasZoomControls />
        </ReactFlow>
        {/* 连线被拒的明确反馈（role=alert，不靠颜色单通道） */}
        {connectionRejection && (
          <div
            role="alert"
            className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border border-[var(--gc-border-strong)] bg-[var(--gc-panel)] px-4 py-2 text-[12px] text-[var(--gc-text)] shadow-lg"
          >
            {connectionRejection}
          </div>
        )}
      </ReferenceOrdinalsProvider>
    </div>
  );
}
