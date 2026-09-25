import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { isImageModelId, type ImageModelId } from "../../src/types/imageModels";
import { NODE_SPECS, generationKindOf, type ExecutionPlan, type NodeExecution } from "../../src/types/workflow";
import type { AuthUser } from "./auth";
import {
  EVALUATION_AUTHORIZATION_ID_PATTERN,
  EvaluationRunPolicyError,
  type EvaluationRunPolicy,
} from "./evaluationRunPolicy";
import {
  assertEvaluationCampaignSlotAllowsAuthorization,
  bindEvaluationCampaignSlotToRun,
  lockEvaluationCampaignSlotForRunAuthorization,
  type LockedEvaluationCampaignSlot,
} from "./evaluationCampaign";

const EVALUATION_UNIT_KEY_PATTERN = /^sha256:[a-f0-9]{64}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MAX_AUTHORIZED_PROVIDER_REQUESTS = 8;

export type EvaluationAuthorizationScope = {
  type: "evaluation-unit";
  modelId: ImageModelId;
  evaluationUnitKey: `sha256:${string}`;
};

export interface EvaluationAuthorizationRegistration {
  authorizationId: string;
  ownerId: string;
  campaignId: string;
  slotId: string;
  scope: EvaluationAuthorizationScope;
  maxProviderRequests: number;
  /** Reviewed worst-case price for one Provider request, in the smallest currency unit. */
  priceMinorPerProviderRequest: number;
  /** Approved worst-case amount in the smallest unit of `budgetCurrency`. */
  budgetLimitMinor: number;
  budgetCurrency: string;
  expiresAt: number;
  reason: string;
}

export interface EvaluationAuthorizationTarget {
  modelId: ImageModelId;
  promptVariantId: string;
  evaluationUnitKey: `sha256:${string}`;
  maximumProviderRequests: number;
}

interface AuthorizationRow {
  authorization_id: string;
  owner_id: string;
  campaign_id: string;
  slot_id: string;
  scope_type: "prompt-variant" | "evaluation-unit";
  model_id: string;
  prompt_variant_id: string | null;
  evaluation_unit_key: string | null;
  max_provider_requests: number;
  price_minor_per_provider_request: number | string;
  budget_limit_minor: number | string;
  budget_currency: string;
  expires_at: number | string;
  status: "active" | "consumed" | "revoked" | "expired";
  bound_case_id: string | null;
  bound_run_id: string | null;
  reserved_provider_requests: number;
  used_provider_requests: number;
  reserved_budget_minor: number | string;
  used_budget_minor: number | string;
}

export interface LockedEvaluationAuthorization {
  authorizationId: string;
  campaignId: string;
  slotId: string;
  target: EvaluationAuthorizationTarget;
  budgetLimitMinor: number;
  budgetCurrency: string;
  priceMinorPerProviderRequest: number;
  reservedBudgetMinor: number;
  campaignSlot: LockedEvaluationCampaignSlot;
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

function databaseSafeInteger(value: number | string, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new EvaluationRunPolicyError(`真实评估授权的 ${field} 不是安全整数`, 409);
  }
  return parsed;
}

function providerStep(plan: ExecutionPlan): NodeExecution {
  // v8：付费节点判定按生成语义 kind（image-generator → image），v7 的 image 别名继续放行。
  const providerSteps = plan.steps.filter((step) => generationKindOf(step.kind) === "image");
  if (providerSteps.length !== 1) {
    throw new EvaluationRunPolicyError("每个真实评估 case 必须且只能包含一个付费节点", 400);
  }
  return providerSteps[0];
}

function maximumProviderRequestsForStep(step: NodeExecution): number {
  // v7：一色一图 / count 分批机制删除（Q4=A）；张数一律由 batchSize 表达。
  if (generationKindOf(step.kind) === "image") {
    return Math.max(1, Math.min(8, Math.floor(Number(step.params.batchSize) || 1)));
  }
  return 1;
}

