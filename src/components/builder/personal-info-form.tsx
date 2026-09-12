"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { savePersonalInfoAction } from "@/actions/resume.actions";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { useDraftForm } from "@/hooks/use-draft-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import { personalInfoSchema, type PersonalInfoInput } from "@/lib/validations/resume/personal-info";
import { AutosaveIndicator } from "./autosave-indicator";
import { useBuilderPreview } from "./builder-preview-context";

const EMPTY_VALUES: PersonalInfoInput = {
  fullNameAr: "",
  fullNameEn: "",
  targetJobTitleAr: "",
  targetJobTitleEn: "",
  email: "",
  phone: "",
  cityCountryAr: "",
  cityCountryEn: "",
  linkedin: "",
  portfolioUrl: "",
};

export function PersonalInfoForm({ resumeId }: { resumeId: string }) {
  const t = useTranslations("builder.personal");
  const { personalInfo, updatePersonalInfo } = useBuilderPreview();

  const form = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { ...EMPTY_VALUES, ...personalInfo },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is a stable, documented subscription API; it isn't a value the compiler needs to memoize.
    const subscription = form.watch((values) => updatePersonalInfo(values as PersonalInfoInput));
    return () => subscription.unsubscribe();
  }, [form, updatePersonalInfo]);

  const status = useDraftForm(form.watch, async (values) => {
    const result = await savePersonalInfoAction(resumeId, values);
    return result.success;
  });

  function buildUseExampleHandler(fieldName: keyof PersonalInfoInput) {
    return (value: string) => form.setValue(fieldName, value, { shouldDirty: true });
  }

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-foreground text-xl font-semibold">{t("title")}</h1>
          <AutosaveIndicator status={status} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullNameAr"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("fullNameAr")}
                required
                guide={FIELD_GUIDES.fullNameAr}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("fullNameAr")}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="fullNameEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("fullNameEn")}
                required
                guide={FIELD_GUIDES.fullNameEn}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("fullNameEn")}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="targetJobTitleAr"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("targetJobTitleAr")}
                required
                guide={FIELD_GUIDES.targetJobTitleAr}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("targetJobTitleAr")}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="targetJobTitleEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("targetJobTitleEn")}
                required
                guide={FIELD_GUIDES.targetJobTitleEn}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("targetJobTitleEn")}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("email")}
                required
                guide={FIELD_GUIDES.email}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("email")}
              >
                <FormControl>
                  <Input type="email" dir="ltr" {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("phone")}
                required
                guide={FIELD_GUIDES.phone}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("phone")}
              >
                <FormControl>
                  <Input type="tel" dir="ltr" {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="cityCountryAr"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("cityCountryAr")}
                required
                guide={FIELD_GUIDES.cityCountryAr}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("cityCountryAr")}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="cityCountryEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("cityCountryEn")}
                required
                guide={FIELD_GUIDES.cityCountryEn}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("cityCountryEn")}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="linkedin"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("linkedin")}
                guide={FIELD_GUIDES.linkedin}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("linkedin")}
              >
                <FormControl>
                  <Input dir="ltr" {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="portfolioUrl"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("portfolioUrl")}
                guide={FIELD_GUIDES.portfolioUrl}
                errorMessageKey={fieldState.error?.message}
                onUseExample={buildUseExampleHandler("portfolioUrl")}
              >
                <FormControl>
                  <Input dir="ltr" {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
