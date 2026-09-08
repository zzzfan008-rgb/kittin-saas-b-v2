import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import pg from "pg";
import sharp from "sharp";
import type { GenerationRecordContext } from "../server/lib/generationRecords";
import type { ExecutionPlan, NodeExecution } from "../src/types/workflow";
import { summarizeDurations } from "../scripts/performance-baseline";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";

const outputPath = process.env.PERFORMANCE_BASELINE_SERVER_OUTPUT;
if (!outputPath) throw new Error("PERFORMANCE_BASELINE_SERVER_OUTPUT is required");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "garment-server-performance-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "performance-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";

let countQueries = false;
let queryCount = 0;
const clientPrototype = pg.Client.prototype as unknown as { query: (...args: unknown[]) => unknown };
const originalQuery = clientPrototype.query;
clientPrototype.query = function patchedQuery(this: pg.Client, ...args: unknown[]) {
  if (countQueries) queryCount += 1;
  return originalQuery.apply(this, args);
};

function resultStep(nodeId: string, upstream?: NodeExecution["upstream"]): NodeExecution {
  return { nodeId, kind: "result", inputImages: [], upstream, params: {} };
}

function durationMs(started: bigint): number {
  return Number(process.hrtime.bigint() - started) / 1_000_000;
}

function queryCountSummary(values: readonly number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  const at = (ratio: number) => sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)];
  return { min: sorted[0], median: at(0.5), p95: at(0.95), max: sorted.at(-1)! };
}

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

await resetPostgresTestDatabase();
const database = await import("../server/lib/database");
const queue = await import("../server/engine/runQueue");
const { normalizeUploadImageDataUrl } = await import("../server/lib/uploadImageNormalization");

try {
  await database.initializeDatabase();
  const owner = await database.queryOne<{ id: string }>(
    "SELECT id FROM users WHERE account_id = 'performance-admin'",
  );
  assert.ok(owner);

  const runIds: string[] = [];
  const runCount = 100;
  const jobsPerRun = 5;
  for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
    const nodeIds = Array.from({ length: jobsPerRun }, (_value, index) => `perf-${runIndex}-${index}`);
    const steps = nodeIds.map((nodeId, index) => resultStep(
      nodeId,
      index === 0 ? undefined : [{ nodeId: nodeIds[index - 1], images: [] }],
    ));
    const context: GenerationRecordContext = {
      userId: owner.id,
      nodeId: nodeIds.at(-1)!,
      nodeLabel: `Performance ${runIndex}`,
      kind: "result",
      requestedCount: 1,
    };
    const run = await queue.enqueueGenerationRun({ steps } satisfies ExecutionPlan, owner.id, context);
    runIds.push(run.id);
  }
  await database.query("ANALYZE generation_jobs, generation_run_steps, generation_runs");
  const jobCount = (await database.queryOne<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM generation_jobs WHERE run_id = ANY($1::text[])",
    [runIds],
  ))?.count;
  assert.equal(jobCount, runCount * jobsPerRun);

  const explain = await database.query<{ "QUERY PLAN": Array<{ Plan: Record<string, unknown> }> }>(
    `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${queue.CLAIM_NEXT_JOB_SQL}`,
    [Date.now() + 60_000],
  );
  const planRoot = explain[0]?.["QUERY PLAN"]?.[0]?.Plan;
  assert.ok(planRoot);
  const planNodes: Record<string, unknown>[] = [];
  const collectPlan = (node: Record<string, unknown>) => {
    planNodes.push(node);
    const children = Array.isArray(node.Plans) ? node.Plans : [];
    children.forEach((child) => collectPlan(child as Record<string, unknown>));
  };
  collectPlan(planRoot);

  const claimDurations: number[] = [];
  const claimQueryCounts: number[] = [];
  const claimNow = Date.now() + 60_000;
  for (let index = 0; index < 20; index += 1) {
    queryCount = 0;
    countQueries = true;
    const started = process.hrtime.bigint();
    const claimed = await queue.claimNextJob(`performance-worker-${index}`, claimNow, 60_000);
    countQueries = false;
    assert.ok(claimed && runIds.includes(claimed.runId));
    claimDurations.push(durationMs(started));
    claimQueryCounts.push(queryCount);
  }

  const transactionDurations: number[] = [];
  const transactionQueryCounts: number[] = [];
  for (let index = 0; index < 30; index += 1) {
    queryCount = 0;
    countQueries = true;
    const started = process.hrtime.bigint();
    await database.transaction(async (client) => {
      await client.query("SELECT 1");
    });
    countQueries = false;
    transactionDurations.push(durationMs(started));
    transactionQueryCounts.push(queryCount);
  }
  assert.ok(transactionQueryCounts.every((count) => count === 3));

  const width = 1600;
  const height = 1200;
  const fixture = await sharp(deterministicRgb(width, height), { raw: { width, height, channels: 3 } })
    .png({ compressionLevel: 6 })
    .toBuffer();
  const fixtureDataUrl = `data:image/png;base64,${fixture.toString("base64")}`;
  await normalizeUploadImageDataUrl(fixtureDataUrl);
  const memoryStart = process.memoryUsage();
  let peakRss = memoryStart.rss;
  let peakExternal = memoryStart.external;
  const imageDurations: number[] = [];
  const imageSamples = 7;
  let normalizedBytes = 0;
  for (let index = 0; index < imageSamples; index += 1) {
    const started = process.hrtime.bigint();
    const normalized = await normalizeUploadImageDataUrl(fixtureDataUrl);
    imageDurations.push(durationMs(started));
    normalizedBytes = normalized.byteLength;
    const memory = process.memoryUsage();
    peakRss = Math.max(peakRss, memory.rss);
    peakExternal = Math.max(peakExternal, memory.external);
  }

  const report = {
    schemaVersion: 1 as const,
    queue: {
      workload: { runs: runCount, jobs: jobCount, measuredClaims: claimDurations.length },
      claimLatencyMs: summarizeDurations(claimDurations),
      queryCountPerClaim: queryCountSummary(claimQueryCounts),
      plan: {
        rootNodeType: planRoot["Node Type"],
        executionTimeMs: explain[0]?.["QUERY PLAN"]?.[0]?.["Execution Time"] ?? null,
        sortNodeCount: planNodes.filter((node) => node["Node Type"] === "Sort").length,
        nodeTypes: [...new Set(planNodes.map((node) => String(node["Node Type"])))],
      },
    },
    database: {
      operation: "transaction(BEGIN + SELECT 1 + COMMIT)",
      samples: transactionDurations.length,
      transactionRoundTripLatencyMs: summarizeDurations(transactionDurations),
      queriesPerTransaction: transactionQueryCounts[0],
    },
    imageProcessing: {
      operation: "normalizeUploadImageDataUrl",
      fixture: { width, height, inputBytes: fixture.byteLength, samples: imageSamples },
      normalizedBytes,
      normalizationLatencyMs: summarizeDurations(imageDurations),
      peakRssDeltaBytes: Math.max(0, peakRss - memoryStart.rss),
      peakExternalDeltaBytes: Math.max(0, peakExternal - memoryStart.external),
    },
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`  ✓ 服务端性能基线：queue p95 ${report.queue.claimLatencyMs.p95Ms}ms, image p95 ${report.imageProcessing.normalizationLatencyMs.p95Ms}ms`);
} finally {
  countQueries = false;
  clientPrototype.query = originalQuery;
  await database.closeDatabaseForTests();
  fs.rmSync(temp, { recursive: true, force: true });
}
