import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { EvaluationHardBlocker, EvaluationHardBlockerCode, PromptEvaluationScores } from "../../src/types/promptEvaluation";
import type { AuthUser } from "./auth";
import { validateManualScores } from "./evaluationEvidence";

const SAFE_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,256}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const MAX_NOTE_LENGTH = 4_000;
const MAX_BILLING_REFERENCE_LENGTH = 512;
const MAX_HARD_BLOCKERS = 32;
const MAX_EVIDENCE_IDS_PER_BLOCKER = 32;

const HARD_BLOCKER_CODES = new Set<EvaluationHardBlockerCode>([
  "capability-unsupported",
  "contract-mismatch",
  "missing-provider-original",
  "missing-postprocessed-output",
  "garment-identity-corruption",
  "duplicate-billing",
  "unsafe-output",
  "rights-or-safety",
  "evidence-integrity-failure",
  "outcome-unknown",
  "version-drift",
]);

export type ConfirmedBillingStatus = "confirmed-not-billed" | "confirmed-billed";

export interface AppendEvaluationBillingInput {
  caseEvidenceId: string;
  runId: string;
  providerRequestEvidenceId: string;
  status: ConfirmedBillingStatus;
  actualCostMinor: number;
  currency: string;
  billingReference: string;
  note?: string;
}

export interface EvaluationBillingReviewEvent {
  id: string;
  caseEvidenceId: string;
  providerRequestEvidenceId: string;
  status: ConfirmedBillingStatus;
  actualCostMinor: number;
  currency: string;
  billingReference: string;
  note?: string;
  reconciledBy: string;
  previousEventSha256: string | null;
  eventSha256: string;
  createdAt: string;
}

export interface AppendEvaluationManualAssessmentInput {
  caseEvidenceId: string;
  runId: string;
  outputIndex: number;
  scores: unknown;
  /** Legacy input kept for explicit rejection; detached baselines are not valid evidence. */
  baselineScores?: unknown;
  taskPassed: boolean;
  validForScoring: boolean;
  hardBlockers?: readonly EvaluationHardBlocker[];
  reviewNote?: string;
}

export interface EvaluationManualAssessmentReviewEvent {
  id: string;
  caseEvidenceId: string;
  outputIndex: number;
  scores: PromptEvaluationScores;
  /** Parsed only for historical hash-chain compatibility; never promotion evidence. */
  baselineScores?: PromptEvaluationScores;
  taskPassed: boolean;
  validForScoring: boolean;
  hardBlockers: readonly EvaluationHardBlocker[];
  reviewNote?: string;
  reviewerId: string;
  previousEventSha256: string | null;
  eventSha256: string;
  createdAt: string;
}

export interface LoadEvaluationCaseEvidenceInput {
  caseEvidenceId: string;
  runId: string;
}

export interface EvaluationCaseEvidenceBundle {
  schemaVersion: 1;
  run: Readonly<Record<string, unknown>>;
  authorization: Readonly<Record<string, unknown>>;
  caseEvidence: Readonly<Record<string, unknown>>;
  providerRequests: readonly Readonly<Record<string, unknown>>[];
  images: readonly Readonly<Record<string, unknown>>[];
  billingEvents: readonly EvaluationBillingReviewEvent[];
  manualAssessmentEvents: readonly EvaluationManualAssessmentReviewEvent[];
  exportedAt: string;
}

interface ReviewCaseRow {
  id: string;
  run_id: string;
  owner_id: string;
  case_id: string;
  authorization_id: string;
  outcome: "queued" | "running" | "succeeded" | "failed" | "outcome_unknown" | "cancelled";
  finalized_at: number | string | null;
  hard_blockers_json: string;
}

interface BillingRequestRow {
  id: string;
  case_evidence_id: string;
  run_id: string;
  outcome: "started" | "succeeded" | "failed" | "outcome_unknown";
  budget_currency: string;
}

