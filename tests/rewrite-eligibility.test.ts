// 补全资格判定（P1 §4 A 案）：锚点后无补充段时前端提前禁用，避免静默「点了没反应」。
// 纯函数、无 DOM、不碰库。锚点常量是 server REWRITE_SUPPLEMENT_ANCHOR 的客户端镜像。
import assert from "node:assert/strict";
import {
  rewriteEligibility,
  REWRITE_SUPPLEMENT_ANCHOR,
} from "../src/lib/rewriteEligibility";

console.log("rewrite-eligibility：补全资格（锚点空补充）测试");

// ---------- 1. 空正文 → empty_text ----------
assert.deepEqual(rewriteEligibility(""), { eligible: false, reason: "empty_text" });
assert.deepEqual(rewriteEligibility("   \n "), { eligible: false, reason: "empty_text" });
console.log("  ✓ 空/纯空白正文 → empty_text");

// ---------- 2. 无锚点普通正文非空 → eligible ----------
assert.deepEqual(rewriteEligibility("一件白色棉质衬衫"), { eligible: true, reason: null });
console.log("  ✓ 无锚点普通正文 → eligible");

// ---------- 3. 含锚点 + 锚点后有补充 → eligible ----------
{
  const withSupplement = `AI 换装模特试穿。……协议段……\n${REWRITE_SUPPLEMENT_ANCHOR}改成红色背景，戴墨镜`;
  assert.deepEqual(rewriteEligibility(withSupplement), { eligible: true, reason: null });
}
console.log("  ✓ 协议模板 + 有补充 → eligible");

// ---------- 4. 含锚点 + 锚点后为空 → empty_supplement（P1 复发点） ----------
{
  const protocolOnly = `AI 换装模特试穿。……404 字冻结协议……\n${REWRITE_SUPPLEMENT_ANCHOR}`;
  assert.deepEqual(
    rewriteEligibility(protocolOnly),
    { eligible: false, reason: "empty_supplement" },
    "锚点在末尾、后无补充 → empty_supplement",
  );
}
{
  const whitespaceAfter = `协议\n${REWRITE_SUPPLEMENT_ANCHOR}   \n\t `;
  assert.deepEqual(
    rewriteEligibility(whitespaceAfter),
    { eligible: false, reason: "empty_supplement" },
    "锚点后仅空白 → empty_supplement",
  );
}
console.log("  ✓ 协议模板锚点后为空/空白 → empty_supplement（按钮禁用）");

// ---------- 5. 锚点后有正文，但锚点前协议里出现相似文本不影响切分（取首个锚点之后） ----------
{
  // 协议正文里提到锚点字样但真正的锚点行在末尾
  const tricky = `说明：以「${REWRITE_SUPPLEMENT_ANCHOR}」为界。\n${REWRITE_SUPPLEMENT_ANCHOR}用户实际补充：短袖`;
  assert.deepEqual(rewriteEligibility(tricky), { eligible: true, reason: null });
}
console.log("  ✓ 取首个锚点 indexOf 之后的内容判定（与 server 同口径）");

// ---------- 6. 锚点常量与 server 主树逐字一致（防镜像漂移） ----------
assert.equal(
  REWRITE_SUPPLEMENT_ANCHOR,
  "用户补充要求（如为空则忽略本行）：",
  "锚点必须与 server REWRITE_SUPPLEMENT_ANCHOR 逐字一致",
);
console.log("  ✓ 锚点常量逐字锁定");

console.log("\n通过 6 项");
