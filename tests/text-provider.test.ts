/**
 * 文本 Provider 注册表完备性回归测试（R-55 P2-b 集成修复，纯逻辑，不调真实 API/DB）。
 * 覆盖：注册表键集与 TEXT_MODEL_IDS 完全一致（不多不少）、每个 TextModelId 必能解析
 * 到 Provider 且 id 自洽、未知 ID 一律 400 拒绝。守卫随 TEXT_MODEL_IDS 走（权威清单），
 * 因此 R-52 把清单切到 R10 实名后本测试无需改动即继续成立。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/text-provider.test.ts
 */
import assert from "node:assert/strict";
import { TEXT_MODEL_IDS, isTextModelId } from "../src/types/textModels";
import { apiyiTextProviders, getTextProvider } from "../server/providers/textProvider";
import { ProviderError } from "../server/providers/base";

let passed = 0;
function ok(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function main() {
  console.log("文本 Provider 注册表完备性测试");

  ok("注册表键集与 TEXT_MODEL_IDS 完全一致（不多不少）", () => {
    assert.deepEqual([...apiyiTextProviders.keys()].sort(), [...TEXT_MODEL_IDS].sort());
  });

  ok("每个 TextModelId 都解析到 Provider 且 id 自洽", () => {
    for (const modelId of TEXT_MODEL_IDS) {
      assert.ok(isTextModelId(modelId), `${modelId} 应在权威清单中`);
      const provider = getTextProvider(modelId);
      assert.equal(provider.id, modelId);
      assert.equal(typeof provider.complete, "function");
    }
  });

  ok("未知模型 ID 一律 400 拒绝，不返回 undefined", () => {
    for (const bogus of ["gpt-5.3-chat-latest", "gemini-3.6-flash", "deepseek-v4-flash-ga-260731", "not-a-model"]) {
      if (isTextModelId(bogus)) continue; // 若清单本身包含该 ID 则跳过（R10 切换前后自洽）
      assert.throws(
        () => getTextProvider(bogus),
        (error: unknown) => error instanceof ProviderError && error.status === 400,
      );
    }
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
