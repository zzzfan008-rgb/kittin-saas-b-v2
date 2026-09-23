#!/usr/bin/env node
/**
 * F6 复核工具：在门禁的 /tmp 工作目录被删除之后，核验一份 codex-gate 回执是否
 * 仍然与固化的证据字节一致。纯本地、确定性，不访问网络。
 *
 * Usage: node scripts/gate-receipt-verify.mjs <path-to-codex-gate-<sha>.json>
 * Exit:  0 = 全部一致；1 = 任何不一致 / 缺失 / 格式无效（fail-closed）
 *
 * 逐项核验：
 *  1. 回执文件名中的 sha256 == 回执原始字节的 sha256（回执自身内容寻址）
 *  2. artifacts.files 中每条记录：文件存在、字节数一致、sha256 一致
 *  3. 逻辑角色齐全且交叉引用一致：
 *     - reviewScope.sha256 对应一个 role=review-scope 制品
 *     - 每个 reviewBatches[i] 的 scopeSha256/packetSha256 各对应同批次的
 *       batch-scope / packet 制品，且同批次存在 prompt 制品
 *  4. gateDecision / exitCode 与 review 字段重算结果一致
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, join, resolve, sep } from "node:path";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fail(errors, message) {
  errors.push(message);
}

function findArtifact(files, { role, batch, digest }) {
  return files.find((file) => (
    file.role === role
    && (batch === undefined || file.batch === batch)
    && file.sha256 === digest
  ));
}

export function verifyReceipt(receiptPath) {
  const errors = [];
  const absolutePath = resolve(receiptPath);
  const fileName = basename(absolutePath);

  const selfMatch = fileName.match(/^codex-gate-([a-f0-9]{64})\.json$/);
  if (!selfMatch) {
    fail(errors, `回执文件名不是 codex-gate-<sha256>.json 形状：${fileName}`);
  }

  let rawBytes;
  try {
    rawBytes = readFileSync(absolutePath);
  } catch (error) {
    fail(errors, `无法读取回执：${error.message}`);
    return errors;
  }

  if (selfMatch && sha256(rawBytes) !== selfMatch[1]) {
    fail(errors, "回执自身 sha256 与文件名不一致（回执字节被改写）");
  }

  let receipt;
  try {
    receipt = JSON.parse(rawBytes.toString("utf8"));
  } catch (error) {
    fail(errors, `回执不是可解析的 JSON：${error.message}`);
    return errors;
  }

  if (receipt.schemaVersion !== 2) {
    fail(errors, `回执 schemaVersion 必须为 2（含固化制品清单），实际为 ${String(receipt.schemaVersion)}`);
  }

  const artifacts = receipt.artifacts;
  if (!artifacts || typeof artifacts.directory !== "string" || !Array.isArray(artifacts.files)) {
    fail(errors, "回执缺少 artifacts.directory / artifacts.files 清单");
    return errors;
  }

  const receiptDir = resolve(absolutePath, "..");
  const artifactsRoot = resolve(receiptDir, artifacts.directory);
  const files = artifacts.files;

  for (const [index, file] of files.entries()) {
    const label = `artifacts.files[${index}]`;
    if (!file || typeof file.path !== "string" || typeof file.sha256 !== "string") {
      fail(errors, `${label} 记录结构不完整`);
      continue;
    }
    if (!SHA256_PATTERN.test(file.sha256)) {
      fail(errors, `${label} sha256 格式无效：${file.sha256}`);
    }
    if (!["review-scope", "batch-scope", "packet", "prompt"].includes(file.role)) {
      fail(errors, `${label} 未知角色：${String(file.role)}`);
    }
    // 路径必须留在 artifacts 目录内：拒绝绝对路径、.. 越界、分隔符逃逸。
    const target = resolve(artifactsRoot, file.path);
    if (target !== artifactsRoot && !target.startsWith(artifactsRoot + sep)) {
      fail(errors, `${label} 路径越出 artifacts 目录：${file.path}`);
      continue;
    }
    if (!existsSync(target)) {
      fail(errors, `${label} 固化文件缺失：${file.path}`);
      continue;
    }
    const bytes = readFileSync(target);
    if (sha256(bytes) !== file.sha256) {
      fail(errors, `${label} sha256 与固化文件不一致（${file.path}）`);
    }
    if (typeof file.bytes === "number" && statSync(target).size !== file.bytes) {
      fail(errors, `${label} 字节数记录与文件不一致（${file.path}）`);
    }
  }

  // 角色齐全性与交叉引用。
  const scopeDigest = receipt.reviewScope?.sha256;
  if (typeof scopeDigest !== "string" || !SHA256_PATTERN.test(scopeDigest)) {
    fail(errors, "reviewScope.sha256 缺失或格式无效");
  } else if (!findArtifact(files, { role: "review-scope", digest: scopeDigest })) {
    fail(errors, "reviewScope.sha256 没有对应的 review-scope 固化制品");
  }

  for (const [index, batch] of (receipt.reviewBatches ?? []).entries()) {
    const batchNumber = index + 1;
    if (typeof batch !== "object" || !batch) {
      fail(errors, `reviewBatches[${index}] 不是对象`);
      continue;
    }
    const pairs = [
      ["scopeSha256", "batch-scope"],
      ["packetSha256", "packet"],
    ];
    for (const [field, role] of pairs) {
      const digest = batch[field];
      if (typeof digest !== "string" || !SHA256_PATTERN.test(digest)) {
        fail(errors, `批次 ${batchNumber} 的 ${field} 缺失或格式无效`);
        continue;
      }
      if (!findArtifact(files, { role, batch: batchNumber, digest })) {
        fail(errors, `批次 ${batchNumber} 的 ${field} 没有对应同批次 ${role} 固化制品`);
      }
    }
    if (!files.some((file) => file.role === "prompt" && file.batch === batchNumber)) {
      fail(errors, `批次 ${batchNumber} 缺少 prompt 固化制品`);
    }
  }

  // 判定一致性：重算 gateDecision / exitCode。
  const review = receipt.review;
  const passed = review?.verdict === "pass"
    && Array.isArray(review.findings)
    && review.findings.length === 0
    && review.code_analysis?.status === "pass";
  const expectedDecision = passed ? "pass" : "fail-closed";
  if (receipt.gateDecision !== expectedDecision) {
    fail(errors, `gateDecision 记录为 ${String(receipt.gateDecision)}，按 review 重算应为 ${expectedDecision}`);
  }
  const expectedExitCode = passed ? 0 : 1;
  if (receipt.exitCode !== expectedExitCode) {
    fail(errors, `exitCode 记录为 ${String(receipt.exitCode)}，按 review 重算应为 ${expectedExitCode}`);
  }

  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const target = process.argv[2];
  if (!target) {
    process.stderr.write("Usage: node scripts/gate-receipt-verify.mjs <codex-gate-receipt.json>\n");
    process.exit(1);
  }
  const errors = verifyReceipt(target);
  if (errors.length > 0) {
    for (const message of errors) console.error(`FAIL: ${message}`);
    process.stderr.write(`Receipt verification FAILED with ${errors.length} finding(s): ${resolve(target)}\n`);
    process.exit(1);
  }
  console.log(`Receipt verification PASS: ${resolve(target)}`);
}
