"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Snapshot, type SnapshotData } from "@/components/Snapshot";
import { exampleSnapshot } from "@/lib/demoData";

const INK = "#111827", MUTED = "#6b7280", FAINT = "#9ca3af", LINE = "#d1d5db", HAIR = "#e5e7eb", ACCENT = "#2563eb", PANEL = "#f8fafc";
const field: React.CSSProperties = { width: "100%", padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 14, outline: "none", color: INK, background: "#fff" };
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: INK, marginBottom: 6, display: "block" };

type Pattern = "few" | "dozen" | "many";
type Estate = "intact" | "some" | "mostly" | "unknown";
type TitleCond = "clean" | "some" | "unknown";
type Leasing = "open" | "some" | "mostly";

interface Form { area: string; acres: string; parcels: string; pattern: Pattern; estate: Estate; title: TitleCond; leasing: Leasing }

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function compute(f: Form): SnapshotData {
  const acres = Math.max(0, Number(f.acres) || 0);
  const parcels = Math.max(1, Number(f.parcels) || 1);

  const ownClarity = { few: 85, dozen: 62, many: 40 }[f.pattern];
  const consolidation = { few: 82, dozen: 58, many: 36 }[f.pattern];
  const holdout = { few: 80, dozen: 60, many: 42 }[f.pattern];
  const estate = { intact: 90, some: 58, mostly: 30, unknown: 50 }[f.estate];
  const title = { clean: 80, some: 50, unknown: 45 }[f.title];
  const leaseOpen = { open: 82, some: 60, mostly: 40 }[f.leasing];

  const indices = [
    { label: "Ownership clarity", score: ownClarity, read: f.pattern === "few" ? "Consolidated; few owners" : f.pattern === "dozen" ? "Moderately split" : "Fragmented; many owners" },
    { label: "Title condition", score: title, read: f.title === "clean" ? "Looks clean — verify in diligence" : f.title === "some" ? "Known issues to cure" : "Unknown until a title pull" },
    { label: "Leasing openness", score: leaseOpen, read: f.leasing === "open" ? "Largely open to negotiate" : f.leasing === "some" ? "Partly leased" : "Competitive / mostly leased" },
    { label: "Estate simplicity", score: estate, read: f.estate === "intact" ? "Minerals likely with surface" : f.estate === "some" ? "Some severed estates" : f.estate === "mostly" ? "Mostly severed estates" : "Severance unknown" },
    { label: "Consolidation", score: consolidation, read: f.pattern === "few" ? "Large, contiguous tracts" : f.pattern === "dozen" ? "Some fragmentation" : "Highly fragmented" },
    { label: "Holdout risk", score: holdout, read: f.pattern === "many" ? "Several likely holdouts" : f.pattern === "dozen" ? "A few potential holdouts" : "Low holdout risk" },
  ];

  const score = clamp(title * 0.25 + ownClarity * 0.2 + estate * 0.2 + leaseOpen * 0.15 + consolidation * 0.1 + holdout * 0.1);
  const label = score >= 70 ? "Strong" : score >= 45 ? "Moderate" : "Challenging";
  const owners = f.pattern === "few" ? Math.max(2, Math.round(parcels * 0.3)) : f.pattern === "dozen" ? Math.max(3, Math.round(parcels * 0.7)) : Math.max(5, Math.round(parcels * 1.2));

  const curative = f.title === "clean" ? Math.round(parcels * 0.1) : f.title === "some" ? Math.round(parcels * 0.35) : Math.round(parcels * 0.3);
  const severed = f.estate === "intact" ? 0 : f.estate === "some" ? Math.max(1, Math.round(parcels * 0.12)) : f.estate === "mostly" ? Math.round(parcels * 0.45) : Math.round(parcels * 0.2);
  const holdouts = f.pattern === "many" ? Math.round(parcels * 0.15) : f.pattern === "dozen" ? Math.round(parcels * 0.06) : 0;

  const flags = [
    { label: "Tracts likely needing curative", count: curative, severity: (f.title === "clean" ? "low" : "high") as "high" | "med" | "low" },
    { label: f.estate === "unknown" ? "Estates, severance unknown" : "Severed mineral / geothermal estates", count: severed, severity: "med" as "high" | "med" | "low" },
    { label: "Potential holdout parcels", count: holdouts, severity: (holdouts > 3 ? "med" : "low") as "high" | "med" | "low" },
  ].filter((x) => x.count > 0 || x.label.startsWith("Tracts"));

  const nextSteps = [
    curative > 0 ? `Pull title on the ~${curative} tract${curative > 1 ? "s" : ""} likely needing curative` : `Confirm clean title across all ${parcels} tracts`,
    severed > 0 ? `Verify the ${severed} severed estate${severed > 1 ? "s" : ""} and who holds them` : f.estate === "unknown" ? "Determine mineral / geothermal severance (records pull)" : "Confirm minerals run with the surface",
    `Resolve owner names + fractions across ~${owners} owners`,
    "Check for unrecorded encumbrances, ROW, and access",
  ];

  const note = `${f.pattern === "few" ? "Surface ownership looks consolidated" : f.pattern === "dozen" ? "Ownership is moderately split" : "Ownership is fragmented across many parties"}; ${f.title === "clean" ? "title looks clean but needs verification" : f.title === "some" ? "a meaningful share of tracts may need curative" : "title condition is unknown until a records pull"}; ${severed > 0 ? `${severed} estate${severed > 1 ? "s appear" : " appears"} severed from the surface` : "minerals likely run with the surface"}. ${score >= 70 ? "Strong assembly profile." : score >= 45 ? "Assemblable with focused work." : "Significant assembly risk — diligence first."}`;

  return {
    area: f.area.trim() || "Your target area",
    location: [acres ? `~${acres.toLocaleString()} acres` : null, `${parcels} tracts`, "self-serve screening"].filter(Boolean).join(" · "),
    date: "Instant Eval",
    tracts: parcels, acres, owners,
    buildability: { score, label, note },
    indices, flags, nextSteps,
  };
}

