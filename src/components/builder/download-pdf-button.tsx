"use client";

import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { filenameFromDisposition } from "@/lib/pdf/filename";

type DownloadPdfButtonProps = {
  resumeId: string;
  language: "ar" | "en";
  label: string;
};

const FALLBACK_FILENAME = "Resume.pdf";

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a moment to start the download before releasing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function DownloadPdfButton({ resumeId, language, label }: DownloadPdfButtonProps) {
  const t = useTranslations("builder.review");
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/export/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId, lang: language }),
        });

        if (!response.ok) {
          toast.error(response.status === 429 ? t("pdfRateLimited") : t("pdfExportFailed"));
          return;
        }

        const filename =
          filenameFromDisposition(response.headers.get("Content-Disposition")) ?? FALLBACK_FILENAME;
        saveBlob(await response.blob(), filename);
      } catch {
        toast.error(t("pdfExportFailed"));
      }
    });
  }

  return (
    <Button type="button" size="lg" variant="outline" onClick={onClick} disabled={isPending} className="gap-2">
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {isPending ? t("generatingPdf") : label}
    </Button>
  );
}
