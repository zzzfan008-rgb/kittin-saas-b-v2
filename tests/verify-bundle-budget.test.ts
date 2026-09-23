/**
 * 包体预算豁免清单的负向单测（architect 指引 §4 第 4/5 条）。
 *
 * 覆盖两条**互相独立**的不变量，缺一不可：
 *
 *  A. 字段校验（loadExemptions）——豁免必须有书面理由、登记的上限必须真的提高
 *     直测 `loadExemptions(repoRoot)`：它已把 repoRoot 作为显式参数，天生可测。
 *     不经过 verifyBundleBudget，因为那条路径的「死条目」守卫是仓库卫生不变量，
 *     只对真实构建产物有意义；对合成 fixture 必然误报，会把被测的字段校验错误挤掉。
 *
 *  B. 强制执行（verifyBundleBudget）——登记的上限必须真的被用来判定超标
 *     走 hermetic fixture + exemptionsOverride：40KB 的合成 chunk 命中豁免前缀，
 *     登记上限设 1000 bytes，断言门禁拒绝。
 *
 * 为什么两条都不能省（变异实验实证，非推断）：
 *  - 只留 B：删掉生产代码里 reason/authorizedBy/reviewBy 的非空校验，测试仍全绿
 *    ——override 绕过 loadExemptions，字段校验根本没被执行。豁免清单可退化成
 *    没有书面理由的裸上限，而书面理由是豁免机制唯一的审计抓手。
 *  - 只留 A：把 limitFor 对豁免 chunk 改成返回 Infinity（豁免=无限大），测试仍全绿
 *    ——直测 loadExemptions 不经过 enforcement。登记的上限形同虚设。
 *  A+B 合起来，上述任一变异都会被抓住。
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

const { loadExemptions, verifyBundleBudget } = await import(
  path.join(repoRoot, "scripts", "verify-bundle-budget.mjs")
);

/** 一份合法的基准豁免条目；override 浅合并到它上面。 */
function baseExemption(override) {
  return Object.assign(
    {
      chunkPrefix: "assets/excalidraw-",
      maxBytes: 5_242_880,
      reason: "Excalidraw 上游预打包库无法再拆分；用户 2026-09-24 拍板 a+b。",
      authorizedBy: "user 2026-09-24 (a+b)",
      reviewBy: "2026-12-31",
      trackingIssue: 60,
    },
    override ?? {},
  );
}

/**
 * 不变量 A 的取样器：在临时目录造一个「仓库」，其
 * scripts/bundle-budget-exemptions.json 为基准条目套用 override 的结果。
 */
function withTempRepo(override) {
  const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), "bundle-exemptions-"));
  const scriptsDir = path.join(tmpRepo, "scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.writeFileSync(
    path.join(scriptsDir, "bundle-budget-exemptions.json"),
    JSON.stringify(
      {
        schemaVersion: 1,
        defaultSingleChunkBytes: 500_000,
        exemptions: [baseExemption(override)],
      },
      null,
      2,
    ),
  );
  return tmpRepo;
}

/**
 * 不变量 B 的取样器：自含 mock dist。
 *   .vite/manifest.json —— 入口 assets/index-test.js，imports 空
 *   assets/index-test.js —— 最小体量
 *   assets/excalidraw-fixture.js —— ≈40KB，命中豁免前缀 assets/excalidraw-：
 *     既避免「死条目」守卫误报，又远大于测试登记的 1000 bytes 上限
 */
function hermeticFixture() {
  const distRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bundle-verify-"));
  fs.mkdirSync(path.join(distRoot, ".vite"), { recursive: true });
  fs.mkdirSync(path.join(distRoot, "assets"), { recursive: true });
  fs.writeFileSync(
    path.join(distRoot, ".vite", "manifest.json"),
    JSON.stringify({
      "index.html": { file: "assets/index-test.js", isEntry: true, imports: [] },
    }),
  );
  fs.writeFileSync(path.join(distRoot, "assets", "index-test.js"), "// empty entry\n");
  fs.writeFileSync(
    path.join(distRoot, "assets", "excalidraw-fixture.js"),
    "//" + "x".repeat(40_000 - 20) + "\n",
  );
  return distRoot;
}

