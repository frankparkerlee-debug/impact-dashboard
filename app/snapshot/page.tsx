import Link from "next/link";
import { Wordmark } from "@/components/Brand";
import EvalTool from "@/components/EvalTool";

export const metadata = {
  title: "Free Land Eval — Impact Land Services",
  description: "Run a free, instant buildability read on your target area — ownership, title, gaps, and risk. Self-serve screening, no email to run.",
};

export default function SnapshotPage() {
  return (
    <main style={{ color: "#111827" }}>
      <header style={{ maxWidth: 980, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}><Wordmark size={16} /></Link>
        <Link href="/sign-in" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 500 }}>Client sign in →</Link>
      </header>

      <section style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 28px", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, color: "#2563eb", background: "#eff6ff", borderRadius: 999, padding: "5px 13px", marginBottom: 16 }}>The free Eval</div>
        <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.9, lineHeight: 1.08, margin: "0 0 14px" }}>Is your ground buildable? Find out now.</h1>
        <p style={{ fontSize: 16.5, color: "#6b7280", lineHeight: 1.55, margin: "0 auto", maxWidth: 560 }}>
          Plug in your target area and get an instant read — <b style={{ color: "#111827" }}>ownership, title, gaps, and risk</b>. Free and instant. When you want certainty, our team takes it from there.
        </p>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 64px" }}>
        <EvalTool />
      </section>

      <footer style={{ borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 24, textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
          Impact Land Services · Land, title &amp; development intelligence across the West.
        </div>
      </footer>
    </main>
  );
}
