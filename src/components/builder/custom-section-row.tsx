"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { deleteCustomSectionAction, setSectionVisibilityAction } from "@/actions/resume-sections.actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ResumeSection } from "@/db/schema";
import { useItemsForSection } from "@/hooks/use-items-for-section";
import type { AppLocale } from "@/i18n/routing";
import {
  EMPTY_CUSTOM_BULLET_ITEM,
  EMPTY_CUSTOM_DATED_ITEM,
  EMPTY_CUSTOM_PARAGRAPH_ITEM,
} from "@/lib/validations/resume/custom-section";
import { cn } from "@/lib/utils";
import { useBuilderPreview } from "./builder-preview-context";
import { CustomBulletItemCard } from "./custom-bullet-item-card";
import { CustomDatedItemCard } from "./custom-dated-item-card";
import { CustomParagraphItemCard } from "./custom-paragraph-item-card";
import { SortableItemList } from "./sortable-item-list";

export function CustomSectionRow({ section }: { section: ResumeSection }) {
  const t = useTranslations("builder.custom");
  const tCommon = useTranslations("builder.common");
  const locale = useLocale() as AppLocale;
  const { setSectionVisibilityLocal, removeSection } = useBuilderPreview();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const { items, addItem, deleteItem, reorderItems } = useItemsForSection(
    section.isCustom ? section.id : null,
  );

  async function onToggleVisibility(checked: boolean) {
    setSectionVisibilityLocal(section.id, checked);
    await setSectionVisibilityAction(section.id, checked);
  }

  async function onDelete() {
    await deleteCustomSectionAction(section.id);
    removeSection(section.id);
  }

  function addDefaultItem() {
    if (section.layout === "bullets") {
      void addItem("customBullet", EMPTY_CUSTOM_BULLET_ITEM);
    } else if (section.layout === "dated_entries") {
      void addItem("customDated", EMPTY_CUSTOM_DATED_ITEM);
    } else {
      void addItem("customParagraph", EMPTY_CUSTOM_PARAGRAPH_ITEM);
    }
  }

  const title = locale === "ar" ? section.titleAr : section.titleEn;

  return (
    <div ref={setNodeRef} style={style} className="border-border bg-background rounded-lg border">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={tCommon("dragToReorder")}
          className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1">
          <p className="text-foreground font-medium">{title}</p>
          {section.isCustom && (
            <p className="text-muted-foreground text-xs">{t(`layouts.${section.layout}`)}</p>
          )}
        </div>
        <Switch
          checked={section.isVisible}
          onCheckedChange={onToggleVisibility}
          aria-label={t("toggleVisibility")}
        />
        {section.isCustom && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsExpanded((value) => !value)}
              aria-label={t("manageItems")}
            >
              <ChevronDown className={cn("size-4 transition-transform", isExpanded && "rotate-180")} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              aria-label={tCommon("delete")}
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        )}
      </div>

      {section.isCustom && isExpanded && (
        <div className="border-border border-t p-4">
          {items.length === 0 && (
            <p className="text-muted-foreground mb-3 text-sm">{t("sectionEmpty")}</p>
          )}
          <SortableItemList
            dndContextId={`custom-items-${section.id}`}
            items={items}
            onReorder={reorderItems}
            onDelete={deleteItem}
            deleteAriaLabel={tCommon("delete")}
            dragAriaLabel={tCommon("dragToReorder")}
            renderItem={(item) => {
              if (section.layout === "bullets") {
                return (
                  <CustomBulletItemCard sectionId={section.id} itemId={item.id} initialData={item.data} />
                );
              }
              if (section.layout === "dated_entries") {
                return (
                  <CustomDatedItemCard sectionId={section.id} itemId={item.id} initialData={item.data} />
                );
              }
              return (
                <CustomParagraphItemCard sectionId={section.id} itemId={item.id} initialData={item.data} />
              );
            }}
          />
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addDefaultItem}>
            {t("addItem")}
          </Button>
        </div>
      )}
    </div>
  );
}
