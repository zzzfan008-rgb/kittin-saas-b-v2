import pg, { type PoolClient, type QueryResultRow } from "pg";
import { config } from "../config";

const { Pool, types } = pg;
// BIGINT（int8，OID 20）默认以字符串返回，这里统一解析为 Number。当前 schema 的 BIGINT 列
// 只有两类用途，数值都远小于 Number.MAX_SAFE_INTEGER（2^53 - 1 ≈ 9.0e15），因此该转换安全：
//   1. 时间戳：epoch 毫秒（Date.now()，约 1.8e12），如 started_at / finished_at / available_at；
//   2. 小额「minor」货币单位（分/cent），如 budget_limit_minor / price_minor_per_provider_request。
// 若未来新增可能超过 2^53 - 1 的 BIGINT 列（纳秒时间戳、真实金额总分、自增 id 等），
// 必须停止依赖该解析器并改回字符串（或按 int8 精确读取），否则会静默丢失精度。
types.setTypeParser(20, Number);

const REQUIRED_POSTGRES_MAJOR = 18;
let pool: pg.Pool | undefined;
let initialization: Promise<void> | undefined;

export function db(): pg.Pool {
  if (!pool) {
    const connectionString = config.databaseUrl();
    pool = new Pool({
      ...(connectionString
        ? { connectionString }
        : {
            host: config.databaseHost(),
            port: config.databasePort(),
            database: config.databaseName(),
            user: config.databaseUser(),
            password: config.databasePassword(),
          }),
      max: config.databasePoolSize(),
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    });
    pool.on("error", (error) => console.error("[garment-canvas] PostgreSQL idle client error", error));
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
  client: pg.Pool | PoolClient = db(),
): Promise<T[]> {
  return (await client.query<T>(text, values)).rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
  client: pg.Pool | PoolClient = db(),
): Promise<T | undefined> {
  return (await client.query<T>(text, values)).rows[0];
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    const originalError = await rollbackPreservingError(client, error);
    throw originalError;
  } finally {
    client.release();
  }
}

/**
 * 回滚当前事务，ROLLBACK 自身失败时不得掩盖原始错误。
 *
 * 尝试 ROLLBACK 后返回调用方传入的原始错误，由 transaction() 抛出。当 ROLLBACK 也失败
 * （例如连接已断、服务端已回滚或事务已结束）时，把 ROLLBACK 失败作为 `cause` 挂在原始
 * 错误上供上层诊断，而不是让 ROLLBACK 错误替换掉原始错误。原始错误不是 Error 实例时
 * 无法挂 cause，但仍原样返回原始错误。
 */
export async function rollbackPreservingError(
  client: { query: (text: string) => Promise<unknown> },
  error: unknown,
): Promise<unknown> {
  try {
    await client.query("ROLLBACK");
  } catch (rollbackError) {
    if (error instanceof Error) {
      error.cause = rollbackError;
    }
  }
  return error;
}

export async function assertDatabaseVersion(): Promise<void> {
  const row = await queryOne<{ version_num: number }>(
    "SELECT current_setting('server_version_num')::int AS version_num",
  );
  const major = Math.floor((row?.version_num ?? 0) / 10_000);
  if (major !== REQUIRED_POSTGRES_MAJOR) {
    throw new Error(
      `PostgreSQL ${REQUIRED_POSTGRES_MAJOR} is required; connected server is major version ${major || "unknown"}`,
    );
  }
}

export function databaseInitialization(): Promise<void> | undefined {
  return initialization;
}

export function setDatabaseInitialization(value: Promise<void> | undefined): void {
  initialization = value;
}

export async function closeDatabaseForTests(): Promise<void> {
  const current = pool;
  pool = undefined;
  initialization = undefined;
  if (current) await current.end();
}
