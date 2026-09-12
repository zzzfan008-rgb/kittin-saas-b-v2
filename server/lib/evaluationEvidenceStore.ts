import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import type {
  ExecutionPlan,
  ImageGenRequest,
  NodeExecution,
} from "../../src/types/workflow";
import type { EvaluationHardBlocker } from "../../src/types/promptEvaluation";
import {
  buildEvaluationCaseSnapshotFromRuntime,
  evaluationImageEvidenceId,
  inspectEvaluationImageEvidence,
  type EvaluationCodeIdentity,
  type EvaluationErrorPhase,
  type EvaluationPostprocessedEvidence,
  type EvaluationProviderOriginalEvidence,
  type EvaluationRequestError,
  type EvaluationRuntimeCaseSnapshot,
} from "./evaluationEvidence";
import type { EvaluationRunPolicy } from "./evaluationRunPolicy";
import {
  finalizeEvaluationCampaignSlot,
  reserveEvaluationCampaignProviderRequest,
  type EvaluationCampaignSlotRuntimeBinding,
} from "./evaluationCampaign";
import { recordAuthorizedEvaluationProviderRequest } from "./evaluationAuthorizationLedger";

const MAX_PROVIDER_REQUESTS = 8;
const MAX_ERROR_LENGTH = 2_000;

interface ConsumedAuthorizationRow {
  authorization_id: string;
  owner_id: string;
  evaluation_unit_key: string;
  price_minor_per_provider_request: string;
  budget_currency: string;
  bound_case_id: string;
  bound_run_id: string;
  campaign_id: string;
  slot_id: string;
}

interface CaseEvidenceRow {
  id: string;
  run_id: string;
  owner_id: string;
  case_id: string;
  authorization_id: string;
  campaign_id: string;
  slot_id: string;
  evaluation_unit_key: string;
  model_id: string;
  resolved_model_id: string | null;
  prompt_variant_id: string;
  parameter_profile_id: string;
  postprocess_version: string;
  requested_image_count: number;
  provider_request_count: number;
  snapshot_json: string;
  error_events_json: string;
  hard_blockers_json: string;
  outcome: "queued" | "running" | "succeeded" | "failed" | "outcome_unknown" | "cancelled";
  started_at: number;
  finalized_at: number | null;
}

interface ProviderRequestRow {
  id: string;
  case_evidence_id: string;
  run_id: string;
  request_index: number;
  outcome: "started" | "succeeded" | "failed" | "outcome_unknown";
  started_at: number;
  finished_at: number | null;
  request_snapshot_sha256: string;
  prompt_sha256: string;
  native_parameters_json: string;
  business_parameters_json: string;
  reference_inputs_json: string;
  provider_model: string | null;
  provider_request_id: string | null;
  provider_output_sizes_json: string;
  output_count: number;
  reserved_cost_minor: number;
  budget_currency: string;
}

interface ProviderImageRow {
  id: string;
  output_index: number;
  storage_ref: string;
  artifact_sha256: string;
  mime_type: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  byte_length: number;
  captured_at: number;
  provider_request_evidence_id: string;
}

export interface StartEvaluationProviderRequestInput {
  runId: string;
  ownerId: string;
  plan: ExecutionPlan;
  step: NodeExecution;
  policy?: EvaluationRunPolicy;
  requestIndex: number;
  request: ImageGenRequest;
  startedAt: number;
  codeIdentity?: EvaluationCodeIdentity;
}

export interface StartedEvaluationProviderRequest {
  caseEvidenceId: string;
  providerRequestEvidenceId: string;
  snapshot: EvaluationRuntimeCaseSnapshot;
}

export interface EvaluationProviderRequestSuccessInput {
  runId: string;
  policy?: EvaluationRunPolicy;
  requestIndex: number;
  providerModel: string;
  providerOutputSizes?: readonly (string | null)[];
  providerOriginalStorageRefs: readonly string[];
  providerRequestId?: string;
  finishedAt: number;
}

export interface EvaluationProviderRequestFailureInput {
  runId: string;
  policy?: EvaluationRunPolicy;
  requestIndex: number;
  outcome: "failed" | "outcome_unknown";
  errorCategory: string;
  errorMessage: string;
  providerRequestId?: string;
  finishedAt: number;
}

export interface CompleteEvaluationCaseInput {
  runId: string;
  policy?: EvaluationRunPolicy;
  postprocessedStorageRefs: readonly string[];
  finishedAt: number;
}

