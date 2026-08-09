import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const VALID_THEMES = ["light", "dark", "system"] as const;
type Theme = (typeof VALID_THEMES)[number];

function isTheme(value: string): value is Theme {
  return (VALID_THEMES as readonly string[]).includes(value);
}

// GET /api/preferences → { theme: "light" | "dark" | "system" }
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("theme")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("GET /api/preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }

  return NextResponse.json({ theme: data?.theme ?? "system" });
}

// PUT /api/preferences { theme: "light" | "dark" | "system" }
export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const theme = body?.theme;

  if (typeof theme !== "string" || !isTheme(theme)) {
    return NextResponse.json(
      { error: "Invalid theme. Must be 'light', 'dark', or 'system'." },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: userId, theme, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("PUT /api/preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }

  return NextResponse.json({ theme });
}
