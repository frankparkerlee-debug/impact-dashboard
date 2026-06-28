import Link from "next/link";
import type { CSSProperties } from "react";
import { Wordmark } from "@/components/Brand";
import { Snapshot, type SnapshotData } from "@/components/Snapshot";

export const metadata = {
  title: "Land Snapshot — Impact Land Services",
  description: "Know who owns it, what's clear, and whether it's buildable — in days, not weeks.",
};

// Demo-gated: route this to your Calendly / real inbox before going live.
const DEMO_LINK = "mailto:hello@impactlandservices.com?subject=Request%20a%20Land%20Snapshot";

const example: SnapshotData = {
  area: "Sample — Geothermal Project Area",
  location: "Beaver County, UT · T30S–32S · R12W–13W",
  date: "Sample report",
  tracts: 84, acres: 12450, owners: 39,
  buildability: {
    score: 64, label: "Moderate",
    note: "Largely assemblable — surface ownership is consolidated and most acreage is open to lease, but ~30% of tracts need title curative and 3 geothermal estates are severed from the surface.",
  },
  indices: [
    { label: "Ownership clarity", score: 78, read: "Mostly consolidated; few fractional owners" },
    { label: "Title condition", score: 52, read: "~30% of tracts need curative" },
    { label: "Leasing openness", score: 71, read: "Largely unleased — open to negotiate" },
    { label: "Estate simplicity", score: 46, read: "3 severed geothermal estates" },
    { label: "Consolidation", score: 66, read: "Mostly large tracts; some fragmentation" },
    { label: "Holdout risk", score: 58, read: "5 potential holdout parcels" },
  ],
  flags: [
    { label: "Tracts needing curative", count: 25, severity: "high" },
    { label: "Severed geothermal estates", count: 3, severity: "med" },
    { label: "Potential holdouts", count: 5, severity: "med" },
    { label: "Executed leases missing a W‑9", count: 4, severity: "low" },
  ],
  topOwners: [
    { name: "Cassidy Ranch LLC", note: "14 tracts · surface + geothermal" },
    { name: "Palley Family Trust", note: "fractional geothermal — 1/3 each" },
    { name: "State of Utah (SITLA)", note: "9 tracts · surface" },
  ],
};

export default function SnapshotPage() {
  return (
    <main style={{ color: "#111827" }}>
      <header style={{ maxWidth: 980, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}><Wordmark size={16} /></Link>
        <Link href="/sign-in" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 500 }}>Client sign in →</Link>
      </header>

      {/* hero */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 36px", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: "#2563eb", background: "#eff6ff", borderRadius: 999, padding: "5px 13px", marginBottom: 18 }}>The Land Snapshot</div>
        <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.9, lineHeight: 1.08, margin: "0 0 14px" }}>Know if it's buildable — in days.</h1>
        <p style={{ fontSize: 17, color: "#6b7280", lineHeight: 1.55, margin: "0 auto 26px", maxWidth: 560 }}>
          Hand us a target area. We tell you <b style={{ color: "#111827" }}>who owns it</b>, <b style={{ color: "#111827" }}>what's clear</b>, and <b style={{ color: "#111827" }}>whether it's buildable</b> — a fast screening read before you commit a dollar.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={DEMO_LINK} style={primaryBtn}>Book a demo to get your Snapshot</a>
          <a href="#example" style={ghostBtn}>See an example ↓</a>
        </div>
      </section>

      {/* what you get */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {[
          ["Who owns it", "Surface, mineral & geothermal owners — and where they're severed."],
          ["What's clear", "Title condition and the curative needed, flagged per tract."],
          ["Where the risk is", "Holdouts, fractional owners, missing documents."],
          ["A buildability read", "One screening score, mapped to your acreage."],
        ].map(([t, d]) => (
          <div key={t} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5 }}>{t}</div>
            <div style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </section>

      {/* example report */}
      <section id="example" style={{ background: "#f8fafc", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "44px 24px" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 20 }}>Example report</div>
        <Snapshot data={example} />
      </section>

      {/* bottom cta */}
      <section style={{ maxWidth: 620, margin: "0 auto", padding: "48px 24px 56px", textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 10px" }}>Get a Snapshot on your target area.</h2>
        <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 22px" }}>A screening read in days — and the on‑ramp to full diligence, acquisition, and management.</p>
        <a href={DEMO_LINK} style={primaryBtn}>Book a demo</a>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 28 }}>Impact Land Services · Land, title & development intelligence across the West.</p>
      </section>
    </main>
  );
}

const primaryBtn: CSSProperties = { display: "inline-block", background: "#2563eb", color: "#fff", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600 };
const ghostBtn: CSSProperties = { display: "inline-block", background: "#fff", color: "#111827", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600, border: "1px solid #e5e7eb" };
