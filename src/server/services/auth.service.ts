import type { AppLocale } from "@/i18n/routing";
import { sendOtpEmail } from "@/lib/auth/mailer";
import { generateOtpCode, hashOtpCode, verifyOtpHash } from "@/lib/auth/otp";
import { type SessionRole, signSessionToken } from "@/lib/auth/jwt";
import {
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_REQUEST_LIMIT,
  OTP_REQUEST_WINDOW_MINUTES,
} from "@/lib/constants/auth";
import { AppError, err, ok, type Result } from "@/lib/errors";
import {
  countRecentOtpRequests,
  findLatestActiveOtpByEmail,
  incrementOtpAttempts,
  insertOtpCode,
  markOtpConsumed,
} from "@/server/repositories/otp-codes.repository";
import {
  findUserByEmail,
  findUserByEmailIncludingSuspended,
  insertUser,
  updateLastLogin,
} from "@/server/repositories/users.repository";

function deriveDefaultFullName(email: string): string {
  const localPart = email.split("@")[0] ?? email;
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Validates the OTP request rate limit, creates a new OTP code, and emails it.
 * Returns the code's validity window on success.
 */
export async function requestOtp(
  email: string,
  ip: string | null,
  locale: AppLocale,
): Promise<Result<{ expiresInMinutes: number }, AppError>> {
  const existing = await findUserByEmailIncludingSuspended(email);
  if (existing?.deletedAt) {
    return err(new AppError("Account is suspended", "ACCOUNT_SUSPENDED"));
  }

  const windowStart = new Date(Date.now() - OTP_REQUEST_WINDOW_MINUTES * 60_000);
  const recentCount = await countRecentOtpRequests(email, windowStart);
  if (recentCount >= OTP_REQUEST_LIMIT) {
    return err(new AppError("Too many OTP requests for this email", "RATE_LIMITED"));
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

  await insertOtpCode({ email, codeHash, expiresAt, ip });
  await sendOtpEmail({ to: email, code, locale });

  return ok({ expiresInMinutes: OTP_EXPIRY_MINUTES });
}

/**
 * Verifies an OTP code, creating the user on first sign-in if needed, and
 * returns a signed session token on success.
 */
export async function verifyOtpAndLogin(
  email: string,
  code: string,
  locale: AppLocale,
): Promise<Result<{ token: string; role: SessionRole }, AppError>> {
  const otpRow = await findLatestActiveOtpByEmail(email);
  if (!otpRow) {
    return err(new AppError("No active OTP code for this email", "OTP_NOT_FOUND"));
  }

  if (otpRow.expiresAt.getTime() < Date.now()) {
    return err(new AppError("OTP code has expired", "OTP_EXPIRED"));
  }

  if (otpRow.attempts >= OTP_MAX_ATTEMPTS) {
    return err(new AppError("Maximum OTP attempts exceeded", "OTP_MAX_ATTEMPTS"));
  }

  if (!verifyOtpHash(code, otpRow.codeHash)) {
    await incrementOtpAttempts(otpRow.id);
    return err(new AppError("Incorrect OTP code", "OTP_INVALID_CODE"));
  }

  await markOtpConsumed(otpRow.id);

  const existing = await findUserByEmailIncludingSuspended(email);
  if (existing?.deletedAt) {
    return err(new AppError("Account is suspended", "ACCOUNT_SUSPENDED"));
  }

  let user = await findUserByEmail(email);
  if (!user) {
    user = await insertUser({
      email,
      fullName: deriveDefaultFullName(email),
      role: "user",
      locale,
    });
  }

  await updateLastLogin(user.id);

  const token = await signSessionToken({ sub: user.id, email: user.email, role: user.role });
  return ok({ token, role: user.role });
}
