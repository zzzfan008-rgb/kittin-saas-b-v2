// 65d v2 editDraftUpload 单测：锁 JSON {dataUrl, projectId, nodeId} 传输契约
//（与 mask-upload.test.ts 同款模式；FormData/multipart 是回归面，必须被断言拒绝）。
import assert from "node:assert/strict";
import { uploadEditDraft } from "../src/lib/editDraftUpload";

console.log("edit-draft 上传契约测试");

const request = {
  dataUrl: "data:image/png;base64,cG5n",
  projectId: "project-a",
  nodeId: "image-node",
};

let submittedUrl: string | undefined;
let submittedInit: RequestInit | undefined;
let submittedBody: unknown;
const successfulFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  submittedUrl = String(input);
  submittedInit = init;
  submittedBody = JSON.parse(String(init?.body));
  return Response.json({
    id: "edit-draft.png",
    url: "/api/files/edit-draft.png",
    mimeType: "image/png",
    width: 1024,
    height: 1024,
    byteLength: 4321,
  });
}) as typeof fetch;

const uploaded = await uploadEditDraft(request, successfulFetch);
assert.equal(submittedUrl, "/api/files/edit-draft");
// 契约锁定：JSON body 恰为 {dataUrl, projectId, nodeId}——无 sourceRef、非 FormData。
assert.deepEqual(submittedBody, {
  dataUrl: request.dataUrl,
  projectId: request.projectId,
  nodeId: request.nodeId,
});
assert.equal(
  (submittedInit?.headers as Record<string, string>)?.["Content-Type"],
  "application/json",
);
assert.equal(uploaded.url, "/api/files/edit-draft.png");
assert.equal(uploaded.id, "edit-draft.png");
assert.equal(uploaded.width, 1024);
assert.equal(uploaded.height, 1024);
assert.equal(uploaded.byteLength, 4321);
console.log("  ✓ JSON 传输 {dataUrl, projectId, nodeId}，无 sourceRef/FormData");

// server 尺寸上限错误（400 + error 文案）原样抛给面板状态行。
await assert.rejects(
  () =>
    uploadEditDraft(request, (async () =>
      Response.json(
        { error: "编辑输入图边长超过上限（3840px），请先缩小" },
        { status: 400 },
      )) as typeof fetch),
  /编辑输入图边长超过上限/,
);
console.log("  ✓ 400 尺寸上限文案原样抛出");

// 缺 url 的响应按格式错误拒绝。
await assert.rejects(
  () => uploadEditDraft(request, (async () => Response.json({ id: "x" })) as typeof fetch),
  /缺少 url/,
);
console.log("  ✓ 响应缺 url 拒绝");

// 参数缺失拒绝且不发请求。
let fetched = 0;
await assert.rejects(
  () =>
    uploadEditDraft(
      { ...request, nodeId: " " },
      (async () => {
        fetched += 1;
        return Response.json({});
      }) as typeof fetch,
    ),
  /参数缺失/,
);
assert.equal(fetched, 0);
console.log("  ✓ 空 nodeId 拒绝且不发请求");

console.log("edit-draft 上传契约测试通过");
