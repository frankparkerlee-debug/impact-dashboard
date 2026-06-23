import Link from "next/link";
import { currentTenant } from "@/lib/auth";
import { loadLeasing, COL, mondayBoardUrl, type Slice } from "@/lib/metrics";
import { Page, PageHeader, Nav, KpiGrid, Kpi, Section, Grid, BarList, Exception, MondayLink, statusColor, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

const href = (board: string, col: string, mode: "eq" | "year" | "empty", prefix: string) => (s: Slice) =>
  `/dashboard/items?board=${board}&col=${col}&mode=${mode}&val=${encodeURIComponent(s.k)}&t=${encodeURIComponent(`${prefix}: ${s.k}`)}`;

export default async function Leasing() {
  let slug: string, name: string;
  try { const t = await currentTenant(); slug = t.slug; name = t.displayName; } catch { return <Page><Nav active="leasing" /><p>Not authorized.</p></Page>; }

  const d = await loadLeasing(slug);
  const leasedPct = d.tracts ? Math.round((d.leasedTracts / d.tracts) * 100) : 0;

  return (
    <Page>
      <Nav active="leasing" />
      <PageHeader title={`${name} — Leasing`} subtitle="Throughput, contact pipeline & site readiness" right={<MondayLink href={mondayBoardUrl(slug, "leases")} label="Open source in monday" />} />

      <KpiGrid>
        <Kpi label="Executed leases" value={d.execLeases} />
        <Kpi label="Leads in pipeline" value={d.leads} />
        <Kpi label="Tracts leased" value={`${leasedPct}%`} sub={`${d.leasedTracts} of ${d.tracts}`} />
        <Kpi label="Leases missing W‑9" value={d.leasesMissingW9} sub="executed — action needed" />
      </KpiGrid>

      <div style={{ marginBottom: 16 }}>
        <Exception
          href={`/dashboard/items?board=leases&col=${COL.leases.w9File}&mode=empty&t=${encodeURIComponent("Executed leases missing a W‑9")}`}
          label="Executed leases missing a W‑9 (we have the lease, not the W‑9)"
          count={d.leasesMissingW9}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Section title="Site readiness by AOI — leasing completeness">
          {d.aoiReadiness.length === 0 ? <Empty /> : <div>{d.aoiReadiness.map((r) => <ReadinessRow key={r.aoi} aoi={r.aoi} leased={r.leased} tracts={r.tracts} />)}</div>}
        </Section>
      </div>

      <Grid>
        <Section title="Contact pipeline — leads by status"><BarList items={d.leadPipeline} color={statusColor} hrefFor={href("leads", COL.leads.status, "eq", "Leads · Status")} /></Section>
        <Section title="NDA status"><BarList items={d.ndaStatus} color={statusColor} hrefFor={href("leads", COL.leads.nda, "eq", "Leads · NDA")} /></Section>
        <Section title="Lease expirations by year"><BarList items={d.expirations} accent="#9b51e0" hrefFor={href("leases", COL.leases.expiration, "year", "Leases expiring")} /></Section>
      </Grid>
    </Page>
  );
}

function ReadinessRow({ aoi, leased, tracts }: { aoi: string; leased: number; tracts: number }) {
  const pct = tracts ? Math.round((leased / tracts) * 100) : 0;
  return (
    <Link href={`/dashboard/aoi/${encodeURIComponent(aoi)}`} className="row-link" style={{ display: "grid", gridTemplateColumns: "180px 1fr 130px", gap: 16, alignItems: "center", padding: "11px 8px", borderBottom: "1px solid #eef0f3", textDecoration: "none", color: "#0e1726" }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{aoi}</span>
      <span style={{ background: "#f1f3f7", borderRadius: 6, height: 10 }}><span style={{ display: "block", height: "100%", width: `${pct}%`, background: "#0B5FFF", borderRadius: 6 }} /></span>
      <span style={{ textAlign: "right", fontSize: 13, color: "#6b7280" }}>{leased}/{tracts} · {pct}%</span>
    </Link>
  );
}
