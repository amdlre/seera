"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AutosaveStatus } from "@/hooks/use-autosave-form";
import { cn } from "@/lib/utils";

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  const t = useTranslations("builder.autosave");

  if (status === "idle") {
    return null;
  }

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs",
        status === "error" ? "text-destructive" : "text-muted-foreground",
      )}
      role="status"
    >
      {status === "saving" && <Loader2 className="size-3 animate-spin" />}
      {status === "saved" && <Check className="size-3" />}
      {status === "saving" && t("saving")}
      {status === "saved" && t("saved")}
      {status === "error" && t("error")}
    </p>
  );
}
