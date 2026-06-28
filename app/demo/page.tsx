import Link from "next/link";
import { Wordmark } from "@/components/Brand";
import { Snapshot } from "@/components/Snapshot";
import GapMap from "@/components/GapMap";
import { exampleSnapshot, demoMap } from "@/lib/demoData";

export const metadata = {
  title: "Live Demo — Impact Land Services",
  description: "A live look at the Impact land & title portal, on sample data.",
};

const primaryBtn = { display: "inline-block", background: "#2563eb", color: "#fff", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600 } as const;

export default function DemoPage() {
  return (
    <main style={{ color: "#111827" }}>
      <header style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}><Wordmark size={16} /></Link>
        <span style={{ fontSize: 12, color: "#6b7280", background: "#f3f4f6", borderRadius: 999, padding: "4px 11px", fontWeight: 500 }}>Live demo · sample data</span>
      </header>

      <section style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 30px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.12, margin: "0 0 12px" }}>Here's the product, live.</h1>
        <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.55, margin: "0 auto", maxWidth: 520 }}>
          Everything below runs on <b style={{ color: "#111827" }}>sample data</b> — the same views your real project gets: a screening Snapshot and a live, drill‑down gap map. Click around.
        </p>
      </section>

      {/* Snapshot */}
      <section style={{ background: "#f8fafc", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 20 }}>1 · The Snapshot</div>
        <Snapshot data={exampleSnapshot} />
      </section>

      {/* Gap map */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px 20px" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>2 · Inside the portal — the Gap Map</div>
        <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", margin: "0 auto 22px", maxWidth: 600 }}>
          Every section by leasing, title, and estate status — laid out like a real PLSS plat. Toggle the layers; click a township to see its sections and owners.
        </p>
        <GapMap data={demoMap} mondayBase="#" demo />
      </section>

      {/* cta */}
      <section style={{ maxWidth: 620, margin: "0 auto", padding: "40px 24px 60px", textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 10px" }}>Want this on your real target area?</h2>
        <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 22px" }}>We'll run a Snapshot on your actual acreage — who owns it, what's clear, and whether it's buildable.</p>
        <Link href="/snapshot#get" style={primaryBtn}>Get your real Snapshot</Link>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 28 }}>Impact Land Services · Land, title & development intelligence across the West.</p>
      </section>
    </main>
  );
}
