import { z } from "zod";
export const monitoringReportCreateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    periodStart: z.string().date().optional(),
    periodEnd: z.string().date().optional(),
});
export const monitoringReportUpdateSchema = z.object({
    status: z.enum(["draft", "review", "approved"]).default("draft"),
    periodStart: z.string().date().optional(),
    periodEnd: z.string().date().optional(),
    note: z.string().optional(),
});
