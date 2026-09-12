"use server";

import { requireAdmin } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import {
  bulkDeleteResumesSchema,
  deleteResumeAsAdminSchema,
  updateResumeAsAdminSchema,
} from "@/lib/validations/admin";
import * as adminResumesService from "@/server/services/admin-resumes.service";

export type AdminActionResult = { success: true } | { success: false; messageKey: string };

/** Updates a resume's title/status. Admin-only, re-validated server-side. */
export async function updateResumeAsAdminAction(input: unknown): Promise<AdminActionResult> {
  const session = await requireAdmin();
  const parsed = updateResumeAsAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "admin.errors.invalidInput" };
  }

  try {
    await adminResumesService.updateResumeAsAdmin(session.sub, parsed.data.resumeId, {
      title: parsed.data.title,
      status: parsed.data.status,
    });
    return { success: true };
  } catch (error) {
    logger.error("admin-update-resume-failed", { error: error instanceof Error ? error.message : String(error) });
    return { success: false, messageKey: "admin.errors.actionFailed" };
  }
}

/** Soft-deletes one resume. Requires the admin to type the confirmation word. */
export async function deleteResumeAsAdminAction(input: unknown): Promise<AdminActionResult> {
  const session = await requireAdmin();
  const parsed = deleteResumeAsAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "admin.errors.confirmationMismatch" };
  }

  await adminResumesService.deleteResumeAsAdmin(session.sub, parsed.data.resumeId);
  return { success: true };
}

/** Soft-deletes multiple resumes at once. Requires the admin to type the confirmation word. */
export async function bulkDeleteResumesAction(input: unknown): Promise<AdminActionResult> {
  const session = await requireAdmin();
  const parsed = bulkDeleteResumesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "admin.errors.confirmationMismatch" };
  }

  await adminResumesService.bulkDeleteResumesAsAdmin(session.sub, parsed.data.resumeIds);
  return { success: true };
}
