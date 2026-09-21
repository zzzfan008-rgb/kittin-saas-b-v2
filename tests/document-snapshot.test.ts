import assert from "node:assert/strict";
import {
  DocumentFlowVersionError,
  DocumentGraphError,
  createDocumentSnapshot,
  documentGraphIssues,
  documentSnapshotToPersistedWorkflow,
  isV8ConnectionValid,
  migrateFlowToV8,
  normalizeFlowForDocumentRead,
  readDocumentSnapshotFromFlow,
  unprojectedDocumentFields,
} from "../src/lib/documentSnapshot";
import { buildGarmentPrompt, requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import { getModelParameterProfile } from "../src/types/modelParameterProfiles";
import { WORKFLOW_SCHEMA_VERSION } from "../src/types/workflow";

/**
 * 文档快照边界测试（schema v8，三层七节点）。
 *
 * 覆盖：投影字段边界（C2/C3/C5）、运行态剥离、深拷贝、wire 往返、落盘闸（未迁移即拒绝）、
 * v7→v8 惰性迁移（M1-M8）、版本闸（v6/-/v9）与文档图不变量（C6/C7 两档/T4/INV-2）。
 */

type SnapshotSource = Parameters<typeof createDocumentSnapshot>[0] & Record<string, unknown>;

// ---------- 1. 投影：三层字段边界 ----------

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
        // v7 遗留的生成字段：输入节点必须全部剥离（C2）
        outputText: "已润色文本",
        lastRunInput: "上游快照",
        modelId: "gpt-5.3",
        modelOptions: { temperature: 0.7 },
        promptVariantId: "v7-variant",
        unknownData: "drop-me",
      },
    },
    {
      id: "image-upload",
      type: "image",
      position: { x: 40, y: 50 },
      data: {
        kind: "image",
        label: "参考图",
        status: "queued",
        error: "queue-runtime",
        // v7 image 节点自描述的生成字段：必须剥离（C2）
        aspectRatio: "16:9",
        batchSize: 2,
        modelId: "gemini-3.1-flash-image",
        modelOptions: { aspectRatio: "16:9", imageSize: "4K" },
        mask: "/api/files/legacy-mask.png",
        featherRadius: 8,
        outputImages: ["/api/files/sketch-a.png"],
        runId: "drop-me",
      },
    },
    {
      id: "image-generator-1",
      type: "image-generator",
      position: { x: 420, y: 50 },
      data: {
        kind: "image-generator",
        label: "生图",
        status: "success",
        error: "runtime-only",
        promptVariantId: "mask-local-edit.gpt-image-2.5-sunburst.mask-edit.v1",
        promptFamilyId: "mask-local-edit",
        parameterProfileId: "gpt-image-2.5-sunburst:mask-local-edit:mask-edit:v1",
        contractHash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        evaluationVersion: "eval-1",
        postprocessVersion: "mask-composite-png-v3",
        modelId: "gpt-image-2.5-sunburst",
        aspectRatio: "3:4",
        batchSize: 2,
        modelOptions: { aspectRatio: "3:4", imageSize: "2K" },
        mask: "/api/files/mask.png",
        maskSourceRef: "/api/files/source.png",
        featherRadius: 12,
        // C3：生成节点不得携带产物字段
        outputImages: ["/api/files/should-be-dropped.png"],
        outputText: "drop-me",
      },
    },
    {
      id: "result-image-1",
      type: "result-image",
      position: { x: 800, y: 50 },
      data: {
        kind: "result-image",
        label: "图片结果",
        status: "success",
        images: ["/api/files/out-1.png", "/api/files/out-2.png"],
        thumbnail: "/api/files/out-1-thumb.png",
        sourceGeneratorId: "image-generator-1",
        runId: "run-1",
        outputSizes: ["1024x1365", null],
        selectedIndex: 1,
        modelId: "drop-me",
      },
    },
    {
      id: "video-animate",
      type: "video",
      position: { x: 70, y: 80 },
      data: {
        kind: "video",
        label: "素材视频",
        status: "success",
        outputVideos: ["/api/files/animate-a.mp4"],
        modelId: "doubao-seedance-2-5-260628",
        modelOptions: { duration: 5 },
      },
    },
  ],
  edges: [
    {
      id: "edge-prompt",
      source: "text-prompt",
      target: "image-generator-1",
      sourceHandle: null,
      targetHandle: "prompt",
      selected: true,
      animated: true,
      data: { runId: "drop-me" },
      unknownEdge: "drop-me",
    },
    {
      id: "edge-reference",
      source: "image-upload",
      target: "image-generator-1",
      selected: false,
      targetHandle: "reference",
    },
  ],
} as unknown as SnapshotSource;

