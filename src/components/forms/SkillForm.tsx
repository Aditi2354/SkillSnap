"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoadmapAction } from "@/app/(dashboard)/dashboard/roadmap/actions";

const Schema = z.object({
  currentSkills: z.string().min(3, "Please add a few skills (min 3 chars)."),
  targetRole: z.string().min(2, "Target role is required."),
  weeks: z.coerce.number().min(2).max(52).default(12),
});

type FormData = z.infer<typeof Schema>;

export default function SkillForm() {
  const [pending, start] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { weeks: 12 },
  });

  function onSubmit(data: FormData) {
    start(async () => {
      const id = await createRoadmapAction(data);
      reset();
      alert("Roadmap created: " + id);
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-semibold">Create a Roadmap</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us your current skills and target role — we’ll generate a weekly plan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Current skills */}
        <div>
          <label
            htmlFor="currentSkills"
            className="mb-1 block text-sm font-medium"
          >
            Current skills
          </label>
          <textarea
            id="currentSkills"
            rows={4}
            placeholder="e.g. JavaScript, HTML, CSS"
            className={`w-full rounded-xl border px-3 py-2 shadow-sm focus:ring-2 focus:ring-violet-500 ${
              errors.currentSkills ? "border-red-500" : ""
            }`}
            {...register("currentSkills")}
          />
          {errors.currentSkills && (
            <p className="mt-1 text-xs text-red-600">
              {errors.currentSkills.message}
            </p>
          )}
        </div>

        {/* Target role */}
        <div>
          <label htmlFor="targetRole" className="mb-1 block text-sm font-medium">
            Target role
          </label>
          <input
            id="targetRole"
            placeholder="e.g. MERN Developer"
            className={`w-full rounded-xl border px-3 py-2 shadow-sm focus:ring-2 focus:ring-violet-500 ${
              errors.targetRole ? "border-red-500" : ""
            }`}
            {...register("targetRole")}
          />
          {errors.targetRole && (
            <p className="mt-1 text-xs text-red-600">
              {errors.targetRole.message}
            </p>
          )}
        </div>
      </div>

      {/* Weeks */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="weeks" className="text-sm font-medium">
          Duration (weeks)
        </label>
        <input
          id="weeks"
          type="number"
          min={2}
          max={52}
          className="w-24 rounded-xl border px-3 py-2 shadow-sm focus:ring-2 focus:ring-violet-500"
          {...register("weeks", { valueAsNumber: true })}
        />
        <span className="text-xs text-muted-foreground">
          2–52 weeks recommended
        </span>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 font-medium text-white shadow-md transition hover:bg-violet-700 disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Generating…
          </>
        ) : (
          <>🚀 Generate Roadmap</>
        )}
      </button>
    </form>
  );
}
