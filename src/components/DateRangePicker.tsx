"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  PRESETS,
  isPresetDisabled,
  type DateBounds,
  type DateRange,
} from "@/lib/dateRange";

interface Props {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  bounds: DateBounds | null;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function DateRangePicker({ value, onChange, bounds }: Props) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Local month state: initialized from the selected start date so the
  // calendar opens on the right month, but free to navigate via the
  // prev/next buttons. Previously `month={selected?.from}` was passed
  // directly, which forced the visible month back on every render and made
  // the prev/next nav buttons effectively no-ops.
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(() =>
    value ? parseISO(value.start) : undefined,
  );

  // Pending range: updated on every calendar click, but only committed via
  // `onChange` when the popover closes (blur). This lets the user pick a
  // full start+end range without each click triggering a data load.
  const [pendingRange, setPendingRange] = useState<DateRange | null>(null);

  const activeLabel = (() => {
    if (!value) return "";
    for (const p of PRESETS) {
      const r = p.range();
      if (r.start === value.start && r.end === value.end) return p.label;
    }
    return "";
  })();

  const selected = value
    ? { from: parseISO(value.start), to: parseISO(value.end) }
    : undefined;

  // Sync the visible month when the value changes externally (e.g. a preset
  // is clicked or the initial range is computed). Local navigation is
  // otherwise left untouched.
  useEffect(() => {
    if (selected?.from) setCalendarMonth(selected.from);
  }, [selected?.from]);

  // While the popover is open, reflect the in-progress selection; otherwise
  // show the committed value.
  const displayRange = open && pendingRange ? pendingRange : value;
  const calendarSelected =
    open && pendingRange
      ? { from: parseISO(pendingRange.start), to: parseISO(pendingRange.end) }
      : selected;

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) {
      setPendingRange(null);
      return;
    }
    const start = toISO(range.from);
    const end = toISO(range.to ?? range.from);
    setPendingRange({ start, end });
  };

  // Commit the pending range only when the popover closes so that clicking
  // individual dates doesn't trigger an immediate data load.
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && pendingRange) {
      onChange(pendingRange);
      setPendingRange(null);
    }
  };

  // Presets are a one-click action and should commit immediately; clear any
  // pending calendar selection so a stale pending range can't overwrite a
  // preset that was clicked while the popover happened to be open.
  const selectPreset = (preset: (typeof PRESETS)[number]) => {
    onChange(preset.range());
    setPendingRange(null);
  };

  const label = displayRange
    ? `${format(parseISO(displayRange.start), "MMM d, yyyy")} – ${format(parseISO(displayRange.end), "MMM d, yyyy")}`
    : "Select dates";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup
        variant="outline"
        size="sm"
        value={activeLabel ? [activeLabel] : []}
        onValueChange={(vals) => {
          // Base UI fires onValueChange([] when the active toggle is clicked
          // again (deselect). In that case `vals` is empty and we must NOT
          // bail — otherwise the toggle visually turns off while the actual
          // date range stays the same, leaving the two out of sync.
          if (vals.length === 0) {
            // Re-select the previously active preset so the toggle stays on.
            if (activeLabel) {
              const preset = PRESETS.find((p) => p.label === activeLabel);
              if (preset) selectPreset(preset);
            }
            return;
          }
          const val = vals[0];
          const preset = PRESETS.find((p) => p.label === val);
          if (preset) selectPreset(preset);
        }}
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
            selected={calendarSelected}
            onSelect={handleSelect}
            numberOfMonths={isMobile ? 1 : 2}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            disabled={bounds ? { before: bounds.min, after: bounds.max } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
