"use server";

import { requireAuth } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { loadResumeForOwner } from "@/server/services/resume.service";
import { updateResume } from "@/server/repositories/resumes.repository";

export type UpdateAtsScoreResult = { success: true } | { success: false };

/**
 * Persists the client-computed ATS score onto `resumes.ats_score`, after
 * re-verifying the caller owns the resume.
 */
export async function updateAtsScoreAction(
  resumeId: string,
  score: number,
): Promise<UpdateAtsScoreResult> {
  const session = await requireAuth();
  const resumeResult = await loadResumeForOwner(resumeId, session.sub);
  if (!resumeResult.ok) {
    logger.warn("update-ats-score-failed", { resumeId, code: resumeResult.error.code });
    return { success: false };
  }

  await updateResume(resumeId, { atsScore: Math.max(0, Math.min(100, Math.round(score))) });
  return { success: true };
}
