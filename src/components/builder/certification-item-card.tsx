"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { FormFieldMessage } from "@/components/shared/form-field-message";
import { useItemForm } from "@/hooks/use-item-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import {
  certificationItemSchema,
  type CertificationItemInput,
} from "@/lib/validations/resume/certifications";
import { AutosaveIndicator } from "./autosave-indicator";
import { MonthYearPicker } from "./month-year-picker";

export function CertificationItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: CertificationItemInput;
}) {
  const t = useTranslations("builder.certifications");
  const tCommon = useTranslations("builder.common");
  const { form, status } = useItemForm({
    schema: certificationItemSchema,
    kind: "certification",
    sectionId,
    itemId,
    defaultValues: initialData,
  });

  const neverExpires = form.watch("neverExpires");

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <div className="flex justify-end">
          <AutosaveIndicator status={status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nameAr"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("nameAr")}
                required
                guide={FIELD_GUIDES.certificationName}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("nameAr", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("nameEn")}
                required
                guide={FIELD_GUIDES.certificationName}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("nameEn", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="issuerAr"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("issuerAr")}
                required
                guide={FIELD_GUIDES.certificationIssuer}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("issuerAr", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="issuerEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("issuerEn")}
                required
                guide={FIELD_GUIDES.certificationIssuer}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("issuerEn", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>
              {tCommon("issueDate")} <span className="text-destructive">*</span>
            </Label>
            <MonthYearPicker
              value={{ month: form.watch("issueMonth"), year: form.watch("issueYear") }}
              onChange={(value) => {
                form.setValue("issueMonth", value.month, { shouldDirty: true });
                form.setValue("issueYear", value.year, { shouldDirty: true });
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t("expiryDate")}</Label>
            <MonthYearPicker
              value={{ month: form.watch("expiryMonth"), year: form.watch("expiryYear") }}
              onChange={(value) => {
                form.setValue("expiryMonth", value.month, { shouldDirty: true });
                form.setValue("expiryYear", value.year, { shouldDirty: true });
              }}
              disabled={neverExpires}
            />
            <Label className="flex items-center gap-2 text-sm font-normal">
              <Checkbox
                checked={neverExpires}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  form.setValue("neverExpires", isChecked, { shouldDirty: true });
                  if (isChecked) {
                    form.setValue("expiryMonth", null, { shouldDirty: true });
                    form.setValue("expiryYear", null, { shouldDirty: true });
                  }
                }}
              />
              {t("neverExpires")}
            </Label>
            <FormFieldMessage messageKey={form.formState.errors.expiryMonth?.message} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="credentialId"
            render={({ field }) => (
              <FormItem>
                <Label>{t("credentialId")}</Label>
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verificationUrl"
            render={({ field, fieldState }) => (
              <FormItem>
                <Label>{t("verificationUrl")}</Label>
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
                <FormFieldMessage messageKey={fieldState.error?.message} />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
