import Link from "next/link";
import type { CSSProperties } from "react";
import { Wordmark } from "@/components/Brand";
import { Snapshot } from "@/components/Snapshot";
import SnapshotLeadForm from "@/components/SnapshotLeadForm";
import { exampleSnapshot } from "@/lib/demoData";

export const metadata = {
  title: "Land Snapshot — Impact Land Services",
  description: "Know who owns it, what's clear, and whether it's buildable — in days, not weeks.",
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
          <a href="#get" style={primaryBtn}>Get your free Snapshot</a>
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
        <Snapshot data={exampleSnapshot} />
      </section>

      {/* capture */}
      <section id="get" style={{ maxWidth: 620, margin: "0 auto", padding: "48px 24px 56px", textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 10px" }}>Get your free Land Snapshot.</h2>
        <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 24px" }}>Tell us your target area — we'll send your screening read. The on‑ramp to full diligence, acquisition, and management.</p>
        <SnapshotLeadForm />
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 30 }}>Impact Land Services · Land, title & development intelligence across the West.</p>
      </section>
    </main>
  );
}

const primaryBtn: CSSProperties = { display: "inline-block", background: "#2563eb", color: "#fff", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600 };
const ghostBtn: CSSProperties = { display: "inline-block", background: "#fff", color: "#111827", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600, border: "1px solid #e5e7eb" };
