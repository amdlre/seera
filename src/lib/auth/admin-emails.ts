import { env } from "@/lib/env";

/**
 * Emails listed in ADMIN_EMAILS own the admin role: they get it on first
 * sign-in and are restored to it on every later sign-in. Comparison is
 * case-insensitive, matching the `citext` email column.
 */
const configuredAdminEmails = new Set(
  (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean),
);

/** Returns true when the given address is configured as an admin account. */
export function isConfiguredAdminEmail(email: string): boolean {
  return configuredAdminEmails.has(email.trim().toLowerCase());
}
