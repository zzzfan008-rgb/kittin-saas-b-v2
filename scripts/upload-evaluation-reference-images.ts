/**
 * 24 张参考图入库脚本（step 2，裁决 D 前置）
 *
 * 入库链：
 *   1. 读磁盘文件 → 算 sha256 → 三重白名单校验（goldenSet.ts）
 *   2. COPY 到 uploadsDir/ + INSERT files（绕过 normalize，保持 3584×4800 原尺寸）
 *   3. 回写 golden-set referenceImage.fileId/sha256
 *
 * 幂等：按 sample.id 去重，已入库的不要重复 COPY/INSERT（只校验 sha256 一致性）。
 *
 * 用法：
 *   npx tsx scripts/upload-evaluation-reference-images.ts           # 干跑（校验 + 计划）
 *   npx tsx scripts/upload-evaluation-reference-images.ts --commit # 写入 dev 库 + 文件系统
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { nanoid } from "nanoid";
import { config } from "../server/config";
import { query, queryOne, db, closeDatabaseForTests } from "../server/lib/database";
import {
  loadGoldenSet,
  GOLDEN_SET_SIZE,
  REJECTED_SHA256,
  REQUIRED_SHA256,
  type GoldenSample,
} from "../server/lib/goldenSet";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.resolve(ROOT, "tmp/golden-set-images");
const GOLDEN_SET_PATH = path.resolve(ROOT, "docs/ai/evaluation/golden-set-v1.json");

// ── helpers ─────────────────────────────────────────────────────────────

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function uploadsDir(): string {
  const dir = path.join(config.dataDir(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

interface ImageMeta {
  filePath: string;
  diskSha256: string;
  width: number;
  height: number;
  byteLength: number;
}

function readImageMeta(filePath: string): ImageMeta {
  const buf = fs.readFileSync(filePath);
  const { size } = fs.statSync(filePath);
  // 读 JPEG 尺寸（只解析头部 SOF 段，不加载完整位图）
  const sofa = buf.indexOf(0xff, 2);
  let offset = sofa;
  while (offset < Math.min(buf.length - 9, 65536)) {
    const marker = buf[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      // SOF0 / SOF2
      const h = buf.readUInt16BE(offset + 5);
      const w = buf.readUInt16BE(offset + 7);
      return {
        filePath,
        diskSha256: createHash("sha256").update(buf).digest("hex"),
        width: w,
        height: h,
        byteLength: size,
      };
    }
    const segLen = buf.readUInt16BE(offset + 2);
    offset += 2 + segLen;
  }
  throw new Error(`${filePath}: could not parse JPEG dimensions`);
}

/** 裁D④ sha256 白名单校验（三重）。
 *  返回 null = 通过；返回 string = 拒绝原因。 */
function checkImageSha256(sampleId: string, diskSha256: string): string | null {
  if (REJECTED_SHA256.has(diskSha256)) {
    return `REJECTED — sha256 ${diskSha256} is in the rejected list (amazon watermark / r2). ` +
      `Replace ${sampleId}.jpg with the approved r4 version (expected: ${REQUIRED_SHA256[sampleId] ?? "not pinned"}).`;
  }
  const required = REQUIRED_SHA256[sampleId];
  if (required !== undefined && diskSha256 !== required) {
    return `sha256 MISMATCH for ${sampleId}: required ${required}, disk ${diskSha256}`;
  }
  return null;
}

