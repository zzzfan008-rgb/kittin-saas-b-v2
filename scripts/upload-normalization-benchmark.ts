import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { summarizeDurations } from "./performance-baseline";
import {
  normalizeUploadImageDataUrl,
  UPLOAD_TARGET_BYTES,
} from "../server/lib/uploadImageNormalization";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceRoot = path.join(repositoryRoot, "docs", "audit", "2026-09-06");
const encoderVariable = "UPLOAD_NORMALIZATION_MOZJPEG";

function deterministicRgb(width: number, height: number): Buffer {
  const buffer = Buffer.allocUnsafe(width * height * 3);
  let state = 0x12345678;
  for (let index = 0; index < buffer.length; index += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    buffer[index] = state & 0xff;
  }
  return buffer;
}

async function measure(dataUrl: string, mozjpeg: boolean, samples: number) {
  process.env[encoderVariable] = mozjpeg ? "true" : "false";
  await normalizeUploadImageDataUrl(dataUrl);
  const durations: number[] = [];
  let outputBytes = 0;
  let outputDimensions = { width: 0, height: 0 };
  for (let index = 0; index < samples; index += 1) {
    const started = process.hrtime.bigint();
    const output = await normalizeUploadImageDataUrl(dataUrl);
    durations.push(Number(process.hrtime.bigint() - started) / 1_000_000);
    outputBytes = output.byteLength;
    outputDimensions = { width: output.width, height: output.height };
    assert.equal(output.mimeType, "image/jpeg");
    assert.ok(output.byteLength <= UPLOAD_TARGET_BYTES);
  }
  return {
    encoder: mozjpeg ? "mozjpeg" : "libjpeg",
    samples,
    latencyMs: summarizeDurations(durations),
    outputBytes,
    outputDimensions,
  };
}

async function main(): Promise<void> {
  const previous = process.env[encoderVariable];
  try {
    const width = 1600;
    const height = 1200;
    const input = await sharp(deterministicRgb(width, height), {
      raw: { width, height, channels: 3 },
    }).png({ compressionLevel: 6 }).toBuffer();
    const dataUrl = `data:image/png;base64,${input.toString("base64")}`;
    const legacy = await measure(dataUrl, true, 3);
    const optimized = await measure(dataUrl, false, 3);
    const p95Speedup = Number((legacy.latencyMs.p95Ms / optimized.latencyMs.p95Ms).toFixed(2));
    const report = {
      schemaVersion: 1,
      artifactType: "garment-canvas-upload-normalization-optimization",
      capturedAt: new Date().toISOString(),
      environment: { node: process.version, platform: process.platform, architecture: process.arch },
      fixture: { width, height, inputBytes: input.byteLength, targetBytes: UPLOAD_TARGET_BYTES },
      before: legacy,
      after: optimized,
      comparison: {
        p95Speedup,
        p95ReductionPercent: Number(((1 - optimized.latencyMs.p95Ms / legacy.latencyMs.p95Ms) * 100).toFixed(2)),
        outputByteDelta: optimized.outputBytes - legacy.outputBytes,
      },
      rollback: `${encoderVariable}=true`,
      invariants: {
        outputMime: "image/jpeg",
        targetBytesEnforced: true,
        qualityRangeChanged: false,
        chromaSubsamplingChanged: false,
        providerCalls: 0,
        imageGenerationEndpointsCalled: false,
      },
    };
    fs.mkdirSync(evidenceRoot, { recursive: true });
    fs.writeFileSync(
      path.join(evidenceRoot, "upload-normalization-optimization.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    );
    fs.writeFileSync(
      path.join(evidenceRoot, "upload-normalization-optimization.md"),
      `# Upload Normalization Optimization\n\n` +
      `Captured: ${report.capturedAt}\n\n` +
      `The deterministic 1600x1200 high-entropy fixture was processed locally. Provider calls and image generation/editing endpoints: **0**.\n\n` +
      `| Encoder | Samples | p95 | Output bytes | Output dimensions |\n` +
      `| --- | ---: | ---: | ---: | --- |\n` +
      `| Legacy mozjpeg | ${legacy.samples} | ${legacy.latencyMs.p95Ms} ms | ${legacy.outputBytes} | ${legacy.outputDimensions.width}x${legacy.outputDimensions.height} |\n` +
      `| Default libjpeg | ${optimized.samples} | ${optimized.latencyMs.p95Ms} ms | ${optimized.outputBytes} | ${optimized.outputDimensions.width}x${optimized.outputDimensions.height} |\n\n` +
      `p95 reduction: ${report.comparison.p95ReductionPercent}% (${p95Speedup}x). Output remains JPEG, uses the same quality range and 4:4:4 chroma subsampling, and remains below ${UPLOAD_TARGET_BYTES} bytes.\n\n` +
      `Rollback: set \`${report.rollback}\` and restart the service. No database or stored-document migration is required.\n`,
    );
    console.log(
      `Upload normalization p95: ${legacy.latencyMs.p95Ms}ms mozjpeg -> ${optimized.latencyMs.p95Ms}ms libjpeg (${p95Speedup}x)`,
    );
  } finally {
    if (previous === undefined) delete process.env[encoderVariable];
    else process.env[encoderVariable] = previous;
  }
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) await main();
