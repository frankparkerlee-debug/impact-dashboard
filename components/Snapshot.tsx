// Land Snapshot — a multi-index screening report (screening, not diligence — per the GTM playbook).
// Data-driven so the public example and a real client report share one component.
import type { ReactNode } from "react";

const INK = "#111827", MUTED = "#6b7280", LINE = "#e5e7eb", GREEN = "#16a34a", AMBER = "#d97706", RED = "#dc2626";
const scoreColor = (s: number) => (s >= 70 ? GREEN : s >= 45 ? AMBER : RED);

export interface SnapIndex { label: string; score: number; read: string }
export interface SnapFlag { label: string; count: number; severity: "high" | "med" | "low" }
export interface SnapshotData {
  area: string; location: string; date: string;
  tracts: number; acres: number; owners: number;
  buildability: { score: number; label: string; note: string };
  indices: SnapIndex[];
  flags: SnapFlag[];
  topOwners?: { name: string; note: string }[];
  nextSteps?: string[];
}

export function Snapshot({ data }: { data: SnapshotData }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: "0 4px 24px rgba(16,24,40,.08)", overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)", color: "#fff", padding: "20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", opacity: 0.82 }}>Land Snapshot · Screening report</div>
          <div style={{ fontSize: 11, opacity: 0.82 }}>{data.date}</div>
        </div>
        <h2 style={{ margin: "8px 0 2px", fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>{data.area}</h2>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{data.location}</div>
      </div>

      <div style={{ padding: "22px 28px" }}>
        <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginBottom: 22, paddingBottom: 20, borderBottom: `1px solid ${LINE}` }}>
          <Dial score={data.buildability.score} label={data.buildability.label} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 13, color: INK, lineHeight: 1.5, marginBottom: 12 }}>{data.buildability.note}</div>
            <div style={{ display: "flex", gap: 24 }}>
              <Stat n={data.tracts.toLocaleString()} l="tracts" />
              <Stat n={data.acres.toLocaleString()} l="acres" />
              <Stat n={data.owners.toLocaleString()} l="owners" />
            </div>
          </div>
        </div>

        <Label>Screening indices</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px", marginBottom: 24 }}>
          {data.indices.map((ix) => <IndexBar key={ix.label} ix={ix} />)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div>
            <Label>Title red‑flags</Label>
            {data.flags.map((f) => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${LINE}`, fontSize: 12.5 }}>
                <span>{f.label}</span>
                <span className="num" style={{ fontWeight: 600, color: f.severity === "high" ? RED : f.severity === "med" ? AMBER : MUTED }}>{f.count}</span>
              </div>
            ))}
          </div>
          <div>
            {data.nextSteps ? (
              <>
                <Label>What we&apos;d verify next</Label>
                {data.nextSteps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "7px 0", borderBottom: `1px solid ${LINE}`, fontSize: 12.5 }}>
                    <span style={{ color: "#2563eb", fontWeight: 700, lineHeight: 1.45 }}>{i + 1}</span>
                    <span style={{ lineHeight: 1.45 }}>{s}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <Label>Key ownership</Label>
                {(data.topOwners || []).map((o) => (
                  <div key={o.name} style={{ padding: "7px 0", borderBottom: `1px solid ${LINE}` }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{o.name}</div>
                    <div style={{ color: MUTED, fontSize: 11.5 }}>{o.note}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${LINE}`, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
          A screening read — <b>not</b> a substitute for full title diligence. Next: <b style={{ color: INK }}>Diligence</b> → <b style={{ color: INK }}>Acquisition</b> → <b style={{ color: INK }}>Management</b>.
        </div>
      </div>
    </div>
  );
}

function Dial({ score, label }: { score: number; label: string }) {
  const r = 34, c = 2 * Math.PI * r, col = scoreColor(score);
  return (
    <div style={{ textAlign: "center", flexShrink: 0 }}>
      <svg width="94" height="94" viewBox="0 0 92 92" aria-hidden="true">
        <circle cx="46" cy="46" r={r} fill="none" stroke="#eef1f5" strokeWidth="8" />
        <circle cx="46" cy="46" r={r} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 46 46)" />
        <text x="46" y="45" textAnchor="middle" fontSize="23" fontWeight="700" fill={INK} fontFamily="var(--font-sans)">{score}</text>
        <text x="46" y="60" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="var(--font-sans)">/ 100</text>
      </svg>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: col, marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6 }}>Buildability</div>
    </div>
  );
}

function IndexBar({ ix }: { ix: SnapIndex }) {
  const col = scoreColor(ix.score);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
        <span style={{ fontWeight: 500 }}>{ix.label}</span>
        <span className="num" style={{ fontWeight: 600, color: col }}>{ix.score}</span>
      </div>
      <div style={{ height: 6, background: "#f1f3f7", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${ix.score}%`, background: col, borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{ix.read}</div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="num" style={{ fontSize: 19, fontWeight: 700, color: INK, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 2 }}>{l}</div>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{children}</div>;
}
