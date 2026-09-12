import { index, integer, jsonb, pgTable, uuid } from "drizzle-orm/pg-core";
import { idColumn } from "./columns.helpers";
import { resumeSections } from "./resume-sections";

export const resumeItems = pgTable(
  "resume_items",
  {
    id: idColumn(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => resumeSections.id),
    sortOrder: integer("sort_order").notNull().default(0),
    /** Shape validated by a Zod discriminated union keyed on the parent section's type. */
    data: jsonb("data").notNull(),
  },
  (table) => [
    index("resume_items_section_id_idx").on(table.sectionId),
    index("resume_items_sort_order_idx").on(table.sectionId, table.sortOrder),
  ],
);

export type ResumeItem = typeof resumeItems.$inferSelect;
export type NewResumeItem = typeof resumeItems.$inferInsert;
