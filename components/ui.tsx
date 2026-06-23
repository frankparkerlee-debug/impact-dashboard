import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import type { Slice } from "@/lib/metrics";

// ---- land-records terminal palette (per build spec §3) ----
const INK = "#1B1A16";
const MUTED = "#6A675C";
const LINE = "#D9D4C8";
const ACCENT = "#1F3F66";
const PAPER = "#FBFAF5";
const GREEN = "#2E7D5B", AMBER = "#B07D24", RED = "#B23A2E", NEUT = "#B7B0A0";
const MONDAY = "#7A52CC";
const PALETTE = [ACCENT, GREEN, AMBER, "#6C5CE7", RED, "#2C8C6A", "#8A6414", NEUT];

const panel: CSSProperties = { background: PAPER, border: `1px solid ${LINE}`, borderRadius: 4, padding: 16 };
const labelCss: CSSProperties = { fontSize: 10.5, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.7 };

export function Page({ children }: { children: ReactNode }) {
  return <main style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 26px 90px", color: INK }}>{children}</main>;
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 22 }}>
      <div>
        <h1 className="disp" style={{ fontSize: 27, fontWeight: 500, margin: 0, letterSpacing: -0.2, color: INK }}>{title}</h1>
        {subtitle && <p className="mono" style={{ color: MUTED, margin: "7px 0 0", fontSize: 11.5 }}>{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Provenance({ label = "Monday · live", color = MONDAY }: { label?: string; color?: string }) {
  return (
    <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: MUTED }}>
      <i style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />{label}
    </span>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 12, marginBottom: 22 }}>{children}</div>;
}

export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div style={panel}>
      <div style={labelCss}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 500, marginTop: 7, lineHeight: 1, color: INK }}>{value}</div>
      {sub && <div className="mono" style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function Section({ title, children, full, prov }: { title: string; children: ReactNode; full?: boolean; prov?: ReactNode }) {
  return (
    <section style={{ ...panel, gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 14px", paddingBottom: 8, borderBottom: `1px solid ${LINE}` }}>
        <h2 style={{ ...labelCss, fontSize: 11.5, margin: 0 }}>{title}</h2>
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
  const rowStyle: CSSProperties = { display: "grid", gridTemplateColumns: "138px 1fr 40px 10px", alignItems: "center", gap: 10, padding: "3px 4px", borderRadius: 3, textDecoration: "none", color: INK };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((s, i) => {
        const inner = (
          <>
            <span style={{ fontSize: 12.5, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.k}>{s.k}</span>
            <span style={{ background: "#EBE6D8", borderRadius: 2, height: 16, overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${(s.n / max) * 100}%`, background: color ? color(s.k, i) : accent }} />
            </span>
            <span className="mono" style={{ fontSize: 12, fontWeight: 500, textAlign: "right" }}>{s.n}</span>
            <span style={{ color: hrefFor ? MUTED : "transparent", fontSize: 12, textAlign: "right" }}>›</span>
          </>
        );
        return hrefFor ? <Link key={s.k} href={hrefFor(s)} className="row-link" style={rowStyle}>{inner}</Link> : <div key={s.k} style={rowStyle}>{inner}</div>;
      })}
    </div>
  );
}

export function MondayLink({ href, label = "Open in Monday" }: { href: string; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize: 11, color: MONDAY, textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>
      {label} ↗
    </a>
  );
}

export function Pill({ text }: { text: string }) {
  const c = statusColor(text);
  return <span className="mono" style={{ background: c + "1c", color: c, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 3, whiteSpace: "nowrap" }}>{text}</span>;
}

export function AoiProgressRow({ href, name, tracts, leased, titleComplete }: { href: string; name: string; tracts: number; leased: number; titleComplete: number }) {
  const pct = (n: number) => (tracts ? Math.round((n / tracts) * 100) : 0);
  return (
    <Link href={href} className="row-link" style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 84px", gap: 16, alignItems: "center", padding: "11px 8px", textDecoration: "none", color: INK, borderBottom: `1px solid ${LINE}` }}>
      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</span>
      <Meter label="Leased" pct={pct(leased)} color={ACCENT} />
      <Meter label="Title complete" pct={pct(titleComplete)} color={GREEN} />
      <span className="mono" style={{ textAlign: "right", color: MUTED, fontSize: 12 }}>{tracts} tracts ›</span>
    </Link>
  );
}

function Meter({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: MUTED, marginBottom: 4 }}>
        <span style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
        <span className="mono" style={{ fontWeight: 600, color: INK }}>{pct}%</span>
      </div>
      <span style={{ display: "block", background: "#EBE6D8", borderRadius: 2, height: 7 }}>
        <span style={{ display: "block", height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
      </span>
    </div>
  );
}

export function Empty() {
  return <p className="mono" style={{ color: MUTED, fontSize: 12, margin: 0 }}>No data yet.</p>;
}

export function Pending({ note }: { note: string }) {
  return <div style={{ ...panel, background: "#F4F1E9", borderStyle: "dashed" }}><div style={{ fontSize: 12.5, color: MUTED }}>⏳ {note}</div></div>;
}

export function Nav({ active }: { active: "overview" | "leasing" | "title" | "payments" | "map" }) {
  const items = [
    { key: "overview", label: "Overview", href: "/dashboard" },
    { key: "map", label: "Gap Map", href: "/dashboard/map" },
    { key: "leasing", label: "Leasing", href: "/dashboard/leasing" },
    { key: "title", label: "Title", href: "/dashboard/title" },
    { key: "payments", label: "Cleared to Pay", href: "/dashboard/payments" },
  ] as const;
  return (
    <nav style={{ display: "flex", gap: 2, marginBottom: 18, borderBottom: `1px solid ${LINE}` }}>
      {items.map((it) => (
        <Link key={it.key} href={it.href} className="mono" style={{
          fontSize: 11.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, padding: "9px 13px", textDecoration: "none",
          color: active === it.key ? INK : MUTED, borderBottom: `2px solid ${active === it.key ? ACCENT : "transparent"}`, marginBottom: -1,
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
    border: `1px solid ${bad ? "#E6B9B1" : "#BFE0CD"}`, background: bad ? "#F3E1DE" : "#E3EFE8",
    borderRadius: 4, textDecoration: "none", color: INK,
  };
  const inner = (
    <>
      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{bad ? "⚠" : "✓"} {label}</span>
      <span className="mono" style={{ fontWeight: 600, fontSize: 18, color: c }}>{count}{href ? " ›" : ""}</span>
    </>
  );
  return href ? <Link href={href} className="row-link" style={style}>{inner}</Link> : <div style={style}>{inner}</div>;
}

export const TOKENS = { INK, MUTED, LINE, ACCENT, PAPER, GREEN, AMBER, RED, NEUT, MONDAY, PALETTE };
