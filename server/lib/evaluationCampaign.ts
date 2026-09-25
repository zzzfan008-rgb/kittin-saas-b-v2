import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { isImageModelId, type ImageModelId } from "../../src/types/imageModels";
import type { AuthUser } from "./auth";

export const EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS = "ready" as const;

export const EVALUATION_CAMPAIGN_BLOCKER_DETAIL =
  "Paid evaluation requires a sealed immutable campaign/stage ledger with exact slots, per-slot authorization, campaign caps, and a verified closure artifact.";

export const EVALUATION_CAMPAIGN_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
export const EVALUATION_CAMPAIGN_SLOT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

const CASE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const SAMPLE_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,128}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const CONTRACT_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MAX_PROVIDER_REQUESTS = 8;

export type PaidEvaluationCampaignStage =
  | "provider-probe"
  | "internal-experiment"
  | "formal-validation";

export type EvaluationCampaignStatus = "ready" | "stopped" | "closed";
export type EvaluationCampaignSlotStatus =
  | "ready"
  | "running"
  | "succeeded"
  | "failed"
  | "outcome_unknown"
  | "cancelled";

export interface EvaluationCampaignSlotManifest {
  slotId: string;
  caseId: string;
  sampleId: string;
  resolvedPromptSha256: string;
  nativeParametersSha256: string;
  referenceInputsSha256: string;
  requestedImageCount: number;
  maxProviderRequests: number;
  priceMinorPerProviderRequest: number;
  budgetLimitMinor: number;
}

export interface EvaluationCampaignManifest {
  campaignId: string;
  ownerId: string;
  stage: PaidEvaluationCampaignStage;
  modelId: ImageModelId;
  authorizationUnitKey: `sha256:${string}`;
  codeSha: string;
  maxProviderRequests: number;
  budgetLimitMinor: number;
  budgetCurrency: string;
  /** 裁决 6②：envelope 12 字段输入源的 canonicalJson 原像（与算 key 同源） */
  inputsCanonicalJson: string;
  /** 裁决 6②：上列 sha256 指纹 */
  inputsSha256: string;
  /** 裁决 6②：密封时注册表的 evaluationVersion */
  evaluationVersion: string;
  /** 裁决 C：seal 封存的 flow_json sha256。execute 期重算比对 fail-closed。
   *  新 seal 必须提供（代码约束，禁止可选——缺失即拒）。 */
  flowJsonSha256: `sha256:${string}`;
  slots: readonly EvaluationCampaignSlotManifest[];
}

export interface EvaluationCampaignSlotRuntimeBinding {
  codeSha: string;
  modelId: ImageModelId;
  authorizationUnitKey: `sha256:${string}`;
  resolvedPromptSha256: string;
  nativeParametersSha256: string;
  referenceInputsSha256: string;
  requestedImageCount: number;
}

export interface EvaluationCampaignAuthorizationBinding {
  campaignId: string;
  slotId: string;
  ownerId: string;
  modelId: ImageModelId;
  evaluationUnitKey: `sha256:${string}`;
  maxProviderRequests: number;
  priceMinorPerProviderRequest: number;
  budgetLimitMinor: number;
  budgetCurrency: string;
}

/** A run consumes one exact sealed case/sample slot, not just its ID. */
export interface EvaluationCampaignRunAuthorizationBinding extends EvaluationCampaignAuthorizationBinding {
  caseId: string;
  sampleId: string;
}

export interface LockedEvaluationCampaignSlot extends EvaluationCampaignAuthorizationBinding {
  campaignManifestSha256: string;
}

export interface EvaluationCampaignCaseLocator {
  slotId: string;
  caseEvidenceId: string;
  runId: string;
}

export interface EvaluationCampaignGateSnapshot {
  campaignId: string;
  ownerId: string;
  stage: PaidEvaluationCampaignStage;
  modelId: ImageModelId;
  authorizationUnitKey: `sha256:${string}`;
  codeSha: string;
  manifestSha256: string;
  status: EvaluationCampaignStatus;
  closureSha256: string | null;
  slots: readonly EvaluationCampaignCaseLocator[];
}

export interface EvaluationCampaignClosureSlot {
  slotId: string;
  caseId: string;
  sampleId: string;
  authorizationId: string;
  runId: string;
  caseEvidenceId: string;
  evidenceRecordSha256: string;
  billingReconciliationStatus: "confirmed-not-billed" | "confirmed-billed";
  billingTailSha256: string | null;
  manualAssessmentTailSha256: string | null;
  imageArtifactSetSha256: string;
}

export interface EvaluationCampaignClosure {
  schemaVersion: 1;
  artifactType: "evaluation-campaign-closure";
  campaignId: string;
  ownerId: string;
  stage: PaidEvaluationCampaignStage;
  modelId: ImageModelId;
  authorizationUnitKey: `sha256:${string}`;
  codeSha: string;
  manifestSha256: string;
  campaignRequestCap: number;
  campaignBudgetLimitMinor: number;
  budgetCurrency: string;
  campaignReservedProviderRequests: number;
  campaignReservedBudgetMinor: number;
  slots: readonly EvaluationCampaignClosureSlot[];
  imageArtifactSetSha256: string;
  closedBy: string;
  closedAt: string;
  artifactSha256: string;
}

interface CampaignRow {
  campaign_id: string;
  owner_id: string;
  stage: PaidEvaluationCampaignStage;
  model_id: string;
  evaluation_unit_key: string;
  code_sha: string;
  max_provider_requests: number;
  budget_limit_minor: number | string;
  budget_currency: string;
  reserved_provider_requests: number;
  reserved_budget_minor: number | string;
  status: EvaluationCampaignStatus;
  manifest_sha256: string;
  closure_sha256: string | null;
}

