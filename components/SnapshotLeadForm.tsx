"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INK = "#111827", MUTED = "#6b7280", LINE = "#d1d5db", ACCENT = "#2563eb";
const input: React.CSSProperties = { width: "100%", padding: "11px 13px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 14.5, outline: "none", color: INK, background: "#fff" };

export default function SnapshotLeadForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading"); setMsg("");
    try {
      const r = await fetch("/api/snapshot-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, area, name }),
      });
      if (r.ok) { router.push("/demo"); return; }
      const d = await r.json().catch(() => ({}));
      setMsg(d.error || "Something went wrong."); setStatus("error");
    } catch { setMsg("Something went wrong — please try again."); setStatus("error"); }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
      <input style={input} type="email" required placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Work email" />
      <input style={input} type="text" placeholder="Target area (county, T-R-S, or a description)" value={area} onChange={(e) => setArea(e.target.value)} aria-label="Target area" />
      <input style={input} type="text" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" />
      <button type="submit" disabled={status === "loading"} style={{ background: ACCENT, color: "#fff", padding: "12px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, opacity: status === "loading" ? 0.7 : 1, marginTop: 2 }}>
        {status === "loading" ? "Sending…" : "Get my free Snapshot"}
      </button>
      {status === "error" && <div style={{ fontSize: 13, color: "#dc2626" }}>{msg}</div>}
      <div style={{ fontSize: 12, color: MUTED, textAlign: "center", marginTop: 2 }}>No sales call, no commitment — we'll send your screening read.</div>
    </form>
  );
}
