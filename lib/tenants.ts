// The heart of multi-tenancy. A tenant == a client == one monday workspace.
// Add a client here (or, later, as a DB row) — no other code changes needed.

export type DashboardModule =
  | "lease-portfolio"
  | "payments"
  | "title-clearance"
  | "net-acres"
  | "curative";

export interface Tenant {
  /** stable slug; ideally the Clerk Organization slug is set to this exact value */
  slug: string;
  displayName: string;
  /**
   * Extra Clerk org slugs that also map to this tenant. Use this when Clerk
   * auto-generated a slug (e.g. "fervo-energy-1782...") instead of the clean one.
   * Cleaner fix: set the Clerk org slug to `slug` above and drop the alias.
   */
  aliases?: string[];
  monday: {
    workspaceId: string;
    boards: {
      tracts: string;
      leases: string;
      leasePayments: string;
      landOwners: string;
      landInterest: string;
      aoi: string;
      curative: string;
      leads: string;
    };
  };
  branding?: { logoUrl?: string; primaryColor?: string };
  modules: DashboardModule[];
}

// Tenant #1 — Fervo (live "Impact Title & Lease Acquisitions" workspace board IDs).
export const TENANTS: Record<string, Tenant> = {
  fervo: {
    slug: "fervo",
    displayName: "Fervo Energy",
    aliases: ["fervo-energy-1782222787179794763"],
    monday: {
      workspaceId: "7276746",
      boards: {
        tracts: "6019435717",
        leases: "9875640833",
        leasePayments: "18418902380",
        landOwners: "18416257355",
        landInterest: "18416254239",
        aoi: "18416074609",
        curative: "10015342036",
        leads: "9752362325",
      },
    },
    branding: { primaryColor: "#0B5FFF" },
    modules: ["lease-portfolio", "payments", "title-clearance", "curative"],
  },
};

export type BoardKey = keyof Tenant["monday"]["boards"];

/** Resolve a tenant by the user's Clerk org slug (or one of its aliases). Throws if unknown. */
export function getTenant(slug: string | null | undefined): Tenant {
  if (slug) {
    const direct = TENANTS[slug];
    if (direct) return direct;
    const byAlias = Object.values(TENANTS).find((t) => t.aliases?.includes(slug));
    if (byAlias) return byAlias;
  }
  throw new Error(`Unknown or missing tenant for "${slug}"`);
}
