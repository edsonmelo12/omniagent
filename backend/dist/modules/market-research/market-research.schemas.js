import { z } from "zod";
export const marketResearchCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    publicOnly: z.boolean().default(true),
    confidence: z.coerce.number().int().min(0).max(100).optional(),
    sourceUrls: z.array(z.string().url()).default([]),
    competitorUrls: z.array(z.string().url()).default([]),
    marketContext: z.string().trim().optional(),
    note: z.string().optional(),
});
export const marketResearchUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    publicOnly: z.boolean().default(true),
    confidence: z.coerce.number().int().min(0).max(100).optional(),
    sourceUrls: z.array(z.string().url()).default([]),
    competitorUrls: z.array(z.string().url()).default([]),
    marketContext: z.string().trim().optional(),
    note: z.string().optional(),
    summaryOverride: z.string().optional(),
});
