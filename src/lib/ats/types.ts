import type { ResumeSection } from "@/db/schema";
import type { VocabularyCategory } from "./vocabulary/types";
import type { PersonalInfoDraftInput } from "@/lib/validations/resume/personal-info";
import type { SummaryDraftInput } from "@/lib/validations/resume/summary";

export type AtsIssueSeverity = "error" | "warning" | "info";

export type AtsIssue = {
  id: string;
  severity: AtsIssueSeverity;
  messageKey: string;
  sectionId?: string;
  points: number;
};

export type AtsAxisResult = {
  earned: number;
  max: number;
  issues: AtsIssue[];
};

export type AtsResumeItem = { id: string; data: Record<string, unknown> };

export type AtsScoreInput = {
  personalInfo: PersonalInfoDraftInput;
  summary: SummaryDraftInput;
  sections: ResumeSection[];
  itemsBySectionId: Record<string, AtsResumeItem[]>;
  /** Optional job-posting text pasted by the user, for the keyword-match axis. */
  jobPostingText?: string;
};

export type AtsScoreResult = {
  total: number;
  axes: {
    completeness: AtsAxisResult;
    dates: AtsAxisResult;
    writingQuality: AtsAxisResult;
    keywords: AtsAxisResult;
    technical: AtsAxisResult;
  };
  issues: AtsIssue[];
  keywordAnalysis: KeywordAnalysis;
};

/** One recognised term from a job posting, and how many times the posting mentions it. */
export type KeywordMatch = {
  id: string;
  label: string;
  category: VocabularyCategory;
  occurrences: number;
};

export type KeywordAnalysis = {
  hasPosting: boolean;
  matched: KeywordMatch[];
  missing: KeywordMatch[];
};

export function findItems(input: AtsScoreInput, type: string): AtsResumeItem[] {
  const section = input.sections.find((candidate) => candidate.type === type);
  return section ? (input.itemsBySectionId[section.id] ?? []) : [];
}

export function findSectionId(input: AtsScoreInput, type: string): string | undefined {
  return input.sections.find((candidate) => candidate.type === type)?.id;
}
