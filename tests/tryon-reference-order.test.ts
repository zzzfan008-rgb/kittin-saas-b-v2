import assert from "node:assert/strict";
import { orderReferenceUpstream, tryonUpstreamRank } from "../src/lib/referenceOrder";
import { selectAllReferenceOrdinals } from "../src/types/workflow";

// id 命中：garment 在前、model 在后（连线顺序反了也要纠正）。
{
  const upstream = [
    { nodeId: "model", images: ["/api/files/model.jpg"] },
    { nodeId: "garment", images: ["/api/files/garment.jpg"] },
  ];
  orderReferenceUpstream(upstream, "model-tryon", () => "");
  assert.deepEqual(
    upstream.map((u) => u.nodeId),
    ["garment", "model"],
    "边序反了也要按节点身份纠正：图1=服装，图2=模特",
  );
}

// 改名不丢：id 对不上时 label 关键词兜底（用户改了节点名仍按名识别）。
{
  assert.equal(tryonUpstreamRank("custom-1", "我的服装图"), 0);
  assert.equal(tryonUpstreamRank("custom-2", "专属模特"), 1);
  assert.equal(tryonUpstreamRank("custom-3", "背景图"), 2);
  const upstream = [
    { nodeId: "custom-2", images: ["/api/files/b.jpg"] },
    { nodeId: "custom-1", images: ["/api/files/a.jpg"] },
  ];
  orderReferenceUpstream(upstream, "model-tryon", (id) =>
    id === "custom-1" ? "我的服装图" : "专属模特",
  );
  assert.deepEqual(upstream.map((u) => u.nodeId), ["custom-1", "custom-2"]);
}

// 用户删节点重建：id/label 都对不上 → 保持原顺序（fail-open，不拦运行）。
{
  const upstream = [
    { nodeId: "x", images: ["/api/files/x.jpg"] },
    { nodeId: "y", images: ["/api/files/y.jpg"] },
  ];
  orderReferenceUpstream(upstream, "model-tryon", () => "随手拍");
  assert.deepEqual(upstream.map((u) => u.nodeId), ["x", "y"]);
}

// 非 tryon 族：不改动（其他 11 族工作流不受影响）。
{
  const upstream = [
    { nodeId: "model", images: ["/api/files/model.jpg"] },
    { nodeId: "garment", images: ["/api/files/garment.jpg"] },
  ];
  orderReferenceUpstream(upstream, undefined, () => "");
  orderReferenceUpstream(upstream, "lookbook", () => "");
  assert.deepEqual(upstream.map((u) => u.nodeId), ["model", "garment"]);
}

// 徽标侧一致：selectAllReferenceOrdinals 同样按节点身份编号（边序反转也图1=服装）。
{
  const nodes = [
    { id: "garment", data: { kind: "image", label: "服装图" } },
    { id: "model", data: { kind: "image", label: "数字模特" } },
    { id: "tryon-gen", data: { kind: "image-generator", label: "试穿生成", familyId: "model-tryon" } },
  ];
  const edges = [
    { source: "model", target: "tryon-gen", targetHandle: "reference" },
    { source: "garment", target: "tryon-gen", targetHandle: "reference" },
  ];
  const m = selectAllReferenceOrdinals(nodes as never, edges as never);
  assert.equal(m.get("garment")?.[0]?.ordinal, 1, "徽标：服装=图1");
  assert.equal(m.get("model")?.[0]?.ordinal, 2, "徽标：模特=图2");
}

console.log("模特试穿参考图顺序 契约测试通过");
