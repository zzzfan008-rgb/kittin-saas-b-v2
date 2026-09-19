import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = "/Users/lionfan/dev/kittin-saas-b-v2";
const require = createRequire(join(REPO, "package.json"));
const pg = require("pg");

const TEST_DB = process.argv[2] ?? "garment_canvas_uiqa_test";
const OUT_DIR = process.argv[3] ?? "/tmp/gc-uiqa-v4";
if (!TEST_DB.endsWith("_test")) throw new Error("测试库名必须以 _test 结尾");

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
const user = dot.PGUSER || dot.POSTGRES_USER || "";
const password = dot.PGPASSWORD || dot.POSTGRES_PASSWORD || "";
if (!user || !password) throw new Error("无法从 .env 读取 PostgreSQL 凭据");

const dbUrl = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${TEST_DB}`;
const client = new pg.Client({ connectionString: dbUrl });
await client.connect();
const probe = await client.query("SELECT current_user, current_database() AS db, pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname = current_database()");
console.log("connected as", probe.rows[0].current_user, "db", probe.rows[0].db, "owner", probe.rows[0].owner);
// 探针：确认可以建/删对象（隔离栈需要 reset schema）
await client.query("DROP TABLE IF EXISTS uiqa_probe");
await client.query("CREATE TABLE uiqa_probe(id int)");
await client.query("DROP TABLE uiqa_probe");
console.log("write probe ok");
await client.end();

mkdirSync(OUT_DIR, { recursive: true });
const q = (v) => `'${String(v).replace(/'/g, "'\\''")}'`;
const lines = [
  `export GARMENT_CANVAS_TEST_DATABASE_URL=${q(dbUrl)}`,
  `export DATABASE_URL=${q(dbUrl)}`,
  `export PGHOST=${q(host)}`,
  `export PGPORT=${q(port)}`,
  `export PGUSER=${q(user)}`,
  `export PGPASSWORD=${q(password)}`,
  `export PGDATABASE=${q(TEST_DB)}`,
  `export DATA_DIR=${q(join(OUT_DIR, "data"))}`,
  `export SQLITE_IMPORT_FILE=${q(join(OUT_DIR, "missing.db"))}`,
];
writeFileSync(join(OUT_DIR, "db.env"), lines.join("\n") + "\n", { mode: 0o600 });
console.log(`wrote ${join(OUT_DIR, "db.env")}`);
