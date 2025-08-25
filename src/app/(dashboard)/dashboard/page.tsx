// src/app/(dashboard)/dashboard/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Map, MessageSquare, ArrowRight } from "lucide-react";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const who = session?.user?.name || session?.user?.email || "Guest";

  const Card = ({
    href,
    title,
    desc,
    icon,
    gradient,
  }: {
    href: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    gradient: string;
  }) => (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border bg-background p-6 shadow-sm transition
                 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* soft gradient halo */}
      <div className={`pointer-events-none absolute inset-0 opacity-60 blur-2xl ${gradient}`} />
      <div className="relative flex items-start gap-4">
        <div className="rounded-2xl border bg-card p-3 text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
        <ArrowRight className="mt-1 text-muted-foreground transition group-hover:translate-x-1" />
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />
    </Link>
  );

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* top bar */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-lg font-medium">Welcome, {who} 👋</p>

        {/* ➕ New roadmap -> open the builder */}
        <Link
          href="/dashboard/roadmap"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-white shadow-sm
                     hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
          <span className="text-xl leading-none">＋</span>
          New roadmap
        </Link>
      </div>

      {/* feature cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card
          href="/dashboard/roadmap"
          title="Your Roadmaps"
          desc="Create or view AI‑generated learning plans."
          icon={<Map size={22} />}
          gradient="bg-gradient-to-tr from-indigo-500/10 via-fuchsia-500/10 to-emerald-500/10"
        />
        <Card
          href="/dashboard/chat"
          title="Mentor Chat"
          desc="Ask career questions in real time."
          icon={<MessageSquare size={22} />}
          gradient="bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-sky-500/10"
        />
      </div>
    </div>
  );
}