interface PersistedBillingEventRow {
  id: string;
  case_evidence_id: string;
  provider_request_evidence_id: string | null;
  status: ConfirmedBillingStatus;
  actual_cost_minor: number | string | null;
  currency: string;
  billing_reference: string;
  note: string | null;
  reconciled_by: string;
  previous_event_sha256: string | null;
  event_sha256: string;
  created_at: string;
}

interface PersistedManualEventRow {
  id: string;
  case_evidence_id: string;
  output_index: number;
  scores_json: string;
  baseline_scores_json: string | null;
  task_passed: boolean;
  valid_for_scoring: boolean;
  hard_blockers_json: string;
  review_note: string | null;
  reviewer_id: string;
  previous_event_sha256: string | null;
  event_sha256: string;
  created_at: string;
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

function requireId(value: string, field: string): string {
  if (!SAFE_ID_PATTERN.test(value)) throw new TypeError(`${field} is invalid`);
  return value;
}

function requireText(value: string, field: string, max: number): string {
  const normalized = value.trim();
  if (!normalized || normalized.length > max) throw new TypeError(`${field} is invalid`);
  return normalized;
}

function optionalText(value: string | undefined, field: string, max: number): string | undefined {
  if (value === undefined) return undefined;
  return requireText(value, field, max);
}

function safeInteger(value: number | string, field: string, minimum = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) throw new RangeError(`${field} is invalid`);
  return parsed;
}

function parseJson(value: string, field: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new Error(`persisted ${field} JSON is invalid`);
  }
}

function nextEventTimestamp(now: number, previousCreatedAt?: string): string {
  if (!Number.isSafeInteger(now) || now < 0) throw new RangeError("review timestamp is invalid");
  const previous = previousCreatedAt === undefined ? -1 : Date.parse(previousCreatedAt);
  if (previousCreatedAt !== undefined && !Number.isSafeInteger(previous)) {
    throw new Error("persisted review event timestamp is invalid");
  }
  return new Date(Math.max(now, previous + 1)).toISOString();
}

function cloneFrozen<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) cloneFrozen(nested);
  }
  return value;
}

async function requirePersistedAdmin(client: PoolClient, actor: AuthUser): Promise<void> {
  if (actor.role !== "admin") throw new Error("only an administrator may review evaluation evidence");
  const row = (await client.query<{ id: string }>(`
    SELECT id FROM users
    WHERE id = $1 AND role = 'admin' AND active = 1 AND deleted_at IS NULL
    FOR SHARE
  `, [actor.id])).rows[0];
  if (!row) throw new Error("evaluation reviewer is not an active persisted administrator");
}

async function lockReviewCase(
  client: PoolClient,
  input: LoadEvaluationCaseEvidenceInput,
): Promise<ReviewCaseRow> {
  requireId(input.caseEvidenceId, "caseEvidenceId");
  requireId(input.runId, "runId");
  const row = (await client.query<ReviewCaseRow>(`
    SELECT id, run_id, owner_id, case_id, authorization_id, outcome,
      finalized_at, hard_blockers_json
    FROM evaluation_case_evidence
    WHERE id = $1 AND run_id = $2
    FOR UPDATE
  `, [input.caseEvidenceId, input.runId])).rows[0];
  if (!row) throw new Error("evaluation case/run evidence binding was not found");
  if (row.finalized_at === null) throw new Error("evaluation evidence cannot be reviewed before the case is finalized");
  return row;
}

function billingPayload(event: Omit<EvaluationBillingReviewEvent, "eventSha256">): Record<string, unknown> {
  return {
    schemaVersion: 1,
    eventType: "billing-reconciliation",
    id: event.id,
    caseEvidenceId: event.caseEvidenceId,
    providerRequestEvidenceId: event.providerRequestEvidenceId,
    status: event.status,
    actualCostMinor: event.actualCostMinor,
    currency: event.currency,
    billingReference: event.billingReference,
    note: event.note,
    reconciledBy: event.reconciledBy,
    previousEventSha256: event.previousEventSha256,
    createdAt: event.createdAt,
  };
}

