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

export const ZONE_META: Record<Zone, { fill: string; light: string; textFill: string; label: string; range: string }> = {
  low:    { fill: "#8ecae6", light: "#e6f4fa", textFill: "#126782", label: "Low",    range: "< 1.5 kcal/g" },
  medium: { fill: "#ffb703", light: "#fff5e0", textFill: "#fd9e02", label: "Medium", range: "1.5–4 kcal/g"  },
  high:   { fill: "#fb8500", light: "#fde8d6", textFill: "#fb8500", label: "High",   range: "> 4 kcal/g"    },
};

export const CAT_META: Record<Category, { label: string; color: string }> = {
  protein: { label: "Protein", color: "#8ecae6" },
  carb:    { label: "Carbs",   color: "#023047" },
  fat:     { label: "Fat",     color: "#fb8500" },
  mixed:   { label: "Mixed",   color: "#ffb703" },
};
