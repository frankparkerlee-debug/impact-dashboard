"use client";
import { useRef, useState } from "react";
import Link from "next/link";

const INK = "#111827", MUTED = "#6b7280", FAINT = "#9ca3af", LINE = "#d1d5db", HAIR = "#e5e7eb", ACCENT = "#2563eb", PANEL = "#f8fafc";
const GREEN = "#16a34a", AMBER = "#d97706", RED = "#dc2626";
const field: React.CSSProperties = { width: "100%", padding: "9px 11px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 13.5, outline: "none", color: INK, background: "#fff", appearance: "auto" };
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: INK, marginBottom: 6, display: "block" };
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const scoreColor = (s: number) => (s >= 70 ? GREEN : s >= 45 ? AMBER : RED);

type Vertical = "oil_gas" | "geothermal";
type Opt = { v: string; t: string; s: number };
type FieldDef = { key: string; label: string; opts: Opt[] };
type Vals = Record<string, string>;

interface Lens { key: string; label: string; score: number; weight: number; confidence: "Low" | "Moderate"; read: string }
interface EvalOut { vertical: Vertical; area: string; acres: number; tracts: number; composite: number; tier: { label: string; color: string }; basis: string; note: string; lenses: Lens[]; fatals: string[]; verify: string[] }

const RESOURCE: Record<Vertical, FieldDef[]> = {
  oil_gas: [
    { key: "offset", label: "Offset production nearby", opts: [{ v: "strong", t: "Strong / proven", s: 88 }, { v: "light", t: "Some / light", s: 60 }, { v: "none", t: "None known", s: 30 }] },
    { key: "oplay", label: "Play type", opts: [{ v: "unconv", t: "Unconventional / shale", s: 70 }, { v: "conv", t: "Conventional", s: 65 }] },
    { key: "formation", label: "Target formation", opts: [{ v: "defined", t: "Well-defined", s: 80 }, { v: "uncertain", t: "Uncertain", s: 45 }] },
  ],
  geothermal: [
    { key: "temp", label: "Resource temperature", opts: [{ v: "high", t: "High", s: 90 }, { v: "moderate", t: "Moderate", s: 62 }, { v: "low", t: "Low", s: 35 }, { v: "unknown", t: "Unknown", s: 45 }] },
    { key: "proximity", label: "Near known field / young faults", opts: [{ v: "close", t: "Close", s: 85 }, { v: "moderate", t: "Moderate", s: 60 }, { v: "far", t: "Far", s: 35 }, { v: "unknown", t: "Unknown", s: 45 }] },
    { key: "gplay", label: "Play type", opts: [{ v: "hydro", t: "Hydrothermal", s: 75 }, { v: "egs", t: "EGS / engineered", s: 55 }, { v: "unknown", t: "Unsure", s: 50 }] },
  ],
};
const siteFields = (v: Vertical): FieldDef[] => [
  { key: "access", label: "Surface access & terrain", opts: [{ v: "good", t: "Good", s: 85 }, { v: "moderate", t: "Moderate", s: 60 }, { v: "difficult", t: "Difficult", s: 35 }] },
  { key: "infra", label: v === "oil_gas" ? "Pipeline / takeaway proximity" : "Transmission proximity", opts: [{ v: "close", t: "Close", s: 85 }, { v: "moderate", t: "Moderate", s: 60 }, { v: "far", t: "Far", s: 35 }, { v: "unknown", t: "Unknown", s: 50 }] },
  { key: "enviro", label: "Environmental constraints", opts: [{ v: "none", t: "None known", s: 85 }, { v: "some", t: "Some", s: 55 }, { v: "significant", t: "Significant", s: 25 }, { v: "unknown", t: "Unknown", s: 50 }] },
];
const LAND: FieldDef[] = [
  { key: "ownership", label: "Mineral ownership", opts: [{ v: "consolidated", t: "Consolidated", s: 85 }, { v: "mixed", t: "Mixed", s: 58 }, { v: "fragmented", t: "Fragmented", s: 35 }] },
  { key: "severance", label: "Mineral severance", opts: [{ v: "intact", t: "Intact with surface", s: 85 }, { v: "severed", t: "Severed", s: 50 }, { v: "unknown", t: "Unknown", s: 45 }] },
  { key: "leasehold", label: "Leasehold status", opts: [{ v: "open", t: "Open / unleased", s: 80 }, { v: "partly", t: "Partly leased", s: 60 }, { v: "hbp", t: "Held by production", s: 40 }, { v: "expiring", t: "Expiring leases", s: 55 }] },
  { key: "title", label: "Title condition", opts: [{ v: "clean", t: "Looks clean", s: 85 }, { v: "issues", t: "Known issues", s: 45 }, { v: "unknown", t: "Unknown", s: 45 }] },
];

