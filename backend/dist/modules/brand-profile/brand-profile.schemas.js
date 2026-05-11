import { z } from "zod";
export const brandProfileCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    note: z.string().optional(),
});
export const brandProfileUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    note: z.string().optional(),
    summaryOverride: z.string().optional(),
});
