import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { AppError, ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { attachmentDisposition } from "@/lib/pdf/filename";
import { exportPdfRequestSchema } from "@/lib/validations/resume/export-pdf";
import { exportResumeAsPdf } from "@/server/services/pdf-export.service";

function firstClientIp(forwardedFor: string | null): string | null {
  return forwardedFor?.split(",")[0]?.trim() ?? null;
}

const ERROR_STATUS_BY_CODE: Record<string, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  RATE_LIMITED: 429,
};

/** Generates a resume PDF via Puppeteer and streams it straight back as a download. */
export async function POST(request: Request): Promise<Response> {
  let userId: string;
  try {
    const session = await requireAuth();
    userId = session.sub;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = exportPdfRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const headerList = await headers();
  const result = await exportResumeAsPdf({
    resumeId: parsed.data.resumeId,
    userId,
    lang: parsed.data.lang,
    ip: firstClientIp(headerList.get("x-forwarded-for")),
    userAgent: headerList.get("user-agent"),
  });

  if (!result.ok) {
    logger.warn("pdf-export-failed", { resumeId: parsed.data.resumeId, code: result.error.code });
    const status = result.error instanceof AppError ? (ERROR_STATUS_BY_CODE[result.error.code] ?? 500) : 500;
    return NextResponse.json({ error: result.error.code }, { status });
  }

  const { pdf, filename } = result.value;
  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      "Content-Disposition": attachmentDisposition(filename),
      // Personal data: never let a proxy or the browser cache keep a copy.
      "Cache-Control": "no-store",
    },
  });
}
