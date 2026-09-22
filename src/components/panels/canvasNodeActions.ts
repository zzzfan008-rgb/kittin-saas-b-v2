import { flushSync } from "react-dom";
import type { NodeKind } from "@/types/workflow";
import {
  ensureTextUpstreamForNode,
  selectActiveNodes,
  selectActivePrimarySelectedNodeId,
  useFlowStore,
  type FlowNode,
} from "@/store/flowStore";
import { requestCanvasLanding } from "@/lib/canvasLanding";

/**
 * 在画布上新建基础节点（文本 / 图片 / 视频）的动作与落位策略。
 *
 * 2026-09-25：本模块原为 `NodeLibraryPanel.tsx`。左侧 Dock（节点库 / 属性）已随
 * 「属性 / 结果」栏整体移除——那个面板本身在 v8 就已无入口（`activePanel` 永远不会
 * 变成 "library"）——这里只保留左侧悬浮工具栏「添加」菜单仍在使用的动作。
 */

/**
 * 连续点击「添加」时的落位策略（2026-09-25 UI 修复第 8 条）：
 * 目标是节点之间保持合理间距、不重叠、布局成「每行 3 个、满则换行」的整齐网格。
 *
 * - 锚点 = 选中节点（若有）或最后一个节点。
 * - 以锚点所在「水平行」（y 容差 ±40px）为目标行，新节点放到该行最右节点的右侧 380px。
 * - 若该行已满 3 个节点，则换到下一行：x 对齐全局最小 x（首列），y = 该行 y + 360。
 *
 * 水平/垂直步长是定值（不依赖节点实测宽高），保证连续添加的间距稳定、可预测。
 */
const HORIZONTAL_GAP = 380;
const VERTICAL_GAP = 360;
const ROW_Y_TOLERANCE = 40;
const NODES_PER_ROW = 3;

export function canvasNodeClickPosition(
  nodes: readonly FlowNode[],
  selectedNodeId: string | null,
): { x: number; y: number } {
  if (nodes.length === 0) return { x: 0, y: 0 };
  const anchor = nodes.find((node) => node.id === selectedNodeId) ?? nodes.at(-1)!;
  const rowY = anchor.position.y;
  const siblingsInRow = nodes.filter(
    (node) => Math.abs(node.position.y - rowY) <= ROW_Y_TOLERANCE,
  );
  const rightmostInRow = siblingsInRow.reduce(
    (acc, node) => (node.position.x >= acc.position.x ? node : acc),
    anchor,
  );
  if (siblingsInRow.length < NODES_PER_ROW) {
    return { x: rightmostInRow.position.x + HORIZONTAL_GAP, y: rowY };
  }
  const minX = nodes.reduce((acc, node) => Math.min(acc, node.position.x), anchor.position.x);
  return { x: minX, y: rowY + VERTICAL_GAP };
}

/** 新建一个基础节点并引导落点（选中 / 聚焦输入），空工作区由 store 侧 fail-closed。 */
export function addCanvasNode(kind: NodeKind): void {
  const state = useFlowStore.getState();
  const position = canvasNodeClickPosition(
    selectActiveNodes(state),
    selectActivePrimarySelectedNodeId(state),
  );
  let nodeId: string | null = null;
  flushSync(() => {
    nodeId = useFlowStore.getState().addNode(kind, position);
  });
  if (!nodeId) return;
  // 方案 C auto-text 兜底：点击添加 image/video 也必须有 text 上游（INV-1）。
  if (kind === "image" || kind === "video") {
    ensureTextUpstreamForNode(kind, position, nodeId);
  }
  requestCanvasLanding({
    tabId: useFlowStore.getState().activeTabId,
    nodeId,
    fitView: false,
    // v7：text 节点选中正文输入框；image 节点为上传槽位。
    activateFilePicker: kind === "image",
    selectText: kind === "text",
  });
}
