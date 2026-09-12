import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { OTP_LENGTH } from "@/lib/constants/auth";

/** Generates a zero-padded numeric OTP code, e.g. "042817". */
export function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH;
  const value = randomInt(0, max);
  return value.toString().padStart(OTP_LENGTH, "0");
}

/** Hashes an OTP code with HMAC-SHA256 keyed by the server JWT secret. */
export function hashOtpCode(code: string): string {
  return createHmac("sha256", env.JWT_SECRET).update(code).digest("hex");
}

/** Compares a plaintext OTP code against a stored hash in constant time. */
export function verifyOtpHash(code: string, hash: string): boolean {
  const candidate = Buffer.from(hashOtpCode(code));
  const expected = Buffer.from(hash);
  if (candidate.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(candidate, expected);
}
