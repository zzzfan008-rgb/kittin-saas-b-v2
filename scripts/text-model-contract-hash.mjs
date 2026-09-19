#!/usr/bin/env node
/**
 * R10 契约哈希重算工具（textModels 区块）。
 *
 * 背景:P2-a(commit 8d561fd)落地 textModels 区块时未留下独立生成脚本;
 * 本脚本以相同 envelope 口径(envelope = scope + 顶层共享段 + 去哈希后的模型条目)
 * 重算 contractHash。先用既有条目验证 reproduces,再对 R10 新条目求值。
 *
 * 用法:
 *   node scripts/text-model-contract-hash.mjs verify   # 校验现有 textModels 哈希
 *   node scripts/text-model-contract-hash.mjs compute  # 输出新条目的哈希(JSON)
 *   node scripts/text-model-contract-hash.mjs apply    # 写回 model-contracts.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contractsPath = resolve(repoRoot, "docs/ai/apiyi/model-contracts.json");
const SCOPE = "sha256-canonical-text-model-envelope-v1";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

/** 与 scripts/apiyi-docs.mjs 的 canonicalJson 同构:键排序 + 无空格。 */
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function computeTextModelContractHash(contracts, model) {
  const { contractHash: _h, contractHashScope: _s, ...semantic } = model;
  const envelope = {
    scope: SCOPE,
    contractSchemaVersion: contracts.schemaVersion,
    contractLayer: contracts.contractLayer,
    baseUrl: contracts.baseUrl,
    model: semantic,
  };
  return `sha256:${sha256(canonicalJson(envelope))}`;
}

const contracts = JSON.parse(readFileSync(contractsPath, "utf8"));
const command = process.argv[2] ?? "verify";

if (command === "verify") {
  let ok = 0;
  for (const model of contracts.textModels) {
    const recomputed = computeTextModelContractHash(contracts, model);
    const match = recomputed === model.contractHash;
    console.log(`${match ? "OK " : "MISMATCH"} ${model.id}: ${recomputed}`);
    if (match) ok += 1;
  }
  process.exit(ok === contracts.textModels.length ? 0 : 1);
}

if (command === "compute") {
  // 新清单读 stdin(JSON 数组,不带 contractHash)
  const raw = readFileSync(0, "utf8");
  const models = JSON.parse(raw);
  const out = models.map((model) => {
    const { id, ...rest } = model;
    return { id, contractHashScope: SCOPE, contractHash: computeTextModelContractHash(contracts, { id, ...rest }), ...rest };
  });
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exit(0);
}

if (command === "apply") {
  const raw = readFileSync(0, "utf8");
  const models = JSON.parse(raw);
  const next = { ...contracts, textModels: models };
  writeFileSync(contractsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`textModels 区块已写回(${models.length} 条)`);
  process.exit(0);
}

console.error(`未知命令: ${command}`);
process.exit(2);
