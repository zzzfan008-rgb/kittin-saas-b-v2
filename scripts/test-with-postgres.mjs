import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, existsSync, openSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pg from "pg";

/**
 * 隔离的 PostgreSQL 测试运行器（原生本机 PostgreSQL，不再使用 Docker）。
 *
 * 数据隔离由专门的测试库承担：runner 只解析出本地 `*_test` 库的连接串并传给测试进程，
 * 库内状态由测试自身通过 `resetPostgresTestDatabase()` 重置（与既有行为一致：
 * 容器模式也只保证一次运行开始时是干净的）。
 *
 * 安全约束：连接串必须指向本机且数据库名以 `_test` 结尾，否则 runner 直接拒绝启动，
 * 避免误连、误删开发库。runner 也绝不会把 .env 里的 AI 凭据扩散到测试进程。
 */

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

/**
 * 解析本机 .env 路径：优先当前工作区（worktree）根目录的 .env；
 * worktree 通常不持有私有 .env，则回退到主工作树（git common dir 的父目录）的 .env。
 *
 * 这样无论从主仓还是任意 worktree 起测试，读取的都是同一份本机 PostgreSQL 配置；
 * 配合库级全局锁，跨 worktree 不会再因各自推导到同一库而互相 reset。
 */
function defaultDotEnvPath() {
  const localEnv = join(repositoryRoot, ".env");
  if (existsSync(localEnv)) return localEnv;
  try {
    const result = spawnSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
      encoding: "utf8",
      cwd: repositoryRoot,
    });
    if (result.status === 0) {
      const mainWorktreeEnv = join(resolve(result.stdout.trim(), ".."), ".env");
      if (existsSync(mainWorktreeEnv)) return mainWorktreeEnv;
    }
  } catch {
    // git 不可用时退回默认路径，由后续逻辑给出明确报错
  }
  return localEnv;
}

const LOCAL_DATABASE_HOSTS = new Set(["127.0.0.1", "localhost"]);
const { Client } = pg;

/** 稳定的工作区运行标识：同一工作区在崩溃后必须复用同一个锁名。 */
export function createComposeProjectName({ cwd = process.cwd() } = {}) {
  const worktreeId = createHash("sha256").update(resolve(cwd)).digest("hex").slice(0, 10);
  return `garment-canvas-test-${worktreeId}`;
}

/**
 * 库级互斥锁名：按「主机:端口:库名」派生，与 worktree 无关。
 *
 * 同一台机器上，只要两个运行解析到同一个测试库，就必须竞争同一把锁——
 * 无论它们来自主仓还是任意 worktree。不同的库各自独立，互不阻塞。
 */
export function createDatabaseLockName({ databaseUrl } = {}) {
  if (!databaseUrl) throw new Error("A database URL is required for the database lock name");
  const parsed = new URL(databaseUrl);
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  const identity = `${parsed.hostname}:${parsed.port || "5432"}:${databaseName}`;
  const databaseId = createHash("sha256").update(identity).digest("hex").slice(0, 16);
  return `garment-canvas-db-${databaseId}`;
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function processIsActive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

export async function acquireTestLock({
  projectName,
  pid = process.pid,
  lockRoot = tmpdir(),
  isProcessActive = processIsActive,
  waitTimeoutMs = 0,
  pollIntervalMs = 500,
  sleepFn = sleep,
} = {}) {
  if (!projectName) throw new Error("A lock project name is required for the test lock");
  if (!Number.isSafeInteger(waitTimeoutMs) || waitTimeoutMs < 0) {
    throw new Error(`waitTimeoutMs must be a non-negative safe integer, got ${String(waitTimeoutMs)}`);
  }
  const lockPath = join(lockRoot, `${projectName}.lock`);
  const deadline = Date.now() + waitTimeoutMs;
  let ownerPid;

  for (;;) {
    let descriptor;
    try {
      descriptor = openSync(lockPath, "wx", 0o600);
      writeFileSync(descriptor, `${pid}\n`, "utf8");
      let released = false;
      return () => {
        if (released) return;
        released = true;
        closeSync(descriptor);
        try {
          unlinkSync(lockPath);
        } catch (error) {
          if (error?.code !== "ENOENT") throw error;
        }
      };
    } catch (error) {
      if (descriptor !== undefined) {
        closeSync(descriptor);
        try {
          unlinkSync(lockPath);
        } catch (unlinkError) {
          if (unlinkError?.code !== "ENOENT") throw unlinkError;
        }
      }
      if (error?.code !== "EEXIST") throw error;

      try {
        ownerPid = Number.parseInt(readFileSync(lockPath, "utf8").trim(), 10);
      } catch (readError) {
        if (readError?.code === "ENOENT") continue;
        throw readError;
      }
      // 锁文件已存在但 PID 尚不可读（winner 刚 open 尚未 write，存在跨进程窗口）：
      // 绝不能当作死锁接管——等待后重试，fail closed。
      if (!Number.isSafeInteger(ownerPid) || ownerPid <= 0) {
        if (Date.now() >= deadline) {
          throw new Error(
            `Another PostgreSQL test run is starting for the same database (lock ${projectName}, unreadable owner pid); ` +
              `waited ${waitTimeoutMs}ms`,
          );
        }
        await sleepFn(Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())));
        continue;
      }
      // 持锁进程已死（崩溃残留锁）：立即接管，不等待。
      if (!isProcessActive(ownerPid)) {
        try {
          unlinkSync(lockPath);
        } catch (unlinkError) {
          if (unlinkError?.code !== "ENOENT") throw unlinkError;
        }
        continue;
      }
      if (Date.now() >= deadline) {
        throw new Error(
          `Another PostgreSQL test run is active for the same database (lock ${projectName}, pid ${ownerPid}); ` +
            `waited ${waitTimeoutMs}ms`,
        );
      }
      await sleepFn(Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())));
    }
  }
}

