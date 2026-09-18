import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  useNodesInitialized,
  useReactFlow,
  type NodeChange,
} from "@xyflow/react";
import {
  beginHistoryTransaction,
  endHistoryTransaction,
  selectActiveEdges,
  selectActiveNodes,
  selectActiveReadOnly,
  useFlowStore,
  type FlowNode,
  type HistoryTransactionToken,
} from "@/store/flowStore";
import { DotWaveBackground } from "./DotWaveBackground";
import { PulseEdge } from "./edges/PulseEdge";
import { nodeTypes } from "./nodes";
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
  const { fitView, getViewport, screenToFlowPosition, setViewport } = useReactFlow();
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
      if (resizeFrameRef.current !== null) cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        const delta = pendingResizeDeltaRef.current;
        pendingResizeDeltaRef.current = { width: 0, height: 0 };
        if (delta.width === 0 && delta.height === 0) return;
        const viewport = getViewport();
        void setViewport(
          {
            ...viewport,
            x: viewport.x + delta.width / 2,
            y: viewport.y + delta.height / 2,
          },
          { duration: 0 },
        );
      });
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (resizeFrameRef.current !== null) cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = null;
      canvasSizeRef.current = null;
      pendingResizeDeltaRef.current = { width: 0, height: 0 };
    };
  }, [getViewport, setViewport]);

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
      addNode(kind, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [addNode, screenToFlowPosition, readOnly],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      const filtered = filterCancelledDragPositionChanges(dragTransactionRef, changes);
      if (filtered.length > 0) onNodesChange(filtered);
    },
    [onNodesChange],
  );

  return (
    <div ref={canvasContainerRef} className="min-h-0 flex-1">
      <ReactFlow
        aria-label="工作流画布"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
        onPaneClick={() => setSelectedNodeIds([])}
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
    </div>
  );
}