// ────────────────────────────────────────────
// A1：maxBytes ≤ 默认上限 → 拒绝（豁免是提高上限，不是取消上限）
// ────────────────────────────────────────────
{
  const tmpRepo = withTempRepo({ maxBytes: 1_000 });
  try {
    assert.throws(
      () => loadExemptions(tmpRepo),
      /必须大于默认单 chunk 上限/,
      "maxBytes=1000（≤500000）应被拒绝",
    );
    console.log("PASS A1: maxBytes=1000 被正确拒绝（豁免是提高上限，不是取消上限）");
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
}

// ────────────────────────────────────────────
// A2：reason 为空 → 拒绝（书面理由是豁免成立的前提）
// ────────────────────────────────────────────
{
  const tmpRepo = withTempRepo({ reason: "" });
  try {
    assert.throws(
      () => loadExemptions(tmpRepo),
      /exemptions\[0\]\.reason 缺失或为空/,
      "reason 为空应被拒绝",
    );
    console.log("PASS A2: reason 为空被正确拒绝（fail-closed）");
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
}

// ────────────────────────────────────────────
// A3（正向对照）：合法清单必须通过
//      没有对照组，「被拒绝」可能只是加载器无条件抛错
// ────────────────────────────────────────────
{
  const tmpRepo = withTempRepo(null);
  try {
    const { exemptions } = loadExemptions(tmpRepo);
    assert.equal(exemptions.length, 1);
    assert.equal(exemptions[0].chunkPrefix, "assets/excalidraw-");
    console.log("PASS A3: 合法清单通过校验（对照组）");
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
}

// ────────────────────────────────────────────
// A4：真实仓库清单必须通过（防 CI 上清单自身损坏时静默放行）
// ────────────────────────────────────────────
{
  const { exemptions } = loadExemptions(repoRoot);
  assert.ok(exemptions.length >= 1, "真实清单不应为空");
  console.log(`PASS A4: 真实仓库清单校验通过（${exemptions.length} 条豁免）`);
}

// ────────────────────────────────────────────
// B1：登记 1000 bytes 上限而 chunk 实际 40KB → 门禁必须拒绝
//      证明登记的上限真的被 enforcement 使用，不是只在清单里写着好看
// ────────────────────────────────────────────
{
  const distRoot = hermeticFixture();
  try {
    assert.throws(
      () =>
        verifyBundleBudget({
          distRoot,
          writeReport: false,
          initialGzipBudget: 1_000_000, // 放宽首屏预算以免干扰本用例
          singleChunkBudget: 500_000,
          exemptionsOverride: [
            baseExemption({ maxBytes: 1_000, reason: "测试：上限 1000，chunk 40KB 应超限" }),
          ],
        }),
      /存在超过体积预算/,
      "40KB chunk 撞上 1000 bytes 登记上限应被拒绝",
    );
    console.log("PASS B1: 登记上限被强制执行（40KB > 1000 被拒）");
  } finally {
    fs.rmSync(distRoot, { recursive: true, force: true });
  }
}

// ────────────────────────────────────────────
// B2（正向对照）：同一 fixture 在登记的 5MB 上限内必须通过
//      没有对照组，B1 的「被拒」可能只是门禁无条件抛错
// ────────────────────────────────────────────
{
  const distRoot = hermeticFixture();
  try {
    const report = verifyBundleBudget({
      distRoot,
      writeReport: false,
      initialGzipBudget: 1_000_000,
      singleChunkBudget: 500_000,
      exemptionsOverride: [baseExemption(null)],
    });
    assert.ok(
      report.exemptedChunks.some((c) => c.file.startsWith("assets/excalidraw-")),
      "40KB chunk 应被识别为豁免命中",
    );
    console.log("PASS B2: 合法上限下豁免生效（对照组）");
  } finally {
    fs.rmSync(distRoot, { recursive: true, force: true });
  }
}

console.log("\n6/6 负向 + 对照单测全部通过 ✅");