/**
 * 只读取 .env 中的 PostgreSQL 连接键。绝不注入 AI 凭据，也不改动 process.env，
 * 因此测试进程不会因为加载 .env 而获得可用的付费 provider 密钥。
 *
 * 这份凭据隔离由 tests/test-runner-isolation.test.mjs 用一份含 APIYI_API_KEY 的
 * 临时 .env 断言覆盖：推导出的连接串不得包含该值，调用方环境不得被改动。
 */
function readPostgresKeysFromDotEnv(dotEnvPath) {
  if (!existsSync(dotEnvPath)) return {};
  const allowed = new Set([
    "PGHOST",
    "PGPORT",
    "PGUSER",
    "PGPASSWORD",
    "PGDATABASE",
    "POSTGRES_HOST_PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
  ]);
  const values = {};
  for (const rawLine of readFileSync(dotEnvPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!allowed.has(key)) continue;
    values[key] = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

/**
 * 校验并返回测试库连接串；错误信息只回显主机与库名，绝不回显凭据。
 *
 * 全部拒绝路径（非本机 host、库名不以 _test 结尾、协议不是 postgresql、
 * 缺用户名或密码）以及「错误信息不得回显密码」，都由
 * tests/test-runner-isolation.test.mjs 断言覆盖；该文件是 test:suite 的第一项。
 */
export function validateTestDatabaseUrl(value, source) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${source} 不是合法的 PostgreSQL 连接串`);
  }
  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error(`${source} 必须是 postgresql:// 连接串`);
  }
  if (!LOCAL_DATABASE_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `${source} 只允许连接本机 PostgreSQL（127.0.0.1 或 localhost），当前主机为 ${parsed.hostname}`,
    );
  }
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!databaseName.endsWith("_test")) {
    throw new Error(`${source} 的数据库名必须以 _test 结尾，避免误用开发库，当前为 ${databaseName || "(空)"}`);
  }
  if (!parsed.username || !parsed.password) {
    throw new Error(`${source} 必须同时包含用户名和密码`);
  }
  return value;
}

/**
 * 解析本次运行要使用的隔离测试库连接串。
 * 优先级：显式 DATABASE_URL / GARMENT_CANVAS_TEST_DATABASE_URL > .env 推导（库名追加 _test）。
 */