export interface FailEvaluationCaseInput {
  runId: string;
  policy?: EvaluationRunPolicy;
  outcome: "failed" | "outcome_unknown" | "cancelled";
  phase: EvaluationErrorPhase;
  code: string;
  message: string;
  finishedAt: number;
  hardBlockers?: readonly EvaluationHardBlocker[];
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

function isoTimestamp(timestamp: number, field: string): string {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) throw new RangeError(`${field} is invalid`);
  return new Date(timestamp).toISOString();
}

function requireRequestIndex(index: number): void {
  if (!Number.isSafeInteger(index) || index < 1 || index > MAX_PROVIDER_REQUESTS) {
    throw new RangeError(`requestIndex must be an integer from 1 to ${MAX_PROVIDER_REQUESTS}`);
  }
}

function requireText(value: string, field: string, max = MAX_ERROR_LENGTH): string {
  const normalized = value.trim();
  if (!normalized || normalized.length > max) throw new TypeError(`${field} is invalid`);
  return normalized;
}

function optionalProviderRequestId(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const requestId = requireText(value, "providerRequestId", 256);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(requestId)) {
    throw new TypeError("providerRequestId is invalid");
  }
  return requestId;
}

function evaluationCaseEvidenceId(runId: string): string {
  return `evaluation-case:${runId}`;
}

function evaluationProviderRequestEvidenceId(caseEvidenceId: string, requestIndex: number): string {
  return `${caseEvidenceId}:request:${requestIndex}`;
}

async function consumedAuthorization(
  client: PoolClient,
  input: Pick<StartEvaluationProviderRequestInput, "ownerId" | "runId"> & { policy: EvaluationRunPolicy },
): Promise<ConsumedAuthorizationRow> {
  const row = (await client.query<ConsumedAuthorizationRow>(`
    SELECT authorization_id, owner_id, evaluation_unit_key,
      price_minor_per_provider_request::text, budget_currency, bound_case_id, bound_run_id,
      campaign_id, slot_id
    FROM evaluation_run_authorizations
    WHERE authorization_id = $1 AND owner_id = $2 AND status = 'consumed'
      AND bound_case_id = $3 AND bound_run_id = $4
      AND campaign_id = $5 AND slot_id = $6
    FOR SHARE
  `, [
    input.policy.authorizationId,
    input.ownerId,
    input.policy.caseId,
    input.runId,
    input.policy.campaignId,
    input.policy.slotId,
  ])).rows[0];
  if (!row) throw new Error("evaluation evidence has no matching consumed one-time authorisation");
  return row;
}

async function caseForRun(client: PoolClient, runId: string, policy: EvaluationRunPolicy): Promise<CaseEvidenceRow | undefined> {
  return (await client.query<CaseEvidenceRow>(`
    SELECT id, run_id, owner_id, case_id, authorization_id, evaluation_unit_key,
      campaign_id, slot_id,
      model_id, resolved_model_id, prompt_variant_id, parameter_profile_id,
      postprocess_version, requested_image_count, provider_request_count,
      snapshot_json, error_events_json, hard_blockers_json, outcome, started_at, finalized_at
    FROM evaluation_case_evidence
    WHERE run_id = $1 AND case_id = $2 AND authorization_id = $3
      AND campaign_id = $4 AND slot_id = $5
    FOR UPDATE
  `, [runId, policy.caseId, policy.authorizationId, policy.campaignId, policy.slotId])).rows[0];
}

function campaignRuntimeBinding(
  runtime: EvaluationRuntimeCaseSnapshot,
): EvaluationCampaignSlotRuntimeBinding {
  const snapshot = runtime.snapshot;
  return {
    codeSha: runtime.codeIdentity.codeSha,
    modelId: snapshot.unit.modelId,
    authorizationUnitKey: runtime.authorizationUnitKey,
    resolvedPromptSha256: snapshot.resolvedPromptSha256,
    nativeParametersSha256: sha256(snapshot.nativeParameters),
    referenceInputsSha256: sha256(snapshot.references),
    requestedImageCount: snapshot.requestedImageCount,
  };
}

