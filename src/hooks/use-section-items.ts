"use client";

import { useBuilderPreview } from "@/components/builder/builder-preview-context";
import type { ResumeSectionType } from "@/db/schema";
import { useItemsForSection } from "./use-items-for-section";

/**
 * Wires a builder step's item list (experience, education, skills, ...) to
 * the preview context and the item Server Actions, so add/delete/reorder
 * update the UI immediately and persist in the background.
 */
export function useSectionItems(sectionType: ResumeSectionType) {
  const { sections } = useBuilderPreview();
  const section = sections.find((candidate) => candidate.type === sectionType) ?? null;
  const { items, addItem, deleteItem, reorderItems } = useItemsForSection(section?.id ?? null);

  return { section, items, addItem, deleteItem, reorderItems };
}
