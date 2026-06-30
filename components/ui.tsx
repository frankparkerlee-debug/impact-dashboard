import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import type { Slice } from "@/lib/metrics";

// ---- clean white tech-dashboard palette ----
const INK = "#111827";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";
const ACCENT = "#2563eb";
const SUBTLE = "#f9fafb";
const GREEN = "#16a34a", AMBER = "#d97706", RED = "#dc2626", NEUT = "#9ca3af";
const MONDAY = "#7c3aed";
const SHADOW = "0 1px 2px rgba(16,24,40,.05)";
const PALETTE = [ACCENT, GREEN, AMBER, "#7c3aed", RED, "#0891b2", "#db2777", NEUT];

const panel: CSSProperties = { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, padding: 16, boxShadow: SHADOW };
const labelCss: CSSProperties = { fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 };

export function Page({ children }: { children: ReactNode }) {
  return <main style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px 90px", color: INK }}>{children}</main>;
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 22 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.3, color: INK }}>{title}</h1>
        {subtitle && <p style={{ color: MUTED, margin: "5px 0 0", fontSize: 13.5 }}>{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Provenance({ label = "Monday · live", color = MONDAY }: { label?: string; color?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: MUTED }}>
      <i style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />{label}
    </span>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))", gap: 12, marginBottom: 22 }}>{children}</div>;
}

export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div style={panel}>
      <div style={labelCss}>{label}</div>
      <div className="num" style={{ fontSize: 30, fontWeight: 700, marginTop: 8, lineHeight: 1, color: INK, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function Section({ title, children, full, prov }: { title: string; children: ReactNode; full?: boolean; prov?: ReactNode }) {
  return (
    <section style={{ ...panel, gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 14px" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: INK }}>{title}</h2>
        {prov}
      </div>
      {children}
    </section>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

export function statusColor(k: string): string {
  const v = k.toLowerCase();
  if (/(cleared|complete|done|executed|leased|cured|on file|signed)/.test(v)) return GREEN;
  if (/(condition|review|progress|runsheet|pending|negotiat|contact|sent|hold)/.test(v)) return AMBER;
  if (/(not |missing|incomplete|open|rejected|refus|expired|competitor|—|none|blank)/.test(v)) return RED;
  return NEUT;
}

export function BarList({ items, accent = ACCENT, color, hrefFor }: { items: Slice[]; accent?: string; color?: (k: string, i: number) => string; hrefFor?: (s: Slice) => string }) {
  const max = Math.max(1, ...items.map((s) => s.n));
  if (items.length === 0) return <Empty />;
  const rowStyle: CSSProperties = { display: "grid", gridTemplateColumns: "138px 1fr 40px 10px", alignItems: "center", gap: 10, padding: "4px 6px", borderRadius: 6, textDecoration: "none", color: INK };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {items.map((s, i) => {
        const inner = (
          <>
            <span style={{ fontSize: 13, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.k}>{s.k}</span>
            <span style={{ background: "#f1f3f7", borderRadius: 5, height: 18, overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${(s.n / max) * 100}%`, background: color ? color(s.k, i) : accent, borderRadius: 5 }} />
            </span>
            <span className="num" style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{s.n}</span>
            <span style={{ color: hrefFor ? MUTED : "transparent", fontSize: 13, textAlign: "right" }}>›</span>
          </>
        );
        return hrefFor ? <Link key={s.k} href={hrefFor(s)} className="row-link" style={rowStyle}>{inner}</Link> : <div key={s.k} style={rowStyle}>{inner}</div>;
      })}
    </div>
  );
}

export function MondayLink({ href, label = "Open in Monday" }: { href: string; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: MONDAY, textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>
      {label} ↗
    </a>
  );
}

export function Pill({ text }: { text: string }) {
  const c = statusColor(text);
  return <span style={{ background: c + "18", color: c, fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{text}</span>;
}

export function AoiProgressRow({ href, name, tracts, leased, titleComplete }: { href: string; name: string; tracts: number; leased: number; titleComplete: number }) {
  const pct = (n: number) => (tracts ? Math.round((n / tracts) * 100) : 0);
  return (
    <Link href={href} className="row-link" style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 84px", gap: 16, alignItems: "center", padding: "11px 8px", textDecoration: "none", color: INK, borderBottom: `1px solid ${LINE}` }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
      <Meter label="Leased" pct={pct(leased)} color={ACCENT} />
      <Meter label="Title complete" pct={pct(titleComplete)} color={GREEN} />
      <span className="num" style={{ textAlign: "right", color: MUTED, fontSize: 12.5 }}>{tracts} tracts ›</span>
    </Link>
  );
}

function Meter({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTED, marginBottom: 4 }}>
        <span>{label}</span>
        <span className="num" style={{ fontWeight: 600, color: INK }}>{pct}%</span>
      </div>
      <span style={{ display: "block", background: "#f1f3f7", borderRadius: 5, height: 7 }}>
        <span style={{ display: "block", height: "100%", width: `${pct}%`, background: color, borderRadius: 5 }} />
      </span>
    </div>
  );
}

export function Empty() {
  return <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>No data yet.</p>;
}

export function Pending({ note }: { note: string }) {
  return <div style={{ ...panel, background: SUBTLE, borderStyle: "dashed", boxShadow: "none" }}><div style={{ fontSize: 13, color: MUTED }}>⏳ {note}</div></div>;
}

export function Nav({ active }: { active: "overview" | "leasing" | "title" | "payments" | "calendar" | "map" | "documents" }) {
  const items = [
    { key: "overview", label: "Overview", href: "/dashboard" },
    { key: "map", label: "Gap Map", href: "/dashboard/map" },
    { key: "leasing", label: "Leasing", href: "/dashboard/leasing" },
    { key: "title", label: "Title", href: "/dashboard/title" },
    { key: "payments", label: "Cleared to Pay", href: "/dashboard/payments" },
    { key: "calendar", label: "Calendar", href: "/dashboard/calendar" },
    { key: "documents", label: "Documents", href: "/dashboard/documents" },
  ] as const;
  return (
    <nav style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${LINE}` }}>
      {items.map((it) => (
        <Link key={it.key} href={it.href} style={{
          fontSize: 13.5, fontWeight: 500, padding: "9px 13px", textDecoration: "none",
          color: active === it.key ? ACCENT : MUTED, borderBottom: `2px solid ${active === it.key ? ACCENT : "transparent"}`, marginBottom: -1,
        }}>{it.label}</Link>
      ))}
    </nav>
  );
}

export function Exception({ href, label, count }: { href?: string; label: string; count: number }) {
  const bad = count > 0;
  const c = bad ? RED : GREEN;
  const style: CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px",
    border: `1px solid ${bad ? "#fecaca" : "#bbf7d0"}`, background: bad ? "#fef2f2" : "#f0fdf4",
    borderRadius: 10, textDecoration: "none", color: INK,
  };
  const inner = (
    <>
      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{bad ? "⚠" : "✓"} {label}</span>
      <span className="num" style={{ fontWeight: 700, fontSize: 18, color: c }}>{count}{href ? " ›" : ""}</span>
    </>
  );
  return href ? <Link href={href} className="row-link" style={style}>{inner}</Link> : <div style={style}>{inner}</div>;
}

export const TOKENS = { INK, MUTED, LINE, ACCENT, SUBTLE, GREEN, AMBER, RED, NEUT, MONDAY, SHADOW, PALETTE };
