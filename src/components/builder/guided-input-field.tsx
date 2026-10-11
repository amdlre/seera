"use client";

import type { ReactNode } from "react";
import type { FieldPath, FieldValues, PathValue, UseFormReturn } from "react-hook-form";
import { FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldWithExample } from "@/components/shared/field-with-example";
import type { FieldGuide } from "@/lib/constants/field-guides";

type GuidedInputFieldProps<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>;
  name: FieldPath<TValues>;
  label: string;
  guide: FieldGuide;
  required?: boolean;
  dir?: "ltr" | "rtl";
  type?: "text" | "email" | "tel";
  placeholder?: string;
  /** Rewrites the value when the field loses focus (e.g. phone → +966 format). */
  formatOnBlur?: (value: string) => string;
  /** Extra hint rendered right under the input, given the current value. */
  renderHint?: (value: string) => ReactNode;
};

/**
 * One builder text field wired to react-hook-form: label with required star,
 * writing tip, example, validation message, and optional on-blur formatting.
 */
export function GuidedInputField<TValues extends FieldValues>({
  form,
  name,
  label,
  guide,
  required,
  dir,
  type = "text",
  placeholder,
  formatOnBlur,
  renderHint,
}: GuidedInputFieldProps<TValues>) {
  function setFieldValue(value: string) {
    form.setValue(name, value as PathValue<TValues, FieldPath<TValues>>, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldWithExample
          label={label}
          required={required}
          guide={guide}
          errorMessageKey={fieldState.error?.message}
          onUseExample={setFieldValue}
        >
          <FormControl>
            <Input
              {...field}
              value={(field.value as string | undefined) ?? ""}
              type={type}
              dir={dir}
              placeholder={placeholder}
              className={placeholder ? "placeholder:text-muted-foreground/50" : undefined}
              onBlur={() => {
                const current = (field.value as string | undefined) ?? "";
                const formatted = formatOnBlur?.(current);
                if (formatted !== undefined && formatted !== current) {
                  setFieldValue(formatted);
                }
                field.onBlur();
              }}
            />
          </FormControl>
          {renderHint?.((field.value as string | undefined) ?? "")}
        </FieldWithExample>
      )}
    />
  );
}
