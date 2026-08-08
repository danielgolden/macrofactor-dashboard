import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { type LogEntry } from "@/lib/aggregateEntries";
import { bucketByWeek, foodByWeek } from "@/lib/aggregateByWeek";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("food_log_entries")
    .select("date, food_name, weight_g, calories, fat_g, carbs_g, protein_g")
    .eq("user_id", userId)
    .order("date", { ascending: true });

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

  const weeks = bucketByWeek(entries);
  const foodWeeks = foodByWeek(entries);

  return NextResponse.json({ weeks, foodWeeks });
}