/** Create one immutable request row immediately before its Provider call. */
export async function startEvaluationProviderRequestEvidence(
  client: PoolClient,
  input: StartEvaluationProviderRequestInput,
): Promise<StartedEvaluationProviderRequest | undefined> {
  if (!input.policy) return undefined;
  requireRequestIndex(input.requestIndex);
  const startedAtIso = isoTimestamp(input.startedAt, "startedAt");
  const runtime = buildEvaluationCaseSnapshotFromRuntime({
    plan: input.plan,
    step: input.step,
    request: input.request,
    policy: input.policy,
    ...(input.codeIdentity ? { codeIdentity: input.codeIdentity } : {}),
    capturedAt: startedAtIso,
  });
  const authorization = await consumedAuthorization(client, {
    ownerId: input.ownerId,
    runId: input.runId,
    policy: input.policy,
  });
  if (authorization.evaluation_unit_key !== runtime.authorizationUnitKey) {
    throw new Error("actual Provider request drifted from the consumed exact-unit authorisation");
  }
  if (
    authorization.campaign_id !== input.policy.campaignId
    || authorization.slot_id !== input.policy.slotId
  ) {
    throw new Error("actual Provider request drifted from the consumed campaign/slot authorisation");
  }
  await recordAuthorizedEvaluationProviderRequest(client, {
    authorizationId: input.policy.authorizationId,
    ownerId: input.ownerId,
    caseId: input.policy.caseId,
    runId: input.runId,
  }, input.startedAt);
  await reserveEvaluationCampaignProviderRequest(client, {
    campaignId: input.policy.campaignId,
    slotId: input.policy.slotId,
    authorizationId: input.policy.authorizationId,
    runId: input.runId,
    requestIndex: input.requestIndex,
    runtime: campaignRuntimeBinding(runtime),
  });
  const snapshot = runtime.snapshot;
  const caseEvidenceId = evaluationCaseEvidenceId(input.runId);
  if (input.requestIndex === 1) {
    const inserted = await client.query(`
      INSERT INTO evaluation_case_evidence (
        id, run_id, owner_id, case_id, sample_id, authorization_id, campaign_id, slot_id,
        code_sha, code_sha_source, code_dirty, model_id, node_kind, operation_mode,
        task_family_id, preset_id, prompt_variant_id, prompt_version, prompt_sha256,
        evaluation_version, contract_hash, evaluation_unit_key,
        parameter_profile_id, parameter_profile_version, postprocess_version,
        input_normalization_version, golden_set_version, scoring_rubric_version,
        resolved_prompt, native_parameters_json, reference_inputs_json,
        requested_image_count, request_snapshot_sha256, snapshot_json,
        outcome, billing_reconciliation_status, started_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21, $22,
        $23, $24, $25,
        $26, $27, $28,
        $29, $30, $31,
        $32, $33, $34,
        'running', 'pending', $35, $36, $36
      )
      ON CONFLICT (id) DO NOTHING
    `, [
      caseEvidenceId, input.runId, input.ownerId, input.policy.caseId,
      input.policy.sampleId, input.policy.authorizationId, input.policy.campaignId, input.policy.slotId,
      runtime.codeIdentity.codeSha, runtime.codeIdentity.source, runtime.codeIdentity.dirty,
      snapshot.unit.modelId, snapshot.unit.nodeKind, snapshot.unit.operationMode,
      snapshot.unit.taskFamilyId, snapshot.unit.presetId, snapshot.unit.promptVariantId,
      snapshot.promptVersion, snapshot.resolvedPromptSha256, snapshot.evaluationVersion,
      snapshot.contractHash, runtime.authorizationUnitKey, snapshot.unit.parameterProfileId,
      snapshot.unit.parameterProfileVersion, snapshot.postprocessVersion,
      snapshot.versions.inputNormalizationVersion, snapshot.versions.goldenSetVersion,
      snapshot.versions.scoringRubricVersion, snapshot.resolvedPrompt,
      JSON.stringify(snapshot.nativeParameters), JSON.stringify(snapshot.references),
      snapshot.requestedImageCount, snapshot.requestSnapshotSha256, JSON.stringify(runtime),
      input.startedAt, startedAtIso,
    ]);
    if (inserted.rowCount !== 1) {
      throw new Error("evaluation case evidence already exists; paid cases may not be replayed");
    }
  }
  const caseRow = await caseForRun(client, input.runId, input.policy);
  if (!caseRow) throw new Error("evaluation request cannot start before its case evidence exists");
  if (
    caseRow.finalized_at !== null
    || caseRow.outcome !== "running"
    || caseRow.owner_id !== input.ownerId
    || caseRow.evaluation_unit_key !== runtime.authorizationUnitKey
    || caseRow.model_id !== snapshot.unit.modelId
    || caseRow.prompt_variant_id !== snapshot.unit.promptVariantId
    || caseRow.parameter_profile_id !== snapshot.unit.parameterProfileId
    || caseRow.postprocess_version !== snapshot.postprocessVersion
  ) {
    throw new Error("evaluation request does not belong to the open exact case evidence");
  }

  const requestSequence = (await client.query<{ request_count: number; maximum_index: number | null }>(`
    SELECT COUNT(*)::int AS request_count, MAX(request_index)::int AS maximum_index
    FROM evaluation_provider_request_evidence
    WHERE case_evidence_id = $1
  `, [caseEvidenceId])).rows[0] ?? { request_count: 0, maximum_index: null };
  const expectedRequestIndex = requestSequence.request_count + 1;
  if (
    input.requestIndex !== expectedRequestIndex
    || (requestSequence.maximum_index !== null && requestSequence.maximum_index !== requestSequence.request_count)
  ) {
    throw new Error("evaluation Provider request indexes must be appended uniquely as a contiguous 1-based sequence");
  }

  const providerRequestEvidenceId = evaluationProviderRequestEvidenceId(caseEvidenceId, input.requestIndex);
  const requestInserted = await client.query(`
    INSERT INTO evaluation_provider_request_evidence (
      id, case_evidence_id, run_id, request_index,
      request_snapshot_sha256, prompt_sha256, native_parameters_json,
      business_parameters_json, reference_inputs_json, outcome, started_at,
      reserved_cost_minor, budget_currency, billing_reconciliation_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'started', $10, $11, $12, 'pending')
    ON CONFLICT (case_evidence_id, request_index) DO NOTHING
  `, [
    providerRequestEvidenceId, caseEvidenceId, input.runId, input.requestIndex,
    snapshot.requestSnapshotSha256, snapshot.resolvedPromptSha256,
    JSON.stringify(snapshot.nativeParameters), JSON.stringify(runtime.businessParameters),
    JSON.stringify(snapshot.references), input.startedAt,
    authorization.price_minor_per_provider_request, authorization.budget_currency,
  ]);
  if (requestInserted.rowCount !== 1) {
    throw new Error("evaluation Provider request index already exists; no-retry evidence is append-only");
  }
  await client.query(`
    UPDATE evaluation_case_evidence
    SET provider_request_count = (
      SELECT COUNT(*)::int FROM evaluation_provider_request_evidence WHERE case_evidence_id = $1
    ), updated_at = $2
    WHERE id = $1
  `, [caseEvidenceId, startedAtIso]);
  return { caseEvidenceId, providerRequestEvidenceId, snapshot: runtime };
}

