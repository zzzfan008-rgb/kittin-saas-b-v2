import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DEFAULT_INITIAL_GZIP_BUDGET = 210_000;
export const DEFAULT_SINGLE_CHUNK_BUDGET = 500_000;

/**
 * per-path 豁免登记（基线形态同 .dependency-cruiser.cjs 的 no-circular-baseline）：
 * 逐路径列出、附书面理由与独立上限；未登记的 chunk 维持 DEFAULT_SINGLE_CHUNK_BUDGET。
 * 登记只允许按实测留余量收紧，禁止用作「悄悄抬高全局阈值」的通道。
 *
 * - assets/excalidraw-*.js：@excalidraw/excalidraw v0.18.1 的完整运行库
 *   （画布引擎 + 字体子集 worker + 40+ 语言 locale 数据）。库是上游预打包产物
 *   （dist/prod/chunk-EIO257PC.js 单文件即 1.7MB），Rollup 无法继续拆分其内部；
 *   上游不提供子路径入口做按需裁剪。该 chunk 是 lazy dynamic import
 *   （用户点「AI 画板」才加载），不进首屏预算（210KB gzip 不变）。
 *   实测 4.08MB（stub 掉 @excalidraw/mermaid-to-excalidraw 后，原 4.79MB）。
 *   上限 5MB = 实测 + ~20% 余量（patch 版本升级抖动）。
 *   裁决：用户 2026-09-24 拍板 a+b 组合（per-path 豁免登记 + stub mermaid 子依赖）。
 */
export const CHUNK_BUDGET_BASELINE = [
  {
    pattern: /^assets\/excalidraw-[\w-]+\.js$/,
    budgetBytes: 5_000_000,
    reason:
      "@excalidraw/excalidraw 上游预打包库无法再拆分；lazy chunk 不进首屏预算；用户 2026-09-24 裁决 per-path 豁免",
  },
];

/**
 * stub 契约（fail-closed）：@excalidraw/mermaid-to-excalidraw 已被
 * vite.config.ts alias 到 src/lib/excalidraw-mermaid-stub.ts，
 * mermaid 全家桶（cynefin/katex/cytoscape 等）不应再出现在构建产物中。
 * 这些 chunk 一旦复活说明 stub 失效，直接 error。
 */
export const STUBBED_CHUNK_PATTERNS = [
  /^assets\/cynefin-[\w-]+\.js$/,
  /^assets\/katex-[\w-]+\.js$/,
  /^assets\/cytoscape\.esm-[\w-]+\.js$/,
  /^assets\/cose-bilkent-[\w-]+\.js$/,
];

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
  const manifest = readManifest(distRoot);
  const initialChunks = initialChunkFiles(manifest).map((file) => fileMetrics(distRoot, file));
  const assetsRoot = path.join(distRoot, "assets");
  const allChunks = fs.readdirSync(assetsRoot)
    .filter((name) => name.endsWith(".js"))
    .sort()
    .map((name) => fileMetrics(distRoot, `assets/${name}`));
  const initialGzipBytes = initialChunks.reduce((total, chunk) => total + chunk.gzipBytes, 0);

  // 豁免只覆盖 lazy chunk：登记的 chunk 不得进入首屏依赖闭包。
  const baselineInInitial = initialChunks.filter((chunk) =>
    CHUNK_BUDGET_BASELINE.some((entry) => entry.pattern.test(chunk.file)),
  );
  assert.equal(
    baselineInInitial.length,
    0,
    `豁免 chunk 出现在首屏依赖闭包（豁免只允许 lazy dynamic import）：${baselineInInitial.map((c) => c.file).join(", ")}`,
  );

  // stub 契约：mermaid 全家桶 chunk 不得复活。
  const resurrected = allChunks.filter((chunk) =>
    STUBBED_CHUNK_PATTERNS.some((pattern) => pattern.test(chunk.file)),
  );
  assert.equal(
    resurrected.length,
    0,
    `已 stub 的 mermaid 依赖 chunk 重新出现（检查 vite.config.ts 的 @excalidraw/mermaid-to-excalidraw alias）：` +
    resurrected.map((c) => `${c.file} (${c.bytes})`).join(", "),
  );

  const violations = [];
  const baselineHits = [];
  for (const chunk of allChunks) {
    const baselineEntry = CHUNK_BUDGET_BASELINE.find((entry) => entry.pattern.test(chunk.file));
    if (baselineEntry) {
      baselineHits.push({ file: chunk.file, bytes: chunk.bytes, budgetBytes: baselineEntry.budgetBytes });
      if (chunk.bytes > baselineEntry.budgetBytes) {
        violations.push(`${chunk.file} (${chunk.bytes} > 基线上限 ${baselineEntry.budgetBytes})`);
      }
      continue;
    }
    if (chunk.bytes > singleChunkBudget) {
      violations.push(`${chunk.file} (${chunk.bytes} > ${singleChunkBudget})`);
    }
  }

  const report = {
    budgets: { initialGzipBytes: initialGzipBudget, singleChunkBytes: singleChunkBudget },
    baseline: CHUNK_BUDGET_BASELINE.map((entry) => ({
      pattern: String(entry.pattern),
      budgetBytes: entry.budgetBytes,
      reason: entry.reason,
    })),
    baselineHits,
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
    violations.length,
    0,
    `存在超过体积预算的 JS chunk：${violations.join(", ")}`,
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
  const baselineNote = report.baselineHits.length
    ? `；基线豁免 ${report.baselineHits.length} 个（${report.baselineHits.map((h) => `${h.file} ${h.bytes}/${h.budgetBytes}`).join(", ")}）`
    : "";
  console.log(
    `包体门禁通过：初始 JS gzip ${report.totals.initialGzipBytes} / ${report.budgets.initialGzipBytes} bytes；` +
    `${report.totals.chunkCount} 个 JS chunk，单 chunk 上限 ${report.budgets.singleChunkBytes} bytes${baselineNote}`,
  );
}