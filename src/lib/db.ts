import { Pool, type PoolConfig } from "pg";

declare global {
  var __tbmPool: Pool | undefined;
}

function buildConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Use the Supabase *Transaction pooler* URI (port 6543) or a local Postgres URL.",
    );
  }
  const url = new URL(connectionString);
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname) || url.hostname === "";
  const sslMode = process.env.DATABASE_SSL ?? (local ? "disable" : "require");
  return {
    connectionString,
    // Serverless-friendly: few connections per instance, short idle timeout.
    max: Number(process.env.DATABASE_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl:
      sslMode === "disable"
        ? false
        : sslMode === "strict"
          ? { rejectUnauthorized: true }
          : { rejectUnauthorized: false },
  };
}

/** Shared connection pool. Cached on globalThis so hot reloads / warm lambdas reuse it. */
export function getPool(): Pool {
  if (!globalThis.__tbmPool) {
    globalThis.__tbmPool = new Pool(buildConfig());
  }
  return globalThis.__tbmPool;
}

export async function query<T extends import("pg").QueryResultRow = import("pg").QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}
