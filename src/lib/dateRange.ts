export type DateRange = { start: string; end: string };
export type DateBounds = { min: Date; max: Date };

export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export const PRESETS: { label: string; range: () => DateRange }[] = [
  {
    label: "Today",
    range: () => {
      const t = todayDate();
      return { start: toISO(t), end: toISO(t) };
    },
  },
  {
    label: "This week",
    range: () => {
      const t = todayDate();
      const day = t.getDay();
      const monday = addDays(t, day === 0 ? -6 : 1 - day);
      return { start: toISO(monday), end: toISO(t) };
    },
  },
  {
    label: "30 d",
    range: () => {
      const t = todayDate();
      return { start: toISO(addDays(t, -30)), end: toISO(t) };
    },
  },
];

function rangeOverlapsBounds(range: DateRange, bounds: DateBounds): boolean {
  const rs = new Date(range.start + "T00:00:00");
  const re = new Date(range.end + "T00:00:00");
  return re >= bounds.min && rs <= bounds.max;
}

export function isPresetDisabled(
  preset: { label: string; range: () => DateRange },
  bounds: DateBounds | null,
): boolean {
  if (!bounds) return false;
  return !rangeOverlapsBounds(preset.range(), bounds);
}

/**
 * Pick the initial date range for the Explorer view.
 * Priority: This week → Today → most recent available day in bounds.
 * Returns null when the user has no data (no bounds).
 */
export function computeInitialRange(bounds: DateBounds | null): DateRange | null {
  if (!bounds) return null;

  const thisWeek = PRESETS.find((p) => p.label === "This week")!.range();
  if (rangeOverlapsBounds(thisWeek, bounds)) return thisWeek;

  const today = PRESETS.find((p) => p.label === "Today")!.range();
  if (rangeOverlapsBounds(today, bounds)) return today;

  const iso = toISO(bounds.max);
  return { start: iso, end: iso };
}
