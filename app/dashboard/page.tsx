import { currentTenant } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // Tenant is resolved from the signed-in user's Clerk org — never client-supplied.
  const tenant = await currentTenant();

  // Tenant-scoped read from the Postgres cache (populated by the monday sync job).
  const counts = await query<{ board: string; n: number }>(
    `SELECT board, count(*)::int AS n
       FROM monday_items
      WHERE tenant = $1
      GROUP BY board
      ORDER BY board`,
    [tenant.slug]
  );

  return (
    <main style={{ maxWidth: 900, margin: "5vh auto", padding: 24 }}>
      <h1 style={{ marginBottom: 2 }}>{tenant.displayName} — Dashboard</h1>
      <p style={{ color: "#666", marginTop: 0 }}>Enabled modules: {tenant.modules.join(", ")}</p>

      <h2 style={{ marginTop: 32 }}>Records synced from monday</h2>
      {counts.rows.length === 0 ? (
        <p>
          <em>No data yet — run the sync (<code>npm run sync</code>), then refresh.</em>
        </p>
      ) : (
        <table cellPadding={8} style={{ borderCollapse: "collapse", minWidth: 320 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              <th align="left">Board</th>
              <th align="right">Items</th>
            </tr>
          </thead>
          <tbody>
            {counts.rows.map((r) => (
              <tr key={r.board} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td>{r.board}</td>
                <td align="right">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ color: "#999", marginTop: 32, fontSize: 13 }}>
        Module widgets (Lease Portfolio, Payments, Title Clearance, Curative) build on top of
        these tables — next pass.
      </p>
    </main>
  );
}
