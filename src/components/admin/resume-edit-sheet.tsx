"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateResumeAsAdminAction } from "@/actions/admin-resumes.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AdminResumeRow } from "@/server/repositories/admin-resumes.repository";

export function ResumeEditSheet({
  resume,
  open,
  onOpenChange,
  onSaved,
}: {
  resume: AdminResumeRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const t = useTranslations("admin.resumeSheet");
  const tGlobal = useTranslations();
  const [title, setTitle] = useState(resume?.title ?? "");
  const [status, setStatus] = useState<"draft" | "completed">(resume?.status ?? "draft");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!resume) return;
    startTransition(async () => {
      const result = await updateResumeAsAdminAction({ resumeId: resume.id, title, status });
      if (!result.success) {
        toast.error(tGlobal(result.messageKey));
        return;
      }
      toast.success(t("saved"));
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        {resume && (
          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">{t("owner")}</span>
              <span className="text-foreground">
                {resume.userFullName} — {resume.userEmail}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-resume-title">{t("resumeTitle")}</Label>
              <Input id="admin-resume-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("status")}</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as "draft" | "completed")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("statusDraft")}</SelectItem>
                  <SelectItem value="completed">{t("statusCompleted")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-muted-foreground flex flex-col gap-1 text-sm">
              <span>{t("atsScore")}: {resume.atsScore}/100</span>
              <span>{t("exports")}: AR {resume.exportsAr} · EN {resume.exportsEn}</span>
            </div>

            <Button asChild variant="outline" className="w-fit gap-2">
              <a href={`/print/${resume.id}?lang=ar`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                {t("openPreview")}
              </a>
            </Button>
          </div>
        )}

        <SheetFooter>
          <Button onClick={handleSave} disabled={isPending || !resume}>
            {isPending ? t("saving") : t("save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
