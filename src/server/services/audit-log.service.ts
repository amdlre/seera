import { insertAuditLogEntry } from "@/server/repositories/audit-log.repository";

/** Records one admin action for accountability — PROJECT-BRIEF §7.2. */
export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await insertAuditLogEntry({ adminUserId, action, targetType, targetId, metadata });
}
