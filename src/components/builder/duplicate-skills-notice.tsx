"use client";

import { TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { PreviewItem } from "./builder-preview-context";
import { findDuplicateTags, parseTags } from "@/lib/resume/tags";

function duplicatesFor(items: PreviewItem[], field: "skillsAr" | "skillsEn"): string[] {
  return findDuplicateTags(
    items.map((item) => parseTags(typeof item.data[field] === "string" ? item.data[field] : "")),
  );
}

/** Lists skills that appear under more than one category — each should be listed once. */
export function DuplicateSkillsNotice({ items }: { items: PreviewItem[] }) {
  const t = useTranslations("builder.skills");
  const locale = useLocale();
  const duplicates = [
    ...new Set([...duplicatesFor(items, "skillsAr"), ...duplicatesFor(items, "skillsEn")]),
  ];
  if (duplicates.length === 0) {
    return null;
  }

  return (
    <p
      role="status"
      className="border-warning/50 bg-warning/10 text-foreground flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
    >
      <TriangleAlert className="text-warning mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        {t("duplicatesAcrossCategories", {
          skills: new Intl.ListFormat(locale, { type: "conjunction" }).format(duplicates),
        })}
      </span>
    </p>
  );
}