function manualPayload(event: Omit<EvaluationManualAssessmentReviewEvent, "eventSha256">): Record<string, unknown> {
  return {
    schemaVersion: 1,
    eventType: "manual-assessment",
    id: event.id,
    caseEvidenceId: event.caseEvidenceId,
    outputIndex: event.outputIndex,
    scores: event.scores,
    baselineScores: event.baselineScores,
    taskPassed: event.taskPassed,
    validForScoring: event.validForScoring,
    hardBlockers: event.hardBlockers,
    reviewNote: event.reviewNote,
    reviewerId: event.reviewerId,
    previousEventSha256: event.previousEventSha256,
    createdAt: event.createdAt,
  };
}

function billingEventFromRow(row: PersistedBillingEventRow): EvaluationBillingReviewEvent {
  if (!row.provider_request_evidence_id) throw new Error("billing event is not bound to a Provider request");
  const event: EvaluationBillingReviewEvent = {
    id: row.id,
    caseEvidenceId: row.case_evidence_id,
    providerRequestEvidenceId: row.provider_request_evidence_id,
    status: row.status,
    actualCostMinor: safeInteger(row.actual_cost_minor ?? -1, "actual_cost_minor"),
    currency: row.currency,
    billingReference: row.billing_reference,
    ...(row.note === null ? {} : { note: row.note }),
    reconciledBy: row.reconciled_by,
    previousEventSha256: row.previous_event_sha256,
    eventSha256: row.event_sha256,
    createdAt: row.created_at,
  };
  return event;
}

function manualEventFromRow(row: PersistedManualEventRow): EvaluationManualAssessmentReviewEvent {
  const scores = validateManualScores(parseJson(row.scores_json, "manual scores"));
  const baselineScores = row.baseline_scores_json === null
    ? undefined
    : validateManualScores(parseJson(row.baseline_scores_json, "baseline scores"));
  const hardBlockers = validateHardBlockers(parseJson(row.hard_blockers_json, "hard blockers"));
  return {
    id: row.id,
    caseEvidenceId: row.case_evidence_id,
    outputIndex: row.output_index,
    scores,
    ...(baselineScores ? { baselineScores } : {}),
    taskPassed: row.task_passed,
    validForScoring: row.valid_for_scoring,
    hardBlockers,
    ...(row.review_note === null ? {} : { reviewNote: row.review_note }),
    reviewerId: row.reviewer_id,
    previousEventSha256: row.previous_event_sha256,
    eventSha256: row.event_sha256,
    createdAt: row.created_at,
  };
}

function validateHardBlockers(value: unknown): readonly EvaluationHardBlocker[] {
  if (!Array.isArray(value) || value.length > MAX_HARD_BLOCKERS) {
    throw new TypeError(`hardBlockers must contain at most ${MAX_HARD_BLOCKERS} items`);
  }
  return value.map((candidate, index) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new TypeError(`hardBlockers[${index}] is invalid`);
    }
    const record = candidate as Record<string, unknown>;
    if (typeof record.code !== "string" || !HARD_BLOCKER_CODES.has(record.code as EvaluationHardBlockerCode)) {
      throw new TypeError(`hardBlockers[${index}].code is invalid`);
    }
    const blocker: EvaluationHardBlocker = {
      code: record.code as EvaluationHardBlockerCode,
      detail: requireText(String(record.detail ?? ""), `hardBlockers[${index}].detail`, 2_000),
    };
    if (record.attemptId !== undefined) {
      if (typeof record.attemptId !== "string") throw new TypeError(`hardBlockers[${index}].attemptId is invalid`);
      blocker.attemptId = requireId(record.attemptId, `hardBlockers[${index}].attemptId`);
    }
    if (record.evidenceIds !== undefined) {
      if (!Array.isArray(record.evidenceIds) || record.evidenceIds.length > MAX_EVIDENCE_IDS_PER_BLOCKER) {
        throw new TypeError(`hardBlockers[${index}].evidenceIds is invalid`);
      }
      blocker.evidenceIds = record.evidenceIds.map((id, evidenceIndex) => {
        if (typeof id !== "string") throw new TypeError(`hardBlockers[${index}].evidenceIds[${evidenceIndex}] is invalid`);
        return requireId(id, `hardBlockers[${index}].evidenceIds[${evidenceIndex}]`);
      });
    }
    return blocker;
  });
}

