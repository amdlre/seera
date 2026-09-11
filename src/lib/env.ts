import { z } from "zod";

/**
 * Validates required environment variables at boot. Extended in later phases
 * as DATABASE_URL, JWT_SECRET, S3_*, and SMTP_* become required.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
