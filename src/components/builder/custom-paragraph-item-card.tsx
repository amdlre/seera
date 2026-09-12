"use client";

import { useTranslations } from "next-intl";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { AutosaveIndicator } from "@/components/builder/autosave-indicator";
import { useItemForm } from "@/hooks/use-item-form";
import {
  customParagraphItemDraftSchema,
  type CustomParagraphItemDraftInput,
} from "@/lib/validations/resume/custom-section";

export function CustomParagraphItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: CustomParagraphItemDraftInput;
}) {
  const t = useTranslations("builder.custom");
  const { form, status } = useItemForm({
    schema: customParagraphItemDraftSchema,
    kind: "customParagraph",
    sectionId,
    itemId,
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-3">
        <div className="flex justify-end">
          <AutosaveIndicator status={status} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="textAr"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea rows={4} placeholder={t("paragraphPlaceholderAr")} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textEn"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea rows={4} dir="ltr" placeholder={t("paragraphPlaceholderEn")} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
