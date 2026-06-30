"use client";
import { useMemo, useState } from "react";
import type { Obligation } from "@/lib/metrics";

const INK = "#111827", MUTED = "#6b7280", LINE = "#e5e7eb", HAIR = "#eef0f3";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const urg = (days: number) => (days <= 30 ? "#dc2626" : days <= 90 ? "#d97706" : "#2563eb");
const navBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer", fontSize: 16, color: INK, display: "inline-flex", alignItems: "center", justifyContent: "center" };
const pad = (n: number) => String(n).padStart(2, "0");

export default function ObligationCalendar({ obligations, mondayBase, todayIso }: { obligations: Obligation[]; mondayBase: string; todayIso: string }) {
  const ty = +todayIso.slice(0, 4), tm = +todayIso.slice(5, 7) - 1;
  const [cur, setCur] = useState({ y: ty, m: tm });
  const [sel, setSel] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, Obligation[]>();
    for (const o of obligations) { const a = map.get(o.date); if (a) a.push(o); else map.set(o.date, [o]); }
    return map;
  }, [obligations]);
  const monthCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of obligations) { const k = o.date.slice(0, 7); map.set(k, (map.get(k) ?? 0) + 1); }
    return map;
  }, [obligations]);
  const monthsWithOb = useMemo(() => [...monthCounts.keys()].sort(), [monthCounts]);

  const first = new Date(cur.y, cur.m, 1);
  const startDow = first.getDay();
  const dim = new Date(cur.y, cur.m + 1, 0).getDate();
  const cells: (null | { d: number; iso: string })[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push({ d, iso: `${cur.y}-${pad(cur.m + 1)}-${pad(d)}` });
  while (cells.length % 7) cells.push(null);

  const monthKey = `${cur.y}-${pad(cur.m + 1)}`;
  const shift = (n: number) => { let m = cur.m + n, y = cur.y; while (m < 0) { m += 12; y--; } while (m > 11) { m -= 12; y++; } setCur({ y, m }); setSel(null); };
  const detail = sel ? (byDate.get(sel) ?? []) : obligations.filter((o) => o.date.slice(0, 7) === monthKey).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      {/* year strip — where obligations cluster; click to jump */}
      {monthsWithOb.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {monthsWithOb.map((k) => {
            const [yy, mm] = k.split("-"); const active = k === monthKey;
            return (
              <button key={k} onClick={() => { setCur({ y: +yy, m: +mm - 1 }); setSel(null); }} style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: `1px solid ${active ? "#2563eb" : LINE}`, background: active ? "#eff6ff" : "#fff", color: active ? "#2563eb" : INK, cursor: "pointer" }}>
                {MONTHS[+mm - 1]} {yy.slice(2)} · {monthCounts.get(k)}
              </button>
            );
          })}
        </div>
      )}

      {/* month header + nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{MONTHS[cur.m]} {cur.y}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => shift(-1)} style={navBtn} aria-label="Previous month">‹</button>
          <button onClick={() => { setCur({ y: ty, m: tm }); setSel(null); }} style={{ ...navBtn, width: "auto", padding: "0 12px", fontSize: 13, fontWeight: 600 }}>Today</button>
          <button onClick={() => shift(1)} style={navBtn} aria-label="Next month">›</button>
        </div>
      </div>

      {/* month grid */}
      <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {DOW.map((d) => <div key={d} style={{ padding: "7px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: MUTED, background: "#fafbfc", borderBottom: `1px solid ${LINE}` }}>{d}</div>)}
          {cells.map((c, i) => {
            if (!c) return <div key={i} style={{ minHeight: 76, background: "#fcfcfd", borderRight: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }} />;
            const obs = byDate.get(c.iso) ?? [];
            const isToday = c.iso === todayIso, isSel = c.iso === sel;
            return (
              <div key={i} onClick={() => obs.length && setSel(isSel ? null : c.iso)} style={{ minHeight: 76, padding: 6, borderRight: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, cursor: obs.length ? "pointer" : "default", background: isSel ? "#eff6ff" : "#fff" }}>
                <div style={isToday
                  ? { fontSize: 12, fontWeight: 700, color: "#fff", background: "#2563eb", width: 20, height: 20, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }
                  : { fontSize: 12, fontWeight: 500, color: INK }}>{c.d}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                  {obs.slice(0, 3).map((o, j) => (
                    <div key={j} title={`${o.kind} · ${o.lessor}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: INK, overflow: "hidden", whiteSpace: "nowrap" }}>
                      <span style={{ width: 6, height: 6, borderRadius: o.kind === "payment" ? 999 : 1, background: urg(o.days), flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{o.lessor}</span>
                    </div>
                  ))}
                  {obs.length > 3 && <div style={{ fontSize: 10, color: MUTED }}>+{obs.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, fontSize: 11.5, color: MUTED, alignItems: "center" }}>
        <Lg c="#dc2626" t="≤30d / overdue" /><Lg c="#d97706" t="≤90d" /><Lg c="#2563eb" t="later" />
        <span style={{ color: LINE }}>|</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: MUTED }} /> payment</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: 1, background: MUTED }} /> expiration</span>
      </div>

      {/* detail — selected day, or the whole month */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          {sel ? `${sel} · ${detail.length} obligation${detail.length === 1 ? "" : "s"}` : `${MONTHS[cur.m]} ${cur.y} · ${detail.length} this month`}
          {sel && <button onClick={() => setSel(null)} style={{ marginLeft: 10, fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>show month</button>}
        </div>
        {detail.length === 0 ? <div style={{ fontSize: 12.5, color: MUTED }}>Nothing scheduled.</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {detail.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${LINE}`, borderLeft: `3px solid ${urg(o.days)}`, borderRadius: 9, padding: "9px 13px" }}>
                <div className="num" style={{ minWidth: 52, fontSize: 12, color: MUTED }}>{o.date.slice(5)}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: o.kind === "payment" ? "#2563eb" : "#7c3aed", background: o.kind === "payment" ? "#eff6ff" : "#f5f3ff", borderRadius: 999, padding: "2px 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>{o.kind}</span>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{o.lessor}</b> <span style={{ color: MUTED }}>· {o.leaseId || "no ID"} · {o.area} · <span className="num">{o.days}</span>d</span></div>
                <a href={mondayBase + o.id} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#7c3aed", textDecoration: "none", whiteSpace: "nowrap" }}>Lease ↗</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Lg({ c, t }: { c: string; t: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />{t}</span>;
}