interface CampaignSlotRow {
  slot_id: string;
  campaign_id: string;
  case_id: string;
  sample_id: string;
  resolved_prompt_sha256: string;
  native_parameters_sha256: string;
  reference_inputs_sha256: string;
  requested_image_count: number;
  max_provider_requests: number;
  price_minor_per_provider_request: number | string;
  budget_limit_minor: number | string;
  authorization_id: string | null;
  run_id: string | null;
  reserved_provider_requests: number;
  reserved_budget_minor: number | string;
  status: EvaluationCampaignSlotStatus;
}

function canonicalJson(value: unknown): string {
  if (value === undefined || value === null || typeof value !== "object") {
    return JSON.stringify(value ?? null);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, nested]) => nested !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`).join(",")}}`;
}

function sha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

/**
 * 裁决 C 单一计算点：flow_json 的执行绑定 sha256。
 * seal 封存与 execute 校验都必须经由本函数（不得各写一份 hash 计算）。
 *
 * 哈希对象是 projects.flow_json 的原始 TEXT（不是 buildExecutionPlan 的
 * 序列化计划）：裁决 C 的变异验收是「篡改 flow_json 一字符 → execute 拒」，
 * 原始 TEXT 对任何单字符篡改都敏感；canonical plan JSON 会漏掉不参与 plan
 * 的字段变更（键序、空白、plan 忽略的字段），检测面严格更弱。
 */
export function computeFlowJsonSha256(flowJson: string): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(flowJson, "utf8").digest("hex")}`;
}

function safeInteger(value: number | string, field: string, minimum = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) throw new Error(`${field} is invalid`);
  return parsed;
}

function assertId(value: string, pattern: RegExp, field: string): void {
  if (!pattern.test(value)) throw new Error(`${field} is invalid`);
}

function assertHash(value: string, field: string): void {
  if (!SHA256_PATTERN.test(value)) throw new Error(`${field} must be a SHA-256 digest`);
}

function assertPositiveInteger(value: number, field: string, maximum = Number.MAX_SAFE_INTEGER): void {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${field} is invalid`);
  }
}

function assertCampaignManifest(input: EvaluationCampaignManifest): void {
  assertId(input.campaignId, EVALUATION_CAMPAIGN_ID_PATTERN, "campaignId");
  if (!input.ownerId.trim()) throw new Error("campaign ownerId is required");
  if (!["provider-probe", "internal-experiment", "formal-validation"].includes(input.stage)) {
    throw new Error("campaign stage is invalid");
  }
  if (!isImageModelId(input.modelId)) throw new Error("campaign modelId is invalid");
  if (!CONTRACT_HASH_PATTERN.test(input.authorizationUnitKey)) {
    throw new Error("campaign authorizationUnitKey is invalid");
  }
  if (!CODE_SHA_PATTERN.test(input.codeSha)) throw new Error("campaign codeSha is invalid");
  if (!CONTRACT_HASH_PATTERN.test(input.flowJsonSha256)) throw new Error("campaign flowJsonSha256 is invalid");
  assertPositiveInteger(input.maxProviderRequests, "campaign maxProviderRequests");
  assertPositiveInteger(input.budgetLimitMinor, "campaign budgetLimitMinor");
  if (!CURRENCY_PATTERN.test(input.budgetCurrency)) throw new Error("campaign budgetCurrency is invalid");
  if (input.slots.length < 1) throw new Error("campaign must contain at least one sealed slot");

  const slotIds = new Set<string>();
  const caseIds = new Set<string>();
  const sampleIds = new Set<string>();
  let slotRequests = 0;
  let slotBudgets = 0;
  for (const slot of input.slots) {
    assertId(slot.slotId, EVALUATION_CAMPAIGN_SLOT_ID_PATTERN, "campaign slotId");
    assertId(slot.caseId, CASE_ID_PATTERN, "campaign slot caseId");
    assertId(slot.sampleId, SAMPLE_ID_PATTERN, "campaign slot sampleId");
    assertHash(slot.resolvedPromptSha256, "campaign slot resolvedPromptSha256");
    assertHash(slot.nativeParametersSha256, "campaign slot nativeParametersSha256");
    assertHash(slot.referenceInputsSha256, "campaign slot referenceInputsSha256");
    assertPositiveInteger(slot.requestedImageCount, "campaign slot requestedImageCount", MAX_PROVIDER_REQUESTS);
    assertPositiveInteger(slot.maxProviderRequests, "campaign slot maxProviderRequests", MAX_PROVIDER_REQUESTS);
    assertPositiveInteger(slot.priceMinorPerProviderRequest, "campaign slot priceMinorPerProviderRequest");
    assertPositiveInteger(slot.budgetLimitMinor, "campaign slot budgetLimitMinor");
    const worstCase = slot.maxProviderRequests * slot.priceMinorPerProviderRequest;
    if (!Number.isSafeInteger(worstCase) || worstCase > slot.budgetLimitMinor) {
      throw new Error("campaign slot worst-case cost exceeds its budget cap");
    }
    if (slotIds.has(slot.slotId) || caseIds.has(slot.caseId) || sampleIds.has(slot.sampleId)) {
      throw new Error("campaign slot IDs, case IDs, and sample IDs must be unique");
    }
    slotIds.add(slot.slotId);
    caseIds.add(slot.caseId);
    sampleIds.add(slot.sampleId);
    slotRequests += slot.maxProviderRequests;
    slotBudgets += slot.budgetLimitMinor;
  }
  if (!Number.isSafeInteger(slotRequests) || slotRequests > input.maxProviderRequests) {
    throw new Error("campaign request cap is smaller than its sealed slot caps");
  }
  if (!Number.isSafeInteger(slotBudgets) || slotBudgets > input.budgetLimitMinor) {
    throw new Error("campaign budget cap is smaller than its sealed slot caps");
  }
}

