/**
 * 生成节点 → 结果节点溯源边回归（用户 2026-10-28：生成节点的右边连线必须和结果节点连接）。
 *
 * 锁定四件事：
 *  1. 打开文档时，凡是能追溯到来源生成节点的结果节点，都必须有 result 边（老项目回填）；
 *  2. 来源生成节点已删除（dangling-result-source）时不补边，结果作为孤儿产物保留；
 *  3. 连线校验：生成节点 → 结果节点走 result 句柄合法，其余生成节点出边仍一律拒绝；
 *  4. 边 id 稳定（e-result-<resultNodeId>），重复回填不产生重复边。
 */
import assert from "node:assert/strict";

const {
  normalizeFlowForDocumentRead,
  isV8ConnectionValid,
  readFlowDocumentForOpen,
  resolveSourceHandleId,
} = await import("../src/lib/documentSnapshot");
const { EDGE_HANDLE_RESULT, EDGE_HANDLE_PROMPT } = await import("../src/types/workflow");

console.log("生成节点 → 结果节点溯源边");

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const generator = {
  id: "gen-1",
  type: "image-generator",
  position: { x: 0, y: 0 },
  data: {
    kind: "image-generator",
    label: "生图",
    status: "idle",
    operationMode: "edit",
    modelId: "gpt-image-2.5-flare",
    modelOptions: {},
    aspectRatio: "1:1",
    batchSize: 1,
  },
};

const textNode = {
  id: "text-1",
  type: "text",
  position: { x: -380, y: 0 },
  data: { kind: "text", label: "提示词", status: "idle", text: "换装" },
};

const resultNode = {
  id: "res-1",
  type: "result-image",
  position: { x: 380, y: 0 },
  data: {
    kind: "result-image",
    label: "图片结果",
    status: "success",
    images: ["/api/files/out.png"],
    sourceGeneratorId: "gen-1",
    runId: "run-1",
  },
};

ok("老文档缺边 → 打开时按 sourceGeneratorId 补齐 result 边", () => {
  const out = normalizeFlowForDocumentRead({
    nodes: [textNode, generator, resultNode] as never,
    edges: [],
  });
  const resultEdge = out.edges.find((edge) => edge.target === "res-1");
  assert.ok(resultEdge, "结果节点必须补出溯源边");
  assert.equal(resultEdge!.source, "gen-1");
  assert.equal(resultEdge!.targetHandle, EDGE_HANDLE_RESULT);
  assert.equal(resultEdge!.sourceHandle, EDGE_HANDLE_RESULT);
  assert.equal(resultEdge!.id, "e-result-res-1");
});

ok("来源生成节点已删除（孤儿产物）→ 不补边，结果节点仍保留", () => {
  const orphan = {
    ...resultNode,
    id: "res-orphan",
    data: { ...resultNode.data, sourceGeneratorId: "gen-deleted" },
  };
  const out = normalizeFlowForDocumentRead({
    nodes: [textNode, generator, orphan] as never,
    edges: [],
  });
  assert.equal(out.edges.some((edge) => edge.target === "res-orphan"), false);
  assert.ok(out.nodes.some((node) => node.id === "res-orphan"), "孤儿结果节点必须保留");
});

ok("已有 result 边 → 不重复回填", () => {
  const existing = {
    id: "e-result-res-1",
    source: "gen-1",
    sourceHandle: EDGE_HANDLE_RESULT,
    target: "res-1",
    targetHandle: EDGE_HANDLE_RESULT,
    data: {},
  };
  const out = normalizeFlowForDocumentRead({
    nodes: [textNode, generator, resultNode] as never,
    edges: [existing] as never,
  });
  const resultEdges = out.edges.filter((edge) => edge.target === "res-1");
  assert.equal(resultEdges.length, 1, "回填必须幂等");
});

ok("连线校验：生成节点 → 结果节点（result 句柄）合法", () => {
  const document = {
    nodes: [textNode, generator, resultNode],
    edges: [],
  } as never;
  assert.equal(
    isV8ConnectionValid(document, {
      source: "gen-1",
      target: "res-1",
      sourceHandle: EDGE_HANDLE_RESULT,
      targetHandle: EDGE_HANDLE_RESULT,
    } as never),
    true,
  );
});

ok("连线校验：生成节点出边走 prompt 句柄仍被拒（不得退化成普通数据流）", () => {
  const document = {
    nodes: [textNode, generator, resultNode],
    edges: [],
  } as never;
  assert.equal(
    isV8ConnectionValid(document, {
      source: "gen-1",
      target: "res-1",
      targetHandle: EDGE_HANDLE_PROMPT,
    } as never),
    false,
  );
});

ok("连线校验：result 句柄不接非结果节点", () => {
  const document = {
    nodes: [textNode, generator, resultNode],
    edges: [],
  } as never;
  assert.equal(
    isV8ConnectionValid(document, {
      source: "gen-1",
      target: "gen-1",
      targetHandle: EDGE_HANDLE_RESULT,
    } as never),
    false,
  );
});

ok("源句柄物化：text → prompt、生成节点 → result（否则 React Flow 按 id 匹配失败会静默丢边）", () => {
  assert.equal(resolveSourceHandleId("text"), "prompt");
  assert.equal(resolveSourceHandleId("image-generator"), "result");
  assert.equal(resolveSourceHandleId("video-generator"), "result");
  assert.equal(resolveSourceHandleId("image"), null, "图片节点输出柄无 id，边不得写 sourceHandle");
  assert.equal(resolveSourceHandleId("result-image"), null);
});

ok("打开路径（flow → readFlowDocumentForOpen）同样物化 sourceHandle", async () => {
  const flow = {
    schemaVersion: 9,
    nodes: [textNode, generator, resultNode],
    edges: [
      { id: "e-tryon-prompt", source: "text-1", target: "gen-1", targetHandle: "prompt", data: {} },
    ],
  };
  const out = readFlowDocumentForOpen(flow);
  const edge = out.flow.edges.find((e) => e.id === "e-tryon-prompt");
  assert.ok(edge);
  assert.equal(edge!.sourceHandle, "prompt");
});

console.log(`通过 ${passed} 项`);
