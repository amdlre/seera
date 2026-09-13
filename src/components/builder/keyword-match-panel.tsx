"use client";

import { Check, ChevronDown, CircleAlert, ScanSearch, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import type { KeywordAnalysis, KeywordMatch } from "@/lib/ats/types";
import { VOCABULARY_CATEGORIES } from "@/lib/ats/vocabulary/types";
import { cn } from "@/lib/utils";

/** A term named at least this often in the posting is flagged as a priority. */
const PRIORITY_MENTIONS = 2;

function groupByCategory(matches: KeywordMatch[]): [string, KeywordMatch[]][] {
  return VOCABULARY_CATEGORIES.map((category) => [
    category,
    matches.filter((match) => match.category === category),
  ] as [string, KeywordMatch[]]).filter(([, group]) => group.length > 0);
}

function TermChip({ match, tone }: { match: KeywordMatch; tone: "missing" | "matched" }) {
  const t = useTranslations("ats.keywords");
  const isPriority = tone === "missing" && match.occurrences >= PRIORITY_MENTIONS;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "matched" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        tone === "missing" && !isPriority &&
          "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
        isPriority && "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      )}
      title={t("mentions", { count: match.occurrences })}
    >
      {tone === "matched" && <Check className="size-3" aria-hidden="true" />}
      <bdi>{match.label}</bdi>
      {match.occurrences > 1 && <span className="opacity-70">×{match.occurrences}</span>}
    </span>
  );
}

function CoverageMeter({ matched, total }: { matched: number; total: number }) {
  const t = useTranslations("ats.keywords");
  const percent = Math.round((matched / total) * 100);
  const tone = percent >= 70 ? "bg-emerald-500" : percent >= 40 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground font-medium">{t("coverageTitle")}</span>
        <span className="text-muted-foreground">
          {t("coverageCount", { matched, total })} · <span className="font-semibold">{percent}%</span>
        </span>
      </div>
      <div className="bg-border h-1.5 overflow-hidden rounded-full">
        <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/**
 * Job-posting input plus the skills analysis: which recognised terms the
 * resume already covers, and which are missing, grouped by category.
 */
export function KeywordMatchPanel({
  analysis,
  value,
  onChange,
  skillsHref,
}: {
  analysis: KeywordAnalysis;
  value: string;
  onChange: (next: string) => void;
  skillsHref: string;
}) {
  const t = useTranslations("ats.keywords");
  const tCategory = useTranslations("ats.categories");
  const [showMatched, setShowMatched] = useState(false);
  const total = analysis.matched.length + analysis.missing.length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="job-posting-text" className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
          <ScanSearch className="text-primary size-4" aria-hidden="true" />
          {t("inputLabel")}
        </label>
        {value && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => onChange("")}>
            <X className="size-3" aria-hidden="true" />
            {t("clear")}
          </Button>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{t("inputHint")}</p>
      <Textarea
        id="job-posting-text"
        rows={value ? 5 : 3}
        placeholder={t("inputPlaceholder")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="resize-y"
      />

      {analysis.hasPosting && total === 0 && (
        <p className="text-muted-foreground bg-muted/50 rounded-lg p-3 text-xs">{t("noTermsFound")}</p>
      )}

      {total > 0 && (
        <div className="border-border bg-background flex flex-col gap-4 rounded-lg border p-3">
          <CoverageMeter matched={analysis.matched.length} total={total} />

          {analysis.missing.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                <CircleAlert className="size-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                {t("missingTitle", { count: analysis.missing.length })}
              </h4>
              {groupByCategory(analysis.missing).map(([category, group]) => (
                <div key={category} className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-[11px] font-medium">{tCategory(category)}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.map((match) => <TermChip key={match.id} match={match} tone="missing" />)}
                  </div>
                </div>
              ))}
              <div className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 rounded-md p-2.5">
                <p className="text-muted-foreground text-xs">{t("missingHint")}</p>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                  <Link href={skillsHref}>{t("goToSkills")}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{t("allCovered")}</p>
          )}

          {analysis.matched.length > 0 && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowMatched((open) => !open)}
                aria-expanded={showMatched}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium"
              >
                <ChevronDown className={cn("size-3.5 transition-transform", showMatched && "rotate-180")} aria-hidden="true" />
                {t("matchedTitle", { count: analysis.matched.length })}
              </button>
              {showMatched && (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matched.map((match) => <TermChip key={match.id} match={match} tone="matched" />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
