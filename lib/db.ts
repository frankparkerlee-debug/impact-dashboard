// Render Postgres connection pool. Imported by server components and the sync job.
import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const isLocal = (process.env.DATABASE_URL ?? "").includes("localhost");

export const pool: Pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Render Postgres requires SSL; local dev usually doesn't.
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
  });

if (process.env.NODE_ENV !== "production") global._pgPool = pool;

export function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params as unknown[]);
}
