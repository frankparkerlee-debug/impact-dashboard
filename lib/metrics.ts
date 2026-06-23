import { query } from "./db";
import { getTenant, type BoardKey } from "./tenants";

// monday account host (Impact runs one account; a workspace per client).
const MONDAY_HOST = "impactland.monday.com";

// monday column IDs per board (from the live boards) -> what they mean.
export const COL = {
  tracts: {
    titleStatus: "color",
    titleClearance: "color_mm3zs055",
    leasingStatus: "status8",
    county: "text",
    taxAcres: "numbers",
    aoi: "board_relation_mm3zpnvn",
  },
  leases: {
    status: "status",
    type: "color_mm442f36",
    expiration: "date_mm48h35w",
    area: "dropdown_mkthwqvk",
    leaseId: "text_mm44gmna",
  },
  aoi: { status: "color_mm3z850g", state: "dropdown_mm3zmyzq", commodity: "dropdown_mm3za6sf", target: "numeric_mm3z4ttz" },
  curative: { status: "status" },
  leads: { status: "status" },
  owners: { w9: "color_mm40trfy" },
} as const;

// ---- "Open in monday" deep links ----
export function mondayItemUrl(tenantSlug: string, board: BoardKey, itemId: string): string {
  const boardId = getTenant(tenantSlug).monday.boards[board];
  return `https://${MONDAY_HOST}/boards/${boardId}/pulses/${itemId}`;
}
export function mondayBoardUrl(tenantSlug: string, board: BoardKey): string {
  return `https://${MONDAY_HOST}/boards/${getTenant(tenantSlug).monday.boards[board]}`;
}

export interface Slice { k: string; n: number }

// Generic "group by a column's text value" breakdown.
async function breakdown(tenant: string, board: string, colExpr: string): Promise<Slice[]> {
  const r = await query<{ k: string; n: number }>(
    `SELECT COALESCE(NULLIF(${colExpr}, ''), '—') AS k, count(*)::int AS n
       FROM monday_items WHERE tenant = $1 AND board = $2
       GROUP BY 1 ORDER BY n DESC`,
    [tenant, board]
  );
  return r.rows;
}

const numExpr = (col: string) =>
  `NULLIF(regexp_replace(COALESCE(data->>'${col}',''), '[^0-9.\\-]', '', 'g'), '')::numeric`;

export interface AoiRow { aoi: string; tracts: number; leased: number; titleCleared: number }

export async function loadOverview(tenantSlug: string) {
  const t = tenantSlug;
  const [
    countsR, syncedR, acresR, aoiRows, titleStatus, clearance, leaseType, leaseStatus, expirations, curative, ownersW9, aoiMeta,
  ] = await Promise.all([
    query<{ board: string; n: number }>(`SELECT board, count(*)::int n FROM monday_items WHERE tenant=$1 GROUP BY board`, [t]),
    query<{ at: string | null }>(`SELECT to_char(max(synced_at),'Mon DD, YYYY') AS at FROM monday_items WHERE tenant=$1`, [t]),
    query<{ acres: number }>(`SELECT COALESCE(SUM(${numExpr(COL.tracts.taxAcres)}),0)::float AS acres FROM monday_items WHERE tenant=$1 AND board='tracts'`, [t]),
    query<AoiRow>(
      `SELECT COALESCE(NULLIF(data->>'${COL.tracts.aoi}',''),'Unassigned') AS aoi,
              count(*)::int AS tracts,
              count(*) FILTER (WHERE lower(COALESCE(data->>'${COL.tracts.leasingStatus}','')) LIKE '%leased%')::int AS leased,
              count(*) FILTER (WHERE lower(COALESCE(data->>'${COL.tracts.titleClearance}','')) LIKE '%cleared%')::int AS "titleCleared"
         FROM monday_items WHERE tenant=$1 AND board='tracts'
         GROUP BY 1 ORDER BY tracts DESC`, [t]),
    breakdown(t, "tracts", `data->>'${COL.tracts.titleStatus}'`),
    breakdown(t, "tracts", `data->>'${COL.tracts.titleClearance}'`),
    breakdown(t, "leases", `data->>'${COL.leases.type}'`),
    breakdown(t, "leases", `data->>'${COL.leases.status}'`),
    query<{ k: string; n: number }>(
      `SELECT COALESCE(substring(data->>'${COL.leases.expiration}' from '\\d{4}'),'—') AS k, count(*)::int n
         FROM monday_items WHERE tenant=$1 AND board='leases' GROUP BY 1 ORDER BY k`, [t]),
    breakdown(t, "curative", `data->>'${COL.curative.status}'`),
    breakdown(t, "landOwners", `data->>'${COL.owners.w9}'`),
    query<{ name: string; state: string; commodity: string; target: string }>(
      `SELECT name, COALESCE(data->>'${COL.aoi.state}','') state, COALESCE(data->>'${COL.aoi.commodity}','') commodity,
              COALESCE(data->>'${COL.aoi.target}','') target
         FROM monday_items WHERE tenant=$1 AND board='aoi' ORDER BY name`, [t]),
  ]);

  const counts = Object.fromEntries(countsR.rows.map((r) => [r.board, r.n]));
  return {
    syncedAt: syncedR.rows[0]?.at ?? null,
    totalAcres: Math.round(acresR.rows[0]?.acres ?? 0),
    counts,
    aoiRows: aoiRows.rows,
    titleStatus, clearance, leaseType, leaseStatus,
    expirations: expirations.rows,
    curative, ownersW9,
    aoiMeta: aoiMeta.rows,
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
        ORDER BY name LIMIT 300`, [t, aoi]),
    breakdownWhere(t, "tracts", COL.tracts.titleStatus, COL.tracts.aoi, aoi),
    breakdownWhere(t, "tracts", COL.tracts.titleClearance, COL.tracts.aoi, aoi),
  ]);
  return { aoi, tracts: tracts.rows, titleStatus, clearance };
}

async function breakdownWhere(tenant: string, board: string, col: string, filterCol: string, val: string): Promise<Slice[]> {
  const r = await query<{ k: string; n: number }>(
    `SELECT COALESCE(NULLIF(data->>'${col}',''),'—') AS k, count(*)::int n
       FROM monday_items
      WHERE tenant=$1 AND board=$2 AND COALESCE(NULLIF(data->>'${filterCol}',''),'Unassigned') = $3
      GROUP BY 1 ORDER BY n DESC`, [tenant, board, val]);
  return r.rows;
}
