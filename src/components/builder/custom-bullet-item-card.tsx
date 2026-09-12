"use client";

import { useTranslations } from "next-intl";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { AutosaveIndicator } from "@/components/builder/autosave-indicator";
import { useItemForm } from "@/hooks/use-item-form";
import {
  customBulletItemDraftSchema,
  type CustomBulletItemDraftInput,
} from "@/lib/validations/resume/custom-section";

export function CustomBulletItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: CustomBulletItemDraftInput;
}) {
  const t = useTranslations("builder.custom");
  const { form, status } = useItemForm({
    schema: customBulletItemDraftSchema,
    kind: "customBullet",
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
                  <Textarea rows={2} placeholder={t("bulletPlaceholderAr")} {...field} />
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
                  <Textarea rows={2} dir="ltr" placeholder={t("bulletPlaceholderEn")} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
