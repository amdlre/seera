import { and, asc, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { resumes, users } from "@/db/schema";

export type AdminUserFilters = {
  search?: string;
  role?: "user" | "admin";
  sortDir?: "asc" | "desc";
  page: number;
  pageSize: number;
};

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
  createdAt: Date;
  lastLoginAt: Date | null;
  deletedAt: Date | null;
  resumeCount: number;
};

function buildWhereClause(filters: AdminUserFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(or(ilike(users.fullName, pattern), ilike(users.email, pattern)) as SQL);
  }
  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

/** Lists users for the admin table, with search/role filters and server-side pagination. */
export async function listUsersForAdmin(
  filters: AdminUserFilters,
): Promise<{ rows: AdminUserRow[]; total: number }> {
  const where = buildWhereClause(filters);
  const orderFn = filters.sortDir === "asc" ? asc : desc;

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(users).where(where);

  const resumeCountSubquery = db
    .select({ count: sql<number>`count(*)::int` })
    .from(resumes)
    .where(and(eq(resumes.userId, users.id), isNull(resumes.deletedAt)));

  const pageRows = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      deletedAt: users.deletedAt,
      resumeCount: sql<number>`(${resumeCountSubquery})`,
    })
    .from(users)
    .where(where)
    .orderBy(orderFn(users.createdAt))
    .limit(filters.pageSize)
    .offset((filters.page - 1) * filters.pageSize);

  return { total, rows: pageRows };
}

/** Updates a user's role (admin action). */
export async function updateUserRole(userId: string, role: "user" | "admin"): Promise<void> {
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

/** Disables (soft-deletes) or re-enables a user account. */
export async function setUserDisabled(userId: string, disabled: boolean): Promise<void> {
  await db
    .update(users)
    .set({ deletedAt: disabled ? new Date() : null })
    .where(eq(users.id, userId));
}
