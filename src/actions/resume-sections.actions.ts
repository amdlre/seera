"use server";

import { requireAuth } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { createCustomSectionSchema } from "@/lib/validations/resume/custom-section";
import * as sectionsService from "@/server/services/resume-sections.service";

export type SectionActionResult = { success: true } | { success: false; messageKey: string };
export type CreateSectionActionResult =
  | { success: true; sectionId: string }
  | { success: false; messageKey: string };

/** Validates and creates a new custom section on a resume. */
export async function createCustomSectionAction(
  resumeId: string,
  input: unknown,
): Promise<CreateSectionActionResult> {
  const session = await requireAuth();
  const parsed = createCustomSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "builder.errors.invalidDraft" };
  }

  const result = await sectionsService.createCustomSection(resumeId, session.sub, parsed.data);
  if (!result.ok) {
    logger.warn("create-custom-section-failed", { resumeId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true, sectionId: result.value.id };
}

/** Shows or hides a section on the resume. */
export async function setSectionVisibilityAction(
  sectionId: string,
  isVisible: boolean,
): Promise<SectionActionResult> {
  const session = await requireAuth();
  const result = await sectionsService.setSectionVisibility(sectionId, session.sub, isVisible);
  if (!result.ok) {
    logger.warn("set-section-visibility-failed", { sectionId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}

/** Deletes a custom section (standard sections cannot be deleted). */
export async function deleteCustomSectionAction(sectionId: string): Promise<SectionActionResult> {
  const session = await requireAuth();
  const result = await sectionsService.deleteCustomSection(sectionId, session.sub);
  if (!result.ok) {
    logger.warn("delete-custom-section-failed", { sectionId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}

/** Persists a new order for the resume's reorderable sections. */
export async function reorderSectionsAction(
  resumeId: string,
  orderedSectionIds: string[],
): Promise<SectionActionResult> {
  const session = await requireAuth();
  const result = await sectionsService.reorderResumeSections(
    resumeId,
    session.sub,
    orderedSectionIds,
  );
  if (!result.ok) {
    logger.warn("reorder-sections-failed", { resumeId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}
