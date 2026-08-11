import { describe, it, expect } from "vitest";
import { highDensityCaloriesShare, highDensityCalories } from "@/lib/stats";
import type { Food } from "@/lib/types";

function mkFood(overrides: Partial<Food> & { calories: number; zone?: Food["zone"] }): Food {
  return {
    name: overrides.name ?? "x",
    calDensity: overrides.calDensity ?? 0,
    timesEaten: 1,
    totalWeight: 0,
    totalCalories: overrides.calories,
    proteinPer100g: 0,
    fatPer100g: 0,
    carbPer100g: 0,
    proteinPct: 0,
    fatPct: 0,
    carbPct: 0,
    category: "mixed",
    zone: overrides.zone ?? "medium",
    avgPortion: 0,
    impactScore: 0,
    ...overrides,
  };
}

describe("highDensityCaloriesShare", () => {
  it("returns 100 when every food is high density", () => {
    const foods = [
      mkFood({ calories: 100, zone: "high" }),
      mkFood({ calories: 200, zone: "high" }),
    ];
    expect(highDensityCaloriesShare(foods)).toBe(100);
  });

  it("returns 0 when no food is high density", () => {
    const foods = [
      mkFood({ calories: 100, zone: "low" }),
      mkFood({ calories: 200, zone: "medium" }),
    ];
    expect(highDensityCaloriesShare(foods)).toBe(0);
  });

  it("computes the share for a mixed set, not the count", () => {
    const foods = [
      mkFood({ calories: 100, zone: "high" }),
      mkFood({ calories: 100, zone: "low" }),
      mkFood({ calories: 100, zone: "medium" }),
    ];
    expect(highDensityCaloriesShare(foods)).toBeCloseTo(33.333, 2);
  });

  it("returns 0 for an empty array (never NaN)", () => {
    expect(highDensityCaloriesShare([])).toBe(0);
  });

  it("returns 0 when every food has zero total calories", () => {
    const foods = [mkFood({ calories: 0, zone: "high" })];
    expect(highDensityCaloriesShare(foods)).toBe(0);
  });

  it("a food sitting exactly at 4 kcal/g counts as medium, not high", () => {
    // Boundary check on the zone classification upstream. We drive this
    // by zone directly (the helper keys on zone, on purpose), but it's
    // worth pinning the contract: a 4.0 kcal/g food is NOT high.
    // classifyZone in src/lib/aggregateEntries.ts says:
    //   density <= 4 → medium
    //   density  > 4 → high
    // So a food at exactly 4.0 should be tagged "medium", and our helper
    // would correctly exclude it from the share.
    const at4 = mkFood({ calories: 100, zone: "medium", calDensity: 4.0 });
    const at4Plus = mkFood({ calories: 100, zone: "high", calDensity: 4.001 });
    expect(highDensityCaloriesShare([at4])).toBe(0);
    expect(highDensityCaloriesShare([at4Plus])).toBe(100);
  });
});

describe("highDensityCalories", () => {
  it("sums only the high-zone food calories", () => {
    const foods = [
      mkFood({ calories: 100, zone: "high" }),
      mkFood({ calories: 50, zone: "low" }),
      mkFood({ calories: 25, zone: "high" }),
      mkFood({ calories: 10, zone: "medium" }),
    ];
    expect(highDensityCalories(foods)).toBe(125);
  });

  it("returns 0 for an empty array", () => {
    expect(highDensityCalories([])).toBe(0);
  });
});
