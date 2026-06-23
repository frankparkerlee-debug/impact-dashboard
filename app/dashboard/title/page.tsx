import { currentTenant } from "@/lib/auth";
import { loadTitle, COL, mondayBoardUrl, type Slice } from "@/lib/metrics";
import { Page, PageHeader, Nav, KpiGrid, Kpi, Section, Grid, BarList, Exception, MondayLink, statusColor } from "@/components/ui";

export const dynamic = "force-dynamic";

const href = (board: string, col: string, prefix: string) => (s: Slice) =>
  `/dashboard/items?board=${board}&col=${col}&mode=eq&val=${encodeURIComponent(s.k)}&t=${encodeURIComponent(`${prefix}: ${s.k}`)}`;

export default async function Title() {
  let slug: string, name: string;
  try { const t = await currentTenant(); slug = t.slug; name = t.displayName; } catch { return <Page><Nav active="title" /><p>Not authorized.</p></Page>; }

  const d = await loadTitle(slug);
  const pct = (n: number) => (d.tracts ? Math.round((n / d.tracts) * 100) : 0);

  return (
    <Page>
      <Nav active="title" />
      <PageHeader title={`${name} — Title`} subtitle="Ownership, clearance & curative" right={<MondayLink href={mondayBoardUrl(slug, "tracts")} label="Open source in monday" />} />

      <KpiGrid>
        <Kpi label="Tracts" value={d.tracts.toLocaleString()} />
        <Kpi label="Title work complete" value={`${pct(d.complete)}%`} sub={`${d.complete} of ${d.tracts}`} />
        <Kpi label="Cleared to pay" value={`${pct(d.cleared)}%`} sub={`${d.cleared} tracts`} />
        <Kpi label="Open curative" value={d.curativeCount} sub="breaks in title" />
      </KpiGrid>

      <div style={{ marginBottom: 16 }}>
        <Exception
          href={`/dashboard/items?q=leased-not-cleared&t=${encodeURIComponent("Leased — title not yet cleared")}`}
          label="Leased, but title not yet cleared — lease in hand, title not clear"
          count={d.leasedNotCleared}
        />
      </div>

      <Grid>
        <Section title="Title status — work progress"><BarList items={d.titleStatus} color={statusColor} hrefFor={href("tracts", COL.tracts.titleStatus, "Tracts · Title status")} /></Section>
        <Section title="Cleared to pay — the gate"><BarList items={d.clearance} color={statusColor} hrefFor={href("tracts", COL.tracts.titleClearance, "Tracts · Clearance")} /></Section>
        <Section title="Title classification"><BarList items={d.classification} color={statusColor} hrefFor={href("tracts", COL.tracts.titleClassification, "Tracts · Classification")} /></Section>
        <Section title="Docs outstanding — what's blocking"><BarList items={d.docs} color={statusColor} hrefFor={href("tracts", COL.tracts.docsOutstanding, "Tracts · Docs outstanding")} /></Section>
        <Section title="Estate splits — who owns what"><BarList items={d.estate} color={statusColor} hrefFor={href("tracts", COL.tracts.estateSplit, "Tracts · Estate")} /></Section>
        <Section title="Curative — breaks in title"><BarList items={d.curative} color={statusColor} hrefFor={href("curative", COL.curative.status, "Curative · Status")} /></Section>
      </Grid>
    </Page>
  );
}
