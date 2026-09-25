/**
 * 24 张参考图入库脚本 v3（step 2，architect 裁决 1/2/D，
 * 62-reference-image-spec-ruling.md）
 *
 * 入库链（裁决 1：走生产同一函数，不绕过 normalize）：
 *   1. 读磁盘交付文件 → 算 sha256 → 溯源白名单校验（deliveredSourceSha256 语义）
 *   2. 调生产函数 saveNormalizedUploadDataUrl（server/lib/fileStore.ts:157，
 *      与 POST /api/files 路由 server/routes/files.ts:69 同一入口）→ 拿真实 fileId
 *   3. INSERT files 表 normalized=TRUE（对齐 files.ts:73-80 生产列集）
 *   4. 回读：从 uploadsDir 读实际存储字节算 sha256 = assetSha256
 *      （裁决 2：执行绑定 pin 必须入库后从实际存储回读，不得规划期手抄）
 *   5. 回写 golden-set referenceImage.{fileId, deliveredSourceSha256, assetSha256}
 *      （裁决 2：溯源与绑定分字段；裁决 D：golden-set 是 fileId 单一事实源）
 *
 * 幂等：golden-set 已有 assetSha256+fileId → 只校验回读一致，不重复入库。
 * 补偿：files INSERT 失败 → 删除已落盘文件（对齐 files.ts:88-90 语义）。
 *
 * 用法：
 *   npx tsx scripts/upload-evaluation-reference-images.ts           # dry-run（真实 normalize 预演，不落盘不写库）
 *   npx tsx scripts/upload-evaluation-reference-images.ts --commit  # 写 dev 库 + 文件系统 + 回写 golden-set
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { queryOne, db, closeDatabaseForTests } from "../server/lib/database";
import {
  loadGoldenSet,
  GOLDEN_SET_SIZE,
  REJECTED_SHA256,
  REQUIRED_SHA256,
  type GoldenSample,
} from "../server/lib/goldenSet";
import { saveNormalizedUploadDataUrl, uploadsDir } from "../server/lib/fileStore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.resolve(ROOT, "tmp/golden-set-images");
const GOLDEN_SET_PATH = path.resolve(ROOT, "docs/ai/evaluation/golden-set-v1.json");

function sha256Bytes(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/** 溯源白名单校验（对交付原文件 sha256）。返回 null = 通过；string = 拒绝原因。 */
function checkDeliveredSourceSha256(sampleId: string, sourceSha256: string): string | null {
  if (REJECTED_SHA256.has(sourceSha256)) {
    return `REJECTED — sha256 ${sourceSha256} is in the rejected list (known-bad hash). ` +
      `Required for ${sampleId}: ${REQUIRED_SHA256[sampleId] ?? "not pinned"}.`;
  }
  const required = REQUIRED_SHA256[sampleId];
  if (required !== undefined && sourceSha256 !== required) {
    return `deliveredSourceSha256 MISMATCH for ${sampleId}: required ${required}, disk ${sourceSha256}`;
  }
  return null;
}