// ── main ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const commit = process.argv.includes("--commit");
  console.log(`upload-evaluation-reference-images: mode=${commit ? "COMMIT" : "DRY-RUN"}`);

  const goldenSet = loadGoldenSet();
  assert.strictEqual(goldenSet.samples.length, GOLDEN_SET_SIZE);
  assert.ok(fs.existsSync(IMAGES_DIR), `images dir not found: ${IMAGES_DIR}`);

  // owner
  const ownerRow = await queryOne<{ id: string }>(
    "SELECT id FROM users WHERE account_id = $1 LIMIT 1",
    ["admin"],
  );
  assert.ok(ownerRow, "admin user not found");
  const ownerId = ownerRow.id;

  let uploaded = 0;
  let skipped = 0;
  const now = new Date().toISOString();
  const updates: Array<{ sample: GoldenSample; fileId: string; sha256: string }> = [];

  for (let i = 0; i < goldenSet.samples.length; i++) {
    const sample = goldenSet.samples[i];
    const imgPath = path.join(IMAGES_DIR, `${sample.id}.jpg`);
    assert.ok(fs.existsSync(imgPath), `missing image: ${imgPath}`);

    const meta = readImageMeta(imgPath);
    const whitelistError = checkImageSha256(sample.id, meta.diskSha256);
    if (whitelistError) {
      console.error(`  FAIL ${sample.id}: ${whitelistError}`);
      skipped += 1;
      continue;
    }

    // 幂等：已入库 → 只校验 sha256 一致
    if (sample.referenceImage?.sha256) {
      assert.strictEqual(
        meta.diskSha256,
        sample.referenceImage.sha256,
        `${sample.id}: disk sha256 ${meta.diskSha256} != golden-set referenceImage.sha256 ${sample.referenceImage.sha256}`,
      );
      console.log(`  SKIP ${sample.id}: already has referenceImage, sha256 matches`);
      skipped += 1;
      continue;
    }

    // 新入库
    const ext = "jpg";
    const fileId = `${nanoid(12)}.${ext}`;
    const destPath = path.join(uploadsDir(), fileId);

    if (commit) {
      // ② COPY 到 uploadsDir
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(imgPath, destPath);
        fs.chmodSync(destPath, 0o600);
      }
      // INSERT files 表
      const res = await db().query(
        `INSERT INTO files (id, owner_id, mime_type, width, height, byte_length, normalized, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7)
         ON CONFLICT (id) DO NOTHING`,
        [fileId, ownerId, "image/jpeg", meta.width, meta.height, meta.byteLength, now],
      );
      if ((res.rowCount ?? 0) > 0) {
        console.log(`  OK ${sample.id} → fileId=${fileId} sha256=${meta.diskSha256.slice(0, 12)}…`);
        uploaded += 1;
      } else {
        console.log(`  SKIP ${sample.id}: fileId ${fileId} already exists in files table`);
        skipped += 1;
      }
    } else {
      console.log(
        `  DRY-RUN ${sample.id}: would copy → uploads/${fileId} sha256=${meta.diskSha256.slice(0, 12)}… ${meta.width}x${meta.height} ${meta.byteLength}B`,
      );
      uploaded += 1;
    }

    updates.push({ sample, fileId, sha256: meta.diskSha256 });
  }

  // ③ 回写 golden-set referenceImage
  if (commit && updates.length > 0) {
    // 先备份
    const backupPath = GOLDEN_SET_PATH.replace(".json", `-backup-${Date.now()}.json`);
    fs.copyFileSync(GOLDEN_SET_PATH, backupPath);
    console.log(`  backup: ${backupPath}`);

    for (const { sample, fileId, sha256 } of updates) {
      sample.referenceImage = { fileId, sha256 };
    }
    fs.writeFileSync(GOLDEN_SET_PATH, JSON.stringify(goldenSet, null, 2) + "\n");
    console.log(`  ✓ golden-set updated: ${updates.length} samples with referenceImage`);
  }

  console.log(
    `upload complete: ${uploaded} uploaded, ${skipped} skipped (mode=${commit ? "COMMIT" : "DRY-RUN"})`,
  );
  await closeDatabaseForTests();
}

main().catch(async (err) => {
  console.error("UPLOAD FAILED:", err instanceof Error ? err.message : err);
  try {
    await closeDatabaseForTests();
  } catch {
    /* best effort */
  }
  process.exit(1);
});