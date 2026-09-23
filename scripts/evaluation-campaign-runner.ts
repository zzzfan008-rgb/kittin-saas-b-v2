#!/usr/bin/env -S npx tsx

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AuthUser } from "../server/lib/auth";
import { createSealedEvaluationCampaign } from "../server/lib/evaluationCampaign";
import type { EvaluationCampaignManifest } from "../server/lib/evaluationCampaign";
import type { ImageModelId } from "../src/types/imageModels";
import { builtinTemplates } from "../server/routes/templates";

// ---------- constants ----------

const ROOT_DIR = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEFAULT_MANIFEST_PATH = resolve(
  ROOT_DIR,
  "docs/ai/evaluation/evaluation-manifest-v1.json",
);

const GENERATE_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1";
const EDIT_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";
const VIDEO_VARIANT = "video-animate.doubao-seedance-2-5-260628.edit.v1";

const ALLOWED_IMAGE_VARIANTS = new Set([GENERATE_VARIANT, EDIT_VARIANT]);

const PRICE_MINOR_PER_PROVIDER_REQUEST =
  (() => {
    const override = process.env.EVAL_TEST_PRICE_MINOR_OVERRIDE;
    if (override !== undefined) {
      const parsed = Number(override);
      if (Number.isSafeInteger(parsed) && parsed > 0) return parsed;
    }
    return 3; // $0.03 USD = 3 minor cents
  })();
const MAX_TOTAL_BUDGET_MINOR = 5000;

const STAGES = [
  "provider-probe",
  "internal-experiment",
  "formal-validation",
] as const;
type Stage = (typeof STAGES)[number];

interface StageRequestCap {
  stageId: Stage;
  incrementalSamples: number;
  maxProviderRequestsPerSample: number;
}

interface ManifestUnit {
  unitId: string;
  promptVariantId: string;
}

interface LoadedManifest {
  baseUnits: ManifestUnit[];
  stageRequestCaps: StageRequestCap[];
}

// ---------- CLI flag parsing ----------

const VALUE_FLAGS_SEAL = new Set([
  "admin-id",
  "campaign-id",
  "model-id",
  "code-sha",
  "max-provider-requests",
  "budget-limit-minor",
  "currency",
]);

const VALUE_FLAGS_EXECUTE = new Set(["campaign-id", "slot-id"]);

function parseFlags(argv: string[]): {
  subcommand: string;
  flags: Map<string, string | true>;
  variantIds: string[];
} {
  if (argv.length < 1) throw new Error("subcommand required: seal or execute");
  const subcommand = argv[0];
  if (subcommand !== "seal" && subcommand !== "execute") {
    throw new Error(`unknown subcommand: ${subcommand}. Expected seal or execute`);
  }

  const flags = new Map<string, string | true>();
  const variantIds: string[] = [];
  const valueFlags =
    subcommand === "seal" ? VALUE_FLAGS_SEAL : VALUE_FLAGS_EXECUTE;
  let i = 1;

  while (i < argv.length) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      throw new Error(`unexpected argument: ${token}`);
    }

    const eqIdx = token.indexOf("=");
    const inlineName =
      eqIdx >= 0 ? token.slice(2, eqIdx) : token.slice(2);
    const inlineValue = eqIdx >= 0 ? token.slice(eqIdx + 1) : undefined;

    if (inlineName === "dry-run") {
      if (inlineValue !== undefined) {
        throw new Error("--dry-run does not accept a value");
      }
      if (flags.has("dry-run")) {
        throw new Error("--dry-run was provided more than once");
      }
      flags.set("dry-run", true);
      i++;
      continue;
    }

    if (subcommand === "seal" && inlineName === "variant-id") {
      const val = inlineValue ?? argv[++i];
      if (!val || val.startsWith("--")) {
        throw new Error("--variant-id requires a value");
      }
      variantIds.push(val);
      i++;
      continue;
    }

    if (!valueFlags.has(inlineName)) {
      throw new Error(`unexpected flag: --${inlineName}`);
    }
    if (flags.has(inlineName)) {
      throw new Error(`--${inlineName} was provided more than once`);
    }
    const val = inlineValue ?? argv[++i];
    if (!val || val.startsWith("--")) {
      throw new Error(`--${inlineName} requires a value`);
    }
    flags.set(inlineName, val);
    i++;
  }

  return { subcommand, flags, variantIds };
}

