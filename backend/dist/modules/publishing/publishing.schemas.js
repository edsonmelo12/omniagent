import { z } from "zod";
export const publishingExecutionCreateSchema = z.object({
    mode: z.enum(["dry_run", "live"]).default("dry_run"),
    confirm: z.boolean().default(false),
    platforms: z.array(z.string().min(1)).default([]),
    notes: z.string().optional(),
});
