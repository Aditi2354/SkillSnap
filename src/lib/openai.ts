// src/lib/openai.ts
import OpenAI from "openai";

/**
 * Provider switch:
 * - openrouter (free models): set AI_PROVIDER=openrouter and OPENROUTER_API_KEY in .env
 * - openai (paid):            set AI_PROVIDER=openai and OPENAI_API_KEY in .env
 */
const provider = process.env.AI_PROVIDER ?? "openrouter";

function invariant(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

let client: OpenAI;

if (provider === "openrouter") {
  invariant(process.env.OPENROUTER_API_KEY, "OPENROUTER_API_KEY missing");
  client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      // helpful (optional) for OpenRouter analytics
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": "SkillSnap",
    },
  });
} else if (provider === "openai") {
  invariant(process.env.OPENAI_API_KEY, "OPENAI_API_KEY missing");
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}

export const openai = client;

/** Pick a sensible default model for each provider */
export function defaultModel() {
  if (provider === "openrouter") return "openai/gpt-oss-20b"; // free model on OpenRouter
  return "gpt-4o-mini"; // OpenAI (paid)
}
