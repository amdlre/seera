import type { Resume, ResumeItem, ResumeSection } from "@/db/schema";
import type { PrintLang } from "@/lib/constants/print-labels";
import type { DocumentItem } from "./document-helpers";
import { ResumeDocument } from "./resume-document";

type ResumePrintTemplateProps = {
  lang: PrintLang;
  resume: Resume;
  sections: ResumeSection[];
  itemsBySectionId: Record<string, ResumeItem[]>;
};

/** Adapts the stored resume (DB rows) to `ResumeDocument` for `/print` and PDF export. */
export function ResumePrintTemplate({
  lang,
  resume,
  sections,
  itemsBySectionId,
}: ResumePrintTemplateProps) {
  const personalSection = sections.find((section) => section.type === "personal");
  const personalData = personalSection
    ? itemsBySectionId[personalSection.id]?.[0]?.data
    : undefined;

  const documentItems: Record<string, DocumentItem[]> = {};
  for (const [sectionId, items] of Object.entries(itemsBySectionId)) {
    documentItems[sectionId] = items.map((item) => ({
      id: item.id,
      data: (item.data ?? {}) as Record<string, unknown>,
    }));
  }

  return (
    <ResumeDocument
      lang={lang}
      personal={(personalData ?? {}) as Record<string, unknown>}
      jobTitle={(lang === "ar" ? resume.targetJobTitleAr : resume.targetJobTitleEn) ?? ""}
      sections={sections}
      itemsBySectionId={documentItems}
    />
  );
}
