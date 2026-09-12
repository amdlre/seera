"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { reorderSectionsAction } from "@/actions/resume-sections.actions";
import { useBuilderPreview } from "./builder-preview-context";
import { CustomSectionDialog } from "./custom-section-dialog";
import { CustomSectionRow } from "./custom-section-row";

export function CustomSectionsForm({ resumeId }: { resumeId: string }) {
  const t = useTranslations("builder.custom");
  const { sections, addSection, reorderSectionsLocal } = useBuilderPreview();
  const reorderableSections = [...sections]
    .filter((section) => section.type !== "personal")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = reorderableSections.findIndex((section) => section.id === active.id);
    const newIndex = reorderableSections.findIndex((section) => section.id === over.id);
    const reordered = arrayMove(reorderableSections, oldIndex, newIndex);
    const orderedIds = reordered.map((section) => section.id);

    reorderSectionsLocal(orderedIds);
    void reorderSectionsAction(resumeId, orderedIds);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-foreground text-xl font-semibold">{t("pageTitle")}</h1>
        <CustomSectionDialog resumeId={resumeId} onCreated={addSection} />
      </div>
      <p className="text-muted-foreground text-sm">{t("pageSubtitle")}</p>

      <DndContext
        id="resume-sections"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={reorderableSections.map((section) => section.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {reorderableSections.map((section) => (
              <CustomSectionRow key={section.id} section={section} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
