import assert from "node:assert/strict";
import {
  runExecuteCore,
  checkBudgetGates,
  MAX_GLOBAL_BUDGET_MINOR,
  type ExecuteDeps,
  type ExecuteCampaignInfo,
  type ExecuteSlotInfo,
} from "../scripts/evaluation-campaign-runner.js";

// ---------- test helpers ----------

function makeSlot(overrides: Partial<ExecuteSlotInfo> = {}): ExecuteSlotInfo {
  return {
    slotId: "slot-1",
    caseId: "case-1",
    sampleId: "sample-1",
    authorizationId: "auth-1",
    runId: null,
    status: "ready",
    priceMinorPerProviderRequest: 3,
    budgetLimitMinor: 9,
    ...overrides,
  };
}

function makeCampaign(overrides: Partial<ExecuteCampaignInfo> = {}): ExecuteCampaignInfo {
  return {
    campaignId: "campaign-1",
    ownerId: "admin-1",
    status: "ready",
    budgetLimitMinor: 9,
    reservedBudgetMinor: 0,
    budgetCurrency: "USD",
    slots: [
      makeSlot({ slotId: "slot-1", authorizationId: "auth-1" }),
    ],
    ...overrides,
  };
}

type MockDeps = ExecuteDeps & {
  queryOneCalls: Array<{ sql: string; params: unknown[] }>;
  queryCalls: Array<{ sql: string; params: unknown[] }>;
  transactionCalls: number;
  closed: boolean;
  inited: boolean;
  _results: Map<string, unknown>;
  _slotResults: Map<string, unknown[]>;
  _transactionFn?: (client: unknown) => Promise<unknown>;
};

function makeMockPoolClient(overrides: {
  campaignStatus?: string;
  slotStatus?: string;
  slotAuthId?: string;
  slotRunId?: string;
} = {}): unknown {
  const {
    campaignStatus = "ready",
    slotStatus = "ready",
    slotAuthId = "auth-1",
    slotRunId = "run-1",
  } = overrides;
  return {
    query: async (sql: string, _params?: unknown[]) => {
      if (sql.includes("UPDATE evaluation_campaign_slots SET status = 'running'")) {
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes("UPDATE evaluation_campaigns SET reserved_provider_requests")) {
        return { rows: [], rowCount: 1 };
      }
      // lockedCampaignSlot join query
      return {
        rows: [{
          campaign_id: "campaign-1",
          owner_id: "admin-1",
          stage: "provider-probe",
          model_id: "gpt-image-2.5-flare-vip",
          evaluation_unit_key: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
          code_sha: "0".repeat(40),
          max_provider_requests: 8,
          budget_limit_minor: 100,
          budget_currency: "USD",
          campaign_reserved_provider_requests: 0,
          campaign_reserved_budget_minor: 0,
          campaign_status: campaignStatus,
          manifest_sha256: "0".repeat(64),
          closure_sha256: null,
          slot_id: "slot-1",
          slot_campaign_id: "campaign-1",
          case_id: "case-1",
          sample_id: "sample-1",
          resolved_prompt_sha256: "0".repeat(64),
          native_parameters_sha256: "0".repeat(64),
          reference_inputs_sha256: "0".repeat(64),
          requested_image_count: 1,
          slot_max_provider_requests: 8,
          price_minor_per_provider_request: 3,
          slot_budget_limit_minor: 9,
          authorization_id: slotAuthId,
          run_id: slotRunId,
          slot_reserved_provider_requests: 0,
          slot_reserved_budget_minor: 0,
          slot_status: slotStatus,
        }],
        rowCount: 1,
      };
    },
  };
}

