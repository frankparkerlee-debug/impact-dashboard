import { currentTenant } from "@/lib/auth";
import { loadMap, mondayBoardUrl } from "@/lib/metrics";
import { Page, PageHeader, Nav, Provenance } from "@/components/ui";
import GapMap from "@/components/GapMap";

export const dynamic = "force-dynamic";

export default async function MapPage({ searchParams }: { searchParams: Promise<{ aoi?: string }> }) {
  let slug: string, name: string;
  try {
    const t = await currentTenant();
    slug = t.slug; name = t.displayName;
  } catch {
    return <Page><Nav active="map" /><p>Not authorized.</p></Page>;
  }
  const { aoi } = await searchParams;
  const d = await loadMap(slug, aoi);

  return (
    <Page>
      <Nav active="map" />
      <PageHeader
        title={`${name} — Gap Map`}
        subtitle={`PLSS section coverage · area of interest: ${d.aoi}`}
        right={<Provenance />}
      />
      <GapMap data={d} mondayBase={mondayBoardUrl(slug, "tracts")} />
    </Page>
  );
}
