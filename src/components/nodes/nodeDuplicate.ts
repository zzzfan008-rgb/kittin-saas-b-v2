import { selectActiveNodes, useFlowStore } from "@/store/flowStore";
import type { NodeKind, WorkflowNodeData } from "@/types/workflow";

/**
 * v8 工具条「复制」动作：复制节点（含 data + 用户上传的媒体引用）。
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
  if (data.kind === "text") return { label, text: data.text };
  // 图片/视频节点的上传引用（outputImages/outputVideos）随复制保留——
  // 引用指向同一服务端文件，不产生新文件；蒙版随图保留（归属 image[0]，仍有效）。
  // 瞬态编辑态（editPrompt/editInputRef）不复制。
  if (data.kind === "image") {
    return {
      label,
      outputImages: [...data.outputImages],
      mask: data.mask,
      maskSourceRef: data.maskSourceRef,
      featherRadius: data.featherRadius,
    };
  }
  if (data.kind === "video") return { label, outputVideos: [...data.outputVideos] };
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
