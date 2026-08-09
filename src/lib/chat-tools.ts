import { tool } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createChatTools(supabase: SupabaseClient, userId: string) {
  return {
    listFoods: tool({
      description:
        "List the signed-in user's foods from their imported MacroFactor data, with optional filters and sorting. " +
        "Each food is aggregated across all log entries and includes calorie density (kcal/g), times eaten, " +
        "total weight/calories, macros per 100g and as % of calories, a category (protein/carb/fat/mixed), " +
        "a calorie-density zone (low < 1.5 kcal/g, medium 1.5-4, high > 4), average portion size, and an impact score. " +
        "Use category 'fat' to find foods the user mainly eats as fats, 'protein' for protein-dominant foods, etc. " +
        "Use zone 'low' to find the lowest calorie-density foods.",
      inputSchema: z.object({
        category: z
          .enum(["protein", "carb", "fat", "mixed"])
          .optional()
          .describe("Filter by macro-dominance category"),
        zone: z
          .enum(["low", "medium", "high"])
          .optional()
          .describe("Filter by calorie-density zone (low < 1.5 kcal/g, medium 1.5-4, high > 4)"),
        sortBy: z
          .enum([
            "times_eaten",
            "cal_density",
            "impact_score",
            "total_calories",
            "avg_portion",
          ])
          .optional()
          .describe("Sort column; defaults to total_calories descending"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe("Max rows to return; defaults to 50"),
      }),
      execute: async (input) => {
        const sortBy = input.sortBy ?? "total_calories";
        const limit = input.limit ?? 50;

        let query = supabase
          .from("foods")
          .select(
            "name, cal_density, times_eaten, total_weight, total_calories, " +
              "protein_per_100g, fat_per_100g, carb_per_100g, protein_pct, fat_pct, carb_pct, " +
              "category, zone, avg_portion, impact_score"
          )
          .eq("user_id", userId)
          .order(sortBy, { ascending: false })
          .limit(limit);

        if (input.category) query = query.eq("category", input.category);
        if (input.zone) query = query.eq("zone", input.zone);

        const { data, error } = await query;
        if (error) return { error: error.message };

        const rows = (data ?? []) as unknown as Record<string, unknown>[];
        return {
          count: rows.length,
          foods: rows.map((r) => ({
            name: r.name as string,
            category: r.category as string,
            zone: r.zone as string,
            calDensity: Number(r.cal_density),
            timesEaten: r.times_eaten as number,
            avgPortion: Number(r.avg_portion),
            totalCalories: r.total_calories as number,
            totalWeight: Number(r.total_weight),
            proteinPer100g: Number(r.protein_per_100g),
            fatPer100g: Number(r.fat_per_100g),
            carbPer100g: Number(r.carb_per_100g),
            proteinPct: Number(r.protein_pct),
            fatPct: Number(r.fat_pct),
            carbPct: Number(r.carb_pct),
            impactScore: Number(r.impact_score),
          })),
        };
      },
    }),

    getFoodByName: tool({
      description:
        "Look up a single food by exact or near-exact name from the user's aggregated foods table. " +
        "Returns the full nutrition profile. Use this when the user asks about a specific food they eat.",
      inputSchema: z.object({
        name: z.string().describe("Food name to look up (case-insensitive substring match)"),
      }),
      execute: async (input) => {
        const { data, error } = await supabase
          .from("foods")
          .select(
            "name, cal_density, times_eaten, total_weight, total_calories, " +
              "protein_per_100g, fat_per_100g, carb_per_100g, protein_pct, fat_pct, carb_pct, " +
              "category, zone, avg_portion, impact_score"
          )
          .eq("user_id", userId)
          .ilike("name", `%${input.name}%`)
          .limit(1)
          .single();

        if (error) return { error: error.message, found: false };

        const r = data as unknown as Record<string, unknown> | null;
        if (!r) return { found: false };

        return {
          found: true,
          food: {
            name: r.name as string,
            category: r.category as string,
            zone: r.zone as string,
            calDensity: Number(r.cal_density),
            timesEaten: r.times_eaten as number,
            avgPortion: Number(r.avg_portion),
            totalCalories: r.total_calories as number,
            totalWeight: Number(r.total_weight),
            proteinPer100g: Number(r.protein_per_100g),
            fatPer100g: Number(r.fat_per_100g),
            carbPer100g: Number(r.carb_per_100g),
            proteinPct: Number(r.protein_pct),
            fatPct: Number(r.fat_pct),
            carbPct: Number(r.carb_pct),
            impactScore: Number(r.impact_score),
          },
        };
      },
    }),

    getFoodLogEntries: tool({
      description:
        "Query the user's raw daily food log entries (one row per food per day) within an optional date range. " +
        "Use this for date-scoped questions like 'what did I eat last week' or trends over a specific period. " +
        "Each row has date, food name, weight (g), calories, and grams of fat/carbs/protein.",
      inputSchema: z.object({
        startDate: z
          .string()
          .optional()
          .describe("ISO date string YYYY-MM-DD; inclusive lower bound"),
        endDate: z
          .string()
          .optional()
          .describe("ISO date string YYYY-MM-DD; inclusive upper bound"),
        foodName: z
          .string()
          .optional()
          .describe("Case-insensitive substring filter on food name"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe("Max rows to return; defaults to 100"),
      }),
      execute: async (input) => {
        const limit = input.limit ?? 100;

        let query = supabase
          .from("food_log_entries")
          .select(
            "date, food_name, weight_g, calories, fat_g, carbs_g, protein_g"
          )
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(limit);

        if (input.startDate) query = query.gte("date", input.startDate);
        if (input.endDate) query = query.lte("date", input.endDate);
        if (input.foodName) query = query.ilike("food_name", `%${input.foodName}%`);

        const { data, error } = await query;
        if (error) return { error: error.message };

        const rows = (data ?? []) as unknown as Record<string, unknown>[];
        return {
          count: rows.length,
          entries: rows.map((r) => ({
            date: r.date as string,
            foodName: r.food_name as string,
            weightG: Number(r.weight_g),
            calories: Number(r.calories),
            fatG: Number(r.fat_g),
            carbsG: Number(r.carbs_g),
            proteinG: Number(r.protein_g),
          })),
        };
      },
    }),

    getDateRange: tool({
      description:
        "Return the earliest and latest dates the user has food log data for, " +
        "so you can scope date-based queries (e.g. 'last week' = the 7 days before the latest entry). " +
        "Returns null for both if the user has no imported data.",
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await supabase
          .from("food_log_entries")
          .select("date")
          .eq("user_id", userId)
          .order("date", { ascending: true })
          .limit(1);

        if (error) return { error: error.message };

        const { data: latestData, error: latestError } = await supabase
          .from("food_log_entries")
          .select("date")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(1);

        if (latestError) return { error: latestError.message };

        const earliest = (data as Record<string, unknown>[])?.[0]?.date as
          | string
          | null;
        const latest =
          (latestData as Record<string, unknown>[])?.[0]?.date as
            | string
            | null;
        return { earliestDate: earliest, latestDate: latest, hasData: earliest !== null };
      },
    }),
  };
}

export type ChatTools = ReturnType<typeof createChatTools>;