const before = structuredClone(source);
const snapshot = createDocumentSnapshot(source);

assert.deepEqual(source, before, "创建快照不得改写 store 输入");
assert.equal(snapshot.version, WORKFLOW_SCHEMA_VERSION, "快照必须带 v8 构造期标记");

assert.deepEqual(snapshot, {
  version: WORKFLOW_SCHEMA_VERSION,
  projectName: "2027 春夏胶囊系列",
  nodes: [
    {
      id: "text-prompt",
      type: "text",
      position: { x: 10, y: 20 },
      data: { kind: "text", label: "提示词正文", text: "轻薄风衣，冷色系" },
    },
    {
      id: "image-upload",
      type: "image",
      position: { x: 40, y: 50 },
      data: { kind: "image", label: "参考图", outputImages: ["/api/files/sketch-a.png"] },
    },
    {
      id: "image-generator-1",
      type: "image-generator",
      position: { x: 420, y: 50 },
      data: {
        kind: "image-generator",
        label: "生图",
        promptVariantId: "mask-local-edit.gpt-image-2.5-sunburst.mask-edit.v1",
        promptFamilyId: "mask-local-edit",
        parameterProfileId: "gpt-image-2.5-sunburst:mask-local-edit:mask-edit:v1",
        contractHash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        evaluationVersion: "eval-1",
        postprocessVersion: "mask-composite-png-v3",
        modelId: "gpt-image-2.5-sunburst",
        aspectRatio: "3:4",
        batchSize: 2,
        modelOptions: { aspectRatio: "3:4", imageSize: "2K" },
        mask: "/api/files/mask.png",
        maskSourceRef: "/api/files/source.png",
        featherRadius: 12,
      },
    },
    {
      id: "result-image-1",
      type: "result-image",
      position: { x: 800, y: 50 },
      data: {
        kind: "result-image",
        label: "图片结果",
        images: ["/api/files/out-1.png", "/api/files/out-2.png"],
        thumbnail: "/api/files/out-1-thumb.png",
        sourceGeneratorId: "image-generator-1",
        runId: "run-1",
        outputSizes: ["1024x1365", null],
        selectedIndex: 1,
      },
    },
    {
      id: "video-animate",
      type: "video",
      position: { x: 70, y: 80 },
      data: { kind: "video", label: "素材视频", outputVideos: ["/api/files/animate-a.mp4"] },
    },
  ],
  edges: [
    {
      id: "edge-prompt",
      source: "text-prompt",
      target: "image-generator-1",
      sourceHandle: null,
      targetHandle: "prompt",
      data: { runId: "drop-me" },
    },
    {
      id: "edge-reference",
      source: "image-upload",
      target: "image-generator-1",
      targetHandle: "reference",
      data: {},
    },
  ],
});

assert.deepEqual(Object.keys(snapshot), ["version", "projectName", "nodes", "edges"]);
assert.deepEqual(Object.keys(snapshot.edges[1]), ["id", "source", "target", "targetHandle", "data"]);
assert.notStrictEqual(snapshot.nodes, source.nodes);
assert.notStrictEqual(snapshot.edges, source.edges);
assert.notStrictEqual(snapshot.nodes[0].position, source.nodes[0].position);
assert.notStrictEqual(snapshot.nodes[0].data, source.nodes[0].data);
const projectedGenerator = snapshot.nodes[2].data;
if (projectedGenerator.kind !== "image-generator") throw new Error("生成节点投影丢失");
assert.notStrictEqual(projectedGenerator.modelOptions, source.nodes[2].data.modelOptions, "modelOptions 必须深拷贝");
assert.deepEqual(
  unprojectedDocumentFields(projectedGenerator),
  [],
  "投影后的文档节点不得带任何契约外字段",
);
assert.ok(
  unprojectedDocumentFields({ ...projectedGenerator, outputImages: ["x"] } as never).includes("outputImages"),
  "落盘闸必须能识别生成节点上的产物字段（C3）",
);

