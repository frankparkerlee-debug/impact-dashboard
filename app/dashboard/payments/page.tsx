import { currentTenant } from "@/lib/auth";
import { loadPaymentRisk, mondayItemUrl, type PayRisk } from "@/lib/metrics";
import { Page, PageHeader, Nav, KpiGrid, Kpi, Section, MondayLink, Provenance } from "@/components/ui";

export const dynamic = "force-dynamic";

const MUTED = "#6b7280", PURPLE = "#7c3aed";
const LEVELS = {
  major: { label: "Major flag", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", sub: "≤ 60 days" },
  high: { label: "High alert", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", sub: "≤ 80 days" },
  notice: { label: "On notice", color: "#d97706", bg: "#fffbeb", border: "#fde68a", sub: "≤ 100 days" },
} as const;

export default async function Payments() {
  let slug: string, name: string;
  try { const t = await currentTenant(); slug = t.slug; name = t.displayName; } catch { return <Page><Nav active="payments" /><p>Not authorized.</p></Page>; }

  const d = await loadPaymentRisk(slug);

  return (
    <Page>
      <Nav active="payments" />
      <PageHeader title={`${name} — Cleared to Pay`} subtitle="Leases with a payment due soon whose title isn't complete" right={<Provenance />} />

      <KpiGrid>
        <Kpi label="Major flag · ≤60d" value={d.counts.major} />
        <Kpi label="High alert · ≤80d" value={d.counts.high} />
        <Kpi label="On notice · ≤100d" value={d.counts.notice} />
        <Kpi label="Paying soon, title clear" value={d.clearSoon} sub="no action needed" />
      </KpiGrid>

      {d.flags.length === 0 ? (
        <Section title="Payment risk"><p style={{ color: MUTED, fontSize: 13, margin: 0 }}>✓ No payments due within 100 days on incomplete title. {d.later} more lease payment(s) fall beyond 100 days.</p></Section>
      ) : (
        (["major", "high", "notice"] as const).map((level) => {
          const items = d.flags.filter((f) => f.level === level);
          if (!items.length) return null;
          const L = LEVELS[level];
          return (
            <div key={level} style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: L.color, margin: "0 0 10px" }}>
                {L.label} · {L.sub} · {items.length}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((f) => <FlagCard key={f.id} f={f} slug={slug} L={L} />)}
              </div>
            </div>
          );
        })
      )}

      <p style={{ fontSize: 11.5, color: MUTED, marginTop: 24, lineHeight: 1.6 }}>
        Pay dates roll to the next annual anniversary. Tracts are matched to a lease by <b>lessor name within the AOI</b> (Monday has no direct lease→tract link yet) —
        where no tract matches, title shows as <i>unverified</i>. {d.later} payment(s) fall beyond 100 days; {d.clearSoon} pay soon on already‑clear title.
      </p>
    </Page>
  );
}

function FlagCard({ f, slug, L }: { f: PayRisk; slug: string; L: { color: string; bg: string; border: string } }) {
  return (
    <div style={{ display: "flex", gap: 16, border: `1px solid ${L.border}`, background: L.bg, borderRadius: 10, padding: "13px 16px" }}>
      <div style={{ flexShrink: 0, textAlign: "center", minWidth: 46 }}>
        <div className="num" style={{ fontSize: 24, fontWeight: 800, color: L.color, lineHeight: 1 }}>{f.days}</div>
        <div style={{ fontSize: 10, color: L.color, marginTop: 2 }}>days</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{f.lessor}</span>
          <MondayLink href={mondayItemUrl(slug, "leases", f.id)} label="Lease ↗" />
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
          {f.name} · {f.leaseId || "no ID"} · {f.aoi} · pays <span className="num">{f.due}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12 }}>
          {f.titleState === "incomplete" ? (
            <div>
              <span style={{ color: "#dc2626", fontWeight: 600 }}>Title incomplete</span>
              <span style={{ color: MUTED }}> on {f.tracts.length} matched tract{f.tracts.length === 1 ? "" : "s"}: </span>
              {f.tracts.map((t, i) => (
                <span key={t.id}>
                  <a href={mondayItemUrl(slug, "tracts", t.id)} target="_blank" rel="noopener noreferrer" style={{ color: PURPLE, textDecoration: "none" }}>{t.name}</a>
                  <span style={{ color: MUTED }}> ({t.title}){i < f.tracts.length - 1 ? ", " : ""}</span>
                </span>
              ))}
            </div>
          ) : (
            <span style={{ color: MUTED }}>⚠ Title unverified — lessor not matched to a tract (needs lease↔tract link in Monday)</span>
          )}
        </div>
      </div>
    </div>
  );
}
