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

function cellColor(layer: Layer, agg: MapSectionAgg | undefined, severed: number) {
  if (!agg || agg.tracts === 0) return { bg: EMPTY, fg: "#cbd1da" };
  if (layer === "leasing") {
    if (agg.leased === agg.tracts) return { bg: GREEN, fg: "#fff" };
    if (agg.leased > 0) return { bg: AMBER, fg: "#fff" };
    return { bg: RED, fg: "#fff" };
  }
  if (layer === "title") {
    if (agg.cleared === agg.tracts) return { bg: GREEN, fg: "#fff" };
    if (agg.cleared > 0) return { bg: AMBER, fg: "#fff" };
    return { bg: "#e5e7eb", fg: INK };
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
    const cols = [...new Set(p.map((t) => t.signedR))].sort((a, b) => a - b);     // West → East (left → right)
    const rows = [...new Set(p.map((t) => t.signedT))].sort((a, b) => b - a);     // North → South (top → bottom)
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
          <Stat label="Cleared to pay" value={`${data.totals.cleared} · ${pct(data.totals.cleared)}%`} c={data.totals.cleared ? GREEN : RED} />
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
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: MUTED, marginBottom: 18, flexWrap: "wrap" }}>
        {legend(layer).map((x) => (
          <span key={x.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <i style={{ width: 12, height: 12, background: x.c, border: `1px solid ${x.c === EMPTY ? LINE : x.c}`, borderRadius: 3 }} />{x.label}
          </span>
        ))}
      </div>

      {/* PLSS township matrix — positioned by Range (cols) × Township (rows) */}
      <div style={{ overflowX: "auto", paddingBottom: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, minmax(150px, 1fr))`, gap: 10, minWidth: cols.length * 150 }}>
          {rows.map((sr) =>
            cols.map((sc) => {
              const t = placed.find((x) => x.signedT === sr && x.signedR === sc);
              if (!t) return <div key={`${sr}-${sc}`} style={{ border: `1px dashed ${LINE}`, borderRadius: 8, minHeight: 150, background: "#fcfcfd" }} />;
              const on = openTwp === t.twp;
              return (
                <button key={t.twp} onClick={() => { setOpenTwp(on ? null : t.twp); setSecFilter(null); }} style={{
                  textAlign: "left", cursor: "pointer", background: "#fff", borderRadius: 8, padding: 11,
                  border: on ? `2px solid ${ACCENT}` : `1px solid ${LINE}`, boxShadow: "0 1px 2px rgba(16,24,40,.05)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{t.label}</span>
                    <span className="num" style={{ fontSize: 11, color: MUTED }}>{t.leased}/{t.tracts}</span>
                  </div>
                  <MiniGrid twp={t} layer={layer} severedInSec={severedInSec} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {unplaced.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: MUTED }}>
          {unplaced.length} township(s) without parseable T/R: {unplaced.map((u) => `${u.twp} (${u.tracts})`).join(", ")}
        </div>
      )}

      {/* township drill: sections + owners */}
      {open && (
        <div style={{ marginTop: 22, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, boxShadow: "0 1px 2px rgba(16,24,40,.05)", padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Township {open.label} <span style={{ color: MUTED, fontWeight: 500, fontSize: 13 }}>· {open.leased}/{open.tracts} leased · {open.tracts} tracts</span></h3>
            <button onClick={() => setOpenTwp(null)} style={{ border: "none", background: "none", cursor: "pointer", color: MUTED, fontSize: 13 }}>close ✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 22, alignItems: "start" }}>
            {/* big section grid */}
            <div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>Sections — click to filter owners</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3, width: 282 }}>
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
              {secFilter && <button onClick={() => setSecFilter(null)} style={{ marginTop: 10, border: "none", background: "none", color: ACCENT, cursor: "pointer", fontSize: 12.5, padding: 0 }}>← all sections</button>}
            </div>
            {/* owner roster */}
            <OwnerRoster twp={open} bySec={bySec} secFilter={secFilter} mondayBase={mondayBase} />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniGrid({ twp, layer, severedInSec }: { twp: MapTownship; layer: Layer; severedInSec: (t: string, s: number) => number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2 }}>
      {SECT_ORDER.map((sec) => {
        const agg = twp.sections.find((s) => s.sec === sec);
        const col = cellColor(layer, agg, severedInSec(twp.twp, sec));
        return <div key={sec} style={{ aspectRatio: "1 / 1", background: col.bg, borderRadius: 2, border: col.bg === EMPTY ? `1px solid ${LINE}` : "none" }} />;
      })}
    </div>
  );
}

function OwnerRoster({ twp, bySec, secFilter, mondayBase }: { twp: MapTownship; bySec: Map<string, MapTract[]>; secFilter: number | null; mondayBase: string }) {
  const secs = twp.sections.map((s) => s.sec).filter((s) => secFilter == null || s === secFilter).sort((a, b) => a - b);
  return (
    <div style={{ maxHeight: 460, overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 10.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, padding: "0 0 8px", borderBottom: `1px solid ${LINE}`, position: "sticky", top: 0, background: "#fff" }}>
        <span>Surface owner</span><span>Geothermal owner</span><span>Mineral owner</span>
      </div>
      {secs.map((sec) => {
        const tracts = (bySec.get(`${twp.twp}|${sec}`) ?? []).sort((a, b) => a.name.localeCompare(b.name));
        return (
          <div key={sec} style={{ paddingTop: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>Section {sec}</div>
            {tracts.map((t) => (
              <div key={t.id} style={{ padding: "8px 0", borderBottom: `1px solid ${LINE}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 12.5 }}>{t.name}</span>
                  <span style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Tag text={t.leasing} /><Tag text={t.clearance} />
                    {isSevered(t) && <span style={{ fontSize: 10, color: "#fff", background: PURPLE, padding: "1px 6px", borderRadius: 999 }}>severed</span>}
                    <a href={`${mondayBase}/pulses/${t.id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: PURPLE, textDecoration: "none" }}>↗</a>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 11.5 }}>
                  <span style={{ color: INK }}>{t.surface || "—"}</span>
                  <span style={{ color: isSevered(t) ? PURPLE : INK, fontWeight: isSevered(t) ? 600 : 400 }}>{t.geo || "—"}</span>
                  <span style={{ color: INK }}>{t.mineral || "—"}</span>
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
  if (layer === "title") return [{ c: GREEN, label: "Cleared to pay" }, { c: AMBER, label: "Partial" }, { c: "#e5e7eb", label: "Not cleared" }, { c: EMPTY, label: "No tracts" }];
  return [{ c: PURPLE, label: "Geothermal severed from surface" }, { c: "#e5e7eb", label: "Single estate" }, { c: EMPTY, label: "No tracts" }];
}