// ---------- 2. wire 往返 + 落盘闸 ----------

const wire = documentSnapshotToPersistedWorkflow(snapshot);
assert.equal(wire.schemaVersion, 8);
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
  wire.nodes[2].data.kind === "image-generator" && wire.nodes[2].data.modelOptions,
  snapshot.nodes[2].data.kind === "image-generator" && snapshot.nodes[2].data.modelOptions,
);

const reloadedWireSnapshot = createDocumentSnapshot({
  projectName: snapshot.projectName,
  nodes: wire.nodes,
  edges: wire.edges,
});
assert.deepEqual(reloadedWireSnapshot.edges, snapshot.edges, "保存并重载不得丢失显式 edge data");
assert.deepEqual(reloadedWireSnapshot.nodes[3], snapshot.nodes[3], "结果节点溯源与产物必须往返一致");

// P1-3（architect R-89）：未迁移的快照不得被盖上 schemaVersion。
assert.throws(
  () => documentSnapshotToPersistedWorkflow({
    projectName: "未迁移",
    nodes: [{ id: "n", type: "image", position: { x: 0, y: 0 }, data: { kind: "image", label: "x", outputImages: [] } }],
    edges: [],
  } as never),
  /拒绝落盘/,
  "缺少 v8 标记的快照必须拒绝落盘",
);
assert.throws(
  () => documentSnapshotToPersistedWorkflow({
    version: WORKFLOW_SCHEMA_VERSION,
    projectName: "v7 遗留字段",
    nodes: [{
      id: "legacy",
      type: "image",
      position: { x: 0, y: 0 },
      data: { kind: "image", label: "x", outputImages: [], modelId: "gemini-3.1-flash-image" },
    }],
    edges: [],
  } as never),
  /未迁移字段/,
  "带生成字段的输入节点必须拒绝落盘（v7 不得被写成 v8）",
);
assert.throws(
  () => readDocumentSnapshotFromFlow({
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    nodes: [
      { id: "a", type: "image", position: { x: 0, y: 0 }, data: { kind: "image", label: "a", status: "idle", outputImages: [] } },
      { id: "b", type: "image", position: { x: 1, y: 0 }, data: { kind: "image", label: "b", status: "idle", outputImages: [] } },
    ],
    edges: [{ id: "e", source: "a", target: "b", targetHandle: "reference", data: {} }],
  }),
  (error: unknown) => error instanceof DocumentGraphError,
  "读取入口必须拒绝含非法边的 v8 文档",
);

// ---------- 3. v7 → v8 惰性迁移（M1-M8） ----------

const v7Flow = {
  schemaVersion: 7,
  nodes: [
    {
      id: "text-1",
      type: "text",
      position: { x: 0, y: 0 },
      data: {
        kind: "text",
        label: "提示词",
        status: "idle",
        text: "白色风衣",
        outputText: "已润色",
        promptVariantId: "v7-variant",
        modelId: "gpt-5.3",
      },
    },
    {
      id: "image-1",
      type: "image",
      position: { x: 380, y: 0 },
      data: {
        kind: "image",
        label: "草图渲染",
        status: "success",
        aspectRatio: "3:4",
        batchSize: 4,
        modelId: "gemini-3.1-flash-image",
        modelOptions: { aspectRatio: "3:4", imageSize: "2K" },
        promptVariantId: "v7-image-variant",
        mask: "/api/files/mask.png",
        featherRadius: 12,
        outputImages: ["/api/files/kept.png"],
      },
    },
    {
      id: "video-1",
      type: "video",
      position: { x: 760, y: 0 },
      data: {
        kind: "video",
        label: "上身动效",
        status: "idle",
        outputVideos: ["/api/files/kept.mp4"],
        modelId: "doubao-seedance-2-5-260628",
      },
    },
  ],
  edges: [
    { id: "e1", source: "text-1", target: "image-1", sourceHandle: "prompt", targetHandle: "prompt" },
    { id: "e2", source: "image-1", target: "video-1", targetHandle: null },
  ],
};

