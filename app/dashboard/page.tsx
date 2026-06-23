import { currentTenant } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Tenant } from "@/lib/tenants";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // Step 1: resolve the tenant from the signed-in user's Clerk org.
  let tenant: Tenant;
  try {
    tenant = await currentTenant();
  } catch (e) {
    return (
      <ErrorView
        title="Your account isn't linked to a client workspace"
        hint="Your Clerk user must be a member of a client organization (e.g. the 'fervo' org). Add them under Clerk → Organizations → fervo → Members."
        detail={msg(e)}
      />
    );
  }

  // Step 2: tenant-scoped read from Postgres.
  let rows: { board: string; n: number }[] = [];
  try {
    const res = await query<{ board: string; n: number }>(
      `SELECT board, count(*)::int AS n
         FROM monday_items
        WHERE tenant = $1
        GROUP BY board
        ORDER BY board`,
      [tenant.slug]
    );
    rows = res.rows;
  } catch (e) {
    return (
      <ErrorView
        title="Couldn't read data from the database"
        hint="Check the service's DATABASE_URL (it should be the database's Internal connection string)."
        detail={msg(e)}
      />
    );
  }

  return (
    <main style={wrap}>
      <h1 style={{ marginBottom: 2 }}>{tenant.displayName} — Dashboard</h1>
      <p style={{ color: "#666", marginTop: 0 }}>Enabled modules: {tenant.modules.join(", ")}</p>

      <h2 style={{ marginTop: 32 }}>Records synced from monday</h2>
      {rows.length === 0 ? (
        <p>
          <em>No data yet — run the sync, then refresh.</em>
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
            {rows.map((r) => (
              <tr key={r.board} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td>{r.board}</td>
                <td align="right">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

function msg(e: unknown): string {
  if (e instanceof AggregateError) {
    const subs = e.errors.map((x) =>
      x instanceof Error ? `${(x as { code?: string }).code ?? x.name}: ${x.message}` : String(x)
    );
    return "Connection attempts all failed:\n" + (subs.join("\n") || "(no detail)");
  }
  if (e instanceof Error) return `${(e as { code?: string }).code ?? e.name}: ${e.message}`;
  return String(e);
}

const wrap = { maxWidth: 900, margin: "5vh auto", padding: 24 } as const;

function ErrorView({ title, hint, detail }: { title: string; hint: string; detail: string }) {
  return (
    <main style={wrap}>
      <h1 style={{ color: "#b00020" }}>{title}</h1>
      <p style={{ color: "#444" }}>{hint}</p>
      <pre
        style={{
          background: "#faf0f0",
          border: "1px solid #f0d0d0",
          borderRadius: 8,
          padding: 12,
          whiteSpace: "pre-wrap",
          color: "#7a0010",
          fontSize: 13,
        }}
      >
        {detail}
      </pre>
    </main>
  );
}
