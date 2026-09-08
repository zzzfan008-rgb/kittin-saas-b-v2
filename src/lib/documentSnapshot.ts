import {
  MASK_REDRAW_MODEL_ID,
  imageModelOptionsErrorForOperation,
  isImageModelId,
  isModelAllowedForNode,
  type GenerationImageModelId,
  type ImageModelOptions,
} from "../types/imageModels";
import {
  allowedOperationModesForNode,
  WORKFLOW_SCHEMA_VERSION,
  type BatchSize,
  type ImageInputRole,
  type NodeKind,
  type PersistedWorkflow,
  type ReferenceEdgeData,
  type WorkflowNodeData,
  resolveReferenceEdgeData,
} from "../types/workflow";

interface PromptBindingDocumentFields {
  promptVariantId?: string;
  promptFamilyId?: string;
  parameterProfileId?: string;
  contractHash?: `sha256:${string}`;
  evaluationVersion?: string;
  postprocessVersion?: string;
}

interface GenerationModelDocumentFields extends PromptBindingDocumentFields {
  modelId: GenerationImageModelId;
  retiredModelId?: string;
  modelSelectionNeedsConfirmation: boolean;
  modelOptions: ImageModelOptions;
  operationMode: "generate" | "edit";
  operationModeNeedsConfirmation: boolean;
}

