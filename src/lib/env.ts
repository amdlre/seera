import { z } from "zod";
import { MAIL_PROVIDERS } from "@/lib/constants/mail";

/**
 * Validates required environment variables at boot. Mail settings are
 * checked per provider: SMTP needs a host/port, SNDR needs an API key.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters" }),
    MAIL_PROVIDER: z.enum(MAIL_PROVIDERS).default("smtp"),
    MAIL_FROM: z.string().min(1),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SNDR_API_KEY: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const missing =
      value.MAIL_PROVIDER === "smtp"
        ? (["SMTP_HOST", "SMTP_PORT"] as const).filter((key) => !value[key])
        : (["SNDR_API_KEY"] as const).filter((key) => !value[key]);
    for (const key of missing) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} is required when MAIL_PROVIDER=${value.MAIL_PROVIDER}`,
      });
    }
  });

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  MAIL_PROVIDER: process.env.MAIL_PROVIDER || undefined,
  MAIL_FROM: process.env.MAIL_FROM,
  SMTP_HOST: process.env.SMTP_HOST || undefined,
  SMTP_PORT: process.env.SMTP_PORT || undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SNDR_API_KEY: process.env.SNDR_API_KEY || undefined,
});
