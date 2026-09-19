import type { ImageModelOptions } from "../types/imageModels";
import {
  WORKFLOW_SCHEMA_VERSION,
  type NodeKind,
  type PersistedWorkflow,
  type ReferenceEdgeData,
  type WorkflowNodeData,
} from "../types/workflow";

/**
 * DocumentSnapshot（schema v7，R-48 P2-a）。
 *
 * 状态注记：本文件在 P2-a 提交点上**只做了类型层重写以保持 v7 类型闭环**
 * （旧 9 值 DocumentNodeData → 三值），未做行为重设计：
 * - 三值 kind 的逐字段文档校验（TextNodeData/ImageNodeData/VideoNodeData 的
 *   深校验）归 P2-b（workflowSchema v7 节点级校验同批）；
 * - INV-1（text 上游不变量）的 snapshot 侧联防归 P2-b；
 * - 「快照构造即收敛旧字段」的语义迁移（retiredModelId/operationMode 族删除后的
 *   文档形状）在 P2-b 与 workflowSchema 一起定稿。
 * 契约依据：docs/design/2026-09-18-three-node-model/contracts/data-model.md §3/§6。
 */

interface PromptBindingDocumentFields {
  promptVariantId?: string;
  promptFamilyId?: string;
  parameterProfileId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  postprocessVersion?: string;
}

export type DocumentNodeData =
  | {
      kind: "text";
      label: string;
      text: string;
      promptVariantId?: string;
      modelId?: string;
      modelOptions?: ImageModelOptions;
      outputText?: string;
      lastRunInput?: string;
    }
  | ({
      kind: "image";
      label: string;
      aspectRatio: string;
      batchSize: number;
      outputImages: string[];
      mask?: string;
      maskSourceRef?: string;
      featherRadius?: number;
      modelId?: string;
      modelOptions?: ImageModelOptions;
    } & PromptBindingDocumentFields)
  | {
      kind: "video";
      label: string;
      promptVariantId?: string;
      contractHash?: `sha256:${string}`;
      evaluationVersion?: string;
      modelId?: string;
      modelOptions?: ImageModelOptions;
      outputVideos: string[];
    };

export interface DocumentNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: DocumentNodeData;
}

export interface DocumentEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data: ReferenceEdgeData;
}

export interface DocumentSnapshot {
  projectName: string;
  nodes: DocumentNode[];
  edges: DocumentEdge[];
}

interface NodeLike {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

interface EdgeLike {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: unknown;
}

function optionalString<K extends string>(key: K, value: string | undefined): Partial<Record<K, string>> {
  return value === undefined ? {} : { [key]: value } as Record<K, string>;
}

function promptBindingFields(data: WorkflowNodeData): Partial<PromptBindingDocumentFields> {
  const stringField = (key: string): string | undefined => (
    typeof data[key] === "string" ? data[key] as string : undefined
  );
  const contractHashValue = stringField("contractHash");
  const contractHash = contractHashValue && /^sha256:[a-f0-9]{64}$/.test(contractHashValue)
    ? contractHashValue as `sha256:${string}`
    : undefined;
  return {
    ...optionalString("promptVariantId", stringField("promptVariantId")),
    ...optionalString("promptFamilyId", stringField("promptFamilyId")),
    ...optionalString("parameterProfileId", stringField("parameterProfileId")),
    ...(contractHash ? { contractHash } : {}),
    ...optionalString("evaluationVersion", stringField("evaluationVersion")),
    ...optionalString("postprocessVersion", stringField("postprocessVersion")),
  };
}

function cloneModelOptions(value: unknown): ImageModelOptions | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const result: ImageModelOptions = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      result[key] = entry;
    }
  }
  return result;
}

