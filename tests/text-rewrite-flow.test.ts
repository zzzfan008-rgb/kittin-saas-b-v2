// 「✨ 帮我补全」编排单测（P1：未保存草稿必 404 修复，纯逻辑依赖注入，无 DOM 不碰库）。
// 覆盖：先保存再改写（时序）、保存失败不发改写、200 写回、403 只读透出、404 兜底透出、
// 200+null 静默降级、空正文双不发、busy 生命周期。
import assert from "node:assert/strict";
import { runPromptRewriteFlow } from "../src/lib/textRewriteFlow";
import { rewritePromptText } from "../src/lib/textRewriteClient";

console.log("text-rewrite-flux：先保存再改写编排测试");

interface Records {
  order: string[];
  busy: boolean[];
  error: string | null;
  committedText: string[];
}

function makeDeps(overrides: {
  saveOk: boolean;
  fetch: typeof fetch;
}): { deps: Parameters<typeof runPromptRewriteFlow>[1]; records: Records } {
  const records: Records = { order: [], busy: [], error: "INIT" as unknown as string, committedText: [] };
  const deps = {
    saveProject: async () => {
      records.order.push("save");
      return overrides.saveOk;
    },
    rewrite: (args: { text: string; projectId: string; nodeId?: string }) => {
      records.order.push("rewrite");
      // 走真实 client（注入 mock fetch），双端传输/降级语义一并覆盖。
      return rewritePromptText(args, overrides.fetch);
    },
    commit: (text: string) => { records.committedText.push(text); },
    setError: (message: string | null) => { records.error = message; },
    setBusy: (busy: boolean) => { records.busy.push(busy); },
  };
  return { deps, records };
}

const ARGS = { text: "一件白衬衫", projectId: "proj-a", nodeId: "n-1" };
const okFetch = (async () =>
  Response.json({ rewritten: "一件白衬衫，柔和光线，中景镜头，浅色调构图" })) as typeof fetch;

// ---------- 1. 草稿态 saveProject 成功 + fetch 200 → 写回正文；save 必在 rewrite 前 ----------
{
  const ok = makeDeps({ saveOk: true, fetch: okFetch });
  const outcome = await runPromptRewriteFlow(ARGS, ok.deps);
  assert.equal(outcome.committed, true);
  assert.deepEqual(ok.records.order, ["save", "rewrite"], "必须先保存再改写（防草稿 404）");
  assert.deepEqual(ok.records.committedText, ["一件白衬衫，柔和光线，中景镜头，浅色调构图"]);
  assert.equal(ok.records.error, null, "成功时错误为 null");
  assert.deepEqual(ok.records.busy, [true, false], "busy 开→关一次");
  console.log("  ✓ 草稿先保存再改写，200 写回正文，时序 save→rewrite");
}

// ---------- 2. saveProject false → 不发 fetch，显示「项目保存失败，请先保存项目」 ----------
{
  const saved = { calls: 0 };
  const recordFetch: typeof fetch = (async () => { saved.calls += 1; return Response.json({ rewritten: "x" }); }) as typeof fetch;
  const fail = makeDeps({ saveOk: false, fetch: recordFetch });
  const outcome = await runPromptRewriteFlow(ARGS, fail.deps);
  assert.equal(outcome.committed, false);
  assert.deepEqual(fail.records.order, ["save"], "保存失败不得发改写");
  assert.equal(saved.calls, 0, "保存失败不得发任何 fetch");
  assert.equal(fail.records.error, "项目保存失败，请先保存项目");
  assert.equal(fail.records.committedText.length, 0, "保存失败不得写回正文");
  assert.deepEqual(fail.records.busy, [true, false]);
  console.log("  ✓ 保存失败不发改写请求，提示「项目保存失败，请先保存项目」");
}

