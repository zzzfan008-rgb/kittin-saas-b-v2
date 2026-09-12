import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { config } from "../config";
import { writeJsonAtomicSync } from "./atomicJson";
import { queryOne } from "./database";

const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const RECORD_FILE = /^[A-Za-z0-9_-]{1,128}\.json$/;

/** Shared by the route and lifecycle code to distinguish stale running records after restart. */
export const OPENAI_MASK_TEST_BOOT_ID = randomUUID();

interface StoredRecord extends Record<string, unknown> {
  status?: unknown;
  bootId?: unknown;
  deletedAt?: unknown;
  purgeAfter?: unknown;
}

interface UpdateChange {
  kind: "update";
  filePath: string;
  before: StoredRecord;
  after: StoredRecord;
}

interface MoveChange {
  kind: "move";
  from: string;
  to: string;
}

type Change = UpdateChange | MoveChange;

interface MutationJournal {
  id: string;
  sourceOwnerId: string;
  sourceDeletedAt: string;
  transferToOwnerId?: string;
  deletedAt?: string;
  purgeAfter?: string;
  changes: Change[];
}

function recordsRoot(): string {
  const dir = path.join(config.dataDir(), "openai-mask-tests");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function openAiMaskTestRecordDirectory(ownerId: string): string {
  const ownerHash = createHash("sha256").update(ownerId).digest("hex");
  const dir = path.join(recordsRoot(), ownerHash);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}

export function openAiMaskTestRecordPath(ownerId: string, id: string): string {
  if (!SAFE_ID.test(id)) throw new Error("测试记录 ID 无效");
  return path.join(openAiMaskTestRecordDirectory(ownerId), `${id}.json`);
}

function recordFiles(ownerId: string): string[] {
  const directory = openAiMaskTestRecordDirectory(ownerId);
  return fs.readdirSync(directory)
    .filter((fileName) => RECORD_FILE.test(fileName))
    .map((fileName) => path.join(directory, fileName));
}

function readRecord(filePath: string): StoredRecord {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as StoredRecord;
}

function mutationDirectory(): string {
  const dir = path.join(recordsRoot(), ".account-mutations");
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}

function mutationPath(id: string): string {
  return path.join(mutationDirectory(), `${id}.json`);
}

function writeMutationJournal(journal: MutationJournal): string {
  const filePath = mutationPath(journal.id);
  writeJsonAtomicSync(filePath, journal);
  return filePath;
}

function applyChanges(journal: MutationJournal): void {
  for (const change of journal.changes) {
    if (change.kind === "update") {
      writeJsonAtomicSync(change.filePath, change.after);
      continue;
    }
    fs.mkdirSync(path.dirname(change.to), { recursive: true, mode: 0o700 });
    if (fs.existsSync(change.from)) fs.renameSync(change.from, change.to);
  }
}

function restoreChanges(journal: MutationJournal): void {
  for (const change of [...journal.changes].reverse()) {
    if (change.kind === "update") {
      writeJsonAtomicSync(change.filePath, change.before);
      continue;
    }
    fs.mkdirSync(path.dirname(change.from), { recursive: true, mode: 0o700 });
    if (fs.existsSync(change.to) && !fs.existsSync(change.from)) fs.renameSync(change.to, change.from);
  }
}

function mutationCommitted(
  journal: MutationJournal,
  source: { active: number; deleted_at: string | null } | undefined,
): boolean | undefined {
  if (!source) return undefined;
  if (source.deleted_at === journal.sourceDeletedAt) return true;
  if (source.active === 1 && source.deleted_at === null) return false;
  return undefined;
}

/** Reconcile filesystem account mutations after a crash or a failed DB transaction. */
export async function reconcileOpenAiMaskTestAccountMutations(): Promise<number> {
  const dir = mutationDirectory();
  let reconciled = 0;
  for (const fileName of fs.readdirSync(dir)) {
    if (!fileName.endsWith(".json")) continue;
    const journalPath = path.join(dir, fileName);
    try {
      const journal = JSON.parse(fs.readFileSync(journalPath, "utf8")) as MutationJournal;
      if (!journal.id || !journal.sourceOwnerId || !journal.sourceDeletedAt || !Array.isArray(journal.changes)) {
        throw new Error("invalid OpenAI mask test mutation journal");
      }
      const source = await queryOne<{ active: number; deleted_at: string | null }>(
        "SELECT active, deleted_at FROM users WHERE id = $1",
        [journal.sourceOwnerId],
      );
      const committed = mutationCommitted(journal, source);
      if (committed === undefined) continue;
      if (committed) applyChanges(journal);
      else restoreChanges(journal);
      fs.unlinkSync(journalPath);
      reconciled += 1;
    } catch (error) {
      console.error(`[garment-canvas] failed to reconcile OpenAI mask test mutation ${fileName}`, error);
    }
  }
  return reconciled;
}

export interface OpenAiMaskTestAccountMutation {
  readonly changedCount: number;
  readonly activeCount: number;
  readonly conflictCount: number;
  apply(): void;
}

/** Prepare a reversible transfer or deletion of per-owner test records. */
export function prepareOpenAiMaskTestAccountMutation(input: {
  sourceOwnerId: string;
  transferToOwnerId?: string;
  sourceDeletedAt: string;
  deletedAt?: string;
  purgeAfter?: string;
}): OpenAiMaskTestAccountMutation {
  const changes: Change[] = [];
  let activeCount = 0;
  let conflictCount = 0;
  const sourceFiles = recordFiles(input.sourceOwnerId);

  for (const filePath of sourceFiles) {
    let record: StoredRecord;
    try {
      record = readRecord(filePath);
    } catch {
      continue;
    }
    if (record.status === "running" && record.bootId === OPENAI_MASK_TEST_BOOT_ID) activeCount += 1;
    if (input.transferToOwnerId) {
      const targetPath = path.join(
        openAiMaskTestRecordDirectory(input.transferToOwnerId),
        path.basename(filePath),
      );
      if (fs.existsSync(targetPath)) {
        conflictCount += 1;
        continue;
      }
      changes.push({ kind: "move", from: filePath, to: targetPath });
    } else {
      changes.push({
        kind: "update",
        filePath,
        before: record,
        after: {
          ...record,
          ...(input.deletedAt ? { deletedAt: input.deletedAt } : {}),
          ...(input.purgeAfter ? { purgeAfter: input.purgeAfter } : {}),
        },
      });
    }
  }

  const journal: MutationJournal = {
    id: `account-${Date.now()}-${process.pid}-${Math.random().toString(36).slice(2, 10)}`,
    sourceOwnerId: input.sourceOwnerId,
    sourceDeletedAt: input.sourceDeletedAt,
    ...(input.transferToOwnerId ? { transferToOwnerId: input.transferToOwnerId } : {}),
    ...(input.deletedAt ? { deletedAt: input.deletedAt } : {}),
    ...(input.purgeAfter ? { purgeAfter: input.purgeAfter } : {}),
    changes,
  };
  return {
    changedCount: changes.length,
    activeCount,
    conflictCount,
    apply() {
      if (changes.length === 0) return;
      writeMutationJournal(journal);
      applyChanges(journal);
    },
  };
}

export function purgeExpiredOpenAiMaskTests(nowIso = new Date().toISOString()): number {
  const root = recordsRoot();
  let purged = 0;
  for (const ownerDir of fs.readdirSync(root)) {
    if (ownerDir === ".account-mutations") continue;
    const directory = path.join(root, ownerDir);
    if (!fs.statSync(directory).isDirectory()) continue;
    for (const fileName of fs.readdirSync(directory)) {
      if (!RECORD_FILE.test(fileName)) continue;
      const filePath = path.join(directory, fileName);
      try {
        const record = readRecord(filePath);
        if (typeof record.purgeAfter === "string" && record.purgeAfter <= nowIso) {
          fs.unlinkSync(filePath);
          purged += 1;
        }
      } catch {
        // Preserve malformed records for offline repair rather than guessing their owner or age.
      }
    }
  }
  return purged;
}
