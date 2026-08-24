import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const playwrightCli = resolve(root, "node_modules/playwright/cli.js");
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
  const baseline = listTests();
  assert.equal(baseline.status, 0, `${baseline.stdout}\n${baseline.stderr}`);
  assert.match(baseline.stdout, /Total: 8 tests/);

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
