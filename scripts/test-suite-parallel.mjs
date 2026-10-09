import { spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { cpus } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * test:suite 并行运行器。
 *
 * 现状：`test:suite` 是一条 75 段的 `&&` 链，每段一个新进程串行 spawn（实测 99.6s）。
 * 本脚本在「任一文件失败 → 整体失败、退出码非 0」这一语义不变的前提下，把测试文件
 * 分批并发执行，只保留「碰库」的文件串行，把墙钟压到尽量低。
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
 * 清单完整性不变量（fail-closed，防复发）：启动时把盘上 tests/*.test.{ts,mjs} 与
 * TEST_FILES 的去重集做精确相等断言，并拒绝任何重复条目。历史上 TEST_FILES 曾累积出
 * 59 条整块重复副本且漏登记 17 个测试文件（同名测试重复并发互踩临时目录、碰库测试逃逸
 * 串行分类扫描），本断言让这两类漂移在启动时直接报错拒绝运行，而不是悄悄产出不可信的
 * 「通过」。留盘不登记的文件在 EXCLUDED_FROM_MANIFEST 里显式豁免。
 *
 * 分类不变量（fail-closed）：SERIAL_TEST_FILES 是「碰库」文件的显式登记表；启动时会对
 * TEST_FILES 里的每个测试文件做一次源码扫描，凡导入 resetPostgresTestDatabase 标记的文件
 * 必须恰好等于这张登记表。若有人新增了碰库测试却没把它加进登记表，本脚本直接报错拒绝
 * 运行，而不是把它放到并发池里制造偶发串扰。
 */

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

/**
 * 全套件测试文件（有序，取代 package.json 里原来的 `&&` 链）。
 * 清单必须与盘上 tests/*.test.{ts,mjs} 精确一致（见 EXCLUDED_FROM_MANIFEST 豁免），
 * 启动时由 assertManifestMatchesDisk 做 fail-closed 断言。
 */
const TEST_FILES = [
  // R-90 坐标映射契约（useImageZoom hook 核心数学）。
  "tests/image-zoom-contract.test.ts",
  // R-94 Lightbox store 最小行为契约。
  "tests/lightbox-store.test.ts",
  // Select 可见性硬化契约（Phase 0）。
  "tests/select-visibility.test.ts",
  // 预设模板文本一致性锁定（64 Phase 2 裁决 B）。
  "tests/prompt-presets-catalog.test.ts",
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
  "tests/asset-library-model.test.ts",
  "tests/apiyi-docs.test.ts",
  "tests/r48-version-gate.test.ts",
  "tests/prompt-run-admission.test.ts",
  "tests/dag.test.ts",
  "tests/document-snapshot.test.ts",
  "tests/active-document-boundary.test.ts",
  "tests/workflow-schema.test.ts",
  "tests/generation-kind-contract.test.ts",
  // 65d §1.3：runPlan 蒙版重绘前置校验（纯函数，不碰库）。
  "tests/run-plan-image-edit.test.ts",
  "tests/apiyi-transport.test.ts",
  "tests/provider-contract.test.ts",
  "tests/mask-processing.test.ts",
  "tests/provider-retry.test.ts",
  "tests/exact-generation.test.ts",
  "tests/upload-image-normalization.test.ts",
  "tests/mask-upload.test.ts",
  // 65d v2：editDraftUpload JSON 传输契约（纯函数，不碰库）。
  "tests/edit-draft-upload.test.ts",
  "tests/static-frontend.test.ts",
  "tests/sqlite-postgres-migration.test.ts",
  "tests/auth-storage.test.ts",
  "tests/auth-client.test.ts",
  "tests/authorization.test.ts",
  "tests/tutorials.test.ts",
  "tests/schema-migrations.test.ts",
  "tests/run-queue.test.ts",
  "tests/unknown-kind-viewer.test.ts",
  "tests/image-viewer-reference-evidence.test.ts",
  "tests/project-tabs-session.test.ts",
  "tests/initial-draft-client.test.ts",
  "tests/empty-canvas.test.ts",
  "tests/flow-history.test.ts",
  "tests/text-edit-coalescing.test.ts",
  "tests/selection-consistency.test.ts",
  "tests/project-tabs.test.ts",
  "tests/result-export.test.ts",
  "tests/verify-bundle-budget.test.ts",
  "tests/cards-58-60-61.test.ts",
  // R-85：本地 shadcn Slider 受控回写契约护栏（纯源码断言，不碰库）。
  "tests/ui-slider-controlled-contract.test.ts",

  // P0 清单修复（审计 2026-10-02）：以下 12 个测试文件此前只在盘上、从未被执行。
  "tests/asset-model-category.test.ts",
  "tests/canvas-dock-keyboard.test.ts",
  "tests/five-node-model-ui.test.ts",
  "tests/grid-snap-ui.test.ts",
  "tests/grid-snap.test.ts",
  "tests/node-product-policy.test.ts",
  "tests/openai-mask-test.test.ts",
  "tests/performance-baseline.test.ts",
  "tests/provider-error-i18n.test.ts",
  "tests/recent-results.test.ts",
  "tests/reference-inputs.test.ts",
  "tests/video-provider.test.ts",

  // 64 Phase 1（backend C1-C7）：冻结提示词常量快照 + runner taskPrompt 组装回归（纯逻辑，非碰库）。
  "tests/prompt-presets-frozen.test.ts",
  "tests/runner-task-prompt.test.ts",
  // 64 Phase 1 C7：templates-v8.test.ts 已重写为 v9 快照断言（处置落地），从 EXCLUDED 摘除重新登记。
  "tests/templates-v8.test.ts",
];

/**
 * 留盘不登记的测试文件（豁免清单完整性断言）：文件保留在盘上但不进 TEST_FILES，
 * 处置统一归档 64 Phase 3 / 65（用户已拍板）：
 * - prompt-preset-ui：被测 UI 模块属 64 Phase 2 前端重构面，测试文件留盘随 65 UX 改造一并处置。
 *   （prompt-presets / prompt-evaluation-release 已随 64 Phase 3 删除，prompt-evaluation
 *   已随用户拍板 a=删连同被测孤儿模块删除，豁免已同步撤除。）
 * 若其中某个文件先被删除，本常量需同步移除对应条目，
 * 否则 assertManifestMatchesDisk 的 excludedButGone 检查会 fail-closed 报错。
 */
const EXCLUDED_FROM_MANIFEST = new Set([
  "tests/prompt-preset-ui.test.ts",
]);

/**
 * 「碰库」测试登记表：这些文件会 resetPostgresTestDatabase()（DROP SCHEMA public CASCADE）
 * 共享的本机 `*_test` 库，必须串行执行。新增碰库测试时必须同步把它的路径加进这里，
 * 否则启动时的分类不变量检查会 fail-closed。
 */
const SERIAL_TEST_FILES = new Set([
  "tests/upload-image-normalization.test.ts",
  "tests/sqlite-postgres-migration.test.ts",
  "tests/auth-storage.test.ts",
  "tests/authorization.test.ts",
  "tests/tutorials.test.ts",
  "tests/schema-migrations.test.ts",
  "tests/run-queue.test.ts",
  // P0 清单修复补入：以下 3 个碰库测试此前不在清单（连同清单一起逃逸扫描）。
  "tests/asset-model-category.test.ts",
  "tests/openai-mask-test.test.ts",
  "tests/performance-baseline.test.ts",
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

/** 盘上 tests/*.test.{ts,mjs} 全量发现（清单完整性断言的数据源）。 */
function discoverTestFilesOnDisk() {
  return readdirSync(join(repoRoot, "tests"))
    .filter((name) => /\.test\.(ts|mjs)$/.test(name))
    .map((name) => `tests/${name}`)
    .sort();
}

/**
 * 清单完整性不变量（fail-closed）：
 * 1. TEST_FILES 内不得有重复条目（同名测试重复并发会互踩临时目录）；
 * 2. 盘上测试文件（扣除 EXCLUDED_FROM_MANIFEST）必须与 TEST_FILES 去重集精确相等，
 *    双向差异都会报错并打印清单；
 * 3. EXCLUDED_FROM_MANIFEST 的条目必须仍在盘上（已删文件需同步清理常量）。
 */
function assertManifestMatchesDisk(testFiles) {
  const problems = [];

  const seen = new Set();
  const duplicates = [];
  for (const file of testFiles) {
    if (seen.has(file)) duplicates.push(file);
    seen.add(file);
  }
  if (duplicates.length > 0) {
    problems.push(
      `TEST_FILES 存在重复条目（同名测试重复执行会互踩临时目录，请去重）：\n  ${[...new Set(duplicates)].join("\n  ")}`,
    );
  }

  const onDisk = discoverTestFilesOnDisk();
  const registered = new Set(testFiles);
  const missingFromManifest = onDisk.filter(
    (file) => !registered.has(file) && !EXCLUDED_FROM_MANIFEST.has(file),
  );
  const staleInManifest = testFiles.filter((file) => !onDisk.includes(file));
  const excludedButRegistered = testFiles.filter((file) => EXCLUDED_FROM_MANIFEST.has(file));
  const excludedButGone = [...EXCLUDED_FROM_MANIFEST].filter((file) => !onDisk.includes(file));

  if (missingFromManifest.length > 0) {
    problems.push(
      `以下测试文件在盘上但未登记进 TEST_FILES（会从未被执行；若应运行请登记，若留盘不登记请加入 EXCLUDED_FROM_MANIFEST）：\n  ${missingFromManifest.join("\n  ")}`,
    );
  }
  if (staleInManifest.length > 0) {
    problems.push(
      `以下路径登记在 TEST_FILES 但盘上已不存在（请从清单移除）：\n  ${staleInManifest.join("\n  ")}`,
    );
  }
  if (excludedButRegistered.length > 0) {
    problems.push(
      `以下路径既在 TEST_FILES 又在 EXCLUDED_FROM_MANIFEST（豁免只适用于留盘不登记的文件，请二选一）：\n  ${excludedButRegistered.join("\n  ")}`,
    );
  }
  if (excludedButGone.length > 0) {
    problems.push(
      `以下路径登记在 EXCLUDED_FROM_MANIFEST 但盘上已不存在（请同步清理豁免常量）：\n  ${excludedButGone.join("\n  ")}`,
    );
  }

  if (problems.length > 0) {
    throw new Error(`清单完整性断言失败（fail-closed，拒绝运行）：\n${problems.join("\n")}`);
  }
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
  assertManifestMatchesDisk(TEST_FILES);
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

  // 串行必须先完成（schema reset），并行池只在串行全退场后才启动，消除碰库测试与并行测试的并发写冲突。
  await drainSerial(serialTests, record);
  await drainParallel(parallelTests, limit, record);

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
