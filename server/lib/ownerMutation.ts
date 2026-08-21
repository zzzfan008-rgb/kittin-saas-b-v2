import type { PoolClient } from "pg";

/**
 * 与账号转移/删除的 `FOR NO KEY UPDATE` 互斥。
 * 调用方必须在 owner-scoped 写事务的第一步取得此锁，并一直持有到提交。
 */
export async function lockActiveOwner(client: PoolClient, ownerId: string): Promise<boolean> {
  const owner = (await client.query<{ active: number; deleted_at: string | null }>(`
    SELECT active, deleted_at FROM users WHERE id = $1 FOR SHARE
  `, [ownerId])).rows[0];
  return Boolean(owner && owner.active === 1 && owner.deleted_at === null);
}
