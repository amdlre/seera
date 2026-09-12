"use client";

import { Printer } from "lucide-react";
import { useTransition } from "react";
import { logExportAction } from "@/actions/resume-exports.actions";
import { Button } from "@/components/ui/button";

type PrintButtonProps = {
  resumeId: string;
  language: "ar" | "en";
  label: string;
};

/**
 * Logs the export, then opens the ATS-clean /print page in a new tab which
 * auto-triggers window.print() once fonts are ready (PROJECT-BRIEF §6).
 */
export function PrintButton({ resumeId, language, label }: PrintButtonProps) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await logExportAction(resumeId, language, "print");
      window.open(`/print/${resumeId}?lang=${language}&autoprint=1`, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <Button type="button" size="lg" onClick={onClick} disabled={isPending} className="gap-2">
      <Printer className="size-4" />
      {label}
    </Button>
  );
}
