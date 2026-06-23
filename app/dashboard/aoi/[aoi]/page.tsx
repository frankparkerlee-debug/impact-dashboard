import Link from "next/link";
import { currentTenant } from "@/lib/auth";
import { loadAoi, mondayItemUrl } from "@/lib/metrics";
import { Page, PageHeader, Section, Grid, BarList, Pill, MondayLink, statusColor, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AoiDetail({ params }: { params: Promise<{ aoi: string }> }) {
  const { aoi: raw } = await params;
  const aoi = decodeURIComponent(raw);

  let tenantSlug: string;
  try {
    tenantSlug = (await currentTenant()).slug;
  } catch {
    return <Page><p>Not authorized.</p></Page>;
  }

  const d = await loadAoi(tenantSlug, aoi);

  return (
    <Page>
      <Link href="/dashboard" style={{ color: "#0B5FFF", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
        ‹ Back to overview
      </Link>
      <div style={{ height: 12 }} />
      <PageHeader
        title={aoi}
        subtitle={`${d.tracts.length} tract${d.tracts.length === 1 ? "" : "s"}`}
      />

      <Grid>
        <Section title="Title status">
          <BarList items={d.titleStatus} color={statusColor} />
        </Section>
        <Section title="Title clearance">
          <BarList items={d.clearance} color={statusColor} />
        </Section>
      </Grid>

      <div style={{ height: 16 }} />
      <Section title="Tracts">
        {d.tracts.length === 0 ? <Empty /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#6b7280", borderBottom: "2px solid #e7e9ee" }}>
                <th style={th}>Tract</th>
                <th style={th}>Title status</th>
                <th style={th}>Clearance</th>
                <th style={th}>Leasing</th>
                <th style={{ ...th, textAlign: "right" }}>Acres</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {d.tracts.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f0f1f4" }}>
                  <td style={td}>{t.name}</td>
                  <td style={td}><Pill text={t.status} /></td>
                  <td style={td}><Pill text={t.clearance} /></td>
                  <td style={td}>{t.leasing}</td>
                  <td style={{ ...td, textAlign: "right" }}>{t.acres || "—"}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <MondayLink href={mondayItemUrl(tenantSlug, "tracts", t.id)} label="monday ↗" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </Page>
  );
}

const th = { padding: "8px 10px", fontWeight: 600, fontSize: 12 } as const;
const td = { padding: "9px 10px", verticalAlign: "middle" } as const;
