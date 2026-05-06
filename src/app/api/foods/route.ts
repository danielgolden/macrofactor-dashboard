import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { aggregateEntries, type LogEntry } from "@/lib/aggregateEntries";

const PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const startDate = searchParams.get("startDate")?.trim() ?? "";
  const endDate = searchParams.get("endDate")?.trim() ?? "";

  const supabase = createServerClient();

  // Date range mode: aggregate from food_log_entries
  if (startDate && endDate) {
    const { data, error } = await supabase
      .from("food_log_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const entries: LogEntry[] = (data ?? []).map((r) => ({
      date: r.date,
      foodName: r.food_name,
      weightG: Number(r.weight_g),
      calories: Number(r.calories),
      fatG: Number(r.fat_g),
      carbsG: Number(r.carbs_g),
      proteinG: Number(r.protein_g),
    }));

    let foods = aggregateEntries(entries);

    if (search) {
      const lower = search.toLowerCase();
      foods = foods.filter((f) => f.name.toLowerCase().includes(lower));
    }

    return NextResponse.json({ foods, total: foods.length, page: 1, totalPages: 1 });
  }

  // Default mode: query foods table (paginated)
  let query = supabase
    .from("foods")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("cal_density", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`).limit(5000);
  } else {
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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

  const total = count ?? 0;
  const totalPages = search ? 1 : Math.ceil(total / PAGE_SIZE);

  return NextResponse.json({ foods, total, page, totalPages });
}
