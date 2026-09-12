import { nanoid } from "nanoid";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isImageModelId } from "../src/types/imageModels";
import type { AuthUser } from "../server/lib/auth";
import { assertEvaluationCampaignReady } from "../server/lib/evaluationCampaign";
import {
  registerEvaluationRunAuthorization,
  validateEvaluationAuthorizationRegistration,
  type EvaluationAuthorizationRegistration,
} from "../server/lib/evaluationAuthorizationLedger";

interface ParsedAuthorizationCommand {
  dryRun: boolean;
  actorId: string;
  registration: EvaluationAuthorizationRegistration;
}

const VALUE_FLAGS = new Set([
  "authorization-id",
  "admin-id",
  "owner-id",
  "campaign-id",
  "slot-id",
  "model-id",
  "evaluation-unit-key",
  "max-provider-requests",
  "price-minor-per-provider-request",
  "max-budget-minor",
  "currency",
  "expires-at",
  "reason",
]);

function parseFlags(argv: readonly string[]): Map<string, string | true> {
  const flags = new Map<string, string | true>();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new Error(`unexpected argument: ${token}`);
    const [inlineName, inlineValue] = token.slice(2).split("=", 2);
    if (inlineName === "dry-run") {
      if (inlineValue !== undefined) throw new Error("--dry-run does not accept a value");
      if (flags.has("dry-run")) throw new Error("--dry-run was provided more than once");
      flags.set("dry-run", true);
      continue;
    }
    if (!VALUE_FLAGS.has(inlineName)) throw new Error(`unexpected flag: --${inlineName}`);
    if (flags.has(inlineName)) throw new Error(`--${inlineName} was provided more than once`);
    const next = inlineValue ?? argv[++index];
    if (!next || next.startsWith("--")) throw new Error(`--${inlineName} requires a value`);
    flags.set(inlineName, next);
  }
  return flags;
}

function required(flags: Map<string, string | true>, name: string): string {
  const value = flags.get(name);
  if (typeof value !== "string" || !value.trim()) throw new Error(`--${name} is required`);
  return value.trim();
}

function positiveInteger(value: string, name: string): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`--${name} must be a positive integer`);
  return parsed;
}

function expiryTimestamp(value: string): number {
  const numeric = Number(value);
  const parsed = Number.isSafeInteger(numeric) ? numeric : Date.parse(value);
  if (!Number.isSafeInteger(parsed)) throw new Error("--expires-at must be an ISO timestamp or epoch milliseconds");
  return parsed;
}

export function parseEvaluationAuthorizationCliArgs(
  argv: readonly string[],
  now = Date.now(),
): ParsedAuthorizationCommand {
  const flags = parseFlags(argv);
  const actorId = required(flags, "admin-id");
  const modelId = required(flags, "model-id");
  if (!isImageModelId(modelId)) throw new Error("--model-id is not a current product image model");
  const registration: EvaluationAuthorizationRegistration = {
    authorizationId: typeof flags.get("authorization-id") === "string"
      ? String(flags.get("authorization-id"))
      : `eval_${nanoid(20)}`,
    ownerId: required(flags, "owner-id"),
    campaignId: required(flags, "campaign-id"),
    slotId: required(flags, "slot-id"),
    scope: {
      type: "evaluation-unit",
      modelId,
      evaluationUnitKey: required(flags, "evaluation-unit-key") as `sha256:${string}`,
    },
    maxProviderRequests: positiveInteger(required(flags, "max-provider-requests"), "max-provider-requests"),
    priceMinorPerProviderRequest: positiveInteger(
      required(flags, "price-minor-per-provider-request"),
      "price-minor-per-provider-request",
    ),
    budgetLimitMinor: positiveInteger(required(flags, "max-budget-minor"), "max-budget-minor"),
    budgetCurrency: required(flags, "currency").toUpperCase(),
    expiresAt: expiryTimestamp(required(flags, "expires-at")),
    reason: required(flags, "reason"),
  };
  const dryRunActor: AuthUser = {
    id: actorId,
    accountId: actorId,
    displayName: actorId,
    role: "admin",
    mustChangePassword: false,
  };
  validateEvaluationAuthorizationRegistration(dryRunActor, registration, now);
  return { dryRun: flags.get("dry-run") === true, actorId, registration };
}

async function main(): Promise<void> {
  const command = parseEvaluationAuthorizationCliArgs(process.argv.slice(2));
  if (command.dryRun) {
    console.log(JSON.stringify({ dryRun: true, ...command.registration }, null, 2));
    return;
  }
  assertEvaluationCampaignReady();
  // Database code is loaded only after local validation/dry-run. This command
  // never imports a Provider adapter or reads an image API key.
  const database = await import("../server/lib/database");
  try {
    await database.initializeDatabase();
    const actor = await database.queryOne<{
      id: string;
      account_id: string;
      display_name: string;
      role: "admin" | "user";
      must_change_password: number;
    }>(`
      SELECT id, account_id, display_name, role, must_change_password
      FROM users WHERE id = $1 AND active = 1 AND deleted_at IS NULL
    `, [command.actorId]);
    if (!actor || actor.role !== "admin") throw new Error("--admin-id must identify an active persisted admin");
    const authUser: AuthUser = {
      id: actor.id,
      accountId: actor.account_id,
      displayName: actor.display_name,
      role: actor.role,
      mustChangePassword: actor.must_change_password === 1,
    };
    await database.transaction((client) => registerEvaluationRunAuthorization(
      client,
      authUser,
      command.registration,
    ));
    console.log(JSON.stringify({
      created: true,
      authorizationId: command.registration.authorizationId,
      ownerId: command.registration.ownerId,
      campaignId: command.registration.campaignId,
      slotId: command.registration.slotId,
      modelId: command.registration.scope.modelId,
      evaluationUnitKey: command.registration.scope.evaluationUnitKey,
      maxProviderRequests: command.registration.maxProviderRequests,
      priceMinorPerProviderRequest: command.registration.priceMinorPerProviderRequest,
      budgetLimitMinor: command.registration.budgetLimitMinor,
      budgetCurrency: command.registration.budgetCurrency,
      expiresAt: new Date(command.registration.expiresAt).toISOString(),
      reason: command.registration.reason,
    }, null, 2));
  } finally {
    await database.closeDatabaseForTests();
  }
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
