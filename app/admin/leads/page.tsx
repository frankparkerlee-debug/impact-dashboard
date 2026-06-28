import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/admin";
import { query } from "@/lib/db";
import { Wordmark } from "@/components/Brand";

export const dynamic = "force-dynamic";

interface Lead { email: string; target_area: string | null; name: string | null; company: string | null; source: string; at: string }

export default async function LeadsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!isAdmin(email)) {
    return (
      <main style={{ maxWidth: 560, margin: "16vh auto", padding: 24, textAlign: "center", fontFamily: "var(--font-sans)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><Wordmark size={16} /></div>
        <p style={{ color: "#6b7280", fontSize: 14 }}>This page is for Impact admins only.{email ? ` (${email} isn't on the list.)` : ""}</p>
        <p style={{ marginTop: 14 }}><Link href="/dashboard" style={{ color: "#2563eb", textDecoration: "none", fontSize: 13.5 }}>← Back to dashboard</Link></p>
      </main>
    );
  }

  const rows = (await query<Lead>(
    `SELECT email, target_area, name, company, source, to_char(created_at,'Mon DD, YYYY · HH24:MI') at
       FROM leads ORDER BY created_at DESC LIMIT 500`
  )).rows;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "22px 24px 80px", color: "#111827", fontFamily: "var(--font-sans)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}><Wordmark size={16} /></Link>
        <span style={{ fontSize: 12.5, color: "#6b7280" }}>Admin</span>
      </header>

      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, margin: "0 0 4px" }}>Snapshot leads</h1>
      <p style={{ color: "#6b7280", fontSize: 13.5, margin: "0 0 20px" }}>{rows.length} capture{rows.length === 1 ? "" : "s"} from the public Snapshot page.</p>

      {rows.length === 0 ? (
        <div style={{ border: "1px dashed #e5e7eb", borderRadius: 10, padding: "40px 24px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
          No leads yet — they'll appear here the moment someone requests a Snapshot.
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#6b7280", background: "#f9fafb", fontSize: 12 }}>
                <th style={th}>When</th><th style={th}>Email</th><th style={th}>Target area</th><th style={th}>Name</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f0f1f4" }}>
                  <td style={{ ...td, color: "#6b7280", whiteSpace: "nowrap" }}>{r.at}</td>
                  <td style={{ ...td, fontWeight: 600 }}><a href={`mailto:${r.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>{r.email}</a></td>
                  <td style={td}>{r.target_area || "—"}</td>
                  <td style={td}>{r.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const th = { padding: "9px 12px", fontWeight: 600 } as const;
const td = { padding: "10px 12px", verticalAlign: "top" } as const;
