import { auth } from "@clerk/nextjs/server";
import { getTenant, type Tenant } from "./tenants";

/**
 * Resolve the current user's tenant from their active Clerk organization.
 * Every dashboard query should start here so reads are always tenant-scoped.
 */
export async function currentTenant(): Promise<Tenant> {
  const { userId, orgSlug } = await auth();
  if (!userId) throw new Error("Not authenticated");
  // Clerk Organization slug == tenant slug (see PLATFORM / README).
  return getTenant(orgSlug);
}
