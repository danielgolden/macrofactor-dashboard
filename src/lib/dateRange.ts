import { format } from "date-fns";

export type DateRange = { start: string; end: string };
export type DateBounds = { min: Date; max: Date };

/**
 * Format a Date as a local-timezone YYYY-MM-DD string.
 *
 * The previous implementation used `d.toISOString().slice(0, 10)`, which
 * converts to UTC first. Every Date we serialize here is a *local-midnight*
 * date (from `parseISO`, react-day-picker, or `setHours(0,0,0,0)`), so for
 * any user at a positive UTC offset (UTC+1 and east) local midnight is the
 * *previous* day in UTC and the serialized string was off by one. (#57)
 */
export function toISO(d: Date): string {
  return format(d, "yyyy-MM-dd");
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
    label: "7 d",
    range: () => {
      const t = todayDate();
      return { start: toISO(addDays(t, -6)), end: toISO(t) };
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
 * Priority: Last 7 days → Today → most recent available day in bounds.
 * Returns null when the user has no data (no bounds).
 */
export function computeInitialRange(bounds: DateBounds | null): DateRange | null {
  if (!bounds) return null;

  const sevenDays = PRESETS.find((p) => p.label === "7 d")!.range();
  if (rangeOverlapsBounds(sevenDays, bounds)) return sevenDays;

  const today = PRESETS.find((p) => p.label === "Today")!.range();
  if (rangeOverlapsBounds(today, bounds)) return today;

  const iso = toISO(bounds.max);
  return { start: iso, end: iso };
}
