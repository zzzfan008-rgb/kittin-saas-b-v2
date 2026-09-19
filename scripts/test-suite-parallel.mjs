import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { cpus } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * test:suite 并行运行器。
 *
 * 现状：`test:suite` 是一条 75 段的 `&&` 链，每段一个新进程串行 spawn（实测 99.6s）。
 * 本脚本在「任一文件失败 → 整体失败、退出码非 0」这一语义不变的前提下，把 75 个测试
 * 文件分批并发执行，只保留「碰库」的文件串行，把墙钟压到尽量低。
 *
 * 并行安全边界（安全优先于速度）：
 * - 每个测试文件都在自己的进程里运行，进程间没有共享内存状态，唯一共享资源是
 *   由 DATABASE_URL 指向的本机 `*_test` 库（外层 scripts/test-with-postgres.mjs 已持有
 *   该工作区的 per-worktree 锁，并把它通过 npm run test:suite 传给本脚本及全部子进程）。
 * - 「碰库」的测试都在文件开头调用 tests/postgresTestDatabase.ts 的
 *   resetPostgresTestDatabase()，它会对共享的 `*_test` 库执行 DROP SCHEMA public CASCADE。
 *   两个这样的测试并发时会把彼此的库状态冲掉，因此它们必须串行。
 * - 其余测试（纯单元 / 契约 / 前端静态检查）不连接 PostgreSQL，可在并发 worker 里并行。
 *
 * 分类不变量（fail-closed）：SERIAL_TEST_FILES 是「碰库」文件的显式登记表；启动时会对
 * 每个测试文件做一次源码扫描，凡导入 resetPostgresTestDatabase 标记的文件必须恰好等于
 * 这张登记表。若有人新增了碰库测试却没把它加进登记表，本脚本直接报错拒绝运行，而不是
 * 把它放到并发池里制造偶发串扰。
 */

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

/**
 * 全套件 75 个测试文件（有序，取代 package.json 里原来的 `&&` 链）。
 * 前 8 个是 .mjs（node 直接运行），其余是 .ts（tsx 运行）。
 */
