"use client";

import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDraftRegistry } from "@/hooks/use-draft-registry";
import { usePathname, useRouter } from "@/i18n/navigation";
import { getAdjacentSteps } from "@/lib/constants/builder";

function stepHref(resumeId: string, stepId: string): string {
  return stepId === "review" ? `/builder/${resumeId}/review` : `/builder/${resumeId}/${stepId}`;
}

/**
 * Previous / Save as draft / Next. Nothing is written while the user types, so
 * every one of these three saves the step first — moving on must never drop
 * what was just typed.
 */
export function BuilderBottomNav({ resumeId }: { resumeId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("builder.nav");
  const registry = useDraftRegistry();
  const [justSaved, setJustSaved] = useState(false);
  const [isBusy, startBusy] = useTransition();

  const currentStepId = pathname.split("/").filter(Boolean).pop() ?? "personal";
  const { previous, next } = getAdjacentSteps(currentStepId);

  function saveThen(navigateTo?: string) {
    startBusy(async () => {
      const saved = (await registry?.saveAll()) ?? true;
      if (!saved) {
        toast.error(t("saveFailed"));
        return;
      }

      if (navigateTo) {
        router.push(navigateTo);
        return;
      }

      toast.success(t("draftSaved"), { description: t("draftSavedHint") });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    });
  }

  return (
    <div className="border-border bg-background sticky bottom-0 flex items-center justify-end gap-2 border-t px-4 py-3">
      {previous && previous.implemented && (
        <Button
          variant="ghost"
          disabled={isBusy}
          onClick={() => saveThen(stepHref(resumeId, previous.id))}
          className="gap-1.5"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {t("previous")}
        </Button>
      )}

      <Button variant="outline" disabled={isBusy} onClick={() => saveThen()} className="gap-1.5">
        {justSaved ? <Check className="size-4" /> : <Save className="size-4" />}
        {isBusy ? t("savingDraft") : t("saveDraft")}
      </Button>

      {next && next.implemented && (
        <Button disabled={isBusy} onClick={() => saveThen(stepHref(resumeId, next.id))} className="gap-1.5">
          {t("next")}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
