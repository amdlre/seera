"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { savePersonalInfoAction } from "@/actions/resume.actions";
import { Form } from "@/components/ui/form";
import { useDraftForm } from "@/hooks/use-draft-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import { formatPhoneInternational } from "@/lib/resume/phone";
import { personalInfoSchema, type PersonalInfoInput } from "@/lib/validations/resume/personal-info";
import { AutosaveIndicator } from "./autosave-indicator";
import { useBuilderPreview } from "./builder-preview-context";
import { EnglishCityHint } from "./english-city-hint";
import { GuidedInputField } from "./guided-input-field";
import { JobTitleMismatchHint } from "./job-title-mismatch-hint";

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
    // Never submitted (drafts save on demand) — validate on blur so errors show.
    mode: "onTouched",
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

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-foreground text-xl font-semibold">{t("title")}</h1>
          <AutosaveIndicator status={status} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <GuidedInputField
            form={form}
            name="fullNameAr"
            label={t("fullNameAr")}
            required
            guide={FIELD_GUIDES.fullNameAr}
          />
          <GuidedInputField
            form={form}
            name="fullNameEn"
            label={t("fullNameEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.fullNameEn}
          />
          <GuidedInputField
            form={form}
            name="targetJobTitleAr"
            label={t("targetJobTitleAr")}
            required
            guide={FIELD_GUIDES.targetJobTitleAr}
          />
          <GuidedInputField
            form={form}
            name="targetJobTitleEn"
            label={t("targetJobTitleEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.targetJobTitleEn}
          />
          <JobTitleMismatchHint
            titleAr={form.watch("targetJobTitleAr")}
            titleEn={form.watch("targetJobTitleEn")}
          />
          <GuidedInputField
            form={form}
            name="email"
            label={t("email")}
            required
            type="email"
            dir="ltr"
            guide={FIELD_GUIDES.email}
          />
          <GuidedInputField
            form={form}
            name="phone"
            label={t("phone")}
            required
            type="tel"
            dir="ltr"
            guide={FIELD_GUIDES.phone}
            formatOnBlur={formatPhoneInternational}
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
          <GuidedInputField
            form={form}
            name="linkedin"
            label={t("linkedin")}
            dir="ltr"
            guide={FIELD_GUIDES.linkedin}
            placeholder={t("linkedinPlaceholder")}
          />
          <GuidedInputField
            form={form}
            name="portfolioUrl"
            label={t("portfolioUrl")}
            dir="ltr"
            guide={FIELD_GUIDES.portfolioUrl}
            placeholder={t("portfolioUrlPlaceholder")}
          />
        </div>
      </form>
    </Form>
  );
}
