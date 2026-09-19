#!/usr/bin/env node
/**
 * 三基础节点重构清理脚本（R7 / Q5=A，契约 contracts/purge-runbook.md）。
 *
 * 一次性管理脚本：先导出兜底（项目 flow_json + 用户模板 + 生成媒体文件 + run 元数据），
 * 二次确认后单事务物理删除旧数据。**只写脚本、由 P2-f 执行**——本文件不自行运行。
 *
 * 删除范围（purge-runbook §1）：
 *   - projects 表全部行（含 saved 与 initial_draft）
 *   - 用户模板 data/templates/user/*
 *   - generation_runs / generation_outputs（generation_run_steps/jobs/events 随 FK 级联）
 *   - usage_events 删行不删表（D1 有账无闸）
 *   - project_asset_refs（随 projects 级联）
 *   - files 中仅被已删对象引用的生成媒体行 + 磁盘文件
 *   - assets / users / sessions / evaluation_* 保留
 *
 * 安全约束：默认只允许连接本机库（127.0.0.1/localhost）；指向远端库必须显式
 * `--env=production`。破坏性删除前需交互式输入两次确认（DELETE-ALL-PROJECTS / YES）。
 *
 * 用法：
 *   node scripts/three-node-migration-purge.mjs            # 只预检 + 导出 + 打印回执，不删除
 *   node scripts/three-node-migration-purge.mjs --env=production  # 远端库（仍须二次确认）
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LOCAL_DATABASE_HOSTS = new Set(["127.0.0.1", "localhost"]);

const { Client } = pg;

// ---------- 参数解析 ----------
const argv = process.argv.slice(2);
const IS_PRODUCTION = argv.includes("--env=production");

// ---------- 连接串解析（只读 .env 的 PostgreSQL 键，绝不回显凭据） ----------
const ALLOWED_ENV_KEYS = new Set([
  "PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE",
  "POSTGRES_HOST_PORT", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB",
]);

function readPostgresKeysFromDotEnv(dotEnvPath) {
  if (!existsSync(dotEnvPath)) return {};
  const values = {};
  for (const rawLine of readFileSync(dotEnvPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!ALLOWED_ENV_KEYS.has(key)) continue;
    values[key] = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

function resolveDatabaseUrl(env = process.env, { dotEnvPath = join(repositoryRoot, ".env") } = {}) {
  const explicit = (env.DATABASE_URL ?? "").trim();
  if (explicit) return explicit;
  const file = readPostgresKeysFromDotEnv(dotEnvPath);
  const host = (env.PGHOST ?? "").trim() || file.PGHOST || "127.0.0.1";
  const port = (env.PGPORT ?? "").trim() || file.PGPORT || file.POSTGRES_HOST_PORT || "5432";
  const user = (env.PGUSER ?? "").trim() || file.PGUSER || file.POSTGRES_USER || "garment_canvas";
  const password = env.PGPASSWORD || file.PGPASSWORD || file.POSTGRES_PASSWORD || "";
  const database = (env.PGDATABASE ?? "").trim() || file.PGDATABASE || file.POSTGRES_DB || "garment_canvas";
  if (!password) throw new Error("无法确定数据库密码：请配置 DATABASE_URL 或 .env 的 POSTGRES_PASSWORD");
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}

function dataDir() {
  return resolve(repositoryRoot, process.env.DATA_DIR ?? "./data");
}

function assertDatabaseTarget(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error("连接串必须是 postgresql:// 协议");
  }
  if (!IS_PRODUCTION && !LOCAL_DATABASE_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `拒绝连接非本机数据库 ${parsed.hostname}。清理脚本默认只允许本机库；` +
        "确认生产库请显式加 --env=production（仍需二次确认）。",
    );
  }
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\/?/, ""));
  return { host: parsed.hostname, port: parsed.port, databaseName };
}

// ---------- 回执工具 ----------
function humanBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function sha256File(path) {
  const hash = createHash("sha256");
  hash.update(readFileSync(path));
  return hash.digest("hex");
}

function sha256String(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function prompt(question) {
  return new Promise((resolvePrompt) => {
    process.stdout.write(question);
    const buffer = Buffer.alloc(256);
    const read = readSync(0, buffer, 0, buffer.length, null);
    resolvePrompt(buffer.subarray(0, read).toString("utf8").trim());
  });
}

// ---------- 主流程 ----------
async function main() {
  const databaseUrl = resolveDatabaseUrl();
  const target = assertDatabaseTarget(databaseUrl);
  const exportDir = join(dataDir(), `migration-export-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  mkdirSync(join(exportDir, "projects"), { recursive: true });
  mkdirSync(join(exportDir, "files"), { recursive: true });

  const client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 10_000 });
  await client.connect();

  try {
    // 1. Preflight：逐表行数 + 媒体导出预估。
    console.log(`[preflight] 目标库 ${target.host}:${target.port}/${target.databaseName}（production=${IS_PRODUCTION}）`);
    const count = async (table) => {
      const row = await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
      return row.rows[0].count;
    };
    const counts = {
      projects: await count("projects"),
      generation_runs: await count("generation_runs"),
      generation_outputs: await count("generation_outputs"),
      generation_run_steps: await count("generation_run_steps"),
      generation_jobs: await count("generation_jobs"),
      usage_events: await count("usage_events"),
      project_asset_refs: await count("project_asset_refs"),
    };

    // 将被级联删除的生成媒体（source_type='generation'，且不被保留的 assets 引用）。
    const media = await client.query(`
      SELECT f.id, f.byte_length FROM files f
      WHERE f.deleted_at IS NULL AND f.source_type = 'generation'
        AND NOT EXISTS (
          SELECT 1 FROM assets a
          WHERE a.deleted_at IS NULL AND a.image = '/api/files/' || f.id
        )
    `);
    const mediaTotalBytes = media.rows.reduce((sum, row) => sum + Number(row.byte_length ?? 0), 0);
    console.log("[preflight] 逐表行数：", counts);
    console.log(`[preflight] 将导出 ${media.rows.length} 个生成媒体文件，约 ${humanBytes(mediaTotalBytes)}（不含缩略图）`);

    // 2. 导出兜底（不可逆前的最后一次机会）。
    console.log(`[export] 导出目录 ${exportDir}`);

    const projects = await client.query(
      "SELECT id, owner_id, name, flow_json, updated_at FROM projects ORDER BY owner_id, id",
    );
    for (const project of projects.rows) {
      const ownerDir = join(exportDir, "projects", project.owner_id);
      mkdirSync(ownerDir, { recursive: true });
      writeFileSync(join(ownerDir, `${project.id}.json`), JSON.stringify(project, null, 2), "utf8");
    }

    const runs = await client.query(`
      SELECT id, owner_id, project_id, node_id, kind, prompt, model, status, started_at, finished_at
      FROM generation_runs ORDER BY started_at
    `);
    writeFileSync(join(exportDir, "runs.json"), JSON.stringify(runs.rows, null, 2), "utf8");

    const userTemplatesDir = join(dataDir(), "templates", "user");
    if (existsSync(userTemplatesDir)) {
      const targetTemplatesDir = join(exportDir, "templates-user");
      mkdirSync(targetTemplatesDir, { recursive: true });
      for (const file of readdirSync(userTemplatesDir)) {
        if (file.endsWith(".json")) copyFileSync(join(userTemplatesDir, file), join(targetTemplatesDir, file));
      }
    }

    const manifest = [];
    let exportedMediaCount = 0;
    let exportedMediaBytes = 0;
    for (const row of media.rows) {
      const source = join(dataDir(), "uploads", row.id);
      if (!existsSync(source)) continue;
      const target = join(exportDir, "files", row.id);
      copyFileSync(source, target);
      exportedMediaCount += 1;
      exportedMediaBytes += statSync(target).size;
      manifest.push(`${sha256File(target)}  ${row.id}`);
    }
    // 缩略图（尽力而为，不纳入双重校验计数）。
    for (const row of media.rows) {
      const thumb = join(dataDir(), "thumbnails", `${row.id}.webp`);
      if (existsSync(thumb)) copyFileSync(thumb, join(exportDir, "files", `${row.id}.webp`));
    }
    writeFileSync(join(exportDir, "manifest.sha256"), `${manifest.join("\n")}\n`, "utf8");

    // 2b. 完整性校验（双重，purge-runbook §2）。
    const projectFiles = readdirSync(join(exportDir, "projects"), { withFileTypes: true })
      .flatMap((entry) => entry.isDirectory()
        ? readdirSync(join(exportDir, "projects", entry.name)).map((f) => join(entry.name, f))
        : []);
    const dbProjectCount = counts.projects;
    if (projectFiles.length !== dbProjectCount) {
      throw new Error(
        `导出完整性校验失败：DB 项目 ${dbProjectCount} 行，导出 JSON ${projectFiles.length} 个。中止，不执行删除。`,
      );
    }
    if (exportedMediaCount !== media.rows.length) {
      throw new Error(
        `媒体完整性校验失败：待删 files ${media.rows.length} 行，实际复制 ${exportedMediaCount} 个。中止，不执行删除。`,
      );
    }
    if (exportedMediaBytes !== mediaTotalBytes) {
      throw new Error(
        `媒体字节校验失败：byte_length 合计 ${mediaTotalBytes}，实际复制 ${exportedMediaBytes}。中止，不执行删除。`,
      );
    }
    console.log(`[export] 校验通过：项目 ${projectFiles.length}、媒体 ${exportedMediaCount} 个 / ${humanBytes(exportedMediaBytes)}`);

    // 3. 二次确认。
    const first = await prompt("\n即将物理删除旧数据。输入 DELETE-ALL-PROJECTS 继续：");
    if (first !== "DELETE-ALL-PROJECTS") {
      console.log("[abort] 未确认，已中止（未执行任何删除）。");
      return;
    }
    const second = await prompt("再次确认：输入 YES 立即执行不可逆删除：");
    if (second !== "YES") {
      console.log("[abort] 未二次确认，已中止（未执行任何删除）。");
      return;
    }

    // 4. 删除（单事务，FK 依赖序）。
    const receipt = {};
    await client.query("BEGIN");
    try {
      for (const table of ["usage_events", "generation_outputs", "generation_runs", "project_asset_refs", "projects"]) {
        const before = (await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`)).rows[0].count;
        await client.query(`DELETE FROM ${table}`);
        const after = (await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`)).rows[0].count;
        receipt[table] = { before, after };
      }
      // 生成媒体行（usage_events 之外；projects/runs 已删，这里仅删 files 行）。
      const mediaIds = media.rows.map((row) => row.id);
      if (mediaIds.length > 0) {
        await client.query("DELETE FROM files WHERE id = ANY($1::text[]) AND source_type = 'generation'", [mediaIds]);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }

    // 磁盘文件在事务提交后删除（文件系统无事务，放最后）。
    for (const row of media.rows) {
      try {
        const { rmSync } = await import("node:fs");
        rmSync(join(dataDir(), "uploads", row.id), { force: true });
        rmSync(join(dataDir(), "thumbnails", `${row.id}.webp`), { force: true });
      } catch { /* best-effort */ }
    }
    for (const file of existsSync(userTemplatesDir) ? readdirSync(userTemplatesDir) : []) {
      if (file.endsWith(".json")) {
        try { const { rmSync } = await import("node:fs"); rmSync(join(userTemplatesDir, file), { force: true }); } catch { /* best-effort */ }
      }
    }

    // 5. 回执。
    receipt.usage_events_note = "表结构保留（D1 有账无闸）";
    const receiptText = [
      `# 三节点重构清理回执 ${new Date().toISOString()}`,
      `目标库：${target.host}:${target.port}/${target.databaseName}`,
      `导出目录：${exportDir}`,
      "逐表 before/after：",
      ...Object.entries(receipt)
        .filter(([key]) => !key.endsWith("_note"))
        .map(([key, value]) => `  ${key}: ${value.before} → ${value.after}`),
      `  usage_events: ${receipt.usage_events_note}`,
      `媒体导出：${exportedMediaCount} 个文件 / ${humanBytes(exportedMediaBytes)}`,
      `清单：manifest.sha256（${manifest.length} 项）`,
    ].join("\n");
    writeFileSync(join(exportDir, "RECEIPT.txt"), receiptText, "utf8");
    console.log("\n[receipt]\n" + receiptText);
  } finally {
    await client.end().catch(() => {});
  }
}

const isMain = Boolean(process.argv[1]) && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href;
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
