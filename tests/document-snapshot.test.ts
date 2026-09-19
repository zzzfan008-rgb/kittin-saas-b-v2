import assert from "node:assert/strict";
import {
  createDocumentSnapshot,
  documentSnapshotToPersistedWorkflow,
} from "../src/lib/documentSnapshot";
import { buildGarmentPrompt, requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import { getModelParameterProfile } from "../src/types/modelParameterProfiles";

// v7（R-48 P2-a）：旧 9 值 nodeKind 收敛为 text/image/video 三值。本测试的夹具
// 从「覆盖 9 种旧节点」改为「覆盖 3 种新节点」，仍只验证文档快照边界：
// 运行时字段剥离、业务字段保留、深拷贝、wire 转换与蒙版绑定往返。
const source = {
  projectName: "2027 春夏胶囊系列",
  projectId: "project-secret",
  tabId: "tab-runtime",
  readOnly: true,
  selectedNodeIds: ["text-prompt"],
  saveState: "saving",
  hasBeenPersisted: true,
  runtime: { runId: "paid-run" },
  nodes: [
    {
      id: "text-prompt",
      type: "text",
      position: { x: 10, y: 20 },
      selected: true,
      dragging: true,
      measured: { width: 320, height: 180 },
      width: 320,
      height: 180,
      unknownShell: "drop-me",
      data: {
        kind: "text",
        label: "提示词正文",
        status: "running",
        error: "runtime-only",
        text: "轻薄风衣，冷色系",
        outputText: "已润色文本",
        lastRunInput: "上游快照",
        modelId: "gpt-5.3",
        modelOptions: { temperature: 0.7 },
        unknownData: "drop-me",
      },
    },
    {
      id: "image-render",
      type: "image",
      position: { x: 40, y: 50 },
      data: {
        kind: "image",
        label: "草图渲染",
        status: "queued",
        error: "queue-runtime",
        aspectRatio: "16:9",
        batchSize: 2,
        outputImages: ["/api/files/sketch-a.png"],
        modelId: "gemini-3.1-flash-image",
        modelOptions: {
          aspectRatio: "16:9",
          imageSize: "4K",
        },
        runId: "drop-me",
      },
    },
    {
      id: "video-animate",
      type: "video",
      position: { x: 70, y: 80 },
      data: {
        kind: "video",
        label: "上身动效",
        status: "success",
        outputVideos: ["/api/files/animate-a.mp4"],
        modelId: "doubao-seedance-2-5-260628",
        modelOptions: { duration: 5 },
      },
    },
  ],
  edges: [
    {
      id: "edge-with-handles",
      source: "text-prompt",
      target: "image-render",
      sourceHandle: null,
      targetHandle: "prompt",
      selected: true,
      animated: true,
      data: { runId: "drop-me" },
      unknownEdge: "drop-me",
    },
    {
      id: "edge-without-handles",
      source: "image-render",
      target: "video-animate",
      selected: false,
    },
  ],
} as unknown as Parameters<typeof createDocumentSnapshot>[0] & Record<string, unknown>;

const before = structuredClone(source);
const snapshot = createDocumentSnapshot(source);

assert.deepEqual(source, before, "创建快照不得改写 store 输入");

assert.deepEqual(snapshot, {
  projectName: "2027 春夏胶囊系列",
  nodes: [
    {
      id: "text-prompt",
      type: "text",
      position: { x: 10, y: 20 },
      data: {
        kind: "text",
        label: "提示词正文",
        text: "轻薄风衣，冷色系",
        outputText: "已润色文本",
        lastRunInput: "上游快照",
        modelId: "gpt-5.3",
        modelOptions: { temperature: 0.7 },
      },
    },
    {
      id: "image-render",
      type: "image",
      position: { x: 40, y: 50 },
      data: {
        kind: "image",
        label: "草图渲染",
        aspectRatio: "16:9",
        batchSize: 2,
        outputImages: ["/api/files/sketch-a.png"],
        modelId: "gemini-3.1-flash-image",
        modelOptions: { aspectRatio: "16:9", imageSize: "4K" },
      },
    },
    {
      id: "video-animate",
      type: "video",
      position: { x: 70, y: 80 },
      data: {
        kind: "video",
        label: "上身动效",
        outputVideos: ["/api/files/animate-a.mp4"],
        modelId: "doubao-seedance-2-5-260628",
        modelOptions: { duration: 5 },
      },
    },
  ],
  edges: [
    {
      id: "edge-with-handles",
      source: "text-prompt",
      target: "image-render",
      sourceHandle: null,
      targetHandle: "prompt",
      data: { runId: "drop-me" },
    },
    {
      id: "edge-without-handles",
      source: "image-render",
      target: "video-animate",
      data: {},
    },
  ],
});

assert.deepEqual(Object.keys(snapshot), ["projectName", "nodes", "edges"]);
assert.deepEqual(Object.keys(snapshot.edges[1]), ["id", "source", "target", "data"]);
assert.notStrictEqual(snapshot.nodes, source.nodes);
assert.notStrictEqual(snapshot.edges, source.edges);
assert.notStrictEqual(snapshot.nodes[0].position, source.nodes[0].position);
assert.notStrictEqual(snapshot.nodes[0].data, source.nodes[0].data);
assert.notStrictEqual(
  snapshot.nodes[1].data.kind === "image" && snapshot.nodes[1].data.outputImages,
  source.nodes[1].data.outputImages,
);
assert.notStrictEqual(
  snapshot.nodes[1].data.kind === "image" && snapshot.nodes[1].data.modelOptions,
  source.nodes[1].data.modelOptions,
);

const wire = documentSnapshotToPersistedWorkflow(snapshot);
assert.equal(wire.schemaVersion, 7);
assert.deepEqual(wire.nodes, snapshot.nodes.map((node) => ({
  ...node,
  data: { ...node.data, status: "idle" },
})));
assert.deepEqual(wire.edges, snapshot.edges);
assert.notStrictEqual(wire.nodes, snapshot.nodes);
assert.notStrictEqual(wire.edges, snapshot.edges);
assert.notStrictEqual(wire.edges[0].data, snapshot.edges[0].data);
assert.notStrictEqual(wire.nodes[0].position, snapshot.nodes[0].position);
assert.notStrictEqual(wire.nodes[0].data, snapshot.nodes[0].data);
assert.notStrictEqual(
  wire.nodes[1].data.kind === "image" && wire.nodes[1].data.outputImages,
  snapshot.nodes[1].data.kind === "image" && snapshot.nodes[1].data.outputImages,
);
assert.notStrictEqual(
  wire.nodes[1].data.kind === "image" && wire.nodes[1].data.modelOptions,
  snapshot.nodes[1].data.kind === "image" && snapshot.nodes[1].data.modelOptions,
);

const reloadedWireSnapshot = createDocumentSnapshot({
  projectName: snapshot.projectName,
  nodes: wire.nodes,
  edges: wire.edges,
});
assert.deepEqual(reloadedWireSnapshot.edges, snapshot.edges, "保存并重载不得丢失显式 edge data");

const maskVariant = requireGarmentPromptVariant({
  familyId: "mask-local-edit",
  modelId: "gpt-image-2.5-sunburst",
  nodeKind: "image",
  mode: "mask-edit",
});
const maskProfile = getModelParameterProfile(maskVariant.parameterProfileId);
assert.ok(maskProfile, "蒙版提示词变体必须引用存在的参数档案");
const expectedMaskBinding = {
  promptVariantId: maskVariant.variantId,
  promptFamilyId: maskVariant.familyId,
  parameterProfileId: maskVariant.parameterProfileId,
  contractHash: maskVariant.contractHash,
  evaluationVersion: maskVariant.evaluationVersion,
  postprocessVersion: maskProfile.postprocess.version,
};
const maskPrompt = buildGarmentPrompt(maskVariant.variantId, "将蒙版区域改成银色拉链");
const maskBindingSnapshot = createDocumentSnapshot({
  projectName: "蒙版绑定往返",
  nodes: [{
    id: "mask-binding",
    type: "image",
    position: { x: 0, y: 0 },
    data: {
      kind: "image",
      label: "蒙版重绘",
      status: "idle",
      aspectRatio: "3:4",
      batchSize: 1,
      mask: "/api/files/mask-binding.png",
      featherRadius: 12,
      outputImages: [],
      modelId: "gpt-image-2.5-sunburst",
      modelOptions: {},
      ...expectedMaskBinding,
    },
  }],
  edges: [],
});
const savedMaskNode = maskBindingSnapshot.nodes[0];
assert.equal(savedMaskNode?.data.kind, "image");
if (savedMaskNode?.data.kind !== "image") throw new Error("蒙版快照节点丢失");
assert.equal(
  savedMaskNode.data.featherRadius,
  12,
  "保存快照必须保留用户指定的羽化宽度",
);
assert.deepEqual({
  promptVariantId: savedMaskNode.data.promptVariantId,
  promptFamilyId: savedMaskNode.data.promptFamilyId,
  parameterProfileId: savedMaskNode.data.parameterProfileId,
  contractHash: savedMaskNode.data.contractHash,
  evaluationVersion: savedMaskNode.data.evaluationVersion,
  postprocessVersion: savedMaskNode.data.postprocessVersion,
}, expectedMaskBinding, "保存快照必须保留完整蒙版提示词绑定");

const maskBindingWire = documentSnapshotToPersistedWorkflow(maskBindingSnapshot);
const reloadedMaskSnapshot = createDocumentSnapshot({
  projectName: "蒙版绑定往返",
  nodes: maskBindingWire.nodes,
  edges: maskBindingWire.edges,
});
const reloadedMaskNode = reloadedMaskSnapshot.nodes[0];
assert.equal(reloadedMaskNode?.data.kind, "image");
if (reloadedMaskNode?.data.kind !== "image") throw new Error("重载后的蒙版节点丢失");
assert.equal(
  reloadedMaskNode.data.featherRadius,
  12,
  "重载后必须保留用户指定的羽化宽度",
);
assert.deepEqual({
  promptVariantId: reloadedMaskNode.data.promptVariantId,
  promptFamilyId: reloadedMaskNode.data.promptFamilyId,
  parameterProfileId: reloadedMaskNode.data.parameterProfileId,
  contractHash: reloadedMaskNode.data.contractHash,
  evaluationVersion: reloadedMaskNode.data.evaluationVersion,
  postprocessVersion: reloadedMaskNode.data.postprocessVersion,
}, expectedMaskBinding, "重载后必须保留完整蒙版提示词绑定");

console.log("通过 2 项纯文档快照边界测试（覆盖 3 种节点及蒙版绑定往返）");
