import { findTerms } from "./term-matcher";
import type { AtsAxisResult, AtsScoreInput, KeywordAnalysis, KeywordMatch } from "./types";
import { VOCABULARY_BY_ID } from "./vocabulary";

const KEYWORDS_MAX_POINTS = 15;
/** A term repeated in a posting signals importance, but capped so one term can't dominate. */
const MAX_TERM_WEIGHT = 3;
/** Contact details and identifiers aren't skills — "github.com/x" must not count as GitHub. */
const NON_SKILL_FIELD = /url|link|email|phone|id$/i;

function collectStrings(value: unknown, into: string[]): void {
  if (typeof value === "string") into.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => collectStrings(entry, into));
}

/** Everything an ATS would read from the resume body, across all sections and both languages. */
function buildResumeText(input: AtsScoreInput): string {
  const parts: string[] = [
    input.personalInfo.targetJobTitleAr ?? "",
    input.personalInfo.targetJobTitleEn ?? "",
    input.summary.summaryAr ?? "",
    input.summary.summaryEn ?? "",
  ];

  for (const section of input.sections) {
    for (const item of input.itemsBySectionId[section.id] ?? []) {
      for (const [key, value] of Object.entries(item.data)) {
        if (!NON_SKILL_FIELD.test(key)) collectStrings(value, parts);
      }
    }
  }

  return parts.join("\n");
}

function toMatch(termId: string, occurrences: number): KeywordMatch | null {
  const term = VOCABULARY_BY_ID.get(termId);
  return term ? { id: term.id, label: term.label, category: term.category, occurrences } : null;
}

const byImportance = (a: KeywordMatch, b: KeywordMatch) =>
  b.occurrences - a.occurrences || a.label.localeCompare(b.label);

/**
 * Recognises the professional terms a job posting asks for (from the curated
 * vocabulary, not raw word frequency) and splits them into those the resume
 * already contains and those it's missing.
 */
export function analyzeKeywords(input: AtsScoreInput): KeywordAnalysis {
  const posting = input.jobPostingText?.trim() ?? "";
  if (!posting) return { hasPosting: false, matched: [], missing: [] };

  const requested = findTerms(posting);
  const present = findTerms(buildResumeText(input));
  const matched: KeywordMatch[] = [];
  const missing: KeywordMatch[] = [];

  for (const [termId, occurrences] of requested) {
    const match = toMatch(termId, occurrences);
    if (match) (present.has(termId) ? matched : missing).push(match);
  }

  return { hasPosting: true, matched: matched.sort(byImportance), missing: missing.sort(byImportance) };
}

/**
 * Scores the "keywords" axis (15 pts) as importance-weighted coverage of the
 * posting's recognised terms — ATS-CRITERIA.md §4. Not penalised when no
 * posting was pasted, or when it names no recognisable skills.
 */
export function scoreKeywords(input: AtsScoreInput): AtsAxisResult & { analysis: KeywordAnalysis } {
  const analysis = analyzeKeywords(input);
  const weight = (match: KeywordMatch) => Math.min(match.occurrences, MAX_TERM_WEIGHT);
  const matchedWeight = analysis.matched.reduce((sum, match) => sum + weight(match), 0);
  const totalWeight = matchedWeight + analysis.missing.reduce((sum, match) => sum + weight(match), 0);

  if (totalWeight === 0) {
    return { earned: KEYWORDS_MAX_POINTS, max: KEYWORDS_MAX_POINTS, issues: [], analysis };
  }

  const earned = Math.round((matchedWeight / totalWeight) * KEYWORDS_MAX_POINTS);
  const issues =
    analysis.missing.length > 0
      ? [
          {
            id: "keywords-missing",
            severity: "info" as const,
            messageKey: "issues.missingKeywords",
            points: KEYWORDS_MAX_POINTS - earned,
          },
        ]
      : [];

  return { earned, max: KEYWORDS_MAX_POINTS, issues, analysis };
}
