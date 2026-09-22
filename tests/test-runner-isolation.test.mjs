import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  acquireTestLock,
  createComposeProjectName,
  createDatabaseLockName,
  resolveRequestedTestFiles,
  resolveTestDatabaseUrl,
  validateTestDatabaseUrl,
} from "../scripts/test-with-postgres.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const runnerPath = join(repoRoot, "scripts/test-with-postgres.mjs");

function writeCommandShim(path) {
  writeFileSync(
    path,
    `#!/usr/bin/env node
const { appendFileSync } = require("node:fs");
const { basename } = require("node:path");
appendFileSync(
  process.env.RUNNER_CALL_LOG,
  JSON.stringify({ command: basename(process.argv[1]), args: process.argv.slice(2) }) + "\\n",
);
`,
    "utf8",
  );
  chmodSync(path, 0o755);
}

const first = createComposeProjectName({ cwd: "/tmp/worktree-a" });
const second = createComposeProjectName({ cwd: "/tmp/worktree-b" });
const repeat = createComposeProjectName({ cwd: "/tmp/worktree-a" });

assert.match(first, /^garment-canvas-test-[a-f0-9]{10}$/);
assert.equal(first, repeat, "the same worktree must reuse its isolation lock name after a crash");
assert.notEqual(first, second, "different worktrees must use different isolation lock names");

// 库级锁名：同一数据库（无论来自哪个 worktree）必须映射到同一把锁；
// 不同数据库各自独立。锁名不携带 worktree 信息，这是本次隔离修复的核心。
const dbA = "postgresql://u:p@127.0.0.1:5432/garment_canvas_test";
const dbADefaultPort = "postgresql://u:p@127.0.0.1/garment_canvas_test";
const dbB = "postgresql://u:p@127.0.0.1:5432/garment_canvas_other_test";
const dbC = "postgresql://u:p@127.0.0.1:5433/garment_canvas_test";
const lockOfA = createDatabaseLockName({ databaseUrl: dbA });
assert.match(lockOfA, /^garment-canvas-db-[a-f0-9]{16}$/);
assert.equal(lockOfA, createDatabaseLockName({ databaseUrl: dbADefaultPort }));
assert.notEqual(lockOfA, createDatabaseLockName({ databaseUrl: dbB }), "different database names must use different locks");
assert.notEqual(lockOfA, createDatabaseLockName({ databaseUrl: dbC }), "different ports must use different locks");
assert.throws(() => createDatabaseLockName({}), /database URL is required/);

assert.deepEqual(
  resolveRequestedTestFiles(["tests/authorization.test.ts"], { repoRoot }),
  [realpathSync(join(repoRoot, "tests/authorization.test.ts"))],
  "the runner must resolve an explicit focused test inside the repository test directory",
);
assert.throws(
  () => resolveRequestedTestFiles(["package.json"], { repoRoot }),
  /must be \.test\.ts or \.test\.mjs files/,
  "the runner must reject non-test inputs",
);
assert.throws(
  () => resolveRequestedTestFiles(["../outside.test.ts"], { repoRoot }),
  /ENOENT|must stay inside/,
  "the runner must reject paths outside the repository test directory",
);

// 测试库连接串必须指向本机且以 _test 结尾，否则 runner 拒绝启动。
const localTestUrl = "postgresql://runner_user:runner_secret@127.0.0.1:5432/garment_canvas_test";
assert.equal(
  validateTestDatabaseUrl(localTestUrl, "DATABASE_URL"),
  localTestUrl,
  "a local *_test database must be accepted",
);
assert.throws(
  () => validateTestDatabaseUrl("postgresql://runner_user:runner_secret@db.internal:5432/garment_canvas_test", "DATABASE_URL"),
  /只允许连接本机 PostgreSQL/,
  "a remote database must be refused",
);
assert.throws(
  () => validateTestDatabaseUrl("postgresql://runner_user:runner_secret@127.0.0.1:5432/garment_canvas", "DATABASE_URL"),
  /必须以 _test 结尾/,
  "a database without the _test suffix must be refused so the development database cannot be reset",
);
assert.throws(
  () => validateTestDatabaseUrl("mysql://runner_user:runner_secret@127.0.0.1:5432/garment_canvas_test", "DATABASE_URL"),
  /必须是 postgresql:\/\//,
  "a non-PostgreSQL URL must be refused",
);
assert.throws(
  () => validateTestDatabaseUrl("postgresql://127.0.0.1:5432/garment_canvas_test", "DATABASE_URL"),
  /必须同时包含用户名和密码/,
  "credentials must be present",
);

const refusal = (() => {
  try {
    validateTestDatabaseUrl("postgresql://runner_user:runner_secret@db.internal:5432/garment_canvas_test", "DATABASE_URL");
  } catch (error) {
    return error.message;
  }
  return "";
})();
assert.equal(
  refusal.includes("runner_secret"),
  false,
  "a refused connection string must never echo the password",
);