/** Exact authorization scope derived from the already-admitted provider step. */
export function evaluationAuthorizationTargetFromPlan(plan: ExecutionPlan): EvaluationAuthorizationTarget {
  const step = providerStep(plan);
  const modelId = step.params.modelId;
  const promptVariantId = step.params.promptVariantId;
  if (!isImageModelId(modelId) || typeof promptVariantId !== "string" || !promptVariantId.trim()) {
    throw new EvaluationRunPolicyError("真实评估计划缺少明确的模型或提示词变体绑定", 400);
  }
  const unitEnvelope = {
    nodeKind: step.kind,
    modelId,
    promptVariantId,
    promptFamilyId: step.params.promptFamilyId,
    operationMode: step.params.operationMode,
    parameterProfileId: step.params.parameterProfileId,
    contractHash: step.params.contractHash,
    evaluationVersion: step.params.evaluationVersion,
    postprocessVersion: step.params.postprocessVersion,
    aspectRatio: step.params.aspectRatio,
    batchSize: step.params.batchSize,
    modelOptions: step.params.modelOptions ?? {},
  };

  // Ruling 62-envelope-authority-ruling.md sec3:
  // 12-field assertion: any undefined/null → throw immediately.
  // Silently producing a degraded key (C degradation) is forbidden.
  for (const [key, value] of Object.entries(unitEnvelope)) {
    if (value === undefined || value === null) {
      throw new EvaluationRunPolicyError(
        `evaluation unit envelope field "${key}" is ${String(value)} — ` +
          `all 12 fields must be present. Caused by: variant registry missing data ` +
          `or project flow node missing upstream inputs.`,
        400,
      );
    }
  }

  // Ruling 62-envelope-authority-ruling.md sec3: nodeKind must be
  // "image-generator" in the envelope. The alias "image" is only accepted
  // in the admission layer (promptRunAdmission.ts:376) during the R-89
  // transition; normalising it here would create two sources of truth.
  if (unitEnvelope.nodeKind !== "image-generator") {
    throw new EvaluationRunPolicyError(
      `evaluation unit envelope nodeKind must be "image-generator", got "${String(unitEnvelope.nodeKind)}"`,
      400,
    );
  }
  return {
    modelId,
    promptVariantId,
    evaluationUnitKey: `sha256:${createHash("sha256").update(canonicalJson(unitEnvelope)).digest("hex")}`,
    maximumProviderRequests: maximumProviderRequestsForStep(step),
  };
}

export function validateEvaluationAuthorizationRegistration(
  actor: AuthUser,
  input: EvaluationAuthorizationRegistration,
  now: number,
): void {
  if (actor.role !== "admin") {
    throw new EvaluationRunPolicyError("只有管理员可以登记真实评估授权", 403);
  }
  if (!EVALUATION_AUTHORIZATION_ID_PATTERN.test(input.authorizationId)) {
    throw new EvaluationRunPolicyError("authorizationId 格式无效", 400);
  }
  if (!input.ownerId.trim()) throw new EvaluationRunPolicyError("授权 ownerId 不能为空", 400);
  if (!EVALUATION_AUTHORIZATION_ID_PATTERN.test(input.campaignId)) {
    throw new EvaluationRunPolicyError("campaignId 格式无效", 400);
  }
  if (!EVALUATION_AUTHORIZATION_ID_PATTERN.test(input.slotId)) {
    throw new EvaluationRunPolicyError("slotId 格式无效", 400);
  }
  if (!isImageModelId(input.scope.modelId)) {
    throw new EvaluationRunPolicyError("授权模型不在当前产品模型集合中", 400);
  }
  if (!EVALUATION_UNIT_KEY_PATTERN.test(input.scope.evaluationUnitKey)) {
    throw new EvaluationRunPolicyError("evaluationUnitKey 必须是 sha256 摘要", 400);
  }
  if (
    !Number.isSafeInteger(input.maxProviderRequests)
    || input.maxProviderRequests < 1
    || input.maxProviderRequests > MAX_AUTHORIZED_PROVIDER_REQUESTS
  ) {
    throw new EvaluationRunPolicyError("maxProviderRequests 必须是 1 到 8 的整数", 400);
  }
  if (!Number.isSafeInteger(input.budgetLimitMinor) || input.budgetLimitMinor < 1) {
    throw new EvaluationRunPolicyError("budgetLimitMinor 必须是正整数最小货币单位", 400);
  }
  if (!Number.isSafeInteger(input.priceMinorPerProviderRequest) || input.priceMinorPerProviderRequest < 1) {
    throw new EvaluationRunPolicyError("priceMinorPerProviderRequest 必须是正整数最小货币单位", 400);
  }
  const worstCaseCostMinor = input.maxProviderRequests * input.priceMinorPerProviderRequest;
  if (!Number.isSafeInteger(worstCaseCostMinor) || worstCaseCostMinor > input.budgetLimitMinor) {
    throw new EvaluationRunPolicyError(
      "maxProviderRequests × priceMinorPerProviderRequest 超过授权预算上限",
      400,
    );
  }
  if (!CURRENCY_PATTERN.test(input.budgetCurrency)) {
    throw new EvaluationRunPolicyError("budgetCurrency 必须是三位大写货币代码", 400);
  }
  if (!Number.isSafeInteger(input.expiresAt) || input.expiresAt <= now) {
    throw new EvaluationRunPolicyError("真实评估授权必须设置未来的有效期", 400);
  }
  if (!input.reason.trim() || input.reason.trim().length > 500) {
    throw new EvaluationRunPolicyError("真实评估授权必须包含 1 到 500 字符的理由", 400);
  }
}

