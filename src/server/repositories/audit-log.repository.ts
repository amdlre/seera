import { desc } from "drizzle-orm";
import { db } from "@/db";
import { type AuditLogEntry, auditLog, type NewAuditLogEntry } from "@/db/schema";

/** Records one admin action, per PROJECT-BRIEF §7.2. */
export async function insertAuditLogEntry(values: NewAuditLogEntry): Promise<AuditLogEntry> {
  const [row] = await db.insert(auditLog).values(values).returning();
  return row;
}

/** Lists the most recent admin actions. */
export async function listRecentAuditLogEntries(limit: number): Promise<AuditLogEntry[]> {
  return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}
