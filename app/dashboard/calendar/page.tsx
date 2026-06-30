import { currentTenant } from "@/lib/auth";
import { loadObligations, mondayItemUrl, type Obligation } from "@/lib/metrics";
import { Page, PageHeader, Nav, KpiGrid, Kpi, Section, MondayLink, Provenance } from "@/components/ui";

export const dynamic = "force-dynamic";

const MUTED = "#6b7280";

const BUCKETS = [
  { key: "overdue", label: "Overdue / lapsed", test: (d: number) => d < 0, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { key: "month", label: "Due this month", test: (d: number) => d >= 0 && d <= 30, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { key: "soon", label: "Next 90 days", test: (d: number) => d > 30 && d <= 90, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { key: "later", label: "Later this year", test: (d: number) => d > 90, color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
] as const;

export default async function CalendarPage() {
  let slug: string, name: string;
  try { const t = await currentTenant(); slug = t.slug; name = t.displayName; } catch { return <Page><Nav active="calendar" /><p>Not authorized.</p></Page>; }

  const d = await loadObligations(slug);

  return (
    <Page>
      <Nav active="calendar" />
      <PageHeader title={`${name} — Obligation Calendar`} subtitle="Every upcoming lease payment and expiration, ordered by deadline" right={<Provenance />} />

      <KpiGrid>
        <Kpi label="Overdue / lapsed" value={d.counts.overdue} sub="needs attention" />
        <Kpi label="Due in 30 days" value={d.counts.in30} />
        <Kpi label="Due in 90 days" value={d.counts.in90} />
        <Kpi label="Tracked · next year" value={d.counts.tracked} sub={`${d.counts.payments} payments · ${d.counts.expirations} expirations`} />
      </KpiGrid>

      {d.obligations.length === 0 ? (
        <Section title="Obligations">
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>No payment or expiration dates on file yet. Add pay-due / expiration dates on the leases board and they&apos;ll populate here automatically.</p>
        </Section>
      ) : (
        BUCKETS.map((b) => {
          const items = d.obligations.filter((o) => b.test(o.days));
          if (!items.length) return null;
          return (
            <div key={b.key} style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: b.color, margin: "0 0 10px" }}>{b.label} · {items.length}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((o, i) => <ObCard key={`${o.kind}-${o.id}-${i}`} o={o} slug={slug} b={b} />)}
              </div>
            </div>
          );
        })
      )}

      <p style={{ fontSize: 11.5, color: MUTED, marginTop: 24, lineHeight: 1.6 }}>
        Payments roll to the next annual anniversary; expirations are one-time deadlines (negative days = already lapsed). Sourced live from the leases board.
        Email / Slack push on these is a quick add once an outbound channel is wired.
      </p>
    </Page>
  );
}

function ObCard({ o, slug, b }: { o: Obligation; slug: string; b: { color: string; bg: string; border: string } }) {
  const isPay = o.kind === "payment";
  return (
    <div style={{ display: "flex", gap: 16, border: `1px solid ${b.border}`, background: b.bg, borderRadius: 10, padding: "13px 16px" }}>
      <div style={{ flexShrink: 0, textAlign: "center", minWidth: 46 }}>
        <div className="num" style={{ fontSize: 24, fontWeight: 800, color: b.color, lineHeight: 1 }}>{o.days}</div>
        <div style={{ fontSize: 10, color: b.color, marginTop: 2 }}>days</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: isPay ? "#2563eb" : "#7c3aed", background: isPay ? "#eff6ff" : "#f5f3ff", borderRadius: 999, padding: "2px 8px", marginRight: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>{isPay ? "Payment" : "Expiration"}</span>
            {o.lessor}
          </span>
          <MondayLink href={mondayItemUrl(slug, "leases", o.id)} label="Lease ↗" />
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
          {o.name} · {o.leaseId || "no ID"} · {o.area} · {isPay ? "pays" : "expires"} <span className="num">{o.date}</span>
        </div>
      </div>
    </div>
  );
}
