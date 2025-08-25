"use client";
import { useTransition } from "react";
import { toggleProgress } from "@/app/(dashboard)/dashboard/roadmap/actions";

export default function ModuleItem({ module }: { module: any }) {
  const [pending, start] = useTransition();
  const onToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const done = e.target.checked;
    start(async () => { await toggleProgress(module.id, done); });
  };
  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Week {module.weekIndex}</div>
          <div className="font-medium">{module.title}</div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" onChange={onToggle} disabled={pending} />
          Done
        </label>
      </div>
      <p className="mt-2 text-sm">{module.description}</p>
      {!!module.resources?.length && (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {module.resources.map((r:any)=>(
            <li key={r.id}><a className="underline" href={r.url} target="_blank">{r.title}</a> <span className="text-xs uppercase text-muted-foreground">({r.kind})</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}