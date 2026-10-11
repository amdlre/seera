"use client";

import { CircleX, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { AtsIssue, AtsIssueSeverity } from "@/lib/ats/types";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<AtsIssueSeverity, { icon: LucideIcon; className: string }> = {
  error: { icon: CircleX, className: "text-destructive" },
  warning: { icon: TriangleAlert, className: "text-warning" },
  info: { icon: Info, className: "text-info" },
};

type AtsIssueListProps = {
  issues: AtsIssue[];
  hrefForIssue: (issue: AtsIssue) => string | null;
};

/**
 * Every open ATS issue, colored by severity (red error, yellow warning,
 * blue tip) and tagged with the points fixing it would add to the score.
 */
export function AtsIssueList({ issues, hrefForIssue }: AtsIssueListProps) {
  const t = useTranslations("ats");

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {t("fixThisTitle")}
      </h3>
      <ul className="flex flex-col gap-2">
        {issues.map((issue) => {
          const href = hrefForIssue(issue);
          const { icon: Icon, className } = SEVERITY_STYLE[issue.severity];
          const points = Math.round(issue.points);
          return (
            <li key={issue.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-start gap-2">
                <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden="true" />
                <span className="sr-only">{t(`severity.${issue.severity}`)}</span>
                <span className="text-foreground">{t(issue.messageKey)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {points > 0 && (
                  <span className={cn("text-xs font-semibold tabular-nums", className)}>
                    {t("pointsGain", { points })}
                  </span>
                )}
                {href && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={href}>{t("fixThisButton")}</Link>
                  </Button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
