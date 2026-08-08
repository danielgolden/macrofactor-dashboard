export type Zone = "low" | "medium" | "high";
export type Category = "protein" | "carb" | "fat" | "mixed";

export interface Food {
  name: string;
  calDensity: number;
  timesEaten: number;
  totalWeight: number;
  totalCalories: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbPer100g: number;
  proteinPct: number;
  fatPct: number;
  carbPct: number;
  category: Category;
  zone: Zone;
  avgPortion: number;
  impactScore: number;
}

export const ZONE_META: Record<Zone, { fill: string; light: string; label: string; range: string }> = {
  low:    { fill: "#4a7c2a", light: "#e8f1e4", label: "Low",    range: "< 1.5 kcal/g" },
  medium: { fill: "#a8702c", light: "#f5ebd6", label: "Medium", range: "1.5–4 kcal/g"  },
  high:   { fill: "#a83c2a", light: "#f0d4cc", label: "High",   range: "> 4 kcal/g"    },
};

export const CAT_META: Record<Category, { label: string; color: string }> = {
  protein: { label: "Protein", color: "#3a7c3a" },
  carb:    { label: "Carbs",   color: "#a83c2a" },
  fat:     { label: "Fat",     color: "#2a5a8a" },
  mixed:   { label: "Mixed",   color: "#7a5a3a" },
};
