import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { citext, idColumn } from "./columns.helpers";

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: idColumn(),
    email: citext("email").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    attempts: integer("attempts").notNull().default(0),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("otp_codes_email_idx").on(table.email),
    index("otp_codes_expires_at_idx").on(table.expiresAt),
  ],
);

export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
