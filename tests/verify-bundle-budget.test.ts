/**
 * 包体预算豁免清单的负向单测（architect 指引 §4 第 4/5 条）。
 *
 * 验证豁免清单校验 fail-closed：
 * 1. maxBytes 改 1000（≤ 默认 500KB 上限）→ 门禁失败
 * 2. 删除 reason 字段 → 门禁失败
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

/** 使用动态 import 加载 mjs 以访问 loadExemptions（通过公共门面指标间接触发校验）。 */
async function loadModule() {
  return await import(path.join(repoRoot, "scripts", "verify-bundle-budget.mjs"));
}

/** 在临时目录创建一个最小的 exemptions JSON，返回临时目录路径。 */
function withTempExemptions(exemptionsOverride) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bundle-test-"));
  const exemptionsPath = path.join(tmpDir, "bundle-budget-exemptions.json");
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
  // 合并 override（合并到 exemptions[0] 上）
  if (exemptionsOverride) {
    Object.assign(base.exemptions[0], exemptionsOverride);
  }
  fs.writeFileSync(exemptionsPath, JSON.stringify(base, null, 2));
  return { tmpDir, exemptionsPath };
}

// ────────────────────────────────────────────
// 测试 1：maxBytes 改为 ≤ 默认值 → 加载失败
// ────────────────────────────────────────────
{
  const { tmpDir } = withTempExemptions({ maxBytes: 1000 });
  try {
    // 模拟调用：直接通过脚本侧逻辑不会走到 loadExemptions，所以用间接方式——
    // 往临时目录伪造 dist/assets 不存在，让 loadExemptions 被触发为先。
    // 更好的方式：直接 import 模块并在构造的 tmp 目录跑 verifyBundleBudget。
    // 但因为 verifyBundleBudget 读 dist/.vite/manifest.json，我们不走全流程，
    // 只跑 loadExemptions（需要把它 export 或解析）。
    //
    // 已知 mjs 中 loadExemptions 通过 distRoot 上级目录定位 JSON：
    // repoRoot = path.resolve(distRoot, "..") → JSON 在 scripts/ 下。
    // 所以把 tmp 设为 "repoRoot" 即可绕过。
    //
    // 我们改为：把 JSON 放进临时目录的 scripts/ 下，让 loadExemptions 读取。
    const repoSim = path.join(tmpDir);
    const scriptsDir = path.join(repoSim, "scripts");
    fs.mkdirSync(scriptsDir, { recursive: true });
    fs.renameSync(path.join(tmpDir, "bundle-budget-exemptions.json"), path.join(scriptsDir, "bundle-budget-exemptions.json"));

    // 创建假的 dist 目录（verifyBundleBudget 需要 manifest 和 assets）
    const distDir = path.join(repoSim, "dist");
    const viteDir = path.join(distDir, ".vite");
    fs.mkdirSync(viteDir, { recursive: true });
    fs.writeFileSync(path.join(viteDir, "manifest.json"), JSON.stringify({
      "index.html": { file: "assets/index-test.js", isEntry: true, imports: [] },
    }));
    fs.mkdirSync(path.join(distDir, "assets"), { recursive: true });
    fs.writeFileSync(path.join(distDir, "assets", "index-test.js"), "// empty");

    // 现在调用 verifyBundleBudget，distRoot = distDir
    const { verifyBundleBudget } = await loadModule();
    let failed = false;
    try {
      verifyBundleBudget({ distRoot: distDir, writeReport: false });
    } catch (err) {
      failed = true;
      // 期望的失败信息：maxBytes ≤ 默认上限
      assert.ok(
        err.message.includes("必须大于默认单 chunk 上限") || err.message.includes("豁免是提高上限"),
        `maxBytes=1000 应触发「豁免是提高上限」错误，实际：${err.message}`,
      );
    }
    assert.ok(failed, "maxBytes=1000（≤500000）应该导致门禁失败，但通过了");
    console.log("PASS: maxBytes=1000 被正确拒绝（豁免是提高上限，不是取消上限）");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ────────────────────────────────────────────
// 测试 2：删除 reason 字段 → 加载失败
// ────────────────────────────────────────────
{
  const { tmpDir } = withTempExemptions({ reason: "" });
  try {
    const repoSim = path.join(tmpDir);
    const scriptsDir = path.join(repoSim, "scripts");
    fs.mkdirSync(scriptsDir, { recursive: true });
    fs.renameSync(path.join(tmpDir, "bundle-budget-exemptions.json"), path.join(scriptsDir, "bundle-budget-exemptions.json"));

    const distDir = path.join(repoSim, "dist");
    const viteDir = path.join(distDir, ".vite");
    fs.mkdirSync(viteDir, { recursive: true });
    fs.writeFileSync(path.join(viteDir, "manifest.json"), JSON.stringify({
      "index.html": { file: "assets/index-test.js", isEntry: true, imports: [] },
    }));
    fs.mkdirSync(path.join(distDir, "assets"), { recursive: true });
    fs.writeFileSync(path.join(distDir, "assets", "index-test.js"), "// empty");

    const { verifyBundleBudget } = await loadModule();
    let failed = false;
    try {
      verifyBundleBudget({ distRoot: distDir, writeReport: false });
    } catch (err) {
      failed = true;
      assert.ok(
        err.message.includes(".reason") || err.message.includes("缺失或为空"),
        `reason="" 应触发字段缺失错误，实际：${err.message}`,
      );
    }
    assert.ok(failed, "reason 为空应该导致门禁失败，但通过了");
    console.log("PASS: reason 为空被正确拒绝（fail-closed）");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

console.log("\n2/2 负向单测全部通过 ✅");