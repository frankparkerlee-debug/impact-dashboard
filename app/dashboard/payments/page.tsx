import Link from "next/link";
import { currentTenant } from "@/lib/auth";
import { loadPayments, mondayItemUrl, mondayBoardUrl, COL, type Slice } from "@/lib/metrics";
import { Page, PageHeader, Nav, KpiGrid, Kpi, Section, Grid, BarList, MondayLink, Pending, Empty, statusColor } from "@/components/ui";

export const dynamic = "force-dynamic";

const yearHref = (s: Slice) =>
  `/dashboard/items?board=leases&col=${COL.leases.payDue}&mode=year&val=${encodeURIComponent(s.k)}&t=${encodeURIComponent(`Leases · payment due in ${s.k}`)}`;

export default async function Payments() {
  let slug: string, name: string;
  try { const t = await currentTenant(); slug = t.slug; name = t.displayName; } catch { return <Page><p>Not authorized.</p></Page>; }

  const d = await loadPayments(slug);

  return (
    <Page>
      <Nav active="payments" />
      <PageHeader
        title={`${name} — Lease Payments`}
        subtitle="Upcoming obligations and the cleared‑to‑pay gate"
        right={<MondayLink href={mondayBoardUrl(slug, "leasePayments")} label="Open source in monday" />}
      />

      <KpiGrid>
        <Kpi label="Leases with a pay date" value={d.withDue} />
        <Kpi label="Next payment due" value={d.upcoming[0]?.due || "—"} />
        <Kpi label="Cleared to pay" value="—" sub="needs clearance wiring in monday" />
      </KpiGrid>

      <Grid>
        <Section title="Payments due by year"><BarList items={d.byYear} accent="#22a06b" hrefFor={yearHref} /></Section>
        <Section title="Lease Payments board status"><BarList items={d.boardStatus} color={statusColor} /></Section>
      </Grid>

      <div style={{ height: 16 }} />
      <Section title="Upcoming payments — by lease pay date">
        {d.upcoming.length === 0 ? <Empty /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#6b7280", borderBottom: "2px solid #e7e9ee" }}>
                <th style={th}>Lease</th><th style={th}>Lease ID</th><th style={th}>Type</th><th style={th}>Pay due</th><th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {d.upcoming.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f1f4" }}>
                  <td style={{ ...td, fontWeight: 500 }}>{p.name}</td>
                  <td style={td}>{p.leaseId || "—"}</td>
                  <td style={td}>{p.type || "—"}</td>
                  <td style={td}>{p.due}</td>
                  <td style={{ ...td, textAlign: "right" }}><MondayLink href={mondayItemUrl(slug, "leases", p.id)} label="Open lease ↗" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <div style={{ height: 16 }} />
      <Pending note="Dollar amounts and the automated cleared‑to‑pay gate require the Lease Payments board (amount · payment type · payee · Title‑Clearance mirror) to be built out in monday — that's the wiring we paused to ship the portal. The pay dates above come straight from the executed leases." />
    </Page>
  );
}

const th = { padding: "8px 10px", fontWeight: 600, fontSize: 12 } as const;
const td = { padding: "9px 10px", verticalAlign: "middle" } as const;
