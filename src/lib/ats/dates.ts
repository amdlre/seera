import { MAX_UNEXPLAINED_GAP_MONTHS } from "@/lib/constants/ats";
import { findItems, findSectionId, type AtsAxisResult, type AtsIssue, type AtsScoreInput } from "./types";

type DateRange = { start: number; end: number | null; isCurrent: boolean; itemId: string };

function toMonthIndex(year: unknown, month: unknown): number | null {
  if (typeof year !== "number" || typeof month !== "number") {
    return null;
  }
  return year * 12 + month;
}

function extractExperienceRanges(items: { id: string; data: Record<string, unknown> }[]): DateRange[] {
  return items
    .map((item) => {
      const start = toMonthIndex(item.data.startYear, item.data.startMonth);
      if (start === null) {
        return null;
      }
      const isCurrent = item.data.isCurrent === true;
      const end = isCurrent ? null : toMonthIndex(item.data.endYear, item.data.endMonth);
      return { start, end, isCurrent, itemId: item.id };
    })
    .filter((range): range is DateRange => range !== null);
}

/**
 * Scores the "dates" axis (20 pts): valid start/end order, no unexplained
 * gaps over 6 months between jobs, and newest-first ordering — ATS-CRITERIA.md §4.
 */
export function scoreDates(input: AtsScoreInput): AtsAxisResult {
  const issues: AtsIssue[] = [];
  const experienceSectionId = findSectionId(input, "experience");
  const ranges = extractExperienceRanges(findItems(input, "experience"));

  let orderPoints = 10;
  for (const range of ranges) {
    if (range.end !== null && range.end < range.start) {
      orderPoints = 0;
      issues.push({
        id: `dates-order-${range.itemId}`,
        severity: "error",
        messageKey: "issues.dateOrderInvalid",
        sectionId: experienceSectionId,
        points: 10,
      });
      break;
    }
  }

  const sortedByStartDesc = [...ranges].sort((a, b) => b.start - a.start);

  let gapPoints = 5;
  for (let i = 0; i < sortedByStartDesc.length - 1; i++) {
    const later = sortedByStartDesc[i];
    const earlier = sortedByStartDesc[i + 1];
    const laterEnd = later.end ?? later.start;
    if (earlier.end !== null && laterEnd - earlier.end > MAX_UNEXPLAINED_GAP_MONTHS) {
      gapPoints = 0;
      issues.push({
        id: "dates-gap",
        severity: "warning",
        messageKey: "issues.unexplainedGap",
        sectionId: experienceSectionId,
        points: 5,
      });
      break;
    }
  }

  const isSortedNewestFirst = ranges.every(
    (range, index) => index === 0 || ranges[index - 1].start >= range.start,
  );
  const orderingPoints = isSortedNewestFirst ? 5 : 0;
  if (!isSortedNewestFirst && ranges.length > 1) {
    issues.push({
      id: "dates-newest-first",
      severity: "info",
      messageKey: "issues.notNewestFirst",
      sectionId: experienceSectionId,
      points: 5,
    });
  }

  return { earned: orderPoints + gapPoints + orderingPoints, max: 20, issues };
}
