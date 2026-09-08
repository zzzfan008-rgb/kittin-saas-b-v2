import assert from "node:assert/strict";
import fs from "node:fs";

const evidence = JSON.parse(fs.readFileSync(
  new URL("../docs/audit/2026-09-06/upload-normalization-optimization.json", import.meta.url),
  "utf8",
)) as {
  artifactType: string;
  environment: { node: string };
  fixture: { targetBytes: number };
  before: { encoder: string; samples: number; latencyMs: { p95Ms: number }; outputBytes: number };
  after: { encoder: string; samples: number; latencyMs: { p95Ms: number }; outputBytes: number };
  comparison: { p95Speedup: number; p95ReductionPercent: number };
  rollback: string;
  invariants: { providerCalls: number; imageGenerationEndpointsCalled: boolean };
};

assert.equal(evidence.artifactType, "garment-canvas-upload-normalization-optimization");
assert.equal(evidence.environment.node, "v24.20.0");
assert.equal(evidence.before.encoder, "mozjpeg");
assert.equal(evidence.after.encoder, "libjpeg");
assert.ok(evidence.before.samples >= 3 && evidence.after.samples >= 3);
assert.ok(evidence.after.latencyMs.p95Ms < evidence.before.latencyMs.p95Ms);
assert.ok(evidence.comparison.p95Speedup >= 5);
assert.ok(evidence.comparison.p95ReductionPercent >= 80);
assert.ok(evidence.before.outputBytes <= evidence.fixture.targetBytes);
assert.ok(evidence.after.outputBytes <= evidence.fixture.targetBytes);
assert.equal(evidence.rollback, "UPLOAD_NORMALIZATION_MOZJPEG=true");
assert.equal(evidence.invariants.providerCalls, 0);
assert.equal(evidence.invariants.imageGenerationEndpointsCalled, false);

for (const path of ["../.env.example", "../docs/DEPLOYMENT_AND_OPERATIONS.md"]) {
  assert.match(fs.readFileSync(new URL(path, import.meta.url), "utf8"), /UPLOAD_NORMALIZATION_MOZJPEG/);
}

console.log("  ✓ 上传归一化优化证据固定性能改善、输出上限、回滚和零 Provider 边界");
