import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export interface DurationSummary {
  samples: number;
  minMs: number;
  medianMs: number;
  p95Ms: number;
  maxMs: number;
  meanMs: number;
}

export function summarizeDurations(values: readonly number[]): DurationSummary {
  assert.ok(values.length > 0, "performance baseline requires at least one duration sample");
  assert.ok(values.every((value) => Number.isFinite(value) && value >= 0), "duration samples must be finite and non-negative");
  const sorted = [...values].sort((left, right) => left - right);
  const percentile = (ratio: number) => sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)];
  const round = (value: number) => Number(value.toFixed(3));
  return {
    samples: sorted.length,
    minMs: round(sorted[0]),
    medianMs: round(percentile(0.5)),
    p95Ms: round(percentile(0.95)),
    maxMs: round(sorted.at(-1)!),
    meanMs: round(sorted.reduce((total, value) => total + value, 0) / sorted.length),
  };
}

interface ServerBaseline {
  schemaVersion: 1;
  queue: Record<string, unknown>;
  database: Record<string, unknown>;
  imageProcessing: Record<string, unknown>;
}

interface BrowserBaseline {
  schemaVersion: 1;
  desktopRendering: Record<string, unknown>;
}

interface BundleBaseline {
  budgets: Record<string, number>;
  totals: Record<string, number>;
  initialChunks: unknown[];
  allChunks: unknown[];
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  assert.ok(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  return value as Record<string, unknown>;
}

export function combinePerformanceBaseline(input: {
  capturedAt: string;
  git: { head: string; branch: string; dirty: boolean };
  server: ServerBaseline;
  browser: BrowserBaseline;
  bundle: BundleBaseline;
}) {
  assert.equal(input.server.schemaVersion, 1);
  assert.equal(input.browser.schemaVersion, 1);
  requireObject(input.server.queue, "server.queue");
  requireObject(input.server.database, "server.database");
  requireObject(input.server.imageProcessing, "server.imageProcessing");
  requireObject(input.browser.desktopRendering, "browser.desktopRendering");
  requireObject(input.bundle.budgets, "bundle.budgets");
  requireObject(input.bundle.totals, "bundle.totals");
  assert.match(input.git.head, /^[a-f0-9]{40}$/);
  return {
    schemaVersion: 1 as const,
    artifactType: "garment-canvas-performance-baseline" as const,
    capturedAt: input.capturedAt,
    environment: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      cpuModel: os.cpus()[0]?.model ?? "unknown",
      logicalCpuCount: os.cpus().length,
      totalMemoryBytes: os.totalmem(),
    },
    git: input.git,
    queue: input.server.queue,
    database: input.server.database,
    imageProcessing: input.server.imageProcessing,
    desktopRendering: input.browser.desktopRendering,
    bundle: input.bundle,
    interpretation: {
      purpose: "Measured comparison baseline for T031/T032; not a release pass by itself.",
      providerCalls: 0,
      imageGenerationEndpointsCalled: false,
      thresholdsFrozen: false,
    },
  };
}

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command: string, args: string[], env: NodeJS.ProcessEnv): void {
  const result = spawnSync(command, args, { cwd: repositoryRoot, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
}

function output(command: string, args: string[]): string {
  const result = spawnSync(command, args, { cwd: repositoryRoot, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `${command} ${args.join(" ")} failed`);
  return result.stdout.trim();
}

function markdownFor(report: ReturnType<typeof combinePerformanceBaseline>): string {
  const queue = report.queue as {
    workload: { runs: number; jobs: number; measuredClaims: number };
    claimLatencyMs: DurationSummary;
    queryCountPerClaim: { min: number; median: number; p95: number; max: number };
  };
  const database = report.database as {
    transactionRoundTripLatencyMs: DurationSummary;
    queriesPerTransaction: number;
  };
  const image = report.imageProcessing as {
    fixture: { width: number; height: number; inputBytes: number; samples: number };
    normalizationLatencyMs: DurationSummary;
    peakRssDeltaBytes: number;
    peakExternalDeltaBytes: number;
  };
  const rendering = report.desktopRendering as {
    viewport: { width: number; height: number };
    nodeCount: number;
    commitToStablePaintMs: DurationSummary;
    peakJsHeapUsedBytes: number | null;
  };
  return `# Performance Baseline\n\n` +
    `Captured: ${report.capturedAt}\n\n` +
    `This is a comparison baseline for T031/T032, not a release approval. It used local PostgreSQL, local Sharp processing, and an isolated Chromium session. Provider calls and image generation/editing endpoints: **0**.\n\n` +
    `| Surface | Workload | Baseline |\n| --- | --- | --- |\n` +
    `| Queue claim | ${queue.workload.runs} runs / ${queue.workload.jobs} jobs / ${queue.workload.measuredClaims} claims | p95 ${queue.claimLatencyMs.p95Ms} ms; queries/claim p95 ${queue.queryCountPerClaim.p95} |\n` +
    `| Database transaction | BEGIN + SELECT 1 + COMMIT | p95 ${database.transactionRoundTripLatencyMs.p95Ms} ms; ${database.queriesPerTransaction} queries/operation |\n` +
    `| Image normalization | ${image.fixture.width}x${image.fixture.height}, ${image.fixture.inputBytes} input bytes, ${image.fixture.samples} samples | p95 ${image.normalizationLatencyMs.p95Ms} ms; peak RSS delta ${image.peakRssDeltaBytes} bytes; external delta ${image.peakExternalDeltaBytes} bytes |\n` +
    `| Desktop rendering | ${rendering.nodeCount} nodes at ${rendering.viewport.width}x${rendering.viewport.height} | commit-to-stable-paint p95 ${rendering.commitToStablePaintMs.p95Ms} ms; peak JS heap ${rendering.peakJsHeapUsedBytes ?? "unavailable"} bytes |\n` +
    `| Web bundle | ${report.bundle.totals.chunkCount} JS chunks | initial ${report.bundle.totals.initialBytes} bytes / gzip ${report.bundle.totals.initialGzipBytes} bytes |\n\n` +
    `Machine: ${report.environment.cpuModel}, ${report.environment.logicalCpuCount} logical CPUs, Node ${report.environment.node}. Git HEAD ${report.git.head}; dirty=${report.git.dirty}.\n`;
}

async function main(): Promise<void> {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "garment-performance-baseline-"));
  const serverPath = path.join(tempRoot, "server.json");
  const browserPath = path.join(tempRoot, "browser.json");
  try {
    const env = {
      ...process.env,
      PERFORMANCE_BASELINE_SERVER_OUTPUT: serverPath,
      PERFORMANCE_BASELINE_BROWSER_OUTPUT: browserPath,
    };
    run(process.execPath, ["scripts/test-with-postgres.mjs", "tests/performance-baseline.test.ts"], env);
    run(process.execPath, ["scripts/e2e-with-postgres.mjs", "--project=performance-baseline"], env);

    const bundlePath = path.join(repositoryRoot, "dist", "bundle-budget.json");
    assert.ok(fs.existsSync(bundlePath), "dist/bundle-budget.json is missing; run npm run build first");
    const server = JSON.parse(fs.readFileSync(serverPath, "utf8")) as ServerBaseline;
    const browser = JSON.parse(fs.readFileSync(browserPath, "utf8")) as BrowserBaseline;
    const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8")) as BundleBaseline;
    const report = combinePerformanceBaseline({
      capturedAt: new Date().toISOString(),
      git: {
        head: output("git", ["rev-parse", "HEAD"]),
        branch: output("git", ["branch", "--show-current"]),
        dirty: output("git", ["status", "--porcelain"]).length > 0,
      },
      server,
      browser,
      bundle,
    });
    const evidenceRoot = path.join(repositoryRoot, "docs", "audit", "2026-09-06");
    fs.mkdirSync(evidenceRoot, { recursive: true });
    fs.writeFileSync(path.join(evidenceRoot, "performance-baseline.json"), `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(path.join(evidenceRoot, "performance-baseline.md"), markdownFor(report));
    console.log(`Performance baseline written to ${path.relative(repositoryRoot, evidenceRoot)}`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) await main();
