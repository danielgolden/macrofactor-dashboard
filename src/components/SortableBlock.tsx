"use client";

import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";

interface SortableBlockProps {
  id: string;
  children: ReactNode;
}

/**
 * Wraps a dashboard block in a dnd-kit sortable container.
 *
 * The drag handle (GripVerticalIcon) is the drag activator — NOT the
 * whole block — so existing interactions inside the block (table row
 * clicks, donut slice clicks, filter chip selection, pagination buttons)
 * continue to work unimpeded.
 */
export function SortableBlock({ id, children }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? "opacity-40" : undefined}
    >
      {/* Drag handle bar — activator only */}
      <div className="flex px-4 lg:px-6">
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label="Drag to reorder this section"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-0.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVerticalIcon className="size-4" />
        </button>
      </div>
      {children}
    </div>
  );
}
