// ui-qa R-51 隔离栈监督进程：验收对象 = worktree /tmp/gc-uiqa-r51/wt @ bec1163
// 独立端口 3411(api) / 5411(web)、独立库 garment_canvas_uiqa_test、独立 DATA_DIR。
// 付费通道封死：APIYI_API_KEY=uiqa-disabled、APIYI_BASE_URL=https://127.0.0.1:9。
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// 验收对象 = /tmp/gc-uiqa-r51/main @ main 的 a624571（= 3250708 + R-50 bec1163 cherry-pick），工作树干净
const WT = "/tmp/gc-uiqa-r51/main";
const OUT = "/tmp/gc-uiqa-r51";
const API_PORT = 3411;
const WEB_PORT = 5411;

const rawLines = existsSync(join(OUT, "db.env")) ? readFileSync(join(OUT, "db.env"), "utf8") : "";
if (!rawLines) throw new Error("缺少 db.env，请先运行 setup-db-env.mjs");
const shellEnv = {};
for (const line of rawLines.split("\n")) {
  const m = line.match(/^export ([A-Z_]+)='(.*)'$/);
  if (m) shellEnv[m[1]] = m[2].replace(/'\\''/g, "'");
}
if (!shellEnv.DATABASE_URL) throw new Error("db.env 解析失败");
if (!String(shellEnv.DATABASE_URL).includes("/garment_canvas_uiqa_test")) throw new Error("拒绝：非隔离测试库");

const dataDir = join(OUT, "data");
mkdirSync(dataDir, { recursive: true });

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
  for (const line of chunk.toString().split("\n")) {
    if (line.trim()) console.log(`[${name}] ${line.trim()}`);
  }
};

const server = spawn(join(WT, "node_modules/.bin/tsx"), ["server/index.ts"], {
  cwd: WT,
  env: baseEnv,
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (c) => log("api", c));
server.stderr.on("data", (c) => log("api!", c));

const vite = spawn(join(WT, "node_modules/.bin/vite"), ["--host", "127.0.0.1", "--port", String(WEB_PORT), "--strictPort"], {
  cwd: WT,
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
    } catch {}
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

writeFileSync(join(OUT, "pids.json"), JSON.stringify({ api: { pid: server.pid, port: API_PORT }, web: { pid: vite.pid, port: WEB_PORT } }, null, 2));
console.log(`STACK UP api=${API_PORT} web=${WEB_PORT} tree=${WT} @ main a624571`);

const shutdown = () => {
  server.kill("SIGTERM");
  vite.kill("SIGTERM");
  setTimeout(() => process.exit(0), 500);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
setInterval(() => {}, 60_000);
console.log("stack supervisor alive");
