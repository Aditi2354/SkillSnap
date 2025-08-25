import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return <div>Please sign in.</div>;
  const profile = await db.profile.findUnique({ where: { userId: session.user.id }, include: { skills: true } });
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <pre className="rounded-xl border p-4 bg-gray-50 overflow-x-auto text-sm">
        {JSON.stringify(profile, null, 2)}
      </pre>
      <p className="text-muted-foreground">Profile edit form is a good next task.</p>
    </div>
  );
}