function campaignManifestPayload(input: EvaluationCampaignManifest): Record<string, unknown> {
  return {
    schemaVersion: 1,
    campaignId: input.campaignId,
    ownerId: input.ownerId,
    stage: input.stage,
    modelId: input.modelId,
    authorizationUnitKey: input.authorizationUnitKey,
    codeSha: input.codeSha,
    maxProviderRequests: input.maxProviderRequests,
    budgetLimitMinor: input.budgetLimitMinor,
    budgetCurrency: input.budgetCurrency,
    slots: [...input.slots].map((slot) => ({ ...slot })).sort((left, right) => (
      left.slotId.localeCompare(right.slotId)
    )),
  };
}

function campaignFromRow(row: CampaignRow): Omit<EvaluationCampaignGateSnapshot, "slots"> {
  if (!isImageModelId(row.model_id) || !CONTRACT_HASH_PATTERN.test(row.evaluation_unit_key)) {
    throw new Error("persisted campaign has an invalid model or authorization unit");
  }
  if (!CODE_SHA_PATTERN.test(row.code_sha) || !SHA256_PATTERN.test(row.manifest_sha256)) {
    throw new Error("persisted campaign has invalid identity hashes");
  }
  return {
    campaignId: row.campaign_id,
    ownerId: row.owner_id,
    stage: row.stage,
    modelId: row.model_id,
    authorizationUnitKey: row.evaluation_unit_key as `sha256:${string}`,
    codeSha: row.code_sha,
    manifestSha256: row.manifest_sha256,
    status: row.status,
    closureSha256: row.closure_sha256,
  };
}

async function lockedCampaignSlot(
  client: PoolClient,
  campaignId: string,
  slotId: string,
  lock: "share" | "update" = "share",
): Promise<{ campaign: CampaignRow; slot: CampaignSlotRow }> {
  const lockClause = lock === "update" ? "FOR UPDATE OF campaign, slot" : "FOR SHARE OF campaign, slot";
  const row = (await client.query<CampaignRow & CampaignSlotRow>(`
    SELECT
      campaign.campaign_id, campaign.owner_id, campaign.stage, campaign.model_id,
      campaign.evaluation_unit_key, campaign.code_sha, campaign.max_provider_requests,
      campaign.budget_limit_minor, campaign.budget_currency,
      campaign.reserved_provider_requests AS campaign_reserved_provider_requests,
      campaign.reserved_budget_minor AS campaign_reserved_budget_minor,
      campaign.status AS campaign_status, campaign.manifest_sha256, campaign.closure_sha256,
      slot.slot_id, slot.campaign_id AS slot_campaign_id, slot.case_id, slot.sample_id,
      slot.resolved_prompt_sha256, slot.native_parameters_sha256, slot.reference_inputs_sha256,
      slot.requested_image_count, slot.max_provider_requests AS slot_max_provider_requests,
      slot.price_minor_per_provider_request, slot.budget_limit_minor AS slot_budget_limit_minor,
      slot.authorization_id, slot.run_id,
      slot.reserved_provider_requests AS slot_reserved_provider_requests,
      slot.reserved_budget_minor AS slot_reserved_budget_minor,
      slot.status AS slot_status
    FROM evaluation_campaigns campaign
    JOIN evaluation_campaign_slots slot ON slot.campaign_id = campaign.campaign_id
    WHERE campaign.campaign_id = $1 AND slot.slot_id = $2
    ${lockClause}
  `, [campaignId, slotId])).rows[0];
  if (!row) throw new Error("sealed evaluation campaign slot was not found");
  const campaign: CampaignRow = {
    campaign_id: row.campaign_id,
    owner_id: row.owner_id,
    stage: row.stage,
    model_id: row.model_id,
    evaluation_unit_key: row.evaluation_unit_key,
    code_sha: row.code_sha,
    max_provider_requests: row.max_provider_requests,
    budget_limit_minor: row.budget_limit_minor,
    budget_currency: row.budget_currency,
    reserved_provider_requests: Number((row as unknown as { campaign_reserved_provider_requests: number }).campaign_reserved_provider_requests),
    reserved_budget_minor: (row as unknown as { campaign_reserved_budget_minor: number | string }).campaign_reserved_budget_minor,
    status: (row as unknown as { campaign_status: EvaluationCampaignStatus }).campaign_status,
    manifest_sha256: row.manifest_sha256,
    closure_sha256: row.closure_sha256,
  };
  const slot: CampaignSlotRow = {
    slot_id: row.slot_id,
    campaign_id: (row as unknown as { slot_campaign_id: string }).slot_campaign_id,
    case_id: row.case_id,
    sample_id: row.sample_id,
    resolved_prompt_sha256: row.resolved_prompt_sha256,
    native_parameters_sha256: row.native_parameters_sha256,
    reference_inputs_sha256: row.reference_inputs_sha256,
    requested_image_count: row.requested_image_count,
    max_provider_requests: (row as unknown as { slot_max_provider_requests: number }).slot_max_provider_requests,
    price_minor_per_provider_request: row.price_minor_per_provider_request,
    budget_limit_minor: (row as unknown as { slot_budget_limit_minor: number | string }).slot_budget_limit_minor,
    authorization_id: row.authorization_id,
    run_id: row.run_id,
    reserved_provider_requests: (row as unknown as { slot_reserved_provider_requests: number }).slot_reserved_provider_requests,
    reserved_budget_minor: (row as unknown as { slot_reserved_budget_minor: number | string }).slot_reserved_budget_minor,
    status: (row as unknown as { slot_status: EvaluationCampaignSlotStatus }).slot_status,
  };
  return { campaign, slot };
}

