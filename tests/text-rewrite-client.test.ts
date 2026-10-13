// 提示词改写客户端契约测试（契约 plan.md §2.2）。
// 与 edit-draft-upload.test.ts 同款模式：注入 mock fetch，锁 JSON 传输与降级语义。
import assert from "node:assert/strict";
import { rewritePromptText } from "../src/lib/textRewriteClient";

console.log("提示词改写客户端契约测试");

const baseRequest = { text: "一件白色棉质衬衫", projectId: "project-a", nodeId: "text-node-1" };

// ---------- 1. 成功 200 {rewritten} → 返回改写文本 ----------
let submittedUrl: string | undefined;
let submittedInit: RequestInit | undefined;
let submittedBody: unknown;
const successFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  submittedUrl = String(input);
  submittedInit = init;
  submittedBody = JSON.parse(String(init?.body));
  return Response.json({ rewritten: "一件白色棉质衬衫，室内柔和自然光，中景镜头，浅色调构图" });
}) as typeof fetch;

const result = await rewritePromptText(baseRequest, successFetch);
assert.equal(submittedUrl, "/api/text/rewrite");
assert.equal(
  (submittedInit?.headers as Record<string, string>)?.["Content-Type"],
  "application/json",
);
assert.deepEqual(submittedBody, {
  text: "一件白色棉质衬衫",
  projectId: "project-a",
  nodeId: "text-node-1",
});
assert.equal(result.rewritten, "一件白色棉质衬衫，室内柔和自然光，中景镜头，浅色调构图");
assert.equal(result.skipped, undefined);
console.log("  ✓ 成功 200 {rewritten} 返回改写文本，JSON body 形状正确");

// ---------- 2. 200 {rewritten:null, skipped:true} → 返回 null（静默降级） ----------
const skippedResult = await rewritePromptText(
  baseRequest,
  (async () => Response.json({ rewritten: null, skipped: true })) as typeof fetch,
);
assert.equal(skippedResult.rewritten, null);
assert.equal(skippedResult.skipped, true);
console.log("  ✓ 200 {rewritten:null,skipped:true} 返回 null（静默降级，不抛错）");

// ---------- 3. 200 {rewritten:null} 无 skipped 字段 → 也返回 null ----------
const nullOnlyResult = await rewritePromptText(
  baseRequest,
  (async () => Response.json({ rewritten: null })) as typeof fetch,
);
assert.equal(nullOnlyResult.rewritten, null);
assert.equal(nullOnlyResult.skipped, false);
console.log("  ✓ 200 {rewritten:null} 无 skipped 字段也返回 null");

// ---------- 4. 403 只读项目 → 抛错 ----------
await assert.rejects(
  () =>
    rewritePromptText(
      baseRequest,
      (async () =>
        Response.json({ error: "只读项目不能改写提示词" }, { status: 403 })) as typeof fetch,
    ),
  /只读项目不能改写提示词/,
);
console.log("  ✓ 403 只读项目抛出 server 错误文案");

// ---------- 5. 400 参数非法 → 抛错 ----------
await assert.rejects(
  () =>
    rewritePromptText(
      baseRequest,
      (async () =>
        Response.json({ error: "text 不能为空", code: "invalid_request" }, { status: 400 })) as typeof fetch,
    ),
  /text 不能为空/,
);
console.log("  ✓ 400 参数非法抛出错误文案");

// ---------- 6. 500 服务端错误 → 抛错 ----------
await assert.rejects(
  () =>
    rewritePromptText(
      baseRequest,
      (async () => Response.json({ error: "Internal Server Error" }, { status: 500 })) as typeof fetch,
    ),
  /Internal Server Error/,
);
console.log("  ✓ 500 服务端错误抛出错误文案");

// ---------- 7. 网络错误 → 抛错 ----------
await assert.rejects(
  () =>
    rewritePromptText(
      baseRequest,
      (async () => {
        throw new TypeError("Failed to fetch");
      }) as typeof fetch,
    ),
  /Failed to fetch/,
);
console.log("  ✓ 网络错误透传");

// ---------- 8. 非 JSON 响应 → 抛错 ----------
await assert.rejects(
  () =>
    rewritePromptText(
      baseRequest,
      (async () => new Response("not json", { status: 200, headers: { "Content-Type": "text/plain" } })) as typeof fetch,
    ),
  /响应格式无效/,
);
console.log("  ✓ 非 JSON 成功响应抛出格式错误");

// ---------- 9. 参数缺失不发请求 ----------
let fetchCount = 0;
const countingFetch = (async () => {
  fetchCount += 1;
  return Response.json({ rewritten: "x" });
}) as typeof fetch;

await assert.rejects(
  () => rewritePromptText({ text: "", projectId: "p" }, countingFetch),
  /改写参数缺失/,
);
await assert.rejects(
  () => rewritePromptText({ text: "有内容", projectId: "" }, countingFetch),
  /改写参数缺失/,
);
assert.equal(fetchCount, 0);
console.log("  ✓ 空 text / 空 projectId 拒绝且不发请求");

// ---------- 10. nodeId 可选：省略时 body 不含 nodeId ----------
let bodyWithoutNodeId: unknown;
await rewritePromptText(
  { text: "只有正文", projectId: "project-b" },
  (async (_url: RequestInfo | URL, init?: RequestInit) => {
    bodyWithoutNodeId = JSON.parse(String(init?.body));
    return Response.json({ rewritten: "补全后" });
  }) as typeof fetch,
);
assert.deepEqual(bodyWithoutNodeId, { text: "只有正文", projectId: "project-b" });
assert.ok(!("nodeId" in (bodyWithoutNodeId as Record<string, unknown>)), "nodeId 应被省略");
console.log("  ✓ nodeId 可选：省略时 body 不含 nodeId 字段");

// ---------- 11. text 前后空格被 trim ----------
let trimmedBody: { text?: string } = {};
await rewritePromptText(
  { text: "  有空格的正文  ", projectId: "p" },
  (async (_url: RequestInfo | URL, init?: RequestInit) => {
    trimmedBody = JSON.parse(String(init?.body));
    return Response.json({ rewritten: "结果" });
  }) as typeof fetch,
);
assert.equal(trimmedBody.text, "有空格的正文");
console.log("  ✓ text 前后空格被 trim");

// ---------- 12. 改写结果 trim ----------
const paddedResult = await rewritePromptText(
  baseRequest,
  (async () => Response.json({ rewritten: "  补全结果带空格  " })) as typeof fetch,
);
assert.equal(paddedResult.rewritten, "补全结果带空格");
console.log("  ✓ 改写结果前后空格被 trim");

console.log("\n通过 12 项");
