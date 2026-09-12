"use client";

import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ResumePreviewContent } from "./resume-preview-content";

/** Floating "Preview" button that opens the live preview as a Sheet on mobile. */
export function MobilePreviewSheet() {
  const t = useTranslations("builder.preview");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed end-4 bottom-20 z-40 gap-2 rounded-full shadow-lg lg:hidden"
        >
          <Eye className="size-4" />
          {t("mobileTrigger")}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ResumePreviewContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