export type DocumentNodeData =
  | {
      kind: "image-input";
      label: string;
      imageRole: ImageInputRole;
      roleNeedsConfirmation: boolean;
      imageUrl?: string;
    }
  | ({
      kind: "sketch-to-render";
      label: string;
      prompt: string;
      aspectRatio: string;
      batchSize: BatchSize;
      outputImages: string[];
    } & GenerationModelDocumentFields)
  | ({
      kind: "ai-modify";
      label: string;
      prompt: string;
      aspectRatio: string;
      batchSize: BatchSize;
      outputImages: string[];
    } & GenerationModelDocumentFields)
  | ({
      kind: "fabric-recolor";
      label: string;
      colors: string[];
      prompt: string;
      fabricImageUrl?: string;
      outputImages: string[];
    } & GenerationModelDocumentFields)
  | ({
      kind: "upscale";
      label: string;
      imageSize: "2K" | "4K";
      outputImages: string[];
    } & GenerationModelDocumentFields)
  | ({
      kind: "print-extract";
      label: string;
      prompt: string;
      outputImages: string[];
      savedAsAssets: string[];
    } & GenerationModelDocumentFields)
  | ({
      kind: "print-mutate";
      label: string;
      prompt: string;
      count: number;
      outputImages: string[];
    } & GenerationModelDocumentFields)
  | ({
      kind: "mask-redraw";
      label: string;
      prompt: string;
      mask?: string;
      maskSourceRef?: string;
      outputImages: string[];
      modelId: typeof MASK_REDRAW_MODEL_ID;
      modelOptions: ImageModelOptions;
      operationMode: "mask-edit";
      operationModeNeedsConfirmation: false;
    } & PromptBindingDocumentFields)
  | {
      kind: "result";
      label: string;
      images: string[];
      note?: string;
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
  if (!("modelId" in data)) return {};
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

function generationModelFields(
  kind: Exclude<NodeKind, "image-input" | "mask-redraw" | "result">,
  modelIdValue: unknown,
  modelOptionsValue: unknown,
  operationModeValue: unknown,
  operationModeNeedsConfirmation: boolean,
  retiredModelIdValue: unknown,
  modelSelectionNeedsConfirmation: boolean,
): GenerationModelDocumentFields {
  if (!isImageModelId(modelIdValue) || !isModelAllowedForNode(modelIdValue, kind)) {
    throw new TypeError(`${kind}.modelId must be an explicitly supported model`);
  }
  const modelId = modelIdValue as GenerationImageModelId;
  const allowedOperationModes = allowedOperationModesForNode(kind);
  const hasValidOperationMode = typeof operationModeValue === "string"
    && allowedOperationModes.includes(operationModeValue as "generate" | "edit" | "mask-edit");
  if (!hasValidOperationMode) {
    throw new TypeError(`${kind}.operationMode must be one of: ${allowedOperationModes.join(", ")}`);
  }
  const operationMode = operationModeValue as "generate" | "edit";
  const retiredModelId = typeof retiredModelIdValue === "string" && retiredModelIdValue.trim()
    ? retiredModelIdValue
    : undefined;
  if (retiredModelId && !modelSelectionNeedsConfirmation) {
    throw new TypeError(`${kind}.modelSelectionNeedsConfirmation must be true while retiredModelId is present`);
  }
  const optionsError = imageModelOptionsErrorForOperation(
    modelId,
    modelOptionsValue,
    operationMode,
  );
  if (optionsError) throw new TypeError(`${kind}.modelOptions ${optionsError}`);
  return {
    modelId,
    ...(retiredModelId ? { retiredModelId } : {}),
    modelSelectionNeedsConfirmation,
    modelOptions: { ...(modelOptionsValue as ImageModelOptions) },
    operationMode,
    operationModeNeedsConfirmation,
  };
}

function createDocumentNodeData(data: WorkflowNodeData): DocumentNodeData {
  switch (data.kind) {
    case "image-input":
      return {
        kind: data.kind,
        label: data.label,
        imageRole: data.imageRole,
        roleNeedsConfirmation: data.roleNeedsConfirmation !== false,
        ...optionalString("imageUrl", data.imageUrl),
      };
    case "sketch-to-render":
      return {
        kind: data.kind,
        label: data.label,
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        batchSize: data.batchSize,
        outputImages: [...data.outputImages],
        ...generationModelFields(
          data.kind, data.modelId, data.modelOptions,
          data.operationMode, data.operationModeNeedsConfirmation === true,
          data.retiredModelId, data.modelSelectionNeedsConfirmation === true,
        ),
        ...promptBindingFields(data),
      };
    case "ai-modify":
      return {
        kind: data.kind,
        label: data.label,
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        batchSize: data.batchSize,
        outputImages: [...data.outputImages],
        ...generationModelFields(
          data.kind, data.modelId, data.modelOptions,
          data.operationMode, data.operationModeNeedsConfirmation === true,
          data.retiredModelId, data.modelSelectionNeedsConfirmation === true,
        ),
        ...promptBindingFields(data),
      };
    case "fabric-recolor":
      return {
        kind: data.kind,
        label: data.label,
        colors: [...data.colors],
        prompt: data.prompt,
        ...optionalString("fabricImageUrl", data.fabricImageUrl),
        outputImages: [...data.outputImages],
        ...generationModelFields(
          data.kind, data.modelId, data.modelOptions,
          data.operationMode, data.operationModeNeedsConfirmation === true,
          data.retiredModelId, data.modelSelectionNeedsConfirmation === true,
        ),
        ...promptBindingFields(data),
      };
    case "upscale":
      return {
        kind: data.kind,
        label: data.label,
        imageSize: data.imageSize,
        outputImages: [...data.outputImages],
        ...generationModelFields(
          data.kind, data.modelId, data.modelOptions,
          data.operationMode, data.operationModeNeedsConfirmation === true,
          data.retiredModelId, data.modelSelectionNeedsConfirmation === true,
        ),
        ...promptBindingFields(data),
      };
    case "print-extract":
      return {
        kind: data.kind,
        label: data.label,
        prompt: data.prompt,
        outputImages: [...data.outputImages],
        savedAsAssets: [...data.savedAsAssets],
        ...generationModelFields(
          data.kind, data.modelId, data.modelOptions,
          data.operationMode, data.operationModeNeedsConfirmation === true,
          data.retiredModelId, data.modelSelectionNeedsConfirmation === true,
        ),
        ...promptBindingFields(data),
      };
    case "print-mutate":
      return {
        kind: data.kind,
        label: data.label,
        prompt: data.prompt,
        count: data.count,
        outputImages: [...data.outputImages],
        ...generationModelFields(
          data.kind, data.modelId, data.modelOptions,
          data.operationMode, data.operationModeNeedsConfirmation === true,
          data.retiredModelId, data.modelSelectionNeedsConfirmation === true,
        ),
        ...promptBindingFields(data),
      };
    case "mask-redraw":
      if (data.modelId !== MASK_REDRAW_MODEL_ID) {
        throw new TypeError(`mask-redraw.modelId must equal ${MASK_REDRAW_MODEL_ID}`);
      }
      if (data.operationMode !== "mask-edit") {
        throw new TypeError("mask-redraw.operationMode must equal mask-edit");
      }
      if (
        imageModelOptionsErrorForOperation(
          MASK_REDRAW_MODEL_ID,
          data.modelOptions,
          "mask-edit",
        )
        || Object.keys(data.modelOptions).length > 0
      ) {
        throw new TypeError(
          "mask-redraw.modelOptions must be empty; output size is derived from the source image at runtime",
        );
      }
      return {
        kind: data.kind,
        label: data.label,
        prompt: data.prompt,
        ...optionalString("mask", data.mask),
        ...optionalString("maskSourceRef", data.maskSourceRef),
        outputImages: [...data.outputImages],
        modelId: MASK_REDRAW_MODEL_ID,
        // 蒙版输出尺寸由服务端按原图逐次计算，不能写入项目文档形成陈旧参数。
        modelOptions: {},
        operationMode: "mask-edit",
        operationModeNeedsConfirmation: false,
        ...promptBindingFields(data),
      };
    case "result":
      return {
        kind: data.kind,
        label: data.label,
        images: [...data.images],
        ...optionalString("note", data.note),
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
  sourceData?: WorkflowNodeData,
  targetData?: WorkflowNodeData,
): DocumentEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(edge.sourceHandle === undefined ? {} : { sourceHandle: edge.sourceHandle }),
    ...(edge.targetHandle === undefined ? {} : { targetHandle: edge.targetHandle }),
    data: resolveReferenceEdgeData(edge.data, sourceData, targetData?.kind, edge.targetHandle),
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