const migration = migrateFlowToV8(structuredClone(v7Flow));
assert.equal(migration.migrated, true, "v7 文档必须走惰性迁移");
assert.equal(migration.flow.schemaVersion, 8);
// M4/M5：v7 的边在 v8 全部非法 → 整体丢弃；不凭空造生成/结果节点。
assert.deepEqual(migration.flow.edges, [], "v7 的 prompt/reference 边必须全部丢弃");
assert.deepEqual(migration.flow.nodes.map((node) => node.type), ["text", "image", "video"]);
assert.deepEqual(migration.flow.nodes.map((node) => node.position), [
  { x: 0, y: 0 }, { x: 380, y: 0 }, { x: 760, y: 0 },
]);
// M8：输入节点保留 label + 契约字段，生成字段与运行态被剥离。
assert.deepEqual(migration.flow.nodes[0].data, { kind: "text", label: "提示词", text: "白色风衣", status: "idle" });
assert.deepEqual(migration.flow.nodes[1].data, {
  kind: "image",
  label: "草图渲染",
  outputImages: ["/api/files/kept.png"],
  status: "idle",
});
assert.deepEqual(migration.flow.nodes[2].data, {
  kind: "video",
  label: "上身动效",
  outputVideos: ["/api/files/kept.mp4"],
  status: "idle",
});
assert.deepEqual(Object.keys(migration.flow.nodes[1].data).sort(), ["kind", "label", "outputImages", "status"]);
assert.deepEqual(migration.flow.nodes[1].data.kind === "image" && unprojectedDocumentFields({
  ...migration.flow.nodes[1].data,
  status: undefined,
} as never), [], "迁移后的文档节点不得带契约外字段");

// M6：迁移结果可再次读取（幂等），已迁移的 v8 文档不会被再次迁移。
const migrationAgain = readDocumentSnapshotFromFlow(migration.flow);
assert.equal(migrationAgain.migrated, false, "v8 文档不得再次迁移");
assert.equal(migrationAgain.snapshot.nodes.length, 3);

// M7：更高版本 fail-closed。
assert.throws(
  () => migrateFlowToV8({ schemaVersion: 9, nodes: [], edges: [] }),
  (error: unknown) => error instanceof DocumentFlowVersionError && /更高的节点模型版本/.test((error as Error).message),
  "更高版本必须被拒绝",
);
// 迁移边界：v6 及以下（含缺版本号）拒绝。
assert.throws(
  () => migrateFlowToV8({ schemaVersion: 6, nodes: [], edges: [] }),
  DocumentFlowVersionError,
);
assert.throws(() => migrateFlowToV8({ nodes: [], edges: [] }), DocumentFlowVersionError);

// 读取入口：v7 文档经 readDocumentSnapshotFromFlow 直接得到 v8 文档快照。
const readV7 = readDocumentSnapshotFromFlow(structuredClone(v7Flow));
assert.equal(readV7.migrated, true);
assert.equal(readV7.snapshot.version, WORKFLOW_SCHEMA_VERSION);
assert.deepEqual(readV7.snapshot.edges, []);

// ---------- 4. store 读取归一（缺版本号时的「打开即迁」） ----------

const normalized = normalizeFlowForDocumentRead({
  nodes: structuredClone(v7Flow.nodes) as never,
  edges: structuredClone(v7Flow.edges) as never,
});
assert.deepEqual(normalized.migratedNodeIds, ["text-1", "image-1", "video-1"]);
assert.deepEqual(normalized.droppedEdgeIds, ["e1", "e2"], "v8 判定非法的 v7 边必须全部丢弃");
assert.deepEqual(normalized.edges, []);
assert.deepEqual(
  (normalized.nodes[1].data as { modelId?: unknown }).modelId,
  undefined,
  "归一后的输入节点不得残留生成字段",
);