/** Internal-only persistent grant registration; no HTTP management surface is exposed. */
export async function registerEvaluationRunAuthorization(
  client: PoolClient,
  actor: AuthUser,
  input: EvaluationAuthorizationRegistration,
  now = Date.now(),
): Promise<void> {
  validateEvaluationAuthorizationRegistration(actor, input, now);
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
    throw new EvaluationRunPolicyError("登记授权的管理员账号无效", 403);
  }
  if (!owner || owner.role !== "admin" || owner.active !== 1 || owner.deleted_at) {
    throw new EvaluationRunPolicyError("授权目标必须是当前可用的管理员账号", 409);
  }
  await assertEvaluationCampaignSlotAllowsAuthorization(client, {
    campaignId: input.campaignId,
    slotId: input.slotId,
    ownerId: input.ownerId,
    modelId: input.scope.modelId,
    evaluationUnitKey: input.scope.evaluationUnitKey,
    maxProviderRequests: input.maxProviderRequests,
    priceMinorPerProviderRequest: input.priceMinorPerProviderRequest,
    budgetLimitMinor: input.budgetLimitMinor,
    budgetCurrency: input.budgetCurrency,
  });
  const inserted = await client.query(`
    INSERT INTO evaluation_run_authorizations (
      authorization_id, owner_id, created_by_admin_id, campaign_id, slot_id, scope_type, model_id,
      prompt_variant_id, evaluation_unit_key, max_provider_requests,
      price_minor_per_provider_request, budget_limit_minor, budget_currency,
      expires_at, status, created_at, reason
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, $10, $11, $12, $13, 'active', $14, $15)
    ON CONFLICT (authorization_id) DO NOTHING
  `, [
    input.authorizationId, input.ownerId, actor.id, input.campaignId, input.slotId,
    input.scope.type, input.scope.modelId, input.scope.evaluationUnitKey,
    input.maxProviderRequests, input.priceMinorPerProviderRequest,
    input.budgetLimitMinor, input.budgetCurrency,
    input.expiresAt, now, input.reason.trim(),
  ]);
  if (inserted.rowCount !== 1) {
    throw new EvaluationRunPolicyError("authorizationId 已存在，授权记录不可覆盖", 409);
  }
}

