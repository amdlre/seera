import { JOB_ROLE_FAMILIES } from "@/lib/constants/job-roles";
import { countTermOccurrences, normalizeText } from "@/lib/ats/text-normalize";

function detectRoleFamilies(title: string): Set<string> {
  const normalizedTitle = normalizeText(title);
  const families = new Set<string>();
  for (const family of JOB_ROLE_FAMILIES) {
    if (
      family.terms.some((term) => countTermOccurrences(normalizedTitle, normalizeText(term)) > 0)
    ) {
      families.add(family.id);
    }
  }
  return families;
}

/**
 * Detects when the Arabic and English versions of a job title describe
 * different roles (e.g. "مطوّر واجهات أمامية" vs "Full Stack Developer").
 * Returns true only when both titles map to known role families and they
 * share none — an unknown title is never flagged.
 */
export function hasJobTitleMismatch(
  titleAr: string | undefined,
  titleEn: string | undefined,
): boolean {
  if (!titleAr?.trim() || !titleEn?.trim()) {
    return false;
  }
  const arabicFamilies = detectRoleFamilies(titleAr);
  const englishFamilies = detectRoleFamilies(titleEn);
  if (arabicFamilies.size === 0 || englishFamilies.size === 0) {
    return false;
  }
  return ![...arabicFamilies].some((family) => englishFamilies.has(family));
}
