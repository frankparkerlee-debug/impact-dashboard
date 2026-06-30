import { currentTenant } from "@/lib/auth";
import { loadObligations, mondayItemUrl } from "@/lib/metrics";
import { Page, PageHeader, Nav, KpiGrid, Kpi, Section, Provenance } from "@/components/ui";
import ObligationCalendar from "@/components/ObligationCalendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  let slug: string, name: string;
  try { const t = await currentTenant(); slug = t.slug; name = t.displayName; } catch { return <Page><Nav active="calendar" /><p>Not authorized.</p></Page>; }

  const d = await loadObligations(slug);
  const mondayBase = mondayItemUrl(slug, "leases", "");
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <Page>
      <Nav active="calendar" />
      <PageHeader title={`${name} — Obligation Calendar`} subtitle="Lease payments & expirations, on the calendar" right={<Provenance />} />

      <KpiGrid>
        <Kpi label="Overdue / lapsed" value={d.counts.overdue} sub="needs attention" />
        <Kpi label="Due in 30 days" value={d.counts.in30} />
        <Kpi label="Due in 90 days" value={d.counts.in90} />
        <Kpi label="Tracked · next year" value={d.counts.tracked} sub={`${d.counts.payments} payments · ${d.counts.expirations} expirations`} />
      </KpiGrid>

      <Section title="Calendar" prov={<span style={{ fontSize: 11.5, color: "#6b7280" }}>click a day for detail</span>}>
        {d.obligations.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>No payment or expiration dates on file yet — add pay-due / expiration dates on the leases board and they&apos;ll appear here automatically.</p>
        ) : (
          <ObligationCalendar obligations={d.obligations} mondayBase={mondayBase} todayIso={todayIso} />
        )}
      </Section>

      <p style={{ fontSize: 11.5, color: "#6b7280", marginTop: 16, lineHeight: 1.6 }}>
        Payments roll to the next annual anniversary; expirations are one-time deadlines (negative days = already lapsed). Sourced live from the leases board.
        Email / Slack push on these is a quick add once an outbound channel is wired.
      </p>
    </Page>
  );
}
