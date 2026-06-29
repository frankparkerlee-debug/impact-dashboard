import Link from "next/link";
import type { CSSProperties } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Wordmark, Mark } from "@/components/Brand";

export const metadata = {
  title: "Impact Land Services — Get to production.",
  description:
    "The land brokerage, rebuilt on software — feasibility to secured title, faster than anyone. Start with a free Eval of your target area, across the West.",
};

const INK = "#111827";
const MUTED = "#6b7280";
const FAINT = "#9ca3af";
const LINE = "#e5e7eb";
const PANEL = "#f8fafc";
const ACCENT = "#2563eb";
const ACCENT_BG = "#eff6ff";

const primaryBtn: CSSProperties = { display: "inline-block", background: ACCENT, color: "#fff", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer" };
const ghostBtn: CSSProperties = { display: "inline-block", background: "#fff", color: INK, padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 600, border: `1px solid ${LINE}`, cursor: "pointer" };
const navLink: CSSProperties = { fontSize: 13.5, color: MUTED, textDecoration: "none", fontWeight: 500 };
const eyebrow: CSSProperties = { fontSize: 12, fontWeight: 600, color: ACCENT, background: ACCENT_BG, borderRadius: 999, padding: "5px 13px", display: "inline-block" };
const sectionLabel: CSSProperties = { fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.7 };

export default function Home() {
  return (
    <main style={{ color: INK, background: "#fff" }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "13px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}><Wordmark size={16} /></Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Link href="#services" style={navLink}>Services</Link>
            <Link href="#how" style={navLink}>How it works</Link>
            <Link href="/demo" style={navLink}>The portal</Link>
            <SignedOut>
              <SignInButton mode="modal"><button style={{ ...navLink, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Client sign in</button></SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" style={navLink}>Dashboard</Link>
            </SignedIn>
            <Link href="/snapshot" style={{ ...primaryBtn, padding: "9px 16px", fontSize: 13.5 }}>Run a free Eval</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero (split: value left, product right) ──────────── */}
      <section style={{ background: "linear-gradient(180deg,#f8fafc 0%,#ffffff 80%)", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))", gap: 48, alignItems: "center" }}>
          <div>
            <span style={eyebrow}>Land &amp; development intelligence for Western energy</span>
            <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1.7, lineHeight: 1.04, margin: "20px 0 16px" }}>Get to production.</h1>
            <p style={{ fontSize: 18.5, color: MUTED, lineHeight: 1.5, margin: "0 0 26px", maxWidth: 480 }}>
              The land brokerage, rebuilt on software — <b style={{ color: INK }}>feasibility to secured title, faster than anyone.</b>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/snapshot" style={primaryBtn}>Run a free Eval</Link>
              <Link href="/demo" style={ghostBtn}>See the portal →</Link>
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 24 }}>
              {["Days, not months", "Self-serve screening", "Feasibility → title"].map((t) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: MUTED, fontWeight: 500 }}>
                  <Check /> {t}
                </span>
              ))}
            </div>
          </div>
          <PositionPanel />
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "60px 24px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 23, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.4, margin: 0 }}>
          Before you produce a single megawatt, you have to own the ground — clean, clear, and contiguous.
          <span style={{ color: MUTED, fontWeight: 500 }}> That&apos;s the part that quietly kills timelines: fragmented ownership, title defects, severed estates, holdouts. We handle it, fast — so the land is never what holds you back.</span>
        </p>
      </section>

      {/* ── How it works (3 steps, KISS) ─────────────────────── */}
      <section id="how" style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}><span style={sectionLabel}>How it works</span></div>
        <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 700, letterSpacing: -0.7, margin: "0 0 8px" }}>Screen it yourself. We take it the rest of the way.</h2>
        <p style={{ textAlign: "center", fontSize: 15, color: MUTED, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.55 }}>
          Start it in minutes on your own. Bring in our team when you want certainty. Your portal stays live the whole way.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {HOW.map((s, i) => (
            <HowStep key={s.title} n={i + 1} {...s} />
          ))}
        </div>
      </section>

      {/* ── Services ladder ──────────────────────────────────── */}
      <section id="services" style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, marginTop: 56 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}><span style={sectionLabel}>What we do</span></div>
          <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 700, letterSpacing: -0.7, margin: "0 0 8px" }}>More than a brokerage.</h2>
          <p style={{ textAlign: "center", fontSize: 15, color: MUTED, maxWidth: 580, margin: "0 auto 38px", lineHeight: 1.55 }}>
            We tell you if the ground works before you commit, secure it, and keep it clean after. Start free and self-serve; bring in our team the moment you want more than a read.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
            {SERVICES.map((s) => (
              <Service key={s.name} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── The portal ───────────────────────────────────────── */}
      <section id="portal" style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <span style={sectionLabel}>The client portal</span>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.7, margin: "10px 0 14px" }}>Watch the ground go from raw to ready.</h2>
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.6, margin: "0 0 20px" }}>
              Once we&apos;re working together, your whole position lives in one workspace. Every section mapped by leasing, title, and estate status. Payment risk surfaced before it&apos;s a problem. Deliverables pushed to you, branded and ready to share.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Live gap map of your entire acreage", "Escalating payment-risk queue", "Title & curative status, tract by tract", "Shareable, branded deliverables"].map((t) => (
                <li key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: INK }}>
                  <Check /> {t}
                </li>
              ))}
            </ul>
            <Link href="/demo" style={ghostBtn}>Explore the portal on sample data →</Link>
          </div>
          <RiskQueue />
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section style={{ background: INK, color: "#fff", position: "relative", overflow: "hidden" }}>
        <TopoBackdrop dark />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "66px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.1, margin: "0 0 12px" }}>Get to production.</h2>
          <p style={{ fontSize: 16.5, color: "#cbd5e1", lineHeight: 1.55, margin: "0 auto 28px", maxWidth: 510 }}>
            Run a free Eval on your target area in minutes. Like what you see? We take it all the way to secured, production-ready ground.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/snapshot" style={primaryBtn}>Run a free Eval</Link>
            <Link href="/snapshot#get" style={{ ...ghostBtn, background: "transparent", color: "#fff", border: "1px solid #374151" }}>Talk to our team →</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Wordmark size={15} />
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="#services" style={navLink}>Services</Link>
            <Link href="#how" style={navLink}>How it works</Link>
            <Link href="/snapshot" style={navLink}>Free Eval</Link>
            <Link href="/demo" style={navLink}>The portal</Link>
            <Link href="/sign-in" style={navLink}>Client sign in</Link>
          </div>
          <span style={{ fontSize: 12, color: FAINT }}>© 2026 Impact Land Services · Across the West</span>
        </div>
      </footer>
    </main>
  );
}

