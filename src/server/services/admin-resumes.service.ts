import {
  type AdminResumeFilters,
  type AdminResumeRow,
  type AdminResumesSummary,
  getResumesSummary,
  listResumesForAdmin,
  softDeleteResume,
  softDeleteResumes,
} from "@/server/repositories/admin-resumes.repository";
import { updateResume } from "@/server/repositories/resumes.repository";
import { logAdminAction } from "./audit-log.service";

export async function listResumes(
  filters: AdminResumeFilters,
): Promise<{ rows: AdminResumeRow[]; total: number }> {
  return listResumesForAdmin(filters);
}

/** Updates a resume's title/status (admin action), logging the change. */
export async function updateResumeAsAdmin(
  adminUserId: string,
  resumeId: string,
  changes: { title?: string; status?: "draft" | "completed" },
): Promise<void> {
  await updateResume(resumeId, changes);
  await logAdminAction(adminUserId, "resume.update", "resume", resumeId, changes);
}

/** Soft-deletes one resume (admin action), logging the change. */
export async function deleteResumeAsAdmin(adminUserId: string, resumeId: string): Promise<void> {
  await softDeleteResume(resumeId);
  await logAdminAction(adminUserId, "resume.delete", "resume", resumeId);
}

/** Soft-deletes multiple resumes at once (bulk admin action), logging each. */
export async function bulkDeleteResumesAsAdmin(
  adminUserId: string,
  resumeIds: string[],
): Promise<void> {
  await softDeleteResumes(resumeIds);
  await Promise.all(
    resumeIds.map((resumeId) =>
      logAdminAction(adminUserId, "resume.bulk_delete", "resume", resumeId),
    ),
  );
}

/** Summary counts for the resumes page header cards. */
export async function getResumesOverview(): Promise<AdminResumesSummary> {
  return getResumesSummary();
}
