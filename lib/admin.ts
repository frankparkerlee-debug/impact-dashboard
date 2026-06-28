// Impact-internal admin gate (NOT client tenants). Leads/prospects are Impact's own data —
// only allowlisted Impact emails may view them. Override the list with ADMIN_EMAILS (comma-separated).
const DEFAULT_ADMINS = ["frank.parker.lee@gmail.com", "parker@impactlandservices.com"];

export function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return [...new Set([...fromEnv, ...DEFAULT_ADMINS.map((e) => e.toLowerCase())])];
}

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
