"use server";

import { headers } from "next/headers";
import type { AppLocale } from "@/i18n/routing";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { resolveAuthErrorMessageKey } from "@/lib/auth/error-messages";
import { logger } from "@/lib/logger";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/validations/auth";
import * as authService from "@/server/services/auth.service";

export type AuthActionResult = { success: true } | { success: false; messageKey: string };

export type VerifyOtpActionResult =
  | { success: true; role: "user" | "admin" }
  | { success: false; messageKey: string };

function firstClientIp(forwardedFor: string | null): string | null {
  return forwardedFor?.split(",")[0]?.trim() ?? null;
}

/**
 * Validates the email, enforces the OTP rate limit, and emails a fresh code.
 */
export async function requestOtpAction(
  input: unknown,
  locale: AppLocale,
): Promise<AuthActionResult> {
  const parsed = requestOtpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "validation.required" };
  }

  const headerList = await headers();
  const ip = firstClientIp(headerList.get("x-forwarded-for"));

  const result = await authService.requestOtp(parsed.data.email, ip, locale);
  if (!result.ok) {
    logger.warn("otp-request-failed", { email: parsed.data.email, code: result.error.code });
    return { success: false, messageKey: resolveAuthErrorMessageKey(result.error) };
  }

  return { success: true };
}

/**
 * Validates the OTP code, logs the user in on success, and sets the session cookie.
 */
export async function verifyOtpAction(
  input: unknown,
  locale: AppLocale,
): Promise<VerifyOtpActionResult> {
  const parsed = verifyOtpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, messageKey: "validation.required" };
  }

  const result = await authService.verifyOtpAndLogin(parsed.data.email, parsed.data.code, locale);
  if (!result.ok) {
    logger.warn("otp-verify-failed", { email: parsed.data.email, code: result.error.code });
    return { success: false, messageKey: resolveAuthErrorMessageKey(result.error) };
  }

  await setSessionCookie(result.value.token);
  return { success: true, role: result.value.role };
}

/** Clears the session cookie, logging the current user out. */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
}
