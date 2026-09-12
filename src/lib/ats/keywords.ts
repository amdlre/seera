import { findItems, type AtsAxisResult, type AtsScoreInput } from "./types";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "our", "are", "will", "this", "that",
  "من", "في", "على", "إلى", "عن", "مع", "هذا", "هذه", "التي", "الذي", "و",
  "أو", "كما", "لا", "أن", "إن", "كل", "بين", "قد", "تم", "يتم", "الى",
]);

function extractKeywords(text: string, limit: number): string[] {
  const words = text
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}"'،؛]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));

  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function buildResumeCorpus(input: AtsScoreInput): string {
  const parts: string[] = [
    input.summary.summaryAr ?? "",
    input.summary.summaryEn ?? "",
  ];

  for (const item of findItems(input, "experience")) {
    parts.push(...(Array.isArray(item.data.bulletsAr) ? (item.data.bulletsAr as string[]) : []));
    parts.push(...(Array.isArray(item.data.bulletsEn) ? (item.data.bulletsEn as string[]) : []));
    parts.push(String(item.data.titleAr ?? ""), String(item.data.titleEn ?? ""));
  }
  for (const item of findItems(input, "skills")) {
    parts.push(String(item.data.skillsAr ?? ""), String(item.data.skillsEn ?? ""));
  }

  return parts.join(" ").toLowerCase();
}

/**
 * Scores the "keywords" axis (15 pts): if the user pasted a job posting,
 * extracts its top keywords and checks how many appear in the resume —
 * ATS-CRITERIA.md §4. Not penalized when no posting was provided (optional).
 */
export function scoreKeywords(input: AtsScoreInput): AtsAxisResult & { matched: string[]; missing: string[] } {
  if (!input.jobPostingText?.trim()) {
    return { earned: 15, max: 15, issues: [], matched: [], missing: [] };
  }

  const keywords = extractKeywords(input.jobPostingText, 20);
  const corpus = buildResumeCorpus(input);

  const matched = keywords.filter((keyword) => corpus.includes(keyword));
  const missing = keywords.filter((keyword) => !corpus.includes(keyword));

  const matchRatio = keywords.length > 0 ? matched.length / keywords.length : 1;
  const earned = Math.round(matchRatio * 15);

  const issues =
    missing.length > 0
      ? [
          {
            id: "keywords-missing",
            severity: "info" as const,
            messageKey: "issues.missingKeywords",
            points: 15 - earned,
          },
        ]
      : [];

  return { earned, max: 15, issues, matched, missing };
}
