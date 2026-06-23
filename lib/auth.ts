import { auth, clerkClient } from "@clerk/nextjs/server";
import { getTenant, type Tenant } from "./tenants";

/**
 * Resolve the current user's tenant.
 * Prefers the active Clerk organization; for single-org clients that haven't selected an
 * active org, falls back to their one membership so they land straight in their dashboard.
 * Every dashboard query should start here so reads are always tenant-scoped.
 */
export async function currentTenant(): Promise<Tenant> {
  const { userId, orgSlug } = await auth();
  if (!userId) throw new Error("Not authenticated");

  // Clerk Organization slug == tenant slug (see README).
  if (orgSlug) return getTenant(orgSlug);

  // No active org in session — fall back to the user's single membership.
  const client = await clerkClient();
  const memberships = await client.users.getOrganizationMembershipList({ userId });
  const slugs = memberships.data
    .map((m) => m.organization.slug)
    .filter((s): s is string => Boolean(s));

  if (slugs.length === 1) return getTenant(slugs[0]);
  throw new Error(
    slugs.length === 0 ? "User belongs to no organization" : "User must select an organization"
  );
}
