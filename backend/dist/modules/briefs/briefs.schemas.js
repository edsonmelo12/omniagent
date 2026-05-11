import { z } from "zod";
export const briefCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    note: z.string().optional(),
});
export const briefUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    note: z.string().optional(),
    summaryOverride: z.string().optional(),
});
