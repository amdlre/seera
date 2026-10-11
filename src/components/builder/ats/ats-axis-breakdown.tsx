"use client";

import { useTranslations } from "next-intl";
import type { AtsScoreResult } from "@/lib/ats/types";
import { ATS_AXIS_ORDER } from "@/lib/constants/ats";
import { cn } from "@/lib/utils";

function axisBarClass(earned: number, max: number): string {
  if (earned >= max) return "bg-success";
  if (earned === 0) return "bg-destructive";
  return "bg-warning";
}

/**
 * The "how your score is built" table: one row per weighted axis with its
 * earned/max points, so the user can see exactly where the missing points are.
 */
export function AtsAxisBreakdown({ axes }: { axes: AtsScoreResult["axes"] }) {
  const t = useTranslations("ats.breakdown");

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {t("title")}
      </h3>
      <ul className="flex flex-col gap-2">
        {ATS_AXIS_ORDER.map((axisId) => {
          const axis = axes[axisId];
          const earned = Math.round(axis.earned);
          return (
            <li key={axisId} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{t(`axes.${axisId}`)}</span>
                <span className="text-muted-foreground tabular-nums">
                  {t("points", { earned, max: axis.max })}
                </span>
              </div>
              <div className="bg-border h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className={cn("h-full transition-all", axisBarClass(earned, axis.max))}
                  style={{ width: `${(earned / axis.max) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
