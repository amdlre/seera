import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { citext, deletedAtColumn, idColumn, timestamps } from "./columns.helpers";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userLocaleEnum = pgEnum("user_locale", ["ar", "en"]);

export const users = pgTable(
  "users",
  {
    id: idColumn(),
    email: citext("email").notNull().unique(),
    fullName: text("full_name").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    locale: userLocaleEnum("locale").notNull().default("ar"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
    deletedAt: deletedAtColumn,
  },
  (table) => [index("users_role_idx").on(table.role)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
