"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import type { z } from "zod";
import type { ItemDataKind } from "@/actions/resume-items.actions";
import { saveItemDraftAction } from "@/actions/resume-items.actions";
import { useBuilderPreview } from "@/components/builder/builder-preview-context";
import { useDraftForm } from "@/hooks/use-draft-form";

/**
 * Shared setup for one item card's form: RHF + Zod resolver, syncing every
 * keystroke into the live preview context, and saving to the server only when
 * asked (the save button or moving between steps). Used by every multi-entry section (experience, education, ...).
 */
export function useItemForm<TSchema extends z.ZodTypeAny>(params: {
  schema: TSchema;
  kind: ItemDataKind;
  sectionId: string;
  itemId: string;
  defaultValues: z.infer<TSchema>;
}) {
  const { schema, kind, sectionId, itemId, defaultValues } = params;
  const { updateSectionItem } = useBuilderPreview();

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<z.infer<TSchema>>,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is a stable, documented subscription API; it isn't a value the compiler needs to memoize.
    const subscription = form.watch((values) =>
      updateSectionItem(sectionId, itemId, values as Record<string, unknown>),
    );
    return () => subscription.unsubscribe();
  }, [form, sectionId, itemId, updateSectionItem]);

  const status = useDraftForm(form.watch, async (values) => {
    const result = await saveItemDraftAction(itemId, kind, values);
    return result.success;
  });

  return { form, status };
}
