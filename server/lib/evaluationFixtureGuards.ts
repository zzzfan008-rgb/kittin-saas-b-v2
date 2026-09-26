/**
 * 评估夹具守卫函数（共享模块，零副作用，夹具脚本和测试同用）。
 *
 * 裁决 D：edit project 的 image 节点 outputImages[].fileId 必须等于
 * golden-set 对应条目的 referenceImage.fileId（单一事实源）。
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

/** 裁决 D：edit project 的 fileId 与 sampleIdx 对应条相等（单一事实源）。 */
export function assertFileIdMatchesSample(
  flow: PersistedFlow,
  expectedFileId: string,
  projectId: string,
): void {
  const imageNode = flow.nodes.find((n) => n.type === "image");
  assert.ok(imageNode, `${projectId}: image node missing`);
  const outputImages = imageNode.data.outputImages as Array<{ fileId: string }>;
  assert.ok(
    Array.isArray(outputImages) && outputImages.length === 1,
    `${projectId}: expected exactly 1 outputImage`,
  );
  assert.strictEqual(
    outputImages[0].fileId,
    expectedFileId,
    `${projectId}: outputImages fileId ${outputImages[0].fileId} != golden-set referenceImage.fileId ${expectedFileId} (ruling D)`,
  );
}