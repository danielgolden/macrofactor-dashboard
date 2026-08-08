"use client";

import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    label: "Esta sem.",
    range: () => {
      const t = today();
      const day = t.getDay(); // 0=Sun
      const monday = addDays(t, day === 0 ? -6 : 1 - day);
      return { start: toISO(monday), end: toISO(t) };
    },
  },
  {
    label: "Últ. sem.",
    range: () => {
      const t = today();
      const day = t.getDay();
      const thisMonday = addDays(t, day === 0 ? -6 : 1 - day);
      const lastMonday = addDays(thisMonday, -7);
      const lastSunday = addDays(thisMonday, -1);
      return { start: toISO(lastMonday), end: toISO(lastSunday) };
    },
  },
  {
    label: "Este mes",
    range: () => {
      const t = today();
      const first = new Date(t.getFullYear(), t.getMonth(), 1);
      return { start: toISO(first), end: toISO(t) };
    },
  },
  {
    label: "Últ. mes",
    range: () => {
      const t = today();
      const firstOfThisMonth = new Date(t.getFullYear(), t.getMonth(), 1);
      const firstOfLastMonth = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      const lastOfLastMonth = addDays(firstOfThisMonth, -1);
      return { start: toISO(firstOfLastMonth), end: toISO(lastOfLastMonth) };
    },
  },
  {
    label: "30 d",
    range: () => {
      const t = today();
      return { start: toISO(addDays(t, -30)), end: toISO(t) };
    },
  },
  {
    label: "90 d",
    range: () => {
      const t = today();
      return { start: toISO(addDays(t, -90)), end: toISO(t) };
    },
  },
  {
    label: "Este año",
    range: () => {
      const t = today();
      const first = new Date(t.getFullYear(), 0, 1);
      return { start: toISO(first), end: toISO(t) };
    },
  },
];

export function DateRangePicker({ value, onChange }: Props) {
  const activeLabel = (() => {
    if (!value) return "Todo";
    for (const p of PRESETS) {
      if (p.label === "Todo") continue;
      const r = p.range();
      if (r && r.start === value.start && r.end === value.end) return p.label;
    }
    return "";
  })();

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

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={value?.start ?? ""}
          onChange={(e) => {
            const start = e.target.value;
            if (start) onChange({ start, end: value?.end ?? start });
          }}
          className="h-8 w-auto text-xs"
        />
        <span className="text-muted-foreground">→</span>
        <Input
          type="date"
          value={value?.end ?? ""}
          onChange={(e) => {
            const end = e.target.value;
            if (end) onChange({ start: value?.start ?? end, end });
          }}
          className="h-8 w-auto text-xs"
        />
      </div>
    </div>
  );
}
