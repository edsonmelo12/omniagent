import { z } from "zod";
export const clientCreateSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    segment: z.string().optional(),
    websiteUrl: z.string().url().optional(),
    notes: z.string().optional(),
});
export const clientUpdateSchema = z
    .object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    segment: z.string().optional(),
    websiteUrl: z.string().url().optional(),
    notes: z.string().optional(),
})
    .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one client field must be provided",
});
export const clientQuerySchema = z.object({
    search: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
});
