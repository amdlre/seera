import { jwtVerify, SignJWT } from "jose";
import { EXPORT_TOKEN_TTL_SECONDS } from "@/lib/constants/auth";
import { env } from "@/lib/env";

const EXPORT_TOKEN_TYPE = "export";

export type ExportTokenPayload = {
  resumeId: string;
  userId: string;
};

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

/**
 * Signs a short-lived token that lets the server's own Puppeteer instance
 * load `/print` without a browser session cookie. Distinct from session
 * JWTs via the `typ` claim, so neither kind can be used as the other.
 */
export async function signExportToken(payload: ExportTokenPayload): Promise<string> {
  return new SignJWT({ typ: EXPORT_TOKEN_TYPE, resumeId: payload.resumeId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${EXPORT_TOKEN_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verifies an export token and returns its payload, or null if invalid/expired/wrong type. */
export async function verifyExportToken(token: string): Promise<ExportTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      payload.typ !== EXPORT_TOKEN_TYPE ||
      typeof payload.sub !== "string" ||
      typeof payload.resumeId !== "string"
    ) {
      return null;
    }
    return { userId: payload.sub, resumeId: payload.resumeId };
  } catch {
    return null;
  }
}
