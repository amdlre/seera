"use server";

import { requireAdmin } from "@/lib/auth/session";
import { setUserDisabledSchema, updateUserRoleSchema } from "@/lib/validations/admin";
import * as adminUsersService from "@/server/services/admin-users.service";

export type AdminActionResult = { success: true } | { success: false; messageKey: string };

/** Changes a user's role. Admin-only, re-validated server-side. */
export async function updateUserRoleAction(input: unknown): Promise<AdminActionResult> {
  const session = await requireAdmin();
  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "admin.errors.invalidInput" };
  }

  await adminUsersService.updateUserRoleAsAdmin(session.sub, parsed.data.userId, parsed.data.role);
  return { success: true };
}

/** Disables or re-enables a user account. Admin-only, re-validated server-side. */
export async function setUserDisabledAction(input: unknown): Promise<AdminActionResult> {
  const session = await requireAdmin();
  const parsed = setUserDisabledSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "admin.errors.invalidInput" };
  }

  await adminUsersService.setUserDisabledAsAdmin(session.sub, parsed.data.userId, parsed.data.disabled);
  return { success: true };
}
