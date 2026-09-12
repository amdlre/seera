"use server";

import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import * as exportsService from "@/server/services/resume-exports.service";

export type LogExportResult = { success: true } | { success: false; messageKey: string };

function firstClientIp(forwardedFor: string | null): string | null {
  return forwardedFor?.split(",")[0]?.trim() ?? null;
}

/** Logs that the current user printed/exported a resume, in a given language. */
export async function logExportAction(
  resumeId: string,
  language: "ar" | "en",
  method: "print" | "pdf" | "docx",
): Promise<LogExportResult> {
  const session = await requireAuth();
  const headerList = await headers();

  const result = await exportsService.recordExport({
    resumeId,
    userId: session.sub,
    language,
    method,
    ip: firstClientIp(headerList.get("x-forwarded-for")),
    userAgent: headerList.get("user-agent"),
  });

  if (!result.ok) {
    logger.warn("log-export-failed", { resumeId, code: result.error.code });
    return { success: false, messageKey: "builder.errors.saveFailed" };
  }

  return { success: true };
}
