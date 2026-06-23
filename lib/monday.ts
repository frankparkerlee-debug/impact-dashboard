// monday.com GraphQL client. Used server-side (the dashboard) and by the sync job.
// Token comes from MONDAY_API_TOKEN; never expose it to the browser.
import type { Tenant, BoardKey } from "./tenants";

const MONDAY_API = "https://api.monday.com/v2";

function token(): string {
  const t = process.env.MONDAY_API_TOKEN;
  if (!t) throw new Error("MONDAY_API_TOKEN is not set");
  return t;
}

export async function mondayGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(MONDAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token(),
      "API-Version": "2024-10",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.errors) throw new Error("monday API error: " + JSON.stringify(json.errors));
  return json.data as T;
}

export interface MondayItem {
  id: string;
  name: string;
  column_values: { id: string; text: string | null; display_value?: string | null }[];
}

// Connect-boards + mirror columns return their value via `display_value`, not `text`.
const COLS = `column_values { id text ... on BoardRelationValue { display_value } ... on MirrorValue { display_value } }`;

/**
 * Fetch ALL of a tenant's board items (paginated). Isolation: callers pass a board KEY
 * and we only ever read that tenant's configured board id.
 */
export async function getBoardItems(tenant: Tenant, board: BoardKey): Promise<MondayItem[]> {
  const boardId = tenant.monday.boards[board];
  const out: MondayItem[] = [];
  const first = await mondayGraphQL<{ boards: { items_page: { cursor: string | null; items: MondayItem[] } }[] }>(
    `query ($ids: [ID!]) { boards(ids: $ids) { items_page(limit: 100) { cursor items { id name ${COLS} } } } }`,
    { ids: [boardId] }
  );
  let page = first.boards?.[0]?.items_page ?? null;
  while (page) {
    out.push(...page.items);
    if (!page.cursor) break;
    const next = await mondayGraphQL<{ next_items_page: { cursor: string | null; items: MondayItem[] } }>(
      `query ($c: String!) { next_items_page(limit: 100, cursor: $c) { cursor items { id name ${COLS} } } }`,
      { c: page.cursor }
    );
    page = next.next_items_page ?? null;
  }
  return out;
}
