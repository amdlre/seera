import { customType, timestamp, uuid } from "drizzle-orm/pg-core";

/** Case-insensitive text column (requires the `citext` Postgres extension). */
export const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

/** Standard primary key column shared by every table. */
export function idColumn() {
  return uuid("id").primaryKey().defaultRandom();
}

/** `createdAt` / `updatedAt` timestamp pair required on every table. */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/** Soft-delete marker for tables that must never be hard-deleted. */
export const deletedAtColumn = timestamp("deleted_at", { withTimezone: true });
