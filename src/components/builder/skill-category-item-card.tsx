"use client";

import { useTranslations } from "next-intl";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { TagInput } from "@/components/shared/tag-input";
import { useItemForm } from "@/hooks/use-item-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import {
  skillCategoryItemSchema,
  type SkillCategoryItemInput,
} from "@/lib/validations/resume/skills";
import { AutosaveIndicator } from "./autosave-indicator";
import { GuidedInputField } from "./guided-input-field";

type SkillsFieldName = "skillsAr" | "skillsEn";

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

  function setSkills(name: SkillsFieldName, value: string) {
    form.setValue(name, value, { shouldDirty: true, shouldValidate: true });
  }

  function renderSkillsField(name: SkillsFieldName, dir: "rtl" | "ltr") {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <FieldWithExample
            label={t(name)}
            required
            guide={FIELD_GUIDES.skillList}
            errorMessageKey={fieldState.error?.message}
            onUseExample={(value) => setSkills(name, value)}
          >
            <FormControl>
              <TagInput
                value={field.value ?? ""}
                onChange={(value) => setSkills(name, value)}
                onBlur={field.onBlur}
                dir={dir}
                placeholder={t("skillsPlaceholder")}
                invalid={Boolean(fieldState.error)}
              />
            </FormControl>
          </FieldWithExample>
        )}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
        <div className="flex justify-end">
          <AutosaveIndicator status={status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <GuidedInputField
            form={form}
            name="categoryAr"
            label={t("categoryAr")}
            required
            guide={FIELD_GUIDES.skillCategory}
          />
          <GuidedInputField
            form={form}
            name="categoryEn"
            label={t("categoryEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.skillCategory}
          />
          {renderSkillsField("skillsAr", "rtl")}
          {renderSkillsField("skillsEn", "ltr")}
        </div>
      </form>
    </Form>
  );
}
