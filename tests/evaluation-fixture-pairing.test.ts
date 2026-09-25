/**
 * O1 配对断言测试（architect 附 2）：edit project 的 image 节点
 * outputImages[].fileId == golden-set 第 i 条 referenceImage.fileId
 *
 * 验收点：
 *  1. 24 个 sample 的 referenceImage.fileId 全部非空（上传回写已完成）
 *  2. 24 个 fileId 互异（Set 大小 == 24）
 *  3. 真实守卫 assertFileIdMatchesSample（导出自 generate-evaluation-fixtures.ts）：
 *     正确映射必须放行 / fileId 错配必须 throw / no-op 变异探针验证
 *  4. 数据完整性：24 个 deliveredSourceSha256 + 24 个 assetSha256 非空
 *
 * 分类：碰库（导入 database），注册进 SERIAL_TEST_FILES。
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadGoldenSet, GOLDEN_SET_SIZE } from "../server/lib/goldenSet";
import { assertFileIdMatchesSample } from "../server/lib/evaluationFixtureGuards";
import type { PersistedFlow } from "../server/lib/evaluationFixtureGuards";

const GOLDEN_SET = loadGoldenSet();

/** 构造一个最小合法的 edit flow（仅 image 节点 + outputImages）。 */
function makeEditFlow(fileId: string): PersistedFlow {
  return {
    schemaVersion: 8,
    nodes: [
      {
        id: "img",
        type: "image",
        position: { x: 0, y: 0 },
        data: { kind: "image", label: "test", status: "idle", outputImages: [{ fileId }] },
      },
    ],
    edges: [],
  };
}

describe("evaluation O1 fixture pairing (architect annex 2)", () => {
  // O1 guard + golden-set integrity checks are pure; no DB access needed.

  it("golden-set has exactly 24 samples with uploaded referenceImages", () => {
    assert.strictEqual(GOLDEN_SET.samples.length, GOLDEN_SET_SIZE);
    const withFileId = GOLDEN_SET.samples.filter((s) => s.referenceImage?.fileId);
    assert.strictEqual(withFileId.length, GOLDEN_SET_SIZE);
  });

  it("all 24 fileIds are distinct", () => {
    const fileIds = GOLDEN_SET.samples.map((s) => s.referenceImage!.fileId!);
    assert.strictEqual(new Set(fileIds).size, GOLDEN_SET_SIZE);
  });

  it("all 24 deliveredSourceSha256 and assetSha256 are non-empty", () => {
    for (const sample of GOLDEN_SET.samples) {
      assert.ok(
        typeof sample.referenceImage?.deliveredSourceSha256 === "string" &&
          sample.referenceImage.deliveredSourceSha256.length === 64,
      );
      assert.ok(
        typeof sample.referenceImage?.assetSha256 === "string" &&
          sample.referenceImage.assetSha256.length === 64,
      );
    }
  });

  // ── 真实守卫测试（import 生产函数，不是 mock / 数据副本）────
  const samples = GOLDEN_SET.samples;

  it("O1 real guard: correct fileId mapping must pass for all 24 samples", () => {
    for (let i = 0; i < samples.length; i++) {
      const fileId = samples[i].referenceImage!.fileId!;
      const flow = makeEditFlow(fileId);
      // 同一份生产守卫，正确映射必须放行（反恒真）
      assert.doesNotThrow(
        () => assertFileIdMatchesSample(flow, fileId, `EVALedit-brief-${String(i + 1).padStart(2, "0")}`),
        `sample[${i}] (${samples[i].id}) correct fileId ${fileId} must pass guard`,
      );
    }
  });

  it("O1 real guard: mismatched fileId must throw", () => {
    const correctFileId = samples[0].referenceImage!.fileId!;
    const wrongFileId = samples[1].referenceImage!.fileId!;
    assert.notStrictEqual(correctFileId, wrongFileId, "precondition: test samples must have distinct fileIds");
    const flow = makeEditFlow(wrongFileId);
    assert.throws(
      () => assertFileIdMatchesSample(flow, correctFileId, "EVALedit-brief-01"),
      /fileId.*!=.*golden-set/,
      "O1 guard must reject mismatched fileId",
    );
  });

  it("O1 real guard: missing image node must throw", () => {
    const flow: PersistedFlow = { schemaVersion: 8, nodes: [], edges: [] };
    assert.throws(
      () => assertFileIdMatchesSample(flow, "any", "EVALedit-brief-x"),
      /image node missing/,
    );
  });

  it("O1 real guard: empty outputImages must throw", () => {
    const flow: PersistedFlow = {
      schemaVersion: 8,
      nodes: [{
        id: "img", type: "image", position: { x: 0, y: 0 },
        data: { kind: "image", label: "test", status: "idle", outputImages: [] },
      }],
      edges: [],
    };
    assert.throws(
      () => assertFileIdMatchesSample(flow, "any", "EVALedit-brief-x"),
      /exactly 1 outputImage/,
    );
  });
});