const DEFAULTS: Vals = { offset: "light", oplay: "unconv", formation: "uncertain", temp: "unknown", proximity: "unknown", gplay: "unknown", access: "moderate", infra: "unknown", enviro: "unknown", ownership: "mixed", severance: "unknown", leasehold: "open", title: "unknown" };
// within-lens field weights (resource-led inside the resource lens too)
const W_RES: Record<Vertical, number[]> = { oil_gas: [0.5, 0.2, 0.3], geothermal: [0.5, 0.35, 0.15] };
const W_SITE = [0.35, 0.35, 0.3];
const W_LAND = [0.3, 0.3, 0.2, 0.2];
// composite weights — resource-led; land heavier for O&G (severance gate)
const COMPOSITE: Record<Vertical, { r: number; s: number; l: number }> = { oil_gas: { r: 0.45, s: 0.2, l: 0.35 }, geothermal: { r: 0.45, s: 0.25, l: 0.3 } };

function lensScore(fields: FieldDef[], vals: Vals, weights: number[]) {
  let sum = 0, wsum = 0, unknown = false;
  fields.forEach((f, i) => {
    const v = vals[f.key] ?? DEFAULTS[f.key];
    const opt = f.opts.find((o) => o.v === v) ?? f.opts[0];
    const w = weights[i] ?? 1;
    sum += opt.s * w; wsum += w;
    if (v === "unknown") unknown = true;
  });
  return { score: clamp(sum / wsum), unknown };
}

