import { z } from "zod";
export const contentPlanCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    objective: z.string().optional(),
});
export const contentPlanUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    objective: z.string().optional(),
    note: z.string().optional(),
});
export const scheduleCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
});
export const scheduleUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    note: z.string().optional(),
});
