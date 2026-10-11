import type { PrintLang } from "@/lib/constants/print-labels";
import {
  type DocumentItem,
  type PrintLabels,
  formatMonthYear,
  joinPresent,
  pickLang,
  text,
} from "../document-helpers";

type ItemsProps = { items: DocumentItem[]; lang: PrintLang };
type LabelledItemsProps = ItemsProps & { labels: PrintLabels };

/** Paragraph sections (summary, custom paragraph): one block per item from `{field}Ar/En`. */
export function ParagraphSectionBody({ items, lang, field }: ItemsProps & { field: string }) {
  return items.map(({ id, data }) => (
    <p key={id} className="print-paragraph">
      {pickLang(data, field, lang)}
    </p>
  ));
}

/** Custom bullets layout: every item is one bullet. */
export function BulletsSectionBody({ items, lang }: ItemsProps) {
  return (
    <ul className="print-bullets">
      {items.map(({ id, data }) => (
        <li key={id}>{pickLang(data, "text", lang)}</li>
      ))}
    </ul>
  );
}

/** Skills: one "Category: a, b, c" line per category. */
export function SkillsSectionBody({ items, lang }: ItemsProps) {
  return items.map(({ id, data }) => (
    <p key={id} className="print-skill-line">
      <strong>{pickLang(data, "category", lang)}:</strong> {pickLang(data, "skills", lang)}
    </p>
  ));
}

/** Certifications: name, then "Issuer — issued – expiry — Credential ID". */
export function CertificationsSectionBody({ items, lang, labels }: LabelledItemsProps) {
  return items.map(({ id, data }) => {
    const issued = formatMonthYear(data.issueMonth, data.issueYear);
    const expiry = data.neverExpires
      ? labels.neverExpires
      : formatMonthYear(data.expiryMonth, data.expiryYear);
    const credential = text(data.credentialId)
      ? `${labels.credentialId}: ${text(data.credentialId)}`
      : "";
    return (
      <div key={id} className="print-entry">
        <p className="print-entry-title">{pickLang(data, "name", lang)}</p>
        <p className="print-entry-meta">
          {joinPresent(
            [pickLang(data, "issuer", lang), joinPresent([issued, expiry], " – "), credential],
            " — ",
          )}
        </p>
      </div>
    );
  });
}

/** Languages: a single "Arabic: Native | English: Advanced (IELTS 7)" line. */
export function LanguagesSectionBody({ items, lang, labels }: LabelledItemsProps) {
  const line = items
    .map(({ data }) => {
      const level = labels.languageLevels[data.level as keyof PrintLabels["languageLevels"]] ?? "";
      const detail = text(data.detail);
      return `${pickLang(data, "language", lang)}: ${level}${detail ? ` (${detail})` : ""}`;
    })
    .join(" | ");
  return <p className="print-paragraph">{line}</p>;
}
