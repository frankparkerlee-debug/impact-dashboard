import { query } from "./db";
import { getTenant, type BoardKey } from "./tenants";

const MONDAY_HOST = "impactland.monday.com";

// monday column IDs per board (verified against the live boards).
export const COL = {
  tracts: {
    titleStatus: "color",           // "Done" / "Incomplete" ...
    titleClearance: "color_mm3zs055", // "cleared to pay" gate
    leasingStatus: "status8",
    county: "text",
    taxAcres: "numbers",
    aoi: "board_relation_mm3zpnvn",
  },
  leases: {
    status: "status",
    type: "color_mm442f36",
    expiration: "date_mm48h35w",
    payDue: "date_mm48rjtd",
    area: "dropdown_mkthwqvk",
    leaseId: "text_mm44gmna",
  },
  aoi: { status: "color_mm3z850g", state: "dropdown_mm3zmyzq", commodity: "dropdown_mm3za6sf", target: "numeric_mm3z4ttz" },
  curative: { status: "status" },
  leads: { status: "status" },
  owners: { w9: "color_mm40trfy" },
  payments: { status: "status" },
} as const;

// Which columns to show when listing a board's items in a drill-down.
export const DISPLAY: Record<string, { col: string; label: string }[]> = {
  leases: [
    { col: COL.leases.leaseId, label: "Lease ID" },
    { col: COL.leases.type, label: "Type" },
    { col: COL.leases.status, label: "Status" },
    { col: COL.leases.expiration, label: "Expires" },
    { col: COL.leases.area, label: "Area" },
  ],
  tracts: [
    { col: COL.tracts.titleStatus, label: "Title status" },
    { col: COL.tracts.titleClearance, label: "Clearance" },
    { col: COL.tracts.leasingStatus, label: "Leasing" },
    { col: COL.tracts.county, label: "County" },
    { col: COL.tracts.aoi, label: "AOI" },
  ],
  curative: [{ col: COL.curative.status, label: "Status" }],
  landOwners: [{ col: COL.owners.w9, label: "W‑9 status" }],
  aoi: [{ col: COL.aoi.state, label: "State" }, { col: COL.aoi.commodity, label: "Commodity" }, { col: COL.aoi.status, label: "Status" }],
  leads: [{ col: COL.leads.status, label: "Status" }],
};

export function mondayItemUrl(tenantSlug: string, board: BoardKey, itemId: string): string {
  return `https://${MONDAY_HOST}/boards/${getTenant(tenantSlug).monday.boards[board]}/pulses/${itemId}`;
}
export function mondayBoardUrl(tenantSlug: string, board: BoardKey): string {
  return `https://${MONDAY_HOST}/boards/${getTenant(tenantSlug).monday.boards[board]}`;
}

export interface Slice { k: string; n: number }

async function breakdown(tenant: string, board: string, col: string): Promise<Slice[]> {
  const r = await query<{ k: string; n: number }>(
    `SELECT COALESCE(NULLIF(data ->> $2, ''), '—') AS k, count(*)::int AS n
       FROM monday_items WHERE tenant = $1 AND board = $3
       GROUP BY 1 ORDER BY n DESC`,
    [tenant, col, board]
  );
  return r.rows;
}

const numExpr = (col: string) => `NULLIF(regexp_replace(COALESCE(data->>'${col}',''), '[^0-9.\\-]', '', 'g'), '')::numeric`;
const DONE = "lower(COALESCE(data->>'" + COL.tracts.titleStatus + "','')) IN ('done','complete','title complete')";
const LEASED = "lower(COALESCE(data->>'" + COL.tracts.leasingStatus + "','')) LIKE '%leased%'";
const CLEARED = "lower(COALESCE(data->>'" + COL.tracts.titleClearance + "','')) LIKE '%cleared%'";

export interface AoiRow { aoi: string; tracts: number; leased: number; titleComplete: number; clearedToPay: number }

export async function loadOverview(tenantSlug: string) {
  const t = tenantSlug;
  const [countsR, syncedR, acresR, aoiRows, titleStatus, clearance, leaseType, leaseStatus, expirations, curative, ownersW9] =
    await Promise.all([
      query<{ board: string; n: number }>(`SELECT board, count(*)::int n FROM monday_items WHERE tenant=$1 GROUP BY board`, [t]),
      query<{ at: string | null }>(`SELECT to_char(max(synced_at),'Mon DD, YYYY') AS at FROM monday_items WHERE tenant=$1`, [t]),
      query<{ acres: number }>(`SELECT COALESCE(SUM(${numExpr(COL.tracts.taxAcres)}),0)::float AS acres FROM monday_items WHERE tenant=$1 AND board='tracts'`, [t]),
      query<AoiRow>(
        `SELECT COALESCE(NULLIF(data->>'${COL.tracts.aoi}',''),'Unassigned') AS aoi,
                count(*)::int AS tracts,
                count(*) FILTER (WHERE ${LEASED})::int AS leased,
                count(*) FILTER (WHERE ${DONE})::int AS "titleComplete",
                count(*) FILTER (WHERE ${CLEARED})::int AS "clearedToPay"
           FROM monday_items WHERE tenant=$1 AND board='tracts'
           GROUP BY 1 ORDER BY tracts DESC`, [t]),
      breakdown(t, "tracts", COL.tracts.titleStatus),
      breakdown(t, "tracts", COL.tracts.titleClearance),
      breakdown(t, "leases", COL.leases.type),
      breakdown(t, "leases", COL.leases.status),
      query<{ k: string; n: number }>(
        `SELECT COALESCE(substring(data->>'${COL.leases.expiration}' from '\\d{4}'),'—') AS k, count(*)::int n
           FROM monday_items WHERE tenant=$1 AND board='leases' GROUP BY 1 ORDER BY k`, [t]),
      breakdown(t, "curative", COL.curative.status),
      breakdown(t, "landOwners", COL.owners.w9),
    ]);

  const counts: Record<string, number> = Object.fromEntries(countsR.rows.map((r) => [r.board, r.n] as [string, number]));
  return {
    syncedAt: syncedR.rows[0]?.at ?? null,
    totalAcres: Math.round(acresR.rows[0]?.acres ?? 0),
    counts,
    aoiRows: aoiRows.rows,
    titleComplete: aoiRows.rows.reduce((a, r) => a + r.titleComplete, 0),
    clearedToPay: aoiRows.rows.reduce((a, r) => a + r.clearedToPay, 0),
    leasedTracts: aoiRows.rows.reduce((a, r) => a + r.leased, 0),
    titleStatus, clearance, leaseType, leaseStatus,
    expirations: expirations.rows,
    curative, ownersW9,
  };
}

