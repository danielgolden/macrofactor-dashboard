import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase";

/**
 * DELETE /api/data
 *
 * Clears ALL stored data for the authenticated user — both the aggregated
 * `foods` table and the raw `food_log_entries` history.
 *
 * This is the explicit, opt-in equivalent of the old destructive import
 * behavior. Now that imports merge instead of replace, users need a way to
 * wipe their data on demand (fresh start, privacy, correcting bad imports).
 */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // Delete aggregated foods first, then raw entries. Order doesn't strictly
  // matter (no FK between them), but clearing derived data before source data
  // keeps things tidy if a partial failure occurs.
  const { error: foodsErr } = await supabase
    .from("foods")
    .delete()
    .eq("user_id", userId);
  if (foodsErr) {
    return NextResponse.json({ error: foodsErr.message }, { status: 500 });
  }

  const { error: entriesErr } = await supabase
    .from("food_log_entries")
    .delete()
    .eq("user_id", userId);
  if (entriesErr) {
    return NextResponse.json({ error: entriesErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cleared: true });
}
