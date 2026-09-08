#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { dirname, relative, resolve } from "node:path";
import {
  guardApiyiChanges,
  searchKnowledgeBase,
  syncKnowledgeBase,
  verifyCuratedSourceBindings,
  verifyKnowledgeBase,
  writeConsultationReceipt,
} from "./lib/apiyi-knowledge-base.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ROOT = resolve(REPO_ROOT, "docs/ai/apiyi/site");

function usage() {
  return `Usage:
  node scripts/apiyi-kb.mjs sync [--concurrency 1..12] [--timeout-ms N]
  node scripts/apiyi-kb.mjs check
  node scripts/apiyi-kb.mjs search --query TEXT [--limit 1..50] [--locale LOCALE] [--json]
  node scripts/apiyi-kb.mjs lookup --query TEXT --paths a,b --receipt docs/ai/apiyi/consultations/name.json --decision TEXT [--limit N] [--unresolved TEXT ...]
  node scripts/apiyi-kb.mjs guard (--uncommitted | --base REF --head REF)

sync 只读取 docs.apiyi.com 的公开文档，不读取 API Key，也不会调用任何付费模型。`;
}

function parseArgs(args) {
  const command = args.shift();
  if (!command || command === "--help" || command === "-h") return { command: "help", options: new Map(), flags: new Set() };
  const options = new Map();
  const flags = new Set();
  while (args.length > 0) {
    const key = args.shift();
    if (!key?.startsWith("--")) throw new Error(`无法识别的参数：${key}`);
    if (key === "--json" || key === "--uncommitted") {
      if (flags.has(key)) throw new Error(`参数不能重复：${key}`);
      flags.add(key);
      continue;
    }
    const value = args.shift();
    if (!value || value.startsWith("--")) throw new Error(`${key} 缺少参数值`);
    if (key === "--unresolved") {
      const existing = options.get(key) ?? [];
      existing.push(value);
      options.set(key, existing);
      continue;
    }
    if (options.has(key)) throw new Error(`参数不能重复：${key}`);
    options.set(key, value);
  }
  return { command, options, flags };
}

function assertAllowed(parsed, allowedOptions, allowedFlags = []) {
  for (const key of parsed.options.keys()) {
    if (!allowedOptions.includes(key)) throw new Error(`命令 ${parsed.command} 不支持参数 ${key}`);
  }
  for (const key of parsed.flags) {
    if (!allowedFlags.includes(key)) throw new Error(`命令 ${parsed.command} 不支持参数 ${key}`);
  }
}

function required(options, key) {
  const value = options.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`缺少必填参数 ${key}`);
  return value.trim();
}

function integerOption(options, key, fallback) {
  const raw = options.get(key);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) throw new Error(`${key} 必须是整数`);
  return value;
}

function printSearch(result) {
  console.log(`API易知识库快照：${result.snapshotId}`);
  console.log(`查询：${result.query}`);
  for (const [index, item] of result.results.entries()) {
    console.log(`\n${index + 1}. ${item.title}`);
    console.log(`   URL: ${item.canonicalUrl}`);
    console.log(`   本地: ${item.localPath}`);
    console.log(`   SHA-256: ${item.sha256}`);
    console.log(`   摘要: ${item.excerpt}`);
  }
}

export async function main(argv = process.argv.slice(2)) {
  const parsed = parseArgs([...argv]);
  if (parsed.command === "help") {
    console.log(usage());
    return;
  }

  if (parsed.command === "sync") {
    assertAllowed(parsed, ["--concurrency", "--timeout-ms"]);
    const concurrency = integerOption(parsed.options, "--concurrency", 4);
    const timeoutMs = integerOption(parsed.options, "--timeout-ms", 30_000);
    const result = await syncKnowledgeBase({
      siteRoot: SITE_ROOT,
      concurrency,
      timeoutMs,
      onProgress: ({ completed, total, canonicalUrl }) => {
        console.log(`[${completed}/${total}] ${canonicalUrl}`);
      },
    });
    console.log(`API易全站快照已原子切换：${result.pointer.snapshotId}`);
    console.log(`页面数：${result.manifest.pageCount}；SHA-256：${result.pointer.snapshotSha256}`);
    return;
  }

  if (parsed.command === "check") {
    assertAllowed(parsed, []);
    const result = await verifyKnowledgeBase(SITE_ROOT);
    if (result.errors.length > 0) throw new Error(`API易本地知识库校验失败：\n${result.errors.join("\n")}`);
    const curated = await verifyCuratedSourceBindings(REPO_ROOT, result);
    if (curated.errors.length > 0) throw new Error(`API易精选契约来源校验失败：\n${curated.errors.join("\n")}`);
    console.log(
      `API易本地知识库校验通过：${result.pointer.snapshotId}（${result.manifest.pageCount} 页，${curated.checkedSourceCount} 个精选来源）`,
    );
    return;
  }

  if (parsed.command === "search") {
    assertAllowed(parsed, ["--query", "--limit", "--locale"], ["--json"]);
    const result = await searchKnowledgeBase(SITE_ROOT, required(parsed.options, "--query"), {
      limit: integerOption(parsed.options, "--limit", 10),
      locale: parsed.options.get("--locale"),
    });
    if (parsed.flags.has("--json")) console.log(JSON.stringify(result, null, 2));
    else printSearch(result);
    return;
  }

  if (parsed.command === "lookup") {
    assertAllowed(parsed, ["--query", "--paths", "--receipt", "--decision", "--limit", "--unresolved"]);
    const affectedPaths = required(parsed.options, "--paths").split(",").map((item) => item.trim()).filter(Boolean);
    const result = await writeConsultationReceipt({
      repoRoot: REPO_ROOT,
      siteRoot: SITE_ROOT,
      query: required(parsed.options, "--query"),
      affectedPaths,
      receiptPath: required(parsed.options, "--receipt"),
      decisionSummary: required(parsed.options, "--decision"),
      unresolvedChoices: parsed.options.get("--unresolved") ?? [],
      limit: integerOption(parsed.options, "--limit", 8),
    });
    printSearch(result.result);
    console.log(`\n咨询凭证：${relative(REPO_ROOT, result.path)}`);
    if (result.receipt.unresolvedChoices.length > 0) {
      console.log("凭证仍有未解决选择，门禁会保持阻断。请先向用户提供选项并记录最终决定。");
    }
    return;
  }

  if (parsed.command === "guard") {
    assertAllowed(parsed, ["--base", "--head"], ["--uncommitted"]);
    const uncommitted = parsed.flags.has("--uncommitted");
    const hasRange = parsed.options.has("--base") || parsed.options.has("--head");
    if (uncommitted === hasRange) {
      throw new Error("guard 必须且只能选择 --uncommitted 或 --base REF --head REF");
    }
    const selection = uncommitted
      ? { uncommitted: true }
      : { base: required(parsed.options, "--base"), head: required(parsed.options, "--head") };
    const result = await guardApiyiChanges({ repoRoot: REPO_ROOT, siteRoot: SITE_ROOT, selection });
    console.log(`${result.message}；相关文件 ${result.relevant.length} 个；有效凭证 ${result.receipts.length} 个`);
    return;
  }

  throw new Error(`未知命令：${parsed.command}\n\n${usage()}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
