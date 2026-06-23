"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { MapData, MapTract, MapSectionAgg } from "@/lib/metrics";

const INK = "#1B1A16", MUTED = "#6A675C", LINE = "#D9D4C8", PAPER = "#FBFAF5", ACCENT = "#1F3F66";
const GREEN = "#2E7D5B", AMBER = "#B07D24", RED = "#B23A2E", PURPLE = "#6C5CE7", EMPTY = "#EFEADC";

// PLSS sections run boustrophedon: 1 in the NE corner, snaking W, then E, row by row.
const SECT_ORDER = [6, 5, 4, 3, 2, 1, 7, 8, 9, 10, 11, 12, 18, 17, 16, 15, 14, 13, 19, 20, 21, 22, 23, 24, 30, 29, 28, 27, 26, 25, 31, 32, 33, 34, 35, 36];

type Layer = "leasing" | "title" | "estate";
const isSevered = (t: MapTract) => !!t.geo && t.geo !== t.surface;

export default function GapMap({ data, mondayBase }: { data: MapData; mondayBase: string }) {
  const [layer, setLayer] = useState<Layer>("leasing");
  const [sel, setSel] = useState<{ twp: string; sec: number } | null>(null);

  const bySec = useMemo(() => {
    const m = new Map<string, MapTract[]>();
    for (const t of data.tracts) {
      const k = `${t.twp}|${t.sec}`;
      const a = m.get(k); if (a) a.push(t); else m.set(k, [t]);
    }
    return m;
  }, [data.tracts]);

  const cell = (agg: MapSectionAgg | undefined, severed: number) => {
    if (!agg || agg.tracts === 0) return { bg: EMPTY, fg: "#C9C2B0", border: LINE };
    if (layer === "leasing") {
      if (agg.leased === agg.tracts) return { bg: GREEN, fg: "#fff", border: GREEN };
      if (agg.leased > 0) return { bg: AMBER, fg: "#fff", border: AMBER };
      return { bg: RED, fg: "#fff", border: RED }; // tracts present, none leased = holdout/gap
    }
    if (layer === "title") {
      if (agg.cleared === agg.tracts) return { bg: GREEN, fg: "#fff", border: GREEN };
      if (agg.cleared > 0) return { bg: AMBER, fg: "#fff", border: AMBER };
      return { bg: "#E7E1D2", fg: INK, border: LINE }; // not cleared (neutral, not alarming)
    }
    // estate: highlight severed geothermal
    if (severed > 0) return { bg: PURPLE, fg: "#fff", border: PURPLE };
    return { bg: "#E7E1D2", fg: MUTED, border: LINE };
  };

  const aoiHref = (a: string) => `/dashboard/map?aoi=${encodeURIComponent(a)}`;
  const pct = (n: number) => (data.totals.tracts ? Math.round((n / data.totals.tracts) * 100) : 0);
  const selTracts = sel ? (bySec.get(`${sel.twp}|${sel.sec}`) ?? []) : [];

  return (
    <div>
      {/* AOI toggle */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {data.aois.map((a) => {
          const on = a.k === data.aoi;
          return (
            <Link key={a.k} href={aoiHref(a.k)} className="mono" style={{
              fontSize: 11.5, padding: "5px 11px", borderRadius: 3, textDecoration: "none",
              border: `1px solid ${on ? ACCENT : LINE}`, background: on ? ACCENT : PAPER, color: on ? "#fff" : INK, fontWeight: on ? 600 : 400,
            }}>{a.k} <span style={{ opacity: 0.65 }}>{a.n}</span></Link>
          );
        })}
      </div>

      {/* totals + layer toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div className="mono" style={{ display: "flex", gap: 18, fontSize: 12, color: MUTED }}>
          <Stat label="Tracts" value={data.totals.tracts} />
          <Stat label="Leased" value={`${data.totals.leased} · ${pct(data.totals.leased)}%`} c={GREEN} />
          <Stat label="Cleared to pay" value={`${data.totals.cleared} · ${pct(data.totals.cleared)}%`} c={data.totals.cleared ? GREEN : RED} />
          <Stat label="Geo estate severed" value={data.totals.severed} c={PURPLE} />
        </div>
        <div style={{ display: "flex", gap: 2, border: `1px solid ${LINE}`, borderRadius: 4, overflow: "hidden" }}>
          {(["leasing", "title", "estate"] as Layer[]).map((l) => (
            <button key={l} onClick={() => setLayer(l)} className="mono" style={{
              fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, padding: "7px 12px", border: "none", cursor: "pointer",
              background: layer === l ? INK : PAPER, color: layer === l ? "#F4F1E9" : MUTED, fontWeight: 500,
            }}>{l === "leasing" ? "Leasing" : l === "title" ? "Title" : "Estate"}</button>
          ))}
        </div>
      </div>

      {/* legend */}
      <div className="mono" style={{ display: "flex", gap: 16, fontSize: 11, color: MUTED, marginBottom: 16 }}>
        {legend(layer).map((x) => (
          <span key={x.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <i style={{ width: 11, height: 11, background: x.c, border: `1px solid ${x.c === EMPTY ? LINE : x.c}`, borderRadius: 2 }} />{x.label}
          </span>
        ))}
      </div>

      {/* township grids */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))", gap: 18 }}>
        {data.townships.map((t) => {
          const placed = t.sections.reduce((a, s) => a + (s.sec >= 1 && s.sec <= 36 ? s.tracts : 0), 0);
          const unplaced = t.tracts - placed;
          return (
            <div key={t.twp} style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 4, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                <span className="mono" style={{ fontWeight: 600, fontSize: 13, color: INK }}>T{t.twp}</span>
                <span className="mono" style={{ fontSize: 10.5, color: MUTED }}>{t.leased}/{t.tracts} leased</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2, aspectRatio: "1 / 1" }}>
                {SECT_ORDER.map((sec) => {
                  const agg = t.sections.find((s) => s.sec === sec);
                  const sevd = (bySec.get(`${t.twp}|${sec}`) ?? []).filter(isSevered).length;
                  const col = cell(agg, sevd);
                  const has = !!agg && agg.tracts > 0;
                  const on = sel?.twp === t.twp && sel?.sec === sec;
                  return (
                    <button key={sec} onClick={() => has && setSel(on ? null : { twp: t.twp, sec })} title={has ? `Sec ${sec} · ${agg!.tracts} tract(s)` : `Sec ${sec} · no tracts`}
                      style={{
                        background: col.bg, color: col.fg, border: on ? `2px solid ${INK}` : `1px solid ${col.border}`, borderRadius: 2,
                        fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500, cursor: has ? "pointer" : "default",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0, aspectRatio: "1 / 1",
                      }}>{sec}</button>
                  );
                })}
              </div>
              {unplaced > 0 && <div className="mono" style={{ fontSize: 9.5, color: MUTED, marginTop: 7 }}>+{unplaced} without a section</div>}
            </div>
          );
        })}
      </div>

      {/* section detail */}
      {sel && (
        <div style={{ marginTop: 22, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 4, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${LINE}`, paddingBottom: 10, marginBottom: 12 }}>
            <h3 className="mono" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>T{sel.twp} · Section {sel.sec} <span style={{ color: MUTED, fontWeight: 400 }}>· {selTracts.length} tract(s)</span></h3>
            <button onClick={() => setSel(null)} className="mono" style={{ border: "none", background: "none", cursor: "pointer", color: MUTED, fontSize: 12 }}>close ✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selTracts.map((t) => (
              <div key={t.id} style={{ borderBottom: `1px solid ${LINE}`, paddingBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</span>
                  <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Tag text={t.leasing} /><Tag text={t.clearance} />
                    {isSevered(t) && <span className="mono" style={{ fontSize: 10, color: "#fff", background: PURPLE, padding: "1px 6px", borderRadius: 3 }}>severed</span>}
                    <a href={`${mondayBase}/pulses/${t.id}`} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize: 10.5, color: "#7A52CC", textDecoration: "none" }}>Monday ↗</a>
                  </span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: MUTED, marginTop: 6, display: "grid", gridTemplateColumns: "70px 1fr", rowGap: 3, columnGap: 8 }}>
                  <span>Surface</span><span style={{ color: INK }}>{t.surface || "—"}</span>
                  <span>Geothermal</span><span style={{ color: isSevered(t) ? PURPLE : INK, fontWeight: isSevered(t) ? 600 : 400 }}>{t.geo || "—"}</span>
                  <span>Mineral</span><span style={{ color: INK }}>{t.mineral || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, c }: { label: string; value: string | number; c?: string }) {
  return <span><span style={{ color: MUTED }}>{label} </span><b style={{ color: c ?? INK, fontWeight: 600 }}>{value}</b></span>;
}
function Tag({ text }: { text: string }) {
  const v = text.toLowerCase();
  const c = /cleared|leased|done|complete|executed/.test(v) ? GREEN : /negotiat|contact|review|progress|pending|condition|hold/.test(v) ? AMBER : /—|not|missing|none/.test(v) ? RED : MUTED;
  return <span className="mono" style={{ fontSize: 10, color: c, background: c + "1c", padding: "1px 6px", borderRadius: 3, whiteSpace: "nowrap" }}>{text}</span>;
}
function legend(layer: Layer) {
  if (layer === "leasing") return [{ c: GREEN, label: "Fully leased" }, { c: AMBER, label: "Partial" }, { c: RED, label: "Holdout (0 leased)" }, { c: EMPTY, label: "No tracts" }];
  if (layer === "title") return [{ c: GREEN, label: "Cleared to pay" }, { c: AMBER, label: "Partial" }, { c: "#E7E1D2", label: "Not cleared" }, { c: EMPTY, label: "No tracts" }];
  return [{ c: PURPLE, label: "Geothermal severed from surface" }, { c: "#E7E1D2", label: "Single estate" }, { c: EMPTY, label: "No tracts" }];
}
