import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { type NewResumeItem, type ResumeItem, resumeItems } from "@/db/schema";

/** Lists a section's items in display order. */
export async function listItemsBySection(sectionId: string): Promise<ResumeItem[]> {
  return db
    .select()
    .from(resumeItems)
    .where(eq(resumeItems.sectionId, sectionId))
    .orderBy(asc(resumeItems.sortOrder));
}

/** Finds a single item by id, or null if it doesn't exist. */
export async function findResumeItemById(itemId: string): Promise<ResumeItem | null> {
  const [item] = await db.select().from(resumeItems).where(eq(resumeItems.id, itemId)).limit(1);
  return item ?? null;
}

/** Inserts a new item under a section and returns the created record. */
export async function insertResumeItem(values: NewResumeItem): Promise<ResumeItem> {
  const [item] = await db.insert(resumeItems).values(values).returning();
  return item;
}

/** Replaces a single-item section's data (e.g. personal info, summary paragraph). */
export async function updateResumeItemData(
  itemId: string,
  data: ResumeItem["data"],
): Promise<ResumeItem> {
  const [item] = await db
    .update(resumeItems)
    .set({ data })
    .where(eq(resumeItems.id, itemId))
    .returning();

  return item;
}

/** Deletes a single item (e.g. removing one experience entry). */
export async function deleteResumeItem(itemId: string): Promise<void> {
  await db.delete(resumeItems).where(eq(resumeItems.id, itemId));
}

/** Deletes every item under a section, used before deleting the section itself. */
export async function deleteItemsBySection(sectionId: string): Promise<void> {
  await db.delete(resumeItems).where(eq(resumeItems.sectionId, sectionId));
}

/** Persists a new sort order for a section's items after a drag-and-drop reorder. */
export async function reorderResumeItems(orderedItemIds: string[]): Promise<void> {
  await Promise.all(
    orderedItemIds.map((itemId, index) =>
      db.update(resumeItems).set({ sortOrder: index }).where(eq(resumeItems.id, itemId)),
    ),
  );
}
