import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentTenant } from "@/lib/auth";
import { Wordmark } from "@/components/Brand";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let workspace = "";
  try { workspace = (await currentTenant()).displayName; } catch { /* unauthorized — header still renders */ }

  return (
    <>
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}><Wordmark size={15.5} /></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {workspace && <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", padding: "4px 11px", background: "#f3f4f6", borderRadius: 999 }}>{workspace}</span>}
            <UserButton />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
