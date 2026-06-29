import Link from "next/link";
import type { CSSProperties } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Wordmark, Mark } from "@/components/Brand";

export const metadata = {
  title: "Impact Land Services — Get to production.",
  description:
    "We secure and de-risk the land so nothing on the ground stands between you and production. Start with a free Eval of your target area — across the West.",
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

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg,#f8fafc 0%,#ffffff 72%)", borderBottom: `1px solid ${LINE}` }}>
        <TopoBackdrop />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "76px 24px 66px", textAlign: "center" }}>
          <span style={eyebrow}>Land &amp; development intelligence for Western energy</span>
          <h1 style={{ fontSize: 54, fontWeight: 700, letterSpacing: -1.7, lineHeight: 1.03, margin: "20px 0 16px" }}>Get to production.</h1>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.55, margin: "0 auto 30px", maxWidth: 590 }}>
            The land is the part most likely to blow your timeline. We secure it and clear the title — locked-up ownership, a buildable position, no surprises — so <b style={{ color: INK }}>nothing on the ground stands between you and production.</b> Start with a free read of your target area.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/snapshot" style={primaryBtn}>Run a free Eval</Link>
            <Link href="/demo" style={ghostBtn}>See the portal →</Link>
          </div>
          <p style={{ fontSize: 12.5, color: FAINT, marginTop: 22 }}>Self-serve screening · No sales call · Built for energy developers</p>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "60px 24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 23, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.4, margin: 0 }}>
          Before you produce a single megawatt, you have to own the ground — clean, clear, and contiguous.
          <span style={{ color: MUTED, fontWeight: 500 }}> That&apos;s the part that quietly kills timelines: fragmented ownership, title defects, severed estates, holdouts. We handle it, fast — so the land is never what holds you back.</span>
        </p>
      </section>

      {/* ── How it works (the loop) ──────────────────────────── */}
      <section id="how" style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}><span style={sectionLabel}>How it works</span></div>
        <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 700, letterSpacing: -0.7, margin: "0 0 8px" }}>One path — target area to production-ready ground.</h2>
        <p style={{ textAlign: "center", fontSize: 15, color: MUTED, maxWidth: 620, margin: "0 auto 36px", lineHeight: 1.55 }}>
          You start it yourself in minutes. When you want certainty, our team takes over. Your portal stays live the whole way — through to the day you break ground.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 14 }}>
          {LOOP.map((s, i) => (
            <Step key={s.title} n={i + 1} title={s.title} body={s.body} tag={s.tag} />
          ))}
        </div>
        {/* phase legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap", marginTop: 24 }}>
          {[["You, self-serve", ACCENT], ["Our team", "#0f766e"], ["Your portal", "#b45309"]].map(([t, c]) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: MUTED, fontWeight: 500 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: c as string }} /> {t}
            </span>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 14.5, color: INK, fontWeight: 600, marginTop: 30 }}>
          From there: you build, you produce — <span style={{ color: MUTED, fontWeight: 500 }}>on ground that won&apos;t surprise you.</span>
        </p>
      </section>

      {/* ── Services ladder ──────────────────────────────────── */}
      <section id="services" style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, marginTop: 56 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}><span style={sectionLabel}>What we do</span></div>
          <h2 style={{ textAlign: "center", fontSize: 30, fontWeight: 700, letterSpacing: -0.7, margin: "0 0 8px" }}>Screen it. Prove it. Secure it. Protect it.</h2>
          <p style={{ textAlign: "center", fontSize: 15, color: MUTED, maxWidth: 580, margin: "0 auto 38px", lineHeight: 1.55 }}>
            Four rungs from a target area to production-ready ground. Start free and self-serve; bring in our team the moment you want more than a read.
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
              Once we&apos;re working together, your whole position lives in one workspace. Every section mapped by leasing, title, and estate status — like a working PLSS plat. Payment risk surfaced before it&apos;s a problem. Deliverables pushed to you, branded and ready to share.
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
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, background: PANEL, padding: 26, minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
            {/* lightweight portal motif */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Mark size={26} /><span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Beaver County · Position overview</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
              {PLAT.map((c, i) => (
                <div key={i} style={{ aspectRatio: "1", borderRadius: 5, background: c, opacity: 0.92 }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, color: MUTED }}>
              <Legend c="#16a34a" t="Clear" />
              <Legend c="#f59e0b" t="Title pending" />
              <Legend c="#dc2626" t="Gap / risk" />
              <Legend c="#e5e7eb" t="Unleased" />
            </div>
          </div>
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

const LOOP = [
  { title: "Run a free Eval", body: "Plug in your target area. Get an instant read — ownership, title status, gaps, buildability.", tag: ACCENT },
  { title: "Ask us to go deeper", body: "One click turns the self-serve screen into full, human-grade diligence.", tag: ACCENT },
  { title: "We prove up & scope", body: "What we found, what full diligence covers, comparable work, and a firm quote.", tag: "#0f766e" },
  { title: "We run title & acquire", body: "Deep title, curative, and securing the ground across fragmented ownership.", tag: "#0f766e" },
  { title: "Track it live", body: "Your whole position in the portal — updated as we work, nothing in a black box.", tag: "#b45309" },
  { title: "Production-ready ground", body: "Secured, cleared, and yours — the position your build and financing run on.", tag: "#b45309" },
];

const SERVICES = [
  { rung: "01", name: "Eval", price: "Free · self-serve", body: "Plug in your area, get an instant buildability read — ownership, title status, gaps, and risk. The fast “is this worth pursuing” answer.", href: "/snapshot", cta: "Run a free Eval", featured: true },
  { rung: "02", name: "Diligence", price: "Fixed fee", body: "Our team goes deep: full title research, the curative path, and a development-ready picture of your position. Certainty, not a screen.", href: "/snapshot#get", cta: "Request diligence" },
  { rung: "03", name: "Acquisition", price: "Engagement", body: "We secure the ground — leasing, assembly, negotiation, and closing across fragmented surface, mineral, and geothermal estates.", href: "/snapshot#get", cta: "Talk to us" },
  { rung: "04", name: "Management", price: "Monthly", body: "We protect the producing asset — ongoing lease, payment, and obligation management, surfaced live in your portal so a missed deadline never threatens production.", href: "/snapshot#get", cta: "Talk to us" },
];

const PLAT = ["#16a34a", "#16a34a", "#f59e0b", "#16a34a", "#dc2626", "#e5e7eb", "#16a34a", "#f59e0b", "#16a34a", "#16a34a", "#16a34a", "#f59e0b", "#e5e7eb", "#16a34a", "#dc2626", "#16a34a", "#f59e0b", "#16a34a", "#16a34a", "#16a34a", "#16a34a", "#f59e0b", "#16a34a", "#16a34a"];

/* ── pieces ────────────────────────────────────────────────── */

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

function Step({ n, title, body, tag }: { n: number; title: string; body: string; tag: string }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 18, background: "#fff", position: "relative" }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: tag, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{n}</div>
      <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 6, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>{body}</div>
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} /> {t}
    </span>
  );
}