const SELECTS: { key: keyof Form; label: string; opts: [string, string][] }[] = [
  { key: "pattern", label: "Ownership", opts: [["few", "A few owners"], ["dozen", "A dozen or so"], ["many", "Many / fragmented"]] },
  { key: "estate", label: "Mineral & geothermal estate", opts: [["intact", "Intact with surface"], ["some", "Some severed"], ["mostly", "Mostly severed"], ["unknown", "Not sure"]] },
  { key: "title", label: "Title condition", opts: [["clean", "Looks clean"], ["some", "Some known issues"], ["unknown", "Not sure"]] },
  { key: "leasing", label: "Leasing status", opts: [["open", "Mostly open"], ["some", "Partly leased"], ["mostly", "Mostly leased"]] },
];

export default function EvalTool() {
  const [form, setForm] = useState<Form>({ area: "", acres: "", parcels: "", pattern: "dozen", estate: "unknown", title: "unknown", leasing: "open" });
  const [result, setResult] = useState<SnapshotData | null>(null);
  const [err, setErr] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [result]);

  function set<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })); }

  function run() {
    if (!form.area.trim()) return setErr("Name the target area.");
    if (!(Number(form.acres) > 0)) return setErr("Enter approximate acreage.");
    if (!(Number(form.parcels) > 0)) return setErr("Enter the number of tracts.");
    setErr("");
    setResult(compute(form));
  }

  return (
    <div>
      {/* input card */}
      <div style={{ background: "#fff", border: `1px solid ${HAIR}`, borderRadius: 16, boxShadow: "0 8px 30px rgba(2,6,23,0.06)", padding: 24, maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>Run your free Eval</div>
          <button onClick={() => setResult(exampleSnapshot)} style={{ fontSize: 12.5, fontWeight: 600, color: ACCENT, background: "none", border: "none", cursor: "pointer", padding: 0 }}>See a sample →</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Target area</label>
          <input style={field} value={form.area} placeholder="e.g. Sec. 14 geothermal area, county & state" onChange={(e) => set("area", e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Approx. acreage</label>
            <input style={field} type="number" min={0} value={form.acres} placeholder="e.g. 12000" onChange={(e) => set("acres", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Number of tracts</label>
            <input style={field} type="number" min={1} value={form.parcels} placeholder="e.g. 80" onChange={(e) => set("parcels", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {SELECTS.map((s) => (
            <div key={s.key}>
              <label style={lbl}>{s.label}</label>
              <select style={{ ...field, appearance: "auto" }} value={form[s.key] as string} onChange={(e) => set(s.key, e.target.value as never)}>
                {s.opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
          <button onClick={run} style={{ background: ACCENT, color: "#fff", padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>Run my Eval →</button>
          <span style={{ fontSize: 12.5, color: MUTED }}>Instant · free · no email to run</span>
          {err && <span style={{ fontSize: 12.5, color: "#dc2626", fontWeight: 500 }}>{err}</span>}
        </div>
        <div style={{ fontSize: 11.5, color: FAINT, marginTop: 12, lineHeight: 1.5 }}>
          A screening read estimated from what you know — verified by our title work. Owner names, fractions, and exact curative come from full diligence.
        </div>
      </div>

      {/* result */}
      {result && (
        <div ref={resultRef} style={{ marginTop: 36, scrollMarginTop: 80 }}>
          <Snapshot data={result} />
          <UpsellCard area={result.area} onReset={() => { setResult(null); resultRef.current?.scrollIntoView({ behavior: "smooth" }); }} />
        </div>
      )}
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
      const d = await r.json().catch(() => ({}));
      setMsg(d.error || "Something went wrong."); setStatus("error");
    } catch { setMsg("Something went wrong — try again."); setStatus("error"); }
  }

  return (
    <div style={{ maxWidth: 760, margin: "20px auto 0", background: "#111827", color: "#fff", borderRadius: 14, padding: "26px 28px" }}>
      <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6 }}>Want the verified answer?</div>
      <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.55, marginBottom: 18, maxWidth: 540 }}>
        This is a screening read. Our team runs the actual title, confirms ownership and severance, and gets you to secured, production-ready ground.
      </div>
      {status === "done" ? (
        <div style={{ fontSize: 14.5, fontWeight: 500 }}>
          Sent — we&apos;ll follow up with your verified read. <Link href="/demo" style={{ color: "#93c5fd", textDecoration: "none" }}>See the portal →</Link>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input type="email" required placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: "1 1 220px", padding: "11px 13px", borderRadius: 9, border: "1px solid #374151", background: "#1f2937", color: "#fff", fontSize: 14, outline: "none" }} />
          <button type="submit" disabled={status === "loading"} style={{ background: ACCENT, color: "#fff", padding: "11px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14.5, fontWeight: 600, opacity: status === "loading" ? 0.7 : 1 }}>
            {status === "loading" ? "Sending…" : "Get the verified Eval"}
          </button>
          {msg && <span style={{ fontSize: 12.5, color: "#fca5a5", width: "100%" }}>{msg}</span>}
        </form>
      )}
      <button onClick={onReset} style={{ marginTop: 16, fontSize: 12.5, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 0 }}>↻ Run another area</button>
    </div>
  );
}
