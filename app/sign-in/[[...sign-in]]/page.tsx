import { ClerkProvider, SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { Wordmark } from "@/components/Brand";

export default function Page() {
  return (
    <ClerkProvider appearance={clerkAppearance}>
    <div className="signin-wrap" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.05fr 1fr" }}>
      <style>{`@media (max-width: 860px){.signin-wrap{grid-template-columns:1fr!important}.signin-brand{display:none!important}}`}</style>

      {/* brand panel */}
      <div className="signin-brand" style={{ position: "relative", overflow: "hidden", background: "linear-gradient(155deg,#1e3a8a 0%,#2563eb 100%)", color: "#fff", padding: "46px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)", backgroundSize: "48px 48px", WebkitMaskImage: "radial-gradient(circle at 28% 22%,#000,transparent 78%)", maskImage: "radial-gradient(circle at 28% 22%,#000,transparent 78%)" }} />
        <div style={{ position: "relative" }}><Wordmark size={18} color="#fff" sub="rgba(255,255,255,.72)" /></div>
        <div style={{ position: "relative", maxWidth: 430 }}>
          <h1 style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.6, margin: "0 0 14px" }}>Land, title, and the intelligence to build.</h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,.82)", margin: 0 }}>From target area to a secured, buildable position — title cleared, rights locked, risks surfaced. Deep Western land expertise, accelerated by technology.</p>
        </div>
        <div style={{ position: "relative", fontSize: 12.5, color: "rgba(255,255,255,.62)" }}>Confidential · client workspace access only</div>
      </div>

      {/* sign-in */}
      <div style={{ display: "grid", placeItems: "center", padding: 24, background: "#fff" }}>
        <SignIn />
      </div>
    </div>
    </ClerkProvider>
  );
}