const TEST_FILES = [
  "tests/test-runner-isolation.test.mjs",
  "tests/bundle-budget.test.mjs",
  "tests/bundle-boundaries.test.mjs",
  "tests/e2e-safety.test.mjs",
  "tests/claude-guardrail-hook.test.mjs",
  "tests/spec-kit-skills.test.mjs",
  "tests/codex-gate.test.mjs",
  "tests/apiyi-knowledge-base.test.mjs",
  "tests/node-version-contract.test.ts",
  "tests/dependency-security-contract.test.ts",
  "tests/performance-baseline-contract.test.ts",
  "tests/module-facade-contract.test.ts",
  "tests/database-transaction-rollback.test.ts",
  "tests/upload-normalization-config.test.ts",
  "tests/upload-normalization-optimization-evidence.test.ts",
  "tests/vite-proxy-config.test.ts",
  "tests/dev-preflight.test.ts",
  "tests/theme-contract.test.ts",
  "tests/generation-safety.test.ts",
  "tests/workbench-shell.test.ts",
  "tests/apiyi-docs.test.ts",
  "tests/r48-version-gate.test.ts",
  "tests/model-parameter-profiles.test.ts",
  "tests/node-prompt-parameter-matrix.test.ts",
  "tests/prompt-evaluation.test.ts",
  "tests/evaluation-budget.test.ts",
  "tests/evaluation-plan.test.ts",
  "tests/evaluation-manifest.test.ts",
  "tests/evaluation-evidence.test.ts",
  "tests/evaluation-code-identity.test.ts",
  "tests/evaluation-release-build.test.ts",
  "tests/evaluation-release-runtime.test.ts",
  "tests/evaluation-release-preflight.test.ts",
  "tests/evaluation-promotion.test.ts",
  "tests/evaluation-review-cli.test.ts",
  "tests/evaluation-authorize-cli.test.ts",
  "tests/evaluation-authorization-ledger.test.ts",
  "tests/evaluation-campaign.test.ts",
  "tests/reference-inputs.test.ts",
  "tests/prompt-presets.test.ts",
  "tests/prompt-preset-ui.test.ts",
  "tests/prompt-evaluation-release.test.ts",
  "tests/prompt-run-admission.test.ts",
  "tests/node-product-policy.test.ts",
  "tests/evaluation-run-policy.test.ts",
  "tests/dag.test.ts",
  "tests/document-snapshot.test.ts",
  "tests/active-document-boundary.test.ts",
  "tests/workflow-schema.test.ts",
  "tests/text-provider.test.ts",
  "tests/generation-kind-contract.test.ts",
  "tests/apiyi-transport.test.ts",
  "tests/provider-contract.test.ts",
  "tests/mask-processing.test.ts",
  "tests/provider-retry.test.ts",
  "tests/exact-generation.test.ts",
  "tests/upload-image-normalization.test.ts",
  "tests/image-input-node.test.ts",
  "tests/mask-upload.test.ts",
  "tests/static-frontend.test.ts",
  "tests/sqlite-postgres-migration.test.ts",
  "tests/auth-storage.test.ts",
  "tests/auth-client.test.ts",
  "tests/authorization.test.ts",
  "tests/tutorials.test.ts",
  "tests/schema-migrations.test.ts",
  "tests/run-queue.test.ts",
  "tests/recent-results.test.ts",
  "tests/image-viewer-reference-evidence.test.ts",
  "tests/project-tabs-session.test.ts",
  "tests/initial-draft-client.test.ts",
  "tests/flow-history.test.ts",
  "tests/text-edit-coalescing.test.ts",
  "tests/selection-consistency.test.ts",
  "tests/project-tabs.test.ts",
  "tests/result-export.test.ts",
  "tests/evaluation-review-ledger.test.ts",
];

/**
 * 「碰库」测试登记表：这些文件会 resetPostgresTestDatabase()（DROP SCHEMA public CASCADE）
 * 共享的本机 `*_test` 库，必须串行执行。新增碰库测试时必须同步把它的路径加进这里，
 * 否则启动时的分类不变量检查会 fail-closed。
 */
const SERIAL_TEST_FILES = new Set([
  "tests/evaluation-authorization-ledger.test.ts",
  "tests/evaluation-campaign.test.ts",
  "tests/upload-image-normalization.test.ts",
  "tests/sqlite-postgres-migration.test.ts",
  "tests/auth-storage.test.ts",
  "tests/authorization.test.ts",
  "tests/tutorials.test.ts",
  "tests/schema-migrations.test.ts",
  "tests/run-queue.test.ts",
  "tests/evaluation-review-ledger.test.ts",
]);

const tsxCli = join(repoRoot, "node_modules/tsx/dist/cli.mjs");

/** 默认并发度：保守取 CPU 核数的一半，并支持 TEST_SUITE_CONCURRENCY 覆盖（CI / 低配机降级）。 */
function concurrencyLimit() {
  const raw = (process.env.TEST_SUITE_CONCURRENCY ?? "").trim();
  if (raw) {
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new Error(`TEST_SUITE_CONCURRENCY 必须是 >= 1 的整数，当前为 ${JSON.stringify(raw)}`);
    }
    return value;
  }
  return Math.max(1, Math.floor((cpus().length || 1) / 2));
}

