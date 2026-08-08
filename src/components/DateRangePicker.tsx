"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
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

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) {
      onChange(null);
      return;
    }
    const start = toISO(range.from);
    const end = toISO(range.to ?? range.from);
    onChange({ start, end });
  };

  const label = value
    ? `${format(parseISO(value.start), "MMM d, yyyy")} – ${format(parseISO(value.end), "MMM d, yyyy")}`
    : "Select dates";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup
        variant="outline"
        size="sm"
        value={activeLabel ? [activeLabel] : []}
        onValueChange={(vals) => {
          const val = vals[0];
          if (!val) return;
          const preset = PRESETS.find((p) => p.label === val);
          if (preset) onChange(preset.range());
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

      <Popover open={open} onOpenChange={setOpen}>
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
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            month={selected?.from}
            disabled={bounds ? { before: bounds.min, after: bounds.max } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
