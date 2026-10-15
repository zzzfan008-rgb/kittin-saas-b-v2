import assert from "node:assert/strict";
import { collectLocalImageRefs, stripLocalImageRefs } from "../server/lib/localImageRefs";

// 递归收集：任意层级的本地图片引用都要命中；视频/远程/非法形态不收集。
{
  const flow = {
    nodes: [
      { id: "n1", data: { outputImages: ["/api/files/a.png"], mask: "/api/files/b.jpg", maskSourceRef: "/api/files/b.jpg" } },
      { id: "n2", data: { editInputRef: "/api/files/c.webp", note: "https://x/y.png", vid: "/api/files/v.mp4" } },
    ],
  };
  const refs = collectLocalImageRefs(flow);
  assert.deepEqual(
    [...refs].sort(),
    ["/api/files/a.png", "/api/files/b.jpg", "/api/files/c.webp"],
    "只收 png/jpg/webp/gif 单段引用；排除远程与视频",
  );
}

// 递归剥除：数组元素移除（outputImages），对象属性置 null（mask/maskSourceRef/editInputRef）。
{
  const flow = {
    nodes: [
      { id: "n1", data: { outputImages: ["/api/files/a.png", "/api/files/keep.png"], mask: "/api/files/a.png", maskSourceRef: "/api/files/a.png", editInputRef: "/api/files/a.png" } },
    ],
  };
  const { value, removed } = stripLocalImageRefs(flow, (ref) => ref === "/api/files/a.png");
  assert.equal(removed, 4, "命中 4 处：1 个数组元素 + 3 个标量");
  const data = (value as typeof flow).nodes[0].data;
  assert.deepEqual(data.outputImages, ["/api/files/keep.png"], "被删的出图从数组移除，保留其余");
  assert.equal(data.mask, null);
  assert.equal(data.maskSourceRef, null);
  assert.equal(data.editInputRef, null);
}

// 未命中时不应改动结构，removed 为 0（幂等前提）。
{
  const flow = { nodes: [{ data: { outputImages: ["/api/files/x.png"] } }] };
  const { value, removed } = stripLocalImageRefs(flow, (ref) => ref === "/api/files/other.png");
  assert.equal(removed, 0);
  assert.deepEqual(value, flow);
}

console.log("本地图片引用收集/剥除 契约测试通过");
