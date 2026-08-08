import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("food_log_entries")
    .select("date")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: maxData, error: maxError } = await supabase
    .from("food_log_entries")
    .select("date")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(1);

  if (maxError) return NextResponse.json({ error: maxError.message }, { status: 500 });

  const min = data?.[0]?.date ?? null;
  const max = maxData?.[0]?.date ?? null;

  return NextResponse.json({ min, max });
}
