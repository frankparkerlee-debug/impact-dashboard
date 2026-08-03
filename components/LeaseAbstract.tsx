import type { CSSProperties } from "react";
import type { AbstractResult } from "@/lib/abstract";

const INK = "#111827", MUTED = "#6b7280", FAINT = "#9ca3af", LINE = "#e5e7eb", HAIR = "#f1f3f7", PANEL = "#f9fafb", ACCENT = "#2563eb";
const SEV = {
  high: { bg: "#fef2f2", fg: "#dc2626", label: "HIGH" },
  medium: { bg: "#fffbeb", fg: "#d97706", label: "MED" },
  low: { bg: "#f1f5f9", fg: "#475569", label: "LOW" },
} as const;
const STATUS = {
  alert: { bg: "#fef2f2", border: "#fecaca", fg: "#991b1b", body: "#7f1d1d", icon: "⚠" },
  warn: { bg: "#fffbeb", border: "#fde68a", fg: "#92400e", body: "#78350f", icon: "⚠" },
  ok: { bg: "#f0fdf4", border: "#bbf7d0", fg: "#166534", body: "#14532d", icon: "✓" },
} as const;

const lbl: CSSProperties = { fontSize: 10.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.7, margin: "26px 0 12px" };

export default function LeaseAbstract({ d }: { d: AbstractResult }) {
  const st = STATUS[d.statusSeverity] ?? STATUS.warn;
  return (
    <div style={{ maxWidth: 840, margin: "0 auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 28px rgba(16,24,40,.09)" }}>
      {/* header */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", color: "#fff", padding: "26px 34px" }}>
        <div style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.85 }}>
          Impact · Lease Intelligence{d.instruments?.length ? ` · ${d.instruments.length} instrument${d.instruments.length === 1 ? "" : "s"}` : ""}
        </div>
        <h2 style={{ margin: "8px 0 4px", fontSize: 23, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.2 }}>{d.title}</h2>
        <div style={{ fontSize: 13, opacity: 0.88 }}>{d.subtitle}</div>
        {!!d.instruments?.length && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 14 }}>
            {d.instruments.map((i, k) => (
              <span key={k} style={{ fontSize: 11, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 999, padding: "4px 11px" }}>{i}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 34px 30px" }}>
        {/* snapshot */}
        {!!d.facts?.length && (
          <>
            <div style={lbl}>Snapshot</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 10 }}>
              {d.facts.map((f, k) => (
                <div key={k} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "11px 13px", background: PANEL }}>
                  <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>{f.label}</div>
                  <div className={f.emphasis ? "num" : undefined} style={{ fontSize: f.emphasis ? 19 : 14, fontWeight: 600, marginTop: 4, lineHeight: 1.3, letterSpacing: f.emphasis ? -0.4 : 0, color: f.emphasis ? ACCENT : INK }}>{f.value}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* parties */}
        {!!d.parties?.length && (
          <>
            <div style={lbl}>Parties</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
              {d.parties.map((p, k) => (
                <div key={k} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "11px 13px" }}>
                  <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>{p.role}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{p.name}</div>
                  {p.note && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{p.note}</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* status */}
        {d.statusHeadline && (
          <div style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: 12, padding: "15px 18px", marginTop: 22 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: st.fg, lineHeight: 1.45 }}>{st.icon} {d.statusHeadline}</div>
            {d.statusDetail && <p style={{ margin: "7px 0 0", fontSize: 12.5, color: st.body, lineHeight: 1.6 }}>{d.statusDetail}</p>}
          </div>
        )}

        {/* key terms */}
        {!!d.keyTerms?.length && (
          <>
            <div style={lbl}>Key terms — with source language</div>
            <div>
              {d.keyTerms.map((t, k) => (
                <div key={k} style={{ padding: "13px 0", borderBottom: k === d.keyTerms.length - 1 ? "none" : `1px solid ${HAIR}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT, textAlign: "right" }}>{t.value}</span>
                  </div>
                  <p style={{ margin: "5px 0 0", fontSize: 12.5, color: "#4b5563", lineHeight: 1.6 }}>{t.summary}</p>
                  {t.source && (
                    <span style={{ display: "block", marginTop: 6, fontSize: 11, color: FAINT, fontStyle: "italic", borderLeft: `2px solid ${LINE}`, paddingLeft: 9, lineHeight: 1.5 }}>{t.source}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* burdens */}
        {!!d.burdens?.length && (
          <>
            <div style={lbl}>Burdens on production</div>
            <div style={{ background: "#f8fafc", border: `1px solid ${LINE}`, borderRadius: 12, padding: "15px 20px" }}>
              {d.burdens.map((b, k) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 13, padding: "4px 0" }}>
                  <span>{b.label}</span><span className="num" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{b.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid #d1d5db`, marginTop: 7, paddingTop: 9, fontSize: 13, fontWeight: 700 }}>
                <span>Net revenue interest</span>
                <span className="num" style={{ color: d.netRevenueInterest ? ACCENT : MUTED }}>
                  {d.netRevenueInterest ?? "Not computable — see flags"}
                </span>
              </div>
            </div>
          </>
        )}

        {/* red flags */}
        {!!d.redFlags?.length && (
          <>
            <div style={lbl}>Red flags — ranked</div>
            <div>
              {d.redFlags.map((f, k) => {
                const s = SEV[f.severity] ?? SEV.low;
                return (
                  <div key={k} style={{ display: "flex", gap: 11, padding: "11px 0", alignItems: "flex-start", borderBottom: k === d.redFlags.length - 1 ? "none" : `1px solid ${HAIR}` }}>
                    <span style={{ flex: "none", fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, borderRadius: 5, padding: "3px 8px", marginTop: 2, background: s.bg, color: s.fg }}>{s.label}</span>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: "#374151" }}>
                      <b style={{ color: INK }}>{f.title}</b> {f.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* obligations */}
        {!!d.obligations?.length && (
          <>
            <div style={lbl}>Obligation calendar</div>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
              {d.obligations.map((o, k) => (
                <div key={k} style={{ display: "flex", gap: 14, padding: "10px 16px", borderBottom: k === d.obligations.length - 1 ? "none" : `1px solid ${HAIR}`, fontSize: 12.5, alignItems: "center" }}>
                  <span className="num" style={{ flex: "none", width: 108, fontWeight: 600, color: o.past ? FAINT : INK }}>{o.when}</span>
                  <span style={{ color: o.past ? FAINT : "#374151" }}>{o.what}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* the honest wall — and the handoff */}
        {d.cannotDetermine && (
          <div style={{ background: INK, color: "#fff", borderRadius: 12, padding: "20px 24px", marginTop: 26 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.3 }}>What this abstract cannot tell you</div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#cbd5e1", lineHeight: 1.65 }}>{d.cannotDetermine}</p>
            <a href="/#services" style={{ display: "inline-block", marginTop: 14, background: ACCENT, color: "#fff", padding: "10px 18px", borderRadius: 9, fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              Have Impact handle it →
            </a>
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${LINE}`, padding: "15px 34px", fontSize: 10.5, color: FAINT, lineHeight: 1.6 }}>
        Informational abstract of document contents, generated by automated extraction with source citations. <b>Not a title opinion, not an ownership determination, and not legal advice.</b> Verify all terms against the original instruments; consult a licensed attorney for legal conclusions.
      </div>
    </div>
  );
}
