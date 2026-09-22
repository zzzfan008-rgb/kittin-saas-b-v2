import fs from "node:fs";
import { expect, test } from "./fixtures";

const outputPath = process.env.PERFORMANCE_BASELINE_BROWSER_OUTPUT;
// 设计性 skip（不是脚本失效）：这是人工显式采集的性能基准，数字会落盘到
// docs/audit/ 并跨机器比较，不能在隔离 e2e/CI 环境里随常规回归运行（硬件差异会让
// p95/heap 失去可比性）。仅 npm run audit:performance-baseline 设置
// PERFORMANCE_BASELINE_BROWSER_OUTPUT 时才真实执行；常规 e2e 收集时本用例带此明确
// 原因出现在 skipped 列表，属于批准的 skip。
test.skip(!outputPath, "performance baseline is captured only via npm run audit:performance-baseline");

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
  // 2026-09-25 登录语义（决策 4）：冷启动 0 页签 → 「空工作区」引导；先建一个本地空白页签。
  const emptyGuide = page.getByRole("region", { name: "空工作区" });
  await expect(emptyGuide).toBeVisible();
  await emptyGuide.getByRole("button", { name: "新建项目" }).click();
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
        // v7 三基础节点（text/image/video，见 src/types/workflow.ts WORKFLOW_SCHEMA_VERSION）；
        // v6 的 "image-input" 已非法。选 image 节点：它是三族里渲染最重的（上传槽 + 产出网格），
        // 与原 image-input 基准意图一致。data 保持 ImageNode 真实渲染所需的最小合法形状
        // （outputImages 必填，组件直接读 data.outputImages.length）。
        id: `performance-${index}`,
        type: "image",
        position: { x: (index % 10) * 260, y: Math.floor(index / 10) * 230 },
        data: {
          kind: "image",
          label: `Performance ${index}`,
          status: "idle",
          outputImages: [],
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
