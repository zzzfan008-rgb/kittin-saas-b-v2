// 用项目自带的隔离 runner 跑聚焦 e2e：从本卡 db.env 取凭据，把库名换成 garment_canvas_test（runner 要求）。
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const env = { ...process.env };
for (const line of readFileSync("/tmp/gc-uiqa-r51/db.env", "utf8").split("\n")) {
  const m = line.match(/^export ([A-Z_]+)='(.*)'$/);
  if (m) env[m[1]] = m[2].replace(/'\\''/g, "'");
}
const url = String(env.DATABASE_URL).replace("/garment_canvas_uiqa_test", "/garment_canvas_test");
env.DATABASE_URL = url;
env.GARMENT_CANVAS_TEST_DATABASE_URL = url;
env.PGDATABASE = "garment_canvas_test";
console.log("e2e target db:", url.replace(/:[^:@/]+@/, ":***@"));

const args = process.argv.slice(2);
const r = spawnSync("npm", ["run", "test:e2e", "--", ...args], { cwd: "/tmp/gc-uiqa-r51/main", env, stdio: "inherit" });
process.exit(r.status ?? 1);