function compute(vertical: Vertical, area: string, acres: number, tracts: number, vals: Vals): EvalOut {
  const resFields = RESOURCE[vertical], siteF = siteFields(vertical);
  const R = lensScore(resFields, vals, W_RES[vertical]);
  const S = lensScore(siteF, vals, W_SITE);
  const L = lensScore(LAND, vals, W_LAND);
  const w = COMPOSITE[vertical];

  const fatals: string[] = [];
  if ((vals.ownership ?? DEFAULTS.ownership) === "fragmented" && ((vals.severance ?? DEFAULTS.severance) === "severed" || (vals.title ?? DEFAULTS.title) === "issues"))
    fatals.push("Mineral title likely not securable without major assembly — verify before spending.");
  if ((vals.enviro ?? DEFAULTS.enviro) === "significant")
    fatals.push("Probable environmental / permitting block (e.g., critical habitat, wetlands).");
  if (vertical === "geothermal" && (vals.temp ?? DEFAULTS.temp) === "low")
    fatals.push("Resource temperature likely below commercial viability.");
  if (vertical === "oil_gas" && (vals.offset ?? DEFAULTS.offset) === "none" && (vals.formation ?? DEFAULTS.formation) === "uncertain")
    fatals.push("Resource unproven — no offset production and target formation uncertain.");

  let composite = clamp(R.score * w.r + S.score * w.s + L.score * w.l);
  if (fatals.length) composite = Math.min(composite, 40);

  const tier = fatals.length
    ? { label: "Not recommended yet", color: RED }
    : composite >= 86 ? { label: "Exceptional", color: GREEN }
      : composite >= 71 ? { label: "Strong", color: GREEN }
        : composite >= 51 ? { label: "Worth pursuing", color: AMBER }
          : composite >= 26 ? { label: "Limited", color: AMBER }
            : { label: "Not recommended", color: RED };

  const note = fatals.length
    ? "A deal-gating issue could kill this before geology matters — clear the flag(s) below first."
    : composite >= 71 ? "Strong across the lenses — this is worth real diligence."
      : composite >= 51 ? "Promising, with specific gaps to close before you commit."
        : composite >= 26 ? "Marginal — the gaps below would need to resolve favorably."
          : "The fundamentals don't support pursuit on what's known today.";

  const conf = (u: boolean): "Low" | "Moderate" => (u ? "Low" : "Moderate");
  const read = (s: number, hi: string, mid: string, lo: string) => (s >= 71 ? hi : s >= 51 ? mid : lo);
  const lenses: Lens[] = [
    { key: "resource", label: "Resource", score: R.score, weight: w.r, confidence: conf(R.unknown), read: read(R.score, "Strong resource signal", "Moderate resource signal", "Weak / unproven resource") },
    { key: "site", label: "Site", score: S.score, weight: w.s, confidence: conf(S.unknown), read: read(S.score, "Few site constraints", "Some site constraints", "Significant site constraints") },
    { key: "land", label: "Land & title", score: L.score, weight: w.l, confidence: conf(L.unknown), read: read(L.score, "Clean, assemblable position", "Some title / ownership work", "Fragmented / title-heavy") },
  ];

  const verify: string[] = [];
  if ((vals.severance ?? DEFAULTS.severance) !== "intact") verify.push("Confirm mineral severance & ownership (title pull)");
  if (vertical === "geothermal" && ["unknown", "low"].includes(vals.temp ?? DEFAULTS.temp)) verify.push("Confirm temperature-at-depth (heat-flow / BHT data, test well)");
  if (vertical === "oil_gas" && (vals.offset ?? DEFAULTS.offset) !== "strong") verify.push("Pull offset well production & decline (state well DB)");
  if (["unknown", "significant"].includes(vals.enviro ?? DEFAULTS.enviro)) verify.push("Screen critical habitat, wetlands & permitting path");
  if (["unknown", "far"].includes(vals.infra ?? DEFAULTS.infra)) verify.push(vertical === "oil_gas" ? "Confirm pipeline / takeaway capacity" : "Confirm transmission & interconnection");
  verify.push("Full title & curative across the position");

  return {
    vertical, area: area.trim() || "Your target area", acres, tracts, composite, tier, note,
    basis: vertical === "geothermal" ? "Screened on Play Fairway Analysis (DOE/NREL method)" : "Screened on Geological Chance of Success (SPE-PRMS)",
    lenses, fatals, verify: verify.slice(0, 5),
  };
}

const SAMPLE: { vertical: Vertical; area: string; acres: string; tracts: string; vals: Vals } = {
  vertical: "oil_gas", area: "Sample — Permian acreage block", acres: "6400", tracts: "42",
  vals: { offset: "strong", oplay: "unconv", formation: "defined", access: "good", infra: "close", enviro: "some", ownership: "mixed", severance: "severed", leasehold: "open", title: "issues" },
};