/* ── data ──────────────────────────────────────────────────── */

const HOW = [
  { who: "You, self-serve", whoColor: ACCENT, title: "Run a free Eval", body: "Screen any target area yourself in minutes — ownership, title status, gaps, and a buildability read." },
  { who: "Our team", whoColor: "#0f766e", title: "We secure the ground", body: "Want certainty? We run full title, curative, and acquisition across fragmented ownership." },
  { who: "Your portal", whoColor: "#b45309", title: "You get to production", body: "Track it live in your portal, then build on ground that won't surprise you." },
];

const SERVICES = [
  { rung: "01", name: "Eval", price: "Free · self-serve", body: "Plug in your area, get an instant buildability read — ownership, title status, gaps, and risk. The fast “is this worth pursuing” answer.", href: "/snapshot", cta: "Run a free Eval", featured: true },
  { rung: "02", name: "Diligence", price: "Fixed fee", body: "Our team goes deep: full title research, the curative path, and a development-ready picture of your position. Certainty, not a screen.", href: "/snapshot#get", cta: "Request diligence" },
  { rung: "03", name: "Acquisition", price: "Engagement", body: "We secure the ground — leasing, assembly, negotiation, and closing across fragmented surface, mineral, and geothermal estates.", href: "/snapshot#get", cta: "Talk to us" },
  { rung: "04", name: "Management", price: "Monthly", body: "We protect the producing asset — ongoing lease, payment, and obligation management, surfaced live in your portal so a missed deadline never threatens production.", href: "/snapshot#get", cta: "Talk to us" },
];

// anonymized sample position — sectioned ground colored by status
const GRID40 = ["#16a34a", "#16a34a", "#f59e0b", "#16a34a", "#16a34a", "#16a34a", "#e5e7eb", "#16a34a", "#16a34a", "#f59e0b", "#16a34a", "#16a34a", "#16a34a", "#16a34a", "#16a34a", "#f59e0b", "#16a34a", "#16a34a", "#16a34a", "#dc2626", "#16a34a", "#f59e0b", "#16a34a", "#16a34a", "#e5e7eb", "#16a34a", "#16a34a", "#16a34a", "#16a34a", "#16a34a", "#dc2626", "#16a34a", "#16a34a", "#f59e0b", "#16a34a", "#16a34a", "#e5e7eb", "#16a34a", "#16a34a", "#16a34a"];

const RISK_ROWS = [
  { label: "Parcel A-14", note: "Payment due · 12 days", level: "MAJOR", color: "#dc2626" },
  { label: "Parcel B-07", note: "Title curative open", level: "HIGH", color: "#f59e0b" },
  { label: "Parcel C-22", note: "Lease renewal · 74 days", level: "NOTICE", color: "#3b82f6" },
];

/* ── pieces ────────────────────────────────────────────────── */

