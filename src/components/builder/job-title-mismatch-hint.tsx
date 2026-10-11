"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { hasJobTitleMismatch } from "@/lib/resume/job-title-match";

/** Warns when the Arabic and English job titles describe different roles. */
export function JobTitleMismatchHint({ titleAr, titleEn }: { titleAr?: string; titleEn?: string }) {
  const t = useTranslations("builder.common");
  if (!hasJobTitleMismatch(titleAr, titleEn)) {
    return null;
  }

  return (
    <p
      role="status"
      className="border-warning/50 bg-warning/10 text-foreground flex items-start gap-2 rounded-md border px-3 py-2 text-xs sm:col-span-2"
    >
      <TriangleAlert className="text-warning mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{t("titleMismatch", { titleAr: titleAr ?? "", titleEn: titleEn ?? "" })}</span>
    </p>
  );
}
