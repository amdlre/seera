import type { SessionPayload } from "./jwt";

/** Where a signed-in user's own space lives: admins work only inside `/admin`. */
export function homePathForRole(role: SessionPayload["role"]): "/admin" | "/dashboard" {
  return role === "admin" ? "/admin" : "/dashboard";
}