function PositionPanel() {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, background: "#fff", boxShadow: "0 12px 34px rgba(2,6,23,0.08)", padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: INK }}>
          <Mark size={18} /> Sample position
        </span>
        <span style={{ fontSize: 11, color: FAINT }}>live view</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["Leasing", "Title", "Estate"].map((t, i) => (
          <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, color: i === 0 ? "#fff" : MUTED, background: i === 0 ? ACCENT : PANEL, border: `1px solid ${i === 0 ? ACCENT : LINE}` }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 4 }}>
        {GRID40.map((c, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 3, background: c }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        {[["1,920", "acres"], ["37", "owners"], ["82%", "clear"], ["74", "buildability"]].map(([v, l]) => (
          <div key={l} style={{ flex: "1 1 auto", minWidth: 76, border: `1px solid ${LINE}`, borderRadius: 9, padding: "8px 11px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: l === "buildability" ? ACCENT : INK }}>{v}</div>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
        <Legend c="#16a34a" t="Clear" /><Legend c="#f59e0b" t="Pending" /><Legend c="#dc2626" t="Gap" /><Legend c="#e5e7eb" t="Unleased" />
      </div>
    </div>
  );
}

function RiskQueue() {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, background: "#fff", boxShadow: "0 12px 34px rgba(2,6,23,0.08)", padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: INK }}>
          <Mark size={18} /> Sample position · Risk queue
        </span>
        <span style={{ fontSize: 11, color: FAINT }}>3 to act on</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {RISK_ROWS.map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${LINE}`, borderLeft: `3px solid ${r.color}`, borderRadius: 9, padding: "11px 13px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{r.label}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{r.note}</div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, color: r.color, background: PANEL, borderRadius: 999, padding: "3px 9px" }}>{r.level}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: MUTED, marginTop: 14, textAlign: "center" }}>Surfaced before it&apos;s a problem.</div>
    </div>
  );
}

function HowStep({ n, who, whoColor, title, body }: { n: number; who: string; whoColor: string; title: string; body: string }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: 22, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: whoColor, color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: whoColor, textTransform: "uppercase", letterSpacing: 0.5 }}>{who}</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3, marginBottom: 7 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function Service({ rung, name, price, body, href, cta, featured }: { rung: string; name: string; price: string; body: string; href: string; cta: string; featured?: boolean }) {
  return (
    <div style={{ border: featured ? `1.5px solid ${ACCENT}` : `1px solid ${LINE}`, borderRadius: 14, padding: 22, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 11, background: featured ? ACCENT_BG : PANEL, border: `1px solid ${featured ? "#dbeafe" : LINE}` }}>
          <ServiceIcon name={name} />
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: featured ? ACCENT : MUTED, background: featured ? ACCENT_BG : PANEL, borderRadius: 999, padding: "3px 10px" }}>{price}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3 }}>{name}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: FAINT, letterSpacing: 1 }}>{rung}</span>
      </div>
      <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, flex: 1, marginBottom: 18 }}>{body}</div>
      <Link href={href} style={{ fontSize: 13.5, fontWeight: 600, color: ACCENT, textDecoration: "none" }}>{cta} →</Link>
    </div>
  );
}

function ServiceIcon({ name }: { name: string }) {
  const p = { fill: "none", stroke: ACCENT, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const box = (children: React.ReactNode) => (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">{children}</svg>
  );
  if (name === "Eval") return box(<g><path d="M4 18a8 8 0 0 1 16 0" {...p} /><path d="M12 18l4.6-3.6" {...p} /><circle cx="12" cy="18" r="1.4" fill={ACCENT} /></g>);
  if (name === "Diligence") return box(<g><rect x="4" y="3" width="10.5" height="13" rx="1.6" {...p} /><path d="M6.8 7h5M6.8 10h3.5" {...p} /><circle cx="15" cy="15.5" r="3.6" {...p} /><path d="M17.7 18.2l2.8 2.8" {...p} /></g>);
  if (name === "Acquisition") return box(<g><path d="M7 21V4" {...p} /><path d="M7 5h9l-2.4 3 2.4 3H7" {...p} /><path d="M4.5 21h8" {...p} /></g>);
  return box(<g><path d="M12 3l7 3v5c0 4.4-2.9 7.5-7 9-4.1-1.5-7-4.6-7-9V6z" {...p} /><path d="M9 11.6l2.2 2.2L15 9.6" {...p} /></g>);
}

function TopoBackdrop({ dark = false }: { dark?: boolean }) {
  const W = 1200, H = 380, step = 24, rows = 9;
  const stroke = dark ? "#60a5fa" : "#2563eb";
  const paths = [];
  for (let li = 0; li < rows; li++) {
    const baseY = 22 + li * 40;
    const amp = 9 + (li % 3) * 7;
    const phase = li * 0.8;
    const k = 0.011 + (li % 2) * 0.005;
    let d = "";
    for (let x = 0; x <= W; x += step) {
      const y = baseY + amp * Math.sin(x * k + phase);
      d += (x === 0 ? "M" : "L") + x + "," + (Math.round(y * 10) / 10) + " ";
    }
    paths.push(<path key={li} d={d} fill="none" stroke={stroke} strokeWidth={1.1} opacity={(dark ? 0.05 : 0.06) + (li % 3) * 0.016} />);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {paths}
    </svg>
  );
}

function Check() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="10" fill={ACCENT_BG} />
      <path d="M6 10.5l2.5 2.5L14 7.5" stroke={ACCENT} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Legend({ c, t }: { c: string; t: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: MUTED }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} /> {t}
    </span>
  );
}
