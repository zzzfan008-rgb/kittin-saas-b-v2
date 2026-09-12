import fs from "node:fs";
import { expect, test } from "./fixtures";

const outputPath = process.env.PERFORMANCE_BASELINE_BROWSER_OUTPUT;
test.skip(!outputPath, "run through npm run audit:performance-baseline");

function summarize(values: readonly number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  const at = (ratio: number) => sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)];
  const round = (value: number) => Number(value.toFixed(3));
  return {
    samples: sorted.length,
    minMs: round(sorted[0]),
    medianMs: round(at(0.5)),
    p95Ms: round(at(0.95)),
    maxMs: round(sorted.at(-1)!),
    meanMs: round(sorted.reduce((total, value) => total + value, 0) / sorted.length),
  };
}

test("capture 100-node desktop render latency and browser memory", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("application", { name: "工作流画布" })).toBeVisible();

  const nodeCount = 100;
  const sampleCount = 7;
  const durations: number[] = [];
  let peakJsHeapUsedBytes: number | null = null;
  for (let sample = 0; sample < sampleCount; sample += 1) {
    await page.evaluate(async () => {
      const storeModuleUrl = "/src/store/flowStore.ts";
      const store = await import(/* @vite-ignore */ storeModuleUrl);
      store.commitDocumentMutation({
        nodes: [],
        edges: [],
        selectedNodeIds: [],
        selectedNodeId: null,
        selectedResultId: null,
        compareIds: [],
      });
    });
    await expect(page.locator(".react-flow__node")).toHaveCount(0);

    const startedAt = await page.evaluate(async (count) => {
      const storeModuleUrl = "/src/store/flowStore.ts";
      const store = await import(/* @vite-ignore */ storeModuleUrl);
      const nodes = Array.from({ length: count }, (_value, index) => ({
        id: `performance-${index}`,
        type: "image-input",
        position: { x: (index % 10) * 260, y: Math.floor(index / 10) * 230 },
        data: {
          kind: "image-input",
          label: `Performance ${index}`,
          status: "idle",
          imageRole: "generic",
          roleNeedsConfirmation: false,
        },
      }));
      const started = performance.now();
      store.commitDocumentMutation({
        nodes,
        edges: [],
        selectedNodeIds: [],
        selectedNodeId: null,
        selectedResultId: null,
        compareIds: [],
      });
      return started;
    }, nodeCount);
    await expect(page.locator(".react-flow__node")).toHaveCount(nodeCount);
    const sampleResult = await page.evaluate(async (started) => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const memory = performance as Performance & { memory?: { usedJSHeapSize: number } };
      return {
        durationMs: performance.now() - started,
        jsHeapUsedBytes: memory.memory?.usedJSHeapSize ?? null,
        domElementCount: document.getElementsByTagName("*").length,
      };
    }, startedAt);
    durations.push(sampleResult.durationMs);
    if (sampleResult.jsHeapUsedBytes !== null) {
      peakJsHeapUsedBytes = Math.max(peakJsHeapUsedBytes ?? 0, sampleResult.jsHeapUsedBytes);
    }
  }

  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return entry ? {
      domContentLoadedMs: entry.domContentLoadedEventEnd,
      loadEventMs: entry.loadEventEnd,
      transferSizeBytes: entry.transferSize,
      decodedBodySizeBytes: entry.decodedBodySize,
    } : null;
  });
  const report = {
    schemaVersion: 1 as const,
    desktopRendering: {
      viewport: page.viewportSize(),
      nodeCount,
      samples: sampleCount,
      commitToStablePaintMs: summarize(durations),
      peakJsHeapUsedBytes,
      navigation,
    },
  };
  fs.writeFileSync(outputPath!, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`desktop 100-node stable-paint p95 ${report.desktopRendering.commitToStablePaintMs.p95Ms}ms`);
});