function assertBindingMatchesSlot(
  campaign: CampaignRow,
  slot: CampaignSlotRow,
  input: EvaluationCampaignAuthorizationBinding,
): void {
  if (campaign.status !== "ready") throw new Error(`evaluation campaign status is ${campaign.status}`);
  if (campaign.owner_id !== input.ownerId) throw new Error("evaluation campaign does not belong to authorization owner");
  if (campaign.model_id !== input.modelId || campaign.evaluation_unit_key !== input.evaluationUnitKey) {
    throw new Error("authorization model or exact unit differs from sealed campaign");
  }
  if (
    slot.max_provider_requests !== input.maxProviderRequests
    || safeInteger(slot.price_minor_per_provider_request, "slot price", 1) !== input.priceMinorPerProviderRequest
    || safeInteger(slot.budget_limit_minor, "slot budget", 1) !== input.budgetLimitMinor
    || campaign.budget_currency !== input.budgetCurrency
  ) {
    throw new Error("authorization caps or currency differ from sealed campaign slot");
  }
}

/** The global implementation switch is ready; every paid path still validates a real sealed campaign. */
export function assertEvaluationCampaignReady(): void {
  if (EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS !== "ready") {
    throw new Error(EVALUATION_CAMPAIGN_BLOCKER_DETAIL);
  }
}

/** Create a one-way campaign manifest and its exact immutable slots. */
export async function createSealedEvaluationCampaign(
  client: PoolClient,
  actor: AuthUser,
  input: EvaluationCampaignManifest,
  now = Date.now(),
): Promise<{ campaignId: string; manifestSha256: string }> {
  assertEvaluationCampaignReady();
  if (actor.role !== "admin") throw new Error("only an administrator may seal an evaluation campaign");
  assertCampaignManifest(input);
  const users = (await client.query<{
    id: string;
    role: "admin" | "user";
    active: number;
    deleted_at: string | null;
  }>(`
    SELECT id, role, active, deleted_at FROM users WHERE id = ANY($1::text[]) FOR SHARE
  `, [[actor.id, input.ownerId]])).rows;
  const persistedActor = users.find((user) => user.id === actor.id);
  const owner = users.find((user) => user.id === input.ownerId);
  if (!persistedActor || persistedActor.role !== "admin" || persistedActor.active !== 1 || persistedActor.deleted_at) {
    throw new Error("campaign administrator is not an active persisted administrator");
  }
  if (!owner || owner.role !== "admin" || owner.active !== 1 || owner.deleted_at) {
    throw new Error("campaign owner must be an active persisted administrator");
  }
  const manifestSha256 = sha256(campaignManifestPayload(input));
  const inserted = await client.query(`
    INSERT INTO evaluation_campaigns (
      campaign_id, owner_id, created_by_admin_id, stage, model_id,
      evaluation_unit_key, code_sha, max_provider_requests, budget_limit_minor,
      budget_currency, status, manifest_sha256, created_at,
      envelope_inputs_json, envelope_inputs_sha256, evaluation_version, flow_json_sha256
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ready', $11, $12, $13, $14, $15, $16)
    ON CONFLICT (campaign_id) DO NOTHING
  `, [
    input.campaignId, input.ownerId, actor.id, input.stage, input.modelId,
    input.authorizationUnitKey, input.codeSha, input.maxProviderRequests,
    input.budgetLimitMinor, input.budgetCurrency, manifestSha256, now,
    input.inputsCanonicalJson, input.inputsSha256, input.evaluationVersion, input.flowJsonSha256,
  ]);
  if (inserted.rowCount !== 1) throw new Error("campaignId already exists; a sealed campaign cannot be replaced");
  for (const slot of input.slots) {
    await client.query(`
      INSERT INTO evaluation_campaign_slots (
        slot_id, campaign_id, case_id, sample_id, resolved_prompt_sha256,
        native_parameters_sha256, reference_inputs_sha256, requested_image_count,
        max_provider_requests, price_minor_per_provider_request, budget_limit_minor,
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ready', $12)
    `, [
      slot.slotId, input.campaignId, slot.caseId, slot.sampleId,
      slot.resolvedPromptSha256, slot.nativeParametersSha256,
      slot.referenceInputsSha256, slot.requestedImageCount,
      slot.maxProviderRequests, slot.priceMinorPerProviderRequest,
      slot.budgetLimitMinor, now,
    ]);
  }
  return { campaignId: input.campaignId, manifestSha256 };
}

/** Verify that a one-time authorization exactly mirrors a sealed campaign slot. */
export async function assertEvaluationCampaignSlotAllowsAuthorization(
  client: PoolClient,
  input: EvaluationCampaignAuthorizationBinding,
): Promise<void> {
  assertId(input.campaignId, EVALUATION_CAMPAIGN_ID_PATTERN, "campaignId");
  assertId(input.slotId, EVALUATION_CAMPAIGN_SLOT_ID_PATTERN, "slotId");
  const { campaign, slot } = await lockedCampaignSlot(client, input.campaignId, input.slotId);
  assertBindingMatchesSlot(campaign, slot, input);
  if (slot.authorization_id !== null || slot.run_id !== null) {
    throw new Error("sealed campaign slot already has an authorization or run binding");
  }
  const existing = (await client.query<{ authorization_id: string }>(`
    SELECT authorization_id FROM evaluation_run_authorizations
    WHERE campaign_id = $1 AND slot_id = $2
    FOR SHARE
  `, [input.campaignId, input.slotId])).rows[0];
  if (existing) throw new Error("sealed campaign slot already has an authorization record");
}

