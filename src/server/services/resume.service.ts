import type { Resume, ResumeItem, ResumeSection } from "@/db/schema";
import { DEFAULT_RESUME_SECTIONS } from "@/lib/constants/resume-sections";
import { AppError, err, ForbiddenError, NotFoundError, ok, type Result } from "@/lib/errors";
import type { PersonalInfoDraftInput } from "@/lib/validations/resume/personal-info";
import type { SummaryDraftInput } from "@/lib/validations/resume/summary";
import {
  insertResumeItem,
  listItemsBySection,
  updateResumeItemData,
} from "@/server/repositories/resume-items.repository";
import {
  findSectionByType,
  insertDefaultSections,
  listSectionsByResume,
} from "@/server/repositories/resume-sections.repository";
import {
  findResumeById,
  insertResume,
  listResumesByUser,
  updateResume,
} from "@/server/repositories/resumes.repository";

export type ResumeWithSections = {
  resume: Resume;
  sections: ResumeSection[];
  personalInfo: PersonalInfoDraftInput;
  summary: SummaryDraftInput;
  itemsBySectionId: Record<string, ResumeItem[]>;
};

function buildDefaultResumeTitle(fullName: string): string {
  return `سِيرة - ${fullName}`;
}

/** Lists every resume the given user owns, for the dashboard. */
export async function listMyResumes(userId: string): Promise<Resume[]> {
  return listResumesByUser(userId);
}

/**
 * Creates a new resume for a user, seeded with the seven standard sections.
 * The title defaults to "سِيرة - {fullName}" using the account's name.
 */
export async function createResumeForUser(userId: string, fullName: string): Promise<Resume> {
  const resume = await insertResume({
    userId,
    title: buildDefaultResumeTitle(fullName),
    status: "draft",
    atsScore: 0,
    font: "arial",
  });

  await insertDefaultSections(
    DEFAULT_RESUME_SECTIONS.map((section) => ({ ...section, resumeId: resume.id })),
  );

  return resume;
}

/** Verifies a resume exists and belongs to the given user. */
export async function loadResumeForOwner(
  resumeId: string,
  userId: string,
): Promise<Result<Resume, AppError>> {
  const resume = await findResumeById(resumeId);
  if (!resume) {
    return { ok: false, error: new NotFoundError("Resume not found") };
  }
  if (resume.userId !== userId) {
    return { ok: false, error: new ForbiddenError("You do not own this resume") };
  }
  return ok(resume);
}

/** Loads every section, its items, and the personal-info/summary shortcuts for an already-verified resume. */
async function loadResumeContent(resume: Resume): Promise<ResumeWithSections> {
  const sections = await listSectionsByResume(resume.id);
  const itemsPerSection = await Promise.all(
    sections.map((section) => listItemsBySection(section.id)),
  );

  const itemsBySectionId: Record<string, ResumeItem[]> = {};
  sections.forEach((section, index) => {
    itemsBySectionId[section.id] = itemsPerSection[index];
  });

  const personalSection = sections.find((section) => section.type === "personal") ?? null;
  const summarySection = sections.find((section) => section.type === "summary") ?? null;

  return {
    resume,
    sections,
    personalInfo: personalSection
      ? ((itemsBySectionId[personalSection.id][0]?.data as PersonalInfoDraftInput) ?? {})
      : {},
    summary: summarySection
      ? ((itemsBySectionId[summarySection.id][0]?.data as SummaryDraftInput) ?? {})
      : {},
    itemsBySectionId,
  };
}

/**
 * Loads a resume with every section and its items, verifying the requesting
 * user owns it. `personalInfo`/`summary` are convenience shortcuts into
 * `itemsBySectionId` for the two single-item paragraph sections.
 */
export async function getResumeForBuilder(
  resumeId: string,
  userId: string,
): Promise<Result<ResumeWithSections, AppError>> {
  const resumeResult = await loadResumeForOwner(resumeId, userId);
  if (!resumeResult.ok) {
    return resumeResult;
  }

  return ok(await loadResumeContent(resumeResult.value));
}

/**
 * Loads a resume for the `/print` page: the owner can always view it, and an
 * admin can view any resume (per PROJECT-BRIEF §7.2 — admin resume preview).
 */
export async function getResumeForPrint(
  resumeId: string,
  userId: string,
  isAdmin: boolean,
): Promise<Result<ResumeWithSections, AppError>> {
  const resume = await findResumeById(resumeId);
  if (!resume) {
    return err(new NotFoundError("Resume not found"));
  }
  if (resume.userId !== userId && !isAdmin) {
    return err(new ForbiddenError("You do not own this resume"));
  }

  return ok(await loadResumeContent(resume));
}

async function upsertSingleSectionItem(
  resumeId: string,
  sectionType: "personal" | "summary",
  data: Record<string, unknown>,
): Promise<void> {
  const section = await findSectionByType(resumeId, sectionType);
  if (!section) {
    throw new NotFoundError(`Resume is missing its ${sectionType} section`);
  }

  const existingItems = await listItemsBySection(section.id);

  if (existingItems.length > 0) {
    await updateResumeItemData(existingItems[0].id, data);
  } else {
    await insertResumeItem({ sectionId: section.id, sortOrder: 0, data });
  }
}

/**
 * Saves a draft of the personal-info step: upserts the section item and
 * mirrors the target job title onto the resume's top-level columns.
 */
export async function savePersonalInfoDraft(
  resumeId: string,
  userId: string,
  data: PersonalInfoDraftInput,
): Promise<Result<true, AppError>> {
  const resumeResult = await loadResumeForOwner(resumeId, userId);
  if (!resumeResult.ok) {
    return resumeResult;
  }

  await upsertSingleSectionItem(resumeId, "personal", data);

  const titleSource = data.fullNameAr || data.fullNameEn;
  await updateResume(resumeId, {
    targetJobTitleAr: data.targetJobTitleAr ?? resumeResult.value.targetJobTitleAr,
    targetJobTitleEn: data.targetJobTitleEn ?? resumeResult.value.targetJobTitleEn,
    ...(titleSource ? { title: buildDefaultResumeTitle(titleSource) } : {}),
  });

  return ok(true as const);
}

/** Saves a draft of the professional-summary step. */
export async function saveSummaryDraft(
  resumeId: string,
  userId: string,
  data: SummaryDraftInput,
): Promise<Result<true, AppError>> {
  const resumeResult = await loadResumeForOwner(resumeId, userId);
  if (!resumeResult.ok) {
    return resumeResult;
  }

  await upsertSingleSectionItem(resumeId, "summary", data);
  return ok(true as const);
}
