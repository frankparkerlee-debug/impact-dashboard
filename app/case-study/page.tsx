import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteNav } from "@/components/SiteNav";

export const metadata = {
  title: "Case Study — 252,000 acres of geothermal land | Impact Land Services",
  description:
    "How Impact took a utility-scale geothermal developer from scattered spreadsheets to a fully mapped, continuously tracked land position — 1,003 tracts, 342 owners, 12 project areas across the West.",
};

const INK = "#111827", MUTED = "#6b7280", FAINT = "#9ca3af", LINE = "#e5e7eb", PANEL = "#f8fafc", ACCENT = "#2563eb", ACCENT_BG = "#eff6ff";
const primaryBtn: CSSProperties = { display: "inline-block", background: ACCENT, color: "#fff", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600 };
const ghostBtn: CSSProperties = { display: "inline-block", background: "#fff", color: INK, padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600, border: `1px solid ${LINE}` };
const label: CSSProperties = { fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.7 };

export default function CaseStudy() {
  return (
    <main style={{ color: INK, background: "#fff" }}>
      <SiteNav />

      {/* hero */}
      <section style={{ background: "linear-gradient(180deg,#f8fafc,#fff 75%)", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 46px" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT, background: ACCENT_BG, borderRadius: 999, padding: "5px 13px" }}>Case study · Geothermal</span>
          <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.08, margin: "18px 0 16px" }}>
            252,000 acres. 1,003 tracts.<br />One live view of the position.
          </h1>
          <p style={{ fontSize: 17.5, color: MUTED, lineHeight: 1.6, margin: 0, maxWidth: 660 }}>
            How we took a utility-scale geothermal developer from scattered spreadsheets to a fully mapped, continuously tracked land position across <b style={{ color: INK }}>12 project areas</b> in the Western U.S.
          </p>
        </div>
      </section>

      {/* stats */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "38px 24px 10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          {[["252,088", "Acres under management"], ["1,003", "Tracts mapped & tracked"], ["342", "Owners identified"], ["12", "Project areas"]].map(([v, l]) => (
            <Stat key={l} v={v} l={l} accent />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginTop: 12 }}>
          {[["653", "Tracts leased (65%)"], ["497", "Title work complete (50%)"], ["278", "Severed estates found"], ["104", "Leases executed"]].map(([v, l]) => (
            <Stat key={l} v={v} l={l} />
          ))}
        </div>
      </section>

      {/* challenge */}
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "44px 24px 10px" }}>
        <div style={label}>The challenge</div>
        <h2 style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.6, margin: "10px 0 16px" }}>At this scale, a spreadsheet stops being a plan.</h2>
        <p style={p}>Geothermal development lives or dies on land. Before a single megawatt is produced, the developer has to control the ground — cleanly, clearly, and contiguously. At this scale that means <b style={{ color: INK }}>a thousand separate tracts, hundreds of individual owners, and title conditions that vary tract by tract.</b></p>
        <p style={p}>The complexity isn&apos;t hypothetical. <b style={{ color: INK }}>278 of these tracts carry a geothermal estate severed from the surface</b> — the person who owns the land is not the person who owns the resource beneath it. Every one has to be identified, researched, and secured separately. A surface-only view misses all of them.</p>
        <p style={{ ...p, marginBottom: 0 }}>Tracked in spreadsheets, a position like this becomes unknowable. Deadlines slip. Payments go out on unclear title. Nobody can answer the only question that matters: <i>where do we actually stand?</i></p>
      </section>

      {/* what we did */}
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "38px 24px 10px" }}>
        <div style={label}>What we did</div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
          {DID.map(([t, d]) => (
            <div key={t} style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${LINE}` }}>
              <Check />
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: "#374151" }}><b style={{ color: INK }}>{t}</b> {d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* pull quote */}
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "30px 24px" }}>
        <div style={{ borderLeft: `3px solid ${ACCENT}`, background: PANEL, borderRadius: "0 12px 12px 0", padding: "20px 24px" }}>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.5 }}>The client can answer &ldquo;where do we stand?&rdquo; in seconds — across a quarter-million acres.</div>
          <div style={{ fontSize: 13.5, color: MUTED, marginTop: 8 }}>Every tract, every owner, every deadline. Updated continuously, not quarterly.</div>
        </div>
      </section>

      {/* WHY TEAMS CHOOSE US — the value points */}
      <section style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "54px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 6 }}><span style={label}>Why teams bring us in</span></div>
          <h2 style={{ textAlign: "center", fontSize: 29, fontWeight: 700, letterSpacing: -0.7, margin: "0 0 10px" }}>What a project like this actually demands.</h2>
          <p style={{ textAlign: "center", fontSize: 15, color: MUTED, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Every engagement is different, but the reasons developers hand us their land work tend to be the same six.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
            {VALUE.map((v) => <ValueCard key={v.t} {...v} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "56px 24px 64px", textAlign: "center" }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, margin: "0 0 12px" }}>Have ground you need secured?</h2>
        <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.6, margin: "0 auto 26px", maxWidth: 500 }}>
          Run a free Eval on your target area, or talk to us about the position you&apos;re building.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/snapshot" style={primaryBtn}>Run a free Eval</Link>
          <Link href="/demo" style={ghostBtn}>See the portal →</Link>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12.5, color: FAINT }}>
          <span>Impact Land Services · Land, title &amp; development intelligence across the West</span>
          <Link href="/" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>impactlandservices.com</Link>
        </div>
      </footer>
    </main>
  );
}

const p: CSSProperties = { fontSize: 15.5, lineHeight: 1.7, color: "#374151", margin: "0 0 14px" };

const DID: [string, string][] = [
  ["Mapped the entire position.", "Every tract placed on the PLSS grid by township, range, and section — so gaps in the position are visible at a glance instead of buried in a spreadsheet."],
  ["Ran title, tract by tract.", "Surface, mineral, and geothermal ownership researched and recorded separately — surfacing the 278 severed estates a surface-only view would have missed."],
  ["Negotiated and executed the leases.", "653 tracts under lease across 342 owners, assembled parcel by parcel."],
  ["Built them a live portal.", "Not a monthly PDF — a workspace their team logs into, showing leasing, title, and estate status per tract, with payment risk and deadlines surfaced before they become problems."],
];

const VALUE = [
  {
    t: "Moving into a new area",
    d: "Entering a new basin, county, or state means starting from zero on ownership, records, and local practice. We’ve stood up 12 project areas for this client across multiple states — a new area doesn’t have to mean a twelve-month learning curve.",
    pt: "12 project areas stood up",
  },
  {
    t: "A senior team, not a staffing pyramid",
    d: "You work with the people actually doing the work. No account layer to relay questions through, no juniors learning on your project, no change order to get an answer. Small and senior is a feature — it’s why we move quickly.",
    pt: "Principals on your file",
  },
  {
    t: "Scale without adding headcount",
    d: "1,003 tracts and 342 owners, tracked continuously — without a land department to match. Software does the tracking so our people spend their time on judgment: negotiation, curative, and the calls that actually need a human.",
    pt: "1,003 tracts, small team",
  },
  {
    t: "Complexity is the default here",
    d: "Severed estates, fractional owners, holdouts, defective title. On this project 278 tracts had the geothermal estate severed from the surface. That’s not an edge case we escalate — it’s the ordinary work.",
    pt: "278 severed estates resolved",
  },
  {
    t: "Nothing sits in a black box",
    d: "Your team logs into the same live workspace we work in. Every tract’s leasing, title, and estate status — current, not as of last month’s report. Board-ready and shareable with partners and lenders without us rebuilding it.",
    pt: "Live client portal",
  },
  {
    t: "Deadlines caught before they cost you",
    d: "Rental payments, lease expirations, and curative obligations surface on a calendar with escalating urgency — so nothing lapses because it lived in one person’s inbox. Payment risk is flagged against title status before money goes out.",
    pt: "Obligation calendar + payment risk",
  },
];

function ValueCard({ t, d, pt }: { t: string; d: string; pt: string }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 22, display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, marginBottom: 9 }}>{t}</div>
      <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, flex: 1 }}>{d}</div>
      <div style={{ marginTop: 15, paddingTop: 13, borderTop: `1px solid ${LINE}`, fontSize: 11.5, fontWeight: 600, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.4 }}>{pt}</div>
    </div>
  );
}

function Stat({ v, l, accent }: { v: string; l: string; accent?: boolean }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: "16px 15px", background: accent ? "#fff" : PANEL }}>
      <div className="num" style={{ fontSize: accent ? 28 : 24, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1, color: accent ? ACCENT : INK }}>{v}</div>
      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 7, lineHeight: 1.4 }}>{l}</div>
    </div>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
      <circle cx="10" cy="10" r="10" fill={ACCENT_BG} />
      <path d="M6 10.5l2.5 2.5L14 7.5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
