"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, startOfMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  PRESETS,
  isPresetDisabled,
  toISO,
  type DateBounds,
  type DateRange,
} from "@/lib/dateRange";

interface Props {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  bounds: DateBounds | null;
}

export function DateRangePicker({ value, onChange, bounds }: Props) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // react-day-picker hands back Date objects at *local* midnight. Memoize
  // the parsed range so it's referentially stable and won't trigger an
  // effect loop in Calendar's internal month-tracking (see #54 history).
  // Explicit annotation: react-day-picker's `DateRange` lets `to` be
  // optional, so widen `to` to `Date | undefined` for clean type compat.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally
  // keyed on `value?.start` / `value?.end` instead of `value` so a stale
  // Date object on `value` doesn't re-parse.
  const selected = useMemo<{ from: Date; to: Date } | undefined>(
    () =>
      value
        ? { from: parseISO(value.start), to: parseISO(value.end) }
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value?.start, value?.end],
  );

  // In-progress range while the popover is open. Unlike `selected`, this
  // is allowed to have an *open* end so that picking a second day actually
  // extends the range — committing on every click with `to ?? from` made
  // the second click restart the selection instead of extending it.
  const [draft, setDraft] = useState<{ from: Date; to?: Date } | undefined>(
    undefined,
  );

  // The visible calendar month is seeded once when the popover opens and
  // then left entirely under the user's control. Pairing `month` with
  // `onMonthChange` is the fix for Bug 1 (prev-month button was a no-op
  // because `month={selected?.from}` was uncontrolled on every render).
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(
    () => selected?.from ?? startOfMonth(new Date()),
  );

  useEffect(() => {
    if (open) {
      setCalendarMonth(
        startOfMonth(selected?.from ?? draft?.from ?? new Date()),
      );
    }
  }, [open, selected?.from, draft?.from]);

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    // Update the draft in-place; do NOT call onChange here. Commit happens
    // on popover close (see Bug 2 / draft-then-commit pattern).
    if (!range?.from) {
      setDraft(undefined);
      return;
    }
    setDraft({ from: range.from, to: range.to });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      // Re-seed the draft from `value` on (re-)open so reopening shows the
      // current range instead of either an empty selection or whatever
      // happens to be in the picker from a previous session.
      setDraft(selected ? { from: selected.from, to: selected.to } : undefined);
      return;
    }

    // Closing: commit the draft if any, then clear it.
    if (draft?.from) {
      const start = toISO(draft.from);
      const end = toISO(draft.to ?? draft.from);
      onChange({ start, end });
    }
    setDraft(undefined);
    setOpen(false);
  };

  const activeLabel = (() => {
    if (!value) return "";
    for (const p of PRESETS) {
      const r = p.range();
      if (r.start === value.start && r.end === value.end) return p.label;
    }
    return "";
  })();

  const onPresetChange = (vals: string[]) => {
    // Base UI fires onValueChange([]) when the active toggle is clicked
    // again. Re-select the previously active preset so the toggle stays on.
    if (vals.length === 0) {
      if (activeLabel) {
        const preset = PRESETS.find((p) => p.label === activeLabel);
        if (preset) onChange(preset.range());
      }
      return;
    }
    const val = vals[0];
    const preset = PRESETS.find((p) => p.label === val);
    if (preset) {
      setDraft(undefined); // clear any in-progress pick
      onChange(preset.range());
      setOpen(false);
    }
  };

  // The visible "highlighted" range: the draft while open (so the user
  // sees their in-progress pick), otherwise the committed value.
  const visibleSelected = open ? draft ?? selected : selected;

  // The trigger label: prefer the committed value (`value`) so it always
  // shows a complete range, even mid-pick. This avoids a flash where the
  // label briefly reads "Aug 1 – " while the user is still picking "to".
  const triggerRange = selected;

  const label = triggerRange
    ? `${format(triggerRange.from, "MMM d, yyyy")} – ${format(triggerRange.to, "MMM d, yyyy")}`
    : "Select dates";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup
        variant="outline"
        size="sm"
        value={activeLabel ? [activeLabel] : []}
        onValueChange={onPresetChange}
      >
        {PRESETS.map((p) => (
          <ToggleGroupItem
            key={p.label}
            value={p.label}
            disabled={isPresetDisabled(p, bounds)}
            className="disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            {p.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn("h-8 gap-2 font-normal", !value && "text-muted-foreground")}
            >
              <CalendarIcon className="size-3.5" />
              {label}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1.5rem)] p-0">
          <Calendar
            mode="range"
            selected={visibleSelected}
            onSelect={handleSelect}
            numberOfMonths={isMobile ? 1 : 2}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            startMonth={bounds?.min}
            endMonth={bounds?.max}
            disabled={bounds ? { before: bounds.min, after: bounds.max } : undefined}
            // resetOnSelect makes any click while the draft is already a
            // *complete* range start a brand-new range (new from = click,
            // to = undefined) rather than RDP's "addToRange" behavior — which
            // always treats "click after from" as "extend to". Without this,
            // changing the *start* of an existing range required the user to
            // click a date before the current from, since click-after-from
            // silently moved the *end* instead. See #43 review.
            resetOnSelect
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
