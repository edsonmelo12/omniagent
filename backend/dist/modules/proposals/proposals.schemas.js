import { z } from "zod";
export const proposalCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
});
export const proposalUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    thesisOverride: z.string().optional(),
    note: z.string().optional(),
});
