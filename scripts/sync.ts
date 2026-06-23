/**
 * monday -> Render Postgres sync (the scalability lever).
 *
 * The dashboard reads from Postgres, NOT live from monday — so we're never bottlenecked
 * by monday's API rate limits/latency, and we can index/aggregate freely.
 *
 * Run manually:        npm run sync
 * Runs nightly on Render via the cron service defined in render.yaml.
 */
import { pool } from "../lib/db";
import { TENANTS, type Tenant, type BoardKey } from "../lib/tenants";
import { getBoardItems } from "../lib/monday";

const BOARDS: BoardKey[] = [
  "tracts",
  "leases",
  "leasePayments",
  "landOwners",
  "landInterest",
  "aoi",
  "curative",
  "leads",
];

async function syncTenant(tenant: Tenant): Promise<void> {
  await pool.query(
    `INSERT INTO tenants (slug, display_name) VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET display_name = EXCLUDED.display_name`,
    [tenant.slug, tenant.displayName]
  );

  for (const board of BOARDS) {
    const items = await getBoardItems(tenant, board);
    for (const it of items) {
      // Flatten monday column_values to { columnId: text } for easy querying.
      const data = Object.fromEntries(it.column_values.map((c) => [c.id, c.text]));
      await pool.query(
        `INSERT INTO monday_items (tenant, board, monday_item_id, name, data, synced_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (tenant, board, monday_item_id)
         DO UPDATE SET name = EXCLUDED.name, data = EXCLUDED.data, synced_at = now()`,
        [tenant.slug, board, it.id, it.name, JSON.stringify(data)]
      );
    }
    console.log(`[sync] ${tenant.slug}/${board}: ${items.length} items`);
  }
}

async function main(): Promise<void> {
  for (const tenant of Object.values(TENANTS)) {
    console.log(`[sync] tenant ${tenant.slug} ...`);
    await syncTenant(tenant);
  }
  await pool.end();
  console.log("[sync] done");
}

main().catch((err) => {
  console.error("[sync] failed:", err);
  process.exit(1);
});
