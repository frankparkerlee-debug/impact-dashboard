"use server";

import { revalidatePath } from "next/cache";
import { currentTenant } from "@/lib/auth";
import { syncTenant } from "@/lib/sync";

export type RefreshResult =
  | { ok: true; total: number; counts: Record<string, number> }
  | { ok: false; error: string };

/** Pull the latest from monday for the signed-in user's tenant, then refresh the views. */
export async function refresh(): Promise<RefreshResult> {
  try {
    const tenant = await currentTenant();
    const counts = await syncTenant(tenant);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard/leasing");
    revalidatePath("/dashboard/title");
    revalidatePath("/dashboard/map");
    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/aoi/[aoi]", "page");
    revalidatePath("/dashboard/items");
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { ok: true, total, counts };
  } catch (e) {
    // Surface the real cause instead of failing silently.
    const msg = e instanceof Error ? `${(e as { code?: string }).code ?? e.name}: ${e.message}` : String(e);
    return { ok: false, error: msg.slice(0, 400) };
  }
}
