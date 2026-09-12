"use client";

import { useCallback } from "react";
import { addItemAction, deleteItemAction, type ItemDataKind, reorderItemsAction } from "@/actions/resume-items.actions";
import { useBuilderPreview } from "@/components/builder/builder-preview-context";

/**
 * Same wiring as `useSectionItems`, but keyed directly by a section id
 * instead of a standard section type — used for custom sections, which
 * aren't unique per type (a resume can have several).
 */
export function useItemsForSection(sectionId: string | null) {
  const { itemsBySectionId, appendSectionItem, removeSectionItem, reorderSectionItemsList } =
    useBuilderPreview();
  const items = sectionId ? (itemsBySectionId[sectionId] ?? []) : [];

  const addItem = useCallback(
    async (kind: ItemDataKind, defaultData: Record<string, unknown>): Promise<string | null> => {
      if (!sectionId) {
        return null;
      }
      const result = await addItemAction(sectionId, kind, defaultData);
      if (!result.success) {
        return null;
      }
      appendSectionItem(sectionId, { id: result.itemId, data: defaultData });
      return result.itemId;
    },
    [sectionId, appendSectionItem],
  );

  const deleteItem = useCallback(
    async (itemId: string): Promise<void> => {
      if (!sectionId) {
        return;
      }
      await deleteItemAction(itemId);
      removeSectionItem(sectionId, itemId);
    },
    [sectionId, removeSectionItem],
  );

  const reorderItems = useCallback(
    async (orderedIds: string[]): Promise<void> => {
      if (!sectionId) {
        return;
      }
      reorderSectionItemsList(sectionId, orderedIds);
      await reorderItemsAction(sectionId, orderedIds);
    },
    [sectionId, reorderSectionItemsList],
  );

  return { items, addItem, deleteItem, reorderItems };
}