function requiredFlag(
  flags: Map<string, string | true>,
  name: string,
): string {
  const value = flags.get(name);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`--${name} is required`);
  }
  return value.trim();
}

function isDryRun(flags: Map<string, string | true>): boolean {
  return flags.get("dry-run") === true;
}

function positiveInteger(value: string, name: string): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`--${name} must be a positive integer`);
  }
  return parsed;
}

// ---------- manifest loading ----------

function loadManifest(path: string): LoadedManifest {
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw) as Record<string, unknown>;

  if (!Array.isArray(data.baseUnits)) {
    throw new Error("manifest is missing baseUnits array");
  }
  if (!Array.isArray(data.stageRequestCaps)) {
    throw new Error("manifest is missing stageRequestCaps array");
  }

  const baseUnits: ManifestUnit[] = (
    data.baseUnits as Array<Record<string, unknown>>
  ).map((entry) => {
    const unit = entry.unit as Record<string, unknown> | undefined;
    return {
      unitId: String(entry.unitId ?? ""),
      promptVariantId: String(unit?.promptVariantId ?? ""),
    };
  });

  const stageRequestCaps: StageRequestCap[] = (
    data.stageRequestCaps as Array<Record<string, unknown>>
  )
    .filter((cap) => STAGES.includes(cap.stageId as Stage))
    .map((cap) => ({
      stageId: cap.stageId as Stage,
      incrementalSamples: Number(cap.incrementalSamples ?? 0),
      maxProviderRequestsPerSample: Number(cap.maxProviderRequestsPerSample ?? 0),
    }));

  return { baseUnits, stageRequestCaps };
}

// ---------- variant assertion ----------

function collectTemplateVariantIds(): Map<string, string[]> {
  const templates = builtinTemplates();
  const collected = new Map<string, string[]>();

  for (const template of templates) {
    const variantIds: string[] = [];
    for (const node of template.flow.nodes) {
      const data = node.data as Record<string, unknown> | undefined;
      const variantId = data?.promptVariantId;
      if (typeof variantId === "string" && variantId.trim()) {
        variantIds.push(variantId);
      }
    }
    if (variantIds.length > 0) {
      collected.set(template.id, variantIds);
    }
  }

  return collected;
}

function assertAllTemplateVariantsInScope(): void {
  const collected = collectTemplateVariantIds();
  const outOfScope: string[] = [];

  for (const [, variantIds] of collected) {
    for (const variantId of variantIds) {
      if (variantId === VIDEO_VARIANT) {
        // known out-of-scope, not a rejection
        continue;
      }
      if (!ALLOWED_IMAGE_VARIANTS.has(variantId)) {
        outOfScope.push(variantId);
      }
    }
  }

  if (outOfScope.length > 0) {
    throw new Error(
      `template variants outside allowed scope: ${outOfScope.join(", ")}. ` +
        `Allowed: ${GENERATE_VARIANT}, ${EDIT_VARIANT}`,
    );
  }
}

// ---------- unit filtering and enumeration assertion ----------

function filterAndAssertUnits(
  units: ManifestUnit[],
  variantIds: string[],
): ManifestUnit[] {
  const variantSet = new Set(variantIds);
  const filtered = units.filter((u) => variantSet.has(u.promptVariantId));

  if (filtered.length !== 2) {
    throw new Error(
      `expected exactly 2 filtered units, got ${filtered.length}. ` +
        `Filtered by variant-ids: ${variantIds.join(", ")}`,
    );
  }

  for (const unit of filtered) {
    if (unit.unitId !== unit.promptVariantId) {
      throw new Error(
        `unitId "${unit.unitId}" must equal promptVariantId "${unit.promptVariantId}"`,
      );
    }
  }

  return filtered;
}

// ---------- slot plan generation ----------

interface SlotPlan {
  slotId: string;
  unitId: string;
  stage: Stage;
  sampleIndex: number;
}

interface CampaignPlan {
  campaignId: string;
  stage: Stage;
  modelId: string;
  variantId: string;
  unitId: string;
  slots: SlotPlan[];
  budgetLimitMinor: number;
}

