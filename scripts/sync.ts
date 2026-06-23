/**
 * monday -> Render Postgres sync. Run manually (npm run sync) or on a Render Cron.
 * The dashboard reads from Postgres; this keeps it current (and reconciles deletes).
 */
import { pool } from "../lib/db";
import { TENANTS } from "../lib/tenants";
import { syncTenant } from "../lib/sync";

async function main(): Promise<void> {
  for (const tenant of Object.values(TENANTS)) {
    const summary = await syncTenant(tenant);
    console.log(`[sync] ${tenant.slug}`, summary);
  }
  await pool.end();
  console.log("[sync] done");
}

main().catch((err) => {
  console.error("[sync] failed:", err);
  process.exit(1);
});
