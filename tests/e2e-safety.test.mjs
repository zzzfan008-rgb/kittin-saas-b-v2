import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { playwrightArgsFromCli } from "../scripts/e2e-with-postgres.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const playwrightCli = resolve(root, "node_modules/playwright/cli.js");
const productionSmokeScript = readFileSync(resolve(root, "scripts/e2e-production-smoke.mjs"), "utf8");
const dataDir = mkdtempSync(join(tmpdir(), "garment-canvas-e2e-safety-"));
const safeEnv = {
  ...process.env,
  E2E_ISOLATED_RUN: "1",
  NODE_ENV: "test",
  COOKIE_SECURE: "false",
  APIYI_API_KEY: "e2e-disabled",
  APIYI_BASE_URL: "https://127.0.0.1:9",
  E2E_BASE_URL: "http://127.0.0.1:45173",
  E2E_API_URL: "http://127.0.0.1:43001",
  DATABASE_URL: "postgresql://garment_test:garment_test@127.0.0.1:45432/garment_canvas_test",
  DATA_DIR: dataDir,
  E2E_AUTH_STATE_PATH: join(dataDir, "auth.json"),
};

function listTests(overrides = {}, omitted = []) {
  const env = { ...safeEnv, ...overrides };
  for (const key of omitted) delete env[key];
  return spawnSync(process.execPath, [playwrightCli, "test", "--list"], {
    cwd: root,
    env,
    encoding: "utf8",
  });
}

try {
  assert.deepEqual(
    playwrightArgsFromCli(["--skip-build", "--project=performance-baseline", "--grep", "render latency"]),
    ["--project=performance-baseline", "--grep", "render latency"],
    "the E2E wrapper must consume --skip-build without dropping valid Playwright arguments",
  );

  assert.doesNotMatch(
    productionSmokeScript.match(/function runPlaywrightCommand\(env\) \{[\s\S]*?\n\}/)?.[0] ?? "",
    /npm_execpath|\bnpx(?:\.cmd)?\b|\bnpm\s+exec\b/,
    "production smoke must invoke the repository-local Playwright CLI directly",
  );

  const baseline = listTests();
  assert.equal(baseline.status, 0, `${baseline.stdout}\n${baseline.stderr}`);
  assert.match(baseline.stdout, /Total: \d+ tests in 9 files/);
  assert.match(
    baseline.stdout,
    /\[vis-keyboard\].*VIS-07 键盘焦点环.*VIS-05 snapGrid 吸附/,
    "VIS-07/05 keyboard regression must stay in the browser regression matrix",
  );
  // VIS-07/05（本分支）、VIS-01 与 VIS-06（main 侧，PR #54/#55 合入）是三次独立的
  // 矩阵扩充，合并后三条守卫都必须保留：矩阵文件数 6 → 9
  // （vis-keyboard + vis01-shots + vis06-tokens）。
  // 各分支各自把计数改成 7 或 8，git 视为同值/近值容易静默通过，故此处按合并态
  // 真实文件数显式修正为 9，防止守卫漏掉任一批次新增的回归文件。
  assert.match(
    baseline.stdout,
    /\[vis01\].*VIS-01 screenshot matrix/,
    "VIS-01 screenshot matrix must remain in the browser regression matrix",
  );
  assert.match(
    baseline.stdout,
    /\[vis06\].*minimap \/ ordinal badge \/ scrollbar colors trace to tokens/,
    "VIS-06 token trace regression must remain in the browser regression matrix",
  );
  assert.match(
    baseline.stdout,
    /\[golden-path\].*unverified starter stays blocked while a test-reviewed variant completes the isolated golden path/,
    "isolated golden-path project must remain in the browser regression matrix",
  );
  // v7 起 initial-draft 拆成「空态惰性落库」与「重登录恢复」两条用例，
  // 2026-09-25 决策 4 落地时第二条更名为「relogin lands on the empty workspace ...」，
  // 两条都必须留在矩阵里（断言只钉标题，不钉用例内部实现）。
  assert.match(
    baseline.stdout,
    /\[initial-draft\].*empty first screen stays local and only persists after the first substantial change/,
    "initial-draft lazy persistence must remain in the isolated browser regression matrix",
  );
  assert.match(
    baseline.stdout,
    /\[initial-draft\].*relogin lands on the empty workspace without bootstrapping, and the saved project stays reachable/,
    "initial-draft relogin recovery must remain in the isolated browser regression matrix",
  );
  assert.match(
    baseline.stdout,
    /\[performance-baseline\].*capture 100-node desktop render latency and browser memory/,
    "performance baseline must remain isolated from ordinary browser regressions",
  );
  for (const width of [1024, 1280, 1440]) {
    assert.match(
      baseline.stdout,
      new RegExp(`\\[desktop-${width}\\].*node drag is one undo transaction`),
      `desktop-${width} must include the real drag transaction regression`,
    );
    assert.match(
      baseline.stdout,
      new RegExp(`\\[desktop-${width}\\].*floating rail, zoom controls, and the results layer preserve canvas identity`),
      `desktop-${width} must include the stable workbench regression`,
    );
    assert.match(
      baseline.stdout,
      new RegExp(`\\[desktop-${width}\\].*theme picker reports state`),
      `desktop-${width} must include the theme and focus regression`,
    );
  }

  const cases = [
    {
      name: "missing runner marker",
      result: listTests({}, ["E2E_ISOLATED_RUN"]),
      message: /use npm run test:e2e/,
    },
    {
      name: "real AI key",
      result: listTests({ APIYI_API_KEY: "real-key-must-be-rejected" }),
      message: /real AI key must never reach browser regressions/,
    },
    {
      name: "non-loopback API",
      result: listTests({ E2E_API_URL: "https://example.com" }),
      message: /E2E_API_URL must use http:\/\/127\.0\.0\.1/,
    },
    {
      name: "non-test database",
      result: listTests({ DATABASE_URL: "postgresql://user:pass@127.0.0.1:5432/garment_canvas" }),
      message: /DATABASE_URL must target garment_canvas_test/,
    },
    {
      name: "auth state outside temp data",
      result: listTests({ E2E_AUTH_STATE_PATH: resolve(dataDir, "../outside-auth.json") }),
      message: /auth state must live inside the temporary DATA_DIR/,
    },
  ];

  for (const safetyCase of cases) {
    assert.notEqual(safetyCase.result.status, 0, `${safetyCase.name} must fail closed`);
    assert.match(
      `${safetyCase.result.stdout}\n${safetyCase.result.stderr}`,
      safetyCase.message,
      `${safetyCase.name} must report the matching guard`,
    );
  }
} finally {
  rmSync(dataDir, { recursive: true, force: true });
}

console.log("E2E isolation safety test passed");
