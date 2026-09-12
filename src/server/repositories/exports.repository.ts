import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { type NewResumeExport, type ResumeExport, exports } from "@/db/schema";

/** Records one export/print event. Used for the admin dashboard's export counters. */
export async function insertExport(values: NewResumeExport): Promise<ResumeExport> {
  const [row] = await db.insert(exports).values(values).returning();
  return row;
}

/** Counts a user's PDF exports since a point in time, to enforce the PDF rate limit. */
export async function countRecentPdfExports(userId: string, since: Date): Promise<number> {
  const rows = await db
    .select({ id: exports.id })
    .from(exports)
    .where(and(eq(exports.userId, userId), eq(exports.method, "pdf"), gte(exports.createdAt, since)));

  return rows.length;
}
