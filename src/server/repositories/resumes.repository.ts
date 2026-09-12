import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { type NewResume, type Resume, resumes } from "@/db/schema";

/** Lists a user's non-deleted resumes, most recently updated first. */
export async function listResumesByUser(userId: string): Promise<Resume[]> {
  return db
    .select()
    .from(resumes)
    .where(and(eq(resumes.userId, userId), isNull(resumes.deletedAt)))
    .orderBy(desc(resumes.updatedAt));
}

/** Finds a single non-deleted resume by id, regardless of owner. */
export async function findResumeById(resumeId: string): Promise<Resume | null> {
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), isNull(resumes.deletedAt)))
    .limit(1);

  return resume ?? null;
}

/** Inserts a new resume row and returns the created record. */
export async function insertResume(values: NewResume): Promise<Resume> {
  const [resume] = await db.insert(resumes).values(values).returning();
  return resume;
}

/** Patches top-level resume fields (title, target job title, font, status...). */
export async function updateResume(
  resumeId: string,
  values: Partial<NewResume>,
): Promise<Resume> {
  const [resume] = await db
    .update(resumes)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(resumes.id, resumeId))
    .returning();

  return resume;
}
