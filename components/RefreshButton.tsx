"use client";
import { useState, useTransition } from "react";
import { refresh, type RefreshResult } from "@/app/dashboard/actions";

const btn: React.CSSProperties = {
  background: "#fff", border: "1px solid #d7dbe3", borderRadius: 8, padding: "6px 12px",
  fontSize: 13, fontWeight: 600, color: "#0e1726", cursor: "pointer", whiteSpace: "nowrap",
};

export default function RefreshButton() {
  const [pending, start] = useTransition();
  const [res, setRes] = useState<RefreshResult | null>(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setRes(await refresh()))}
        style={{ ...btn, opacity: pending ? 0.6 : 1, cursor: pending ? "wait" : "pointer" }}
      >
        {pending ? "Syncing…" : "↻ Refresh data"}
      </button>

      {pending && <span style={{ fontSize: 12, color: "#6b7280" }}>pulling from monday…</span>}

      {!pending && res?.ok && (
        <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
          ✓ Synced {res.total.toLocaleString()} records
        </span>
      )}

      {!pending && res && !res.ok && (
        <span
          title={res.error}
          style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          ⚠ Sync failed — {res.error}
        </span>
      )}
    </div>
  );
}