/** Lock a slot while a run is being created; the caller consumes it in the same transaction. */
export async function lockEvaluationCampaignSlotForRunAuthorization(
  client: PoolClient,
  input: EvaluationCampaignRunAuthorizationBinding,
): Promise<LockedEvaluationCampaignSlot> {
  assertId(input.caseId, CASE_ID_PATTERN, "caseId");
  assertId(input.sampleId, SAMPLE_ID_PATTERN, "sampleId");
  const { campaign, slot } = await lockedCampaignSlot(client, input.campaignId, input.slotId, "update");
  assertBindingMatchesSlot(campaign, slot, input);
  if (slot.case_id !== input.caseId || slot.sample_id !== input.sampleId) {
    throw new Error("evaluation policy caseId or sampleId differs from the sealed campaign slot");
  }
  if (slot.authorization_id !== null || slot.run_id !== null || slot.status !== "ready") {
    throw new Error("sealed campaign slot is already bound or no longer ready");
  }
  return { ...input, campaignManifestSha256: campaign.manifest_sha256 };
}

/** Bind the sealed slot to the consumed authorization and durable run exactly once. */
export async function bindEvaluationCampaignSlotToRun(
  client: PoolClient,
  locked: LockedEvaluationCampaignSlot,
  authorizationId: string,
  runId: string,
): Promise<void> {
  const updated = await client.query(`
    UPDATE evaluation_campaign_slots SET authorization_id = $1, run_id = $2
    WHERE campaign_id = $3 AND slot_id = $4
      AND authorization_id IS NULL AND run_id IS NULL AND status = 'ready'
  `, [authorizationId, runId, locked.campaignId, locked.slotId]);
  if (updated.rowCount !== 1) throw new Error("sealed campaign slot was concurrently bound");
}

/** Compare real runtime payload hashes with the sealed slot and reserve the next Provider boundary. */
export async function reserveEvaluationCampaignProviderRequest(
  client: PoolClient,
  input: {
    campaignId: string;
    slotId: string;
    authorizationId: string;
    runId: string;
    requestIndex: number;
    runtime: EvaluationCampaignSlotRuntimeBinding;
  },
): Promise<void> {
  const { campaign, slot } = await lockedCampaignSlot(client, input.campaignId, input.slotId, "update");
  if (campaign.status !== "ready") throw new Error(`evaluation campaign status is ${campaign.status}`);
  if (slot.authorization_id !== input.authorizationId || slot.run_id !== input.runId) {
    throw new Error("evaluation campaign slot is not bound to this authorization/run");
  }
  if (slot.status !== "ready" && slot.status !== "running") {
    throw new Error(`evaluation campaign slot status is ${slot.status}`);
  }
  const runtime = input.runtime;
  if (
    campaign.code_sha !== runtime.codeSha
    || campaign.model_id !== runtime.modelId
    || campaign.evaluation_unit_key !== runtime.authorizationUnitKey
    || slot.resolved_prompt_sha256 !== runtime.resolvedPromptSha256
    || slot.native_parameters_sha256 !== runtime.nativeParametersSha256
    || slot.reference_inputs_sha256 !== runtime.referenceInputsSha256
    || slot.requested_image_count !== runtime.requestedImageCount
  ) {
    throw new Error("actual Provider request differs from its sealed campaign slot");
  }
  assertPositiveInteger(input.requestIndex, "requestIndex", MAX_PROVIDER_REQUESTS);
  const campaignReservedRequests = safeInteger(campaign.reserved_provider_requests, "campaign reserved request count");
  const campaignReservedBudget = safeInteger(campaign.reserved_budget_minor, "campaign reserved budget");
  const slotReservedRequests = safeInteger(slot.reserved_provider_requests, "slot reserved request count");
  const slotReservedBudget = safeInteger(slot.reserved_budget_minor, "slot reserved budget");
  const price = safeInteger(slot.price_minor_per_provider_request, "slot price", 1);
  const campaignBudget = safeInteger(campaign.budget_limit_minor, "campaign budget", 1);
  const slotBudget = safeInteger(slot.budget_limit_minor, "slot budget", 1);
  if (
    input.requestIndex !== slotReservedRequests + 1
    || slotReservedRequests >= slot.max_provider_requests
    || campaignReservedRequests >= campaign.max_provider_requests
    || slotReservedBudget + price > slotBudget
    || campaignReservedBudget + price > campaignBudget
  ) {
    throw new Error("sealed campaign request or budget cap would be exceeded");
  }
  const slotUpdated = await client.query(`
    UPDATE evaluation_campaign_slots
    SET status = 'running', reserved_provider_requests = reserved_provider_requests + 1,
      reserved_budget_minor = reserved_budget_minor + price_minor_per_provider_request
    WHERE campaign_id = $1 AND slot_id = $2
      AND reserved_provider_requests = $3 AND reserved_budget_minor = $4
  `, [input.campaignId, input.slotId, slotReservedRequests, slotReservedBudget]);
  if (slotUpdated.rowCount !== 1) throw new Error("campaign slot reservation changed concurrently");
  const campaignUpdated = await client.query(`
    UPDATE evaluation_campaigns
    SET reserved_provider_requests = reserved_provider_requests + 1,
      reserved_budget_minor = reserved_budget_minor + $1
    WHERE campaign_id = $2
      AND reserved_provider_requests = $3 AND reserved_budget_minor = $4
      AND reserved_provider_requests + 1 <= max_provider_requests
      AND reserved_budget_minor + $1 <= budget_limit_minor
      AND status = 'ready'
  `, [price, input.campaignId, campaignReservedRequests, campaignReservedBudget]);
  if (campaignUpdated.rowCount !== 1) throw new Error("campaign reservation changed concurrently");
}

