import { z } from "zod";

export const socialIntelligenceCreateSchema = z.object({
  publicOnly: z.boolean().default(true),
  confidence: z.coerce.number().int().min(0).max(100).optional(),
  rawNotes: z.string().optional(),
  sourceUrls: z.array(z.string().url()).default([]),
});