function assertAuthorizationMatches(
  row: AuthorizationRow,
  policy: EvaluationRunPolicy,
  ownerId: string,
  target: EvaluationAuthorizationTarget,
  now: number,
): void {
  if (row.owner_id !== ownerId) {
    throw new EvaluationRunPolicyError("真实评估授权不存在或不属于当前运行账号", 403);
  }
  if (row.status !== "active") {
    throw new EvaluationRunPolicyError(`真实评估授权当前状态为 ${row.status}，不能再次使用`, 409);
  }
  if (databaseSafeInteger(row.expires_at, "expires_at") <= now) {
    throw new EvaluationRunPolicyError("真实评估授权已过期", 409);
  }
  if (row.model_id !== target.modelId) {
    throw new EvaluationRunPolicyError("真实评估授权模型与运行模型不匹配", 403);
  }
  if (row.scope_type !== "evaluation-unit") {
    throw new EvaluationRunPolicyError("真实评估只接受精确 evaluation-unit 授权", 403);
  }
  if (row.evaluation_unit_key !== target.evaluationUnitKey) {
    // Ruling 62-envelope-authority-ruling.md acceptance 18:
    // surface the route-computed envelope fields so a field-level diff
    // against the sealed ledger is self-evident (no blind 403).
    throw new EvaluationRunPolicyError(
      `真实评估授权单位与运行计划不匹配. ` +
        `route-computed evaluationUnitKey: ${target.evaluationUnitKey}. ` +
        `To reconstruct the sealed envelope, compare this key with the ` +
        `ledger's evaluation_unit_key: ${row.evaluation_unit_key}`,
      403,
    );
  }
  if (target.maximumProviderRequests > row.max_provider_requests) {
    throw new EvaluationRunPolicyError(
      `运行最多需要 ${target.maximumProviderRequests} 次 Provider 请求，超过授权上限 ${row.max_provider_requests}`,
      409,
    );
  }
  if (policy.retryPolicy !== "no-retry") {
    throw new EvaluationRunPolicyError("真实评估授权只允许 no-retry 运行", 409);
  }
  if (row.campaign_id !== policy.campaignId || row.slot_id !== policy.slotId) {
    throw new EvaluationRunPolicyError("真实评估授权与持久化 campaign/slot 不匹配", 409);
  }
}

/** Locks and validates a still-active grant. Call in the same transaction that inserts the run. */
export async function lockEvaluationRunAuthorization(
  client: PoolClient,
  policy: EvaluationRunPolicy,
  ownerId: string,
  plan: ExecutionPlan,
  now = Date.now(),
): Promise<LockedEvaluationAuthorization> {
  const target = evaluationAuthorizationTargetFromPlan(plan);
  const row = (await client.query<AuthorizationRow>(`
    SELECT * FROM evaluation_run_authorizations WHERE authorization_id = $1 FOR UPDATE
  `, [policy.authorizationId])).rows[0];
  if (!row) throw new EvaluationRunPolicyError("真实评估 authorizationId 未登记", 403);
  assertAuthorizationMatches(row, policy, ownerId, target, now);
  const budgetLimitMinor = databaseSafeInteger(row.budget_limit_minor, "budget_limit_minor");
  const priceMinorPerProviderRequest = databaseSafeInteger(
    row.price_minor_per_provider_request,
    "price_minor_per_provider_request",
  );
  const reservedBudgetMinor = target.maximumProviderRequests * priceMinorPerProviderRequest;
  if (!Number.isSafeInteger(reservedBudgetMinor) || reservedBudgetMinor > budgetLimitMinor) {
    throw new EvaluationRunPolicyError("真实评估计划的最坏请求总额超过授权预算", 409);
  }
  const campaignSlot = await lockEvaluationCampaignSlotForRunAuthorization(client, {
    campaignId: policy.campaignId,
    slotId: policy.slotId,
    caseId: policy.caseId,
    sampleId: policy.sampleId,
    ownerId,
    modelId: target.modelId,
    evaluationUnitKey: target.evaluationUnitKey,
    maxProviderRequests: target.maximumProviderRequests,
    priceMinorPerProviderRequest,
    budgetLimitMinor,
    budgetCurrency: row.budget_currency,
  });
  return {
    authorizationId: row.authorization_id,
    campaignId: row.campaign_id,
    slotId: row.slot_id,
    target,
    budgetLimitMinor,
    budgetCurrency: row.budget_currency,
    priceMinorPerProviderRequest,
    reservedBudgetMinor,
    campaignSlot,
  };
}

/** Consumes the locked grant once and binds it to one immutable case/run. */
export async function consumeEvaluationRunAuthorization(
  client: PoolClient,
  locked: LockedEvaluationAuthorization,
  policy: EvaluationRunPolicy,
  ownerId: string,
  runId: string,
  now = Date.now(),
): Promise<void> {
  const consumed = await client.query(`
    UPDATE evaluation_run_authorizations SET
      status = 'consumed', bound_case_id = $1, bound_run_id = $2,
      reserved_provider_requests = $3, reserved_budget_minor = $4,
      consumed_at = $5
    WHERE authorization_id = $6 AND owner_id = $7 AND status = 'active'
  `, [
    policy.caseId, runId, locked.target.maximumProviderRequests,
    locked.reservedBudgetMinor, now,
    locked.authorizationId, ownerId,
  ]);
  if (consumed.rowCount !== 1) {
    throw new EvaluationRunPolicyError("真实评估授权已被并发消费或撤销", 409);
  }
  await bindEvaluationCampaignSlotToRun(
    client,
    locked.campaignSlot,
    locked.authorizationId,
    runId,
  );
}