/** Finalize the slot; unresolved, failed, and cancelled cases stop the entire campaign. */
export async function finalizeEvaluationCampaignSlot(
  client: PoolClient,
  input: {
    campaignId: string;
    slotId: string;
    authorizationId: string;
    runId: string;
    outcome: "succeeded" | "failed" | "outcome_unknown" | "cancelled";
  },
): Promise<void> {
  const { campaign, slot } = await lockedCampaignSlot(client, input.campaignId, input.slotId, "update");
  if (slot.authorization_id !== input.authorizationId || slot.run_id !== input.runId) {
    throw new Error("evaluation campaign slot is not bound to this authorization/run");
  }
  if (slot.status === input.outcome) return;
  if (["succeeded", "failed", "outcome_unknown", "cancelled"].includes(slot.status)) {
    throw new Error("evaluation campaign slot was already finalized with another outcome");
  }
  const updated = await client.query(`
    UPDATE evaluation_campaign_slots SET status = $1
    WHERE campaign_id = $2 AND slot_id = $3 AND status IN ('ready','running')
  `, [input.outcome, input.campaignId, input.slotId]);
  if (updated.rowCount !== 1) throw new Error("evaluation campaign slot changed before finalization");
  if (input.outcome !== "succeeded" && campaign.status === "ready") {
    const stopped = await client.query(`
      UPDATE evaluation_campaigns SET status = 'stopped'
      WHERE campaign_id = $1 AND status = 'ready'
    `, [input.campaignId]);
    if (stopped.rowCount !== 1) throw new Error("evaluation campaign changed before it could be stopped");
  }
}

/** Load every slot from one campaign; a gate must never accept an operator-chosen subset. */
export async function loadEvaluationCampaignForGate(
  client: PoolClient,
  input: { campaignId: string; ownerId: string; stage: PaidEvaluationCampaignStage; codeSha: string },
): Promise<EvaluationCampaignGateSnapshot> {
  assertId(input.campaignId, EVALUATION_CAMPAIGN_ID_PATTERN, "campaignId");
  const campaign = (await client.query<CampaignRow>(`
    SELECT * FROM evaluation_campaigns WHERE campaign_id = $1 FOR SHARE
  `, [input.campaignId])).rows[0];
  if (!campaign) throw new Error("sealed evaluation campaign was not found");
  const snapshot = campaignFromRow(campaign);
  if (snapshot.ownerId !== input.ownerId || snapshot.stage !== input.stage || snapshot.codeSha !== input.codeSha) {
    throw new Error("evaluation campaign does not match gate owner, stage, or code SHA");
  }
  if (snapshot.status === "stopped") throw new Error("evaluation campaign stopped after a failed or unresolved case");
  const rows = (await client.query<CampaignSlotRow & {
    case_evidence_id: string | null;
    evidence_record_sha256: string | null;
    evidence_outcome: string | null;
  }>(`
    SELECT slot.*, evidence.id AS case_evidence_id, evidence.evidence_record_sha256,
      evidence.outcome AS evidence_outcome
    FROM evaluation_campaign_slots slot
    LEFT JOIN evaluation_case_evidence evidence
      ON evidence.campaign_id = slot.campaign_id
      AND evidence.slot_id = slot.slot_id
      AND evidence.run_id = slot.run_id
      AND evidence.authorization_id = slot.authorization_id
    WHERE slot.campaign_id = $1
    ORDER BY slot.slot_id ASC
    FOR SHARE OF slot
  `, [input.campaignId])).rows;
  if (rows.length < 1) throw new Error("sealed evaluation campaign has no slots");
  const slots = rows.map((slot) => {
    if (
      slot.status !== "succeeded"
      || !slot.authorization_id
      || !slot.run_id
      || !slot.case_evidence_id
      || !SHA256_PATTERN.test(slot.evidence_record_sha256 ?? "")
      || slot.evidence_outcome !== "succeeded"
    ) {
      throw new Error("evaluation campaign cannot gate until every sealed slot has succeeded evidence");
    }
    return { slotId: slot.slot_id, caseEvidenceId: slot.case_evidence_id, runId: slot.run_id };
  });
  return { ...snapshot, slots };
}

interface ClosureSlotRow extends CampaignSlotRow {
  case_evidence_id: string;
  evidence_record_sha256: string;
  billing_reconciliation_status: "confirmed-not-billed" | "confirmed-billed" | "pending" | "not-required";
  billing_tail_sha256: string | null;
  manual_tail_sha256: string | null;
}

