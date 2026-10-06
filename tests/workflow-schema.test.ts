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
  // v9 夹具（64 Phase 1）：variant 绑定字段已删除；operationMode 可缺省。
  return {
    id,
    type: "image-generator",
    position: { x: 380, y: 0 },
    data: {
      kind: "image-generator", label: "生图", status: "idle",
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

function flow(nodes: unknown[], edges: unknown[], version = 9): unknown {
  return { schemaVersion: version, nodes, edges };
}

const promptEdge = (id: string, source: string, target: string) => ({ id, source, target, targetHandle: "prompt", data: {} });
const referenceEdge = (id: string, source: string, target: string) => ({ id, source, target, targetHandle: "reference", data: {} });
const firstFrameEdge = (id: string, source: string, target: string) => ({ id, source, target, targetHandle: "first-frame", data: {} });

function main() {
  console.log("workflowSchema v9 校验 + 迁移回归测试");

  ok("v9 合法：text → image-generator（prompt）+ image → image-generator（reference）", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), imageNode("i1"), imageGeneratorNode("g1")],
      [promptEdge("e1", "t1", "g1"), referenceEdge("e2", "i1", "g1")],
    ));
    assert.equal(result.schemaVersion, 9);
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

  ok("C7：result-image sourceGeneratorId 命中非生成节点被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageGeneratorNode("g1"), resultImageNode("r1", "t1")], [promptEdge("e1", "t1", "g1")])),
      (e) => e instanceof WorkflowValidationError && /指向的节点不是生成节点/.test(e.message),
    );
  });

  ok("C7：result-image sourceGeneratorId 不命中任何节点（生成节点已删）放行", () => {
    const result = validateAndMigrateFlow(flow([textNode("t1"), imageGeneratorNode("g1"), resultImageNode("r1", "missing")], [promptEdge("e1", "t1", "g1")]));
    assert.equal(result.nodes.length, 3);
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

  ok("schemaVersion > 9 被拒绝（M7）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([], [], 10)),
      (e) => e instanceof WorkflowValidationError && /unsupported version/.test(e.message),
    );
  });

  // ---------- 迁移（migration.md M1-M8） ----------
  ok("M1-M6：v7 text/image 迁移保留内容、边清空、可过 v9 校验", () => {
    const v7 = {
      schemaVersion: 7,
      nodes: [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: "设计一套连衣裙", promptVariantId: "x", modelId: "y", outputText: "旧输出", lastRunInput: "旧输入" } },
        { id: "i1", type: "image", position: { x: 380, y: 0 }, data: { kind: "image", label: "图片", status: "idle", aspectRatio: "3:4", batchSize: 1, outputImages: ["/api/files/a.png", "/api/files/b.png"], modelId: IMAGE_MODEL, promptVariantId: "z", mask: "data:image/png;base64,AA==" } },
      ],
      edges: [promptEdge("e1", "t1", "i1")],
    };
    const result = validateAndMigrateFlow(v7);
    assert.equal(result.schemaVersion, 9);
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

  // ---------- v9（64 Phase 1 C1）：operationMode 归节点 data ----------
  ok("v9：operationMode 缺省通过（不注入字段，缺省 = generate）", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), imageGeneratorNode("g1")],
      [promptEdge("e1", "t1", "g1")],
    ));
    const g = result.nodes.find((n) => n.id === "g1")!;
    assert.ok(!("operationMode" in (g.data as Record<string, unknown>)));
  });

  for (const mode of ["generate", "edit"] as const) {
    ok(`v9：operationMode="${mode}" 通过`, () => {
      const result = validateAndMigrateFlow(flow(
        [textNode("t1"), imageNode("i1"), imageGeneratorNode("g1", { operationMode: mode })],
        [promptEdge("e1", "t1", "g1"), referenceEdge("e2", "i1", "g1")],
      ));
      const g = result.nodes.find((n) => n.id === "g1")!;
      assert.equal((g.data as { operationMode?: string }).operationMode, mode);
    });
  }

  // 65d §1.2：mask-edit 已剥离出生成节点（蒙版重绘改为图片节点本地编辑动作），
  // image-generator case 拒收 operationMode="mask-edit"（GENERATOR_OPERATION_MODE_VALUES=[generate,edit]）。
  ok("65d §1.2：image-generator operationMode=\"mask-edit\" 被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [textNode("t1"), imageNode("i1"), imageGeneratorNode("g1", { operationMode: "mask-edit" })],
        [promptEdge("e1", "t1", "g1"), referenceEdge("e2", "i1", "g1")],
      )),
      (e) => e instanceof WorkflowValidationError && /operationMode/.test(e.message),
    );
  });

  ok("v9：operationMode 非法值被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [textNode("t1"), imageGeneratorNode("g1", { operationMode: "restyle" })],
        [promptEdge("e1", "t1", "g1")],
      )),
      (e) => e instanceof WorkflowValidationError && /operationMode/.test(e.message),
    );
  });

  ok("v9：text 节点携带 operationMode 被拒绝（输入节点禁带生成语义）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [{ ...textNode("t1"), data: { ...(textNode("t1").data as Record<string, unknown>), operationMode: "edit" } }],
        [],
      )),
      (e) => e instanceof WorkflowValidationError && /输入节点不得携带生成语义字段/.test(e.message),
    );
  });

  ok("v9：generator 携带旧 promptVariantId 被白名单剥离（不报错、输出干净）", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), imageGeneratorNode("g1", { promptVariantId: "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1" })],
      [promptEdge("e1", "t1", "g1")],
    ));
    const g = result.nodes.find((n) => n.id === "g1")!;
    const data = g.data as Record<string, unknown>;
    assert.ok(!("promptVariantId" in data));
    assert.ok(!("operationMode" in data)); // v9 直存路径不做迁移物化（v8 路径才物化）
  });

  // ---------- 65a：蒙版搬到图片节点（Q4 裁决 A：存量静默丢弃，v9 不变） ----------

  ok("65a：image-generator 携带 mask 三字段（存量草稿）→ 静默丢弃后通过", () => {
    const result = validateAndMigrateFlow(flow(
      [
        textNode("t1"),
        imageNode("i1"),
        imageGeneratorNode("g1", { operationMode: "edit", mask: "data:image/png;base64,OLD==", maskSourceRef: "/api/files/a.png", featherRadius: 8 }),
      ],
      [promptEdge("e1", "t1", "g1"), referenceEdge("e2", "i1", "g1")],
    ));
    const g = result.nodes.find((n) => n.id === "g1")!;
    const data = g.data as Record<string, unknown>;
    assert.ok(!("mask" in data), "存量生成节点 mask 必须静默丢弃");
    assert.ok(!("maskSourceRef" in data));
    assert.ok(!("featherRadius" in data));
    assert.equal((data as { operationMode?: string }).operationMode, "edit"); // 非蒙版字段保留
  });

  ok("65a：image-generator 携带非法 mask 值 → 静默丢弃通过（不再校验旧位置）", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), imageGeneratorNode("g1", { mask: 12345 })],
      [promptEdge("e1", "t1", "g1")],
    ));
    const g = result.nodes.find((n) => n.id === "g1")!;
    assert.ok(!("mask" in (g.data as Record<string, unknown>)));
  });

  ok("65a：image 节点携带 mask 三字段 → 通过且保留", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), {
        id: "i1", type: "image", position: { x: 380, y: 0 },
        data: {
          kind: "image", label: "图片", status: "idle",
          outputImages: ["/api/files/a.png"],
          mask: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", maskSourceRef: "/api/files/a.png", featherRadius: 12,
        },
      }, imageGeneratorNode("g1")],
      [promptEdge("e1", "t1", "g1"), referenceEdge("e2", "i1", "g1")],
    ));
    const i = result.nodes.find((n) => n.id === "i1")!;
    const data = i.data as Record<string, unknown>;
    assert.equal(data.mask, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
    assert.equal(data.maskSourceRef, "/api/files/a.png");
    assert.equal(data.featherRadius, 12);
  });

  // ---------- 65d §1.1：image 节点 editPrompt（蒙版重绘面板编辑描述，<=500 字用户拍板定案）----------
  ok("65d §1.1：image 节点 editPrompt 合法值 → 通过且保留", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), {
        id: "i1", type: "image", position: { x: 0, y: 0 },
        data: { kind: "image", label: "图片", status: "idle", outputImages: ["/api/files/a.png"], editPrompt: "把领口改成方领" },
      }], [],
    ));
    const i = result.nodes.find((n) => n.id === "i1")!;
    assert.equal((i.data as { editPrompt?: string }).editPrompt, "把领口改成方领");
  });

  ok("65d §1.1：image 节点 editPrompt 带首尾空白 → 存 trim 后值（与 imageEditGate/合成 step 语义一致）", () => {
    const result = validateAndMigrateFlow(flow(
      [{ id: "i1", type: "image", position: { x: 0, y: 0 },
         data: { kind: "image", label: "图片", status: "idle", outputImages: ["/api/files/a.png"], editPrompt: "  把袖子改短  " } }],
      [],
    ));
    const i = result.nodes.find((n) => n.id === "i1")!;
    assert.equal((i.data as { editPrompt?: string }).editPrompt, "把袖子改短");
  });

  ok("65d §1.1：image 节点 editPrompt 纯空白 → 拒（trim 非空）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [{ id: "i1", type: "image", position: { x: 0, y: 0 },
           data: { kind: "image", label: "图片", status: "idle", outputImages: ["/api/files/a.png"], editPrompt: "   " } }],
        [],
      )),
      (e) => e instanceof WorkflowValidationError && /editPrompt/.test(e.message),
    );
  });

  ok("65d §1.1：image 节点 editPrompt 恰 500 字 → 通过", () => {
    const result = validateAndMigrateFlow(flow(
      [{ id: "i1", type: "image", position: { x: 0, y: 0 },
         data: { kind: "image", label: "图片", status: "idle", outputImages: ["/api/files/a.png"], editPrompt: "x".repeat(500) } }],
      [],
    ));
    const i = result.nodes.find((n) => n.id === "i1")!;
    assert.equal((i.data as { editPrompt?: string }).editPrompt, "x".repeat(500));
  });

  ok("65d §1.1：image 节点 editPrompt 超 500 字 → 拒", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [{ id: "i1", type: "image", position: { x: 0, y: 0 },
           data: { kind: "image", label: "图片", status: "idle", outputImages: ["/api/files/a.png"], editPrompt: "x".repeat(501) } }],
        [],
      )),
      (e) => e instanceof WorkflowValidationError && /editPrompt/.test(e.message),
    );
  });

  ok("65d §1.1：image 节点 editPrompt 非字符串 → 拒", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [{ id: "i1", type: "image", position: { x: 0, y: 0 },
           data: { kind: "image", label: "图片", status: "idle", outputImages: ["/api/files/a.png"], editPrompt: 42 } }],
        [],
      )),
      (e) => e instanceof WorkflowValidationError && /editPrompt/.test(e.message),
    );
  });

  ok("65a：image 节点 featherRadius 越界 → 拒（值校验随字段搬家）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [{
          id: "i1", type: "image", position: { x: 0, y: 0 },
          data: { kind: "image", label: "图片", status: "idle", outputImages: ["/api/files/a.png"], featherRadius: 65 },
        }],
        [],
      )),
      (e) => e instanceof WorkflowValidationError && /featherRadius/.test(e.message),
    );
  });

  ok("65a：image 节点 mask 非字符串 → 拒（值校验随字段搬家）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [{
          id: "i1", type: "image", position: { x: 0, y: 0 },
          data: { kind: "image", label: "图片", status: "idle", outputImages: ["/api/files/a.png"], mask: 42 },
        }],
        [],
      )),
      (e) => e instanceof WorkflowValidationError && /mask/.test(e.message),
    );
  });

  // ---------- v8→v9 迁移（64 Phase 1 C2）三态 + flow_json 夹具 ----------
  const V8_VARIANT_ID = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";

  ok("C2 迁移态一：v8 generator 空 text 上游 → 填入预设模板文本", () => {
    const v8 = flow(
      [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: "" } },
        imageNode("i1"),
        { id: "g1", type: "image-generator", position: { x: 380, y: 0 }, data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: V8_VARIANT_ID, modelId: IMAGE_MODEL, aspectRatio: "3:4", batchSize: 1 } },
      ],
      [promptEdge("e1", "t1", "g1"), referenceEdge("e2", "i1", "g1")],
      8,
    );
    const result = validateAndMigrateFlow(v8);
    const t = result.nodes.find((n) => n.id === "t1")!;
    const g = result.nodes.find((n) => n.id === "g1")!;
    const text = (t.data as { text: string }).text;
    // 填入 = 冻结表 fashion-lookbook:edit 文本（逐字，快照测试锁定）
    assert.ok(text.startsWith("GPT Image 2 VIP 多图写实穿搭编辑。"), `填入文本异常: ${text.slice(0, 40)}`);
    assert.equal((g.data as { operationMode?: string }).operationMode, "edit"); // mode 物化
    assert.ok(!("promptVariantId" in (g.data as Record<string, unknown>))); // 绑定剥离
  });

  ok("C2 迁移态二：v8 generator 非空 text 上游 → 保留正文、丢弃绑定（绝不覆盖用户文本）", () => {
    const v8 = flow(
      [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: "用户自己写的提示词" } },
        { id: "g1", type: "image-generator", position: { x: 380, y: 0 }, data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: V8_VARIANT_ID, modelId: IMAGE_MODEL, aspectRatio: "3:4", batchSize: 1 } },
      ],
      [promptEdge("e1", "t1", "g1")],
      8,
    );
    const result = validateAndMigrateFlow(v8);
    const t = result.nodes.find((n) => n.id === "t1")!;
    assert.equal((t.data as { text: string }).text, "用户自己写的提示词");
  });

  ok("C2 迁移态三：v8 generator 无上游 text → 丢弃绑定（text 不填、mode 不写）", () => {
    const v8 = flow(
      [
        imageNode("i1"),
        { id: "g1", type: "image-generator", position: { x: 380, y: 0 }, data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: V8_VARIANT_ID, modelId: IMAGE_MODEL, aspectRatio: "3:4", batchSize: 1 } },
      ],
      [referenceEdge("e2", "i1", "g1")],
      8,
    );
    // INV-1 要求生成节点必须有 prompt 入边——无上游 text 的图本来就被 INV-1 拒绝，
    // 此处验证迁移不抛出与绑定相关的错误；INV-1 拒绝是既有不变量（原样保留）。
    assert.throws(
      () => validateAndMigrateFlow(v8),
      (e) => e instanceof WorkflowValidationError && /上游文本节点/.test(e.message),
    );
  });

  ok("C2 迁移：未知 variantId → 绑定静默丢弃（text 不填、mode 不写）", () => {
    const v8 = flow(
      [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: "" } },
        { id: "g1", type: "image-generator", position: { x: 380, y: 0 }, data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: "no-such-family.gpt-4o.edit.v1", modelId: IMAGE_MODEL, aspectRatio: "3:4", batchSize: 1 } },
      ],
      [promptEdge("e1", "t1", "g1")],
      8,
    );
    const result = validateAndMigrateFlow(v8);
    const t = result.nodes.find((n) => n.id === "t1")!;
    const g = result.nodes.find((n) => n.id === "g1")!;
    assert.equal((t.data as { text: string }).text, "");
    assert.ok(!("operationMode" in (g.data as Record<string, unknown>)));
  });

  ok("C2 迁移：v8 空 promptVariantId（草稿态）→ 无绑定可迁移，v9 合法通过", () => {
    const v8 = flow(
      [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: "" } },
        { id: "g1", type: "image-generator", position: { x: 380, y: 0 }, data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: "", modelId: IMAGE_MODEL, aspectRatio: "3:4", batchSize: 1 } },
      ],
      [promptEdge("e1", "t1", "g1")],
      8,
    );
    const result = validateAndMigrateFlow(v8);
    const g = result.nodes.find((n) => n.id === "g1")!;
    const data = g.data as Record<string, unknown>;
    assert.ok(!("promptVariantId" in data)); // 草稿态概念随 v9 删除：字段剥离
    assert.ok(!("operationMode" in data)); // 缺省 generate
  });

  // 64 Phase 3（3c-3）：C2 非默认模型 variantId 边界。v8 时代存在非默认模型的变体
  // （如 fashion-lookbook.gemini-3.1-flash-image.edit.v1）。冻结绑定表按 familyId+mode
  // 查表、modelId 段不参与解析（promptPresetsFrozenClient VARIANT_ID_PATTERN 语义）——
  // 以下断言以实现真语义为准：非默认模型变体同样命中预设文本与 mode 物化，
  // 且迁移绝不改写节点自身的 modelId（绑定来自变体，模型归节点）。
  ok("C2 迁移（非默认模型）：gemini 变体空 text 上游 → 填入预设模板 + mode 物化 + modelId 不被改写", () => {
    const NON_DEFAULT_MODEL = "gemini-3.1-flash-image";
    const v8 = flow(
      [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: "" } },
        { id: "g1", type: "image-generator", position: { x: 380, y: 0 }, data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: "fashion-lookbook.gemini-3.1-flash-image.edit.v1", modelId: NON_DEFAULT_MODEL, aspectRatio: "3:4", batchSize: 1 } },
      ],
      [promptEdge("e1", "t1", "g1")],
      8,
    );
    const result = validateAndMigrateFlow(v8);
    const g = result.nodes.find((n) => n.id === "g1")!;
    const data = g.data as Record<string, unknown>;
    // 非默认模型变体命中 familyId=fashion-lookbook + mode=edit 的冻结绑定。
    assert.equal(data.operationMode, "edit", "非默认模型变体同样物化 mode");
    const t = result.nodes.find((n) => n.id === "t1")!;
    const text = (t.data as { text?: string }).text ?? "";
    assert.ok(text.trim().length > 0, "空 text 上游必须填入预设模板文本");
    assert.match(text, /GPT Image 2 VIP/, "填入的是 fashion-lookbook:edit 预设模板正文");
    // 迁移绝不改写节点自身 modelId（64 裁决：绑定来自变体，模型归节点）。
    assert.equal(data.modelId, NON_DEFAULT_MODEL, "迁移不得改写非默认模型的 modelId");
    // 六绑定字段全部剥离。
    for (const field of ["promptVariantId", "promptFamilyId", "parameterProfileId", "contractHash", "evaluationVersion", "postprocessVersion"]) {
      assert.ok(!(field in data), `${field} 必须剥离`);
    }
  });

  ok("C2 迁移（非默认模型）：gemini 变体非空 text 上游 → 保留正文 + mode 物化 + modelId 不变", () => {
    const NON_DEFAULT_MODEL = "gemini-3.1-flash-image";
    const USER_TEXT = "用户自己的提示词正文，不得被覆盖";
    const v8 = flow(
      [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: USER_TEXT } },
        { id: "g1", type: "image-generator", position: { x: 380, y: 0 }, data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: "fashion-lookbook.gemini-3.1-flash-image.edit.v1", modelId: NON_DEFAULT_MODEL, aspectRatio: "3:4", batchSize: 1 } },
      ],
      [promptEdge("e1", "t1", "g1")],
      8,
    );
    const result = validateAndMigrateFlow(v8);
    const g = result.nodes.find((n) => n.id === "g1")!;
    const data = g.data as Record<string, unknown>;
    const t = result.nodes.find((n) => n.id === "t1")!;
    assert.equal((t.data as { text?: string }).text, USER_TEXT, "非空正文绝不覆盖");
    assert.equal(data.operationMode, "edit");
    assert.equal(data.modelId, NON_DEFAULT_MODEL);
    assert.ok(!("promptVariantId" in data));
  });

  ok("C2 迁移（非默认模型）：未知 family 组合 → 绑定静默丢弃（fail-closed 不猜）", () => {
    const v8 = flow(
      [
        { id: "t1", type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text: "" } },
        { id: "g1", type: "image-generator", position: { x: 380, y: 0 }, data: { kind: "image-generator", label: "生图", status: "idle", promptVariantId: "no-such-family.gemini-3.1-flash-image.edit.v1", modelId: "gemini-3.1-flash-image", aspectRatio: "3:4", batchSize: 1 } },
      ],
      [promptEdge("e1", "t1", "g1")],
      8,
    );
    const result = validateAndMigrateFlow(v8);
    const g = result.nodes.find((n) => n.id === "g1")!;
    const data = g.data as Record<string, unknown>;
    const t = result.nodes.find((n) => n.id === "t1")!;
    assert.equal((t.data as { text?: string }).text ?? "", "", "未知组合不得填文本");
    assert.ok(!("operationMode" in data), "未知组合不得物化 mode");
    assert.ok(!("promptVariantId" in data));
  });

  ok("C2 迁移 flow_json 夹具：v8 换装项目（2 参考图 + edit 变体）→ v9 全字段快照", () => {
    const v8 = flow(
      [
        { id: "tryon-requirement", type: "text", position: { x: 0, y: -170 }, data: { kind: "text", label: "试穿要求", status: "idle", text: "" } },
        imageNode("garment"),
        imageNode("model"),
        { id: "tryon-gen", type: "image-generator", position: { x: 380, y: 20 }, data: { kind: "image-generator", label: "试穿生成", status: "idle", promptVariantId: V8_VARIANT_ID, promptFamilyId: "fashion-lookbook", parameterProfileId: "gpt-image-2.5-flare-vip:fashion-lookbook:edit:v1", contractHash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", evaluationVersion: "garment-eval-v3-pending", postprocessVersion: "p1", modelId: IMAGE_MODEL, aspectRatio: "3:4", batchSize: 1 } },
      ],
      [
        promptEdge("e-tryon-prompt", "tryon-requirement", "tryon-gen"),
        referenceEdge("e-tryon-garment", "garment", "tryon-gen"),
        referenceEdge("e-tryon-model", "model", "tryon-gen"),
      ],
      8,
    );
    const result = validateAndMigrateFlow(v8);
    assert.equal(result.schemaVersion, 9);
    assert.equal(result.edges.length, 3);
    const g = result.nodes.find((n) => n.id === "tryon-gen")!;
    const data = g.data as Record<string, unknown>;
    // 六字段全剥离
    for (const field of ["promptVariantId", "promptFamilyId", "parameterProfileId", "contractHash", "evaluationVersion", "postprocessVersion"]) {
      assert.ok(!(field in data), `字段 ${field} 应被剥离`);
    }
    assert.equal(data.operationMode, "edit");
    assert.equal(data.modelId, IMAGE_MODEL);
    const t = result.nodes.find((n) => n.id === "tryon-requirement")!;
    assert.ok((t.data as { text: string }).text.startsWith("GPT Image 2 VIP 多图写实穿搭编辑。"));
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
