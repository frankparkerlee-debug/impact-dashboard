import Link from "next/link";
import type { CSSProperties } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Wordmark } from "@/components/Brand";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "linear-gradient(180deg,#f8fafc 0%,#ffffff 60%)" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}><Wordmark size={19} /></div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15, margin: "0 0 12px", color: "#111827" }}>The land &amp; title workspace</h1>
        <p style={{ color: "#6b7280", fontSize: 15.5, lineHeight: 1.55, margin: "0 0 28px" }}>Secure, real-time visibility into your leases, title, payment risk, and documents.</p>
        <SignedOut>
          <SignInButton mode="modal"><button style={primaryBtn}>Sign in to your workspace</button></SignInButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" style={{ ...primaryBtn, textDecoration: "none", display: "inline-block" }}>Open your dashboard →</Link>
        </SignedIn>
        <p style={{ marginTop: 28, fontSize: 12.5, color: "#9ca3af" }}>Access is limited to invited client workspaces.</p>
      </div>
    </main>
  );
}

const primaryBtn: CSSProperties = { background: "#2563eb", color: "#fff", padding: "11px 22px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 };