/** Build the closure payload from relational evidence while all rows remain share-locked. */
export async function buildEvaluationCampaignClosure(
  client: PoolClient,
  input: { campaignId: string; ownerId: string; stage: PaidEvaluationCampaignStage; codeSha: string; closedBy: string; closedAt?: string },
): Promise<EvaluationCampaignClosure> {
  const gate = await loadEvaluationCampaignForGate(client, input);
  const campaign = (await client.query<CampaignRow>(`
    SELECT * FROM evaluation_campaigns WHERE campaign_id = $1 FOR SHARE
  `, [input.campaignId])).rows[0];
  if (!campaign) throw new Error("sealed evaluation campaign disappeared while building closure");
  const rows = (await client.query<ClosureSlotRow>(`
    SELECT
      slot.*,
      evidence.id AS case_evidence_id, evidence.evidence_record_sha256,
      evidence.billing_reconciliation_status,
      (
        SELECT event_sha256 FROM evaluation_billing_reconciliation_events billing
        WHERE billing.case_evidence_id = evidence.id
        ORDER BY billing.created_at DESC, billing.id DESC LIMIT 1
      ) AS billing_tail_sha256,
      (
        SELECT event_sha256 FROM evaluation_manual_assessment_events manual
        WHERE manual.case_evidence_id = evidence.id
        ORDER BY manual.created_at DESC, manual.id DESC LIMIT 1
      ) AS manual_tail_sha256
    FROM evaluation_campaign_slots slot
    JOIN evaluation_case_evidence evidence
      ON evidence.campaign_id = slot.campaign_id
      AND evidence.slot_id = slot.slot_id
      AND evidence.run_id = slot.run_id
      AND evidence.authorization_id = slot.authorization_id
    WHERE slot.campaign_id = $1
    ORDER BY slot.slot_id ASC
    FOR SHARE OF slot, evidence
  `, [input.campaignId])).rows;
  if (rows.length !== gate.slots.length) throw new Error("campaign closure lost a sealed slot");
  const imageRows = (await client.query<{
    case_evidence_id: string;
    id: string;
    output_index: number;
    layer: string;
    artifact_sha256: string;
    mime_type: string;
    width: number;
    height: number;
    byte_length: number;
    source_evidence_id: string | null;
    provider_request_evidence_id: string | null;
  }>(`
    SELECT image.case_evidence_id, image.id, image.output_index, image.layer,
      image.artifact_sha256, image.mime_type, image.width, image.height,
      image.byte_length, image.source_evidence_id, image.provider_request_evidence_id
    FROM evaluation_image_evidence image
    JOIN evaluation_case_evidence evidence ON evidence.id = image.case_evidence_id
    WHERE evidence.campaign_id = $1
    ORDER BY image.case_evidence_id ASC, image.output_index ASC, image.layer ASC, image.id ASC
    FOR SHARE OF image, evidence
  `, [input.campaignId])).rows;
  const imagesByCase = new Map<string, Array<Record<string, unknown>>>();
  for (const image of imageRows) {
    const entries = imagesByCase.get(image.case_evidence_id) ?? [];
    entries.push({
      id: image.id,
      outputIndex: image.output_index,
      layer: image.layer,
      artifactSha256: image.artifact_sha256,
      mimeType: image.mime_type,
      width: image.width,
      height: image.height,
      byteLength: image.byte_length,
      sourceEvidenceId: image.source_evidence_id,
      providerRequestEvidenceId: image.provider_request_evidence_id,
    });
    imagesByCase.set(image.case_evidence_id, entries);
  }
  const slots = rows.map((row) => {
    if (
      row.status !== "succeeded"
      || !row.authorization_id
      || !row.run_id
      || !SHA256_PATTERN.test(row.evidence_record_sha256 ?? "")
      || (row.billing_reconciliation_status !== "confirmed-not-billed" && row.billing_reconciliation_status !== "confirmed-billed")
      || !row.manual_tail_sha256
    ) {
      throw new Error("campaign closure requires succeeded, reconciled, manually reviewed evidence for every slot");
    }
    const images = imagesByCase.get(row.case_evidence_id) ?? [];
    if (images.length < 2) throw new Error("campaign closure requires both immutable image evidence layers");
    return {
      slotId: row.slot_id,
      caseId: row.case_id,
      sampleId: row.sample_id,
      authorizationId: row.authorization_id,
      runId: row.run_id,
      caseEvidenceId: row.case_evidence_id,
      evidenceRecordSha256: row.evidence_record_sha256,
      billingReconciliationStatus: row.billing_reconciliation_status,
      billingTailSha256: row.billing_tail_sha256,
      manualAssessmentTailSha256: row.manual_tail_sha256,
      imageArtifactSetSha256: sha256({ schemaVersion: 1, images }),
    } as EvaluationCampaignClosureSlot;
  });
  const closedAt = input.closedAt ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(closedAt))) throw new Error("campaign closure timestamp is invalid");
  if (!input.closedBy.trim()) throw new Error("campaign closure requires an administrator");
  const base: Omit<EvaluationCampaignClosure, "artifactSha256"> = {
    schemaVersion: 1,
    artifactType: "evaluation-campaign-closure",
    campaignId: gate.campaignId,
    ownerId: gate.ownerId,
    stage: gate.stage,
    modelId: gate.modelId,
    authorizationUnitKey: gate.authorizationUnitKey,
    codeSha: gate.codeSha,
    manifestSha256: gate.manifestSha256,
    campaignRequestCap: campaign.max_provider_requests,
    campaignBudgetLimitMinor: safeInteger(campaign.budget_limit_minor, "campaign budget", 1),
    budgetCurrency: campaign.budget_currency,
    campaignReservedProviderRequests: campaign.reserved_provider_requests,
    campaignReservedBudgetMinor: safeInteger(campaign.reserved_budget_minor, "campaign reserved budget"),
    slots,
    imageArtifactSetSha256: sha256({
      schemaVersion: 1,
      slots: slots.map((slot) => ({ slotId: slot.slotId, imageArtifactSetSha256: slot.imageArtifactSetSha256 })),
    }),
    closedBy: input.closedBy,
    closedAt,
  };
  return { ...base, artifactSha256: sha256(base) };
}

