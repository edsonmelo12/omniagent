import { z } from "zod";

export const productEventSchema = z.object({
  eventName: z.string().trim().min(2).max(80),
  clientId: z.string().trim().min(1).optional(),
  source: z.string().trim().min(2).max(80).optional(),
  properties: z.record(z.unknown()).default({}),
});

export const productEventMetricsQuerySchema = z.object({
  clientId: z.string().trim().min(1).optional(),
  days: z.coerce.number().int().min(1).max(365).default(7),
});
