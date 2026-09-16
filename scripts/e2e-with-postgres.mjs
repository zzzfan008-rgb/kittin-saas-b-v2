import { spawnSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  acquireTestLock,
  assertTestDatabaseReachable,
  createComposeProjectName,
  resetTestDatabase,
  resolveTestDatabaseUrl,
} from "./test-with-postgres.mjs";

/**
 * 隔离的 Playwright E2E 运行器（原生本机 PostgreSQL，不再使用 Docker）。
 *
 * 与单元测试 runner 共用同一个隔离测试库与工作区锁；E2E 只额外占用临时端口与临时 DATA_DIR，
 * 并把 AI 凭据显式置为不可用的 dummy 值，确保 E2E 永远不会触发真实付费调用。
 */

async function reserveFreePorts(count) {
  const servers = [];
  try {
    for (let index = 0; index < count; index += 1) {
      const server = createServer();
      server.unref();
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      servers.push(server);
    }

    return servers.map((server) => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Unable to reserve an E2E port");
      }
      return address.port;
    });
  } finally {
    await Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))));
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
}

function runNpmScript(script, env, args = []) {
  if (process.env.npm_execpath) {
    run(process.execPath, [process.env.npm_execpath, "run", script, ...(args.length ? ["--", ...args] : [])], { env });
    return;
  }
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", script, ...(args.length ? ["--", ...args] : [])], { env });
}

export function playwrightArgsFromCli(args) {
  return args.filter((arg) => arg !== "--skip-build");
}

async function main() {
  const baseRunId = createComposeProjectName();
  const releaseLock = acquireTestLock({ projectName: baseRunId });
  const dataDir = mkdtempSync(join(tmpdir(), "garment-canvas-e2e-"));
  let cleanupDone = false;

  const cleanup = () => {
    if (cleanupDone) return;
    cleanupDone = true;
    try {
      rmSync(dataDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn(cleanupError instanceof Error ? cleanupError.message : String(cleanupError));
    }
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
    const databaseUrl = resolveTestDatabaseUrl();
    await assertTestDatabaseReachable(databaseUrl);
    // E2E 通过 INITIAL_ADMIN_* 在无用户时引导管理员；原生测试库会跨运行保留状态，
    // 因此这里显式清空 schema，恢复「每次运行一个全新数据库」的语义。
    await resetTestDatabase(databaseUrl);
    console.log("E2E: 隔离测试库已重置为干净状态");
    const [apiPort, webPort] = await reserveFreePorts(2);

    const e2eEnv = {
      ...process.env,
      E2E_ISOLATED_RUN: "1",
      NODE_ENV: "test",
      DATABASE_URL: databaseUrl,
      DATA_DIR: dataDir,
      SQLITE_IMPORT_FILE: join(dataDir, "missing.db"),
      INITIAL_ADMIN_ACCOUNT_ID: "e2e-admin",
      INITIAL_ADMIN_PASSWORD: "E2eInitial1234",
      E2E_ACCOUNT_ID: "e2e-admin",
      E2E_INITIAL_PASSWORD: "E2eInitial1234",
      E2E_PASSWORD: "E2eFinal5678",
      E2E_AUTH_STATE_PATH: join(dataDir, "auth.json"),
      PORT: String(apiPort),
      API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
      E2E_API_URL: `http://127.0.0.1:${apiPort}`,
      E2E_BASE_URL: `http://127.0.0.1:${webPort}`,
      COOKIE_SECURE: "false",
      API_ONLY: "false",
      APIYI_API_KEY: "e2e-disabled",
      APIYI_BASE_URL: "https://127.0.0.1:9",
      AI_TIMEOUT_MS: "500",
      GENERATION_WORKER_POLL_MS: "60000",
      NO_PROXY: "127.0.0.1,localhost",
      GITHUB_PAT: "",
      GARMENT_CANVAS_BUILD_CODE_SHA: "0123456789abcdef0123456789abcdef01234567",
      GARMENT_CANVAS_CODE_SHA: "0123456789abcdef0123456789abcdef01234567",
    };

    runNpmScript("test:e2e:run", e2eEnv, playwrightArgsFromCli(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    cleanup();
  }
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isMain) await main();
