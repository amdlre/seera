"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCustomSectionAction } from "@/actions/resume-sections.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldLabel } from "@/components/shared/field-label";
import { FormFieldMessage } from "@/components/shared/form-field-message";
import type { ResumeSection } from "@/db/schema";
import {
  createCustomSectionSchema,
  isNonStandardTitle,
  type CreateCustomSectionInput,
} from "@/lib/validations/resume/custom-section";

export function CustomSectionDialog({
  resumeId,
  onCreated,
}: {
  resumeId: string;
  onCreated: (section: ResumeSection) => void;
}) {
  const t = useTranslations("builder.custom");
  const tGlobal = useTranslations();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateCustomSectionInput>({
    resolver: zodResolver(createCustomSectionSchema),
    defaultValues: { titleAr: "", titleEn: "", layout: "bullets" },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is a stable, documented subscription API; it isn't a value the compiler needs to memoize.
  const titleAr = form.watch("titleAr");

  function onSubmit(values: CreateCustomSectionInput) {
    startTransition(async () => {
      const result = await createCustomSectionAction(resumeId, values);
      if (!result.success) {
        toast.error(tGlobal(result.messageKey));
        return;
      }

      onCreated({
        id: result.sectionId,
        resumeId,
        type: "custom",
        titleAr: values.titleAr,
        titleEn: values.titleEn,
        layout: values.layout,
        sortOrder: 0,
        isVisible: true,
        isCustom: true,
      });
      form.reset({ titleAr: "", titleEn: "", layout: "bullets" });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-fit gap-1.5">
          {t("addSection")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addSectionTitle")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="titleAr"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FieldLabel required>{t("sectionTitleAr")}</FieldLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormFieldMessage messageKey={fieldState.error?.message} />
                  {titleAr && isNonStandardTitle(titleAr) && (
                    <p className="text-warning text-xs">{t("nonStandardTitleWarning")}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="titleEn"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FieldLabel required>{t("sectionTitleEn")}</FieldLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" />
                  </FormControl>
                  <FormFieldMessage messageKey={fieldState.error?.message} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="layout"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel required>{t("sectionLayout")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bullets">{t("layouts.bullets")}</SelectItem>
                      <SelectItem value="dated_entries">{t("layouts.dated_entries")}</SelectItem>
                      <SelectItem value="paragraph">{t("layouts.paragraph")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("creating") : t("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