function generateCampaignPlans(
  units: ManifestUnit[],
  caps: StageRequestCap[],
  campaignIdPrefix: string,
  modelId: string,
): CampaignPlan[] {
  const plans: CampaignPlan[] = [];

  for (const unit of units) {
    for (const cap of caps) {
      const campaignId = `${campaignIdPrefix}-${unit.unitId}-${cap.stageId}`;
      const slots: SlotPlan[] = [];
      const sampleCount = cap.incrementalSamples * cap.maxProviderRequestsPerSample;

      for (let sampleIdx = 0; sampleIdx < cap.incrementalSamples; sampleIdx++) {
        const slotId = `${campaignId}-sample-${sampleIdx + 1}`;
        slots.push({
          slotId,
          unitId: unit.unitId,
          stage: cap.stageId,
          sampleIndex: sampleIdx + 1,
        });
      }

      const budgetLimitMinor = sampleCount * PRICE_MINOR_PER_PROVIDER_REQUEST;

      plans.push({
        campaignId,
        stage: cap.stageId,
        modelId,
        variantId: unit.promptVariantId,
        unitId: unit.unitId,
        slots,
        budgetLimitMinor,
      });
    }
  }

  return plans;
}

// ---------- budget gate ----------

function assertBudgetGate(plans: CampaignPlan[]): void {
  const total = plans.reduce((sum, plan) => sum + plan.budgetLimitMinor, 0);

  for (const plan of plans) {
    if (plan.budgetLimitMinor <= 0) {
      throw new Error(
        `campaign ${plan.campaignId} has non-positive budget: ${plan.budgetLimitMinor}`,
      );
    }
  }

  if (total > MAX_TOTAL_BUDGET_MINOR) {
    throw new Error(
      `total budget ${total} minor exceeds cap ${MAX_TOTAL_BUDGET_MINOR}. ` +
        `${plans.length} campaigns would be sealed`,
    );
  }
}

// ---------- dry-run report ----------

function dryRunReport(plans: CampaignPlan[]): void {
  const totalBudget = plans.reduce((sum, p) => sum + p.budgetLimitMinor, 0);
  const totalSlots = plans.reduce((sum, p) => sum + p.slots.length, 0);

  console.log(
    JSON.stringify(
      {
        dryRun: true,
        campaigns: plans.length,
        slots: totalSlots,
        totalBudgetMinor: totalBudget,
        currency: "USD",
        priceMinorPerRequest: PRICE_MINOR_PER_PROVIDER_REQUEST,
        campaigns_plan: plans.map((p) => ({
          campaignId: p.campaignId,
          stage: p.stage,
          modelId: p.modelId,
          unitId: p.unitId,
          variantId: p.variantId,
          slots: p.slots.length,
          budgetLimitMinor: p.budgetLimitMinor,
        })),
      },
      null,
      2,
    ),
  );
}

// ---------- seal execution ----------

async function sealCampaigns(
  plans: CampaignPlan[],
  adminId: string,
  codeSha: string,
  maxProviderRequests: number,
  budgetCurrency: string,
): Promise<void> {
  const database = await import("../server/lib/database");
  try {
    await database.initializeDatabase();

    const actor = await database.queryOne<{
      id: string;
      account_id: string;
      display_name: string;
      role: "admin" | "user";
      must_change_password: number;
    }>(
      `SELECT id, account_id, display_name, role, must_change_password
       FROM users WHERE id = $1 AND active = 1 AND deleted_at IS NULL`,
      [adminId],
    );

    if (!actor || actor.role !== "admin") {
      throw new Error("--admin-id must identify an active persisted admin");
    }

    const authUser: AuthUser = {
      id: actor.id,
      accountId: actor.account_id,
      displayName: actor.display_name,
      role: actor.role,
      mustChangePassword: actor.must_change_password === 1,
    };

    for (const plan of plans) {
      const manifest: EvaluationCampaignManifest = {
        campaignId: plan.campaignId,
        ownerId: adminId,
        stage: plan.stage,
        modelId: plan.modelId as ImageModelId,
        authorizationUnitKey: `sha256:${"0".repeat(64)}`,
        codeSha,
        maxProviderRequests,
        budgetLimitMinor: plan.budgetLimitMinor,
        budgetCurrency,
        slots: plan.slots.map((slot) => ({
          slotId: slot.slotId,
          caseId: `${plan.campaignId}-case`,
          sampleId: `${slot.slotId}-sample`,
          resolvedPromptSha256: "0".repeat(64),
          nativeParametersSha256: "0".repeat(64),
          referenceInputsSha256: "0".repeat(64),
          requestedImageCount: 1,
          maxProviderRequests,
          priceMinorPerProviderRequest: PRICE_MINOR_PER_PROVIDER_REQUEST,
          budgetLimitMinor: plan.budgetLimitMinor,
        })),
      };

      await database.transaction((client) =>
        createSealedEvaluationCampaign(client, authUser, manifest),
      );

      console.log(
        JSON.stringify({
          sealed: plan.campaignId,
          stage: plan.stage,
          slots: plan.slots.length,
          budgetLimitMinor: plan.budgetLimitMinor,
        }),
      );
    }

    console.log(
      JSON.stringify({
        sealed_all: true,
        campaigns: plans.length,
        totalBudgetMinor: plans.reduce((s, p) => s + p.budgetLimitMinor, 0),
      }),
    );
  } finally {
    await database.closeDatabaseForTests();
  }
}