function makeMockDeps(envEnabled = true): MockDeps {
  const mock: MockDeps = {
    queryOneCalls: [],
    queryCalls: [],
    transactionCalls: 0,
    closed: false,
    inited: false,
    _results: new Map(),
    _slotResults: new Map(),

    initializeDatabase: async () => {
      mock.inited = true;
    },

    queryOne: async <T>(sql: string, params: unknown[]): Promise<T | undefined> => {
      mock.queryOneCalls.push({ sql, params });
      const key = `${sql.slice(0, 60)}|${JSON.stringify(params)}`;
      return mock._results.get(key) as T | undefined;
    },

    query: async <T>(sql: string, params: unknown[]): Promise<T[]> => {
      mock.queryCalls.push({ sql, params });
      const key = `${sql.slice(0, 60)}|${JSON.stringify(params)}`;
      return (mock._slotResults.get(key) as T[]) ?? [];
    },

    transaction: async <T>(fn: (client: unknown) => Promise<T>): Promise<T> => {
      mock.transactionCalls++;
      mock._transactionFn = fn as (client: unknown) => Promise<unknown>;
      return fn(makeMockPoolClient()) as T;
    },

    closeDatabaseForTests: async () => {
      mock.closed = true;
    },

    env: { ENABLE_PAID_EVALUATION_RUNS: envEnabled ? "true" : undefined },

    // Defaults: submission/polling are overridden per-test by makeLoopMockDeps.
    submitEvaluationRun: async () => {
      throw new Error("submitEvaluationRun not configured");
    },
    getRunStatus: async () => "unknown",
  };
  return mock;
}

// ---------- test (1): ENABLE_PAID_EVALUATION_RUNS not set → fail-closed ----------
{
  const deps = makeMockDeps(false);
  // Override admin check to avoid it being hit first
  process.env.ADMIN_SESSION_USER_ID = "admin-1";

  let error: Error | undefined;
  try {
    await runExecuteCore(deps, "campaign-1", undefined, false);
  } catch (e) {
    error = e as Error;
  }

  assert.ok(error, "expected error when ENABLE_PAID_EVALUATION_RUNS is not 'true'");
  assert.ok(
    (error!.message).includes("ENABLE_PAID_EVALUATION_RUNS"),
    `expected ENABLE_PAID_EVALUATION_RUNS error, got: ${error!.message}`,
  );
  assert.equal(deps.closed, false, "should NOT close DB when prerequisite fails early");

  delete process.env.ADMIN_SESSION_USER_ID;
  console.log("  ✓ test (1): ENABLE_PAID_EVALUATION_RUNS=false → fail-closed, exit code 1");
}

// ---------- test (2): no admin session → fail-closed ----------
{
  const deps = makeMockDeps(true);
  delete process.env.ADMIN_SESSION_USER_ID;

  let error: Error | undefined;
  try {
    await runExecuteCore(deps, "campaign-1", undefined, false);
  } catch (e) {
    error = e as Error;
  }

  assert.ok(error, "expected error when no admin session");
  assert.ok(
    (error!.message).includes("admin session"),
    `expected admin session error, got: ${error!.message}`,
  );

  console.log("  ✓ test (2): no ADMIN_SESSION_USER_ID → fail-closed, exit code 1");
}

// ---------- test (3): admin not found or not admin role → fail-closed ----------
{
  const deps = makeMockDeps(true);
  process.env.ADMIN_SESSION_USER_ID = "not-admin";

  // queryOne returns undefined — user not found
  let error: Error | undefined;
  try {
    await runExecuteCore(deps, "campaign-1", undefined, false);
  } catch (e) {
    error = e as Error;
  }

  assert.ok(error, "expected error when admin not found");
  assert.ok(
    (error!.message).includes("admin session"),
    `expected admin session error, got: ${error!.message}`,
  );

  delete process.env.ADMIN_SESSION_USER_ID;
  console.log("  ✓ test (3): user not found in DB → fail-closed");
}

// ---------- test (4): admin exists but role is not 'admin' → fail-closed ----------
{
  const deps = makeMockDeps(true);
  process.env.ADMIN_SESSION_USER_ID = "user-1";

  // Set up mock to return a non-admin user
  const userKey = deps.queryOneCalls.length === 0 ? "" : "";
  deps._results = new Map();

  async function captureQueryOne(sql: string, params: unknown[]): Promise<unknown> {
    if (sql.includes("FROM users")) {
      return {
        id: "user-1",
        account_id: "acc-1",
        display_name: "Regular User",
        role: "user",
        must_change_password: 0,
      };
    }
    return undefined;
  }
  deps.queryOne = async <T>(sql: string, params: unknown[]): Promise<T | undefined> => {
    deps.queryOneCalls.push({ sql, params });
    return captureQueryOne(sql, params) as T | undefined;
  };

  let error: Error | undefined;
  try {
    await runExecuteCore(deps, "campaign-1", undefined, false);
  } catch (e) {
    error = e as Error;
  }

  assert.ok(error, "expected error when user is not admin");
  assert.ok(
    (error!.message).includes("admin session"),
    `expected admin session error, got: ${error!.message}`,
  );

  delete process.env.ADMIN_SESSION_USER_ID;
  console.log("  ✓ test (4): user exists but role is not admin → fail-closed");
}

