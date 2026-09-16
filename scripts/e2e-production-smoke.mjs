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
 * 生产产物冒烟运行器（原生本机 PostgreSQL，不再使用 Docker）。
 *
 * 复用与单元/E2E 测试相同的隔离测试库和工作区锁；只额外构建生产产物、占用一个应用端口，
 * 并把 AI 凭据固定为不可用的 dummy 值。
 */

async function reserveFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Unable to reserve production smoke port"));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
  }
}

function runNpmScript(script, env) {
  if (process.env.npm_execpath) {
    runCommand(process.execPath, [process.env.npm_execpath, "run", script], { env });
    return;
  }
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  runCommand(npm, ["run", script], { env });
}

function runPlaywrightCommand(env) {
  const playwrightCli = join(process.cwd(), "node_modules", "playwright", "cli.js");
  runCommand(process.execPath, [playwrightCli, "test", "--config", "playwright.production.config.ts"], { env });
}

async function main() {
  const shouldBuild = !process.argv.includes("--skip-build");
  const runId = createComposeProjectName();
  const releaseLock = acquireTestLock({ projectName: runId });
  const dataDir = mkdtempSync(join(tmpdir(), "garment-canvas-prod-smoke-"));
  let cleanupDone = false;

  const cleanup = () => {
    if (cleanupDone) return;
    cleanupDone = true;
    releaseLock();
    try {
      rmSync(dataDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(error instanceof Error ? error.message : String(error));
    }
  };

  const handleTerminate = () => {
    cleanup();
    process.exit(128 + 15);
  };
  process.once("SIGINT", handleTerminate);
  process.once("SIGTERM", handleTerminate);

  try {
    const databaseUrl = resolveTestDatabaseUrl();
    await assertTestDatabaseReachable(databaseUrl);
    // 生产冒烟同样依赖 INITIAL_ADMIN_* 在无用户时引导管理员，需要 pristine 数据库。
    await resetTestDatabase(databaseUrl);
    console.log("生产冒烟: 隔离测试库已重置为干净状态");
    const appPort = await reserveFreePort();

    const runnerEnv = {
      ...process.env,
      E2E_ISOLATED_RUN: "1",
      NODE_ENV: "production",
      DATABASE_URL: databaseUrl,
      DATA_DIR: dataDir,
      SQLITE_IMPORT_FILE: join(dataDir, "missing.db"),
      INITIAL_ADMIN_ACCOUNT_ID: "e2e-admin",
      INITIAL_ADMIN_PASSWORD: "E2eInitial1234",
      E2E_ACCOUNT_ID: "e2e-admin",
      E2E_INITIAL_PASSWORD: "E2eInitial1234",
      E2E_PASSWORD: "E2eFinal5678",
      E2E_AUTH_STATE_PATH: join(dataDir, "auth.json"),
      COOKIE_SECURE: "false",
      API_ONLY: "false",
      APIYI_API_KEY: "e2e-disabled",
      APIYI_BASE_URL: "https://127.0.0.1:9",
      AI_TIMEOUT_MS: "500",
      GENERATION_WORKER_POLL_MS: "60000",
      NO_PROXY: "127.0.0.1,localhost",
      PORT: String(appPort),
      E2E_API_URL: `http://127.0.0.1:${appPort}`,
      E2E_BASE_URL: `http://127.0.0.1:${appPort}`,
      E2E_PRODUCTION_SMOKE: "1",
    };

    if (shouldBuild) {
      runNpmScript("build", runnerEnv);
    }
    runPlaywrightCommand(runnerEnv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    cleanup();
    process.off("SIGINT", handleTerminate);
    process.off("SIGTERM", handleTerminate);
  }
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
if (isMain) {
  await main();
}
