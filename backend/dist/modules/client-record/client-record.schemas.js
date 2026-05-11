import { z } from "zod";
export const clientRecordCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    note: z.string().optional(),
});
export const clientRecordUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    note: z.string().optional(),
    summaryOverride: z.string().optional(),
});