// ---------- 3. 已保存路径 200 rewritten → 不回归（写回正文） ----------
{
  const ok = makeDeps({ saveOk: true, fetch: okFetch });
  const outcome = await runPromptRewriteFlow(ARGS, ok.deps);
  assert.equal(outcome.committed, true, "200 rewritten 必须写回（回归护栏）");
  assert.equal(ok.records.error, null);
  console.log("  ✓ 已保存路径 200 rewritten 正常写回（不回归）");
}

// ---------- 4. 403 → 「只读项目不能改写提示词」文案透出（不再静默） ----------
{
  const forbiddenFetch = (async () =>
    Response.json({ error: "只读项目不能改写提示词" }, { status: 403 })) as typeof fetch;
  const res = makeDeps({ saveOk: true, fetch: forbiddenFetch });
  const outcome = await runPromptRewriteFlow(ARGS, res.deps);
  assert.equal(outcome.committed, false);
  assert.equal(res.records.error, "只读项目不能改写提示词", "403 文案必须透出");
  assert.equal(res.records.committedText.length, 0, "403 不得写回正文");
  console.log("  ✓ 403 只读项目：server 文案透出而非静默");
}

// ---------- 5. 404 兜底 → 错误透出而非静默 ----------
{
  const notFoundFetch = (async () => Response.json({ error: "project not found" }, { status: 404 })) as typeof fetch;
  const res = makeDeps({ saveOk: true, fetch: notFoundFetch });
  const outcome = await runPromptRewriteFlow(ARGS, res.deps);
  assert.equal(outcome.committed, false);
  assert.equal(res.records.error, "project not found", "404 server 错误文案必须透出");
  assert.equal(res.records.committedText.length, 0, "404 不得写回正文");
  console.log("  ✓ 404 兜底：错误透出而非静默");
}

// ---------- 6. 200+{rewritten:null,skipped:true} → 静默降级，保持原文不弹错 ----------
{
  const skippedFetch = (async () => Response.json({ rewritten: null, skipped: true })) as typeof fetch;
  const res = makeDeps({ saveOk: true, fetch: skippedFetch });
  const outcome = await runPromptRewriteFlow(ARGS, res.deps);
  assert.equal(outcome.committed, false);
  assert.equal(res.records.error, null, "200+null 静默降级不得弹错");
  assert.equal(res.records.committedText.length, 0, "200+null 不得写回正文");
  assert.deepEqual(res.records.busy, [true, false]);
  console.log("  ✓ 200+{rewritten:null} 静默降级，保持原文不弹错");
}

// ---------- 7. 空正文 → save 与 rewrite 都不发（防御双挡） ----------
{
  const calls: string[] = [];
  const res = makeDeps({ saveOk: true, fetch: okFetch });
  res.deps.saveProject = async () => { calls.push("save"); return true; };
  res.deps.rewrite = (args) => { calls.push("rewrite"); return rewritePromptText(args, okFetch); };
  const outcome = await runPromptRewriteFlow({ ...ARGS, text: "   " }, res.deps);
  assert.equal(outcome.committed, false);
  assert.deepEqual(calls, [], "空正文不得发保存与改写");
  assert.equal(res.records.committedText.length, 0);
  assert.equal(res.records.busy.length, 0, "空正文不进出 busy");
  console.log("  ✓ 空正文防御：保存与改写都不发");
}

// ---------- 8. 网络错误 → 文案透出而非静默 ----------
{
  const netFail: typeof fetch = (async () => { throw new TypeError("网络连接已断开"); }) as typeof fetch;
  const res = makeDeps({ saveOk: true, fetch: netFail });
  const outcome = await runPromptRewriteFlow(ARGS, res.deps);
  assert.equal(outcome.committed, false);
  assert.equal(res.records.error, "网络连接已断开", "网络错误文案必须透出");
  assert.deepEqual(res.records.busy, [true, false], "网络错误后 busy 仍复位");
  console.log("  ✓ 网络错误：文案透出，busy 复位");
}

console.log("\n通过 8 项");
