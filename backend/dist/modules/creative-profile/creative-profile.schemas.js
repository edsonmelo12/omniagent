import { z } from "zod";
export const creativeProfileCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    note: z.string().optional(),
});
export const creativeProfileUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    note: z.string().optional(),
    summaryOverride: z.string().optional(),
});
