import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import { POST } from "@/app/api/chat/route";

function mockSupabaseNoData() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  };
  chain.limit.mockResolvedValue({ count: 0, error: null });
  return { from: vi.fn(() => chain) } as any;
}

function chatCompletionStream() {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(
        enc.encode(
          `data: ${JSON.stringify({
            id: "chatcmpl-test",
            object: "chat.completion.chunk",
            choices: [{ index: 0, delta: { role: "assistant", content: "Hi" }, finish_reason: null }],
          })}\n\n`
        )
      );
      c.enqueue(
        enc.encode(
          `data: ${JSON.stringify({
            id: "chatcmpl-test",
            object: "chat.completion.chunk",
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          })}\n\n`
        )
      );
      c.enqueue(enc.encode("data: [DONE]\n\n"));
      c.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

function makeRequest(text: string) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ id: "1", role: "user", parts: [{ type: "text", text }] }],
    }),
  });
}

async function readStream(res: Response, maxChunks = 50) {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let body = "";
  for (let i = 0; i < maxChunks; i++) {
    const { done, value } = await reader.read();
    if (done) break;
    body += dec.decode(value, { stream: true });
  }
  return body;
}

describe("chat POST route", () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.OPENROUTER_API_KEY;

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
    vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
    vi.mocked(checkRateLimit).mockReturnValue({ ok: true });
    vi.mocked(createServerClient).mockReturnValue(mockSupabaseNoData());
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = originalApiKey;
    vi.clearAllMocks();
  });

  it("hits the OpenRouter Chat Completions endpoint, not the Responses API", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(chatCompletionStream());

    const res = await POST(makeRequest("hi"));
    // Drain the stream so the model's fetch actually executes.
    await readStream(res);

    const modelCall = fetchSpy.mock.calls.find((c) => {
      const url = typeof c[0] === "string" ? c[0] : (c[0] as Request)?.url ?? "";
      return url.includes("openrouter.ai");
    });

    expect(modelCall).toBeDefined();
    const url =
      typeof modelCall![0] === "string"
        ? (modelCall![0] as string)
        : (modelCall![0] as Request).url;

    expect(url).toContain("/chat/completions");
    expect(url).not.toContain("/responses");
  });

  it("surfaces real server-side stream errors instead of masking them as 'An error occurred.'", async () => {
    const knownError = "Invalid API key. Check OPENROUTER_API_KEY.";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { message: knownError } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    const res = await POST(makeRequest("hi"));
    expect(res.status).toBe(200);

    const body = await readStream(res);

    expect(body).toContain(knownError);
    expect(body).not.toContain("An error occurred");
  });
});
