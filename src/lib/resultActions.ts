import {
  selectActiveNodes,
  useFlowStore,
  type RecentResult,
} from "@/store/flowStore";
import { requestCanvasLanding } from "@/lib/canvasLanding";

/**
 * 结果卡片与「结果详情」弹窗共用的动作，避免两处各写一遍 store 写回逻辑。
 *
 * 这些动作合起来就是 AGENTS.md §3 要求保留的结果能力：查看、对比、下载、继续处理
 * （设为输入）。任何一处改动都要保证另一处不退化。
 */

/** 在图片查看器里打开该结果的大图，同时把它记为当前选中结果。 */
export function openResultViewer(result: RecentResult): void {
  const state = useFlowStore.getState();
  state.setSelectedResultId(result.id);
  state.openViewer({
    url: result.image,
    resultId: result.id,
    title: result.nodeLabel,
    prompt: result.prompt,
    meta: `${result.model ?? ""} · ${(((result.finishedAt ?? result.startedAt) - result.startedAt) / 1000).toFixed(1)}s · ${new Date(result.finishedAt ?? result.startedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`,
  });
}

/** 把该结果作为素材节点放回画布左侧（继续加工），并引导落点。 */
export function continueWithResult(result: RecentResult): void {
  const state = useFlowStore.getState();
  const tab = state.tabs.find((item) => item.id === state.activeTabId);
  if (!tab || tab.readOnly) return;
  const nodes = selectActiveNodes(state);
  const minX = Math.min(0, ...nodes.map((node) => node.position.x));
  const nodeId = state.addAssetNode(
    { name: result.nodeLabel, image: result.image },
    { x: minX - 320, y: nodes.length * 40 },
  );
  if (nodeId) {
    requestCanvasLanding({ tabId: tab.id, nodeId, fitView: false });
  }
}

/** 加入 / 取消对比（对比栏的开关在 store 里，浮层由画布层监听事件打开）。 */
export function toggleResultCompare(resultId: string): void {
  useFlowStore.getState().toggleCompareId(resultId);
}
