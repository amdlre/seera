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
import { NoBreakText } from "../no-break-text";

type SectionBodyProps = { items: DocumentItem[]; lang: PrintLang; labels: PrintLabels };

function BulletList({ bullets }: { bullets: string[] }) {
  if (bullets.length === 0) {
    return null;
  }
  return (
    <ul className="print-bullets">
      {bullets.map((bullet, index) => (
        <li key={index}>
          <NoBreakText text={bullet} />
        </li>
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

/**
 * Projects: "Name — link", then the technologies line and bullets. A project
 * without bullets collapses to one line, "Name — link (technologies)", so a
 * list of short projects doesn't cost two lines each.
 */
export function ProjectsSectionBody({ items, lang }: Omit<SectionBodyProps, "labels">) {
  return items.map(({ id, data }) => {
    const title = joinPresent([pickLang(data, "name", lang), text(data.url)], " — ");
    const technologies = text(data.technologies);
    const bullets = pickLangList(data, "bullets", lang);
    if (bullets.length === 0) {
      return (
        <p key={id} className="print-entry print-entry-compact">
          <strong>{title}</strong>
          {technologies && ` (${technologies})`}
        </p>
      );
    }
    return (
      <div key={id} className="print-entry">
        <p className="print-entry-title">{title}</p>
        {technologies && <p className="print-entry-meta">{technologies}</p>}
        <BulletList bullets={bullets} />
      </div>
    );
  });
}

/** Education: "Degree, Major", then "University — City | Year | GPA" — two lines per entry. */
export function EducationSectionBody({ items, lang, labels }: SectionBodyProps) {
  const listSeparator = lang === "ar" ? "، " : ", ";
  return items.map(({ id, data }) => {
    const gpa =
      typeof data.gpaValue === "number"
        ? `${labels.gpaOutOf}: ${data.gpaValue}/${String(data.gpaScale ?? "")}`
        : "";
    const year = `${data.isExpected ? `${labels.present}: ` : ""}${String(data.graduationYear ?? "")}`;
    const place = joinPresent(
      [pickLang(data, "university", lang), pickLang(data, "cityCountry", lang)],
      " — ",
    );
    return (
      <div key={id} className="print-entry">
        <p className="print-entry-title">
          {joinPresent(
            [pickLang(data, "degree", lang), pickLang(data, "major", lang)],
            listSeparator,
          )}
        </p>
        <p className="print-entry-meta">{joinPresent([place, year, gpa], " | ")}</p>
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
      <p className="print-paragraph">
        <NoBreakText text={pickLang(data, "description", lang)} />
      </p>
    </div>
  ));
}
