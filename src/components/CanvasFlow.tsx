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

/**
 * 小地图配色随主题（D-2）：全部引用 tokens.css（src/index.css）变量，
 * 组件内不保留任何主题字面色——色值唯一事实源在 --gc-* token。
 */
const MINIMAP_COLORS: Record<ThemeId, { bg: string; node: string; mask: string }> = {
  current: {
    bg: "var(--gc-canvas)",
    node: "var(--gc-minimap-node)",
    mask: "var(--gc-canvas-mask-current)",
  },
  white: {
    bg: "var(--gc-canvas)",
    node: "var(--gc-minimap-node)",
    mask: "var(--gc-canvas-mask-white)",
  },
  eye: {
    bg: "var(--gc-canvas)",
    node: "var(--gc-minimap-node)",
    mask: "var(--gc-canvas-mask-eye)",
  },
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

      pendingResizeDeltaRef.current.width += nextSize.width - previousSize.width;
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
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (resizeFrameRef.current !== null) cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = null;
      canvasSizeRef.current = null;
      pendingResizeDeltaRef.current = { width: 0, height: 0 };
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
        // 适应画布统一以目标缩放 80% 居中（第 2 条）：小内容锁 80%，大内容缩到能装下。
        await fitView({ padding: 0.16, minZoom: 0.35, maxZoom: 0.8, duration: 0 });
      }
      if (!cancelled) focusLandingControl(intent);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTabId, fitView, landingVersion, nodesInitialized]);

  // 进入画布 / 打开项目 / 切换页签：自动以 80% 缩放适应并居中（第 1、2 条）。
  // 仅当 activeTabId 变化（或以初始页签就绪）时触发一次，避免用户操作过程中反复重排。
  const autoFitTabKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!nodesInitialized) return;
    if (autoFitTabKeyRef.current === activeTabId) return;
    autoFitTabKeyRef.current = activeTabId;
    void fitView({ padding: 0.16, minZoom: 0.35, maxZoom: 0.8, duration: 0 });
  }, [activeTabId, fitView, nodesInitialized]);

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
