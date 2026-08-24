import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  useReactFlow,
} from "@xyflow/react";
import {
  beginHistoryTransaction,
  endHistoryTransaction,
  useFlowStore,
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
}

/**
 * 拖拽被浏览器中断时提交最后可见位置，保留一次可撤销的用户操作。
 * 页签/项目转换的取消与回滚仍由 flowStore 在转换前处理。
 */
export function finishDragHistoryTransaction(ref: DragHistoryTransactionRef): boolean {
  const token = ref.current;
  if (!token) return false;
  ref.current = null;
  return endHistoryTransaction(token);
}

/** 统一收束 blur、pointercancel 与组件卸载造成的拖拽中断。 */
export function registerDragInterruptionHandlers(
  ref: DragHistoryTransactionRef,
  target: Pick<EventTarget, "addEventListener" | "removeEventListener">,
): () => void {
  const finish = () => {
    finishDragHistoryTransaction(ref);
  };
  target.addEventListener("blur", finish);
  target.addEventListener("pointercancel", finish);
  return () => {
    target.removeEventListener("blur", finish);
    target.removeEventListener("pointercancel", finish);
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
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const isValidConnection = useFlowStore((s) => s.isValidConnection);
  const addNode = useFlowStore((s) => s.addNode);
  const setSelectedNodeIds = useFlowStore((s) => s.setSelectedNodeIds);
  const readOnly = useFlowStore((s) => s.readOnly);
  const { screenToFlowPosition } = useReactFlow();
  const [theme] = useTheme();
  const minimap = MINIMAP_COLORS[theme];
  const dragTransactionRef = useRef<HistoryTransactionToken | null>(null);

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

  return (
    <div className="min-h-0 flex-1">
      <ReactFlow
        aria-label="工作流画布"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onNodeDragStart={() => {
          if (readOnly) return;
          finishDragHistoryTransaction(dragTransactionRef);
          dragTransactionRef.current = beginHistoryTransaction("node-drag");
        }}
        onNodeDragStop={() => {
          finishDragHistoryTransaction(dragTransactionRef);
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
