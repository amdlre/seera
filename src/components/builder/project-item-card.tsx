"use client";

import { useTranslations } from "next-intl";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { FieldWithExample } from "@/components/shared/field-with-example";
import { TagInput } from "@/components/shared/tag-input";
import { useItemForm } from "@/hooks/use-item-form";
import { FIELD_GUIDES } from "@/lib/constants/field-guides";
import { projectItemSchema, type ProjectItemInput } from "@/lib/validations/resume/projects";
import { AutosaveIndicator } from "./autosave-indicator";
import { BulletListField } from "./bilingual-bullets-field";
import { GuidedInputField } from "./guided-input-field";

/** One project: bilingual name, public link, technology tags and bilingual bullets. */
export function ProjectItemCard({
  sectionId,
  itemId,
  initialData,
}: {
  sectionId: string;
  itemId: string;
  initialData: ProjectItemInput;
}) {
  const t = useTranslations("builder.projects");
  const { form, status } = useItemForm({
    schema: projectItemSchema,
    kind: "project",
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
          <GuidedInputField
            form={form}
            name="nameAr"
            label={t("nameAr")}
            required
            guide={FIELD_GUIDES.projectNameAr}
          />
          <GuidedInputField
            form={form}
            name="nameEn"
            label={t("nameEn")}
            required
            dir="ltr"
            guide={FIELD_GUIDES.projectNameEn}
          />
          <GuidedInputField
            form={form}
            name="url"
            label={t("url")}
            dir="ltr"
            guide={FIELD_GUIDES.projectUrl}
            placeholder={t("urlPlaceholder")}
          />
          <FormField
            control={form.control}
            name="technologies"
            render={({ field, fieldState }) => (
              <FieldWithExample
                label={t("technologies")}
                required
                guide={FIELD_GUIDES.projectTechnologies}
                errorMessageKey={fieldState.error?.message}
                onUseExample={(value) =>
                  form.setValue("technologies", value, { shouldDirty: true, shouldValidate: true })
                }
              >
                <FormControl>
                  <TagInput
                    value={field.value ?? ""}
                    onChange={(value) =>
                      form.setValue("technologies", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onBlur={field.onBlur}
                    dir="ltr"
                    placeholder={t("technologiesPlaceholder")}
                    invalid={Boolean(fieldState.error)}
                  />
                </FormControl>
              </FieldWithExample>
            )}
          />
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