/** Close a successful Provider request and bind every original to that request. */
export async function recordEvaluationProviderRequestSuccess(
  client: PoolClient,
  input: EvaluationProviderRequestSuccessInput,
): Promise<readonly EvaluationProviderOriginalEvidence[] | undefined> {
  if (!input.policy) return undefined;
  requireRequestIndex(input.requestIndex);
  const finishedAtIso = isoTimestamp(input.finishedAt, "finishedAt");
  requireText(input.providerModel, "providerModel", 256);
  const providerRequestId = optionalProviderRequestId(input.providerRequestId);
  if (input.providerOriginalStorageRefs.length < 1 || input.providerOriginalStorageRefs.length > 8) {
    throw new RangeError("a successful Provider request must contain 1 to 8 originals");
  }
  if (
    input.providerOutputSizes !== undefined
    && input.providerOutputSizes.length !== input.providerOriginalStorageRefs.length
  ) {
    throw new Error("providerOutputSizes must align with Provider originals");
  }
  const caseRow = await caseForRun(client, input.runId, input.policy);
  if (!caseRow || caseRow.outcome !== "running" || caseRow.finalized_at !== null) {
    throw new Error("successful Provider evidence has no open evaluation case");
  }
  const requestId = evaluationProviderRequestEvidenceId(caseRow.id, input.requestIndex);
  const requestRow = (await client.query<ProviderRequestRow>(`
    SELECT * FROM evaluation_provider_request_evidence
    WHERE id = $1 AND case_evidence_id = $2 AND run_id = $3
    FOR UPDATE
  `, [requestId, caseRow.id, input.runId])).rows[0];
  if (!requestRow || requestRow.outcome !== "started" || requestRow.finished_at !== null) {
    throw new Error("Provider success may only close one started evaluation request");
  }
  const nextOutputIndex = (await client.query<{ next_index: number }>(`
    SELECT COALESCE(MAX(output_index) + 1, 0)::int AS next_index
    FROM evaluation_image_evidence
    WHERE case_evidence_id = $1 AND layer = 'provider-original'
  `, [caseRow.id])).rows[0]?.next_index ?? 0;
  if (nextOutputIndex + input.providerOriginalStorageRefs.length > caseRow.requested_image_count) {
    throw new Error("Provider originals exceed the exact output count authorised for this evaluation case");
  }
  const providerOriginals = await Promise.all(input.providerOriginalStorageRefs.map((storageRef, offset) => (
    inspectEvaluationImageEvidence(
      storageRef,
      "provider-original",
      evaluationImageEvidenceId(caseRow.id, "provider-original", nextOutputIndex + offset),
      undefined,
      undefined,
      finishedAtIso,
    )
  )));
  const updated = await client.query(`
    UPDATE evaluation_provider_request_evidence
    SET outcome = 'succeeded', provider_model = $1, provider_output_sizes_json = $2,
      provider_request_id = $3, output_count = $4, finished_at = $5, latency_ms = $5 - started_at
    WHERE id = $6 AND outcome = 'started' AND finished_at IS NULL
  `, [
    input.providerModel, JSON.stringify(input.providerOutputSizes ?? []),
    providerRequestId ?? null, providerOriginals.length, input.finishedAt, requestId,
  ]);
  if (updated.rowCount !== 1) throw new Error("Provider request evidence changed before success could be recorded");
  for (const evidence of providerOriginals) {
    await client.query(`
      INSERT INTO evaluation_image_evidence (
        id, case_evidence_id, run_id, output_index, layer,
        provider_request_evidence_id, storage_ref, artifact_sha256, mime_type,
        width, height, byte_length, captured_at
      ) VALUES ($1, $2, $3, $4, 'provider-original', $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      evidence.evidenceId, caseRow.id, input.runId, evidence.imageIndex, requestId,
      evidence.storageRef, evidence.artifactSha256, evidence.mimeType,
      evidence.width, evidence.height, evidence.bytes, input.finishedAt,
    ]);
  }
  const modelUpdated = await client.query(`
    UPDATE evaluation_case_evidence
    SET resolved_model_id = COALESCE(resolved_model_id, $1), updated_at = $2
    WHERE id = $3 AND (resolved_model_id IS NULL OR resolved_model_id = $1)
  `, [input.providerModel, finishedAtIso, caseRow.id]);
  if (modelUpdated.rowCount !== 1) throw new Error("resolved Provider model changed within one evaluation case");
  return providerOriginals;
}

/** Close a request that reached the Provider boundary but did not yield evidence. */
export async function recordEvaluationProviderRequestFailure(
  client: PoolClient,
  input: EvaluationProviderRequestFailureInput,
): Promise<void> {
  if (!input.policy) return;
  requireRequestIndex(input.requestIndex);
  isoTimestamp(input.finishedAt, "finishedAt");
  const category = requireText(input.errorCategory, "errorCategory", 128);
  const message = requireText(input.errorMessage, "errorMessage");
  const providerRequestId = optionalProviderRequestId(input.providerRequestId);
  const caseRow = await caseForRun(client, input.runId, input.policy);
  if (!caseRow || caseRow.outcome !== "running" || caseRow.finalized_at !== null) {
    throw new Error("Provider failure has no open evaluation case");
  }
  const requestId = evaluationProviderRequestEvidenceId(caseRow.id, input.requestIndex);
  const updated = await client.query(`
    UPDATE evaluation_provider_request_evidence
    SET outcome = $1, error_category = $2, error_message = $3,
      provider_request_id = $4, finished_at = $5, latency_ms = $5 - started_at
    WHERE id = $6 AND outcome = 'started' AND finished_at IS NULL
  `, [input.outcome, category, message, providerRequestId ?? null, input.finishedAt, requestId]);
  if (updated.rowCount !== 1) {
    throw new Error("Provider request failure may only close one started evaluation request");
  }
}

/** Finalize a successful case only after both immutable image layers exist. */
export async function completeEvaluationCaseEvidence(
  client: PoolClient,
  input: CompleteEvaluationCaseInput,
): Promise<readonly EvaluationPostprocessedEvidence[] | undefined> {
  if (!input.policy) return undefined;
  const finishedAtIso = isoTimestamp(input.finishedAt, "finishedAt");
  const caseRow = await caseForRun(client, input.runId, input.policy);
  if (!caseRow || caseRow.outcome !== "running" || caseRow.finalized_at !== null) {
    throw new Error("successful evaluation completion has no open case");
  }
  const requests = (await client.query<ProviderRequestRow>(`
    SELECT * FROM evaluation_provider_request_evidence
    WHERE case_evidence_id = $1 ORDER BY request_index ASC
    FOR UPDATE
  `, [caseRow.id])).rows;
  if (
    requests.length < 1
    || requests.length > MAX_PROVIDER_REQUESTS
    || requests.some((request, index) => (
      request.request_index !== index + 1 || request.outcome !== "succeeded"
    ))
  ) {
    throw new Error("evaluation case cannot succeed while a Provider request is missing or unresolved");
  }
  const providerRows = (await client.query<ProviderImageRow>(`
    SELECT id, output_index, storage_ref, artifact_sha256, mime_type, width, height,
      byte_length, captured_at, provider_request_evidence_id
    FROM evaluation_image_evidence
    WHERE case_evidence_id = $1 AND layer = 'provider-original'
    ORDER BY output_index ASC
    FOR SHARE
  `, [caseRow.id])).rows;
  if (
    providerRows.length !== caseRow.requested_image_count
    || input.postprocessedStorageRefs.length !== providerRows.length
    || providerRows.some((row, index) => row.output_index !== index)
  ) {
    throw new Error("evaluation success requires exact requested cardinality in both evidence layers");
  }
  const postprocessed = await Promise.all(input.postprocessedStorageRefs.map((storageRef, index) => (
    inspectEvaluationImageEvidence(
      storageRef,
      "postprocessed",
      evaluationImageEvidenceId(caseRow.id, "postprocessed", index),
      providerRows[index].id,
      caseRow.postprocess_version,
      finishedAtIso,
    )
  )));
  for (const evidence of postprocessed) {
    await client.query(`
      INSERT INTO evaluation_image_evidence (
        id, case_evidence_id, run_id, output_index, layer, source_evidence_id,
        storage_ref, artifact_sha256, mime_type, width, height, byte_length,
        pipeline_version, captured_at
      ) VALUES ($1, $2, $3, $4, 'postprocessed', $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      evidence.evidenceId, caseRow.id, input.runId, evidence.imageIndex,
      evidence.sourceEvidenceId, evidence.storageRef, evidence.artifactSha256,
      evidence.mimeType, evidence.width, evidence.height, evidence.bytes,
      evidence.pipelineVersion, input.finishedAt,
    ]);
  }
  const evidenceRecordSha256 = sha256({
    schemaVersion: 1,
    runtimeSnapshot: JSON.parse(caseRow.snapshot_json),
    providerRequests: requests.map((request) => ({
      requestIndex: request.request_index,
      requestSnapshotSha256: request.request_snapshot_sha256,
      promptSha256: request.prompt_sha256,
      nativeParameters: JSON.parse(request.native_parameters_json),
      businessParameters: JSON.parse(request.business_parameters_json),
      references: JSON.parse(request.reference_inputs_json),
      providerModel: request.provider_model,
      providerRequestId: request.provider_request_id,
      providerOutputSizes: JSON.parse(request.provider_output_sizes_json),
      outputCount: request.output_count,
      outcome: request.outcome,
      reservedCostMinor: request.reserved_cost_minor,
      budgetCurrency: request.budget_currency,
      startedAt: request.started_at,
      finishedAt: request.finished_at,
    })),
    providerOriginals: providerRows,
    postprocessed,
    billingStatus: "pending",
    finishedAt: input.finishedAt,
  });
  const updated = await client.query(`
    UPDATE evaluation_case_evidence
    SET outcome = 'succeeded', latency_ms = $1 - started_at,
      finished_at = $1, finalized_at = $1, evidence_record_sha256 = $2,
      billing_reconciliation_status = 'pending', updated_at = $3
    WHERE id = $4 AND outcome = 'running' AND finalized_at IS NULL
  `, [input.finishedAt, evidenceRecordSha256, finishedAtIso, caseRow.id]);
  if (updated.rowCount !== 1) throw new Error("evaluation case changed before success could be finalized");
  await finalizeEvaluationCampaignSlot(client, {
    campaignId: input.policy.campaignId,
    slotId: input.policy.slotId,
    authorizationId: input.policy.authorizationId,
    runId: input.runId,
    outcome: "succeeded",
  });
  return postprocessed;
}