// ---------- test (5): campaign budget gate rejection ----------
{
  const campaign = makeCampaign({
    campaignId: "camp-budget-reject",
    budgetLimitMinor: 6,
    reservedBudgetMinor: 5,
    slots: [makeSlot({
      slotId: "slot-exp",
      authorizationId: "auth-exp",
      priceMinorPerProviderRequest: 3,
      budgetLimitMinor: 6,
    })],
  });

  const slot = campaign.slots[0];
  const result = checkBudgetGates(campaign, slot, 0);

  assert.equal(result.passed, false, "budget gate should reject when reserved + price > limit");
  assert.ok(
    result.reason?.includes("exceeded"),
    `expected 'exceeded' in reason, got: ${result.reason}`,
  );
  assert.ok(
    result.reason?.includes("campaign"),
    `expected campaign budget gate rejection, got: ${result.reason}`,
  );

  console.log("  ✓ test (5): campaign budget gate → rejection (reserved 5 + price 3 > limit 6)");
}

// ---------- test (6): global $50 budget gate rejection ----------
{
  const campaign = makeCampaign({
    campaignId: "camp-global-reject",
    budgetLimitMinor: 100,
    reservedBudgetMinor: 0,
    slots: [makeSlot({
      slotId: "slot-global",
      authorizationId: "auth-global",
      priceMinorPerProviderRequest: 3,
    })],
  });

  const slot = campaign.slots[0];
  // Cumulative reserved is 4999 → 4999 + 3 = 5002 > 5000
  const result = checkBudgetGates(campaign, slot, 4999);

  assert.equal(result.passed, false, "global budget gate should reject when cumulative + price > 5000");
  assert.ok(
    result.reason?.includes("global"),
    `expected global budget gate rejection, got: ${result.reason}`,
  );

  console.log("  ✓ test (6): global $50 budget gate → rejection (cumulative 4999 + price 3 > 5000)");
}

// ---------- test (7): both budget gates pass when within limits ----------
{
  const campaign = makeCampaign({
    campaignId: "camp-pass",
    budgetLimitMinor: 100,
    reservedBudgetMinor: 0,
  });
  const slot = makeSlot({
    slotId: "slot-pass",
    authorizationId: "auth-pass",
    priceMinorPerProviderRequest: 3,
  });

  const result = checkBudgetGates(campaign, slot, 10);
  assert.equal(result.passed, true, "budget gate should pass when within limits");
  assert.equal(result.reason, undefined, "no reason when passing");

  console.log("  ✓ test (7): budget gates pass when reserved + price ≤ limits");
}

// ---------- test (8): dry-run produces slot plan with zero writes ----------
{
  const deps = makeMockDeps(true);
  process.env.ADMIN_SESSION_USER_ID = "admin-1";

  // Mock admin user lookup
  const originalQueryOne = deps.queryOne;

  const userRow = {
    id: "admin-1",
    account_id: "acc-1",
    display_name: "Admin",
    role: "admin" as const,
    must_change_password: 0,
  };

  const campaignRow = {
    campaign_id: "campaign-dry",
    owner_id: "admin-1",
    status: "ready",
    budget_limit_minor: 30,
    reserved_budget_minor: 3,
    budget_currency: "USD",
  };

  // Ledger-joined slot rows: slot-dry-1 authorized + ready → executable;
  // slot-dry-2 is already `running` (belongs to an in-flight run — its ledger
  // grant would be `consumed`, so authorization_id is null) → skipped;
  // slot-dry-3 has no active grant → skipped.
  const slotRows = [{
    slot_id: "slot-dry-1",
    case_id: "case-dry-1",
    sample_id: "sample-dry-1",
    authorization_id: "auth-dry-1",
    run_id: null as string | null,
    status: "ready",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }, {
    slot_id: "slot-dry-2",
    case_id: "case-dry-2",
    sample_id: "sample-dry-2",
    authorization_id: null,
    run_id: "run-dry-2",
    status: "running",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }, {
    slot_id: "slot-dry-3",
    case_id: "case-dry-3",
    sample_id: "case-dry-3",
    authorization_id: null,
    run_id: null,
    status: "ready",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }];

  const globalRow = { total: 6 };

  let capturedOutput = "";
  const originalLog = console.log;
  console.log = (msg: string) => { capturedOutput += msg + "\n"; };

  try {
    deps.queryOne = async <T>(sql: string, params: unknown[]): Promise<T | undefined> => {
      deps.queryOneCalls.push({ sql, params });
      if (sql.includes("FROM users")) return userRow as unknown as T;
      if (sql.includes("FROM evaluation_campaigns WHERE campaign_id")) {
        // Distinguish campaign lookup from global sum
        if (params.length === 1 && params[0] === "campaign-dry") return campaignRow as unknown as T;
      }
      if (sql.includes("COALESCE(SUM")) return globalRow as unknown as T;
      return undefined;
    };

    deps.query = async <T>(sql: string, params: unknown[]): Promise<T[]> => {
      deps.queryCalls.push({ sql, params });
      return slotRows as unknown as T[];
    };

    await runExecuteCore(deps, "campaign-dry", undefined, true);

    const output = JSON.parse(capturedOutput.trim());
    assert.equal(output.dryRun, true);
    assert.equal(output.campaignId, "campaign-dry");
    // Only the authorized + ready slot is executable
    assert.equal(output.executableSlots, 1);
    assert.equal(output.slots.length, 1);
    assert.equal(output.slots[0].slotId, "slot-dry-1");
    assert.equal(output.slots[0].wouldExecute, true);

    // Verify zero writes: no transaction calls
    assert.equal(deps.transactionCalls, 0, "dry-run should make zero DB writes");

    // Verify closeDatabaseForTests was called
    assert.equal(deps.closed, true, "should close DB after dry-run");

  } finally {
    console.log = originalLog;
    delete process.env.ADMIN_SESSION_USER_ID;
  }

  console.log("  ✓ test (8): dry-run prints slot plan with budget checks, zero DB writes");
}