/** Worker-side final budget gate, executed in the same transaction as attempt_started. */
export async function recordAuthorizedEvaluationProviderRequest(
  client: PoolClient,
  input: { authorizationId: string; ownerId: string; caseId: string; runId: string },
  now = Date.now(),
): Promise<void> {
  const row = (await client.query<AuthorizationRow>(`
    SELECT * FROM evaluation_run_authorizations WHERE authorization_id = $1 FOR UPDATE
  `, [input.authorizationId])).rows[0];
  if (
    !row
    || row.owner_id !== input.ownerId
    || row.status !== "consumed"
    || row.bound_case_id !== input.caseId
    || row.bound_run_id !== input.runId
    || !row.campaign_id
    || !row.slot_id
  ) {
    throw new EvaluationRunPolicyError("Worker 无法确认真实评估授权与当前 case/run 的绑定", 409);
  }
  if (databaseSafeInteger(row.expires_at, "expires_at") <= now) {
    throw new EvaluationRunPolicyError("真实评估授权在 Provider 调用前已过期", 409);
  }
  if (
    row.reserved_provider_requests < 1
    || row.reserved_provider_requests > row.max_provider_requests
    || row.used_provider_requests >= row.reserved_provider_requests
  ) {
    throw new EvaluationRunPolicyError("真实评估 Provider 请求额度已耗尽", 409);
  }
  const priceMinor = databaseSafeInteger(
    row.price_minor_per_provider_request,
    "price_minor_per_provider_request",
  );
  const usedBudgetMinor = databaseSafeInteger(row.used_budget_minor, "used_budget_minor");
  const reservedBudgetMinor = databaseSafeInteger(row.reserved_budget_minor, "reserved_budget_minor");
  const budgetLimitMinor = databaseSafeInteger(row.budget_limit_minor, "budget_limit_minor");
  if (
    priceMinor < 1
    || usedBudgetMinor + priceMinor > reservedBudgetMinor
    || usedBudgetMinor + priceMinor > budgetLimitMinor
  ) {
    throw new EvaluationRunPolicyError("真实评估 Provider 请求预算已耗尽", 409);
  }
  const updated = await client.query(`
    UPDATE evaluation_run_authorizations
    SET used_provider_requests = used_provider_requests + 1,
      used_budget_minor = used_budget_minor + price_minor_per_provider_request
    WHERE authorization_id = $1
      AND used_provider_requests < reserved_provider_requests
      AND used_budget_minor + price_minor_per_provider_request <= reserved_budget_minor
      AND used_budget_minor + price_minor_per_provider_request <= budget_limit_minor
  `, [input.authorizationId]);
  if (updated.rowCount !== 1) {
    throw new EvaluationRunPolicyError("真实评估 Provider 请求额度已被并发耗尽", 409);
  }
}

export async function revokeEvaluationRunAuthorization(
  client: PoolClient,
  actor: AuthUser,
  authorizationId: string,
): Promise<boolean> {
  if (actor.role !== "admin") throw new EvaluationRunPolicyError("只有管理员可以撤销真实评估授权", 403);
  const updated = await client.query(`
    UPDATE evaluation_run_authorizations SET status = 'revoked'
    WHERE authorization_id = $1 AND created_by_admin_id = $2 AND status = 'active'
  `, [authorizationId, actor.id]);
  return updated.rowCount === 1;
}

export async function expireEvaluationRunAuthorizations(
  client: PoolClient,
  now = Date.now(),
): Promise<number> {
  const updated = await client.query(`
    UPDATE evaluation_run_authorizations SET status = 'expired'
    WHERE status = 'active' AND expires_at <= $1
  `, [now]);
  return updated.rowCount ?? 0;
}
