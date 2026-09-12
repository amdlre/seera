import type { AppError } from "@/lib/errors";

const AUTH_ERROR_MESSAGE_KEYS: Record<string, string> = {
  RATE_LIMITED: "auth.errors.rateLimited",
  OTP_NOT_FOUND: "auth.errors.invalidOrExpired",
  OTP_EXPIRED: "auth.errors.invalidOrExpired",
  OTP_MAX_ATTEMPTS: "auth.errors.maxAttempts",
  OTP_INVALID_CODE: "auth.errors.invalidCode",
  ACCOUNT_SUSPENDED: "auth.errors.accountSuspended",
};

/** Maps a service-layer AppError code to a translation key safe to show the user. */
export function resolveAuthErrorMessageKey(error: AppError): string {
  return AUTH_ERROR_MESSAGE_KEYS[error.code] ?? "auth.errors.generic";
}