function createDocumentNodeData(data: WorkflowNodeData): DocumentNodeData {
  switch (data.kind) {
    case "text":
      return {
        kind: data.kind,
        label: data.label,
        text: data.text,
        ...optionalString("promptVariantId", data.promptVariantId),
        ...(typeof data.modelId === "string" ? { modelId: data.modelId } : {}),
        ...(data.modelOptions !== undefined ? { modelOptions: cloneModelOptions(data.modelOptions) } : {}),
        ...optionalString("outputText", data.outputText),
        ...optionalString("lastRunInput", data.lastRunInput),
      };
    case "image":
      return {
        kind: data.kind,
        label: data.label,
        aspectRatio: data.aspectRatio,
        batchSize: data.batchSize,
        outputImages: [...data.outputImages],
        ...optionalString("mask", data.mask),
        ...optionalString("maskSourceRef", data.maskSourceRef),
        ...(typeof data.featherRadius === "number" && Number.isFinite(data.featherRadius)
          ? { featherRadius: Math.max(0, Math.min(64, Math.round(data.featherRadius))) }
          : {}),
        ...(typeof data.modelId === "string" ? { modelId: data.modelId } : {}),
        ...(data.modelOptions !== undefined ? { modelOptions: cloneModelOptions(data.modelOptions) } : {}),
        ...promptBindingFields(data),
      };
    case "video":
      return {
        kind: data.kind,
        label: data.label,
        ...optionalString("promptVariantId", data.promptVariantId),
        ...promptBindingFields(data),
        ...(typeof data.modelId === "string" ? { modelId: data.modelId } : {}),
        ...(data.modelOptions !== undefined ? { modelOptions: cloneModelOptions(data.modelOptions) } : {}),
        outputVideos: [...data.outputVideos],
      };
  }
}

function cloneDocumentNodeData(data: DocumentNodeData): DocumentNodeData {
  return createDocumentNodeData({ ...data, status: "idle" } as WorkflowNodeData);
}

function createDocumentNode(node: NodeLike): DocumentNode {
  const kind = node.data.kind;
  if (node.type !== kind) {
    throw new TypeError(`节点 ${node.id} 的 type 与 data.kind 不一致`);
  }
  return {
    id: node.id,
    type: kind,
    position: { x: node.position.x, y: node.position.y },
    data: createDocumentNodeData(node.data),
  };
}

function createDocumentEdge(
  edge: EdgeLike,
  _sourceData?: WorkflowNodeData,
  _targetData?: WorkflowNodeData,
): DocumentEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(edge.sourceHandle === undefined ? {} : { sourceHandle: edge.sourceHandle }),
    ...(edge.targetHandle === undefined ? {} : { targetHandle: edge.targetHandle }),
    data: (typeof edge.data === "object" && edge.data !== null && !Array.isArray(edge.data)
      ? edge.data as ReferenceEdgeData
      : {}) as ReferenceEdgeData,
  };
}

function documentEdgeToPersisted(edge: DocumentEdge): PersistedWorkflow["edges"][number] {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(edge.sourceHandle === undefined ? {} : { sourceHandle: edge.sourceHandle }),
    ...(edge.targetHandle === undefined ? {} : { targetHandle: edge.targetHandle }),
    data: { ...edge.data },
  };
}

export function createDocumentSnapshot(source: {
  projectName: string;
  nodes: readonly NodeLike[];
  edges: readonly EdgeLike[];
}): DocumentSnapshot {
  const sourceDataByNodeId = new Map(source.nodes.map((node) => [node.id, node.data]));
  return {
    projectName: source.projectName,
    nodes: source.nodes.map(createDocumentNode),
    edges: source.edges.map((edge) => createDocumentEdge(
      edge,
      sourceDataByNodeId.get(edge.source),
      sourceDataByNodeId.get(edge.target),
    )),
  };
}

export function documentSnapshotToPersistedWorkflow(snapshot: DocumentSnapshot): PersistedWorkflow {
  return {
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: { x: node.position.x, y: node.position.y },
      data: { ...cloneDocumentNodeData(node.data), status: "idle" } as WorkflowNodeData,
    })),
    edges: snapshot.edges.map(documentEdgeToPersisted),
  };
}