// ---------- shared mock deps for execution-loop tests ----------

interface LoopMockDeps extends MockDeps {
  submitCalls: Array<{ slotId: string; authorizationId: string | null }>;
  submitResults: Array<{ ok: true; runId: string } | { ok: false; message: string }>;
  getRunStatusCalls: string[];
  runStatuses: string[];
}

function makeLoopMockDeps(options: {
  campaignStatuses: string[];
  slotRowsByQuery: unknown[][];
  submitResults: Array<{ ok: true; runId: string } | { ok: false; message: string }>;
  runStatuses?: string[];
}): LoopMockDeps {
  const deps = makeMockDeps(true) as LoopMockDeps;
  deps.submitCalls = [];
  deps.submitResults = options.submitResults;
  deps.getRunStatusCalls = [];
  deps.runStatuses = options.runStatuses ?? [];

  const userRow = {
    id: "admin-1",
    account_id: "acc-1",
    display_name: "Admin",
    role: "admin" as const,
    must_change_password: 0,
  };
  const globalRow = { total: 0 };

  let campaignQueryCount = 0;
  deps.queryOne = async <T>(sql: string, params: unknown[]): Promise<T | undefined> => {
    deps.queryOneCalls.push({ sql, params });
    if (sql.includes("FROM users")) return userRow as unknown as T;
    if (sql.includes("COALESCE(SUM")) return globalRow as unknown as T;
    if (sql.includes("FROM evaluation_campaigns WHERE campaign_id")) {
      const status = options.campaignStatuses[
        Math.min(campaignQueryCount, options.campaignStatuses.length - 1)
      ];
      campaignQueryCount++;
      return {
        campaign_id: params[0],
        owner_id: "admin-1",
        status,
        budget_limit_minor: 100,
        reserved_budget_minor: 0,
        budget_currency: "USD",
      } as unknown as T;
    }
    return undefined;
  };

  let slotQueryCount = 0;
  deps.query = async <T>(sql: string, params: unknown[]): Promise<T[]> => {
    deps.queryCalls.push({ sql, params });
    const rows = options.slotRowsByQuery[
      Math.min(slotQueryCount, options.slotRowsByQuery.length - 1)
    ];
    slotQueryCount++;
    return rows as unknown as T[];
  };

  deps.submitEvaluationRun = async (input) => {
    deps.submitCalls.push({
      slotId: input.slot.slotId,
      authorizationId: input.slot.authorizationId,
    });
    const result = deps.submitResults[deps.submitCalls.length - 1];
    if (!result || !result.ok) {
      throw new Error(result?.message ?? "submitEvaluationRun mock exhausted");
    }
    return { runId: result.runId };
  };
  deps.getRunStatus = async (runId) => {
    deps.getRunStatusCalls.push(runId);
    return deps.runStatuses[deps.getRunStatusCalls.length - 1] ?? "unknown";
  };
  // Near-zero polling so tests stay fast
  deps.pollIntervalMs = 1;
  deps.maxPolls = 10;
  return deps;
}

