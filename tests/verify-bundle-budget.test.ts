/**
 * 包体预算豁免清单的负向单测（architect 指引 §4 第 4/5 条）。
 *
 * 被测单元是 loadExemptions(repoRoot)——清单的字段校验全部在这一层，
 * 且它已把 repoRoot 作为显式参数，可直接对临时目录取样的清单求值。
 *
 * 不通过 verifyBundleBudget 间接测：那条路径还会跑「死条目」守卫
 * （未命中任何构建产物的豁免条目 → 失败）。该守卫是仓库卫生不变量，
 * 只对真实构建产物有意义；对临时目录里的合成 dist 必然误报，
 * 会把被测的字段校验错误挤掉（曾经如此：maxBytes=1000 的用例实际
 * 抛的是「未命中任何构建产物」）。
 *
 * 验证豁免清单校验 fail-closed：
 * 1. maxBytes 改 1000（≤ 默认 500KB 上限）→ 拒绝
 * 2. 删除 reason 字段 → 拒绝
 *
 * 运行：node_modules/tsx/dist/cli.mjs tests/verify-bundle-budget.test.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const { loadExemptions } = await import(
  path.join(repoRoot, "scripts", "verify-bundle-budget.mjs")
);

/**
 * 在临时目录造一个「仓库」，其 scripts/bundle-budget-exemptions.json 为
 * 基准清单套用 override 后的结果；返回该临时 repoRoot。
 */
function withTempRepo(exemptionsOverride) {
  const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), "bundle-exemptions-"));
  const scriptsDir = path.join(tmpRepo, "scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });

  const base = {
    schemaVersion: 1,
    defaultSingleChunkBytes: 500000,
    exemptions: [
      {
        chunkPrefix: "assets/excalidraw-",
        maxBytes: 5242880,
        reason: "Excalidraw 上游预打包库无法再拆分；用户 2026-09-24 拍板 a+b。",
        authorizedBy: "user 2026-09-24 (a+b)",
        reviewBy: "2026-12-31",
        trackingIssue: 60,
      },
    ],
  };
  if (exemptionsOverride) Object.assign(base.exemptions[0], exemptionsOverride);

  fs.writeFileSync(
    path.join(scriptsDir, "bundle-budget-exemptions.json"),
    JSON.stringify(base, null, 2),
  );
  return tmpRepo;
}

// 测试 1：maxBytes ≤ 默认上限 → 拒绝（豁免是提高上限，不是取消上限）
{
  const tmpRepo = withTempRepo({ maxBytes: 1000 });
  try {
    assert.throws(
      () => loadExemptions(tmpRepo),
      /必须大于默认单 chunk 上限/,
      "maxBytes=1000（≤500000）应被拒绝",
    );
    console.log("PASS: maxBytes=1000 被正确拒绝（豁免是提高上限，不是取消上限）");
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
}

// 测试 2：reason 为空 → 拒绝（书面理由是豁免成立的前提）
{
  const tmpRepo = withTempRepo({ reason: "" });
  try {
    assert.throws(
      () => loadExemptions(tmpRepo),
      /exemptions\[0\]\.reason 缺失或为空/,
      "reason 为空应被拒绝",
    );
    console.log("PASS: reason 为空被正确拒绝（fail-closed）");
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
}

// 测试 3（正向对照）：基准清单本身必须通过，否则上面两条「拒绝」无意义
{
  const tmpRepo = withTempRepo(null);
  try {
    const { exemptions } = loadExemptions(tmpRepo);
    assert.equal(exemptions.length, 1);
    assert.equal(exemptions[0].chunkPrefix, "assets/excalidraw-");
    console.log("PASS: 合法清单通过校验（对照组，证明拒绝不是无条件抛错）");
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
}

// 测试 4：真实仓库清单必须通过（防 CI 上清单自身损坏）
{
  const { exemptions } = loadExemptions(repoRoot);
  assert.ok(exemptions.length >= 1, "真实清单不应为空");
  console.log(`PASS: 真实仓库清单校验通过（${exemptions.length} 条豁免）`);
}

console.log("\n4/4 负向+对照单测全部通过 ✅");
