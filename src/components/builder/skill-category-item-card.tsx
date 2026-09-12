"use client";

import { useTranslations } from "next-intl";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { useItemForm } from "@/hooks/use-item-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import {
  skillCategoryItemSchema,
  type SkillCategoryItemInput,
} from "@/lib/validations/resume/skills";
import { AutosaveIndicator } from "./autosave-indicator";

export function SkillCategoryItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: SkillCategoryItemInput;
}) {
  const t = useTranslations("builder.skills");
  const { form, status } = useItemForm({
    schema: skillCategoryItemSchema,
    kind: "skillCategory",
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
            name="categoryAr"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("categoryAr")}
                required
                guide={FIELD_GUIDES.skillCategory}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("categoryAr", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="categoryEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("categoryEn")}
                required
                guide={FIELD_GUIDES.skillCategory}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("categoryEn", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="skillsAr"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("skillsAr")}
                required
                guide={FIELD_GUIDES.skillList}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("skillsAr", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FieldWithExample>
            )}
          />
          <FormField
            control={form.control}
            name="skillsEn"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("skillsEn")}
                required
                guide={FIELD_GUIDES.skillList}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) => form.setValue("skillsEn", value, { shouldDirty: true })}
              >
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
              </FieldWithExample>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
