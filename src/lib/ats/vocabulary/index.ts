import { normalizeText } from "../text-normalize";
import { BUSINESS_TERMS, FINANCE_TERMS, HR_TERMS, MARKETING_TERMS } from "./business";
import { DESIGN_TERMS, METHODOLOGY_TERMS, TOOL_TERMS } from "./practices";
import { SOFT_SKILL_TERMS } from "./soft-skills";
import { CLOUD_DEVOPS_TERMS, DATA_TERMS, FRAMEWORK_TERMS, PROGRAMMING_TERMS } from "./tech";
import type { VocabularyTerm } from "./types";

export { VOCABULARY_CATEGORIES, type VocabularyCategory, type VocabularyTerm } from "./types";

export type IndexedTerm = VocabularyTerm & { normalizedAliases: readonly string[] };

function indexTerm(term: VocabularyTerm): IndexedTerm {
  const normalizedAliases = [...new Set(term.aliases.map(normalizeText))].filter(Boolean);
  return { ...term, normalizedAliases };
}

/** Every recognised term, with aliases normalized once at module load. */
export const VOCABULARY: readonly IndexedTerm[] = [
  ...PROGRAMMING_TERMS,
  ...FRAMEWORK_TERMS,
  ...DATA_TERMS,
  ...CLOUD_DEVOPS_TERMS,
  ...DESIGN_TERMS,
  ...TOOL_TERMS,
  ...METHODOLOGY_TERMS,
  ...BUSINESS_TERMS,
  ...MARKETING_TERMS,
  ...FINANCE_TERMS,
  ...HR_TERMS,
  ...SOFT_SKILL_TERMS,
].map(indexTerm);

export const VOCABULARY_BY_ID: ReadonlyMap<string, IndexedTerm> = new Map(
  VOCABULARY.map((term) => [term.id, term]),
);
