"use client";

import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type DownloadPdfButtonProps = {
  resumeId: string;
  language: "ar" | "en";
  label: string;
};

type ExportPdfResponse = { url: string; filename: string };

export function DownloadPdfButton({ resumeId, language, label }: DownloadPdfButtonProps) {
  const t = useTranslations("builder.review");
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, lang: language }),
      });

      if (!response.ok) {
        toast.error(t("pdfExportFailed"));
        return;
      }

      const data = (await response.json()) as ExportPdfResponse;
      window.open(data.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <Button type="button" size="lg" variant="outline" onClick={onClick} disabled={isPending} className="gap-2">
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {isPending ? t("generatingPdf") : label}
    </Button>
  );
}
