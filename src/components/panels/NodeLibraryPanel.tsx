import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NODE_SPECS, type NodeKind } from "@/types/workflow";
import {
  ensureTextUpstreamForNode,
  selectActiveNodes,
  selectActivePrimarySelectedNodeId,
  useFlowStore,
  type FlowNode,
} from "@/store/flowStore";
import { DND_MIME } from "../CanvasFlow";
import { cn } from "@/lib/utils";
import { requestCanvasLanding } from "@/lib/canvasLanding";

/** v7：三种基础节点（R1）。 */
const KIND_ORDER: NodeKind[] = ["text", "image", "video"];

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

export function nodeLibraryClickPosition(
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

/**
 * 在画布上新建一个基础节点（文本 / 图片 / 视频）。
 * 供左侧节点库面板与左侧悬浮工具栏的「添加」菜单共用，避免两处各写一遍 landing 逻辑。
 */
export function addCanvasNode(kind: NodeKind): void {
  const state = useFlowStore.getState();
  const position = nodeLibraryClickPosition(
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

export function NodeLibraryPanel({ className }: { className?: string }) {
  // 第 6 条：页签可以全部关掉。空工作区里没有可写入的文档，节点库改为指路而不是
  // 留一排点了没反应的卡片（addNode 在空工作区 fail-closed 返回 null）。
  const workspaceEmpty = useFlowStore((state) => state.tabs.length === 0);
  return (
    <aside
      className={cn(
        "gc-panel flex w-72 shrink-0 flex-col border-r border-[var(--gc-border)] bg-[var(--gc-panel)]",
        className,
      )}
    >
      <div className="flex h-10 shrink-0 items-center border-b border-[var(--gc-border)] px-4">
        <h2 className="text-[11px] font-medium tracking-widest text-[var(--gc-text-muted)]">
          节点库
        </h2>
      </div>
      {workspaceEmpty ? (
        <div className="flex flex-1 items-center justify-center p-4 text-center text-[11px] leading-relaxed text-[var(--gc-text-muted)]">
          先「新建项目」或「打开项目」，再从这里添加节点
        </div>
      ) : (
        <>
          <NodeList />
          <div className="border-t border-[var(--gc-border)] px-3 py-2 text-[11px] leading-relaxed text-[var(--gc-text-muted)]">
            点击添加 · 也可拖拽到画布
            <br />
            左键框选 · 中/右键平移 · Delete 删除
          </div>
        </>
      )}
    </aside>
  );
}

function NodeList() {
  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-3">
      {KIND_ORDER.map((kind) => {
        const spec = NODE_SPECS[kind];
        return (
          <Card
            key={kind}
            size="sm"
            className="gc-node-library-card gap-0 rounded-lg bg-[var(--gc-panel)] py-0 ring-1 ring-[var(--gc-border)] transition-shadow hover:ring-[var(--gc-accent)]"
          >
            <Button
              type="button"
              variant="ghost"
              draggable
              onClick={() => addCanvasNode(kind)}
              onDragStart={(event) => {
                event.dataTransfer.setData(DND_MIME, kind);
                event.dataTransfer.effectAllowed = "move";
              }}
              title={`点击添加${spec.title}节点，或拖拽到画布指定位置`}
              className="h-auto w-full cursor-grab select-none flex-col items-start gap-1 rounded-lg p-2.5 text-left whitespace-normal text-[var(--gc-node-text)] hover:bg-[var(--gc-node-inner-hover)] hover:text-[var(--gc-node-text)] active:cursor-grabbing"
            >
              <span className="flex w-full items-center justify-between gap-2 text-xs font-medium text-[var(--gc-node-text)]">
                <span>{spec.title}</span>
              </span>
              <span className="text-[11px] leading-relaxed text-[var(--gc-node-muted)]">
                {spec.description}
              </span>
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