// ---------- test (9): abort semantics — campaign stopped during slot execution ----------
{
  process.env.ADMIN_SESSION_USER_ID = "admin-1";

  const readySlotRows = [{
    slot_id: "slot-abort-1",
    case_id: "case-abort-1",
    sample_id: "sample-abort-1",
    authorization_id: "auth-abort-1",
    run_id: null,
    status: "ready",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }, {
    slot_id: "slot-abort-2",
    case_id: "case-abort-2",
    sample_id: "sample-abort-2",
    authorization_id: "auth-abort-2",
    run_id: null,
    status: "ready",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }];

  const capturedStderr: string[] = [];
  const originalError = console.error;
  const originalLog = console.log;
  console.error = (msg: string) => { capturedStderr.push(msg); };
  console.log = () => {};

  try {
    // Sequence of campaign loads: initial load (ready) → in-loop pre-submit
    // recheck (ready) → first poll refresh (stopped, simulating a prior
    // failure finalizing the campaign). Slot 1 is submitted; the stopped
    // campaign aborts before slot 2.
    const deps = makeLoopMockDeps({
      campaignStatuses: ["ready", "ready", "stopped"],
      slotRowsByQuery: [readySlotRows],
      submitResults: [{ ok: true, runId: "run-abort-1" }],
      runStatuses: ["running"],
    });

    await runExecuteCore(deps, "campaign-abort", undefined, false);

    // Slot 1 was submitted; the stopped campaign aborts before slot 2.
    assert.equal(deps.submitCalls.length, 1, "only the first slot should be submitted before abort");
    assert.equal(deps.submitCalls[0].slotId, "slot-abort-1");
    assert.equal(process.exitCode, 1, "exit code should be non-zero on abort");

    const stderr = capturedStderr.join("");
    assert.ok(
      stderr.includes("aborted") || stderr.includes("stopped"),
      `expected abort message in stderr, got: ${stderr}`,
    );

  } finally {
    console.error = originalError;
    console.log = originalLog;
    process.exitCode = 0;
    delete process.env.ADMIN_SESSION_USER_ID;
  }

  console.log("  ✓ test (9): abort semantics — campaign stopped during slot execution triggers abort");
}

// ---------- test (10): slot outcome ≠ succeeded → abort ----------
{
  process.env.ADMIN_SESSION_USER_ID = "admin-1";

  const readySlotRows = [{
    slot_id: "slot-fail-1",
    case_id: "case-fail-1",
    sample_id: "sample-fail-1",
    authorization_id: "auth-fail-1",
    run_id: null,
    status: "ready",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }];

  const failedSlotRows = [{
    ...readySlotRows[0],
    run_id: "run-fail-1",
    status: "failed",
  }];

  const capturedStderr: string[] = [];
  const originalError = console.error;
  const originalLog = console.log;
  console.error = (msg: string) => { capturedStderr.push(msg); };
  console.log = () => {};

  try {
    // Campaign stays ready (finalize happens in the worker transaction; the
    // runner observes the terminal slot status first). First slot query loads
    // the ready slot; polling refreshes see it as failed.
    const deps = makeLoopMockDeps({
      campaignStatuses: ["ready"],
      slotRowsByQuery: [readySlotRows, failedSlotRows],
      submitResults: [{ ok: true, runId: "run-fail-1" }],
      runStatuses: ["error"],
    });

    await runExecuteCore(deps, "campaign-outcome", undefined, false);

    assert.equal(deps.submitCalls.length, 1, "the failed slot should be submitted exactly once");
    assert.equal(process.exitCode, 1, "exit code should be non-zero on failed slot outcome");
    const stderr = capturedStderr.join("");
    assert.ok(
      stderr.includes("failed") || stderr.includes("stopped"),
      `expected failure message in stderr, got: ${stderr}`,
    );

  } finally {
    console.error = originalError;
    console.log = originalLog;
    process.exitCode = 0;
    delete process.env.ADMIN_SESSION_USER_ID;
  }

  console.log("  ✓ test (10): slot outcome=failed → abort with non-zero exit");
}

