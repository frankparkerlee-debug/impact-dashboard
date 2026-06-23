import { query } from "./db";
import { getTenant, type BoardKey } from "./tenants";

const MONDAY_HOST = "impactland.monday.com";

// monday column IDs per board (verified against the live boards).
export const COL = {
  tracts: {
    titleStatus: "color",                // "Done" / "Incomplete" ...
    titleClearance: "color_mm3zs055",    // "cleared to pay" gate
    titleClassification: "color_mm3zbrme",
    docsOutstanding: "color_mm3zff25",   // what's blocking title
    estateSplit: "color_mm3z1rsj",       // single / surface≠geo / fractional
    leasingStatus: "status8",
    county: "text",
    taxAcres: "numbers",
    aoi: "board_relation_mm3zpnvn",
    township: "text5",                   // PLSS township, e.g. 27S
    range: "text9",                      // PLSS range, e.g. 10W
    section: "text04",                   // PLSS section 1-36
    surfaceOwner: "text2",
    geoOwner: "text51",                  // geothermal estate owner (may differ = severed)
    mineralOwner: "text3",
  },
  leases: {
    status: "status",
    type: "color_mm442f36",
    expiration: "date_mm48h35w",
    payDue: "date_mm48rjtd",
    area: "dropdown_mkthwqvk",
    leaseId: "text_mm44gmna",
    w9File: "file_mkv2nmm7",             // W9 attachment (empty = missing)
    poc: "text_mm40304w",                // Point of Contact = lessor (≈ geothermal owner)
  },
  aoi: { status: "color_mm3z850g", state: "dropdown_mm3zmyzq", commodity: "dropdown_mm3za6sf", target: "numeric_mm3z4ttz" },
  curative: { status: "status" },
  leads: { status: "status", nda: "color_mm404z3r" },
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
export type ItemMode = "eq" | "year" | "empty";
export async function loadItems(tenant: string, board: string, col: string, val: string, mode: ItemMode): Promise<ItemRow[]> {
  let filter: string;
  let params: unknown[];
  if (mode === "empty") { filter = `COALESCE(NULLIF(data ->> $3, ''), '') = ''`; params = [tenant, board, col]; }
  else if (mode === "year") { filter = `substring(data ->> $3 from '\\d{4}') = $4`; params = [tenant, board, col, val]; }
  else { filter = `COALESCE(NULLIF(data ->> $3, ''), '—') = $4`; params = [tenant, board, col, val]; }
  const r = await query<ItemRow>(
    `SELECT monday_item_id AS id, name, data FROM monday_items
      WHERE tenant=$1 AND board=$2 AND ${filter}
      ORDER BY name LIMIT 500`, params);
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

// ---- LEASING lens: throughput, contact pipeline, site readiness, W9 exception ----
export async function loadLeasing(tenant: string) {
  const t = tenant;
  const [aoiR, leadStatus, nda, expirations, w9Missing, execLeases, leads, tractsR] = await Promise.all([
    query<{ aoi: string; tracts: number; leased: number }>(
      `SELECT COALESCE(NULLIF(data->>'${COL.tracts.aoi}',''),'Unassigned') aoi, count(*)::int tracts, count(*) FILTER (WHERE ${LEASED})::int leased
         FROM monday_items WHERE tenant=$1 AND board='tracts' GROUP BY 1 ORDER BY tracts DESC`, [t]),
    breakdown(t, "leads", COL.leads.status),
    breakdown(t, "leads", COL.leads.nda),
    query<{ k: string; n: number }>(`SELECT COALESCE(substring(data->>'${COL.leases.expiration}' from '\\d{4}'),'—') k, count(*)::int n FROM monday_items WHERE tenant=$1 AND board='leases' GROUP BY 1 ORDER BY k`, [t]),
    query<{ n: number }>(`SELECT count(*)::int n FROM monday_items WHERE tenant=$1 AND board='leases' AND COALESCE(NULLIF(data->>'${COL.leases.w9File}',''),'')=''`, [t]),
    query<{ n: number }>(`SELECT count(*)::int n FROM monday_items WHERE tenant=$1 AND board='leases'`, [t]),
    query<{ n: number }>(`SELECT count(*)::int n FROM monday_items WHERE tenant=$1 AND board='leads'`, [t]),
    query<{ tracts: number; leased: number }>(`SELECT count(*)::int tracts, count(*) FILTER (WHERE ${LEASED})::int leased FROM monday_items WHERE tenant=$1 AND board='tracts'`, [t]),
  ]);
  return {
    aoiReadiness: aoiR.rows,
    leadPipeline: leadStatus,
    ndaStatus: nda,
    expirations: expirations.rows,
    leasesMissingW9: w9Missing.rows[0]?.n ?? 0,
    execLeases: execLeases.rows[0]?.n ?? 0,
    leads: leads.rows[0]?.n ?? 0,
    tracts: tractsR.rows[0]?.tracts ?? 0,
    leasedTracts: tractsR.rows[0]?.leased ?? 0,
  };
}

// ---- TITLE lens: title status, clearance gate, classification, blockers, breaks ----
export async function loadTitle(tenant: string) {
  const t = tenant;
  const [titleStatus, clearance, classification, docs, estate, curative, leasedNotCleared, tractsR, cureCount] = await Promise.all([
    breakdown(t, "tracts", COL.tracts.titleStatus),
    breakdown(t, "tracts", COL.tracts.titleClearance),
    breakdown(t, "tracts", COL.tracts.titleClassification),
    breakdown(t, "tracts", COL.tracts.docsOutstanding),
    breakdown(t, "tracts", COL.tracts.estateSplit),
    breakdown(t, "curative", COL.curative.status),
    query<{ n: number }>(`SELECT count(*)::int n FROM monday_items WHERE tenant=$1 AND board='tracts' AND ${LEASED} AND NOT (${CLEARED})`, [t]),
    query<{ tracts: number; complete: number; cleared: number }>(`SELECT count(*)::int tracts, count(*) FILTER (WHERE ${DONE})::int complete, count(*) FILTER (WHERE ${CLEARED})::int cleared FROM monday_items WHERE tenant=$1 AND board='tracts'`, [t]),
    query<{ n: number }>(`SELECT count(*)::int n FROM monday_items WHERE tenant=$1 AND board='curative'`, [t]),
  ]);
  return {
    titleStatus, clearance, classification, docs, estate, curative,
    leasedNotCleared: leasedNotCleared.rows[0]?.n ?? 0,
    tracts: tractsR.rows[0]?.tracts ?? 0,
    complete: tractsR.rows[0]?.complete ?? 0,
    cleared: tractsR.rows[0]?.cleared ?? 0,
    curativeCount: cureCount.rows[0]?.n ?? 0,
  };
}

// ---- GAP MAP: PLSS section grid by AOI, leasing + title layers, estate severance ----
export interface MapTract {
  id: string; name: string; twp: string; sec: number;
  leasing: string; title: string; clearance: string;
  surface: string; geo: string; mineral: string; split: string;
}
export interface MapSectionAgg { sec: number; tracts: number; leased: number; cleared: number; titleDone: number }
export interface MapTownship { twp: string; tracts: number; leased: number; sections: MapSectionAgg[] }
export interface MapData {
  aoi: string;
  aois: Slice[];
  townships: MapTownship[];
  tracts: MapTract[];
  totals: { tracts: number; leased: number; cleared: number; titleDone: number; severed: number };
}

const C = COL.tracts;
// geothermal estate severed from surface (different owner, geo owner present)
const SEVERED = `(NULLIF(data->>'${C.surfaceOwner}','') IS DISTINCT FROM NULLIF(data->>'${C.geoOwner}','') AND COALESCE(data->>'${C.geoOwner}','')<>'')`;
// title work complete = "Done" or "Cursory Done (Archive)"; LIKE '%done%' excludes "Incomplete"
const TITLE_DONE = `lower(COALESCE(data->>'${C.titleStatus}','')) LIKE '%done%'`;

export async function loadMap(tenant: string, aoiInput?: string): Promise<MapData> {
  const aois = (await query<Slice>(
    `SELECT trim(a) k, count(*)::int n
       FROM monday_items, regexp_split_to_table(COALESCE(NULLIF(data->>'${C.aoi}',''),'Unassigned'), ',') a
      WHERE tenant=$1 AND board='tracts' GROUP BY 1 ORDER BY 2 DESC`, [tenant])).rows;
  const aoi = aoiInput && aois.some((a) => a.k === aoiInput) ? aoiInput : (aois[0]?.k ?? "Unassigned");
  const where = `tenant=$1 AND board='tracts' AND COALESCE(NULLIF(data->>'${C.aoi}',''),'Unassigned') ILIKE $2`;
  const like = `%${aoi}%`;

  const rows = (await query<MapTract>(
    `SELECT monday_item_id id, name,
            COALESCE(NULLIF(data->>'${C.township}',''),'?')||' '||COALESCE(NULLIF(data->>'${C.range}',''),'?') twp,
            COALESCE(NULLIF(regexp_replace(COALESCE(data->>'${C.section}',''),'[^0-9]','','g'),'')::int,0) sec,
            COALESCE(NULLIF(data->>'${C.leasingStatus}',''),'—') leasing,
            COALESCE(NULLIF(data->>'${C.titleStatus}',''),'—') title,
            COALESCE(NULLIF(data->>'${C.titleClearance}',''),'—') clearance,
            COALESCE(data->>'${C.surfaceOwner}','') surface,
            COALESCE(data->>'${C.geoOwner}','') geo,
            COALESCE(data->>'${C.mineralOwner}','') mineral,
            COALESCE(NULLIF(data->>'${C.estateSplit}',''),'—') split
       FROM monday_items WHERE ${where} ORDER BY twp, sec, name`, [tenant, like])).rows;

  const totalsR = (await query<{ tracts: number; leased: number; cleared: number; titleDone: number; severed: number }>(
    `SELECT count(*)::int tracts,
            count(*) FILTER (WHERE ${LEASED})::int leased,
            count(*) FILTER (WHERE ${CLEARED})::int cleared,
            count(*) FILTER (WHERE ${TITLE_DONE})::int "titleDone",
            count(*) FILTER (WHERE ${SEVERED})::int severed
       FROM monday_items WHERE ${where}`, [tenant, like])).rows[0];

  // assemble townships -> section aggregates
  const tmap = new Map<string, MapTownship>();
  for (const r of rows) {
    let t = tmap.get(r.twp);
    if (!t) { t = { twp: r.twp, tracts: 0, leased: 0, sections: [] }; tmap.set(r.twp, t); }
    t.tracts++;
    const leased = /leased/i.test(r.leasing) ? 1 : 0;
    t.leased += leased;
    let s = t.sections.find((x) => x.sec === r.sec);
    if (!s) { s = { sec: r.sec, tracts: 0, leased: 0, cleared: 0, titleDone: 0 }; t.sections.push(s); }
    s.tracts++;
    s.leased += leased;
    if (/cleared/i.test(r.clearance)) s.cleared++;
    if (/done/i.test(r.title)) s.titleDone++;
  }
  const townships = [...tmap.values()].sort((a, b) => b.tracts - a.tracts);
  return { aoi, aois, townships, tracts: rows, totals: totalsR ?? { tracts: 0, leased: 0, cleared: 0, titleDone: 0, severed: 0 } };
}

// ---- Named compound drill-downs (multi-condition filters the generic items route can't express) ----
export const NAMED: Record<string, { board: BoardKey; label: string; where: string }> = {
  "leased-not-cleared": { board: "tracts", label: "Leased — title not yet cleared", where: `${LEASED} AND NOT (${CLEARED})` },
  "leased-no-w9": { board: "leases", label: "Executed leases missing a W‑9", where: `COALESCE(NULLIF(data->>'${COL.leases.w9File}',''),'')=''` },
};
export async function loadNamed(tenant: string, q: string): Promise<{ board: BoardKey; label: string; rows: ItemRow[] } | null> {
  const n = NAMED[q]; if (!n) return null;
  const r = await query<ItemRow>(`SELECT monday_item_id AS id, name, data FROM monday_items WHERE tenant=$1 AND board=$2 AND ${n.where} ORDER BY name LIMIT 500`, [tenant, n.board]);
  return { board: n.board, label: n.label, rows: r.rows };
}

// ---- PAYMENT RISK: leases paying soon whose (owner-matched) tracts aren't title-complete ----
type TR = { id: string; name: string; aoi: string; surf: string; geo: string; title: string };
export interface PayRiskTract { id: string; name: string; title: string; done: boolean }
export interface PayRisk {
  id: string; name: string; lessor: string; aoi: string; leaseId: string;
  due: string; days: number; level: "major" | "high" | "notice";
  titleState: "incomplete" | "unknown"; tracts: PayRiskTract[];
}
const PAY_STOP = new Set(["llc", "inc", "trust", "trusts", "revocable", "family", "the", "and", "ranch", "properties", "property", "company", "ltd", "estate", "living", "trustee", "etal", "etux", "joint", "tenants"]);
const ownerTokens = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length >= 4 && !PAY_STOP.has(w));
function annivDays(due: string): { days: number; iso: string } | null {
  const m = due && due.match(/(\d{4})-(\d{2})-(\d{2})/); if (!m) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  let d = new Date(now.getFullYear(), +m[2] - 1, +m[3]);
  if (d.getTime() < now.getTime()) d = new Date(now.getFullYear() + 1, +m[2] - 1, +m[3]);
  return { days: Math.round((d.getTime() - now.getTime()) / 864e5), iso: d.toISOString().slice(0, 10) };
}

export async function loadPaymentRisk(tenant: string) {
  const [leasesR, tractsR] = await Promise.all([
    query<{ id: string; name: string; poc: string; area: string; due: string; leaseId: string }>(
      `SELECT monday_item_id id, name, COALESCE(data->>'${COL.leases.poc}','') poc, COALESCE(data->>'${COL.leases.area}','') area,
              COALESCE(data->>'${COL.leases.payDue}','') due, COALESCE(data->>'${COL.leases.leaseId}','') "leaseId"
         FROM monday_items WHERE tenant=$1 AND board='leases' AND COALESCE(data->>'${COL.leases.payDue}','')<>''`, [tenant]),
    query<TR>(
      `SELECT monday_item_id id, name, COALESCE(data->>'${COL.tracts.aoi}','') aoi,
              COALESCE(data->>'${COL.tracts.surfaceOwner}','') surf, COALESCE(data->>'${COL.tracts.geoOwner}','') geo,
              COALESCE(data->>'${COL.tracts.titleStatus}','—') title
         FROM monday_items WHERE tenant=$1 AND board='tracts'`, [tenant]),
  ]);

  const idx = new Map<string, Map<string, TR[]>>();
  for (const t of tractsR.rows) {
    let m = idx.get(t.aoi); if (!m) { m = new Map(); idx.set(t.aoi, m); }
    for (const own of [t.geo, t.surf]) for (const tk of ownerTokens(own)) {
      const a = m.get(tk); if (a) a.push(t); else m.set(tk, [t]);
    }
  }
  const matchTracts = (area: string, poc: string): TR[] => {
    const seen = new Map<string, TR>();
    const lt = ownerTokens(poc);
    if (!lt.length) return [];
    for (const [aoi, m] of idx) {
      if (area && !aoi.toLowerCase().includes(area.toLowerCase())) continue;
      for (const tk of lt) for (const t of (m.get(tk) ?? [])) seen.set(t.id, t);
    }
    return [...seen.values()];
  };

  const done = (t: { title: string }) => /done/i.test(t.title);
  const flags: PayRisk[] = [];
  let clearSoon = 0, later = 0;
  for (const l of leasesR.rows) {
    const a = annivDays(l.due); if (!a) continue;
    if (a.days > 100) { later++; continue; }
    const matched = matchTracts(l.area, l.poc);
    const incomplete = matched.filter((t) => !done(t));
    if (matched.length > 0 && incomplete.length === 0) { clearSoon++; continue; } // title is clear → not a risk
    const level = a.days <= 60 ? "major" : a.days <= 80 ? "high" : "notice";
    flags.push({
      id: l.id, name: l.name, lessor: l.poc || "—", aoi: l.area || "—", leaseId: l.leaseId,
      due: a.iso, days: a.days, level, titleState: matched.length === 0 ? "unknown" : "incomplete",
      tracts: (incomplete.length ? incomplete : matched).slice(0, 8).map((t) => ({ id: t.id, name: t.name, title: t.title, done: done(t) })),
    });
  }
  flags.sort((x, y) => x.days - y.days);
  const counts = {
    major: flags.filter((f) => f.level === "major").length,
    high: flags.filter((f) => f.level === "high").length,
    notice: flags.filter((f) => f.level === "notice").length,
  };
  return { flags, counts, clearSoon, later, totalPaying: leasesR.rows.length };
}
