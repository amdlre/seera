"use client";

import { useTranslations } from "next-intl";
import { AtsScoreCard } from "./ats-score-card";
import { DownloadPdfButton } from "./download-pdf-button";
import { PrintButton } from "./print-button";

export function ReviewExportSection({ resumeId }: { resumeId: string }) {
  const t = useTranslations("builder.review");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>

      <AtsScoreCard resumeId={resumeId} />

      <div className="border-border bg-muted/30 flex flex-col gap-3 rounded-lg border p-4">
        <h2 className="text-foreground text-sm font-semibold">{t("printSectionTitle")}</h2>
        <div className="flex flex-wrap gap-3">
          <PrintButton resumeId={resumeId} language="ar" label={t("printAr")} />
          <PrintButton resumeId={resumeId} language="en" label={t("printEn")} />
        </div>
        <p className="text-muted-foreground text-xs">{t("printHint")}</p>
      </div>

      <div className="border-border bg-muted/30 flex flex-col gap-3 rounded-lg border p-4">
        <h2 className="text-foreground text-sm font-semibold">{t("pdfSectionTitle")}</h2>
        <div className="flex flex-wrap gap-3">
          <DownloadPdfButton resumeId={resumeId} language="ar" label={t("downloadPdfAr")} />
          <DownloadPdfButton resumeId={resumeId} language="en" label={t("downloadPdfEn")} />
        </div>
        <p className="text-muted-foreground text-xs">{t("pdfHint")}</p>
      </div>

      <p className="text-muted-foreground text-xs">{t("emailComingSoon")}</p>
    </div>
  );
}
