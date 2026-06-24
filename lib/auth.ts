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

  // 1. Active org in the session, if it maps to a known client workspace.
  if (orgSlug) {
    try { return getTenant(orgSlug); } catch { /* not a known tenant — fall through */ }
  }

  // 2. Otherwise scan the user's memberships and take the first that maps to a known
  //    workspace. This handles members who ALSO have a personal org (so they don't get
  //    stuck on "select an organization") and members who haven't set an active org.
  const client = await clerkClient();
  const memberships = await client.users.getOrganizationMembershipList({ userId });
  const slugs = memberships.data
    .map((m) => m.organization.slug)
    .filter((s): s is string => Boolean(s));

  for (const slug of slugs) {
    try { return getTenant(slug); } catch { /* not a known tenant, keep looking */ }
  }

  throw new Error(
    slugs.length === 0
      ? "Your account isn't in a client workspace yet — ask your admin to add you to the organization."
      : `Your organization isn't linked to a workspace (your org slug: ${slugs.join(", ")}). Send this to your admin.`
  );
}
