#!/usr/bin/env -S npx tsx

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AuthUser } from "../server/lib/auth";
import {
  createSealedEvaluationCampaign,
} from "../server/lib/evaluationCampaign";
import type { EvaluationCampaignManifest } from "../server/lib/evaluationCampaign";
import type { ImageModelId } from "../src/types/imageModels";
import { promptEvaluationUnitKey } from "../src/lib/promptEvaluation";
import crypto from "node:crypto";
import { builtinTemplates } from "../server/routes/templates";

// ---------- helpers ----------

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

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
  evaluationUnitKey: string;
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
  "slots",
]);

const VALUE_FLAGS_EXECUTE = new Set(["campaign-id", "slot-id", "project-id", "base-url"]);
const VALUE_FLAGS_PREPARE = new Set(["admin-id", "campaign-id", "code-sha", "out"]);

function parseFlags(argv: string[]): {
  subcommand: string;
  flags: Map<string, string | true>;
  variantIds: string[];
} {
  if (argv.length < 1) throw new Error("subcommand required: prepare, seal, or execute");
  const subcommand = argv[0];
  if (subcommand !== "prepare" && subcommand !== "seal" && subcommand !== "execute") {
    throw new Error(`unknown subcommand: ${subcommand}. Expected prepare, seal, or execute`);
  }

  const flags = new Map<string, string | true>();
  const variantIds: string[] = [];
  const valueFlags =
    subcommand === "seal" ? VALUE_FLAGS_SEAL
    : subcommand === "prepare" ? VALUE_FLAGS_PREPARE
    : VALUE_FLAGS_EXECUTE;
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

    if ((subcommand === "seal" || subcommand === "prepare") && inlineName === "variant-id") {
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

export function loadManifest(path: string): LoadedManifest {
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
    const unitKey = unit != null
      ? `sha256:${sha256(promptEvaluationUnitKey(unit as unknown as Parameters<typeof promptEvaluationUnitKey>[0]))}`
      : `sha256:${"0".repeat(64)}`;
    return {
      unitId: String(entry.unitId ?? ""),
      promptVariantId: String(unit?.promptVariantId ?? ""),
      evaluationUnitKey: unitKey,
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
  evaluationUnitKey: string;
  slots: SlotPlan[];
  budgetLimitMinor: number;
}

export function generateCampaignPlans(
  units: ManifestUnit[],
  caps: StageRequestCap[],
  campaignIdPrefix: string,
  modelId: string,
): CampaignPlan[] {
  const plans: CampaignPlan[] = [];

  for (const unit of units) {
    for (const cap of caps) {
      const safeUnitId = unit.unitId.replace(/\./g, "-");
      const campaignId = `${campaignIdPrefix}-${safeUnitId}-${cap.stageId}`;
      const slots: SlotPlan[] = [];
      const sampleCount = cap.incrementalSamples * cap.maxProviderRequestsPerSample;

      for (let sampleIdx = 0; sampleIdx < cap.incrementalSamples; sampleIdx++) {
        const slotId = `${campaignIdPrefix}-slot-${safeUnitId}-${cap.stageId}-${sampleIdx + 1}`;
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
        evaluationUnitKey: unit.evaluationUnitKey,
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

function assertNotDegenerateHash(value: string, fieldName: string): void {
  if (/^(.)\1{63}$/.test(value)) {
    throw new Error(
      `${fieldName} is a degenerate placeholder "${value[0]}...". ` +
        `Seal refuses to bind degenerate hashes. Run "prepare" first to materialize real values.`,
    );
  }
}

async function sealCampaigns(
  plans: CampaignPlan[],
  adminId: string,
  codeSha: string,
  maxProviderRequests: number,
  budgetCurrency: string,
  slotHashes?: Map<string, { resolvedPromptSha256: string; nativeParametersSha256: string; referenceInputsSha256: string }>,
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
        authorizationUnitKey: plan.evaluationUnitKey as `sha256:${string}`,
        codeSha,
        maxProviderRequests: plan.slots.length,
        budgetLimitMinor: plan.budgetLimitMinor,
        budgetCurrency,
        slots: plan.slots.map((slot) => {
          const hashes = slotHashes?.get(slot.slotId);
          const resolvedPromptSha256 = hashes?.resolvedPromptSha256 ?? "0".repeat(64);
          const nativeParametersSha256 = hashes?.nativeParametersSha256 ?? "0".repeat(64);
          const referenceInputsSha256 = hashes?.referenceInputsSha256 ?? "0".repeat(64);
          assertNotDegenerateHash(resolvedPromptSha256, `slot ${slot.slotId} resolvedPromptSha256`);
          assertNotDegenerateHash(nativeParametersSha256, `slot ${slot.slotId} nativeParametersSha256`);
          assertNotDegenerateHash(referenceInputsSha256, `slot ${slot.slotId} referenceInputsSha256`);
          return {
            slotId: slot.slotId,
            caseId: `${plan.campaignId}-case-${slot.sampleIndex}`,
            sampleId: `${slot.slotId}-sample`,
            resolvedPromptSha256,
            nativeParametersSha256,
            referenceInputsSha256,
            requestedImageCount: 1,
            maxProviderRequests: 1,
            priceMinorPerProviderRequest: PRICE_MINOR_PER_PROVIDER_REQUEST,
            budgetLimitMinor: PRICE_MINOR_PER_PROVIDER_REQUEST,
          };
        }),
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

// ---------- subcommand: prepare ----------

interface MaterializedSlot {
  slotId: string;
  unitId: string;
  stage: Stage;
  sampleIndex: number;
  resolvedPromptSha256: string;
  nativeParametersSha256: string;
  referenceInputsSha256: string;
  requestedImageCount: number;
}

interface MaterializedSlots {
  variantIds: string[];
  codeSha: string;
  slots: MaterializedSlot[];
}

async function runPrepare(
  flags: Map<string, string | true>,
  variantIds: string[],
): Promise<void> {
  const codeSha = requiredFlag(flags, "code-sha");
  const campaignIdPrefix = requiredFlag(flags, "campaign-id");
  const outPath = requiredFlag(flags, "out");

  if (variantIds.length === 0) {
    throw new Error(`at least one --variant-id is required; expected 2: ${GENERATE_VARIANT} and ${EDIT_VARIANT}`);
  }

  assertAllTemplateVariantsInScope();
  const manifest = loadManifest(DEFAULT_MANIFEST_PATH);
  const filteredUnits = filterAndAssertUnits(manifest.baseUnits, variantIds);

  const { requireGarmentPromptVariant } = await import("../src/lib/garmentPromptPresets");
  const { getModelParameterProfile, materializeModelParameterProfile } = await import("../src/types/modelParameterProfiles");
  const { attachEvaluationRunPolicy } = await import("../server/lib/evaluationRunPolicy");
  const { executeStep } = await import("../server/engine/runner");
  const evaluationEvidence = await import("../server/lib/evaluationEvidence");
  const { campaignRuntimeBinding } = await import("../server/lib/evaluationEvidenceStore");

  const materialized: MaterializedSlot[] = [];

  for (const unit of filteredUnits) {
    const isGenerate = unit.promptVariantId === GENERATE_VARIANT;

    const variant = requireGarmentPromptVariant({
      familyId: "fashion-lookbook",
      modelId: "gpt-image-2.5-flare-vip",
      nodeKind: "image",
      mode: isGenerate ? "generate" : "edit",
    });
    const modelId = variant.modelId;
    const parameterProfile = getModelParameterProfile(variant.parameterProfileId);
    if (!parameterProfile) throw new Error(`missing parameter profile: ${variant.parameterProfileId}`);
    const parameters = materializeModelParameterProfile(parameterProfile);

    const inputTexts = isGenerate
      ? ["生成服装效果图"]
      : ["保持服装结构并优化商业棚拍光线"];

    for (const cap of manifest.stageRequestCaps) {
      for (let sampleIdx = 0; sampleIdx < cap.incrementalSamples; sampleIdx++) {
        const safeUnitId = unit.unitId.replace(/\./g, "-");
        const slotId = `${campaignIdPrefix}-slot-${safeUnitId}-${cap.stageId}-${sampleIdx + 1}`;

        const plan = {
          steps: [{
            nodeId: "capture-node",
            kind: "image-generator",
            inputImages: [],
            inputReferences: [],
            params: {
              inputTexts,
              promptVariantId: variant.variantId,
              promptFamilyId: variant.familyId,
              parameterProfileId: variant.parameterProfileId,
              contractHash: variant.contractHash,
              evaluationVersion: variant.evaluationVersion,
              postprocessVersion: parameterProfile.postprocess.version,
              operationMode: variant.mode,
              modelId,
              modelOptions: parameters.modelOptions,
              aspectRatio: parameters.aspectRatio,
              batchSize: parameters.batchSize,
            },
          }],
        };

        const policy = {
          caseId: `case-${unit.unitId}`,
          sampleId: `sample-${sampleIdx + 1}`,
          authorizationId: `prep-auth-${slotId}`,
          campaignId: `prep-campaign-${unit.unitId}-${cap.stageId}`,
          slotId,
          retryPolicy: "no-retry" as const,
        };
        const persistedPlan = attachEvaluationRunPolicy(plan, policy);
        const providerStep = persistedPlan.steps.find(
          (s: { params: Record<string, unknown> }) => s.params.evaluationPolicy !== undefined,
        );
        if (!providerStep) throw new Error("evaluation plan must contain one Provider step");

        const captureSentinel = new Error("capture sealed materialization");
        let capturedRequest: import("../src/types/workflow").ImageGenRequest | undefined;
        const captureProvider = {
          id: providerStep.params.modelId as string,
          async generate() { throw new Error("Provider.generate must not be called during prepare capture"); },
          async edit() { throw new Error("Provider.edit must not be called during prepare capture"); },
        };

        try {
          await executeStep(providerStep, providerStep.inputImages, () => captureProvider, {
            referenceSources: providerStep.inputReferences ?? [],
            beforeProviderCall: async (
              _providerRequest: import("../src/types/workflow").ImageGenRequest,
              request: import("../src/types/workflow").ImageGenRequest,
            ) => {
              capturedRequest = request;
              throw captureSentinel;
            },
          });
        } catch (error: unknown) {
          if (error !== captureSentinel) throw error;
        }
        if (!capturedRequest) throw new Error(`prepare capture did not materialize a Provider request for slot ${slotId}`);

        const codeIdentity = { codeSha, postprocessDigest: "sha256:" + "0".repeat(64) };
        const runtime = evaluationEvidence.buildEvaluationCaseSnapshotFromRuntime({
          plan: persistedPlan,
          step: providerStep,
          request: capturedRequest,
          policy,
          codeIdentity,
          capturedAt: new Date().toISOString(),
        });
        const binding = campaignRuntimeBinding(runtime);

        materialized.push({
          slotId,
          unitId: unit.unitId,
          stage: cap.stageId,
          sampleIndex: sampleIdx + 1,
          resolvedPromptSha256: binding.resolvedPromptSha256,
          nativeParametersSha256: binding.nativeParametersSha256,
          referenceInputsSha256: binding.referenceInputsSha256,
          requestedImageCount: binding.requestedImageCount,
        });
      }
    }
  }

  const output: MaterializedSlots = { variantIds, codeSha, slots: materialized };
  const { writeFileSync } = await import("node:fs");
  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  console.log(JSON.stringify({ prepared: true, slots: materialized.length, out: outPath }));
}// ---------- subcommand: seal ----------

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

  // 4b. load materialized slot hashes if --slots was provided
  let slotHashes: Map<string, { resolvedPromptSha256: string; nativeParametersSha256: string; referenceInputsSha256: string }> | undefined;
  if (flags.has("slots")) {
    const slotsPath = requiredFlag(flags, "slots");
    const raw = readFileSync(slotsPath, "utf8");
    const materialized = JSON.parse(raw) as { slots: Array<{ slotId: string; resolvedPromptSha256: string; nativeParametersSha256: string; referenceInputsSha256: string }> };
    if (!Array.isArray(materialized.slots)) {
      throw new Error(`--slots file "${slotsPath}" is missing a "slots" array`);
    }
    slotHashes = new Map(materialized.slots.map((s) => [s.slotId, {
      resolvedPromptSha256: s.resolvedPromptSha256,
      nativeParametersSha256: s.nativeParametersSha256,
      referenceInputsSha256: s.referenceInputsSha256,
    }]));
    console.log(JSON.stringify({ loadedSlots: materialized.slots.length, from: slotsPath }));
  }

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
    slotHashes,
  );
}

// ---------- subcommand: execute ----------

export interface ExecuteSlotInfo {
  slotId: string;
  caseId: string;
  sampleId: string;
  authorizationId: string | null;
  runId: string | null;
  status: string;
  priceMinorPerProviderRequest: number;
  budgetLimitMinor: number;
}

export interface ExecuteCampaignInfo {
  campaignId: string;
  ownerId: string;
  status: string;
  budgetLimitMinor: number;
  reservedBudgetMinor: number;
  budgetCurrency: string;
  slots: ExecuteSlotInfo[];
}

export interface ExecuteDeps {
  initializeDatabase: () => Promise<void>;
  queryOne: <T>(sql: string, params: unknown[], client?: unknown) => Promise<T | undefined>;
  query: <T>(sql: string, params: unknown[], client?: unknown) => Promise<T[]>;
  transaction: <T>(fn: (client: unknown) => Promise<T>) => Promise<T>;
  closeDatabaseForTests: () => Promise<void>;
  env: { ENABLE_PAID_EVALUATION_RUNS?: string };
  /**
   * Submit one authorized slot as a paid evaluation run through the production
   * entry point (POST /api/run-plan with the evaluation policy five-tuple).
   * The worker-side evidence store performs the budget reservation and evidence
   * ledgering; the runner must NOT reserve directly (spec §7.3).
   */
  submitEvaluationRun: (input: {
    campaign: ExecuteCampaignInfo;
    slot: ExecuteSlotInfo;
  }) => Promise<{ runId: string }>;
  /** Poll a run's terminal status from generation_runs. */
  getRunStatus: (runId: string) => Promise<string>;
  now?: number;
  pollIntervalMs?: number;
  maxPolls?: number;
}

export const MAX_GLOBAL_BUDGET_MINOR = 5000;

async function lookupAdminUser(deps: ExecuteDeps): Promise<AuthUser> {
  const adminId = process.env.ADMIN_SESSION_USER_ID;
  if (!adminId || !adminId.trim()) {
    throw new Error("execute requires an admin session (ADMIN_SESSION_USER_ID)");
  }

  const actor = await deps.queryOne<{
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
    throw new Error("execute requires an active persisted admin session");
  }

  return {
    id: actor.id,
    accountId: actor.account_id,
    displayName: actor.display_name,
    role: actor.role,
    mustChangePassword: actor.must_change_password === 1,
  };
}

async function loadCampaignForExecute(
  deps: ExecuteDeps,
  campaignId: string,
): Promise<ExecuteCampaignInfo> {
  const campaign = await deps.queryOne<{
    campaign_id: string;
    owner_id: string;
    status: string;
    budget_limit_minor: number | string;
    reserved_budget_minor: number | string;
    budget_currency: string;
  }>(
    `SELECT campaign_id, owner_id, status, budget_limit_minor, reserved_budget_minor, budget_currency
     FROM evaluation_campaigns WHERE campaign_id = $1`,
    [campaignId],
  );

  if (!campaign) {
    throw new Error(`campaign "${campaignId}" not found`);
  }

  // Authorization state lives in the evaluation_run_authorizations ledger: the
  // authorize CLI registers a persisted grant per (campaign, slot) but does NOT
  // touch evaluation_campaign_slots.authorization_id — that column is bound
  // inside the run-plan consume transaction, once per slot. "Authorized but not
  // yet executed" therefore means: ledger grant active + slot still ready.
  const slots = await deps.query<{
    slot_id: string;
    case_id: string;
    sample_id: string;
    run_id: string | null;
    status: string;
    price_minor_per_provider_request: number | string;
    budget_limit_minor: number | string;
    authorization_id: string | null;
  }>(
    `SELECT s.slot_id, s.case_id, s.sample_id, s.run_id, s.status,
            s.price_minor_per_provider_request, s.budget_limit_minor,
            a.authorization_id
     FROM evaluation_campaign_slots s
     LEFT JOIN evaluation_run_authorizations a
       ON a.campaign_id = s.campaign_id AND a.slot_id = s.slot_id
      AND a.status = 'active'
     WHERE s.campaign_id = $1
     ORDER BY s.slot_id`,
    [campaignId],
  );

  return {
    campaignId: campaign.campaign_id,
    ownerId: campaign.owner_id,
    status: campaign.status,
    budgetLimitMinor: Number(campaign.budget_limit_minor),
    reservedBudgetMinor: Number(campaign.reserved_budget_minor),
    budgetCurrency: campaign.budget_currency,
    slots: slots.map((s) => ({
      slotId: s.slot_id,
      caseId: s.case_id,
      sampleId: s.sample_id,
      authorizationId: s.authorization_id,
      runId: s.run_id,
      status: s.status,
      priceMinorPerProviderRequest: Number(s.price_minor_per_provider_request),
      budgetLimitMinor: Number(s.budget_limit_minor),
    })),
  };
}

export function checkBudgetGates(
  campaign: ExecuteCampaignInfo,
  slot: ExecuteSlotInfo,
  cumulativeReservedMinor: number,
): { passed: boolean; reason?: string } {
  const price = slot.priceMinorPerProviderRequest;

  // Campaign-level budget gate
  if (campaign.reservedBudgetMinor + price > campaign.budgetLimitMinor) {
    return {
      passed: false,
      reason: `campaign budget would be exceeded: reserved ${campaign.reservedBudgetMinor} + price ${price} > limit ${campaign.budgetLimitMinor}`,
    };
  }

  // Global $50 budget gate
  if (cumulativeReservedMinor + price > MAX_GLOBAL_BUDGET_MINOR) {
    return {
      passed: false,
      reason: `global budget would be exceeded: cumulative ${cumulativeReservedMinor} + price ${price} > cap ${MAX_GLOBAL_BUDGET_MINOR}`,
    };
  }

  return { passed: true };
}

async function queryGlobalReservedBudget(deps: ExecuteDeps): Promise<number> {
  const row = await deps.queryOne<{ total: string | number }>(
    `SELECT COALESCE(SUM(reserved_budget_minor), 0) AS total
     FROM evaluation_campaigns`,
    [],
  );
  return row ? Number(row.total) : 0;
}

function terminalSlotStatus(status: string): boolean {
  return ["succeeded", "failed", "outcome_unknown", "cancelled"].includes(status);
}

export async function runExecuteCore(
  deps: ExecuteDeps,
  campaignId: string,
  slotIdFilter: string | undefined,
  dryRun: boolean,
): Promise<void> {
  // 1. Check ENABLE_PAID_EVALUATION_RUNS (fail-closed)
  if (deps.env.ENABLE_PAID_EVALUATION_RUNS !== "true") {
    throw new Error(
      "execute requires ENABLE_PAID_EVALUATION_RUNS=true and explicit user authorization",
    );
  }

  // 2. Admin session
  await lookupAdminUser(deps);

  await deps.initializeDatabase();

  try {
    // 3. Load campaign + slots
    const campaign = await loadCampaignForExecute(deps, campaignId);

    if (campaign.status === "stopped") {
      console.log(JSON.stringify({ campaignId, status: "stopped", message: "campaign was already stopped" }));
      process.exitCode = 1;
      return;
    }

    if (campaign.status === "closed") {
      console.log(JSON.stringify({ campaignId, status: "closed", message: "campaign is already closed" }));
      return;
    }

    // Filter slots
    const targetSlots = slotIdFilter
      ? campaign.slots.filter((s) => s.slotId === slotIdFilter)
      : campaign.slots;

    if (targetSlots.length === 0) {
      throw new Error(
        slotIdFilter
          ? `slot "${slotIdFilter}" not found in campaign "${campaignId}"`
          : `no slots found in campaign "${campaignId}"`,
      );
    }

    // Filter to authorized, not-yet-executed slots. "Authorized" = an active
    // ledger grant joined onto the slot (the authorize CLI); "not yet executed"
    // = slot still `ready` (the run-plan consume transaction binds run_id and
    // moves the slot on; a `running` slot already belongs to an in-flight run).
    const executableSlots = targetSlots.filter(
      (s) => s.authorizationId !== null && s.status === "ready",
    );

    // 4. Dry-run mode: print plan, zero DB writes, zero paid calls
    if (dryRun) {
      const globalReserved = await queryGlobalReservedBudget(deps);
      let cumulativeReserved = globalReserved;
      const slotPlans: Array<Record<string, unknown>> = [];
      let allPassed = true;

      for (const slot of executableSlots) {
        const price = slot.priceMinorPerProviderRequest;
        const cGate = campaign.reservedBudgetMinor + price <= campaign.budgetLimitMinor;
        const gGate = cumulativeReserved + price <= MAX_GLOBAL_BUDGET_MINOR;
        const passed = cGate && gGate;

        slotPlans.push({
          slotId: slot.slotId,
          caseId: slot.caseId,
          sampleId: slot.sampleId,
          authorizationId: slot.authorizationId,
          status: slot.status,
          priceMinorPerRequest: price,
          campaignBudgetCheck: cGate,
          globalBudgetCheck: gGate,
          wouldExecute: passed,
        });

        if (passed) {
          cumulativeReserved += price;
        } else {
          allPassed = false;
        }
      }

      console.log(
        JSON.stringify(
          {
            dryRun: true,
            campaignId,
            campaignStatus: campaign.status,
            campaignBudgetLimitMinor: campaign.budgetLimitMinor,
            campaignReservedBudgetMinor: campaign.reservedBudgetMinor,
            globalReservedBudgetMinor: globalReserved,
            globalBudgetCapMinor: MAX_GLOBAL_BUDGET_MINOR,
            executableSlots: executableSlots.length,
            allSlotsPassBudget: allPassed,
            slots: slotPlans,
          },
          null,
          2,
        ),
      );
      return;
    }

    // 5. Real execution: iterate slots, check budget, trigger run, poll
    const globalReserved = await queryGlobalReservedBudget(deps);
    let cumulativeReserved = globalReserved;

    for (const slot of executableSlots) {
      // Re-check campaign status — may have been stopped by a prior slot
      const currentCampaign = await loadCampaignForExecute(deps, campaignId);
      if (currentCampaign.status === "stopped") {
        console.error(
          JSON.stringify({
            campaignId,
            slotId: slot.slotId,
            status: "aborted",
            reason: "campaign was stopped before this slot could execute",
          }),
        );
        process.exitCode = 1;
        return;
      }

      // Budget gate check
      const gate = checkBudgetGates(currentCampaign, slot, cumulativeReserved);
      if (!gate.passed) {
        console.error(JSON.stringify({ campaignId, slotId: slot.slotId, error: gate.reason }));
        process.exitCode = 1;
        return;
      }

      // Submit through the production entry point (POST /api/run-plan with the
      // evaluation policy five-tuple). The run-plan transaction consumes the
      // persisted authorization and binds the slot to the new run; the worker
      // performs the in-transaction budget reservation (the second hard gate)
      // and evidence ledgering. The runner never reserves directly (spec §7.3).
      const submitted = await deps.submitEvaluationRun({ campaign: currentCampaign, slot });

      cumulativeReserved += slot.priceMinorPerProviderRequest;

      console.log(
        JSON.stringify({
          campaignId,
          slotId: slot.slotId,
          status: "submitted",
          runId: submitted.runId,
          priceMinor: slot.priceMinorPerProviderRequest,
          cumulativeReservedMinor: cumulativeReserved,
        }),
      );

      // Poll the run to a terminal status (spec §7.3). The worker finalizes the
      // slot inside the same transaction that ends the run, so after the run is
      // terminal the slot outcome is the authoritative abort signal.
      let pollAttempts = 0;
      const maxPolls = deps.maxPolls ?? 120; // ~10 minutes at 5s intervals
      const pollIntervalMs = deps.pollIntervalMs ?? 5000;
      let runStatus = "queued";

      while (pollAttempts < maxPolls) {
        pollAttempts++;
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

        // Abort semantics: a prior slot failing sets the campaign to stopped —
        // never start or continue further slots or stages (spec §7.3).
        const refreshedCampaign = await loadCampaignForExecute(deps, campaignId);
        if (refreshedCampaign.status === "stopped") {
          console.error(
            JSON.stringify({
              campaignId,
              slotId: slot.slotId,
              status: "aborted",
              reason: "campaign stopped during slot execution",
            }),
          );
          process.exitCode = 1;
          return;
        }

        runStatus = await deps.getRunStatus(submitted.runId);
        if (runStatus === "success" || runStatus === "error") break;
      }

      if (runStatus !== "success" && runStatus !== "error") {
        console.error(
          JSON.stringify({
            campaignId,
            slotId: slot.slotId,
            runId: submitted.runId,
            error: `run did not reach a terminal status after ${maxPolls} polls (last: ${runStatus})`,
          }),
        );
        process.exitCode = 1;
        return;
      }

      // Run is terminal: read back the finalized slot outcome.
      const finalCampaign = await loadCampaignForExecute(deps, campaignId);
      if (finalCampaign.status === "stopped") {
        console.error(
          JSON.stringify({
            campaignId,
            slotId: slot.slotId,
            status: "aborted",
            reason: "campaign stopped during slot execution",
          }),
        );
        process.exitCode = 1;
        return;
      }
      const finalSlot = finalCampaign.slots.find((s) => s.slotId === slot.slotId);
      if (!finalSlot) {
        throw new Error(`slot "${slot.slotId}" disappeared from campaign`);
      }

      console.log(
        JSON.stringify({
          campaignId,
          slotId: slot.slotId,
          runId: submitted.runId,
          runStatus,
          outcome: finalSlot.status,
          pollAttempts,
        }),
      );

      // Abort semantics: any non-succeeded outcome stops the campaign
      if (!terminalSlotStatus(finalSlot.status) || finalSlot.status !== "succeeded") {
        console.error(
          JSON.stringify({
            campaignId,
            slotId: slot.slotId,
            error: `slot outcome "${finalSlot.status}" — campaign stopped`,
          }),
        );
        process.exitCode = 1;
        return;
      }
    }

    console.log(
      JSON.stringify({
        campaignId,
        executed: true,
        slots: executableSlots.length,
        message: "all slots executed successfully",
      }),
    );
  } finally {
    await deps.closeDatabaseForTests();
  }
}

async function runExecute(
  flags: Map<string, string | true>,
): Promise<void> {
  const campaignId = requiredFlag(flags, "campaign-id");
  const slotId = flags.has("slot-id")
    ? requiredFlag(flags, "slot-id")
    : undefined;
  const dryRun = isDryRun(flags);

  const database = await import("../server/lib/database");

  // Real submission goes through POST /api/run-plan — the production entry
  // point with its full gate chain (auth → plan equality → authorization
  // consume/bind → admission → worker reserve). The runner needs: a saved
  // project whose flow carries exactly the sealed case canvas, an admin
  // session cookie, and the server base URL.
  const baseUrl = flags.has("base-url")
    ? String(flags.get("base-url")).replace(/\/$/, "")
    : "http://127.0.0.1:3001";
  const projectId = dryRun ? undefined : requiredFlag(flags, "project-id");
  const sessionToken = dryRun ? undefined : process.env.ADMIN_SESSION_TOKEN;
  if (!dryRun && !sessionToken) {
    throw new Error(
      "execute requires ADMIN_SESSION_TOKEN (an active admin session cookie for POST /api/run-plan)",
    );
  }

  const submitEvaluationRun = async (input: {
    campaign: ExecuteCampaignInfo;
    slot: ExecuteSlotInfo;
  }): Promise<{ runId: string }> => {
    if (!projectId || !sessionToken) {
      throw new Error("execute submission requires --project-id and ADMIN_SESSION_TOKEN");
    }
    const flowRow = await database.queryOne<{ flow_json: string }>(
      `SELECT flow_json FROM projects
       WHERE id = $1 AND deleted_at IS NULL AND lifecycle = 'saved'`,
      [projectId],
    );
    if (!flowRow) {
      throw new Error(
        `saved project "${projectId}" not found — seal the case canvas as a saved project first`,
      );
    }
    const flow = JSON.parse(flowRow.flow_json) as { nodes: unknown[]; edges: unknown[] };
    // The paid node is the single image-generator in the sealed case canvas;
    // the run-plan route independently enforces "exactly one paid node".
    const generatorNodes = (flow.nodes as Array<{ type?: string; id?: string }>)
      .filter((node) => node?.type === "image-generator");
    if (generatorNodes.length !== 1 || !generatorNodes[0]?.id) {
      throw new Error(
        `project "${projectId}" must contain exactly one image-generator node, found ${generatorNodes.length}`,
      );
    }
    const onlyNodeId = generatorNodes[0].id;
    const response = await fetch(`${baseUrl}/api/run-plan`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `gc_session=${sessionToken}`,
      },
      body: JSON.stringify({
        nodes: flow.nodes,
        edges: flow.edges,
        onlyNodeId,
        includeDownstream: false,
        projectId,
        clientRequestId: `eval-${input.slot.slotId}`,
        evaluation: {
          caseId: input.slot.caseId,
          sampleId: input.slot.sampleId,
          authorizationId: input.slot.authorizationId,
          campaignId: input.campaign.campaignId,
          slotId: input.slot.slotId,
        },
      }),
    });
    if (response.status !== 202) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `POST /api/run-plan for slot ${input.slot.slotId} failed with HTTP ${response.status}: ${body.slice(0, 400)}`,
      );
    }
    const accepted = (await response.json()) as { runId?: string };
    if (!accepted.runId) {
      throw new Error(`POST /api/run-plan for slot ${input.slot.slotId} returned no runId`);
    }
    return { runId: accepted.runId };
  };

  const getRunStatus = async (runId: string): Promise<string> => {
    const row = await database.queryOne<{ status: string }>(
      `SELECT status FROM generation_runs WHERE id = $1`,
      [runId],
    );
    return row?.status ?? "unknown";
  };

  await runExecuteCore(
    {
      initializeDatabase: database.initializeDatabase,
      queryOne: database.queryOne as ExecuteDeps["queryOne"],
      query: database.query as ExecuteDeps["query"],
      transaction: database.transaction as ExecuteDeps["transaction"],
      closeDatabaseForTests: database.closeDatabaseForTests,
      env: process.env as { ENABLE_PAID_EVALUATION_RUNS?: string },
      submitEvaluationRun,
      getRunStatus,
    },
    campaignId,
    slotId,
    dryRun,
  );
}

// ---------- main ----------

async function main(): Promise<void> {
  const { subcommand, flags, variantIds } = parseFlags(process.argv.slice(2));

  if (subcommand === "seal") {
    await runSeal(flags, variantIds);
  } else if (subcommand === "prepare") {
    await runPrepare(flags, variantIds);
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