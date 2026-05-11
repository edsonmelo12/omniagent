import { z } from "zod";

export const youtubeStrategyAnalyzeSchema = z.object({
  videoUrls: z
    .array(z.string().trim().url().refine((value) => /youtu(?:\.be|be\.com)/i.test(value), "YouTube URL expected"))
    .min(1)
    .max(10),
  notes: z.string().trim().max(1200).optional(),
  funnelStage: z.enum(["awareness", "consideration", "decision", "retention", "scale"]).optional(),
});
