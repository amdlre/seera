import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  type NewResumeSection,
  type ResumeSection,
  type ResumeSectionType,
  resumeSections,
} from "@/db/schema";

/** Lists a resume's sections in display order. */
export async function listSectionsByResume(resumeId: string): Promise<ResumeSection[]> {
  return db
    .select()
    .from(resumeSections)
    .where(eq(resumeSections.resumeId, resumeId))
    .orderBy(asc(resumeSections.sortOrder));
}

/** Finds one section of a resume by its type (e.g. "personal", "summary"). */
export async function findSectionByType(
  resumeId: string,
  type: ResumeSectionType,
): Promise<ResumeSection | null> {
  const [section] = await db
    .select()
    .from(resumeSections)
    .where(and(eq(resumeSections.resumeId, resumeId), eq(resumeSections.type, type)))
    .limit(1);

  return section ?? null;
}

/** Bulk-inserts the default sections for a newly created resume. */
export async function insertDefaultSections(
  values: NewResumeSection[],
): Promise<ResumeSection[]> {
  return db.insert(resumeSections).values(values).returning();
}

/** Finds a single section by id, or null if it doesn't exist. */
export async function findSectionById(sectionId: string): Promise<ResumeSection | null> {
  const [section] = await db
    .select()
    .from(resumeSections)
    .where(eq(resumeSections.id, sectionId))
    .limit(1);

  return section ?? null;
}

/** Inserts a new custom section and returns the created record. */
export async function insertSection(values: NewResumeSection): Promise<ResumeSection> {
  const [section] = await db.insert(resumeSections).values(values).returning();
  return section;
}

/** Toggles a section's visibility on the resume. */
export async function updateSectionVisibility(
  sectionId: string,
  isVisible: boolean,
): Promise<void> {
  await db.update(resumeSections).set({ isVisible }).where(eq(resumeSections.id, sectionId));
}

/** Deletes a section (custom sections only — enforced by the service layer). */
export async function deleteSection(sectionId: string): Promise<void> {
  await db.delete(resumeSections).where(eq(resumeSections.id, sectionId));
}

/**
 * Persists a new sort order for a resume's reorderable sections. "personal"
 * always stays pinned at position 0 and is excluded from this list.
 */
export async function reorderSections(orderedSectionIds: string[]): Promise<void> {
  await Promise.all(
    orderedSectionIds.map((sectionId, index) =>
      db
        .update(resumeSections)
        .set({ sortOrder: index + 1 })
        .where(eq(resumeSections.id, sectionId)),
    ),
  );
}
