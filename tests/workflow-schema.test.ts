/**
 * v8 schema 校验 + 迁移回归测试（R-85，纯逻辑，不调真实 API/DB）。
 * 覆盖：C2-C7 可机检约束（data-model.md §7）、边 handle 类型校验（prompt/reference/first-frame、
 * T4 视频 reference 禁止）、INV-1/INV-2/INV-3、v7→v8 迁移（M1-M8，migration.md）。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/workflow-schema.test.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  validateAndMigrateFlow,
  WorkflowValidationError,
} from "../server/lib/workflowSchema";

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "garment-canvas-schema-test-"));
process.env.DATA_DIR = TEST_DATA_DIR;

let passed = 0;
function ok(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const IMAGE_MODEL = "gpt-image-2.5-flare-vip";
const VIDEO_MODEL = "doubao-seedance-2-5-260628";

function textNode(id: string, text = "设计一套现代都市女装"): Record<string, unknown> {
  return { id, type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text } };
}

function imageNode(id: string, outputImages = ["/api/files/a.png"]): Record<string, unknown> {
  return { id, type: "image", position: { x: 0, y: 0 }, data: { kind: "image", label: "图片", status: "idle", outputImages } };
}

function imageGeneratorNode(id: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    type: "image-generator",
    position: { x: 380, y: 0 },
    data: {
      kind: "image-generator", label: "生图", status: "idle",
      promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
      modelId: IMAGE_MODEL, aspectRatio: "3:4", batchSize: 1,
      ...extra,
    },
  };
}

function videoGeneratorNode(id: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    type: "video-generator",
    position: { x: 380, y: 0 },
    data: {
      kind: "video-generator", label: "生视频", status: "idle",
      promptVariantId: "fashion-lookbook.doubao-seedance-2-5-260628.v1",
      modelId: VIDEO_MODEL, aspectRatio: "adaptive",
      ...extra,
    },
  };
}

function resultImageNode(id: string, sourceGeneratorId: string): Record<string, unknown> {
  return {
    id,
    type: "result-image",
    position: { x: 760, y: 0 },
    data: { kind: "result-image", label: "结果", status: "idle", images: ["/api/files/r.png"], sourceGeneratorId, runId: "run-1" },
  };
}

function flow(nodes: unknown[], edges: unknown[], version = 8): unknown {
  return { schemaVersion: version, nodes, edges };
}

const promptEdge = (id: string, source: string, target: string) => ({ id, source, target, targetHandle: "prompt", data: {} });
const referenceEdge = (id: string, source: string, target: string) => ({ id, source, target, targetHandle: "reference", data: {} });
const firstFrameEdge = (id: string, source: string, target: string) => ({ id, source, target, targetHandle: "first-frame", data: {} });

function main() {
  console.log("workflowSchema v8 校验 + 迁移回归测试");

  ok("v8 合法：text → image-generator（prompt）+ image → image-generator（reference）", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), imageNode("i1"), imageGeneratorNode("g1")],
      [promptEdge("e1", "t1", "g1"), referenceEdge("e2", "i1", "g1")],
    ));
    assert.equal(result.schemaVersion, 8);
    assert.equal(result.nodes.length, 3);
    assert.equal(result.edges.length, 2);
  });

  ok("v8 合法：result-image → image-generator（reference）复用为下游输入", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), textNode("t2"), imageGeneratorNode("g1"), resultImageNode("r1", "g1"), imageGeneratorNode("g2")],
      [promptEdge("e1", "t1", "g1"), promptEdge("e2", "t2", "g2"), referenceEdge("e3", "r1", "g2")],
    ));
    assert.equal(result.nodes.length, 5);
  });

  ok("C2：输入节点（text）携带 modelId 被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([{ ...textNode("t1"), data: { ...(textNode("t1").data as Record<string, unknown>), modelId: IMAGE_MODEL } }], [])),
      (e) => e instanceof WorkflowValidationError && /输入节点不得携带生成语义字段/.test(e.message),
    );
  });

  ok("C3：image-generator 携带 outputImages 被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageGeneratorNode("g1", { outputImages: ["/api/files/x.png"] })], [promptEdge("e1", "t1", "g1")])),
      (e) => e instanceof WorkflowValidationError && /生成节点不得承载产物/.test(e.message),
    );
  });

  ok("C4：image-generator 缺失 modelId 被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageGeneratorNode("g1", { modelId: undefined })], [promptEdge("e1", "t1", "g1")])),
      (e) => e instanceof WorkflowValidationError && /图片生成模型/.test(e.message),
    );
  });

  ok("C5：result-image 缺失 sourceGeneratorId 被拒绝", () => {
    const node = { ...resultImageNode("r1", "g1"), data: { ...(resultImageNode("r1", "g1").data as Record<string, unknown>), sourceGeneratorId: undefined } };
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageGeneratorNode("g1"), node], [promptEdge("e1", "t1", "g1")])),
      WorkflowValidationError,
    );
  });

  ok("C6：video-generator aspectRatio 非 adaptive 被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), videoGeneratorNode("v1", { aspectRatio: "16:9" })], [promptEdge("e1", "t1", "v1")])),
      WorkflowValidationError,
    );
  });

  ok("C7：result-image sourceGeneratorId 未命中生成节点被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageGeneratorNode("g1"), resultImageNode("r1", "missing")], [promptEdge("e1", "t1", "g1")])),
      (e) => e instanceof WorkflowValidationError && /sourceGeneratorId 必须命中/.test(e.message),
    );
  });

  ok("边 handle：prompt 入边只能来自 text 节点", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageNode("i1"), imageGeneratorNode("g1")], [promptEdge("e1", "i1", "g1")])),
      (e) => e instanceof WorkflowValidationError && /prompt 入边只能来自 text/.test(e.message),
    );
  });

  ok("边 handle：reference 入边只能指向 image-generator", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageNode("i1"), videoGeneratorNode("v1")], [referenceEdge("e1", "i1", "v1")])),
      (e) => e instanceof WorkflowValidationError && /reference 入边只能指向 image-generator/.test(e.message),
    );
  });

  ok("T4：video → video-generator reference 边被拒绝", () => {
    const videoNode = { id: "v0", type: "video", position: { x: 0, y: 0 }, data: { kind: "video", label: "视频", status: "idle", outputVideos: ["/api/files/v.mp4"] } };
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), videoNode, videoGeneratorNode("v1")], [referenceEdge("e1", "v0", "v1")])),
      (e) => e instanceof WorkflowValidationError && /reference 入边只能指向 image-generator/.test(e.message),
    );
  });

  ok("T4：result-video → video-generator reference 边被拒绝", () => {
    const resultVideoNode = { id: "rv", type: "result-video", position: { x: 760, y: 0 }, data: { kind: "result-video", label: "视频结果", status: "idle", videos: ["/api/files/r.mp4"], sourceGeneratorId: "v1", runId: "run-1" } };
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), videoGeneratorNode("v1"), resultVideoNode], [referenceEdge("e1", "rv", "v1")])),
      (e) => e instanceof WorkflowValidationError && /reference 入边只能指向 image-generator/.test(e.message),
    );
  });

  ok("边 handle：未知 handle 被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageNode("i1"), imageGeneratorNode("g1")], [{ id: "e1", source: "i1", target: "g1", targetHandle: "fabric", data: {} }])),
      (e) => e instanceof WorkflowValidationError && /未知的 targetHandle/.test(e.message),
    );
  });

  ok("INV-1：image-generator 无 text 上游被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([imageNode("i1"), imageGeneratorNode("g1")], [referenceEdge("e1", "i1", "g1")])),
      (e) => e instanceof WorkflowValidationError && /上游文本节点/.test(e.message),
    );
  });

  ok("INV-2：单个 text 节点连接 2 个生成节点被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [textNode("t1"), imageGeneratorNode("g1"), imageGeneratorNode("g2")],
        [promptEdge("e1", "t1", "g1"), promptEdge("e2", "t1", "g2")],
      )),
      (e) => e instanceof WorkflowValidationError && /只能连接 1 个生成节点/.test(e.message),
    );
  });

  ok("INV-3：输入节点之间互连被拒绝（text → image）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageNode("i1")], [{ id: "e1", source: "t1", target: "i1", targetHandle: "prompt", data: {} }])),
      (e) => e instanceof WorkflowValidationError && /prompt 入边只能指向生成节点/.test(e.message),
    );
  });

  ok("schemaVersion > 8 被拒绝（M7）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([], [], 9)),
      (e) => e instanceof WorkflowValidationError && /unsupported version/.test(e.message),
    );
  });

  // ---------- 迁移（migration.md M1-M8） ----------
  ok("M1-M6：v7 text/image 迁移保留内容、边清空、可过 v8 校验", () => {
    const v7 = {
      schemaVersion: 7,
      nodes: [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: "设计一套连衣裙", promptVariantId: "x", modelId: "y", outputText: "旧输出", lastRunInput: "旧输入" } },
        { id: "i1", type: "image", position: { x: 380, y: 0 }, data: { kind: "image", label: "图片", status: "idle", aspectRatio: "3:4", batchSize: 1, outputImages: ["/api/files/a.png", "/api/files/b.png"], modelId: IMAGE_MODEL, promptVariantId: "z", mask: "data:image/png;base64,AA==" } },
      ],
      edges: [promptEdge("e1", "t1", "i1")],
    };
    const result = validateAndMigrateFlow(v7);
    assert.equal(result.schemaVersion, 8);
    assert.equal(result.edges.length, 0); // M4
    assert.equal(result.nodes.length, 2);
    const t = result.nodes.find((n) => n.id === "t1")!;
    const i = result.nodes.find((n) => n.id === "i1")!;
    assert.equal(t.type, "text");
    assert.equal((t.data as { text: string }).text, "设计一套连衣裙"); // M1
    assert.deepStrictEqual((i.data as { outputImages: string[] }).outputImages, ["/api/files/a.png", "/api/files/b.png"]); // M2
    assert.ok(!("promptVariantId" in (t.data as Record<string, unknown>))); // M8（text 无生成字段）
    assert.ok(!("promptVariantId" in (i.data as Record<string, unknown>))); // M8（image 无生成字段）
    assert.ok(["text", "image"].includes(t.type) && ["text", "image"].includes(i.type)); // M5（无 generator/result）
  });

  ok("M3：v7 video 迁移保留 outputVideos", () => {
    const v7 = {
      schemaVersion: 7,
      nodes: [
        { id: "v1", type: "video", position: { x: 0, y: 0 }, data: { kind: "video", label: "视频", status: "idle", outputVideos: ["/api/files/v.mp4"], promptVariantId: "x", modelId: "y" } },
      ],
      edges: [],
    };
    const result = validateAndMigrateFlow(v7);
    const v = result.nodes.find((n) => n.id === "v1")!;
    assert.deepStrictEqual((v.data as { outputVideos: string[] }).outputVideos, ["/api/files/v.mp4"]);
    assert.ok(!("promptVariantId" in (v.data as Record<string, unknown>)));
  });

  ok("v6 及以下（含无版本）一律拒绝", () => {
    assert.throws(() => validateAndMigrateFlow(flow([], [], 6)), /旧版本格式/);
    assert.throws(() => validateAndMigrateFlow({ schemaVersion: undefined, nodes: [], edges: [] }), /旧版本格式/);
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
