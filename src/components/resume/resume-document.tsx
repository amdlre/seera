import type { ResumeSection } from "@/db/schema";
import { PRINT_LABELS, type PrintLang } from "@/lib/constants/print-labels";
import { formatPhoneInternational } from "@/lib/resume/phone";
import {
  type DocumentItem,
  type PrintLabels,
  hasPrintableContent,
  joinPresent,
  pickLang,
  text,
} from "./document-helpers";
import {
  BulletsSectionBody,
  CertificationsSectionBody,
  LanguagesSectionBody,
  ParagraphSectionBody,
  SkillsSectionBody,
} from "./sections/list-sections";
import {
  DatedEntriesSectionBody,
  EducationSectionBody,
  ExperienceSectionBody,
  ProjectsSectionBody,
} from "./sections/work-sections";
import "./resume-document.css";

export type ResumeDocumentProps = {
  lang: PrintLang;
  /** The personal-info item's data (name, contact, links). */
  personal: Record<string, unknown>;
  jobTitle: string;
  sections: ResumeSection[];
  itemsBySectionId: Record<string, DocumentItem[]>;
};

function SectionBody({
  section,
  items,
  lang,
  labels,
}: {
  section: ResumeSection;
  items: DocumentItem[];
  lang: PrintLang;
  labels: PrintLabels;
}) {
  switch (section.type) {
    case "summary":
      return <ParagraphSectionBody items={items} lang={lang} field="summary" />;
    case "experience":
      return <ExperienceSectionBody items={items} lang={lang} labels={labels} />;
    case "education":
      return <EducationSectionBody items={items} lang={lang} labels={labels} />;
    case "skills":
      return <SkillsSectionBody items={items} lang={lang} />;
    case "projects":
      return <ProjectsSectionBody items={items} lang={lang} />;
    case "certifications":
      return <CertificationsSectionBody items={items} lang={lang} labels={labels} />;
    case "languages":
      return <LanguagesSectionBody items={items} lang={lang} labels={labels} />;
    case "custom":
      if (section.layout === "bullets") return <BulletsSectionBody items={items} lang={lang} />;
      if (section.layout === "dated_entries") {
        return <DatedEntriesSectionBody items={items} lang={lang} labels={labels} />;
      }
      return <ParagraphSectionBody items={items} lang={lang} field="text" />;
    default:
      return null;
  }
}

/**
 * The single-column, black-on-white resume used by `/print`, the PDF export
 * and the builder's live preview — one renderer, so what the user previews is
 * exactly what gets printed. Every rule maps to ATS-CRITERIA.md §2: no colors,
 * no images, one column, MM/YYYY dates, `•` bullets only.
 */
export function ResumeDocument({
  lang,
  personal,
  jobTitle,
  sections,
  itemsBySectionId,
}: ResumeDocumentProps) {
  const labels = PRINT_LABELS[lang];
  const phone = text(personal.phone) ? formatPhoneInternational(text(personal.phone)) : "";
  const contactLine = joinPresent(
    [text(personal.email), phone, pickLang(personal, "cityCountry", lang)],
    " | ",
  );
  const linksLine = joinPresent([text(personal.linkedin), text(personal.portfolioUrl)], " | ");

  const visibleSections = sections
    .filter((section) => section.type !== "personal" && section.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <h1 className="print-name">{pickLang(personal, "fullName", lang)}</h1>
      {jobTitle && <p className="print-job-title">{jobTitle}</p>}
      {contactLine && <p className="print-contact-line">{contactLine}</p>}
      {linksLine && <p className="print-contact-line">{linksLine}</p>}

      {visibleSections.map((section) => {
        const items = (itemsBySectionId[section.id] ?? []).filter((item) =>
          hasPrintableContent(item.data),
        );
        if (items.length === 0) {
          return null;
        }
        return (
          <section key={section.id} className="print-section">
            <h2 className="print-section-title">
              {lang === "ar" ? section.titleAr : section.titleEn}
            </h2>
            <SectionBody section={section} items={items} lang={lang} labels={labels} />
          </section>
        );
      })}
    </>
  );
}
