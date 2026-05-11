import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "validated", "prioritized", "in_campaign", "monitored", "archived"]);

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(180).optional(),
  category: z.string().trim().max(120).optional(),
  offerType: z.string().trim().max(120).optional(),
  priceLabel: z.string().trim().max(60).optional(),
  promise: z.string().trim().min(2).max(280),
  problemSolved: z.string().trim().min(2).max(280),
  audience: z.string().trim().min(2).max(220),
  status: productStatusSchema.default("draft"),
  priority: z.number().int().min(0).max(100).default(0),
  landingUrl: z.string().trim().url().optional(),
  proofPoints: z.array(z.string().trim().min(1).max(180)).max(8).default([]),
  notes: z.string().trim().max(1000).optional(),
});

export const productUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(180).optional(),
    slug: z.string().trim().min(2).max(180).optional(),
    category: z.string().trim().max(120).optional(),
    offerType: z.string().trim().max(120).optional(),
    priceLabel: z.string().trim().max(60).optional(),
    promise: z.string().trim().min(2).max(280).optional(),
    problemSolved: z.string().trim().min(2).max(280).optional(),
    audience: z.string().trim().min(2).max(220).optional(),
    status: productStatusSchema.optional(),
    priority: z.number().int().min(0).max(100).optional(),
    landingUrl: z.string().trim().url().optional(),
    proofPoints: z.array(z.string().trim().min(1).max(180)).max(8).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one product field must be provided",
  });

