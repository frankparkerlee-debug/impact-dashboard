import Link from "next/link";
import { currentTenant } from "@/lib/auth";
import { loadItems, loadNamed, mondayItemUrl, DISPLAY, type ItemMode, type ItemRow } from "@/lib/metrics";
import type { BoardKey } from "@/lib/tenants";
import { Page, PageHeader, Section, MondayLink, Pill, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Items({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  let tenantSlug: string;
  try { tenantSlug = (await currentTenant()).slug; } catch { return <Page><p>Not authorized.</p></Page>; }

  let board: string, rows: ItemRow[], title: string;
  if (sp.q) {
    const named = await loadNamed(tenantSlug, sp.q);
    if (!named) return <Page><p>Unknown view.</p></Page>;
    board = named.board; rows = named.rows; title = sp.t ?? named.label;
  } else {
    board = sp.board ?? "";
    const mode: ItemMode = sp.mode === "year" ? "year" : sp.mode === "empty" ? "empty" : "eq";
    rows = await loadItems(tenantSlug, board, sp.col ?? "", sp.val ?? "", mode);
    title = sp.t ?? "Items";
  }
  const cols = DISPLAY[board] ?? [];
  const asPill = (label: string) => /status|clearance|type|w-9/i.test(label);

  return (
    <Page>
      <Link href="/dashboard" style={{ color: "#2563eb", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>‹ Back to overview</Link>
      <div style={{ height: 12 }} />
      <PageHeader title={title} subtitle={`${rows.length} item${rows.length === 1 ? "" : "s"}`} />
      <Section title="Items">
        {rows.length === 0 ? <Empty /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#6b7280", borderBottom: "2px solid #e7e9ee" }}>
                <th style={th}>Name</th>
                {cols.map((c) => <th key={c.col} style={th}>{c.label}</th>)}
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f0f1f4" }}>
                  <td style={{ ...td, fontWeight: 500 }}>{r.name}</td>
                  {cols.map((c) => {
                    const v = (r.data[c.col] ?? "").trim();
                    return <td key={c.col} style={td}>{asPill(c.label) && v ? <Pill text={v} /> : (v || "—")}</td>;
                  })}
                  <td style={{ ...td, textAlign: "right" }}>
                    <MondayLink href={mondayItemUrl(tenantSlug, board as BoardKey, r.id)} label="Open in monday ↗" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </Page>
  );
}

const th = { padding: "8px 10px", fontWeight: 600, fontSize: 12 } as const;
const td = { padding: "9px 10px", verticalAlign: "middle" } as const;
