/**
 * 评估夹具守卫函数（共享模块，零副作用，夹具脚本和测试同用）。
 *
 * 裁决 D：edit project 的 image 节点 outputImages[0] 必须严格等于
 * "/api/files/" + golden-set 对应条目的 referenceImage.fileId（单一事实源）。
 *
 * P0 修复（2026-09-26）：生产 schema（workflowSchema.ts imageReference()）要求
 * outputImages 元素是 canonical 字符串 "/api/files/<fileId>"（真实用户 project
 * 形态，如 fhWfdvCdOT: "/api/files/rB4CnJJMyeXR.jpg"）。旧守卫断言对象形态
 * {fileId}，与 validateAndMigrateFlow 直接冲突——24 个 edit 夹具全部无法通过
 * 生产校验。现守卫写死严格 canonical 形态：对象 / 裸 id / 错 fileId 三种
 * 变异都红（hermes P0 停机令要求的三形态变异探针）。
 */

import assert from "node:assert/strict";

// ── types ──────────────────────────────────────────────────────────────

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  width?: number;
  height?: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  data?: Record<string, unknown>;
  targetHandle?: string;
  sourceHandle?: string;
}

export interface PersistedFlow {
  schemaVersion: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// ── guard ──────────────────────────────────────────────────────────────

/** Canonical production form of an image reference (workflowSchema imageReference). */
export const IMAGE_REF_PREFIX = "/api/files/";

/** Build the canonical outputImages entry for a bare fileId. */
export function canonicalImageRef(fileId: string): string {
  return IMAGE_REF_PREFIX + fileId;
}

/**
 * 裁决 D：edit project 的 outputImages[0] 必须严格等于
 * canonicalImageRef(golden-set referenceImage.fileId)。
 *
 * 变异形态全部红：对象 {fileId}（旧缺陷形态）/ 裸 id（无前缀）/ 错 fileId。
 */
export function assertFileIdMatchesSample(
  flow: PersistedFlow,
  expectedFileId: string,
  projectId: string,
): void {
  const imageNode = flow.nodes.find((n) => n.type === "image");
  assert.ok(imageNode, `${projectId}: image node missing`);
  const outputImages = imageNode.data.outputImages as unknown;
  assert.ok(
    Array.isArray(outputImages) && outputImages.length === 1,
    `${projectId}: expected exactly 1 outputImage`,
  );
  const actual = (outputImages as unknown[])[0];
  assert.strictEqual(
    typeof actual,
    "string",
    `${projectId}: outputImages[0] must be a canonical string ` +
      `"${IMAGE_REF_PREFIX}<fileId>", got ${typeof actual} ` +
      `(object form {fileId} violates production schema imageReference())`,
  );
  assert.strictEqual(
    actual,
    canonicalImageRef(expectedFileId),
    `${projectId}: outputImages[0] "${String(actual)}" != canonical ` +
      `"${canonicalImageRef(expectedFileId)}" (ruling D; bare ids without ` +
      `the ${IMAGE_REF_PREFIX} prefix are rejected)`,
  );
}
