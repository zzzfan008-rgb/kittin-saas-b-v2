/**
 * 内置模板提示词唯一性闸门（fail-closed）。
 *
 * 背景：2026-10-22 实跑体检发现 8 个模板共用 fashion-lookbook:edit 同一段正文，
 * 导致任务语义漂移——pose 输出全身 Lookbook、background-swap 不换背景、
 * person-to-mannequin 输出真人、sketch-to-garment 与线稿无关。
 *
 * 本闸门锁定：15 个内置模板的 text 节点正文两两不同（video 两个模板共用
 * video-animate:edit 属已知例外，见 EXEMPT）。
 *
 * 运行：node node_modules/tsx/dist/cli.mjs tests/builtin-prompt-distinct.test.ts
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { builtinTemplates } = await import("../server/routes/templates");

/**
 * 允许共用的例外：两个视频模板的动效任务文本相同属预期
 * （同属 video-animate 族，差别在首帧来源节点与 label）。
 */
const EXEMPT_SHARED_GROUPS: readonly (readonly string[])[] = [
  ["builtin-video-runway", "builtin-video-xhs"],
];

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

console.log("内置模板提示词唯一性闸门");

const templates = builtinTemplates();
assert.equal(templates.length, 15, `内置模板应为 15 个，实际 ${templates.length}`);

// templateId → 该模板全部 text 节点正文的 hash 集合
const byHash = new Map<string, string[]>();
for (const tpl of templates) {
  for (const node of tpl.flow.nodes) {
    if (node.type !== "text") continue;
    const text = (node.data as { text?: unknown }).text;
    assert.equal(typeof text, "string", `${tpl.id}/${node.id} text 必须是 string`);
    assert.ok((text as string).trim().length > 0, `${tpl.id}/${node.id} text 不得为空`);
    const hash = sha256(text as string);
    byHash.set(hash, [...(byHash.get(hash) ?? []), tpl.id]);
  }
}

const exemptSets = EXEMPT_SHARED_GROUPS.map((group) => [...group].sort().join("|"));
const violations = [...byHash.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([hash, ids]) => ({ hash, ids: [...new Set(ids)].sort() }))
  .filter(({ ids }) => !exemptSets.includes(ids.join("|")));

assert.deepEqual(
  violations,
  [],
  `以下模板复用了同一段提示词正文，会产生任务语义漂移，必须各自独立：\n${
    violations.map((v) => `  hash=${v.hash.slice(0, 10)} → ${v.ids.join(", ")}`).join("\n")
  }`,
);
console.log(`  ✓ 15 个内置模板提示词互不重复（${byHash.size} 个唯一正文，豁免 ${exemptSets.length} 组）`);
