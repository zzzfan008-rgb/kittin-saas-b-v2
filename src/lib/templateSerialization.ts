import type { Edge } from "@xyflow/react";
import type { FlowNode } from "@/store/flowStore";
import {
  createDocumentSnapshot,
  documentSnapshotToPersistedWorkflow,
} from "@/lib/documentSnapshot";

/**
 * 构建「当前画布存为模板」的请求体（2026-09-25 决策 3 起 UI 入口已取消，但模板序列化
 * 与项目/草稿共用同一持久化边界，序列化器保留在 lib 供测试与后续接入口复用）。
 */
export function createTemplateRequestPayload(input: {
  name: string;
  description: string;
  projectName: string;
  nodes: FlowNode[];
  edges: Edge[];
}) {
  const document = createDocumentSnapshot(input);
  return {
    name: input.name,
    description: input.description,
    flow: documentSnapshotToPersistedWorkflow(document),
  };
}