// ---------- test (11): submit failure (non-202, non-409) → error propagates, no polling ----------
{
  process.env.ADMIN_SESSION_USER_ID = "admin-1";

  const readySlotRows = [{
    slot_id: "slot-submit-fail",
    case_id: "case-submit-fail",
    sample_id: "sample-submit-fail",
    authorization_id: "auth-submit-fail",
    run_id: null,
    status: "ready",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }];

  const originalLog = console.log;
  console.log = () => {};

  try {
    const deps = makeLoopMockDeps({
      campaignStatuses: ["ready"],
      slotRowsByQuery: [readySlotRows],
      submitResults: [{ ok: false, message: "POST /api/run-plan failed with HTTP 400" }],
    });

    let error: Error | undefined;
    try {
      await runExecuteCore(deps, "campaign-submit-fail", undefined, false);
    } catch (e) {
      error = e as Error;
    }

    assert.ok(error, "submit failure must propagate");
    assert.ok(
      error!.message.includes("400"),
      `expected HTTP failure detail, got: ${error!.message}`,
    );
    assert.equal(deps.getRunStatusCalls.length, 0, "no polling after submit failure");

  } finally {
    console.log = originalLog;
    delete process.env.ADMIN_SESSION_USER_ID;
  }

  console.log("  ✓ test (11): submit failure propagates with no polling");
}

// ---------- test (11b): submit HTTP 409 → slot-level terminal report, no raw crash ----------
// Ruling (b): deterministic clientRequestId (= slotId) means a re-submit of the
// same slot is rejected with 409 (unique index / case conflict / active-run
// limit). The runner must classify it as a terminal slot outcome with a clear
// reason — a bare unique-violation must never crash the caller.
{
  process.env.ADMIN_SESSION_USER_ID = "admin-1";

  const readySlotRows = [{
    slot_id: "slot-dup-1",
    case_id: "case-dup-1",
    sample_id: "sample-dup-1",
    authorization_id: "auth-dup-1",
    run_id: null,
    status: "ready",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }];

  const capturedStderr: string[] = [];
  const originalError = console.error;
  const originalLog = console.log;
  console.error = (msg: string) => { capturedStderr.push(msg); };
  console.log = () => {};

  try {
    const deps = makeLoopMockDeps({
      campaignStatuses: ["ready"],
      slotRowsByQuery: [readySlotRows],
      submitResults: [{ ok: false, message: "POST /api/run-plan for slot slot-dup-1 failed with HTTP 409: duplicate key value violates unique constraint" }],
    });

    let thrown: unknown;
    try {
      await runExecuteCore(deps, "campaign-dup", undefined, false);
    } catch (e) {
      thrown = e;
    }

    assert.equal(thrown, undefined, "409 duplicate must NOT throw to the caller");
    assert.equal(process.exitCode, 1, "409 duplicate sets non-zero exit code");
    assert.equal(deps.getRunStatusCalls.length, 0, "no polling after 409");

    const report = capturedStderr.join("\n");
    assert.ok(report.includes('"status":"terminal_failure"'), `expected terminal_failure report, got: ${report}`);
    assert.ok(report.includes('"outcome":"failed"'), "expected outcome failed");
    assert.ok(report.includes("slot_already_submitted_or_conflict"), "expected clear duplicate reason");
    assert.ok(report.includes("slot-dup-1"), "report must name the slot");

  } finally {
    console.error = originalError;
    console.log = originalLog;
    process.exitCode = 0;
    delete process.env.ADMIN_SESSION_USER_ID;
  }

  console.log("  ✓ test (11b): submit HTTP 409 → terminal_failure report, no raw crash");
}

// ---------- test (12): success path — slot reaches succeeded, loop completes ----------
{
  process.env.ADMIN_SESSION_USER_ID = "admin-1";

  const readySlotRows = [{
    slot_id: "slot-ok-1",
    case_id: "case-ok-1",
    sample_id: "sample-ok-1",
    authorization_id: "auth-ok-1",
    run_id: null,
    status: "ready",
    price_minor_per_provider_request: 3,
    budget_limit_minor: 9,
  }];

  const succeededSlotRows = [{
    ...readySlotRows[0],
    run_id: "run-ok-1",
    status: "succeeded",
  }];

  let capturedOutput = "";
  const originalLog = console.log;
  console.log = (msg: string) => { capturedOutput += msg + "\n"; };

  try {
    const deps = makeLoopMockDeps({
      campaignStatuses: ["ready"],
      slotRowsByQuery: [readySlotRows, succeededSlotRows],
      submitResults: [{ ok: true, runId: "run-ok-1" }],
      runStatuses: ["running", "success"],
    });

    await runExecuteCore(deps, "campaign-ok", undefined, false);

    assert.equal(deps.submitCalls.length, 1);
    assert.ok(!process.exitCode, "no non-zero exit on success");
    assert.ok(
      capturedOutput.includes('"executed": true') || capturedOutput.includes("all slots executed"),
      `expected success summary, got: ${capturedOutput}`,
    );

  } finally {
    console.log = originalLog;
    process.exitCode = 0;
    delete process.env.ADMIN_SESSION_USER_ID;
  }

  console.log("  ✓ test (12): success path — submitted slot reaches succeeded and loop completes");
}

