import type { DailyEntry, FoodEntry, FoodDensityEntry, GoalStatus, WeeklyAggregate } from '../types';

export function getGoalStatus(day: DailyEntry): GoalStatus {
  const caloriesMet = day.targetCalories > 0 && day.calories <= day.targetCalories;
  const proteinMet = day.targetProtein > 0 && day.protein >= day.targetProtein;
  return {
    date: day.date,
    caloriesMet,
    proteinMet,
    bothMet: caloriesMet && proteinMet,
  };
}

export function getStreak(days: DailyEntry[]): number {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const day of sorted) {
    const status = getGoalStatus(day);
    if (status.bothMet) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getMostRecentDay(days: DailyEntry[]): DailyEntry | null {
  if (days.length === 0) return null;
  return days.reduce((latest, d) => (d.date > latest.date ? d : latest));
}

/** Group days into ISO weeks (Mon–Sun), return last N weeks */
export function aggregateByWeek(days: DailyEntry[], count = 8): WeeklyAggregate[] {
  const groups: Record<string, DailyEntry[]> = {};
  for (const day of days) {
    const d = new Date(day.date + 'T00:00:00');
    // Get Monday of week
    const dow = (d.getDay() + 6) % 7; // 0=Mon
    const monday = new Date(d);
    monday.setDate(d.getDate() - dow);
    const key = monday.toISOString().slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(day);
  }

  const keys = Object.keys(groups).sort().slice(-count);
  return keys.map((key) => {
    const entries = groups[key];
    const avg = (fn: (d: DailyEntry) => number) =>
      entries.reduce((s, d) => s + fn(d), 0) / entries.length;
    const date = new Date(key + 'T00:00:00');
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      weekLabel: label,
      avgCalories: Math.round(avg((d) => d.calories)),
      avgTargetCalories: Math.round(avg((d) => d.targetCalories)),
      avgProtein: Math.round(avg((d) => d.protein)),
      avgTargetProtein: Math.round(avg((d) => d.targetProtein)),
      avgFat: Math.round(avg((d) => d.fat)),
      avgTargetFat: Math.round(avg((d) => d.targetFat)),
      avgCarbs: Math.round(avg((d) => d.carbs)),
      avgTargetCarbs: Math.round(avg((d) => d.targetCarbs)),
    };
  });
}

/** Group days into calendar months, return last N months */
export function aggregateByMonth(days: DailyEntry[], count = 6): WeeklyAggregate[] {
  const groups: Record<string, DailyEntry[]> = {};
  for (const day of days) {
    const key = day.date.slice(0, 7); // YYYY-MM
    if (!groups[key]) groups[key] = [];
    groups[key].push(day);
  }

  const keys = Object.keys(groups).sort().slice(-count);
  return keys.map((key) => {
    const entries = groups[key];
    const avg = (fn: (d: DailyEntry) => number) =>
      entries.reduce((s, d) => s + fn(d), 0) / entries.length;
    const date = new Date(key + '-01T00:00:00');
    const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return {
      weekLabel: label,
      avgCalories: Math.round(avg((d) => d.calories)),
      avgTargetCalories: Math.round(avg((d) => d.targetCalories)),
      avgProtein: Math.round(avg((d) => d.protein)),
      avgTargetProtein: Math.round(avg((d) => d.targetProtein)),
      avgFat: Math.round(avg((d) => d.fat)),
      avgTargetFat: Math.round(avg((d) => d.targetFat)),
      avgCarbs: Math.round(avg((d) => d.carbs)),
      avgTargetCarbs: Math.round(avg((d) => d.targetCarbs)),
    };
  });
}

export function getFoodDensity(foodLog: FoodEntry[]): FoodDensityEntry[] {
  const map: Record<string, { count: number; totalCal: number; totalWeight: number }> = {};
  for (const entry of foodLog) {
    const key = entry.foodName.trim();
    if (!key) continue;
    if (!map[key]) map[key] = { count: 0, totalCal: 0, totalWeight: 0 };
    map[key].count++;
    map[key].totalCal += entry.calories;
    map[key].totalWeight += entry.servingWeight;
  }
  return Object.entries(map)
    .map(([foodName, { count, totalCal, totalWeight }]) => ({
      foodName,
      timesLogged: count,
      totalCalories: Math.round(totalCal),
      totalWeight: Math.round(totalWeight),
      avgCaloriesPerServing: count > 0 ? Math.round(totalCal / count) : 0,
      caloricDensity: totalWeight > 0 ? Math.round((totalCal / totalWeight) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.timesLogged - a.timesLogged);
}

export function getCalendarDays(
  days: DailyEntry[],
  year: number,
  month: number // 0-indexed
): { date: string; status: 'both' | 'one' | 'none' | 'empty' }[] {
  const statusMap: Record<string, GoalStatus> = {};
  for (const d of days) {
    statusMap[d.date] = getGoalStatus(d);
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const cells: { date: string; status: 'both' | 'one' | 'none' | 'empty' }[] = [];

  // Pad start
  for (let i = 0; i < startDow; i++) cells.push({ date: '', status: 'empty' });

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const gs = statusMap[dateStr];
    if (!gs) {
      cells.push({ date: dateStr, status: 'none' });
    } else if (gs.bothMet) {
      cells.push({ date: dateStr, status: 'both' });
    } else if (gs.caloriesMet || gs.proteinMet) {
      cells.push({ date: dateStr, status: 'one' });
    } else {
      cells.push({ date: dateStr, status: 'none' });
    }
  }
  return cells;
}
