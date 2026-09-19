#!/usr/bin/env node
// ui-qa 隔离栈：独立端口 3411(api) / 5411(web)，独立测试库 + 独立 DATA_DIR。
// 绝不占用 orchestrator 的 5173/3001，绝不触发真实付费调用。
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const OUT = "/tmp/gc-uiqa-v4";
const API_PORT = 3411;
const WEB_PORT = 5411;

function readEnvFile(path) {
  const values = {};
  if (!existsSync(path)) return values;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    values[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

const db = {};
const rawLines = existsSync(join(OUT, "db.env")) ? readFileSync(join(OUT, "db.env"), "utf8") : "";
const shellEnv = {};
for (const line of rawLines.split("\n")) {
  const m = line.match(/^export ([A-Z_]+)='(.*)'$/);
  if (m) shellEnv[m[1]] = m[2].replace(/'\\''/g, "'");
}
if (!shellEnv.DATABASE_URL) throw new Error("缺少 db.env，请先运行 bootstrap-db.mjs");

const dataDir = join(OUT, "data");
mkdirSync(dataDir, { recursive: true });

if (process.env.RESET_DB === "1") {
  const { createRequire } = await import("node:module");
  const req = createRequire(join(REPO, "package.json"));
  const pg = req("pg");
  const client = new pg.Client({ connectionString: shellEnv.DATABASE_URL });
  await client.connect();
  await client.query("DROP SCHEMA IF EXISTS public CASCADE");
  await client.query("CREATE SCHEMA public");
  await client.end();
  console.log("isolated test database schema reset");
}

const baseEnv = {
  ...process.env,
  ...shellEnv,
  DATA_DIR: dataDir,
  SQLITE_IMPORT_FILE: join(dataDir, "missing.db"),
  COOKIE_SECURE: "false",
  API_ONLY: "false",
  PORT: String(API_PORT),
  API_PROXY_TARGET: `http://127.0.0.1:${API_PORT}`,
  INITIAL_ADMIN_ACCOUNT_ID: "uiqa-v4-admin",
  INITIAL_ADMIN_PASSWORD: "UiqaV4Initial1234",
  APIYI_API_KEY: "uiqa-disabled",
  APIYI_BASE_URL: "https://127.0.0.1:9",
  AI_TIMEOUT_MS: "500",
  GENERATION_WORKER_POLL_MS: "60000",
  ENABLE_PAID_EVALUATION_RUNS: "false",
  NO_PROXY: "127.0.0.1,localhost",
  GARMENT_CANVAS_BUILD_CODE_SHA: "0123456789abcdef0123456789abcdef01234567",
  GARMENT_CANVAS_CODE_SHA: "0123456789abcdef0123456789abcdef01234567",
};
delete baseEnv.NODE_OPTIONS;

const log = (name, chunk) => {
  const text = chunk.toString();
  for (const line of text.split("\n")) {
    if (line.trim()) console.log(`[${name}] ${line.trim()}`);
  }
};

const server = spawn(join(REPO, "node_modules/.bin/tsx"), ["server/index.ts"], {
  cwd: REPO,
  env: baseEnv,
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (c) => log("api", c));
server.stderr.on("data", (c) => log("api!", c));

const vite = spawn(join(REPO, "node_modules/.bin/vite"), ["--host", "127.0.0.1", "--port", String(WEB_PORT), "--strictPort"], {
  cwd: REPO,
  env: { ...baseEnv },
  stdio: ["ignore", "pipe", "pipe"],
});
vite.stdout.on("data", (c) => log("web", c));
vite.stderr.on("data", (c) => log("web!", c));

async function waitFor(url, label, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log(`ready: ${label} ${url}`);
        return;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`timeout waiting for ${label} at ${url}`);
}

try {
  await waitFor(`http://127.0.0.1:${API_PORT}/api/ready`, "api");
  await waitFor(`http://127.0.0.1:${WEB_PORT}/`, "web");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  server.kill("SIGTERM");
  vite.kill("SIGTERM");
  process.exit(1);
}

writeFileSync(
  join(OUT, "pids.json"),
  JSON.stringify({ api: { pid: server.pid, port: API_PORT }, web: { pid: vite.pid, port: WEB_PORT } }, null, 2),
);
console.log(`STACK UP api=${API_PORT} web=${WEB_PORT} pids written`);
console.log(`WEB_URL=http://127.0.0.1:${WEB_PORT}`);

// 保持父进程存活，避免子进程写入已关闭的 stdout 管道。
const shutdown = () => {
  server.kill("SIGTERM");
  vite.kill("SIGTERM");
  setTimeout(() => process.exit(0), 500);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
setInterval(() => {}, 60_000);
console.log("stack supervisor alive; send SIGTERM to stop");
