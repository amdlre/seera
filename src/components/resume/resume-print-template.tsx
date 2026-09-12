import type { Resume, ResumeItem, ResumeSection } from "@/db/schema";
import { PRINT_LABELS, type PrintLang } from "@/lib/constants/print-labels";

type ResumePrintTemplateProps = {
  lang: PrintLang;
  resume: Resume;
  sections: ResumeSection[];
  itemsBySectionId: Record<string, ResumeItem[]>;
};

function formatMonthYear(month: unknown, year: unknown): string {
  if (!month || !year) {
    return "";
  }
  return `${String(month).padStart(2, "0")}/${year}`;
}

function d(data: unknown): Record<string, unknown> {
  return (data ?? {}) as Record<string, unknown>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * The single-column, black-on-white resume rendering used by `/print` (and,
 * later, PDF export). Every rule here maps directly to ATS-CRITERIA.md §2:
 * no colors, no images, one column, MM/YYYY dates, `•` bullets only.
 */
export function ResumePrintTemplate({
  lang,
  resume,
  sections,
  itemsBySectionId,
}: ResumePrintTemplateProps) {
  const labels = PRINT_LABELS[lang];
  const isAr = lang === "ar";

  const personalSection = sections.find((section) => section.type === "personal");
  const personal = personalSection ? d(itemsBySectionId[personalSection.id]?.[0]?.data) : {};

  const fullName = text(isAr ? personal.fullNameAr : personal.fullNameEn);
  const jobTitle = text(isAr ? resume.targetJobTitleAr : resume.targetJobTitleEn);
  const cityCountry = text(isAr ? personal.cityCountryAr : personal.cityCountryEn);
  const contactLine = [text(personal.email), text(personal.phone), cityCountry]
    .filter(Boolean)
    .join(" | ");
  const linksLine = [text(personal.linkedin), text(personal.portfolioUrl)]
    .filter(Boolean)
    .join(" | ");

  const visibleSections = sections
    .filter((section) => section.type !== "personal" && section.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <h1 className="print-name">{fullName}</h1>
      {jobTitle && <p className="print-job-title">{jobTitle}</p>}
      {contactLine && <p className="print-contact-line">{contactLine}</p>}
      {linksLine && <p className="print-contact-line">{linksLine}</p>}

      {visibleSections.map((section) => {
        const items = itemsBySectionId[section.id] ?? [];
        if (items.length === 0) {
          return null;
        }

        const title = isAr ? section.titleAr : section.titleEn;

        return (
          <section key={section.id} className="print-section">
            <h2 className="print-section-title">{title}</h2>

            {section.type === "summary" &&
              items.map((item) => {
                const data = d(item.data);
                return (
                  <p key={item.id} className="print-paragraph">
                    {text(isAr ? data.summaryAr : data.summaryEn)}
                  </p>
                );
              })}

            {section.type === "experience" &&
              items.map((item) => {
                const data = d(item.data);
                const bullets = (isAr ? data.bulletsAr : data.bulletsEn) as string[] | undefined;
                const dateRange = `${formatMonthYear(data.startMonth, data.startYear)} – ${
                  data.isCurrent ? labels.present : formatMonthYear(data.endMonth, data.endYear)
                }`;
                return (
                  <div key={item.id} className="print-entry">
                    <p className="print-entry-title">
                      {text(isAr ? data.titleAr : data.titleEn)} — {text(data.company)}
                    </p>
                    <p className="print-entry-meta">
                      {text(data.cityCountry)} | {dateRange}
                    </p>
                    <ul className="print-bullets">
                      {bullets?.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}
                    </ul>
                  </div>
                );
              })}

            {section.type === "education" &&
              items.map((item) => {
                const data = d(item.data);
                const gpaValue = data.gpaValue;
                const gpaScale = data.gpaScale;
                return (
                  <div key={item.id} className="print-entry">
                    <p className="print-entry-title">{text(isAr ? data.degreeAr : data.degreeEn)}</p>
                    <p className="print-entry-meta">
                      {text(isAr ? data.majorAr : data.majorEn)} —{" "}
                      {text(isAr ? data.universityAr : data.universityEn)}
                      {text(data.cityCountry) ? ` — ${text(data.cityCountry)}` : ""}
                    </p>
                    <p className="print-entry-meta">
                      {data.isExpected ? `${labels.present}: ` : ""}
                      {String(data.graduationYear ?? "")}
                      {typeof gpaValue === "number" ? ` — ${labels.gpaOutOf}: ${gpaValue}/${String(gpaScale ?? "")}` : ""}
                    </p>
                  </div>
                );
              })}

            {section.type === "skills" &&
              items.map((item) => {
                const data = d(item.data);
                return (
                  <p key={item.id} className="print-skill-line">
                    <strong>{text(isAr ? data.categoryAr : data.categoryEn)}:</strong>{" "}
                    {text(isAr ? data.skillsAr : data.skillsEn)}
                  </p>
                );
              })}

            {section.type === "certifications" &&
              items.map((item) => {
                const data = d(item.data);
                const expiry = data.neverExpires
                  ? labels.neverExpires
                  : formatMonthYear(data.expiryMonth, data.expiryYear);
                return (
                  <div key={item.id} className="print-entry">
                    <p className="print-entry-title">{text(isAr ? data.nameAr : data.nameEn)}</p>
                    <p className="print-entry-meta">
                      {text(isAr ? data.issuerAr : data.issuerEn)} —{" "}
                      {formatMonthYear(data.issueMonth, data.issueYear)}
                      {expiry ? ` – ${expiry}` : ""}
                      {text(data.credentialId) ? ` — ${labels.credentialId}: ${text(data.credentialId)}` : ""}
                    </p>
                  </div>
                );
              })}

            {section.type === "languages" && (
              <p className="print-paragraph">
                {items
                  .map((item) => {
                    const data = d(item.data);
                    const level = labels.languageLevels[data.level as keyof typeof labels.languageLevels];
                    const name = text(isAr ? data.languageAr : data.languageEn);
                    const detail = text(data.detail);
                    return `${name}: ${level}${detail ? ` (${detail})` : ""}`;
                  })
                  .join(" | ")}
              </p>
            )}

            {section.type === "custom" &&
              section.layout === "paragraph" &&
              items.map((item) => {
                const data = d(item.data);
                return (
                  <p key={item.id} className="print-paragraph">
                    {text(isAr ? data.textAr : data.textEn)}
                  </p>
                );
              })}

            {section.type === "custom" &&
              section.layout === "bullets" && (
                <ul className="print-bullets">
                  {items.map((item) => {
                    const data = d(item.data);
                    return <li key={item.id}>{text(isAr ? data.textAr : data.textEn)}</li>;
                  })}
                </ul>
              )}

            {section.type === "custom" &&
              section.layout === "dated_entries" &&
              items.map((item) => {
                const data = d(item.data);
                const dateRange = `${formatMonthYear(data.startMonth, data.startYear)} – ${
                  data.isCurrent ? labels.present : formatMonthYear(data.endMonth, data.endYear)
                }`;
                return (
                  <div key={item.id} className="print-entry">
                    <p className="print-entry-title">{text(isAr ? data.titleAr : data.titleEn)}</p>
                    <p className="print-entry-meta">{dateRange}</p>
                    <p className="print-paragraph">{text(isAr ? data.descriptionAr : data.descriptionEn)}</p>
                  </div>
                );
              })}
          </section>
        );
      })}
    </>
  );
}
