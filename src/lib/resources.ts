import { openai } from "./openai";

export const curatedResources = [
  { kind: "doc", title: "React Docs", url: "https://react.dev" },
  { kind: "doc", title: "Next.js Docs", url: "https://nextjs.org/docs" },
  { kind: "video", title: "Postgres Tutorial", url: "https://www.youtube.com/results?search_query=postgres+tutorial" }
];

export async function getPlanJSON(params: {
  currentSkills: string; targetRole: string; weeks: number; interests: string[];
}) {
  const prompt = `Design a ${params.weeks}-week roadmap from "${params.currentSkills}" to role "${params.targetRole}".
Return purely JSON:
{
  "durationWks": number,
  "title": string,
  "modules": [
    { "weekIndex": number, "title": string, "description": string, "resources": [
      { "kind": "video|doc|course|repo", "title": string, "url": string }
    ], "checkpoint": string }
  ]
}`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Respond with VALID JSON only." },
      { role: "user", content: prompt }
    ]
  });

  const json = JSON.parse(res.choices[0].message.content || "{}");
  json.title ||= `${params.targetRole} Roadmap`;
  return json;
}