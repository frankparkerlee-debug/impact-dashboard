import { pool } from "./db";
import { getBoardItems, type MondayItem } from "./monday";
import type { Tenant, BoardKey } from "./tenants";

const BOARDS: BoardKey[] = [
  "tracts", "leases", "leasePayments", "landOwners", "landInterest", "aoi", "curative", "leads",
];

async function upsertBatch(tenantSlug: string, board: string, items: MondayItem[]): Promise<void> {
  const CHUNK = 400;
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const params: unknown[] = [];
    const rows = chunk.map((it, j) => {
      const data = Object.fromEntries(it.column_values.map((c) => [c.id, c.text]));
      const b = j * 5;
      params.push(tenantSlug, board, it.id, it.name, JSON.stringify(data));
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5})`;
    });
    await pool.query(
      `INSERT INTO monday_items (tenant, board, monday_item_id, name, data)
       VALUES ${rows.join(",")}
       ON CONFLICT (tenant, board, monday_item_id)
       DO UPDATE SET name = EXCLUDED.name, data = EXCLUDED.data, synced_at = now()`,
      params
    );
  }
}

/**
 * Sync one tenant's monday boards into Postgres.
 * Phase 1 fetches everything from monday (slow, no DB). Phase 2 writes in one tight pass,
 * batched, and reconciles deletes — so the DB connection never sits idle mid-fetch.
 */
export async function syncTenant(tenant: Tenant): Promise<Record<string, number>> {
  // Phase 1 — fetch all boards from monday (no DB connection held).
  const fetched: { board: BoardKey; items: MondayItem[] }[] = [];
  for (const board of BOARDS) {
    fetched.push({ board, items: await getBoardItems(tenant, board) });
  }

  // Phase 2 — write to Postgres back-to-back.
  await pool.query(
    `INSERT INTO tenants (slug, display_name) VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET display_name = EXCLUDED.display_name`,
    [tenant.slug, tenant.displayName]
  );

  const summary: Record<string, number> = {};
  for (const { board, items } of fetched) {
    if (items.length) await upsertBatch(tenant.slug, board, items);
    // Reconcile deletes: drop any cached row not in the current monday set.
    await pool.query(
      `DELETE FROM monday_items WHERE tenant = $1 AND board = $2 AND NOT (monday_item_id = ANY($3::text[]))`,
      [tenant.slug, board, items.map((i) => i.id)]
    );
    summary[board] = items.length;
  }
  return summary;
}
