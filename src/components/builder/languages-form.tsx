"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useSectionItems } from "@/hooks/use-section-items";
import { EMPTY_LANGUAGE_ITEM, type LanguageItemInput } from "@/lib/validations/resume/languages";
import { LanguageItemCard } from "./language-item-card";
import { SortableItemList } from "./sortable-item-list";

export function LanguagesForm() {
  const t = useTranslations("builder.languages");
  const tCommon = useTranslations("builder.common");
  const { section, items, addItem, deleteItem, reorderItems } = useSectionItems("languages");

  if (!section) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-foreground text-xl font-semibold">{t("title")}</h1>

      {items.length === 0 && <p className="text-muted-foreground text-sm">{t("empty")}</p>}

      <SortableItemList
        dndContextId="languages-items"
        items={items}
        onReorder={reorderItems}
        onDelete={deleteItem}
        deleteAriaLabel={tCommon("delete")}
        dragAriaLabel={tCommon("dragToReorder")}
        renderItem={(item) => (
          <LanguageItemCard
            sectionId={section.id}
            itemId={item.id}
            initialData={item.data as LanguageItemInput}
          />
        )}
      />

      <Button
        type="button"
        variant="outline"
        className="w-fit gap-1.5"
        onClick={() => addItem("language", EMPTY_LANGUAGE_ITEM)}
      >
        <Plus className="size-4" />
        {t("addItem")}
      </Button>
    </div>
  );
}
