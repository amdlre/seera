"use client";

import { useTranslations } from "next-intl";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { useItemForm } from "@/hooks/use-item-form";
import { EMPLOYMENT_TYPES } from "@/lib/constants/experience";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import {
  experienceItemSchema,
  type ExperienceItemInput,
} from "@/lib/validations/resume/experience";
import { AutosaveIndicator } from "./autosave-indicator";
import { BulletListField } from "./bilingual-bullets-field";
import { EnglishCityHint } from "./english-city-hint";
import { GuidedInputField } from "./guided-input-field";
import { JobTitleMismatchHint } from "./job-title-mismatch-hint";
import { MonthYearPicker } from "./month-year-picker";

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
          <GuidedInputField
            form={form}
            name="titleAr"
            label={t("titleAr")}
            required
            guide={FIELD_GUIDES.experienceTitle}
          />
          <GuidedInputField
            form={form}
            name="titleEn"
            label={t("titleEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.experienceTitle}
          />
          <JobTitleMismatchHint titleAr={form.watch("titleAr")} titleEn={form.watch("titleEn")} />
          <GuidedInputField
            form={form}
            name="companyAr"
            label={t("companyAr")}
            required
            guide={FIELD_GUIDES.experienceCompanyAr}
          />
          <GuidedInputField
            form={form}
            name="companyEn"
            label={t("companyEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.experienceCompanyEn}
          />
          <GuidedInputField
            form={form}
            name="cityCountryAr"
            label={t("cityCountryAr")}
            required
            guide={FIELD_GUIDES.cityCountryAr}
          />
          <GuidedInputField
            form={form}
            name="cityCountryEn"
            label={t("cityCountryEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.cityCountryEn}
            renderHint={(value) => (
              <EnglishCityHint
                value={value}
                onFix={(fixed) =>
                  form.setValue("cityCountryEn", fixed, { shouldDirty: true, shouldValidate: true })
                }
              />
            )}
          />
          <FormField
            control={form.control}
            name="employmentType"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("employmentType")}
                required
                guide={FIELD_GUIDES.employmentType}
                errorMessageKey={fieldState.error?.message}
                onUseExample={() =>
                  form.setValue("employmentType", "full_time", { shouldDirty: true })
                }
              >
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((employmentType) => (
                      <SelectItem key={employmentType} value={employmentType}>
                        {t(`employmentTypes.${employmentType}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        <BulletListField
          label={t("bulletsAr")}
          tip={FIELD_GUIDES.experienceBullet.tip.ar}
          values={form.watch("bulletsAr")}
          onChange={(values) => form.setValue("bulletsAr", values, { shouldDirty: true })}
          dir="rtl"
          addLabel={t("addBullet")}
        />
        <BulletListField
          label={t("bulletsEn")}
          tip={FIELD_GUIDES.experienceBullet.tip.en}
          values={form.watch("bulletsEn")}
          onChange={(values) => form.setValue("bulletsEn", values, { shouldDirty: true })}
          dir="ltr"
          addLabel={t("addBullet")}
        />
      </form>
    </Form>
  );
}