/** 分类不变量：凡导入碰库重置辅助函数的测试，必须恰好等于 SERIAL_TEST_FILES。 */
function assertSerialClassificationConsistent(testFiles, serialSet) {
  const markerPattern = /postgresTestDatabase/;
  const marked = [];
  for (const file of testFiles) {
    const source = readFileSync(join(repoRoot, file), "utf8");
    if (markerPattern.test(source)) marked.push(file);
  }
  const unregistered = marked.filter((file) => !serialSet.has(file));
  const stale = [...serialSet].filter((file) => !marked.includes(file));
  if (unregistered.length > 0 || stale.length > 0) {
    const problems = [];
    if (unregistered.length > 0) {
      problems.push(
        `以下测试导入了 resetPostgresTestDatabase 但未登记进 SERIAL_TEST_FILES（会并发碰库，拒绝运行）：\n  ${unregistered.join("\n  ")}`,
      );
    }
    if (stale.length > 0) {
      problems.push(
        `以下路径仍登记在 SERIAL_TEST_FILES 但已不再导入重置辅助函数（请从登记表移除）：\n  ${stale.join("\n  ")}`,
      );
    }
    throw new Error(problems.join("\n"));
  }
}

function runTest(file) {
  const args = file.endsWith(".ts") ? [tsxCli, file] : [file];
  return new Promise((resolveResult) => {
    const child = spawn(process.execPath, args, {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    childProcesses.add(child);
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("error", (error) => {
      childProcesses.delete(child);
      resolveResult({ file, exitCode: 1, output: `${output}${String(error)}` });
    });
    child.on("close", (code, signal) => {
      childProcesses.delete(child);
      resolveResult({
        file,
        exitCode: code ?? (signal ? 1 : 0),
        output,
        signal: signal ?? undefined,
      });
    });
  });
}

/** 串行泳道：一次只跑一个（碰库测试之间必须互斥）。 */
async function drainSerial(tests, onDone) {
  for (const file of tests) onDone(await runTest(file));
}

/** 并发泳道：limit 个 worker 瓜分不碰库的测试。 */
async function drainParallel(tests, limit, onDone) {
  if (tests.length === 0) return;
  let cursor = 0;
  const workerCount = Math.min(limit, tests.length);
  const workers = Array.from({ length: workerCount }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= tests.length) return;
      onDone(await runTest(tests[index]));
    }
  });
  await Promise.all(workers);
}

const childProcesses = new Set();

function shutdown(signal) {
  for (const child of childProcesses) child.kill(signal);
  process.exitCode = signal === "SIGINT" ? 130 : 143;
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

async function main() {
  assertSerialClassificationConsistent(TEST_FILES, SERIAL_TEST_FILES);

  const serialTests = TEST_FILES.filter((file) => SERIAL_TEST_FILES.has(file));
  const parallelTests = TEST_FILES.filter((file) => !SERIAL_TEST_FILES.has(file));
  const limit = concurrencyLimit();

  const started = Date.now();
  console.log(
    `[test:suite] ${TEST_FILES.length} 个测试（${serialTests.length} 个碰库串行 + ${parallelTests.length} 个并行，并发度 ${limit}）`,
  );

  const results = [];
  const record = (result) => {
    results.push(result);
    const mark = result.exitCode === 0 ? "✓" : `✗ (exit ${result.exitCode})`;
    console.log(`${mark} ${result.file}`);
  };

  await Promise.all([
    drainSerial(serialTests, record),
    drainParallel(parallelTests, limit, record),
  ]);

  const failed = results.filter((result) => result.exitCode !== 0);
  const elapsedMs = Date.now() - started;

  if (failed.length > 0) {
    console.error(`\n[test:suite] ${failed.length} 个测试失败：`);
    for (const result of failed) {
      const header = `\n───── ${result.file}${result.signal ? ` (${result.signal})` : ""} ─────`;
      console.error(header);
      process.stderr.write((result.output || "").trimEnd() || "<no output>");
      process.stderr.write("\n");
    }
  }

  console.log(
    `[test:suite] ${results.length - failed.length}/${results.length} 通过，耗时 ${(elapsedMs / 1000).toFixed(1)}s`,
  );

  if (failed.length > 0) process.exitCode = 1;
}

await main();
