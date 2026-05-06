import * as XLSX from "xlsx";
import type { Food, Zone, Category } from "./types";

interface RawRow {
  "Food Name"?: string;
  "Serving Qty"?: number | string;
  "Serving Weight (g)"?: number | string;
  "Calories"?: number | string;
  "Protein (g)"?: number | string;
  "Fat (g)"?: number | string;
  "Carbohydrates (g)"?: number | string;
  [key: string]: unknown;
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

export function transformFoodLog(buffer: Buffer): Food[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames.includes("Food Log")
    ? "Food Log"
    : workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const rawRows: RawRow[] = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });

  // Normalize headers by trimming
  const rows: RawRow[] = rawRows.map((row) => {
    const normalized: RawRow = {};
    for (const key of Object.keys(row)) {
      (normalized as Record<string, unknown>)[key.trim()] = row[key];
    }
    return normalized;
  });

  // Accumulate per food name
  const accumulator = new Map<string, {
    totalWeight: number;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarb: number;
    count: number;
  }>();

  for (const row of rows) {
    const name = String(row["Food Name"] ?? "").trim();
    if (!name) continue;

    const qty = Number(row["Serving Qty"]);
    const weight = Number(row["Serving Weight (g)"]);
    const portionWeight = qty * weight;

    if (!portionWeight || portionWeight <= 0) continue;

    const calories = Number(row["Calories"]) || 0;
    const protein = Number(row["Protein (g)"]) || 0;
    const fat = Number(row["Fat (g)"]) || 0;
    const carb = Number(row["Carbohydrates (g)"]) || 0;

    const existing = accumulator.get(name);
    if (existing) {
      existing.totalWeight += portionWeight;
      existing.totalCalories += calories;
      existing.totalProtein += protein;
      existing.totalFat += fat;
      existing.totalCarb += carb;
      existing.count += 1;
    } else {
      accumulator.set(name, {
        totalWeight: portionWeight,
        totalCalories: calories,
        totalProtein: protein,
        totalFat: fat,
        totalCarb: carb,
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
