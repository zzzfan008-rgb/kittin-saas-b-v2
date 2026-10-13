/**
 * 提示词改写真实模型冒烟测试（手动运行，绝不进 CI/单测——烧钱且 flaky）。
 *
 * 用法：npm run test:smoke:rewrite
 *
 * 背景（P1 半句话事故补课，2026-10-12）：max_tokens=512 + gemini-3.8-flash 默认深度思考
 * 烧掉 output 预算 → 正文只剩 25 字且 finish_reason 仍 "stop"。本脚本用真实 API易 通道
 * 喂 404 字 model-tryon 冻结协议 + 用户补充段，断言：
 *   ① 返回 rewritten:true（未被截断/过短防线拦下）；
 *   ② 输出含协议首段与尾段关键句（锚点切分后协议段逐字回填）；
 *   ③ 输出总长 ≥ 输入总长。
 * 无 APIYI_API_KEY 时跳过并明示（exit 0，不误报 CI 红）。
 *
 * 运行：node node_modules/tsx/dist/cli.mjs scripts/rewrite-smoke.mjs（或 npm run test:smoke:rewrite）
 */
import { rewriteUserPrompt } from "../server/lib/textRewriter.ts";
import { TextRewriteError } from "../server/lib/textChat.ts";

const PROTOCOL = `AI 换装模特试穿。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源；参考图2=模特，是唯一的人物身份来源（长相、发型、肤色、身材、姿势）。把参考图1的服装完整穿到参考图2的模特身上：忠实还原服装的版型、颜色、花型、面料质感、缝线、闭合方式与五金细节；保留模特本人的面部特征、发型、肤色、身材比例与姿势，只更换身上服装，不改变人物身份，不融合两张脸或两件衣服。
输出 3:4 单人全身竖版：人物完整入镜、头脚不裁切，服装与身体贴合自然，褶皱、垂坠与遮挡关系可信；默认平视机位、约 50mm、柔和均匀光线、干净中性背景。仅在不与用户要求和参考图冲突的前提下，补全主体、环境、光线、镜头、色调、构图六个维度的合理细节；不得新增用户未要求的人物、道具、文字、Logo 或水印。禁止使用「8K」「杰作」「大师级」「完美光线」「超高清」等无信息量夸大词。
用户补充要求（如为空则忽略本行）：`;

const SUPPLEMENT = "红色针织开衫搭配米色阔腿裤，模特站在城市街道，下午侧逆光，自然行走状态";

const HEAD_KEY = "参考图1=服装，是唯一的服装来源";
const TAIL_KEY = "用户补充要求（如为空则忽略本行）：";
// 协议词只允许出现在代码回填的协议段（锚点前），模型生成的补充段（锚点后）一个都不许有
//（P1 缺陷：整段 system prompt 致模型自编协议且角色反转）。
const PROTOCOL_VOCAB = ["参考图1", "参考图2", "AI 换装", "AI 换装模特试穿", "3:4", "竖版"];

async function main() {
  const apiKey = process.env.APIYI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("DUMMY")) {
    console.log("[SMOKE-SKIP] 未配置 APIYI_API_KEY（或为 DUMMY 占位），跳过真实模型冒烟。");
    console.log("            配置后重跑：APIYI_API_KEY=<key> npm run test:smoke:rewrite");
    process.exit(0);
  }

  const input = PROTOCOL + SUPPLEMENT;
  console.log(`[SMOKE] 输入长度：协议 ${PROTOCOL.length} 字 + 补充 ${SUPPLEMENT.length} 字 = ${input.length} 字`);
  console.log("[SMOKE] 调用真实文本通道（gemini-3.8-flash，max_tokens=2048，reasoning_effort=medium）…");

  const context = { kind: "image-generator", mode: "edit", familyId: "model-tryon" };
  // 复制通道级错误细节（textChat 抛的 TextRewriteError 带 message），避免 fail-closed 吞掉后无从诊断。
  const diagnostic = await rewriteUserPrompt(input, context).then(
    (outcome) => outcome,
    (error) => { console.error("[SMOKE-FAIL] rewriteUserPrompt 外抛（契约上不应发生）:", error); process.exit(1); },
  );
  const outcome = diagnostic;
  if (!outcome.rewritten && outcome.reason && outcome.reason.startsWith("text_")) {
    // 通道级失败：直接调一次底层通道拿原始错误信息（诊断用；fail-closed 层吞了 message）。
    try {
      const { createTextChatCompletion } = await import("../server/lib/textChat.ts");
      await createTextChatCompletion({
        model: process.env.APIYI_TEXT_MODEL_ID ?? "gemini-3.8-flash",
        messages: [{ role: "user", content: SUPPLEMENT }],
      });
    } catch (rawError) {
      console.error(`[SMOKE] 通道原始错误（reason=${outcome.reason}）：${rawError instanceof Error ? rawError.message : String(rawError)}`);
      if (rawError instanceof TextRewriteError) {
        console.error(`[SMOKE]   code=${rawError.code} retryable=${rawError.retryable}`);
      }
    }
  }

  console.log(`\n[SMOKE] rewritten=${outcome.rewritten} reason=${outcome.reason ?? "none"}`);
  console.log(`[SMOKE] 输出长度：${outcome.text.length} 字（输入 ${input.length} 字）`);

  const failures = [];
  if (!outcome.rewritten && outcome.reason && outcome.reason !== "empty_supplement") {
    failures.push(`改写未生效（reason=${outcome.reason}）——截断/过短防线可能误伤，需人工核验`);
  }
  if (!outcome.text.includes(HEAD_KEY)) {
    failures.push(`协议首段关键句丢失：「${HEAD_KEY}」`);
  }
  if (!outcome.text.includes(TAIL_KEY)) {
    failures.push(`协议尾段锚点丢失：「${TAIL_KEY}」`);
  }
  if (outcome.text.length < input.length) {
    failures.push(`输出（${outcome.text.length}）短于输入（${input.length}）`);
  }
  // 语义检查（P1 缺陷修复）：切分出锚点后的模型补充段，逐词核对协议词
  const tailIndex = outcome.text.indexOf(TAIL_KEY);
  if (tailIndex !== -1) {
    const modelPart = outcome.text.slice(tailIndex + TAIL_KEY.length);
    console.log(`\n[SMOKE] 锚点后模型生成补充段（${modelPart.length} 字）：\n${modelPart}`);
    for (const word of PROTOCOL_VOCAB) {
      if (modelPart.includes(word)) {
        failures.push(`补充段混入协议词「${word}」——模型在自编协议（应只扩写用户补充要求）`);
      }
    }
  } else {
    failures.push("输出中找不到锚点，无法做语义检查（补充段隔离校验）");
  }

  if (failures.length > 0) {
    console.error("\n[SMOKE-FAIL] 冒烟断言失败：");
    for (const f of failures) console.error(`  ✗ ${f}`);
    console.error("\n[SMOKE] 输出全文：\n" + outcome.text);
    process.exit(1);
  }

  console.log("\n[SMOKE-PASS] ✓ rewritten:true");
  console.log(`[SMOKE-PASS] ✓ 协议首段在（${HEAD_KEY.slice(0, 12)}…）`);
  console.log(`[SMOKE-PASS] ✓ 协议尾段锚点在（…${TAIL_KEY.slice(-8)}）`);
  console.log(`[SMOKE-PASS] ✓ 输出 ${outcome.text.length} ≥ 输入 ${input.length}`);
  console.log("\n[SMOKE] 输出全文：\n" + outcome.text);
}

main().catch((error) => {
  console.error("[SMOKE-FAIL] 冒烟脚本异常退出：", error);
  process.exit(1);
});
