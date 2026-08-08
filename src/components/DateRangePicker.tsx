"use client";

import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type DateRange = { start: string; end: string };

interface Props {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const PRESETS: { label: string; range: () => DateRange | null }[] = [
  { label: "Todo", range: () => null },
  {
    label: "Hoy",
    range: () => {
      const t = today();
      return { start: toISO(t), end: toISO(t) };
    },
  },
  {
    label: "Esta sem.",
    range: () => {
      const t = today();
      const day = t.getDay();
      const monday = addDays(t, day === 0 ? -6 : 1 - day);
      return { start: toISO(monday), end: toISO(t) };
    },
  },
  {
    label: "30 d",
    range: () => {
      const t = today();
      return { start: toISO(addDays(t, -30)), end: toISO(t) };
    },
  },
];

export function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [bounds, setBounds] = useState<{ min: Date; max: Date } | null>(null);

  useEffect(() => {
    fetch("/api/date-range")
      .then((r) => r.json())
      .then((d) => {
        if (d.min && d.max) {
          setBounds({ min: parseISO(d.min), max: parseISO(d.max) });
        }
      })
      .catch(() => {});
  }, []);

  const activeLabel = (() => {
    if (!value) return "Todo";
    for (const p of PRESETS) {
      if (p.label === "Todo") continue;
      const r = p.range();
      if (r && r.start === value.start && r.end === value.end) return p.label;
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
    : "Seleccionar fechas";

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
          <ToggleGroupItem key={p.label} value={p.label}>
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
