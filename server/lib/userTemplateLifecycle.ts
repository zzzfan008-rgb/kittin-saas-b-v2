import fs from "node:fs";
import path from "node:path";
import { config } from "../config";
import { writeJsonAtomicSync } from "./atomicJson";
import { queryOne } from "./database";

interface StoredTemplateMetadata extends Record<string, unknown> {
  id?: unknown;
  ownerId?: unknown;
  deletedAt?: unknown;
  purgeAfter?: unknown;
}

function userTemplatesDir(): string {
  const dir = path.join(config.dataDir(), "templates", "user");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function userTemplateFiles(): string[] {
  return fs.readdirSync(userTemplatesDir())
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join(userTemplatesDir(), name));
}

function readMetadata(filePath: string): StoredTemplateMetadata {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as StoredTemplateMetadata;
}

/**
 * 旧版用户模板没有 ownerId。升级时把它们确定性归属给最早创建的有效管理员
 * （历史单账号部署的原始账号），避免升级后模板突然消失。若没有管理员，则回退
 * 到最早创建的有效用户。只有可解析且 id 与文件名一致的记录会被认领。
 */
export async function migrateLegacyUserTemplateOwners(): Promise<number> {
  const fallbackOwner = await queryOne<{ id: string }>(`
    SELECT id FROM users
    WHERE deleted_at IS NULL
    ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, created_at ASC, id ASC
    LIMIT 1
  `);
  if (!fallbackOwner) return 0;

  let migrated = 0;
  for (const filePath of userTemplateFiles()) {
    try {
      const stored = readMetadata(filePath);
      if (typeof stored.ownerId === "string" && stored.ownerId.length > 0) continue;
      if (typeof stored.id !== "string" || path.basename(filePath, ".json") !== stored.id) continue;
      writeJsonAtomicSync(filePath, { ...stored, ownerId: fallbackOwner.id });
      migrated += 1;
    } catch {
      // 损坏文件继续由模板读取层隔离；不能在迁移中覆盖或删除。
    }
  }
  return migrated;
}

export function purgeExpiredUserTemplates(nowIso = new Date().toISOString()): number {
  let purged = 0;
  for (const filePath of userTemplateFiles()) {
    try {
      const stored = readMetadata(filePath);
      if (typeof stored.purgeAfter === "string" && stored.purgeAfter <= nowIso) {
        fs.unlinkSync(filePath);
        purged += 1;
      }
    } catch {
      // 损坏文件不是可证明已到期的数据，保留供管理员离线修复。
    }
  }
  return purged;
}

export interface UserTemplateAccountMutation {
  readonly changedCount: number;
  apply(): void;
  rollback(): void;
}

/**
 * 账号事务持有 source/target 用户锁后调用。文件修改在数据库提交前完成；若后续
 * SQL 或 COMMIT 失败，调用方用 rollback 恢复逐字节等价的 JSON 内容。
 */
export function prepareUserTemplateAccountMutation(input: {
  sourceOwnerId: string;
  transferToOwnerId?: string;
  deletedAt?: string;
  purgeAfter?: string;
}): UserTemplateAccountMutation {
  const changes: Array<{ filePath: string; before: StoredTemplateMetadata; after: StoredTemplateMetadata }> = [];
  for (const filePath of userTemplateFiles()) {
    try {
      const before = readMetadata(filePath);
      if (before.ownerId !== input.sourceOwnerId) continue;
      const after = input.transferToOwnerId
        ? { ...before, ownerId: input.transferToOwnerId }
        : { ...before, deletedAt: input.deletedAt, purgeAfter: input.purgeAfter };
      changes.push({ filePath, before, after });
    } catch {
      // 无法解析的文件没有可验证 owner，不能在账号操作中猜测归属。
    }
  }

  let applied = false;
  const rollback = () => {
    if (!applied) return;
    for (const change of changes) writeJsonAtomicSync(change.filePath, change.before);
    applied = false;
  };
  return {
    changedCount: changes.length,
    apply() {
      try {
        for (const change of changes) writeJsonAtomicSync(change.filePath, change.after);
        applied = true;
      } catch (error) {
        applied = true;
        rollback();
        throw error;
      }
    },
    rollback,
  };
}
