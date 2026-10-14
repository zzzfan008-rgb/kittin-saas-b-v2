/**
 * flowTextEdit：文本合并编辑纯函数（从 flowStore.ts 拆出，第 3 步）。
 *
 * 零闭包：状态机（activeTextEdit / flush / cancel / update / composing）留守 flowStore。
 */
import type { ProjectTab, CoalescedTextEditDescriptor } from "./flowDocument";
import type { FlowNode } from "./flowDocument";
import type { WorkflowNodeData } from "@/types/workflow";

export function textEditDescriptorKey(descriptor: CoalescedTextEditDescriptor): string {
  return descriptor.kind === "project-name"
    ? "project-name"
    : JSON.stringify(["node-data", descriptor.nodeId, descriptor.field]);
}

export function readTextEditValue(
  tab: ProjectTab,
  descriptor: CoalescedTextEditDescriptor,
): { value: string; fieldExisted: boolean } | null {
  if (descriptor.kind === "project-name") {
    return { value: tab.projectName, fieldExisted: true };
  }
  const node = tab.nodes.find((candidate) => candidate.id === descriptor.nodeId);
  if (!node) return null;
  const fieldExisted = Object.prototype.hasOwnProperty.call(node.data, descriptor.field);
  const value = node.data[descriptor.field];
  return { value: typeof value === "string" ? value : "", fieldExisted };
}

export function textEditPatch(
  tab: ProjectTab,
  descriptor: CoalescedTextEditDescriptor,
  value: string,
  fieldExisted = true,
): Partial<ProjectTab> {
  if (descriptor.kind === "project-name") return { projectName: value };
  let matched = false;
  const nodes = tab.nodes.map((node) => {
    if (node.id !== descriptor.nodeId) return node;
    matched = true;
    const data = { ...node.data } as WorkflowNodeData & Record<string, unknown>;
    if (fieldExisted) data[descriptor.field] = value;
    else delete data[descriptor.field];
    return { ...node, data };
  });
  return matched ? { nodes } : {};
}
