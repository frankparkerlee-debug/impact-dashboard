"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { MapData, MapTract, MapSectionAgg, MapTownship } from "@/lib/metrics";

const INK = "#111827", MUTED = "#6b7280", LINE = "#e5e7eb", ACCENT = "#2563eb";
const GREEN = "#16a34a", AMBER = "#d97706", RED = "#dc2626", PURPLE = "#7c3aed", EMPTY = "#f3f4f6";

// PLSS sections snake from the NE corner: 1 in the top-right, W across, then E, row by row.
const SECT_ORDER = [6, 5, 4, 3, 2, 1, 7, 8, 9, 10, 11, 12, 18, 17, 16, 15, 14, 13, 19, 20, 21, 22, 23, 24, 30, 29, 28, 27, 26, 25, 31, 32, 33, 34, 35, 36];

type Layer = "leasing" | "title" | "estate";
const isSevered = (t: MapTract) => !!t.geo && t.geo !== t.surface;

interface Placed extends MapTownship { signedR: number; signedT: number; label: string }
function place(t: MapTownship): Placed | null {
  const m = t.twp.match(/(\d+)\s*([NS])\s+(\d+)\s*([EW])/i);
  if (!m) return null;
  const tNum = +m[1], tDir = m[2].toUpperCase(), rNum = +m[3], rDir = m[4].toUpperCase();
  return { ...t, signedT: tDir === "N" ? tNum : -tNum, signedR: rDir === "E" ? rNum : -rNum, label: `${tNum}${tDir} ${rNum}${rDir}` };
}
// derive a township label from grid coordinates (for empty positions)
const trLabel = (st: number, sr: number) => `${Math.abs(st)}${st > 0 ? "N" : "S"} ${Math.abs(sr)}${sr > 0 ? "E" : "W"}`;

function cellColor(layer: Layer, agg: MapSectionAgg | undefined, severed: number) {
  if (!agg || agg.tracts === 0) return { bg: EMPTY, fg: "#cbd1da" };
  if (layer === "leasing") {
    if (agg.leased === agg.tracts) return { bg: GREEN, fg: "#fff" };
    if (agg.leased > 0) return { bg: AMBER, fg: "#fff" };
    return { bg: RED, fg: "#fff" };
  }
  if (layer === "title") {
    if (agg.titleDone === agg.tracts) return { bg: GREEN, fg: "#fff" };
    if (agg.titleDone > 0) return { bg: AMBER, fg: "#fff" };
    return { bg: "#94a3b8", fg: "#fff" };
  }
  return severed > 0 ? { bg: PURPLE, fg: "#fff" } : { bg: "#e5e7eb", fg: MUTED };
}

