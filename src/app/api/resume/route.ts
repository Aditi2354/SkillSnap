import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
export const runtime = "edge";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer()).toString("base64");
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Extract structured resume data. Output JSON with keys: skills[], roles[], projects[{name, stack}]." },
      {
        role: "user",
        content: [
          { type: "input_text", text: "Parse this resume" },
          { type: "input_image", image_url: `data:${file.type};base64,${buf}` }
        ] as any
      }
    ],
  });

  return NextResponse.json(JSON.parse(res.choices[0].message.content || "{}"));
}