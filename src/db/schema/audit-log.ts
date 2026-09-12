import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { idColumn } from "./columns.helpers";
import { users } from "./users";

/** Records every admin action for accountability, per PROJECT-BRIEF §7.2. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: idColumn(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => users.id),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_log_admin_user_id_idx").on(table.adminUserId),
    index("audit_log_target_idx").on(table.targetType, table.targetId),
    index("audit_log_created_at_idx").on(table.createdAt),
  ],
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
