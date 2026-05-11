import { z } from "zod";

export const discoveredProfileSchema = z.object({
  platform: z.string().min(1),
  handle: z.string().min(1),
  profileUrl: z.string().url(),
  discoverySource: z.string().min(1),
  confidence: z.coerce.number().int().min(0).max(100).default(100),
  notes: z.string().optional(),
});

export const discoveryRequestSchema = z.object({
  sourceUrls: z.array(z.string().url()).default([]),
  discoveredProfiles: z.array(discoveredProfileSchema).default([]),
});

export type DiscoveredProfileInput = z.infer<typeof discoveredProfileSchema>;
