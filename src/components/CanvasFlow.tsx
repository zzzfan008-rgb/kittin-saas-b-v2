import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
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

export const DND_MIME = "application/garment-node";

const edgeTypes = { pulse: PulseEdge };

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

/** 小地图配色随主题 */
const MINIMAP_COLORS: Record<ThemeId, { bg: string; node: string; mask: string }> = {
  current: { bg: "#141414", node: "#2a2a2a", mask: "rgba(10,10,10,0.7)" },
  white: { bg: "#ffffff", node: "#d2d2d7", mask: "rgba(29,29,31,0.08)" },
  eye: { bg: "#ddeccf", node: "#98b884", mask: "rgba(48,69,43,0.15)" },
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
  const readOnly = useFlowStore(selectActiveReadOnly);
  const { screenToFlowPosition } = useReactFlow();
  const [theme] = useTheme();
  const minimap = MINIMAP_COLORS[theme];
  const dragTransactionRef = useRef<DragHistoryTransactionRef>({
    current: null,
    startedAt: null,
  }).current;

  useEffect(
    () => registerDragInterruptionHandlers(dragTransactionRef, window),
    [],
  );

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
    <div className="min-h-0 flex-1">
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
        panOnDrag={[1, 2]}
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
          pannable
          zoomable
        />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