function uniqueHardBlockers(blockers: readonly EvaluationHardBlocker[]): readonly EvaluationHardBlocker[] {
  const byKey = new Map<string, EvaluationHardBlocker>();
  for (const blocker of blockers) byKey.set(canonicalJson(blocker), blocker);
  return [...byKey.values()];
}

async function assertBlockerEvidenceOwnership(
  client: PoolClient,
  caseEvidenceId: string,
  runId: string,
  blockers: readonly EvaluationHardBlocker[],
): Promise<void> {
  const ids = [...new Set(blockers.flatMap((blocker) => [...(blocker.evidenceIds ?? [])]))];
  if (ids.length === 0) return;
  const rows = (await client.query<{ id: string }>(`
    SELECT id FROM evaluation_image_evidence
    WHERE case_evidence_id = $1 AND run_id = $2 AND id = ANY($3::text[])
  `, [caseEvidenceId, runId, ids])).rows;
  if (rows.length !== ids.length) throw new Error("hard-blocker evidence IDs must belong to the reviewed case/run");
}

/** Append one request-level billing observation and refresh only summary fields. */
export async function appendEvaluationBillingReconciliation(
  client: PoolClient,
  actor: AuthUser,
  input: AppendEvaluationBillingInput,
  now = Date.now(),
): Promise<EvaluationBillingReviewEvent> {
  await requirePersistedAdmin(client, actor);
  const caseRow = await lockReviewCase(client, input);
  requireId(input.providerRequestEvidenceId, "providerRequestEvidenceId");
  if (input.status !== "confirmed-billed" && input.status !== "confirmed-not-billed") {
    throw new TypeError("billing status must be a confirmed state");
  }
  const actualCostMinor = safeInteger(input.actualCostMinor, "actualCostMinor");
  if (input.status === "confirmed-not-billed" && actualCostMinor !== 0) {
    throw new Error("confirmed-not-billed requires actualCostMinor to equal zero");
  }
  if (input.status === "confirmed-billed" && actualCostMinor < 1) {
    throw new Error("confirmed-billed requires a positive actualCostMinor");
  }
  if (!CURRENCY_PATTERN.test(input.currency)) throw new TypeError("currency must be a three-letter uppercase code");
  const billingReference = requireText(
    input.billingReference,
    "billingReference",
    MAX_BILLING_REFERENCE_LENGTH,
  );
  const note = optionalText(input.note, "note", MAX_NOTE_LENGTH);
  const request = (await client.query<BillingRequestRow>(`
    SELECT id, case_evidence_id, run_id, outcome, budget_currency
    FROM evaluation_provider_request_evidence
    WHERE id = $1 AND case_evidence_id = $2 AND run_id = $3
    FOR UPDATE
  `, [input.providerRequestEvidenceId, caseRow.id, caseRow.run_id])).rows[0];
  if (!request) throw new Error("Provider request evidence does not belong to the reviewed case/run");
  if (request.outcome === "started") throw new Error("an unresolved Provider request cannot be billing-reconciled");
  if (request.budget_currency !== input.currency) {
    throw new Error("billing currency does not match the request authorization currency");
  }
  const previous = (await client.query<Pick<PersistedBillingEventRow, "event_sha256" | "created_at">>(`
    SELECT event_sha256, created_at
    FROM evaluation_billing_reconciliation_events
    WHERE case_evidence_id = $1
    ORDER BY created_at DESC, id DESC LIMIT 1
  `, [caseRow.id])).rows[0];
  const createdAt = nextEventTimestamp(now, previous?.created_at);
  const base: Omit<EvaluationBillingReviewEvent, "eventSha256"> = {
    id: `billing-review:${randomUUID()}`,
    caseEvidenceId: caseRow.id,
    providerRequestEvidenceId: request.id,
    status: input.status,
    actualCostMinor,
    currency: input.currency,
    billingReference,
    ...(note === undefined ? {} : { note }),
    reconciledBy: actor.id,
    previousEventSha256: previous?.event_sha256 ?? null,
    createdAt,
  };
  const event: EvaluationBillingReviewEvent = { ...base, eventSha256: sha256(billingPayload(base)) };
  await client.query(`
    INSERT INTO evaluation_billing_reconciliation_events (
      id, case_evidence_id, provider_request_evidence_id, status,
      actual_cost_minor, currency, billing_reference, note, reconciled_by,
      previous_event_sha256, event_sha256, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [
    event.id, event.caseEvidenceId, event.providerRequestEvidenceId, event.status,
    event.actualCostMinor, event.currency, event.billingReference, event.note ?? null,
    event.reconciledBy, event.previousEventSha256, event.eventSha256, event.createdAt,
  ]);
  const requestUpdated = await client.query(`
    UPDATE evaluation_provider_request_evidence
    SET actual_cost_minor = $1, billing_reconciliation_status = $2, billing_reference = $3
    WHERE id = $4 AND case_evidence_id = $5 AND run_id = $6
  `, [actualCostMinor, input.status, billingReference, request.id, caseRow.id, caseRow.run_id]);
  if (requestUpdated.rowCount !== 1) throw new Error("Provider request billing summary changed unexpectedly");
  const aggregate = (await client.query<{
    total: number;
    pending: number;
    billed: number;
  }>(`
    SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE billing_reconciliation_status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE billing_reconciliation_status = 'confirmed-billed')::int AS billed
    FROM evaluation_provider_request_evidence WHERE case_evidence_id = $1
  `, [caseRow.id])).rows[0];
  if (!aggregate || aggregate.total < 1) throw new Error("reviewed case has no Provider request evidence");
  const caseStatus = aggregate.pending > 0
    ? "pending"
    : aggregate.billed > 0 ? "confirmed-billed" : "confirmed-not-billed";
  await client.query(`
    UPDATE evaluation_case_evidence
    SET billing_reconciliation_status = $1, billing_reference = $2,
      billing_reconciled_by = $3, billing_reconciliation_note = $4,
      billing_reconciled_at = $5, updated_at = $6
    WHERE id = $7 AND run_id = $8
  `, [
    caseStatus,
    billingReference,
    caseStatus === "pending" ? null : actor.id,
    caseStatus === "pending" ? `partial billing review: ${aggregate.total - aggregate.pending}/${aggregate.total}` : note ?? null,
    caseStatus === "pending" ? null : createdAt,
    createdAt,
    caseRow.id,
    caseRow.run_id,
  ]);
  const runUpdated = await client.query(`
    UPDATE generation_runs
    SET billing_reconciliation_status = $1, updated_at = $2
    WHERE id = $3 AND owner_id = $4 AND run_type = 'evaluation'
      AND evaluation_case_id = $5 AND evaluation_authorization_id = $6
  `, [
    caseStatus,
    Date.parse(createdAt),
    caseRow.run_id,
    caseRow.owner_id,
    caseRow.case_id,
    caseRow.authorization_id,
  ]);
  if (runUpdated.rowCount !== 1) throw new Error("evaluation run billing summary changed unexpectedly");
  return cloneFrozen(event);
}

function averageScores(events: readonly EvaluationManualAssessmentReviewEvent[]): PromptEvaluationScores {
  const keys = [
    "garmentMaterialFidelity",
    "instructionFollowing",
    "artifactControl",
    "commercialUsability",
  ] as const;
  const averaged = Object.fromEntries(keys.map((key) => [
    key,
    Math.round((events.reduce((sum, event) => sum + event.scores[key], 0) / events.length) * 100) / 100,
  ])) as unknown as PromptEvaluationScores;
  return validateManualScores(averaged);
}

/** Append one output assessment and refresh the case aggregate when all outputs are reviewed. */
export async function appendEvaluationManualAssessment(
  client: PoolClient,
  actor: AuthUser,
  input: AppendEvaluationManualAssessmentInput,
  now = Date.now(),
): Promise<EvaluationManualAssessmentReviewEvent> {
  await requirePersistedAdmin(client, actor);
  if (input.baselineScores !== undefined) {
    throw new Error(
      "detached baselineScores are legacy-only and cannot be written until traceable candidate/baseline case pairs are implemented",
    );
  }
  const caseRow = await lockReviewCase(client, input);
  if (caseRow.outcome !== "succeeded") throw new Error("manual output assessment requires a succeeded evaluation case");
  if (!Number.isSafeInteger(input.outputIndex) || input.outputIndex < 0) {
    throw new RangeError("outputIndex is invalid");
  }
  if (typeof input.taskPassed !== "boolean" || typeof input.validForScoring !== "boolean") {
    throw new TypeError("manual assessment decisions must be boolean");
  }
  if (!input.validForScoring) {
    throw new Error("an existing postprocessed output must remain valid for scoring, including severe failures");
  }
  const scores = validateManualScores(input.scores);
  const hardBlockers = validateHardBlockers(input.hardBlockers ?? []);
  if (hardBlockers.length > 0 && input.taskPassed) {
    throw new Error("a manual assessment with hard blockers cannot pass the task");
  }
  const reviewNote = optionalText(input.reviewNote, "reviewNote", MAX_NOTE_LENGTH);
  const output = (await client.query<{ id: string; source_evidence_id: string }>(`
    SELECT result.id, result.source_evidence_id
    FROM evaluation_image_evidence result
    JOIN evaluation_image_evidence source
      ON source.id = result.source_evidence_id
      AND source.case_evidence_id = result.case_evidence_id
      AND source.run_id = result.run_id
      AND source.output_index = result.output_index
      AND source.layer = 'provider-original'
    WHERE result.case_evidence_id = $1 AND result.run_id = $2
      AND result.output_index = $3 AND result.layer = 'postprocessed'
    FOR SHARE OF result, source
  `, [caseRow.id, caseRow.run_id, input.outputIndex])).rows[0];
  if (!output) throw new Error("postprocessed output does not belong to the reviewed case/run/index");
  await assertBlockerEvidenceOwnership(client, caseRow.id, caseRow.run_id, hardBlockers);
  const previous = (await client.query<Pick<PersistedManualEventRow, "event_sha256" | "created_at">>(`
    SELECT event_sha256, created_at
    FROM evaluation_manual_assessment_events
    WHERE case_evidence_id = $1
    ORDER BY created_at DESC, id DESC LIMIT 1
  `, [caseRow.id])).rows[0];
  const createdAt = nextEventTimestamp(now, previous?.created_at);
  const base: Omit<EvaluationManualAssessmentReviewEvent, "eventSha256"> = {
    id: `manual-review:${randomUUID()}`,
    caseEvidenceId: caseRow.id,
    outputIndex: input.outputIndex,
    scores,
    taskPassed: input.taskPassed,
    validForScoring: true,
    hardBlockers,
    ...(reviewNote === undefined ? {} : { reviewNote }),
    reviewerId: actor.id,
    previousEventSha256: previous?.event_sha256 ?? null,
    createdAt,
  };
  const event: EvaluationManualAssessmentReviewEvent = { ...base, eventSha256: sha256(manualPayload(base)) };
  await client.query(`
    INSERT INTO evaluation_manual_assessment_events (
      id, case_evidence_id, output_index, scores_json, baseline_scores_json,
      task_passed, valid_for_scoring, hard_blockers_json, review_note,
      reviewer_id, previous_event_sha256, event_sha256, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `, [
    event.id, event.caseEvidenceId, event.outputIndex, JSON.stringify(event.scores),
    null,
    event.taskPassed, event.validForScoring, JSON.stringify(event.hardBlockers),
    event.reviewNote ?? null, event.reviewerId, event.previousEventSha256,
    event.eventSha256, event.createdAt,
  ]);
  const latestRows = (await client.query<PersistedManualEventRow>(`
    SELECT DISTINCT ON (output_index) *
    FROM evaluation_manual_assessment_events
    WHERE case_evidence_id = $1
    ORDER BY output_index ASC, created_at DESC, id DESC
  `, [caseRow.id])).rows;
  const latest = latestRows.map(manualEventFromRow);
  const outputCount = (await client.query<{ count: number }>(`
    SELECT COUNT(*)::int AS count FROM evaluation_image_evidence
    WHERE case_evidence_id = $1 AND run_id = $2 AND layer = 'postprocessed'
  `, [caseRow.id, caseRow.run_id])).rows[0]?.count ?? 0;
  const persistedBlockers = validateHardBlockers(parseJson(caseRow.hard_blockers_json, "case hard blockers"));
  const summaryBlockers = uniqueHardBlockers([
    ...persistedBlockers,
    ...latest.flatMap((assessment) => [...assessment.hardBlockers]),
  ]);
  if (latest.length === outputCount && outputCount > 0) {
    const aggregateScores = averageScores(latest);
    const haveAllBaselines = latest.every((assessment) => assessment.baselineScores !== undefined);
    const baseline = haveAllBaselines
      ? averageScores(latest.map((assessment) => ({ ...assessment, scores: assessment.baselineScores! })))
      : undefined;
    await client.query(`
      UPDATE evaluation_case_evidence
      SET manual_scores_json = $1, baseline_scores_json = $2,
        task_passed = $3, valid_for_scoring = TRUE, hard_blockers_json = $4,
        reviewer_id = $5, review_note = $6, reviewed_at = $7, updated_at = $7
      WHERE id = $8 AND run_id = $9
    `, [
      JSON.stringify(aggregateScores), baseline ? JSON.stringify(baseline) : null,
      latest.every((assessment) => assessment.taskPassed) && summaryBlockers.length === 0,
      JSON.stringify(summaryBlockers), actor.id,
      reviewNote ?? `reviewed ${latest.length} output(s)`, createdAt, caseRow.id, caseRow.run_id,
    ]);
  } else {
    await client.query(`
      UPDATE evaluation_case_evidence
      SET hard_blockers_json = $1, updated_at = $2
      WHERE id = $3 AND run_id = $4
    `, [JSON.stringify(summaryBlockers), createdAt, caseRow.id, caseRow.run_id]);
  }
  return cloneFrozen(event);
}

function verifyBillingChain(rows: readonly PersistedBillingEventRow[]): readonly EvaluationBillingReviewEvent[] {
  let previous: string | null = null;
  return rows.map((row) => {
    const event = billingEventFromRow(row);
    if (event.previousEventSha256 !== previous) throw new Error("billing review event chain is broken");
    const { eventSha256: _stored, ...base } = event;
    const calculated = sha256(billingPayload(base));
    if (!SHA256_PATTERN.test(event.eventSha256) || calculated !== event.eventSha256) {
      throw new Error("billing review event SHA-256 is invalid");
    }
    previous = event.eventSha256;
    return cloneFrozen(event);
  });
}

function verifyManualChain(rows: readonly PersistedManualEventRow[]): readonly EvaluationManualAssessmentReviewEvent[] {
  let previous: string | null = null;
  return rows.map((row) => {
    const event = manualEventFromRow(row);
    if (event.previousEventSha256 !== previous) throw new Error("manual review event chain is broken");
    const { eventSha256: _stored, ...base } = event;
    const calculated = sha256(manualPayload(base));
    if (!SHA256_PATTERN.test(event.eventSha256) || calculated !== event.eventSha256) {
      throw new Error("manual review event SHA-256 is invalid");
    }
    previous = event.eventSha256;
    return cloneFrozen(event);
  });
}

const JSON_COLUMNS = new Set([
  "native_parameters_json",
  "reference_inputs_json",
  "snapshot_json",
  "error_events_json",
  "hard_blockers_json",
  "manual_scores_json",
  "baseline_scores_json",
  "business_parameters_json",
  "provider_output_sizes_json",
]);

function exportRow(row: Record<string, unknown>): Readonly<Record<string, unknown>> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key.endsWith("_json") && JSON_COLUMNS.has(key) && typeof value === "string"
      ? key.slice(0, -5)
      : key] = key.endsWith("_json") && JSON_COLUMNS.has(key) && typeof value === "string"
        ? parseJson(value, key)
        : value;
  }
  return cloneFrozen(result);
}

/** Load one relationally bound, chain-verified case without changing evidence. */
export async function loadEvaluationCaseEvidenceBundle(
  client: PoolClient,
  actor: AuthUser,
  input: LoadEvaluationCaseEvidenceInput,
  now = Date.now(),
): Promise<EvaluationCaseEvidenceBundle> {
  await requirePersistedAdmin(client, actor);
  requireId(input.caseEvidenceId, "caseEvidenceId");
  requireId(input.runId, "runId");
  const caseRow = (await client.query<Record<string, unknown>>(`
    SELECT * FROM evaluation_case_evidence WHERE id = $1 AND run_id = $2 FOR SHARE
  `, [input.caseEvidenceId, input.runId])).rows[0];
  if (!caseRow) throw new Error("evaluation case/run evidence binding was not found");
  const run = (await client.query<Record<string, unknown>>(`
    SELECT * FROM generation_runs
    WHERE id = $1 AND owner_id = $2 AND evaluation_case_id = $3
      AND evaluation_authorization_id = $4 AND run_type = 'evaluation'
  `, [input.runId, caseRow.owner_id, caseRow.case_id, caseRow.authorization_id])).rows[0];
  if (!run) throw new Error("evaluation run does not own the requested case evidence");
  const authorization = (await client.query<Record<string, unknown>>(`
    SELECT * FROM evaluation_run_authorizations
    WHERE authorization_id = $1 AND owner_id = $2 AND bound_case_id = $3 AND bound_run_id = $4
  `, [caseRow.authorization_id, caseRow.owner_id, caseRow.case_id, input.runId])).rows[0];
  if (!authorization) throw new Error("evaluation authorization does not own the requested case/run evidence");
  const providerRequests = (await client.query<Record<string, unknown>>(`
    SELECT * FROM evaluation_provider_request_evidence
    WHERE case_evidence_id = $1 AND run_id = $2 ORDER BY request_index ASC
  `, [input.caseEvidenceId, input.runId])).rows;
  const images = (await client.query<Record<string, unknown>>(`
    SELECT * FROM evaluation_image_evidence
    WHERE case_evidence_id = $1 AND run_id = $2 ORDER BY output_index ASC, layer ASC
  `, [input.caseEvidenceId, input.runId])).rows;
  const billingRows = (await client.query<PersistedBillingEventRow>(`
    SELECT * FROM evaluation_billing_reconciliation_events
    WHERE case_evidence_id = $1 ORDER BY created_at ASC, id ASC
  `, [input.caseEvidenceId])).rows;
  const manualRows = (await client.query<PersistedManualEventRow>(`
    SELECT * FROM evaluation_manual_assessment_events
    WHERE case_evidence_id = $1 ORDER BY created_at ASC, id ASC
  `, [input.caseEvidenceId])).rows;
  const bundle: EvaluationCaseEvidenceBundle = {
    schemaVersion: 1,
    run: exportRow(run),
    authorization: exportRow(authorization),
    caseEvidence: exportRow(caseRow),
    providerRequests: providerRequests.map(exportRow),
    images: images.map(exportRow),
    billingEvents: verifyBillingChain(billingRows),
    manualAssessmentEvents: verifyManualChain(manualRows),
    exportedAt: nextEventTimestamp(now),
  };
  return cloneFrozen(bundle);
}
