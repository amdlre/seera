import {
  FIRST_PERSON_PRONOUNS_AR,
  FIRST_PERSON_PRONOUNS_EN,
  MAX_BULLETS_PER_EXPERIENCE,
  MAX_BULLET_WORDS,
  MIN_BULLETS_PER_EXPERIENCE,
  MIN_BULLET_WORDS,
  STRONG_VERBS_AR,
  STRONG_VERBS_EN,
  WEAK_PHRASES_AR,
  WEAK_PHRASES_EN,
} from "@/lib/constants/ats";
import { findItems, findSectionId, type AtsAxisResult, type AtsIssue, type AtsScoreInput } from "./types";

type BulletStats = {
  total: number;
  startsWithStrongVerb: number;
  containsNumber: number;
  lengthInRange: number;
  hasWeakPhraseOrFirstPerson: number;
};

function startsWithAny(text: string, list: string[]): boolean {
  const normalized = text.trim().toLowerCase();
  return list.some((entry) => normalized.startsWith(entry.toLowerCase()));
}

function containsAny(text: string, list: string[]): boolean {
  const normalized = ` ${text.trim().toLowerCase()} `;
  return list.some((entry) => normalized.includes(entry.toLowerCase()));
}

function analyzeBullets(bullets: string[], strongVerbs: string[], weakPhrases: string[], pronouns: string[]): BulletStats {
  const stats: BulletStats = {
    total: 0,
    startsWithStrongVerb: 0,
    containsNumber: 0,
    lengthInRange: 0,
    hasWeakPhraseOrFirstPerson: 0,
  };

  for (const bullet of bullets) {
    if (!bullet.trim()) {
      continue;
    }
    stats.total += 1;
    if (startsWithAny(bullet, strongVerbs)) stats.startsWithStrongVerb += 1;
    if (/\d/.test(bullet)) stats.containsNumber += 1;
    const wordCount = bullet.trim().split(/\s+/).length;
    if (wordCount >= MIN_BULLET_WORDS && wordCount <= MAX_BULLET_WORDS) stats.lengthInRange += 1;
    if (containsAny(bullet, weakPhrases) || containsAny(bullet, pronouns)) {
      stats.hasWeakPhraseOrFirstPerson += 1;
    }
  }

  return stats;
}

function mergeStats(a: BulletStats, b: BulletStats): BulletStats {
  return {
    total: a.total + b.total,
    startsWithStrongVerb: a.startsWithStrongVerb + b.startsWithStrongVerb,
    containsNumber: a.containsNumber + b.containsNumber,
    lengthInRange: a.lengthInRange + b.lengthInRange,
    hasWeakPhraseOrFirstPerson: a.hasWeakPhraseOrFirstPerson + b.hasWeakPhraseOrFirstPerson,
  };
}

/**
 * Scores the "writing quality" axis (25 pts) across every experience bullet:
 * strong verbs, measurable results, length, bullet count, and no filler
 * phrases or first-person pronouns — ATS-CRITERIA.md §3.3/§4.
 */
export function scoreWritingQuality(input: AtsScoreInput): AtsAxisResult {
  const issues: AtsIssue[] = [];
  const sectionId = findSectionId(input, "experience");
  const items = findItems(input, "experience");

  if (items.length === 0) {
    return { earned: 0, max: 25, issues: [] };
  }

  let combined: BulletStats = { total: 0, startsWithStrongVerb: 0, containsNumber: 0, lengthInRange: 0, hasWeakPhraseOrFirstPerson: 0 };
  let itemsWithGoodBulletCount = 0;

  for (const item of items) {
    const bulletsAr = Array.isArray(item.data.bulletsAr) ? (item.data.bulletsAr as string[]) : [];
    const bulletsEn = Array.isArray(item.data.bulletsEn) ? (item.data.bulletsEn as string[]) : [];

    const statsAr = analyzeBullets(bulletsAr, STRONG_VERBS_AR, WEAK_PHRASES_AR, FIRST_PERSON_PRONOUNS_AR);
    const statsEn = analyzeBullets(bulletsEn, STRONG_VERBS_EN, WEAK_PHRASES_EN, FIRST_PERSON_PRONOUNS_EN);
    combined = mergeStats(mergeStats(combined, statsAr), statsEn);

    const bulletCount = bulletsAr.filter(Boolean).length;
    if (bulletCount >= MIN_BULLETS_PER_EXPERIENCE && bulletCount <= MAX_BULLETS_PER_EXPERIENCE) {
      itemsWithGoodBulletCount += 1;
    }
  }

  if (combined.total === 0) {
    return { earned: 0, max: 25, issues: [] };
  }

  const ratio = (count: number) => count / combined.total;

  const strongVerbPoints = Math.round(ratio(combined.startsWithStrongVerb) * 8);
  const numberPoints = ratio(combined.containsNumber) >= 0.5 ? 7 : Math.round(ratio(combined.containsNumber) * 14);
  const lengthPoints = Math.round(ratio(combined.lengthInRange) * 5);
  const bulletCountPoints = Math.round((itemsWithGoodBulletCount / items.length) * 3);
  const cleanLanguagePoints = combined.hasWeakPhraseOrFirstPerson === 0 ? 2 : 0;

  if (strongVerbPoints < 8) {
    issues.push({ id: "writing-strong-verbs", severity: "warning", messageKey: "issues.weakVerbs", sectionId, points: 8 - strongVerbPoints });
  }
  if (ratio(combined.containsNumber) < 0.5) {
    issues.push({ id: "writing-numbers", severity: "warning", messageKey: "issues.missingNumbers", sectionId, points: 7 - numberPoints });
  }
  if (lengthPoints < 5) {
    issues.push({ id: "writing-length", severity: "info", messageKey: "issues.bulletLength", sectionId, points: 5 - lengthPoints });
  }
  if (bulletCountPoints < 3) {
    issues.push({ id: "writing-bullet-count", severity: "info", messageKey: "issues.bulletCount", sectionId, points: 3 - bulletCountPoints });
  }
  if (cleanLanguagePoints === 0) {
    issues.push({ id: "writing-clean-language", severity: "warning", messageKey: "issues.weakPhrasesOrFirstPerson", sectionId, points: 2 });
  }

  return {
    earned: strongVerbPoints + numberPoints + lengthPoints + bulletCountPoints + cleanLanguagePoints,
    max: 25,
    issues,
  };
}
