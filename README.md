# Impact Client Portal (`impact-dashboard`)

Multi-tenant client portal for **Impact Land Services**. Clients (Fervo, then others) log
in and see **only their own** land/title/lease/payment data. Impact runs one app; each
client is a **tenant**.

- **Auth:** Clerk (a Clerk *Organization* == a client tenant)
- **Data:** monday.com (system of record) → synced into **Render Postgres** → the dashboard
  reads from Postgres (fast, indexed, rate-limit-free)
- **Host:** Render (web service + managed Postgres + nightly sync cron) — see `render.yaml`

> **Design rule:** onboarding a new client is *config + a runbook*, never a new build/deploy.

## Architecture

```
Client browser ──auth'd──► Next.js (Render) ──reads──► Render Postgres ◄──nightly sync── monday API
                              │                              ▲
                              └─ Clerk (orgs = tenants)      └─ scripts/sync.ts (cron)
```

Why sync to Postgres instead of reading monday live: monday's API rate limits + latency are
the real ceiling. Our own indexed Postgres removes it and lets us aggregate freely — the
scalability lever, independent of how many clients we add.

## Layout

```
app/                 Next.js App Router (landing, /sign-in, /dashboard)
  dashboard/page.tsx tenant-scoped dashboard (reads Postgres)
lib/
  tenants.ts         tenant registry (the heart of multi-tenancy) — Fervo is tenant #1
  monday.ts          monday GraphQL client (server + sync)
  db.ts              Render Postgres pool
  auth.ts            Clerk -> tenant resolver (every read starts here)
db/schema.sql        tenant-partitioned cache schema (indexed on tenant)
scripts/sync.ts      monday -> Postgres sync (runs nightly via render.yaml cron)
middleware.ts        Clerk auth (protects /dashboard)
render.yaml          web service + Postgres + sync cron (infra as code)
```

## Tenant isolation (non-negotiable)

- The tenant is resolved from the signed-in user's Clerk org (`lib/auth.ts`) — never from
  anything the client sends.
- Every Postgres read is filtered by `tenant` (indexed); every monday read is scoped to the
  tenant's configured board IDs (`lib/tenants.ts`). One client can never address another's data.
- Secrets (`MONDAY_API_TOKEN`, `CLERK_SECRET_KEY`) stay server-only.

## Local dev

```bash
npm install
cp .env.example .env.local      # fill in Clerk keys, MONDAY_API_TOKEN, DATABASE_URL
npm run db:migrate              # apply db/schema.sql to your Postgres
npm run sync                    # pull monday -> Postgres
npm run dev                     # http://localhost:3000
```

You'll need: a Clerk app (clerk.com → API keys; enable **Organizations**), a Postgres URL
(local or a Render PG), and the monday token.

## Deploy (Render)

1. Connect this repo to Render → it reads `render.yaml` (web service + `impact-portal-db` +
   nightly sync cron).
2. Set the secret env vars in the Render dashboard: `MONDAY_API_TOKEN`,
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. (`DATABASE_URL` is injected.)
3. After first deploy, run the schema once (`db/schema.sql`) against the Render PG, then let
   the sync cron populate it (or trigger it manually).

- **Build:** `npm install && npm run build` · **Start:** `npm start`

## ▶ Onboard a new client (no code change)

1. **monday:** create the client's workspace; build/clone the board structure.
2. **`lib/tenants.ts`:** add a tenant (slug, display name, monday workspace + board IDs,
   branding, enabled modules).
3. **Clerk:** create an Organization with that slug; invite their users.
4. **Sync:** runs nightly; the client logs in and sees only their data.

## Roadmap

1. Module widgets (Lease Portfolio, Payments, Title Clearance, Curative) on the cache tables.
2. Promote hot monday columns from `data` JSONB to typed columns + indexes as needed.
3. Client #2 via the runbook above. Then notifications + approval write-back to monday.
