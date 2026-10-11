"use client";

import { useTranslations } from "next-intl";
import { LiveResumePreview } from "./live-resume-preview";

/** Desktop-only fixed preview panel, per PROJECT-BRIEF §5.1. */
export function LivePreviewPanel() {
  const t = useTranslations("builder.preview");

  return (
    <aside className="border-border bg-muted/30 hidden w-96 shrink-0 border-s px-6 py-8 lg:block xl:w-[30rem]">
      <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        {t("title")}
      </h2>
      <LiveResumePreview />
    </aside>
  );
}
