export const VOCABULARY_CATEGORIES = [
  "programming",
  "frameworks",
  "data",
  "cloudDevops",
  "design",
  "tools",
  "methodologies",
  "business",
  "marketing",
  "finance",
  "hr",
  "softSkills",
] as const;

export type VocabularyCategory = (typeof VOCABULARY_CATEGORIES)[number];

/**
 * One recognised professional term. `aliases` lists every spelling a posting
 * or resume might use (English variants and Arabic equivalents); matching is
 * done on normalized text, so casing, dots and hyphens don't need duplicates
 * beyond forms that normalize differently (e.g. "reactjs" vs "react.js").
 */
export type VocabularyTerm = {
  id: string;
  label: string;
  category: VocabularyCategory;
  aliases: readonly string[];
};

type TermEntry = readonly [id: string, label: string, aliases: readonly string[]];

/** Expands compact `[id, label, aliases]` rows into terms of one category. */
export function defineTerms(
  category: VocabularyCategory,
  entries: readonly TermEntry[],
): VocabularyTerm[] {
  return entries.map(([id, label, aliases]) => ({
    id,
    label,
    category,
    aliases: [label, ...aliases],
  }));
}
