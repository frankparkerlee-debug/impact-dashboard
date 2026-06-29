import Link from "next/link";
import type { CSSProperties } from "react";
import { Wordmark } from "@/components/Brand";

const MUTED = "#6b7280", LINE = "#e5e7eb", ACCENT = "#2563eb";
const navLink: CSSProperties = { fontSize: 13.5, color: MUTED, textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" };
const callout: CSSProperties = { fontSize: 13.5, fontWeight: 600, color: ACCENT, background: "#fff", border: `1px solid ${ACCENT}`, borderRadius: 9, padding: "8px 15px", textDecoration: "none", cursor: "pointer", lineHeight: 1, whiteSpace: "nowrap" };
const primary: CSSProperties = { fontSize: 13.5, fontWeight: 600, color: "#fff", background: ACCENT, border: "none", borderRadius: 9, padding: "9px 16px", textDecoration: "none", cursor: "pointer", lineHeight: 1, whiteSpace: "nowrap" };

export function SiteNav({ note }: { note?: string }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "13px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Link href="/" style={{ textDecoration: "none" }}><Wordmark size={16} /></Link>
          {note && <span style={{ fontSize: 11.5, color: MUTED, background: "#f3f4f6", borderRadius: 999, padding: "3px 10px", fontWeight: 500, whiteSpace: "nowrap" }}>{note}</span>}
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link href="/#services" style={navLink}>Services</Link>
          <Link href="/#how" style={navLink}>How it works</Link>
          <Link href="/demo" style={navLink}>The portal</Link>
          <Link href="/sign-in" style={callout}>Client sign in</Link>
          <Link href="/snapshot" style={primary}>Run a free Eval</Link>
        </nav>
      </div>
    </header>
  );
}
