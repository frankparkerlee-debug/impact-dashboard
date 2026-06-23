import { currentTenant } from "@/lib/auth";
import { loadOverview, mondayBoardUrl } from "@/lib/metrics";
import type { Tenant } from "@/lib/tenants";
import {
  Page, PageHeader, KpiGrid, Kpi, Section, Grid, BarList, AoiProgressRow,
  MondayLink, Pending, statusColor, Empty,
} from "@/components/ui";

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

  const clearedTotal = d.aoiRows.reduce((a, r) => a + r.titleCleared, 0);
  const leasedTotal = d.aoiRows.reduce((a, r) => a + r.leased, 0);
  const tracts = d.counts.tracts ?? 0;

  return (
    <Page>
      <PageHeader
        title={`${tenant.displayName} — Leasing & Title Progress`}
        subtitle={`Prepared by Impact Land Services${d.syncedAt ? ` · data as of ${d.syncedAt}` : ""}`}
        right={<MondayLink href={mondayBoardUrl(tenant.slug, "tracts")} label="Open source in monday" />}
      />

      <KpiGrid>
        <Kpi label="Areas of Interest" value={d.counts.aoi ?? 0} />
        <Kpi label="Tracts" value={tracts.toLocaleString()} sub={tracts >= 500 ? "500+ (sync cap)" : undefined} />
        <Kpi label="Tax acres" value={d.totalAcres.toLocaleString()} />
        <Kpi label="Executed leases" value={d.counts.leases ?? 0} />
        <Kpi label="Title cleared" value={`${tracts ? Math.round((clearedTotal / tracts) * 100) : 0}%`} sub={`${clearedTotal} of ${tracts}`} />
        <Kpi label="Leased" value={`${tracts ? Math.round((leasedTotal / tracts) * 100) : 0}%`} sub={`${leasedTotal} tracts`} />
      </KpiGrid>

      <div style={{ marginBottom: 16 }}>
        <Section title="Progress by Area of Interest">
          {d.aoiRows.length === 0 ? <Empty /> : (
            <div>
              {d.aoiRows.map((r) => (
                <AoiProgressRow
                  key={r.aoi}
                  href={`/dashboard/aoi/${encodeURIComponent(r.aoi)}`}
                  name={r.aoi}
                  tracts={r.tracts}
                  leased={r.leased}
                  titleCleared={r.titleCleared}
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      <Grid>
        <Section title="Title status">
          <BarList items={d.titleStatus} color={statusColor} />
        </Section>
        <Section title="Title clearance">
          <BarList items={d.clearance} color={statusColor} />
        </Section>
        <Section title="Leases by type">
          <BarList items={d.leaseType} />
        </Section>
        <Section title="Leases by status">
          <BarList items={d.leaseStatus} color={statusColor} />
        </Section>
        <Section title="Lease expirations by year">
          <BarList items={d.expirations} accent="#9b51e0" />
        </Section>
        <Section title="Curative items">
          <BarList items={d.curative} color={statusColor} />
        </Section>
        <Section title="Owner W‑9 status">
          <BarList items={d.ownersW9} color={statusColor} />
        </Section>
        <Section title="Payments / cleared‑to‑pay">
          <Pending note="Lights up once the Lease Payments board + clearance mirror are wired in monday." />
        </Section>
      </Grid>
    </Page>
  );
}

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
      <pre style={{ background: "#faf0f0", border: "1px solid #f0d0d0", borderRadius: 8, padding: 12, whiteSpace: "pre-wrap", color: "#7a0010", fontSize: 13 }}>
        {detail}
      </pre>
    </main>
  );
}
