"use client";

import { Check, CircleAlert, Loader2, PencilLine } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DraftStatus } from "@/hooks/use-draft-form";
import { cn } from "@/lib/utils";

/** Shows whether this step holds unsaved edits, is saving, or is saved. */
export function AutosaveIndicator({ status }: { status: DraftStatus }) {
  const t = useTranslations("builder.autosave");

  if (status === "idle") {
    return null;
  }

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs",
        status === "error" && "text-destructive",
        status === "unsaved" && "text-amber-600 dark:text-amber-400",
        (status === "saving" || status === "saved") && "text-muted-foreground",
      )}
      role="status"
    >
      {status === "unsaved" && <PencilLine className="size-3" />}
      {status === "saving" && <Loader2 className="size-3 animate-spin" />}
      {status === "saved" && <Check className="size-3" />}
      {status === "error" && <CircleAlert className="size-3" />}
      {status === "unsaved" && t("unsaved")}
      {status === "saving" && t("saving")}
      {status === "saved" && t("saved")}
      {status === "error" && t("error")}
    </p>
  );
}
