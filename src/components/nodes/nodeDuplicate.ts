import { selectActiveNodes, useFlowStore } from "@/store/flowStore";
import type { NodeKind, WorkflowNodeData } from "@/types/workflow";

/**
 * v8 工具条「复制」动作（plan.md §3.2）：复制节点（含 data，不含产物文件）。
 *
 * 只使用既有公开 Store action（`addNode` + `updateNodeData`），不改动 Store。
 * 当前 Store 的节点创建只覆盖输入层三值（生成层/结果层的创建与规范化由 R-84 承担），
 * 因此非输入层 kind 返回 null，工具条按禁用态呈现并给出原因（不隐藏、不静默失败）。
 */
const DUPLICABLE_KINDS: readonly NodeKind[] = ["text", "image", "video"];

export const DUPLICATE_UNAVAILABLE_REASON = "暂不可用：生成 / 结果节点的创建尚未接入";

export function canDuplicateNodeKind(kind: NodeKind): boolean {
  return DUPLICABLE_KINDS.includes(kind);
}

function duplicatePatch(data: WorkflowNodeData): Record<string, unknown> {
  const label = `${data.label} 副本`;
  // plan.md §3.2：复制含 data、不含产物文件——上传的图片随输入层语义保留形态但不复制产物。
  if (data.kind === "text") return { label, text: data.text };
  return { label };
}

/** 复制成功返回新节点 id；不可复制（只读 / 未支持 kind / 节点不存在）返回 null。 */
export function duplicateNode(nodeId: string): string | null {
  const state = useFlowStore.getState();
  const node = selectActiveNodes(state).find((candidate) => candidate.id === nodeId);
  if (!node || !canDuplicateNodeKind(node.data.kind)) return null;
  const newId = state.addNode(node.data.kind, { x: node.position.x + 40, y: node.position.y + 40 });
  if (!newId) return null;
  useFlowStore.getState().updateNodeData(newId, duplicatePatch(node.data));
  return newId;
}
