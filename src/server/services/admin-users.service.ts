import {
  type AdminUsersSummary,
  getUsersSummary,
  type AdminUserFilters,
  type AdminUserRow,
  listUsersForAdmin,
  setUserDisabled,
  updateUserRole,
} from "@/server/repositories/admin-users.repository";
import { logAdminAction } from "./audit-log.service";

export async function listUsers(
  filters: AdminUserFilters,
): Promise<{ rows: AdminUserRow[]; total: number }> {
  return listUsersForAdmin(filters);
}

/** Changes a user's role (admin action), logging the change. */
export async function updateUserRoleAsAdmin(
  adminUserId: string,
  targetUserId: string,
  role: "user" | "admin",
): Promise<void> {
  await updateUserRole(targetUserId, role);
  await logAdminAction(adminUserId, "user.update_role", "user", targetUserId, { role });
}

/** Disables or re-enables a user's account (admin action), logging the change. */
export async function setUserDisabledAsAdmin(
  adminUserId: string,
  targetUserId: string,
  disabled: boolean,
): Promise<void> {
  await setUserDisabled(targetUserId, disabled);
  await logAdminAction(adminUserId, disabled ? "user.disable" : "user.enable", "user", targetUserId);
}

/** Summary counts for the users page header cards. */
export async function getUsersOverview(): Promise<AdminUsersSummary> {
  return getUsersSummary();
}
