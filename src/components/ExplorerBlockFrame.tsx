"use client";

import { forwardRef } from "react";
import { GripVerticalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  arranging: boolean;
  dragging?: boolean;
  /** Attributes + listeners from dnd-kit's useSortable; applied to the
   *  outer frame so the whole box is the drag activator. */
  gripProps?: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Visual container for a single rearrangeable block in Customize mode.
 *
 * Outside of arrange mode this component is unused (the dashboard is
 * rendered with its existing bare layout). Inside arrange mode the
 * frame renders a dashed border, a header strip with a grip glyph and
 * the block name, and `opacity-60` content that makes it visually clear
 * nothing is interactive while arranging.
 *
 * The whole frame is the drag activator — listeners are attached to the
 * outer div via `gripProps`. The grip icon is purely an affordance: with
 * the content `pointer-events-none`, every click on the frame can only
 * be a pick-up, so we no longer need a tiny hit target for the handle.
 */
export const ExplorerBlockFrame = forwardRef<HTMLDivElement, Props>(
  function ExplorerBlockFrame(
    { label, arranging, dragging, gripProps, children, className, style },
    ref,
  ) {
    if (!arranging) {
      // Defensive: callers only mount this in arrange mode. If someone
      // passes arranging=false we render the children unwrapped so the
      // page still works.
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        style={style}
        {...gripProps}
        role="button"
        tabIndex={0}
        aria-label={`Reorder ${label}`}
        aria-roledescription="sortable"
        className={cn(
          "rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/30 transition-shadow",
          dragging && "shadow-lg ring-2 ring-muted-foreground/40",
          className,
        )}
      >
        <div className="flex items-center gap-2 border-b border-dashed border-muted-foreground/30 bg-background/40 px-3 py-1.5 text-xs">
          <GripVerticalIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">{label}</span>
        </div>
        <div className="p-2">{children}</div>
      </div>
    );
  },
);
