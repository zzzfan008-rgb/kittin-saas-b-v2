/**
 * v7 schema 图级规则回归测试（R-53 P2-b，纯逻辑，不调真实 API/DB）。
 * 覆盖：INV-1（image/video 必须有 text 上游）、边 handle 类型校验（fabric/garment 拒绝、
 * image→text 拒绝、text→text 串联允许）、v6 及以下一律拒绝、入边限位。
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

function textNode(id: string, text = "设计一套现代都市女装"): Record<string, unknown> {
  return { id, type: "text", position: { x: 0, y: 0 }, data: { kind: "text", label: "提示词", status: "idle", text } };
}

function imageNode(id: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    type: "image",
    position: { x: 380, y: 0 },
    data: { kind: "image", label: "图片", status: "idle", aspectRatio: "3:4", batchSize: 1, outputImages: [], ...extra },
  };
}

function videoNode(id: string): Record<string, unknown> {
  return { id, type: "video", position: { x: 380, y: 0 }, data: { kind: "video", label: "视频", status: "idle", outputVideos: [] } };
}

function flow(nodes: unknown[], edges: unknown[], version = 7): unknown {
  return { schemaVersion: version, nodes, edges };
}

const textEdge = (id: string, source: string, target: string, targetHandle = "prompt") =>
  ({ id, source, target, targetHandle, data: {} });
const imageEdge = (id: string, source: string, target: string) =>
  ({ id, source, target, targetHandle: "reference", data: {} });

function main() {
  console.log("workflowSchema v7 图级规则回归测试");

  ok("v7 合法：text → image（prompt 边）通过", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), imageNode("i1")],
      [textEdge("e1", "t1", "i1")],
    ));
    assert.equal(result.schemaVersion, 7);
    assert.equal(result.nodes.length, 2);
  });

  ok("INV-1：image 节点无 text 上游被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([imageNode("i1")], [])),
      WorkflowValidationError,
    );
    try {
      validateAndMigrateFlow(flow([imageNode("i1")], []));
    } catch (error) {
      assert.match(error instanceof Error ? error.message : "", /上游文本节点/);
    }
  });

  ok("INV-1：video 节点无 text 上游被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([videoNode("v1")], [])),
      WorkflowValidationError,
    );
  });

  ok("边 handle：旧 fabric handle 被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [textNode("t1"), imageNode("i1"), imageNode("i2")],
        [
          textEdge("e1", "t1", "i1"),
          { id: "e2", source: "i1", target: "i2", targetHandle: "fabric", data: {} },
        ],
      )),
      WorkflowValidationError,
    );
  });

  ok("边 handle：旧 garment handle 被拒绝", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [textNode("t1"), imageNode("i1"), imageNode("i2")],
        [
          textEdge("e1", "t1", "i1"),
          { id: "e2", source: "i1", target: "i2", targetHandle: "garment", data: {} },
        ],
      )),
      WorkflowValidationError,
    );
  });

  ok("边 handle：image → text 被拒绝（text 节点无图片入边）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [textNode("t1"), imageNode("i1"), textNode("t2")],
        [textEdge("e1", "t1", "i1"), imageEdge("e2", "i1", "t2")],
      )),
      WorkflowValidationError,
    );
  });

  ok("边 handle：prompt 边只能来自 text 节点", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow(
        [textNode("t1"), imageNode("i1"), imageNode("i2")],
        [textEdge("e1", "t1", "i1"), textEdge("e2", "i1", "i2")],
      )),
      WorkflowValidationError,
    );
  });

  ok("text → text 串联边允许（Q1=B）", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), textNode("t2"), imageNode("i1")],
      [textEdge("e1", "t1", "t2"), textEdge("e2", "t2", "i1")],
    ));
    assert.equal(result.nodes.length, 3);
  });

  ok("image 边（reference）允许 image → image", () => {
    const result = validateAndMigrateFlow(flow(
      [textNode("t1"), imageNode("i1"), imageNode("i2")],
      [textEdge("e1", "t1", "i1"), imageEdge("e2", "i1", "i2"), textEdge("e3", "t1", "i2")],
    ));
    assert.equal(result.nodes.length, 3);
  });

  ok("v6 及以下一律拒绝（R7 无迁移）", () => {
    assert.throws(
      () => validateAndMigrateFlow(flow([textNode("t1"), imageNode("i1")], [textEdge("e1", "t1", "i1")], 6)),
      /旧版本格式/,
    );
    assert.throws(
      () => validateAndMigrateFlow({ schemaVersion: undefined, nodes: [], edges: [] }),
      /旧版本格式/,
    );
  });

  ok("image 节点入边限位：text 边 ≤8", () => {
    const textNodes = Array.from({ length: 9 }, (_, i) => textNode(`t${i}`));
    const edges = textNodes.map((node, i) => textEdge(`e${i}`, node.id, "i1"));
    assert.throws(
      () => validateAndMigrateFlow(flow([...textNodes, imageNode("i1")], edges)),
      WorkflowValidationError,
    );
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
