import { z } from "zod";
export const RoadmapInput = z.object({
  currentSkills: z.string().min(3),
  targetRole: z.string().min(2),
  weeks: z.coerce.number().min(2).max(52)
});