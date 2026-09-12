import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/constants/auth";
import { type SessionPayload, verifySessionToken } from "./jwt";

/** Reads and verifies the session cookie. Returns null if absent or invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

/** Returns the current session, throwing UnauthorizedError if there is none. */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

/** Returns the current session, throwing ForbiddenError if the user isn't an admin. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "admin") {
    throw new ForbiddenError();
  }
  return session;
}

/** Sets the httpOnly session cookie for a signed JWT. */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Clears the session cookie, effectively logging the user out. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}
