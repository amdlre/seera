const ARABIC_DIACRITICS = /[ً-ٰٟـ]/g;
const ARABIC_LETTER = /[؀-ۿ]/;
const SEPARATORS = /[.\-_/\\|,;:!?()[\]{}"'«»،؛•·]+/g;
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

/**
 * Brings text into one comparable form for both scripts: lowercase, Arabic
 * diacritics and tatweel removed, alef/ya/ta-marbuta variants unified, and
 * punctuation collapsed to spaces. "React.js", "REACT-JS" and "react js" all
 * become "react js"; "الإدارة" and "الادارة" become the same string.
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(SEPARATORS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const patternCache = new Map<string, RegExp>();

/**
 * Builds a whole-term matcher for an already-normalized alias. Boundaries are
 * Unicode-aware (JS `\b` ignores Arabic), so "java" never matches inside
 * "javascript". Arabic aliases also accept a leading conjunction/preposition
 * and the definite article, so "والتواصل" still counts as "تواصل".
 */
export function termPattern(normalizedAlias: string): RegExp {
  const cached = patternCache.get(normalizedAlias);
  if (cached) return cached;

  const escaped = normalizedAlias.replace(REGEX_SPECIALS, "\\$&");
  const isArabic = ARABIC_LETTER.test(normalizedAlias);
  const prefix = isArabic ? "(?:[وبلفك])?(?:ال)?" : "";
  // English plurals ("apis", "code reviews") count as the same term.
  const suffix = !isArabic && /[a-z]$/.test(normalizedAlias) ? "(?:e?s)?" : "";
  // A Latin term is only cut off by Latin letters, so Arabic text that glues a
  // conjunction onto it ("وReact", "بـPython") still matches.
  const boundary = isArabic ? "[\\p{L}\\p{N}]" : "[\\p{Script=Latin}\\p{N}+#]";
  const pattern = new RegExp(`(?<!${boundary})${prefix}${escaped}${suffix}(?!${boundary})`, "gu");

  patternCache.set(normalizedAlias, pattern);
  return pattern;
}

/** Counts whole-term occurrences of a normalized alias in normalized text. */
export function countTermOccurrences(normalizedText: string, normalizedAlias: string): number {
  if (!normalizedAlias) return 0;
  const pattern = termPattern(normalizedAlias);
  pattern.lastIndex = 0;
  return normalizedText.match(pattern)?.length ?? 0;
}