// ---------- clientRequestId format tests ----------

// Test 13: All real slotIds produce valid clientRequestIds
{
  const { CLIENT_REQUEST_ID_PATTERN } = await import("../server/engine/runQueue/types.js");
  const { loadManifest, generateCampaignPlans } = await import("../scripts/evaluation-campaign-runner.js");

  const manifest = loadManifest("docs/ai/evaluation/evaluation-manifest-v1.json");
  const filtered = manifest.baseUnits.filter(
    (u) =>
      u.promptVariantId === "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1" ||
      u.promptVariantId === "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
  );
  const caps = manifest.stageRequestCaps as Array<{
    stageId: string;
    incrementalSamples: number;
    maxProviderRequestsPerSample: number;
  }>;
  // Prefix "v8rel6" matches the real sealed campaign prefix so slotId lengths match real v8rel6 data.
  const plans = generateCampaignPlans(filtered, caps, "v8rel6", "gpt-image-2.5-flare-vip");

  const slotIds: string[] = [];

  for (const plan of plans) {
    for (const slot of plan.slots) {
      const cid = slot.slotId;
      slotIds.push(cid);
      assert.ok(
        CLIENT_REQUEST_ID_PATTERN.test(cid),
        `clientRequestId "${cid}" fails CLIENT_REQUEST_ID_PATTERN`,
      );
      assert.ok(
        cid.length <= 128,
        `clientRequestId "${cid}" length ${cid.length} > 128`,
      );
    }
  }

  assert.ok(slotIds.length > 0, "expected at least one slot");
  const maxLen = Math.max(...slotIds.map((s) => s.length));
  const minLen = Math.min(...slotIds.map((s) => s.length));
  assert.ok(minLen >= 10, `unexpectedly short: ${minLen}`);
  assert.ok(maxLen <= 128, `longest clientRequestId ${maxLen} > 128`);

  console.log(`  ✓ test (13): all ${slotIds.length} slotIds produce valid clientRequestIds (len ${minLen}-${maxLen})`);
}

// Test 14: mutation — old format (with campaignId + runSequence) fails (length > 128)
{
  const { CLIENT_REQUEST_ID_PATTERN } = await import("../server/engine/runQueue/types.js");
  const { loadManifest, generateCampaignPlans } = await import("../scripts/evaluation-campaign-runner.js");

  const manifest = loadManifest("docs/ai/evaluation/evaluation-manifest-v1.json");
  const filtered = manifest.baseUnits.filter(
    (u) =>
      u.promptVariantId === "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1" ||
      u.promptVariantId === "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1",
  );
  const caps = manifest.stageRequestCaps as Array<{
    stageId: string;
    incrementalSamples: number;
    maxProviderRequestsPerSample: number;
  }>;
  const plans = generateCampaignPlans(filtered, caps, "test-old", "gpt-image-2.5-flare-vip");

  const oldClientRequestIds: string[] = [];
  for (const plan of plans) {
    for (const slot of plan.slots) {
      const old = `eval-${plan.campaignId}-${slot.slotId}-1`;
      oldClientRequestIds.push(old);
    }
  }

  let failures = 0;
  for (const old of oldClientRequestIds) {
    if (!CLIENT_REQUEST_ID_PATTERN.test(old) || old.length > 128) {
      failures += 1;
    }
  }

  assert.equal(
    failures,
    oldClientRequestIds.length,
    `expected ALL ${oldClientRequestIds.length} old-format IDs to fail, got ${failures} failures`,
  );

  console.log(`  ✓ test (14): old format clientRequestId rejected — all ${oldClientRequestIds.length} fail`);
}

console.log("campaign-runner-execute tests passed");