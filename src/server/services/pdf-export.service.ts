import { AppError, err, ok, type Result } from "@/lib/errors";
import {
  PDF_EXPORT_RATE_LIMIT,
  PDF_EXPORT_RATE_WINDOW_MINUTES,
} from "@/lib/constants/auth";
import { buildExportFilename } from "@/lib/pdf/filename";
import { generateResumePdf } from "@/lib/pdf/generate-resume-pdf";
import type { PrintLang } from "@/lib/constants/print-labels";
import { countRecentPdfExports } from "@/server/repositories/exports.repository";
import { getResumeForBuilder } from "./resume.service";
import { recordExport } from "./resume-exports.service";

export type PdfExportResult = {
  pdf: Buffer;
  filename: string;
};

type ExportPdfInput = {
  resumeId: string;
  userId: string;
  lang: PrintLang;
  ip: string | null;
  userAgent: string | null;
};

/**
 * Generates a resume PDF via headless Chromium and returns its bytes for an
 * immediate download. Orchestrates: ownership check → rate limit → render →
 * log export. The file is never stored: it holds personal data, and the only
 * available bucket serves everything publicly through a CDN.
 */
export async function exportResumeAsPdf(
  input: ExportPdfInput,
): Promise<Result<PdfExportResult, AppError>> {
  const resumeResult = await getResumeForBuilder(input.resumeId, input.userId);
  if (!resumeResult.ok) {
    return resumeResult;
  }

  const windowStart = new Date(Date.now() - PDF_EXPORT_RATE_WINDOW_MINUTES * 60_000);
  const recentCount = await countRecentPdfExports(input.userId, windowStart);
  if (recentCount >= PDF_EXPORT_RATE_LIMIT) {
    return err(new AppError("Too many PDF export requests", "RATE_LIMITED"));
  }

  const { resume, personalInfo } = resumeResult.value;
  const fullName = String(
    (input.lang === "ar" ? personalInfo.fullNameAr : personalInfo.fullNameEn) ?? resume.title,
  );
  const jobTitle = String(
    (input.lang === "ar" ? resume.targetJobTitleAr : resume.targetJobTitleEn) ?? "",
  );
  const filename = buildExportFilename(fullName, jobTitle);

  const pdf = await generateResumePdf(input.resumeId, input.userId, input.lang);

  await recordExport({
    resumeId: input.resumeId,
    userId: input.userId,
    language: input.lang,
    method: "pdf",
    ip: input.ip,
    userAgent: input.userAgent,
  });

  return ok({ pdf, filename });
}
