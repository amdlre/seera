import { boolean, index, integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { idColumn } from "./columns.helpers";
import { resumes } from "./resumes";

export const resumeSectionTypeEnum = pgEnum("resume_section_type", [
  "personal",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "languages",
  "projects",
  "custom",
]);

export const resumeSectionLayoutEnum = pgEnum("resume_section_layout", [
  "bullets",
  "dated_entries",
  "paragraph",
]);

export const resumeSections = pgTable(
  "resume_sections",
  {
    id: idColumn(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id),
    type: resumeSectionTypeEnum("type").notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    layout: resumeSectionLayoutEnum("layout").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    isCustom: boolean("is_custom").notNull().default(false),
  },
  (table) => [
    index("resume_sections_resume_id_idx").on(table.resumeId),
    index("resume_sections_sort_order_idx").on(table.resumeId, table.sortOrder),
  ],
);

export type ResumeSection = typeof resumeSections.$inferSelect;
export type NewResumeSection = typeof resumeSections.$inferInsert;
export type ResumeSectionType = (typeof resumeSectionTypeEnum.enumValues)[number];
