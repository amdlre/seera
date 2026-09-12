"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDraftRegistry } from "@/hooks/use-draft-registry";
import { useRouter } from "@/i18n/navigation";

/**
 * Leaves the builder for the dashboard. Since nothing is saved while typing,
 * the dialog only appears when this step actually holds unsaved edits.
 */
export function BuilderExitButton() {
  const t = useTranslations("builder.exit");
  const router = useRouter();
  const registry = useDraftRegistry();
  const [open, setOpen] = useState(false);
  const [isSaving, startSaving] = useTransition();

  function handleBack() {
    if (registry?.hasUnsavedChanges) {
      setOpen(true);
      return;
    }
    router.push("/dashboard");
  }

  function saveAndLeave() {
    startSaving(async () => {
      const saved = (await registry?.saveAll()) ?? true;
      if (!saved) {
        toast.error(t("saveFailed"));
        return;
      }
      router.push("/dashboard");
    });
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleBack}>
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
        {t("back")}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("stay")}</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isSaving}
            >
              {t("discard")}
            </Button>
            <Button onClick={saveAndLeave} disabled={isSaving}>
              {isSaving ? t("saving") : t("save")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