// 合法的 v8 边保留，且缺省 handle 被物化为契约值。
const kept = normalizeFlowForDocumentRead({
  nodes: [
    { id: "t", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "文本", status: "idle", text: "x" } },
    {
      id: "g", type: "image-generator", position: { x: 380, y: 0 },
      data: {
        kind: "image-generator", label: "生图", status: "idle", promptVariantId: "", modelId: "gemini-3.1-flash-image",
        aspectRatio: "3:4", batchSize: 1,
      },
    },
  ] as never,
  edges: [{ id: "e", source: "t", target: "g", targetHandle: null }] as never,
});
assert.deepEqual(kept.droppedEdgeIds, []);
assert.equal(kept.edges[0]?.targetHandle, "prompt", "缺省 handle 必须物化为 prompt");

// ---------- 5. 文档图不变量 ----------

const invariantSnapshot = createDocumentSnapshot({
  projectName: "不变量",
  nodes: [
    { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "文本", status: "idle", text: "a" } },
    { id: "t2", type: "text", position: { x: 0, y: 200 }, data: { kind: "text", label: "文本", status: "idle", text: "b" } },
    {
      id: "vg", type: "video-generator", position: { x: 380, y: 0 },
      data: {
        kind: "video-generator", label: "生视频", status: "idle", promptVariantId: "video-animate.x.edit.v1",
        modelId: "doubao-seedance-2-5-260628", aspectRatio: "16:9",
      },
    },
    { id: "img", type: "image", position: { x: 0, y: 400 }, data: { kind: "image", label: "图", status: "idle", outputImages: [] } },
    { id: "vid", type: "video", position: { x: 0, y: 600 }, data: { kind: "video", label: "视频", status: "idle", outputVideos: [] } },
  ] as never,
  edges: [
    { id: "p1", source: "t1", target: "vg", targetHandle: "prompt" },
    { id: "p2", source: "t2", target: "vg", targetHandle: "prompt" },
    { id: "ff", source: "img", target: "vg", targetHandle: "first-frame" },
    // T4：本版禁止 video → video-generator 的 reference 边
    { id: "bad-ref", source: "vid", target: "vg", targetHandle: "reference" },
  ] as never,
});
const invariantIssues = documentGraphIssues(invariantSnapshot);
assert.ok(
  invariantIssues.some((issue) => issue.code === "forbidden-reference-edge" && issue.severity === "error"),
  "T4 禁止的 reference 边必须报错",
);
assert.ok(
  invariantIssues.some((issue) => issue.code === "video-generator-aspect-ratio" && issue.severity === "error"),
  "C6：首帧任务的画幅必须是 adaptive",
);
// 图不变量在读取入口 fail-closed（落盘闸只负责「未迁移」检测，见 assertMigratedDocumentSnapshot 注释）。
assert.throws(
  () => readDocumentSnapshotFromFlow({
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    nodes: invariantSnapshot.nodes,
    edges: invariantSnapshot.edges,
  }),
  DocumentGraphError,
);

// 待接线是 warning，不阻断读取：生成节点上游全断仍然可以保存/打开（D10）。
const pendingSnapshot = createDocumentSnapshot({
  projectName: "待接线",
  nodes: [{
    id: "g", type: "image-generator", position: { x: 0, y: 0 },
    data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: "", modelId: "gemini-3.1-flash-image", aspectRatio: "3:4", batchSize: 1 },
  }] as never,
  edges: [],
});
const pendingIssues = documentGraphIssues(pendingSnapshot);
assert.equal(pendingIssues.every((issue) => issue.severity === "warning"), true);
assert.equal(pendingIssues.some((issue) => issue.code === "missing-text-upstream"), true);
assert.doesNotThrow(() => documentSnapshotToPersistedWorkflow(pendingSnapshot), "待接线不得阻断保存");

