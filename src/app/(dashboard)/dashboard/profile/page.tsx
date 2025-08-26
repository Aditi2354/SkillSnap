// src/app/(dashboard)/dashboard/profile/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  // Must have an email with JWT sessions
  if (!session?.user?.email) redirect("/signin");

  const email = session.user.email;

  // Ensure a User row exists (create on first login)
  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
    select: { id: true, name: true, email: true, image: true },
  });

  // Ensure a Profile row exists for this user
  const profile = await db.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    include: { skills: true },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Profile</h2>

      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-4">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt="avatar"
              className="h-12 w-12 rounded-full border"
            />
          ) : null}
          <div>
            <p className="font-medium">{session.user.name ?? user.email}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Current role</div>
            <div className="mt-1">{profile.currentRole ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Target role</div>
            <div className="mt-1">{profile.targetRole ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Level</div>
            <div className="mt-1">{profile.level ?? "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Skills</div>
            <div className="mt-1">
              {profile.skills.length
                ? profile.skills.map(s => s.name).join(", ")
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
