import { ChevronLeft, FileText } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { Resume } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { ATS_SCORE_THRESHOLDS } from "@/lib/constants/ats";
import { cn } from "@/lib/utils";

function scoreTone(score: number): string {
  if (score >= ATS_SCORE_THRESHOLDS.amber) return "text-emerald-600 dark:text-emerald-400";
  if (score >= ATS_SCORE_THRESHOLDS.red) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

/** One saved resume on the dashboard: status, ATS score, and last-edited time. */
export function ResumeCard({ resume }: { resume: Resume }) {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  const isCompleted = resume.status === "completed";

  return (
    <Link
      href={`/builder/${resume.id}/personal`}
      className="border-border bg-card hover:border-primary/60 hover:bg-accent/40 group flex items-center gap-4 rounded-xl border p-4 transition-colors"
    >
      <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
        <FileText className="size-5" aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-foreground truncate font-medium">{resume.title}</p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
              isCompleted
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isCompleted ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            {t(`status.${resume.status}`)}
          </span>
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span>
            {t("atsLabel")}{" "}
            <span className={cn("font-semibold", scoreTone(resume.atsScore))}>
              {resume.atsScore}
            </span>
            <span className="text-muted-foreground">/100</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>{t("updatedAt", { date: format.relativeTime(resume.updatedAt) })}</span>
        </div>
      </div>

      <ChevronLeft
        className="text-muted-foreground group-hover:text-primary size-5 shrink-0 transition-colors ltr:rotate-180"
        aria-hidden="true"
      />
    </Link>
  );
}
