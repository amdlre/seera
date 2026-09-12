"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { updateAtsScoreAction } from "@/actions/resume-ats.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { calculateAtsScore } from "@/lib/ats/score";
import type { AtsIssue } from "@/lib/ats/types";
import { ATS_SCORE_THRESHOLDS } from "@/lib/constants/ats";
import { cn } from "@/lib/utils";
import { useBuilderPreview } from "./builder-preview-context";

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

  const result = useMemo(
    () =>
      calculateAtsScore({
        personalInfo,
        summary,
        sections,
        itemsBySectionId,
        jobPostingText,
      }),
    [personalInfo, summary, sections, itemsBySectionId, jobPostingText],
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
        <span className={cn("text-lg font-bold", scoreTextClass(result.total))}>{result.total}/100</span>
      </div>

      <div className="bg-border h-2 w-full overflow-hidden rounded-full">
        <div
          className={cn("h-full transition-all", scoreColorClass(result.total))}
          style={{ width: `${result.total}%` }}
        />
      </div>

      {result.issues.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("fixThisTitle")}
          </h3>
          <ul className="flex flex-col gap-2">
            {result.issues.slice(0, 8).map((issue) => {
              const href = stepHrefForIssue(issue);
              return (
                <li
                  key={issue.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-muted-foreground">{t(issue.messageKey)}</span>
                  {href && (
                    <Button asChild size="sm" variant="outline" className="shrink-0">
                      <Link href={href}>{t("fixThisButton")}</Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-success text-sm">{t("noIssues")}</p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="job-posting-text" className="text-muted-foreground text-xs font-semibold">
          {t("jobPostingLabel")}
        </label>
        <Textarea
          id="job-posting-text"
          rows={4}
          placeholder={t("jobPostingPlaceholder")}
          value={jobPostingText}
          onChange={(event) => setJobPostingText(event.target.value)}
        />
        {jobPostingText.trim() && (
          <p className="text-muted-foreground text-xs">
            {t("keywordMatch", {
              matched: result.matchedKeywords.length,
              total: result.matchedKeywords.length + result.missingKeywords.length,
            })}
            {result.missingKeywords.length > 0 && (
              <span> — {t("missingKeywords")}: {result.missingKeywords.join(", ")}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
