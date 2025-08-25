// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// If you already have a helper at "@/lib/openai", you can use that instead.
// For a minimal inline client:
import OpenAI from "openai";

const client = new OpenAI({
  // Works for OpenAI (OPENAI_API_KEY) or OpenRouter (OPENROUTER_API_KEY)
  apiKey: process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY,
  baseURL:
    process.env.AI_PROVIDER === "openrouter"
      ? "https://openrouter.ai/api/v1"
      : undefined,
});

export async function POST(req: Request) {
  // ✅ Auth check using the ONE TRUE config from src/lib/auth.ts
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Expect the same shape your ChatBox.tsx sends: { messages: [...] }
  const { messages } = await req.json();

  // Call the model (choose model based on provider)
  const model =
    process.env.AI_PROVIDER === "openrouter"
      ? "openai/gpt-oss-20b" // free model on OpenRouter (as you set)
      : "gpt-4o-mini";       // or whichever OpenAI model you use

  const res = await client.chat.completions.create({
    model,
    messages,
  });

  const text = res.choices?.[0]?.message?.content ?? "No reply.";
  // Your ChatBox expects text/plain streaming or plain text — we’ll return plain text
  return new NextResponse(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
