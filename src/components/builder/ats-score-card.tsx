"use client";

import { useTranslations } from "next-intl";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { updateAtsScoreAction } from "@/actions/resume-ats.actions";
import { calculateAtsScore } from "@/lib/ats/score";
import type { AtsIssue } from "@/lib/ats/types";
import { ATS_SCORE_THRESHOLDS } from "@/lib/constants/ats";
import { cn } from "@/lib/utils";
import { useBuilderPreview } from "./builder-preview-context";
import { AtsAxisBreakdown } from "./ats/ats-axis-breakdown";
import { AtsIssueList } from "./ats/ats-issue-list";
import { KeywordMatchPanel } from "./keyword-match-panel";

function scoreColorClass(score: number): string {
  if (score < ATS_SCORE_THRESHOLDS.red) return "bg-destructive";
  if (score < ATS_SCORE_THRESHOLDS.amber) return "bg-warning";
  return "bg-success";
}

function scoreTextClass(score: number): string {
  if (score < ATS_SCORE_THRESHOLDS.red) return "text-destructive";
  if (score < ATS_SCORE_THRESHOLDS.amber) return "text-warning";
  return "text-success";
}

export function AtsScoreCard({ resumeId }: { resumeId: string }) {
  const t = useTranslations("ats");
  const { personalInfo, summary, sections, itemsBySectionId } = useBuilderPreview();
  const [jobPostingText, setJobPostingText] = useState("");
  // Scoring re-runs the whole vocabulary scan; deferring keeps typing in the textarea smooth.
  const deferredPostingText = useDeferredValue(jobPostingText);

  const result = useMemo(
    () =>
      calculateAtsScore({
        personalInfo,
        summary,
        sections,
        itemsBySectionId,
        jobPostingText: deferredPostingText,
      }),
    [personalInfo, summary, sections, itemsBySectionId, deferredPostingText],
  );

  useEffect(() => {
    void updateAtsScoreAction(resumeId, result.total);
  }, [resumeId, result.total]);

  function stepHrefForIssue(issue: AtsIssue): string | null {
    if (!issue.sectionId) return null;
    const section = sections.find((candidate) => candidate.id === issue.sectionId);
    if (!section) return null;
    return `/builder/${resumeId}/${section.type}`;
  }

  return (
    <div className="border-border bg-muted/30 flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold">{t("title")}</h2>
        <span className={cn("text-lg font-bold", scoreTextClass(result.total))}>
          {result.total}/100
        </span>
      </div>

      <div className="bg-border h-2 w-full overflow-hidden rounded-full">
        <div
          className={cn("h-full transition-all", scoreColorClass(result.total))}
          style={{ width: `${result.total}%` }}
        />
      </div>

      <AtsAxisBreakdown axes={result.axes} />

      {result.issues.length > 0 ? (
        <AtsIssueList issues={result.issues} hrefForIssue={stepHrefForIssue} />
      ) : (
        <p className="text-success text-sm">{t("noIssues")}</p>
      )}

      <KeywordMatchPanel
        analysis={result.keywordAnalysis}
        value={jobPostingText}
        onChange={setJobPostingText}
        skillsHref={`/builder/${resumeId}/skills`}
      />
    </div>
  );
}
