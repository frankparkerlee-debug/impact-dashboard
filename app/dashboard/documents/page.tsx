import { currentTenant } from "@/lib/auth";
import { loadDocuments } from "@/lib/metrics";
import { Page, PageHeader, Nav, KpiGrid, Kpi, Section, Grid, Exception, Provenance } from "@/components/ui";
import DocumentBrowser from "@/components/DocumentBrowser";

export const dynamic = "force-dynamic";

export default async function Documents() {
  let slug: string, name: string;
  try { const t = await currentTenant(); slug = t.slug; name = t.displayName; } catch { return <Page><Nav active="documents" /><p>Not authorized.</p></Page>; }

  const d = await loadDocuments(slug);
  const pctT = (n: number) => (d.coverage.tracts ? Math.round((n / d.coverage.tracts) * 100) : 0);
  const pctL = (n: number) => (d.coverage.leases ? Math.round((n / d.coverage.leases) * 100) : 0);

  return (
    <Page>
      <Nav active="documents" />
      <PageHeader title={`${name} — Documents`} subtitle="Title runsheets, indexes, lease agreements & W-9s — coverage and gaps" right={<Provenance />} />

      <KpiGrid>
        <Kpi label="Title runsheets" value={`${pctT(d.coverage.titleDocs)}%`} sub={`${d.coverage.titleDocs} of ${d.coverage.tracts} tracts`} />
        <Kpi label="Title index docs" value={`${pctT(d.coverage.indexDocs)}%`} sub={`${d.coverage.indexDocs} of ${d.coverage.tracts}`} />
        <Kpi label="Lease agreements" value={`${pctL(d.coverage.leasePdfs)}%`} sub={`${d.coverage.leasePdfs} of ${d.coverage.leases} leases`} />
        <Kpi label="W-9s on file" value={`${pctL(d.coverage.w9s)}%`} sub={`${d.coverage.w9s} of ${d.coverage.leases}`} />
      </KpiGrid>

      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>Documentation gaps</h2>
        <Grid>
          <Exception label="Leased tracts with no title document" count={d.gaps.leasedNoTitleDoc} />
          <Exception label="Title complete but no document on file" count={d.gaps.titleDoneNoDoc} />
          <Exception label="Executed leases missing a W-9" count={d.gaps.execNoW9} />
          <Exception label="Executed leases missing the lease PDF" count={d.gaps.execNoPdf} />
        </Grid>
      </div>

      <Section title="Document index">
        <DocumentBrowser tracts={d.tracts} leases={d.leases} />
      </Section>
    </Page>
  );
}
