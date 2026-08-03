"use client";
import { useRef, useState } from "react";
import LeaseAbstract from "@/components/LeaseAbstract";
import type { AbstractResult } from "@/lib/abstract";

const INK = "#111827", MUTED = "#6b7280", FAINT = "#9ca3af", LINE = "#d1d5db", HAIR = "#e5e7eb", ACCENT = "#2563eb";
const MAX_FILES = 5;

const STEPS = ["Reading the documents", "Extracting terms and dates", "Checking addenda for overrides", "Flagging risks", "Building your abstract"];

export default function AbstractUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<AbstractResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setErr("");
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, MAX_FILES));
  }

  async function run() {
    if (!files.length) return setErr("Attach at least one document.");
    setErr(""); setBusy(true); setStep(0); setResult(null);
    timer.current = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 9000);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      if (email.trim()) fd.append("email", email.trim());
      const r = await fetch("/api/abstract", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      setResult(j.result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      if (timer.current) clearInterval(timer.current);
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ background: "#fff", border: `1px solid ${HAIR}`, borderRadius: 16, boxShadow: "0 8px 30px rgba(2,6,23,0.06)", padding: 24, maxWidth: 720, margin: "0 auto" }}>
        {/* dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${LINE}`, borderRadius: 12, padding: "30px 20px", textAlign: "center", cursor: "pointer", background: "#fcfcfd" }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 5 }}>Drop your lease here</div>
          <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
            PDF or text · up to {MAX_FILES} files · include the addenda and assignments if you have them
          </div>
          <input ref={inputRef} type="file" multiple accept=".pdf,.txt,.md,application/pdf,text/plain" style={{ display: "none" }}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        </div>

        {!!files.length && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${HAIR}`, borderRadius: 9, padding: "9px 12px", fontSize: 13 }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                <span className="num" style={{ color: FAINT, fontSize: 11.5 }}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                <button onClick={() => setFiles((p) => p.filter((_, k) => k !== i))} disabled={busy}
                  style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }} aria-label="Remove">×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Work email <span style={{ color: FAINT, fontWeight: 400 }}>— optional, to have a copy sent</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" disabled={busy}
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 14, outline: "none", color: INK, background: "#fff" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
          <button onClick={run} disabled={busy || !files.length}
            style={{ background: busy || !files.length ? "#93b4f5" : ACCENT, color: "#fff", padding: "12px 24px", borderRadius: 10, border: "none", cursor: busy || !files.length ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600 }}>
            {busy ? "Reading…" : "Abstract my lease →"}
          </button>
          <span style={{ fontSize: 12.5, color: MUTED }}>First one free · no account</span>
        </div>

        {busy && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: ACCENT, fontWeight: 500 }}>
            <span style={{ width: 13, height: 13, border: `2px solid #dbeafe`, borderTopColor: ACCENT, borderRadius: "50%", display: "inline-block", animation: "spin .8s linear infinite" }} />
            {STEPS[step]}…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        {err && <div style={{ marginTop: 14, fontSize: 13, color: "#dc2626", lineHeight: 1.55, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "10px 13px" }}>{err}</div>}

        <div style={{ fontSize: 11.5, color: FAINT, marginTop: 14, lineHeight: 1.55 }}>
          Your uploaded file is read and discarded — we don&apos;t retain it. We do keep the abstract we generate, so we can send it to you and support you on the file.
          Scanned images need OCR first — send those to us and we&apos;ll handle them. Don&apos;t upload anything you&apos;re not free to share.
        </div>
      </div>

      {result && (
        <div ref={resultRef} style={{ marginTop: 36, scrollMarginTop: 80 }}>
          <LeaseAbstract d={result} />
        </div>
      )}
    </div>
  );
}
