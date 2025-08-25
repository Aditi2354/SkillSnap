import { db } from "@/lib/db";

export default async function AdminPage() {
  const [users, roadmaps] = await Promise.all([
    db.user.count(),
    db.roadmap.count(),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-xl border p-6">
        <h3 className="font-semibold">Users</h3>
        <div className="text-3xl">{users}</div>
      </div>
      <div className="rounded-xl border p-6">
        <h3 className="font-semibold">Roadmaps</h3>
        <div className="text-3xl">{roadmaps}</div>
      </div>
      <div className="rounded-xl border p-6">
        <h3 className="font-semibold">Coming soon</h3>
        <p className="text-sm text-muted-foreground">Usage charts, feedback heatmap…</p>
      </div>
    </div>
  );
}