import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { deletedAtColumn, idColumn, timestamps } from "./columns.helpers";
import { users } from "./users";

export const resumeStatusEnum = pgEnum("resume_status", ["draft", "completed"]);
export const resumeFontEnum = pgEnum("resume_font", ["arial", "calibri", "times"]);

export const resumes = pgTable(
  "resumes",
  {
    id: idColumn(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    targetJobTitleAr: text("target_job_title_ar"),
    targetJobTitleEn: text("target_job_title_en"),
    status: resumeStatusEnum("status").notNull().default("draft"),
    atsScore: integer("ats_score").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    font: resumeFontEnum("font").notNull().default("arial"),
    ...timestamps,
    deletedAt: deletedAtColumn,
  },
  (table) => [
    index("resumes_user_id_idx").on(table.userId),
    index("resumes_status_idx").on(table.status),
    index("resumes_ats_score_idx").on(table.atsScore),
  ],
);

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
