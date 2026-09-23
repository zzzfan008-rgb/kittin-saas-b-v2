import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DEFAULT_INITIAL_GZIP_BUDGET = 210_000;
export const DEFAULT_SINGLE_CHUNK_BUDGET = 500_000;

/**
 * 从 JSON 清单加载豁免配置，并逐条校验（fail-closed）。
 *
 * 清单格式见 scripts/bundle-budget-exemptions.json 及 schema。
 * 校验失败（字段缺失/重复 prefix/日期不可解析/JSON 不可读）→ 直接抛错，门禁失败。
 *
 * @param {string} repoRoot
 * @returns {{ defaultSingleChunkBytes: number, exemptions: Array }}
 */
function loadExemptions(repoRoot) {
  const exemptionsPath = path.join(repoRoot, "scripts", "bundle-budget-exemptions.json");
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(exemptionsPath, "utf8"));
  } catch (err) {
    throw new Error(`无法读取豁免清单 ${exemptionsPath}：${err.message}`);
  }
  if (!raw || typeof raw !== "object") {
    throw new Error("豁免清单不是合法的 JSON 对象");
  }
  if (!Array.isArray(raw.exemptions)) {
    throw new Error("豁免清单缺少 exemptions 数组");
  }

  const defaultSingleChunkBytes = Number(raw.defaultSingleChunkBytes) || DEFAULT_SINGLE_CHUNK_BUDGET;
  const seen = new Set();
  for (let i = 0; i < raw.exemptions.length; i++) {
    const e = raw.exemptions[i];
    const idx = `exemptions[${i}]`;

    // chunkPrefix：必须非空字符串，不含 hash（prefix 而非完整文件名）
    if (typeof e.chunkPrefix !== "string" || e.chunkPrefix.length === 0) {
      throw new Error(`${idx}.chunkPrefix 缺失或为空`);
    }
    if (e.chunkPrefix.includes("-") && /-[A-Za-z0-9]{8,}\\.js$/.test(e.chunkPrefix)) {
      throw new Error(`${idx}.chunkPrefix "${e.chunkPrefix}" 疑似含 content hash——豁免应写前缀，不能写死完整文件名`);
    }

    // maxBytes：必填，且必须 > 默认上限（豁免是提高上限，不是取消）
    if (typeof e.maxBytes !== "number" || !Number.isFinite(e.maxBytes)) {
      throw new Error(`${idx}.maxBytes 缺失或不是有效数字`);
    }
    if (e.maxBytes <= defaultSingleChunkBytes) {
      throw new Error(
        `${idx}.maxBytes (${e.maxBytes}) 必须大于默认单 chunk 上限 (${defaultSingleChunkBytes})——豁免是提高上限，不是取消上限`,
      );
    }

    // reason / authorizedBy / reviewBy：必须非空
    for (const field of ["reason", "authorizedBy", "reviewBy"]) {
      if (typeof e[field] !== "string" || e[field].trim().length === 0) {
        throw new Error(`${idx}.${field} 缺失或为空`);
      }
    }

    // reviewBy：必须可解析为有效日期（ISO 8601 或 YYYY-MM-DD）
    const parsed = Date.parse(e.reviewBy);
    if (Number.isNaN(parsed)) {
      throw new Error(`${idx}.reviewBy "${e.reviewBy}" 无法解析为有效日期`);
    }

    // chunkPrefix 不得重复
    if (seen.has(e.chunkPrefix)) {
      throw new Error(`${idx}.chunkPrefix "${e.chunkPrefix}" 重复`);
    }
    seen.add(e.chunkPrefix);
  }

  return { defaultSingleChunkBytes, exemptions: raw.exemptions };
}

