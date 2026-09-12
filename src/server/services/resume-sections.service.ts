import type { ResumeSection } from "@/db/schema";
import { AppError, err, ForbiddenError, NotFoundError, ok, type Result } from "@/lib/errors";
import type { CreateCustomSectionInput } from "@/lib/validations/resume/custom-section";
import { deleteItemsBySection } from "@/server/repositories/resume-items.repository";
import {
  deleteSection,
  findSectionById,
  insertSection,
  listSectionsByResume,
  reorderSections,
  updateSectionVisibility,
} from "@/server/repositories/resume-sections.repository";
import { findResumeById } from "@/server/repositories/resumes.repository";
import { loadResumeForOwner } from "./resume.service";

async function assertSectionOwnership(
  sectionId: string,
  userId: string,
): Promise<Result<ResumeSection, AppError>> {
  const section = await findSectionById(sectionId);
  if (!section) {
    return err(new NotFoundError("Section not found"));
  }

  const resume = await findResumeById(section.resumeId);
  if (!resume || resume.userId !== userId) {
    return err(new ForbiddenError("You do not own this resume"));
  }

  return ok(section);
}

/** Adds a new custom section at the end of the resume. */
export async function createCustomSection(
  resumeId: string,
  userId: string,
  input: CreateCustomSectionInput,
): Promise<Result<ResumeSection, AppError>> {
  const resumeResult = await loadResumeForOwner(resumeId, userId);
  if (!resumeResult.ok) {
    return resumeResult;
  }

  const sections = await listSectionsByResume(resumeId);
  const nextSortOrder = Math.max(...sections.map((section) => section.sortOrder), 0) + 1;

  const section = await insertSection({
    resumeId,
    type: "custom",
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    layout: input.layout,
    sortOrder: nextSortOrder,
    isVisible: true,
    isCustom: true,
  });

  return ok(section);
}

/** Shows or hides a section on the resume (any section type, including standard ones). */
export async function setSectionVisibility(
  sectionId: string,
  userId: string,
  isVisible: boolean,
): Promise<Result<true, AppError>> {
  const sectionResult = await assertSectionOwnership(sectionId, userId);
  if (!sectionResult.ok) {
    return sectionResult;
  }

  await updateSectionVisibility(sectionId, isVisible);
  return ok(true as const);
}

/** Deletes a custom section and its items. Standard sections cannot be deleted. */
export async function deleteCustomSection(
  sectionId: string,
  userId: string,
): Promise<Result<true, AppError>> {
  const sectionResult = await assertSectionOwnership(sectionId, userId);
  if (!sectionResult.ok) {
    return sectionResult;
  }

  if (!sectionResult.value.isCustom) {
    return err(new ForbiddenError("Standard sections cannot be deleted"));
  }

  await deleteItemsBySection(sectionId);
  await deleteSection(sectionId);
  return ok(true as const);
}

/**
 * Persists a new order for the resume's reorderable sections. "personal"
 * always stays pinned first and must be excluded from `orderedSectionIds`.
 */
export async function reorderResumeSections(
  resumeId: string,
  userId: string,
  orderedSectionIds: string[],
): Promise<Result<true, AppError>> {
  const resumeResult = await loadResumeForOwner(resumeId, userId);
  if (!resumeResult.ok) {
    return resumeResult;
  }

  const sections = await listSectionsByResume(resumeId);
  const belongsToResume = orderedSectionIds.every((id) =>
    sections.some((section) => section.id === id && section.type !== "personal"),
  );
  if (!belongsToResume) {
    return err(new ForbiddenError("Section list does not match this resume"));
  }

  await reorderSections(orderedSectionIds);
  return ok(true as const);
}
