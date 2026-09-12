import { AppError, err, ok, type Result } from "@/lib/errors";
import {
  PDF_EXPORT_RATE_LIMIT,
  PDF_EXPORT_RATE_WINDOW_MINUTES,
} from "@/lib/constants/auth";
import { buildExportFilename } from "@/lib/pdf/filename";
import { generateResumePdf } from "@/lib/pdf/generate-resume-pdf";
import type { PrintLang } from "@/lib/constants/print-labels";
import { getSignedPdfUrl, uploadPdf } from "@/lib/storage/s3";
import { countRecentPdfExports } from "@/server/repositories/exports.repository";
import { getResumeForBuilder } from "./resume.service";
import { recordExport } from "./resume-exports.service";

export type PdfExportResult = {
  url: string;
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
 * Generates a resume PDF via headless Chromium, uploads it to the exports
 * bucket, and returns a signed download link. Orchestrates: ownership check
 * → rate limit → render → upload → log export (PROJECT-BRIEF §6.3).
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

  const pdfBuffer = await generateResumePdf(input.resumeId, input.userId, input.lang);
  const fileKey = `resumes/${input.resumeId}/${Date.now()}-${input.lang}.pdf`;
  await uploadPdf(fileKey, pdfBuffer);
  const url = await getSignedPdfUrl(fileKey);

  await recordExport({
    resumeId: input.resumeId,
    userId: input.userId,
    language: input.lang,
    method: "pdf",
    ip: input.ip,
    userAgent: input.userAgent,
    fileKey,
  });

  return ok({ url, filename });
}
