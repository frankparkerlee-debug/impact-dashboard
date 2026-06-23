-- Render Postgres schema for the Impact Client Portal.
-- A cache of monday data, partitioned by tenant. Apply with: npm run db:migrate

CREATE TABLE IF NOT EXISTS tenants (
  slug         text PRIMARY KEY,
  display_name text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- One generic cache table for all boards. `data` holds the monday column values as JSON
-- so we don't have to model every column up front; promote hot fields to typed columns
-- (and their own indexes) as the dashboards demand them.
CREATE TABLE IF NOT EXISTS monday_items (
  tenant         text NOT NULL REFERENCES tenants(slug),
  board          text NOT NULL,              -- 'tracts' | 'leases' | 'leasePayments' | ...
  monday_item_id text NOT NULL,
  name           text,
  data           jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant, board, monday_item_id)
);

-- Every dashboard query filters by tenant (+ usually board): index for it.
CREATE INDEX IF NOT EXISTS idx_monday_items_tenant_board ON monday_items (tenant, board);
-- JSONB GIN index so filtering/aggregating on column values stays fast at scale.
CREATE INDEX IF NOT EXISTS idx_monday_items_data ON monday_items USING gin (data);
