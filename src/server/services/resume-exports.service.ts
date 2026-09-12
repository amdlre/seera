import type { ResumeExport } from "@/db/schema";
import { AppError, ok, type Result } from "@/lib/errors";
import { insertExport } from "@/server/repositories/exports.repository";
import { updateResume } from "@/server/repositories/resumes.repository";
import { loadResumeForOwner } from "./resume.service";

type RecordExportInput = {
  resumeId: string;
  userId: string;
  language: "ar" | "en";
  method: "print" | "pdf" | "docx";
  ip: string | null;
  userAgent: string | null;
  fileKey?: string;
};

/**
 * Logs a print/export event and marks the resume "completed" on its first
 * successful export, per PROJECT-BRIEF §5.5.
 */
export async function recordExport(
  input: RecordExportInput,
): Promise<Result<ResumeExport, AppError>> {
  const resumeResult = await loadResumeForOwner(input.resumeId, input.userId);
  if (!resumeResult.ok) {
    return resumeResult;
  }

  const exportRow = await insertExport({
    resumeId: input.resumeId,
    userId: input.userId,
    language: input.language,
    method: input.method,
    atsScoreAtExport: resumeResult.value.atsScore,
    ip: input.ip,
    userAgent: input.userAgent,
    fileKey: input.fileKey,
  });

  if (resumeResult.value.status === "draft") {
    await updateResume(input.resumeId, { status: "completed", completedAt: new Date() });
  }

  return ok(exportRow);
}