export async function loadAoi(tenantSlug: string, aoi: string) {
  const t = tenantSlug;
  const [tracts, titleStatus, clearance] = await Promise.all([
    query<{ id: string; name: string; status: string; clearance: string; leasing: string; acres: string }>(
      `SELECT monday_item_id AS id, name,
              COALESCE(data->>'${COL.tracts.titleStatus}','—') status,
              COALESCE(data->>'${COL.tracts.titleClearance}','—') clearance,
              COALESCE(data->>'${COL.tracts.leasingStatus}','—') leasing,
              COALESCE(data->>'${COL.tracts.taxAcres}','') acres
         FROM monday_items
        WHERE tenant=$1 AND board='tracts' AND COALESCE(NULLIF(data->>'${COL.tracts.aoi}',''),'Unassigned') = $2
        ORDER BY name LIMIT 400`, [t, aoi]),
    query<{ k: string; n: number }>(`SELECT COALESCE(NULLIF(data->>'${COL.tracts.titleStatus}',''),'—') k, count(*)::int n FROM monday_items WHERE tenant=$1 AND board='tracts' AND COALESCE(NULLIF(data->>'${COL.tracts.aoi}',''),'Unassigned')=$2 GROUP BY 1 ORDER BY n DESC`, [t, aoi]),
    query<{ k: string; n: number }>(`SELECT COALESCE(NULLIF(data->>'${COL.tracts.titleClearance}',''),'—') k, count(*)::int n FROM monday_items WHERE tenant=$1 AND board='tracts' AND COALESCE(NULLIF(data->>'${COL.tracts.aoi}',''),'Unassigned')=$2 GROUP BY 1 ORDER BY n DESC`, [t, aoi]),
  ]);
  return { aoi, tracts: tracts.rows, titleStatus: titleStatus.rows, clearance: clearance.rows };
}

// Generic drill-down: every chart bucket links here.
export interface ItemRow { id: string; name: string; data: Record<string, string | null> }
export async function loadItems(tenant: string, board: string, col: string, val: string, mode: "eq" | "year"): Promise<ItemRow[]> {
  const filter = mode === "year" ? `substring(data ->> $3 from '\\d{4}') = $4` : `COALESCE(NULLIF(data ->> $3, ''), '—') = $4`;
  const r = await query<ItemRow>(
    `SELECT monday_item_id AS id, name, data FROM monday_items
      WHERE tenant=$1 AND board=$2 AND ${filter}
      ORDER BY name LIMIT 500`, [tenant, board, col, val]);
  return r.rows;
}

export async function loadPayments(tenant: string) {
  const [byYear, upcoming, boardStatus, withDueR] = await Promise.all([
    query<{ k: string; n: number }>(
      `SELECT COALESCE(substring(data->>'${COL.leases.payDue}' from '\\d{4}'),'—') k, count(*)::int n
         FROM monday_items WHERE tenant=$1 AND board='leases' AND COALESCE(data->>'${COL.leases.payDue}','')<>'' GROUP BY 1 ORDER BY k`, [tenant]),
    query<{ id: string; name: string; leaseId: string; type: string; due: string }>(
      `SELECT monday_item_id id, name, COALESCE(data->>'${COL.leases.leaseId}','') "leaseId",
              COALESCE(data->>'${COL.leases.type}','') type, COALESCE(data->>'${COL.leases.payDue}','') due
         FROM monday_items WHERE tenant=$1 AND board='leases' AND COALESCE(data->>'${COL.leases.payDue}','')<>''
         ORDER BY due LIMIT 60`, [tenant]),
    breakdown(tenant, "leasePayments", COL.payments.status),
    query<{ n: number }>(`SELECT count(*)::int n FROM monday_items WHERE tenant=$1 AND board='leases' AND COALESCE(data->>'${COL.leases.payDue}','')<>''`, [tenant]),
  ]);
  return { byYear: byYear.rows, upcoming: upcoming.rows, boardStatus, withDue: withDueR.rows[0]?.n ?? 0 };
}
