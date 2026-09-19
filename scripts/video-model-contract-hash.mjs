#!/usr/bin/env node
/**
 * P2-e 视频模型契约哈希重算工具（video-model-contracts.json）。
 *
 * 与 scripts/text-model-contract-hash.mjs 同构：envelope =
 * scope + 顶层共享段（schemaVersion / contractLayer / baseUrl）+ 去哈希后的模型条目。
 * 视频契约是独立文件 docs/ai/apiyi/video-model-contracts.json（data-model.md §5 声明），
 * 不走 model-contracts.json 的 textModels 区块。
 *
 * 用法：
 *   node scripts/video-model-contract-hash.mjs verify   # 校验现有 models 哈希
 *   node scripts/video-model-contract-hash.mjs compute  # 输出重算后的完整文件（JSON）
 *   node scripts/video-model-contract-hash.mjs apply    # 写回 video-model-contracts.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contractsPath = resolve(repoRoot, "docs/ai/apiyi/video-model-contracts.json");
const SCOPE = "sha256-canonical-video-model-envelope-v1";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

/** 与 scripts/apiyi-docs.mjs / text-model-contract-hash.mjs 的 canonicalJson 同构：键排序 + 无空格。 */
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function computeVideoModelContractHash(contracts, model) {
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
  for (const model of contracts.models) {
    const recomputed = computeVideoModelContractHash(contracts, model);
    const match = recomputed === model.contractHash;
    console.log(`${match ? "OK " : "MISMATCH"} ${model.id}: ${recomputed}`);
    if (match) ok += 1;
  }
  process.exit(ok === contracts.models.length ? 0 : 1);
}

if (command === "compute") {
  const next = {
    ...contracts,
    models: contracts.models.map((model) => ({
      contractHashScope: SCOPE,
      contractHash: computeVideoModelContractHash(contracts, model),
      ...model,
    })),
  };
  process.stdout.write(`${JSON.stringify(next, null, 2)}\n`);
  process.exit(0);
}

if (command === "apply") {
  const next = {
    ...contracts,
    models: contracts.models.map((model) => {
      const { contractHash: _h, contractHashScope: _s, ...rest } = model;
      return {
        contractHashScope: SCOPE,
        contractHash: computeVideoModelContractHash(contracts, model),
        ...rest,
      };
    }),
  };
  writeFileSync(contractsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`video-model-contracts.json 已写回（${next.models.length} 条）`);
  process.exit(0);
}

console.error(`未知命令: ${command}`);
process.exit(2);
