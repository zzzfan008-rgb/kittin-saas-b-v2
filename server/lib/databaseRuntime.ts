import pg, { type PoolClient, type QueryResultRow } from "pg";
import { config } from "../config";

const { Pool, types } = pg;
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
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
