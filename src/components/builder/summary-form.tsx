"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { saveSummaryAction } from "@/actions/resume.actions";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { useAutosaveForm } from "@/hooks/use-autosave-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import { summarySchema, type SummaryInput } from "@/lib/validations/resume/summary";
import { AutosaveIndicator } from "./autosave-indicator";
import { useBuilderPreview } from "./builder-preview-context";

const EMPTY_VALUES: SummaryInput = { summaryAr: "", summaryEn: "" };

export function SummaryForm({ resumeId }: { resumeId: string }) {
  const t = useTranslations("builder.summary");
  const { summary, updateSummary } = useBuilderPreview();

  const form = useForm<SummaryInput>({
    resolver: zodResolver(summarySchema),
    defaultValues: { ...EMPTY_VALUES, ...summary },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is a stable, documented subscription API; it isn't a value the compiler needs to memoize.
    const subscription = form.watch((values) => updateSummary(values as SummaryInput));
    return () => subscription.unsubscribe();
  }, [form, updateSummary]);

  const status = useAutosaveForm(form.watch, async (values) => {
    const result = await saveSummaryAction(resumeId, values);
    return result.success;
  });

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-foreground text-xl font-semibold">{t("title")}</h1>
          <AutosaveIndicator status={status} />
        </div>

        <FormField
          control={form.control}
          name="summaryAr"
          render={({ field, fieldState }) => (
            <FieldWithExample
              label={t("summaryAr")}
              required
              guide={FIELD_GUIDES.summaryAr}
              errorMessageKey={fieldState.error?.message}
              onUseExample={(value) => form.setValue("summaryAr", value, { shouldDirty: true })}
            >
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
            </FieldWithExample>
          )}
        />

        <FormField
          control={form.control}
          name="summaryEn"
          render={({ field, fieldState }) => (
            <FieldWithExample
              label={t("summaryEn")}
              required
              guide={FIELD_GUIDES.summaryEn}
              errorMessageKey={fieldState.error?.message}
              onUseExample={(value) => form.setValue("summaryEn", value, { shouldDirty: true })}
            >
              <FormControl>
                <Textarea rows={5} dir="ltr" {...field} />
              </FormControl>
            </FieldWithExample>
          )}
        />
      </form>
    </Form>
  );
}
