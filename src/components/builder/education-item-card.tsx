"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useItemForm } from "@/hooks/use-item-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import { educationItemSchema, type EducationItemInput } from "@/lib/validations/resume/education";
import { AutosaveIndicator } from "./autosave-indicator";
import { EnglishCityHint } from "./english-city-hint";
import { GuidedInputField } from "./guided-input-field";
import { buildYearOptions } from "./month-year-picker";

export function EducationItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: EducationItemInput;
}) {
  const t = useTranslations("builder.education");
  const { form, status } = useItemForm({
    schema: educationItemSchema,
    kind: "education",
    sectionId,
    itemId,
    defaultValues: initialData,
  });

  const years = buildYearOptions();
  const isExpected = form.watch("isExpected");

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <div className="flex justify-end">
          <AutosaveIndicator status={status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <GuidedInputField
            form={form}
            name="degreeAr"
            label={t("degreeAr")}
            required
            guide={FIELD_GUIDES.educationDegree}
          />
          <GuidedInputField
            form={form}
            name="degreeEn"
            label={t("degreeEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.educationDegree}
          />
          <GuidedInputField
            form={form}
            name="majorAr"
            label={t("majorAr")}
            required
            guide={FIELD_GUIDES.educationMajor}
          />
          <GuidedInputField
            form={form}
            name="majorEn"
            label={t("majorEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.educationMajor}
          />
          <GuidedInputField
            form={form}
            name="universityAr"
            label={t("universityAr")}
            required
            guide={FIELD_GUIDES.educationUniversity}
          />
          <GuidedInputField
            form={form}
            name="universityEn"
            label={t("universityEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.educationUniversity}
          />
          <GuidedInputField
            form={form}
            name="cityCountryAr"
            label={t("cityCountryAr")}
            guide={FIELD_GUIDES.cityCountryAr}
          />
          <GuidedInputField
            form={form}
            name="cityCountryEn"
            label={t("cityCountryEn")}
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
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>
              {t("graduationYear")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch("graduationYear")?.toString() ?? ""}
              onValueChange={(value) =>
                form.setValue("graduationYear", Number(value), { shouldDirty: true })
              }
              disabled={isExpected}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder={t("graduationYear")} />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Label className="flex items-center gap-2 text-sm font-normal">
            <Checkbox
              checked={isExpected}
              onCheckedChange={(checked) =>
                form.setValue("isExpected", checked === true, { shouldDirty: true })
              }
            />
            {t("isExpected")}
          </Label>

          <div className="flex flex-col gap-1.5">
            <Label>{t("gpa")}</Label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                step="0.01"
                className="w-20"
                value={form.watch("gpaValue") ?? ""}
                onChange={(event) =>
                  form.setValue(
                    "gpaValue",
                    event.target.value === "" ? null : Number(event.target.value),
                    { shouldDirty: true },
                  )
                }
              />
              <span className="text-muted-foreground text-sm">/</span>
              <Select
                value={form.watch("gpaScale")?.toString() ?? ""}
                onValueChange={(value) =>
                  form.setValue("gpaScale", Number(value) as 4 | 5, { shouldDirty: true })
                }
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
