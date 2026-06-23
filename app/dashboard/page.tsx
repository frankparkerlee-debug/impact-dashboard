import Link from "next/link";
import { currentTenant } from "@/lib/auth";
import { refresh } from "./actions";
import { loadOverview, mondayBoardUrl } from "@/lib/metrics";
import type { Tenant } from "@/lib/tenants";
import { Page, PageHeader, Nav, KpiGrid, Kpi, Section, Grid, AoiProgressRow, MondayLink, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let tenant: Tenant;
  try {
    tenant = await currentTenant();
  } catch (e) {
    return <ErrorView title="Your account isn't linked to a client workspace" hint="Add your Clerk user to the client's organization." detail={msg(e)} />;
  }

  let d: Awaited<ReturnType<typeof loadOverview>>;
  try {
    d = await loadOverview(tenant.slug);
  } catch (e) {
    return <ErrorView title="Couldn't read data from the database" hint="Check the service's DATABASE_URL." detail={msg(e)} />;
  }

  const tracts = d.counts.tracts ?? 0;
  const pct = (n: number) => (tracts ? Math.round((n / tracts) * 100) : 0);

  return (
    <Page>
      <Nav active="overview" />
      <PageHeader
        title={`${tenant.displayName} — Leasing & Title Progress`}
        subtitle={`Prepared by Impact Land Services${d.syncedAt ? ` · data as of ${d.syncedAt}` : ""}`}
        right={
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <form action={refresh}><button type="submit" style={refreshBtn}>↻ Refresh data</button></form>
            <MondayLink href={mondayBoardUrl(tenant.slug, "tracts")} label="Open source in monday" />
          </div>
        }
      />

      <KpiGrid>
        <Kpi label="Areas of Interest" value={d.counts.aoi ?? 0} />
        <Kpi label="Tracts" value={tracts.toLocaleString()} />
        <Kpi label="Tax acres" value={d.totalAcres.toLocaleString()} />
        <Kpi label="Executed leases" value={d.counts.leases ?? 0} />
        <Kpi label="Title work complete" value={`${pct(d.titleComplete)}%`} sub={`${d.titleComplete} of ${tracts}`} />
        <Kpi label="Cleared to pay" value={`${pct(d.clearedToPay)}%`} sub={`${d.clearedToPay} tracts`} />
      </KpiGrid>

      <div style={{ marginBottom: 16 }}>
        <Section title="Progress by Area of Interest">
          {d.aoiRows.length === 0 ? <Empty /> : (
            <div>{d.aoiRows.map((r) => (
              <AoiProgressRow key={r.aoi} href={`/dashboard/aoi/${encodeURIComponent(r.aoi)}`} name={r.aoi} tracts={r.tracts} leased={r.leased} titleComplete={r.titleComplete} />
            ))}</div>
          )}
        </Section>
      </div>

      <Grid>
        <LensCard href="/dashboard/leasing" title="Leasing →" accent="#0B5FFF"
          desc="Pipeline & contact status, executed‑lease throughput, site readiness by AOI, and the W‑9 exceptions that need action." />
        <LensCard href="/dashboard/title" title="Title →" accent="#22a06b"
          desc="Title status & cleared‑to‑pay, classification, docs outstanding, estate splits (who owns what), and curative breaks." />
      </Grid>
    </Page>
  );
}

function LensCard({ href, title, desc, accent }: { href: string; title: string; desc: string; accent: string }) {
  return (
    <Link href={href} className="row-link" style={{ display: "block", padding: 22, background: "#fff", border: "1px solid #e7e9ee", borderRadius: 12, textDecoration: "none", color: "#0e1726", borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.5 }}>{desc}</div>
    </Link>
  );
}

const refreshBtn = { background: "#fff", border: "1px solid #d7dbe3", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#0e1726", cursor: "pointer" } as const;

function msg(e: unknown): string {
  if (e instanceof AggregateError) {
    const subs = e.errors.map((x) => (x instanceof Error ? `${(x as { code?: string }).code ?? x.name}: ${x.message}` : String(x)));
    return "Connection attempts all failed:\n" + (subs.join("\n") || "(no detail)");
  }
  if (e instanceof Error) return `${(e as { code?: string }).code ?? e.name}: ${e.message}`;
  return String(e);
}

function ErrorView({ title, hint, detail }: { title: string; hint: string; detail: string }) {
  return (
    <main style={{ maxWidth: 760, margin: "8vh auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#b00020" }}>{title}</h1>
      <p style={{ color: "#444" }}>{hint}</p>
      <pre style={{ background: "#faf0f0", border: "1px solid #f0d0d0", borderRadius: 8, padding: 12, whiteSpace: "pre-wrap", color: "#7a0010", fontSize: 13 }}>{detail}</pre>
    </main>
  );
}
