"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { getAdjacentSteps } from "@/lib/constants/builder";
import { SaveDraftButton } from "./save-draft-button";

function stepHref(resumeId: string, stepId: string): string {
  return stepId === "review" ? `/builder/${resumeId}/review` : `/builder/${resumeId}/${stepId}`;
}

export function BuilderBottomNav({ resumeId }: { resumeId: string }) {
  const pathname = usePathname();
  const t = useTranslations("builder.nav");
  const currentStepId = pathname.split("/").filter(Boolean).pop() ?? "personal";
  const { previous, next } = getAdjacentSteps(currentStepId);

  return (
    <div className="border-border bg-background sticky bottom-0 flex items-center justify-between border-t px-4 py-3">
      {previous && previous.implemented ? (
        <Button asChild variant="outline">
          <Link href={stepHref(resumeId, previous.id)}>{t("previous")}</Link>
        </Button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <SaveDraftButton />
        {next && next.implemented && (
          <Button asChild>
            <Link href={stepHref(resumeId, next.id)}>{t("next")}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
