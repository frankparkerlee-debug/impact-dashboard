"use server";

import { revalidatePath } from "next/cache";
import { currentTenant } from "@/lib/auth";
import { syncTenant } from "@/lib/sync";

/** Pull the latest from monday for the signed-in user's tenant, then refresh the views. */
export async function refresh(): Promise<void> {
  const tenant = await currentTenant();
  await syncTenant(tenant);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard/aoi/[aoi]", "page");
  revalidatePath("/dashboard/items");
}