function parseArray<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    throw new Error("persisted evaluation evidence JSON is invalid");
  }
}

/** Finalize a failed/unknown/cancelled case without deleting partial evidence. */
export async function failEvaluationCaseEvidence(
  client: PoolClient,
  input: FailEvaluationCaseInput,
): Promise<void> {
  if (!input.policy) return;
  const finishedAtIso = isoTimestamp(input.finishedAt, "finishedAt");
  const code = requireText(input.code, "code", 128);
  const message = requireText(input.message, "message");
  const caseRow = await caseForRun(client, input.runId, input.policy);
  if (!caseRow) {
    await finalizeEvaluationCampaignSlot(client, {
      campaignId: input.policy.campaignId,
      slotId: input.policy.slotId,
      authorizationId: input.policy.authorizationId,
      runId: input.runId,
      outcome: input.outcome,
    });
    return;
  }
  if (caseRow.finalized_at !== null || caseRow.outcome !== "running") return;
  const errorEvent: EvaluationRequestError = {
    phase: input.phase,
    code,
    message,
    occurredAt: finishedAtIso,
  };
  const errors = [...parseArray<EvaluationRequestError>(caseRow.error_events_json), errorEvent];
  const blockers = [
    ...parseArray<EvaluationHardBlocker>(caseRow.hard_blockers_json),
    ...(input.hardBlockers ?? []),
  ];
  if (input.outcome === "outcome_unknown" && !blockers.some((blocker) => blocker.code === "outcome-unknown")) {
    blockers.push({
      code: "outcome-unknown",
      detail: "Provider submission outcome is unknown; billing must be reconciled before any new case is authorised.",
    });
  }
  if (
    (
      input.phase === "provider-persist"
      || input.phase === "postprocess"
      || input.phase === "completion-persist"
    )
    && !blockers.some((blocker) => blocker.code === "evidence-integrity-failure")
  ) {
    blockers.push({ code: "evidence-integrity-failure", detail: message });
  }
  await client.query(`
    UPDATE evaluation_provider_request_evidence
    SET outcome = $1, error_category = COALESCE(error_category, $2),
      error_message = COALESCE(error_message, $3), finished_at = COALESCE(finished_at, $4),
      latency_ms = COALESCE(latency_ms, $4 - started_at)
    WHERE case_evidence_id = $5 AND outcome = 'started'
  `, [input.outcome === "outcome_unknown" ? "outcome_unknown" : "failed", code, message, input.finishedAt, caseRow.id]);
  const requestCount = (await client.query<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM evaluation_provider_request_evidence WHERE case_evidence_id = $1
  `, [caseRow.id])).rows[0]?.count ?? 0;
  const evidenceRecordSha256 = sha256({
    schemaVersion: 1,
    runtimeSnapshot: JSON.parse(caseRow.snapshot_json),
    outcome: input.outcome,
    errors,
    hardBlockers: blockers,
    providerRequestCount: requestCount,
    billingStatus: requestCount > 0 ? "pending" : "not-required",
    finishedAt: input.finishedAt,
  });
  const updated = await client.query(`
    UPDATE evaluation_case_evidence
    SET outcome = $1, provider_request_count = $2, latency_ms = $3 - started_at,
      error_category = $4, error_message = $5, error_events_json = $6,
      hard_blockers_json = $7, billing_reconciliation_status = $8,
      finished_at = $3, finalized_at = $3, evidence_record_sha256 = $9, updated_at = $10
    WHERE id = $11 AND outcome = 'running' AND finalized_at IS NULL
  `, [
    input.outcome, requestCount, input.finishedAt, code, message,
    JSON.stringify(errors), JSON.stringify(blockers), requestCount > 0 ? "pending" : "not-required",
    evidenceRecordSha256, finishedAtIso, caseRow.id,
  ]);
  if (updated.rowCount !== 1) throw new Error("evaluation case changed before failure could be finalized");
  await finalizeEvaluationCampaignSlot(client, {
    campaignId: input.policy.campaignId,
    slotId: input.policy.slotId,
    authorizationId: input.policy.authorizationId,
    runId: input.runId,
    outcome: input.outcome,
  });
}
