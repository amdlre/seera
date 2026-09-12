import { and, asc, desc, eq, exists, gte, ilike, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { exports, resumes, users } from "@/db/schema";

export type AdminResumeSortColumn = "updatedAt" | "title" | "atsScore" | "status";

export type AdminResumeFilters = {
  search?: string;
  status?: "draft" | "completed";
  dateFrom?: Date;
  dateTo?: Date;
  atsMin?: number;
  atsMax?: number;
  exportLanguage?: "ar" | "en";
  sortBy?: AdminResumeSortColumn;
  sortDir?: "asc" | "desc";
  page: number;
  pageSize: number;
};

export type AdminResumeRow = {
  id: string;
  title: string;
  status: "draft" | "completed";
  atsScore: number;
  updatedAt: Date;
  userId: string;
  userFullName: string;
  userEmail: string;
  exportsAr: number;
  exportsEn: number;
};

const SORT_COLUMNS = {
  updatedAt: resumes.updatedAt,
  title: resumes.title,
  atsScore: resumes.atsScore,
  status: resumes.status,
};

function buildWhereClause(filters: AdminResumeFilters): SQL | undefined {
  const conditions: SQL[] = [isNull(resumes.deletedAt) as SQL];

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(resumes.title, pattern),
        ilike(users.fullName, pattern),
        ilike(users.email, pattern),
      ) as SQL,
    );
  }
  if (filters.status) {
    conditions.push(eq(resumes.status, filters.status));
  }
  if (filters.dateFrom) {
    conditions.push(gte(resumes.updatedAt, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(resumes.updatedAt, filters.dateTo));
  }
  if (filters.atsMin !== undefined) {
    conditions.push(gte(resumes.atsScore, filters.atsMin));
  }
  if (filters.atsMax !== undefined) {
    conditions.push(lte(resumes.atsScore, filters.atsMax));
  }
  if (filters.exportLanguage) {
    conditions.push(
      exists(
        db
          .select({ id: exports.id })
          .from(exports)
          .where(and(eq(exports.resumeId, resumes.id), eq(exports.language, filters.exportLanguage))),
      ),
    );
  }

  return and(...conditions);
}

/**
 * Lists resumes for the admin table with search, filters, sort, and true
 * server-side pagination (LIMIT/OFFSET at the DB level) — PROJECT-BRIEF §7.2.
 */
export async function listResumesForAdmin(
  filters: AdminResumeFilters,
): Promise<{ rows: AdminResumeRow[]; total: number }> {
  const where = buildWhereClause(filters);
  const sortColumn = SORT_COLUMNS[filters.sortBy ?? "updatedAt"];
  const orderFn = filters.sortDir === "asc" ? asc : desc;

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(resumes)
    .innerJoin(users, eq(resumes.userId, users.id))
    .where(where);

  const pageRows = await db
    .select({
      id: resumes.id,
      title: resumes.title,
      status: resumes.status,
      atsScore: resumes.atsScore,
      updatedAt: resumes.updatedAt,
      userId: resumes.userId,
      userFullName: users.fullName,
      userEmail: users.email,
    })
    .from(resumes)
    .innerJoin(users, eq(resumes.userId, users.id))
    .where(where)
    .orderBy(orderFn(sortColumn))
    .limit(filters.pageSize)
    .offset((filters.page - 1) * filters.pageSize);

  const exportCounts = pageRows.length
    ? await db
        .select({
          resumeId: exports.resumeId,
          language: exports.language,
          count: sql<number>`count(*)::int`,
        })
        .from(exports)
        .where(inArray(exports.resumeId, pageRows.map((row) => row.id)))
        .groupBy(exports.resumeId, exports.language)
    : [];

  const countsByResume = new Map<string, { ar: number; en: number }>();
  for (const row of exportCounts) {
    const entry = countsByResume.get(row.resumeId) ?? { ar: 0, en: 0 };
    entry[row.language] = row.count;
    countsByResume.set(row.resumeId, entry);
  }

  return {
    total,
    rows: pageRows.map((row) => ({
      ...row,
      exportsAr: countsByResume.get(row.id)?.ar ?? 0,
      exportsEn: countsByResume.get(row.id)?.en ?? 0,
    })),
  };
}

/** Soft-deletes a resume (admin action). */
export async function softDeleteResume(resumeId: string): Promise<void> {
  await db.update(resumes).set({ deletedAt: new Date() }).where(eq(resumes.id, resumeId));
}

/** Soft-deletes multiple resumes at once (bulk admin action). */
export async function softDeleteResumes(resumeIds: string[]): Promise<void> {
  if (resumeIds.length === 0) return;
  await db.update(resumes).set({ deletedAt: new Date() }).where(inArray(resumes.id, resumeIds));
}

export type AdminResumesSummary = { total: number; draft: number; completed: number };

/** Totals for the resumes page header cards: overall, drafts, and completed. */
export async function getResumesSummary(): Promise<AdminResumesSummary> {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${resumes.status} = 'completed')::int`,
    })
    .from(resumes)
    .where(isNull(resumes.deletedAt));

  return { total: row.total, draft: row.total - row.completed, completed: row.completed };
}