export default function GapMap({ data, mondayBase }: { data: MapData; mondayBase: string }) {
  const [layer, setLayer] = useState<Layer>("leasing");
  const [openTwp, setOpenTwp] = useState<string | null>(null);
  const [secFilter, setSecFilter] = useState<number | null>(null);

  const bySec = useMemo(() => {
    const m = new Map<string, MapTract[]>();
    for (const t of data.tracts) {
      const k = `${t.twp}|${t.sec}`;
      const a = m.get(k); if (a) a.push(t); else m.set(k, [t]);
    }
    return m;
  }, [data.tracts]);
  const severedInSec = (twp: string, sec: number) => (bySec.get(`${twp}|${sec}`) ?? []).filter(isSevered).length;

  const { placed, cols, rows, unplaced } = useMemo(() => {
    const p: Placed[] = [], u: MapTownship[] = [];
    for (const t of data.townships) { const x = place(t); if (x) p.push(x); else u.push(t); }
    // full contiguous range so empty townships still get a labeled cell (skip 0 — no T0/R0)
    const span = (vals: number[]) => { if (!vals.length) return []; const lo = Math.min(...vals), hi = Math.max(...vals); const out: number[] = []; for (let i = lo; i <= hi; i++) if (i !== 0) out.push(i); return out; };
    const cols = span(p.map((t) => t.signedR));                  // West → East (left → right)
    const rows = span(p.map((t) => t.signedT)).reverse();        // North → South (top → bottom)
    return { placed: p, cols, rows, unplaced: u };
  }, [data.townships]);

  const pct = (n: number) => (data.totals.tracts ? Math.round((n / data.totals.tracts) * 100) : 0);
  const open = openTwp ? (placed.find((t) => t.twp === openTwp) ?? null) : null;

  return (
    <div>
      {/* AOI toggle */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {data.aois.map((a) => {
          const on = a.k === data.aoi;
          return (
            <Link key={a.k} href={`/dashboard/map?aoi=${encodeURIComponent(a.k)}`} style={{
              fontSize: 13, padding: "6px 12px", borderRadius: 8, textDecoration: "none",
              border: `1px solid ${on ? ACCENT : LINE}`, background: on ? ACCENT : "#fff", color: on ? "#fff" : INK, fontWeight: on ? 600 : 500,
            }}>{a.k} <span className="num" style={{ opacity: 0.7 }}>{a.n}</span></Link>
          );
        })}
      </div>

      {/* totals + layer toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 20, fontSize: 13, color: MUTED }}>
          <Stat label="Tracts" value={data.totals.tracts} />
          <Stat label="Leased" value={`${data.totals.leased} · ${pct(data.totals.leased)}%`} c={GREEN} />
          <Stat label="Title complete" value={`${data.totals.titleDone} · ${pct(data.totals.titleDone)}%`} c={GREEN} />
          <Stat label="Geo estate severed" value={data.totals.severed} c={PURPLE} />
        </div>
        <div style={{ display: "flex", gap: 0, border: `1px solid ${LINE}`, borderRadius: 8, overflow: "hidden" }}>
          {(["leasing", "title", "estate"] as Layer[]).map((l) => (
            <button key={l} onClick={() => setLayer(l)} style={{
              fontSize: 12.5, padding: "7px 14px", border: "none", cursor: "pointer",
              background: layer === l ? INK : "#fff", color: layer === l ? "#fff" : MUTED, fontWeight: 500,
            }}>{l[0].toUpperCase() + l.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* legend */}
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: MUTED, marginBottom: 16, flexWrap: "wrap" }}>
        {legend(layer).map((x) => (
          <span key={x.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <i style={{ width: 12, height: 12, background: x.c, border: `1px solid ${x.c === EMPTY ? LINE : x.c}`, borderRadius: 3 }} />{x.label}
          </span>
        ))}
      </div>

      {/* map (left) + owner side panel (right) */}
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, minmax(92px, 1fr))`, gap: 6, minWidth: cols.length * 92 }}>
            {rows.map((sr) =>
              cols.map((sc) => {
                const t = placed.find((x) => x.signedT === sr && x.signedR === sc);
                if (!t) return (
                  <div key={`${sr}-${sc}`} style={{ border: `1px dashed ${LINE}`, borderRadius: 6, padding: 7, background: "#fcfcfd", minHeight: 44 }}>
                    <span style={{ fontWeight: 600, fontSize: 10, color: "#b6bcc6" }}>{trLabel(sr, sc)}</span>
                    <div style={{ fontSize: 9, color: "#cbd0d8", marginTop: 3 }}>no tracts</div>
                  </div>
                );
                const on = openTwp === t.twp;
                return (
                  <button key={t.twp} onClick={() => { setOpenTwp(on ? null : t.twp); setSecFilter(null); }} style={{
                    textAlign: "left", cursor: "pointer", background: "#fff", borderRadius: 6, padding: 7,
                    border: on ? `2px solid ${ACCENT}` : `1px solid ${LINE}`, boxShadow: "0 1px 2px rgba(16,24,40,.05)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: 10.5 }}>{t.label}</span>
                      <span className="num" style={{ fontSize: 9, color: MUTED }}>{t.leased}/{t.tracts}</span>
                    </div>
                    <MiniGrid twp={t} layer={layer} severedInSec={severedInSec} />
                  </button>
                );
              })
            )}
          </div>
          {unplaced.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: MUTED }}>
              {unplaced.length} township(s) without parseable T/R: {unplaced.map((u) => `${u.twp} (${u.tracts})`).join(", ")}
            </div>
          )}
        </div>

        {open && (
          <aside style={{ width: 392, flexShrink: 0, position: "sticky", top: 16, alignSelf: "flex-start", maxHeight: "calc(100vh - 32px)", display: "flex", flexDirection: "column", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, boxShadow: "0 1px 3px rgba(16,24,40,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${LINE}`, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Township {open.label}</h3>
                <button onClick={() => setOpenTwp(null)} style={{ border: "none", background: "none", cursor: "pointer", color: MUTED, fontSize: 13 }}>✕</button>
              </div>
              <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 8 }}>{open.leased}/{open.tracts} leased · click a section to filter</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3 }}>
                {SECT_ORDER.map((sec) => {
                  const agg = open.sections.find((s) => s.sec === sec);
                  const col = cellColor(layer, agg, severedInSec(open.twp, sec));
                  const has = !!agg && agg.tracts > 0;
                  const sel = secFilter === sec;
                  return (
                    <button key={sec} onClick={() => has && setSecFilter(sel ? null : sec)} title={has ? `Sec ${sec} · ${agg!.tracts} tract(s)` : `Sec ${sec} · none`}
                      style={{ aspectRatio: "1 / 1", background: col.bg, color: col.fg, border: sel ? `2px solid ${INK}` : `1px solid ${col.bg === EMPTY ? LINE : col.bg}`, borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: has ? "pointer" : "default" }}>{sec}</button>
                  );
                })}
              </div>
              {secFilter && <button onClick={() => setSecFilter(null)} style={{ marginTop: 9, border: "none", background: "none", color: ACCENT, cursor: "pointer", fontSize: 12, padding: 0 }}>← all sections</button>}
            </div>
            <div style={{ overflowY: "auto", padding: "4px 16px 16px" }}>
              <OwnerRoster twp={open} bySec={bySec} secFilter={secFilter} mondayBase={mondayBase} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function MiniGrid({ twp, layer, severedInSec }: { twp: MapTownship; layer: Layer; severedInSec: (t: string, s: number) => number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1.5 }}>
      {SECT_ORDER.map((sec) => {
        const agg = twp.sections.find((s) => s.sec === sec);
        const col = cellColor(layer, agg, severedInSec(twp.twp, sec));
        return <div key={sec} style={{ aspectRatio: "1 / 1", background: col.bg, borderRadius: 1.5, border: col.bg === EMPTY ? `1px solid ${LINE}` : "none" }} />;
      })}
    </div>
  );
}

