"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { useItemForm } from "@/hooks/use-item-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import { experienceItemSchema, type ExperienceItemInput } from "@/lib/validations/resume/experience";
import { AutosaveIndicator } from "./autosave-indicator";
import { MonthYearPicker } from "./month-year-picker";

function BulletListField({
  values,
  onChange,
  dir,
  addLabel,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  dir: "rtl" | "ltr";
  addLabel: string;
}) {
  function updateBullet(index: number, value: string) {
    onChange(values.map((bullet, i) => (i === index ? value : bullet)));
  }
  function removeBullet(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            dir={dir}
            rows={2}
            value={value}
            onChange={(event) => updateBullet(index, event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-fit"
            onClick={() => removeBullet(index)}
            aria-label="remove"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit gap-1"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

export function ExperienceItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: ExperienceItemInput;
}) {
  const t = useTranslations("builder.experience");
  const tCommon = useTranslations("builder.common");
  const { form, status } = useItemForm({
    schema: experienceItemSchema,
    kind: "experience",
    sectionId,
    itemId,
    defaultValues: initialData,
  });

  const isCurrent = form.watch("isCurrent");

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
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("titleAr")}
                required
                guide={FIELD_GUIDES.experienceTitle}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("titleAr", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="titleEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("titleEn")}
                required
                guide={FIELD_GUIDES.experienceTitle}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("titleEn", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("company")}
                required
                guide={FIELD_GUIDES.experienceCompany}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("company", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="cityCountry"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("cityCountry")}
                required
                guide={FIELD_GUIDES.experienceCityCountry}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("cityCountry", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>{tCommon("startDate")}</Label>
            <MonthYearPicker
              value={{ month: form.watch("startMonth"), year: form.watch("startYear") }}
              onChange={(value) => {
                form.setValue("startMonth", value.month, { shouldDirty: true });
                form.setValue("startYear", value.year, { shouldDirty: true });
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{tCommon("endDate")}</Label>
            <MonthYearPicker
              value={{ month: form.watch("endMonth"), year: form.watch("endYear") }}
              onChange={(value) => {
                form.setValue("endMonth", value.month, { shouldDirty: true });
                form.setValue("endYear", value.year, { shouldDirty: true });
              }}
              isCurrent={isCurrent}
              onCurrentChange={(checked) => {
                form.setValue("isCurrent", checked, { shouldDirty: true });
                if (checked) {
                  form.setValue("endMonth", null, { shouldDirty: true });
                  form.setValue("endYear", null, { shouldDirty: true });
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Label>{t("bulletsAr")}</Label>
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </div>
          <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
            <span aria-hidden="true">💡</span>
            <span>{FIELD_GUIDES.experienceBullet.tip.ar}</span>
          </p>
          <BulletListField
            values={form.watch("bulletsAr")}
            onChange={(values) => form.setValue("bulletsAr", values, { shouldDirty: true })}
            dir="rtl"
            addLabel={t("addBullet")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Label>{t("bulletsEn")}</Label>
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </div>
          <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
            <span aria-hidden="true">💡</span>
            <span>{FIELD_GUIDES.experienceBullet.tip.en}</span>
          </p>
          <BulletListField
            values={form.watch("bulletsEn")}
            onChange={(values) => form.setValue("bulletsEn", values, { shouldDirty: true })}
            dir="ltr"
            addLabel={t("addBullet")}
          />
        </div>

      </form>
    </Form>
  );
}
