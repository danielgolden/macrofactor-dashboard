import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { Food } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const foods: Food[] = body.foods;

  if (!Array.isArray(foods) || foods.length === 0) {
    return NextResponse.json({ error: "No foods provided" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Delete existing foods for this user and replace (full re-import)
  await supabase.from("foods").delete().eq("user_id", userId);

  const rows = foods.map((f) => ({
    user_id: userId,
    name: f.name,
    cal_density: f.calDensity,
    times_eaten: f.timesEaten,
    total_weight: f.totalWeight,
    total_calories: f.totalCalories,
    protein_per_100g: f.proteinPer100g,
    fat_per_100g: f.fatPer100g,
    carb_per_100g: f.carbPer100g,
    protein_pct: f.proteinPct,
    fat_pct: f.fatPct,
    carb_pct: f.carbPct,
    category: f.category,
    zone: f.zone,
    avg_portion: f.avgPortion,
    impact_score: f.impactScore,
  }));

  const { error } = await supabase.from("foods").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ imported: rows.length });
}
