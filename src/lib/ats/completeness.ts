import { personalInfoSchema } from "@/lib/validations/resume/personal-info";
import { summarySchema } from "@/lib/validations/resume/summary";
import { findItems, findSectionId, type AtsAxisResult, type AtsIssue, type AtsScoreInput } from "./types";

const POINTS = {
  personal: 10,
  summary: 5,
  experience: 5,
  education: 5,
  skills: 5,
};

/**
 * Scores the "completeness" axis (30 pts): the five core sections present
 * and filled, plus a target job title — ATS-CRITERIA.md §4.
 */
export function scoreCompleteness(input: AtsScoreInput): AtsAxisResult {
  const issues: AtsIssue[] = [];
  let earned = 0;

  if (personalInfoSchema.safeParse(input.personalInfo).success) {
    earned += POINTS.personal;
  } else {
    issues.push({
      id: "completeness-personal",
      severity: "error",
      messageKey: "issues.personalIncomplete",
      sectionId: findSectionId(input, "personal"),
      points: POINTS.personal,
    });
  }

  if (summarySchema.safeParse(input.summary).success) {
    earned += POINTS.summary;
  } else {
    issues.push({
      id: "completeness-summary",
      severity: "warning",
      messageKey: "issues.summaryIncomplete",
      sectionId: findSectionId(input, "summary"),
      points: POINTS.summary,
    });
  }

  if (!input.personalInfo.targetJobTitleAr && !input.personalInfo.targetJobTitleEn) {
    issues.push({
      id: "completeness-job-title",
      severity: "warning",
      messageKey: "issues.missingJobTitle",
      sectionId: findSectionId(input, "personal"),
      points: 0,
    });
  }

  const sectionsToCheck: Array<{ type: string; key: keyof typeof POINTS; label: string }> = [
    { type: "experience", key: "experience", label: "experienceEmpty" },
    { type: "education", key: "education", label: "educationEmpty" },
    { type: "skills", key: "skills", label: "skillsEmpty" },
  ];

  for (const section of sectionsToCheck) {
    if (findItems(input, section.type).length > 0) {
      earned += POINTS[section.key];
    } else {
      issues.push({
        id: `completeness-${section.type}`,
        severity: "error",
        messageKey: `issues.${section.label}`,
        sectionId: findSectionId(input, section.type),
        points: POINTS[section.key],
      });
    }
  }

  return { earned, max: 30, issues };
}
