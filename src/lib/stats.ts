import type { Food } from "@/lib/types";

/**
 * Share of total calories that come from high-density foods
 * (calorie density strictly greater than 4 kcal/g).
 *
 * Implemented by zone instead of recomputing `calDensity > 4` so this
 * stays in lockstep with `ZONE_META.high.range` and the legend used
 * everywhere else in the app.
 *
 * Returns the percentage (0–100), not the fraction, so callers don't
 * have to remember to multiply by 100. Returns 0 when there are no
 * foods or total calories are 0 — never NaN.
 */
export function highDensityCaloriesShare(foods: Food[]): number {
  if (foods.length === 0) return 0;
  let totalCal = 0;
  let highCal = 0;
  for (const f of foods) {
    totalCal += f.totalCalories;
    if (f.zone === "high") highCal += f.totalCalories;
  }
  if (totalCal <= 0) return 0;
  return (highCal / totalCal) * 100;
}

/**
 * Sum of calories from high-density foods. Useful for the card footer
 * ("12,480 of 20,000 kcal · > 4 kcal/g").
 */
export function highDensityCalories(foods: Food[]): number {
  return foods.reduce((s, f) => (f.zone === "high" ? s + f.totalCalories : s), 0);
}
