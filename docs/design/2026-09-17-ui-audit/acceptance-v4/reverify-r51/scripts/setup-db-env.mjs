// ui-qa R-51 隔离栈凭据准备：只读主仓 .env，写出本卡独立的 db.env（0600）。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const OUT = "/tmp/gc-uiqa-r51";
const TEST_DB = "garment_canvas_uiqa_test";

function readDotEnv(path) {
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
const dot = readDotEnv(join(REPO, ".env"));
const host = dot.PGHOST || "127.0.0.1";
const port = String(dot.PGPORT || dot.POSTGRES_HOST_PORT || "5432");
const user = dot.POSTGRES_USER;
const password = dot.POSTGRES_PASSWORD;
if (!user || !password) throw new Error("无法从 .env 读取 PostgreSQL 凭据");
if (!TEST_DB.endsWith("_test")) throw new Error("测试库名必须以 _test 结尾");

mkdirSync(OUT, { recursive: true });
const url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${TEST_DB}`;
const q = (v) => `'${String(v).replace(/'/g, "'\\''")}'`;
const lines = [
  `export GARMENT_CANVAS_TEST_DATABASE_URL=${q(url)}`,
  `export DATABASE_URL=${q(url)}`,
  `export PGHOST=${q(host)}`,
  `export PGPORT=${q(port)}`,
  `export PGUSER=${q(user)}`,
  `export PGPASSWORD=${q(password)}`,
  `export PGDATABASE=${q(TEST_DB)}`,
  `export DATA_DIR=${q(join(OUT, "data"))}`,
  `export SQLITE_IMPORT_FILE=${q(join(OUT, "missing.db"))}`,
];
writeFileSync(join(OUT, "db.env"), lines.join("\n") + "\n", { mode: 0o600 });
console.log(`wrote db.env for ${TEST_DB} @ ${host}:${port}`);
