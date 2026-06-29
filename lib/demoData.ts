// Sample data for the public Snapshot example + the /demo experience. No real client data.
import type { SnapshotData } from "@/components/Snapshot";
import type { MapData } from "@/lib/metrics";

export const exampleSnapshot: SnapshotData = {
  area: "Sample — Geothermal Project Area",
  location: "Western U.S. · sample data — not a real position",
  date: "Sample report",
  tracts: 84, acres: 12450, owners: 39,
  buildability: {
    score: 64, label: "Moderate",
    note: "Largely assemblable — surface ownership is consolidated and most acreage is open to lease, but ~30% of tracts need title curative and 3 geothermal estates are severed from the surface.",
  },
  indices: [
    { label: "Ownership clarity", score: 78, read: "Mostly consolidated; few fractional owners" },
    { label: "Title condition", score: 52, read: "~30% of tracts need curative" },
    { label: "Leasing openness", score: 71, read: "Largely unleased — open to negotiate" },
    { label: "Estate simplicity", score: 46, read: "3 severed geothermal estates" },
    { label: "Consolidation", score: 66, read: "Mostly large tracts; some fragmentation" },
    { label: "Holdout risk", score: 58, read: "5 potential holdout parcels" },
  ],
  flags: [
    { label: "Tracts needing curative", count: 25, severity: "high" },
    { label: "Severed geothermal estates", count: 3, severity: "med" },
    { label: "Potential holdouts", count: 5, severity: "med" },
    { label: "Executed leases missing a W‑9", count: 4, severity: "low" },
  ],
  topOwners: [
    { name: "Cassidy Ranch LLC", note: "14 tracts · surface + geothermal" },
    { name: "Palley Family Trust", note: "fractional geothermal — 1/3 each" },
    { name: "State trust lands", note: "9 tracts · surface (sample)" },
  ],
};

const sec = (s: number, tracts: number, leased: number, cleared: number, titleDone: number) => ({ sec: s, tracts, leased, cleared, titleDone });
const tr = (id: string, name: string, twp: string, s: number, leasing: string, title: string, clearance: string, surface: string, geo: string, mineral: string) =>
  ({ id, name, twp, sec: s, leasing, title, clearance, surface, geo, mineral, split: geo && surface !== geo ? "Fractional / Multi-owner" : "Not Marked" });

export const demoMap: MapData = {
  aoi: "Sample Project Area",
  aois: [{ k: "Sample Project Area", n: 18 }, { k: "North Block", n: 11 }],
  totals: { tracts: 18, leased: 12, cleared: 5, titleDone: 12, severed: 3 },
  townships: [
    { twp: "30S 13W", tracts: 6, leased: 5, sections: [sec(1, 2, 2, 1, 2), sec(13, 2, 2, 1, 2), sec(24, 2, 1, 0, 1)] },
    { twp: "30S 12W", tracts: 6, leased: 4, sections: [sec(6, 2, 2, 1, 2), sec(8, 2, 1, 1, 2), sec(18, 2, 1, 0, 1)] },
    { twp: "31S 12W", tracts: 6, leased: 3, sections: [sec(3, 2, 2, 1, 2), sec(10, 2, 1, 0, 0), sec(11, 2, 0, 0, 1)] },
  ],
  tracts: [
    tr("d1", "30-13-01-A", "30S 13W", 1, "Leased", "Done", "Cleared with Conditions", "Garabito Family", "Garabito Family", "Garabito Family"),
    tr("d2", "30-13-01-B", "30S 13W", 1, "Leased", "Done", "Cleared to Pay", "Henry Bermudez", "Palley Family Trust 1/3", "Palley Family Trust 1/3"),
    tr("d3", "30-13-13-A", "30S 13W", 13, "Leased", "Done", "Cleared to Pay", "Cassidy Ranch LLC", "Cassidy Ranch LLC", "Cassidy Ranch LLC"),
    tr("d4", "30-13-13-B", "30S 13W", 13, "Leased", "Done", "Incomplete", "State of Utah (SITLA)", "State of Utah (SITLA)", "State of Utah (SITLA)"),
    tr("d5", "30-13-24-A", "30S 13W", 24, "Leased", "Ready for Review", "Incomplete", "Murphy-Brown LLC", "Murphy-Brown LLC", "Murphy-Brown LLC"),
    tr("d6", "30-13-24-B", "30S 13W", 24, "Negotiating", "Incomplete", "Incomplete", "Rita Salazar", "Rita Salazar", "BLM"),
    tr("d7", "30-12-06-A", "30S 12W", 6, "Leased", "Done", "Cleared with Conditions", "Highline Farms LLC", "Highline Farms LLC", "Highline Farms LLC"),
    tr("d8", "30-12-06-B", "30S 12W", 6, "Leased", "Done", "Incomplete", "Eric & Lisa Bowman", "Geo Holdings LLC", "Geo Holdings LLC"),
    tr("d9", "30-12-08-A", "30S 12W", 8, "Leased", "Done", "Cleared to Pay", "Forty Mile Desert LLC", "Forty Mile Desert LLC", "Forty Mile Desert LLC"),
    tr("d10", "30-12-08-B", "30S 12W", 8, "Negotiating", "Working (In Progress)", "Incomplete", "Brad Beierle", "Brad Beierle", "Brad Beierle"),
    tr("d11", "30-12-18-A", "30S 12W", 18, "Leased", "Ready for Review", "Incomplete", "B and M Land Co", "B and M Land Co", "B and M Land Co"),
    tr("d12", "30-12-18-B", "30S 12W", 18, "Refusal", "Incomplete", "Incomplete", "Clark Flink", "Clark Flink", "Clark Flink"),
    tr("d13", "31-12-03-A", "31S 12W", 3, "Leased", "Done", "Cleared to Pay", "Cassidy Ranch LLC", "Cassidy Ranch LLC", "Cassidy Ranch LLC"),
    tr("d14", "31-12-03-B", "31S 12W", 3, "Leased", "Done", "Incomplete", "Jesse Brown", "Jesse Brown", "Jesse Brown"),
    tr("d15", "31-12-10-A", "31S 12W", 10, "Leased", "Incomplete", "Incomplete", "Desert Gun Club Inc", "Atlantic Geo Corp", "Atlantic Geo Corp"),
    tr("d16", "31-12-10-B", "31S 12W", 10, "Negotiating", "Incomplete", "Incomplete", "Kevin Nelson", "Kevin Nelson", "Kevin Nelson"),
    tr("d17", "31-12-11-A", "31S 12W", 11, "Negotiating", "Working (In Progress)", "Incomplete", "Nolan Cassidy", "Nolan Cassidy", "Nolan Cassidy"),
    tr("d18", "31-12-11-B", "31S 12W", 11, "Refusal", "Incomplete", "Incomplete", "Marina F. Day", "Marina F. Day", "Marina F. Day"),
  ],
};
