"use client";

import { useTranslations } from "next-intl";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { useItemForm } from "@/hooks/use-item-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import {
  type LanguageItemInput,
  languageItemSchema,
  type LanguageLevel,
} from "@/lib/validations/resume/languages";
import { AutosaveIndicator } from "./autosave-indicator";

export function LanguageItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: LanguageItemInput;
}) {
  const t = useTranslations("builder.languages");
  const { form, status } = useItemForm({
    schema: languageItemSchema,
    kind: "language",
    sectionId,
    itemId,
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <div className="flex justify-end">
          <AutosaveIndicator status={status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="languageAr"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("languageAr")}
                required
                guide={FIELD_GUIDES.languageName}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("languageAr", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="languageEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("languageEn")}
                required
                guide={FIELD_GUIDES.languageName}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("languageEn", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>
              {t("level")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch("level")}
              onValueChange={(value) =>
                form.setValue("level", value as LanguageLevel, { shouldDirty: true })
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="native">{t("levels.native")}</SelectItem>
                <SelectItem value="advanced">{t("levels.advanced")}</SelectItem>
                <SelectItem value="intermediate">{t("levels.intermediate")}</SelectItem>
                <SelectItem value="basic">{t("levels.basic")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField
            control={form.control}
            name="detail"
            render={({ field }) => (
              <FormItem>
                <Label>{t("detail")}</Label>
                <FormControl>
                  <Input {...field} placeholder={t("detailPlaceholder")} dir="ltr" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