export function validateEvaluationCampaignClosure(value: unknown): EvaluationCampaignClosure {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("campaign closure is invalid");
  const closure = value as EvaluationCampaignClosure;
  const expectedFields = [
    "schemaVersion", "artifactType", "campaignId", "ownerId", "stage", "modelId",
    "authorizationUnitKey", "codeSha", "manifestSha256", "campaignRequestCap",
    "campaignBudgetLimitMinor", "budgetCurrency", "campaignReservedProviderRequests",
    "campaignReservedBudgetMinor", "slots", "imageArtifactSetSha256", "closedBy", "closedAt",
    "artifactSha256",
  ];
  const actualFields = Object.keys(closure).sort();
  if (actualFields.length !== expectedFields.length || actualFields.some((field) => !expectedFields.includes(field))) {
    throw new Error("campaign closure has unexpected fields");
  }
  if (closure.schemaVersion !== 1 || closure.artifactType !== "evaluation-campaign-closure") {
    throw new Error("campaign closure schema is invalid");
  }
  assertId(closure.campaignId, EVALUATION_CAMPAIGN_ID_PATTERN, "campaign closure campaignId");
  if (!closure.ownerId || !closure.closedBy) throw new Error("campaign closure ownership is invalid");
  if (!["provider-probe", "internal-experiment", "formal-validation"].includes(closure.stage)) {
    throw new Error("campaign closure stage is invalid");
  }
  if (!isImageModelId(closure.modelId) || !CONTRACT_HASH_PATTERN.test(closure.authorizationUnitKey)) {
    throw new Error("campaign closure model or unit is invalid");
  }
  if (!CODE_SHA_PATTERN.test(closure.codeSha) || !SHA256_PATTERN.test(closure.manifestSha256)) {
    throw new Error("campaign closure identity hashes are invalid");
  }
  assertPositiveInteger(closure.campaignRequestCap, "campaign closure request cap");
  assertPositiveInteger(closure.campaignBudgetLimitMinor, "campaign closure budget cap");
  if (!CURRENCY_PATTERN.test(closure.budgetCurrency)) throw new Error("campaign closure currency is invalid");
  if (!Number.isSafeInteger(closure.campaignReservedProviderRequests) || closure.campaignReservedProviderRequests < 0 || closure.campaignReservedProviderRequests > closure.campaignRequestCap) {
    throw new Error("campaign closure reserved request count is invalid");
  }
  if (!Number.isSafeInteger(closure.campaignReservedBudgetMinor) || closure.campaignReservedBudgetMinor < 0 || closure.campaignReservedBudgetMinor > closure.campaignBudgetLimitMinor) {
    throw new Error("campaign closure reserved budget is invalid");
  }
  if (!Array.isArray(closure.slots) || closure.slots.length < 1) throw new Error("campaign closure slots are invalid");
  const slotIds = new Set<string>();
  for (const slot of closure.slots) {
    assertId(slot.slotId, EVALUATION_CAMPAIGN_SLOT_ID_PATTERN, "campaign closure slotId");
    assertId(slot.caseId, CASE_ID_PATTERN, "campaign closure caseId");
    assertId(slot.sampleId, SAMPLE_ID_PATTERN, "campaign closure sampleId");
    if (!slot.authorizationId || !slot.runId || !slot.caseEvidenceId) throw new Error("campaign closure slot binding is invalid");
    assertHash(slot.evidenceRecordSha256, "campaign closure evidenceRecordSha256");
    if (slot.billingReconciliationStatus !== "confirmed-not-billed" && slot.billingReconciliationStatus !== "confirmed-billed") {
      throw new Error("campaign closure billing state is invalid");
    }
    if (slot.billingTailSha256 !== null) assertHash(slot.billingTailSha256, "campaign closure billingTailSha256");
    assertHash(slot.manualAssessmentTailSha256 ?? "", "campaign closure manualAssessmentTailSha256");
    assertHash(slot.imageArtifactSetSha256, "campaign closure imageArtifactSetSha256");
    if (slotIds.has(slot.slotId)) throw new Error("campaign closure slot IDs must be unique");
    slotIds.add(slot.slotId);
  }
  assertHash(closure.imageArtifactSetSha256, "campaign closure imageArtifactSetSha256");
  if (!Number.isFinite(Date.parse(closure.closedAt))) throw new Error("campaign closure closedAt is invalid");
  assertHash(closure.artifactSha256, "campaign closure artifactSha256");
  const { artifactSha256, ...base } = closure;
  if (sha256(base) !== artifactSha256) throw new Error("campaign closure artifact SHA-256 does not match its content");
  return closure;
}

/** Store the closure digest only after all slots are successful and the artifact has been independently written. */
export async function sealEvaluationCampaignClosure(
  client: PoolClient,
  closureInput: EvaluationCampaignClosure,
): Promise<void> {
  const closure = validateEvaluationCampaignClosure(closureInput);
  const campaign = (await client.query<CampaignRow>(`
    SELECT * FROM evaluation_campaigns WHERE campaign_id = $1 FOR UPDATE
  `, [closure.campaignId])).rows[0];
  if (!campaign) throw new Error("campaign closure references an unknown campaign");
  const snapshot = campaignFromRow(campaign);
  if (
    snapshot.ownerId !== closure.ownerId
    || snapshot.stage !== closure.stage
    || snapshot.modelId !== closure.modelId
    || snapshot.authorizationUnitKey !== closure.authorizationUnitKey
    || snapshot.codeSha !== closure.codeSha
    || snapshot.manifestSha256 !== closure.manifestSha256
  ) {
    throw new Error("campaign closure does not match the sealed campaign manifest");
  }
  if (campaign.status === "closed") {
    if (campaign.closure_sha256 !== closure.artifactSha256) {
      throw new Error("sealed campaign already references a different closure artifact");
    }
    return;
  }
  if (campaign.status !== "ready") throw new Error(`evaluation campaign status is ${campaign.status}`);
  const slotRows = (await client.query<{
    slot_id: string;
    status: EvaluationCampaignSlotStatus;
    authorization_id: string | null;
    run_id: string | null;
  }>(`
    SELECT slot_id, status, authorization_id, run_id
    FROM evaluation_campaign_slots WHERE campaign_id = $1 FOR UPDATE
  `, [closure.campaignId])).rows;
  if (slotRows.length !== closure.slots.length || slotRows.some((slot) => slot.status !== "succeeded")) {
    throw new Error("campaign closure requires every sealed slot to have succeeded");
  }
  for (const slot of closure.slots) {
    const persisted = slotRows.find((candidate) => candidate.slot_id === slot.slotId);
    if (!persisted || persisted.authorization_id !== slot.authorizationId || persisted.run_id !== slot.runId) {
      throw new Error("campaign closure slot binding does not match persisted ledger");
    }
  }
  const updated = await client.query(`
    UPDATE evaluation_campaigns
    SET status = 'closed', closure_sha256 = $1, closed_at = $2
    WHERE campaign_id = $3 AND status = 'ready' AND closure_sha256 IS NULL
  `, [closure.artifactSha256, Date.parse(closure.closedAt), closure.campaignId]);
  if (updated.rowCount !== 1) throw new Error("campaign changed before closure could be sealed");
}
