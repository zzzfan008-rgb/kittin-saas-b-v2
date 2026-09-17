import { DURABLE_RUN_EVENT_BATCH_SIZE, parseJson } from "./types";
import { db, query, queryOne, transaction } from "../../lib/database";
import { executeStep, type ProviderResolver, type RunEvent, type StepResult } from "../runner";
import {
  ActiveRunLimitError,
  CancelledBeforeProviderCall,
  EvaluationCaseConflictError,
  GenerationOwnerUnavailableError,
  GenerationRequestConflictError,
  isRetryableProviderError,
  isTerminalRunStatus,
  outcomeUnknownMessage,
  type DurableRunStatus,
} from "../runQueueContracts";
export async function getDurableRunForUser(
  runId: string,
  ownerId: string,
): Promise<{ id: string; status: string; finished: boolean } | undefined> {
  const row = await queryOne<{ id: string; status: string }>(`
    SELECT id, status FROM generation_runs
    WHERE id = $1 AND owner_id = $2 AND plan_json IS NOT NULL AND deleted_at IS NULL
  `, [runId, ownerId]);
  return row ? { id: row.id, status: row.status, finished: isTerminalRunStatus(row.status) } : undefined;
}


export async function readDurableRunEvents(
  runId: string,
  ownerId: string,
  afterSeq: number,
): Promise<RunEvent[] | undefined> {
  const run = await queryOne<{ id: string }>(`
    SELECT id FROM generation_runs
    WHERE id = $1 AND owner_id = $2 AND plan_json IS NOT NULL AND deleted_at IS NULL
  `, [runId, ownerId]);
  if (!run) return undefined;
  const rows = await query<{ seq: number; payload_json: string }>(`
    SELECT seq, payload_json FROM generation_run_events
    WHERE run_id = $1 AND seq > $2 ORDER BY seq ASC LIMIT $3
  `, [runId, afterSeq, DURABLE_RUN_EVENT_BATCH_SIZE]);
  return rows.map((row) => ({ ...parseJson<RunEvent>(row.payload_json, { type: "done" }), seq: row.seq }));
}