export function resolveTestDatabaseUrl(env = process.env, { dotEnvPath = defaultDotEnvPath() } = {}) {
  const explicit = (env.DATABASE_URL ?? "").trim() || (env.GARMENT_CANVAS_TEST_DATABASE_URL ?? "").trim();
  if (explicit) return validateTestDatabaseUrl(explicit, "DATABASE_URL");

  const file = readPostgresKeysFromDotEnv(dotEnvPath);
  const host = (env.PGHOST ?? "").trim() || file.PGHOST || "127.0.0.1";
  const port = (env.PGPORT ?? "").trim() || file.PGPORT || file.POSTGRES_HOST_PORT || "5432";
  const user = (env.PGUSER ?? "").trim() || file.PGUSER || file.POSTGRES_USER || "";
  const password = env.PGPASSWORD || file.PGPASSWORD || file.POSTGRES_PASSWORD || "";
  const database = (env.PGDATABASE ?? "").trim() || file.PGDATABASE || file.POSTGRES_DB || "";

  if (!user || !password || !database) {
    throw new Error(
      "无法确定测试库连接串：请在私有 .env 中配置 POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB，" +
        "或显式设置 DATABASE_URL / GARMENT_CANVAS_TEST_DATABASE_URL",
    );
  }
  const url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(
    database,
  )}_test`;
  return validateTestDatabaseUrl(url, "由 .env 推导的测试库");
}

/** 只读探活：数据库不可达时给出可执行的提示，而不是让测试零零散散地失败。 */
export async function assertTestDatabaseReachable(databaseUrl) {
  const parsed = new URL(databaseUrl);
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  const client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 5_000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `测试库 ${parsed.hostname}:${parsed.port}/${databaseName} 不可达或凭据无效（${reason}）。\n` +
        "本机原生 PostgreSQL 可用以下方式确认：\n" +
        "  brew services start postgresql@18\n" +
        "  /opt/homebrew/opt/postgresql@18/bin/pg_isready -h 127.0.0.1 -p 5432",
    );
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * 清空隔离测试库的 public schema。
 *
 * 与「每次运行一个全新容器」等价，供需要 pristine 数据库的流程使用（E2E 依赖
 * INITIAL_ADMIN_* 在无用户时引导管理员账号）。调用方必须已持有工作区锁。
 * 破坏性操作前重新校验连接串，确保只会作用于本机 `*_test` 库；
 * 该校验与拒绝路径由 tests/test-runner-isolation.test.mjs 覆盖。
 */
export async function resetTestDatabase(databaseUrl) {
  validateTestDatabaseUrl(databaseUrl, "重置目标");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await client.query("CREATE SCHEMA public");
  } finally {
    await client.end().catch(() => {});
  }
}

export function resolveRequestedTestFiles(args, { repoRoot = repositoryRoot } = {}) {
  const testsRoot = realpathSync(join(repoRoot, "tests"));
  return args.map((requestedPath) => {
    if (!/\.test\.(?:mjs|ts)$/.test(requestedPath)) {
      throw new Error(`Focused PostgreSQL tests must be .test.ts or .test.mjs files: ${requestedPath}`);
    }
    const resolvedPath = realpathSync(resolve(repoRoot, requestedPath));
    const relativePath = relative(testsRoot, resolvedPath);
    if (relativePath.startsWith("..") || resolve(testsRoot, relativePath) !== resolvedPath) {
      throw new Error(`Focused PostgreSQL tests must stay inside ${testsRoot}: ${requestedPath}`);
    }
    return resolvedPath;
  });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
}

function runNpmScript(script, env) {
  if (process.env.npm_execpath) {
    run(process.execPath, [process.env.npm_execpath, "run", script], { env });
    return;
  }
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", script], { env });
}

function runFocusedTests(testFiles, env) {
  const tsxCli = join(repositoryRoot, "node_modules/tsx/dist/cli.mjs");
  for (const testFile of testFiles) {
    const args = testFile.endsWith(".ts") ? [tsxCli, testFile] : [testFile];
    run(process.execPath, args, { env });
  }
}

function lockWaitTimeoutMs() {
  const raw = (process.env.TEST_DB_LOCK_WAIT_MS ?? "").trim();
  if (!raw) return 600_000;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`TEST_DB_LOCK_WAIT_MS 必须是 >= 0 的整数，当前为 ${JSON.stringify(raw)}`);
  }
  return value;
}

async function main() {
  const focusedTestFiles = resolveRequestedTestFiles(process.argv.slice(2));
  const databaseUrl = resolveTestDatabaseUrl();
  const lockName = createDatabaseLockName({ databaseUrl });
  const releaseLock = await acquireTestLock({ projectName: lockName, waitTimeoutMs: lockWaitTimeoutMs() });
  let cleanupDone = false;

  const cleanup = () => {
    if (cleanupDone) return;
    cleanupDone = true;
    try {
      releaseLock();
    } catch (cleanupError) {
      console.warn(cleanupError instanceof Error ? cleanupError.message : String(cleanupError));
    }
  };

  const terminate = (signal) => {
    cleanup();
    process.exitCode = signal === "SIGINT" ? 130 : 143;
  };
  process.once("SIGINT", () => terminate("SIGINT"));
  process.once("SIGTERM", () => terminate("SIGTERM"));

  try {
    await assertTestDatabaseReachable(databaseUrl);
    const testEnv = { ...process.env, DATABASE_URL: databaseUrl };
    if (focusedTestFiles.length > 0) runFocusedTests(focusedTestFiles, testEnv);
    else runNpmScript("test:suite", testEnv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    cleanup();
  }
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isMain) await main();
