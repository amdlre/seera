"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
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
import { useAutosaveRegistry } from "@/hooks/use-autosave-registry";
import { useRouter } from "@/i18n/navigation";

/**
 * Leaves the builder for the dashboard, first asking whether to commit edits
 * that are still inside the autosave debounce window or drop them.
 */
export function BuilderExitButton() {
  const t = useTranslations("builder.exit");
  const router = useRouter();
  const registry = useAutosaveRegistry();
  const [open, setOpen] = useState(false);
  const [isSaving, startSaving] = useTransition();

  function saveAndLeave() {
    startSaving(async () => {
      await registry?.flushAll();
      router.push("/dashboard");
    });
  }

  function discardAndLeave() {
    router.push("/dashboard");
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
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
            <Button variant="outline" onClick={discardAndLeave} disabled={isSaving}>
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
