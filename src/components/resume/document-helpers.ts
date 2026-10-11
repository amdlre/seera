import { PRINT_LABELS, type PrintLang } from "@/lib/constants/print-labels";

/** One resume item as both the print page and the live preview hold it. */
export type DocumentItem = { id: string; data: Record<string, unknown> };

export type PrintLabels = (typeof PRINT_LABELS)[PrintLang];

/** Narrows an unknown JSON value to a string ("" for anything else). */
export function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Reads the language-specific variant of a bilingual field: `titleAr` / `titleEn`. */
export function pickLang(data: Record<string, unknown>, baseKey: string, lang: PrintLang): string {
  return text(data[`${baseKey}${lang === "ar" ? "Ar" : "En"}`]);
}

/** Reads the language-specific list (e.g. `bulletsAr`), dropping empty entries. */
export function pickLangList(
  data: Record<string, unknown>,
  baseKey: string,
  lang: PrintLang,
): string[] {
  const value = data[`${baseKey}${lang === "ar" ? "Ar" : "En"}`];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim() !== "")
    : [];
}

/** MM/YYYY per ATS-CRITERIA.md §2, or "" when either part is missing. */
export function formatMonthYear(month: unknown, year: unknown): string {
  if (!month || !year) {
    return "";
  }
  return `${String(month).padStart(2, "0")}/${String(year)}`;
}

/** "MM/YYYY – MM/YYYY" or "MM/YYYY – Present"; "" when no start date is set. */
export function formatDateRange(data: Record<string, unknown>, labels: PrintLabels): string {
  const start = formatMonthYear(data.startMonth, data.startYear);
  const end = data.isCurrent ? labels.present : formatMonthYear(data.endMonth, data.endYear);
  if (!start && !end) {
    return "";
  }
  return `${start} – ${end}`;
}

/** Joins the non-empty parts with a separator — avoids dangling " | " in meta lines. */
export function joinPresent(parts: string[], separator: string): string {
  return parts.filter((part) => part.trim() !== "").join(separator);
}

/**
 * Whether an item holds anything printable — a freshly added, still-blank
 * entry (empty strings, `[""]` bullets) must not print an empty section.
 * Booleans/numbers alone (e.g. `isCurrent`, a default `employmentType`)
 * don't count; only text the user typed does.
 */
export function hasPrintableContent(data: Record<string, unknown>): boolean {
  return Object.entries(data).some(([key, value]) => {
    if (key === "employmentType") return false;
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value))
      return value.some((entry) => typeof entry === "string" && entry.trim() !== "");
    return false;
  });
}
