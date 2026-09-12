"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type SortableItemWrapperProps = {
  id: string;
  onDelete: () => void;
  deleteAriaLabel: string;
  dragAriaLabel: string;
  children: ReactNode;
};

function SortableItemWrapper({
  id,
  onDelete,
  deleteAriaLabel,
  dragAriaLabel,
  children,
}: SortableItemWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-border bg-background flex gap-3 rounded-lg border p-4"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={dragAriaLabel}
        className="text-muted-foreground hover:text-foreground mt-1 h-fit cursor-grab touch-none"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex-1">{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label={deleteAriaLabel}
        className="h-fit"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

type SortableItemListProps<T extends { id: string }> = {
  dndContextId: string;
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => ReactNode;
  deleteAriaLabel: string;
  dragAriaLabel: string;
};

/** Drag-to-reorder list of item cards, used by every multi-entry builder step. */
export function SortableItemList<T extends { id: string }>({
  dndContextId,
  items,
  onReorder,
  onDelete,
  renderItem,
  deleteAriaLabel,
  dragAriaLabel,
}: SortableItemListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered.map((item) => item.id));
  }

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <SortableItemWrapper
              key={item.id}
              id={item.id}
              onDelete={() => onDelete(item.id)}
              deleteAriaLabel={deleteAriaLabel}
              dragAriaLabel={dragAriaLabel}
            >
              {renderItem(item)}
            </SortableItemWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
