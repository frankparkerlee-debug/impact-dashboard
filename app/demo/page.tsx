import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
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
      <SiteNav note="Live demo · sample data" />

      <section style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 30px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.12, margin: "0 0 12px" }}>See it before you commit.</h1>
        <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.55, margin: "0 auto", maxWidth: 545 }}>
          Two things, on <b style={{ color: "#111827" }}>sample data</b>: the free <b style={{ color: "#111827" }}>Snapshot</b> we run on your target area, and the <b style={{ color: "#111827" }}>client portal</b> you get once we're working together. Click around.
        </p>
      </section>

      {/* Snapshot */}
      <section style={{ background: "#f8fafc", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6 }}>1 · The Snapshot — a report we run on your area</div>
          <div style={{ fontSize: 13.5, color: "#6b7280", maxWidth: 540, margin: "6px auto 0", lineHeight: 1.5 }}>You give us the area; <b style={{ color: "#111827" }}>we produce this screening read and send it to you.</b> A fast "is this worth pursuing" answer — not the full system, not something you operate.</div>
        </div>
        <Snapshot data={exampleSnapshot} />
      </section>

      {/* Gap map */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px 20px" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>2 · The client portal — your live workspace</div>
        <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", margin: "0 auto 22px", maxWidth: 620, lineHeight: 1.5 }}>
          A glimpse of what you get <b style={{ color: "#111827" }}>once you're a client</b> — the live workspace where we run your position together. Every section by leasing, title, and estate status, like a working PLSS plat. Toggle the layers; click a township to see its sections and owners.
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
