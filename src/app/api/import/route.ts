import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Vercel Pro: hasta 60s
import { createServerClient } from "@/lib/supabase";
import { transformFoodLog } from "@/lib/transformFoodLog";
import { aggregateEntries, type LogEntry } from "@/lib/aggregateEntries";

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
  const { entries } = transformFoodLog(buffer, file.name);

  if (entries.length === 0) {
    return NextResponse.json({ error: "No foods found in file" }, { status: 400 });
  }

  const supabase = createServerClient();

  // ── Merge semantics (additive, no destructive delete) ──────────────────
  // Previously the route wiped all foods + food_log_entries for the user
  // before inserting the new file. That destroyed prior imports. Instead we
  // now deduplicate via row_hash and only append genuinely new entries.

  // 1. Fetch the set of row_hashes already stored for this user so we can
  //    skip entries that are already present (re-import / overlapping export).
  const { data: existingRows, error: fetchErr } = await supabase
    .from("food_log_entries")
    .select("row_hash")
    .eq("user_id", userId);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const existingHashes = new Set(
    (existingRows ?? [])
      .map((r) => r.row_hash)
      .filter((h): h is string => Boolean(h)),
  );

  // 2. Keep only entries whose hash is not already stored.
  const newEntries = entries.filter((e) => !existingHashes.has(e.rowHash));

  // 3. Insert the deduplicated new entries in batches of 500.
  //    (If the file is a pure re-import, newEntries may be empty — that's fine.)
  if (newEntries.length > 0) {
    const entryRows = newEntries.map((e) => ({
      user_id: userId,
      date: e.date,
      food_name: e.foodName,
      weight_g: e.weightG,
      calories: e.calories,
      fat_g: e.fatG,
      carbs_g: e.carbsG,
      protein_g: e.proteinG,
      row_hash: e.rowHash,
    }));

    for (let i = 0; i < entryRows.length; i += 500) {
      const batch = entryRows.slice(i, i + 500);
      const { error } = await supabase.from("food_log_entries").insert(batch);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // 4. Re-aggregate the `foods` table from the FULL entry set for the user
  //    (existing + newly merged), so the aggregated view reflects all history.
  const { data: allRows, error: allErr } = await supabase
    .from("food_log_entries")
    .select("date, food_name, weight_g, calories, fat_g, carbs_g, protein_g")
    .eq("user_id", userId);

  if (allErr) {
    return NextResponse.json({ error: allErr.message }, { status: 500 });
  }

  const allEntries: LogEntry[] = (allRows ?? []).map((r) => ({
    date: r.date,
    foodName: r.food_name,
    weightG: Number(r.weight_g),
    calories: Number(r.calories),
    fatG: Number(r.fat_g),
    carbsG: Number(r.carbs_g),
    proteinG: Number(r.protein_g),
    rowHash: "", // not needed for aggregation
  }));

  const foods = aggregateEntries(allEntries);

  // 5. Upsert the re-aggregated foods into the `foods` table by (user_id, name).
  //    The unique index foods_user_name_idx makes this an update-or-insert.
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
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase
      .from("foods")
      .upsert(batch, { onConflict: "user_id,name" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 6. Remove any foods rows that no longer have backing entries (e.g. a food
  //    that existed only in a now-superseded aggregation). We upsert the
  //    current set above; stale rows are ones whose (user_id, name) is not in
  //    the freshly aggregated set. Rather than diff, simply delete foods for
  //    this user whose name is not in the aggregated names, then the upsert
  //    above already covers the rest. This is safe — foods is derived data.
  const aggregatedNames = new Set(foods.map((f) => f.name));
  if (aggregatedNames.size > 0) {
    // Fetch current food names for the user to find stale ones.
    const { data: currentFoods } = await supabase
      .from("foods")
      .select("name")
      .eq("user_id", userId);

    const staleNames = (currentFoods ?? [])
      .map((r) => r.name as string)
      .filter((n) => !aggregatedNames.has(n));

    if (staleNames.length > 0) {
      const { error: delErr } = await supabase
        .from("foods")
        .delete()
        .eq("user_id", userId)
        .in("name", staleNames);
      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 });
      }
    }
  }

  // 7. Return the full merged aggregated set so the UI reflects combined state.
  return NextResponse.json({
    imported: newEntries.length,
    deduplicated: entries.length - newEntries.length,
    foods,
  });
}
