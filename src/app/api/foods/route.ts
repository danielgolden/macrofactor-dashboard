import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .eq("user_id", userId)
    .order("cal_density", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map snake_case DB cols → camelCase for the frontend
  const foods = (data ?? []).map((r) => ({
    name: r.name,
    calDensity: Number(r.cal_density),
    timesEaten: r.times_eaten,
    totalWeight: Number(r.total_weight),
    totalCalories: r.total_calories,
    proteinPer100g: Number(r.protein_per_100g),
    fatPer100g: Number(r.fat_per_100g),
    carbPer100g: Number(r.carb_per_100g),
    proteinPct: Number(r.protein_pct),
    fatPct: Number(r.fat_pct),
    carbPct: Number(r.carb_pct),
    category: r.category,
    zone: r.zone,
    avgPortion: Number(r.avg_portion),
    impactScore: Number(r.impact_score),
  }));

  return NextResponse.json({ foods });
}
