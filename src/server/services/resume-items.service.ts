import type { ResumeItem, ResumeSection } from "@/db/schema";
import { AppError, err, ForbiddenError, NotFoundError, ok, type Result } from "@/lib/errors";
import {
  deleteResumeItem,
  findResumeItemById,
  insertResumeItem,
  listItemsBySection,
  reorderResumeItems,
  updateResumeItemData,
} from "@/server/repositories/resume-items.repository";
import { findSectionById } from "@/server/repositories/resume-sections.repository";
import { findResumeById } from "@/server/repositories/resumes.repository";

/**
 * Verifies a section exists and its parent resume belongs to the user.
 * Every multi-item operation below is keyed by section/item id and re-checks
 * ownership through this chain — never trusting a resumeId from the client alone.
 */
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

async function assertItemOwnership(
  itemId: string,
  userId: string,
): Promise<Result<ResumeItem, AppError>> {
  const item = await findResumeItemById(itemId);
  if (!item) {
    return err(new NotFoundError("Item not found"));
  }

  const sectionResult = await assertSectionOwnership(item.sectionId, userId);
  if (!sectionResult.ok) {
    return sectionResult;
  }

  return ok(item);
}

/** Appends a new item (e.g. a blank experience entry) to the end of a section. */
export async function addResumeItem(
  sectionId: string,
  userId: string,
  defaultData: Record<string, unknown>,
): Promise<Result<ResumeItem, AppError>> {
  const sectionResult = await assertSectionOwnership(sectionId, userId);
  if (!sectionResult.ok) {
    return sectionResult;
  }

  const existingItems = await listItemsBySection(sectionId);
  const item = await insertResumeItem({
    sectionId,
    sortOrder: existingItems.length,
    data: defaultData,
  });

  return ok(item);
}

/** Saves a draft of one item's data (autosave), verifying ownership first. */
export async function saveResumeItemDraft(
  itemId: string,
  userId: string,
  data: Record<string, unknown>,
): Promise<Result<true, AppError>> {
  const itemResult = await assertItemOwnership(itemId, userId);
  if (!itemResult.ok) {
    return itemResult;
  }

  await updateResumeItemData(itemId, data);
  return ok(true as const);
}

/** Deletes a single item (e.g. removing one experience entry). */
export async function deleteResumeItemForUser(
  itemId: string,
  userId: string,
): Promise<Result<true, AppError>> {
  const itemResult = await assertItemOwnership(itemId, userId);
  if (!itemResult.ok) {
    return itemResult;
  }

  await deleteResumeItem(itemId);
  return ok(true as const);
}

/** Persists a new item order for a section after a drag-and-drop reorder. */
export async function reorderResumeItemsForUser(
  sectionId: string,
  userId: string,
  orderedItemIds: string[],
): Promise<Result<true, AppError>> {
  const sectionResult = await assertSectionOwnership(sectionId, userId);
  if (!sectionResult.ok) {
    return sectionResult;
  }

  await reorderResumeItems(orderedItemIds);
  return ok(true as const);
}
