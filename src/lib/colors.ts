import type { Zone, Category } from "@/lib/types";

/**
 * Shared 7-color Coolors palette — the "Top foods by calories" donut palette.
 * Single source of truth for all data-viz colors in the app.
 *
 * @see src/components/CalorieShareDonut.tsx
 */
export const PALETTE = [
  "#8ecae6", // light blue
  "#219ebc", // teal
  "#126782", // dark teal
  "#023047", // navy
  "#ffb703", // yellow
  "#fd9e02", // orange
  "#fb8500", // dark orange
] as const;

/** Muted color for "Other" / overflow segments. */
export const OTHER_COLOR = "var(--muted-foreground)";

/**
 * Semantic Badge variant for each zone — green (Medium) / gray (Low) / red (High).
 * Used by ExplorerView, DetailModal, and CompareStrip so zone badges are
 * semantically colored everywhere, independent of the data-viz fill palette.
 */
export const ZONE_BADGE_VARIANT: Record<
  Zone,
  "default" | "secondary" | "destructive" | "success"
> = {
  low: "secondary",
  medium: "success",
  high: "destructive",
};

/**
 * CSS-variable-backed category colors for text/border contexts (badges, chips).
 * These adapt to dark mode via `--cat-*` tokens defined in `globals.css`,
 * ensuring AA contrast on both light and dark backgrounds.
 *
 * For **fill** contexts (treemap cells, radar areas) use `CAT_META[cat].color`
 * (raw hex) instead — fills don't need dark-mode text-contrast adaptation.
 */
export const CAT_BADGE_COLOR: Record<Category, string> = {
  protein: "var(--cat-protein)",
  carb: "var(--cat-carb)",
  fat: "var(--cat-fat)",
  mixed: "var(--cat-mixed)",
};
