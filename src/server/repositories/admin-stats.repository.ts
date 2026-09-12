import { and, eq, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { exports, resumes, users } from "@/db/schema";

export type DailyCount = { date: string; count: number };

export async function countActiveUsers(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(isNull(users.deletedAt));
  return row?.count ?? 0;
}

export async function countActiveResumes(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(resumes)
    .where(isNull(resumes.deletedAt));
  return row?.count ?? 0;
}

export async function countCompletedResumes(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(resumes)
    .where(and(isNull(resumes.deletedAt), eq(resumes.status, "completed")));
  return row?.count ?? 0;
}

export async function countExportsByLanguage(): Promise<{ ar: number; en: number }> {
  const rows = await db
    .select({ language: exports.language, count: sql<number>`count(*)::int` })
    .from(exports)
    .groupBy(exports.language);

  const result = { ar: 0, en: 0 };
  for (const row of rows) {
    result[row.language] = row.count;
  }
  return result;
}

export async function averageAtsScore(): Promise<number> {
  const [row] = await db
    .select({ average: sql<number>`coalesce(avg(${resumes.atsScore}), 0)::int` })
    .from(resumes)
    .where(isNull(resumes.deletedAt));
  return row?.average ?? 0;
}

export async function countNewUsersSince(since: Date): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(isNull(users.deletedAt), gte(users.createdAt, since)));
  return row?.count ?? 0;
}

export async function registrationsTimeSeries(since: Date): Promise<DailyCount[]> {
  const rows = await db
    .select({
      date: sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .where(and(isNull(users.deletedAt), gte(users.createdAt, since)))
    .groupBy(sql`1`)
    .orderBy(sql`1`);
  return rows;
}

export async function exportsTimeSeries(since: Date): Promise<DailyCount[]> {
  const rows = await db
    .select({
      date: sql<string>`to_char(${exports.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(exports)
    .where(gte(exports.createdAt, since))
    .groupBy(sql`1`)
    .orderBy(sql`1`);
  return rows;
}

export type FunnelCounts = {
  registered: number;
  createdResume: number;
  completed: number;
  exported: number;
};

export async function funnelCounts(since: Date): Promise<FunnelCounts> {
  const [registeredRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(isNull(users.deletedAt), gte(users.createdAt, since)));

  const [createdResumeRow] = await db
    .select({ count: sql<number>`count(distinct ${resumes.userId})::int` })
    .from(resumes)
    .where(and(isNull(resumes.deletedAt), gte(resumes.createdAt, since)));

  const [completedRow] = await db
    .select({ count: sql<number>`count(distinct ${resumes.userId})::int` })
    .from(resumes)
    .where(
      and(isNull(resumes.deletedAt), eq(resumes.status, "completed"), gte(resumes.createdAt, since)),
    );

  const [exportedRow] = await db
    .select({ count: sql<number>`count(distinct ${exports.userId})::int` })
    .from(exports)
    .where(gte(exports.createdAt, since));

  return {
    registered: registeredRow?.count ?? 0,
    createdResume: createdResumeRow?.count ?? 0,
    completed: completedRow?.count ?? 0,
    exported: exportedRow?.count ?? 0,
  };
}
