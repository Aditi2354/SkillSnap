// src/app/(dashboard)/dashboard/roadmap/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { clearRoadmapsAction } from "./actions"; 
 // ⬅️ NEW

// Optional components (file works even if they don't exist)
let SkillForm: any, RoadmapCard: any;
try {
  SkillForm = (await import("@/components/forms/SkillForm")).default;
} catch {}
try {
  RoadmapCard = (await import("@/components/roadmap/RoadmapCard")).default;
} catch {}

export default async function RoadmapPage() {
  // 1) Auth guard
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  // 2) Resolve the current user's DB id from their email (JWT strategy)
  const email = session.user.email!;
  const user = await prisma.user.upsert({
    where: { email },
    update: {}, // keep as-is
    create: {
      email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
    select: { id: true },
  });

  // 3) Fetch this user's roadmaps
  const roadmaps = await prisma.roadmap.findMany({
    where: { userId: user.id },
    include: { modules: { include: { resources: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header row: title + Clear-all button */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create Roadmap</h1>

        {roadmaps.length > 0 && (
          <form action={clearRoadmapsAction}>
            <button
              className="group relative overflow-hidden rounded-xl border px-4 py-2 text-sm font-medium
                         text-rose-600 hover:text-rose-700 transition hover:-translate-y-0.5
                         shadow-sm hover:shadow-lg bg-background"
              title="Delete all your roadmaps"
            >
              <span className="absolute inset-0 -z-10 opacity-60 blur-2xl
                               bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-pink-500/10" />
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-rose-500/80 align-middle" />
              Clear all
            </button>
          </form>
        )}
      </div>

      {/* Builder */}
      {SkillForm ? (
        <SkillForm />
      ) : (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Create Roadmap</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            (The <code>SkillForm</code> component is missing, but your saved roadmaps
            will still show below.)
          </p>
        </div>
      )}

      {/* List */}
      {roadmaps.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No roadmaps yet — generate one above.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {roadmaps.map((r) =>
            RoadmapCard ? (
              <RoadmapCard key={r.id} roadmap={r} />
            ) : (
              <div
                key={r.id}
                className="group relative overflow-hidden rounded-2xl border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {r.durationWks} weeks
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Target: {r.targetRole}
                </p>
                <p className="mt-3 text-sm">
                  {r.modules.length} modules •{" "}
                  {r.modules.reduce((a, m) => a + m.resources.length, 0)} resources
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
