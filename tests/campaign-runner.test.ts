import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const RUNNER = resolve(REPO_ROOT, "scripts/evaluation-campaign-runner.ts");
const TSX_CLI = resolve(REPO_ROOT, "node_modules/tsx/dist/cli.mjs");

const GENERATE = "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1";
const EDIT = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";

function run(
  args: string[],
  extraEnv?: Record<string, string>,
): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(process.execPath, [TSX_CLI, RUNNER, ...args], {
    encoding: "utf8",
    timeout: 30_000,
    env: { ...process.env, ...extraEnv },
  });
  return {
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
    status: result.status,
  };
}

function assertExit(result: { stdout: string; stderr: string; status: number | null }, expected: number): void {
  assert.equal(
    result.status,
    expected,
    `expected exit ${expected}, got ${result.status}: ${result.stderr}`,
  );
}

function commonSealArgs(): string[] {
  return [
    "seal",
    "--dry-run",
    "--admin-id=test-admin",
    "--campaign-id=regression",
    "--model-id=gpt-image-2.5-flare-vip",
    "--code-sha=" + "c".repeat(40),
    "--max-provider-requests=1",
    "--budget-limit-minor=5000",
    "--currency=USD",
  ];
}

// ---------- test (a): 2 valid variants → 2 units, 6 campaigns, Σbudget ≤ 5000 ----------
{
  const result = run([
    ...commonSealArgs(),
    "--variant-id=" + GENERATE,
    "--variant-id=" + EDIT,
  ]);

  assertExit(result, 0);
  const output = JSON.parse(result.stdout) as Record<string, unknown>;
  assert.equal(output.dryRun, true);
  assert.equal(output.campaigns, 6, "expected 6 campaigns (2 units × 3 stages)");
  assert.equal(output.slots, 66, "expected 66 slots (2 units × (1+8+24))");
  assert.equal(output.currency, "USD");
  assert.equal(output.priceMinorPerRequest, 3);

  const budget = output.totalBudgetMinor as number;
  assert.ok(budget > 0 && budget <= 5000, `budget ${budget} must be 0 < x ≤ 5000`);

  const plans = output.campaigns_plan as Array<Record<string, unknown>>;
  assert.equal(plans.length, 6);
  for (const plan of plans) {
    assert.ok(typeof plan.campaignId === "string" && (plan.campaignId as string).length > 0);
    assert.ok(["provider-probe", "internal-experiment", "formal-validation"].includes(plan.stage as string));
    assert.ok(typeof plan.slots === "number" && (plan.slots as number) > 0);
    assert.ok(typeof plan.budgetLimitMinor === "number" && (plan.budgetLimitMinor as number) > 0);
  }

  console.log("  ✓ test (a): 2 valid variants → 6 campaigns, 66 slots, Σbudget=198 ≤ 5000");
}

// ---------- test (b): variant outside allowed scope → rejection ----------
{
  const result = run([
    ...commonSealArgs(),
    "--variant-id=commerce-hero.flux-2-pro.generate.v1",
  ]);

  assert.notEqual(result.status, 0, "expected non-zero exit for out-of-scope variant");
  const msg = (result.stderr + result.stdout).toLowerCase();
  assert.ok(
    msg.includes("expected exactly 2"),
    `expected "expected exactly 2" for single out-of-scope variant, got: ${result.stderr}`,
  );

  console.log("  ✓ test (b): variant outside allowed scope → rejection (non-zero exit)");
}

// ---------- test (c): 0 filtered units → rejection ----------
{
  const result = run([
    ...commonSealArgs(),
    "--variant-id=nonexistent.variant.generate.v1",
  ]);

  assert.notEqual(result.status, 0, "expected non-zero exit for 0 matching units");
  const msg = (result.stderr + result.stdout).toLowerCase();
  assert.ok(
    msg.includes("expected exactly 2") || msg.includes("0 filtered"),
    `expected "expected exactly 2" rejection, got: ${result.stderr}`,
  );

  console.log("  ✓ test (c): 0 filtered units → rejection");
}

// ---------- test (c-extra): >2 filtered units → rejection ----------
{
  const result = run([
    ...commonSealArgs(),
    "--variant-id=" + GENERATE,
    "--variant-id=" + EDIT,
    "--variant-id=commerce-hero.gpt-image-2.5-flare-vip.generate.v1",
  ]);

  assert.notEqual(result.status, 0, "expected non-zero exit for >2 units");
  const msg = (result.stderr + result.stdout).toLowerCase();
  assert.ok(
    msg.includes("expected exactly 2"),
    `expected "expected exactly 2" for 3 units, got: ${result.stderr}`,
  );

  console.log("  ✓ test (c-extra): >2 filtered units → rejection");
}

// ---------- test (d): Σbudget > 5000 → rejection (high pricing trigger) ----------
{
  // With EVAL_TEST_PRICE_MINOR_OVERRIDE=100, each request costs 100 minor.
  // 66 requests × 100 = 6600 > 5000 → rejection.
  const result = run(
    [
      ...commonSealArgs(),
      "--variant-id=" + GENERATE,
      "--variant-id=" + EDIT,
    ],
    { EVAL_TEST_PRICE_MINOR_OVERRIDE: "100" },
  );

  assert.notEqual(result.status, 0, "expected non-zero exit for budget overrun");
  const msg = (result.stderr + result.stdout).toLowerCase();
  assert.ok(
    msg.includes("total budget") || msg.includes("exceeds cap") || msg.includes("5000"),
    `expected budget cap rejection, got: ${result.stderr}`,
  );

  console.log("  ✓ test (d): Σbudget=6600 > 5000 → rejection (high pricing trigger)");
}

console.log("evaluation campaign runner tests passed");