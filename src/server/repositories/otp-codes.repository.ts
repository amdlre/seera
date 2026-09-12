import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { type NewOtpCode, type OtpCode, otpCodes } from "@/db/schema";

/**
 * Inserts a new OTP code row and returns the created record.
 */
export async function insertOtpCode(values: NewOtpCode): Promise<OtpCode> {
  const [row] = await db.insert(otpCodes).values(values).returning();
  return row;
}

/**
 * Finds the most recent, not-yet-consumed OTP code for an email.
 */
export async function findLatestActiveOtpByEmail(email: string): Promise<OtpCode | null> {
  const [row] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), isNull(otpCodes.consumedAt)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  return row ?? null;
}

/**
 * Increments the failed-attempt counter on an OTP code row.
 */
export async function incrementOtpAttempts(id: string): Promise<void> {
  await db
    .update(otpCodes)
    .set({ attempts: sql`${otpCodes.attempts} + 1` })
    .where(eq(otpCodes.id, id));
}

/**
 * Marks an OTP code as consumed so it cannot be reused.
 */
export async function markOtpConsumed(id: string): Promise<void> {
  await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, id));
}

/**
 * Counts OTP codes requested for an email since a given point in time,
 * used to enforce the OTP request rate limit.
 */
export async function countRecentOtpRequests(email: string, since: Date): Promise<number> {
  const rows = await db
    .select({ id: otpCodes.id })
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), gte(otpCodes.createdAt, since)));

  return rows.length;
}
