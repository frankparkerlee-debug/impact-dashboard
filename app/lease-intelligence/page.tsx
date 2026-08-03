import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteNav } from "@/components/SiteNav";
import AbstractUploader from "@/components/AbstractUploader";

export const metadata = {
  title: "Lease Intelligence — read any lease in minutes | Impact Land Services",
  description:
    "Drop in an oil, gas, or geothermal lease and get a full abstract back: terms, burdens, red flags, and every deadline — with the source language cited. First one free, no subscription.",
};

const INK = "#111827", MUTED = "#6b7280", FAINT = "#9ca3af", LINE = "#e5e7eb", PANEL = "#f8fafc", ACCENT = "#2563eb", ACCENT_BG = "#eff6ff";
const label: CSSProperties = { fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.7 };

export default function LeaseIntelligencePage() {
  return (
    <main style={{ color: INK, background: "#fff" }}>
      <SiteNav />

      <section style={{ background: "linear-gradient(180deg,#f8fafc,#fff 80%)", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "50px 24px 34px", textAlign: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT, background: ACCENT_BG, borderRadius: 999, padding: "5px 13px" }}>Lease Intelligence</span>
          <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.3, lineHeight: 1.08, margin: "18px 0 15px" }}>
            Read any lease in minutes.
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.6, margin: "0 auto", maxWidth: 580 }}>
            Drop in a lease — with its addenda and assignments — and get a full abstract back: terms, burdens, red flags, and every deadline, <b style={{ color: INK }}>each one citing the language it came from</b>.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "34px 24px 20px" }}>
        <AbstractUploader />
      </section>

      {/* what it catches */}
      <section style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, marginTop: 36 }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "50px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 6 }}><span style={label}>What it catches</span></div>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, letterSpacing: -0.7, margin: "0 0 10px" }}>The things that cost money when they&apos;re missed.</h2>
          <p style={{ textAlign: "center", fontSize: 15, color: MUTED, maxWidth: 560, margin: "0 auto 34px", lineHeight: 1.6 }}>
            A lease is rarely one document. The form says one thing, the addendum overrides it, and the assignment changes who holds it.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 15 }}>
            {CATCHES.map((c) => (
              <div key={c.t} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 13, padding: 20 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2, marginBottom: 8 }}>{c.t}</div>
                <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the wall */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "50px 24px" }}>
        <div style={{ borderLeft: `3px solid ${ACCENT}`, background: PANEL, borderRadius: "0 12px 12px 0", padding: "20px 24px" }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, marginBottom: 8 }}>Where the software stops, and we start.</div>
          <p style={{ margin: 0, fontSize: 14.5, color: "#4b5563", lineHeight: 1.7 }}>
            Reading a lease tells you what was <i>granted</i>. It cannot tell you what the lessor actually <i>owned</i> — most leases expressly disclaim any warranty of title. Severance, prior conveyances, liens, and who holds the leasehold today live in county records. <b style={{ color: INK }}>That&apos;s the work our team does</b> — and every flag this tool raises can be handed straight to us.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <Link href="/#services" style={{ background: ACCENT, color: "#fff", padding: "11px 20px", borderRadius: 9, fontSize: 14.5, fontWeight: 600, textDecoration: "none" }}>See what we do →</Link>
            <Link href="/case-study" style={{ background: "#fff", color: INK, padding: "11px 20px", borderRadius: 9, fontSize: 14.5, fontWeight: 600, textDecoration: "none", border: `1px solid ${LINE}` }}>Case study</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "26px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12.5, color: FAINT }}>
          <span>Impact Land Services · Land, title &amp; development intelligence across the West</span>
          <Link href="/" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>impactlandservices.com</Link>
        </div>
      </footer>
    </main>
  );
}

const CATCHES = [
  { t: "Addenda that override the form", d: "A printed lease may allow indefinite shut-in while the addendum caps it at two years. We read the whole package and report the term that actually controls." },
  { t: "Pugh clauses and partial termination", d: "Production in a pooled unit may hold only the unit acreage — the rest falls away. Easy to miss, expensive to assume." },
  { t: "The real burden stack", d: "Royalty plus every overriding royalty reserved along the assignment chain — so you see the net revenue interest, not just the lease rate." },
  { t: "Expiry and extension math", d: "Primary term, extension options, whether they were exercised on time, and what has to be true today for the lease to still be alive." },
  { t: "Assignment chains that don't add up", d: "Assignments that convey \"certain interests\" without stating fractions, memoranda with no operative document, date discrepancies between instruments." },
  { t: "Every deadline in the file", d: "Rentals, shut-in windows, continuous-operations gaps, notice periods, release and equipment-removal obligations — pulled into one calendar." },
];
