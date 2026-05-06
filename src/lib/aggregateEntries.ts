import type { Food, Zone, Category } from "./types";

export interface LogEntry {
  date: string;
  foodName: string;
  weightG: number;
  calories: number;
  fatG: number;
  carbsG: number;
  proteinG: number;
}

function classifyZone(density: number): Zone {
  if (density < 1.5) return "low";
  if (density <= 4) return "medium";
  return "high";
}

function classifyCategory(p: number, f: number, c: number): Category {
  const total = p * 4 + f * 9 + c * 4;
  if (total === 0) return "mixed";
  const pp = (p * 4) / total;
  const fp = (f * 9) / total;
  const cp = (c * 4) / total;
  if (pp >= 0.4) return "protein";
  if (cp >= 0.5) return "carb";
  if (fp >= 0.5) return "fat";
  return "mixed";
}

export function aggregateEntries(entries: LogEntry[]): Food[] {
  const accumulator = new Map<string, {
    totalWeight: number;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarb: number;
    count: number;
  }>();

  for (const entry of entries) {
    if (!entry.foodName || entry.weightG <= 0) continue;

    const existing = accumulator.get(entry.foodName);
    if (existing) {
      existing.totalWeight += entry.weightG;
      existing.totalCalories += entry.calories;
      existing.totalProtein += entry.proteinG;
      existing.totalFat += entry.fatG;
      existing.totalCarb += entry.carbsG;
      existing.count += 1;
    } else {
      accumulator.set(entry.foodName, {
        totalWeight: entry.weightG,
        totalCalories: entry.calories,
        totalProtein: entry.proteinG,
        totalFat: entry.fatG,
        totalCarb: entry.carbsG,
        count: 1,
      });
    }
  }

  const foods: Food[] = [];

  for (const [name, acc] of accumulator.entries()) {
    const { totalWeight, totalCalories, totalProtein, totalFat, totalCarb, count } = acc;

    const calDensity = parseFloat((totalCalories / totalWeight).toFixed(2));
    const proteinPer100g = parseFloat(((totalProtein / totalWeight) * 100).toFixed(1));
    const fatPer100g = parseFloat(((totalFat / totalWeight) * 100).toFixed(1));
    const carbPer100g = parseFloat(((totalCarb / totalWeight) * 100).toFixed(1));

    const calFromMacros = proteinPer100g * 4 + fatPer100g * 9 + carbPer100g * 4;
    const proteinPct = calFromMacros > 0 ? parseFloat(((proteinPer100g * 4 / calFromMacros) * 100).toFixed(1)) : 0;
    const fatPct = calFromMacros > 0 ? parseFloat(((fatPer100g * 9 / calFromMacros) * 100).toFixed(1)) : 0;
    const carbPct = calFromMacros > 0 ? parseFloat(((carbPer100g * 4 / calFromMacros) * 100).toFixed(1)) : 0;

    const zone = classifyZone(calDensity);
    const category = classifyCategory(proteinPer100g, fatPer100g, carbPer100g);
    const avgPortion = parseFloat((totalWeight / count).toFixed(1));
    const impactScore = parseFloat((totalCalories * calDensity).toFixed(0));

    foods.push({
      name,
      calDensity,
      timesEaten: count,
      totalWeight: parseFloat(totalWeight.toFixed(1)),
      totalCalories: parseFloat(totalCalories.toFixed(1)),
      proteinPer100g,
      fatPer100g,
      carbPer100g,
      proteinPct,
      fatPct,
      carbPct,
      category,
      zone,
      avgPortion,
      impactScore,
    });
  }

  return foods;
}
