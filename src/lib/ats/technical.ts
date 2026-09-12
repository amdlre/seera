import { EASTERN_ARABIC_DIGITS, EMOJI_OR_DECORATIVE_SYMBOL } from "@/lib/constants/ats";
import { findSectionId, type AtsAxisResult, type AtsIssue, type AtsScoreInput } from "./types";

function collectAllText(input: AtsScoreInput): string {
  const parts: string[] = [
    input.personalInfo.fullNameAr ?? "",
    input.personalInfo.fullNameEn ?? "",
    input.summary.summaryAr ?? "",
    input.summary.summaryEn ?? "",
  ];

  for (const section of input.sections) {
    for (const item of input.itemsBySectionId[section.id] ?? []) {
      parts.push(...Object.values(item.data).filter((value): value is string => typeof value === "string"));
    }
  }

  return parts.join(" ");
}

/**
 * Scores the "technical compatibility" axis (10 pts): no emoji/decorative
 * symbols, no Eastern Arabic-Indic digits, and an international phone
 * format — ATS-CRITERIA.md §4. Page count and file-image checks require
 * the rendered PDF and are covered separately in `test/pdf-export.test.ts`.
 */
export function scoreTechnicalCompatibility(input: AtsScoreInput): AtsAxisResult {
  const issues: AtsIssue[] = [];
  const allText = collectAllText(input);

  let earned = 10;

  if (EMOJI_OR_DECORATIVE_SYMBOL.test(allText)) {
    earned -= 4;
    issues.push({
      id: "technical-emoji",
      severity: "error",
      messageKey: "issues.emojiOrSymbols",
      points: 4,
    });
  }

  if (EASTERN_ARABIC_DIGITS.test(allText)) {
    earned -= 3;
    issues.push({
      id: "technical-eastern-digits",
      severity: "error",
      messageKey: "issues.easternDigits",
      points: 3,
    });
  }

  const phone = input.personalInfo.phone ?? "";
  if (!/^\+\d[\d ]{7,}$/.test(phone)) {
    earned -= 3;
    issues.push({
      id: "technical-phone-format",
      severity: "warning",
      messageKey: "issues.phoneFormat",
      sectionId: findSectionId(input, "personal"),
      points: 3,
    });
  }

  return { earned: Math.max(earned, 0), max: 10, issues };
}
