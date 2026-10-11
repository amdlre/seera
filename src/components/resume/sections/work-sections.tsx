import { EMPLOYMENT_TYPE_OMITTED_IN_PRINT, isEmploymentType } from "@/lib/constants/experience";
import type { PrintLang } from "@/lib/constants/print-labels";
import {
  type DocumentItem,
  type PrintLabels,
  formatDateRange,
  joinPresent,
  pickLang,
  pickLangList,
  text,
} from "../document-helpers";

type SectionBodyProps = { items: DocumentItem[]; lang: PrintLang; labels: PrintLabels };

function BulletList({ bullets }: { bullets: string[] }) {
  if (bullets.length === 0) {
    return null;
  }
  return (
    <ul className="print-bullets">
      {bullets.map((bullet, index) => (
        <li key={index}>{bullet}</li>
      ))}
    </ul>
  );
}

/** Work experience: "Title — Company", then "City | Type | MM/YYYY – MM/YYYY", then bullets. */
export function ExperienceSectionBody({ items, lang, labels }: SectionBodyProps) {
  return items.map(({ id, data }) => {
    const employmentType =
      isEmploymentType(data.employmentType) &&
      data.employmentType !== EMPLOYMENT_TYPE_OMITTED_IN_PRINT
        ? labels.employmentTypes[data.employmentType]
        : "";
    return (
      <div key={id} className="print-entry">
        <p className="print-entry-title">
          {joinPresent([pickLang(data, "title", lang), pickLang(data, "company", lang)], " — ")}
        </p>
        <p className="print-entry-meta">
          {joinPresent(
            [pickLang(data, "cityCountry", lang), employmentType, formatDateRange(data, labels)],
            " | ",
          )}
        </p>
        <BulletList bullets={pickLangList(data, "bullets", lang)} />
      </div>
    );
  });
}

/** Projects: "Name — link", the technologies line, then bullets. */
export function ProjectsSectionBody({ items, lang }: Omit<SectionBodyProps, "labels">) {
  return items.map(({ id, data }) => (
    <div key={id} className="print-entry">
      <p className="print-entry-title">
        {joinPresent([pickLang(data, "name", lang), text(data.url)], " — ")}
      </p>
      {text(data.technologies) && <p className="print-entry-meta">{text(data.technologies)}</p>}
      <BulletList bullets={pickLangList(data, "bullets", lang)} />
    </div>
  ));
}

/** Education: degree, "Major — University — City", then year and optional GPA. */
export function EducationSectionBody({ items, lang, labels }: SectionBodyProps) {
  return items.map(({ id, data }) => {
    const gpa =
      typeof data.gpaValue === "number"
        ? `${labels.gpaOutOf}: ${data.gpaValue}/${String(data.gpaScale ?? "")}`
        : "";
    const year = `${data.isExpected ? `${labels.present}: ` : ""}${String(data.graduationYear ?? "")}`;
    return (
      <div key={id} className="print-entry">
        <p className="print-entry-title">{pickLang(data, "degree", lang)}</p>
        <p className="print-entry-meta">
          {joinPresent(
            [
              pickLang(data, "major", lang),
              pickLang(data, "university", lang),
              pickLang(data, "cityCountry", lang),
            ],
            " — ",
          )}
        </p>
        <p className="print-entry-meta">{joinPresent([year, gpa], " — ")}</p>
      </div>
    );
  });
}

/** Custom "dated entries" layout: title, date range, description paragraph. */
export function DatedEntriesSectionBody({ items, lang, labels }: SectionBodyProps) {
  return items.map(({ id, data }) => (
    <div key={id} className="print-entry">
      <p className="print-entry-title">{pickLang(data, "title", lang)}</p>
      <p className="print-entry-meta">{formatDateRange(data, labels)}</p>
      <p className="print-paragraph">{pickLang(data, "description", lang)}</p>
    </div>
  ));
}