const derivedRoot = mkdtempSync(join(tmpdir(), "garment-canvas-dotenv-"));
try {
  const derivedEnvPath = join(derivedRoot, ".env");
  writeFileSync(
    derivedEnvPath,
    [
      "APIYI_API_KEY=must-not-leak",
      "POSTGRES_DB=garment_canvas",
      "POSTGRES_USER=garment_canvas",
      "POSTGRES_PASSWORD=p@ss word",
      "POSTGRES_HOST_PORT=5432",
      "",
    ].join("\n"),
    "utf8",
  );
  const derived = resolveTestDatabaseUrl({}, { dotEnvPath: derivedEnvPath });
  assert.equal(
    derived,
    "postgresql://garment_canvas:p%40ss%20word@127.0.0.1:5432/garment_canvas_test",
    "the runner must derive the isolated *_test database from .env and percent-encode credentials",
  );
  assert.equal(
    derived.includes("must-not-leak"),
    false,
    "由 .env 推导的测试库连接串绝不能携带非 PostgreSQL 的凭据（付费 provider 密钥不得进入测试进程）",
  );
  const emptyEnv = {};
  assert.throws(
    () => resolveTestDatabaseUrl(emptyEnv, { dotEnvPath: join(derivedRoot, "missing.env") }),
    /无法确定测试库连接串/,
    "the runner must fail closed when no PostgreSQL configuration exists",
  );
  assert.equal(
    Object.keys(emptyEnv).length,
    0,
    "resolving the test database must not mutate the caller environment",
  );
} finally {
  rmSync(derivedRoot, { recursive: true, force: true });
}

const lockRoot = join(tmpdir(), `garment-canvas-lock-test-${process.pid}`);
mkdirSync(lockRoot, { recursive: true });
try {
  const release = await acquireTestLock({
    projectName: first,
    lockRoot,
    isProcessActive: () => true,
  });
  await assert.rejects(
    () =>
      acquireTestLock({
        projectName: first,
        lockRoot,
        isProcessActive: () => true,
        waitTimeoutMs: 10,
        pollIntervalMs: 5,
        sleepFn: () => Promise.resolve(),
      }),
    /Another PostgreSQL test run is active for the same database/,
    "a second run against the same database must wait and then fail instead of touching the shared database",
  );

  // 锁文件存在但 PID 不可读（winner open/write 之间的跨进程窗口）：
  // 必须 fail closed 等待，绝不允许当成死锁接管。
  const unreadableLock = join(lockRoot, `${second}.lock`);
  writeFileSync(unreadableLock, "\n", "utf8");
  await assert.rejects(
    () =>
      acquireTestLock({
        projectName: second,
        lockRoot,
        isProcessActive: () => {
          throw new Error("isProcessActive must not be consulted for an unreadable pid");
        },
        waitTimeoutMs: 5,
        pollIntervalMs: 5,
        sleepFn: () => Promise.resolve(),
      }),
    /unreadable owner pid/,
    "an unreadable owner pid must be treated as an active owner, never as a stale lock",
  );
  rmSync(unreadableLock, { force: true });

  release();

  const staleLock = join(lockRoot, `${first}.lock`);
  writeFileSync(staleLock, "999999\n", "utf8");
  const releaseAfterCrash = await acquireTestLock({
    projectName: first,
    lockRoot,
    isProcessActive: () => false,
  });
  assert.equal(existsSync(staleLock), true, "a stale lock must be replaced by the current run");
  releaseAfterCrash();
  assert.equal(existsSync(staleLock), false, "the current run must release its lock");
} finally {
  rmSync(lockRoot, { recursive: true, force: true });
}

const symlinkTestRoot = mkdtempSync(join(tmpdir(), "garment-canvas-runner-symlink-"));
try {
  const shimDir = join(symlinkTestRoot, "bin");
  const runnerCwd = join(symlinkTestRoot, "runner-cwd");
  const runnerSymlink = join(symlinkTestRoot, "postgres-test-runner.mjs");
  const callLog = join(symlinkTestRoot, "calls.jsonl");
  mkdirSync(shimDir);
  mkdirSync(runnerCwd);
  symlinkSync(process.execPath, join(shimDir, "node"));
  writeCommandShim(join(shimDir, "docker"));
  writeCommandShim(join(shimDir, process.platform === "win32" ? "npm.cmd" : "npm"));
  symlinkSync(runnerPath, runnerSymlink);

  const result = spawnSync(process.execPath, [runnerSymlink], {
    cwd: runnerCwd,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${shimDir}:${process.env.PATH ?? ""}`,
      npm_execpath: "",
      RUNNER_CALL_LOG: callLog,
    },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const calls = readFileSync(callLog, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  const dockerCalls = calls.filter(({ command }) => command === "docker");
  const npmCalls = calls.filter(({ command }) => basename(command).startsWith("npm"));
  assert.equal(
    dockerCalls.length,
    0,
    "the native runner must not shell out to Docker: the isolated test database is a local PostgreSQL database",
  );
  assert.deepEqual(npmCalls.map(({ args }) => args), [["run", "test:suite"]]);
} finally {
  rmSync(symlinkTestRoot, { recursive: true, force: true });
}

console.log("test runner isolation tests passed");
