import { jwtVerify, SignJWT } from "jose";
import { env } from "@/lib/env";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/constants/auth";

export type SessionRole = "user" | "admin";

export type SessionPayload = {
  sub: string;
  email: string;
  role: SessionRole;
};

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

function isSessionRole(value: unknown): value is SessionRole {
  return value === "user" || value === "admin";
}

/**
 * Signs a session JWT (HS256) carrying the user id, email, and role.
 * Returns the encoded token string.
 */
export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/**
 * Verifies a session JWT and returns its typed payload, or null if the
 * token is missing, expired, malformed, or has an invalid signature.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !isSessionRole(payload.role)
    ) {
      return null;
    }

    return { sub: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}