// C7 两档（architect R-90）：命中同文档**非生成节点** → error（读取 fail-closed）；
// 不命中任何节点（生成节点已被删除）→ warning（文档仍可保存/打开，§5.1 悬空态）。
const c7BaseNodes = [
  { id: "img", type: "image", position: { x: 0, y: 0 }, data: { kind: "image", label: "图", status: "idle", outputImages: ["/api/files/a.png"] } },
] as never;
const misdirectedSnapshot = createDocumentSnapshot({
  projectName: "C7 情形 (a)",
  nodes: [
    ...(c7BaseNodes as unknown[]),
    {
      id: "r-misdirected", type: "result-image", position: { x: 380, y: 0 },
      data: {
        kind: "result-image", label: "结果", status: "idle", images: ["/api/files/r.png"],
        sourceGeneratorId: "img", runId: "run-a",
      },
    },
  ] as never,
  edges: [],
});
const misdirectedIssues = documentGraphIssues(misdirectedSnapshot).filter(
  (issue) => issue.nodeId === "r-misdirected",
);
assert.deepEqual(
  misdirectedIssues.map((issue) => [issue.code, issue.severity]),
  [["misdirected-result-source", "error"]],
  "情形 (a) 命中非生成节点必须报 error，且只报一次",
);
// 只报一次 = 两档互斥：同一节点不可能同时进 (a) 与 (b)。
assert.equal(
  documentGraphIssues(misdirectedSnapshot).some((issue) => issue.code === "dangling-result-source"),
  false,
  "情形 (a) 不得同时被算作悬空",
);
assert.throws(
  () => readDocumentSnapshotFromFlow({
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    nodes: misdirectedSnapshot.nodes,
    edges: misdirectedSnapshot.edges,
  }),
  DocumentGraphError,
  "情形 (a) 必须让读取 fail-closed",
);

const danglingSnapshot = createDocumentSnapshot({
  projectName: "C7 情形 (b)",
  nodes: [
    ...(c7BaseNodes as unknown[]),
    {
      id: "r-dangling", type: "result-image", position: { x: 380, y: 160 },
      data: {
        kind: "result-image", label: "结果", status: "idle", images: ["/api/files/r.png"],
        sourceGeneratorId: "deleted-generator", runId: "run-b",
      },
    },
  ] as never,
  edges: [],
});
const danglingIssues = documentGraphIssues(danglingSnapshot).filter(
  (issue) => issue.nodeId === "r-dangling",
);
assert.deepEqual(
  danglingIssues.map((issue) => [issue.code, issue.severity]),
  [["dangling-result-source", "warning"]],
  "情形 (b) 悬空溯源只报 warning，且只报一次",
);
assert.equal(
  documentGraphIssues(danglingSnapshot).some((issue) => issue.code === "misdirected-result-source"),
  false,
  "不命中任何节点不得被算作 (a)（生成节点删除是合法操作）",
);
assert.doesNotThrow(
  () => readDocumentSnapshotFromFlow({
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    nodes: danglingSnapshot.nodes,
    edges: danglingSnapshot.edges,
  }),
  "情形 (b) 悬空溯源不得阻断文档打开",
);
assert.doesNotThrow(
  () => documentSnapshotToPersistedWorkflow(danglingSnapshot),
  "情形 (b) 悬空溯源不得阻断文档保存",
);

// ---------- 6. v8 连线规则 ----------

