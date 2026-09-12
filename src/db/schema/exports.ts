import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { idColumn } from "./columns.helpers";
import { resumes } from "./resumes";
import { users } from "./users";

export const exportLanguageEnum = pgEnum("export_language", ["ar", "en"]);
export const exportMethodEnum = pgEnum("export_method", ["print", "pdf", "docx"]);

export const exports = pgTable(
  "exports",
  {
    id: idColumn(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    language: exportLanguageEnum("language").notNull(),
    method: exportMethodEnum("method").notNull(),
    atsScoreAtExport: integer("ats_score_at_export").notNull(),
    fileKey: text("file_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("exports_resume_id_idx").on(table.resumeId),
    index("exports_user_id_idx").on(table.userId),
    index("exports_language_idx").on(table.language),
    index("exports_created_at_idx").on(table.createdAt),
  ],
);

export type ResumeExport = typeof exports.$inferSelect;
export type NewResumeExport = typeof exports.$inferInsert;
