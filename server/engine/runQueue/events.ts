import type { PoolClient } from "pg";
import { db, query, queryOne, transaction } from "../../lib/database";
import { executeStep, type ProviderResolver, type RunEvent, type StepResult } from "../runner";
export async function appendRunEvent(
  client: PoolClient,
  runId: string,
  event: RunEvent,
  createdAt: number,
): Promise<RunEvent> {
  const seqRow = (await client.query<{ seq: number }>(`
    UPDATE generation_runs
    SET next_event_seq = next_event_seq + 1
    WHERE id = $1
    RETURNING next_event_seq::int AS seq
  `, [runId])).rows[0];
  if (!seqRow) throw new Error("generation run disappeared while appending an event");
  const sequenced = { ...event, seq: seqRow.seq } as RunEvent;
  await client.query(`
    INSERT INTO generation_run_events (run_id, seq, payload_json, created_at)
    VALUES ($1, $2, $3, $4)
  `, [runId, sequenced.seq, JSON.stringify(sequenced), createdAt]);
  return sequenced;
}
