import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createServerClient } from "@/lib/supabase";
import { createChatTools } from "@/lib/chat-tools";
import { checkRateLimit } from "@/lib/rate-limit";

const MODEL = "~deepseek/deepseek-v4-flash-latest";

const MAX_MESSAGES_SENT = 20;
const MAX_USER_MESSAGE_CHARS = 8000;

const SYSTEM_PROMPT = `You are a nutrition assistant helping the user understand their own MacroFactor food-log data that they imported into this app.

You have access to tools that query the signed-in user's data — ALWAYS call a tool before answering questions about their foods, habits, or history. Never invent foods, nutrition values, or dates. If a tool returns no data, say so plainly.

Key concepts in this app's data model:
- **Calorie density** = kcal per gram (kcal/g).
- **Zone** = calorie-density bucket: low (< 1.5 kcal/g), medium (1.5-4), high (> 4).
- **Category** = which macro dominates the food's calories: protein, carb, fat, or mixed.
- **Impact score** = total calories × calorie density — a rough measure of how much a food drives overall energy intake.
- **avg portion** = average grams the user eats per occasion.
- **times eaten** = how many log entries include this food.

When suggesting substitutions or alternatives, consider calorie density and macro profile, and prefer to reference the user's actual data (call listFoods) rather than generic knowledge. Keep answers concise and practical. Use markdown for structure (tables, bold, bullet lists) when it aids readability.`;

const SYSTEM_PROMPT_NO_DATA = `You are a nutrition assistant for the MacroFactor Explorer app. The signed-in user has not imported any food data yet. Let them know they need to import a MacroFactor export (Excel or CSV) before you can answer questions about their foods, but you can still answer general nutrition questions.`;

function getOpenRouterModel() {
  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    name: "openrouter",
    headers: {
      "HTTP-Referer": "https://macrofactor-dashboard.example",
      "X-Title": "MacroFactor Explorer",
    },
  });
  return openrouter.chat(MODEL);
}

async function userHasData(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { count, error } = await supabase
    .from("foods")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .limit(1);
  if (error) return false;
  return (count ?? 0) > 0;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { messages: UIMessage[] };
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const rate = checkRateLimit(userId);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: rate.retryAfterMs
          ? { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) }
          : {},
      }
    );
  }

  const supabase = createServerClient();
  const hasData = await userHasData(supabase, userId);

  const tools = hasData ? createChatTools(supabase, userId) : undefined;
  const system = hasData ? SYSTEM_PROMPT : SYSTEM_PROMPT_NO_DATA;

  // Bound cost: only send the most recent messages, and cap the newest user
  // message length. Full history is still persisted via onFinish below.
  const recent = messages.slice(-MAX_MESSAGES_SENT);
  const truncated: UIMessage[] = recent.map((m, i) => {
    if (m.role !== "user" || i !== recent.length - 1) return m;
    return {
      ...m,
      parts: m.parts.map((p) =>
        p.type === "text" && "text" in p
          ? { ...p, text: p.text.slice(0, MAX_USER_MESSAGE_CHARS) }
          : p
      ),
    };
  });

  const result = streamText({
    model: getOpenRouterModel(),
    system,
    messages: await convertToModelMessages(truncated),
    tools,
    stopWhen: stepCountIs(5),
    onFinish: async ({ text }) => {
      const incomingUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      const userText =
        incomingUserMessage?.parts
          ?.filter((p) => p.type === "text")
          .map((p) => ("text" in p ? p.text : ""))
          .join("") ?? "";

      const rows = [];
      if (userText) {
        rows.push({
          user_id: userId,
          role: "user",
          content: userText,
        });
      }
      if (text) {
        rows.push({
          user_id: userId,
          role: "assistant",
          content: text,
        });
      }
      if (rows.length > 0) {
        await supabase.from("chat_messages").insert(rows);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error) =>
      error == null
        ? "unknown error"
        : typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : JSON.stringify(error),
  });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const hasData = await userHasData(supabase, userId);

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages: UIMessage[] = (data ?? []).map((row) => ({
    id: String(row.id),
    role: row.role as "user" | "assistant",
    parts: [{ type: "text", text: row.content }],
  }));

  return NextResponse.json({ messages, hasData });
}