import assert from "node:assert/strict";
import { combinePerformanceBaseline, summarizeDurations } from "../scripts/performance-baseline";

assert.deepEqual(summarizeDurations([10, 1, 5, 8, 2]), {
  samples: 5,
  minMs: 1,
  medianMs: 5,
  p95Ms: 10,
  maxMs: 10,
  meanMs: 5.2,
});

const report = combinePerformanceBaseline({
  capturedAt: "2026-09-06T00:00:00.000Z",
  git: { head: "a".repeat(40), branch: "test", dirty: true },
  server: {
    schemaVersion: 1,
    queue: { claimLatencyMs: summarizeDurations([1]) },
    database: { transactionRoundTripLatencyMs: summarizeDurations([1]) },
    imageProcessing: { normalizationLatencyMs: summarizeDurations([1]) },
  },
  browser: {
    schemaVersion: 1,
    desktopRendering: { commitToStablePaintMs: summarizeDurations([1]) },
  },
  bundle: {
    budgets: { initialGzipBytes: 1, singleChunkBytes: 1 },
    totals: { initialGzipBytes: 1, initialBytes: 1, chunkCount: 1 },
    initialChunks: [],
    allChunks: [],
  },
});

assert.equal(report.artifactType, "garment-canvas-performance-baseline");
assert.equal(report.interpretation.providerCalls, 0);
assert.equal(report.interpretation.imageGenerationEndpointsCalled, false);
assert.equal(report.interpretation.thresholdsFrozen, false);

assert.throws(() => summarizeDurations([]), /at least one/);
assert.throws(() => combinePerformanceBaseline({
  capturedAt: "2026-09-06T00:00:00.000Z",
  git: { head: "not-a-sha", branch: "test", dirty: true },
  server: {
    schemaVersion: 1,
    queue: {},
    database: {},
    imageProcessing: {},
  },
  browser: { schemaVersion: 1, desktopRendering: {} },
  bundle: { budgets: {}, totals: {}, initialChunks: [], allChunks: [] },
}), /regular expression/);

console.log("  ✓ 性能基线聚合器固定分位数、证据边界与 fail-closed 输入契约");
