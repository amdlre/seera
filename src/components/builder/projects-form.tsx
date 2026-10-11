"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useSectionItems } from "@/hooks/use-section-items";
import { EMPTY_PROJECT_ITEM, type ProjectItemInput } from "@/lib/validations/resume/projects";
import { ProjectItemCard } from "./project-item-card";
import { SortableItemList } from "./sortable-item-list";

export function ProjectsForm() {
  const t = useTranslations("builder.projects");
  const tCommon = useTranslations("builder.common");
  const { section, items, addItem, deleteItem, reorderItems } = useSectionItems("projects");

  if (!section) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-foreground text-xl font-semibold">{t("title")}</h1>

      {items.length === 0 && <p className="text-muted-foreground text-sm">{t("empty")}</p>}

      <SortableItemList
        dndContextId="project-items"
        items={items}
        onReorder={reorderItems}
        onDelete={deleteItem}
        deleteAriaLabel={tCommon("delete")}
        dragAriaLabel={tCommon("dragToReorder")}
        renderItem={(item) => (
          <ProjectItemCard
            sectionId={section.id}
            itemId={item.id}
            initialData={item.data as ProjectItemInput}
          />
        )}
      />

      <Button
        type="button"
        variant="outline"
        className="w-fit gap-1.5"
        onClick={() => addItem("project", EMPTY_PROJECT_ITEM)}
      >
        <Plus className="size-4" />
        {t("addItem")}
      </Button>
    </div>
  );
}
