import ModuleItem from "./ModuleItem";

type Module = {
  id: string;
  title: string;
  weekIndex: number;
  resources?: Array<{ id?: string }>;
  // if you later include progress in the query, this will render a % nicely
  progresses?: Array<{ done: boolean }>;
};

type Roadmap = {
  id: string;
  title: string;
  durationWks: number;
  targetRole?: string;
  modules: Module[];
};

export default function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  const modules = [...(roadmap.modules || [])].sort(
    (a, b) => a.weekIndex - b.weekIndex
  );

  const totalModules = modules.length;
  const totalResources = modules.reduce(
    (sum, m) => sum + (m.resources?.length || 0),
    0
  );

  // optional progress if you include progresses in your Prisma include
  const doneModules = modules.filter((m) =>
    (m.progresses || []).some((p) => p.done)
  ).length;
  const pct =
    totalModules > 0 ? Math.round((doneModules / totalModules) * 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* soft gradient halo */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 blur-2xl bg-gradient-to-tr from-violet-500/10 via-fuchsia-500/10 to-emerald-500/10" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />

      {/* header */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-lg font-semibold">{roadmap.title}</h4>
          {roadmap.targetRole ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              Target: {roadmap.targetRole}
            </p>
          ) : null}
        </div>

        <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          {roadmap.durationWks} {roadmap.durationWks === 1 ? "week" : "weeks"}
        </span>
      </div>

      {/* quick stats */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>{totalModules} modules</span>
        <span>•</span>
        <span>{totalResources} resources</span>
        {totalModules > 0 ? (
          <>
            <span>•</span>
            <span>{pct}% complete</span>
          </>
        ) : null}
      </div>

      {/* modules list */}
      <div className="space-y-3">
        {modules.map((m, i) => (
          <div
            key={m.id}
            className="rounded-xl border bg-background p-4 transition group-hover:border-violet-200/60 dark:group-hover:border-violet-500/20"
          >
            <ModuleItem module={m} />
          </div>
        ))}
      </div>
    </div>
  );
}
