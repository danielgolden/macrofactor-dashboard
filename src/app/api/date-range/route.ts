import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();

  const [minResult, maxResult] = await Promise.all([
    supabase
      .from("food_log_entries")
      .select("date")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .limit(1),
    supabase
      .from("food_log_entries")
      .select("date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1),
  ]);

  if (minResult.error) return NextResponse.json({ error: minResult.error.message }, { status: 500 });
  if (maxResult.error) return NextResponse.json({ error: maxResult.error.message }, { status: 500 });

  const min = minResult.data?.[0]?.date ?? null;
  const max = maxResult.data?.[0]?.date ?? null;

  return NextResponse.json({ min, max });
}
