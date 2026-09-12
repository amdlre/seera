"use client";

import { Check, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAutosaveRegistry } from "@/hooks/use-autosave-registry";

/**
 * Commits any edit still inside the autosave debounce window and confirms it,
 * giving the invisible autosave a visible, reassuring affordance.
 */
export function SaveDraftButton() {
  const t = useTranslations("builder.nav");
  const registry = useAutosaveRegistry();
  const [justSaved, setJustSaved] = useState(false);
  const [isSaving, startSaving] = useTransition();

  function handleSave() {
    startSaving(async () => {
      await registry?.flushAll();
      toast.success(t("draftSaved"), { description: t("draftSavedHint") });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    });
  }

  return (
    <Button variant="outline" onClick={handleSave} disabled={isSaving} className="gap-1.5">
      {justSaved ? <Check className="size-4" /> : <Save className="size-4" />}
      {isSaving ? t("savingDraft") : t("saveDraft")}
    </Button>
  );
}
