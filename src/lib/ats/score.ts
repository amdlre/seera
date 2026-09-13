import { scoreCompleteness } from "./completeness";
import { scoreDates } from "./dates";
import { scoreKeywords } from "./keywords";
import { scoreTechnicalCompatibility } from "./technical";
import type { AtsScoreInput, AtsScoreResult } from "./types";
import { scoreWritingQuality } from "./writing-quality";

export type {
  AtsAxisResult,
  AtsIssue,
  AtsIssueSeverity,
  AtsScoreInput,
  AtsScoreResult,
  KeywordAnalysis,
  KeywordMatch,
} from "./types";

/**
 * Computes the resume's ATS score (0-100) across five weighted axes, per
 * ATS-CRITERIA.md §4. Pure and synchronous — safe to call on every keystroke
 * in the builder as well as server-side when persisting `resumes.ats_score`.
 */
export function calculateAtsScore(input: AtsScoreInput): AtsScoreResult {
  const completeness = scoreCompleteness(input);
  const dates = scoreDates(input);
  const writingQuality = scoreWritingQuality(input);
  const keywordsResult = scoreKeywords(input);
  const technical = scoreTechnicalCompatibility(input);

  const keywords = { earned: keywordsResult.earned, max: keywordsResult.max, issues: keywordsResult.issues };

  const total =
    completeness.earned + dates.earned + writingQuality.earned + keywords.earned + technical.earned;

  const issues = [
    ...completeness.issues,
    ...dates.issues,
    ...writingQuality.issues,
    ...keywords.issues,
    ...technical.issues,
  ].sort((a, b) => b.points - a.points);

  return {
    total: Math.max(0, Math.min(100, Math.round(total))),
    axes: { completeness, dates, writingQuality, keywords, technical },
    issues,
    keywordAnalysis: keywordsResult.analysis,
  };
}
