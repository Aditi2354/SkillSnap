// src/app/(dashboard)/dashboard/roadmap/actions.ts
"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getPlanJSON } from "@/lib/resources";

const planSchema = z.object({
  currentSkills: z.string().min(3),
  targetRole: z.string().min(2),
  weeks: z.coerce.number().min(2).max(52).default(12),
  interests: z.array(z.string()).optional(),
});

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  // Prefer id if auth callback sets it
  let userId = (session.user as any).id as string | undefined;

  // Fallback: resolve by email
  if (!userId && session.user.email) {
    const u = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = u?.id;
  }

  if (!userId) throw new Error("User not found");
  return { userId, session };
}

export async function createRoadmapAction(raw: unknown) {
  const { userId } = await requireUserId();
  const input = planSchema.parse(raw);

  const plan = await getPlanJSON({
    currentSkills: input.currentSkills,
    targetRole: input.targetRole,
    weeks: input.weeks,
    interests: input.interests ?? [],
  });

  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      title: plan.title,
      targetRole: input.targetRole,
      durationWks: plan.durationWks,
      modules: {
        create: plan.modules.map((m: any) => ({
          title: m.title,
          weekIndex: m.weekIndex,
          description: m.description,
          checkpoint: m.checkpoint ?? null,
          resources: {
            create: (m.resources ?? []).map((r: any) => ({
              kind: r.kind,
              title: r.title,
              url: r.url,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/dashboard/roadmap");
  return roadmap.id as string;
}

export async function toggleProgress(moduleId: string, done: boolean) {
  if (!moduleId) throw new Error("moduleId required");

  const { userId } = await requireUserId();

  await prisma.progress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: { done },
    create: { userId, moduleId, done },
  });

  revalidatePath("/dashboard/roadmap");
}

// ✅ NEW: clear all roadmaps for the current user (with children first)
export async function clearRoadmapsAction() {
  const { userId } = await requireUserId();

  await prisma.$transaction([
    prisma.progress.deleteMany({
      where: { module: { roadmap: { userId } } },
    }),
    prisma.resource.deleteMany({
      where: { module: { roadmap: { userId } } },
    }),
    prisma.module.deleteMany({
      where: { roadmap: { userId } },
    }),
    prisma.roadmap.deleteMany({
      where: { userId },
    }),
  ]);

  revalidatePath("/dashboard/roadmap");
}