const connectionDoc = {
  nodes: [
    { id: "t", data: { kind: "text", label: "文本", status: "idle", text: "x" } },
    { id: "t2", data: { kind: "text", label: "文本", status: "idle", text: "y" } },
    {
      id: "ig", data: {
        kind: "image-generator", label: "生图", status: "idle", promptVariantId: "", modelId: "gemini-3.1-flash-image",
        aspectRatio: "3:4", batchSize: 1,
      },
    },
    { id: "img", data: { kind: "image", label: "图", status: "idle", outputImages: ["/api/files/a.png"] } },
    { id: "vid", data: { kind: "video", label: "视频", status: "idle", outputVideos: [] } },
    { id: "ri", data: { kind: "result-image", label: "结果", status: "idle", images: ["/api/files/r.png"], sourceGeneratorId: "ig", runId: "r1" } },
  ] as never,
  edges: [] as { source: string; target: string; targetHandle?: string | null }[],
};
assert.equal(isV8ConnectionValid(connectionDoc, { source: "t", target: "ig", targetHandle: null }), true, "text→生图 缺省 handle 视为 prompt");
assert.equal(isV8ConnectionValid(connectionDoc, { source: "img", target: "ig", targetHandle: null }), true, "图片→生图 缺省 handle 视为 reference");
assert.equal(isV8ConnectionValid(connectionDoc, { source: "ri", target: "ig", targetHandle: "reference" }), true, "图片结果可作为参考图");
assert.equal(isV8ConnectionValid(connectionDoc, { source: "t", target: "img", targetHandle: "prompt" }), false, "输入节点不接受入边");
assert.equal(isV8ConnectionValid(connectionDoc, { source: "vid", target: "ig", targetHandle: "reference" }), false, "视频素材不能作参考图（T4）");
assert.equal(isV8ConnectionValid(connectionDoc, { source: "ig", target: "img", targetHandle: null }), false, "生成节点不能连出");
assert.equal(isV8ConnectionValid(connectionDoc, { source: "t", target: "ri", targetHandle: "prompt" }), false, "结果节点不接受入边");
assert.equal(isV8ConnectionValid(connectionDoc, { source: "t", target: "ig", targetHandle: "unknown-handle" }), false, "未知 handle 一律拒绝");
assert.equal(isV8ConnectionValid(connectionDoc, { source: "t", target: "t2", targetHandle: "prompt" }), false, "输入节点之间不得互连（INV-3）");
// INV-2：同一 text 节点只能连 1 个生成节点。
assert.equal(
  isV8ConnectionValid(
    { ...connectionDoc, edges: [{ source: "t", target: "ig", targetHandle: "prompt" }] },
    { source: "t", target: "ig", targetHandle: "prompt" },
  ),
  false,
  "重复的 (source, handle) 组合必须拒绝",
);

// ---------- 7. 蒙版绑定往返（v8：蒙版在生成节点上） ----------

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
buildGarmentPrompt(maskVariant.variantId, "将蒙版区域改成银色拉链");

const maskBindingSnapshot = createDocumentSnapshot({
  projectName: "蒙版绑定往返",
  nodes: [{
    id: "mask-binding",
    type: "image-generator",
    position: { x: 0, y: 0 },
    data: {
      kind: "image-generator",
      label: "蒙版重绘",
      status: "idle",
      aspectRatio: "3:4",
      batchSize: 1,
      mask: "/api/files/mask-binding.png",
      featherRadius: 12,
      modelId: "gpt-image-2.5-sunburst",
      modelOptions: {},
      ...expectedMaskBinding,
    },
  }] as never,
  edges: [],
});
const savedMaskNode = maskBindingSnapshot.nodes[0];
assert.equal(savedMaskNode?.data.kind, "image-generator");
if (savedMaskNode?.data.kind !== "image-generator") throw new Error("蒙版快照节点丢失");
assert.equal(savedMaskNode.data.featherRadius, 12, "保存快照必须保留用户指定的羽化宽度");
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
if (reloadedMaskNode?.data.kind !== "image-generator") throw new Error("重载后的蒙版节点丢失");
assert.equal(reloadedMaskNode.data.featherRadius, 12, "重载后必须保留用户指定的羽化宽度");
assert.deepEqual({
  promptVariantId: reloadedMaskNode.data.promptVariantId,
  promptFamilyId: reloadedMaskNode.data.promptFamilyId,
  parameterProfileId: reloadedMaskNode.data.parameterProfileId,
  contractHash: reloadedMaskNode.data.contractHash,
  evaluationVersion: reloadedMaskNode.data.evaluationVersion,
  postprocessVersion: reloadedMaskNode.data.postprocessVersion,
}, expectedMaskBinding, "重载后必须保留完整蒙版提示词绑定");

console.log("通过 7 组纯文档快照边界测试（v8 投影 / 落盘闸 / v7→v8 迁移 / 读取归一 / 不变量 / 连线规则 / 蒙版往返）");
