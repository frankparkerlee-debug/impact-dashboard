// Impact Land Services brand mark + wordmark. The mark is a section grid (a PLSS nod).

export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#2563eb" />
      <path d="M8 4.5V19.5M16 4.5V19.5M4.5 8H19.5M4.5 16H19.5" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.92" />
    </svg>
  );
}

export function Wordmark({ size = 17, color = "#111827", sub = "#6b7280", mark = true }: { size?: number; color?: string; sub?: string; mark?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.55) }}>
      {mark && <Mark size={Math.round(size * 1.4)} />}
      <span style={{ fontSize: size, fontWeight: 700, letterSpacing: -0.3, color, whiteSpace: "nowrap" }}>
        Impact <span style={{ fontWeight: 500, color: sub }}>Land Services</span>
      </span>
    </span>
  );
}
