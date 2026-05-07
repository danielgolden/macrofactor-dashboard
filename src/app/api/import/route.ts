import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Vercel Pro: hasta 60s
import { createServerClient } from "@/lib/supabase";
import { transformFoodLog } from "@/lib/transformFoodLog";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const { foods, entries, debug } = transformFoodLog(buffer, file.name);

  if (foods.length === 0) {
    console.error("[import] No foods found. Debug:", JSON.stringify(debug, null, 2));
    return NextResponse.json({
      error: "No foods found in file",
      debug,
    }, { status: 400 });
  }

  const supabase = createServerClient();

  // Clear existing data for this user
  await supabase.from("foods").delete().eq("user_id", userId);
  await supabase.from("food_log_entries").delete().eq("user_id", userId);

  // Insert raw entries in batches of 500
  const entryRows = entries.map((e) => ({
    user_id: userId,
    date: e.date,
    food_name: e.foodName,
    weight_g: e.weightG,
    calories: e.calories,
    fat_g: e.fatG,
    carbs_g: e.carbsG,
    protein_g: e.proteinG,
  }));

  for (let i = 0; i < entryRows.length; i += 500) {
    const batch = entryRows.slice(i, i + 500);
    const { error } = await supabase.from("food_log_entries").insert(batch);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert aggregated foods in batches of 500
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

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("foods").insert(rows.slice(i, i + 500));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: foods.length, foods });
}
