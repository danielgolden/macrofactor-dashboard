import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get("startDate")?.trim() ?? "";
  const endDate = searchParams.get("endDate")?.trim() ?? "";

  const supabase = createServerClient();

  let query = supabase
    .from("food_log_entries")
    .select("date, calories, protein_g, fat_g, carbs_g")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (startDate) query = query.gte("date", startDate);
  if (endDate)   query = query.lte("date", endDate);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate per day
  const dayMap = new Map<string, { calories: number; protein: number; fat: number; carbs: number }>();

  for (const row of data ?? []) {
    const existing = dayMap.get(row.date);
    if (existing) {
      existing.calories += Number(row.calories);
      existing.protein  += Number(row.protein_g);
      existing.fat      += Number(row.fat_g);
      existing.carbs    += Number(row.carbs_g);
    } else {
      dayMap.set(row.date, {
        calories: Number(row.calories),
        protein:  Number(row.protein_g),
        fat:      Number(row.fat_g),
        carbs:    Number(row.carbs_g),
      });
    }
  }

  const days = Array.from(dayMap.entries()).map(([date, vals]) => ({ date, ...vals }));

  return NextResponse.json({ days });
}
