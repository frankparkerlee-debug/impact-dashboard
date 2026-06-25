"use client";
import { useMemo, useState, type ReactNode } from "react";
import type { TractDoc, LeaseDoc } from "@/lib/metrics";

const INK = "#111827", MUTED = "#6b7280", LINE = "#e5e7eb", ACCENT = "#2563eb", GREEN = "#16a34a", RED = "#dc2626";

type Entity = "tracts" | "leases";
type Filt = "all" | "gaps" | "complete";

const leaseExec = (l: LeaseDoc) => /leased|executed|signed/i.test(l.status);
const tractRelevant = (t: TractDoc) => t.leased || t.titleDone;

export default function DocumentBrowser({ tracts, leases }: { tracts: TractDoc[]; leases: LeaseDoc[] }) {
  const [entity, setEntity] = useState<Entity>("tracts");
  const [aoi, setAoi] = useState<string | null>(null);
  const [filt, setFilt] = useState<Filt>("all");
  const [q, setQ] = useState("");

  const aois = useMemo(() => {
    const rows = entity === "tracts" ? tracts : leases;
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.aoi, (m.get(r.aoi) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [entity, tracts, leases]);

  const tractGap = (t: TractDoc) => tractRelevant(t) && (!t.title || !t.index);
  const tractComplete = (t: TractDoc) => !!t.title && !!t.index;
  const leaseGap = (l: LeaseDoc) => leaseExec(l) && (!l.lease || !l.w9);
  const leaseComplete = (l: LeaseDoc) => !!l.lease && !!l.w9;

  const ql = q.trim().toLowerCase();
  const rows: (TractDoc | LeaseDoc)[] = useMemo(() => {
    if (entity === "tracts") {
      return tracts.filter((t) => {
        if (aoi && t.aoi !== aoi) return false;
        if (filt === "gaps" && !tractGap(t)) return false;
        if (filt === "complete" && !tractComplete(t)) return false;
        if (ql && !(t.name.toLowerCase().includes(ql) || t.owner.toLowerCase().includes(ql))) return false;
        return true;
      });
    }
    return leases.filter((l) => {
      if (aoi && l.aoi !== aoi) return false;
      if (filt === "gaps" && !leaseGap(l)) return false;
      if (filt === "complete" && !leaseComplete(l)) return false;
      if (ql && !(l.name.toLowerCase().includes(ql) || l.lessor.toLowerCase().includes(ql))) return false;
      return true;
    });
  }, [entity, aoi, filt, ql, tracts, leases]);

  const grouped = useMemo(() => {
    const g = new Map<string, (TractDoc | LeaseDoc)[]>();
    rows.forEach((r) => { const a = g.get(r.aoi) || []; a.push(r); g.set(r.aoi, a); });
    return [...g.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [rows]);

  const reset = (e: Entity) => { setEntity(e); setAoi(null); setFilt("all"); setQ(""); };

  return (
    <div>
      {/* toolbar */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <Seg value={entity} onChange={(v) => reset(v as Entity)} opts={[["tracts", `Tract title docs`], ["leases", `Lease docs`]]} />
        <Seg value={filt} onChange={(v) => setFilt(v as Filt)} opts={[["all", "All"], ["gaps", "Gaps only"], ["complete", "Complete"]]} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={entity === "tracts" ? "Search tract / owner…" : "Search lease / lessor…"}
          style={{ flex: 1, minWidth: 180, padding: "8px 12px", border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 13, outline: "none" }} />
      </div>

      {/* AOI pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        <Pill on={aoi === null} onClick={() => setAoi(null)}>All areas</Pill>
        {aois.map(([a, n]) => <Pill key={a} on={aoi === a} onClick={() => setAoi(a)}>{a} <span style={{ opacity: 0.65 }}>{n}</span></Pill>)}
      </div>

      <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>{rows.length} {entity === "tracts" ? "tract" : "lease"}{rows.length === 1 ? "" : "s"} shown</div>

      {/* grouped list */}
      {grouped.length === 0 ? <p style={{ color: MUTED, fontSize: 13 }}>Nothing matches.</p> : grouped.map(([area, items]) => (
        <div key={area} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{area} <span style={{ color: MUTED, fontWeight: 500 }}>· {items.length}</span></div>
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
            {items.map((r, i) => entity === "tracts"
              ? <TractRow key={r.id} t={r as TractDoc} last={i === items.length - 1} />
              : <LeaseRow key={r.id} l={r as LeaseDoc} last={i === items.length - 1} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function TractRow({ t, last }: { t: TractDoc; last: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 200px", gap: 10, alignItems: "center", padding: "10px 14px", borderBottom: last ? "none" : `1px solid ${LINE}`, background: "#fff" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
        <div style={{ fontSize: 11.5, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.owner || "—"}{t.leased ? " · leased" : ""}{t.titleDone ? " · title done" : ""}</div>
      </div>
      <DocCell name="Title runsheet" url={t.title?.url} hover={t.title?.label} expected={tractRelevant(t)} />
      <DocCell name="Index" url={t.index?.url} hover={t.index?.label} expected={tractRelevant(t)} />
    </div>
  );
}

function LeaseRow({ l, last }: { l: LeaseDoc; last: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 130px 130px", gap: 10, alignItems: "center", padding: "10px 14px", borderBottom: last ? "none" : `1px solid ${LINE}`, background: "#fff" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.lessor || l.name}</div>
        <div style={{ fontSize: 11.5, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name} · {l.status || "—"}</div>
      </div>
      <DocCell name="Lease" url={l.lease} expected={leaseExec(l)} />
      <DocCell name="W-9" url={l.w9} expected={leaseExec(l)} />
      <DocCell name="Term" url={l.term} expected={false} />
    </div>
  );
}

function DocCell({ name, url, hover, expected }: { name: string; url?: string; hover?: string; expected: boolean }) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" title={hover || name}
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: GREEN, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "4px 9px", borderRadius: 7, textDecoration: "none", maxWidth: "100%", overflow: "hidden", whiteSpace: "nowrap" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span> ↗
      </a>
    );
  }
  const bad = expected;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: bad ? RED : "#9ca3af", background: bad ? "#fef2f2" : "#f9fafb", border: `1px solid ${bad ? "#fecaca" : LINE}`, padding: "4px 9px", borderRadius: 7 }}>
      {bad ? "⚠" : "–"} {name}
    </span>
  );
}

function Seg({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: [string, string][] }) {
  return (
    <div style={{ display: "flex", border: `1px solid ${LINE}`, borderRadius: 8, overflow: "hidden" }}>
      {opts.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)} style={{ fontSize: 12.5, padding: "7px 13px", border: "none", cursor: "pointer", background: value === v ? INK : "#fff", color: value === v ? "#fff" : MUTED, fontWeight: 500 }}>{label}</button>
      ))}
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{ fontSize: 12.5, padding: "5px 11px", borderRadius: 8, cursor: "pointer", border: `1px solid ${on ? ACCENT : LINE}`, background: on ? ACCENT : "#fff", color: on ? "#fff" : INK, fontWeight: on ? 600 : 500 }}>{children}</button>
  );
}
