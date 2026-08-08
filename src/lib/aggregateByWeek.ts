import type { LogEntry } from "./aggregateEntries";

export interface WeekBucket {
  weekStart: string;
  weekLabel: string;
  totalCal: number;
  totalWeight: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  proteinPct: number;
  fatPct: number;
  carbPct: number;
  avgDensity: number;
}

export interface FoodWeekEntry {
  name: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  weightG: number;
  count: number;
}

export interface FoodByWeek {
  weekStart: string;
  foods: FoodWeekEntry[];
}

const MS_PER_DAY = 86400000;

export function startOfWeek(dateStr: string): Date {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function weekLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function macroPcts(proteinG: number, fatG: number, carbsG: number) {
  const calFromMacros = proteinG * 4 + fatG * 9 + carbsG * 4;
  if (calFromMacros <= 0) return { proteinPct: 0, fatPct: 0, carbPct: 0 };
  return {
    proteinPct: parseFloat(((proteinG * 4) / calFromMacros * 100).toFixed(1)),
    fatPct: parseFloat(((fatG * 9) / calFromMacros * 100).toFixed(1)),
    carbPct: parseFloat(((carbsG * 4) / calFromMacros * 100).toFixed(1)),
  };
}

export function bucketByWeek(entries: LogEntry[]): WeekBucket[] {
  const acc = new Map<string, {
    totalCal: number;
    totalWeight: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
  }>();

  for (const e of entries) {
    if (!e.foodName || e.weightG <= 0) continue;
    const ws = startOfWeek(e.date);
    const key = isoDate(ws);
    const cur = acc.get(key);
    if (cur) {
      cur.totalCal += e.calories;
      cur.totalWeight += e.weightG;
      cur.proteinG += e.proteinG;
      cur.fatG += e.fatG;
      cur.carbsG += e.carbsG;
    } else {
      acc.set(key, {
        totalCal: e.calories,
        totalWeight: e.weightG,
        proteinG: e.proteinG,
        fatG: e.fatG,
        carbsG: e.carbsG,
      });
    }
  }

  const weeks: WeekBucket[] = [];
  for (const [weekStart, a] of acc.entries()) {
    const { proteinPct, fatPct, carbPct } = macroPcts(a.proteinG, a.fatG, a.carbsG);
    weeks.push({
      weekStart,
      weekLabel: weekLabel(new Date(weekStart + "T00:00:00")),
      totalCal: parseFloat(a.totalCal.toFixed(0)),
      totalWeight: parseFloat(a.totalWeight.toFixed(0)),
      proteinG: parseFloat(a.proteinG.toFixed(1)),
      fatG: parseFloat(a.fatG.toFixed(1)),
      carbsG: parseFloat(a.carbsG.toFixed(1)),
      proteinPct,
      fatPct,
      carbPct,
      avgDensity: a.totalWeight > 0 ? parseFloat((a.totalCal / a.totalWeight).toFixed(2)) : 0,
    });
  }

  weeks.sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  if (weeks.length > 1) {
    const gaps: { start: string; prevEnd: Date; days: number }[] = [];
    for (let i = 1; i < weeks.length; i++) {
      const prevEnd = new Date(weeks[i - 1].weekStart + "T00:00:00");
      const curStart = new Date(weeks[i].weekStart + "T00:00:00");
      const days = Math.round((curStart.getTime() - prevEnd.getTime()) / MS_PER_DAY);
      if (days > 7) gaps.push({ start: weeks[i].weekStart, prevEnd, days });
    }
    if (gaps.length) {
      const filled: WeekBucket[] = [];
      for (let i = 0; i < weeks.length; i++) {
        filled.push(weeks[i]);
        if (i < weeks.length - 1) {
          let next = new Date(weeks[i].weekStart + "T00:00:00");
          next.setDate(next.getDate() + 7);
          const upcoming = new Date(weeks[i + 1].weekStart + "T00:00:00");
          while (next < upcoming) {
            const ws = isoDate(next);
            filled.push({
              weekStart: ws,
              weekLabel: weekLabel(next),
              totalCal: 0,
              totalWeight: 0,
              proteinG: 0,
              fatG: 0,
              carbsG: 0,
              proteinPct: 0,
              fatPct: 0,
              carbPct: 0,
              avgDensity: 0,
            });
            next = new Date(next.getTime() + 7 * MS_PER_DAY);
          }
        }
      }
      return filled;
    }
  }

  return weeks;
}

export function foodByWeek(entries: LogEntry[]): FoodByWeek[] {
  const acc = new Map<string, Map<string, FoodWeekEntry>>();

  for (const e of entries) {
    if (!e.foodName || e.weightG <= 0) continue;
    const ws = isoDate(startOfWeek(e.date));
    let weekMap = acc.get(ws);
    if (!weekMap) {
      weekMap = new Map();
      acc.set(ws, weekMap);
    }
    const cur = weekMap.get(e.foodName);
    if (cur) {
      cur.calories += e.calories;
      cur.proteinG += e.proteinG;
      cur.fatG += e.fatG;
      cur.carbsG += e.carbsG;
      cur.weightG += e.weightG;
      cur.count += 1;
    } else {
      weekMap.set(e.foodName, {
        name: e.foodName,
        calories: e.calories,
        proteinG: e.proteinG,
        fatG: e.fatG,
        carbsG: e.carbsG,
        weightG: e.weightG,
        count: 1,
      });
    }
  }

  const result: FoodByWeek[] = [];
  for (const [weekStart, weekMap] of acc.entries()) {
    const foods = Array.from(weekMap.values()).map((f) => ({
      ...f,
      calories: parseFloat(f.calories.toFixed(0)),
      proteinG: parseFloat(f.proteinG.toFixed(1)),
      fatG: parseFloat(f.fatG.toFixed(1)),
      carbsG: parseFloat(f.carbsG.toFixed(1)),
      weightG: parseFloat(f.weightG.toFixed(0)),
    }));
    result.push({ weekStart, foods });
  }

  result.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  return result;
}
