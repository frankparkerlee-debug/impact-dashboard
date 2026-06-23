import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import type { Slice } from "@/lib/metrics";

const INK = "#0e1726";
const MUTED = "#6b7280";
const LINE = "#e7e9ee";
const ACCENT = "#0B5FFF";
const PALETTE = ["#0B5FFF", "#22a06b", "#f2994a", "#9b51e0", "#eb5757", "#2d9cdb", "#56ccf2", "#bdbdbd"];

export function Page({ children }: { children: ReactNode }) {
  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 28px 80px", color: INK }}>{children}</main>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.4 }}>{title}</h1>
        {subtitle && <p style={{ color: MUTED, margin: "6px 0 0", fontSize: 14 }}>{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 26 }}>
      {children}
    </div>
  );
}

export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function Section({ title, children, full }: { title: string; children: ReactNode; full?: boolean }) {
  return (
    <section style={{ ...card, gridColumn: full ? "1 / -1" : undefined }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 0.5, color: "#374151" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>;
}

export function BarList({
  items, accent = ACCENT, color, hrefFor,
}: {
  items: Slice[]; accent?: string; color?: (k: string, i: number) => string; hrefFor?: (s: Slice) => string;
}) {
  const max = Math.max(1, ...items.map((s) => s.n));
  if (items.length === 0) return <Empty />;
  const rowStyle: CSSProperties = { display: "grid", gridTemplateColumns: "130px 1fr 42px 10px", alignItems: "center", gap: 10, padding: "3px 4px", borderRadius: 6, textDecoration: "none", color: INK };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((s, i) => {
        const inner = (
          <>
            <span style={{ fontSize: 13, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.k}>{s.k}</span>
            <span style={{ background: "#f1f3f7", borderRadius: 6, height: 18, overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${(s.n / max) * 100}%`, background: color ? color(s.k, i) : accent, borderRadius: 6 }} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{s.n}</span>
            <span style={{ color: hrefFor ? "#9aa3b2" : "transparent", fontSize: 13, textAlign: "right" }}>›</span>
          </>
        );
        return hrefFor ? (
          <Link key={s.k} href={hrefFor(s)} className="row-link" style={rowStyle}>{inner}</Link>
        ) : (
          <div key={s.k} style={rowStyle}>{inner}</div>
        );
      })}
    </div>
  );
}

export function statusColor(k: string, i: number): string {
  const v = k.toLowerCase();
  if (/(cleared|complete|done|executed|leased|cured|on file)/.test(v)) return "#22a06b";
  if (/(condition|review|progress|runsheet|pending|negotiat|sent)/.test(v)) return "#f2994a";
  if (/(not |missing|incomplete|open|rejected|—|none)/.test(v)) return "#eb5757";
  return PALETTE[i % PALETTE.length];
}

export function MondayLink({ href, label = "Open in monday" }: { href: string; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: ACCENT, textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
      {label} ↗
    </a>
  );
}

export function Pill({ text }: { text: string }) {
  const c = statusColor(text, 0);
  return (
    <span style={{ background: c + "1a", color: c, fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

export function AoiProgressRow({ href, name, tracts, leased, titleComplete }: { href: string; name: string; tracts: number; leased: number; titleComplete: number }) {
  const pct = (n: number) => (tracts ? Math.round((n / tracts) * 100) : 0);
  return (
    <Link href={href} className="row-link" style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 70px", gap: 16, alignItems: "center", padding: "12px 8px", borderRadius: 8, textDecoration: "none", color: INK, borderBottom: `1px solid ${LINE}` }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
      <Meter label="Leased" pct={pct(leased)} color="#0B5FFF" />
      <Meter label="Title complete" pct={pct(titleComplete)} color="#22a06b" />
      <span style={{ textAlign: "right", color: MUTED, fontSize: 13 }}>{tracts} tracts ›</span>
    </Link>
  );
}

function Meter({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: MUTED, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: INK }}>{pct}%</span>
      </div>
      <span style={{ display: "block", background: "#f1f3f7", borderRadius: 6, height: 8 }}>
        <span style={{ display: "block", height: "100%", width: `${pct}%`, background: color, borderRadius: 6 }} />
      </span>
    </div>
  );
}

export function Empty() {
  return <p style={{ color: MUTED, fontSize: 13, margin: 0 }}><em>No data yet.</em></p>;
}

export function Pending({ note }: { note: string }) {
  return (
    <div style={{ ...card, background: "#fbfbfd", borderStyle: "dashed" }}>
      <div style={{ fontSize: 13, color: MUTED }}>⏳ {note}</div>
    </div>
  );
}

export function Nav({ active }: { active: "overview" | "leasing" | "title" | "payments" }) {
  const items = [
    { key: "overview", label: "Overview", href: "/dashboard" },
    { key: "leasing", label: "Leasing", href: "/dashboard/leasing" },
    { key: "title", label: "Title", href: "/dashboard/title" },
    { key: "payments", label: "Payments", href: "/dashboard/payments" },
  ] as const;
  return (
    <nav style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${LINE}`, paddingBottom: 0 }}>
      {items.map((it) => (
        <Link key={it.key} href={it.href} style={{
          fontSize: 13.5, fontWeight: 600, padding: "8px 14px", textDecoration: "none",
          color: active === it.key ? INK : MUTED,
          borderBottom: `2px solid ${active === it.key ? ACCENT : "transparent"}`,
          marginBottom: -1,
        }}>{it.label}</Link>
      ))}
    </nav>
  );
}

export function Exception({ href, label, count }: { href?: string; label: string; count: number }) {
  const bad = count > 0;
  const c = bad ? "#c0392b" : "#22a06b";
  const style: CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px",
    border: `1px solid ${bad ? "#f1cfcf" : "#cfe9db"}`, background: bad ? "#fdf4f4" : "#f3fbf6",
    borderRadius: 10, textDecoration: "none", color: INK,
  };
  const inner = (
    <>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{bad ? "⚠" : "✓"} {label}</span>
      <span style={{ fontWeight: 700, fontSize: 18, color: c }}>{count}{href ? " ›" : ""}</span>
    </>
  );
  return href ? <Link href={href} className="row-link" style={style}>{inner}</Link> : <div style={style}>{inner}</div>;
}

const card: CSSProperties = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: 18, boxShadow: "0 1px 2px rgba(16,23,38,0.04)" };
