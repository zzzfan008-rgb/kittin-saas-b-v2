import assert from "node:assert/strict";
import sharp from "sharp";
import {
  normalizeUploadImageDataUrl,
  uploadNormalizationUsesMozjpeg,
  UPLOAD_TARGET_BYTES,
} from "../server/lib/uploadImageNormalization";

console.log("上传归一化编码器配置测试");

assert.equal(uploadNormalizationUsesMozjpeg(undefined), false);
assert.equal(uploadNormalizationUsesMozjpeg(""), false);
assert.equal(uploadNormalizationUsesMozjpeg("false"), false);
assert.equal(uploadNormalizationUsesMozjpeg("0"), false);
assert.equal(uploadNormalizationUsesMozjpeg("off"), false);
assert.equal(uploadNormalizationUsesMozjpeg("true"), true);
assert.equal(uploadNormalizationUsesMozjpeg("1"), true);
assert.equal(uploadNormalizationUsesMozjpeg("ON"), true);
assert.throws(() => uploadNormalizationUsesMozjpeg("legacy"), /必须为/);

console.log("  ✓ 默认使用 libjpeg，并保留显式 mozjpeg 回滚开关");

const source = await sharp({
  create: { width: 96, height: 64, channels: 3, background: "#336699" },
}).png().toBuffer();
const dataUrl = `data:image/png;base64,${source.toString("base64")}`;
const previous = process.env.UPLOAD_NORMALIZATION_MOZJPEG;
try {
  for (const value of ["false", "true"]) {
    process.env.UPLOAD_NORMALIZATION_MOZJPEG = value;
    const normalized = await normalizeUploadImageDataUrl(dataUrl);
    assert.equal(normalized.mimeType, "image/jpeg");
    assert.deepEqual([normalized.width, normalized.height], [96, 64]);
    assert.ok(normalized.byteLength <= UPLOAD_TARGET_BYTES);
  }
} finally {
  if (previous === undefined) delete process.env.UPLOAD_NORMALIZATION_MOZJPEG;
  else process.env.UPLOAD_NORMALIZATION_MOZJPEG = previous;
}

console.log("  ✓ libjpeg 默认路径与 mozjpeg 回滚路径保持上传输出合同");
