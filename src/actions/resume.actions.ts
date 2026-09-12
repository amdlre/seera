"use server";

import { requireAuth } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { personalInfoDraftSchema } from "@/lib/validations/resume/personal-info";
import { summaryDraftSchema } from "@/lib/validations/resume/summary";
import * as resumeService from "@/server/services/resume.service";

export type ResumeActionResult = { success: true } | { success: false; messageKey: string };

/** Creates a new resume for the current user and returns its id. */
export async function createResumeAction(): Promise<{ resumeId: string }> {
  const session = await requireAuth();
  const resume = await resumeService.createResumeForUser(session.sub, session.email);
  return { resumeId: resume.id };
}

/** Validates and persists a draft of the personal-info step (autosave). */
export async function savePersonalInfoAction(
  resumeId: string,
  input: unknown,
): Promise<ResumeActionResult> {
  const session = await requireAuth();
  const parsed = personalInfoDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "builder.errors.invalidDraft" };
  }

  const result = await resumeService.savePersonalInfoDraft(resumeId, session.sub, parsed.data);
  if (!result.ok) {
    logger.warn("save-personal-info-failed", { resumeId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}

/** Validates and persists a draft of the professional-summary step (autosave). */
export async function saveSummaryAction(
  resumeId: string,
  input: unknown,
): Promise<ResumeActionResult> {
  const session = await requireAuth();
  const parsed = summaryDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "builder.errors.invalidDraft" };
  }

  const result = await resumeService.saveSummaryDraft(resumeId, session.sub, parsed.data);
  if (!result.ok) {
    logger.warn("save-summary-failed", { resumeId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}