function OwnerRoster({ twp, bySec, secFilter, mondayBase }: { twp: MapTownship; bySec: Map<string, MapTract[]>; secFilter: number | null; mondayBase: string }) {
  const secs = twp.sections.map((s) => s.sec).filter((s) => secFilter == null || s === secFilter).sort((a, b) => a - b);
  return (
    <div>
      {secs.map((sec) => {
        const tracts = (bySec.get(`${twp.twp}|${sec}`) ?? []).sort((a, b) => a.name.localeCompare(b.name));
        return (
          <div key={sec} style={{ paddingTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Section {sec}</div>
            {tracts.map((t) => (
              <div key={t.id} style={{ padding: "9px 0", borderBottom: `1px solid ${LINE}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 12.5 }}>{t.name}</span>
                  <a href={`${mondayBase}/pulses/${t.id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: PURPLE, textDecoration: "none", flexShrink: 0 }}>↗</a>
                </div>
                <div style={{ display: "flex", gap: 5, marginBottom: 7, flexWrap: "wrap" }}>
                  <Tag text={t.leasing} /><Tag text={t.clearance} />
                  {isSevered(t) && <span style={{ fontSize: 10, color: "#fff", background: PURPLE, padding: "1px 7px", borderRadius: 999 }}>severed</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "76px 1fr", rowGap: 3, columnGap: 8, fontSize: 11.5 }}>
                  <span style={{ color: MUTED }}>Surface</span><span style={{ color: INK }}>{t.surface || "—"}</span>
                  <span style={{ color: MUTED }}>Geothermal</span><span style={{ color: isSevered(t) ? PURPLE : INK, fontWeight: isSevered(t) ? 600 : 400 }}>{t.geo || "—"}</span>
                  <span style={{ color: MUTED }}>Mineral</span><span style={{ color: INK }}>{t.mineral || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, c }: { label: string; value: string | number; c?: string }) {
  return <span><span style={{ color: MUTED }}>{label} </span><b className="num" style={{ color: c ?? INK, fontWeight: 700 }}>{value}</b></span>;
}
function Tag({ text }: { text: string }) {
  const v = text.toLowerCase();
  const c = /cleared|leased|done|complete|executed/.test(v) ? GREEN : /negotiat|contact|review|progress|pending|condition|hold/.test(v) ? AMBER : /—|not|missing|none/.test(v) ? RED : MUTED;
  return <span style={{ fontSize: 10, color: c, background: c + "18", padding: "1px 7px", borderRadius: 999, whiteSpace: "nowrap" }}>{text}</span>;
}
function legend(layer: Layer) {
  if (layer === "leasing") return [{ c: GREEN, label: "Fully leased" }, { c: AMBER, label: "Partial" }, { c: RED, label: "Holdout (0 leased)" }, { c: EMPTY, label: "No tracts" }];
  if (layer === "title") return [{ c: GREEN, label: "Title complete" }, { c: AMBER, label: "Partial" }, { c: "#94a3b8", label: "Not complete" }, { c: EMPTY, label: "No tracts" }];
  return [{ c: PURPLE, label: "Geothermal severed from surface" }, { c: "#e5e7eb", label: "Single estate" }, { c: EMPTY, label: "No tracts" }];
}