async function main(): Promise<void> {
  const commit = process.argv.includes("--commit");
  console.log(
    `upload-evaluation-reference-images v3: mode=${commit ? "COMMIT" : "DRY-RUN"} (production normalize path)`,
  );

  const goldenSet = loadGoldenSet();
  assert.strictEqual(goldenSet.samples.length, GOLDEN_SET_SIZE);
  assert.ok(fs.existsSync(IMAGES_DIR), `images dir not found: ${IMAGES_DIR}`);

  const ownerRow = await queryOne<{ id: string }>(
    "SELECT id FROM users WHERE account_id = $1 LIMIT 1",
    ["admin"],
  );
  assert.ok(ownerRow !== undefined, "admin user not found in database");
  const ownerId = ownerRow.id;

  if (commit) {
    const dbNameRow = await queryOne<{ db: string }>("SELECT current_database() AS db");
    const dbName = dbNameRow?.db ?? "";
    assert.ok(
      !dbName.endsWith("_test"),
      `--commit must target the dev database, got "${dbName}" (test db)`,
    );
    console.log(`  target db: ${dbName} (dev, no reset)`);
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const updates: Array<{
    sample: GoldenSample;
    fileId: string;
    deliveredSourceSha256: string;
    assetSha256: string;
  }> = [];

  for (const sample of goldenSet.samples) {
    const imgPath = path.join(IMAGES_DIR, `${sample.id}.jpg`);
    if (!fs.existsSync(imgPath)) {
      console.error(`  FAIL ${sample.id}: image file not found at ${imgPath}`);
      failed += 1;
      continue;
    }

    // 1. 交付原文件溯源校验
    const sourceBuf = fs.readFileSync(imgPath);
    const sourceSha256 = sha256Bytes(sourceBuf);
    const whitelistError = checkDeliveredSourceSha256(sample.id, sourceSha256);
    if (whitelistError) {
      console.error(`  FAIL ${sample.id}: ${whitelistError}`);
      failed += 1;
      continue;
    }

    // 幂等：golden-set 已有 assetSha256+fileId → 只校验回读一致
    const existing = sample.referenceImage;
    if (existing?.assetSha256 && existing.fileId) {
      const storedPath = path.join(uploadsDir(), existing.fileId);
      if (fs.existsSync(storedPath)) {
        const readBackSha256 = sha256Bytes(fs.readFileSync(storedPath));
        if (readBackSha256 === existing.assetSha256) {
          console.log(
            `  SKIP ${sample.id}: already uploaded, read-back assetSha256 matches (${existing.fileId})`,
          );
          skipped += 1;
          continue;
        }
        console.error(
          `  FAIL ${sample.id}: stored asset sha256 drift — golden-set ${existing.assetSha256}, read-back ${readBackSha256}`,
        );
        failed += 1;
        continue;
      }
      console.error(
        `  FAIL ${sample.id}: golden-set claims fileId ${existing.fileId} but it is not on disk`,
      );
      failed += 1;
      continue;
    }

    const dataUrl = `data:image/jpeg;base64,${sourceBuf.toString("base64")}`;

    if (!commit) {
      // dry-run：调真实 normalize 函数验证可入库性 + 产出元数据（不落盘不写库）
      const { normalizeUploadImageDataUrl } = await import(
        "../server/lib/uploadImageNormalization"
      );
      const normalized = await normalizeUploadImageDataUrl(dataUrl);
      const previewAssetSha256 = sha256Bytes(normalized.buffer);
      console.log(
        `  DRY-RUN ${sample.id}: normalize ok → ${normalized.width}x${normalized.height} ` +
          `${normalized.byteLength}B ${normalized.mimeType} ` +
          `(preview assetSha256=${previewAssetSha256.slice(0, 12)}…, source=${sourceSha256.slice(0, 12)}…)`,
      );
      uploaded += 1;
      continue;
    }

    // 2. commit：生产同一函数入库（saveNormalizedUploadDataUrl = 裁决 1）
    const saved = await saveNormalizedUploadDataUrl(dataUrl);
    try {
      // 3. files 表登记（对齐 files.ts:73-80 生产列集）
      const res = await db().query(
        `INSERT INTO files (
           id, owner_id, source_type, mime_type, width, height, byte_length, normalized, created_at
         ) VALUES ($1, $2, 'upload', $3, $4, $5, $6, TRUE, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          saved.id,
          ownerId,
          saved.mimeType,
          saved.width,
          saved.height,
          saved.byteLength,
          new Date().toISOString(),
        ],
      );
      assert.strictEqual(
        res.rowCount,
        1,
        `files INSERT for ${saved.id} did not insert (unexpected conflict)`,
      );
    } catch (error) {
      // 补偿：库失败必须删除已落盘文件（files.ts:88-90 同语义）
      fs.rmSync(path.join(uploadsDir(), saved.id), { force: true });
      throw error;
    }

    // 4. 回读实际存储字节 → assetSha256（裁决 2：pin 从入库产物回读）
    const readBack = fs.readFileSync(path.join(uploadsDir(), saved.id));
    const assetSha256 = sha256Bytes(readBack);
    assert.strictEqual(
      readBack.byteLength,
      saved.byteLength,
      `${sample.id}: read-back byteLength ${readBack.byteLength} != saved.byteLength ${saved.byteLength}`,
    );

    console.log(
      `  OK ${sample.id} → fileId=${saved.id} ${saved.width}x${saved.height} ${saved.byteLength}B ` +
        `assetSha256=${assetSha256.slice(0, 12)}… (read-back) source=${sourceSha256.slice(0, 12)}…`,
    );
    uploaded += 1;
    updates.push({
      sample,
      fileId: saved.id,
      deliveredSourceSha256: sourceSha256,
      assetSha256,
    });
  }

  // 5. 回写 golden-set（裁决 D 单一事实源；备份先行）
  if (commit && updates.length > 0) {
    const backupPath = GOLDEN_SET_PATH.replace(".json", `-backup-${Date.now()}.json`);
    fs.copyFileSync(GOLDEN_SET_PATH, backupPath);
    for (const { sample, fileId, deliveredSourceSha256, assetSha256 } of updates) {
      sample.referenceImage = { fileId, deliveredSourceSha256, assetSha256 };
    }
    fs.writeFileSync(GOLDEN_SET_PATH, JSON.stringify(goldenSet, null, 2) + "\n");
    console.log(
      `  ✓ golden-set updated: ${updates.length} samples (backup: ${path.basename(backupPath)})`,
    );
  }

  console.log(
    `upload complete: ${uploaded} ok, ${skipped} skipped, ${failed} failed (mode=${commit ? "COMMIT" : "DRY-RUN"})`,
  );
  assert.strictEqual(failed, 0, `${failed} image(s) failed validation — refusing to continue`);
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