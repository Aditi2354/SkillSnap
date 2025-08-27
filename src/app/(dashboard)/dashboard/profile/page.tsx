// src/app/(dashboard)/dashboard/profile/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  // thanks to callbacks, id will always be present
  const userId = (session.user as any).id as string;

  const profile = await db.profile.findUnique({
    where: { userId },
    include: { skills: true },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <pre className="rounded-lg border p-4 bg-card">
        {JSON.stringify({ sessionUser: session.user, profile }, null, 2)}
      </pre>
    </div>
  );
}