function readManifest(distRoot) {
  const manifestPath = path.join(distRoot, ".vite", "manifest.json");
  assert.ok(fs.existsSync(manifestPath), "缺少 dist/.vite/manifest.json；请启用 Vite manifest 并先构建");
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function initialChunkFiles(manifest) {
  const entries = Object.values(manifest).filter((entry) => entry?.isEntry === true);
  assert.ok(entries.length > 0, "Vite manifest 没有入口 chunk");
  const files = new Set();
  const visit = (entry) => {
    if (!entry || typeof entry.file !== "string" || files.has(entry.file)) return;
    files.add(entry.file);
    for (const importedKey of entry.imports ?? []) visit(manifest[importedKey]);
  };
  for (const entry of entries) visit(entry);
  return [...files].filter((file) => file.endsWith(".js")).sort();
}

function fileMetrics(distRoot, file) {
  const bytes = fs.readFileSync(path.join(distRoot, file));
  return { file, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
}

export function verifyBundleBudget({
  distRoot,
  initialGzipBudget = DEFAULT_INITIAL_GZIP_BUDGET,
  singleChunkBudget = DEFAULT_SINGLE_CHUNK_BUDGET,
  writeReport = true,
}) {
  const repoRoot = path.resolve(distRoot, "..");
  const { exemptions } = loadExemptions(repoRoot);

  const manifest = readManifest(distRoot);
  const initialChunks = initialChunkFiles(manifest).map((file) => fileMetrics(distRoot, file));
  const assetsRoot = path.join(distRoot, "assets");
  const allChunks = fs.readdirSync(assetsRoot)
    .filter((name) => name.endsWith(".js"))
    .sort()
    .map((name) => fileMetrics(distRoot, `assets/${name}`));
  const initialGzipBytes = initialChunks.reduce((total, chunk) => total + chunk.gzipBytes, 0);

  // 守卫 1：豁免 chunk 不得进入首屏依赖闭包（豁免只允许 lazy dynamic import）。
  const exemptedInInitial = initialChunks.filter((chunk) =>
    exemptions.some((e) => chunk.file.startsWith(e.chunkPrefix)),
  );
  assert.equal(
    exemptedInInitial.length,
    0,
    `豁免 chunk 出现在首屏依赖闭包（豁免只允许 lazy dynamic import）：${exemptedInInitial.map((c) => c.file).join(", ")}`,
  );

  // chunk 上限判定：按 chunkPrefix 最长匹配确定上限。
  const limitFor = (file) => {
    const hit = exemptions
      .filter((e) => file.startsWith(e.chunkPrefix))
      .sort((a, b) => b.chunkPrefix.length - a.chunkPrefix.length)[0];
    return hit ? hit.maxBytes : singleChunkBudget;
  };

  const oversizedChunks = allChunks.filter((chunk) => chunk.bytes > limitFor(chunk.file));
  const exemptedChunks = allChunks.filter((chunk) => limitFor(chunk.file) !== singleChunkBudget);

  // 守卫 2：未命中任何 chunk 的豁免条目 → 失败（防止清单腐烂）。
  const unmatched = exemptions.filter(
    (e) => !allChunks.some((chunk) => chunk.file.startsWith(e.chunkPrefix)),
  );
  if (unmatched.length > 0) {
    const list = unmatched.map((e) => `${e.chunkPrefix}（reason: ${e.reason}）`).join("; ");
    throw new Error(
      `豁免清单中存在未命中任何构建产物的条目（该 chunk 可能已被 stub/移除，请删除对应条目）：${list}`,
    );
  }

  const report = {
    budgets: { initialGzipBytes: initialGzipBudget, singleChunkBytes: singleChunkBudget },
    exemptions: exemptions.map((e) => ({ ...e })),
    exemptedChunks,
    totals: {
      initialGzipBytes,
      initialBytes: initialChunks.reduce((total, chunk) => total + chunk.bytes, 0),
      chunkCount: allChunks.length,
    },
    initialChunks,
    allChunks,
  };

  if (writeReport) {
    fs.writeFileSync(path.join(distRoot, "bundle-budget.json"), `${JSON.stringify(report, null, 2)}\n`);
  }
  assert.equal(
    oversizedChunks.length,
    0,
    `存在超过体积预算的 JS chunk：${oversizedChunks.map((c) => `${c.file} (${c.bytes} > ${limitFor(c.file)})`).join(", ")}`,
  );
  assert.ok(
    initialGzipBytes <= initialGzipBudget,
    `初始必需 JS gzip ${initialGzipBytes} bytes，超过预算 ${initialGzipBudget} bytes`,
  );
  return report;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const report = verifyBundleBudget({ distRoot: path.join(repoRoot, "dist") });
  const exemptNote = report.exemptedChunks.length
    ? `；基线豁免 ${report.exemptedChunks.length} 个（${report.exemptedChunks.map((c) => `${c.file} ${c.bytes}/${report.exemptions?.find((e) => c.file.startsWith(e.chunkPrefix))?.maxBytes ?? "?"}`).join(", ")}）`
    : "";
  console.log(
    `包体门禁通过：初始 JS gzip ${report.totals.initialGzipBytes} / ${report.budgets.initialGzipBytes} bytes；` +
    `${report.totals.chunkCount} 个 JS chunk，单 chunk 上限 ${report.budgets.singleChunkBytes} bytes${exemptNote}`,
  );
}