export default function EvalTool() {
  const [vertical, setVertical] = useState<Vertical>("oil_gas");
  const [area, setArea] = useState("");
  const [acres, setAcres] = useState("");
  const [tracts, setTracts] = useState("");
  const [vals, setVals] = useState<Vals>({ ...DEFAULTS });
  const [result, setResult] = useState<EvalOut | null>(null);
  const [err, setErr] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const set = (k: string, v: string) => setVals((p) => ({ ...p, [k]: v }));
  const reveal = () => setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);

  function run() {
    if (!area.trim()) return setErr("Name the target area.");
    if (!(Number(acres) > 0)) return setErr("Enter approximate acreage.");
    if (!(Number(tracts) > 0)) return setErr("Enter the number of tracts.");
    setErr("");
    setResult(compute(vertical, area, Math.round(Number(acres)), Math.round(Number(tracts)), vals));
    reveal();
  }
  function sample() {
    setVertical(SAMPLE.vertical); setArea(SAMPLE.area); setAcres(SAMPLE.acres); setTracts(SAMPLE.tracts); setVals({ ...DEFAULTS, ...SAMPLE.vals });
    setResult(compute(SAMPLE.vertical, SAMPLE.area, Number(SAMPLE.acres), Number(SAMPLE.tracts), { ...DEFAULTS, ...SAMPLE.vals }));
    reveal();
  }

  const lensSections: { title: string; sub: string; fields: FieldDef[] }[] = [
    { title: "Resource", sub: "the rock", fields: RESOURCE[vertical] },
    { title: "Site", sub: "the surface", fields: siteFields(vertical) },
    { title: "Land & title", sub: "ownership", fields: LAND },
  ];

  return (
    <div>
      <div style={{ background: "#fff", border: `1px solid ${HAIR}`, borderRadius: 16, boxShadow: "0 8px 30px rgba(2,6,23,0.06)", padding: 24, maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          {/* vertical toggle */}
          <div style={{ display: "inline-flex", background: PANEL, border: `1px solid ${HAIR}`, borderRadius: 10, padding: 3 }}>
            {([["oil_gas", "Oil & Gas"], ["geothermal", "Geothermal"]] as [Vertical, string][]).map(([v, t]) => (
              <button key={v} onClick={() => { setVertical(v); setResult(null); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, background: vertical === v ? "#fff" : "transparent", color: vertical === v ? INK : MUTED, boxShadow: vertical === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>{t}</button>
            ))}
          </div>
          <button onClick={sample} style={{ fontSize: 12.5, fontWeight: 600, color: ACCENT, background: "none", border: "none", cursor: "pointer", padding: 0 }}>See a sample →</button>
        </div>

        {/* basics */}
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Target area</label>
          <input style={field} value={area} placeholder="e.g. Section 14 block, county & state" onChange={(e) => setArea(e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
          <div><label style={lbl}>Approx. acreage</label><input style={field} type="number" min={0} value={acres} placeholder="e.g. 6400" onChange={(e) => setAcres(e.target.value)} /></div>
          <div><label style={lbl}>Number of tracts</label><input style={field} type="number" min={1} value={tracts} placeholder="e.g. 42" onChange={(e) => setTracts(e.target.value)} /></div>
        </div>

        {/* three lenses */}
        {lensSections.map((sec) => (
          <div key={sec.title} style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${HAIR}` }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
              {sec.title} <span style={{ color: FAINT, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>· {sec.sub}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
              {sec.fields.map((f) => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <select style={field} value={vals[f.key] ?? DEFAULTS[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                    {f.opts.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
          <button onClick={run} style={{ background: ACCENT, color: "#fff", padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>Run my Eval →</button>
          <span style={{ fontSize: 12.5, color: MUTED }}>Instant · free · no email to run</span>
          {err && <span style={{ fontSize: 12.5, color: RED, fontWeight: 500 }}>{err}</span>}
        </div>
        <div style={{ fontSize: 11.5, color: FAINT, marginTop: 12, lineHeight: 1.5 }}>
          A screening read on the methods professionals use — Play Fairway Analysis (geothermal) and Geological Chance of Success (oil &amp; gas) — applied to what you know. Not a reserve estimate or title opinion; the certainty comes from our diligence.
        </div>
      </div>

      {result && (
        <div ref={resultRef} style={{ marginTop: 36, scrollMarginTop: 80 }}>
          <EvalResult d={result} />
          <UpsellCard area={result.area} onReset={() => { setResult(null); resultRef.current?.scrollIntoView({ behavior: "smooth" }); }} />
        </div>
      )}
    </div>
  );
}

function EvalResult({ d }: { d: EvalOut }) {
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", background: "#fff", border: `1px solid ${HAIR}`, borderRadius: 14, boxShadow: "0 4px 24px rgba(16,24,40,.08)", overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)", color: "#fff", padding: "18px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 }}>{d.vertical === "oil_gas" ? "Oil & Gas" : "Geothermal"} · Acreage Eval</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>{d.basis}</div>
        </div>
        <h2 style={{ margin: "8px 0 2px", fontSize: 21, fontWeight: 700, letterSpacing: -0.3 }}>{d.area}</h2>
        <div style={{ fontSize: 12.5, opacity: 0.85 }}>{d.acres.toLocaleString()} acres · {d.tracts.toLocaleString()} tracts</div>
      </div>

      <div style={{ padding: "22px 26px" }}>
        <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${HAIR}` }}>
          <Dial score={d.composite} label={d.tier.label} color={d.tier.color} />
          <div style={{ flex: 1, minWidth: 240, fontSize: 13.5, color: INK, lineHeight: 1.55 }}>{d.note}</div>
        </div>

        {d.fatals.map((f) => (
          <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 9, padding: "10px 13px", marginBottom: 10 }}>
            <span style={{ color: RED, fontWeight: 700, fontSize: 14, lineHeight: 1.4 }}>⚠</span>
            <span style={{ fontSize: 12.5, color: "#991b1b", lineHeight: 1.45, fontWeight: 500 }}>{f}</span>
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14, margin: "18px 0 4px" }}>
          {d.lenses.map((l) => <LensCard key={l.key} l={l} />)}
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>What we&apos;d verify next</div>
          {d.verify.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "7px 0", borderBottom: `1px solid ${HAIR}`, fontSize: 12.5 }}>
              <span style={{ color: ACCENT, fontWeight: 700, lineHeight: 1.45 }}>{i + 1}</span>
              <span style={{ lineHeight: 1.45 }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>
          Resource leads the score, land/title can veto it, site supports — the way an analyst and landman actually weigh a prospect. Screening only; <b style={{ color: INK }}>not</b> a reserve estimate or title opinion.
        </div>
      </div>
    </div>
  );
}

function LensCard({ l }: { l: Lens }) {
  const col = scoreColor(l.score);
  return (
    <div style={{ border: `1px solid ${HAIR}`, borderRadius: 11, padding: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: -0.2 }}>{l.label}</span>
        <span className="num" style={{ fontSize: 18, fontWeight: 700, color: col }}>{l.score}</span>
      </div>
      <div style={{ height: 6, background: "#f1f3f7", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${l.score}%`, background: col, borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45, marginBottom: 8 }}>{l.read}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: FAINT }}>
        <span>{Math.round(l.weight * 100)}% of score</span>
        <span>Confidence: {l.confidence}</span>
      </div>
    </div>
  );
}

function Dial({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center", flexShrink: 0 }}>
      <svg width="98" height="98" viewBox="0 0 92 92" aria-hidden="true">
        <circle cx="46" cy="46" r={r} fill="none" stroke="#eef1f5" strokeWidth="8" />
        <circle cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 46 46)" />
        <text x="46" y="45" textAnchor="middle" fontSize="23" fontWeight="700" fill={INK} fontFamily="var(--font-sans)">{score}</text>
        <text x="46" y="60" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="var(--font-sans)">/ 100</text>
      </svg>
      <div style={{ fontSize: 12.5, fontWeight: 700, color, marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6 }}>Composite</div>
    </div>
  );
}

function UpsellCard({ area, onReset }: { area: string; onReset: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading"); setMsg("");
    try {
      const r = await fetch("/api/snapshot-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, area, source: "eval" }) });
      if (r.ok) { setStatus("done"); return; }
      const dt = await r.json().catch(() => ({}));
      setMsg(dt.error || "Something went wrong."); setStatus("error");
    } catch { setMsg("Something went wrong — try again."); setStatus("error"); }
  }
  return (
    <div style={{ maxWidth: 780, margin: "20px auto 0", background: "#111827", color: "#fff", borderRadius: 14, padding: "26px 28px" }}>
      <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6 }}>Want the verified read?</div>
      <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.55, marginBottom: 18, maxWidth: 540 }}>
        This is a screen on what you know. Our team pulls the real data — title & severance, offset production, heat-flow, permitting — and gets you to secured, drill-ready ground.
      </div>
      {status === "done" ? (
        <div style={{ fontSize: 14.5, fontWeight: 500 }}>Sent — we&apos;ll follow up with your verified read. <Link href="/demo" style={{ color: "#93c5fd", textDecoration: "none" }}>See the portal →</Link></div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input type="email" required placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: "1 1 220px", padding: "11px 13px", borderRadius: 9, border: "1px solid #374151", background: "#1f2937", color: "#fff", fontSize: 14, outline: "none" }} />
          <button type="submit" disabled={status === "loading"} style={{ background: ACCENT, color: "#fff", padding: "11px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14.5, fontWeight: 600, opacity: status === "loading" ? 0.7 : 1 }}>{status === "loading" ? "Sending…" : "Get the verified read"}</button>
          {msg && <span style={{ fontSize: 12.5, color: "#fca5a5", width: "100%" }}>{msg}</span>}
        </form>
      )}
      <button onClick={onReset} style={{ marginTop: 16, fontSize: 12.5, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}>↻ Run another area</button>
    </div>
  );
}