// ---------- subcommand: seal ----------

async function runSeal(
  flags: Map<string, string | true>,
  variantIds: string[],
): Promise<void> {
  const adminId = requiredFlag(flags, "admin-id");
  const campaignIdPrefix = requiredFlag(flags, "campaign-id");
  const modelId = requiredFlag(flags, "model-id");
  const codeSha = requiredFlag(flags, "code-sha");
  const maxProviderRequestsStr = requiredFlag(flags, "max-provider-requests");
  const budgetLimitMinorStr = requiredFlag(flags, "budget-limit-minor");
  const currency = requiredFlag(flags, "currency");
  const dryRun = isDryRun(flags);

  if (variantIds.length === 0) {
    throw new Error(
      "at least one --variant-id is required; expected 2: " +
        `${GENERATE_VARIANT} and ${EDIT_VARIANT}`,
    );
  }

  const maxProviderRequests = positiveInteger(
    maxProviderRequestsStr,
    "max-provider-requests",
  );
  positiveInteger(budgetLimitMinorStr, "budget-limit-minor");

  // 1. variant assertion from builtin templates
  assertAllTemplateVariantsInScope();

  // 2. load manifest and filter by variant-id
  const manifest = loadManifest(DEFAULT_MANIFEST_PATH);
  const filteredUnits = filterAndAssertUnits(manifest.baseUnits, variantIds);

  // 3. generate campaign slot plans
  const plans = generateCampaignPlans(
    filteredUnits,
    manifest.stageRequestCaps,
    campaignIdPrefix,
    modelId,
  );

  // 4. budget gate
  assertBudgetGate(plans);

  if (dryRun) {
    dryRunReport(plans);
    return;
  }

  // 5. seal campaigns in DB
  await sealCampaigns(
    plans,
    adminId,
    codeSha,
    maxProviderRequests,
    currency.toUpperCase(),
  );
}

// ---------- subcommand: execute ----------

async function runExecute(
  flags: Map<string, string | true>,
): Promise<void> {
  const campaignId = requiredFlag(flags, "campaign-id");
  const slotId = requiredFlag(flags, "slot-id");
  const dryRun = isDryRun(flags);

  if (dryRun) {
    console.log(
      JSON.stringify({
        dryRun: true,
        campaignId,
        slotId,
        message:
          "execute requires ENABLE_PAID_EVALUATION_RUNS=true and explicit user authorization",
      }),
    );
    return;
  }

  if (process.env.ENABLE_PAID_EVALUATION_RUNS !== "true") {
    console.error(
      "execute requires ENABLE_PAID_EVALUATION_RUNS=true and explicit user authorization",
    );
    process.exitCode = 1;
    return;
  }

  // Real execution would go here — intentionally left as a no-op stub.
  // Paid provider calls must never be triggered from this script.
  console.log(
    JSON.stringify({
      executed: false,
      campaignId,
      slotId,
      message: "execute stub — no paid calls were made",
    }),
  );
}

// ---------- main ----------

async function main(): Promise<void> {
  const { subcommand, flags, variantIds } = parseFlags(process.argv.slice(2));

  if (subcommand === "seal") {
    await runSeal(flags, variantIds);
  } else {
    await runExecute(flags);
  }
}

const isMain =
  Boolean(process.argv[1]) &&
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);

if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}