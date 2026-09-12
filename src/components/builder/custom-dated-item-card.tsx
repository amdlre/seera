"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AutosaveIndicator } from "@/components/builder/autosave-indicator";
import { MonthYearPicker } from "@/components/builder/month-year-picker";
import { useItemForm } from "@/hooks/use-item-form";
import {
  customDatedItemDraftSchema,
  type CustomDatedItemDraftInput,
} from "@/lib/validations/resume/custom-section";

export function CustomDatedItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: CustomDatedItemDraftInput;
}) {
  const t = useTranslations("builder.custom");
  const tCommon = useTranslations("builder.common");
  const { form, status } = useItemForm({
    schema: customDatedItemDraftSchema,
    kind: "customDated",
    sectionId,
    itemId,
    defaultValues: initialData,
  });

  const isCurrent = form.watch("isCurrent") ?? false;

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <div className="flex justify-end">
          <AutosaveIndicator status={status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="titleAr"
            render={({ field }) => (
              <FormItem>
                <Label>{t("itemTitleAr")}</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="titleEn"
            render={({ field }) => (
              <FormItem>
                <Label>{t("itemTitleEn")}</Label>
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>{tCommon("startDate")}</Label>
            <MonthYearPicker
              value={{ month: form.watch("startMonth") ?? null, year: form.watch("startYear") ?? null }}
              onChange={(value) => {
                form.setValue("startMonth", value.month, { shouldDirty: true });
                form.setValue("startYear", value.year, { shouldDirty: true });
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{tCommon("endDate")}</Label>
            <MonthYearPicker
              value={{ month: form.watch("endMonth") ?? null, year: form.watch("endYear") ?? null }}
              onChange={(value) => {
                form.setValue("endMonth", value.month, { shouldDirty: true });
                form.setValue("endYear", value.year, { shouldDirty: true });
              }}
              disabled={isCurrent}
            />
            <Label className="flex items-center gap-2 text-sm font-normal">
              <Checkbox
                checked={isCurrent}
                onCheckedChange={(checked) => {
                  const checkedBool = checked === true;
                  form.setValue("isCurrent", checkedBool, { shouldDirty: true });
                  if (checkedBool) {
                    form.setValue("endMonth", null, { shouldDirty: true });
                    form.setValue("endYear", null, { shouldDirty: true });
                  }
                }}
              />
              {tCommon("current")}
            </Label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="descriptionAr"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionEn"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea rows={3} dir="ltr" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
