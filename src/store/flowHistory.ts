/**
 * flowHistory：历史事务纯类型 + 纯比较函数（从 flowStore.ts 拆出，第 2 步）。
 *
 * 零 zustand 闭包：状态机（activeHistoryTransaction / begin / end / commit / cancel）
 * 留守 flowStore。FlowState 用结构类型承接，避免循环 import。
 */
import type { Edge } from "@xyflow/react";
import type { ProjectTab } from "./flowDocument";
import type { FlowNode } from "./flowDocument";
import type { WorkflowNodeData } from "@/types/workflow";

/** zustand FlowState 的 set 形态承接。 */
export type FlowSetState = {
  tabs: ProjectTab[];
  activeTabId: string;
};
export type FlowSet = (
  partial: Partial<FlowSetState> | ((state: FlowSetState) => Partial<FlowSetState>),
) => unknown;

export type FlowTemporalState = Pick<ProjectTab, "projectName" | "nodes" | "edges">;

export type DocumentMutation =
  | Partial<ProjectTab>
  | ((tab: ProjectTab) => Partial<ProjectTab>);

export type HistoryTransactionToken = symbol;
export type HistoryTransactionOutcome = "ended" | "cancelled";
export type HistoryTransactionSettledCallback = (
  outcome: HistoryTransactionOutcome,
  token: HistoryTransactionToken,
) => void;

export interface TabTemporalHistory {
  pastStates: FlowTemporalState[];
  futureStates: FlowTemporalState[];
}

/** 活动文档历史上限（条）。 */
export const DOCUMENT_HISTORY_LIMIT = 50;

const TRANSIENT_NODE_KEYS = new Set([
  "selected",
  "dragging",
  "measured",
  "width",
  "height",
]);

const PRESERVED_NODE_TRANSIENT_KEYS = ["dragging", "measured", "width", "height"] as const;

export function preserveNodeRuntimeAndTransients(
  target: FlowNode,
  current?: FlowNode,
  options?: { preserveDragging?: boolean },
): FlowNode {
  if (!current) return target;
  const next = {
    ...target,
    data: {
      ...target.data,
      status: current.data.status,
      error: current.data.error,
    } as WorkflowNodeData,
  };
  const nextRecord = next as unknown as Record<string, unknown>;
  const currentRecord = current as unknown as Record<string, unknown>;
  for (const key of PRESERVED_NODE_TRANSIENT_KEYS) {
    if (key === "dragging" && options?.preserveDragging === false) continue;
    if (Object.prototype.hasOwnProperty.call(currentRecord, key)) nextRecord[key] = currentRecord[key];
    else delete nextRecord[key];
  }
  return next;
}

const DOCUMENT_NODE_SHELL_EXCLUDED_KEYS = new Set([
  ...TRANSIENT_NODE_KEYS,
  "id",
  "type",
  "position",
  "data",
]);

const RUNTIME_NODE_DATA_KEYS = new Set(["status", "error"]);

function sameRecordValues(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  excludedKeys: ReadonlySet<string>,
): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (excludedKeys.has(key)) continue;
    const leftValue = left[key];
    const rightValue = right[key];
    if (Object.is(leftValue, rightValue)) continue;
    if (JSON.stringify(leftValue) !== JSON.stringify(rightValue)) return false;
  }
  return true;
}

function sameDocumentNode(left: FlowNode, right: FlowNode): boolean {
  if (left === right) return true;
  if (
    left.id !== right.id ||
    left.type !== right.type ||
    left.position.x !== right.position.x ||
    left.position.y !== right.position.y
  ) return false;
  if (!sameRecordValues(
    left as unknown as Record<string, unknown>,
    right as unknown as Record<string, unknown>,
    DOCUMENT_NODE_SHELL_EXCLUDED_KEYS,
  )) return false;
  if (left.data === right.data) return true;
  return sameRecordValues(
    left.data as unknown as Record<string, unknown>,
    right.data as unknown as Record<string, unknown>,
    RUNTIME_NODE_DATA_KEYS,
  );
}

function documentEdgeValue(edge: Edge): unknown {
  const { selected: _selected, ...documentEdge } = edge;
  return documentEdge;
}

export function sameDocumentNodes(left: FlowNode[], right: FlowNode[]): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (!sameDocumentNode(left[index], right[index])) return false;
  }
  return true;
}

export function sameDocumentEdges(left: Edge[], right: Edge[]): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] === right[index]) continue;
    if (JSON.stringify(documentEdgeValue(left[index])) !== JSON.stringify(documentEdgeValue(right[index]))) {
      return false;
    }
  }
  return true;
}

export function sameTemporalDocument(left: FlowTemporalState, right: FlowTemporalState): boolean {
  return left.projectName === right.projectName &&
    sameDocumentNodes(left.nodes, right.nodes) &&
    sameDocumentEdges(left.edges, right.edges);
}

export function temporalDocument(tab: ProjectTab): FlowTemporalState {
  return { projectName: tab.projectName, nodes: tab.nodes, edges: tab.edges };
}


export function documentMutationChanged(tab: ProjectTab, patch: Partial<ProjectTab>): boolean {
  if (patch.projectName !== undefined && patch.projectName !== tab.projectName) return true;
  if (patch.nodes !== undefined && !sameDocumentNodes(tab.nodes, patch.nodes)) return true;
  if (patch.edges !== undefined && !sameDocumentEdges(tab.edges, patch.edges)) return true;
  return false;
}
