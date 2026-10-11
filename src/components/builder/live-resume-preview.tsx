"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import type { DocumentItem } from "@/components/resume/document-helpers";
import { ResumeDocument } from "@/components/resume/resume-document";
import type { AppLocale } from "@/i18n/routing";
import { useBuilderPreview } from "./builder-preview-context";

/**
 * The live preview: the exact `/print` document, fed from the builder's
 * in-progress state so it updates on every keystroke. Personal info and the
 * summary live outside `itemsBySectionId` while editing, so they're merged in.
 */
export function LiveResumePreview() {
  const { personalInfo, summary, sections, itemsBySectionId } = useBuilderPreview();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("builder.preview");

  const documentItems = useMemo(() => {
    const merged: Record<string, DocumentItem[]> = { ...itemsBySectionId };
    const summarySection = sections.find((section) => section.type === "summary");
    if (summarySection) {
      merged[summarySection.id] = [{ id: summarySection.id, data: summary }];
    }
    return merged;
  }, [itemsBySectionId, sections, summary]);

  const hasContent = Boolean(personalInfo.fullNameAr || personalInfo.fullNameEn);
  const jobTitle =
    (locale === "ar" ? personalInfo.targetJobTitleAr : personalInfo.targetJobTitleEn) ?? "";

  return (
    <div className="border-border overflow-hidden rounded-lg border bg-white shadow-sm">
      {!hasContent && <p className="text-muted-foreground p-4 text-sm">{t("empty")}</p>}
      <div
        lang={locale}
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="resume-doc resume-doc--preview"
      >
        <ResumeDocument
          lang={locale}
          personal={personalInfo}
          jobTitle={jobTitle}
          sections={sections}
          itemsBySectionId={documentItems}
        />
      </div>
    </div>
  );
}
